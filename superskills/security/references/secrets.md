# Secrets: storage, scanning and leak response

> Distilled from: secrets-management (wshobson/agents, MIT), secret-scanning (github/awesome-copilot, MIT), security-and-hardening (addyosmani/agent-skills, MIT), secret-serialization (getsentry/skills, Apache-2.0).
> Gitleaks and TruffleHog sections: written in our own words from each tool's official docs (see CREDITS.md).

Use this for "where should this API key live?", setting up secret scanning, `.env` handling, responding to a leaked credential, and reviewing code where a credential could end up in logs, traces or error output.

## 1. Where secrets live

| Environment | Store |
|---|---|
| Local dev | `.env` file, gitignored; `.env.example` committed with placeholder values |
| CI | The CI platform's encrypted secrets, scoped to the environment; prefer OIDC federation over stored cloud keys |
| Production | A secrets manager (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, HashiCorp Vault, Doppler, 1Password) or the platform's env settings |
| Kubernetes | External Secrets Operator or sealed secrets; plain `Secret` objects are only base64 |

Rules:

- Code reads secrets from the environment or the manager SDK; never hardcode, never commit.
- Validate required secrets at startup and fail fast with the variable name (not its value).
- One secret per service and environment, least privilege. Dev keys never work against production.
- Front-end bundles are public: anything shipped to the browser (`NEXT_PUBLIC_`, `VITE_`) is not a secret.
- Rotate on a schedule (for example 90 days for static keys) and on every staff departure with access. Short-lived credentials beat rotation.

## 2. Keep them out of git

`.gitignore` baseline:
```
.env
.env.*
!.env.example
*.pem
*.key
```

Add a pre-commit scanner and run the same scanner in CI too, since hooks can be skipped.

### Pick a scanner

| The user's situation | Use | Why |
|---|---|---|
| Already uses or pays for one (GitHub secret scanning, GitGuardian, a company scanner) | That one | Alerts and bypasses stay in one place; ask before adding a second |
| Repo on GitHub, wants pushes of known token types blocked | GitHub push protection (section 3) | Runs on the server, so a skipped local hook does not matter |
| Free pre-commit hook and CI gate, no account | Gitleaks | Fast pattern rules, a baseline for old leaks, redacted reports |
| Needs to know which found keys are live, or to scan images, buckets or a whole org | TruffleHog | Verifies candidates with the provider; ask first, because verification sends the found credential to that provider |
| Python team already on detect-secrets | detect-secrets | Keep it; do not run two hooks that disagree |

Every scanner's report must not become a new leak: redact output and keep reports out of git.

### Gitleaks

- **Install**: `brew install gitleaks`, a release binary, or the Docker image (`zricethezav/gitleaks`, also on ghcr.io). The project is feature complete and now gets security patches only (its author moved to Betterleaks); fine to use, worth knowing.
- **Commands** (always `--redact` so secrets never print):

```bash
gitleaks git --redact -v .                                   # whole git history (git log -p)
gitleaks git --redact --log-opts="--all main..feature" .     # a commit range
gitleaks dir --redact .                                      # files on disk, not history
gitleaks git --redact --report-format sarif --report-path out/gitleaks.sarif .
```

- **Old leaks**: save one full scan as JSON, then report only new findings with `--baseline-path out/gitleaks-baseline.json`. Every secret in the baseline still needs section 4.
- **Exit codes**: `0` nothing found, `1` leaks or an error, `126` unknown flag; `--exit-code` changes the leak code.
- **Config**: `--config`, else `GITLEAKS_CONFIG`, else `GITLEAKS_CONFIG_TOML`, else `.gitleaks.toml` in the target. Start the file with `[extend]` and `useDefault = true` so custom rules (internal token formats) add to the defaults instead of replacing them.
- **False positives**: a `#gitleaks:allow` comment on the line, or the finding's fingerprint in `.gitleaksignore`. Audit suppressions now and then with `--ignore-gitleaks-allow`.
- **Pre-commit hook** (`.pre-commit-config.yaml`, then `pre-commit install`); the hook runs `gitleaks git --pre-commit --redact --staged --verbose`:

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.30.1
    hooks:
      - id: gitleaks
```

  `SKIP=gitleaks git commit` bypasses it, which is why CI must run it too.
- **GitHub Action** (`gitleaks/gitleaks-action`, v3): checkout with `fetch-depth: 0` to scan history. Repos owned by an **organization** need a free `GITLEAKS_LICENSE` key (the user requests it on gitleaks.io with their name and email, then stores it as an Actions secret); personal-account repos do not. Pin the action to a SHA.

### TruffleHog

- **What it adds**: 800+ detectors and **verification**: each candidate is tested against the API it belongs to, giving `verified` (live), `unverified` or `unknown` (the check errored). Scans git, GitHub orgs, Docker images, S3, GCS and filesystems. AGPL-3.0.
- **Install**: `brew install trufflehog` or the `trufflesecurity/trufflehog` image.
- **Commands**:

```bash
trufflehog git file://. --results=verified,unknown --fail          # local repo history
trufflehog git file://. --since-commit main --branch HEAD \
  --results=verified,unknown --fail                                # only the PR's commits
trufflehog filesystem . --no-verification --json                   # nothing leaves the machine
trufflehog docker --image my-api:1.4.2 --results=verified          # a built image
```

- `--results` takes `verified`, `unknown`, `unverified`, `filtered_unverified`; the default prints `verified,unverified,unknown`.
- Exit codes: `0` clean, `1` scan error, `183` results found (only with `--fail`).
- **Verification contacts the credential's provider** with the found secret. That is the provider's own host, but tell the user before a verified scan of a private repo; `--no-verification` keeps the scan local.
- Ignore a known test value with a `trufflehog:ignore` comment on that line; `--no-ignore-tag` shows them again for review.
- `--sarif` writes SARIF for GitHub code scanning.
- **GitHub Action** (`trufflesecurity/trufflehog`, `extra_args: --results=verified,unknown`, checkout with `fetch-depth: 0`): the docs' examples use `@main` and the action pulls the latest TruffleHog by default. Pin the action to a SHA and set its `version` input.
- A `verified` hit means a live key: go straight to section 4. Treat `unknown` as possibly live until checked.

## 3. GitHub secret scanning and push protection

- Enable secret scanning and **push protection** at the organization or repository level (Settings -> Code security). Push protection blocks the push when a supported token is detected.
- Bypasses require a reason (false positive, used in tests, will fix later); review bypasses weekly.
- Add **custom patterns** for internal token formats (a regex plus test strings) and check them against sample data before publishing to avoid alert floods.
- Enable validity checks where offered so alerts show whether the credential is still active.
- Alert triage: confirm, rotate, then close as "revoked". Closing as "false positive" requires evidence.

## 4. A secret leaked: response order

1. **Revoke or rotate first.** Assume it has been copied the moment it was pushed to any remote. History rewriting does not un-leak it.
2. **Check usage**: provider audit logs for the window since the commit.
3. **Replace** the secret in the store and redeploy consumers.
4. **Then clean history** if needed (`git filter-repo`), coordinate with collaborators to re-clone, and ask the host to purge cached views where supported.
5. **Prevent recurrence**: add the pattern to scanning, add the file to `.gitignore`, write a one-paragraph incident note.

## 5. Logging

- Redact secrets and tokens in logs by key name (`authorization`, `cookie`, `password`, `token`, `secret`, `api_key`) at the logger level.
- Never echo secrets in CI logs; mask any value derived from a secret.
- Key-name redaction does not help once an object has been turned into a string (`str(obj)`, `util.inspect(obj)`): the logger sees no keys. See section 6.

## 6. Secrets that leak through serialization

A credential stored as a field on an object can reach logs, tracing spans, error reports, caches or HTTP responses through serialization the language generates for you. It takes two changes, often months apart, so a diff-only review never sees both.

- **Holder:** a credential field on a type with auto-generated serialization (Python dataclass `repr`/`asdict`, Pydantic `model_dump`, JS `JSON.stringify`/`util.inspect`).
- **Sink:** code that serializes a whole object or all of its arguments: `str(obj)`, `asdict(`, `model_dump(`, `JSON.stringify(`, `util.inspect(`, `span.set_data(`, logger calls that take an object. Raw access counts too: `vars(`, `__dict__`, `pickle.dumps(`.

When the diff adds a holder, grep the whole repo for sinks. When it adds a sink, look for credential holders. Report either side on its own.

**What blocks which path**

| Mechanism | Blocks |
|---|---|
| Python `dataclass` / `attrs` `field(repr=False)` | `repr` and `str` only; `asdict` still copies it |
| Pydantic `Field(repr=False)` | `repr` and `str` |
| Pydantic `Field(exclude=True)` | `model_dump` |
| Pydantic `repr=False` plus `exclude=True` | every generated path, but not `pickle` or `vars()` |
| A redacting wrapper type (`SecretStr` style) | every generated path |
| JS `#private` field | every generated path outside the class |
| JS non-enumerable property (`Object.defineProperty`) | JSON and inspect |
| Hand-written `toJSON` or `[util.inspect.custom]` that omits the field | that one path only |

Underscore names, TypeScript's `private` keyword and Python's `__slots__` block nothing at runtime.

**Severity**

- **High:** the credential reaches any sink (log, span, error report, cache, response) anywhere in the repo.
- **Medium:** an unexcluded credential field that leaves its module, or a new wholesale sink with no allowlist.
- **Low:** an unexcluded field confined to one scope.

Do not lower the severity because the holder or the sink was there before the diff. If the sink's reach can't be seen (which type `req.session` is, where spans are exported), say so under "needs verification" and still report the part you traced.

**Do not flag:** fully excluded fields (unless a raw-attribute sink applies), partial exclusions where no sink uses the unblocked path, credentials read inside a method and never stored, test placeholders, types with no serialization or `__dict__` sink, and old fields and sinks the diff does not connect.

**Fix:** wrap the credential in a redacting type or exclude the field, then replace whole-object serialization at the sink with an allowlist of named fields so the next secret field cannot leak the same way. Add a test that builds the object with a sentinel value and asserts the sentinel is absent from `repr`, `str` and the serialized form. If the code already ran anywhere that ships logs or spans, follow section 4.

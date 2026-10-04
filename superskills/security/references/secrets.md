# Secrets: storage, scanning and leak response

> Distilled from: secrets-management (wshobson/agents, MIT), secret-scanning (github/awesome-copilot, MIT), security-and-hardening (addyosmani/agent-skills, MIT), secret-serialization (getsentry/skills, Apache-2.0).

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

Add a pre-commit scanner (gitleaks, trufflehog, or detect-secrets) and run it in CI too, since hooks can be skipped.

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

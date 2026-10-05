# Dependency and supply-chain risk

> Distilled from: supply-chain-risk-auditor (trailofbits/skills, CC-BY-SA-4.0), security-and-hardening (addyosmani/agent-skills, MIT), security-best-practices (openai/skills, Apache-2.0).
> License: CC-BY-SA-4.0 (derived from trailofbits/skills supply-chain-risk-auditor). Share alike.
> Dependabot, Trivy and Snyk sections: written in our own words from each tool's official docs (see CREDITS.md).

Use this for "audit our dependencies", "scan our Docker image", "is this package safe to add?", vulnerability alerts, update bots, and lockfile hygiene.

## 1. Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| Already uses or pays for a scanner (Snyk, Dependabot alerts, a company SCA tool) | That one | Findings, ignores and dashboards stay in one place; ask which one before adding another |
| Quick check of one project, no account | The native audit (section 2) | Built into the package manager, nothing to install |
| Repo on GitHub, wants alerts and fix PRs with no extra account | Dependabot (section 3) | Built into GitHub; security PRs need no config file |
| A container image, or lockfiles plus OS packages plus secrets in one pass, free | Trivy (section 4) | Open source CLI, no account, gates CI |
| Team already on Snyk, or wants base-image upgrade advice and a hosted dashboard | Snyk CLI (section 5) | Needs a Snyk account; results are sent to Snyk |
| Is a package healthy (maintainers, cadence, scorecard), not only CVE-free | The bundled collector (section 6) | Covers what CVE scanners do not |
| Not sure which scanner the reviewer or CI already trusts | Ask the user | Two scanners with different databases give two different counts |

Whatever the tool, triage with the reachability table in section 2; a raw CVE count is not a finding.

## 2. Known vulnerabilities: the native audit first

| Ecosystem | Command |
|---|---|
| npm | `npm audit --omit=dev` (production), then full |
| pnpm / yarn | `pnpm audit`, `yarn npm audit` |
| Python | `pip-audit` or `uv pip audit` if available |
| Go | `govulncheck ./...` (reports only reachable vulnerable symbols) |
| Rust | `cargo audit` |

Triage by reachability, not raw count:

| Severity | Reachable in production? | Action |
|---|---|---|
| Critical/High | Yes | Fix now: patch, upgrade or remove |
| Critical/High | Dev-only or unreachable | Fix soon; note why it is not urgent |
| Medium | Yes | Next release |
| Low | Any | Track |

Never run `npm audit fix --force` automatically: it applies breaking major upgrades. Upgrade deliberately and run the tests.

## 3. Dependabot (GitHub)

Three separate features: **alerts** (vulnerable dependencies found in the dependency graph), **security updates** (PRs that fix those alerts) and **version updates** (PRs that keep dependencies current, configured in `.github/dependabot.yml`).

- **Turn on security updates**: Settings > Security and quality > Advanced Security > Dependabot security updates > Enable. The dependency graph and alerts must be on too. No config file is needed; Dependabot then tries to open a PR for every open alert that has a patch.
- **Version updates** need `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"          # also pnpm and yarn projects
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
    cooldown:
      default-days: 7                 # wait a week before taking a brand-new release
  - package-ecosystem: "docker"       # base images in Dockerfiles
    directory: "/"
    schedule:
      interval: "weekly"
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

Facts that matter:

- `schedule.interval`: `daily`, `weekly`, `monthly`, `quarterly`, `semiannually`, `yearly` or `cron`.
- At most 5 version-update PRs are open at once by default (`open-pull-requests-limit`). Security-update PRs have no limit and do not count. Set the limit to `0` to keep security updates only.
- `cooldown` applies to version updates only, never security updates. Without it Dependabot still waits 3 days after a release. `semver-major-days`, `semver-minor-days`, `semver-patch-days` refine it; `include`/`exclude` take up to 150 names each.
- `groups` keys: `patterns`, `exclude-patterns`, `update-types` (`major`, `minor`, `patch`), `dependency-type` (`development`, `production`), `applies-to` (`version-updates`, the default, or `security-updates`).
- `directories` (plural) accepts globs such as `/apps/*`; `directory` does not.

Gotchas:

- Workflows triggered by Dependabot get **Dependabot secrets**, not Actions secrets, and a `GITHUB_TOKEN` with limited permissions on pull requests. A CI step that "works for humans but fails for Dependabot" is usually this.
- Dependabot runs on GitHub Actions even where Actions is disabled for the repo or org.
- Auto-merge is a standing rule that ships code: propose it, show which update types it covers (patch only is the safe start), and set it up only after a yes. Guard such workflows with `github.event.pull_request.user.login == 'dependabot[bot]'`.
- A Dependabot PR is a lead, not a fix: read the changelog for majors and let the tests run.

## 4. Container images and lockfiles: Trivy

Free open-source CLI, no account. Pick it for container images (OS packages plus app libraries in one scan), for lockfile scans without a vendor, and for a CI gate.

**Install**: `brew install trivy`, a release binary from GitHub, or the official image (`aquasec/trivy` on Docker Hub, `ghcr.io/aquasecurity/trivy`). The docs also offer an install script piped into `sh`; do not use it, use one of the above.

**Auth**: none for public images. For a private registry run `trivy registry login <registry>` yourself or rely on the existing Docker login; in CI keep registry credentials in CI secrets.

**Scan exactly the image that ships** (the tag or digest CI builds, not a local rebuild from another branch):

```bash
trivy image --format json --output out/trivy.json my-api:1.4.2           # everything, for triage
trivy image --severity HIGH,CRITICAL --ignore-unfixed my-api:1.4.2       # what a gate would see
trivy image --input out/my-api.tar                                       # an image saved with docker save
trivy image --image-config-scanners misconfig my-api:1.4.2               # image config issues too
trivy fs .                                                               # lockfiles and secrets in a checkout
```

- `trivy image` and `trivy fs` run the `vuln` and `secret` scanners by default; add `misconfig` or `license` with `--scanners`.
- `--severity` takes `UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL` (all by default).
- `--ignore-unfixed` hides CVEs with no fix yet; it is shorthand for `--ignore-status affected,will_not_fix,fix_deferred,end_of_life`.
- `--exit-code 1` makes findings fail the step; `--format` takes `table`, `json`, `sarif`, `cyclonedx`, `spdx-json` and others.
- Default timeout is 5 minutes (`--timeout`); raise it for very large images.

**Triage "hundreds of CVEs"**: group the JSON before reading it.

```bash
jq -r '.Results[] | .Class as $c | (.Vulnerabilities // [])[] |
  [$c, .Severity, (if (.FixedVersion // "") == "" then "no-fix" else "fix" end)] | @tsv' \
  out/trivy.json | sort | uniq -c | sort -rn
```

`os-pkgs` rows come from the base image: the fix is a newer or slimmer base image and a rebuild, not per-CVE work. Library rows go through the reachability table in section 2. Report the before and after counts from a rescan of the rebuilt image.

**Accepted risks** go in a file with a reason and an expiry, never a blanket ignore:

```
# .trivyignore  (one ID per line; exp: stops the ignore on that date)
# Not reachable: we never parse untrusted TIFFs. Owner: api-team
CVE-2025-12345 exp:2026-12-31
```

Or `.trivyignore.yaml` (pass `--ignorefile .trivyignore.yaml`), which takes `id`, `paths`, `purls`, `statement` and `expired_at` per entry. `--show-suppressed` lists what was filtered. `--vex <file>` (experimental) applies a VEX document instead.

**Vulnerability database**: each run downloads `trivy-db`, from `mirror.gcr.io/aquasec/trivy-db:2` then `ghcr.io/aquasecurity/trivy-db:2`. Change the source with `--db-repository`, warm a cache with `--download-db-only`, reuse it offline with `--skip-db-update` and `--cache-dir`. In CI, keep caching on; the action's docs recommend it to avoid rate-limiting issues.

**CI gate that blocks real problems only** (pin each `uses:` to a SHA, see github-actions.md):

```yaml
name: image-scan
on: [pull_request]
permissions:
  contents: read
jobs:
  trivy:
    runs-on: ubuntu-24.04
    permissions:
      contents: read
      security-events: write          # only because of the SARIF upload below
    steps:
      - uses: actions/checkout@<sha>  # v4
        with:
          persist-credentials: false
      - run: docker build -t my-api:${{ github.sha }} .
      - name: Gate on fixable HIGH/CRITICAL
        uses: aquasecurity/trivy-action@<sha>   # v0.36.0
        with:
          image-ref: my-api:${{ github.sha }}
          scanners: vuln,secret
          severity: CRITICAL,HIGH
          ignore-unfixed: true
          exit-code: '1'
          trivyignores: .trivyignore
      - name: Full SARIF for the Security tab
        if: always()
        uses: aquasecurity/trivy-action@<sha>   # v0.36.0
        with:
          image-ref: my-api:${{ github.sha }}
          format: sarif
          output: trivy.sarif
          severity: CRITICAL,HIGH
          limit-severities-for-sarif: true
          skip-setup-trivy: true
      - if: always()
        uses: github/codeql-action/upload-sarif@<sha>   # v4
        with:
          sarif_file: trivy.sarif
```

Gotchas:

- `trivy-action` was hit by a supply chain attack in March 2026; its maintainers then moved every tag to a `v` prefix. Pin by SHA, resolved with `gh api repos/aquasecurity/trivy-action/commits/v0.36.0 --jq .sha`, and read the diff before bumping.
- The action's `exit-code` defaults to `0`, so without it the step never fails.
- SARIF output contains every severity unless `limit-severities-for-sarif: true`.
- The action's `version` input picks the Trivy binary: action `v0.36.0` defaults to Trivy `v0.70.0` while the current Trivy release is `v0.75.0`. Set it explicitly and bump it on purpose.

## 5. Snyk CLI

Commercial platform (open source, code, container and IaC scanning). Pick it when the team already uses Snyk or wants its fix advice and dashboard. It needs a Snyk account and sends results to Snyk, so confirm both first.

**Install**: `brew tap snyk/tap && brew install snyk`, `npm install snyk -g`, or the `snyk/snyk` Docker images. Snyk documents how to verify standalone binaries' checksums and signatures.

**Auth**: `snyk auth` opens a browser for OAuth. In CI, put a personal access token or API token in a CI secret mapped to `SNYK_TOKEN` (or an OAuth token to `SNYK_OAUTH_TOKEN`). Never paste the token into chat or a file in the repo.

```bash
snyk test --all-projects --severity-threshold=high --fail-on=upgradable \
  --sarif-file-output=out/snyk-deps.sarif                      # open-source dependencies
snyk container test my-api:1.4.2 --file=Dockerfile \
  --severity-threshold=high --sarif-file-output=out/snyk-image.sarif
snyk code test --severity-threshold=high --sarif-file-output=out/snyk-code.sarif   # SAST
```

- `--severity-threshold`: `low|medium|high|critical` (`snyk code test`: `low|medium|high`).
- `--fail-on=upgradable` (or `all`) passes the test when no fix exists, the Snyk equivalent of Trivy's `--ignore-unfixed`.
- `--file=Dockerfile` adds base-image upgrade advice to a container test; app dependencies inside the image are scanned by default (`--exclude-app-vulns` turns that off).
- Exit codes: `0` nothing found, `1` vulnerabilities found, `2` failure (rerun with `-d`), `3` no supported project.
- `snyk monitor` uploads a dependency snapshot to snyk.io for daily monitoring. It publishes project data to the account: ask first. Not supported for Snyk Code.
- `snyk ignore --id=<ISSUE_ID> --expiry=2026-12-31 --reason="..."` records an accepted risk in `.snyk` (not for Snyk Code).

Gotchas:

- The CLI may run the project's package manager (npm, pip, Gradle, Maven...) to resolve dependencies, which executes code from the repo. Scan only code the user trusts.
- Snyk Code must be enabled by an Org Admin (Settings > Snyk Code). The SaaS service analyses the code on Snyk's side; the no-upload Local Engine is deprecated. Say so before the first `snyk code test` on private code.
- **From Claude (Snyk Studio MCP)**: with the CLI installed, add an MCP server that runs `snyk mcp -t stdio` (in `~/.claude.json` under `mcpServers`). Tools include `snyk_sca_scan`, `snyk_code_scan`, `snyk_container_scan`, `snyk_iac_scan`, `snyk_auth` and `snyk_trust` (a folder must be trusted before it is scanned). Snyk's legacy rules-based installer (`npx -y snyk@latest mcp configure --tool=claude-cli`) also writes scan directives into Claude Code's global rules file (Snyk's current default for Claude Code is a hooks-based setup): tell the user that before running it.

## 6. Package health: the bundled collector

For a broader risk picture (maintainers, release cadence, scorecard, deprecations) run the collector. It is standard-library Python 3.11+, supports npm (`package-lock.json`), PyPI (`uv.lock`) and Go (`go.mod`), and does not read yarn, pnpm or poetry lockfiles.

```bash
uv run scripts/supply-chain-risk-auditor/collect.py <project-dir> --json out/findings.json
uv run scripts/supply-chain-risk-auditor/render.py out/findings.json --out out/report.md
```

- It queries public services (deps.dev, OSV, the package registries, OpenSSF Scorecard, the GitHub API). Tell the user before running it on a private project, since package names leave the machine.
- Authenticate `gh` first: unauthenticated GitHub calls are limited to 60 per hour, authenticated to 5,000.
- A non-zero exit means it refused to produce a report; relay its message verbatim instead of guessing.

## 7. Before adding a new dependency

- [ ] Do we need it? Standard library or 20 lines of our own code may do.
- [ ] Maintained: release in the last 12 months, more than one maintainer, issues answered.
- [ ] Adoption: weekly downloads and dependents proportional to the risk it carries.
- [ ] Name is exactly right (typosquats differ by one character or a scope).
- [ ] License compatible with ours.
- [ ] Install scripts: does it run `postinstall`? Prefer packages that do not.
- [ ] Transitive weight: `npm ls <pkg>` or `npm view <pkg> dependencies`.

## 8. Lockfile and install hygiene

- Commit lockfiles; CI installs with `npm ci`, `pnpm install --frozen-lockfile`, `uv sync --locked`, `pip install --require-hashes`.
- Block install scripts by default where the tool supports it (`npm config set ignore-scripts true`, pnpm `onlyBuiltDependencies` allowlist) and allow them per package.
- Pin GitHub Actions to commit SHAs (see github-actions.md).
- Use a private registry or scoped packages for internal names so a public package with the same name cannot be pulled instead.
- Enable automated update PRs (Dependabot, section 3, or Renovate) with grouped minor/patch updates and a short cooldown before adopting brand-new releases.

## 9. Report format

```
Summary: N direct, M transitive; X reachable high/critical
Table: package | version | issue | reachable? | fix version | action
Health flags: unmaintained, single maintainer, deprecated, low scorecard
Recommended changes (as a PR diff or command list)
```

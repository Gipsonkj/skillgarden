# Dynamic testing: scanning your own running app or API (DAST)

> Written in our own words from the official OWASP ZAP docs (link-only reference, see CREDITS.md).

Use this for "scan our staging site", "run ZAP in CI", "test our API from the outside", and for reading a DAST report someone sent. Static analysis reads code; dynamic testing sends real HTTP requests to a running app, so the authorisation rule matters more here than anywhere else in this craft.

## 1. Before any request is sent

- [ ] The user owns the target or has written permission to test it. Hosted services (a PaaS, a CDN, a SaaS login page) may have their own testing rules: ask.
- [ ] Target is staging or a local build, not production, unless the user explicitly says production and accepts the risk. Active scans submit forms, create records and can trigger emails or payments in test mode.
- [ ] Scope is written down: base URL, paths in and out, test accounts, time window.
- [ ] Seed data is throwaway and the test account has the lowest role that reaches the features under test.

## 2. Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| Already uses or pays for a DAST tool (Burp Suite, a company scanner) | That one; triage its report with section 7 | Their history and tuning live there; ask before adding another |
| A safe check on every deploy, free, no account | ZAP baseline scan (section 3) | Spider plus passive rules only, no attacks, finishes in minutes |
| Real attack testing of staging before a launch | ZAP full scan (section 3) | Spider plus a full active scan |
| A REST, GraphQL or SOAP API with a definition file | ZAP API scan (section 3) | Imports the definition and runs an active scan tuned for APIs |
| An exploit-validated pentest run by an AI agent | Strix (router, "Go deeper") | Confirms findings with working exploits; sends real exploit payloads |
| Unsure whether the target may take attack traffic | Ask the user | Never guess on ownership or production |

## 3. ZAP's packaged scans (Docker)

Images: `ghcr.io/zaproxy/zaproxy:<tag>` or `zaproxy/zap-<tag>` on Docker Hub. Tags: `stable` (full releases, rebuilt monthly), `weekly` (every Monday), `nightly`, and `bare` (minimal, for CI, but without the packaged scan scripts used below). Use `stable` and record the digest you ran.

```bash
# Baseline: spider for 1 minute (default), wait for passive rules, report. No attacks.
docker run --rm -v "$(pwd)":/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t https://staging.example.com -r zap.html -J zap.json

# Full: spider (no time limit unless -m), then a full active scan. Real attacks.
docker run --rm -v "$(pwd)":/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py -t https://staging.example.com -m 10 -r zap-full.html -J zap-full.json

# API: import an OpenAPI file mounted into /zap/wrk, then actively scan its endpoints.
docker run --rm -v "$(pwd)":/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable \
  zap-api-scan.py -t /zap/wrk/openapi.yaml -f openapi -r zap-api.html -J zap-api.json
```

- Reports: `-r` HTML, `-J` JSON, `-w` Markdown, `-x` XML. They land in the mounted folder. If nothing is written there, test the mount with `docker run -v "$(pwd)":/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable touch /zap/wrk/test.txt`; a failure means a permission problem on your side that no ZAP option works around. Inside the scripts `-u` means a config file URL.
- App on your own Mac: inside the container `localhost` is the container; use `host.docker.internal` instead.
- Useful options: `-m <mins>` spider time, `-j` add the modern spider (Ajax by default) for JavaScript-heavy apps, `-a` include alpha passive rules, `-I` do not fail on warnings, `-s` short output, `-T <mins>` max wait for ZAP start and passive scan, `-z "<zap options>"` raw ZAP flags.
- API scan: `-f` is `openapi`, `soap` or `graphql`; `-t` is a definition URL or file (or the GraphQL endpoint); `-O` overrides the host in a remote OpenAPI definition; `-S` is safe mode (no active scan).
- Exit codes (all three scripts): `0` pass, `1` at least one FAIL, `2` at least one WARN and no FAIL, `3` other failure. Every alert is a WARN until a rules file says otherwise, so an untuned scan exits `2`; in CI either tune the rules (section 4) or add `-I`.

## 4. Tune the rules

1. Generate a rules file once: add `-g zap-rules.conf` to a baseline run. Every rule starts as `WARN`.
2. Edit each line to `IGNORE`, `INFO`, `WARN` or `FAIL`. Format: rule id, level, then the rule name in brackets, tab-separated, e.g. `10016	WARN	(Web Browser XSS Protection Not Enabled)`.
3. Pass it with `-c zap-rules.conf` on later runs and commit it, with a comment line for every `IGNORE` saying why.

Start strict on what the app must never do (`FAIL` for injection and auth rules) and lenient on header advice (`WARN` or `INFO`), then tighten.

## 5. Authenticated scans

Most real bugs sit behind login. Two routes:

- **Header token** (APIs, SPAs with bearer tokens): set environment variables and ZAP adds the header to every request, including the spiders and active scanner. `ZAP_AUTH_HEADER_VALUE` is the value; `ZAP_AUTH_HEADER` the header name (default `Authorization`); `ZAP_AUTH_HEADER_SITE` limits it to sites whose name contains that value. Always set `ZAP_AUTH_HEADER_SITE` so the token is never sent to a third-party host the spider finds.

  ```bash
  # token comes from the user's secret store into the shell environment, never typed into chat or a file
  docker run --rm -e ZAP_AUTH_HEADER_VALUE -e ZAP_AUTH_HEADER_SITE=staging.example.com \
    -v "$(pwd)":/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable \
    zap-api-scan.py -t /zap/wrk/openapi.yaml -f openapi -J zap-api.json
  ```
- **Form or session login**: a ZAP context file (`-n context.context`) plus a user defined in it (`-U <user>`); all three scripts take both. Build the context once in the ZAP desktop app and commit it without the password.

Use a dedicated test account, and expire or rotate its token after the run.

## 6. In GitHub Actions

ZAP ships actions: `zaproxy/action-baseline` (v0.15.0) and `zaproxy/action-full-scan` (v0.13.0). Pin each to a commit SHA (github-actions.md).

```yaml
name: dast-baseline
on:
  workflow_dispatch:
  schedule:
    - cron: "0 3 * * 1"
permissions:
  contents: read
jobs:
  zap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha>          # v4, for the rules file
        with:
          persist-credentials: false
      - uses: zaproxy/action-baseline@<sha>   # v0.15.0
        with:
          target: https://staging.example.com
          rules_file_name: .zap/rules.tsv
          cmd_options: -a
          allow_issue_writing: false
          fail_action: true
```

- `fail_action` defaults to `false`: without it the job passes whatever ZAP finds.
- `allow_issue_writing` defaults to `true` and files GitHub issues with the results (needs `issues: write`). On a public repo that publishes your weaknesses: keep it `false` unless the user asks, and show them the first issue text before turning it on.
- The report is attached as an artifact (`artifact_name`, default `zap_scan`).
- The action passes `ZAP_AUTH_HEADER`, `ZAP_AUTH_HEADER_VALUE` and `ZAP_AUTH_HEADER_SITE` through; map them from Actions secrets with `env:`.
- Run full scans on a schedule or by hand against staging, never on every pull request from forks.

## 7. Triage and report

- An alert is a lead. Reproduce it (replay the request, check the response) and find the code path before calling it a finding.
- Passive header and cookie alerts (missing CSP, `X-Content-Type-Options`, cookie flags) usually belong under "hardening suggestions", not findings, unless they enable a confirmed attack.
- Active-scan hits (injection, path traversal, auth bypass) get the source-to-sink check from static-analysis.md section 4, then a severity by real impact.
- Report: target, image digest, scan type, rules file, auth used, duration; then the usual table (id | URL and parameter | severity | status | fix) with "needs verification" and "hardening suggestions" kept separate.
- After fixes, rerun the same scan with the same rules file and show the diff.

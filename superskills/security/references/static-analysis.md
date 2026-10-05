# Static analysis: Semgrep and CodeQL on your own code

> Distilled from: semgrep, codeql (trailofbits/skills, CC-BY-SA-4.0), security-review (affaan-m/everything-claude-code, MIT).
> License: CC-BY-SA-4.0 (derived from trailofbits/skills semgrep and codeql). Share alike.

Use this to scan a repository the user owns or maintains, triage the results, and hand back a SARIF file plus a short summary. Scanner output is a lead list, not a verdict: every reported finding must be confirmed by reading the code.

## 1. Pick the tool

| Situation | Tool | Why |
|---|---|---|
| Already uses or pays for a SAST tool (GitHub code scanning, Snyk Code, SonarQube, a company scanner) | That one; triage its findings with section 4 | Findings and suppressions stay where the team looks; ask which one first |
| Quick scan, many languages, custom pattern rules | Semgrep | Local, minutes, rules you can read |
| Deep interprocedural data flow (taint from source to sink) | CodeQL | Builds a database of the code and follows data across functions |
| Both are available and time allows | Semgrep first (minutes), CodeQL on the riskiest components | Breadth, then depth where it matters |
| Team already on Snyk and wants SAST in the same account | `snyk code test` (supply-chain.md section 5) | Same login and dashboard; the code is analysed by Snyk's service, so confirm that is allowed |

Check availability first: `semgrep --version`, `codeql version`. Do not install tools without asking.

## 2. Semgrep with the bundled script

Always run with metrics off. Agree the plan with the user (languages, rulesets, mode) before scanning.

1. Write a rulesets file, for example `rulesets.json`:
   ```json
   {"baseline": ["p/security-audit", "p/secrets"],
    "python": ["p/python", "p/django"],
    "javascript": ["p/javascript", "p/typescript"],
    "third_party": ["https://github.com/trailofbits/semgrep-rules"]}
   ```
   Include a third-party ruleset; the registry defaults miss many issues.
2. Dry run, then scan:
   ```bash
   scripts/semgrep/run-scans.sh --target . --output-dir out/semgrep \
     --mode run-all --rulesets rulesets.json --dry-run
   scripts/semgrep/run-scans.sh --target . --output-dir out/semgrep \
     --mode run-all --rulesets rulesets.json
   ```
   Options: `--mode important-only` (pre-filters to WARNING and ERROR severities), `--pro` (cross-file analysis if licensed), `--jobs N`, `--max-target-bytes 20000000` (raise for large generated files). The script writes `scans.json` listing scans, failures, skipped and oversized files: report those, do not hide them.
3. For important-only mode, post-filter every raw JSON file before merging (missing metadata counts as passing):
   ```bash
   for f in out/semgrep/raw/*.json; do
     jq '{results: [.results[] |
       ((.extra.metadata.category // "security") | ascii_downcase) as $cat |
       ((.extra.metadata.confidence // "HIGH") | ascii_upcase) as $conf |
       ((.extra.metadata.impact // "HIGH") | ascii_upcase) as $imp |
       select(($cat == "security") and ($conf == "MEDIUM" or $conf == "HIGH") and ($imp == "MEDIUM" or $imp == "HIGH"))],
       errors: .errors, paths: .paths}' "$f" > "${f%.json}-important.json"
   done
   ```
4. Merge into one SARIF:
   ```bash
   uv run --no-project scripts/semgrep/merge_sarif.py out/semgrep/raw \
     out/semgrep/results/results.sarif --scans out/semgrep/scans.json [--important]
   ```

## 3. CodeQL

1. **Build the database** for each language (`codeql database create db-<lang> --language=<lang> --source-root .`). Compiled languages need a working build command.
2. **Check database quality** before trusting results: look at extraction errors and the count of extracted files versus files in the repo. A database that extracted 10% of the code produces confident-looking nonsense.
3. **Run an explicit suite**, never the implicit default: `codeql database analyze db-<lang> codeql/<lang>-queries:codeql-suites/<lang>-security-extended.qls --format=sarif-latest --output=codeql-<lang>.sarif`.
4. **Zero findings is a result to investigate**, not a pass: confirm the database covers the code and the suite matched the language.
5. On macOS, exit code 137 usually means an architecture mismatch (arm64e), not out-of-memory.

## 4. Triage

For each result:

| Question | If no |
|---|---|
| Is the source really attacker-controlled? | Mark false positive with the reason |
| Does the data reach the sink without validation or encoding? | False positive |
| Is the code reachable in production (not tests, not dead code)? | Downgrade |
| Does a framework protection already apply? | False positive |

Severity after triage: Critical (remote code execution, auth bypass, cross-tenant data), High (stored XSS, SQL injection behind auth), Medium (needs unusual conditions), Low (hardening). Keep "needs verification" separate from severity when you cannot confirm the input source.

## 5. Report

- The merged SARIF path and the scan summary (rulesets, files scanned, failures).
- A table: id | rule | file:line | severity | status (confirmed / false positive / needs verification) | fix.
- Suggested fixes as diffs for confirmed findings. Do not apply fixes without the user's go-ahead.
- For a pattern found once, search for siblings: the same mistake usually appears elsewhere.

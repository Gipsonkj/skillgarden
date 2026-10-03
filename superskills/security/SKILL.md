---
name: security
description: Defensive application security for code the user owns. Use when writing or hardening code that handles input, auth, sessions, uploads, SSRF-prone URL fetches or personal data; threat modeling a design (STRIDE, attack trees, mitigation mapping); running and triaging Semgrep or CodeQL scans and producing SARIF; auditing dependencies, lockfiles and package health; storing secrets, setting up secret scanning or responding to a leaked key; hardening GitHub Actions workflows (SHA pinning, permissions, pull_request_target, AI agents in CI); reviewing Firebase/Firestore/Storage rules or Data Connect @auth. Only for systems the user is authorised to test.
---

# Security

> **Authorised targets only.** Only scan, probe or test systems the user owns or has explicit written permission to test. If ownership or permission is unclear, stop and ask before running any scanner or tool against it. Never point tools at third-party hosts.

Scope: defensive security for the user's own code and infrastructure: secure-by-default implementation, threat modeling, static analysis, dependency risk, secrets handling, CI hardening and Firebase rules. Outputs are fixes, reports and tests the team can act on.

## Core principles

1. **Authorisation before any tool runs.** Confirm the target is the user's own repository or system. Scanners that contact the network (the dependency collector) are announced first.
2. **Trust follows who wrote a value**, not the channel it came through. Request data, webhook bodies, other users' rows, LLM output and CI text are untrusted.
3. **Authorization on every request, per resource.** Scope queries to the caller (`WHERE id = $1 AND org_id = $2`). Broken access control is the most common real bug.
4. **Validate at the boundary with a schema; parameterize every query; rely on framework escaping.** The escape hatches (`raw`, `innerHTML`, `shell=True`) are where bugs live.
5. **Report only what you can trace.** A finding needs a confirmed attacker-controlled source reaching a sink. Unclear sources go under "needs verification" with no severity. Conflict: scanners want breadth, reviewers want precision; resolved by treating scanner output as leads that must be confirmed in code.
6. **Severity by real impact in context.** Critical = code execution, auth bypass, cross-tenant data. The same missing control is Low on an internal tool and High on a public login.
7. **Secrets never in code or git.** A leaked secret is rotated first, history cleaned second; rewriting history does not un-leak it.
8. **Least privilege everywhere**: tokens, CI `permissions:`, database roles, cloud roles, agent tool allowlists.
9. **Pin what you execute**: lockfiles with frozen installs, actions pinned to SHAs, tool versions fixed.
10. **Fail closed.** Crypto, auth and validation errors deny; refusals never fall back to a broader default.
11. **Rate limits need a shared store** when more than one instance runs (in-memory gives limit x instances).
12. **Do not over-recommend.** No missing-TLS findings for local dev, no casual HSTS preload advice, no defence-in-depth padding in a findings list. Conflict: hardening guides list everything, review guides list only exploitable issues; resolved by keeping best-practice items in a separate "hardening suggestions" section.
13. **Propose fixes as diffs; apply them only with the user's go-ahead** during an audit.

## Pick the right guide

| Task | Read |
|---|---|
| Write or harden a feature (input, auth, sessions, uploads, SSRF, crypto, privacy) | [references/secure-coding.md](references/secure-coding.md) |
| Threat model a design or launch; STRIDE, attack trees, mitigation mapping | [references/threat-modeling.md](references/threat-modeling.md) |
| Run Semgrep or CodeQL on the repo, triage, produce SARIF | [references/static-analysis.md](references/static-analysis.md) + `scripts/semgrep/run-scans.sh`, `scripts/semgrep/merge_sarif.py` |
| Audit dependencies, vet a new package, lockfile hygiene | [references/supply-chain.md](references/supply-chain.md) + `scripts/supply-chain-risk-auditor/collect.py`, `scripts/supply-chain-risk-auditor/render.py` |
| Store secrets, set up secret scanning, respond to a leaked key | [references/secrets.md](references/secrets.md) |
| Write or review GitHub Actions workflows, AI agents in CI | [references/github-actions.md](references/github-actions.md) |
| Firestore / Storage rules, Data Connect `@auth` | [references/firebase-rules.md](references/firebase-rules.md) |

## Default workflow

1. **Confirm scope and authorisation**: which repository, service or PR; that the user owns it; what is in and out of scope.
2. **Map the system briefly**: entry points, trust boundaries, assets, auth model (threat-modeling.md section 1 is enough for small tasks).
3. **Pick the guide** from the table and follow it.
4. **Run tools only on the agreed target**, with metrics off and outputs in an `out/` folder; record failures and skipped files.
5. **Confirm each finding in code**: trace source to sink, check framework protections and reachability.
6. **Write the report**: table of id | location | severity | status | fix, plus "needs verification" and "hardening suggestions" sections.
7. **Propose fixes as diffs and abuse-case tests**; apply after the user agrees; rerun the relevant scan to confirm.

## Done means

- [ ] Target was confirmed as the user's own or authorised in writing.
- [ ] Every reported finding has a traced source, a sink, a severity and a fix.
- [ ] Unconfirmed items are separated from findings; no severity on them.
- [ ] Tool runs listed with rulesets/suites, failures and skipped files.
- [ ] No secrets in code, logs or the report itself.
- [ ] Fixes come with a test that fails before and passes after.

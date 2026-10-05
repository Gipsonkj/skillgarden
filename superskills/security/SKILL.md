---
name: security
description: Defensive application security for code the user owns. Use when writing or hardening code that handles input, auth, sessions, uploads, SSRF-prone URL fetches or personal data; threat modeling a design (STRIDE, attack trees, mitigation mapping); running and triaging Semgrep or CodeQL scans and producing SARIF; auditing dependencies, lockfiles, container images and package health (npm audit, Dependabot, Trivy, Snyk); storing secrets, setting up secret scanning (GitHub push protection, Gitleaks, TruffleHog) or responding to a leaked key; scanning your own running web app or API with OWASP ZAP (DAST); hardening GitHub Actions workflows (SHA pinning, permissions, pull_request_target, AI agents in CI); reviewing Firebase/Firestore/Storage rules or Data Connect @auth. Only for systems the user is authorised to test.
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

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Receipt uploads: `references/threat-modeling.md` → `references/secure-coding.md`; storage rules from `backend-databases` → `references/supabase.md`; abuse-case tests from `testing-qa` → `references/playwright-e2e.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Write or harden a feature (input, auth, sessions, uploads, SSRF, crypto, privacy) | [references/secure-coding.md](references/secure-coding.md) |
| Threat model a design or launch; STRIDE, attack trees, mitigation mapping | [references/threat-modeling.md](references/threat-modeling.md) |
| Run Semgrep or CodeQL on the repo, triage, produce SARIF; pick a SAST tool | [references/static-analysis.md](references/static-analysis.md) + `scripts/semgrep/run-scans.sh`, `scripts/semgrep/merge_sarif.py` |
| Audit dependencies or a container image, vet a new package, lockfile hygiene; pick a scanner (npm audit, Dependabot, Trivy, Snyk) | [references/supply-chain.md](references/supply-chain.md) + `scripts/supply-chain-risk-auditor/collect.py`, `scripts/supply-chain-risk-auditor/render.py` |
| Store secrets, set up secret scanning (pick a scanner: GitHub, Gitleaks, TruffleHog), respond to a leaked key | [references/secrets.md](references/secrets.md) |
| Scan your own running web app or API (DAST); pick a scanner (ZAP baseline, full or API scan) | [references/dynamic-testing.md](references/dynamic-testing.md) |
| Write or review GitHub Actions workflows, AI agents in CI | [references/github-actions.md](references/github-actions.md) |
| Firestore / Storage rules, Data Connect `@auth` | [references/firebase-rules.md](references/firebase-rules.md) |

## Other crafts

| When the request also needs | Use |
|---|---|
| Building the auth itself (sessions, OAuth, RBAC), Supabase RLS, or the Firestore model behind the rules | `backend-databases` → `references/auth.md`, `references/supabase.md`, `references/firebase.md` |
| Abuse-case and regression tests in the project's own runner, unit to E2E | `testing-qa` → `references/tdd-and-unit-tests.md`, `references/playwright-e2e.md` |
| Cloud and container hardening: IAM roles, Kubernetes RBAC and NetworkPolicy, smaller images | `cloud-devops` → `references/aws.md`, `references/kubernetes.md`, `references/docker.md` |
| Pipelines beyond workflow hardening: OIDC to clouds, quality gates, Dependabot (security side in `references/github-actions.md`) | `cloud-devops` → `references/ci-cd.md` |
| An AI agent or MCP server: approval gates, prompt-injection handling, MCP OAuth | `ai-agents` → `references/tool-design.md`, `references/agent-prompts.md`, `references/mcp-servers.md` |
| A full review of the fix PR and fresh proof it works before merge | `coding-practices` → `references/code-review.md`, `references/verification.md` |
| Hooks that stop Claude Code from running dangerous commands or touching secret files | `claude-meta` → `references/hooks-and-guardrails.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| An exploit-validated pentest of your own running app or API, reported as Markdown, JSON or SARIF | [penetration-testing-with-strix](https://github.com/usestrix/strix/tree/main/skills/penetration-testing-with-strix) (Apache-2.0; authorised targets only, sends real exploit payloads) |
| Hunting siblings of a vulnerability you just found across the codebase | [variant-analysis](https://github.com/trailofbits/skills/tree/main/plugins/variant-analysis/skills/variant-analysis) (CC-BY-SA-4.0) |
| A security review of a PR or commit range with git history and blast-radius estimates | [differential-review](https://github.com/trailofbits/skills/tree/main/plugins/differential-review/skills/differential-review) (CC-BY-SA-4.0) |
| Spotting footgun APIs and dangerous config surfaces in a library or service design | [sharp-edges](https://github.com/trailofbits/skills/tree/main/plugins/sharp-edges/skills/sharp-edges) (CC-BY-SA-4.0) |
| A full multi-phase audit with verified, machine-readable findings, when explicitly asked | [security-audit](https://github.com/cloudflare/security-audit-skill/tree/main/skills/security-audit) (MIT) |
| Smart-contract security in Solidity: reentrancy, access control, oracle manipulation | [solidity-security](https://github.com/wshobson/agents/tree/main/plugins/blockchain-web3/skills/solidity-security) (MIT) |

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

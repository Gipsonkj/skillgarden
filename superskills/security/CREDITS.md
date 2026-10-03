# Credits

Reference files are distilled in our own words from the skills below. Scripts are copied unchanged, with the source repository's LICENSE beside them.

| Skill | Repo | License | Used for |
|---|---|---|---|
| security-and-hardening | https://github.com/addyosmani/agent-skills/tree/main/skills/security-and-hardening | MIT | secure-coding.md tiers, rate limits, SSRF and path guards; supply-chain.md audit triage |
| security-review | https://github.com/affaan-m/everything-claude-code/tree/main/skills/security-review | MIT | secure-coding.md controls; static-analysis.md triage |
| security-best-practices | https://github.com/openai/skills/tree/main/skills/.curated/security-best-practices | Apache-2.0 | secure-coding.md framework notes and over-recommendation cautions |
| security-threat-model | https://github.com/openai/skills/tree/main/skills/.curated/security-threat-model | Apache-2.0 | threat-modeling.md scoping and output |
| stride-analysis-patterns | https://github.com/wshobson/agents/tree/main/plugins/security-scanning/skills/stride-analysis-patterns | MIT | threat-modeling.md STRIDE tables |
| attack-tree-construction | https://github.com/wshobson/agents/tree/main/plugins/security-scanning/skills/attack-tree-construction | MIT | threat-modeling.md attack trees |
| threat-mitigation-mapping | https://github.com/wshobson/agents/tree/main/plugins/security-scanning/skills/threat-mitigation-mapping | MIT | threat-modeling.md control types |
| semgrep | https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/semgrep | CC-BY-SA-4.0 | static-analysis.md; scripts/semgrep/ (copied) |
| codeql | https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/codeql | CC-BY-SA-4.0 | static-analysis.md CodeQL section |
| supply-chain-risk-auditor | https://github.com/trailofbits/skills/tree/main/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor | CC-BY-SA-4.0 | supply-chain.md; scripts/supply-chain-risk-auditor/ (copied) |
| agentic-actions-auditor | https://github.com/trailofbits/skills/tree/main/plugins/agentic-actions-auditor/skills/agentic-actions-auditor | CC-BY-SA-4.0 | github-actions.md AI-agent checklist |
| secure-github-actions | https://github.com/intercom/2x-skills/tree/main/plugins/security-tools/skills/secure-github-actions | MIT | github-actions.md rules 1-14 |
| security-review | https://github.com/getsentry/skills/tree/main/skills/security-review | Apache-2.0 | secure-coding.md attacker-controlled input notes |
| golang-security | https://github.com/samber/cc-skills-golang/tree/main/skills/golang-security | MIT | secure-coding.md Go notes |
| secrets-management | https://github.com/wshobson/agents/tree/main/plugins/cicd-automation/skills/secrets-management | MIT | secrets.md storage |
| secret-scanning | https://github.com/github/awesome-copilot/tree/main/skills/secret-scanning | MIT | secrets.md push protection and custom patterns |
| firebase-security-rules-auditor, firebase-firestore, firebase-data-connect | https://github.com/firebase/agent-skills/tree/main/skills | Apache-2.0 | firebase-rules.md |

Files derived from CC-BY-SA-4.0 sources (static-analysis.md, supply-chain.md, github-actions.md, scripts/semgrep/, scripts/supply-chain-risk-auditor/) remain under CC-BY-SA-4.0.

## Also see (not included)

- code-security (semgrep/skills, Semgrep Rules License, not redistributable here): https://github.com/semgrep/skills/tree/main/skills/code-security
- ffuf-web-fuzzing (jthack/ffuf_claude_skill, link only): https://github.com/jthack/ffuf_claude_skill/tree/main/ffuf-skill

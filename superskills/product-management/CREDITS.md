# Credits

This super skill is distilled from the open-source skills below. Text was rewritten and merged; only the scripts and the one template listed were copied as-is, with their licenses beside them.

| Skill | Repo | License | What was used |
|---|---|---|---|
| to-spec | https://github.com/mattpocock/skills/tree/main/skills/engineering/to-spec | MIT | Synthesis-mode spec (no interview), test seams, implementation/testing decision sections, no file paths in specs |
| to-tickets | https://github.com/mattpocock/skills/tree/main/skills/engineering/to-tickets | MIT | Tracer-bullet vertical slices, blocking edges and frontier, expand–migrate–contract for wide refactors, approve-then-publish flow, ticket template |
| bmad-prd | https://github.com/bmad-code-org/BMAD-METHOD/tree/main/skills/bmad-prd | MIT | Fast vs coaching path, elicitation-not-direction, length scales with stakes, named-persona journeys, glossary discipline, seven-dimension PRD review rubric; `templates/bmad-prd/prd-template.md` copied as-is |
| prd | https://github.com/github/awesome-copilot/tree/main/skills/prd | MIT | Minimum two clarifying questions, concrete vs vague requirements, AI-feature evaluation section, TBD instead of invented constraints |
| create-prd | https://github.com/phuryn/pm-skills/tree/main/pm-execution/skills/create-prd | MIT | Background / why-now, segments defined by problems, value proposition, assumptions, relative release timing |
| user-stories | https://github.com/phuryn/pm-skills/tree/main/pm-execution/skills/user-stories | MIT | 3 Cs, INVEST, story template and worked acceptance-criteria example |
| outcome-roadmap | https://github.com/phuryn/pm-skills/tree/main/pm-execution/skills/outcome-roadmap | MIT | Output → outcome rewrite format and "so what?" test |
| prioritization-frameworks | https://github.com/phuryn/pm-skills/tree/main/pm-execution/skills/prioritization-frameworks | MIT | Opportunity Score formulas, ICE/RICE definitions, nine-framework selection table |
| strategy-red-team | https://github.com/phuryn/pm-skills/tree/main/pm-execution/skills/strategy-red-team | MIT | Load-bearing claims, steelman-then-attack, "fails if", ranking by impact × likelihood × cheapness, kill criteria and cheapest test |
| pre-mortem | https://github.com/phuryn/pm-skills/tree/main/pm-execution/skills/pre-mortem | MIT | Tigers / Paper Tigers / Elephants, launch-blocking / fast-follow / track, action plan fields |
| linear | https://github.com/openai/skills/tree/main/skills/.curated/linear | Apache-2.0 | Linear MCP setup, read-then-write order, tool families, practical workflows |
| product-manager-toolkit | https://github.com/alirezarezvani/claude-skills/tree/main/product-team/skills/product-manager-toolkit | MIT | RICE scales and interpretation, portfolio mix, discovery process, pitfalls; `scripts/product-manager-toolkit/rice_prioritizer.py` and `customer_interview_analyzer.py` copied as-is |
| jira-expert | https://github.com/alirezarezvani/claude-skills/tree/main/project-management/skills/jira-expert | MIT | JQL patterns and functions, transitions, what MCP cannot do, bulk-change validation, workflow design; `scripts/jira-expert/jql_query_builder.py` and `workflow_validator.py` copied as-is |
| write-spec | https://github.com/anthropics/knowledge-work-plugins/tree/main/product-management/skills/write-spec | Apache-2.0 | PRD sections, P0/P1/P2, leading vs lagging metrics, target setting, Given/When/Then, scope-creep prevention, user-story mistakes |
| roadmap-update | https://github.com/anthropics/knowledge-work-plugins/tree/main/product-management/skills/roadmap-update | Apache-2.0 | Roadmap formats, roadmap operations, dependency mapping, capacity allocation, communicating changes |
| stakeholder-update | https://github.com/anthropics/knowledge-work-plugins/tree/main/product-management/skills/stakeholder-update | Apache-2.0 | Audience templates, G/Y/R rules, ROAM, risk statement, ADR format, meeting facilitation |
| sprint-planning | https://github.com/anthropics/knowledge-work-plugins/tree/main/product-management/skills/sprint-planning | Apache-2.0 | Sprint inputs, plan template, 70–80% load rule, one sprint goal |
| meeting-minutes | https://github.com/github/awesome-copilot/tree/main/skills/meeting-minutes | MIT | Minutes schema, clarifying questions, owner + due date rule, length limits |
| notion-meeting-intelligence | https://github.com/openai/skills/tree/main/skills/.curated/notion-meeting-intelligence | MIT (Notion Labs) | Meeting prep flow and template selection by meeting type |
| atlassian-mcp | https://github.com/Jeffallan/claude-skills/tree/main/skills/atlassian-mcp | MIT | Server options, read-only probe before writes, pagination and rate limits, CQL examples, credential rules |
| jobs-to-be-done | https://github.com/wondelai/skills/tree/main/jobs-to-be-done | MIT | Job statement, three dimensions, forces of progress, big/little hire, non-obvious competition, switch-timeline interviews, diagnostic |
| writing-prds | https://github.com/RefoundAI/lenny-skills/tree/main/skills/writing-prds | MIT | Problem-first one-pagers, brevity, detail dial, avoid "just", business vs customer problem |
| linear-cli | https://github.com/schpet/linear-cli/tree/main/skills/linear-cli | ISC | `linear` CLI recipes, file-based markdown bodies, archive vs delete guidance |

Notes on sources: the atlassian-mcp setup reference names an npm package for an "official" Atlassian server that could not be verified, so no install commands were taken from it; the router points to Atlassian's own docs instead. No source contained instructions to exfiltrate data or disable safeguards.

## Also see (not included)

| Skill | URL | Why not included |
|---|---|---|
| prd-development (deanpeters/Product-Manager-Skills) | https://github.com/deanpeters/Product-Manager-Skills/tree/main/skills/prd-development | CC-BY-NC-SA-4.0 (non-commercial); nothing copied or paraphrased |

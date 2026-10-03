# Credits

The router and references are written in this skill's own words from the licensed sources below plus general knowledge of the Figma MCP server, the Figma Plugin API, W3C DTCG, Style Dictionary and WCAG 2.2. Scripts are copied unchanged with their licence beside them.

## Sources used

| Source | Repo | Licence | What was used |
|---|---|---|---|
| figma-export-tokens | [southleft/figma-console-mcp-skills](https://github.com/southleft/figma-console-mcp-skills/tree/main/skills/figma-export-tokens) | MIT | `read-variables.js`, `convert-tokens.mjs` copied to `scripts/figma-export-tokens/`; export workflow, opacity and float-noise notes in design-tokens.md and token-sync-and-drift.md |
| figma-import-tokens | [southleft/figma-console-mcp-skills](https://github.com/southleft/figma-console-mcp-skills/tree/main/skills/figma-import-tokens) | MIT | `parse-tokens.mjs`, `apply-tokens.js` copied to `scripts/figma-import-tokens/`; two-pass import and matching rules |
| figma-lint-design | [southleft/figma-console-mcp-skills](https://github.com/southleft/figma-console-mcp-skills/tree/main/skills/figma-lint-design) | MIT | `lint-design.js` copied to `scripts/figma-lint-design/`; rule list and thresholds in accessibility-specs.md and design-system-audits.md |
| figma-check-design-parity | [southleft/figma-console-mcp-skills](https://github.com/southleft/figma-console-mcp-skills/tree/main/skills/figma-check-design-parity) | MIT | `check-parity.js` copied to `scripts/figma-check-design-parity/`; score formula and tolerances |
| use-figma conventions note (repo `references/`) | [southleft/figma-console-mcp-skills](https://github.com/southleft/figma-console-mcp-skills/tree/main/references) | MIT | `use_figma` script rules in figma-mcp.md |
| create-component-md | [redongreen/uSpec](https://github.com/redongreen/uSpec/tree/main/skills/create-component-md) | MIT | Spec structure and evidence gathering in component-specs.md |
| create-api | [redongreen/uSpec](https://github.com/redongreen/uSpec/tree/main/skills/create-api) | MIT | API naming rules (with the repo's `references/api/` library) |
| create-anatomy | [redongreen/uSpec](https://github.com/redongreen/uSpec/tree/main/skills/create-anatomy) | MIT | Anatomy note patterns |
| create-color | [redongreen/uSpec](https://github.com/redongreen/uSpec/tree/main/skills/create-color) | MIT | Colour annotation rules |
| create-voice | [redongreen/uSpec](https://github.com/redongreen/uSpec/tree/main/skills/create-voice) | MIT | Screen-reader spec method, with the repo's `references/screen-reader/` (VoiceOver, TalkBack, ARIA) |
| uSpec repo references (`references/structure`, `references/color`, `references/anatomy`) | [redongreen/uSpec](https://github.com/redongreen/uSpec/tree/main/references) | MIT | Structure tables, columns vs sections, density modes |
| figma-codegen | [awdr74100/figwright](https://github.com/awdr74100/figwright/tree/main/skills/figma-codegen) | MIT | Grounding, reuse, fidelity catalogue, assets, responsive, verify loop, mapping files, re-sync (design-to-code.md, handoff-specs.md) |
| token-sync-layer | [jrpease/throughline](https://github.com/jrpease/throughline/tree/main/skills/token-sync-layer) | MIT | Sync direction models, rename detection, PR-based sync |
| design-system-patterns | [wshobson/agents](https://github.com/wshobson/agents/tree/main/plugins/ui-design/skills/design-system-patterns) | MIT | Token tiers, theming, component architecture, governance and versioning |
| design-system | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/main/design/skills/design-system) | Apache-2.0 | Audit, document and extend modes; docs page template |
| design-handoff | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/main/design/skills/design-handoff) | Apache-2.0 | Hand-off principles, sections and template |
| penpot-uiux-design | [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main/skills/penpot-uiux-design) | MIT | Penpot MCP setup, ports and API gotchas (other-design-tools.md) |
| open-pencil | [open-pencil/skills](https://github.com/open-pencil/skills/tree/master/skills/open-pencil) | MIT | OpenPencil CLI and MCP usage (other-design-tools.md) |

Licence texts: each `scripts/<source-skill>/LICENSE` (MIT, Copyright (c) 2025 Southleft / Figma Console MCP Contributors). Apache-2.0 sources were distilled, not copied; no NOTICE file applies.

Not copied from uSpec: its Figma-rendering pipeline (template library, `firstrun`, `uspecs.config.json`, the Extract plugin and render scripts) and its other skills (`create-structure`, `create-property`, `create-motion`, `extract-*`). Install uSpec itself to render specs as Figma frames; component-specs.md says when.

## Also see (not included)

Link-only: their licences don't allow copying (Figma Developer Terms) or no licence was found. Nothing from them is copied or paraphrased here; the router only tells you when to load Figma's own skills.

| Skill | Link | Why not included |
|---|---|---|
| figma-use | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-use | Figma Developer Terms; install Figma's plugin |
| figma-design-to-code | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-design-to-code | Figma Developer Terms |
| figma-generate-design | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-generate-design | Figma Developer Terms |
| figma-generate-library | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-generate-library | Figma Developer Terms |
| figma-code-connect | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-code-connect | Figma Developer Terms |
| figma-create-new-file | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-create-new-file | Figma Developer Terms |
| figma-swiftui | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-swiftui | Figma Developer Terms |
| figma-generative-plugins | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-generative-plugins | Figma Developer Terms |
| figma-use-figjam | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-use-figjam | Figma Developer Terms |
| figma-use-slides | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-use-slides | Figma Developer Terms |
| figma-generate-diagram | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-generate-diagram | Figma Developer Terms |
| figma-shaders | https://github.com/figma/mcp-server-guide/tree/main/skills/figma-shaders | Figma Developer Terms |
| figma-implement-design (OpenAI curated) | https://github.com/openai/skills/tree/main/skills/.curated/figma-implement-design | Figma Developer Terms |
| figma-create-design-system-rules (OpenAI curated) | https://github.com/openai/skills/tree/main/skills/.curated/figma-create-design-system-rules | Figma Developer Terms |
| audit-design-system | https://github.com/edenspiekermann/Skills/tree/main/skills/audit-design-system | No licence found |
| fix-design-system-finding | https://github.com/edenspiekermann/Skills/tree/main/skills/fix-design-system-finding | No licence found |
| apply-design-system | https://github.com/edenspiekermann/Skills/tree/main/skills/apply-design-system | No licence found |
| cc-figma-tokens | https://github.com/nvillapiano/component-contracts-figma/tree/main/skills/cc-figma-tokens | No licence found |
| cc-figma-component | https://github.com/nvillapiano/component-contracts-figma/tree/main/skills/cc-figma-component | No licence found |
| sync-figma-token | https://github.com/firebenders/sync-figma-token-skill/tree/main/skills/sync-figma-token | No licence found |

Also worth reading: [penpot/penpot-ai-kit](https://github.com/penpot/penpot-ai-kit) (CC-BY-4.0, not distilled here).

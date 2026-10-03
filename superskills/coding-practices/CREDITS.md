# Credits

All sources are MIT. Reference files are distilled in our own words; scripts and templates are copied as-is with their source licence beside them (`LICENSE.source-repo`).

| Skill | Repo | License | What was used |
|---|---|---|---|
| systematic-debugging (+ root-cause-tracing, defense-in-depth, condition-based-waiting) | https://github.com/obra/superpowers | MIT | Root-cause phases, trace backward, defense in depth, 3-failed-fixes rule, condition polling; script `find-polluter.sh` (scripts/systematic-debugging/) |
| test-driven-development (+ writing-good-tests) | https://github.com/obra/superpowers | MIT | Red/green/refactor, verify-red, name-the-break, tautological tests, mock rules, rationalisations |
| requesting-code-review | https://github.com/obra/superpowers | MIT | When to request review, severity handling; template `code-reviewer.md` (templates/requesting-code-review/) |
| receiving-code-review | https://github.com/obra/superpowers | MIT | Response pattern, clarify-first, YAGNI check, pushback, no performative agreement |
| verification-before-completion | https://github.com/obra/superpowers | MIT | Gate function, claim/evidence table, red flags |
| using-git-worktrees | https://github.com/obra/superpowers | MIT | Isolation detection with submodule guard, native-tool-first, ignored directory check, baseline tests |
| finishing-a-development-branch | https://github.com/obra/superpowers | MIT | Three-option finish menu, typed discard confirmation, safe worktree cleanup |
| ponytail | https://github.com/DietrichGebert/ponytail | MIT | Laziness ladder and when-not-to-be-lazy list |
| tdd | https://github.com/mattpocock/skills | MIT | Vertical slices, seams agreed up front, interface design for testability |
| diagnosing-bugs | https://github.com/mattpocock/skills | MIT | Feedback-loop catalogue, falsifiable ranked hypotheses, tagged debug logs; template `hitl-loop.template.sh` (templates/diagnosing-bugs/) |
| code-review | https://github.com/mattpocock/skills | MIT | Spec vs standards two-axis review, smell baseline |
| codebase-design | https://github.com/mattpocock/skills | MIT | Depth/seam/adapter vocabulary, deletion test, dependency categories, design it twice |
| domain-modeling | https://github.com/mattpocock/skills | MIT | Glossary format, ADR criteria and format |
| improve-codebase-architecture | https://github.com/mattpocock/skills | MIT | Hot-spot exploration, candidate cards |
| git-guardrails-claude-code | https://github.com/mattpocock/skills | MIT | Guardrail hook setup; script `block-dangerous-git.sh` (scripts/git-guardrails-claude-code/) |
| setup-pre-commit | https://github.com/mattpocock/skills | MIT | Husky + lint-staged + Prettier setup steps |
| karpathy-guidelines | https://github.com/forrestchang/andrej-karpathy-skills | MIT (declared; no LICENSE file in the skill folder, so no files copied) | Think before coding, simplicity first, surgical changes, goal-driven execution |
| coding-standards | https://github.com/affaan-m/everything-claude-code | MIT | Naming, immutability, error handling, async parallelism |
| review | https://github.com/garrytan/gstack | MIT | Critical review categories (SQL/data safety, races, LLM trust boundary, shell injection, enum completeness), fix-first heuristic (checklist ideas only) |
| code-review-and-quality | https://github.com/addyosmani/agent-skills | MIT | Five review axes, severity labels, change sizing, review order |
| code-simplification | https://github.com/addyosmani/agent-skills | MIT | Chesterton's fence, simplification pattern table, Rule of 500 |
| git-workflow-and-versioning | https://github.com/addyosmani/agent-skills | MIT | Trunk-based development, atomic commits, branch naming, save-point pattern, change summaries, releases |
| code-review-excellence | https://github.com/wshobson/agents | MIT | Feedback tone, specific actionable comments |
| vercel-react-best-practices | https://github.com/vercel-labs/agent-skills | MIT | The 8 prioritised performance categories and rules |
| refactor | https://github.com/github/awesome-copilot | MIT | Safe refactoring steps and common moves |
| unlazy | https://github.com/Leonxlnx/unlazy | MIT | Acceptance gates before work (ideas only, no scripts) |

## Also see (not included)

- no-mistakes: a full validation pipeline (review, tests, lint, push, PR, CI) that needs its own CLI installed: https://github.com/kunchenguid/no-mistakes
- install-anti-slop: installs vendored Oxlint plugins for JS/TS projects: https://github.com/dmmulroy/anti-slop
- archify: architecture diagrams as standalone HTML/SVG (about 10 MB of assets, too big to bundle): https://github.com/tt-a1i/archify
- vercel-react-best-practices full rule files with code examples (`rules/*.md`, `AGENTS.md`): https://github.com/vercel-labs/agent-skills
- gstack review, the full skill (depends on gstack binaries and includes a telemetry step, which we left out): https://github.com/garrytan/gstack

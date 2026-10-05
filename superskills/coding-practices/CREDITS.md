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

## Tool docs

Official documentation, used as link-only reference and written in our own words (no text or files copied).

| Tool | Docs | Used in |
|---|---|---|
| Sentry | https://mcp.sentry.dev/ , https://github.com/getsentry/sentry-mcp , https://docs.sentry.io/api/organizations/resolve-a-short-id/ , https://docs.sentry.io/api/events/retrieve-an-issue-event/ , https://docs.sentry.io/product/issues/issue-details/ , https://docs.sentry.io/platforms/javascript/sourcemaps/ , https://docs.sentry.io/product/releases/associate-commits/ , https://docs.sentry.io/product/issues/states-triage/ | debugging.md |
| Chrome DevTools MCP | https://github.com/ChromeDevTools/chrome-devtools-mcp (README, docs/tool-reference.md, docs/configuration.md, docs/client-configurations.md) | debugging.md |
| ESLint | https://eslint.org/docs/latest/use/getting-started , https://eslint.org/docs/latest/use/command-line-interface , https://eslint.org/docs/latest/use/mcp | verification.md |
| Prettier | https://prettier.io/docs/cli | verification.md |
| Biome | https://biomejs.dev/guides/getting-started/ | verification.md |
| Ruff | https://docs.astral.sh/ruff/linter/ , https://docs.astral.sh/ruff/formatter/ , https://docs.astral.sh/ruff/configuration/ , https://docs.astral.sh/ruff/installation/ , https://docs.astral.sh/ruff/integrations/ , https://docs.astral.sh/ruff/settings/ | verification.md, git-workflow.md |
| pytest | https://docs.pytest.org/en/stable/how-to/usage.html , https://docs.pytest.org/en/stable/how-to/cache.html , https://docs.pytest.org/en/stable/reference/exit-codes.html | tdd-and-testing.md |
| CodeRabbit | https://docs.coderabbit.ai/cli , https://docs.coderabbit.ai/cli/claude-code-integration , https://docs.coderabbit.ai/guides/commands | code-review.md |
| GitHub Copilot code review | https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review | code-review.md |

## Also see (not included)

- no-mistakes: a full validation pipeline (review, tests, lint, push, PR, CI) that needs its own CLI installed: https://github.com/kunchenguid/no-mistakes
- install-anti-slop: installs vendored Oxlint plugins for JS/TS projects: https://github.com/dmmulroy/anti-slop
- archify: architecture diagrams as standalone HTML/SVG (about 10 MB of assets, too big to bundle): https://github.com/tt-a1i/archify
- vercel-react-best-practices full rule files with code examples (`rules/*.md`, `AGENTS.md`): https://github.com/vercel-labs/agent-skills
- gstack review, the full skill (depends on gstack binaries and includes a telemetry step, which we left out): https://github.com/garrytan/gstack

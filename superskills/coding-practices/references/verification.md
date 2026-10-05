> Distilled from: verification-before-completion (obra/superpowers, MIT), karpathy-guidelines (forrestchang/andrej-karpathy-skills, MIT), unlazy (Leonxlnx/unlazy, MIT), test-driven-development (obra/superpowers, MIT)

# Verification before claiming done

**No completion claim without fresh evidence.** If you haven't run the command that proves it in this turn, you can't say it passes. "Should work", "looks correct" and "I'm confident" are not evidence.

## 1. Turn the task into checks before starting

Restate vague tasks as verifiable goals:

| Request | Verifiable goal |
|---|---|
| "Add validation" | Tests for invalid inputs exist and pass |
| "Fix the bug" | A test reproduces it (red), then passes (green) |
| "Refactor X" | Same tests pass before and after; no test edited |
| "Make it faster" | Benchmark shows the number before and after |

For multi-step work, write the plan with a check per step:
```
1. Add schema -> verify: pnpm test tests/schema.test.ts passes
2. Wire endpoint -> verify: curl -s localhost:3000/api/x | jq .ok == true
3. Update UI -> verify: Playwright test export.spec.ts passes
```
Strong criteria let you loop alone; weak ones ("make it work") need constant check-ins.

### Gates for big or easily half-done tasks
Write a small gates file before starting: one observable outcome per gate, with the command and the expected output.
```
G1 export handles 10k rows      CHECK: pnpm test perf.test.ts      EXPECT: 1 passed
G2 no TODO left in src/export   CHECK: ! grep -rn TODO src/export   EXPECT: exit 0
```
- A gate must be able to fail. Prove a "nothing found" check against a known-positive case first.
- Don't copy a number someone gave you into EXPECT as its own proof; measure it.
- An impossible gate is marked abandoned with a reason and reported as a handoff, never silently deleted.
- Before reporting, reread the original request and make sure every requested outcome has a gate or an explicit handoff.

## 2. The gate function (every claim)

1. **Identify** the command that proves the claim.
2. **Run** it in full, fresh (not a previous run, not a subset).
3. **Read** the whole output: exit code, failure count, warnings.
4. **Compare**: does it actually confirm the claim?
5. **Then** state the claim with the evidence ("34/34 tests pass, exit 0"), or state the real status with the evidence.

| Claim | Requires | Not enough |
|---|---|---|
| Tests pass | Suite output, 0 failures | Last run, "should pass" |
| Linter clean | Linter output, 0 errors | Partial check |
| Build succeeds | Build exit 0 | Lint passing |
| Types OK | `tsc --noEmit` / mypy output | Editor shows no red |
| Bug fixed | Original symptom re-tested | Code changed |
| Regression test works | Seen red without fix, green with | Passes once |
| UI works | Exercised in a browser (or Playwright) | Unit tests |
| Agent/subagent finished | `git diff` reviewed, tests rerun | Its success message |
| Requirements met | Line-by-line checklist against the request | Tests passing |

## Lint, format and typecheck gates

Run the project's own gates the way CI runs them (its `lint`, `format:check`, `typecheck` scripts or Makefile targets first). Read the exit code: most of these tools use `2` for "the tool itself failed", which means the gate never ran, not that it passed or failed.

**Pick a tool**

| Situation | Use | Why |
|---|---|---|
| The project already has a config (`eslint.config.*`, `biome.json`, `.prettierrc`, `[tool.ruff]`) or a lint script | That one, through the project's script | Matches CI. Never add a second linter beside it |
| JS/TS, nothing set up, user asks for linting | ESLint, with Prettier for formatting | The standard pair; Prettier is already in the pre-commit recipe (git-workflow.md) |
| JS/TS, user wants one fast tool for lint and format | Biome | One binary and one `biome.json`; migrating off ESLint is the user's call |
| Python | Ruff for lint and format | One tool, a drop-in replacement for Black's formatting |
| Types | `npx tsc --noEmit`; mypy or the project's checker in Python | Lint passing says nothing about types |
| Project has none of these | Ask before adding one | A new linter is a change of its own, with its own commit |

All of them are free, local CLIs with no account.

### ESLint (JS/TS)

- Setup, only when asked: `npm init @eslint/config@latest` writes `eslint.config.js` or `eslint.config.mjs` (flat config). Needs Node `^20.19.0`, `^22.13.0` or `>=24`.
- Gate: `npx eslint .` (or named files). Exit `0` clean, `1` errors or too many warnings, `2` config or internal error.
- `--max-warnings 0` makes warnings fail the gate; `--quiet` reports errors only; `--format json` gives parseable output.
- Fixing: preview with `--fix-dry-run --format json`, then `--fix` writes to disk. Review the diff and commit fixes on their own.
- `--cache` (stored in `.eslintcache`) only rechecks changed files and doesn't track dependencies, so type-aware rules can report stale results: leave it off for the final gate.
- Official MCP server: `npx @eslint/mcp@latest` (its docs give configs for VS Code, Cursor and Windsurf). The CLI above is enough for Claude Code.

### Prettier and Biome (JS/TS formatting)

- Prettier gate: `npx prettier . --check` (exit `0` formatted, `1` something isn't, `2` Prettier failed); fix with `--write`.
- Biome: `npm i -D -E @biomejs/biome` (`-E` pins the exact version), `npx biome init` creates `biome.json`; gate `npx biome check`, fix `npx biome check --write`. What `--write` leaves behind needs a manual fix.

### Ruff (Python)

- Install into the project: `uv add --dev ruff` or `pip install ruff`; one-off without installing: `uvx ruff@latest check`. Skip the pipe-to-shell installer.
- Config: `[tool.ruff]` in `pyproject.toml`, or `ruff.toml` / `.ruff.toml`. Choose rules under `[tool.ruff.lint]` with `select`, `extend-select` and `ignore`. Default line length is 88.
- Gates: `ruff check` (exit `0` clean, `1` violations, `2` abnormal end) and `ruff format --check` (non-zero when files would change).
- Fixing: `ruff check --fix` applies safe fixes only. `--unsafe-fixes` can change runtime behaviour or drop comments: use it only with tests green and the diff read. `--diff` shows fixes without writing; `--statistics` counts violations per rule; `--output-format json` (also `github`, `gitlab`, `junit`, `sarif`) for tooling.
- The formatter doesn't sort imports: run `ruff check --select I --fix`, then `ruff format`.
- Some lint rules fight the formatter (quote rules `Q000`-`Q004`, `W191`, `E111`, `E114`, `E117`, `COM812`, `COM819`): Ruff's docs advise ignoring them when you use `ruff format`.
- Silencing one finding: `# noqa: F841` on that line. Every suppression goes in your report.

## 3. Report honestly

- Lead with the outcome. If something failed, show the output.
- Skipped a step (no test suite, couldn't run the app)? Say so plainly.
- A failure you didn't cause still gets named.
- Don't hedge on work that is genuinely done and verified.
- Summarise the change: files changed and why; things intentionally not touched; concerns or follow-ups.

## 4. Before commit, push, PR or "done"

- [ ] Reread the original request (or plan/notes file); every item done or explicitly handed off
- [ ] Full test suite run fresh, green, output clean
- [ ] Lint + typecheck + build run fresh (whatever the project has)
- [ ] Changed behaviour exercised for real (CLI run, curl, browser) where tests don't cover it
- [ ] Debug logs, temp files, throwaway harnesses removed
- [ ] Diff reviewed: every changed line traces to the request

## Red flags

- Words like "should", "probably", "seems to" next to a status.
- Saying "Done!", "Perfect!", "Great!" before running anything.
- About to commit or open a PR without a fresh run.
- Trusting a subagent's or tool's success report.
- "Linter passed, so it builds."
- "Just this once" / "I'm tired".

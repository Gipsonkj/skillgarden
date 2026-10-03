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

# Flaky tests: classify, find the root cause, prove the fix in CI

> Distilled from: fix-flaky-tests (intercom/2x-skills, MIT), playwright-best-practices (currents-dev/playwright-best-practices-skill, MIT), e2e-testing (affaan-m/everything-claude-code, MIT), playwright-expert (jeffallan/claude-skills, MIT)

A flaky test passes and fails on the same code. It is a bug, either in the test or in the product, and the fix must address the cause.

## Hard rules

- **Never skip, delete or loosen a test as the fix** (`.skip`, `xit`, `t.Skip`, `@pytest.mark.skip`, raising timeouts, adding retries). Quarantining is allowed only as a tracked, temporary measure: a linked issue, a named owner and a date. It is never the fix.
- **Never invent a root cause.** If you can't identify it with high confidence, say what you found and stop. A confident wrong diagnosis ships an inert fix and closes the issue.
- **Get the real failure first.** The exception message and stack trace from the failing CI run, fetched from CI logs or pasted by the user. Code reading alone produces plausible but wrong stories. If the error can't be obtained, ask the user for it; if no one can be asked, stop and say why.
- **Assume infrastructure only with build-wide evidence**: many unrelated tests failing in one run. A single failing test is almost always a test or product bug.
- **CI green is the only proof.** One source forbids running tests locally at all. That goes too far for most projects: running the test locally in a loop (`--repeat-each=50`, `pytest --count`, `go test -count=100 -race`) is a fine way to reproduce timing and ordering flakes. But a local pass never verifies a fix, because CI's services, ordering and timing differ. The fix is done when the PR build is green.

## Cheap checks first (no deep investigation)

1. **Already fixed?** `git log --oneline --since=<issue date> -- <test file> <source file>`, `gh pr list --search "<test file>" --state merged`. If a fix landed, report it. If new flakes in the same file appeared after it, the fix was partial.
2. **Open PR already?** `gh pr list --search "<test file>" --state open`: review it instead of starting again.
3. **Broken, not flaky?** All tests in the file fail on every run since a specific commit: that's a regression. Find the commit.
4. **Recurring?** Three or more issues for the same file means a shared vulnerability: read all prior fix PRs and fix it systemically.
5. **Bot skip?** If automation skipped the test, revert the skip in the same PR that fixes the root cause.

## Classify

| Category | Signals | Fix direction |
|---|---|---|
| Actually broken | Fails every run, any order, since a commit | Fix the regression or update setup |
| Global state poisoning | Passes alone, fails in the suite; depends on order or seed; a sibling mutates a singleton, env var, module variable or class attribute | Restore state in the poisoner's teardown; explicit setup in the victim |
| Ordering dependency | Shared DB rows or fixtures leak between tests; suite-level setup with side effects | Per-test setup, transactions rolled back, unique data |
| Timing / race | Wall-clock assertions, fixed sleeps, async without synchronisation, animations | Freeze the clock, wait on conditions (web-first assertions, events), disable animations in tests |
| Identifier collision | "Wrong record found"; IDs from second-precision timestamps or small random ranges | UUIDs or worker-index suffixes |
| Shared-singleton collision | Parallel tests write the same hard-coded key in a cache/registry | Unique keys per test, per-worker resources |
| Non-deterministic order | `result[0]` assertions on unordered queries | Assert on membership or sort explicitly |
| Cache TTL expiry | Short TTL in tests; CI is slower between write and read | Longer TTL in tests or an in-memory cache |
| Thread/process boundary | Test sets state on one thread; app (browser server, worker) reads it on another | Set state through the app's real boundary (API, DB), not thread-locals |
| Background work race | A spawned job touches the DB after the test's transaction ends | Stub the spawn point or wait for the job explicitly |
| External service | Network timeouts or third-party errors only in CI | Mock the boundary in CI; real calls in a nightly job |
| Resource exhaustion / infra | OOM, pool exhaustion, browser crash; many unrelated failures in one build | Infrastructure ticket, no test change |

**E2E-specific signals** (Playwright, Cypress): element not found or click missed (missing wait, animation, re-render); passes with 1 worker but fails with many (shared accounts or data); only in CI (cold start, slower CPU, headless rendering).

Quick heuristics: passes on retry in the same build -> test-side state, order or timing. Every test in a file fails every time -> broken by a change, not flaky.

## Investigate

1. State the detected stack in one line: test framework, CI provider, parallelism model.
2. Read the failing run's error, stack trace and the list of tests that ran before it on the same worker/shard (the likely poisoner is among them).
3. Read the test and the production code it exercises. Look for the pattern from the table.
4. For E2E, open the trace (Playwright `show-trace`, Cypress screenshots/videos) at the failing step: DOM snapshot, network, console.
5. Reproduce where useful: repeat runs, a single worker (`--workers=1`) vs many, a fixed seed or order (`pytest -p no:randomly`, `--order`), CPU throttling, `CI=1` headless.

## Fix

- Fix at the source, not per test. Before writing, grep the suite for the same unsafe pattern; if several tests share it, fix the shared helper or the product code.
- Same-file sweep first: most recurring flakes share a vulnerability with sibling tests in that file. Fix every instance before opening the PR.
- Defence in depth: fix the poisoner and also give the victim explicit setup.
- E2E fixes: replace sleeps with web-first assertions or waits for a specific response; use role-based locators scoped to a region; unique test data per worker; reset storage between tests; mock third-party calls.
- If the product itself is racy (double submit, stale read after write), fix the product and say so: the test was right.

## Verify

- Open a PR; CI must be green. Iterate on the branch until it is.
- For flakes that fail rarely, measure: run the job N times on a baseline branch (no fix) and on the fix branch, excluding infra noise (browser crash, datastore down). At a ~10% failure rate, N = 10 is a start, 20+ is clearer. If the rates are indistinguishable, the fix isn't addressing the cause.
- Use separate branches for baseline and experiment when the CI cancels superseded builds.
- If CI fails on an unrelated test, don't modify that test in your PR; report it separately.

## Report

```
Test: <file::name>    Stack: <framework> / <CI> / <workers>
Evidence: <error + key stack lines, CI link>
Category: <from table>    Confidence: high | medium | low
Root cause: <one paragraph, with file:line>
Fix: <what changed and why it removes the cause>; siblings fixed: <n>
Verification: <CI run links, pass rates baseline vs fix>
```

Medium or low confidence means no code change: report the evidence and the next step to gather it.

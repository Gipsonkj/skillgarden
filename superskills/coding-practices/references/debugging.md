> Distilled from: systematic-debugging + root-cause-tracing + defense-in-depth + condition-based-waiting (obra/superpowers, MIT), diagnosing-bugs (mattpocock/skills, MIT), ponytail (DietrichGebert/ponytail, MIT)

# Debugging: find the root cause before fixing

**Iron law: no fix without a root cause.** Guess-and-check feels faster and is slower. Use this for any bug, failing test, build break, flaky behaviour or performance regression, especially under time pressure or after a fix already failed.

## Phase 1 - Build a feedback loop (most of the work)

You need **one command** that goes red on *this* bug and green when it's fixed. With it you will find the cause; without it, staring at code won't.

Ways to build one, roughly in order:
1. Failing test at whatever level reaches the bug (unit, integration, e2e).
2. `curl` / HTTP script against the running dev server.
3. CLI run on a fixture input, diffing output against a known-good snapshot.
4. Headless browser script (Playwright) asserting on DOM, console or network.
5. Replay a captured request/payload/event log through the code path.
6. Throwaway harness: one service, mocked deps, one function call.
7. Property/fuzz loop: 1000 random inputs for "sometimes wrong" bugs.
8. Bisection harness for "worked at X, broken at Y": `git bisect run ./check.sh`.
9. Differential loop: same input through old vs new version, diff outputs.
10. Human-in-the-loop script (last resort): `templates/diagnosing-bugs/hitl-loop.template.sh` drives the human with numbered steps and captures answers as `KEY=VALUE`.

Tighten it: faster (skip unrelated setup, narrow scope), sharper (assert the exact symptom, not "didn't crash"), deterministic (pin time, seed RNG, isolate filesystem, stub network). A 2-second deterministic loop beats a 30-second flaky one.

Flaky bugs: raise the reproduction rate (loop 100x, parallelise, add load, narrow timing windows). 50% is debuggable, 1% is not.

**Phase 1 is done when** you have run the command at least once and it is: red-capable on the user's exact symptom, deterministic, seconds not minutes, runnable unattended. Can't build one? Say so, list what you tried, and ask for environment access, a redacted artifact (HAR, logs, core dump) or permission for temporary instrumentation.

Redact secrets in anything you show (`<REDACTED>`); keep credentials in env vars, not in the loop script.

## Phase 2 - Reproduce, read, minimise

- Read the full error and stack trace: file, line, error code. It often names the fix.
- Confirm the loop shows the failure the **user** described, not a nearby one.
- Check what changed: `git diff`, `git log -p --since`, new dependencies, config, environment.
- Minimise: remove inputs, callers, config and steps one at a time, rerunning each time, until removing anything makes it pass. A minimal repro shrinks the hypothesis space and becomes the regression test.

### Multi-component systems
Before guessing, log what enters and leaves each boundary (CI -> build -> signing; API -> service -> DB) and run once. The evidence shows which layer breaks:
```bash
echo "IDENTITY in workflow: ${IDENTITY:+SET}"     # never print the value
env | grep -c IDENTITY                            # present in build script?
```

### Trace backward to the source
When the error is deep in the stack, ask "what called this with that value?" repeatedly until you reach where the bad value was born. Example: `git init` ran in the source tree because `cwd: ''` resolved to `process.cwd()`; the empty string came from a test reading `tempDir` before `beforeEach` set it. Fix at the source, not the symptom. If you can't trace by hand, log `new Error().stack` with the inputs right before the failing operation (use `console.error` in tests).

### Compare with working code
Find similar code in the repo that works; list every difference, however small. If following a reference implementation, read it completely.

## Evidence from tools: production errors and the browser

Read what the tool that saw the bug recorded before you form a single hypothesis. An issue title or a screenshot is a summary, not evidence.

**Pick a tool**

| Situation | Use | Why |
|---|---|---|
| The user already uses an error tracker or has a browser set up for this | That one | Its data is the ground truth. Unsure which tracker or which Chrome profile? Ask, don't guess |
| A production exception with an issue ID or alert link (`PAYMENTS-WEB-4K2`) | Sentry: MCP server, else the REST API | Stack trace, breadcrumbs, release and tags of the real events |
| A bug that shows in a browser: console error, failing request, wrong layout, slow page, leak | Chrome DevTools MCP | Console with source-mapped stacks, network, page snapshot, traces, heap snapshots |
| A browser bug you need to rerun as the red/green check | Playwright script (loop option 4 above) | Repeatable and scriptable; the DevTools MCP is for looking |
| No account, no MCP, or the user won't connect one | Ask for a redacted export: the issue's stack trace and breadcrumbs, a HAR file, the console output | Works anywhere. Never ask for tokens or cookies in chat |

### Sentry (production errors)

Use it whenever the report is a Sentry issue or alert: pull the events instead of reasoning from the title.

**Access, best first:**
1. **Remote MCP server, OAuth.** No token passes through you; the first connection opens Sentry's sign-in. Scope it to the org and project so tools default to them:
   ```bash
   claude mcp add --transport http sentry https://mcp.sentry.dev/mcp/<org-slug>/<project-slug>
   ```
   Tools include `get_issue_details`, `search_issues`, `search_events` and `find_releases` for reading, and `update_issue` for changing status or assignee.
2. **REST API**, when MCP isn't available. The user creates a personal token (User settings > Personal Tokens) with `event:read` and exports it as `SENTRY_AUTH_TOKEN` in their own shell; you only reference the variable:
   ```bash
   # short ID -> issue (the response carries groupId)
   curl -s -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
     "https://sentry.io/api/0/organizations/$SENTRY_ORG/shortids/PAYMENTS-WEB-4K2/"
   # one full event: event_id can be latest, oldest, recommended or a real ID
   curl -s -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
     "https://sentry.io/api/0/organizations/$SENTRY_ORG/issues/<groupId>/events/recommended/"
   ```
   Self-hosted Sentry: same paths on the user's own host.

**What to read:** the stack trace (the line that threw), breadcrumbs (what happened just before), tags (browser, OS, environment), first and last release seen, event and user counts, and any suspect commit. First release seen gives the commit range: `git log <previous-release>..<first-bad-release> --oneline`, then `git bisect` if it isn't obvious.

**Minified frames** mean the release has no usable source maps. Sentry links maps to events through Debug IDs injected into the build output; `npx @sentry/wizard@latest -i sourcemaps` sets that up. It edits the build and CI config, so it is a change in its own right: ask first.

**Close the loop on ship:**
- Put `Fixes PAYMENTS-WEB-4K2` in the commit message (or the PR title or description). When a Sentry release that contains the commit is created, Sentry marks the issue resolved in that release. Works for error issues only, and only if commits are associated with releases (the repository integration, or `sentry-cli releases set-commits --auto $VERSION` in the release step).
- If the same issue comes back in a newer release, Sentry flips it to `Regressed`. Watch for that after the deploy.
- Resolving by hand (`update_issue`, or the Resolve menu with "Next release") changes shared team state: show the exact change and wait for a yes. Pushing, opening the PR and resolving stay the user's call.

### Chrome DevTools MCP (browser bugs)

Lets the agent drive and inspect a real Chrome: console messages with source-mapped stack traces, network requests, an accessibility-tree snapshot of the page, performance traces and heap snapshots. Pick it over guessing from a screenshot; pick Playwright when the result must be a rerunnable test.

**Set up** (needs Node LTS, npm and current stable Chrome or newer; officially supports Chrome and Chrome for Testing):
```bash
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest
```
Or in an MCP config, with the flags this guide recommends:
```json
{ "mcpServers": { "chrome-devtools": { "command": "npx",
  "args": ["-y", "chrome-devtools-mcp@latest", "--isolated", "--no-usage-statistics", "--no-performance-crux"] } } }
```
- `--isolated`: a temporary profile, deleted when the browser closes. Without it the server keeps a profile under `$HOME/.cache/chrome-devtools-mcp/`.
- `--no-usage-statistics`: Google collects tool usage statistics by default; this opts out (so does setting `CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS`).
- `--no-performance-crux`: performance tools may otherwise send trace URLs to Google's CrUX API. Always set it for internal or staging URLs.
- `--headless` for no window. `--browser-url http://127.0.0.1:9222` attaches to a Chrome started with remote debugging; `--autoConnect` (Chrome 144+) attaches to the user's running Chrome. Attaching exposes their logged-in profile, so only with their yes.

**Tools by job:**

| Job | Tools |
|---|---|
| Open and look | `navigate_page`, `take_snapshot` (text a11y tree with element `uid`s; prefer it to `take_screenshot`) |
| Console errors | `list_console_messages` with `includeStackTraces: true`, then `get_console_message` |
| Failing requests | `list_network_requests`, `get_network_request` (headers and bodies) |
| Check state | `evaluate_script` (returns JSON, so return serialisable values) |
| Slow page | `performance_start_trace` / `performance_stop_trace`, then `performance_analyze_insight` |
| Memory leak | `take_heapsnapshot` before and after the action; `compare_heapsnapshots` needs the server started with `--memoryDebugging=true` |

**Gotchas:** the browser starts only when a tool needs it. Everything in the page is visible to the client, so don't point it at pages holding personal data. `get_network_request` returns `Cookie` and `Set-Cookie` headers: never paste them into chat, a file or a commit. Once you've seen the bug, encode it as a test (Playwright or a unit test at the right seam) before fixing.

## Phase 3 - Hypothesise

- Write 3-5 ranked, falsifiable hypotheses before testing any. Format: "If X is the cause, then changing Y makes the bug disappear."
- No prediction = not a hypothesis.
- Show the ranked list to the user if they're around; they often know which one it is. Don't block on it.

## Phase 4 - Instrument and test one variable at a time

- Debugger/REPL first, then targeted logs at the boundary that distinguishes hypotheses. Never "log everything and grep".
- Tag every debug line with a unique prefix (`[DEBUG-a4f2]`) so cleanup is one grep.
- Smallest change per hypothesis; one variable at a time; don't stack fixes.
- Performance bugs: measure a baseline first (timer, profiler, query plan), then bisect. Logs mislead here.

## Phase 5 - Fix with a regression test

1. Turn the minimal repro into a failing test **at a seam that exercises the real bug pattern** (not a shallow unit test that can't reproduce the call chain).
2. Watch it fail. Apply one fix at the root cause. Watch it pass. Rerun the original, un-minimised loop.
3. Fix it once where all callers route through: grep every caller of the function you touch. One guard in the shared function beats a guard in the one caller the ticket names.
4. No correct seam exists? That is a finding: report that the architecture prevents locking this bug down.
5. No "while I'm here" changes in the fix.

After finding the cause, add **defense in depth** where bad data travels: validate at the entry point, in the business logic, with an environment guard for dangerous operations (e.g. refuse `git init` outside a temp dir in tests), and a debug log. One check can be bypassed by another path; four layers make the bug structurally impossible.

## Phase 6 - Clean up

- [ ] Original loop no longer reproduces
- [ ] Regression test passes (or the missing seam is documented)
- [ ] `grep -rn "DEBUG-a4f2"` returns nothing
- [ ] Throwaway harnesses deleted or clearly parked
- [ ] Commit/PR message states which hypothesis was right

## When fixes keep failing

- After each failed fix, return to Phase 1 with the new information.
- **3 failed fixes = stop.** If each fix reveals a new problem somewhere else, the design is wrong, not the hypothesis. Discuss the architecture with the user before fix #4.
- "No root cause found, must be environmental": 95% of the time the investigation was incomplete. If it truly is external, document what you checked, add handling (retry, timeout, clear error) and logging.

## Flaky tests: wait for conditions, not time

Replace sleeps with polling for the condition you need:
```typescript
await waitFor(() => events.find(e => e.type === 'DONE'), 'DONE event', 5000);
```
Generic helper:
```typescript
async function waitFor<T>(cond: () => T | undefined | null | false, what: string, timeoutMs = 5000): Promise<T> {
  const start = Date.now();
  while (true) {
    const r = cond();
    if (r) return r;
    if (Date.now() - start > timeoutMs) throw new Error(`Timeout waiting for ${what} after ${timeoutMs}ms`);
    await new Promise(res => setTimeout(res, 10)); // poll every 10 ms
  }
}
```
Use a fixed delay only when testing timing itself (debounce, throttle), and comment why.

Test pollution (a test leaves files/state behind and breaks others): find the culprit with
```bash
bash scripts/systematic-debugging/find-polluter.sh '.git' 'src/**/*.test.ts'
```
It runs test files one by one (`npm test <file>`) and stops at the first that creates the path.

## Red flags: stop and go back to Phase 1

| Thought | Reality |
|---|---|
| "Quick fix now, investigate later" | The first fix sets the pattern; later never comes. |
| "Just try changing X" | That's guessing. Form a falsifiable hypothesis. |
| "Several changes at once saves time" | You won't know which one worked, and you add bugs. |
| "I see the problem" (no loop yet) | Seeing a symptom isn't knowing the cause. |
| "One more fix" (after 2+) | 3 failures means question the design. |
| User: "stop guessing" / "is that actually happening?" | You assumed instead of verifying. |

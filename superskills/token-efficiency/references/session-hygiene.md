# Session hygiene in Claude Code and agent sessions

> Distilled from: strategic-compact and context-budget (affaan-m/ECC, MIT), chisle (JayPokale/Chisle, MIT), cavecrew (JuliusBrussee/caveman, Apache-2.0), efficient-fable (BuilderIO/skills, MIT), tare (kelviq/tare, MIT), context-optimization (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT)

Most tokens in an agentic session are not what you typed or what Claude wrote. They are the context re-sent on every turn: system prompt, tools, every file read and every command output so far. A cheap session is one where little goes into the window and nothing stays there longer than it is useful.

## 1. The one number to understand: amplification

Every later request re-sends everything already in context (mostly as cache reads, which are cheaper but still count toward cost and plan limits).

```
cost of a tool result ~= its tokens x number of requests that follow it
```

A 20K-token file read early in a 200-request session is about 4M tokens of cache reads; the same read near the end is about 200K (tare's worked figure). So:

1. What you read early is the most expensive thing you do. Read narrowly at the start.
2. A long session doing many unrelated things pays for old context on every turn. Split it.
3. Cache reads above ~80% of a session's tokens are normal for Claude Code; above ~85% for a whole week usually means sessions are living too long.

## 2. /clear, /compact or a fresh session

| Situation | Do | Why |
|---|---|---|
| Next task is unrelated to the current one | `/clear` (or a new session) | Nothing from the old task helps; all of it gets re-billed |
| Research done, plan written to a file | `/compact Focus on <next task>` | The plan file is the distilled output |
| Plan written, about to implement | `/compact` | Free room for code |
| Debugging finished, moving on | `/compact` or `/clear` | Debug traces pollute unrelated work |
| A failed approach was just abandoned | `/compact` | Drop the dead-end reasoning |
| Mid-implementation | Don't | You lose names, paths and partial state, then pay to re-read them |
| Implementation to testing | Maybe | Keep if the tests reference code you just touched |

Rules:
- **Write state to a file before compacting.** Goal, decisions, files changed, next step. Don't count on a harness todo list surviving: some Claude Code versions ship without the todo tools by default (strategic-compact notes this for 2.1.233+). Planning-file templates live in `claude-meta`.
- **Compact at 70-80% of the window, not at 95%.** A summary written under pressure drops goals and constraints. Auto-compaction fires wherever it fires; manual compaction picks the boundary.
- **Check the summary after compacting** against the current goal. It can carry stale assumptions forward.
- **A fresh session is not free.** Its first turn writes the whole prefix to the cache again (system prompt, tools, CLAUDE.md, skill list). Many short sessions in parallel cost far more than one session doing the same work. Prefer `/clear` inside a session for a new topic only when the old context is truly dead weight.
- **Idle gaps break the cache.** Coming back to a big session after the prompt cache expired (5 minutes by default on the API, check current docs) re-writes the whole context once. If you were away for an hour on a huge session and the next task is new, `/clear` is cheaper than resuming.

## 3. Read less into the window

The cheapest token is the one never read.

1. **Plan before reading.** Say which 2-4 files matter and why before opening any. A plan of reads beats exploring by `cat`.
2. **Search, then read a range.** `grep -n` for the symbol, then Read with offset and limit around the hit. Read a whole file only when the whole file is the task.
3. **Narrow commands at the source.** `git log --oneline -10`, `git diff --stat` before `git diff`, `ls dir` not `find .`, `| tail -50` on long logs.
4. **Builds, tests and installs: failures and the summary only.** Run the single failing test, not the suite, while iterating. `-q`, `--silent`, `--reporter=dot` or a `grep -E "FAIL|Error"` filter.
5. **Never re-read an unchanged file.** Its content is still in context. Never re-read a file you just wrote.
6. **Never skim what you are about to edit.** Saving tokens by editing blind costs a broken edit and a re-read.
7. **Big outputs go to a file.** Write the 5,000-line log to `/tmp/run.log` and grep it, rather than printing it into the conversation.
8. **Output-compressing wrappers** (for example RTK, which shortens `git`, test-runner and package-manager output) can cut command output a lot; install them from a package manager, not a `curl | sh` script, and keep their telemetry off.

## 4. Subagents that return compact results

A subagent works in its own window; only its final message enters yours. That is the saving, so the return format matters more than the subagent.

| Task | Where |
|---|---|
| "Where is X defined, what calls Y, list uses of Z" | Search subagent, returns `path:line - symbol - note` lines only |
| Surgical edit, 1-2 files, site already known | Subagent with exact `path:line`, returns `path:lines - change - verified` |
| Review a diff for bugs | Reviewer subagent, returns `path:line: severity: problem. fix.` |
| One-line answer you already know | Main thread, no subagent |
| 3+ file refactor, or work that needs the details to judge | Main thread |

Rules:
- **Ask for evidence, not prose:** files, line refs, commands run, diffs, failures, uncertainty, and which stop condition it hit. A prose report of 2K tokens versus a list of 700 is the whole difference across 20 delegations.
- **Write the brief as if it has no chat context:** repo path, exact objective, what is in and out of scope, the verification command, and when to stop and report instead of improvising.
- **Run search angles in parallel** (definitions, callers, tests) in one message, then merge in the main thread.
- **Put cheaper models on bulk work** (scans, inventories, log reduction, test runs, bounded edits) and keep the strongest model for decomposition, conflicts between reports and final review. See `model-and-effort.md`.
- **Treat reports as leads.** Before acting on a high-impact claim, open the cited lines yourself.
- **Subagents are not always cheaper.** Each one starts a new prefix with no cache shared with the parent, plus its own system prompt and tools. Below about 3 independent sub-tasks, coordination overhead often exceeds the saving. If subagents are more than ~40% of a week's usage, check that each one earned its spawn.

Writing the subagent definition files themselves: `claude-meta`.

## 5. Keep stale output from piling up

In your own agent loop (not Claude Code, which manages this for you):
- **Mask used-up tool output:** replace it with `[obs 12 elided: key finding X, full output at /tmp/obs12.txt]` after its key point is extracted. Never mask the latest turn or errors you are still debugging.
- **Mask before you compact:** removing low-value bulk first leaves less for the lossy summary.
- **Edit history in batches, near the end.** Any edit to earlier context invalidates the cache from that point; one big trim beats a trim every turn.

## 6. Pitfalls

- Compacting mid-task, then paying to re-read the same files.
- One week-long session for everything: every turn re-sends Monday's reads.
- `claude -p` in a loop or a CI job spawning hundreds of short sessions, each paying a full cache write. Users often forget this is "their" usage.
- Delegating a 5-file refactor to an "edit 1-2 files" subagent, which bounces it back.
- Printing whole logs, whole diffs and whole test suites "to be safe".

## Checklist

- [ ] Reads planned; grep then ranged reads; no re-reads of unchanged files
- [ ] Command output narrowed at the source; test output failures-only
- [ ] State written to a file before `/compact`; compacted at a phase boundary
- [ ] `/clear` between unrelated tasks; no resuming a huge idle session for new work
- [ ] Subagents get a self-contained brief and return `path:line` evidence

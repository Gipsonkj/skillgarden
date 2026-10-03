> Distilled from: agent-development (anthropics/claude-plugins-official, Apache-2.0), subagent-driven-development + executing-plans + requesting-code-review (obra/superpowers, MIT), context-optimization (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT), grilling (mattpocock/skills, MIT)

# Subagents: defining them and delegating to them

A subagent runs in its own fresh context. Use one to (a) keep bulky exploration or review out of your main context, (b) get an independent second pair of eyes, or (c) run independent work in parallel. Coordination costs tokens: for fewer than ~3 independent subtasks, doing it yourself is often cheaper.

## 1. Defining a reusable agent (`.claude/agents/<name>.md`)

```markdown
---
name: security-reviewer              # 3-50 chars, lowercase + hyphens, starts/ends alphanumeric
description: Use this agent when code touching auth, payments, file uploads or user input has changed and needs a security pass before merge. Typical triggers: a PR that edits login or session code, a new API endpoint taking user data, or the user asking "is this safe?". Not for style or performance review.
tools: Read, Grep, Glob               # least privilege; omit = all tools
model: inherit                        # or sonnet / opus / haiku
---

You are a security reviewer for web applications.

**Responsibilities**
1. Find injection, authz, secret-handling and data-exposure bugs in the given diff.
2. Rate each finding Critical / Important / Minor with file:line.

**Process**
1. Read the diff and the files it touches.
2. Trace user input from entry point to sink.
3. ...

**Output format**
- Findings table: severity | file:line | issue | fix
- Verdict: safe to merge? yes / no / with fixes

**Edge cases**
- No security-relevant change: say so in one line and stop.
```

Rules:
- The **description** decides when Claude dispatches the agent: triggering conditions, 2-4 concrete scenarios in prose, and when *not* to use it. 200-1000 characters is the sweet spot.
- Body is the agent's system prompt, written in second person ("You are..."), with responsibilities, step-by-step process, output format and edge cases. Keep it under ~10,000 characters.
- Restrict `tools` to what the job needs: read-only reviewers get `Read, Grep, Glob`.
- Prefer `model: inherit` unless the role clearly needs a cheaper or stronger model.
- Validate the file: `bash scripts/agent-development/validate-agent.sh .claude/agents/security-reviewer.md` (written for the plugin format; it also expects a `color` field, so ignore that warning for plain Claude Code agents).

## 2. Writing a dispatch prompt (one-off subagent)

The subagent sees only what you send. It has no chat history and no memory of your decisions.

A dispatch contains exactly:
1. One line on where this task fits in the project.
2. The task's requirements, ideally as a **file path** to read ("read this first, it's your requirements, use exact values verbatim"), not pasted text.
3. Interfaces and decisions from earlier work it cannot discover.
4. Your resolution of any ambiguity you noticed.
5. A report contract: where to write the full report, and the short status to return.

Keep out: your session history, summaries of previous tasks ("state after tasks 1-3"), instructions to pre-judge findings ("don't flag X"). One real dispatch reached 42k characters, 99% pasted history; that is waste that also stays in your context.

Report contract that works (from the implementer template in `templates/subagent-driven-development/implementer-prompt.md`):
- Full report written to a file.
- Reply under 15 lines: **Status** `DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT`, commits, one-line test summary, concerns, report path.

Handle the status:
- DONE: review it.
- DONE_WITH_CONCERNS: read concerns; correctness/scope concerns get fixed before review.
- NEEDS_CONTEXT: supply it, re-dispatch.
- BLOCKED: add context, or use a stronger model, or split the task, or fix the plan. Never resend the same prompt to the same model unchanged.

Workers do not spawn their own reviewers: review is your job, and a worker-spawned reviewer just duplicates it at full cost.

## 3. Executing a plan with subagents

Use when you have a written plan with mostly independent tasks (see `references/planning-and-execution.md`).

Per task:
1. Record `BASE=$(git rev-parse HEAD)`.
2. Dispatch one implementer with the task brief. **Never run two implementers in parallel on the same tree** (conflicts).
3. On DONE, produce one review file: `git log --oneline BASE..HEAD; git diff --stat BASE..HEAD; git diff -U10 BASE..HEAD > /tmp/review-task-N.diff`. Never use `HEAD~1` as base: it drops earlier commits of a multi-commit task.
4. Dispatch a fresh reviewer with the brief, the report and the diff file. It must return **both** a spec-compliance verdict and a quality verdict with Critical / Important / Minor findings.
5. Fix loop (max 5 rounds): rounds 1-3 resume the same implementer with the findings verbatim; rounds 4-5 a fresh implementer on a stronger model. Each round ends with a scoped re-review of only the fix diff.
6. Minor findings go in the ledger, not the loop. At the cap, rule on each open finding and record it.
7. Append `Task N: complete (commits a1b2c3d..e4f5g6h, review clean)` to the ledger.

After all tasks: one whole-branch review on the most capable model, then ONE fix dispatch with the full findings list (not one fixer per finding), one scoped re-review.

Small same-shape tasks (the same one-line change across 8 files): batch them into one dispatch and one review.

## 4. Model selection

| Role | Model |
|---|---|
| Mechanical task, 1-2 files, complete spec or code in the plan | Cheapest |
| Multi-file integration, debugging, prose-only spec | Standard (mid-tier floor for reviewers) |
| Architecture, design judgement, final whole-branch review | Most capable |
| Fix rounds 4-5 | One tier above the stuck implementer |

Always set the model explicitly when dispatching; an omitted model inherits the session's (often the most expensive). Turn count beats token price: the cheapest models often take 2-3x the turns on multi-step work.

## 5. Running in parallel

- Launch independent subagents in the same message so they run concurrently.
- Each needs its own file ownership; parallel writers to one file conflict.
- While waiting, keep doing local work; don't poll in short loops. If idle, check status every 5-10 minutes and chase any child that finished silently.
- Treat a subagent's "success" as a claim: check the diff and rerun the tests yourself before reporting it.

## 6. Research fan-out

For fact-finding (which files call X, what config exists), dispatch an explorer and keep only the conclusion. A question that needs the user's decision goes to the user; a question that needs a fact from the codebase goes to a subagent. Never ask the user something you can look up.

## 7. Requesting a code review

Fill `templates/subagent-driven-development/implementer-prompt.md` for implementers. For reviewers, give: what was built (1-2 lines), the requirements or plan path, BASE and HEAD SHAs, and ask for Strengths, Issues by severity with file:line, and a "Ready to merge? yes / no / with fixes" verdict. Reviewers stay read-only on the checkout (use `git show` / a temp worktree for other revisions).

## Common mistakes

| Mistake | Fix |
|---|---|
| Pasting the whole plan or chat into the prompt | Point at a brief file; include only interfaces and decisions |
| Controller fixes the code itself "to save a dispatch" | Resume the implementer; controller fixes skip review |
| Trusting "all tests pass" from the worker | Check `git diff` and run tests before claiming done |
| Asking "should I continue?" between tasks | Keep going; stop only for destructive, security-sensitive, shared-branch actions or a plan that leaves every path a guess |
| Silent deviations from the plan | Record `Ruling: <decision> - <why> - <cost if wrong>` and list all rulings in the final message |

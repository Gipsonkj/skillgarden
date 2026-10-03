> Distilled from: brainstorming + writing-plans + executing-plans (obra/superpowers, MIT), grilling + grill-me (mattpocock/skills, MIT), planning-with-files (OthmanAdi/planning-with-files, MIT), unlazy (Leonxlnx/unlazy, MIT)

# From idea to plan to finished work

Most agent failures on bigger tasks come from starting before the goal is shared, or from losing the plan halfway. This guide covers: sizing the request, interviewing, writing a spec and plan, and executing it without drift.

## 1. Classify the request first, out loud

| Path | Looks like | Process |
|---|---|---|
| **Spike** | "Can we...?", "is it possible", "quick and dirty" | 2-3 sentences: the question + what you'll try. Get a nod. Answer as cheaply as correctness allows. Anything built is labelled throwaway. |
| **Bounded** | A well-scoped change to a flow that already exists in this repo (new flag, small endpoint, one-file fix) | A few clarifying questions, a short design in chat (approach, files, tests), **stop for a yes**, then implement. No spec file. |
| **Architectural** | New project or subsystem, changed interfaces others depend on, restructuring | Questions, 2-3 approaches, sectioned design, written spec, written plan, then execute. |

- Say the classification so the user can override: "This looks bounded, so I'll sketch the design here rather than write a spec."
- In doubt, take the heavier path. Hidden complexity mid-task upgrades the path; nothing downgrades.
- "Bounded" measures the repo, not your familiarity: a brand-new todo app has no existing flow, so it is architectural.
- Each approval covers only the stage shown. Approving an idea is not approving a plan that doesn't exist yet.
- Read-only exploration is always allowed before approval.

## 2. Understand intent

1. Find the intended outcome, who it's for, and what success looks like. If missing, ask **one** focused question about purpose first.
2. Write back a short understanding: outcome, constraints, success criteria, with what the user said kept separate from your assumptions. Invite correction.
3. Scope check: if the request is several independent subsystems ("chat, billing, analytics and storage"), say so immediately and split it into sub-projects, each with its own spec, plan and build.

### Interview style
- **Brainstorm mode:** one question per message, multiple choice when possible.
- **Grill mode** (user says "grill me" or wants a plan stress-tested): map decisions as a tree. Each round, ask every question whose prerequisites are settled (the *frontier*), numbered, each with your recommended answer:

```
Q1 - Storage: Postgres or SQLite? You expect <1k users and one server.
-> Recommend SQLite: zero ops, file backups.

Q2 - Auth: magic link or password? ...
-> Recommend magic link.
```
  Wait for answers, recompute the frontier, repeat until it is empty. Done means every branch visited and nothing silently assumed.
- Facts are your job (look them up or send an explorer); decisions are the user's.

## 3. Propose approaches and design

- 2-3 approaches with trade-offs; lead with your recommendation and why. Cut unneeded features from all of them (YAGNI).
- Present the design in sections scaled to complexity (a few sentences to ~300 words each): architecture, components, data flow, error handling, testing. Check after each section.
- Design for isolation: units with one purpose, clear interfaces, testable alone. For each unit you can say what it does, how it's used, what it depends on. Smaller files are also easier for an agent to edit reliably.
- In existing code, follow existing patterns; include targeted cleanup only where it serves the goal.

## 4. Write the spec (architectural path)

Save to the project's spec location (default `docs/specs/YYYY-MM-DD-<topic>-design.md`). Self-review before showing it:
1. No "TBD", "TODO", vague requirements.
2. Sections don't contradict each other.
3. Small enough for one plan, or split.
4. Any requirement readable two ways? Pick one, write it down.

Then ask the user to review the file. Only an approved spec moves to planning.

## 5. Write the plan

Audience: a capable engineer who has never seen this codebase. Document what they can't know: which files, names, signatures, exact values from the spec, which tests prove each task.

Header:
```markdown
# <Feature> Implementation Plan
**Goal:** one sentence
**Architecture:** 2-3 sentences
**Tech stack:** ...
**Spec:** docs/specs/2026-10-03-export-design.md
## Global constraints   (version floors, naming rules, copy rules - exact values, one line each)
## Review focus         (the 5 inputs/failure modes most likely to bite a real user that no task's tests cover yet; add a test for each to its task)
```

Each task:
```markdown
### Task 3: CSV exporter
**Files:** Create `src/export/csv.ts`; Test `tests/export/csv.test.ts`
**Interfaces:** Consumes `Row[]` from Task 2. Produces `toCsv(rows: Row[]): string`.
- [ ] Write failing test `exports header then one line per row` (assert exact string)
- [ ] Run `pnpm test tests/export/csv.test.ts` -> expect FAIL "toCsv is not defined"
- [ ] Implement `toCsv` in `src/export/csv.ts`
- [ ] Run the test -> expect PASS
- [ ] Commit `feat: add CSV exporter`
```

Rules:
- A task = the smallest unit with its own test cycle that a reviewer could reject on its own. Fold setup and docs into the task that needs them.
- A step = one action with a checkable result, unambiguous but not a transcript. Give signatures and tests; write a function body only for an algorithm the test doesn't pin down.
- No step that decides nothing ("handle edge cases", "add validation as needed").
- Self-review: every spec requirement maps to a task; names and types match across tasks (`clearLayers()` vs `clearFullLayers()` is a bug); the plan isn't longer than the code it describes.
- Ask the user to review the plan and choose how to run it: subagent per task (most thorough) or inline (cheapest).

## 6. Gates: define "done" before starting

For substantial or easily half-finished work, write acceptance gates first (a `GATES.md` or a section in the plan): one observable outcome per gate, each with a command and the output that proves it.

```markdown
- G1 CSV export downloads for 10k rows in < 2 s
  CHECK: pnpm test tests/export/perf.test.ts
  EXPECT: 1 passed
- G2 No TODO/FIXME left in src/export
  CHECK: ! grep -rn "TODO\|FIXME" src/export
```
- Each gate must be able to fail. Test a "nothing found" check against a known positive first.
- Never quietly drop an impossible gate: mark it abandoned with a reason and report it as a handoff.
- Before reporting, reread the original request and confirm every requested outcome has a gate or an explicit handoff.

## 7. Execute

Inline (you implement):
- Keep a ledger file (`progress.md`) whose first line names the plan. Append `Task N: complete (commits a..b)` after each task. After compaction, trust the ledger and `git log`, not memory.
- Read each task's brief before starting it, even if you "remember" it.
- Follow test-first order; every command has an expected output; compare it.
- Output differs: code wrong -> debug the cause; plan wrong -> make the smallest change that satisfies the spec and record a ruling.
- Don't ask "should I continue?" between tasks. Stop only for: irreversible/destructive actions, security-sensitive actions, side effects outside the workspace (push, merge, publish), or a plan so broken every path is a guess.
- Record each judgement call: `Ruling: <what> - <why> - <cost if wrong>`. List all rulings in your final message.
- Finish with one fresh whole-branch review, one fix pass, then hand off for merge/PR.

With subagents: see `references/subagents-and-delegation.md`.

## 8. Work each piece in passes

1. Build the complete deliverable: no placeholders, no "rest left as exercise".
2. Reread it as a domain expert; replace the cheap parts.
3. Hunt correctness, integration, edge cases; fix.
4. Polish; repeat until a full pass finds nothing. Then check gates.

## Red flags

| Thought | Reality |
|---|---|
| "Too simple to need a design" | Bounded still gets a 2-sentence design and a yes. |
| "I'll start while they read the design" | The gate is the approval, not the design's length. |
| "The spike works, I'll keep the code" | Keeping it is a new request; classify it. |
| "Almost done, no need to re-classify" | Growth mid-task upgrades the path. Stop and say so. |
| "I remember task 4" | Read the brief; memory is a summary. |

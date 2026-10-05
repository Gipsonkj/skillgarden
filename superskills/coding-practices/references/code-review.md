> Distilled from: code-review-and-quality (addyosmani/agent-skills, MIT), code-review (mattpocock/skills, MIT), requesting-code-review (obra/superpowers, MIT), code-review-excellence (wshobson/agents, MIT), review checklist (garrytan/gstack, MIT), coding-standards (affaan-m/everything-claude-code, MIT)

# Reviewing code (yours, an agent's, or a PR)

**Approve when the change clearly improves code health and follows the project's conventions**, even if you'd have written it differently. Block for bugs, security, data loss, broken behaviour and real structural regressions, not for taste.

## 1. Set up

1. Pin the range: `git diff <base>...HEAD` (three dots = against the merge-base) and `git log <base>..HEAD --oneline`. Check the ref resolves and the diff isn't empty.
2. Find the spec: issue refs in commits (`#123`), a plan/spec file, or ask. No spec? Say so and review standards only.
3. Find the standards: `CLAUDE.md`, `CONTRIBUTING.md`, `CODING_STANDARDS.md`, lint config. Skip anything tooling already enforces.
4. Size check: ~100 changed lines is ideal, ~300 OK for one logical change, ~1000+ should be split (except pure deletions or automated refactors).
5. CI status: tests passing?

## 2. Review in this order

1. **Intent**: what is this trying to do, and does the approach fit the problem? Is there a simpler one?
2. **Tests first**: do they exist, test behaviour (not mocks), cover edge cases, and would they catch a regression? Check by experiment: flip one condition the change adds, run the suite, restore. Still green = a missing test.
3. **Implementation**, file by file, on five axes:

| Axis | Look for |
|---|---|
| Correctness | Matches spec; null/empty/boundary; error paths; off-by-one; races; state left inconsistent |
| Readability | Names say what things are; flat control flow; no clever tricks; could it be much shorter? dead code, no-op vars, compat shims |
| Architecture | Follows existing patterns; logic in its owning module; reuses the canonical helper; deps flow one way; refactor removes complexity rather than moving it |
| Security | Input validated at trust boundaries; parameterised SQL; output encoded (XSS); authz checked; no secrets in code/logs; external and LLM output treated as untrusted |
| Performance | N+1 queries; unbounded loops/fetches; missing pagination; sync I/O in async paths; big allocations in hot paths; needless re-renders |

### High-severity patterns worth a dedicated pass
- **SQL / data safety**: string-built SQL; check-then-write races that need an atomic `UPDATE ... WHERE status = ?` or a unique index; ORM calls that bypass validations.
- **Concurrency**: find-or-create without a unique constraint; read-check-write without retry on duplicate key.
- **New enum/status value**: read (don't just grep) every consumer that switches on, filters by or displays sibling values; check allowlists and `case` defaults.
- **LLM output**: validated before DB writes, emails, URL fetches (SSRF), or storage in a knowledge base.
- **Shell**: `subprocess` with `shell=True` + interpolation, `os.system`, `eval` on generated code.
- **Async**: blocking calls (`time.sleep`, sync HTTP/file I/O) inside async handlers.
- **Unsafe HTML**: `dangerouslySetInnerHTML`, `v-html`, `|safe` on user data.

### Code smells (judgement calls, repo standards override)
Mysterious name (rename) - duplicated code (extract) - feature envy (move the method to its data) - data clumps (bundle into a type) - primitive obsession (small domain type) - repeated switches (one map or polymorphism) - shotgun surgery (gather what changes together) - divergent change (split by reason to change) - speculative generality (delete) - message chains (hide the walk) - middle man (call the target) - refused bequest (composition).

## 3. Propose the fix, not just the problem

Name the restructuring: replace a conditional chain with a typed model or dispatcher; collapse duplicate branches; separate orchestration from business logic; move feature logic out of a shared module; reuse the existing helper; make a type boundary explicit; delete a pass-through wrapper; split a 1000+ line file before adding to it. Prefer remedies that remove moving pieces.

## 4. Write findings

Label each so the author knows what's required:

| Label | Meaning |
|---|---|
| **Critical** | Blocks merge: security hole, data loss, broken behaviour |
| (no label) / **Important** | Must fix before merge |
| **Nit** | Optional, minor |
| **Consider** | Suggestion worth thinking about |
| **FYI** | Context only |

Each finding: `file:line`, what's wrong, why it matters, how to fix. Specific and about the code ("this can race when two requests update the same order; use an atomic WHERE status = 'pending' update"), not the person, not "this is wrong".

Lead with what matters: one structural problem outranks ten nits. Acknowledge what was done well (accurate praise makes the rest credible). Don't review code you didn't read, don't say "looks good" without checking, don't mark nits Critical.

Don't flag: harmless redundancy that aids readability, "add a comment explaining this constant", tighter assertions when the current one covers the behaviour, consistency-only churn, things the diff already fixes.

## 5. Spec vs standards: report separately

Code can follow every standard and build the wrong thing, or do exactly what was asked and break conventions. Report two sections:
- **Spec**: requirements missing or partial; behaviour nobody asked for (scope creep); implemented but wrong. Quote the spec line.
- **Standards**: violations of documented rules (cite file + rule) and smells (labelled as judgement calls).
Don't merge or rerank across the two.

## 6. Verdict

```
### Strengths
- Clean migration with rollback (db/migrate/0042.sql)
### Issues
#### Critical
1. src/api/orders.ts:88 - status update is check-then-write; concurrent requests double-charge. Use UPDATE ... WHERE status='pending' and check rowCount.
#### Important
...
#### Minor
...
### Ready to merge? With fixes
Reasoning: core design is sound; the race must be fixed first.
```

## 7. Fix-first (when you're also the one fixing)

- Mechanical fixes a senior engineer would apply without discussion (dead code, unused vars, N+1 eager loading, stale comments, magic numbers): fix them and list as AUTO-FIXED.
- Anything reasonable people could disagree on (security design, race strategy, removing functionality, user-visible changes, fixes > 20 lines): batch into one question for the user.

## Requesting a review from a subagent

Use `templates/requesting-code-review/code-reviewer.md`: fill in what was built, the plan or requirements, BASE and HEAD SHAs. Give the reviewer context, never your session history. Review after each task in a multi-task plan, after major features, and before merging to main. The reviewer stays read-only on the checkout and lists anything it chose not to judge.

## AI review tools: CodeRabbit and Copilot

A second reviewer catches what the author misses. Its findings are input, not verdicts: check each one against the code (review-feedback.md) before acting.

**Pick a tool**

| Situation | Use | Why |
|---|---|---|
| The team already has an AI reviewer on its PRs | That one | Its config and learnings are already tuned to the repo |
| No account, or the code mustn't leave the machine | Reviewer subagent with the template above | Free, local, nothing to install |
| Local changes before a PR, user has a CodeRabbit account | CodeRabbit CLI or its Claude Code plugin | Reviews uncommitted or committed work against the base branch |
| PR on GitHub, team pays for Copilot | Copilot code review via `gh` | Built into the PR; no extra service |
| PR already has the CodeRabbit app installed | `@coderabbitai` comment commands | Re-review on demand |

CodeRabbit and Copilot are hosted services: if you don't know whether this code may be sent to them, ask.

### CodeRabbit

- **Install the CLI**: `brew install coderabbit` (skip the pipe-to-shell installer). `cr` is the short alias of `coderabbit`.
- **Auth**: the user runs `cr auth login` themselves; never take a key in chat.
- **Review**: `cr review` covers tracked changes (commits, staged files, unstaged edits to tracked files) against the base branch, `main` by default. Narrow it with `--committed` or `--uncommitted`; add `--include-untracked` for new files not yet added; `--base develop` for another base. `--agent` prints NDJSON, one JSON object per line, for parsing.
- **In Claude Code**: `claude plugin install coderabbit`, then `/coderabbit:coderabbit-review` (same flags). It checks the CLI and auth, runs the review and groups findings by severity; turn them into a task list and show the planned fixes before applying them.
- **Time**: a review takes 7 to 30+ minutes depending on the change size. Run it in the background and keep working.
- **Limits**: the free plan has limited daily usage; paid plans raise it, and usage-based billing can continue past the limit. Before reviews that would bill, ask.
- **On a PR** (CodeRabbit app installed): `@coderabbitai review` reviews only what changed since its last full review; `@coderabbitai full review` starts over; `@coderabbitai pause` / `resume` toggle automatic reviews; `@coderabbitai resolve` marks all its comments resolved. A PR comment is public to the team: show the exact comment and wait for a yes.

### GitHub Copilot code review

- Request it: `gh pr edit <number> --add-reviewer @copilot`, or `gh pr create --reviewer @copilot` with a new PR. Adding a reviewer shows on the PR, so it needs the user's go-ahead like any other PR action.
- By default it leaves a "Comment" review, so it doesn't count toward required approvals.
- It doesn't re-review new pushes unless automatic reviews are set up; re-request from the Reviewers menu.
- Repo-wide guidance for it lives in `.github/copilot-instructions.md`.
- Org members without a Copilot licence can get it when an enterprise admin or org owner turns it on.

---
name: coding-practices
description: Expert engineering-discipline guide for writing, fixing and shipping code. Use when debugging any bug, failing or flaky test, build break or regression; doing TDD, writing or judging tests and mocks; verifying work before saying done, committing or opening a PR; reviewing code, a diff or a PR, or requesting a review; acting on review feedback or bot comments; simplifying, refactoring or cleaning up code, or keeping a change minimal and surgical; designing modules, interfaces, seams, domain glossaries or ADRs, or finding architecture hot spots; git commits, branches, worktrees, pre-commit hooks, blocking dangerous git commands, or finishing a branch (merge, PR, keep); and React or Next.js performance (waterfalls, bundle size, re-renders). Also use when the user says "use coding-practices", "TDD this", "find the root cause", "review this", "is it done?", "keep it simple", or "make a worktree".
---

# Coding practices

The habits that make code changes correct, small and reviewable: find root causes before fixing, write the failing test first, prove completion with fresh evidence, review on substance, keep changes surgical and designs deep, and treat git as a safety net. This is a router. Name the task (or say "use coding-practices: <capability>") and read the matching guide below; each guide is self-contained.

## Core principles

1. **Think before coding.** State assumptions; if a request has several readings, list them instead of picking one silently; if something is unclear, stop and ask.
2. **No fix without a root cause.** Build a command that goes red on the bug first. Three failed fixes means question the design, not try a fourth.
3. **Red before green.** Write the test, watch it fail for the right reason, then write the least code that passes. Code written before its test gets redone from the test.
4. **Evidence before claims.** "Done", "fixed" and "passing" require a fresh run of the proving command in this turn, with its output read. Never trust a subagent's or tool's success message.
5. **Simplest thing that works.** Need it at all? Already in the codebase, stdlib, platform or an installed dependency? Only then write minimal new code. No speculative abstractions or options.
6. **But never lazy at boundaries.** Input validation, real error handling, security, accessibility, migrations and tests are not optional "complexity".
7. **Surgical changes.** Every changed line traces to the request. Match existing style; mention unrelated problems instead of fixing them; clean up only what your change orphaned.
8. **Behaviour and structure change separately.** Refactors keep behaviour identical and land in their own commits, with tests green before and after.
9. **Test behaviour at the seam.** Through public interfaces, with independently derived expected values; mock only at system boundaries; a mock earns no assertions.
10. **Deep modules, real seams.** Small interfaces hiding a lot. One adapter is a hypothetical seam, two is a real one; don't add ports until something actually varies.
11. **Review on substance, label severity.** Correctness, security and data safety first; taste last. Approve changes that improve code health even if you'd write them differently.
12. **Verify feedback before acting on it.** Reviewer and bot suggestions are checked against the code; unclear items are clarified before any are implemented; push back with evidence. The user's explicit decisions win.
13. **Git is the safety net.** Small atomic commits with why-messages, short-lived branches, baseline tests in a fresh worktree, tests rerun on the merged result.
14. **Destructive or outward actions need the user.** Push, open PRs, merge, force-delete branches or discard work only when the user says so.

*Conflicts resolved:* simplicity (5) never overrides boundary safety (6). TDD (3) is the default; skipping it for a throwaway prototype or config change is the user's call, not yours. Surgical scope (7) still allows a minimal refactor when it is the only way to make the requested change testable; say so and keep it in its own commit.

## Pick the right guide

| Task | Read |
|---|---|
| Bug, failing/flaky test, build break, perf regression, "it worked yesterday" | [references/debugging.md](references/debugging.md) |
| Feature or fix via TDD; writing, judging or fixing tests and mocks | [references/tdd-and-testing.md](references/tdd-and-testing.md) |
| About to say done, commit, push or open a PR; defining acceptance checks | [references/verification.md](references/verification.md) |
| Reviewing code, a diff, a PR or an agent's work; requesting a review | [references/code-review.md](references/code-review.md) |
| Responding to review comments, bot suggestions or reviewer subagents | [references/review-feedback.md](references/review-feedback.md) |
| Keeping a change minimal, simplifying, refactoring, naming and code standards | [references/simplicity-and-refactoring.md](references/simplicity-and-refactoring.md) |
| Designing modules and interfaces, seams, glossary, ADRs, architecture hot spots | [references/design-and-architecture.md](references/design-and-architecture.md) |
| Commits, branches, worktrees, pre-commit hooks, git guardrails, finishing a branch | [references/git-workflow.md](references/git-workflow.md) |
| React/Next.js performance: waterfalls, bundles, server, re-renders (Vercel) | [references/react-nextjs-performance.md](references/react-nextjs-performance.md) |

### Scripts and templates

| File | Use when |
|---|---|
| `scripts/systematic-debugging/find-polluter.sh` | A test leaves files or state behind and you need to find which one: `bash scripts/systematic-debugging/find-polluter.sh '.git' 'src/**/*.test.ts'` (runs `npm test <file>` per file) |
| `scripts/git-guardrails-claude-code/block-dangerous-git.sh` | User wants Claude Code blocked from `git push`, `reset --hard`, `clean -f`, `branch -D` and similar; install as a `PreToolUse` hook (see git-workflow.md) |
| `templates/diagnosing-bugs/hitl-loop.template.sh` | Last-resort feedback loop when a bug can only be reproduced by a human following steps |
| `templates/requesting-code-review/code-reviewer.md` | Dispatching a reviewer subagent: fill in what was built, requirements, BASE and HEAD SHAs |

## Default workflow

1. **Understand.** Restate the task as verifiable goals; list assumptions and open questions; read the relevant code, tests and recent history. Ask if it's ambiguous.
2. **Isolate if large.** Check for existing isolation; with the user's OK, work in a branch or worktree and run the baseline tests (git-workflow.md).
3. **Design if non-trivial.** Pick the seam and interface (design-and-architecture.md); prefer the simplest approach on the laziness ladder (simplicity-and-refactoring.md).
4. **Build test-first** in vertical slices: one failing test, minimal code, full suite, refactor, commit (tdd-and-testing.md). For a bug, build the feedback loop and find the root cause first (debugging.md).
5. **Self-review the diff** on correctness, security, readability, architecture and performance; for bigger changes, dispatch a reviewer with the template (code-review.md).
6. **Address feedback** item by item, verifying each (review-feedback.md).
7. **Verify** with fresh runs of tests, lint, typecheck and build, and exercise the behaviour for real (verification.md).
8. **Finish**: summarise changes, what you intentionally didn't touch and concerns; offer merge / PR / keep and wait for the user's choice (git-workflow.md).

## Done means

- [ ] Every requested outcome is met or explicitly handed off; nothing extra was added
- [ ] New behaviour and every bug fix have a test that was seen failing, then passing
- [ ] Full test suite, lint, typecheck and build were run fresh and are green (or failures are named)
- [ ] Bugs: root cause stated, regression test in place, debug instrumentation removed
- [ ] Diff reviewed: each line traces to the request; no stray refactors, debug code or secrets
- [ ] Commits are atomic with why-messages; refactors separate from behaviour changes
- [ ] Report says what changed, what was verified (with evidence), what was skipped and why
- [ ] No push, PR, merge or branch deletion happened without the user's go-ahead

---
name: coding-practices
description: Engineering discipline for writing, fixing and shipping code: root-cause debugging of bugs, Sentry issues, flaky tests and build breaks; TDD; verifying before saying done; code review and acting on review comments; refactoring and keeping changes minimal; module and interface design, ADRs; git commits, branches, worktrees and pre-commit hooks; React and Next.js performance. Use for "find the root cause", "review this", "is it done?" or "keep it simple".
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

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Invoices page slow and leaking data: `references/debugging.md` → `references/tdd-and-testing.md` → `references/verification.md`; the query from `backend-databases` → `references/query-performance.md`; the access check from `security` → `references/secure-coding.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Bug, failing/flaky test, build break, perf regression, "it worked yesterday"; a Sentry issue or a browser bug (pick an evidence tool: Sentry, Chrome DevTools MCP) | [references/debugging.md](references/debugging.md) |
| Feature or fix via TDD; writing, judging or fixing tests and mocks; the pytest loop | [references/tdd-and-testing.md](references/tdd-and-testing.md) |
| About to say done, commit, push or open a PR; defining acceptance checks; lint, format and typecheck gates (pick a linter: ESLint, Prettier, Biome, Ruff) | [references/verification.md](references/verification.md) |
| Reviewing code, a diff, a PR or an agent's work; requesting a review; AI review (pick a tool: CodeRabbit, Copilot, a reviewer subagent) | [references/code-review.md](references/code-review.md) |
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

## Other crafts

| When the request also needs | Use |
|---|---|
| Test levels, runner idioms (pytest, Vitest, Go) or E2E suites (beyond `references/tdd-and-testing.md`) | `testing-qa` → `references/test-strategy.md`, `references/unit-runners-by-language.md`, `references/playwright-e2e.md` |
| A flaky test that only fails in CI: flake classes and proof in CI (beyond `references/debugging.md`) | `testing-qa` → `references/flaky-tests.md` |
| A security pass on the change: auth, input, injection, scans, new dependencies | `security` → `references/secure-coding.md`, `references/static-analysis.md`, `references/supply-chain.md` |
| A slow query, N+1, missing index or schema migration behind the bug | `backend-databases` → `references/query-performance.md`, `references/postgres-schema.md` |
| Core Web Vitals, Lighthouse or Next.js App Router work (beyond `references/react-nextjs-performance.md`) | `website-building` → `references/performance-cwv.md`, `references/nextjs-react.md` |
| CI that runs tests, lint and typecheck on every PR; quality gates, Dependabot | `cloud-devops` → `references/ci-cd.md` |
| A written spec or implementation plan, or running it with subagents | `claude-meta` → `references/planning-and-execution.md`, `references/subagents-and-delegation.md` |
| Hooks and CLAUDE.md rules that keep these habits on in every session | `claude-meta` → `references/hooks-and-guardrails.md`, `references/claude-md-and-rules.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| All 40+ React and Next.js performance rules with bad and good code examples | [vercel-react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) (MIT; the full rule files weren't copied here) |
| Per-language coding standards (Python, Go, Rust, C++) beside the cross-project baseline | [coding-standards](https://github.com/affaan-m/everything-claude-code/tree/main/skills/coding-standards) (MIT; per-language siblings in the same repo) |
| An always-on laziest-solution mode with lite, full and ultra levels, plus review, audit and debt companions | [ponytail](https://github.com/DietrichGebert/ponytail/tree/main/skills/ponytail) (MIT) |
| One gate pipeline (AI review, tests, lint, docs, push, PR, CI) before changes reach the remote | [no-mistakes](https://github.com/kunchenguid/no-mistakes/tree/main/skills/no-mistakes) (MIT; needs the no-mistakes CLI) |
| Lint rules that reject AI-typical TypeScript and JavaScript patterns | [install-anti-slop](https://github.com/dmmulroy/anti-slop/tree/main/skills/install-anti-slop) (MIT; JS/TS only, needs Oxlint) |
| Architecture, sequence or data-flow diagrams of the real code as standalone HTML | [archify](https://github.com/tt-a1i/archify/tree/main/archify) (MIT; about 10 MB of assets, so not bundled) |

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

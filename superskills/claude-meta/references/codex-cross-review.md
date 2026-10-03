> Distilled from: codex-delegate (amElnagdy/delegate-skills, MIT), claudex-loop (chaseai-yt/claudex-loop, MIT)

# Delegating to, or cross-reviewing with, the Codex CLI

Vendor-specific: needs the OpenAI `codex` CLI installed and logged in (`codex --version`, `codex login`). Use when the user explicitly wants Codex to implement or review ("have Codex do X", "claudex this plan"). Skip for tasks small enough to do inline.

## Pattern 1: Codex implements, Claude reviews and lands

Claude is the orchestrator; Codex is the implementer in its own sandbox; Claude reviews and commits.

1. **Check the binary.** `command -v codex && codex --version`. Several installs are common (npm vs Homebrew); an old one lacks `exec --json`, `-o` and `exec resume`.
2. **Write the brief** (Codex sees only this text - no repo memory, no chat):
   - Goal, current state, exactly what to change, what to leave untouched.
   - The repo's **real** gate commands, taken from CLAUDE.md / AGENTS.md / Makefile / package.json (don't guess).
   - "Do not commit; I will review and commit."
   - Report contract: files changed, commands run with results, open questions.
   - One task per brief.
3. **Dispatch** non-interactively, e.g. `codex exec --cd /path/to/repo "$(cat brief.txt)"` (write-capable sandbox by default; add a read-only sandbox for review/diagnosis). Run it in the background; implementation runs can take 1-2 hours, so don't use short timeouts.
4. **Review** the diff yourself: `git status`, `git diff`, run the gate commands. Treat Codex's "done" as a claim.
5. **Land**: fix small issues yourself or send a delta brief to the same Codex session (`codex exec resume ...`); commit with a message stating what was delegated.

Queues: run tasks one at a time on one tree, review and commit each before the next brief.

## Pattern 2: Plan with one model, review with the other

1. The host session (Claude Code) gathers requirements and writes `PLAN.md`: goal and observable acceptance criteria, approach and key decisions, non-goals, assumptions with sources, risks, and exact verification commands with expected results.
2. Keep an append-only `PLAN-REVIEW-LOG.md`: roles, models requested, scope, round limits.
3. Send the plan to the other provider for independent review (max ~5 rounds). Each round, reply with dispositions per finding (accepted / rejected + why) and resume the **same** reviewer session; never guess session IDs.
4. Build (host by default, or `builder=codex`), with at most ~2 build-fix rounds.
5. The provider that did **not** build inspects the final code in a fresh session (max ~2 inspection rounds).

Rules:
- A request to plan does not authorise building; a request to plan and build does.
- Report the model you requested and the model the CLI actually used separately; never silently fall back to another model or provider on failure.
- Host tools (MCP servers, browser, credentials, skills) do not transfer to the other CLI; check before relying on them.
- Keep run artefacts and diagnostics outside the checkout.

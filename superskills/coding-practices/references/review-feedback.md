> Distilled from: receiving-code-review + requesting-code-review (obra/superpowers, MIT), code-review-excellence (wshobson/agents, MIT)

# Acting on review feedback

**Verify before implementing. Ask before assuming. Technical correctness over social comfort.** Applies to feedback from the user, a reviewer subagent, a bot, or a human on a PR.

## The response pattern

1. **Read** all the feedback before reacting.
2. **Understand**: restate each item as a technical requirement, or ask.
3. **Verify** against the codebase: is it true here?
4. **Evaluate**: right for *this* codebase, platform and version?
5. **Respond**: a short technical acknowledgement, or reasoned pushback.
6. **Implement** one item at a time, testing each.

## Unclear items block everything

If any item is unclear, ask about it **before** implementing the others; items are often related.
> "I understand 1, 2, 3 and 6. Need clarification on 4 and 5 before I start."

## By source

- **The user**: trusted. Implement once understood; still ask if the scope is unclear. No performative agreement.
- **External reviewers / bots / subagents**: check each suggestion:
  1. Technically correct for this stack?
  2. Breaks existing behaviour?
  3. Is there a reason the code is this way (`git blame`, comments, ADRs)?
  4. Works on all supported platforms/versions?
  5. Does the reviewer have the full context?
  If it conflicts with a decision the user made, stop and ask the user.
- Can't verify? Say so: "I can't confirm this without running against prod data. Investigate, ask, or proceed?"

## YAGNI check

When a reviewer asks to "implement this properly" (metrics, export, config options), grep for actual usage first:
> "Nothing calls this endpoint. Remove it instead (YAGNI)? Or is there usage I'm missing?"

## Order of work

1. Clarify everything unclear.
2. Blocking issues (breakage, security).
3. Simple fixes (typos, imports).
4. Complex fixes (logic, refactors).
5. Test each fix; rerun the suite at the end; check for regressions.

## When to push back

- The suggestion breaks something, or is wrong for this stack/version.
- The reviewer lacks context (legacy support, compliance, a documented trade-off).
- It adds unused features.
- It contradicts the user's architecture decisions.

Push back with evidence: a test, a code reference, a version constraint.
> Reviewer: "Remove the legacy code path."
> "Checked: build target is macOS 10.15+, this API needs 13+, so the legacy path is still needed. The bundle ID in it is wrong though. Fix that, or drop pre-13 support?"

## How to acknowledge

| Do | Don't |
|---|---|
| "Fixed: added null check in parser.ts:42." | "You're absolutely right!" |
| "Good catch, the loop was off by one. Fixed in batch.ts:17." | "Great point!" / "Thanks for catching that!" |
| Just fix it; the diff shows you heard it | "Let me implement that now" before verifying |

Wrong in your pushback? State it plainly and move on: "Checked, you're right: X does Y. Fixing." No long apology.

## Severity handling (reviews you requested)

- Critical: fix now.
- Important: fix before moving on.
- Minor: note for later (or batch into one cleanup).
- Reviewer wrong: push back with reasoning and proof.

## On GitHub

Reply to inline comments in their thread (`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies -f body=...`), not as a new top-level PR comment. Posting on the user's behalf needs their go-ahead.

## Common mistakes

| Mistake | Fix |
|---|---|
| Implementing 4 of 6 items, asking about 2 later | Clarify all first |
| Blindly applying a bot suggestion | Verify it against the code |
| Batch-applying every fix, then testing once | One at a time, test each |
| Avoiding pushback to keep the peace | Correctness wins; say what you found |
| Proceeding when you can't verify | State the limit and ask |

> Distilled from: user-stories (phuryn/pm-skills, MIT), to-tickets (mattpocock/skills, MIT), write-spec (anthropics/knowledge-work-plugins, Apache-2.0), to-spec (mattpocock/skills, MIT), product-manager-toolkit (alirezarezvani/claude-skills, MIT)

# User stories, acceptance criteria and ticket breakdown

## 1. User stories

Format: **As a [specific role], I want [capability], so that [benefit].**

The 3 Cs:
- **Card** — short title + the one-line story.
- **Conversation** — the intent, context and open details (a few sentences, links to design).
- **Confirmation** — 4–6 acceptance criteria.

INVEST check for every story:

| Letter | Test | Fix if it fails |
|---|---|---|
| Independent | Can ship without another story in the same batch | Re-slice or record a blocking edge |
| Negotiable | Describes the need, not a fixed UI | Remove widget names |
| Valuable | A user (not the team) gets something | Merge into the story it enables |
| Estimable | Team can size it | Spike first, time-boxed |
| Small | Fits one sprint (ideally 1–3 days of work) | Split (see §3) |
| Testable | Each criterion is pass/fail | Replace adjectives with bounds |

Common mistakes:
- Too vague: "I want it faster" → which flow, how much faster?
- Solution-prescriptive: "I want a dropdown" → "I want to choose a date range".
- No benefit: "I want to click a button" → why?
- Too big: "I want to manage my team" → invite, remove, change role...
- Internal task posing as a story: "As the eng team we want to refactor the DB" → write it as a task or enabler, linked to the story it unblocks.

## 2. Acceptance criteria

Write as Given/When/Then or a checklist. Cover:
1. Happy path
2. Validation and error states (with the message the user sees)
3. Empty state / first-time state
4. Permissions (who cannot do it)
5. A "must not happen" case
6. Performance or accessibility bound when relevant ("loads in < 1 s p95", "operable by keyboard")

Example — "Recently viewed" on a product page:
1. Shown at the bottom of the product page to any user who viewed ≥ 1 other product this session.
2. Not shown on the first product page of a session.
3. Excludes the current product.
4. Each card shows image, title, price and "viewed N minutes ago".
5. Clicking a card opens that product page.
6. Max 10 items, most recent first.

## 3. Splitting big stories

Split by, in order of preference:
1. Workflow step (create → edit → delete)
2. Business rule variant (standard price → discount → tax-exempt)
3. Data variant (one file type → others)
4. Interface (web first, then mobile)
5. Happy path first, then error handling
6. Simple version, then performance/scale

Never split by layer (one ticket for DB, one for API, one for UI). That produces work nobody can demo.

## 4. Tracer-bullet tickets (plan → tickets)

Use when turning a spec or conversation into an executable backlog, especially for AI coding agents.

**Rules for each ticket (vertical slice):**
- Cuts a thin but complete path through every layer it touches (schema, API, UI, tests).
- Demoable or verifiable on its own.
- Small enough for one focused session (for agents: one fresh context window).
- Any refactor that makes the work easier comes first ("make the change easy, then make the easy change").

**Blocking edges.** Each ticket lists the tickets that must finish before it can start. "None" means it can start now. The *frontier* is every ticket whose blockers are done; work the frontier.

**Wide refactors are the exception.** A mechanical change that breaks many call sites at once (rename a column, retype a shared symbol) cannot be a green vertical slice. Sequence it as expand → migrate → contract:
1. Expand: add the new form beside the old; nothing breaks.
2. Migrate: move call sites in batches sized by blast radius (per package or directory), one ticket per batch, each blocked by Expand.
3. Contract: delete the old form, blocked by every migrate batch.
If batches cannot stay green alone, they share an integration branch and all block a final "integrate and verify" ticket.

**Process:**
1. Read the source (spec, issue with comments, or this conversation). Explore the codebase if not done; use its vocabulary.
2. Draft the slices.
3. Show the user a numbered list: title, blocked by, what it delivers end-to-end. Ask: granularity right? edges right? merge or split anything?
4. Iterate until approved. Do not publish before approval.
5. Publish in dependency order (blockers first) so later tickets can reference real IDs. Use the tracker's native blocking/sub-issue links where they exist (see `references/jira-confluence.md`, `references/linear.md`). Without a tracker, write one file per ticket: `.scratch/<feature>/issues/NN-<slug>.md`.
6. Never close or edit the parent issue as a side effect.

**Ticket template:**

```markdown
# NN: <title>

**What to build:** end-to-end behaviour, from the user's point of view.
**Blocked by:** NN, NN — or "None (can start immediately)".
**Parent:** <spec or issue link, if any>

## Acceptance criteria
- [ ] ...
- [ ] ...
```

No file paths or code in tickets; they go stale. A short prototype snippet that pins a decision is the exception, labelled as such.

## 5. Estimation hygiene

- Estimate relative size (points or T-shirt), not hours, unless the team insists.
- Re-estimate anything carried over; record why it slipped.
- A story over ~8 points (or > 1 sprint) gets split before planning.
- Spikes are time-boxed (e.g. 1–2 days) and end in a decision or new stories, not code to keep.

## Output checklist

- [ ] Every story has role, capability, benefit
- [ ] 4–6 acceptance criteria, including an error and a "must not" case
- [ ] Stories pass INVEST; none is a horizontal layer
- [ ] Ticket list shows blocking edges and was approved before publishing
- [ ] Plain language a new team member understands

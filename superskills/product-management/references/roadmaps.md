> Distilled from: outcome-roadmap (phuryn/pm-skills, MIT), roadmap-update (anthropics/knowledge-work-plugins, Apache-2.0), product-manager-toolkit (alirezarezvani/claude-skills, MIT), jobs-to-be-done (wondelai/skills, MIT)

# Roadmaps

A roadmap is a communication tool about outcomes and sequence, not a project plan. Keep it at the altitude of themes and outcomes; tasks live in the tracker.

## 1. Formats

| Format | Use when | Avoid when |
|---|---|---|
| **Now / Next / Later** | Default for most teams; leadership and external audiences | You need a delivery schedule |
| Quarterly themes (2–3 per quarter) | Showing strategic investment areas | Themes are just renamed feature lists |
| OKR-aligned | The org runs on OKRs; every item maps to a key result | OKRs are not set yet |
| Timeline / Gantt | Engineering sequencing, resource conflicts | Anything external (false precision) |

Now = committed, high confidence (current sprint/month). Next = planned, scoped, 1–3 months, timing flexible. Later = directional bets, 3–6+ months.

## 2. Rewrite outputs as outcomes

For each initiative ask "so what?" until you reach a customer or business result. Template:

> Enable **[segment]** to **[customer outcome]** so that **[business impact]**, measured by **[metric, target, date]**.

| Output (old) | Outcome (new) |
|---|---|
| Q2: Advanced search filters | Q2: Shoppers find the product they want 50% faster (median search-to-PDP time 40 s → 20 s) |
| Q2: AI recommendations | Q2: Raise average order value 20% through relevant suggestions |
| Q2: Dashboard redesign | Q2: Operators see system status in < 2 s (dashboard load 10 s → 2 s) |

Rules:
- An outcome is measurable and testable; several outputs may serve it, and the team may find a better one.
- Name the job or problem, not the solution (see `references/discovery-jtbd.md`).
- Use quarters or Now/Next/Later, not dates, unless a date is contractual.
- Add the strategic context: which company goal it serves, key assumptions about customers, dependencies.

## 3. Operations on an existing roadmap

Ask which operation the user wants; each has its own questions.

| Operation | Gather | Output |
|---|---|---|
| Add item | Name, problem/outcome, priority, effort, timeframe, owner, dependencies | Where it fits + **what moves or comes off** |
| Update status | New status: not started / on track / at risk / blocked / done / cut. For at risk or blocked: blocker + mitigation | Updated row + risk note |
| Reprioritize | What changed (new data, strategy, resources, customer, competitor) | Before/after table with reasons |
| Move timeline | Why (scope, dependency slip, capacity) | Downstream items affected; items now past hard deadlines flagged |
| Create new | Horizon (quarter/half/year), format, list of initiatives, goals | Full roadmap in chosen format |

Roadmaps are zero-sum against capacity: every addition asks "what comes off?"

## 4. Output layout

1. **Status overview** — one line: X in progress, Y done this period, Z at risk.
2. **Items table** — name + one line, outcome/metric, status label (**Done**, **On Track**, **At Risk**, **Blocked**, **Not Started**), timeframe, owner, dependencies. Group by Now/Next/Later, quarter or theme.
3. **Risks and dependencies** — blocked items with cause, cross-team dependencies with owner and need-by date, items near hard deadlines.
4. **Changes this update** — added, removed, reprioritized, moved, with reasons.

Offer audience versions: exec (themes + outcomes + risks, 1 page), engineering (sequence + dependencies), customer-facing (benefits, no dates beyond "this quarter / later this year", no internal names).

## 5. Dependencies

Types: technical, team, external vendor, knowledge (research first), sequential. For each: owner, need-by date, contingency if it slips. Dependencies are the biggest roadmap risk; add buffer around them and surface cross-team ones early. Reduce them by building a simpler version, mocking an interface contract, re-sequencing, or absorbing the work.

## 6. Capacity

- Planned feature time is typically 60–70% of engineer time after meetings, on-call, interviews and PTO.
- Healthy allocation: ~70% roadmap, ~20% technical health (debt, reliability, performance), ~10% unplanned buffer. Shift toward health after incidents or for mature products; toward features for new products.
- If commitments exceed capacity, cut scope. Never plan on people "doing more".

## 7. Communicating a change

1. Say what changed and why (the new information).
2. Show the trade-off: what was deprioritized or what slips.
3. Show the new plan.
4. Tell affected stakeholders directly, before they find out.

Avoid whiplash: batch changes at a monthly or quarterly cadence unless urgent; distinguish strategic re-prioritization from normal scope adjustment; frequent changes usually mean unclear strategy.

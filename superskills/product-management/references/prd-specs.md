> Distilled from: to-spec (mattpocock/skills, MIT), bmad-prd (bmad-code-org/BMAD-METHOD, MIT), prd (github/awesome-copilot, MIT), create-prd (phuryn/pm-skills, MIT), write-spec (anthropics/knowledge-work-plugins, Apache-2.0), writing-prds (RefoundAI/lenny-skills, MIT), product-manager-toolkit (alirezarezvani/claude-skills, MIT)

# PRDs, specs and one-pagers

A spec exists to get engineering, design and stakeholders to agree on the problem, the boundary and what "done" means. Length follows stakes, not ambition.

## 1. Pick the shape first

| Situation | Shape | Target length |
|---|---|---|
| Idea needs a yes/no before anyone designs | One-pager (problem, why now, success metric, rough scope, open questions) | 1 page |
| Feature for one team, clear problem | Feature spec (sections in §3, trimmed) | 2–4 pages |
| Cross-team or launch-level product | Full PRD (template in `templates/bmad-prd/prd-template.md`) | as long as the requirements need; overflow to an appendix |
| Feature already discussed at length in this conversation or repo | Synthesis spec: write it from what is known, no interview (§2b) | 2–5 pages |
| Hobby or solo build | Two pages max: vision, one user journey, features with testable outcomes, non-goals | ≤ 2 pages |

If a single spec would describe more than one release, split it and spec phase 1 only.

## 2. Gather before writing

**2a. Interview mode (default for a fresh idea).** Ask at least 2 and at most ~6 questions, most important first, conversationally (not a questionnaire dump):

1. What problem, for whom, how often? What evidence (tickets, interviews, metrics)?
2. Why now? What changed?
3. How will we know it worked (metric, target, time window)?
4. Constraints: deadline, stack, budget, legal/regulatory, dependencies.
5. What has been tried before; what exists (competitors, workarounds)?
6. What is explicitly out of scope?

Offer two working modes when the user is in a hurry:
- **Fast path:** batch remaining gaps into one question round, then draft the whole PRD with `[ASSUMPTION: ...]` tags where you inferred.
- **Coaching path:** walk section by section, the user supplies the thinking, you structure it. Do not quietly insert your own wedge, MVP cut or phasing; propose it as an option and let the user choose.

**2b. Synthesis mode.** When the conversation or repo already holds the decisions, do not re-interview. Read the code area, reuse the project's domain vocabulary and existing ADRs, and confirm only the test seams (where the feature will be verified; prefer one existing, high-level seam).

**Never invent constraints.** Unknown stack, dates or numbers become `TBD` or `[ASSUMPTION]`, listed again in an Assumptions index at the end.

## 3. Section set (feature spec / PRD)

Use the sections that earn their place; drop one only for a reason a reviewer would accept.

1. **Problem statement** — 2–3 sentences from the user's side: who, what pain, how often, cost of not solving. Solution-agnostic. Say whether it is a customer or a business problem; for a business problem ask "why hasn't this solved itself?" to find the customer problem underneath.
2. **Why now** — only when timing is load-bearing (market shift, enabler, deadline).
3. **Goals** — 3–5 measurable outcomes, not outputs. "Cut time to first invoice from 3 days to 1" not "build onboarding wizard".
4. **Non-goals** — 3–5 things this version will not do, each with a one-line reason (low impact, separate initiative, premature, too complex).
5. **Users and journeys** — named-persona journeys for consumer, multi-stakeholder or UX-heavy products ("Priya, single income, scans a receipt in the car..."): entry state, 3–5 steps, the moment value lands, the end state, one edge case. For a single-operator internal tool, skip personas and write a capability list.
6. **Glossary** — every domain noun defined once; use exactly that word everywhere after. Required when the doc feeds design, architecture or tickets.
7. **Requirements** — grouped by feature, numbered globally (FR-1…FR-n) so tickets can reference them. Each: actor + capability + condition, priority, and at least one testable consequence (see §4).
   - **P0 Must-have**: if cut, the core problem is not solved.
   - **P1 Nice-to-have**: clear fast-follow.
   - **P2 Future**: not built now, but design must not block it.
   - If everything is P0, nothing is. Challenge each P0: "would we really not ship without this?"
8. **Non-functional requirements** — only with numbers: "p95 search latency < 200 ms on 10k records", "WCAG 2.1 AA", "99.9% monthly uptime". Delete adjectives like scalable, secure, fast.
9. **AI features (if any)** — tools/APIs/models used, evaluation set (e.g. 50 real questions), pass threshold (e.g. ≥ 90% correct citations), fallback behaviour, cost per call budget.
10. **Success metrics** — leading (adoption, activation, task completion, time on task, error rate; days–weeks) and lagging (retention, revenue, NPS, support tickets; weeks–months). Each with definition, target, stretch target, data source/query and evaluation date. Add 1–2 **counter-metrics** you must not degrade (e.g. support contacts per user).
11. **Open questions** — genuinely open, tagged with who answers (eng, design, legal, data) and blocking vs non-blocking.
12. **Release / timeline** — hard dates and why, dependencies, phases (MVP → v1.1 → v2) in relative time unless a date is real.
13. **Risks** — top 3–5 specific risks; run `references/risk-reviews.md` for a launch-level PRD.
14. **Implementation notes (engineering specs only)** — modules touched, interfaces, schema/API contracts, testing approach (test external behaviour, name prior-art tests). No file paths or code snippets; they rot. Exception: a short prototype snippet that pins a decision (state machine, type shape), labelled as such.

Adapt-in sections when the product carries the concern: compliance (GDPR, HIPAA, PCI, SOC 2), monetization/pricing, platform matrix, data governance and retention, API versioning and deprecation, rollout and change management, operational SLAs (RTO/RPO).

## 4. Write requirements that can be tested

- Replace every vague word with a bound: fast → "< 2 s p95"; easy → "new user completes setup in ≤ 3 steps without help in 4 of 5 usability sessions".
- Acceptance criteria as Given/When/Then or a checklist; cover happy path, errors, empty states, permissions and one "must NOT happen" case.
- One behaviour per criterion; each independently checkable.
- Describe behaviour, not widgets ("user can pick a date range", not "a dropdown").

## 5. Keep scope honest

- Every addition after approval comes with a removal or a new date.
- Keep a parking lot for good out-of-scope ideas.
- Time-box unknowns: "if we cannot resolve X in 2 days, it moves to v2".
- Detail dial: senior team, less "how"; junior team, more guidance. Do not spend three pages on one button; leave design and engineering room to find better solutions.
- Avoid the word "just" ("just add a toggle"). It hides work.

## 6. Review rubric (use on your own draft or someone else's)

Rate each dimension strong / adequate / thin / broken, cite the section, give a fix.

| Dimension | Ask | Red flag |
|---|---|---|
| Decision-readiness | Are trade-offs named with what was given up? | Every choice "balances" everything |
| Substance | Does each persona, NFR and differentiator change a decision? | Boilerplate NFRs, > 4 personas, vision that fits any product |
| Coherence | Is there one thesis; do features and metrics follow from it? | A backlog with headings; activity metrics for a quality thesis |
| Done-ness | Does every FR have a testable consequence? | "handles gracefully", "reasonable performance" |
| Scope honesty | Are non-goals, assumptions and deferred items explicit? | Silent de-scoping; untagged inferences |
| Downstream use | Stable IDs, glossary terms used verbatim, sections readable alone? | "see above", synonyms drifting |
| Shape fit | Is the formality right for the product type? | Journey theatre for a one-operator tool; no journeys for a consumer app |

Lead the review with a 2–3 sentence verdict, then critical and high findings; roll medium/low into one line. Count open questions + assumptions: high counts are fine for a draft, a blocker for a "ready to build" PRD.

## 7. After the draft

- Ask which sections need work; offer follow-ons: ticket breakdown (`references/stories-and-tickets.md`), pre-mortem, stakeholder summary.
- Save substantial docs as `PRD-<product-or-feature>.md` (or publish to the tracker when the user's setup has one).
- Keep the doc alive: date the header, mark status (draft / review / final), and log decisions that changed it.

## Pitfalls

- Writing the solution before the problem; problem statement that names the feature.
- Goals that are outputs ("launch X").
- Success metrics without a target, date or data source.
- Copying a template's every section; padding to look thorough.
- High-fidelity mocks before the problem is agreed (anchors the team).
- Excluding design and engineering until the spec is "done" (waterfall handoff).

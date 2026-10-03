> Distilled from: pre-mortem (phuryn/pm-skills, MIT), strategy-red-team (phuryn/pm-skills, MIT), stakeholder-update (anthropics/knowledge-work-plugins, Apache-2.0), writing-prds (RefoundAI/lenny-skills, MIT)

# Risk reviews: pre-mortem and red team

Two different tools. Use both on launch-level plans.

| | Pre-mortem | Red team |
|---|---|---|
| Question | "It launched in 14 days and failed. Why?" | "Which load-bearing claim is false right now?" |
| Output | Risks sorted Tigers / Paper Tigers / Elephants, with launch-blocking actions | 3–5 ranked kill-assumptions with the cheapest test for each |
| Best for | Launch readiness, cross-functional plans | Strategy, PRDs, roadmaps, exec reviews |

## 1. Pre-mortem

1. Read the PRD or plan fully: product, target users, assumptions, timeline.
2. Imagine launch in 14 days, then failure: no adoption, missed revenue, reputational damage. List what went wrong, what was missed, where the team was overconfident. Cover engineering, design, data, legal, support and go-to-market.
3. Sort each risk:
   - **Tiger** — a real threat you can point to evidence or clear logic for. Needs action.
   - **Paper Tiger** — a worry others raise that you believe is overblown. Say why; it aligns stakeholders.
   - **Elephant** — something nobody is discussing that might be real. Needs investigation.
   When unsure between Tiger and something else, call it a Tiger.
4. Classify Tigers by urgency:
   - **Launch-blocking** — must be fixed before launch (broken core flow, regulatory blocker, unmet key dependency).
   - **Fast-follow** — fix within 30 days after launch.
   - **Track** — monitor; act if it shows up.
5. For each launch-blocking Tiger: risk, mitigation, owner (function or person), decision/completion date.
6. Revisit 2–3 weeks before launch to check mitigations.

Output:

```markdown
## Pre-mortem: <product> (<date>)
### Tigers
| Risk | Urgency | Evidence | Mitigation | Owner | Due |
### Paper Tigers
- <concern> — why it is not a real risk
### Elephants
- <concern> — how to investigate, by whom, by when
```

## 2. Red team

1. **Extract claims.** List everything the plan asserts about users, market, constraint, mechanism, timeline. Mark **load-bearing** (plan dies if false) vs cosmetic. Attack only load-bearing ones.
2. **Steelman, then attack.** State the strongest case for each claim, then attack that version. An attack on a weak version is worthless.
3. **Write each as "Fails if ___"**, concrete and falsifiable ("fails if activation, not acquisition, is the real constraint", not "execution risk").
4. **Rank by impact-if-wrong × likelihood-wrong × cheapness-to-test.** The top item is what to test this week.
5. **Do not fabricate.** Default to "this risk is real" unless the plan cites evidence against it, but if a claim is well-reasoned, say so. Never invent a weakness.
6. For each surviving kill-assumption give:
   - **Fails if:** the precise condition
   - **Evidence to get this week:** the query, data pull or 3 customer calls that would confirm or kill it
   - **Kill criterion:** the threshold that stops or changes the plan
   - **Cheapest test:** the smallest experiment that moves the belief
7. Optional second opinion: if the user asks and another model is available, run the same review and list disagreements.

Output:

```markdown
## Red team: <plan in one line>
### Top kill-assumptions (ranked, 3–5)
- **Claim:** ...  **Fails if:** ...  **Evidence this week:** ...  **Kill criterion:** ...  **Cheapest test:** ...
### What's well-reasoned
### What I couldn't assess
```

## 3. Rules for both

- Specific to this plan; no generic risk lists. Five real risks beat twenty vague ones.
- End with actions, not just fears.
- Blameless tone; it is about the plan.
- Risks that need leadership go into the stakeholder update with an ask (see `references/stakeholder-comms.md`, ROAM).

> Distilled from: jobs-to-be-done (wondelai/skills, MIT), product-manager-toolkit (alirezarezvani/claude-skills, MIT), create-prd (phuryn/pm-skills, MIT), prioritization-frameworks (phuryn/pm-skills, MIT)

# Discovery, customer interviews and Jobs to Be Done

## 1. The job

A job is the progress a person wants to make in a specific circumstance. Circumstance predicts behaviour better than demographics.

**Job statement:** "When [circumstance], I want to [progress], so I can [outcome]." It never names your product or any solution.

Every job has three dimensions; capture all three:
| Dimension | Question |
|---|---|
| Functional | What do they need to get done? |
| Emotional | How do they want to feel? |
| Social | How do they want to be seen? |

Not a job: a goal too abstract ("be healthy") or a task too specific ("click export").

## 2. Forces of progress

A switch happens only when **Push + Pull > Habit + Anxiety**.
- Push: frustration with today ("this takes my whole Friday").
- Pull: attraction of the new ("it does it in minutes").
- Habit: comfort with today ("we've always used the spreadsheet").
- Anxiety: fear of the new ("what if it loses our data?").

Most teams only add Pull. Often cheaper wins: reduce Anxiety (trial, guarantee, data import, social proof) and Habit (one-click migration, templates that mirror the old way).

## 3. Big hire vs little hire

- Big hire: the purchase or signup (once).
- Little hire: choosing to use it in the moment (repeatedly).
Retention problems are almost always little-hire failures. Track signup conversion separately from first use after signup and weekly active use.

## 4. Competition is everything hired for the job

List every alternative, including spreadsheets, email, a person, doing it later, and doing nothing (non-consumption, often the biggest competitor). Workarounds and hacks reveal unserved jobs. Position against the real alternative ("stop doing this by hand"), and price against the value of the job (hours saved), not against category peers.

## 5. Interviews

**Plan:** research question, target segment, 5–8 interviews per segment (10+ for a JTBD switch study), mix recent switchers, power users and churned users. Record with permission.

**Rules:**
- Ask only about past, specific events. Never "would you...?", "do you wish...?", or anything that names your idea; those produce polite confirmation.
- Ask "why" up to five times to reach the root.
- Watch for emotion; strong feelings mark real pain.
- Take minimal notes live; capture verbatim quotes after.

**Switch timeline questions:**
1. First thought: when did you first think you needed something different? What was going on?
2. Search: what did you look at? What ruled options out? Who did you ask?
3. Decision: where were you when you decided? What convinced you? What worried you?
4. Use: is it doing what you hoped? What surprised you? What's still missing?

**Churn interviews:** same timeline in reverse; decide whether it was a big-hire failure (wrong expectations at purchase) or a little-hire failure (daily friction).

## 6. Synthesis

1. Run `scripts/product-manager-toolkit/customer_interview_analyzer.py transcript.txt` (add `--json` for aggregation across interviews) to pull a first pass of pain points with severity, feature requests, JTBD-style phrases, sentiment, themes, competitor mentions and quotes. It is keyword-based (stdlib, no network): treat it as a starting index, then read the transcript yourself.
2. Group similar pains across interviews. 3+ independent mentions = a pattern; 1–2 = a lead.
3. Write job statements and map forces per segment.
4. Build an **Opportunity Solution Tree**: desired outcome → opportunities (needs/pains from research) → candidate solutions → experiments. Choose among opportunities before solutions.
5. Prioritize opportunities by frequency × severity, or survey Importance and Satisfaction for an Opportunity Score (see `references/prioritization.md`).
6. Validate qualitative findings with behaviour data (funnels, usage) before building.

## 7. Testing solutions

Hypothesis format: "We believe [change] for [segment] will [result]. We'll know when [metric] moves from [x] to [y] within [time]." Test with the cheapest artifact that answers the question (fake door, concierge, clickable prototype, landing page). Measure what people do, not what they say.

## 8. Metrics that follow the job

- "Did the job get done?" (task success, time from problem to resolution) beats satisfaction scores.
- Replace NPS-only reporting with "reasons for hiring and firing" from interviews.
- North Star: one metric that captures delivered customer value (e.g. weekly invoices sent), with 3–5 input metrics the team can move.
- HEART for UX features: Happiness, Engagement, Adoption, Retention, Task success; each with a goal, a signal and a metric.

## Quick diagnostic

| Question | If no |
|---|---|
| Can you state the job without naming the product? | Rewrite it as When / I want to / so I can |
| Have you mapped all four forces? | Design for Anxiety and Habit, not just Pull |
| Do you know the emotional and social dimensions? | Interview about feelings and context |
| Have you listed non-obvious competitors, including doing nothing? | List every hire for the job |
| Is little hire tracked separately from big hire? | Split acquisition and usage metrics |
| Did 10+ real timelines inform this? | Interview before building |

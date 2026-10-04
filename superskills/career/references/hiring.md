# Hiring side: job posts, structured interviews and scorecards

> Distilled from: job-post-builder and its references (anthropics/knowledge-work-plugins, Apache-2.0), interview-system-designer, its frameworks, competency matrices, bias checklist and debrief guide (alirezarezvani/claude-skills, MIT), performance-review calibration notes (anthropics/knowledge-work-plugins, Apache-2.0).

For the person hiring: a job post that attracts the right people, an interview loop where every interviewer measures something different the same way, and a debrief that decides on evidence. Drafts only: never publish a post, send a rejection or send an offer for the user.

## 1. Intake (ask once, grouped)

Role title; team and manager; 3-5 things the person will own; must-haves; nice-to-haves; location and remote policy; salary band (flag that HR or legal should confirm); existing job post or template (their format wins); interview stages, who runs each, what each assesses; any take-home or work sample.

Extract what the user already said and confirm it in one line; ask only for what's missing. Never guess compensation or credentials.

Default stages if they have none:

| Company | Stages |
|---|---|
| Under about 25 people | 20-min screening call -> working interview or work sample -> short final talk on terms |
| Larger, mid-senior IC | Recruiter screen -> hiring manager -> peer -> skills or case exercise -> skip-level or values |

Loop by level as a starting point: `python3 scripts/interview-system-designer/interview_planner.py --role "<role>" --level junior|mid|senior|staff [--json]` prints rounds, minutes, focus and starter questions. Edit the output; its questions are generic.

## 2. The job post (400-700 words)

| Section | Content |
|---|---|
| Opening hook (2-3 sentences) | Why the role exists now and what it will change |
| About the company (3-4 sentences) | What you do, for whom, why it matters; one concrete milestone if true |
| The role (1 paragraph) | What success looks like 12 months in |
| What you'll do (4-7 bullets) | What they'll own, not "help with" |
| What we're looking for | Required (tight) and preferred |
| Pay and benefits | Range, equity if any, 3-5 standout benefits, only from the user |
| How to apply | One sentence, one link |

Rules:
- **Required-list test:** "Would we reject a strong candidate who lacked this?" If not, move it to preferred. Every required line is a filter that shrinks the pool.
- Say what is hard about the job; honest posts attract people who self-select well.
- Inclusive language: no "rockstar", "ninja", "guru", "work hard play hard"; no gendered wording; no degree requirement where experience does the same job; reading level around grade 10-12.
- Pay: never invent a range. Many places now require pay information in the post or before the interview (several US states and cities; EU member states as they transpose the pay transparency directive): tell the user to check the law where the role is advertised.
- Match the company's voice; a startup sounds different from a regulated enterprise.

## 3. Competencies

Pick 4-6 competencies per role from the work, not from a generic list: e.g. technical depth, problem-solving, ownership, collaboration and influence, communication, domain skill, learning. Define each in one sentence ("what good looks like here").

Level expectations shift the bar, not the competency. Example for software engineering:

| Competency | Junior | Mid | Senior | Staff+ |
|---|---|---|---|---|
| System design | Component interactions | Service and data design | Distributed systems, tradeoffs | Cross-system architecture, strategy |
| Leadership | Peer help | Owns projects, mentors juniors | Guides the team, technical decisions | Org-wide influence |

## 4. Interview guide

```markdown
## Interview guide: <Role>
1. Role summary (1 paragraph) and which stage this guide covers
2. Stage map: | Stage | Interviewer | Competencies assessed |  (no two stages assess the same thing)
3. Question bank per competency:
   What we're evaluating: <one sentence>
   Questions (4-6): behavioural "Tell me about a time..." first
   Probes (2-3): What was the outcome? What was your part vs the team's? What would you change?
4. Scoring rubric with 1 / 3 / 5 anchors written for THIS role
5. Take-home or work sample debrief: what to look for, how to score, follow-up questions
6. Debrief guide
```

Question rules: behavioural questions for evidence; situational ("what would you do if...") only where candidates can't have direct experience; one question at a time; no leading questions ("we value collaboration, are you collaborative?"); same core questions for every candidate at a stage; split panel questions explicitly between panelists.

## 5. Scorecards and rubric

| Score | Label | Meaning |
|---|---|---|
| 5 | Exceptional | Well above the bar for this competency |
| 4 | Strong | Clearly meets the bar; specific, convincing evidence |
| 3 | Meets | Adequate evidence; gaps not disqualifying |
| 2 | Below | Significant gaps |
| 1 | Does not meet | Clear deficiency; blocker for this role |

Write anchors per competency. Example, ownership: **5** spotted a problem nobody assigned, drove it to resolution, documented the learning; **3** reliably delivered assigned work and raised risks early; **1** waited for direction, vague about own contribution vs the team's.

Scorecard per interviewer: competency, score, the evidence (what the candidate said or did, quoted where possible), overall recommendation (strong hire / hire / no hire / strong no hire), any disqualifying signal noted separately. Score right after the interview, before talking to anyone.

**Resume screening rubric** (separate from interviews): must-haves (pass/fail), should-haves weighted to 100 and scored 0-3 each, nice-to-haves as tie-breakers. Every item checkable from a resume.

## 6. Fairness and legal hygiene

- Same questions, same time, same clarification for every candidate; take notes on answers, not impressions.
- Check first impressions and "would I like to work with them" against the rubric; watch affinity, halo/horn, confirmation and "not like our current team" bias; don't penalise non-traditional backgrounds.
- Don't ask about protected characteristics: age, family plans, pregnancy, marital status, religion, disability (beyond accommodation), national origin, and others protected locally. Rules vary by country and state: check local law and HR.
- Offer accommodations up front. Keep records for the required retention period and only job-relevant observations in them.

## 7. Debrief

1. Everyone submits scores and written evidence independently first.
2. Share scores round the table without discussion; record them visibly.
3. Discuss competency by competency, starting where scores differ by more than 1 point. Ask: "What exactly did they say or do?", "How does that match the rubric anchor?", "Would this answer score the same from a different candidate?"
4. Separate disqualifying signals from the overall average; apply role weights.
5. Decide (strong hire / hire / no hire / strong no hire), write the rationale with evidence, and record dissent.
6. Quarterly: compare interviewer score spreads and check signals against how hires actually performed; recalibrate.

## 8. Offers and candidate communication

- Offer letter drafts use clear placeholders (`<ANNUAL SALARY: confirm with HR>`); never invent figures. Default templates from US sources carry US terms (at-will, exempt status, 401(k)); outside the US those clauses must be replaced, and every letter needs legal review.
- Rejections: prompt, kind, brief; offer feedback only if the company's policy allows.
- Salary negotiation from the candidate's side is in [negotiation-and-offers.md](negotiation-and-offers.md).

## 9. Checklist

- [ ] Intake complete; existing format respected
- [ ] Job post 400-700 words; required list passes the rejection test; no invented pay
- [ ] Pay-transparency rule for the location flagged to the user
- [ ] 4-6 competencies, each assessed at exactly one stage
- [ ] Questions per competency with probes; 1/3/5 anchors written for this role
- [ ] Independent scoring before debrief; decision recorded with evidence
- [ ] Nothing published or sent by the agent; legal review flagged for offer letters

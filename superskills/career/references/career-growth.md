# Career growth: brag documents, self-reviews and promotion cases

> Distilled from: brag-sheet (github/awesome-copilot, MIT), performance-review (anthropics/knowledge-work-plugins, Apache-2.0), building-a-promotion-case and its artifacts (RefoundAI/lenny-skills, MIT; paraphrased, no newsletter quotes copied), storybank guide of interview-coach (noamseg/interview-coach-skill, MIT).

Growing in a job runs on one habit: write down what changed because of your work, with proof, while it's fresh. The same record feeds self-reviews, promotion cases, resume updates and interview stories.

## 1. The brag document

**Entry format (all three parts required):**

```
Did [action] -> [result or impact] -> [evidence]
```

If evidence is missing, write `(evidence needed)` and ask for it. Never drop the entry silently, and never invent a metric.

| Weak | Strong |
|---|---|
| Fixed a bug in auth | Fixed token-refresh race -> ended 401s on 12% of API calls -> PR #247 |
| Worked on dashboards | Built Grafana latency dashboard -> on-call spots P95 spikes in under 2 min -> live in prod |
| Helped onboard people | Wrote the onboarding guide -> new hires shipped first PR in week 1 instead of week 3 -> guide link, 4 hires |

**Evidence ladder (use the strongest available):** quantified metric > PR, commit or doc link > observable outcome ("unblocked team X", "resolved Sev2") > qualitative with context > activity only (rewrite or mark evidence needed).

**Rules:**
1. Confirm the time range before collecting ("this half" = which dates?).
2. Group related work: ten commits on one feature = one entry.
3. Show drafts before saving; keep the person's voice.
4. Pair or co-authored work: ask "credit as yours, shared, or skip?"
5. An honest quiet period beats padded trivia.
6. Non-code work counts: incidents, design docs, mentoring, hiring, cross-team unblocking. Ask about it; it rarely shows in git.

**Mode: capture** (one entry now) | **backfill** (reconstruct a period) | **review pack** (select and theme for a review).

**Backfill from sources the user owns (read-only, local):**

```bash
git log --author="$(git config user.email)" --since="2026-04-01" --until="2026-10-01" \
  --pretty=format:'%h|%ad|%s' --date=short --no-merges
gh pr list --author @me --state merged --limit 50 --json number,title,repository,mergedAt
```

PR history is more reliable than commit logs for long ranges and across repos. Then fill gaps with a short guided interview: launches, incidents, docs, people helped, decisions influenced.

**Output:** markdown grouped by week or month with categories (features, infrastructure, reliability, collaboration, mentoring). Keep screenshots and metrics while there's still access to the tools: people lose access on the day they leave.

## 2. Self-review

1. **Gather** from the brag doc for the review period.
2. **Select** the top 3-5 by impact, not by effort.
3. **Rewrite each** as what I did, why it mattered (who benefited, what changed), proof.
4. **Organise by theme**, not by date: results; customer or team impact; collaboration and leadership; growth.
5. **Ask for gaps** before finishing: "what metric moved?", "who was unblocked?", "incident or PR id?"

Template:

```markdown
## Self-assessment: <period>
### Key accomplishments
1. **<Accomplishment>**: situation, my contribution, impact (with proof)
### Goals review
| Goal | Status (met / exceeded / missed) | Evidence |
### Growth
New skills, bigger scope, leadership moments.
### Challenges and what I'd do differently
### Goals for next period (specific, measurable)
### What would help from my manager
```

Missed goals: state them plainly with what was learned and what changed. Reviewers trust a self-review that admits misses more than one that doesn't.

## 3. Promotion case

**Principle:** promotions usually go to people already working at the next level, whose manager knows they want it, with proof a champion can use in calibration.

**Steps:**
1. **Say it out loud.** Tell the manager explicitly, early in the cycle: "I'd like to grow into <level/role>. What would you want to see from me to be ready, and when?"
2. **Gap analysis.** Compare the person's work against the written career ladder and the unwritten criteria (look at what recently promoted peers did; ask one or two of them). Agree the 2-3 behaviours or skills most holding them back.
3. **Action plan.** 3-10 concrete actions over about six months, tracked in a shared table reviewed monthly with the manager:

| Gap | Concrete action | Owner | Status (green / amber / red) | Evidence |
|---|---|---|---|---|
| Cross-team influence | Lead the API deprecation working group across 3 teams | Me | Amber | Kickoff doc, 2 of 3 teams migrated |

4. **Take on next-level scope** where it's offered or clearly unowned: some of the manager's work, a project for someone on leave, next year's strategy draft, an ambitious cross-team project, mentoring juniors.
5. **Give the champion material.** A wins doc, progress on the agreed gaps, and a one- to two-page written case.
6. **Start before the cycle.** Calibration often happens weeks before reviews are written; the conversation in review season is late.

**Promotion packet outline:**

```markdown
# Promotion case: <name>, <current level> -> <target level>
Summary (3 sentences): scope now, impact, why next level
Impact against business goals: 3-5 items, each with metric and evidence
Next-level behaviours shown: ladder criterion -> example -> evidence
Gaps agreed and how they were closed
Feedback from peers and partners (quotes they agreed to share)
Scope going forward
```

**Common traps:** assuming good work speaks for itself; listing tasks instead of outcomes; treating the conversation as a demand rather than joint problem-solving; waiting for review season.

**Reasons a deserving person isn't promoted:** minimum time in level, no open role at the next level, budget freeze, or a real gap not yet closed. Ask which applies. If someone is stuck for 2+ years despite doing all of this, moving company is a legitimate option ([job-search-and-outreach.md](job-search-and-outreach.md)).

## 4. Writing reviews as a manager

- Be specific: "cut deploy time 40% with the new CI pipeline", not "great job".
- Feedback is on behaviour, not personality ("the last three docs missed the rollout plan", not "you're careless").
- Development areas come with actions ("present the Q3 results at the all-hands"), not "improve communication".
- Nothing in the written review should surprise the person.
- Calibration prep: per person, proposed rating with evidence, the discussion points (borderline, new in level, role change), promotion candidates with evidence of next-level work. Company rating distributions vary; use your own company's guidance.

## 5. Turning growth into the next move

The brag doc feeds the resume (bullets), interviews (stories with their earned insight) and the LinkedIn profile (hand off to linkedin-automation). Refresh the resume each half-year from it, even when not looking.

## 6. Checklist

- [ ] Time range confirmed; sources scanned before drafting
- [ ] Every entry has action, result, evidence (or "evidence needed")
- [ ] No invented metrics, team sizes or scope; shared work credited honestly
- [ ] Self-review organised by impact theme with goals table
- [ ] Promotion case: ambition stated, 2-3 gaps agreed, monthly action plan, packet for the champion
- [ ] Drafts shown to the person before saving or sharing

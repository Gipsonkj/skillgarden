> Distilled from: prioritization-frameworks (phuryn/pm-skills, MIT), roadmap-update (anthropics/knowledge-work-plugins, Apache-2.0), product-manager-toolkit (alirezarezvani/claude-skills, MIT), write-spec (anthropics/knowledge-work-plugins, Apache-2.0)

# Prioritization

Prioritize problems (opportunities) first, then solutions. A score is a conversation tool, not an oracle: show the inputs so people can argue with them.

## 1. Choose the framework

| Need | Use | Why |
|---|---|---|
| Rank customer problems from survey data | Opportunity Score | Finds important + poorly served needs |
| Quick triage of 10–30 ideas | ICE | Three 1–10 scores, minutes to run |
| Defensible ranking of a large backlog across teams | RICE | Separates reach from impact; uses effort in person-months |
| Scope one release or quarter with stakeholders | MoSCoW | Forces "won't have" to be said out loud |
| Visual session with the team | Value vs Effort 2×2 | Shared picture of trade-offs |
| Choice between 2–5 options with several criteria | Weighted decision matrix | Makes weights explicit for buy-in |
| Understand what delights vs what is expected | Kano | For understanding, not ranking |
| Your own task list | Eisenhower (urgent × important) | Personal only |

## 2. Formulas and scales

**Opportunity Score** (Dan Olsen). Survey users on Importance and Satisfaction per need, normalise to 0–1.
- Opportunity = Importance × (1 − Satisfaction). Highest = best opportunity.
- Value created by a fix = Importance × (S_after − S_before).

**ICE.** Impact, Confidence, Ease, each 1–10. Score = I × C × E (some teams average them; pick one and say which). Use for early-stage or data-poor backlogs.

**RICE.** Score = (Reach × Impact × Confidence) ÷ Effort.

| Input | Scale |
|---|---|
| Reach | People or accounts affected per period (e.g. per quarter), a real count |
| Impact | 3 massive, 2 high, 1 medium, 0.5 low, 0.25 minimal |
| Confidence | 100% data-backed, 80% some evidence, 50% gut feel (below 50% = do discovery first) |
| Effort | Person-months, all functions (eng, design, data, QA) |

Example: Reach 10,000, Impact 3, Confidence 80%, Effort 5 → 10,000 × 3 × 0.8 ÷ 5 = 4,800.

**MoSCoW.** Must (the release fails without it: legal, security, core job, explicit promise), Should (important, workaround exists), Could (if capacity remains), Won't (this time, written down). Rough capacity split: Must ≤ 60%, Should ~20%, Could ~10–20%. If Musts exceed 60%, the scope is wrong.

**Value vs Effort quadrants.** Quick wins (do first), Big bets (scope carefully, validate ROI), Fill-ins (spare capacity), Money pits (remove).

**Weighted matrix.** List 3–6 criteria, weights summing to 100%, score options 1–5, multiply and sum. Agree weights before scoring.

**Kano categories.** Must-be (absence angers, presence unnoticed), Performance (more is better), Attractive (delights, unexpected), Indifferent, Reverse.

## 3. Process

1. **Gather candidates** with their source: support tickets, interviews, sales blockers, tech debt, strategic bets.
2. **Frame each as a problem or outcome**, not a feature name, where possible.
3. **Score** with the chosen framework. Write each input's evidence in a notes column.
4. **Run `scripts/product-manager-toolkit/rice_prioritizer.py`** for RICE on a CSV (see §4).
5. **Sanity-check the ranking:**
   - Sensitivity: does the top 5 change if any one estimate is off by 2×? If yes, that estimate needs data.
   - Portfolio mix: not all big bets, not all fill-ins. A common target: ~40% quick wins, ~30% big bets, ~20% fill-ins, ~10% buffer.
   - Dependencies: a high scorer blocked by a low scorer drags it up.
   - Strategy: does the top of the list serve this period's goals? If not, the goals or the scores are wrong.
   - Platform and tech-debt work is undervalued by RICE; reserve capacity instead of forcing it through the formula (see roadmaps).
6. **Validate effort with engineering** before publishing.
7. **Publish the decision with context:** what's in, what's out, and why. Revisit quarterly or when evidence changes, not weekly.

## 4. RICE script

`scripts/product-manager-toolkit/rice_prioritizer.py` (stdlib Python, no network).

```bash
python3 scripts/product-manager-toolkit/rice_prioritizer.py sample            # writes sample_features.csv
python3 scripts/product-manager-toolkit/rice_prioritizer.py features.csv --capacity 15   # person-months per quarter
python3 scripts/product-manager-toolkit/rice_prioritizer.py features.csv --output json   # or csv
```

CSV columns: `name,reach,impact,confidence,effort,description` where impact is `massive|high|medium|low|minimal`, confidence `high|medium|low` (100/80/50%), effort `xl|l|m|s|xs` (13/8/5/3/1 person-months). Output: ranked list, quick-win vs big-bet mix and a capacity-fitted quarterly plan. If the team estimates effort in real person-months, convert to the nearest T-shirt size or say the script's mapping was used.

## 5. Pitfalls

- Letting customers design solutions; prioritize the problem they describe.
- Scoring with false precision ("RICE 4,812.5") from guessed inputs; round and show confidence.
- Reach inflation: count users who will actually encounter the change in the period.
- Re-scoring until your favourite wins. Freeze inputs before the meeting.
- Everything is Must / P0.
- Ignoring opportunity cost of delay (a deadline-bound item can beat a higher score).

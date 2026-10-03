# Answering a data question end to end

> Distilled from: analyze (anthropics/knowledge-work-plugins, Apache-2.0), statistical-analysis (anthropics/knowledge-work-plugins, Apache-2.0), exploratory-data-analysis (K-Dense-AI/scientific-agent-skills, MIT), senior-data-scientist (alirezarezvani/claude-skills, MIT)

## Size the question

| Level | Example | Output |
|---|---|---|
| Quick lookup | "How many signups last week?" | One number with the exact definition and date range |
| Full analysis | "Why did conversion drop in March?" | Short write-up: answer first, evidence, caveats, next steps |
| Formal report / experiment readout | "Did the new onboarding work?" | Pre-stated hypothesis, method, effect size with CI, limitations, decision |

Don't produce a 10-chart report for a lookup, and don't answer a causal question with one number.

## Workflow

1. **Restate the question** as something measurable: metric, population, time window, comparison. Write down the definition of every metric (numerator, denominator, filters). If the user's wording is ambiguous ("active users", "revenue"), say which definition you used.
2. **Find and understand the data**: which tables, what grain, how fresh (see [data-profiling.md](data-profiling.md)).
3. **Pull the data** with the smallest query that answers it (see [sql.md](sql.md)). Keep the query.
4. **Sanity-check before interpreting** (checklist below).
5. **Analyse**: descriptives first, then segments, then tests or models only if the question needs them ([statistics.md](statistics.md), [experiments-causal.md](experiments-causal.md)).
6. **Visualise** only what supports the answer ([visualization.md](visualization.md)).
7. **Write up**: answer in the first sentence, then the evidence, then caveats, then what to do next.

## Validation checklist (before you report anything)

- Row counts make sense at each step; no unexpected drop or fan-out after joins.
- Totals reconcile to a known figure (finance report, dashboard, previous analysis) or the gap is explained.
- Date range is what you meant; partial periods (today, current month) are excluded or labelled.
- Nulls and placeholder values handled explicitly.
- Units and currency consistent; time zones consistent.
- Percentages: the denominator is the right population; percentages of segments add to 100% where they should.
- Averages of averages avoided; ratios recomputed from summed numerators and denominators.
- Outliers checked: does one customer or one day drive the result?
- The result survives a simple alternative cut (median instead of mean, excluding the top account, a different week).
- The magnitude is plausible. If a metric moved 40%, look for a data or definition change before celebrating.

## Traps to name explicitly

- **Simpson's paradox**: an overall trend reverses inside every segment because the mix changed. Check the main segments before concluding.
- **Survivorship bias**: analysing only customers who stayed, campaigns that ran to completion, users who answered the survey.
- **Selection bias**: comparing users who opted in to a feature with those who didn't is not a measure of the feature's effect.
- **Regression to the mean**: extreme periods tend to be followed by more normal ones, with or without your intervention.
- **Correlation vs causation**: say "associated with" unless there was randomisation or a credible quasi-experimental design.
- **Multiple comparisons**: slicing 20 segments will produce one "significant" difference by chance.

## Writing the answer

- Lead with the answer and its size: "Conversion fell from 3.1% to 2.6% (−0.5 pp) in March, almost entirely on mobile Safari."
- Give uncertainty: ranges, confidence intervals, sample sizes.
- Separate what the data shows from what you infer.
- State the caveats that could change the conclusion, not every caveat.
- Give a concrete next step (decision, follow-up query, experiment).
- Include the queries or notebook so the result can be reproduced.

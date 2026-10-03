> Distilled from: literature-review (K-Dense-AI/scientific-agent-skills, MIT), systematic-literature-review (bytedance/deer-flow, MIT), orx-lit-review (alphaXiv/OpenResearch, MIT), deep-research (199-biotechnologies/claude-deep-research-skill, MIT)

# Literature reviews: screening, extraction, synthesis

Use for narrative, scoping and systematic reviews, and for "survey the field on X" requests. Search itself is in literature-search.md; citation handling in citations.md.

## Pick the review type

| Type | When | Must have |
|---|---|---|
| Quick summary | "What's known about X?" in an afternoon | 5-10 key papers, stated search scope, citations per claim |
| Narrative / survey | Field overview, thesis chapter, related-work section | Thematic structure, transparent search, balanced coverage |
| Scoping review | Map what exists, find gaps; no quality grading needed | Protocol, PRISMA-ScR flow, charting table |
| Systematic review | Answer a focused question with all eligible evidence | Registered protocol (e.g. PROSPERO), ≥2 databases, dual screening, risk-of-bias, PRISMA 2020 |
| Meta-analysis | Pool comparable quantitative effects | All of the above plus effect-size extraction and heterogeneity analysis (only with a statistician-level plan) |

Default for agent work: a transparent narrative review of about 20 papers (cap 50), APA or the user's style. Don't call it "systematic" unless it meets that bar.

## Seven phases

1. **Plan:** question, inclusion/exclusion criteria (population, design, outcomes, years, language), databases, protocol written down before screening.
2. **Search:** per literature-search.md; log every query.
3. **Screen:**
   - Deduplicate first.
   - Title/abstract screening against the criteria; when in doubt, include for full text.
   - Full-text screening with a reason for each exclusion.
   - Keep counts of records (search hits), reports (documents) and studies (a study can have several reports) separate; PRISMA needs all three.
   - Systematic reviews: two independent screeners at least at full text, with disagreements resolved and agreement reported. An agent can be one screener, not both.
4. **Extract:** one row per study in a table (CSV) with fixed columns: citation, design, sample/setting, intervention/exposure, comparator, outcomes, key results with effect sizes and uncertainty, limitations, funding/conflicts. For non-empirical papers: research question, method, 3-5 key findings, limitations.
5. **Appraise quality:** a named tool fitted to the design (RoB 2 for RCTs, ROBINS-I for non-randomised interventions, Newcastle-Ottawa for observational, QUADAS-2 for diagnostic accuracy, AMSTAR 2 for reviews, CASP checklists generally). Grade certainty of a body of evidence with GRADE when making recommendations.
6. **Synthesise:** by theme, not paper by paper (see below).
7. **Verify and write:** check every citation (citations.md), then write and produce the PRISMA flow diagram if relevant.

## Synthesis

- Group into 3-6 themes or research questions. For each: what the evidence shows, how strong and consistent it is, and where studies disagree and why (populations, methods, measures).
- Compare, don't list: "Three RCTs (n=1,240) found..., while two cohort studies reported..., likely because...".
- Separate findings from interpretations; quantify where possible (effect sizes, ranges, counts of studies).
- Name the gaps: populations, methods, outcomes or settings that are missing, and contradictions that need a decisive study.
- Weight by quality and size, not by how often a claim is repeated.
- Where a figure carries the argument, describe or reproduce the original figure (with credit) rather than inventing a summary graphic.

## Output structure

```
Title
Abstract / executive summary (200-400 words)
1. Introduction: question, why it matters, scope
2. Methods: databases, queries, dates, criteria, screening, appraisal tool
3. Results: study flow (PRISMA counts), study characteristics table
4. Thematic synthesis (one section per theme)
5. Discussion: overall strength of evidence, gaps, limitations of this review
6. Conclusions and future directions
References (verified)
Appendix: search strings, extraction table
```

## Pitfalls

- One database; no record of queries; undisclosed date of search.
- Treating "DOI exists" as "paper supports the claim": open the paper.
- Study-by-study summaries with no synthesis.
- Mixing preprints with peer-reviewed results without flagging.
- Over-claiming from a scoping or quick review ("the literature proves...").
- Fabricated or padded references to reach a target count.

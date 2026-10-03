> Distilled from: scientific-writing (K-Dense-AI/scientific-agent-skills, MIT), research-paper-writing (Master-cai/Research-Paper-Writing-Skills, MIT), nature-writing (Yuan1z0825/nature-skills, Apache-2.0)

# Scientific writing: integrity, reporting, style

Section-by-section structure for papers is in paper-sections.md. This file is the rules that apply everywhere.

## Integrity rules (non-negotiable)

- Never fabricate data, results, statistics, p-values, sample sizes, quotes, references, ethics approvals, trial registrations or author contributions. Missing values become `[DATA NEEDED: ...]`.
- Keep the user's unpublished data and manuscripts confidential: don't paste them into external services without permission.
- Report what was done, including failed or changed analyses; label post-hoc analyses as exploratory.
- Associations are not causes. Observational results use "associated with", not "caused", "led to" or "reduced", unless the design supports causal inference and you say why.
- Non-significant is not "no effect": report the estimate and its interval.
- Disclose AI assistance as the target journal requires (usually in methods or acknowledgements; AI is never an author).

## Evidence binding

For anything longer than a page, keep a claim–evidence map while drafting:

| Claim ID | Claim (one sentence) | Evidence ID(s) | Source (figure, table, citation) | Strength |
|---|---|---|---|---|
| C001 | ... | E001, E004 | Fig. 2b; Smith 2024 | direct / indirect / none |

Mark claims in drafts (`[claim:C001] [evidence:E001]`) and remove markers at the end. Before delivery, every claim needs evidence or must be softened or cut.

## Statistics in text

- Effect size with uncertainty: "mean difference −4.2 mmHg (95% CI −6.1 to −2.3)", then the p-value if used (exact, e.g. p = 0.003, not "p < 0.05").
- Give absolute and relative effects for risks: "12% vs 8% (risk ratio 0.67, 95% CI 0.52-0.86); 4 fewer events per 100".
- State n for every analysis and how missing data were handled.
- Name the test and software (with version). Correct for multiple comparisons or say why not.
- Units throughout (SI), consistent decimals, no "trend towards significance".

## Reporting guidelines (check the one that fits the design)

| Design | Guideline |
|---|---|
| Randomised trial | CONSORT 2025 (protocol: SPIRIT 2025) |
| Systematic review / meta-analysis | PRISMA 2020 (scoping: PRISMA-ScR) |
| Observational (cohort, case-control, cross-sectional) | STROBE |
| Diagnostic accuracy | STARD 2015 (AI: STARD-AI) |
| Prediction models | TRIPOD+AI |
| Case reports | CARE |
| Animal research | ARRIVE 2.0 |
| Quality improvement | SQUIRE 2.0 |
| Economic evaluation | CHEERS 2022 |
| Qualitative | SRQR / COREQ |

Find the latest versions at the EQUATOR Network. Fill the checklist with page/line numbers before submission.

## Style

- One message per paragraph, stated in its first sentence; the rest supports it. Test with a reverse outline: list each paragraph's first sentence; it should read as the argument.
- Short, concrete sentences; active voice where it is clearer ("We measured..."); define each abbreviation at first use and keep the count low.
- Consistent terms: pick one name for each concept and never vary it for style.
- Hedge to match evidence: "suggests" for indirect or single-study evidence, "shows" for direct, replicated evidence.
- Cut filler: "it is worth noting that", "in order to", "plays a crucial role", "novel" (show novelty instead).
- Figures: each has one point, stated in the caption's first sentence; axis labels with units; colour-blind-safe palettes; error bars defined.
- Tables: booktabs style (no vertical lines), caption above, units in headers, consistent decimals.

## Authorship and declarations

- Authorship per ICMJE criteria; contributions in CRediT roles.
- Required statements usually include: funding, conflicts of interest, data and code availability, ethics approval and consent, trial registration, AI use. Ask the user for the real content; never draft fictional approvals.

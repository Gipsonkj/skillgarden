> Distilled from: peer-review (K-Dense-AI/scientific-agent-skills, MIT), research-paper-writing (Master-cai/Research-Paper-Writing-Skills, MIT)

# Reviewing a manuscript, proposal or preprint

Use for peer-review reports, pre-submission critique of the user's own paper, and journal-club style appraisals.

## Gate first

- **Authorisation and confidentiality.** A manuscript under review is confidential. Confirm the user is the assigned reviewer or the author, and that the journal's policy allows AI assistance. If it doesn't, or if it's unclear, review only the user's own work or give general guidance. Never upload confidential manuscripts to external tools.
- **No decisions.** Output is a draft for the human reviewer. Don't recommend accept/reject unless the user asks, and then present it as a suggestion with reasons.
- **Neutral reading.** Separate what the paper claims from whether the evidence supports it; don't let the authors' framing or prestige set the bar.

## Workflow

1. **Orientation map (before judging):** the question, design, data, main claims, key figures/tables, and what would change if the claims are true. Two or three sentences each.
2. **Claim–evidence matrix:** fill `templates/peer-review/claim_evidence_matrix_template.csv` with one row per important claim: `claim_id, location, claim_type, claim_summary, evidence_ids, support_level (supported / partly_supported / unsupported / unclear), alignment_issue, limitation, requested_action`. Replace the synthetic example rows.
3. **Methods review**, in this order:
   1. Is the question clear and is the design able to answer it?
   2. Unit of analysis: are replicates independent (cells vs animals vs patients; repeated measures; clustering)?
   3. Sampling and selection: who got in, who didn't, and could that bias the result?
   4. Sample size: power or precision justification; were stopping rules pre-set?
   5. Missing data and attrition: how much, handled how?
   6. Analysis: right model for the data; assumptions checked; confounders addressed; pre-registered vs post-hoc.
   7. Multiplicity: many outcomes, subgroups or tests without correction.
   8. Effects and uncertainty: effect sizes with intervals, not just p-values; non-significance is not equivalence.
   9. Interpretation: do conclusions stay within the data (population, causal language, generalisation)?
4. **Reproducibility:** data and code availability, reagent/version details, protocol and reporting checklist (see scientific-writing.md for the guideline per design).
5. **Presentation:** figures readable and honest (axes, error bars defined, no truncated axes hiding effects), clear abstract, consistent numbers between text, tables and figures.
6. **Write the report.**

## Report format

```
Summary (3-5 sentences, neutral): what the study did and claims.
Overall assessment: main strengths; the 2-4 issues that most affect the conclusions.
Major comments (numbered): issue → why it matters → specific request (analysis, data, rewording).
Minor comments (numbered): clarity, presentation, references, typos with locations.
Questions for the authors.
[Confidential comments to the editor, only if asked.]
```

Be specific (page, line, figure), constructive and proportionate: ask for what would change confidence in the conclusions, not for a different study. Tone: critique the work, never the authors.

## Frequent problems to check

- Pseudo-replication (technical replicates treated as biological ones).
- Causal wording from observational data; reverse causation not considered.
- Circular analysis (selecting on the outcome, double-dipping in neuroimaging/omics).
- Data leakage between training and test sets; tuning on the test set; benchmark contamination.
- Weak or untuned baselines; missing ablations; single seed.
- Subgroup claims without interaction tests.
- p-hacking signs: many outcomes, p-values clustered just under 0.05, unexplained exclusions.
- Overstated novelty; missing key prior work.
- Inconsistent n across figures; percentages that don't match counts.

## Reviewing the user's own draft

Same checks, plus the five-dimension self-review in paper-sections.md. End with a prioritised fix list: what would a sceptical reviewer attack first?

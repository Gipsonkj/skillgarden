> Distilled from: hypothesis-generation (K-Dense-AI/scientific-agent-skills, MIT), scientific-writing (K-Dense-AI/scientific-agent-skills, MIT)

# Hypotheses and study design

Use when the user has an observation or question and wants testable hypotheses, a study plan, or help choosing a design.

## Keep these objects separate

| Object | What it is |
|---|---|
| Observation | What was seen, with source and conditions, without interpretation |
| Question | What we want to know |
| Hypothesis | A proposed explanation that could be wrong |
| Mechanism | The causal pathway the hypothesis implies |
| Estimand | The exact quantity to estimate (population, contrast, outcome, time) |
| Prediction | An observable result expected if the hypothesis is true, and not if rivals are |
| Rival hypotheses | Other explanations for the same observation |
| Null | The no-effect or no-difference statement for a statistical test |
| Negative / positive controls | Conditions where the effect should be absent / present |
| Operationalisation | How each concept is measured |

Mixing these is the most common error: a restated observation is not a hypothesis, and a hypothesis is not a prediction.

## Workflow

1. **Safety gate.** Decline or redirect work that would enable serious harm (pathogen enhancement, weapons-relevant chemistry, unethical human experimentation). Human or animal studies need ethics approval; say so.
2. **Freeze the observation.** Write it down exactly, with source, date, conditions and how reliable it is.
3. **Frame the question.** PICO/PECO for applied questions; FINER check (Feasible, Interesting, Novel, Ethical, Relevant).
4. **Bounded literature check.** Search (literature-search.md) and record the boundary. Say "not located within the documented search (PubMed, OpenAlex, 2026-10-03)", never "no one has studied this".
5. **Generate hypotheses and rivals.** For each candidate explanation, list rival classes explicitly:
   - artefact or measurement error, batch effects
   - confounding
   - selection bias, collider bias
   - reverse causation
   - chance / regression to the mean
   - a different mechanism producing the same pattern
6. **Classify the claim:** descriptive, associational, causal, mechanistic or predictive. The design must match the claim type.
7. **Write discriminating predictions.** For each, fill a row of `templates/hypothesis-generation/prediction_rival_matrix_template.csv`: conditions, observable, expected if focal, expected if rivals, falsifier, what counts as indeterminate, boundary conditions, measurements, negative controls, analysis, uncertainty. A prediction that every rival also makes is useless; drop or sharpen it.
8. **Track sources.** `templates/hypothesis-generation/evidence_ledger_template.csv`: one row per source with the claims it bears on and whether it supports, challenges or only contextualises them. Keep challenging evidence. Replace the synthetic example rows.
9. **Design the test** (below) and **pre-register** the hypotheses, primary outcome, sample size and analysis (OSF, AsPredicted, ClinicalTrials.gov, PROSPERO for reviews).

## Choosing a design

| Claim | Strongest practical designs |
|---|---|
| Causal effect of something you can assign | Randomised experiment / RCT; factorial or crossover where suitable |
| Causal effect you can't assign | Natural experiment, instrumental variables, regression discontinuity, difference-in-differences, target-trial emulation with careful confounder control |
| Mechanism | Manipulate the intermediate step; dose-response; knock-out/knock-down with rescue |
| Association / prevalence | Representative cross-sectional or cohort sampling |
| Prediction | Development plus external validation; report calibration as well as discrimination (TRIPOD+AI) |

Design essentials: randomisation and allocation concealment; blinding where possible; pre-specified primary outcome; sample size from a justified effect size (not a convention); controls that would reveal artefacts; the unit of analysis matching the unit of randomisation.

## Output

```
Observation (frozen) and question
Search boundary
Hypotheses H1..Hn with mechanisms and claim type
Rivals and how each would be ruled out
Prediction–rival matrix (CSV)
Proposed study: design, population, measures, controls, sample size reasoning, analysis plan
Risks, ethics, and what result would change our mind
Evidence ledger (CSV)
```

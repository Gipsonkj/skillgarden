> Distilled from: research-paper-writing (Master-cai/Research-Paper-Writing-Skills, MIT), nature-writing (Yuan1z0825/nature-skills, Apache-2.0), scientific-writing (K-Dense-AI/scientific-agent-skills, MIT)

# Writing a paper section by section

Order of work: figures and the main result first, then methods and results, then introduction and discussion, abstract and title last. Write in full paragraphs; bullet lists belong only in drafts.

## Title

Specific and informative: the finding or the method plus the problem. Avoid questions, puns and unexplained abbreviations. Under ~15 words for most venues.

## Abstract

Pick one shape and keep it to the venue limit (often 150-250 words):

| Shape | Moves |
|---|---|
| Challenge → contribution | Context; the gap; what we did; main result with numbers; implication |
| Challenge → insight → contribution | Context; why existing approaches fail; our key insight; method; results; implication |
| Several contributions | Context and gap; contribution 1, 2, 3 each with its evidence; overall implication |
| Structured (clinical) | Background, Methods, Results, Conclusions with numbers in Results |

Nature-style summary paragraph: broad field (1 sentence), more specific background (2-3), the problem (1), "Here we show" + main result (1-2), what it changes (1-2), broader context (1).

## Introduction (ML / engineering papers)

A chain where each step forces the next:
1. The task and why it matters.
2. How progress is measured (metrics, benchmarks).
3. Where the current best methods fail, with evidence.
4. The root cause of that failure.
5. Our solution, aimed at that cause.
6. Why it should work (intuition).
7. Contributions as a short list, each testable and pointing to its section.

For empirical sciences: known → unknown → why it matters → the question/hypothesis → approach in one sentence.

## Related work

Grouped by approach, not a paper list. For each group: what it does, its limitation relative to our problem, and how we differ. Be fair and current; reviewers notice missing obvious baselines.

## Methods

Enough detail to reproduce: data sources and inclusion criteria, sample size reasoning, design, materials and versions, procedures, outcomes and their definitions, statistical analysis plan (pre-specified vs exploratory), ethics. For methods papers: problem setup and notation, then the method with a figure, each component motivated, complexity and implementation details (with hyper-parameters in an appendix).

## Results

- Lead each paragraph with the finding, then the numbers, then the figure/table reference.
- Report in the order of the questions, not the order analyses were run.
- Experiments section for ML: main comparison against strong, fairly tuned baselines; ablations isolating each component; generalisation (other datasets, scales, settings); efficiency; qualitative examples including failure cases.
- No interpretation beyond what the numbers say; that goes in the discussion.

## Discussion

1. Main finding in one or two sentences, answering the question from the introduction.
2. How it fits or conflicts with prior work, and plausible reasons.
3. Mechanisms or explanations, clearly marked as interpretation.
4. Limitations that matter (design, sample, measurement, generalisability) and what they imply for the conclusions.
5. Implications and specific next studies.
End without overreach: the conclusion should be no stronger than the weakest essential step.

## Self-review before submission

Score each 1-5 and fix anything under 4:

| Dimension | Ask |
|---|---|
| Contribution | Is it clear what is new and why it matters, in one sentence? |
| Clarity | Does the reverse outline read as an argument? Are terms defined and consistent? |
| Experimental strength | Strong baselines? Ablations? Variance across seeds/replicates? |
| Evaluation completeness | All claims tested? Right metrics? Failure cases shown? |
| Method soundness | Assumptions stated? Leakage, confounding or circularity ruled out? |

Common rejection reasons to pre-empt: unclear novelty, weak or missing baselines, overclaiming, missing ablations, poor reproducibility details, ignoring closely related work, writing that hides the main point. Produce a claim–evidence map (scientific-writing.md) as the final check.

# Assessments, rubrics and feedback

> Distilled from: assessment-architect, its item-writing, rubric and agent references and templates (YujxZJCN/teaching-skills, MIT); universal-diagnostic-tutor and its feedback reference (SenmuuuuW/universal-diagnostic-tutor-skill, MIT); course-export and learning-objectives (savvides/idstack, MIT); the two-lane approach to AI and assessment as published by the universities of Bath, Sydney and Auckland (web guidance, written here in our own words).

Quizzes, exams, question banks, projects, rubrics, feedback on work, and reading the results afterwards. For short formative checks use [checks-for-understanding.md](checks-for-understanding.md).

## 1. Blueprint before items

A test written question by question measures whatever was easy to ask. Build a blueprint and get it confirmed before drafting any item; someone in a hurry gets a short blueprint, not none.

```markdown
## Test blueprint: <title>
Duration <min> · Conditions <closed/open book, calculator, platform> · Weight <%>

| ILO | Outcome | Bloom level | Points |
| Content area (taught in) | Remember | Apply | Analyse | Points | % |
| Trees and balancing (wk 4-6) | 4 x MC = 8 | 1 x problem = 12 | - | 20 | 25% |

Emphasis check: each row's % vs its share of teaching time
Level-honesty flags: ILOs whose level the planned formats can't measure
Time budget: MC ~1-1.5 min · short answer ~3-5 · problem ~8-15 · essay ~20-30 (adjust); target <= 90% of duration
Extra-time version: how it is produced (same paper, longer clock; or a reduced-length variant)
```

Every item carries an ILO id and Bloom level. An item that maps to no outcome is a defect to fix or cut, not a bonus.

## 2. Item-writing rules

| # | Rule | Fix for the usual failure |
|---|---|---|
| 1 | One construct per item | "Define X and state its complexity" becomes two items |
| 2 | The stem asks a complete question before options are read | Not "Binary search trees: a) ..." |
| 3 | No double negatives; avoid negative stems, bold NOT when unavoidable | "Which is stable?" instead of "Which is not non-stable?" |
| 4 | Options parallel in form, length and grammar | The longest, most qualified option is a known giveaway |
| 5 | Each distractor encodes a real misconception (log which, teacher-side) | No filler like "the algorithm crashes" |
| 6 | No "all/none of the above" by default | Use a fourth real distractor, or multiple-select with a stated count |
| 7 | No absolute or hedge cues | "always/never" only in distractors, or "may" only in the key, gives it away |
| 8 | Difficulty from the construct, not from parsing | State non-default conditions prominently |
| 9 | Items independent | Item 7's stem must not state item 3's answer |
| 10 | Only taught content | Cut it or flag the alignment break; never "they should know it" |
| 11 | Numeric distractors are computed wrong paths | Sign error, off-by-one, wrong formula; not 41, 43, 44 around 42 |
| 12 | Options in logical order (numeric, chronological) | 3, 8, 17, 42 rather than 17, 3, 42, 8 |

A discipline's own convention overrides a rule here; note the override.

**Formats**
- **Multiple choice:** 3-5 options, 4 by default; a sharp 3-option item beats a 4-option item with a dead distractor.
- **Multiple select:** state the count ("select TWO") or say it is unstated; declare all-or-nothing or per-option scoring.
- **Short answer:** state length and form ("one sentence", "an expression in n"); the key lists required elements and acceptable phrasings.
- **Problem:** units, precision, work to show, tool conditions on the item; per-step points and a carry-forward policy so an early slip doesn't zero the attempt.
- **Essay:** name the construct and criteria in the prompt; two focused essays usually measure better than one broad one; the key is an exemplar sketch plus rubric mapping.
- **Oral:** fixed core questions per outcome, a defined probe ladder ("if stuck, prompt with X, costs one level"), a time box, and a score sheet filled during, not after.

**Higher-order items** need more than recall phrasing:
- Scenario stems: a new case where concepts must be applied.
- Data interpretation: a table, plot or output; what it shows or what's wrong.
- Error finding: a worked solution with a planted misconception.
- Two-tier: a choice, then a separately scored justification (catches right answer, wrong reason).
- Best answer: all options defensible, one best by a criterion the stem names.

**Question banks and parallel forms:** variants may change surface numbers (same difficulty band), names, contexts, option order and dataset instance. They must keep the construct, Bloom level, solution structure, step count, the misconceptions the distractors encode, and units. Give each family an id, serve one member per learner, and work a separate key for every variant.

## 3. The answer key is worked, not copied

Solve every item from scratch. Where your worked answer differs from the intended one, report both: the discrepancy is the finding. Mark anything you can't fully verify (domain facts, computed values, conventions) `[VERIFY: what to check]`. A confident wrong key is the worst thing this work can produce. Keep the key in a separate document from the learner copy.

## 4. Rubrics

| Type | Shape | Use when |
|---|---|---|
| Analytic | Criteria x levels grid | Multi-part work, several graders, high weight, diagnostic feedback wanted |
| Holistic | One scale of whole-work descriptors | Short single-construct responses, one grader, speed matters |
| Single-point | One "meets" descriptor with open "exceeds" / "not yet" margins | Drafts, milestones, feedback-rich low-stakes work |

Descriptor rules:
1. **Observable qualities, not an adverb ladder.** Not "very thorough / thorough / somewhat thorough" but "examines all three cases incl. boundary conditions / all three, no boundary conditions / one or two cases".
2. **About the work, never the person:** "argument lacks counter-evidence".
3. **Parallel structure** across levels, same aspects in the same order.
4. **Top level achievable** by real strong work, not mythical.
5. **Learner-facing language** using only taught terms; the rubric ships with the brief.

Defects to fix: double-barrelled rows ("clarity and accuracy"), hidden criteria graders use but no row states, level gaps where real work fits nowhere, more than about 7 criteria, rows tracing to no outcome, levels named A/B/C/D (graders pick the grade first). Aim for 4-7 criteria traced to outcomes.

**Calibrating several graders (about an hour):** walk the rubric and the line between the top two levels; everyone scores the same anchor paper alone; compare cell by cell and settle every 1-level divergence, recording the ruling; score a second anchor and check agreement tightened (if not, fix the rubric). During grading, spot-check a sample per grader; drift of more than one level on more than 20% of the sample triggers a re-norm. Use 3-5 real anonymised anchors spanning the range, one borderline.

## 5. Project and assignment briefs

Write them in the Transparency in Learning and Teaching shape: **Purpose** (what learners will show they can do, and why it matters in the field), **Task** (deliverable, form, size limits, inputs, milestones with dates and the feedback each milestone gets), **Criteria** (3-6 bullets, the same promises the rubric scores, no hidden criteria), then logistics and an AI-use box. Group work adds roles, an individual-accountability mechanism (an individually graded part or contribution statement) and a peer-assessment form.

## 6. AI-era integrity: two lanes

Sort every graded task into a lane and print the lane in the brief, with the reason.

| Lane | Conditions | What it certifies |
|---|---|---|
| Secure | Supervised and in person (invigilated exam, live oral, practical, in-class task); AI off | That the learner can do it alone: the outcomes someone must be able to vouch for |
| Open | AI allowed or expected; the rule is written per task | Judgment with the tools: what was asked, what was checked, what was changed, what the learner added |

- **Ask first:** could a current chatbot complete this to a pass with a few prompts and no course context? Most unsupervised text or code products: yes. Such a task is open lane, or it moves to secure.
- **Cover every outcome that must be certified with at least one secure task.** Secure assessment is scarce, so place it at the key progression points of a course or programme, not in every unit; most coursework is open lane. Remote proctored exams are hard to secure reliably: count them as open.
- **A "not allowed" rule on an unsupervised task is unenforceable** and only penalises honest learners. Declare instead: allowed with disclosure (which tool, what was asked, what was changed), or expected and graded on judgment (verification of output, what the learner added).
- **Design the open lane as windows onto learning:** drafts, plans, code commits, lab records, seminar contributions, a short oral check; grade the errors found and revisions made, not only the final product. Give learners guidance on effective and responsible use, formative feedback, and where sensible a resubmission.
- **Redesign options for a vulnerable task, each with its cost:** a supervised component; staged process evidence; personal or class-specific inputs (own data, a class discussion, a local case); sampled short oral defences.
- **Equity:** don't make a paid tool a requirement, don't list permitted uses in over-prescriptive detail, and give an alternative route to a learner with an ethical objection or an accessibility need.
- Never recommend AI-detection tools; they are unreliable and biased against non-native writers. Never call an assessment "AI-proof".

## 7. Feedback on work

| Label | Use when |
|---|---|
| Correct | Result and essential reasoning meet the criteria |
| Mostly correct | Core method and result sound; justification, notation or completeness fragile |
| Partially correct | A meaningful part right; an important step, condition or conclusion wrong or missing |
| Incorrect | The core concept or method isn't met |
| Cannot grade yet | Reasoning required but missing; ask for one narrow piece (the step where the method was chosen) |

Feedback contains, in order: the verdict; what is right and should be kept; the earliest important gap and why it matters; whether it is a slip (needs a check habit) or a conceptual error (needs model repair); one specific next step or near-match practice item. Explain why the right answer is right, not just that it is. Preserve a correct setup when a later calculation fails; never upgrade an unsupported answer, never downgrade sound reasoning for one slip. Unofficial tutoring feedback never turns labels into official scores.

## 8. After the test: item analysis

From an item-by-learner results table:
- **Difficulty p** = proportion correct (partial credit: mean score / max).
- **Discrimination:** point-biserial against total minus the item; with small or rough data, the upper-lower 27% method. Name the method used.
- **Distractors** (needs response letters): an option nobody picks is dead weight; one that attracts the top group signals ambiguity or a miskey.

Flags: p above 0.95 (fine as a warm-up, useless if meant to discriminate); p below 0.25 (check for a miskey, untaught content or an ambiguous stem before concluding "hard"); negative discrimination (almost always an item defect, highest priority). With fewer than 30 learners, label everything "indicative only" and don't drive regrades from discrimination alone. For each flagged item recommend fix, drop and regrade (show the score impact) or keep; the teacher decides. Report aggregates only, never named individuals. Deeper statistics: `data-analysis` → `references/statistics.md`.

## 9. Accommodations

Turn an already-granted accommodation (extra time, alternative format, reduced distraction, assistive technology) into a modified version with equivalent rigor. Never decide eligibility, never name the condition on the materials, and mark the modified version for teacher verification.

## Checklist

- [ ] Blueprint confirmed before items; every item tagged with ILO and Bloom level
- [ ] Items pass the 12 rules; distractors from misconceptions; variants keep the construct
- [ ] Key worked independently; discrepancies and `[VERIFY]` items listed
- [ ] Rubric type fits; descriptors observable; graders calibrated on anchors
- [ ] Each graded task labelled secure or open lane with its AI rule; every outcome that must be certified has a secure task; no detectors
- [ ] Feedback specific, kind, and ends with one next step
- [ ] Item analysis reads items first, states N and method, aggregates only

# Checks for understanding

> Distilled from: k12-check-for-understanding and its maths and verification references (anthropics/k12-teacher-skills, Apache-2.0); k12-lesson-plan-creation (same repo, Apache-2.0); tutor and its quiz rules (bevibing/tutor-skills, MIT); teach (mattpocock/skills, MIT); book-study (sanyuan0704/sanyuan-skills, MIT).

A check for understanding (CFU) is a five-minute read of where a group is, used to decide what to teach next. It is read for what it reveals, not scored. Exit tickets, hinge questions, quick polls and one-question checks in a tutoring chat are all CFUs.

## 1. Scope it small

- **1-3 items.** One item that discriminates beats three that don't.
- **One learning component.** A standard or objective holds several separable ideas; pick the most assessable one (a real decision point where learners split) and say which and why before writing items. When working for a teacher, confirm the focus with them first.
- **Pick the rigor from the objective's verbs:** *understand, explain, represent* → conceptual; *fluently, compute, solve* → procedural; *use to solve real problems* → application.

| Rigor | Format |
|---|---|
| Conceptual | Multiple choice, multiple select or short constructed response, whichever shows understanding rather than computation; include a representation (diagram, number line, model) |
| Procedural | Constructed response first; at most one multiple-choice item; show work, or give a partly worked or error-containing example |
| Application | Constructed response with the approach and reasoning visible |

## 2. Distractors come from misconceptions, before the stem

Build a map first: for each documented or likely error, ask what a learner reasoning that way would do here, and what the stem must contain to let them do it.

```markdown
| Error pattern | Prerequisite gap or on-level confusion? | Stem feature needed |
|---|---|---|
| Adds numerators and denominators | Prerequisite (fraction as a quantity) | Unlike denominators, small numbers |
| Treats denominator as a count of parts, not their size | On-level | Two fractions with the same numerator |
```

Then write the item so each distractor is where one named error lands. A distractor invented after the stem comes out merely wrong, and discriminates nothing.

- At least one distractor reflects a prerequisite gap and at least one an on-level confusion, so responses route to different next steps.
- At least one item lets a learner reach the right answer by a faulty method, or exposes partial understanding, so "correct" isn't automatically "got it".
- Constructed-response items ask for the reasoning: "How do you know?" for younger learners, "Explain how you decided" for older ones.

## 3. Write clean items

- **No clue in the format:** the key is not the longest, most specific or only qualified option. Make options the same length in words where possible; randomise the key's position.
- **No hints in labels or descriptions:** "Standard error stream", not "Error output stream used for error classification".
- **No "(recommended)" or bold on an option,** no annotation that names the error or next step on the learner copy.
- **Ask about behaviour, purpose or output** rather than echoing the answer's words in the stem.
- **Learner-facing language at the learners' level:** taught terms stay (numerator, denominator), everything else in words they already use ("split into 4 equal parts", not "partitioned into fourths"). Sentence length around 8 words in K-2, 12 in grades 3-5, 15 in grades 6-8.
- **Figures state in words what they show,** and what a picture can't settle, the stem says ("which expression shows the number of groups times the size of each group?").
- **Numbers in the expected range:** too large turns a concept check into arithmetic; too small lets learners count.

## 4. Two gates before you hand it over

Run both on the written item, not on what you meant to write. If you can, give a fresh reader (a subagent) only the learner copy and ask which answers it can defend.

**Gate A: exactly one defensible answer.** For every option, write one line making the strongest case that it is correct, using only the stem and figure. Count survivors.
- Two or more → name the deciding property in the stem, or remove the option.
- None → a figure isn't described in words, or the key is wrong.
- Common sources of a second right answer: factor order (`a × b` vs `b × a`); equivalent forms (`1/2`, `0.5`, `2/4`, `50%` among the options); a correct verdict with different justifications; rounding, units or precision the stem never fixed.

**Gate B: every distractor is reachable.** Compute the stem's actual quantities (differences, ratios, totals) with a quick calculation. Then apply each named error to those numbers and check it lands on its own option.
- Lands elsewhere → fix the option or the claim.
- Can't be applied to this stem → replace the distractor with one this stem produces.
- Example failure: totals 45, 70, 95, 120 differ by a constant 25, so a distractor saying "the total does not increase by the same amount" is false about the table and no reasoning reaches it.

## 5. The teacher guide: response → next step

For each item:

1. **What each response reveals,** as observable behaviour: "adds the denominators as well as the numerators", not "doesn't understand fractions".
2. **The next step:** label it prerequisite gap (route to the named prior skill or standard, never "review earlier work") or on-level confusion (a specific sub-skill, representation or task type).
3. **Across the group:** a shared pattern pointing to one prior gap (reteach that group together) versus scattered confusions (confer individually). If two responses route to the same next step, the item isn't working.

Use asset-based language throughout: describe what learners do, never "weak", "low", "behind", "struggling".

## 6. Exit tickets and hinge questions

- **Exit ticket:** the last few minutes of a lesson; the lesson's hardest case, chosen so a learner with the main misconception gets it wrong. Sort into *Got it* / *Almost there* / *Needs re-teaching* with written criteria. Tomorrow's groups come from the piles.
- **Hinge question:** one multiple-choice item at the pivot of a lesson, answered by everyone at once (mini whiteboards, fingers, a poll). Decide before asking what you'll do for each option, so the decision takes seconds.
- **In a tutoring chat:** one check at a time, then stop and wait. A correct answer gets "why?" or a near-transfer item before you move on ([tutoring.md](tutoring.md)).
- **Self-assessment:** ask learners to rate confidence (solid / mostly there / shaky / lost) before revealing results. High confidence with a wrong answer is a fluency illusion worth naming.

## 7. Output

Two documents, kept apart:

```markdown
# Learner copy
Name ______  Date ______
1. <stem>   A ...  B ...  C ...  D ...
2. <prompt> Explain how you decided. ______

# Teacher guide
Standard / objective (verbatim) · Level · Rigor · Focus component · Prerequisites (codes) · Leads to
## Item 1   Key: B
| Response | What it shows (behaviour) | Gap type | Next step |
Across the group: ...
```

The learner copy has prompts, choices and response space only: no key, no error labels, no source names. Item text and option order are identical in both copies.

## Pitfalls

- A ten-question quiz called a "quick check". That is a different job ([assessments-and-feedback.md](assessments-and-feedback.md)).
- Distractors that are random wrong numbers instead of computed wrong paths.
- An exit ticket on a mid-difficulty case that the misconception still gets right.
- Collecting responses and not deciding anything from them.

## Checklist

- [ ] 1-3 items, one confirmed focus, rigor matched to the objective
- [ ] Misconception map built before stems; each distractor tied to a named error
- [ ] Gate A: exactly one defensible answer per item
- [ ] Gate B: every distractor reached by its error on these numbers
- [ ] Guide routes each response to a distinct, specific next step
- [ ] Learner copy clean, at reading level, figures described in words

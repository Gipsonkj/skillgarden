# Explanations, worked examples and scaffolding

> Distilled from: eli5 (DreambigOu/ELI5, MIT); universal-diagnostic-tutor, its teaching-modes, STEM-sequence and gap-taxonomy references (SenmuuuuW/universal-diagnostic-tutor-skill, MIT); teach (mattpocock/skills, MIT); mentoring-juniors (github/awesome-copilot, MIT); k12-lesson-differentiation (anthropics/k12-teacher-skills, Apache-2.0). Plus general knowledge of cognitive load theory and worked-example research.

An explanation works when the learner can do something with it afterwards. Keep it inside working memory, connect it to what they know, and check it before adding more.

## 1. Fix the audience before writing a word

| Audience | Vocabulary | Analogies from | Lead with |
|---|---|---|---|
| Young child (about 5-10) | Everyday words only; one idea per sentence | Toys, animals, school, games | A picture they can imagine |
| Teen | Real terms, defined on first use | Phones, sport, games, social life | Why it matters to them |
| Adult novice | Plain words; jargon only when needed, defined at once | Home, money, work, daily routines | What it is in one sentence |
| University / technical | Proper terminology (they feel patronised without it) | Things they already know ("like a hash map, except...") | Trade-offs, edge cases, why it is designed this way |
| Manager or decision-maker | Outcomes, risk, cost, time | Business situations | The decision it affects |

If the audience isn't stated and it changes the answer, ask one calibration question; otherwise start at a standard level and adjust from the learner's reply.

## 2. The explanation shape

1. **What it is,** in one sentence.
2. **Why it matters** to this learner (the problem it solves).
3. **An anchor:** a concrete example or analogy they already own.
4. **The mechanism:** how it works, in layers, only as deep as the audience needs.
5. **A boundary:** where it stops working or a common mix-up.
6. **A check:** one small question or task, then stop and wait.

For STEM, a fuller path to choose from (don't force all ten into one turn): intuition → small concrete example → formal definition → notation translated symbol by symbol → procedure → why it works (invariant, mechanism, proof idea) → edge cases → common mistakes → practice → later connection. Formalise after intuition exists; never open with notation for a novice.

Matrix multiplication done this way: "one transformation after another" → rotate a point then scale it → `AB` means apply `B` first, then `A` → rows, columns, entries → dot products → each column shows where a basis vector lands → order matters, usually `AB ≠ BA` → "in `ABx`, which happens first?"

## 3. Cognitive load rules

Working memory is small. For acquiring new knowledge, difficulty is the enemy; save the effort for practice.

- **One or two new ideas, then a check** for beginners. Standard learners: the method cue and setup. Advanced: concise logic, assumptions, edge cases.
- **Name the objects before the formula.** "This symbol isn't magic; it's shorthand for..." Translate each symbol into words.
- **Remove what isn't the point:** decorative detail, side stories, tangents, a second representation that says the same thing.
- **Put related things together:** the label on the diagram, not in a legend; the explanation beside the step it explains.
- **Compress what they already know.** Re-teaching known basics adds load for experts (expertise reversal).
- **Step down by changing the representation,** not by saying the same thing longer: words instead of notation, a trace table instead of code, a picture instead of a proof, fewer variables.

## 4. Analogies that help, not mislead

- Pick an analogy from the learner's world, and say where it breaks: "Willpower is like a muscle" is useful until it is taken literally.
- One analogy per idea. Mixing two creates a third, wrong model.
- Return from the analogy to the real thing within a few sentences; the goal is the concept, not the metaphor.
- For a non-technical audience, getting the core idea across at about 80% accuracy beats a fully accurate explanation they can't follow. Say that it is simplified.

## 5. Worked examples and fading

Novices learn a procedure faster by studying solved examples than by solving from scratch. Then fade the help.

1. **Full worked example:** every step shown, each with its reason ("subtract 3 from both sides, because it keeps both sides equal").
2. **Completion problem:** same structure, later steps blank.
3. **Faded:** only the first step given.
4. **Independent:** a new problem with no help.
5. **Varied:** same method, different surface (new story, numbers, context) to build transfer.

Rules:
- Pair examples: one worked, then one similar for the learner to try at once.
- Show the reasoning, not only the moves. A learner who can't say why a step is allowed has a reasoning gap.
- Include a "find the error" example: a worked solution with a planted, realistic mistake.
- Fade when the learner can explain the steps; don't keep scaffolds after they stop being needed.

## 6. Scaffolds that support thinking

A scaffold helps the learner start or organise; it never does the thinking or reveals the answer.

| Good scaffolds | Not scaffolds |
|---|---|
| Sentence starters: "I know ___ and ___. The part I don't know is ___." | Hints that give away the answer |
| Visual organisers matched to the idea (tape diagram, number line, timeline, cause-effect chart) | Keyword tricks ("'altogether' means add") |
| Concrete → representational → abstract steps | Templates pre-filled except the final blank |
| Word banks for vocabulary | Turning an open task into multiple choice |
| "Try these simpler numbers first, then the original" with an explicit transfer step | Simpler work with no route back to the real task |

Cap embedded scaffolds at 1-2 per problem and fade them across a set (2 → 1 → 0). Details and tiering in [differentiation-and-udl.md](differentiation-and-udl.md).

## 7. Diagnose what kind of confusion it is

Different gaps need different explanations. Name the gap before re-explaining.

| Gap | Sign | Explain by |
|---|---|---|
| Vocabulary | Uses a term loosely or confuses everyday and technical meaning | Plain definition + one example, then back to the task |
| Concept | Knows the words, can't say what it does or why | Intuition, example or contrast before rules |
| Notation | Lost in symbols, units, syntax | Translate each symbol, then show how it compresses the idea |
| Procedure | Understands, can't order the steps | A short decision procedure + one demo, then they do the next step |
| Reasoning | Does the steps, can't justify them | Supply or ask for the missing reason, invariant or assumption |
| Recognition | Solves when told the method, can't spot the problem type | Cues, a near non-example, a classification check |
| Transfer | Fails when the surface story changes | Extract the general pattern, compare two variants |
| Misconception | A stable wrong model | Counterexample, then a better model ([tutoring.md](tutoring.md)) |

## 8. Formats

- **Maths in text:** use LaTeX (`\( ... \)` inline, `\[ ... \]` display); keep code blocks for code.
- **Diagrams:** only when they clarify the current gap. Describe every figure in words (alt text that states what it shows: "4 groups of 3 dots", not "dice").
- **Video or animation:** script the explanation here; produce it with `ai-video` or, for maths animations, `motion-animation` (`references/manim.md`).

## Pitfalls

- Explaining everything you know rather than what this learner needs next.
- A formal definition before the learner has an everyday hook.
- Long monologue with no check; the learner nods, nothing sticks.
- Re-explaining the same way, louder and longer, after a miss.
- Talking down. A 5-year-old explanation should feel delightful; a manager explanation should feel useful, not dismissive.

## Checklist

- [ ] Audience and level stated; vocabulary and analogies chosen for them
- [ ] One or two new ideas before a check
- [ ] Analogy has a stated limit; notation translated
- [ ] Worked examples show reasons and fade toward independence
- [ ] Scaffolds support thinking and never reveal answers
- [ ] Ends with a check, and you wait for the answer

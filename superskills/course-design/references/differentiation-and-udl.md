# Differentiation, UDL and accessible materials

> Distilled from: udl-lesson-auditor (GarethManning/education-agent-skills, CC-BY-SA-4.0); k12-lesson-differentiation and its subject references (anthropics/k12-teacher-skills, Apache-2.0); k12-lesson-plan-creation output rules (same repo, Apache-2.0); assessment-architect accommodation mode (YujxZJCN/teaching-skills, MIT). Plus general knowledge of WCAG for digital materials.
> License: CC-BY-SA-4.0 (derived from udl-lesson-auditor by Gareth Manning). You may share and adapt this guide if you credit the source and keep the same licence.

Two complementary moves. **UDL** designs the lesson so fewer learners hit barriers in the first place. **Differentiation** adapts a lesson for learners at different starting points. Both keep the goal the same for everyone and change the route and the supports.

## 1. Differentiating a lesson into tiers

Start from an existing lesson (ask for it if missing; never invent one and pretend it was theirs). Before building, scan for stated learner needs: multilingual learners and their levels, IEP goal areas, 504 or other accommodations. If none were given, apply universal defaults (sentence starters and a vocabulary box on every tier) and say so, inviting specifics.

Eight rules:

| # | Rule | What it means in practice |
|---|---|---|
| 1 | One teacher plan + separate learner sheets | Never three hybrid plans mixing teacher notes and learner tasks |
| 2 | Every tier meets the full objective | The hardest case stays in for everyone; the below-level tier gets it with support, not removed. Same engaging context for all tiers, not drill for one group and real problems for another |
| 3 | Support routes up | Below-level scaffolds build from a named prerequisite toward the grade-level task, not "just easier". Entry points: concrete → representational (below), representational → abstract (at), abstract → generalisation (above) |
| 4 | Scaffolds never give the answer | Sentence starters, organisers matched to the concept, word banks for vocabulary, manipulatives, simpler numbers with an explicit transfer step. Not keyword tricks, pre-filled templates or swapping open tasks for multiple choice. Max 1-2 embedded scaffolds per problem |
| 5 | Required infrastructure | A tiered formative check; an anchor activity for early finishers (standard-aligned, printed on every sheet, not busywork); flexible grouping tied to today's evidence and revised after the check; misconception notes per tier (error, teacher prompt, small-group signal); one open reflective prompt ending every sheet |
| 6 | Invisible differences | Same story, numbers and core question across tiers; only supports differ. Never announce a removed scaffold ("no diagram this time") |
| 7 | Fade within a sheet | Below tier: problem 1 up to 2 scaffolds, problem 2 up to 1, problem 3+ none, exit ticket 0-1 |
| 8 | Extensions add new thinking | Above-level work must require something the at-level task doesn't: a higher Bloom operation, a generalisation, a real element of the next standard, or an open generative task (write a problem, build a counterexample). Reject "more of the same" and notation swaps |

Group names on sheets are neutral (Group A, B, C); the teacher plan maps them to levels. Tiers are fluid: regroup from the formative check, never fixed ability tracks.

Primary visual model by concept (maths):

| Concept | Model |
|---|---|
| Part-whole, additive | Tape or part-whole diagram |
| Ratio, rate, multiplicative | Double number line or ratio table |
| Fractions as numbers | Number line |
| Multiplication, area | Area model or array |
| Proportional or linear relationships | Table of values or graph |
| Equations | Balance model |

In maths, prerequisites matter more than elsewhere: learning compounds, so a missing prior concept is usually the real obstacle. In ELA, science and social studies, "same objective, different access" (text supports, varied source formats, structured talk) is often enough.

## 2. UDL audit of a lesson

Audit for access, not compliance. The question is "where might a learner hit a barrier the design could remove?", not "are all checkpoints ticked?".

Work through the three principles. For each: what already works (name the element), specific barriers (which learners, why), concrete modifications.

| Principle | Look at | Barriers to look for |
|---|---|---|
| Engagement (the why) | How interest is recruited, effort sustained, self-regulation supported | One way to engage; no choice; no stated relevance; nothing for attention or persistence variability |
| Representation (the what) | How information is presented; vocabulary and symbols; comprehension supports | Text-only or audio-only; unsupported vocabulary; one medium for a complex idea; no activation of background knowledge |
| Action and expression (the how) | How learners show learning; executive-function demands; physical and digital access | One response format; heavy planning demands unsupported; no practice before high-stakes work; an assessment format that tests something other than the goal |

Specific beats generic. Not "provide multiple representations" but "add a labelled diagram beside the written instructions" or "offer a sentence frame for the oral response".

Then:
- **Prioritise 3-5 changes** with the biggest impact on the most learners. An audit that flags everything is not actionable.
- **Respect constraints.** If the set text can't change, add supports around it (glossary, parallel lower-reading-level text as a supplement, text-to-speech).
- **Name what to keep,** so good elements aren't removed by accident.
- **UDL is the floor, not a replacement** for specialist support for learners with identified needs. Don't claim UDL guarantees access.

```markdown
## UDL audit: <lesson>
Learner context · Constraints respected
### Engagement: What works / Barriers / Modifications
### Representation: What works / Barriers / Modifications
### Action and expression: What works / Barriers / Modifications
### Priority changes (3-5): change, why high impact, who it helps
### What to keep
### Facilitation notes (what depends on knowing the actual learners)
```

## 3. Multilingual learners

- Say "home language", not a specific language, unless the requester names one; translate only into named languages.
- Keep the content at level and lower the language load: short sentences, one instruction at a time, visuals with labels, key vocabulary taught in context.
- Sentence frames on every task that asks for composed sentences; for younger learners on every writing task.
- Allow oral, drawn or home-language first drafts where the goal isn't English writing itself.

## 4. Accommodations on assessments

Turn an already-granted accommodation into materials: extra time (same paper with a longer clock, or a reduced-length variant), alternative format (large print, screen-reader friendly, oral), reduced distraction, assistive technology. Keep equivalent rigor. Never decide who is eligible, never name the condition on any document, and mark the modified version for the teacher to check.

## 5. Accessible digital and print materials

| Item | Rule |
|---|---|
| Colour | Meaning never only in colour or position ("the Evidence column", not "the green box"); prints in black and white |
| Images and figures | Alt text that states what the figure shows, in words a learner can use to answer |
| Video | Accurate captions; a transcript; describe important on-screen action |
| Audio | Transcript |
| Documents | Real headings (not bold paragraphs), lists as lists, tables with header rows, readable fonts and sizes |
| Links | Text that says where it goes, not "click here" |
| Write-in spaces | Labelled with what goes in them |
| Interactive pages | Keyboard operable, visible focus, sufficient contrast; audit against WCAG 2.2 AA with `frontend-ui-design` → `references/accessibility.md` |
| Reading level | Matches the learners' reading level, which may sit below their grade |

## Pitfalls

- Lowering the goal for some learners and calling it differentiation.
- Three different contexts or problem sets across tiers; groups can't discuss together and the "low" group gets the dull one.
- Static ability groups that never change after evidence.
- Generic UDL advice that changes nothing in the actual lesson.
- Labels like "low", "struggling", "weak" in any material; describe what learners do instead.

## Checklist

- [ ] Source lesson identified; learner needs captured or defaults stated
- [ ] All tiers meet the full objective, same context and core task
- [ ] Below-level supports route up from a named prerequisite; fade 2 → 1 → 0
- [ ] Anchor activity, tiered check, flexible regrouping and reflection on every sheet
- [ ] Extensions demand new thinking
- [ ] UDL audit: specific barriers, 3-5 prioritised changes, what to keep, constraints respected
- [ ] Materials pass the accessibility table

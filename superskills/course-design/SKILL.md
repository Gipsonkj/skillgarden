---
name: course-design
description: Design and teach courses, lessons and workshops (online, school, university, corporate) and tutor one learner: learning objectives, course structure and syllabi, lesson plans, explanations, quizzes, exams and rubrics, flashcards and spaced repetition, differentiation, Socratic tutoring that doesn't hand over graded answers, turning notes or a codebase into a course, and LMS export (Canvas, Moodle, Google Classroom, SCORM). Producing the lesson video: ai-video.
---

# Teaching and course design

Covers designing learning and teaching it: from what learners should be able to do, through the evidence that shows they can, to the lessons, explanations, practice and checks that get them there, for a whole course, one lesson, a workshop or one learner in a chat. It also covers adapting lessons for different learners, turning existing material or a codebase into a course, and getting the result into an LMS. Producing media (video, narration, designed documents, websites) belongs to other crafts; this one decides what they should teach.

## Core principles

1. **Design backward.** Outcomes first, then the evidence that proves them, then activities. Every objective has an activity and an assessment at the same Bloom level; anything orphaned is a gap or filler.
2. **Objectives are observable.** Who does what, under which conditions, to what standard. Classify on both Bloom dimensions and resolve ambiguous verbs with the requester; verb tables are a start, not a verdict.
3. **Don't force a bottom-up climb.** Higher-order tasks can start early with scaffolds; remember-level steps add load for experienced learners.
4. **Small units, then a check.** One or two new ideas, then one question, then wait. A lesson teaches one thing and gives one tangible win.
5. **Make thinking visible.** Every lesson ends in a check; the exit ticket is the hardest case, and a learner holding the main misconception must get it wrong.
6. **Distractors come from misconceptions.** Exactly one defensible answer, every distractor reachable by a named error, no clue in length or wording.
7. **Work every key yourself.** Discrepancies are findings; anything unverified is marked `[VERIFY]`. Never invent standards codes, citations or sources.
8. **Retrieval beats re-reading.** Low stakes, no notes, spaced (1, 3, 7, 14, 30, 60 days; a miss resets), interleaved after first exposure. Fluency is not storage.
9. **Same goal, different supports.** Differentiation keeps the full objective and the same context for every tier; scaffolds route up from a named prerequisite, never reveal answers, and fade 2 → 1 → 0.
10. **Accessible by design.** Meaning never only in colour, captions and alt text always, reading level matched; a UDL audit ends in 3-5 prioritised, specific changes.
11. **Tutors diagnose, then teach the method.** Hints climb one rung at a time; final answers to graded work stay with the learner.
12. **Mastery needs evidence.** Accurate, explained, applied to a new case, told apart from a look-alike. One correct answer or "got it" is not mastery.
13. **Timings and materials add up.** Phases sum to the period (transitions included), exam time stays at or under 90% of the slot, every material listed is used.
14. **Judge items before learners.** p under 0.25 or negative discrimination means check the key, the teaching or the stem first; under 30 learners every statistic is indicative only; aggregates only, no named individuals.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Onboarding course from our codebase: `references/materials-to-course.md` → `references/objectives-and-backward-design.md` → `references/course-structure.md` → `references/checks-for-understanding.md`; walkthrough videos from `ai-video` → `references/explainers-and-promos.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Is training the answer; learning objectives (ILOs); Bloom's two dimensions; ambiguous verbs; backward design (UbD stages, WHERETO); alignment matrix with gaps and mismatches | [references/objectives-and-backward-design.md](references/objectives-and-backward-design.md) |
| Course, module and lesson hierarchy; online, K-12, university, workshop or one-learner containers; sequencing; curriculum map; syllabus; assessment plan with weights and AI-use rules | [references/course-structure.md](references/course-structure.md) |
| Lesson or session plan: clarify, standards, lesson arcs by subject and setting, look-fors, practice-set coverage, exit ticket, timing, learner-page reading level | [references/lesson-plans.md](references/lesson-plans.md) |
| Explaining a concept at the right level; analogies; worked examples and fading; cognitive load; scaffolds; diagnosing the kind of confusion | [references/explanations.md](references/explanations.md) |
| Check for understanding, exit ticket, hinge question; misconception-based distractors; the two verification gates; response-to-next-step guide | [references/checks-for-understanding.md](references/checks-for-understanding.md) |
| Quiz, exam, question bank, project brief; blueprint; item-writing rules; answer keys; rubrics and grader calibration; AI-era integrity; feedback on work; item analysis; accommodations | [references/assessments-and-feedback.md](references/assessments-and-feedback.md) |
| Retrieval practice sets; spacing schedules; interleaving; flashcards, Leitner drills, Anki export; mastery before scheduling | [references/retrieval-and-flashcards.md](references/retrieval-and-flashcards.md) |
| Differentiate a lesson into tiers; UDL audit; multilingual learners; accommodations; accessible print and digital materials | [references/differentiation-and-udl.md](references/differentiation-and-udl.md) |
| Tutor one learner: diagnostic loop, graded-work policy, Socratic questions, hint ladder, mastery decisions, mistakes and misconceptions, continuity across sessions | [references/tutoring.md](references/tutoring.md) |
| Turn notes, slides, a book, documents or a codebase into a course; source ledger; facts vs additions; coverage check; interactive HTML lessons | [references/materials-to-course.md](references/materials-to-course.md) |
| Export or publish: Common Cartridge, QTI, SCORM 1.2, Moodle GIFT, Canvas API, Google Classroom (`gws`), OpenMAIC; pre-launch checks | [references/course-production-and-platforms.md](references/course-production-and-platforms.md) |

To use one capability directly, name the task, or say "use course-design: <capability>" (for example "use course-design: exit ticket for adding fractions").

## Other crafts

| When the request also needs | Use |
|---|---|
| A lesson video, explainer or screen-recorded walkthrough produced from the script | `ai-video` → `references/plan-and-route.md`, `references/explainers-and-promos.md` |
| A maths or algorithm animation for an explanation | `motion-animation` → `references/manim.md` |
| Narration or voiceover for lessons, or transcripts and captions for recordings | `audio-generation` → `references/voiceover-tts.md`, `references/transcription.md` |
| Handouts, worksheets or a workbook as Word or PDF files | `docs-office` → `references/word-docx.md`, `references/pdf.md`, `references/document-design.md` |
| A long-form tutorial article or the course sales page copy | `content-creation` → `references/long-form-articles.md`, `references/conversion-copy.md` |
| Literature behind a course, an evidence review, or checked citations for a reading list | `research-science` → `references/literature-search.md`, `references/citations.md` |
| Rolling out a training programme: roadmap, stakeholders, status updates | `product-management` → `references/roadmaps.md`, `references/stakeholder-comms.md` |
| A course website built and deployed beyond single-file lesson pages | `website-building` → `references/stacks-astro-vue-static.md`, `references/deploy-netlify-cloudflare.md` |
| A full WCAG 2.2 audit of interactive course pages (beyond the table in `references/differentiation-and-udl.md`) | `frontend-ui-design` → `references/accessibility.md` |
| Lecture, workshop or training slides and the talk around them | `presentations` → `references/slide-design.md`, `references/deck-types.md`, `references/speaker-notes.md` |

## Go deeper (original skills)

Original community skills behind these guides, for a part the guides don't cover in full: `references/go-deeper.md`. Read any script there before running it.

## Default workflow

1. **Brief.** Learners (who, prior knowledge, setting: online, K-12, university, corporate, one-to-one), the goal (what they will do afterwards), constraints (time, platform, standards, known learner needs). Ask at most 2 questions; state the defaults you applied.
2. **Outcomes.** Write ILOs and classify them; confirm ambiguous verbs.
3. **Evidence.** Design the assessments and checks before any lesson; blueprint for tests.
4. **Structure.** Modules, lessons, curriculum map and assessment plan; check time against emphasis.
5. **Build.** Lessons, explanations, worked examples, practice with structural variety, retrieval and spacing.
6. **Access.** Differentiate where needed; UDL pass; accessibility table on every material.
7. **Verify.** Work every key; run both item gates; check timings, materials and the alignment table; mark `[VERIFY]` items.
8. **Produce.** Hand media to the right craft; package for the LMS and unzip to check.
9. **Report.** What was built, the defaults and assumptions, `[VERIFY]` items, and what wasn't checked.

## Done means

- [ ] Every ILO observable, classified, and aligned to an activity and an assessment at its level
- [ ] Assessment evidence designed before activities; blueprint confirmed for tests
- [ ] Lessons have minutes that add up, look-fors, and an exit ticket on the hardest case
- [ ] Items pass both gates; keys worked independently; no invented codes or sources
- [ ] Retrieval and spacing planned, not only end-of-unit tests
- [ ] Tiers keep the full objective; scaffolds never reveal answers; materials accessible
- [ ] Tutoring kept final answers to graded work with the learner and decided from evidence
- [ ] Packages verified (manifest at root, references resolve); tokens never stored
- [ ] Report names assumptions, `[VERIFY]` items and what wasn't checked

# Course structure, syllabus and curriculum map

> Distilled from: course-export and learning-objectives (savvides/idstack, MIT); assessment-architect and its project-brief template (YujxZJCN/teaching-skills, MIT); teach (mattpocock/skills, MIT); book-study (sanyuan0704/sanyuan-skills, MIT); k12-lesson-plan-creation (anthropics/k12-teacher-skills, Apache-2.0).

The structure is the spine that objectives, lessons and assessments hang on. Build it after the ILOs and the assessment evidence exist ([objectives-and-backward-design.md](objectives-and-backward-design.md)), and before writing any lesson.

## 1. Pick the container first

| Setting | Unit you design | Pieces it needs | Watch for |
|---|---|---|---|
| Self-paced online course | Module of short lessons | Overview, lessons, practice with instant feedback, quizzes, reference sheets | No teacher to notice confusion: checks and feedback must be built in |
| Cohort online course | Week | Schedule, live sessions, discussion prompts, assignments with dates | Deadline load per week; async and live parts must not duplicate |
| K-12 unit | Lesson inside a unit | Standards, lesson plans, student materials, exit tickets, a unit task | The class period is fixed; the school's sequence may differ from the textbook's |
| University course | Week or topic block | Syllabus, assessment plan with weights, lectures or seminars, problem sets, exams or projects | Institutional policies; grader consistency across TAs |
| Corporate workshop | Session block | Agenda, practice on real work tasks, job aids, a transfer plan | Learners judge relevance fast; the test is what they do back at work |
| One learner (tutoring, self-study) | Next lesson in the learner's reach | Mission, learning records, short lessons, reference docs | Don't pre-build a full roadmap; grow it from evidence ([tutoring.md](tutoring.md)) |

Ask the requester which of these it is if unclear. It changes nearly every later decision.

## 2. Hierarchy and what each level owns

```
Course        -> course ILOs, assessment plan, policies
  Module/unit -> 1-3 ILOs, a module check or task, a reference sheet
    Lesson    -> one objective, one tangible win, a check at the end
      Activity-> one move: explain, practise, discuss, retrieve, check
```

Rules:
- Every module names which course ILOs it serves. A module that serves none is filler.
- A lesson teaches one tightly scoped thing and gives one win the learner can build on. Short enough to finish in one sitting.
- Reference material is separate from lessons. Lessons are read once; cheat sheets, glossaries, worked procedures and diagrams are revisited, so make them compact and printable. Once a glossary exists, every lesson uses its terms.

## 3. Module template

```markdown
## Module <n>: <title>
Why this matters: <one or two sentences tied to the learners' goal>
You'll be able to: <the module's ILOs in plain words>
Before you start: <prerequisites + a short warm-up that retrieves them>

Lesson <n.1> ... <n.k>   (each: explain -> practise -> check)
Mixed review: a few questions from earlier modules
Module task or quiz: <what it checks, which ILOs>
Reference sheet: <link>
```

## 4. Sequencing rules

1. **Prerequisites first.** List each topic's dependencies and order by them; a learner missing the prior idea can't be scaffolded past it, especially in maths.
2. **Hard cases inside the main path,** not in an optional extension. If only the keen learners meet the hard case, most never do.
3. **Revisit, don't just cover.** Return to earlier ideas in later modules (spiral), and mix earlier topics into practice once each has been taught once (interleaving; see [retrieval-and-flashcards.md](retrieval-and-flashcards.md)).
4. **Essential questions recur.** Ask them at the start, middle and end so answers visibly deepen.
5. **Place evidence where you need it.** Checks after each lesson, a module check before the next module depends on it, the performance task near the end with time to act on feedback.
6. **Stage big work.** Projects get milestones: proposal → draft or prototype → feedback response → final. The staged trail is part of what is assessed and makes outsourced work harder.
7. **Avoid collisions.** Check the calendar for exams in other courses, holidays and busy work periods before fixing deadlines.

## 5. Curriculum map (scope and sequence)

One table makes coverage and balance visible:

```markdown
| Week/module | Topics | ILOs | Activities | Assessment | Time (h) |
|---|---|---|---|---|---|
| 1 | Variables, types | ILO-1 | Live coding, pair practice | Exit ticket | 3 |
| 2 | Conditionals | ILO-1, ILO-2 | Debugging lab | Quiz 1 (5%) | 3 |
```

Checks to run on the map:
- Every ILO appears in at least one row with practice and one with assessment.
- Emphasis matches time: an ILO worth 30% of the grade that gets 5% of class time is a flag.
- No week carries two major deadlines unless intended.

## 6. Syllabus contents

| Section | Holds |
|---|---|
| Course info | Title, code, term, meeting times or pacing, instructor and contact |
| Description | What the course is for and who it is for, in plain words |
| Outcomes | ILOs in student language |
| Schedule | The curriculum map, learner-facing |
| Assessment | Each assessment, weight, due week, how it is graded (rubric link) |
| AI use | The rule per assessment: not allowed, allowed with disclosure, or expected. One line on why |
| Policies | Late work, integrity, attendance, accessibility and accommodations, regrades |
| Materials | Required and optional resources with exact titles and access paths |
| Getting help | Office hours, forum, tutoring, support services |

Institutional policies (integrity, accommodations, grading scales) come from the institution. Never invent them: write `[NEEDS INPUT: institution's late-work policy]` and list the gaps.

## 7. Assessment plan

```markdown
| ID | Assessment | Type | Weight | Due | ILOs | AI use |
|---|---|---|---|---|---|---|
| A1 | Weekly quizzes | retrieval, low stakes | 10% | weekly | ILO-1..3 | not allowed (in class) |
| A2 | Project | performance task, staged | 40% | weeks 6, 9, 12 | ILO-3, ILO-4 | expected, graded on judgment |
| A3 | Final exam | exam | 30% | week 14 | ILO-1..5 | not allowed (supervised) |
```

- Weights follow importance and effort: estimate learner hours per assessment and compare with its weight.
- Low-stakes, frequent checks early; high-stakes late, after feedback has had time to work.
- High-weight assessments need at least one part that a chatbot can't complete alone: supervised work, staged process evidence, personal or class-specific inputs, or a short oral defence of a sample. Details in [assessments-and-feedback.md](assessments-and-feedback.md).

## 8. Corporate and workshop specifics

- Start from the job task, not the topic. Each session block ends with learners doing a piece of their real work.
- Agenda with timings that add up to the slot, including breaks and transitions.
- Give a job aid (checklist, decision table, template) they will use the next day; that is the reference sheet.
- Add a transfer plan: what each learner will try in the next two weeks and how a manager or peer will check.
- If the real problem is process, tooling or incentives, say so; a course won't fix it.

## Pitfalls

- A topic list presented as a course structure, with no ILOs or evidence per module.
- Modules of wildly different size; learners can't pace themselves.
- Everything blocked by topic with no review: fluent in week 2, gone by week 10.
- Policies copied from another institution or invented.
- A full roadmap pushed on a single learner before you know what they already know.

## Checklist

- [ ] Setting identified; container and units chosen to match
- [ ] Every module serves named ILOs and ends with a check or task
- [ ] Order follows prerequisites; hard cases on the main path; earlier topics revisited
- [ ] Curriculum map shows practice and assessment for every ILO; time matches emphasis
- [ ] Syllabus complete; institutional policies sourced or marked `[NEEDS INPUT]`
- [ ] Assessment plan with weights, dates, ILOs and an AI-use rule per item

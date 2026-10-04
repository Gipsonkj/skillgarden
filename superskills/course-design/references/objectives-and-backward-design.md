# Learning objectives and backward design

> Distilled from: backwards-design-unit-planner (GarethManning/education-agent-skills, CC-BY-SA-4.0); learning-objectives (savvides/idstack, MIT); assessment-architect (YujxZJCN/teaching-skills, MIT); teach (mattpocock/skills, MIT).
> License: CC-BY-SA-4.0 (derived from backwards-design-unit-planner by Gareth Manning). You may share and adapt this guide if you credit the source and keep the same licence.

Design from the end. Decide what learners will be able to do, then what evidence would prove it, and only then what they will do in class. Most weak courses are planned the other way round: activities first, assessment last, and the two never meet.

## 1. Before objectives: is a course the answer?

Ask three things before writing a single outcome. Skip only for a one-off lesson.

| Question | Why it matters |
|---|---|
| What will learners do differently afterwards, and where? | Grounds every objective in a real task (a job task, an exam, a project, a hobby goal) |
| What do they already know? (novice, some background, experienced, mixed) | Drives the starting Bloom level and how much you scaffold |
| Is the gap knowledge or skill, or is it a tool, process or motivation problem? | Training can't fix a broken process; a checklist or reference page may beat a course |

For a single learner (tutoring, self-study) the same idea is a short mission statement: why they want this, what success looks like as 2 to 4 observable things, constraints, and what is out of scope. Concrete beats abstract: "ship a Rust CLI to my team" beats "learn Rust".

## 2. Write measurable objectives

An intended learning outcome (ILO) names who, does what (observable), under what conditions, to what standard. Not every objective needs all four, but the action must always be observable.

| Weak | Measurable |
|---|---|
| Understand the importance of ethics | Evaluate a research proposal for ethical compliance using the APA checklist |
| Know about pivot tables | Build a pivot table that answers a given sales question in under 5 minutes, without notes |
| Be aware of phishing | Flag the phishing email in a set of 10 real-looking messages and name the cue that gave it away |

Rules:
- One outcome per sentence. "Define X and apply Y" is two objectives.
- Keep the list short enough that every ILO can be traced to an activity and an assessment. A long list usually hides topics posing as outcomes.
- Give each an id (ILO-1, ILO-2) so activities and assessment items can point at it.
- Show learners the objectives in plain words; keep ids and Bloom tags in the teacher view.

## 3. Classify on both Bloom dimensions

The revised taxonomy (Anderson and Krathwohl) has two axes. Picking a verb only uses one.

| Knowledge dimension | Means |
|---|---|
| Factual | Terms, specific details |
| Conceptual | Categories, principles, models, theories |
| Procedural | Methods, techniques, when to use which |
| Metacognitive | Knowing how you learn, checking your own work, strategy choice |

| Cognitive process | Learners... |
|---|---|
| Remember | Retrieve from memory |
| Understand | Explain, summarise, classify, compare |
| Apply | Carry out a procedure in a given situation |
| Analyse | Break apart, find relationships, diagnose |
| Evaluate | Judge against criteria |
| Create | Combine into something new, design, plan |

Verbs are a starting point, not a classifier. "Analyse", "evaluate", "explain", "demonstrate", "identify", "compare", "design" and "interpret" each fit several levels. When a verb is ambiguous, ask which one is meant, offering both readings:

> "Analyse patient data to identify trends" could mean following a taught procedure step by step (apply) or independently finding patterns nobody showed them (analyse). Which do you mean?

Getting this wrong cascades: the level decides the activity and the assessment format.

## 4. Don't force a climb from the bottom

Learners do not have to master facts before higher-order work. Retrieval and practice at higher levels improves higher-order outcomes, and facts are often learned faster inside a real task.

| Audience | Sequence advice |
|---|---|
| Novices | A build-up can help, but give early higher-order tasks with scaffolds |
| Intermediate | Start at apply or analyse; a strict remember-first sequence underestimates them |
| Advanced | Remember-level objectives add load for no gain (expertise reversal); start at apply or higher |
| Mixed | One sequence won't fit; use a pre-check and make lower-level parts optional |

Flag any objective list that runs strictly remember → create in order.

## 5. Backward design in three stages

Stage 2 is designed before Stage 3. That is the whole method.

**Stage 1: desired results**
- 2 to 3 enduring understandings: transferable big ideas, written "Learners will understand that...". Not facts.
- 2 to 3 essential questions: open, arguable, revisited across the unit (answers should deepen from first to last lesson).
- Knowledge (facts, concepts, vocabulary) and skills (what they can do), as lists.

**Stage 2: assessment evidence**
- One performance task that needs transfer: a new situation, not a repeat of a class example. Give the scenario, what learners produce, which ILOs it checks, and 3 to 6 success criteria.
- Other evidence: checks for understanding, exit tickets, quizzes, observations, each mapped to an ILO.

**Stage 3: learning plan**
Sequence lessons that build toward the Stage 2 task. The WHERETO checklist helps:

| Letter | Ask |
|---|---|
| W | Do learners know where this is going and why? |
| H | What hooks them at the start? |
| E | Where do they explore and get equipped? |
| R | Where do they rethink and revise earlier ideas? |
| E | Where do they evaluate their own progress? |
| T | How is it tailored to different learners? |
| O | Is it organised to build understanding, not just coverage? |

Every activity should say what it builds toward. If an activity prepares for no assessment and no ILO, cut it or add the missing ILO.

## 6. The alignment check

Constructive alignment means each ILO, its activities and its assessment target the same cognitive level. Run it both ways and show the table.

```markdown
| ID | Objective | Knowledge | Process | Activity | Assessment | Alignment |
|----|-----------|-----------|---------|----------|------------|-----------|
| ILO-1 | Evaluate a proposal for ethical compliance using the APA checklist | procedural | evaluate | Peer critique of 2 sample proposals | Written review of a new proposal, rubric | aligned |
| ILO-2 | Build a pivot table that answers a sales question | procedural | apply | Watch a demo | Multiple-choice quiz | MISMATCH |
| ILO-3 | Explain why sampling bias distorts results | conceptual | understand | Case discussion | none | GAP |
```

Status values: `aligned`, `MISMATCH` (activity or assessment at a different level), `GAP` (missing activity or assessment).

Typical mismatches and fixes:
- Create-level ILO assessed by multiple choice → assess with a product: project, design, portfolio, prototype.
- Evaluate-level ILO practised by reading → practise with critique, peer review or rubric-based judging.
- Apply-level ILO practised by watching → learners do it, with feedback, before they are assessed.
- An activity with no ILO → it serves an unstated objective (add it) or nothing (cut it).

Report gaps first, then mismatches, then sequencing flags, then the verb decisions you made.

## 7. Output template

```markdown
## Unit plan: <title>
For: <learners> · Subject: <subject> · Duration: <n lessons x minutes, or weeks>

### Stage 1: desired results
Enduring understandings (2-3) · Essential questions (2-3) · Learners will know · Learners will be able to

### ILOs
| ID | Objective | Knowledge | Process |

### Stage 2: assessment evidence
Performance task (scenario, product, ILOs checked, success criteria) · Other evidence table (when, what, ILO)

### Stage 3: learning plan
Lesson or phase list: what happens, what it builds toward

### Alignment check
The table from section 6, then gaps, mismatches and flags
```

## Pitfalls

- "Understand", "know", "appreciate", "be familiar with" as the action. Not observable.
- Essential questions with one right answer ("What is photosynthesis?"). They are quiz items, not essential questions.
- A performance task that repeats the class example. That tests recall, not transfer.
- Writing the assessment last, then quietly assessing whatever was taught.
- Treating the unit plan as lesson plans. Stage 3 is the spine; each lesson still needs its own plan ([lesson-plans.md](lesson-plans.md)).

## Checklist

- [ ] Gap confirmed as one teaching can fix; learners and prior knowledge stated
- [ ] Every ILO observable, one action each, with an id
- [ ] Both Bloom dimensions recorded; ambiguous verbs resolved with the requester
- [ ] Sequence suits the audience (no forced bottom-up climb)
- [ ] Performance task needs transfer and maps to named ILOs
- [ ] Alignment table shows every ILO with an activity and an assessment at its level; gaps and mismatches listed

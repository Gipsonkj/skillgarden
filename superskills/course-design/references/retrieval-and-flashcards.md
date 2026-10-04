# Retrieval practice, spacing and flashcards

> Distilled from: retrieval-practice-generator (GarethManning/education-agent-skills, CC-BY-SA-4.0); book-study and its pedagogy reference (sanyuan0704/sanyuan-skills, MIT); flashcards (anthropics/claude-for-legal, Apache-2.0); teach (mattpocock/skills, MIT); tutor quiz rules (bevibing/tutor-skills, MIT).
> License: CC-BY-SA-4.0 (derived from retrieval-practice-generator by Gareth Manning). You may share and adapt this guide if you credit the source and keep the same licence.

Pulling knowledge out of memory builds durable learning far more than reading it again. Spread that retrieval over time, mix related topics, and keep the stakes low.

## 1. Fluency is not storage

- **Fluency strength:** it feels easy right now (just read it, just saw the example).
- **Storage strength:** it is still there in three weeks.

Re-reading and highlighting build fluency and a false sense of mastery. Effortful retrieval, spacing and interleaving feel harder and build storage. Warn learners about this; ask them to rate confidence before seeing answers, and name the gap when high confidence meets a wrong answer.

For acquiring new knowledge, keep difficulty low ([explanations.md](explanations.md)). For making it stick, difficulty is the tool.

## 2. Writing retrieval questions

| Type | Example | Strength | Use for |
|---|---|---|---|
| Free recall | "Explain how natural selection changes a population." "List the factors that..." | Strongest effect, hardest | The core of every set, especially after 2+ weeks |
| Cued recall | "The three conditions are ___, ___ and ___." "Label this diagram." | Moderate, good scaffold | Recently taught material, novices |
| Recognition | Multiple choice | Weakest | Warm-ups, confidence for novices, only a small share |

Rules:
- Every question needs reconstruction from memory, not pattern matching on familiar wording. No question answerable from its own text.
- Target core concepts, relationships and procedures; skip trivia (dates, minor definitions) unless they truly matter.
- Include at least 2 questions aimed at known misconceptions when you know them.
- Calibrate to time since teaching: within a week, more cued recall; after two weeks or more, more free recall.
- 6-10 questions per set is a workable size.

Output shape:

```markdown
## Retrieval practice: <topic>
For: <learners> · When: 3-7 days after teaching; reuse a subset at 2-4 weeks

1. <question>  Type: free recall · Targets: <knowledge>
...
### Answer notes
1. Key points · Common errors to watch for
### How to run it
No notes. 8-12 minutes for 6-10 questions. Then go through answers together,
let learners mark their own, note the gaps. Don't grade it.
```

## 3. Spacing schedules

Review at growing intervals; a miss sends the item back to the start.

**Expanding schedule (concept review in a course or tutoring):**

| Event | Next review |
|---|---|
| First shown mastered | +1 day |
| Correct on review | Next step: 1 → 3 → 7 → 14 → 30 → 60 days |
| Wrong on review | Reset to +1 day |
| After 60 days | Every 60 days |

Review before new content when a learner returns: due items first, then the next lesson. Review questions are short (one per concept) and ask for application ("how would you use X here?"), and where possible connect the old idea to today's (double duty as interleaving).

**Leitner buckets (flashcard decks):**

| Self-assessment | Bucket | Next review |
|---|---|---|
| Right | Up one: new → learning → review → mastered | +1 day new, +3 learning, +7 review, +21 mastered |
| Partial | Same bucket | +1 day |
| Wrong or don't know | Down one (new stays new) | Later the same day |

Drill order: due cards that aren't mastered, then new cards; offer mastered cards only for decay checks. A card that falls back to new more than twice is a concept problem: stop drilling it and teach it ([tutoring.md](tutoring.md)).

These schedules are practical defaults, not the only valid intervals. A dedicated spaced-repetition app (Anki and similar) schedules per card automatically and is the better tool for large decks; chat drills are for quick sessions.

## 4. Interleaving

Once each topic has been taught once, mix them in practice so learners must choose which idea applies. Blocked practice (all of one type) feels smoother and teaches less discrimination.

| Pattern | Prompt |
|---|---|
| Combine | "How do X (earlier) and Y (today) work together here?" |
| Discriminate | "Would X or Y better explain this situation? Why?" |
| Contrast | "This looks like X. What is actually different?" |
| Layer | "X explained this part. What does Y add?" |

Don't announce interleaved questions as review. Prioritise ideas learners confuse. If the old part fails, schedule it for spaced review.

## 5. Flashcards

Card rules:
1. **One fact or concept per card.** "Elements of negligence" becomes four cards.
2. **The front is a question,** not a topic: "What are the four elements of negligence?", not "Negligence".
3. **The back is short:** one or two sentences. If it needs a paragraph, split it.
4. **Cite the source** (section, page, slide) so the learner can check.
5. **Cards from your own knowledge get a flag:** `[VERIFY: rule, check against your notes]`. A wrong card drilled to mastery is worse than no card.
6. **Fewer, right cards beat padding.** Generate 8 good cards rather than 20 with 5 wrong.
7. **Cards are for drilling what has been learned,** not for first teaching. Understanding first, then cards.

Card file (plain Markdown):

```markdown
### Card 12
Q: What does a p-value measure?
A: The probability of data at least this extreme if the null hypothesis were true.
Source: Lecture 4, slide 9
Bucket: new · Last reviewed: - · Next review: 2026-10-05
Notes: Not the probability the null is true.
```

**For Anki or another app:** export a plain text or CSV file with one card per line and the fields in a fixed order (front, back, optional tags), then use the app's import. Tab-separated avoids trouble with commas in answers. Cloze cards ("The mitochondrion produces {{c1::ATP}}") suit definitions and lists. Check the app's current import docs for the exact field and cloze syntax.

## 6. Mastery checks before scheduling

Don't mark a concept learned because the learner says "got it". Score answers on four criteria, one point each:
- **Accurate:** factually right.
- **Explained:** says why, not just what.
- **Applied:** uses it in a new scenario.
- **Discriminated:** tells it apart from a similar concept.

Mastery: at least 3 of 4 on each question and at least 80% overall, then a small practice task that produces something (a new example, an application to their own problem). Only then start the spacing schedule.

## Pitfalls

- Graded retrieval quizzes; stakes turn practice into performance anxiety and cramming.
- Notes allowed during retrieval; that is re-reading.
- Retrieval only on the day of teaching; no spacing, little lasting effect.
- Recognition-only sets (all multiple choice) for anything that must be recalled later.
- Flashcard decks generated from memory with no sources and no `[VERIFY]` flags.

## Checklist

- [ ] Mostly free and cued recall; recognition only as warm-up
- [ ] Questions need reconstruction; misconceptions targeted; no trivia
- [ ] Timing stated (when to use, when to reuse); low stakes, no notes, not graded
- [ ] Schedule chosen (expanding or Leitner); misses reset
- [ ] Interleaving after first exposure
- [ ] Cards: one concept, question front, short back, source or `[VERIFY]`

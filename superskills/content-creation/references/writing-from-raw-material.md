# Writing from raw material: fragments, then shape

> Distilled from: writing-fragments and writing-shape (mattpocock/skills, MIT; both live in that repo's in-progress folder).

Use when the author has something to say but no draft: "help me figure out what to write", "interview me", "turn my notes/transcript into an article", "shape this into a post", "let's write this together paragraph by paragraph". Two phases, run as two separate sessions or one after the other. Never mix them.

| Phase | Mode | Question | Output |
|---|---|---|---|
| Fragments | Explore: widen what could be written | "What are you actually noticing?" | One markdown file of unordered fragments |
| Shape | Exploit: commit to a structure | "What is this arguing, and in what order does the reader need it?" | A separate article file, built block by block |

## Phase 1: Fragments (explore)

**Setup.** If no path was given, ask once where to save, then remember it. Capture from the very first message, including the initial prompt. First write: a single H1 working title and nothing else (no date, no metadata, no TOC).

**Interview hard.** Ask about the thing they want to write about, one sharp question at a time: what happened, what surprised them, what they believe that others don't, what they tried that failed, the exact words someone said. Push on vague answers. Do not propose an outline, phases or sections; structure is out of scope here.

**What counts as a fragment:** anything that might survive into the final piece and that the author can understand. It need not define its terms.
- a sharp sentence with no home yet
- a claim plus a one-line reason
- a vignette, scenario, analogy, code snippet
- a half-thought ("X feels like Y, work out why later")
- a quote, overheard line, piece of dialogue
- a cluster of observations that belong together
- a complaint, confession, punchline
- a **leading word**: a compact coinage or metaphor the whole piece can hang on (the way "tracer bullets" names a whole practice). This is the most valuable fragment. When the talk keeps circling one idea, push to name it.

**File format.** Fragments separated by `---` on its own line. No headings in the body, no tags, no ordering beyond the order added.

```markdown
# Working title

First fragment. Can be several paragraphs, a list, code, a quote.

---

> A quoted line worth keeping.

A reaction to it.

---

- observations that
- hang together by feel
```

**Rhythm.** Append silently and mention it in passing ("adding that"). Re-read the file from disk before every write, because the author may have edited, reordered or deleted things. Only append; edit a specific fragment only when asked. "Cut the last one", "sharpen that", "merge those two" are first-class commands.

## Phase 2: Shape (exploit)

The pile is fixed and read-only. You commit to a structure and mine the pile to fill it.

1. **Read the whole pile** before anything else. It can be tidy fragments, a wall of prose or a transcript.
2. **Ask where to save the article** if not given.
3. **Settle the prerequisites.** Agree with the author what the reader knows walking in. Those concepts are grounded from the start. Everything else must be grounded by an earlier block before a later block leans on it.
4. **Offer 2-3 openings**, each implying a different thesis or angle. The author picks one or a hybrid. The opening defines what the rest must deliver.
5. **Grow block by block.** Ask "given what's on the page, what does the reader need next?" Pull material from the pile, rework it to fit, place it. Argue the form of each block out loud (see below).
6. **Append each agreed block to the article file immediately.** Re-read the file before every write; edit only the paragraph the author asks to change.
7. **Repeat until the author says it's done.**

### Grounding

Keep a running list of grounded concepts. The unit is the concept, not the word: a block can lose the reader with no jargon at all. A concept is grounded either as a prerequisite or by being introduced in an earlier block (idea and term landed together). If the next move needs an ungrounded concept, grounding it is the next block. Too many prerequisites shut readers out; too much grounding inside drowns the opening in definitions. Decide the balance with the author up front.

### Pushback to keep using

- "What does this paragraph do that the last one didn't?"
- "If I cut this, what breaks?"
- "Why prose here and not a list?"
- "This sentence does two jobs. Split it or pick one."
- "The opening promised X. We've drifted to Y. Re-thread it or change the opening."

### Form decisions (argue them, don't default)

| Choice | Rule |
|---|---|
| Prose vs list | Prose carries argument; a list only when items are truly parallel |
| Inline vs callout | Callout (`> [!NOTE]`, `> [!TIP]`) only if the aside would derail the argument |
| Table vs repeated prose | Same fields repeating 3+ times → table |
| Quote vs paraphrase | Quote when the wording is the point |
| Code block vs inline | Multi-line or runnable → block; single identifier → inline |

### Gaps

Treat the pile as a quarry, not a script: split, merge and paraphrase fragments so the article reads as one voice. When the pile lacks something the article needs, say so plainly: "We need an example here and the pile has none. Give me one now or we cut this section." Never fill the gap with invented material.

### Out of scope in this phase

Mining new fragments (go back to Phase 1), editing the pile file, platform formatting, frontmatter nobody asked for. After the author calls it done, offer a [humanize-ai-writing.md](humanize-ai-writing.md) pass and, if it will be published for search, the optimize pass in [long-form-articles.md](long-form-articles.md).

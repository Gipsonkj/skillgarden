> Distilled from: deck-writing guide of the docs-office craft (from kami (tw93/Kami, MIT), baoyu-slide-deck (jimliu/baoyu-skills, MIT), frontend-slides (zarazhangrui/frontend-slides, MIT), pptx-generator (MiniMax-AI/skills, MIT), html-ppt (lewislulu/html-ppt-skill, MIT), ppt-master (hugohe3/ppt-master, MIT)); presentation-creator (mblode/agent-skills, MIT); tech-talk-outline (samber/developer-relations-skills, MIT); public-speaking (RefoundAI/lenny-skills, MIT); consulting-pptx-skill (carnot-tech/consulting-pptx-skill, MIT); scientific-slides (K-Dense-AI/scientific-agent-skills, MIT)

# Deck story and structure (any format)

The format (pptx, HTML, Slidev, Google Slides, PDF) is the last decision. A deck succeeds or fails on its argument and on one idea per slide. Do this guide before any styling; [deck-types.md](deck-types.md) has the skeleton for each kind of deck.

## 1. Intake (infer first, ask at most once)

| Question | Default if unknown |
|---|---|
| Audience: internal (shared context, be direct) or external (build credibility, define terms) | ask if it changes the content |
| Setting: live talk, recorded, or a deck sent and read without you | live talk |
| Venue: dark hall or bright meeting room; laptop, projector or phone | bright room (it decides the palette, see slide-design.md) |
| Length: minutes or slide count, and is Q&A inside the slot | 15 min ≈ 10-15 slides; 30 min ≈ 20; 45 min ≈ 25-40 |
| Goal: what should the audience believe, decide or do afterwards | ask if truly unclear |
| Source material: doc, notes, data, screenshots, paper, logo | use what was given; list gaps |
| Hard constraints: brand template, required slides, editable .pptx, embargoed numbers | none |
| Output format | decide now; it sets type sizes and where notes live |

State the plan in one line ("12 slides, speaking deck, editable pptx, brand navy, notes in the notes pane") and continue; adjust if the user objects.

Before building a deck at all: if nobody can say who it is for, which meeting, and what decision it serves, a one-page summary or a memo is the better deliverable. More slides means more surface for errors.

## 2. Find the one sentence (the arrow)

1. Write the single sentence the deck must prove: the line a listener would still repeat a week later. Test: "if this is the only thing they take away, is that enough?"
2. Take a position a reasonable person could disagree with. A deck nobody could disagree with has said nothing; it can be an email.
3. Name the stakes: what the audience loses by doing nothing.
4. Write the ending first, verbatim. Building five sections towards a close that doesn't exist yet means rewriting all of them.
5. Reuse the arrow as the closing line, in the same words as the opening hook.

## 3. Build the spine

Fill this in one sitting, before any slide exists:

```text
Once upon a time ___.   (the world the audience lives in)
Every day ___.          (the status quo, stated so they nod)
One day ___.            (what changed: the tension slide)
Because of that ___.    (consequence: core section)
Because of that ___.    (next consequence: core section)
Until finally ___.      (where it lands, what they do about it)
```

If a slide serves no beat, it is a fact you found interesting: cut it.

Then choose 2-3 **pillars** that support the arrow, each with named evidence: a number, an incident, a benchmark, a quote, a demo, a customer constraint. A pillar without evidence is an opinion and gets attacked in Q&A. One concrete instance that settles a whole class of objections beats three weak proofs.

Place the **moment of realization** ("we used to think X, then Y happened, now we think Z") where the audience already believes the problem, usually at the end of the first pillar.

Other structures that work (pick with the user, don't assign silently):

| Structure | Shape | Use when |
|---|---|---|
| What is / what could be (Duarte sparkline) | Alternate current state and better future, end on the new normal | Keynotes, vision, change of belief |
| Problem → dead ends → insight → proof | Concrete problem with a number, why obvious fixes fail, the insight, evidence | Technical argument; cap dead ends at a third of the body |
| Incident | Belief → failure timeline → the moment it broke → what changed → what generalises | You lived an outage or failure |
| Migration / before-after | Old system and its limit → forcing function → options → new system → real cost, incl. what got worse | Audience maintains similar systems |
| Contrarian | Received wisdom in its strongest form → evidence against → where it still holds → new rule | Audience starts out disagreeing; needs the strongest evidence |
| Recommendation first (pyramid) | Answer → options compared → evidence → cost and risk → decision needed | Exec, board and decision decks |
| Beginning, middle, end | Hook (mystery, surprise) → message → success | Short pitches and internal shares |

Anti-pattern: the **feature tour** ("here are our features, in menu order"). Fix it mechanically: make the problems the pillars and demote each feature to evidence under the problem it solves.

## 4. Titles carry the argument

1. Every content slide title is an **assertion**, not a label: "Q3 revenue beat guidance by 12%", not "Q3 Results"; "Retries amplified the outage", not "Retry behaviour".
2. A title must read on its own to someone who never saw the previous slide. Don't compress it into a slogan by dropping the subject; two lines is fine, shrinking the font to fit one line is not.
3. No "Label: claim" prefixes ("Market: ...", "Roadmap: ..."). The section label belongs in a small kicker, the title is the claim.
4. Put a number in the title only when the number is the point ("Prices differ 8x by channel"). "Three reasons", "five steps" are counts, not claims; write the conclusion instead. If you do write "3 phases", the slide must show exactly 3.
5. Don't let every title use the same sentence pattern; a deck where 10 titles read "X drives Y" is copying a template.
6. A chart slide states its "so what" in the title or in a headed side column, never only the fact.
7. Claims no stronger than the evidence, especially claims about the audience or your own company.
8. Pitch decks are skimmed: write the claim as a number ("1,000+ customers, $10M ARR"), never the category ("Traction").

**Ghost-deck test:** read only the titles in order. They must tell the whole argument as one speech. If not, fix titles or structure before designing. Extract them mechanically for a check (`markitdown deck.pptx`, or grep the headings of a Markdown deck).

## 5. Outline the slide sequence

Standard flow: **opening → context/problem → 2-4 core sections → close**.

- Opening: title slide, then the hook and stakes in the first 3 minutes. A goals slide with 3 takeaways at most is optional.
- Each core section opens with a marker (divider) slide so a listener who drifted can re-enter. Decks over ~10 content slides benefit from an overview map early, with each later slide tagged to its section; 10 slides or fewer don't need dividers or an agenda.
- Close: recap with one line per section, the arrow restated, then the ask, decision or next step.
- The last slide asks for something or leaves one takeaway. Never "Thank you" or "Questions?" alone; if a contact/links slide closes the deck, put the ask on the slide before it. Repo, docs and handle links appear twice: where they become useful and at the end, which stays up during Q&A.

Slide types to vary between: statement, big statement, question, section divider, data, code, framework (matrix, do/don't), quote, comparison, image, demo, recap, next steps. Change the layout when the slide's job changes; three identical layouts in a row need a reason.

Outline format to hand to the build step:

```markdown
## Spine
- Arrow: ...   Position: ...   Stakes: ...   Ending (verbatim): ...

## 2. Why the old pipeline failed   (section colour: red)
### Slide 4: Retries tripled load during the outage
- Type: data   Evidence: request-rate chart, dependency recovery marked
- Body: 2 callouts max   Notes: what to watch, then the cost
```

## 6. Slide-level content rules

- One idea per slide; the title states it, the body proves it. Two ideas means two slides.
- One evidence shape per slide: a chart, a table, a screenshot, code, a quote, or a conclusion. Split mixed evidence.
- Nothing on screen the speaker isn't about to say; the audience reads faster than you talk. The speaker comments on the slide (why it matters, what it costs), never reads it aloud.
- Bullets: at most about 6 of one line each on a reading deck, 3-4 on a presented one. Prefer a visual when the content allows it.
- Numbers carry source and date in a small caption; match the source's precision ("about 10K" stays "about 10K").
- Captions add information beyond the title (a trade-off, a condition, the next step), never restate it.
- Audience-facing text only. Presenter remarks, image prompts, crop notes and build notes go in speaker notes.
- Risks come with their mitigation on the same slide; review comments and open questions go to an appendix slide, not the main line.
- Missing facts: mark `[DATA NEEDED: what]` and list them in one table for the user. Never invent metrics, logos, quotes or customer names.
- Every slide must survive being screenshotted out of context: no "as I said earlier", nothing critical delivered only verbally over an empty slide.

## 7. Words to cut

Filler openers ("In today's rapidly evolving landscape"), meta phrases ("Let's dive into", "Let me show you", "In conclusion"), hype adjectives ("revolutionary", "game-changing"), corporate mush ("leverage synergies", "unlock value", "empower"). Say what the thing does, with a number when there is one. For a full AI-tells pass on the copy, see content-creation's humanize guide.

## 8. When you are stuck or too long

- List five things that could NOT follow the slide you're stuck on; the material usually surfaces.
- Merge two sections that make one point; cut the setup for a payoff you removed.
- Over length: cut a whole pillar, never thin all three. Slot length is an input, never an output.
- Run the deck out loud against a clock before polishing; the theme only becomes visible after the first full run (rehearsal-and-delivery.md).

## Checklist

- [ ] Arrow, position, stakes and ending written before the outline
- [ ] Every slide serves a spine beat; feature tours rebuilt around problems
- [ ] Ghost-deck test passes; titles are standalone assertions, no "Label:" prefixes
- [ ] One idea and one evidence shape per slide; risks paired with mitigations
- [ ] Every number sourced; gaps listed as `[DATA NEEDED]`; nothing invented
- [ ] Section markers for long decks; final content slide asks for something
- [ ] Presenter text in notes, audience text on slides

> Distilled from: presentation-creator incl. pitch-decks and outline references (mblode/agent-skills, MIT); tech-talk-outline incl. narrative-arcs and slide-and-demo-craft (samber/developer-relations-skills, MIT); presenting-conference-talks (Orchestra-Research/AI-Research-SKILLs, MIT); scientific-slides incl. talk-types, timing and structure guides (K-Dense-AI/scientific-agent-skills, MIT); pitch-deck (anthropics/financial-services, Apache-2.0); consulting-pptx-skill (carnot-tech/consulting-pptx-skill, MIT); deck-writing guide of the docs-office craft (kami, baoyu-slide-deck, frontend-slides, MIT)

# Deck types: skeletons, slide counts and time budgets

Pick the skeleton after the arrow and spine exist ([deck-story.md](deck-story.md)). Slide counts are starting points; the count that survives the first timed run is the right one.

## 1. Sent deck or presented deck

Decide this first; the density rules contradict each other.

| Aspect | Sent / reading deck | Presented / speaking deck |
|---|---|---|
| Who reads it | Someone skimming at a desk, then forwarding it | A room, with you talking |
| Text | Every slide stands alone: 2-3 complete-thought bullets per block, 4-8 bullets or 4-6 cards max | One idea, 1-3 short bullets or one statement, large type |
| Time per slide | 30-60 s, studied | about 3 s to grasp, then you talk |
| Title test | "Makes sense forwarded with no context" | "Parseable in 3 seconds at arm's length" |
| Type floor | Legible at 50% zoom; body ≥ 18 pt | Body 24-30 pt in a large room |
| Notes | Rare; the slide carries it | Required; the talk track lives there |

Build a pitch as the sent deck first; the presented version is a cut of it with body text moved into the talk track. Never put 3-word slides in an emailed deck, or 60-word slides on a stage.

## 2. Investor pitch (seed to Series A)

The 10-slide frame (common ground of Kawasaki 10/20/30, Sequoia's outline and YC seed guidance). Keep the order unless one slide is unusually strong (traction early when the numbers carry the story); a Problem slide on page 7 reads as evasion.

| # | Slide | Carries |
|---|---|---|
| 1 | Title | Company name, the company in one declarative sentence, contact; optional one-line traction hook |
| 2 | Problem | Who feels the pain, why now urgent, what they do today; lead with a customer quote or a number |
| 3 | Solution | Before and after in 30 seconds, not a feature list; one screenshot at most |
| 4 | Why now | What changed that makes this possible or necessary this year |
| 5 | Traction | Chart over text: revenue, users, growth, retention, logos; the number in the title |
| 6 | Market | Bottom-up TAM/SAM/SOM (customers × price), never a quoted "$1T market" |
| 7 | Business model | Revenue streams, pricing, unit economics (CAC, LTV, payback) |
| 8 | Competition | Matrix or quadrant on your axis of differentiation; "no competition" reads as "no market" |
| 9 | Team | Names, roles, one relevant credential each; why this team wins |
| 10 | The ask | Amount, use of funds (e.g. 50% product / 30% GTM / 20% ops), the milestone it unlocks by when, next step |

Financials and roadmap go in an appendix after the ask. Beyond 10 + appendix is trimming, not adding. Send as PDF under 10 MB named `Company - Stage Deck - Month Year.pdf`, 16:9, metrics as real text (searchable, copyable). Numbers in the model come from `trading-finance`.

Mistakes: no explicit ask; features over outcomes; TAM fantasy; traction with no number in the title; presented-deck copy in a sent deck.

## 3. Banker-style pitchbook from a template

When the user hands over a firm template plus Excel/CSV data, this is a fill job, not a design job: follow the template-fill rules in [powerpoint-pptx.md](powerpoint-pptx.md) (instruction boxes deleted, real table objects, same-level boxes in identical sizes, figures identical wherever they repeat, CAGR and consensus checked). Typical hierarchy in such templates: title 40-48 pt bold, block content 11-14 pt, table body 9-11 pt, footnotes 8-9 pt italic. Round so it doesn't change the figure: large markets to $1bn, CAGR to 0.5%, multiples to one decimal (9.7x).

## 4. Sales or customer deck

Structure: the customer's situation in their words → cost of the status quo → what changes with you (before/after) → proof from a similar customer (number, quote, logo with permission) → how adoption works (timeline, effort, risks with mitigations) → commercial summary → one next step with a date.

- Lead with their problem, not your company history; "About us" is one slide, late, or an appendix.
- Evidence depends on the buyer: sales-led B2B (buyer or architect in the room) wants compliance, migration cost, support model, total cost at scale; product-led audiences want time to first success, free tier, activation path.
- Make a customer-specific version: their name, their numbers, their metrics. Generic decks get skimmed.
- Copy for value props and CTAs: content-creation's conversion-copy guide.

## 5. Board, exec or status update

Recommendation or headline result first, then status vs plan, what changed, risks and asks (each risk with its mitigation and owner), decisions needed, next steps. Put the decision on its own content slide before the closing slide. For more than ~10 content slides: an executive summary map up front with "→ p. n" pointers, and every later slide tagged to its section. What a board update should say (status colours, ROAM risks): product-management's stakeholder-comms guide.

Quarterly refresh of an existing deck: change numbers in place across every slide where they appear, keep layouts, and re-check cross-slide consistency.

## 6. Proposal or decision deck

Recommendation first → options compared on the same criteria (rows = options, columns = criteria, one table, not side-by-side boxes) → evidence → cost, risk and mitigation → the decision needed and by when.

## 7. Conference or tech talk

Slot length is an input. Write the talk to the slot, not to the material.

| Slot | Carries |
|---|---|
| 5-10 min lightning | One point or one demo, never both |
| 25-45 min session | The arrow plus 2-3 pillars, one demo |
| 45-60 min keynote | A thesis about the field, less depth per point, callbacks |
| Panel | No deck; prepared positions only |

Default split for a 30-minute slot with Q&A inside:

```
0:00-0:03  hook + stakes          (the room decides whether to open laptops)
0:03-0:05  promise + scope        (what they'll be able to do; who this isn't for)
0:05-0:22  pillars 1-3            (~5-6 min each, each ending on a landed point)
0:22-0:26  demo or evidence       (anchored to the pillar it proves)
0:26-0:28  the arrow restated     (same words as the hook)
0:28-0:30  Q&A or hard stop
```

- Keep 10-15% of the slot as unused buffer, and change mode (demo, diagram, story, question) at least every 7 minutes. Both are practitioner defaults; a timed run overrules them.
- Demo after the audience believes the problem (before that it is a product tour); say what to watch before starting; never end on the demo, keep 2+ minutes after it; budget it at 2x its rehearsed length.
- Deliver what the accepted abstract promised. If you work on the tool you present, say so in the first minute and name where it's the wrong choice.
- Code slides: the smallest fragment that carries the point, changed lines highlighted, never read line by line; terminal text ≥ 24 pt, editor ≥ 20 pt.
- Section marker slides, the never-cut slides marked (hook, realization, arrow), timing checkpoints in the notes.
- Assume it's recorded: chapters and screenshots must stand alone, alt text in the published deck, a PDF fallback exported before travelling.

## 8. Lecture, course module or workshop

Hook → why it matters → 3 key ideas, each as claim, worked example, implication → practice or check question → recap → what to try next. Build complex diagrams progressively (one concept per build step). Put a state change (question, poll, pair exercise, demo) every 3-5 slides or 3-5 minutes; online, every few minutes. Students review decks later, so lean towards self-contained slides and put the spoken detail in notes or a handout.

## 9. Research talk, seminar or defense

| Talk type | Duration | Slides | Depth |
|---|---|---|---|
| Poster talk / spotlight | 3-5 min | 5-8 | Problem + key result only |
| Spotlight | 5-8 min | 8-12 | Problem, approach, key results |
| Conference oral | 15-20 min | 15-22 | Full story with evaluation highlights |
| Seminar / invited | 30-60 min | 25-50 | Context, deep dive, demos, implications |
| Thesis defense | ~45 min + long Q&A | 40-50 | Every study, synthesis, comprehensive limitations |

Rough pacing: about 1 slide per minute for orals; title/divider slides 15-30 s; key result slides 2-4 min. Spend 40-50% of the time on results.

Oral skeleton: title → problem context → specific problem, quantified → gap in existing work → key insight (thesis) → approach overview (architecture diagram) → 2-3 design or method components → evaluation setup (brief) → main result → breakdown/ablation → limitations → summary of contributions → future work → links/QR to paper and code.

- State the takeaway before the figure ("Our system is 2x faster; here is the data"); show the 2-3 strongest figures, the rest in backup slides.
- Rebuild paper figures for slides (data-slides.md); never paste a six-panel journal figure.
- "Say what you'll say, say it, say what you said" at talk, section and slide level.
- Defense: prepare backup slides with extra analyses, address limitations before you're asked, rehearse Q&A with colleagues (rehearsal-and-delivery.md).
- Citations on the slide in small text (author, year); finding and verifying them belongs to research-science.
- LaTeX Beamer is the norm in many fields: start from `templates/scientific-slides/beamer_template_conference.tex` (see html-and-markdown-decks.md).

## 10. Slide-count cheat sheet

| Duration | Typical slides (speaking deck) |
|---|---|
| 5 min | 5-8 |
| 10 min | 8-14 |
| 15 min | 13-20 |
| 20 min | 18-26 |
| 30 min | 22-33 |
| 45 min | 32-50 |
| 60 min | 40-65 |

`python scripts/scientific-slides/validate_presentation.py deck.pdf --duration 15` warns when the count falls outside these bands. A story-led talk can run on far fewer slides and a fast technical talk on far more: treat the band as a smell test, not a target.

## Checklist

- [ ] Sent vs presented decided before writing; density matches
- [ ] Skeleton matches the deck type; order departures are deliberate
- [ ] Pitch: 10 slides + appendix, explicit ask with amount, use and milestone
- [ ] Talk: written to the slot with buffer; demo placed after the problem lands
- [ ] Research: 40-50% on results; takeaway stated before each figure
- [ ] Decision and update decks lead with the recommendation or result

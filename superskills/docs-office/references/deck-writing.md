> Distilled from: kami (tw93/Kami, MIT), baoyu-slide-deck (jimliu/baoyu-skills, MIT), frontend-slides (zarazhangrui/frontend-slides, MIT), pptx-generator (MiniMax-AI/skills, MIT), html-ppt (lewislulu/html-ppt-skill, MIT), ppt-master (hugohe3/ppt-master, MIT)

# Deck story and slide content (any format)

The format (pptx, HTML, Slidev, PDF) is the last decision. A deck succeeds or fails on its argument and on one idea per slide.

## Intake (infer first, ask at most once)

| Question | Default if unknown |
|---|---|
| Audience and venue (live talk, investor 1:1, async link) | live talk |
| Length: minutes or slide count | 15 min ≈ 10 slides; 30 min ≈ 20; 45 min ≈ 25-30 |
| Goal: what should the audience believe or do afterwards | ask if truly unclear |
| Source material available (doc, notes, data, screenshots, logo) | use what was given; list gaps |
| Hard constraints: brand colours, logo, required slides, editable .pptx | none |
| Reading deck or speaking deck | speaking |

State the plan in one line ("12 slides, speaking deck, editable pptx, brand navy") and continue; adjust if the user objects.

## Build the story before any styling

1. Write the single sentence the deck must prove.
2. Outline 3-5 supporting claims, each with its evidence (number, chart, screenshot, quote, demo).
3. Turn every slide title into an **assertion**, not a label: "Q3 revenue beat guidance by 12%", not "Q3 Results"; "One platform replaces five tools", not "Our Solution".
4. **Ghost-deck test:** read only the titles in order. They must tell the whole argument. If not, fix titles or structure before designing.
5. One evidence shape per slide: a chart, a table, a screenshot, code, a quote, or a conclusion. Split mixed evidence into separate slides.
6. End with a call to action, decision, or memorable takeaway, not "Thank you" or "Questions?" alone.

Common skeletons:

| Deck | Sequence |
|---|---|
| Pitch | problem → why now → solution → how it works → traction → market → business model → team → ask |
| Project update | headline result → status vs plan → what changed → risks and asks → next steps |
| Proposal / decision | recommendation first → options compared → evidence → cost and risk → decision needed |
| Teaching / talk | hook → why it matters → 3 key ideas (each: claim, example, implication) → recap → what to try |
| Research results | question → method in one slide → main result → supporting results → limitations → implications |

## Slide-level rules

- One idea per slide; the title states it, the body proves it.
- Bullets: at most about 6, one line each; trim until each fits on one line. Prefer a visual over bullets when the content allows it.
- Numbers: the source and date on the slide (small caption). Match the source's precision; don't turn "about 10K" into "10,000".
- Chart titles state the insight ("Churn fell after the price change"), axis labels have units, highlight the one series that matters and grey the rest.
- A chart must add something the text doesn't (trend, comparison, distribution); don't chart three numbers already stated in the title.
- Captions add information beyond the title (a trade-off, a condition, the next step), never restate it.
- Audience-facing text only on slides. Presenter remarks, image prompts, crop notes and generation notes go in speaker notes.
- Visual consistency: same icon style, colour roles, grid and type hierarchy on every slide.
- Missing facts: mark `[DATA NEEDED: what]` and list them for the user. Never invent metrics, logos, quotes or customer names.

## Words to cut

Filler openers ("In today's rapidly evolving landscape..."), meta phrases ("Let's dive into", "Let me show you", "In conclusion"), hype adjectives ("revolutionary", "exciting", "game-changing"), corporate mush ("leverage synergies", "unlock value", "empower"). Say what the thing does, with a number when there is one.

## Visual direction

- Pick colours from the subject and audience, not default corporate blue. A finance board deck can be navy and warm grey; a food brand can be tomato and cream.
- One dominant colour, one accent used sparingly (at most about three accent touches per slide), neutrals for text.
- Two typefaces at most; titles 1.5-2x the body size.
- Generous margins; align everything to one grid.
- Avoid the generated-deck look: decorative bars under every title, emoji as section icons, the same three-card layout on every slide, purple gradients, centred paragraphs.

## Review checklist

- [ ] Ghost-deck test passes: titles alone tell the argument
- [ ] Every number has a source; no invented data, logos or quotes
- [ ] One idea and one evidence shape per slide; nothing overflows
- [ ] Layouts vary (statement, chart, comparison, image, quote, section) without breaking the system
- [ ] Final slide asks for something or leaves one takeaway
- [ ] Speaker notes hold presenter text; slides hold audience text
- [ ] Gaps listed for the user in one table

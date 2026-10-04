> Distilled from: deck-writing, powerpoint-pptx and html-slides guides of the docs-office craft (from pptx-generator (MiniMax-AI/skills, MIT), frontend-slides (zarazhangrui/frontend-slides, MIT), html-ppt (lewislulu/html-ppt-skill, MIT), kami (tw93/Kami, MIT), baoyu-slide-deck (jimliu/baoyu-skills, MIT)); presentation-creator visual-design (mblode/agent-skills, MIT); consulting-pptx-skill slide rules (carnot-tech/consulting-pptx-skill, MIT); scientific-slides design principles (K-Dense-AI/scientific-agent-skills, MIT); tech-talk-outline slide craft (samber/developer-relations-skills, MIT); revealjs (ryanbbrown/revealjs-skill, MIT)

# Slide design and layout systems

Design is a system decided once and held for the whole deck: canvas, grid, type scale, colour roles, a handful of layouts. Decide it after the outline and copy exist ([deck-story.md](deck-story.md)), so the system serves the slides instead of slide 3.

## 1. Canvas and grid

| Format | 16:9 canvas | Units |
|---|---|---|
| PowerPoint (PptxGenJS `LAYOUT_16x9`) | 10 x 5.625 in | inches, pt |
| PowerPoint (python-pptx / "widescreen") | 13.333 x 7.5 in (12192000 x 6858000 EMU) | EMU, pt |
| Google Slides default | 9144000 x 5143500 EMU (10 x 5.625 in) | EMU |
| HTML single-file stage | 1920 x 1080 px, scaled as a whole | px |
| Marp | 1280 x 720 px (`size: 16:9`) | px |
| Print-first HTML/PDF | 338.67 x 190.5 mm, `@page` matching | mm |

- Always 16:9 unless the venue or template says otherwise; confirm 4:3 for old projectors.
- Safe margin about 0.5 in (0.4-0.6) on 10-inch canvases, ~72 px on the 1920 stage. Keep the bottom sixth free of load-bearing content in a conference room (heads, lower-third banners).
- One grid: 12 columns or a fixed split set. Splits read better asymmetric: pick from 60/40, 70/30, 40/60, 30/70 and stick to them.
- One gap value (0.3 or 0.5 in; 24 or 32 px) used everywhere. Parallel cards get identical heights and gaps.
- Left-align body text; centre only titles of statement slides and single big statements.
- Aim for generous white space: 40-50% of a speaking slide can be empty.

## 2. Type

Two typefaces at most: a display face and a readable text face. Impact comes from **scale, not weight**: large light or regular headlines beat small bold ones.

| Level | PowerPoint pt | Marp px (1280) | HTML stage px (1920) |
|---|---|---|---|
| Big statement | 80+ | fit to width | 160-200 |
| Slide title | 32-44 (up to 66 for short statements) | 56-96 | 96-112 |
| Subtitle | 24-28 | 32-36 | 40-48 |
| Body / bullets | 18-24 (24-30 in a large hall) | 24-28 | 28-36 |
| Caption, source | 12-14, never under 12 | 16-18 | 22-24 |

- Title to body ratio at least 1.5-2x.
- Floors: Kawasaki's 30 pt for body on a presented pitch in a big room; 18 pt for a deck read at a desk; nothing under 12 pt anywhere.
- Headlines: line-height near 0.95-1.05, slight negative tracking (about -0.025em), `text-wrap: balance` for display sizes in HTML. Break two-line titles at a meaning boundary; no orphan of 1-3 characters.
- Editable decks need fonts the recipient has: Arial, Calibri, Georgia, Segoe UI, or the brand font if installed. Chinese: Microsoft YaHei or PingFang; Japanese: Yu Gothic or Hiragino. HTML decks may load Google Fonts or Fontshare.
- Avoid the default-AI choices (Inter, Roboto, Arial for HTML decks, the same "safe" display font every time); pick a face that fits the subject.
- Web decks viewed at many sizes: size inside a fixed stage, or with `clamp()` when the deck is a responsive web app. Fixed canvases (Marp, pptx, Keynote) take absolute sizes.

## 3. Colour

1. One dominant colour, one accent used sparingly (about three accent touches per slide at most), neutrals for text. Pick colours from the subject and audience, not default corporate blue: a finance board can be navy and warm grey, a food brand tomato and cream.
2. Pick one colour system and hold it:

| System | Use when | How position is tracked |
|---|---|---|
| Light or dark base, one accent per section | Most decks; technical content; living inside a house template | The accent changes per section |
| Full-bleed palettes (each slide owns a background/foreground pair) | A deck with its own identity; chapters or products that each own a colour | The whole screen changes |

Never mix them (an accent on a full-bleed slide). A subject keeps its palette across its slides; put a quiet slide between two loud ones.

3. **Venue decides light or dark.** Dark suits a dark hall with a bright screen; light suits bright rooms, weak projectors and anything that doubles as a handout. A dark deck under daylight goes grey and white body text vanishes. If unsure, light.
4. **Contrast from hex values, on the smallest text**: 4.5:1 for body, captions and code; 3:1 only for text ≥ 24 px / 18 pt (or 18.66 px bold). Projection lifts black levels, so prefer 7:1 for body text. Record the ratio in QA, not "ok". Saturated pairs (rust on cream about 3.7:1) carry headlines only.
5. Derive muted tones by mixing the foreground into the background (`color-mix(in oklab, var(--fg) 80%, var(--bg))`), not with opacity, which muddies on saturated backgrounds.
6. Never convey meaning by colour alone: add a label, sign (+/-) or shape. If you colour-code, show a legend on that slide. Avoid red/green pairs.
7. Brand palette given? Use it, check contrast, and put brand colours on titles, accents and charts while body stays near-black on light. A brand theme or kit to build from: poster-design's brand-kits guide.

## 4. Layout patterns

| Slide job | Layout |
|---|---|
| Statement / big statement | Headline scaled to fill, left-aligned (statement) or centred (big statement), nothing else |
| Section divider | Palette change or accent field, section title, optional number |
| Evidence + meaning | Two columns: left the chart/table/fact, right the "so what" with its own heading; columns bottom-aligned |
| Comparison | One table: rows = items, columns = criteria. Not two boxes to eyeball |
| Process | Chevron row when the process is the whole slide; vertical numbered steps on the left with comments on the right otherwise |
| Data / metrics | 2-4 big numbers with labels, or one chart; see data-slides.md |
| Image | Full-bleed photo with a scrim behind the title; or image + text split; or a gallery of 3-6 in uniform frames |
| Code | Title, one short highlighted fragment |
| Quote | The quote large, attribution below |
| Demo | Full-bleed, the running thing, minimal chrome |

Rules that keep slides clean:

- Every content slide carries a visual element (chart, image, diagram, icon row, big number, shaped layout), but no decoration for its own sake.
- No message band at the bottom of the slide ("KEY TAKEAWAY: ..."): the takeaway belongs in the title or the right column.
- Prefer a table with real axes over a grid of three equal cards; the card grid is the generic generated-deck look.
- Don't stack unrelated blocks vertically; split left/right, each with a heading. One table per slide.
- No floating labels or chips: every element lives in a column, table or chart.
- When content is short, centre it vertically; never stretch boxes or line spacing to fill space.
- Images stay inside the slide bounds in a frame that fixes their ratio (contain for screenshots and diagrams, cover for photos); never a bare image that pushes content off the slide. Relative paths only.
- People and documents in diagrams: simple single-colour icons with labels, not abstract blobs.
- Logo once (title and closing, or a small master element), not pasted on every slide by hand.
- Number every slide except the cover; small, in a corner.

## 5. Density modes

| Mode | Per slide | Use for |
|---|---|---|
| Speaker-led (low density) | One idea, 1-3 short bullets or one statement, large type, more slides | Talks, keynotes, pitches presented live |
| Reading deck (high density) | Self-contained: grid, comparison table, annotated diagram, 4-8 bullets or 4-6 cards | Async review, handouts, internal reports, sent pitch decks |

Either way: no overflow, no overlapping panels, no scrolling, nothing below the type floors. **Split before shrinking.** If the user's needs are mixed, choose the closer mode: live persuasion → low; async review → high.

## 6. Motion and builds

- One orchestrated entrance per slide (staggered fade-up of 3-4 items, 0.1 s apart) beats many effects. CSS-only in HTML decks; respect `prefers-reduced-motion`.
- Use builds (click reveals, `v-click`, fragments, Beamer `\pause`) to control attention on a complex diagram or a list you discuss item by item, not to decorate.
- Per-word builds slow the talk and break screen readers of the published deck. Exported PDFs show the final state unless you export each build step.
- Slide transitions: none or a quick fade. Matching the motion to the mood (calm = slow fades; corporate = fast 200-300 ms) is fine; parallax and spins rarely are.

## 7. Avoid the generated-deck look

Decorative bars under every title; emoji as section icons; the same three-card layout on every slide; purple gradients on white; centred paragraphs; the same title pattern on every slide; rounded boxes with drop shadows everywhere; stock "handshake" photos; a different style on the cover than on slide 4. Commit to the style on every slide, not only the cover.

## 8. Style discovery (when the user has no style)

Show, don't ask. Build three single-slide previews of the real title slide with the user's content in clearly different directions (one restrained, one bold, one tailored to the subject) and let them pick or mix. Previews never show internal labels ("Option A", "preset", file paths, notes about the audience). For HTML decks the mechanics are in html-and-markdown-decks.md; in pptx, render three title slides to PNG.

## Checklist

- [ ] Canvas, margins, grid and gap set once; parallel elements identical in size
- [ ] Two typefaces; title ≥ 1.5x body; nothing under the floor for this venue
- [ ] One colour system; light/dark chosen for the venue; contrast measured on the smallest text
- [ ] No meaning by colour alone; legend wherever colour encodes something
- [ ] Layout changes when the job changes; no bottom message bands, no card-grid default
- [ ] Density mode applied consistently; long content split, not shrunk
- [ ] Motion purposeful and reduced-motion safe

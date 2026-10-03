# Infographics and visual summaries

> Distilled from: baoyu-infographic (jimliu/baoyu-skills, MIT), banner-design (nextlevelbuilder/ui-ux-pro-max-skill, MIT), latex-posters (K-Dense-AI/claude-scientific-skills, MIT), visual-design-foundations (wshobson/agents, MIT).

An infographic turns content into one image that teaches 1–3 things. Two independent choices: **layout** (information structure) × **style** (look). Any layout works with any style.

## 1. Analyse the content first

1. Read all of it before structuring anything.
2. Write 1–3 learning objectives: "After viewing, the reader will understand…".
3. Classify the content type and count the points: simple 3–5, moderate 6–8, complex 9+ (complex → dense layout or split into two images).
4. **Extract data verbatim**: "73%" stays "73%" (never "about 70%"); quotes word for word with attribution; names, dates, units, technical terms and list order unchanged. Never add implied facts.
5. Map what can be shown instead of told: numbers → big numerals; comparisons → side by side; process → arrows and numbered steps; hierarchy → size or layers; relationships → lines/overlaps; categories → colour groups.

Save `structured-content.md`: title, objectives, sections with exact text and data. This is what gets designed.

## 2. Pick a layout

| Content | Layout |
|---|---|
| Timeline, history, tutorial steps | linear-progression (horizontal or vertical) |
| Journey, milestones | winding-roadmap |
| A vs B, before/after, pros/cons | binary-comparison |
| Many options × many criteria | comparison-matrix |
| Pyramid, priority levels | hierarchical-layers |
| Taxonomy, categories | tree-branching or periodic-table |
| Central idea with related items | hub-spoke |
| Anatomy, exploded view | structural-breakdown |
| Overview of several topics (default) | bento-grid (one hero cell + mixed 1×1, 2×1, 2×2 cells) |
| Surface vs hidden | iceberg |
| Problem → solution | bridge |
| Conversion, filtering | funnel |
| Metrics, KPIs | dashboard |
| Overlapping concepts | venn-diagram |
| Cycle, feedback loop | circular-flow |
| Interlocking parts | jigsaw |
| Narrative | comic-strip or story-mountain |
| Spatial relations | isometric-map |
| Buying guide, dense reference | dense-modules (many small titled modules, portrait) |

## 3. Pick a style

Friendly: craft-handmade (paper craft, hand-drawn, default), storybook watercolour, kawaii, claymation, hand-drawn edu (macaron pastels, wobbly lines, stick figures), morandi journal (warm muted doodles).
Business: corporate memphis (flat vector, vibrant), bold-graphic (comic, halftone, thick outlines), retro pop grid (70s pop, Swiss grid).
Technical: technical schematic (blueprint), pop laboratory (blueprint grid, coordinate markers), IKEA-manual line art, subway-map, UI wireframe, knolling flat-lay.
Playful/retro: chalkboard, pixel art, lego brick, origami, cyberpunk neon, aged academia (sepia), retro pop-up collage.

Proven pairs: timeline → linear + craft; steps → linear + IKEA manual; A vs B → binary + corporate memphis; technical → structural + schematic; metrics → dashboard + corporate memphis; education → bento + chalkboard; product guide → dense-modules + morandi journal.

Offer the user 3 layout×style combinations with one line of rationale each, plus aspect: landscape 16:9, portrait 9:16 or 3:4 (best for dense/scrolling), square 1:1.

## 4. Build route A: code (exact, editable)

Best when data, labels and numbers must be exact or the piece will be revised.
- HTML/CSS grid or SVG at the target size (e.g. 1080×1350, 1200×1800, 1920×1080); export to PNG with a browser screenshot (see banners guide) or `render_png.py`.
- Charts from real data (D3, Chart.js, matplotlib, Vega-Lite), never redrawn by hand.
- Icons from one icon set at one stroke weight.
- Type: title ≥ 3× body; section heads clearly second; body ≥ 24 px at 1080 wide; ≤ 2 families.
- Colour-code categories with ≤ 5 hues plus neutrals; pair colour with labels or icons (colour-blind safety).
- Visual-to-text balance ~40–50% visuals; generous gutters (≥ 24 px at 1080 wide).

## 5. Build route B: image model

Good for illustrative styles (watercolour, claymation, chalk) with short labels.
- Prompt = layout description (structure, number of sections, reading order) + style description (palette hex, line treatment, texture) + exact text per section in quotes + aspect.
- Keep labels short (1–4 words) and few; long text or numbers in a model render will garble. If text comes out wrong, regenerate with less text or move text to route A. Never patch the bitmap.
- Save the full prompt to `prompts/infographic.md` first.
- Hybrid works well: generate a text-free illustrated background/modules, then set all text and numbers in HTML/SVG on top.

## 6. Pitfalls

- Decoration that doesn't encode anything (3D pies, random icons).
- Rounded or "simplified" numbers; invented statistics.
- Too many points for one image; split instead of shrinking type.
- No reading order; inconsistent icon styles; more than one accent colour fighting for attention.
- Wrong chart for the data: use bars for comparison, lines for change over time, a single big number for one key stat.

## 7. Checks

- [ ] Every number, name and quote matches the source exactly
- [ ] Clear title and obvious reading order
- [ ] Readable on a phone at full width; title readable as a thumbnail
- [ ] Contrast ≥ 4.5:1; meaning not carried by colour alone
- [ ] Source/credit line included when data comes from somewhere

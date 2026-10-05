> Distilled from: powerpoint-pptx guide of the docs-office craft (from pptx-generator (MiniMax-AI/skills, MIT), ppt-master (hugohe3/ppt-master, MIT), officecli (iOfficeAI/OfficeCLI, Apache-2.0), frontend-slides (zarazhangrui/frontend-slides, MIT), kami (tw93/Kami, MIT), markitdown (K-Dense-AI/scientific-agent-skills, MIT)); pitch-deck (anthropics/financial-services, Apache-2.0); presenting-conference-talks (Orchestra-Research/AI-Research-SKILLs, MIT); scientific-slides PowerPoint design guide (K-Dense-AI/scientific-agent-skills, MIT); presentation-creator output formats (mblode/agent-skills, MIT); slidev (slidevjs/slidev, MIT)

# PowerPoint decks (.pptx)

Use this when the user needs an editable .pptx: they will edit it, it must use a company template, or the recipient expects PowerPoint. If they only need to present or share, an HTML deck ([html-and-markdown-decks.md](html-and-markdown-decks.md)) is usually faster and better looking. Write the story first ([deck-story.md](deck-story.md)), then build. Anthropic's own `pptx` skill is proprietary (link-only); nothing from it is used here, but load it if it is installed and the user prefers it.

## 1. Choose the path

| Situation | Path |
|---|---|
| New deck, no template | PptxGenJS (Node), one module per slide |
| New deck in a Python environment | python-pptx |
| User supplies a template or brand deck | Fill the template: python-pptx on a copy, or edit its XML (section 5) |
| Template + Excel/CSV data to populate (pitchbook, quarterly refresh) | Template fill rules (section 6) |
| Read or summarise a deck | `markitdown deck.pptx` or `python scripts/frontend-slides/extract-pptx.py deck.pptx outdir/` |
| Convert a deck to HTML | extract-pptx.py, then html-and-markdown-decks.md |
| Markdown to a quick editable deck | `pandoc slides.md -o deck.pptx --reference-doc=brand.pptx` (one `##` per slide) |
| `officecli` installed | `officecli add deck.pptx / --type slide ...` (section 8) |
| Image-heavy designed deck from a full pipeline, brand/layout workspaces | ppt-master (install separately; large) |
| Charts made with think-cell (waterfall, Mekko, Gantt) in the template | think-cell `.ppttc` JSON automation ([data-slides.md](data-slides.md) section 6) |
| The deck lives in Canva, Gamma, Pitch or Beautiful.ai | That app's connector ([deck-apps.md](deck-apps.md)) |

Marp `--pptx` and Slidev `--format pptx` put each slide in as a picture: text is not editable or searchable. Marp's `--pptx-editable` is experimental and loses styling; Slidev's `--format pptx-editable` rebuilds simple slides as shapes but keeps SVG, Mermaid, KaTeX, gradients and canvas as pictures and only names fonts. When editability is the deliverable, build the pptx natively.

Keynote opens .pptx, so for a Keynote user this path plus a check in Keynote is usually simplest (google-slides-keynote.md).

## 2. PptxGenJS conventions

Setup: `npm install pptxgenjs` (local to the project).

- `LAYOUT_16x9` is 10 x 5.625 in; positions and sizes in inches.
- Colours are 6-digit hex **without** `#` (`"1F3A5F"`). A `#` or an 8-digit colour with alpha corrupts the file; use the `transparency` (0-100) option instead.
- PptxGenJS mutates option objects. Build a fresh object per call (a small factory function for shadows, fonts).
- Long titles: shorten them, or `fit: "shrink"` as a last resort; `margin: 0` when a text box must align with a shape edge.
- Charts: `slide.addChart(pres.charts.BAR, data, opts)` with `data = [{name, labels, values}]`; native charts stay editable (data-slides.md).
- Tables: `slide.addTable(rows, opts)`; never fake columns with spaces or tabs.
- Speaker notes: `slide.addNotes("...")`. Never put presenter text in a text box on the slide.
- One theme object passed to every slide module: `{primary, secondary, accent, light, bg}`.

Project layout that scales to many slides:

```
slides/
  slide-01.js ... slide-NN.js   # each exports createSlide(pres, theme), synchronous
  compile.js                    # creates pres, sets layout, requires each module in order, writeFile
  imgs/                         # local images
  output/deck.pptx
```

```javascript
// compile.js
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
const theme = { primary: "1F2A44", secondary: "4A5568", accent: "C8553D", light: "F2E8DF", bg: "FFFFFF" };
const n = 10;
for (let i = 1; i <= n; i++) require(`./slide-${String(i).padStart(2, "0")}.js`).createSlide(pres, theme);
pres.writeFile({ fileName: "./output/deck.pptx" });
```

Keep `createSlide` synchronous; the compiler doesn't await. Number every slide except the cover (small badge bottom-right, about x 9.3, y 5.1 in).

## 3. python-pptx essentials

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation("brand-template.pptx")       # or Presentation() for a blank 4:3 default
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)   # only when starting blank
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Churn fell 30% after the price change"
body = slide.placeholders[1].text_frame
body.text = "Monthly churn 4.1% → 2.9% (Mar-Aug)"
p = body.add_paragraph(); p.text = "Largest drop in the annual plan"; p.level = 1
slide.notes_slide.notes_text_frame.text = "Key point: ... Transition: ..."
prs.save("output/deck.pptx")
```

- `Presentation()` defaults to 4:3; set 16:9 explicitly or start from a 16:9 template.
- Use the template's layouts and placeholders (`slide.placeholders[idx]`) so text inherits theme fonts and bullets. List them first: `for l in prs.slide_layouts: print(l.name, [p.placeholder_format.idx for p in l.placeholders])`.
- Bullets are separate paragraphs (`add_paragraph()`, `p.level = 1`), never one paragraph with "•" characters.
- Native tables `shapes.add_table(rows, cols, x, y, cx, cy)`, native charts `shapes.add_chart(XL_CHART_TYPE..., x, y, cx, cy, ChartData())`.
- Images: compute the frame from the image's aspect ratio so it is never stretched; keep inside the margins.
- Arrows and connectors are shapes (`MSO_SHAPE.RIGHT_ARROW`, connectors), not "→" characters.

## 4. Design rules for pptx

- 16:9, safe margin about 0.5 in on every side; one grid; one gap value (0.3 or 0.5 in).
- Title 32-44 pt, body 18-24 pt (16 pt minimum in reading decks), nothing under 12 pt. Title at least 1.5-2x body.
- Two fonts maximum, installed on the recipient's machine (Arial, Calibri, Georgia, Segoe UI, or the brand font).
- One dominant colour, one accent, neutrals; colours from the topic; text contrast ≥ 4.5:1.
- Left-align body text; at most about 6 one-line bullets; split slides instead of shrinking type.
- Every content slide carries a visual element; no decorative underline bars under titles.
- Commit to the style on every slide, not only the cover. Full rules: slide-design.md.

## 5. Editing a template deck (XML route)

Use when python-pptx can't do the job (duplicating slides with all their parts, precise reordering).

1. Copy the original (`cp user.pptx work.pptx`) and keep it untouched. Extract text (`markitdown work.pptx`) to see each slide's placeholders and slots.
2. Map content to template slides. Vary layouts: two/three columns, image + text, big number, quote, comparison, section divider. Don't put every point on a title + bullets slide.
3. Unpack (`unzip -q work.pptx -d unpacked/`). Do all structural work first:
   - order lives in `ppt/presentation.xml` `<p:sldIdLst>`;
   - to duplicate, copy `slideN.xml` **and** its `_rels/slideN.xml.rels`, add an `<Override>` in `[Content_Types].xml`, a relationship in `ppt/_rels/presentation.xml.rels` and a `<p:sldId>` with a new id and rId;
   - to delete, remove the `<p:sldId>` and then the orphaned files.
4. Replace text slide by slide with precise edits (one `<a:t>` at a time). Each item gets its own `<a:p>`; copy the original `<a:pPr>` to keep spacing; bold labels with `b="1"` on `<a:rPr>`.
5. Fewer items than the template slot (3 people, template has 4): delete the whole group (photo, name, title boxes), not just the text.
6. Escape and preserve: `&amp;`, curly quotes as `&#x201C;`/`&#x201D;`, `xml:space="preserve"` for leading/trailing spaces. Parse XML with lxml or `defusedxml`; plain `xml.etree` can mangle namespaces.
7. Pack from inside the folder (`cd unpacked && zip -qr -X ../edited.pptx '[Content_Types].xml' _rels docProps ppt`), writing to a local temp path first if the destination is a network or container mount.

## 6. Filling a template with data (pitchbooks, refreshes)

1. Back up the template (`deck_backup.pptx`) before touching it.
2. Extract every figure from the sources; standardise units and currency to the template's; note calculations to verify (CAGR, consensus, totals).
3. Open and render the template first; list its slots.
4. Tell the two kinds of placeholder apart:

| Kind | Looks like | Do |
|---|---|---|
| Instruction box | Bright fill (yellow, orange), guidance text ("Insert market size here"), often light text on colour | Delete the shape; build properly formatted content in its place |
| Layout placeholder | Neutral, theme-coloured, "Click to add text", exists on an empty slide of that layout | Keep the shape; replace the text only |

5. Content first, then formatting matched to the template: same-level boxes use identical font sizes; vertically stacked boxes share left edge, indent and width; adjacent boxes share top and height.
6. Tables as table objects; arrows as shapes; charts pasted as the chart object only, resized to fill their area.
7. Logo from the task files; if missing, flag `[LOGO NOT PROVIDED]` rather than inventing one.
8. Max 6-7 bullets per box and 2 lines per bullet; no orphan words.
9. The same metric is identical on every slide where it appears.
10. Validate (section 7), fix, re-validate; after 3 cycles, list what remains by slide and hand it over.

When validation used LibreOffice, say so on delivery: "Validated with LibreOffice renders; please review in PowerPoint before distribution, as fonts, gradients and wrapping can differ."

## 7. QA loop (required)

1. Extract text: `markitdown output/deck.pptx`; check order, typos, missing content, ghost-deck titles.
2. Placeholder hunt: `markitdown output/deck.pptx | grep -niE "lorem|ipsum|xxxx|placeholder|click to add|insert|\[DATA NEEDED|TBD"`.
3. Render and look: `soffice --headless --convert-to pdf --outdir check/ output/deck.pptx && pdftoppm -png -r 60 check/deck.pdf check/slide`. Inspect every image for overflow, overlap, cut-off text, low contrast, misaligned edges, empty template boxes, stretched images.
4. Optional structural pass: `python scripts/scientific-slides/validate_presentation.py output/deck.pptx --duration 20` (slide count vs time, text under 18 pt, more than 6 bullets; small captions will warn by design).
5. Fix, re-render the changed slides, re-check. Expect issues on the first render; at least one fix-and-verify cycle before delivery.
6. Report what was checked and anything not verifiable (fonts not installed here render differently). Full checklist: deck-qa.md.

## 8. officecli quick reference (optional binary)

```bash
officecli create deck.pptx
officecli add deck.pptx / --type slide --prop title="Q4 Report" --prop background=1A1A2E
officecli add deck.pptx '/slide[1]' --type shape --prop text="Revenue grew 25%" --prop x=2cm --prop y=5cm --prop size=24 --prop color=FFFFFF
officecli view deck.pptx outline|issues|screenshot
officecli help pptx shape          # property names before guessing
```

## Checklist

- [ ] Native pptx when editability matters (not a Marp/Slidev picture export)
- [ ] Template layouts and placeholders reused; instruction boxes deleted
- [ ] No `#` in PptxGenJS colours; fresh option objects; 16:9 set explicitly in python-pptx
- [ ] Real tables, charts, arrows; bullets as paragraphs
- [ ] Notes in the notes pane on every content slide of a speaking deck
- [ ] Rendered, every slide inspected, at least one fix cycle; LibreOffice caveat stated

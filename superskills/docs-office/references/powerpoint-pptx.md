> Distilled from: pptx-generator (MiniMax-AI/skills, MIT), ppt-master (hugohe3/ppt-master, MIT), officecli (iOfficeAI/OfficeCLI, Apache-2.0), frontend-slides (zarazhangrui/frontend-slides, MIT), kami (tw93/Kami, MIT), markitdown (K-Dense-AI/scientific-agent-skills, MIT)

# PowerPoint decks (.pptx)

Use this when the user needs an editable .pptx. If they only need to present or share, an HTML deck (html-slides.md) is usually faster and better looking. Write the story first (deck-writing.md), then build.

## Choose the path

| Situation | Path |
|---|---|
| New deck, no template | PptxGenJS (Node), one module per slide |
| New deck in Python environment | python-pptx |
| User supplies a template or brand deck | Edit the template's XML (unpack → duplicate/reorder slides → replace text → pack) or python-pptx on a copy |
| Read or summarise a deck | `markitdown deck.pptx` or `python scripts/frontend-slides/extract-pptx.py deck.pptx outdir/` |
| Convert a deck to HTML | extract-pptx.py, then html-slides.md |
| Markdown to quick editable deck | `pandoc slides.md -o deck.pptx --reference-doc=brand.pptx` or `markdown-exporter md_to_pptx` |
| `officecli` installed | `officecli add deck.pptx / --type slide ...` |
| Image-heavy, highly designed decks from a full pipeline | ppt-master (install that skill separately; it is large) |

## PptxGenJS conventions

Setup: `npm install pptxgenjs` (local to the project).

- Layout `LAYOUT_16x9` is 10 x 5.625 in; positions and sizes in inches.
- Colours are 6-digit hex **without** `#` (`"1F3A5F"`). A `#` or an 8-digit colour with alpha corrupts the file; use the `transparency` (0-100) or `opacity` option instead.
- PptxGenJS mutates option objects. Build a fresh object per call (a small factory function for shadows, fonts).
- Long titles: `fit: "shrink"` or shorten them; set `margin: 0` when a text box must align with a shape edge.
- Charts: `slide.addChart(pres.charts.BAR, data, opts)` with `data = [{name, labels, values}]`; types BAR, LINE, PIE, DOUGHNUT, SCATTER, BUBBLE, RADAR. Native charts stay editable; prefer them to images.
- Speaker notes: `slide.addNotes("...")`.
- Theme object passed to every slide module so colours stay consistent: `{primary, secondary, accent, light, bg}`.

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

## python-pptx essentials

- `Presentation()` default is 4:3; set `prs.slide_width = Inches(13.333)`, `prs.slide_height = Inches(7.5)` for 16:9, or start from a 16:9 template.
- Use the template's layouts and placeholders (`slide.placeholders[idx]`) so text inherits theme fonts and bullets.
- Bullets: separate paragraphs (`tf.add_paragraph()`, `p.level = 1`), never one paragraph with "•" characters.
- Native tables `shapes.add_table`, native charts `shapes.add_chart(XL_CHART_TYPE..., ChartData())`.

## Editing a template deck (XML route)

1. Copy the original (`cp user.pptx template.pptx`) and keep it untouched. Extract text (`markitdown template.pptx`) to see each slide's placeholders and slots.
2. Map content to template slides. Vary layouts: two/three columns, image + text, big number, quote, comparison, section divider. Don't put every point on a title + bullets slide.
3. Unpack (`unzip -q template.pptx -d unpacked/`). Do all structural work first:
   - order lives in `ppt/presentation.xml` `<p:sldIdLst>`;
   - to duplicate, copy `slideN.xml` **and** its `_rels/slideN.xml.rels`, add an `<Override>` in `[Content_Types].xml`, a relationship in `ppt/_rels/presentation.xml.rels` and a `<p:sldId>` with a new id and rId;
   - to delete, remove the `<p:sldId>` and then the orphaned files.
4. Replace text slide by slide with precise edits (one `<a:t>` at a time). Each item gets its own `<a:p>`; copy the original `<a:pPr>` to keep spacing; bold labels with `b="1"` on `<a:rPr>`.
5. When the content has fewer items than the template slot (3 people, template has 4), delete the whole group (photo, name, title boxes), not just the text.
6. Escape and preserve: `&amp;`, curly quotes as `&#x201C;`/`&#x201D;`, `xml:space="preserve"` for leading/trailing spaces. Parse XML with lxml or `defusedxml`; plain `xml.etree` can mangle namespaces.
7. Pack from inside the folder (`cd unpacked && zip -qr -X ../edited.pptx '[Content_Types].xml' _rels docProps ppt`), writing to a local temp path first if the destination is a network or container mount.

## Design rules for slides

- 16:9, safe margin about 0.5 in (0.4-0.6) on every side; align to a grid; consistent gaps (pick 0.3 or 0.5 in and stick to it).
- Title 32-44 pt, body 16-24 pt, nothing under 12 pt (captions, sources). Size contrast between title and body at least 1.5-2x.
- Two fonts maximum; safe cross-platform choices for editable decks: Arial, Calibri, Georgia, Segoe UI, or the brand font if the user has it installed. Use Microsoft YaHei / PingFang for Chinese.
- One dominant colour, one accent, neutrals. Pick colours from the topic, not default blue. Check text contrast 4.5:1.
- Left-align body text; centre only titles and single statements.
- At most about 6 bullets of one line each; split slides instead of shrinking type.
- Every content slide carries a visual element: chart, image, diagram, icon row, big number, or a shaped layout. Avoid decorative underline bars under titles; they read as template filler.
- Commit to the style on every slide, not only the cover.

## QA loop (required)

1. Extract text: `markitdown output/deck.pptx` and check order, typos, missing content.
2. Placeholder hunt: `markitdown output/deck.pptx | grep -niE "lorem|ipsum|xxxx|placeholder|click to add|\[DATA NEEDED"`.
3. Render and look: `soffice --headless --convert-to pdf --outdir check/ output/deck.pptx && pdftoppm -png -r 60 check/deck.pdf check/slide`. Inspect every image for overflow, overlap, text cut off, low contrast, misaligned edges, empty template boxes.
4. Fix, re-render the changed slides, re-check. Expect issues on the first render; at least one fix-and-verify cycle before delivery.
5. Report what was checked and anything not verifiable (e.g. fonts not installed on this machine render differently).

## officecli quick reference (optional binary)

```bash
officecli create deck.pptx
officecli add deck.pptx / --type slide --prop title="Q4 Report" --prop background=1A1A2E
officecli add deck.pptx '/slide[1]' --type shape --prop text="Revenue grew 25%" --prop x=2cm --prop y=5cm --prop size=24 --prop color=FFFFFF
officecli view deck.pptx outline|issues|screenshot
officecli help pptx shape          # property names before guessing
```

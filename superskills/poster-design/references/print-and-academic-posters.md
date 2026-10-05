# Print production and academic / research posters

> Distilled from: latex-posters (K-Dense-AI/claude-scientific-skills, MIT), banner-design (nextlevelbuilder/ui-ux-pro-max-skill, MIT), higgsfield-brandkit (higgsfield-ai/skills, MIT), visual-design-foundations (wshobson/agents, MIT).

## Part 1: print specs for any poster

| Size | mm | px @300 dpi | Notes |
|---|---|---|---|
| A4 | 210×297 | 2480×3508 | Flyer |
| A3 | 297×420 | 3508×4961 | Small poster |
| A2 | 420×594 | 4961×7016 | Event poster |
| A1 | 594×841 | 7016×9933 | Large poster |
| A0 | 841×1189 | 9933×14043 | Conference poster (150 dpi often enough) |
| US Letter / Tabloid | 8.5×11 in / 11×17 in | 2550×3300 / 3300×5100 | |
| 18×24 in / 24×36 in | | 5400×7200 / 7200×10800 | US poster sizes |
| 36×48 in | | 150 dpi: 5400×7200 | US conference |

Rules:
- **Resolution**: 300 dpi at final size for anything viewed close; 150 dpi for large format viewed from > 1 m. Check raster PPI at the placed size, not the file's metadata. Vector (PDF/SVG) has no PPI limit; prefer it for type, logos and charts.
- **Bleed**: 3 mm (≈ 0.125 in) on every side for anything that runs to the edge; large banners 3–5 mm or the printer's spec. Extend background art into the bleed.
- **Safe margin**: keep text ≥ 5 mm inside the trim on small prints, 2–5 cm on large posters.
- **Colour**: design in RGB if you must, but deliver what the printer asks (usually CMYK PDF, often PDF/X-1a or PDF/X-4). Bright RGB blues/greens/oranges shift in CMYK: proof them. Rich black for large areas (e.g. C60 M40 Y40 K100); 100% K for small text.
- **Fonts**: embed all fonts (or outline them) in the PDF.
- **Proof** at 25% scale (A0 → roughly A4) and read it from 2–3 × the reduced distance; if legible, the full-size poster is.
- Distance rule for large print: about 1 pt of cap height per foot of viewing distance; headlines 70 pt+ for 3–5 m.

Editable print deliverables: PDF (from InDesign/Affinity/Scribus/LaTeX/HTML print), SVG for vector posters, or a one-slide PPTX set to the poster size when the user wants to edit in PowerPoint (note: PPTX references fonts but does not reliably embed them; the recipient needs them installed).

## Part 2: research / conference posters

### Content
- Plan for **3–5 minutes** of reading and three viewing distances: 2–3 m (title + main figure), 1–2 m (section heads, key results), < 1 m (details).
- 1–3 main messages. Tell a story (hook → approach → finding → impact), not a shrunken paper.
- **300–500 words ideal, 800 maximum.** Budget: intro 15%, methods 25%, results 25%, conclusions 25%, refs/acks 10%.
- One-sentence background, a methods diagram, 3–5 key results, 3–4 bullet conclusions, 5–10 references.
- Keep sample sizes, units, effect sizes, uncertainty and limitations. Use real analysis outputs; never let an image model invent charts, microscopy, spectra or results. AI art is acceptable only for conceptual schematics, with labels kept editable.
- Title: ≤ 2 lines, states the finding if possible. Include authors, affiliations, contact, QR code to paper/data (test it).

### Layout
- 2–3 columns for portrait A0; 3–4 for landscape. Reading order top-left → down each column (portrait) or Z across (landscape).
- Margins 3–5 cm; gaps between columns and blocks 1–2 cm; block padding 0.5–1.5 cm.
- Visuals ~40–50% of area. Figures sized to the column (start at ~85% of column width).
- Highlight the main result in its own block or a contrasting band.

### Type sizes at A0
| Level | Size |
|---|---|
| Title | 72–120 pt (85+ recommended) |
| Section headers | 48–72 pt |
| Body | 24–36 pt (30 pt+ recommended) |
| Captions | 18–24 pt |
| References | 16–20 pt |

Sans-serif for distance reading, line spacing ~1.3, no long italics, no decorative fonts.

### LaTeX route
Templates (each compiles with marked placeholder boxes; replace all placeholders, example references, logo boxes and the example QR target):
- `templates/latex-posters/beamerposter_template.tex`: Beamer blocks and institutional themes.
- `templates/latex-posters/tikzposter_template.tex`: TikZ styling, auto-stacked blocks.
- `templates/latex-posters/baposter_template.tex`: relative-positioned boxes; needs a separately obtained `baposter.cls` (not in TeX Live by default).

```bash
pdflatex -interaction=nonstopmode -halt-on-error poster.tex   # run twice
pdfinfo poster.pdf; pdffonts poster.pdf; pdfimages -list poster.pdf
pdftoppm -scale-to 2000 -singlefile -png poster.pdf poster-preview
grep -nE 'Overfull|Underfull|undefined' poster.log
bash scripts/latex-posters/review_poster.sh poster.pdf
```
`review_poster.sh` is read-only (needs Poppler): reports page size (A0/A1/36×48 detection), single page, font embedding, raster PPI. Exit 0 pass, 1 fail, 2 tools missing. It does not check overlap, accessibility or scientific accuracy: open the PNG preview and inspect every edge, column boundary and label. TikZ/baposter overlaps can happen with a clean log.

Use LuaLaTeX/XeLaTeX for OpenType fonts via `fontspec`. Convert SVG figures to PDF before `\includegraphics`. Final quality checklist: `templates/latex-posters/poster_quality_checklist.md`.

### Non-LaTeX routes
- PowerPoint/Keynote: one slide at the exact poster size (e.g. 841×1189 mm), guides for columns and margins, export PDF with fonts embedded.
- HTML/CSS: `@page { size: 841mm 1189mm; margin: 0 }`, print to PDF from Chrome, check fonts embedded with `pdffonts`.
- Canva: start from the exact size, turn on Show print bleed (Canva's default bleed is 0.125 in, 3.175 mm), download as "PDF Print" and tick "Crop marks and bleed" if the printer wants them.
- InDesign, Illustrator, Photoshop, Affinity or Figma: scripts, PDF/X export and Figma's print limits (its export docs list no CMYK or bleed) are in `references/app-built-posters.md`.

### Accessibility
Contrast ≥ 4.5:1; never colour alone (add shape or label); colour-blind-safe palettes (blue/orange rather than red/green); key content between ~1 and 1.5 m height when mounted; provide a digital text summary if accessibility is required (a caption is not PDF tagging).

### Checks
- [ ] Exact venue size and orientation, one page
- [ ] All fonts embedded; rasters ≥ 150–300 PPI at placed size
- [ ] ≤ 800 words; main result visible from 2 m
- [ ] Figures from real data with units and labels
- [ ] Placeholders, example refs and test QR codes removed
- [ ] 25% proof read through

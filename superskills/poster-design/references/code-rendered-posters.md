# Code-rendered posters and art pieces (PNG/PDF without an image model)

> Distilled from: canvas-design (anthropics/skills, Apache-2.0), magazine-poster (nexu-io/open-design, Apache-2.0), qiaomu-mondo-poster-design (joeseesun/qiaomu-mondo-poster-design, MIT), banner-design (nextlevelbuilder/ui-ux-pro-max-skill, MIT).

Use this when the user wants a poster, art print, typographic piece or static design and there is no image model, or when exact type and geometry matter more than photorealism. You draw with code: Python (Pillow, matplotlib, reportlab/cairo), SVG, or HTML/CSS screenshotted to PNG/PDF.

## When code beats an image model

| Code-rendered | Image model |
|---|---|
| Typographic, geometric, Swiss, Bauhaus, data-art, generative patterns | Photoreal scenes, painterly illustration, people, products in context |
| Exact copy, exact brand colours, exact sizes | Mood and texture first, copy added later |
| Needs to be editable (SVG/HTML/PDF) | One-off raster is fine |
| Print at any size (vector) | Will be upscaled |

## Step 1: write a one-page design philosophy first

Before drawing, write a short "movement" for the piece (save as `philosophy.md` next to the output):

1. **Name** it in 1–2 words ("Chromatic Silence", "Concrete Poetry").
2. **4–6 short paragraphs** on how it uses: space and form; colour and material; scale and rhythm; composition and balance; hierarchy.
3. State the text rule: text is sparse, essential, and part of the composition (90% visual, 10% text for art pieces; more for event posters).
4. Keep it generic enough to guide choices, specific enough to forbid wrong ones ("no gradients", "one accent colour only", "everything on a 12-unit grid").

Then find the **subtle reference**: the subject of the request should live inside the piece as a quiet idea (a rhythm, a shape, a colour borrowed from the topic), not as a literal illustration. Someone who knows the topic should feel it; everyone else sees a strong composition.

## Step 2: build the canvas

- Set the exact output size first (see banners/social and print guides). Work in a unit grid: e.g. A-series poster at 2480×3508 px (A4 300 dpi) with a 12×17 grid of 200 px modules and 120 px margins.
- Limit the palette to 2–5 colours with hex values from the philosophy.
- Prefer repetition and systems: rows of marks, dense accumulation, layered patterns, measured line work, index labels, reference markers ("diagram from an imaginary discipline"). Systematic repetition reads as craft; random scatter reads as noise.
- Type: thin and small for art pieces, huge and heavy for gig/protest/announcement posters. Use real font files; list the fonts you used.
- Fonts: use installed or downloadable OFL fonts. canvas-design ships a bundle (names only, not copied here): Big Shoulders, Boldonse, Bricolage Grotesque, Crimson Pro, DM Mono, Erica One, Geist Mono, Gloock, IBM Plex Mono, Instrument Sans, Italiana, JetBrains Mono, Jura, Libre Baskerville, Lora, National Park, Outfit, Pixelify Sans, Poiret One, Red Hat Mono, Silkscreen, Smooch Sans, Tektur, Work Sans, Young Serif, Arsenal SC. All are on Google Fonts.

### Minimal Python skeleton (Pillow)

```python
from PIL import Image, ImageDraw, ImageFont
W, H, M = 2480, 3508, 160            # A4 @300dpi, margin
BG, INK, ACC = "#F2EDE4", "#141413", "#D9572B"
img = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(img)
# grid of repeated marks
step = 120
for y in range(M, H//2, step):
    for x in range(M, W - M, step):
        r = 6 + (x * y) % 40 // 8
        d.ellipse([x - r, y - r, x + r, y + r], fill=INK)
d.rectangle([M, H*0.62, W - M, H*0.62 + 24], fill=ACC)   # accent bar
head = ImageFont.truetype("BigShoulders-Bold.ttf", 360)
d.text((M, H*0.66), "QUIET\nSIGNALS", font=head, fill=INK, spacing=-20)
small = ImageFont.truetype("DMMono-Regular.ttf", 44)
d.text((M, H - M - 44), "FIG. 01 — OBSERVATIONS OF AN UNSEEN FIELD", font=small, fill=INK)
img.save("poster.png", dpi=(300, 300)); img.save("poster.pdf", resolution=300)
```

For vector output write SVG directly or use reportlab/cairo; for complex layout use HTML/CSS and screenshot it (below).

### HTML/CSS route (best for type-heavy posters)

1. One self-contained HTML file, fixed `width`/`height` on the poster element at the exact pixel size, CSS inline, fonts via Google Fonts or local `@font-face`.
2. Wait for fonts (`document.fonts.ready`) before capture.
3. Screenshot the element at device scale factor 2 (headless Chrome, Playwright, Puppeteer, or `scripts/logo-design/scripts/render_png.py page.html -o out.png --width W --height H`).
4. For PDF print, use the browser's print-to-PDF with `@page { size: 420mm 594mm; margin: 0 }`.

Template: `templates/magazine-poster/example.html` — an editorial/newsprint poster (dateline, oversized serif headline with one struck-through word and one italic accent word, 2-column body, six numbered sections with pull-quote callouts, footer band). Use it for "editorial", "manifesto", "newsprint" or long-form posters: swap the copy, keep the hierarchy. Rules from that template: headline owns the page; strikethrough and italic accent appear exactly once each; body reads like real opinion (no lorem ipsum); paper tint `#f3eee2` with subtle dot noise.

## Screen-print / "alternative poster" look in code

Traits to reproduce (describe traits; do not imitate a named living artist):
- 2–5 flat colours, no gradients; slight mis-registration (offset one colour layer 2–6 px).
- Halftone dots for tone (dot grid whose radius follows image brightness).
- Silhouettes and one symbolic object instead of faces or literal scenes.
- Bold condensed or hand-drawn style lettering, Art Deco geometry, generous negative space.
- Paper grain: add 2–4% monochrome noise at the end.

## Step 3: refine, don't add

After the first render, look at it at 100% and at thumbnail size. Then do a second pass that only improves what exists:
- Fix alignment to the grid, equalise spacing, tighten type, remove the weakest element.
- Check nothing overlaps or falls off the canvas unintentionally; every element has breathing room.
- If the instinct is "add another shape", stop and improve an existing one.

## Multi-page sets

Treat page 1 as the opening of a book: later pages keep the philosophy, palette and grid but vary composition, like variations on a theme. Bundle as one PDF or numbered PNGs.

## Deliver

- `poster.png` (and/or `.pdf`, `.svg`, `.html` source) at the exact size.
- `philosophy.md`.
- Fonts used and their source.
- One line on the concept, nothing more.

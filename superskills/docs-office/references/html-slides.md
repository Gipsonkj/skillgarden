> Distilled from: frontend-slides (zarazhangrui/frontend-slides, MIT), slidev (slidevjs/slidev, MIT), html-ppt (lewislulu/html-ppt-skill, MIT), kami (tw93/Kami, MIT), baoyu-slide-deck (jimliu/baoyu-skills, MIT)

# HTML and Markdown slide decks

Browser decks look better than most generated .pptx files, need no Office install, and export to PDF. Choose this when the user wants to present, share a link, or print, and doesn't need to edit in PowerPoint.

## Choose the engine

| Need | Engine |
|---|---|
| Polished one-file deck, no build step, strong visual style | Single HTML file on a fixed 1920x1080 stage (`templates/frontend-slides/`) |
| Developer talk: live code, line highlighting, Mermaid, LaTeX, presenter mode | Slidev (Markdown + Vue) |
| Plain Markdown, minimal styling, quick PDF | Marp (`marp deck.md --pdf`) or pandoc + reveal.js |
| Print-first deck or report-like slides as PDF | HTML + WeasyPrint with `@page { size: 280mm 158mm }` |
| Must also be editable PowerPoint | powerpoint-pptx.md (or Slidev `--format pptx-editable`, which rebuilds simple slides as shapes) |

## Single-file HTML deck

Start from `templates/frontend-slides/html-template.md` (architecture: theme variables, slide markup, a `SlidePresentation` controller with keyboard, wheel and touch navigation, progress bar) and paste the whole of `templates/frontend-slides/viewport-base.css` into every deck.

Fixed-stage rules (these prevent the classic "slides overflow on a laptop" bug):
- Author every slide at 1920x1080 inside `.deck-stage`; JavaScript scales the stage as a whole to fit the window (letterbox, never reflow).
- No responsive breakpoints that rearrange slide content; phones get the same 16:9 slide, scaled.
- Switch slides with the `.active`/`.visible` classes (visibility + opacity + pointer-events). Don't toggle `display`: a later `display:flex` rule can make every slide visible at once.
- Nothing scrolls inside a slide. If content doesn't fit, split the slide.
- Support `prefers-reduced-motion`. Write `calc(-1 * clamp(...))`, never `-clamp(...)` (silently ignored).
- Keep images inside the slide bounds; use relative paths (`img/shot.png`), never absolute filesystem paths.
- Inline CSS and JS; load fonts from Google Fonts or Fontshare. No build tools, no framework.

Navigation to provide: arrow keys, space, PageUp/PageDown, Home/End, click or swipe, `#N` deep links, a slide counter or progress bar, `F` for fullscreen. Speaker notes in a hidden `<div class="notes">` or HTML comments, never as visible text.

### Style discovery

Show, don't ask. Build three single-slide previews (the real title slide with the user's content) in clearly different directions, for example one restrained, one bold, one tailored to the subject, and let the user pick or mix. Preview slides must not show internal labels ("Option A", "preset", template names, file paths, notes about the audience).

Design defaults:
- A committed palette as CSS variables: one dominant colour, one sharp accent, neutrals. Vary light and dark themes across projects.
- Distinctive type: a characterful display face plus a readable text face. Don't default to Inter, Roboto, Arial or system fonts, and don't reach for the same "safe" display font every time.
- Atmosphere from the subject: textures, gradients, geometric patterns, photography. Avoid purple-gradient-on-white and generic card grids.
- Motion: one orchestrated entrance per slide (staggered `animation-delay`) beats many small effects. CSS only.

### Density modes

Ask whether the deck will be presented live or read on its own.

| Mode | Per slide | Use for |
|---|---|---|
| Speaker-led (low density) | one idea, 1-3 short bullets or one big statement, large type | talks, keynotes, pitches presented live |
| Reading deck (high density) | self-contained: grid, comparison table, annotated diagram, 4-8 bullets or 4-6 cards | async review, handouts, internal reports |

Either way: no overflow, no overlapping panels, no text below comfortable reading size (about 24 px on the 1920 stage for body copy). Split before shrinking.

### Converting an existing .pptx

1. `python scripts/frontend-slides/extract-pptx.py deck.pptx extracted/` (needs `pip install python-pptx`): titles, text, images, notes per slide.
2. Confirm the extracted outline with the user (titles, image counts).
3. Pick a style, rebuild in HTML preserving all text, image order and notes.

### Export to PDF

`bash scripts/frontend-slides/export-pdf.sh deck.html [deck.pdf]` serves the folder over local HTTP, screenshots each `.slide` at 1920x1080 with Playwright, and stitches a PDF. Add `--compact` for 1280x720 when the file exceeds about 10 MB. First run installs Playwright and Chromium into a temp folder (about 150 MB): tell the user, and ask first if installs aren't clearly allowed. Slides must use `class="slide"`; animations are not preserved.

Sharing as a link: any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages). Deploy the folder, not just the HTML, when it references local images. Publishing is a public action: confirm with the user first.

## Slidev

```bash
pnpm create slidev                 # new project
pnpm run dev                       # http://localhost:3030 (presenter view at /presenter)
pnpm run build                     # static SPA in dist/
pnpm add -D playwright-chromium    # once, for export
slidev export --output deck.pdf
slidev export --format pptx-editable   # or pptx (images), png, md
```

Syntax:
- `---` separates slides; the first frontmatter block configures the deck (`theme`, `title`, `canvasWidth`, `aspectRatio`, `fonts`), later blocks configure one slide (`layout: two-cols`, `class`, `background`, `transition`).
- HTML comments at the end of a slide are presenter notes.
- Layout slots: `::right::`, `::default::`. Built-in layouts include `cover`, `center`, `two-cols`, `image-right`, `quote`, `section`, `fact`, `end`.
- Click reveals: `<v-click>`, `<v-clicks>` for lists; code steps with ```` ```ts {1|2-3|all} ````; animated code morphs with `magic-move`; `{monaco}` for live editors, `{monaco-run}` to execute.
- Diagrams and math: ```` ```mermaid ````, `$inline$`, `$$block$$`.
- Icons: `<mdi-account />` style components from Iconify.
- Import slides from other files with `src: ./part2.md`.

Check after `pnpm run dev` that the slides load, and after export that the file exists and pages render (open the PDF or rasterise with `pdftoppm`).

## Marp and print-first decks

- Marp: Markdown with `marp: true` frontmatter, `---` slide breaks, `<!-- _class: lead -->` directives, theme CSS. Export with the Marp CLI (`npx @marp-team/marp-cli deck.md --pdf --allow-local-files`).
- WeasyPrint deck: one `<section>` per page, `@page { size: 280mm 158mm; margin: 0 }` (or 297x167 / 338x190 mm for denser slides), `page-break-after: always`. Great for report-style decks with real typography and vector charts. Render with `weasyprint deck.html deck.pdf`, then rasterise to check.

## Image-generated slides

Some workflows render each slide as an AI image (style prompt + content). Results look striking but text is not editable or searchable and small text is often wrong. Use only when the user asks for it; keep every number and name in a separate text outline, check each image for spelling, and attach the source text as notes.

## QA for any HTML deck

1. Open in a browser at 1280x720 and at a phone width; the stage must stay 16:9 with nothing clipped.
2. Step through every slide with the keyboard; check counter, notes overlay and deep links.
3. Grep the HTML for leftover placeholders and internal labels.
4. Export the PDF and look at every page.

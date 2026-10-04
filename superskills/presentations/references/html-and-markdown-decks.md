> Distilled from: html-slides guide of the docs-office craft (from frontend-slides (zarazhangrui/frontend-slides, MIT), slidev (slidevjs/slidev, MIT), html-ppt (lewislulu/html-ppt-skill, MIT), kami (tw93/Kami, MIT), baoyu-slide-deck (jimliu/baoyu-skills, MIT)); slidev references (slidevjs/slidev, MIT); marp-slide (softaworks/agent-toolkit, MIT); revealjs (ryanbbrown/revealjs-skill, MIT); presentation-creator output-formats and web-deck (mblode/agent-skills, MIT); slideshow (heygen-com/hyperframes, Apache-2.0); presenting-conference-talks (Orchestra-Research/AI-Research-SKILLs, MIT); scientific-slides Beamer guide (K-Dense-AI/scientific-agent-skills, MIT); consulting-pptx-skill (carnot-tech/consulting-pptx-skill, MIT)

# HTML, Markdown and code-first decks

Browser decks look better than most generated .pptx files, need no Office install, can run live demos and export to PDF. Choose this when the user wants to present, share a link, or print, and doesn't need to edit in PowerPoint.

## 1. Choose the engine

| Need | Engine |
|---|---|
| Polished one-file deck, no build step, strong visual style | Single HTML file on a fixed 1920x1080 stage (`templates/frontend-slides/`) |
| Developer talk: live code, line highlighting, Mermaid, LaTeX, presenter mode | Slidev (Markdown + Vue) |
| Plain Markdown, quick PDF, previews in VS Code | Marp |
| HTML with fragments, vertical stacks, speaker view, no build | reveal.js from a CDN |
| Maths-heavy academic talk, version-controlled | LaTeX Beamer (`templates/scientific-slides/beamer_template_conference.tex`) |
| Print-first deck or report-like slides as PDF | HTML + WeasyPrint or Chrome print, `@page` sized to the slide |
| Deck that runs a live demo or lives at a permanent URL | Web app deck (section 8) |
| Motion-designed deck with branching and presenter mode inside HyperFrames | HyperFrames slideshow (section 9) |
| Must also be editable PowerPoint | powerpoint-pptx.md |

## 2. Single-file HTML deck

Start from `templates/frontend-slides/html-template.md` (theme variables, slide markup, a `SlidePresentation` controller with keyboard, wheel and touch navigation, progress bar) and paste the whole of `templates/frontend-slides/viewport-base.css` into every deck.

Fixed-stage rules (these prevent the classic "slides overflow on a laptop" bug):
- Author every slide at 1920x1080 inside `.deck-stage`; JavaScript scales the stage as a whole to fit the window (letterbox, never reflow).
- No responsive breakpoints that rearrange slide content; phones get the same 16:9 slide, scaled.
- Switch slides with the `.active`/`.visible` classes (visibility + opacity + pointer-events). Don't toggle `display`: a later `display:flex` rule can make every slide visible at once.
- Nothing scrolls inside a slide. If content doesn't fit, split the slide.
- Support `prefers-reduced-motion`. Write `calc(-1 * clamp(...))`, never `-clamp(...)` (silently ignored).
- Keep images inside the slide bounds; use relative paths (`img/shot.png`), never absolute filesystem paths.
- Inline CSS and JS; load fonts from Google Fonts or Fontshare. No build tools, no framework.
- Use theme tokens (`var(--accent)`, `var(--text-1)`), not literal colours, so one change restyles the deck; text on an accent fill needs its own ink token.

Navigation to provide: arrow keys, space, PageUp/PageDown, Home/End, click or swipe, `#N` deep links, a slide counter or progress bar, `F` for fullscreen. Speaker notes in a hidden `<div class="notes">` or HTML comments, never as visible text. A presenter window (current, next, notes, timer) is a nice extra; html-ppt's runtime is a reference implementation.

### Style discovery

Show, don't ask. Build three single-slide previews (the real title slide with the user's content) in clearly different directions, for example one restrained, one bold, one tailored to the subject, save them as `style-a.html` ... `style-c.html`, open them, and let the user pick or mix. Preview slides never show internal labels ("Option A", "preset", template names, file paths, notes about the audience). After the pick, expand that preview's fonts, palette, spacing and devices across the deck; don't switch systems mid-way.

Design defaults:
- A committed palette as CSS variables: one dominant colour, one sharp accent, neutrals. Vary light and dark themes across projects.
- Distinctive type: a characterful display face plus a readable text face. Don't default to Inter, Roboto, Arial or system fonts.
- Atmosphere from the subject: textures, gradients, geometric patterns, photography. Avoid purple-gradient-on-white and generic card grids.
- Motion: one orchestrated entrance per slide (staggered `animation-delay`) beats many small effects. CSS only.

### Density

Ask whether the deck is presented live or read on its own (slide-design.md, section 5). Body copy at least about 24-28 px on the 1920 stage. Split before shrinking. When editing an existing deck: count what's on a slide before adding; adding an image to a full slide means a new slide.

### Converting an existing .pptx

1. `python scripts/frontend-slides/extract-pptx.py deck.pptx extracted/` (needs `pip install python-pptx`): titles, text, images, notes per slide as JSON plus an `assets/` folder.
2. Confirm the extracted outline with the user (titles, image counts).
3. Pick a style, rebuild in HTML preserving all text, image order and notes.

### Export to PDF

`bash scripts/frontend-slides/export-pdf.sh deck.html [deck.pdf]` serves the folder over local HTTP, screenshots each `.slide` at 1920x1080 with Playwright, and stitches a PDF. Add `--compact` for 1280x720 when the file exceeds about 10 MB. First run installs Playwright and Chromium into a temp folder (about 150 MB): tell the user, and ask first if installs aren't clearly allowed. Slides must use `class="slide"`; animations are not preserved (final state only); the script opens the PDF when done.

## 3. Slidev

```bash
pnpm create slidev                 # new project
pnpm run dev                       # http://localhost:3030 (presenter view at /presenter)
pnpm run build                     # static SPA in dist/
pnpm add -D playwright-chromium    # once, for export
slidev export --output deck.pdf    # add --with-clicks to export each build step, --range 1,4-7
slidev export --format pptx-editable   # or pptx (images), png, md
```

Syntax:
- `---` separates slides; the first frontmatter block configures the deck (`theme`, `title`, `canvasWidth`, `aspectRatio`, `fonts`, `duration: 30min`, `timer: countdown`), later blocks configure one slide (`layout: two-cols`, `class`, `background`, `transition`).
- HTML comments at the end of a slide are presenter notes; `[click]` markers in notes highlight as you advance.
- Layout slots: `::right::`, `::default::`. Built-in layouts include `cover`, `center`, `two-cols`, `two-cols-header`, `image-right`, `quote`, `section`, `fact`, `statement`, `end`.
- Click reveals: `<v-click>`, `<v-clicks>` for lists; code steps with ```` ```ts {1|2-3|all} ````; animated code morphs with `magic-move`; `{monaco}` for live editors, `{monaco-run}` to execute.
- Diagrams and math: ```` ```mermaid ````, `$inline$`, `$$block$$`.
- Icons: `<mdi-account />` style components from Iconify.
- Import slides from other files with `src: ./part2.md`.
- A running dev server exposes an MCP endpoint at `http://localhost:<port>/__mcp` with tools to read, insert, move and edit slides; prefer it to raw text edits when available.

Interactive components don't survive export; a deck built around them is hosted, not exported. Check after `pnpm run dev` that the slides load, and after export that the file exists and pages render.

## 4. Marp

```markdown
---
marp: true
theme: default
size: 16:9
paginate: true
style: |
  section { background: #f6ebd9; color: #211f1e; font-family: "Source Sans 3", sans-serif; }
  section a, section code { color: #9a3412; }
---

<!-- _class: lead -->
# <!-- fit --> Churn fell 30% after the price change

<!-- Open with the March cohort. Pause after the headline. -->
```

- `marp: true` is required for VS Code preview; without it `---` renders as rules.
- Global directives (`theme`, `size`, `style`, `math`) in the frontmatter; `<!-- paginate: true -->` applies from that slide on; an underscore makes it this slide only (`<!-- _class: lead -->`, `<!-- _backgroundColor: #111 -->`).
- A comment whose body parses as `key: value` is a directive, otherwise a presenter note. Start notes with a sentence ("The key point is speed."), never "Key point: speed".
- A `style` block that sets `section` colours must also set `h1`, `h2`, `a` and `code` colours; theme defaults assume a light background.
- Images: `![w:600px](img.png)`; backgrounds `![bg](img.png)`, `![bg cover]`, `![bg contain]`; split layouts `![bg right:40%](img.png)`; several `![bg]` lines tile side by side.
- Export: `npx @marp-team/marp-cli deck.md -o deck.html`; `--pdf --pdf-notes --allow-local-files -o deck.pdf`; `--notes -o notes.txt`. PDF and images need Chrome, Edge or Firefox installed.

## 5. reveal.js

One HTML file plus a CSS file, reveal.js loaded from a CDN (`cdn.jsdelivr.net/npm/reveal.js@5/...`); open in a browser, `S` opens the speaker view.

- `<section>` per slide, each with a unique `id`; nested `<section>`s make a vertical stack for drill-down detail.
- Notes: `<aside class="notes">...</aside>` (or a `Note:` line in Markdown slides).
- Fragments: `class="fragment"` (`fade-up`, `highlight-red`, ...). `data-background-color`, `data-background-image`, `data-auto-animate`.
- Font sizes in pt (fixed canvas); give a slide with little content bigger text rather than empty space. All visible text inside `p`, `li` or headings so it inherits base styles.
- Multi-column layouts with inline CSS grid; a pattern repeated on 3+ slides becomes a class.
- Charts need a flex container with a fixed height and `maintainAspectRatio: false`.
- Markdown separators (`---`) need blank lines on both sides or the file renders as one slide.
- Screenshots and PDF: `npx decktape reveal "deck.html?export" deck.pdf --screenshots --screenshots-directory shots/` (decktape is a separate npm tool; ask before fetching it).

## 6. LaTeX Beamer

`\documentclass[aspectratio=169]{beamer}`; one `\begin{frame}{Assertion title}` per slide; `\note{...}` for presenter notes; `\pause`, `\only<2>`, `\onslide<2->` for builds (architecture walk-throughs); `\graphicspath{{figures/}}`; biblatex with small author-year citations. Start from `templates/scientific-slides/beamer_template_conference.tex` (15-minute conference structure; replace every placeholder statistic, name and citation) and modernise its theme colours to the talk. Build with `latexmk -pdf slides.tex` (or pdflatex, biber, pdflatex twice). Beamer and an editable python-pptx version are often both wanted for research talks; build the pptx from the same outline (powerpoint-pptx.md).

## 7. Print-first HTML decks

One `<section class="slide">` per page; `@page { size: 338.67mm 190.5mm; margin: 0 }` (16:9; 280 x 158 mm also works) with `page-break-after: always`. Good for report-style decks with real typography and vector charts. Render with `weasyprint deck.html deck.pdf`, or Chrome: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --no-pdf-header-footer --print-to-pdf=deck.pdf deck.html`. The PDF page count must equal the slide count.

## 8. Web app deck (Next.js or similar)

Worth it only when the deck should run the thing it is about (a working demo, a playground) or live permanently at a URL. Not for an internal update, a deck someone else must edit, or anything due tomorrow.

- One `SLIDES` array is the source of truth for order, titles and palettes; a route per slide (`/7`) so you can link one slide and restart mid-talk; statically generate every route.
- Arrow keys plus visible controls; an `aria-live` counter; disable prev/next at the ends instead of wrapping.
- A few layout primitives with enum props (`ratio="60/40"`) instead of bespoke markup per slide; `min-h-dvh`, not `h-screen`.
- Demos run offline with seeded data, reset on mount, survive being poked, and need one interaction. If any fails, put a recording on the slide.
- Canonical every slide route to the deck root and `noindex` the slide routes; keep a Marp/PDF version for sending.

## 9. HyperFrames slideshow

A HyperFrames composition plus a JSON island (`<script type="application/hyperframes-slideshow+json">`) listing slides, notes, fragment times, hotspots and branch sequences; served with `hyperframes present <project-dir>`. Confirm the user wants a HyperFrames deck before authoring. Do not `hyperframes render` a slideshow to MP4: it renders only the first composition and silently truncates. For HyperFrames itself and any deck-to-video job, hand off to `ai-video`.

## 10. Sharing

Any static host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages). Deploy the folder, not just the HTML, when it references local images; check every image loads on the live URL. Publishing is a public action: confirm with the user first. Deploy mechanics: website-building's deploy guides.

## QA for any HTML or Markdown deck

1. Open at 1280x720 and at a phone width; the stage stays 16:9 with nothing clipped.
2. Step through every slide with the keyboard; check counter, notes, deep links and builds.
3. Grep the source for leftover placeholders and internal labels (`grep -niE "lorem|placeholder|todo|option [abc]|preset"`).
4. Export the PDF and look at every page (deck-qa.md).

## Checklist

- [ ] Engine matches the need (edit in PowerPoint → not this guide)
- [ ] Fixed 16:9 stage; nothing scrolls; relative asset paths
- [ ] Notes in the engine's notes slot (HTML comment, `aside.notes`, `\note`, notes div)
- [ ] Marp notes don't parse as directives; dark themes set link and code colours
- [ ] PDF exported and inspected; installs and publishing confirmed with the user

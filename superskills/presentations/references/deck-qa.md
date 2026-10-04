> Distilled from: powerpoint-pptx and html-slides guides of the docs-office craft (pptx-generator (MiniMax-AI/skills, MIT), frontend-slides (zarazhangrui/frontend-slides, MIT), kami (tw93/Kami, MIT)); presentation-creator QA pass (mblode/agent-skills, MIT); pitch-deck validation loop (anthropics/financial-services, Apache-2.0); scientific-slides visual review workflow and validator (K-Dense-AI/scientific-agent-skills, MIT); revealjs (ryanbbrown/revealjs-skill, MIT); consulting-pptx-skill checks and fresh-eye review (carnot-tech/consulting-pptx-skill, MIT); tech-talk-outline (samber/developer-relations-skills, MIT)

# Deck QA: render it and look at every slide

A deck you haven't rendered isn't done. Generated decks fail visually (overflow, overlap, a template box left empty) in ways no text check catches, and they fail on the first render more often than not. Plan at least one fix-and-verify cycle.

## 1. Render every slide to images

| Source | Render |
|---|---|
| .pptx | `soffice --headless --convert-to pdf --outdir check/ deck.pptx && pdftoppm -png -r 60 check/deck.pdf check/slide` |
| Single-file HTML | `bash scripts/frontend-slides/export-pdf.sh deck.html check/deck.pdf` then `pdftoppm` (installs Playwright on first run: ask first) |
| Slidev | `slidev export --output check/deck.pdf` (add `--with-clicks` to see each build) |
| Marp | `npx @marp-team/marp-cli deck.md --pdf --allow-local-files -o check/deck.pdf` |
| reveal.js | `npx decktape reveal "deck.html?export" check/deck.pdf --screenshots --screenshots-directory check/shots` |
| Beamer | `latexmk -pdf slides.tex` |
| Google Slides | Drive export to PDF, or `pages.getThumbnail` per slide |
| Keynote | `doc.export({ to: Path(...), as: "PDF", allStages: true })` |

No Poppler? `python scripts/scientific-slides/pdf_to_images.py check/deck.pdf check/slide --dpi 100 --format png` (needs PyMuPDF). Then open each image and look; 60-100 dpi is enough to judge layout, 150 to read small text.

LibreOffice is not PowerPoint: it can substitute fonts and shift wrapping and gradients. When it was the renderer, say so on delivery and ask for a check in PowerPoint before distribution.

## 2. Look for, on every slide

- Text overflowing its box or the slide; text cut off; unexpected wrap that makes one column header two lines.
- Overlapping panels or elements; images stretched or cropped wrongly; images outside the margins.
- Empty template boxes, "Click to add text", leftover placeholders, instruction boxes kept with their bright fill.
- Contrast: the smallest text against its actual background (4.5:1 body, 3:1 large; 7:1 preferred when projected). Text inside a light card on a dark slide inheriting light colour is the classic miss.
- Type under the floor (12 pt pptx, 24 px on a 1920 stage).
- Misaligned edges: left edges of stacked boxes, tops of adjacent boxes, bottoms of two columns.
- Fonts substituted, icons missing (empty squares), broken image links.
- A run of three or more identical layouts without a reason.
- Colour used as the only signal; colour codes without a legend.

## 3. Text and content checks

```bash
markitdown deck.pptx > check/deck.md          # or the Markdown/HTML source
grep -niE "lorem|ipsum|xxxx|placeholder|click to add|insert |\[DATA NEEDED|TBD|TODO|option [abc]|preset" check/deck.md
```

- **Ghost deck:** read the titles only, in order. They tell the argument; none is a bare label; no "Label:" prefixes; varied sentence shapes.
- Numbers identical wherever they repeat; every data slide has source and date; arithmetic re-checked (data-slides.md).
- Numbers in titles match the slide ("3 phases" shows 3).
- Spelling of names, products and customers; nothing invented (logos, quotes, metrics).
- Notes present on every content slide of a speaking deck, in the notes slot, none visible on slides.
- Internal labels never visible ("style A", file names, audience notes, prompt text).
- Slide count vs time: `python scripts/scientific-slides/validate_presentation.py deck.pptx --duration 20` (also flags text under 18 pt and more than 6 bullets; captions under 18 pt warn by design, judge them).

## 4. HTML deck extras

- Open at 1280x720 and a phone width: the stage stays 16:9, nothing scrolls inside a slide.
- Step through with the keyboard: counter, deep links (`#7`), builds, notes view, fullscreen.
- After any edit, re-check the slide's height in a screenshot; `scrollHeight` checks miss panels that visually cover each other.
- Every asset path relative; images load when served over HTTP and on the deployed URL.

## 5. Review table (keep with the deck)

| # | Slide | 3-sec test | One message | Spine beat | Layout | Colour | Smallest-text contrast | Issues |
|---|---|---|---|---|---|---|---|---|
| 1 | Title | pass | pass | once upon a time | statement | paper | 13.9:1 | none |
| 7 | Retries tripled load | pass | pass | because of that | chart + so-what | red section | 7.2:1 | legend overlaps line, fixed |

3-sec test: parseable at arm's length in three seconds (for a sent deck: makes sense forwarded with no context). One message: exactly one idea. Spine beat: which beat it serves; a slide serving none gets cut. Record measured ratios, not "ok".

Deck-level, below the table: every spine beat has a slide and the ending matches the one written first; one colour system throughout; recap has one line per section; pitch decks have an explicit ask with amount, use and milestone.

## 6. Fresh-eyes review

When stakes are high, give the rendered PDF to a reviewer who hasn't seen how it was made (a colleague, or a separate assistant session with no context) and ask: what is the main point, where did you get lost, which claim would you challenge, what looks broken? Turn the answers into an accept / reject / defer table with reasons, fix the accepted ones, re-render.

## 7. Accessibility

- Real title placeholders on every slide (screen readers and the outline view use them); unique titles.
- Alt text on meaningful images and charts; decorative images marked decorative.
- Reading order checked (PowerPoint's Selection Pane / Accessibility Checker; Keynote and Slides have equivalents).
- Image-only decks (image-generated-slides.md) ship with a text outline.
- Captions or a transcript for embedded video.

## 8. Fix cycle

1. Fix everything found; re-render only the changed slides and re-check them, plus neighbours if layout moved.
2. Second cycle for what remains.
3. After three cycles, stop: list each unresolved issue by slide with what was tried, and deliver with that list rather than looping.

## 9. Deliver

- The file path or link, the format(s) delivered (editable source plus PDF is a good default), and what was checked.
- What wasn't verifiable here: fonts not installed, PowerPoint vs LibreOffice rendering, projector colour, animations in exported PDFs.
- The gaps table (`[DATA NEEDED]` items) and assumptions.
- Nothing published, shared or uploaded without the user's go-ahead.

## Checklist

- [ ] Every slide rendered to an image and looked at
- [ ] No overflow, overlap, clipping, empty boxes, placeholders or substituted fonts
- [ ] Contrast measured on the smallest text; type floors respected
- [ ] Ghost deck passes; numbers consistent; sources on data slides
- [ ] Notes in place; nothing presenter-only on slides
- [ ] At least one fix-and-verify cycle; unresolved issues listed after three
- [ ] Delivery states what was and wasn't verified

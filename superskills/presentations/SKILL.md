---
name: presentations
description: Make and give presentations in any format. Covers deck story and structure (pitch deck, investor and sales decks, board and status updates, decision decks, conference and tech talks, lectures, research talks, defenses), slide design and layout (grid, type, colour, density, one idea per slide), data slides, PowerPoint/.pptx with PptxGenJS or python-pptx, filling or editing a template deck, HTML and Markdown decks (single-file, Slidev, Marp, reveal.js, Beamer), Google Slides and Keynote, image-generated slides, PDF export, speaker notes, rehearsal, timing, delivery and Q&A, and render-and-look deck QA. Triggers: "make a deck on this", "pitch deck for our seed round", "turn this doc into slides", "fill our PowerPoint template", "build a Slidev talk", "write my speaker notes", "my talk runs over time", "help me rehearse my presentation", "export the slides to PDF". Word, PDF and Excel files: docs-office.
---

# Presentations

Covers making and giving a presentation, whatever the format: the argument and structure of the deck, the slide design system, data slides, building it as PowerPoint, HTML, Markdown, Beamer, Google Slides or Keynote, speaker notes, rehearsal and delivery, and checking every rendered slide. The work fails in three places: the **story** (no single point, label titles, too many ideas per slide), the **file** (overflow, picture-only pptx, empty template boxes) and the **room** (over time, read aloud, unreadable from the back). Get the story right first, build with the lightest tool that fits who edits next, and never deliver a deck you haven't rendered and looked at.

## Core principles

1. **Story before slides.** Write the one sentence the deck must prove, the spine and the ending before any slide exists; choose the format last.
2. **Titles are assertions.** "Churn fell 30% after the price change", not "Churn". Titles alone, read in order, tell the whole argument (ghost-deck test).
3. **One idea and one evidence shape per slide.** Split before shrinking; nothing scrolls, nothing overflows.
4. **Decide sent or presented first.** A deck read without you needs self-contained slides; a deck you present needs few words and full notes. Their density rules contradict.
5. **Slot length is an input.** Write to the time, keep 10-15% buffer, cut a whole section rather than thinning all of them.
6. **Never invent facts.** No made-up numbers, logos, quotes or customers; gaps become `[DATA NEEDED: what]`; every data slide carries source and date; a number is identical everywhere it appears.
7. **Editable where someone edits next.** Native .pptx for PowerPoint users (Marp and Slidev pptx exports are pictures of slides); HTML or Markdown decks for presenting and sharing; template decks filled on a copy, with instruction boxes deleted.
8. **One design system, chosen for the venue.** Two typefaces, one colour system, light for bright rooms; contrast measured on the smallest text (4.5:1 minimum, 7:1 preferred when projected); body ≥ 18 pt, nothing under 12 pt.
9. **Charts prove a stated finding.** Highlight one series, label directly, keep units and uncertainty; real chart and table objects, never data redrawn by an image model.
10. **Audience text on slides, presenter text in notes.** Notes are cue-grain; only transitions, numbers with caveats, the open and the close are verbatim.
11. **Rehearse out loud against a clock** before polishing; the first timed run decides how much deck you need.
12. **Render and look at every slide.** Expect problems on the first render, do at least one fix-and-verify cycle, and after three cycles report what's left instead of looping.
13. **Ask before side effects.** Installs (Playwright, LibreOffice), OAuth, sharing or publishing a deck, paid image generation.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Seed pitch from a memo: `references/deck-story.md` → `references/deck-types.md` → `references/slide-design.md` → `references/powerpoint-pptx.md` → `references/deck-qa.md`; runway and unit economics from `trading-finance` → `references/startup-corporate-finance.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:garden`, or `get_super_skill` with craft `garden` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Intake, the one sentence, story spine, arcs, assertion titles, ghost-deck test, outline, slide content rules | [references/deck-story.md](references/deck-story.md) |
| Skeleton for a pitch/investor, sales, board/update, decision deck, tech talk, lecture, research talk or defense; sent vs presented; slide counts and time budgets | [references/deck-types.md](references/deck-types.md) |
| Slide design system: canvas, grid, type scale, colour systems, contrast, layouts, density modes, motion, avoiding the generated-deck look, style previews | [references/slide-design.md](references/slide-design.md) |
| Charts, KPI tiles and tables on slides; simplifying paper figures; rounding and number consistency | [references/data-slides.md](references/data-slides.md) |
| PowerPoint .pptx: PptxGenJS, python-pptx, template decks (XML route), filling a template from data, pptx QA loop, officecli | [references/powerpoint-pptx.md](references/powerpoint-pptx.md) + `scripts/frontend-slides/extract-pptx.py` |
| HTML deck (single file, fixed stage), Slidev, Marp, reveal.js, Beamer, print-first PDF, web app deck, HyperFrames slideshow, pptx to HTML, export to PDF, sharing | [references/html-and-markdown-decks.md](references/html-and-markdown-decks.md) + `templates/frontend-slides/`, `scripts/frontend-slides/`, `templates/scientific-slides/` |
| Google Slides (API, template copy and replace, upload pptx, export, notes) and Keynote (open pptx, JXA, export, presenter notes) | [references/google-slides-keynote.md](references/google-slides-keynote.md) |
| Slides rendered as AI images: modes, style lock, prompt files, fixing text, accessibility | [references/image-generated-slides.md](references/image-generated-slides.md) |
| Speaker notes: cue grain, verbatim set, timing marks, Q&A crib, narration scripts, where notes live per format | [references/speaker-notes.md](references/speaker-notes.md) |
| Rehearsal (accordion, practice schedule), delivery, nerves, demos on stage, Q&A, after the talk | [references/rehearsal-and-delivery.md](references/rehearsal-and-delivery.md) |
| Render every slide and check it: per-format render commands, visual and text checks, review table, accessibility, fix cycles | [references/deck-qa.md](references/deck-qa.md) + `scripts/scientific-slides/` |

To use one capability directly, name the task, or say "use presentations: <capability>" (for example "use presentations: speaker notes for this deck").

## Scripts and templates

| File | When to run or use |
|---|---|
| `templates/frontend-slides/html-template.md`, `viewport-base.css` | Every single-file HTML deck: architecture and controller from the template, the whole CSS pasted in |
| `scripts/frontend-slides/export-pdf.sh deck.html [out.pdf] [--compact]` | HTML deck to PDF; installs Playwright and Chromium (~150 MB) into a temp folder on first run: ask first |
| `scripts/frontend-slides/extract-pptx.py deck.pptx outdir/` | Pull titles, text, images and notes out of a .pptx (to read, convert to HTML, or rebuild). Needs python-pptx |
| `scripts/scientific-slides/validate_presentation.py deck --duration N` | Slide count vs talk length, text under 18 pt, more than 6 bullets, aspect ratio (pptx, pdf, Beamer .tex) |
| `scripts/scientific-slides/pdf_to_images.py deck.pdf prefix` | PDF to slide images for inspection when Poppler isn't installed. Needs PyMuPDF |
| `templates/scientific-slides/beamer_template_conference.tex` | Starting point for a 15-minute Beamer conference talk; replace every placeholder |

## Other crafts

| When the request also needs | Use |
|---|---|
| The analysis behind the numbers: queries, statistics, choosing an honest chart | `data-analysis` → `references/analysis-workflow.md`, `references/visualization.md` |
| A startup model, runway, unit economics or valuation behind a pitch deck | `trading-finance` → `references/startup-corporate-finance.md`, `references/dcf-valuation.md` |
| What a board, exec or stakeholder update should say; the meeting around the deck | `product-management` → `references/stakeholder-comms.md`, `references/meetings.md` |
| A brand theme, logo or infographic for the deck | `poster-design` → `references/brand-kits.md`, `references/logos.md`, `references/infographics.md` |
| Photos or illustrations for slides from an image model, or text inside generated images | `image-creation` → `references/prompting-fundamentals.md`, `references/text-in-images.md`, `references/marketing-brand-images.md` |
| Persuasive headlines and copy, an edit pass, or AI tells stripped from slide text | `content-creation` → `references/conversion-copy.md`, `references/copy-editing.md`, `references/humanize-ai-writing.md` |
| The deck turned into a narrated video, explainer or HyperFrames composition | `ai-video` → `references/plan-and-route.md`, `references/hyperframes-workflows.md`, `references/explainers-and-promos.md` |
| A research talk's citations verified, or the paper the talk comes from | `research-science` → `references/citations.md`, `references/paper-sections.md` |
| A handout or report as PDF, Google Drive auth and sharing, or source files converted to Markdown | `docs-office` → `references/pdf.md`, `references/google-workspace.md`, `references/convert-extract.md` |
| Lecture or workshop slides that teach: objectives, checks for understanding | `course-design` → `references/objectives-and-backward-design.md`, `references/checks-for-understanding.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| A full designed-PPTX pipeline: brand and layout workspaces, native template filling, beautifying a finished deck, narrated video | [ppt-master](https://github.com/hugohe3/ppt-master/tree/main/skills/ppt-master) (MIT; very large; configure only official image-provider endpoints) |
| Slidev's full reference: every layout, component, code feature, presenter and hosting option | [slidev](https://github.com/slidevjs/slidev/tree/main/skills/slidev) (MIT) |
| Twelve style presets, the bold template pack, animation patterns and a Vercel deploy script for HTML decks | [frontend-slides](https://github.com/zarazhangrui/frontend-slides) (MIT; only the template, CSS and two scripts were copied) |
| Beamer templates for seminars and defenses, and long design, timing and talk-type guides for research talks | [scientific-slides](https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/scientific-slides) (MIT; its optional slide-image scripts call OpenRouter) |
| Banker pitchbook population: OOXML patterns for tables and arrows, calculation standards | [pitch-deck](https://github.com/anthropics/financial-services/tree/main/plugins/vertical-plugins/investment-banking/skills/pitch-deck) (Apache-2.0) |
| Keynote automation in depth: PyXA API reference, charts, Magic Move, Markdown to Keynote | [automating-keynote](https://github.com/SpillwaveSolutions/automating-mac-apps-plugin/tree/main/plugins/automating-mac-apps-plugin/skills/automating-keynote) (MIT; macOS only) |
| An ~80-rule consulting slide canon, a 62-layout HTML parts catalogue and a mechanical deck checker | [consulting-pptx-skill](https://github.com/carnot-tech/consulting-pptx-skill) (MIT; rules in Japanese; its back-cover template carries an attribution line) |
| A talk-outline interview, a worked outline example and sources for every timing default | [tech-talk-outline](https://github.com/samber/developer-relations-skills/tree/main/skills/tech-talk-outline) (MIT) |

## Default workflow

1. **Intake.** Audience, setting (live, recorded, sent), venue, length, goal, sources, constraints, output format. Infer; ask once at most; state the plan in one line.
2. **Story.** Arrow, position, stakes, ending; spine and 2-3 pillars with evidence; pick the deck-type skeleton.
3. **Outline and titles.** Slide-by-slide assertion titles; ghost-deck test; gaps marked `[DATA NEEDED]`.
4. **Design system.** Canvas, type scale, colour system for the venue, layouts, density mode; style previews if the user has no style.
5. **Build** with the tool from the table: native pptx, HTML/Markdown, Google Slides or Keynote; templates on a copy; charts as real objects.
6. **Notes.** Cue-grain notes, verbatim set, timing marks, Q&A crib, in the format's notes slot.
7. **QA.** Render every slide, inspect, fix, re-render; review table; text and number checks.
8. **Rehearse** (when the user presents): accordion, timed runs, cuts pre-decided.
9. **Deliver.** File path or link, editable source plus PDF, what was checked and what wasn't, the gaps table.

## Done means

- [ ] Ghost-deck test passes: assertion titles alone tell the argument; the ending asks for something
- [ ] One idea per slide; nothing overflows, overlaps or is clipped; no empty template boxes or placeholders
- [ ] No invented facts; every gap listed; numbers sourced and consistent across slides
- [ ] Format fits who edits next; editable pptx is native, not picture slides
- [ ] Contrast measured on the smallest text; type floors met for the venue
- [ ] Notes in the notes slot with transitions, caveated numbers and timing marks (speaking decks)
- [ ] Every slide rendered and inspected, with at least one fix cycle; unverified items stated
- [ ] Nothing installed, shared, published or generated at cost without the user's go-ahead

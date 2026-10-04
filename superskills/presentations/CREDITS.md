# Credits

The router and references are written in this skill's own words from the licensed sources below, plus general knowledge of PptxGenJS, python-pptx, LibreOffice, Slidev, Marp, reveal.js, Beamer, the Google Slides API, Keynote scripting and WCAG 2.2. Scripts and templates are copied unchanged with their licence beside them. Nothing was taken from Anthropic's proprietary pptx skill.

This craft took over all slide work from `docs-office`. Its guides `deck-writing.md`, `html-slides.md` and `powerpoint-pptx.md` were folded into the references here (each keeps a "Distilled from" line naming them and their original sources), and its `templates/frontend-slides/` and `scripts/frontend-slides/` folders were copied unchanged.

## Sources used

### Inherited from docs-office (deck parts)

| Source | Repo | Licence | What was used |
|---|---|---|---|
| frontend-slides | [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) | MIT | Fixed 16:9 stage rules, density modes, style discovery, pptx conversion, PDF export; `templates/frontend-slides/` (html-template.md, viewport-base.css) and `scripts/frontend-slides/` (export-pdf.sh, extract-pptx.py) copied as-is |
| pptx-generator | [MiniMax-AI/skills](https://github.com/MiniMax-AI/skills/tree/main/skills/pptx-generator) | MIT | PptxGenJS module layout, theme contract, colour and option pitfalls, template-editing steps, QA loop (powerpoint-pptx.md, deck-qa.md) |
| kami | [tw93/Kami](https://github.com/tw93/Kami/tree/main/skills/kami) | MIT | Contract-first intake, gap reporting, anti-patterns of AI documents, ghost-deck test, slide counts and page sizes (deck-story.md, deck-types.md, deck-qa.md) |
| baoyu-slide-deck | [jimliu/baoyu-skills](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-slide-deck) | MIT | Narrative headlines, cliché list, meaningful back cover, image-slide modes, prompt files, style lock, regenerate-not-overpaint (deck-story.md, image-generated-slides.md) |
| html-ppt | [lewislulu/html-ppt-skill](https://github.com/lewislulu/html-ppt-skill) | MIT | Token-based theming, image framing, presenter mode, notes-not-on-slides rule |
| slidev | [slidevjs/slidev](https://github.com/slidevjs/slidev/tree/main/skills/slidev) | MIT | Slidev commands, syntax, layouts, notes, export formats |
| ppt-master | [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master/tree/main/skills/ppt-master) | MIT | Pointer for designed-deck pipelines, page-job thinking, speaker-notes branch, template-fill ideas |
| officecli | [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI/tree/main/skills/officecli) | Apache-2.0 | officecli command summary for pptx (read, DOM edit, raw XML layers, help first) |
| markitdown | [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/markitdown) | MIT | Text extraction of a deck for QA checks |
| gws-slides | [googleworkspace/cli](https://github.com/googleworkspace/cli/tree/main/skills/gws-slides) | Apache-2.0 | gws command pattern, Slides API resources (google-slides-keynote.md) |
| google-workspace | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent/tree/main/skills/productivity/google-workspace) | MIT | OAuth setup and scope minimisation, by way of docs-office's google-workspace guide |

### New for this craft

| Source | Repo | Licence | What was used |
|---|---|---|---|
| presentation-creator | [mblode/agent-skills](https://github.com/mblode/agent-skills/tree/main/skills/presentation-creator) | MIT | Story intake, pitch-deck and outline references, visual design, speaker notes, output formats, web deck, QA pass |
| tech-talk-outline | [samber/developer-relations-skills](https://github.com/samber/developer-relations-skills/tree/main/skills/tech-talk-outline) | MIT | Arrow and pillars, narrative arcs, time budgets, slide and demo craft, defaults with sources |
| public-speaking | [RefoundAI/lenny-skills](https://github.com/RefoundAI/lenny-skills/tree/main/skills/public-speaking) | MIT | Diagnosis table, accordion, delivery, nerves, Q&A (rehearsal-and-delivery.md); the frameworks only, no guest quotes |
| presenter-notes | [mohitagw15856/pm-claude-skills](https://github.com/mohitagw15856/pm-claude-skills/tree/main/skills/presenter-notes) | MIT | Cue-grain notes, verbatim set, timing marks, Q&A crib (speaker-notes.md) |
| presenting-conference-talks | [Orchestra-Research/AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs/tree/main/20-ml-paper-writing/presenting-conference-talks) | MIT | Paper-to-talk path, talk formats, figure simplification, practice |
| scientific-slides | [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/scientific-slides) | MIT | Talk types, timing, design principles, data visualisation, Beamer and PowerPoint guides, visual review; `scripts/scientific-slides/` (validate_presentation.py, pdf_to_images.py) and `templates/scientific-slides/beamer_template_conference.tex` copied as-is |
| pitch-deck | [anthropics/financial-services](https://github.com/anthropics/financial-services/tree/main/plugins/vertical-plugins/investment-banking/skills/pitch-deck) | Apache-2.0 | Template-fill rules, formatting and calculation standards, validation loop (deck-types.md, powerpoint-pptx.md, data-slides.md, deck-qa.md) |
| automating-keynote | [SpillwaveSolutions/automating-mac-apps-plugin](https://github.com/SpillwaveSolutions/automating-mac-apps-plugin/tree/main/plugins/automating-mac-apps-plugin/skills/automating-keynote) | MIT | Keynote JXA object model, master slides, presenter notes, export (google-slides-keynote.md) |
| marp-slide | [softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit/tree/main/skills/marp-slide) | MIT | Marp directives, themes, image syntax, notes and export |
| revealjs | [ryanbbrown/revealjs-skill](https://github.com/ryanbbrown/revealjs-skill/tree/main/skills/revealjs) | MIT | reveal.js structure, fragments, notes, charts, PDF export with DeckTape |
| slideshow | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes/tree/main/skills/slideshow) | Apache-2.0 | HyperFrames slideshow shape and when a deck should become a composition |
| consulting-pptx-skill | [carnot-tech/consulting-pptx-skill](https://github.com/carnot-tech/consulting-pptx-skill) | MIT | Consulting slide rules (action titles, one message, so-what), mechanical checks, fresh-eyes review table |

Licence texts: `scripts/frontend-slides/LICENSE` and `templates/frontend-slides/LICENSE` (MIT, frontend-slides), `scripts/scientific-slides/LICENSE` and `templates/scientific-slides/LICENSE` (MIT, K-Dense). Apache-2.0 sources were distilled, not copied; no NOTICE file applies.

## Not copied, and why

- **scientific-slides** image-generation scripts (`generate_slide_image*.py` and similar): they send prompts to openrouter.ai, an aggregator, not an official provider endpoint. Only the local validator, the PDF-to-image script and one Beamer template were copied.
- **ppt-master**: too large to carry (about 13k files with icon libraries), and its docs and SPONSORS file point at third-party API relays. The guides recommend only official provider endpoints for any image generation. Its `attribution_guard` integrity check was not carried over.
- **revealjs** scripts: they need Puppeteer and a CDN scaffold; the guide gives the plain commands instead.
- **html-ppt** runtime and themes, **frontend-slides** `STYLE_PRESETS.md` and bold templates: left in the source repos (the router's Go deeper rows point at them), so the copied frontend-slides folders stay identical to the docs-office copy.
- **consulting-pptx-skill** back-cover attribution line: not reproduced; the router notes it so it isn't added by accident.
- **public-speaking** guest quotes: not reproduced; only the frameworks were distilled.
- Directives inside sources (asking an assistant to cite a paper, run an update command, add attribution, or always prefer raster rendering) were treated as data and not followed.

## Also see (not included)

| Skill | Link | Why not included |
|---|---|---|
| pptx (Anthropic) | https://github.com/anthropics/skills/tree/main/skills/pptx | Proprietary source-available licence; link only, nothing copied or paraphrased |
| guizang-ppt-skill | https://github.com/op7418/guizang-ppt-skill | AGPL-3.0 (magazine-style HTML decks); kept out to keep this folder free of copyleft terms |
| dashi-ppt | (docs-office review) | AGPL-3.0 |
| nature-paper2ppt | https://github.com/Yuan1z0825/nature-skills | Apache-2.0 but Chinese academic decks only; reviewed, not ranked |
| presentation-design (jwynia) | https://github.com/jwynia | No licence in the repo |
| NanoBanana-PPT-Skills, GordenSuperPPTSkills, open-kimi-ppt-skill, robonuggets marp-slides, keynote-slides-skill | (various) | No licence found |
| SaaS deck wrappers (felo, SlideSpeak, Gamma-style) | (various) | Send your content to the vendor's cloud |

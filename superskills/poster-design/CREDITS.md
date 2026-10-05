# Credits

All guides in `references/` are written fresh, distilled from the skills below. Scripts and templates are copied as-is, each with its source licence file beside it.

| Source skill | Repo | License | What was used |
|---|---|---|---|
| canvas-design | https://github.com/anthropics/skills/tree/main/skills/canvas-design | Apache-2.0 | Philosophy-first, code-rendered art posters; refine-don't-add pass; font list (names only, no font files copied) |
| brand-guidelines | https://github.com/anthropics/skills/tree/main/skills/brand-guidelines | Apache-2.0 | Pattern for applying brand fonts/colours with fallbacks |
| theme-factory | https://github.com/anthropics/skills/tree/main/skills/theme-factory | Apache-2.0 | Theme workflow; `templates/theme-factory/themes/*.md` (10 themes, copied) |
| banner-design | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/banner-design | MIT | Banner sizes, safe zones, CTA/typography rules, 22 art directions, HTML→PNG workflow |
| design | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/design | MIT | Social photo sizes and workflow, CIP deliverables, icon/logo guidance |
| brandkit | https://github.com/Leonxlnx/taste-skill/tree/main/skills/brandkit | MIT | Brand-board layouts, logo concept methods, anti-generic rules |
| baoyu-cover-image | https://github.com/jimliu/baoyu-skills/tree/main/skills/baoyu-cover-image | MIT | Five cover dimensions, text levels, prompt-file and no-bitmap-patching rules |
| baoyu-infographic | https://github.com/jimliu/baoyu-skills/tree/main/skills/baoyu-infographic | MIT | Layout × style system, content analysis, verbatim data rule |
| higgsfield-brandkit | https://github.com/higgsfield-ai/skills/tree/main/higgsfield-brandkit | MIT | Brand Lock, approval sequence, design-brain anti-slop rules, set-level QA, Higgsfield CLI notes |
| higgsfield-youtube-thumbnail | https://github.com/higgsfield-ai/skills/tree/main/higgsfield-youtube-thumbnail | MIT | Thumbnail frameworks, prompt contract, truthfulness rule; `templates/higgsfield-youtube-thumbnail/text-overlay-bake.md` (copied) |
| canva-resize-for-social-media | https://github.com/canva-sdks/canva-skills/tree/main/plugins/canva/skills/resize-for-social-media | Apache-2.0 | Canva resize workflow and sizes |
| canva-bulk-create | https://github.com/canva-sdks/canva-skills/tree/main/plugins/canva/skills/bulk-create | Apache-2.0 | Canva autofill bulk workflow |
| visual-design-foundations | https://github.com/wshobson/agents/tree/main/plugins/ui-design/skills/visual-design-foundations | MIT | Type scale, spacing scale, contrast table, token tiers |
| logo-creator | https://github.com/resciencelab/opc-skills/tree/main/skills/logo-creator | Apache-2.0 | AI-raster logo workflow; `scripts/logo-creator/crop_logo.py` (copied) |
| banner-creator | https://github.com/resciencelab/opc-skills/tree/main/skills/banner-creator | Apache-2.0 | Generate-wide-then-crop workflow, platform formats; `scripts/banner-creator/crop_banner.py` (copied) |
| magazine-poster | https://github.com/nexu-io/open-design/tree/main/design-templates/magazine-poster | Apache-2.0 | Editorial poster structure; `templates/magazine-poster/example.html` (copied) |
| logo-design | https://github.com/kaankiziltug/logo-design-skill/tree/main/skills/logo-design | MIT | Logo process, mark types, SVG construction, testing checklist; `scripts/logo-design/scripts/` (svglib, svg_audit, render_png, export_variants, preview_sheet, concept_sheet, presentation_board), `scripts/logo-design/assets/library/stats.json`, `templates/logo-design/` (copied; the 1,400-logo library was not copied) |
| latex-posters | https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/latex-posters | MIT | Research-poster content, layout and type sizes, compile/preflight steps; `templates/latex-posters/*` and `scripts/latex-posters/review_poster.sh` (copied) |
| web-asset-generator | https://github.com/alonw0/web-asset-generator/tree/main/skills/web-asset-generator | MIT | Favicon/app-icon/OG specs and meta tags; `scripts/web-asset-generator/` (copied) |
| youtube-thumbnail | https://github.com/charlie947/social-media-skills/tree/main/skills/youtube-thumbnail | MIT | Thumbnail rules (face %, word count, two colours, bottom-right), brief format |

## Official docs (link-only reference, written in our own words)

Used for `references/app-built-posters.md`, the Canva line in `references/print-and-academic-posters.md` and section 8 of `references/ai-image-posters.md`. No text was copied beyond short phrases.

| Source | URL | Used for |
|---|---|---|
| Gemini API: Nano Banana image generation | https://ai.google.dev/gemini-api/docs/image-generation | Aspect ratios and pixel sizes per resolution, `response_format`, negative-space prompting, SynthID |
| OpenAI: image generation guide | https://developers.openai.com/api/docs/guides/image-generation | GPT Image 2.5 custom size rules, quality, output format |
| Adobe for Creativity (overview, getting started, workflows, FAQ) | https://developer.adobe.com/adobe-for-creativity/ | Earlier connector setup, guest vs signed-in access, limits |
| Adobe Help: Adobe for Claude overview (24 Sep 2026) | https://helpx.adobe.com/creative-cloud/apps/integration-with-other-apps/adobe-connectors/adobe-for-claude.html | Current setup (renamed connector), what it can edit, Claude Code availability, plans |
| Adobe blog: Adobe expands what you can do in Claude (24 Sep 2026) | https://blog.adobe.com/en/publish/2026/09/24/adobe-comes-to-gemini-expands-what-you-can-do-in-claude | Tool count, Express layer editor |
| Photoshop UXP scripting and DOM reference | https://developer.adobe.com/photoshop/uxp/2022/scripting/ | `.psjs` scripts, documents, generative upscale, colour conversion, saving |
| InDesign UXP scripts and DOM reference | https://developer.adobe.com/indesign/uxp/ | `.idjs` scripts, document preferences, bleed, place, fit, PDF export presets |
| Adobe Help: Illustrator, install and run scripts; create Adobe PDF files; Adobe PDF options | https://helpx.adobe.com/illustrator/desktop/automate-visualize-data/automate-actions/install-and-run-scripts.html , https://helpx.adobe.com/illustrator/using/creating-pdf-files.html , https://helpx.adobe.com/illustrator/using/pdf-options.html | Running `.jsx` scripts, PDF/X save with bleed and trim marks |
| Canva Help: margins, bleed and crop marks | https://www.canva.com/help/margins-bleed-crop-marks/ | Canva default bleed and PDF Print |
| Photoshop API (Adobe Firefly Services) | https://developer.adobe.com/firefly-services/docs/photoshop/ | One-line mention of the cloud route |
| Figma help: export formats and settings | https://help.figma.com/hc/en-us/articles/13402894554519-Export-formats-and-settings | Export scale notation, 1x-only PDF/SVG, colour profiles |
| Figma REST API: file endpoints | https://developers.figma.com/docs/rest-api/file-endpoints/ | `GET /v1/images/:key` parameters and limits |
| Affinity integrations | https://www.affinity.studio/integrations | Affinity AI Connector for Claude |

## Also see (not included)

Link-only skills: no licence file, so nothing was copied or closely paraphrased.

- SVG Logo Designer (rknall): https://github.com/rknall/claude-skills/tree/main/svg-logo-designer
- logo-generator (op7418): https://github.com/op7418/logo-generator-skill
- pptx-posters (sibling of latex-posters, editable PowerPoint posters): https://github.com/K-Dense-AI/claude-scientific-skills

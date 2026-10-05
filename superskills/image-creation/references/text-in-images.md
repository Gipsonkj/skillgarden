# Text in images: headlines, labels, posters, infographics

> Distilled from: flux-image-best-practices (black-forest-labs/skills, MIT), image-prompt (gongnyang/gongnyang-prompt-kit, MIT), imagegen (openai/skills, Apache-2.0), prompt-images (replicate/skills, Apache-2.0), image (coreyhaines31/marketingskills, MIT), generate-image (K-Dense-AI/claude-scientific-skills, MIT), gpt-image-2-style-library (freestylefly/awesome-gpt-image-2, MIT)

Wrong words are the most common reason a generated graphic gets rejected. Decide the route first.

## 1. Pick the route

| Situation | Route |
|---|---|
| 1-5 word headline, casual or social use | Render in the model. Quote the text exactly. |
| Short labels on a diagram (≤ 6 labels, ≤ 3 words each) | Render in a strong text model (GPT Image, Nano Banana Pro, FLUX.2 [flex], Ideogram, Recraft), then proof. |
| Exact brand copy, prices, dates, legal lines, long copy, print | Generate **without text**, leaving clean space, then set type in HTML/SVG/Figma/Canva/a layout tool. |
| Scientific figures, anything that reports results | Overlay real type; never trust generated labels. |
| Translating text in an existing image | Edit route: "change 'X' to 'Y', keep font, size, colour, layout". |

Why overlay wins for exact copy: it is spell-checked, editable and identical at every size. One source (image-prompt) argues the opposite for stylised typographic posters, because overlaid type can look pasted-on; that is true when **the type itself is the artwork**. For those, render in-model and proof hard; for everything where the words carry information, overlay.

## 2. Model choice for in-image text

**Pick a tool**

| Situation | Tool | Why |
|---|---|---|
| The user already uses one of the models below | That one | Proof every word anyway |
| Headline on a design, UI or banner | GPT Image 2.x | Strong on layout and on-image text |
| The type is the artwork | Ideogram 3, Recraft V4.x, FLUX.2 [flex] | Best typographic accuracy |
| Dense poster or infographic | GPT Image 2.x at `quality: high`, or Nano Banana Pro at 2K/4K | Large canvas keeps glyphs intact |
| Midjourney subscriber | Midjourney with the text in double quotes; the user runs it (`hosted-models-flux-replicate-fal.md` §10) | No API |
| Free, local | SD 3.5 (`local-open-models.md`) | Better text than SDXL; still proof hard |
| The words carry information | No model: overlay (§6) | Spell-checked and editable |

| Need | Use |
|---|---|
| Best typographic accuracy | Ideogram 3, Recraft V4.x, FLUX.2 [flex], GPT Image 2.x |
| Dense layouts (poster with 3+ text blocks, infographic) | GPT Image 2.x at `quality: high` + large canvas (≥ 1536 px long side; 2048x2048 for dense sheets); Nano Banana Pro at 2K/4K |
| Weak text | FLUX.2 [klein], SD 1.5/SDXL, cheap "lite/mini" tiers. Overlay instead. |

Canvas size is a real accuracy lever: small glyphs at 1024 px break first. Go up a size before rewriting the prompt.

## 3. How to write the text part

- Put every literal string in double quotes: `headline "BLUE NOTE SESSIONS"`.
- Give each string a **role label** before it, so the model gets the hierarchy: `headline "…"`, `subhead "…"`, `caption "…"`, `badge "…"`, `CTA "…"`. Unlabelled lists of quotes get random sizes.
- Per role, give font family type, weight, case, colour (hex), size relation and position:
  `headline "WINTER MARKET" in bold condensed sans-serif, white #FFFFFF, about one third of the canvas width, top third, centered; subhead "Dec 6-8, Old Town Square" at half the headline size directly below`.
- Name positions with a 3x3 grid (top-left, top-center, …, bottom-right) or bands ("title band across the top third", "bottom caption band"). Vague "at the top" drifts.
- Keep each quoted string in one language. Mixed-language strings garble.
- Write each string **once**. Repeating it in the prompt can render it twice.
- Add one guard line for GPT Image / Gemini: `All text appears once, perfectly legible, verbatim — no extra words, no duplicate text, no watermark.`
- Rare or invented words: spell them out ("K-I-N-T-S-U-G-I") or set them in ALL CAPS as a last resort. Avoid spelling-out for non-Latin scripts; hyphens can render.
- Match length when editing text: a big change in character count reflows the layout.

## 4. Typography vocabulary that works

| Character | Words |
|---|---|
| Neutral modern | clean geometric sans-serif, medium weight, tight tracking |
| Loud | bold condensed sans-serif, all caps |
| Editorial | high-contrast serif (Didone style), generous leading |
| Classic | traditional serif book face |
| Technical | monospace terminal font |
| Handmade | brush script, hand-painted sign lettering, chalk lettering |
| Display | 3D chrome lettering, neon tube letters, embossed metal |

Hierarchy that reads: one headline ≤ 6 words at ≥ 3x the size of details; at most 2 type families; margins ≥ 5% of the short side; text contrast ≥ 4.5:1 (add a scrim or solid block on busy images).

## 5. Infographics and diagrams

- Define 3-5 modules and the reading order first (top-to-bottom flow, left-to-right timeline, hub and spokes).
- Labels: short nouns, listed verbatim: `Text (verbatim): "Bean Hopper", "Grinder", "Brew Group", "Boiler"`.
- No paragraphs inside the image. Put body copy in HTML next to it.
- Use arrows, colour groups and icons to carry structure; keep one accent colour.
- For precise or data-bearing diagrams, prefer code (SVG, Mermaid, D3, matplotlib). Generated "charts" have invented numbers.

## 6. Overlay workflow (exact text)

**Pick a tool**

| Situation | Tool | Why |
|---|---|---|
| The user already designs in Figma, Canva or Adobe Express | That one | Their fonts and brand kit; the file stays editable for them |
| Free, one image, in code | HTML/CSS or SVG over the image, then export | Exact and spell-checkable |
| Many variants (OG images, social cards) | `@vercel/og`/Satori or HTML-to-image | One template, many images |
| Quick caption from the shell | ImageMagick `-annotate` | No design tool needed |
| Text in an existing Canva template | Canva connector: `replace_text` or `find_and_replace_text` in an edit transaction (`retouch-resize-upscale.md` §4) | It can't add new text boxes or change the font family |
| Text in an Adobe Express template | `fill_text` (`retouch-resize-upscale.md` §2) | Template-based posts |
| Not clear who edits the file later | Ask which tool they or their team update it in | The overlay must stay editable there |

1. Prompt for the image with explicit empty space: "clean empty sky in the top 40% for a headline, no text".
2. Choose the type in HTML/CSS, SVG, Figma or Canva; set it on the image.
3. Add a gradient scrim (e.g. black 0→60% opacity) behind text on busy areas.
4. Export at the target pixel size (see sizes in `marketing-brand-images.md`).
5. For many variants (OG images, social cards), template it: `@vercel/og`/Satori, HTML-to-image, or ImageMagick `-annotate`.

## 7. Proofing checklist

- [ ] Read every word letter by letter, including numbers, dates, prices, accents
- [ ] No duplicated, ghost or half-formed glyphs anywhere (check corners and backgrounds)
- [ ] Hierarchy correct: headline biggest, details smallest
- [ ] Readable at the real display size (a social post: ~200 px wide thumbnail)
- [ ] Contrast ≥ 4.5:1

If text is wrong after two tries: shorten the copy, raise canvas size/quality, switch to a text-strong model, or overlay.

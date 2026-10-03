# AI-image posters, covers and key art

> Distilled from: baoyu-cover-image (jimliu/baoyu-skills, MIT), banner-creator and logo-creator (resciencelab/opc-skills, Apache-2.0), brandkit (Leonxlnx/taste-skill, MIT), higgsfield-brandkit (higgsfield-ai/skills, MIT), banner-design (nextlevelbuilder/ui-ux-pro-max-skill, MIT).

Use for posters, flyers, event graphics, movie/book/album covers and article covers made with an image model (Nano Banana / Gemini image, GPT Image, Seedream, Flux, Midjourney, etc.). Use whichever image tool the environment provides; write the prompt to a file first so it can be re-run on another backend.

## 1. Decide the text route first

| Situation | Route |
|---|---|
| Exact copy, dates, prices, brand names, any print or client work | **No-text image + type layer.** Prompt for clean empty space; set type in HTML/SVG/Canva/Figma. |
| 1–5 word headline, social use, model with good text rendering | Text in the prompt, exact words in quotes, font style + position given. Verify letter by letter. |
| Text came out wrong | Regenerate with a corrected prompt, or switch to the no-text route. Never paint over broken generated text. |

Default to the no-text route when unsure. Generated text is the #1 reason AI posters fail.

## 2. Prompt structure (in this order)

1. **Format**: aspect ratio + use. "Vertical 2:3 gig poster", "16:9 article cover".
2. **Subject + action**: one subject, what it is doing.
3. **Composition**: where the subject sits and where the empty space is. "Subject in lower third, empty sky in top 40% for headline."
4. **Style**: medium and treatment as traits ("3-colour screen print, halftone, slight mis-registration"). Do not name living artists; describe what makes their work recognisable.
5. **Light + colour**: light direction, mood, 2–4 colours as hex.
6. **Text** (only if rendered): `headline text "NIGHT MARKET"`, weight, style, position.
7. **Avoid**: extra text, watermarks, logos, warped hands, clutter.

Write each final prompt to `prompts/NN-name.md` before generating. That file is the reproducibility record.

## 3. Five dimensions for covers (pick one value each)

| Dimension | Options | Default |
|---|---|---|
| Type | hero (subject portrait), conceptual (idea as object), typography (type is the image), metaphor (visual analogy), scene (place/moment), minimal (one mark + space) | conceptual |
| Palette | warm, elegant, cool, dark, earth, vivid, pastel, mono, retro, duotone, macaron | from content mood |
| Rendering | flat-vector, hand-drawn, painterly, digital, pixel, chalk, screen-print | flat-vector |
| Text level | none (100% visual), title-only (85% visual, title zone ~15%), title-subtitle (75%), text-rich (60%, 2–4 tags) | title-only |
| Mood | subtle (low contrast), balanced, bold (high contrast, saturated) | balanced |

Compatibility: typography covers need text; metaphor/scene/minimal covers work best with none or title-only. Use the exact title from the user or source; never invent or "improve" it. Covers keep 40–60% whitespace and use simplified silhouettes rather than realistic people unless a real person is the subject.

Common cover ratios: 2.35:1 (cinematic/WeChat header), 16:9 (blog/article), 1:1 (album, square post), 2:3 or 6×9 in (book), 9:16 (story, phone poster), 3:4 (Xiaohongshu-style cards).

## 4. Book, album and event specifics

- **Book**: 2:3 portrait. Title and author both prominent and legible at thumbnail size (online shops show ~150 px wide). Spine and back only if asked; then build in a layout tool with the printer's template.
- **Album**: 1:1, 3000×3000 px. Works at 64 px in a playlist; artist name optional on the art.
- **Event poster**: hierarchy = event name → date → place → CTA/QR. Generate the art with space reserved for this block; set it in a layout tool.

## 5. Consistent series

- Freeze a **style block** (medium, palette hex, light, grain, era) and paste it verbatim into every prompt. Only the subject line changes.
- Pass the same reference image (or the approved first image) into every generation when the model accepts references. Label references by role: "Image 1 = style reference only, do not copy its subject".
- Same aspect ratio, same type grid, same logo position across the set.
- For brand series, use a Brand Lock block (see brand-kits guide).

## 6. Generate and iterate like a designer

- Generate **4 variations** first (some workflows go to 20 for logos/banners; 4–8 is enough for posters). Choose on **composition**, not detail.
- Generate wide when you need several crops: e.g. 21:9 or 16:9, then crop per platform with `scripts/banner-creator/crop_banner.py` (see banners guide).
- Fix details with editing/inpainting ("change ONLY the sky colour; keep everything else unchanged") instead of re-rolling the whole image.
- Keep every iteration with sequential names (`poster-03-v2.png`) and back up before regenerating.
- For print, generate at the highest native resolution, then upscale; check faces, hands, edges at 100%.

## 7. Reference images

- A reference controls style, palette or composition only when you say so. State what it must not control.
- Never copy a reference's identity, logo, exact layout or slogan.
- If the model cannot take references, describe the reference's concrete traits (palette hex, line weight, texture, framing) as MUST lines in the prompt.

## 8. Checks before handover

- [ ] Every word correct letter by letter (dates, prices, names)
- [ ] Headline readable at ~200 px wide
- [ ] No invented logos, watermarks, stray or pseudo-text
- [ ] Hands, faces, product shapes correct at 100%
- [ ] Text contrast ≥ 4.5:1 against what is behind it
- [ ] Exact size/ratio for the destination; print files have bleed
- [ ] Prompt files saved; final + editable layer delivered

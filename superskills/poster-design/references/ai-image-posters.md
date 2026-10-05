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

## 8. Gemini (Nano Banana) and GPT Image settings for poster sizes

Setup, keys, model choice and general prompting live in `image-creation` → `references/gemini-nano-banana.md` and `references/openai-gpt-image.md`. Read the one you use first. This section adds only what a poster needs on top: a background that leaves room for type, the size settings per poster format, and the print resolution you actually get. Keys stay in `GEMINI_API_KEY` / `OPENAI_API_KEY`; never write them into a prompt file, script or reply.

### Ask for a text-free background with room for type

Both models follow the purpose of an image, so say what it is for and where the type goes. Describe the empty area as a thing that is there ("a clear, softly lit wall"), not as a "no": Google's prompting guide recommends describing the scene positively instead of listing what to leave out.

```text
Background photograph for a portrait market poster. Fresh sourdough loaves on a worn oak table,
warm morning side light from the left, shallow depth of field.
The loaves fill the lower 55% of the frame. The top 40% is a calm, out-of-focus
cream wall with even tone, kept clear for a headline set later.
Natural colour, light film grain. Only bread, table and wall in the frame:
no lettering, signs, labels, logos or watermarks anywhere.
```

- Put the empty zone where your type grid needs it (top third for a headline, a bottom band for the details block), and keep it low in detail and contrast so text reaches 4.5:1 without a heavy scrim.
- Google's template for this job, roughly: one subject placed in a named corner, "a vast, empty [colour] canvas", significant negative space, soft light, the aspect ratio. Use it for minimal posters.
- Check the output for pseudo-letters on packaging, signs or book spines; regenerate or edit them out before setting type.
- Gemini output carries an invisible SynthID watermark. Tell the user when the poster is client or press work.

### Size settings per destination

Gemini: set `aspect_ratio` and `image_size` inside `response_format` (`"1K"`, `"2K"`, `"4K"`; uppercase K, lowercase is rejected). Without `aspect_ratio` the model matches the input image's size or returns a 1:1 square. `gemini-3.1-flash-lite-image` only makes 1K. GPT Image 2.5 (`gpt-image-2.5-flare`, `gpt-image-2.5-sunburst`): custom `size` as `WIDTHxHEIGHT`, both sides multiples of 16, long side ≤ 3840 px, ratio within 3:1, total 655,360 to 8,294,400 px; sizes above 2560×1440 are marked experimental.

| Destination | Gemini setting → pixels | GPT Image `size` | Then |
|---|---|---|---|
| Instagram post 1080×1350 (4:5) | `4:5` at `2K` → 1856×2304 (1K is only 928×1152, too small) | `1088x1360` (1080 is not a multiple of 16) | Downscale to 1080×1350 |
| A-series portrait (A4, A3, A2: 1:1.414) | `3:4` at `4K` → 3584×4800, or `2:3` → 3392×5056 | `2416x3424` (≈ 1:1.417, just under the pixel cap) | Fill the bleed box, crop the overflow |
| 18×24 in (3:4) | `3:4` at `4K` → 3584×4800 | `2496x3312` | Fill the bleed box |
| 24×36 in or 11×17 in (≈ 2:3) | `2:3` at `4K` → 3392×5056 | `2352x3520` | Fill the bleed box |
| Wide banner, 21:9 header | `21:9` at `4K` → 6336×2688 | ratio limit is 3:1; `3840x1648` is ≈ 21:9 | Crop per platform (`banners-social.md`) |

Ask for PNG (`"mime_type": "image/png"` in Gemini's `response_format`; `output_format: "png"`, the default, in GPT Image) so print files carry no JPEG artefacts.

```python
# Only the poster-specific settings; client setup is in the image-creation guides.
prompt = open("prompts/01-market-bg.md").read()
it = gemini.interactions.create(model="gemini-3-pro-image", input=prompt,
    response_format={"type": "image", "mime_type": "image/png", "aspect_ratio": "3:4", "image_size": "4K"})
img = openai.images.generate(model="gpt-image-2.5-flare", prompt=prompt, size="2416x3424", quality="high")
```

### Print resolution you actually get

Effective ppi when the image fills the bleed box = the smaller of (pixel width ÷ bleed-box width in inches) and (pixel height ÷ bleed-box height in inches). With 3 mm bleed on each side:

| Print size | Gemini 4K (`3:4` 3584×4800) | Gemini 2K (`3:4` 1792×2400) | GPT Image `2416x3424` |
|---|---|---|---|
| A4 | ≈ 400 ppi | ≈ 200 ppi | ≈ 285 ppi |
| A3 | ≈ 285 ppi | ≈ 145 ppi | ≈ 200 ppi |
| A2 | ≈ 200 ppi | ≈ 100 ppi | ≈ 145 ppi |
| 24×36 in | ≈ 130 ppi (`2:3` 4K ≈ 140) | ≈ 65 ppi | ≈ 95 ppi |

- A 1080 px social image is never a print source: a 1080×1350 image filling A3 with bleed gives about 80 ppi. Generate the print version separately at the highest size, or upscale.
- Below the target in `print-and-academic-posters.md` (300 ppi close up, 150 ppi viewed from over 1 m), upscale before layout: Photoshop's generative upscale (2× or 4×, see `app-built-posters.md`) or an upscaler from `image-creation`. Say in the handover what ppi the final file has and how it got there.
- Type, logos and the details block stay vector (HTML/SVG print to PDF, InDesign, Illustrator), so only the photo needs the pixels.

## 9. Checks before handover

- [ ] Every word correct letter by letter (dates, prices, names)
- [ ] Headline readable at ~200 px wide
- [ ] No invented logos, watermarks, stray or pseudo-text
- [ ] Hands, faces, product shapes correct at 100%
- [ ] Text contrast ≥ 4.5:1 against what is behind it
- [ ] Exact size/ratio for the destination; print files have bleed
- [ ] Prompt files saved; final + editable layer delivered

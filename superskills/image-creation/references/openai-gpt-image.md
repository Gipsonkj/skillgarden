# OpenAI GPT Image (Images API, Codex image_gen)

> Distilled from: imagegen (openai/skills, Apache-2.0), baoyu-image-gen (jimliu/baoyu-skills, MIT), image (coreyhaines31/marketingskills, MIT), generate-image (K-Dense-AI/claude-scientific-skills, MIT), image-prompt (gongnyang/gongnyang-prompt-kit, MIT), gpt-image-2-style-library (freestylefly/awesome-gpt-image-2, MIT), higgsfield-ai-prompt-skill (OSideMedia/higgsfield-ai-prompt-skill, MIT), higgsfield-generate model catalog (higgsfield-ai/skills, MIT)

Model names and retirement dates move fast. Check OpenAI's models and deprecations pages before hard-coding one.

## 1. Models (state per sources, Oct 2026)

| Model | Notes |
|---|---|
| `gpt-image-2.5-flare` | Fast, low latency. Good default for drafts and volume. |
| `gpt-image-2.5-sunburst` | Most capable: complex scenes, precise edits, dense text. Accepts `quality` up to `xhigh`/`max` per OpenRouter discovery. |
| `gpt-image-2` | Custom sizes; **no transparent background**. |
| `gpt-image-1.5`, `gpt-image-1`, `gpt-image-1-mini` | Retiring late 2026 (`gpt-image-1` on 23 Oct, the others 1 Dec, per sources). Fixed sizes only. Support transparent background. |
| DALL-E 3 | Deprecated. Don't use. |

## 2. Endpoints and parameters

- Generate: `POST /v1/images/generations` (`client.images.generate`).
- Edit (incl. references, masks, compositing): `POST /v1/images/edits` (`client.images.edit`), up to 16 input images, each < 50 MB.
- Output comes back as `data[].b64_json` (raw base64, not a data URL).

| Param | Values | Notes |
|---|---|---|
| `size` | 1.x: `1024x1024`, `1536x1024`, `1024x1536`, `auto`. 2 / 2.5: custom `WxH` | Custom sizes: both sides multiples of 16, max edge 3840 px, aspect no wider than 3:1. |
| `quality` | `low`, `medium`, `high`, `auto` (+ higher tiers on 2.5) | Draft at `low`/`medium`; `high` for text-dense or final assets. |
| `n` | 1-10 | |
| `background` | `transparent`, `opaque`, `auto` | Transparent needs `png` or `webp`. Not on `gpt-image-2`. |
| `output_format` | `png`, `jpeg`, `webp` | `output_compression` 0-100 for jpeg/webp. |
| `input_fidelity` (edits) | `low`, `high` | `high` preserves faces/logos better, costs more input tokens. |
| `mask` (edits) | PNG with alpha | Prompt-guided; edges not exact. |
| `moderation` | `auto`, `low` | |

Larger sizes and higher quality raise latency and cost. If an option is rejected for a model, retry without it.

## 3. Prompting GPT Image well

- Use the labeled spec (see `prompting-fundamentals.md`). OpenAI's taxonomy helps you pick the right emphasis: `photorealistic-natural`, `product-mockup`, `ui-mockup`, `infographic-diagram`, `logo-brand`, `illustration-story`, `stylized-concept`, `historical-scene`; edits: `text-localization`, `identity-preserve`, `precise-object-edit`, `lighting-weather`, `background-extraction`, `style-transfer`, `compositing`, `sketch-to-render`.
- Scene negatives can backfire on GPT Image 2.x: say "a single person, alone" instead of "no crowd". Keep negatives to text-defect guards ("no extra text, no watermark, no logo").
- Describe camera **results** ("shallow depth of field, background softly blurred") rather than gear model numbers.
- Realistic skin: "natural skin texture, visible pores, subtle film grain"; avoid idealised plastic skin.
- Text: role-labelled quoted strings, positions on a 3x3 grid, one guard line; for 3+ text blocks use `quality: high` and ≥ 1536 px long side (2048x2048 for dense sheets). See `text-in-images.md`.
- One prompt = one image. Generate a set as N calls, not a grid on one canvas.
- The ChatGPT interface rewrites prompts; the API follows them more literally.

Style templates that work well with GPT Image 2.x (from the awesome-gpt-image-2 library; lock the listed items, avoid the pitfall):

| Template | Lock | Pitfall |
|---|---|---|
| UI screenshot | platform, ratio, hierarchy, exact visible text, chrome (status bar, tabs) | vague "an app" |
| Infographic | 3-5 modules, flow, short labels, colour groups | paragraphs in the image |
| Poster layout | subject, headline, layout, palette, ratio | moodboard/collage when one poster is wanted |
| Product commerce visual | product shape, material, light, background, callouts | invented branding |
| Brand identity board | mark, palette hex, type, 4-6 touchpoints | too many items, unreadable |
| Character design sheet | turnaround views, palette, outfit details, labels | identity drift between views |
| 3D collectible toy | material (vinyl/resin), base, packaging, light | over-detailed accessories |
| Realistic photography | camera result, light, skin texture, setting | glossy AI look |

## 4. Running it

**Codex**: use the built-in `image_gen` tool by default (no API key). Generated files land under `$CODEX_HOME/generated_images/`; copy finals into the project. Edit local files by first loading them with `view_image`.

**Anywhere with `OPENAI_API_KEY`**: `scripts/imagegen/image_gen.py` (OpenAI's official fallback CLI, needs `pip install openai`, optional `pillow`):

```bash
IMG=<this-skill>/scripts/imagegen/image_gen.py
python "$IMG" generate --prompt "A cozy alpine cabin at dawn" --size 1536x1024 --quality high --out output/imagegen/cabin.png
python "$IMG" edit --image room.png --prompt "Replace only the white chairs with oak chairs; keep everything else unchanged" --input-fidelity high --out output/imagegen/room-v2.png
python "$IMG" generate --prompt "Mascot fox, flat vector" --background transparent --output-format png --out output/imagegen/fox.png
python "$IMG" generate-batch --input tmp/prompts.jsonl --out-dir output/imagegen/batch --concurrency 5
python "$IMG" generate --prompt "Test" --dry-run   # prints payload, no key needed
```

Notes on this script: it only accepts `gpt-image-*` models and the three fixed sizes plus `auto` (default model `gpt-image-1.5`). For GPT Image 2.x custom sizes, call the API directly or use `scripts/generate-image/generate_image.py` via OpenRouter (`-m openai/gpt-image-2.5-sunburst`). `--downscale-max-dim 1600` writes an extra `-web` copy. Batch JSONL: one object per line with `prompt` plus optional `use_case`, `composition`, `lighting`, `constraints`, `size`. It refuses to overwrite existing files unless `--force`.

Direct SDK call:

```python
from openai import OpenAI; import base64
c = OpenAI()
r = c.images.generate(model="gpt-image-2.5-flare", prompt=PROMPT, size="1536x1024", quality="medium")
open("out.png", "wb").write(base64.b64decode(r.data[0].b64_json))
```

## 5. Keys and accounts

- Never ask the user to paste an API key in chat; ask them to set `OPENAI_API_KEY` locally and confirm.
- A ChatGPT/Codex login is **not** an API key. Without a key, use Codex's native `image_gen` (or `codex exec` from another runtime); don't hack the API provider to use OAuth.

## 6. Checks specific to GPT Image

- [ ] No unrequested text or "UI chrome" invented around the subject
- [ ] Transparent requests actually have alpha (2.x non-2.5 models silently ignore it)
- [ ] Final asset copied from the default output folder into the project with a stable name
- [ ] Report the final prompt, model and size used

## 7. Prompt shape by output type

Pick one shape per image (from a GPT Image 2 prompt director; not yet validated on 2.5):

| Output | Shape |
|---|---|
| Discrete regions: UI, landing page, infographic, character sheet, multi-panel poster, magazine layout | One JSON object, a key per region |
| One scene, one subject, no layout (portrait, landscape, illustration) | One dense paragraph: medium, subject details, action, setting, light, palette or film stock, mood |
| Only a theme ("a poster about the history of tea") | A meta-prompt: "Generate a [type] about [theme]; derive the subject, structure, palette, lighting and typography yourself", then short style, composition and typography rules |

Torn between JSON and prose? Choose JSON: granular layout is where GPT Image leads. JSON habits it follows:

- Name a position per region (`top-left`, `mid-right`, `bottom-center`).
- For repeated items give a `count` plus a parallel `labels` array, so it renders the right number.
- Real copy goes in quoted strings, in its original script (CJK stays CJK). Don't paraphrase it.
- Put type inline where it matters: `"title in large serif"`, `"small regular sans labels"`.

```json
{"type": "landing page mockup", "style": "clean e-commerce, soft pastels, generous whitespace",
 "layout": {"header": {"logo": "small black wordmark 'AURA'", "nav": ["Shop", "Journal", "Contact"]},
  "hero": {"left": "amber glass serum bottle on marble",
           "right": {"headline": "Skin, restored.", "cta": "black pill button 'Shop now'"}},
  "below_hero": {"ingredients": {"count": 4, "labels": ["Vitamin C", "Niacinamide", "Peptides", "Hyaluronic Acid"]}}}}
```

## 8. Faces, edits and known leanings

- One source finds faces go plastic when a prompt says "photorealistic" and asks for realism as film photography instead: "35mm film photograph, direct flash, visible grain, editorial portrait". Another rates 2.x photorealism highly. Test both on your subject.
- Edit a locked still with a short list of adds and removes, then a closing keep clause: "Clear the kitchen island; add a gas stove on the left counter; replace the TV on the right wall with a door. Keep lighting, camera angle, wall colour, flooring and all other props unchanged." Without that clause it re-renders the surroundings. If something still drifts, go back to one change per call.
- Production notes: strong on clothing and wardrobe changes; environments tend to come out with a warm yellow cast (ask for neutral daylight white balance, or use another model for locations).
- Product reference sheets: use the recipe in `gemini-nano-banana.md` section 10. If a GPT sheet comes back flat or 2D, rerun the same prompt unchanged on Nano Banana Pro before rewriting it.

## 9. Ads from a reference layout

When the user brings a winning ad and wants it in their own brand:

- **Two lists.** From the reference take only layout, zone positions, element types (chat bubbles, countdown blocks, toggles) and spacing. From the brand guide take background colour, typefaces and accent colours, and name them in the prompt. Never leave them to be inherited from image 1.
- **A wireframe instead of the ad.** Draw a plain block wireframe at the target ratio with labelled boxes (`text_zone`, `product_zone`, `button_zone`) and pass it as image 1, product photos as images 2+. The layout transfers; the other brand's colours and type don't, and there is no aspect clash.
- **Zones as fractions of height** (0 = top), for example text 0.10-0.35, product 0.40-0.77, button 0.81-0.91, disclaimer 0.91-0.97.
- **Safe zones.** Keep the top and bottom 10% free of text, logos and buttons in feed placements (Stories need more, see `marketing-brand-images.md`). Hands or product edges crossing those bands are fine.

## 10. When to pick it, and API notes (checked Sep 2026)

- Default for graphic design, UI, banners, typography and anything with on-image text: GPT Image 2.5 (OpenAI also recommends 2.5 for new integrations). For face matching, cartoon characters and one-line fixes to an existing image, see `gemini-nano-banana.md` section 9.
- Complex prompts can take up to about 2 minutes. Set client timeouts to 180 s or more.
- OpenAI notes that text placement can still slip and that recurring characters or brand elements can drift between generations. Keep references in every call and proof every word.
- Rate limits are low on new accounts (per sources, `gpt-image-2`: about 5 images/min at Tier 1, 250 at Tier 5). Keep batch concurrency small until you know the tier.

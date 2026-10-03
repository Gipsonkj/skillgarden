# OpenAI GPT Image (Images API, Codex image_gen)

> Distilled from: imagegen (openai/skills, Apache-2.0), baoyu-image-gen (jimliu/baoyu-skills, MIT), image (coreyhaines31/marketingskills, MIT), generate-image (K-Dense-AI/claude-scientific-skills, MIT), image-prompt (gongnyang/gongnyang-prompt-kit, MIT), gpt-image-2-style-library (freestylefly/awesome-gpt-image-2, MIT)

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

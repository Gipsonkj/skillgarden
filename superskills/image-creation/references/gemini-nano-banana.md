# Google Gemini image models (Nano Banana family)

> Distilled from: gemini-api-dev (google-gemini/gemini-skills, Apache-2.0), nano-banana-pro (intellectronica/agent-skills, CC0-1.0), nano-banana-pro (steipete/agent-scripts, MIT), nano-banana (kingbootoshi/nano-banana-2-skill, MIT), nano-banana-pro-openrouter (github/awesome-copilot, MIT), imagen (sanjay3290/ai-skills, Apache-2.0), fal-ai-media (affaan-m/everything-claude-code, MIT), image (coreyhaines31/marketingskills, MIT)

## 1. Models (per Google's own skill, Oct 2026)

| Model id | Nickname | Use |
|---|---|---|
| `gemini-3-pro-image` | Nano Banana Pro | Highest quality, best text, complex edits, up to 4K. ~2x the Flash price. |
| `gemini-3.1-flash-image` | Nano Banana 2 | Default: fast, cheap, 512 / 1K / 2K / 4K. |
| `gemini-3.1-flash-lite-image` | Nano Banana 2 Lite | Cheapest drafts, **1K only**. |

Older ids (`gemini-3-pro-image-preview`, `gemini-3.1-flash-image-preview`, `gemini-2.5-flash-image`) still appear in scripts and aggregators; Google marks 2.x models deprecated. Swap the model string when updating.

Indicative cost per image (nano-banana CLI, early 2026): Flash 512 ≈ $0.045, 1K ≈ $0.067, 2K ≈ $0.10, 4K ≈ $0.15; Pro 1K ≈ $0.13, 4K ≈ $0.30. Check Google's pricing page.

## 2. Capabilities

- Text-to-image, editing, multi-image composition (up to 14 references), style transfer, decent-to-good text rendering (Pro is best).
- Resolution values are strings with uppercase K: `"512"` (Flash only), `"1K"`, `"2K"`, `"4K"`.
- Aspect ratios: `1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9`.
- No seed control and no negative prompt. No native transparency: use the green-screen route in `editing-references-consistency.md`.
- Strong world knowledge; good at infographics, diagrams with labels, product shots and character consistency from references.

Map user words to resolution: nothing said → `1K`; "thumbnail/tiny" → `512`; "2K/medium/normal" → `2K`; "high-res/4K/print/ultra" → `4K`.

## 3. Draft → final workflow

1. Draft at `1K` (or `512` on Flash) with the Flash model.
2. Iterate in small prompt diffs; new filename per run (`yyyy-mm-dd-hh-mm-ss-short-name.png`). When editing, keep the same input image every iteration.
3. Lock the prompt, then render the final at `2K`/`4K`, on Pro if text or fine detail matters.

## 4. Prompt templates that hit

Generation:
```text
Create an image of: <subject>. Style: <style>. Composition: <shot/framing>. Lighting: <lighting>.
Background: <background>. Colour palette: <3-5 hex with names>. Avoid: <short list>.
```

Edit (preserve everything else):
```text
Change ONLY: <single change>. Keep identical: subject, composition/crop, pose, lighting, colour palette,
background, text, and overall style. Do not add new objects. If text exists, keep it unchanged.
```

Pass the user's description as-is when it's already good; rework only if it's clearly thin. For edits, put the image **before** the text in the request contents.

## 5. Calling the API

Google's current SDKs: Python `google-genai` (≥ 2.x), JS `@google/genai`. The legacy `google-generativeai` / `@google/generative-ai` packages are deprecated. Fetch https://ai.google.dev/gemini-api/docs/image-generation.md.txt before writing new code; the API surface changed in 2026 (Interactions API; responses expose `output_image` with base64 `data` and `mime_type`).

Classic `generate_content` pattern (still used by most scripts):

```python
from google import genai
from google.genai import types
client = genai.Client()  # reads GEMINI_API_KEY
resp = client.models.generate_content(
    model="gemini-3.1-flash-image",
    contents=[input_image, "Change ONLY the sky to a stormy sunset. Keep identical: ..."],  # or just the prompt
    config=types.GenerateContentConfig(
        response_modalities=["TEXT", "IMAGE"],
        image_config=types.ImageConfig(image_size="2K", aspect_ratio="16:9"),
    ),
)
for part in resp.parts:
    if part.inline_data: open("out.png", "wb").write(part.inline_data.data)
```

Interactions API (new):

```python
it = client.interactions.create(model="gemini-3.1-flash-image", input="A red bicycle against a white wall")
img = it.output_image  # .data (base64), .mime_type
```

## 6. Bundled script

`scripts/nano-banana-pro/generate_image.py` (CC0, needs `uv`; it declares `google-genai` and `pillow` inline):

```bash
uv run <this-skill>/scripts/nano-banana-pro/generate_image.py \
  --prompt "A serene Japanese garden with cherry blossoms" \
  --filename "2026-10-03-14-23-05-japanese-garden.png" --resolution 2K

uv run <this-skill>/scripts/nano-banana-pro/generate_image.py \
  --prompt "Change ONLY the sky to storm clouds; keep everything else identical" \
  --filename "2026-10-03-14-25-30-storm-sky.png" --input-image photo.jpg
```

- Run from the user's working directory so files land there, not in the skill folder.
- Key: `GEMINI_API_KEY` env var (or `--api-key`). Never ask for the key in chat.
- It uses `gemini-3-pro-image-preview`, one input image, no aspect-ratio flag; with an input image and default `1K` it auto-picks resolution from the input size. It flattens alpha onto white.
- For aspect ratios, several reference images or newer model ids, call the API directly (section 5) or use `scripts/generate-image/generate_image.py` with `-m google/gemini-3.1-flash-image --aspect-ratio 16:9` via OpenRouter.
- If the user already has their own Nano Banana CLI or wrapper configured, use that instead.

## 7. Other routes to the same models

| Route | Model id | Key |
|---|---|---|
| OpenRouter | `google/gemini-3.1-flash-image`, `google/gemini-3-pro-image` | `OPENROUTER_API_KEY` |
| fal.ai | `fal-ai/nano-banana-2`, `fal-ai/nano-banana-pro` (`image_size`: `square`, `landscape_16_9`, `portrait_16_9`, …) | `FAL_KEY` |
| Replicate | `google/nano-banana-2`, `google/nano-banana` (`aspect_ratio`, `resolution`, `output_format`) | `REPLICATE_API_TOKEN` |
| Higgsfield | `nano_banana_flash` = Nano Banana 2 (careful: `nano_banana_2` there is an alias for **Pro**) | Higgsfield login |

## 8. Common failures

| Error | Fix |
|---|---|
| No API key | Set `GEMINI_API_KEY` |
| 403 / quota / permission | Wrong key, no billing on the project, or region limits |
| Text returned, no image | Add `response_modalities=["TEXT","IMAGE"]`; rephrase if refused for policy |
| `Error loading input image` | Wrong path; check the file exists |
| 429 / timeout | Retry once after ~30 s; stop after two failures and report |

# Hosted models: FLUX, Replicate, fal.ai, OpenRouter, Higgsfield and others

> Distilled from: flux-image-best-practices (black-forest-labs/skills, MIT), prompt-images (replicate/skills, Apache-2.0), fal-ai-media (affaan-m/everything-claude-code, MIT), generate-image (K-Dense-AI/claude-scientific-skills, MIT), baoyu-image-gen (jimliu/baoyu-skills, MIT), higgsfield-generate (higgsfield-ai/skills, MIT), image (coreyhaines31/marketingskills, MIT)

Rule one for every platform here: **list models from the API, don't trust memory**. Catalogues change weekly. Read the model's schema before sending parameters.

## 1. Which model for which job

| Need | First choice | Also good |
|---|---|---|
| General quality, prompt adherence | Gemini 3.1 Flash / 3 Pro, GPT Image 2.5 | FLUX.2 [pro] |
| Photorealism, art direction | FLUX.2 [max]/[pro], Seedream 4.5/5 | Midjourney (no API; manual only) |
| Typography in the image | Ideogram 3, Recraft V4.1, FLUX.2 [flex] | GPT Image 2.5, Nano Banana Pro |
| Vector / SVG logos and icons | Recraft V4.1 vector (`svg` output) | redraw by hand as SVG |
| Brand-consistent sets | FLUX.2 multi-reference, Nano Banana Pro refs | Recraft Styles (1-10 style refs) |
| Many variants per call | Seedream 4.5 (n ≤ 10), GPT Image (n ≤ 10) | Recraft (n ≤ 6), Qwen Image 3 (n ≤ 6) |
| Seeded reproducibility | Seedream, FLUX, Krea, Qwen | (not Gemini, not OpenAI) |
| Cheapest drafts | FLUX.2 [klein] 4B, Gemini Flash Lite, Recraft V4.1 Flash, GPT Image 1 mini | Z Image |
| Inpainting with a hard mask | FLUX.1 Fill | SD inpaint (local) |
| Local / open weights | FLUX.2 [dev] (non-commercial licence; check), SDXL, SD 3.5 | see `local-open-models.md` |

## 2. FLUX (Black Forest Labs)

| Model | Use | Refs |
|---|---|---|
| FLUX.2 [klein] 4B / 9B | sub-second drafts, volume | up to 4 |
| FLUX.2 [pro] | production balance; supports prompt upsampling | up to 8 |
| FLUX.2 [flex] | typography; adjustable steps 1-50, guidance 1.5-10 | up to 8 |
| FLUX.2 [max] | top quality, best edit consistency, grounding search for current events | 8 (API) |
| FLUX.2 [dev] | open weights, ~13 GB VRAM, non-commercial licence | varies |
| FLUX.1 Fill / Kontext | legacy inpainting / context edits; use only if asked | |

FLUX prompting rules:
- **No negative prompts.** Describe the positive ("bare head, eyes visible", not "no hat").
- Formula: Subject + Action + Style + Context + Lighting + Camera. Word order matters: front-load the subject.
- 30-80 words is the sweet spot (max ~512 tokens). [klein] has no prompt upsampling: be descriptive (40-70 words, narrative prose, heavy on light). [max] likes camera and film-stock detail.
- Hex colours work: `#2C3E50 (dark blue-grey) walls`. Always pair the hex with a name and the object; 3-5 colours max. Gradients: "from #FF6B6B (coral) at the horizon to #87CEEB (sky blue) at the top".
- Quote text exactly; name font style, hierarchy and placement.
- JSON-structured scene specs (scene / subjects with id, position, action / style / technical / colors) are a good **authoring** format for multi-subject scenes and templates; flatten to prose or send as-is, test both.
- Editing: pass the source as `input_image` (URLs preferred over base64), more refs as `input_image_2`… Use "image 1 / image 2" indexing.
- Pricing is per megapixel (1 credit = $0.01). Keep total input+output ≤ 9 MP on [pro].

## 3. Replicate

- Find models with the API/search, read the schema, then run (`REPLICATE_API_TOKEN`).
- Many models are ~1 MP-native: stay near the model's recommended sizes/aspect ratios; very large outputs get edge artifacts.
- Guidance (CFG) too high → burnt, over-contrasted images. Lower it.
- Negative prompts only on models trained for them (SD-family); on others they add noise.
- LoRA fine-tunes: use the trigger word in every prompt; balance multiple LoRAs at ~0.9-1.1 scale; generate synthetic data from your best outputs to retrain.
- Example-based editing: some models accept a before/after pair plus a third image and apply the same transformation.

## 4. fal.ai

Via the fal MCP server (tools: `search`, `find`, `generate`, `result`, `status`, `upload`, `estimate_cost`) or the API, with `FAL_KEY`. Model ids and pricing drift: search first.

```text
generate(app_id: "fal-ai/nano-banana-2",
         input_data: {"prompt": "...", "image_size": "landscape_16_9", "num_images": 1, "seed": 42})
```
- `image_size`: `square`, `portrait_4_3`, `portrait_16_9`, `landscape_4_3`, `landscape_16_9`.
- Upload local files first (`upload`), then pass `image_url` for edits.
- Use `estimate_cost` before batch runs; fal is pay-per-use.

## 5. OpenRouter (one key, many models)

`scripts/generate-image/generate_image.py` (K-Dense, MIT, Python stdlib only) wraps `POST https://openrouter.ai/api/v1/images` with a free capability preflight, so unsupported parameters fail **before** billing:

```bash
GI=<this-skill>/scripts/generate-image/generate_image.py
python "$GI" --list-models flux                          # free: models + allowed values
python "$GI" --model-info openai/gpt-image-2.5-sunburst  # free: params + pricing
python "$GI" "Laboratory, wide shot, equipment left, empty wall right, no text" \
  --aspect-ratio 21:9 --resolution 2K -o poster/hero.png
python "$GI" "Minimal geometric fox logo, two colours" -m recraft/recraft-v4.1-vector --output-format svg -o logo.svg
python "$GI" "Make the sky purple" -i photo.jpg -o edited.png      # edit / reference (repeat -i)
python "$GI" "Stylised neuron network" -m bytedance-seed/seedream-4.5 --n 4 --seed 42 -o var.png
python "$GI" "A cat astronaut" --resolution 4K --dry-run           # validate, no charge
```

- Default model `google/gemini-3.1-flash-image`. Key from `--api-key`, `OPENROUTER_API_KEY` or a `.env`.
- `--n` is an upper bound; providers may return fewer. The script picks the file extension from the returned media type.
- Billing is all-or-nothing per request; a rejected parameter costs nothing.
- Errors: 401 key, 402 credits/limits, 403 permissions or moderation, 429 retry later.
- Reference images are uploaded to OpenRouter: nothing private or embargoed.

## 6. Higgsfield (CLI, paid credits)

Routes to many models behind one CLI (`higgsfield generate create <model> --prompt ... --wait`). Its defaults: GPT Image 2.5 for design/text, Nano Banana 2 (`nano_banana_flash`) for cartoon characters, Recraft V4.1 (`--model_type vector`) for logos/icons, Seedream 5.0 Pro for character sheets and face edits from photos, Soul models for consistent people. Media flags take a local path or an upload id. Prompts: under ~200 tokens, positive phrasing, describe only the change when an image is passed. `nsfw`/`ip_detected` statuses mean rephrase (no real people, trademarks).

## 7. Multi-provider batch tools

When one job needs many images from saved prompt files, use a batch runner instead of looping by hand: e.g. baoyu-image-gen (Bun; providers OpenAI, Google, OpenRouter, Replicate, Seedream, DashScope and more; `--batchfile batch.json --jobs 4`, 3 retries per image) or OpenAI's `image_gen.py generate-batch`. Keep the worker count modest (4-10) to stay under rate limits.

## 8. Cost habits

- Draft on the cheapest model/resolution; render finals once.
- Prefer references over very long prompts for consistency; fewer retries.
- Reuse backgrounds and textures across assets.
- Post-process (crop, overlay text, colour) instead of regenerating.
- Inspect per-model pricing units: per image, per megapixel and per token are not comparable without converting.

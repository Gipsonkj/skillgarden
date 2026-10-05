# Hosted models: FLUX, Replicate, fal.ai, OpenRouter, Higgsfield, Seedream on ModelArk and others

> Distilled from: flux-image-best-practices (black-forest-labs/skills, MIT), prompt-images (replicate/skills, Apache-2.0), fal-ai-media (affaan-m/everything-claude-code, MIT), generate-image (K-Dense-AI/claude-scientific-skills, MIT), baoyu-image-gen (jimliu/baoyu-skills, MIT), higgsfield-generate (higgsfield-ai/skills, MIT), image (coreyhaines31/marketingskills, MIT), bytedance-modelark (Gipsonkj/skillgarden, MIT). `scripts/bytedance-modelark/ark.py` is copied as-is from bytedance-modelark (MIT, licence beside it).

Rule one for every platform here: **list models from the API, don't trust memory**. Catalogues change weekly. Read the model's schema before sending parameters.

## 1. Which model for which job

**Pick where to run it**

| Situation | Tool | Why |
|---|---|---|
| The user already has a key, credits or a wrapper (OpenAI, Gemini, OpenRouter, fal, Replicate, Higgsfield, ModelArk, Firefly) | That one | Many models run on several of these (`gemini-nano-banana.md` §7) |
| No API key, working in Codex | Codex `image_gen` (`openai-gpt-image.md` §4) | Needs no API key |
| No account, has a GPU, or private images | Local SDXL, SD 3.5 or FLUX.2 [dev] (`local-open-models.md`) | No per-image cost; check model licences |
| Wants to compare several models with one key | OpenRouter (§5) | Free `--list-models`, `--model-info` and `--dry-run` before paying |
| Many endpoints, cost known before a batch | fal.ai (§4) | `estimate_cost` |
| Community models or a LoRA trainer | Replicate (§3) | Schema first, trainers |
| Seedream photoreal | ModelArk direct (§7) | No reseller markup |
| One CLI for many models, Soul characters, ad formats | Higgsfield (§6) | Paid credits |
| Adobe enterprise contract | Firefly Services API (`retouch-resize-upscale.md` §3) | Already licensed |
| Midjourney subscriber | Midjourney, manual (§10) | No API; the user runs the prompt |
| Many prompts from files | baoyu-image-gen or `image_gen.py generate-batch` (§8) | Retries and parallel jobs |
| Nothing set up, no preference | Ask which account or key they have before suggesting a sign-up | A new account costs them time and money |

**Then pick the model:**

| Need | First choice | Also good |
|---|---|---|
| General quality, prompt adherence | Gemini 3.1 Flash / 3 Pro, GPT Image 2.5 | FLUX.2 [pro] |
| Photorealism, art direction | FLUX.2 [max]/[pro], Seedream 4.5/5 (direct on ModelArk, §7) | Midjourney (no API; the user runs the prompt, §10) |
| Typography in the image | Ideogram 3, Recraft V4.1, FLUX.2 [flex] | GPT Image 2.5, Nano Banana Pro |
| Vector / SVG logos and icons | Recraft V4.1 vector (`svg` output) | redraw by hand as SVG |
| Brand-consistent sets | FLUX.2 multi-reference, Nano Banana Pro refs | Recraft Styles (1-10 style refs) |
| Many variants per call | Seedream 4.5 (n ≤ 10), GPT Image (n ≤ 10) | Recraft (n ≤ 6), Qwen Image 3 (n ≤ 6) |
| Seeded reproducibility | Seedream, FLUX, Krea, Qwen | (not Gemini, not OpenAI) |
| Cheapest drafts | FLUX.2 [klein] 4B, Gemini Flash Lite, Recraft V4.1 Flash, GPT Image 1 mini | Z Image |
| Inpainting with a hard mask | FLUX.1 Fill | SD inpaint (local) |
| Local / open weights | FLUX.2 [dev] (non-commercial licence; check), SDXL, SD 3.5 | see `local-open-models.md` |

The user already pays for Adobe, Canva, Photoroom or Topaz, or the job is a cutout, resize or upscale of a real photo: see `retouch-resize-upscale.md`.

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

## 7. Seedream direct on ByteDance ModelArk (`ARK_API_KEY`)

ByteDance's own API (BytePlus ModelArk), no reseller markup. A good photoreal engine, and the fallback when Gemini credits run out. Verified on one account (`ap-southeast-1`) in September 2026. The same key and script also drive Seedance video (see the ai-video skill).

```bash
A=<this-skill>/scripts/bytedance-modelark/ark.py
python3 $A models                                            # free: ids this key can see
echo "<prompt>" | python3 $A image out.jpg --size 2560x1920  # default model seedream-5-0-260128
```

- The script posts to `https://ark.ap-southeast.bytepluses.com/api/v3/images/generations` with `response_format: "url"` and `watermark: false`, downloads the signed URL at once (it expires quickly) and prints the token usage. A still cost cents (~19k tokens).
- **Canvas floor is 3,686,400 px.** `2560x1920` (4:3), `2560x1440` (16:9) and `1920x2560` (3:4) work; `2048x1536` is rejected.
- Ids are dated; `seedream-4-5` returned 404 on the tested account. Listed models may still be switched off: `ModelNotOpen` means the user activates the model in Console > Model activation (paying for a plan doesn't).
- Never put the key in chat or a file; it comes from the environment.

Recipe that read as a real phone photo on 18 of 18 shots (clean hands and faces): open with a concrete candid scene (real props, one named light source, a framing accident such as "framed from the doorway, door frame intruding at the left edge"), then append the same style block to every shot:

> Shot on a phone camera, 26mm, natural light from ONE direction only with real shadow falloff, slightly imperfect white balance, off-centre handheld framing, slight lens softness at the edges. Not a render, not a magazine shot, not symmetrical, not staged, no text, no logos.

The "not a render, not staged" clauses work as register cues, which is different from listing objects to leave out (principle 4 still holds for scene content: write "an empty room", not "no people").

## 8. Multi-provider batch tools

When one job needs many images from saved prompt files, use a batch runner instead of looping by hand: e.g. baoyu-image-gen (Bun; providers OpenAI, Google, OpenRouter, Replicate, Seedream, DashScope and more; `--batchfile batch.json --jobs 4`, 3 retries per image) or OpenAI's `image_gen.py generate-batch`. Keep the worker count modest (4-10) to stay under rate limits.

## 9. Cost habits

- Draft on the cheapest model/resolution; render finals once.
- Prefer references over very long prompts for consistency; fewer retries.
- Reuse backgrounds and textures across assets.
- Post-process (crop, overlay text, colour) instead of regenerating.
- Inspect per-model pricing units: per image, per megapixel and per token are not comparable without converting.

## 10. Midjourney (manual: Claude writes, the user runs)

Midjourney offers no API (apart from rare exceptions it grants explicitly), and its terms and community guidelines forbid automated tools and third-party apps. So Claude never drives it, and never uses third-party "Midjourney API" wrappers (they automate an account, which the terms forbid, and send the prompts and a key to someone else's service). Claude writes copy-ready prompts; the user pastes them into the Imagine bar on midjourney.com or Discord, downloads the picks into the project, and Claude checks them at 100%.

Prompt shape: the description first, then parameters at the very end, with a space before each `--` and no punctuation inside the parameters. Text to render goes in double quotes (single quotes don't work).

```text
ceramic mug on a warm cream linen tabletop, soft window light from the left, shallow depth of field, editorial product photo, "MORNING" lettered on the mug --ar 4:5 --s 100 --raw --seed 1234
```

| Parameter | What it does |
|---|---|
| `--ar W:H` | Aspect ratio (default 1:1; up to 14:1 in V8.x, 4:1 with `--hd`) |
| `--s 0-1000` | Stylize: how freely it interprets the prompt (default 100) |
| `--raw` | Raw Mode, for more control over the look |
| `--no x` | Leave out an element |
| `--seed 0-4294967295` | Same starting noise for A/B tests; not a way to keep a style or character, and unreliable in Turbo mode |
| `--sref <url>` + `--sw 0-1000` | Style reference and its weight (default 100); describe content, not "copy this style" |
| `--edit <url> ...` | V8.1/8.2 Edit model: instructions plus up to 4 reference images; replaces Omni and Character Reference. Matches the first image's ratio unless `--ar` is given |
| `--hd` / `--sd` | V8.1+ images at 2048 px or 1024 px |
| `--v`, `--niji` | Model version (default V8.2 since 24 July 2026), or the anime-focused model |
| `--tile`, `--chaos`, `--weird`, `--stealth` | Seamless pattern; more varied results; quirkier results; private creations (Pro and Mega plans) |

Sizes: V8.2 SD is 1024×1024 at 1:1 (1456×816 at 16:9), HD and upscaled 2048×2048 (2912×1632). Upscaling (Subtle or Creative) can cost twice the GPU minutes of the first generation. For print beyond that, upscale outside Midjourney (`retouch-resize-upscale.md` §6).


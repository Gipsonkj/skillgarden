# Editing, inpainting, references and consistency

> Distilled from: imagegen (openai/skills, Apache-2.0), flux-image-best-practices (black-forest-labs/skills, MIT), prompt-images (replicate/skills, Apache-2.0), baoyu-image-gen (jimliu/baoyu-skills, MIT), nano-banana-pro (steipete/agent-scripts, MIT), nano-banana (kingbootoshi/nano-banana-2-skill, MIT), stable-diffusion (NousResearch/hermes-agent, MIT), higgsfield-generate (higgsfield-ai/skills, MIT)

## 1. Label every input image

Before prompting, give each image a role and refer to it by index:

```text
Image 1: edit target (keep everything except the background)
Image 2: style reference (palette and brushwork only)
Image 3: product to insert
```

- Images supplied for "the vibe" are references → **generate** with references.
- Images the user wants changed → **edit**.
- Order matters: most APIs give the **first** image the most fidelity (GPT Image 1/1-mini favour image 1; GPT Image 1.5 keeps the first 5 at high fidelity). Put the edit target or identity source first.

Reference limits seen in sources (check the live schema, they move): GPT Image up to 16; Gemini 3 / Nano Banana up to 14; FLUX.2 [pro]/[flex]/[max] 8 (max 10 in BFL's playground), [klein] 4; Seedream up to 14; Riverflow Pro 10; Recraft 0-1 (Styles variants 1-10). FLUX.2 [pro] caps total input+output at 9 megapixels.

## 2. The edit prompt formula

```text
Change ONLY: <one change>.
Keep identical: subject, identity, pose, framing/crop, camera angle, lighting, colour palette, background, any text, overall style.
Do not add new objects.
```

Rules:
- One change per call. Chain steps for big transformations (furniture → fireplace → lighting → film look), checking after each.
- Use precise verbs: "replace the background with…", "change the jacket to…", "remove the person on the left and continue the brick wall behind them". Avoid "transform", "make it better".
- For removal, describe **what fills the gap**, not just what goes.
- Repeat the invariants on **every** iteration; drift accumulates.
- Save non-destructively: `hero-v2.png`, never overwrite the original unless asked.
- If you are refining your own output, feed the last result back as the input and describe only the delta.

## 3. Edit types and their key phrase

| Edit | Key instruction |
|---|---|
| Background replace | "keep the subject in exactly the same position, scale and lighting; only replace the environment" |
| Object remove/replace | "replace only the white chairs with oak chairs; preserve floor shadows and surrounding objects" |
| Lighting / weather / season | "change only the light and atmosphere to blue hour; keep geometry, framing and identity" |
| Style transfer | "render image 1 in the style of image 2 (palette, texture, brushwork); keep the composition; no extra elements" |
| Text replace / localise | "change 'Grinder' to 'Molino'; keep font, size, colour, spacing and layout" |
| Try-on / identity preserve | "keep face, body, pose, hair and expression from image 1; replace only the clothing with the garment from image 2; match lighting" |
| Compositing | "place the product from image 2 on the table in image 1; match perspective, scale, light direction and contact shadow" |
| Sketch to render | "preserve layout, proportions and perspective of the sketch; render as <material/lighting>; add nothing new" |
| Transparent cutout | see section 6 |
| Perspective / angle change | Hardest edit. Many models refuse to move the camera. Try a stronger model or regenerate with references. |

## 4. Masks and inpainting

- **Prompt-guided masks** (GPT Image edits, Gemini, FLUX.2): the mask is a hint; exact edges are not guaranteed. Still state the region in words.
- **True inpainting** (SD/SDXL inpaint pipelines, FLUX.1 Fill, ComfyUI): white = repaint, black = keep. Feather the mask 4-16 px for seamless blends. Describing only the masked region makes the model focus on it; describing the full scene keeps context consistent. Try both.
- Outpainting: extend the canvas, mask the new area, describe the continuation ("continue the beach and sky to the right").
- Structure-preserving edits on local models: ControlNet (canny edges, depth, openpose) keeps layout while you restyle. See `local-open-models.md`.

## 5. Consistency across a set (characters, products, brand)

Strongest to weakest:

1. **Reference images** of the subject passed into every call (2-4 clean, well-lit, different-angle refs beat 10 messy ones).
2. **Fine-tuned LoRA / trained character** (Replicate/fal trainers, ComfyUI LoRA, Higgsfield Soul ID) for long-running characters. Use the trigger word in every prompt; LoRA scale ~0.7-1.1.
3. **A locked text block**: same character sentence, same style block, same palette hex values, pasted word-for-word.
4. Seed locking (Seedream, FLUX, Krea, Qwen, SD; not GPT Image or Gemini). Same model + prompt + params + seed gives near-identical output; it does not survive model upgrades.

Identity rules (from baoyu-image-gen, which tested this hard):
- Say the references are the **same subject** and the output must use that identity: "Use the person in the reference images as the same identity; do not redesign them or create a similar-looking new person. Change only scene, clothing, pose, lighting and composition."
- Do **not** add a long facial description ("oval face, clear eyes…"). The model then builds a new person who matches the words.
- Don't feed generated outputs back as identity refs unless asked; drift compounds.
- If results get glossy/influencer-like: drop stylised refs and add "natural skin texture, no face slimming, no eye enlargement, no heavy makeup, no over-smoothing".
- For age changes, keep the face and express age through clothing, posture and setting.

Set rules:
- Build the style block first, test 3-4 variants, pick the winner, then only swap the subject line.
- Keep one "anchor" image (the approved first output) as a style reference for the rest.
- Generate each image as its own call. Don't ask for a 3x3 grid of different assets on one canvas unless you want a contact sheet; grids lower per-image detail.
- Storyboards: some models do "2x2 storyboard grid, panel 1: …, panel 2: …" well; repeat the exact character description in every panel.

## 6. Transparent backgrounds

**Pick a tool**

| Situation | Tool | Why |
|---|---|---|
| The user already uses or pays for one (Photoroom, Adobe, Topaz, an OpenAI key) | That one | No new account, key or bill |
| New image, OpenAI key | GPT Image 1 / 1.5 / 2.5 with `background=transparent` | Alpha straight from the model (not GPT Image 2) |
| New image on any other model | Green screen + `ffmpeg` key (below) | Works with every model, no extra tool |
| Real photo, no account, or private images | rembg locally: `rembg i in.png out.png` (downloads its model on first use), or BiRefNet | Free (MIT), nothing leaves the machine, good on hair |
| Product photo that also needs a surface, shadow or exact size | Photoroom `/v2/edit` or its MCP (`retouch-resize-upscale.md` §5) | All in one call; a `sandbox_` key is free but watermarked |
| Already upscaling with Topaz | Topaz `RemoveBG` on `/matting/async` (`retouch-resize-upscale.md` §6) | Cutout (default) or mask (`mode: alpha`) on the same key |
| Background swap on an Adobe account | `image_select_subject`, then `image_fill_area` if the tool is available (not on Claude per Adobe's skill) (`retouch-resize-upscale.md` §2) | Files stay in Creative Cloud |
| Icon or logo | Recraft vector (`svg`) or redraw as SVG | Real vector, no halo to clean |
| Unsure which account they have, or the photo is private client work | Ask before uploading it anywhere | Every hosted route uploads the image |

| Route | How |
|---|---|
| Native alpha | GPT Image 1 / 1.5 / 2.5 with `background=transparent` and PNG or WebP output (not JPEG). GPT Image 2 does **not** support transparent. |
| Green-screen + key | Prompt "on a flat solid chroma green #00FF00 background, no green on the subject, even lighting, no shadow", then key: `ffmpeg -i in.png -vf "colorkey=0x00FF00:0.3:0.1,despill=green" out.png`. Works with any model (nano-banana's `-t` flag automates this). |
| Background-removal model | rembg / BiRefNet locally, or a hosted remove-background endpoint. Best for photos with hair. |
| Product cutout + new background in one call | Photoroom `/v2/edit` (cutout, colour or AI surface, shadow, exact size); see `retouch-resize-upscale.md` §5 |
| Vector | For icons/logos, generate with Recraft vector models (`svg` output) or redraw as SVG. |

Always check the result has a real alpha channel (`magick identify -format '%[channels]' out.png` should show `srgba`) and no halo; inspect on dark and light backgrounds.

## 7. Exact output dimensions

**Pick an upscaler**

| Situation | Tool | Why |
|---|---|---|
| The user already uses or pays for one (Topaz, Photoroom, Midjourney, a ComfyUI setup) | That one | No new account or bill |
| Your own generated image, prompt locked | Re-render at the model's top size (Nano Banana up to 4K, Midjourney `--hd` or its upscalers) | Real detail from the model, no second tool |
| Free, no account | Real-ESRGAN (BSD-3; portable builds for Windows, Linux and macOS, 4x models) or ComfyUI `ImageUpscaleWithModel` with a 4x ESRGAN model (`local-open-models.md` §6) | Runs on this machine |
| Real photo, product shot or real people, for print | Topaz Gigapixel (`retouch-resize-upscale.md` §6) | Precision upscaler, keeps the source look |
| Degraded, compressed or AI image that needs new detail | Topaz Wonder or Bloom | Generative; check faces, labels and text at 100% |
| Photo already going through Photoroom | Photoroom MCP (upscaling is one of its jobs) | Same tool and account |
| Already on Replicate or fal | A hosted upscale endpoint; search the catalogue and read its schema | Pay per run, same key |
| Print job or paid batch, target size or budget unknown | Ask for the final size and whether to spend credits | Topaz bills per output megapixel |

- APIs snap to supported sizes. Generate at the nearest supported ratio and size up, then crop/resize to the exact pixels.
- Gemini trick (nano-banana): pass a blank image of the target size as the **last** reference and state the size in the prompt.
- Upscale for print: model upscalers (Real-ESRGAN, hosted upscale endpoints, Topaz Gigapixel via API: `retouch-resize-upscale.md` §6) then check faces/edges at 100%.

## 8. Failure fixes

| Symptom | Fix |
|---|---|
| Whole image changed when one thing was asked | Shorter edit prompt, explicit "keep identical" list, lower strength (SD img2img `strength` 0.3-0.5) |
| Identity drift | Fewer, better refs; remove descriptive face text; put identity image first |
| Elements not transferred from refs | Index explicitly ("the lamp from image 3"), reduce number of refs |
| Lighting mismatch in composites | State light direction once for all elements: "key light from upper left on everything" |
| Edit ignored | Different model; some are poor at certain edit types (removal vs style vs angle) |

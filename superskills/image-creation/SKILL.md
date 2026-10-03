---
name: image-creation
description: Create and edit images with AI models or code. Covers prompt writing for any image model; text and typography inside images; editing, inpainting, reference images, character/product consistency and transparent backgrounds; OpenAI GPT Image (Images API, Codex image_gen); Google Gemini / Nano Banana; FLUX, Replicate, fal.ai, OpenRouter, Seedream, Recraft, Ideogram, Higgsfield; local Stable Diffusion, diffusers and ComfyUI workflows; p5.js/SVG generative art; website heroes, design comps, game and UI assets; marketing, social, ad, product and brand images. Use when asked to generate an image, picture, illustration, photo, hero image, banner, thumbnail, poster, sprite, icon, texture, logo concept, mockup or OG image; to edit, restyle, remove or replace something in an image, change a background or make it transparent; to keep a character or product consistent; to write or fix an image prompt; to pick an image model; to build a ComfyUI workflow; or to make generative/algorithmic art.
---

# Image creation

This skill covers making raster images with AI models (OpenAI, Google, FLUX and other hosted models, local open models), editing them, and making images with code. It tells you which tool to use, how to write the prompt, how to keep a set consistent and how to check the result before you hand it over. Platform specifics live in the reference files. This page is the router plus the rules every image job shares.

## Core principles

1. **Pick the medium first.** Use a bitmap model for photos, illustration, concept art, textures and mockups. Use code (SVG, HTML/CSS, canvas, p5.js) for icons, diagrams, charts, logos that must stay editable, and anything that has to be exact. Use real screenshots for your real product UI, because models make up interfaces.
2. **Start from where the image will be used.** The aspect ratio, pixel size and the empty space for copy all come from where the image goes. Write that first: "4:5 Instagram post, empty top 40% for the headline".
3. **Write prose in a fixed order.** Subject → setting → style → composition → light → colour → text → constraints, as plain sentences or short labelled lines. Aim for 40-120 words. Leave out tag soup and SD-era filler (`masterpiece, 8k`).
4. **Describe what you want to see, not what you don't.** FLUX has no negative prompt, and GPT Image 2 sometimes draws the scene items you tell it to leave out. Write "empty street" instead of "no people". Negatives are still fine for text defects ("no extra text, no watermark") and in SD `negative_prompt`.
5. **Lighting and colour matter most.** Always give the light's direction and quality. Give 3-5 colours as hex codes, each with a name and the object it belongs to.
6. **Words in the image follow one rule.** Let the model render headlines of 5 words or fewer, in quotes, with a role label. Exact brand copy, prices, dates, long copy and anything for print go on as overlay type afterwards. Overlay beats in-model text whenever the words carry information, because you can spell-check and edit it. When the type itself is the artwork, render it in a text-strong model and proofread it.
7. **Edits change one thing at a time, and you list everything that must stay the same.** Use "Change ONLY X. Keep identical: …" and repeat that list every round. Never overwrite the original file.
8. **For consistency, use references before words.** Pass the same 2-4 reference images on every call and reuse one locked style block word for word. Don't write long descriptions of faces, because the model then makes up a new person to match the words.
9. **Draft cheap, finish once.** Draft at 1K, low quality, on a flash or klein model. Generate 2-4 options and choose on composition. Render the final at full resolution only after the prompt is locked.
10. **Get model facts from the API, not from memory.** Model names, sizes, prices and retirement dates change every month. List models or read the schema before you hard-code anything. The model names in these references were current in October 2026.
11. **Look at every output at 100%.** Check spelling letter by letter, hands, faces, edges, product labels, stray logos and watermarks, the aspect ratio, and whether the things that had to stay the same did.
12. **Respect rights and safety.** Leave out real public figures, trademarks and living artists' names. Invent brand names for mockups. Generated images are illustrations, not evidence. Don't upload private images to a provider. Leave safety checkers on.
13. **Save files properly.** Use descriptive, versioned file names (`hero-v2.webp`). Put final files in the project, not in a tool's temp folder. Report the final prompt, model, size and seed.
14. **Never put keys in chat.** Ask the user to set `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `FAL_KEY` or `REPLICATE_API_TOKEN` locally. If the user already has an image tool or wrapper set up, use it.

## Pick the right guide

| Task | Read |
|---|---|
| Write or improve any image prompt, choose words for light, lens and composition, check an output | [references/prompting-fundamentals.md](references/prompting-fundamentals.md) |
| Headlines, labels, posters, infographics, translating text in an image | [references/text-in-images.md](references/text-in-images.md) |
| Edit, inpaint or outpaint, swap a background, remove an object, try-on, style transfer, keep a character or product consistent, transparent PNGs, exact dimensions | [references/editing-references-consistency.md](references/editing-references-consistency.md) |
| OpenAI GPT Image (models, sizes, transparency, edits, Codex `image_gen`) | [references/openai-gpt-image.md](references/openai-gpt-image.md) + `scripts/imagegen/image_gen.py` |
| Gemini / Nano Banana (Pro, 2, Lite; 512-4K) | [references/gemini-nano-banana.md](references/gemini-nano-banana.md) + `scripts/nano-banana-pro/generate_image.py` |
| FLUX.2, Replicate, fal.ai, OpenRouter, Seedream, Recraft, Ideogram, Higgsfield; picking a model | [references/hosted-models-flux-replicate-fal.md](references/hosted-models-flux-replicate-fal.md) + `scripts/generate-image/generate_image.py` |
| Local Stable Diffusion / SDXL / FLUX dev with diffusers, ControlNet, LoRA, ComfyUI workflow JSON | [references/local-open-models.md](references/local-open-models.md) |
| Generative or algorithmic art, flow fields, particles, seeded p5.js, SVG patterns | [references/algorithmic-art.md](references/algorithmic-art.md) + `templates/algorithmic-art/viewer.html` |
| Website heroes, section images, design comps for a landing page, game sprites, UI icons, textures, web optimisation, OG images | [references/web-frontend-assets.md](references/web-frontend-assets.md) |
| Social posts, ads, product shots, posters, banners, logo concepts, brand boards, campaign series and their sizes | [references/marketing-brand-images.md](references/marketing-brand-images.md) |

You can name a task, or say "use image-creation: <capability>" (for example "image-creation: transparent sprite" or "image-creation: ComfyUI workflow").

### Bundled scripts (run them, don't rewrite them)

| Script | When to run | Needs |
|---|---|---|
| `scripts/imagegen/image_gen.py` | OpenAI generate / edit / JSONL batch from any shell; transparent PNGs; `--dry-run` to preview the request | `OPENAI_API_KEY`, `pip install openai` |
| `scripts/nano-banana-pro/generate_image.py` | Quick Gemini (Nano Banana Pro) generate or single-image edit at 1K/2K/4K | `GEMINI_API_KEY`, `uv` |
| `scripts/generate-image/generate_image.py` | Any OpenRouter model (Gemini, GPT Image, FLUX.2, Seedream, Recraft SVG…); free `--list-models` / `--model-info` / `--dry-run` before paying | `OPENROUTER_API_KEY`, Python stdlib only |

Run scripts from the user's working directory so the output lands there. Each script's folder includes the source licence.

## Default workflow

1. **Brief.** Write down the asset, where it will be used, the size and ratio, the text (if any) and how it gets onto the image, the brand inputs, and whether it's one image or a set. Ask only about things that block the work (exact copy, brand name, real person). Pick sensible defaults for the rest and say what you picked.
2. **Route.** Decide between bitmap, code and screenshot, then pick the model with the tables above (default: GPT Image 2.5 or Nano Banana 2 for general work; FLUX.2 or Seedream for photoreal; Recraft for vector; a local model for privacy or volume).
3. **Prompt.** Use the fixed order from principle 3, add the composition and empty space the layout needs, give colours as hex and lock a style block for sets. For an edit, label every input image by number and role.
4. **Draft.** Make 2-4 cheap variants and choose on composition.
5. **Refine.** Change one thing per round, through targeted edits or a re-prompt that changes one thing. Re-state the things that must stay the same each round.
6. **Finish.** Render at full resolution, add overlay text, cut out the background or upscale if needed, and export to the exact pixel size and format (WebP for web, PNG for alpha, SVG for vectors).
7. **Check and deliver.** Run the checklist below. Save to the project with a descriptive name, and report the path, model, final prompt and any seed.

## Done means

- [ ] Right medium and model for the job; the image doesn't fake a real UI, person or brand
- [ ] Exact pixel size and format for where it's used; web files compressed (hero < 300 KB)
- [ ] Every rendered word correct letter by letter; text contrast ≥ 4.5:1; no stray text, logos or watermarks
- [ ] Hands, faces, edges and product labels clean at 100% zoom
- [ ] For edits: the things that had to stay the same did, and the original file is untouched
- [ ] For sets: same style block, palette and light on every image; each one reads as part of the same family
- [ ] Final file saved in the project; prompt, model, settings and seed reported

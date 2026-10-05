---
name: image-creation
description: Create and edit images with AI models or code: prompts for any image model, text in images, edits, inpainting, backgrounds, consistent characters and products; GPT Image, Nano Banana, FLUX, Seedream, Recraft, Ideogram, Midjourney, Firefly, Photoshop, Canva, ComfyUI and Stable Diffusion; generative art. Use when asked to generate or edit an image, photo, illustration, icon or mockup, write an image prompt, pick a model, or resize, compress or upscale an image. Posters and logos: poster-design.
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
14. **Never put keys in chat.** Ask the user to set `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `FAL_KEY`, `REPLICATE_API_TOKEN` or `ARK_API_KEY` locally. If the user already has an image tool or wrapper set up, use it.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Launch hero, social set and a teaser clip: `references/prompting-fundamentals.md` → `references/web-frontend-assets.md` → `references/marketing-brand-images.md` → `references/editing-references-consistency.md`; headline copy from `content-creation` → `references/conversion-copy.md`; the clip from `ai-video` → `references/generative-prompting.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Write or improve any image prompt, choose words for light, lens and composition, check an output | [references/prompting-fundamentals.md](references/prompting-fundamentals.md) |
| Headlines, labels, posters, infographics, translating text in an image; pick a text model or overlay tool | [references/text-in-images.md](references/text-in-images.md) |
| Edit, inpaint or outpaint, swap a background, remove an object, try-on, style transfer, keep a character or product consistent, transparent PNGs, exact dimensions; pick a cutout or upscale tool | [references/editing-references-consistency.md](references/editing-references-consistency.md) |
| OpenAI GPT Image (models, sizes, transparency, edits, Codex `image_gen`) | [references/openai-gpt-image.md](references/openai-gpt-image.md) + `scripts/imagegen/image_gen.py` |
| Gemini / Nano Banana (Pro, 2, Lite; 512-4K) | [references/gemini-nano-banana.md](references/gemini-nano-banana.md) + `scripts/nano-banana-pro/generate_image.py` |
| FLUX.2, Replicate, fal.ai, OpenRouter, Seedream (also direct on ByteDance ModelArk, phone-photo realism recipe), Recraft, Ideogram, Higgsfield, Midjourney prompts; picking a model and where to run it | [references/hosted-models-flux-replicate-fal.md](references/hosted-models-flux-replicate-fal.md) + `scripts/generate-image/generate_image.py`, `scripts/bytedance-modelark/ark.py` |
| Local Stable Diffusion / SDXL / FLUX dev with diffusers, ControlNet, LoRA, ComfyUI workflow JSON | [references/local-open-models.md](references/local-open-models.md) |
| Generative or algorithmic art, flow fields, particles, seeded p5.js, SVG patterns | [references/algorithmic-art.md](references/algorithmic-art.md) + `templates/algorithmic-art/viewer.html` |
| Website heroes, section images, design comps for a landing page, game sprites, UI icons, textures, web optimisation, OG images | [references/web-frontend-assets.md](references/web-frontend-assets.md) |
| Social posts, ads, product shots, posters, banners, logo concepts, brand boards, campaign series and their sizes; pick a resize tool | [references/marketing-brand-images.md](references/marketing-brand-images.md) |
| Finish a real photo in pro tools (pick one): Adobe (Photoshop, Lightroom, Express, Firefly API), Canva, Photoroom cutouts and surfaces, resize to placements, Topaz upscaling | [references/retouch-resize-upscale.md](references/retouch-resize-upscale.md) |

You can name a task, or say "use image-creation: <capability>" (for example "image-creation: transparent sprite" or "image-creation: ComfyUI workflow").

### Bundled scripts (run them, don't rewrite them)

| Script | When to run | Needs |
|---|---|---|
| `scripts/imagegen/image_gen.py` | OpenAI generate / edit / JSONL batch from any shell; transparent PNGs; `--dry-run` to preview the request | `OPENAI_API_KEY`, `pip install openai` |
| `scripts/nano-banana-pro/generate_image.py` | Quick Gemini (Nano Banana Pro) generate or single-image edit at 1K/2K/4K | `GEMINI_API_KEY`, `uv` |
| `scripts/bytedance-modelark/ark.py` | Seedream 5.0 stills straight from ByteDance (`image out.jpg --size 2560x1920`, prompt on stdin); free `models` listing first | `ARK_API_KEY`, Python stdlib only |
| `scripts/generate-image/generate_image.py` | Any OpenRouter model (Gemini, GPT Image, FLUX.2, Seedream, Recraft SVG…); free `--list-models` / `--model-info` / `--dry-run` before paying | `OPENROUTER_API_KEY`, Python stdlib only |

Run scripts from the user's working directory so the output lands there. Each script's folder includes the source licence.

## Other crafts

| When the request also needs | Use |
|---|---|
| Turning a still into a video clip, or animating between keyframes | `ai-video` → `references/generative-prompting.md`, `references/vendor-apis.md` |
| A shot-by-shot story with the same characters, planned before any keyframes | `storyboarding` → `references/shot-lists-and-boards.md`, `references/keyframes-and-consistency.md` |
| A finished poster, cover or banner where layout and type carry the design | `poster-design` → `references/foundations.md`, `references/ai-image-posters.md`, `references/banners-social.md` |
| A final logo, brand kit or favicon set (beyond the logo concepts in `references/marketing-brand-images.md`) | `poster-design` → `references/logos.md`, `references/brand-kits.md`, `references/web-assets.md` |
| Ad angles, ad copy and platform specs around the image | `ad-creation` → `references/creative-strategy.md`, `references/ad-copywriting.md`, `references/platform-specs.md` |
| Headline or overlay copy that has to sell | `content-creation` → `references/conversion-copy.md` |
| The page around a hero or section image: layout, type and tokens | `frontend-ui-design` → `references/design-direction.md`, `references/visual-system.md` |
| Captions, hashtags and a posting plan for the social images | `social-media` → `references/platform-playbook.md`, `references/hooks-and-voice.md` |
| Hosting open image models on your own or rented GPUs: VRAM, quantization, RunPod or Modal | `open-models` → `references/gpu-hosting-runpod-modal.md`, `references/vram-and-sizing.md` |
| Turning an image into a 3D model or a printable part | `3d-modeling` → `references/generative-3d.md`, `references/meshy-tripo.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| GPT Image 2 style and scene templates with example cases and pitfalls | [gpt-image-2-style-library](https://github.com/freestylefly/awesome-gpt-image-2/tree/main/agents/skills/gpt-image-2-style-library) (MIT; its template library wasn't copied here) |
| Search, price and run any of 1,200+ fal endpoints, including queued async jobs | [genmedia](https://github.com/fal-ai-community/skills/tree/main/skills/genmedia) (MIT, stated in README; needs the genmedia CLI and `FAL_KEY`) |
| Larger ComfyUI graphs (LoRA stacks, upscaling, face detailing) with its sibling API and troubleshooting skills | [comfyui-workflow-builder](https://github.com/mckruz/comfyui-expert/tree/master/skills/comfyui-workflow-builder) (MIT) |
| Gemini SDK code beyond images (video, TTS, multimodal) from Google's own skill | [gemini-api-dev](https://github.com/google-gemini/gemini-skills/tree/main/skills/gemini-api-dev) (Apache-2.0) |
| One tool across many providers, including DashScope, with batch runs from prompt files | [baoyu-image-gen](https://github.com/jimliu/baoyu-skills/tree/main/skills/baoyu-image-gen) (MIT; Bun or Node runtime) |
| Category templates (posters, typography, promo) and a validator for GPT Image 2 prompts | [image-prompt](https://github.com/gongnyang/gongnyang-prompt-kit/tree/main/skills/image-prompt) (MIT; Korean-language) |

## Default workflow

1. **Brief.** Write down the asset, where it will be used, the size and ratio, the text (if any) and how it gets onto the image, the brand inputs, and whether it's one image or a set. Ask only about things that block the work (exact copy, brand name, real person). Pick sensible defaults for the rest and say what you picked.
2. **Route.** Decide between bitmap, code and screenshot, then pick the model with the tables above (default: GPT Image 2.5 or Nano Banana 2 for general work; FLUX.2 or Seedream for photoreal; Recraft for vector; a local model for privacy or volume). Only then open that one model's guide, and only the section you need.
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

# Prompting fundamentals (any model)

> Distilled from: imagegen (openai/skills, Apache-2.0), prompt-images (replicate/skills, Apache-2.0), flux-image-best-practices (black-forest-labs/skills, MIT), image-prompt (gongnyang/gongnyang-prompt-kit, MIT), image (coreyhaines31/marketingskills, MIT), generate-image (K-Dense-AI/claude-scientific-skills, MIT), higgsfield-generate (higgsfield-ai/skills, MIT), nano-banana-pro (steipete/agent-scripts, MIT)

These rules hold for every modern model (GPT Image, Gemini / Nano Banana, FLUX.2, Seedream, Recraft, Ideogram). Model-specific tweaks live in the vendor files.

## 1. Decide before you write

| Question | Why it matters |
|---|---|
| Is this a bitmap at all? | Icons, diagrams, wireframes, charts and logos that must stay editable are better as SVG/HTML/canvas. Generate a bitmap only for photos, illustrations, textures, concept art, mockups. |
| New image or edit? | Images given "for style/mood" are **references** (generate). Images the user wants changed are **edit targets** (see `editing-references-consistency.md`). |
| Where will it be used? | Sets aspect ratio, resolution, polish level and where empty space goes. "Landing-page hero, 16:9, copy on the left third" beats "a nice image". |
| Does it need text? | Decide now how the words get on (see `text-in-images.md`). |
| One asset or a set? | A set needs a locked style block before the first prompt. |

## 2. The prompt order

Front-load what matters. Models weight early words more (BFL measured this for FLUX; it holds broadly).

1. **Format and use**: "16:9 blog hero", "1:1 app icon", "4:5 Instagram post".
2. **Subject and action**: who/what, how much of it, doing what. Name subjects directly ("the woman in the navy blazer"), never "she/it".
3. **Setting / backdrop**.
4. **Style / medium**: photo, flat vector, watercolour, clay 3D render, risograph.
5. **Composition**: shot size, angle, where the subject sits, where the empty space is.
6. **Lighting and colour**: direction + quality of light, 3-5 colours as hex with a name.
7. **Materials / texture**: matte plastic, brushed steel, film grain, paper texture.
8. **Text** (verbatim, quoted) if any.
9. **Constraints**: what must stay or must not appear.

For complex requests, short labeled lines beat one long paragraph (OpenAI's spec format):

```text
Use case: product-mockup
Asset type: landing page hero
Primary request: a ceramic coffee mug, minimal
Scene/backdrop: warm light-grey seamless studio sweep
Style/medium: clean product photography
Composition/framing: mug in right third, wide empty area left for headline
Lighting/mood: large softbox from the left, soft shadow to the right
Color palette: #F2EFEA (warm off-white), #2F3A2F (deep green mug)
Constraints: no logos, no text, no watermark
```

For simple scenes, one to three sentences of plain prose is enough:

> A weathered fisherman in his 70s in a navy cable-knit sweater at the helm of a wooden boat. Golden-hour sun from the left rims his profile; harbour lights blur softly behind him. Shallow depth of field, warm film colour.

## 3. Rules with numbers

| Rule | Value |
|---|---|
| Default prompt length | 40-120 words. Under 15 words gives generic results; past ~200 words details start to drop. |
| Long structured prompts | OK (up to several hundred words) only for dense layouts on GPT Image / Nano Banana Pro: posters, infographics, UI. List every requirement once. |
| Colours | 3-5 hex values, each with a name and the object it applies to: `#E94560 (hot pink) neon sign`. |
| Variations to judge | Generate 2-4, choose on composition first. Details can be edited; a weak composition can't. |
| Iteration | Change one thing per round. Keep a log of the prompt that worked. |
| Draft vs final | Draft at the cheapest tier (1K / low quality / flash or klein model); render the final only after the prompt is locked. |

## 4. Write prose, not tag soup

- Full sentences beat comma-separated keyword lists on every current model.
- Drop SD-era filler: `masterpiece, best quality, 8k, 4k, ultra-detailed, trending on artstation`, `(word:1.3)` weights, `--ar` flags. They do nothing on modern models and sometimes render as noise. Only SD 1.5/SDXL pipelines still respond to weights (see `local-open-models.md`).
- Replace empty adjectives ("beautiful", "stunning", "premium", "award-winning") with what makes it so: "generous negative space, one hero object, soft key light, 2 colours".

## 5. Say what you want, not what you don't

- FLUX has no negative prompt, and GPT Image 2 tends to *render* scene negatives ("no crowd" can add a crowd). Rephrase positively:

| Instead of | Write |
|---|---|
| no people | empty, uninhabited street |
| no blur | tack-sharp throughout |
| no clutter | a single object on a clean seamless backdrop |
| no glasses | bare face, eyes clearly visible |
| no text on the shirt | plain solid-colour t-shirt |

- Two exceptions where short negatives are fine: (a) **text-defect guards** on GPT Image / Gemini ("no extra text, no watermark, no logo"); (b) the `negative_prompt` field on Stable Diffusion-family pipelines.

## 6. Photographic and lighting language

Describe the **result**, optionally anchored with a camera term. GPT Image does not reliably know gear names; FLUX and Gemini respond well to them. Pairing works everywhere: "85mm portrait look, background falls off into creamy blur".

| Want | Words that work |
|---|---|
| Separation from background | shallow depth of field, f/1.8 look, creamy bokeh |
| Everything sharp | deep focus, f/11 look |
| Compression | telephoto, flattened planes |
| Space and scale | 24mm wide, low angle, environment fully visible |
| Even commercial light | large softbox, high key, gentle shadows |
| Drama | single hard key from the side, low key, deep shadows; Rembrandt lighting |
| Edge glow | rim light / backlight, cool rim + warm key |
| Mood light | golden hour, blue hour, overcast flat light, volumetric haze |
| Film colour | "warm skin, pastel midtones, soft highlight roll-off" (Portra look); "high-contrast mono, visible grain" (Tri-X look) |

Lighting is the single biggest quality lever (BFL). Always state direction and quality.

Composition words: rule of thirds, centered symmetric, top-down flat lay, close-up/macro, wide establishing, eye level / low / high angle, leading lines, "empty sky in the top 40% for a headline".

## 7. Augment only as much as the request needs

- Detailed user prompt: normalise it into the spec, add nothing creative.
- Vague prompt ("a hero image for my bakery"): add composition, light, palette and intended use. Do **not** invent extra characters, props, slogans, brand colours or story beats the user didn't imply.
- Ask a question only when a missing detail blocks success (exact text, brand name, real person). Otherwise pick sane defaults and say what you chose.

## 8. Safety and rights

- No real public figures, trademarks, branded characters or living artists' names; describe traits instead ("visible brushstrokes, thick impasto, swirling skies").
- Invent brand names for mockups; never fake a real company's logo.
- Generated images are illustrations, never evidence: don't present them as photos of real events, data, microscopy or products that don't exist. Label them in captions where it matters.
- Reference images are uploaded to the provider. Don't send private, embargoed or sensitive images.

## 9. Check every output (actually look at it)

Open the file and check, at 100% zoom:

- [ ] Subject, count and placement match the prompt
- [ ] Aspect ratio and size are what the placement needs
- [ ] Every rendered word is spelled right, letter by letter
- [ ] Hands, faces, product shapes and edges are clean
- [ ] Nothing invented: stray text, logos, watermarks, extra objects
- [ ] Invariants held (for edits)

If one thing is wrong, fix it with a targeted edit or a one-change re-prompt, not a full rewrite.

## 10. Pitfalls

1. "Transform the person into a Viking" swaps identity; say "change her outfit to Viking armour, keep her face and expression".
2. Forgetting aspect ratio: you get a square you have to crop.
3. Asking for "a logo in the bottom right": placement of small marks is unreliable; composite it later.
4. Asking a model for your real product UI: it hallucinates the interface. Use real screenshots.
5. Too-high CFG/guidance (where exposed): burnt, over-contrasted images. Lower it.
6. Expecting live knowledge: models don't know today's news (FLUX.2 [max] with grounding search is the exception).
7. Fighting a model on a task it's bad at: switch model instead (text → Ideogram/Recraft/FLUX.2 [flex]/GPT Image; vector → Recraft).

> Distilled from: flux-3-product-ads (black-forest-labs/skills, MIT), higgsfield-product-photoshoot (higgsfield-ai/skills, MIT)

# Vendor notes: FLUX 3 (Black Forest Labs) and Higgsfield

Both are paid services that need the user's own account and key. Ask before spending credits, never install a CLI without the user's go-ahead, and never ask the user to paste a key into chat (use an environment variable they set). The provider-agnostic method is in [ai-ad-production.md](ai-ad-production.md); this file adds what is specific to each tool.

## FLUX 3 product ads (BFL API)

**Needs**: a BFL API key. Video endpoint `/v1/flux-3-video` (submit, poll, download). BFL's companion skills `flux-3-generate`, `flux-3-keyframes-continuation` and `flux-3-audio-dialogue` hold the route details; check BFL docs (docs.bfl.ml) for current parameters.

**Reference stills first (FLUX 2).**
- With a real product photo: make it the canonical still and generate other angles with FLUX 2 `input_image` identity carry, seeded so the pack is reproducible.
- Write named invariants anyway, read off the photo: each one names the right form and the wrong form it gets confused with ("base: shallow dome, not a flat puck with a vertical wall"). These drive the identity check later.
- If the model keeps building the same different design across every angle (a "coherent refusal"), rewrite the spec to what it reliably builds. Fighting it costs jobs and loses.
- Check identity across the whole pack against one canonical still, not one still at a time.

**Video (FLUX 3 i2v).**
- Shot count ≈ length ÷ 4.5 s (12 s → 3 plates, 30 s → 6, 60 s → 11).
- Name the contact shadow and reflection in every prompt.
- Arriving objects: keyframe contains the object, generate it lifting away, reverse with `ffmpeg -vf reverse`. Re-derive timing after reversing: the action moves to the other end of the clip.
- Give risky shots a `hard_prompt` and a safe `prompt` in the same brief; generate both.

**Voice-over from FLUX 3.**
- Harvest VO from audio-only jobs (a voice-booth scene, picture discarded). Don't use native picture audio in a finished spot.
- `duration` sets tempo, not an estimate: the read stretches to fill exactly what you ask (27 words at 11 s = 2.45 words/s; at 18 s = 1.5 words/s, which drags). Set `duration = words / rate` with 2.1-2.5 words/s. Don't pad for breathing room.
- One audio job caps at 20 s (~45 words). Longer reads: one paragraph per job, trimmed and joined at a designed pause. Past ~20 s add a music bed (audio-only job, looped with crossfade, kept quiet and ducked under the VO).
- Screen takes by word error rate; fold digits both ways ("P2" vs "P two"); score invented brand names phonetically.
- Measure each take's noise floor (`astats`) and set silence detection a few dB above it (floor + 6 dB worked; a fixed -45 dB found nothing on a -33 dB take).

**Assembly.** ffmpeg covers cuts, dissolves, captions, scrims, fades, loudness and muxing. Use Remotion when the end card becomes real layout work (web fonts, data-driven variants, many sizes); it needs a paid company licence at 4+ people and does no loudness normalisation, so master audio in ffmpeg first. Keep the timing measurement in one place so either renderer can consume it.

**Loudness.** Use the normaliser's first-pass report of what's reachable under the peak ceiling and gate against that. A peak-limited stem at -21 LUFS can't reach -14 without blowing the ceiling; don't lower the target until the gate goes green.

## Higgsfield product photoshoot (Higgsfield CLI)

**Needs**: the `higgsfield` CLI and a logged-in account (`higgsfield auth login`, interactive, done by the user). Images are generated on GPT Image 2 via Higgsfield's prompt enhancer; let the backend assemble the prompt instead of writing it yourself.

```bash
higgsfield product-photoshoot create \
  --mode lifestyle_scene \
  --prompt "cold-brew bottle on a sunlit kitchen counter, IG feed" \
  --image bottle.jpg \
  --count 3
```

| Mode | Use for |
|---|---|
| `product_shot` | Studio, white, catalog, Shopify |
| `lifestyle_scene` | Product in use, real setting |
| `closeup_product_with_person` | Hands, application, demonstrating |
| `moodboard_pin` | Vertical 2:3 Pinterest |
| `hero_banner` | Wide website/email header |
| `social_carousel` | 3-10 slides, one locked visual system |
| `ad_creative_pack` | Coordinated static variants for Meta/TikTok/Pinterest/Google |
| `virtual_model_tryout` | Product worn by an AI model |
| `conceptual_product` | Levitating, splash, CGI, surreal |
| `restyle` | Change the mood/season of an existing image |

- Pick the most specific mode: "Pinterest pin of my product on a counter" → `moodboard_pin`; "carousel of my product in scenes" → `social_carousel`.
- Ask at most 3-4 short questions with labelled options: how many (1/3/5), style (studio / lifestyle / conceptual / with model), where used (Shopify / Instagram / Pinterest / paid ads / website hero), brand colours. Skip anything obvious.
- Ask for a product photo; text-only descriptions give much lower fidelity.
- `--count` 1-10; variants differ in preset, light, angle and palette. `--aspect_ratio` only when the user asks (1:1, 4:5, 5:4, 3:4, 4:3, 2:3, 3:2, 9:16, 16:9). Use 2k resolution.
- Deliver the image URLs as a short list. Don't paste internal prompts or IDs.

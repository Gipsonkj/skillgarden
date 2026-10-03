> Distilled from: ad-creative (coreyhaines31/marketingskills, MIT; its motion-video method credits Borja and Bomx's super-video-maker recipe), flux-3-product-ads (black-forest-labs/skills, MIT), higgsfield-product-photoshoot (higgsfield-ai/skills, MIT)

# AI image and video for ads (provider-agnostic)

How to produce ad visuals with image and video models without shipping slop or false claims. Vendor commands (FLUX 3 API, Higgsfield CLI) are in [vendor-flux-higgsfield.md](vendor-flux-higgsfield.md). Sizes: [platform-specs.md](platform-specs.md).

## Pick the tool by the job

| Need | Use | Why |
|---|---|---|
| Static ad with headline text baked in | A text-strong image model (Nano Banana Pro / Gemini image, Ideogram, GPT Image) | Legible type in-image |
| Same product or person across 20+ variants | A model with multi-image reference (FLUX 2 with up to 8 references, Gemini with reference images) | Identity holds across scenes |
| Product photo into lifestyle scenes | Image edit from the real product photo | Faithful product |
| Short exploratory video | Image-to-video (Veo, Kling, Runway, Seedance, FLUX 3 video) | Motion from an approved still |
| Same template, many data rows (prices, names, sizes) | Code video (Remotion, HyperFrames, ffmpeg) | Deterministic, exact brand, near-free per render |
| Voice-over | TTS (ElevenLabs, OpenAI TTS, Gemini TTS, Cartesia) | Separate VO track you control |

Hybrid that scales: generate hero creative with models, find the winner, rebuild it as a code template, render variants from data.

Rough costs (late 2026; check current pricing): stills $0.01-0.25 each; image-to-video $0.15-0.40 per second; a 30 s fully generated motion ad $3-6 in API calls.

## Rules that apply to every generated ad

1. **Real product in, not described product.** If the product exists, start from its photo and generate other angles from it. Writing a paragraph describing it invites the model to invent a different product.
2. **Approve the still before any video.** Image-to-video treats the first frame as literal; every flaw in the still is copied into every clip.
3. **Lock a series.** Generate frame 1, approve it, then pass it as a reference for every later frame so the set reads as one campaign. One visual style per campaign.
4. **Size in the prompt.** Generate each aspect ratio natively (9:16, 4:5, 1:1) rather than cropping one master when composition matters.
5. **Text the model can render.** Keep in-image labels to 1-4 words. If a label comes back garbled, shorten it and regenerate. Put longer copy in the ad's text fields or overlay it in code.
6. **Never let the model write claims.** On-screen text needs evidence: *seen* (visible in the shot), *spec* (from the product spec), or *said* (in the approved VO). A label with no evidence doesn't ship. "Cold-forged" or "two-stage lock" invented by the model are false claims.
7. **Proof in nouns and numbers.** "38 litres", "stainless body", "walnut sleeve" beat "generous", "premium", "smooth".
8. **Don't AI-generate app UIs or platform chrome.** Build them as HTML mocks of the real app and screenshot them.
9. **Disclose.** Meta and TikTok label AI-generated media; AI avatars and synthetic people need disclosure. Never generate fake reviews, fake press, or a real person's likeness without rights.

## Static product ad prompts

Include: product (from reference), scene, light, camera, composition, the one claim the image proves, aspect ratio and pixel size, where text will sit (keep that area quiet), and the contact shadow and reflection under the product. Without a named shadow, products look pasted on.

Modes worth knowing (most product-photo tools offer them): clean studio/catalog, lifestyle in use, close-up with hands, Pinterest-style vertical pin (2:3), wide hero banner, multi-slide carousel with one locked visual system, model try-on, conceptual (levitating, splash, surreal), and restyle (seasonal or aesthetic change of an existing image).

## Video shot design

- **Short spots: reveal → proof → payoff.** Reveal the object, show it doing the one thing the copy claims, land the brand.
- **Shot count ≈ spot length ÷ 4.5 s, rounded up.** A generated clip yields about 4-5 s of usable middle. Measured: 12 s took 3 shots, 30 s took 6, 60 s took 11. Too few shots means the cut fails outright.
- Longer spots: hook on the material → whole object → detail → mechanism → state change → what it does for you → brand. Each beat earns its own shot.
- **Motion that works**: light travelling across a static object (most reliable), a lid opening slightly, a handle rising and stopping, a short arc of rotation.
- **Motion that fails**: multiple full rotations, two bodies rotating at once, anything that makes the model invent geometry it hasn't seen (the far side of a crank, a new object entering).
- **Object must arrive in frame?** Put it in the keyframe, generate it *leaving*, and reverse the clip. Prompt detail does not fix invention; removing the invention does. After reversing, re-derive any timing anchored to the action.
- "Locked camera" in a prompt is advisory. Design shots that survive slight drift.
- For a risky shot, generate a hard version and a safe version in the same round and keep both.

## Faceless motion ads (poster stills that move)

A 15-45 s concept ad from nothing: styled poster still per beat → subtle image-to-video motion → TTS narration → word-timed captions.

1. **Script** 3-6 beats, 20-45 s of VO, one idea per beat, calm and specific, one CTA line at the end.
2. **Stills**: one per beat in one style, using the series lock above. The still carries the idea; motion only makes it breathe.
3. **Animate** each still 5-8 s. Motion prompt: "Subtle living motion of the existing elements only. [One literal motion tied to the concept.] [One ambient motion: slow push-in, accents drift.] The composition stays exactly as it is."
4. **VO + captions**: one continuous TTS take, transcribe with word timestamps, cut beats at sentence boundaries, burn 2-3-word caption groups.
5. **Assemble**: trim beats to their VO spans (hold the last frame to pad), loudness-normalise to I=-16 LUFS, TP=-1.5 dB, LRA=11, export each aspect.

Style families that animate well: screen-print collage, flat vector explainer, papercraft diorama, pop-art comic, claymation; and brand-token styles where you fill FIELD (ground colour), INK (line/type colour), ACCENT (one brand colour, one element per frame) and TYPE FEEL: monoline editorial, Swiss typographic, dark wireframe with one glowing accent, duotone screenprint.

Gotchas:
- Video models add photoreal "maker hands" on handling motions. Saying "no hands" makes it worse. Describe motion as belonging to the objects.
- QC the final 2 seconds of every clip; that is where intruding objects and style drift appear. Trim or regenerate.
- One dominant motion per beat; two read as chaos at feed speed.
- TTS and transcription disagree on sound-alikes ("laws" vs. "loss"); check the transcript against the script before burning captions. Invented brand names need phonetic matching.
- Keep captions (~60% height) clear of the in-poster label (~80% height).
- Put the brand/label in the poster itself so it survives muted autoplay.

## Voice-over

- Generate VO in the same round as picture: the VO sets the spot length.
- Generate at least 2 scripts × 2 voices so there is a real choice. Generate picture silent.
- Screen takes by machine (word error rate vs. script), then a human listens. Machines can't approve pronunciation.
- Find the end of speech by energy at a measured noise floor, not the transcriber's last word timestamp, or you clip the last word.

## Assembly and QC gates

Assemble deterministically from a manifest of content (which shots, which VO, which copy); derive cut points and timings from the media. No model calls after generation.

Gate on:
- Duration, resolution, fps, audio present, loudness and true peak.
- **Clipped tail**: energy in the last 0.25 s before the fade. Give every spot a real ending (pad + fade) or this gate can't work.
- **Black frames** in the body (excluding the intended fade).
- **Grounding**: crop the product's base mid-shot; is the contact shadow there?
- **Interior frames**: sample several points, not just first and last; geometry decays in the middle.
- **Semantic check**: does each shot show the right thing? Signal gates pass a pen whose ink runs ahead of the tip. Compare each shot to the canonical still on named features ("one knurled ring at the front, not on the post"), twice per feature.
- **Test the gate on a known-bad file** before trusting it.
- Never let a failed step's stale output feed the next step; use run-scoped file names.

End cards: measure the luminance where text will sit and add a scrim only if needed; run gradients to the frame edge. Ease camera moves and end on a hold. Use a small edit vocabulary with a reason for each: hard cut between views of the same object, short dissolve for a change of scale, a two-frame flash into the payoff.

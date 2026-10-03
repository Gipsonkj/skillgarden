# Prompting video models (any vendor)

> Distilled from: video + ai-video-prompting (coreyhaines31/marketingskills, MIT); ltx2 (digitalsamba/claude-code-video-toolkit, MIT); gemini-omni-flash-api (google-gemini/gemini-skills, Apache-2.0); vox-director prompt-guide and beat-layer (Alisa0808/vox-director, MIT); flux-3-video (black-forest-labs/skills, MIT); video-generation (bytedance/deer-flow, MIT); rw-generate-video (runwayml/skills, MIT).

Vendor calls live in vendor-gemini-omni.md, vendor-apis.md and vendor-heygen-avatars.md. This file covers the prompt and the shot plan.

## 1. Pick the mode

| Mode | Use when | Control |
|---|---|---|
| Text-to-video (t2v) | No reference exists; exploring | Lowest; most re-rolls |
| Image-to-video (i2v, first frame) | You have or can make the still | High; the still fixes composition, palette, text |
| First + last frame | A transition between two known states; a loop (same image twice) | High |
| Reference-to-video (style/character/object refs) | Keep a character or product consistent across shots | Medium-high |
| Video-to-video edit | Restyle or change one thing in an existing clip | Keep prompts short |
| Extend | Continue a clip | Uses the last seconds as context |

Default: make a strong still first (an image model; the image skills own that), then i2v. It is cheaper per good take and keeps the look consistent. Iterate stills at about $0.08 rather than animating weak images at $0.10 to $0.40 a clip.

## 2. Prompt formula

`[subject] + [action] + [camera move] + [style] + [lighting/mood] + [what stays still] + [audio] + [tech]`

Keep it to 50 to 100 words (LTX and others tolerate up to about 200; Runway prefers under 100). Write prompts in English even for non-English videos.

```
Close-up of hands typing on a mechanical keyboard on a walnut desk.
Slow push-in, camera otherwise steady. Shallow depth of field,
warm desk-lamp light, cozy evening mood. Background static.
Sound: soft key clicks, faint rain on the window. No dialogue, no text.
```

For i2v, prompt the motion, not the picture (the image already says what is there): "very slow push in, steam rises from the cup, background static, text stays sharp and fixed".

## 3. Camera vocabulary

| Term | Effect |
|---|---|
| static / locked-off | No move; let a stat or quote land |
| push in / slow dolly in | Builds focus or tension |
| pull out | Reveal, big picture, good ending |
| pan left/right, tilt up/down | Rotate horizontally/vertically |
| tracking shot | Follow a moving subject |
| orbit | Circle the subject (warps flat art) |
| crane / aerial / drone | Rise or descend |
| handheld | Subtle shake, documentary feel |
| zoom | Lens zoom, not a dolly |
| parallax | Layers slide at different speeds |

Rules:
- **One camera move per clip.** Two moves in 5 s usually warps.
- Always state the move or "static". With no direction you get random drift.
- Flat art, posters, collages and anything with text: only uniform translate or scale (static, push in, pull out, pan, tilt, parallax). Orbit, dolly zoom, roll and whip warp perspective and smear text. Use them only with loose constraints and plan to re-roll.
- Vary the move between adjacent shots; never repeat the same move three times running; use static on the payoff.

## 4. Style keywords that models understand

| Register | Keywords |
|---|---|
| Cinematic | cinematic color grading, anamorphic, shallow depth of field, 35mm film, film grain |
| Commercial | clean commercial lighting, bright and airy, even diffused light |
| Documentary | handheld, natural light, candid, observational camera |
| Social | vertical 9:16, high contrast, saturated |
| Photoreal | photorealistic, natural lighting, shot on a cinema camera (not just "realistic") |
| Paper collage | hand-cut paper, torn edges, tape, halftone dots, printed texture, NOT 3D, NOT CGI |

## 5. Text, logos and faces

- Models misspell or smear text. Put exact copy, brand names and logos in a code layer (HyperFrames/ffmpeg overlay) on top of the clip.
- If text must be in the frame (a sign, a poster), bake it into the still with an image model (they render text better), keep it to 1 to 3 words, and protect it in the motion prompt ("headline text stays fixed and sharp, no morphing").
- Gemini Omni can render short text on request. Still verify every frame that carries it.
- About 30% of some open-model generations (LTX) show stray logos or watermarks from training data: change the seed.
- Real celebrities and brand logos are blocked by several models (Gemini Omni, Seedance). Don't try to get around a block. Use licensed footage, your own consented likeness, or a code-built graphic.

## 6. Timing inside a clip

Natural language works ("after 3 seconds a woman enters"), and so does timecode:

```
[0-3s] A person walks toward camera
[3-6s] They stop and turn around
[6-10s] They start running
```

Without "single continuous shot, no scene cuts", some models (Gemini Omni) cut between several shots on their own.

## 7. Negative prompts and constraints

- Generic negative (where supported): worst quality, blurry, jittery, warping, watermark, text, logo.
- Add "no dialogue", "no extra sound effects", "no embellishments" when the model adds them unasked.
- Defect guards for flat art: "flat 2D, elements move one way, no morphing, faces unchanged".
- Edits: keep prompts short and end with "Keep everything else the same." Long edit prompts cause unintended changes.

## 8. Consistency across shots

- Reuse one **style block** verbatim in every prompt; change only scene, background colour and headline. This is what makes 6 beats feel like one film.
- Lock wardrobe or subject description explicitly ("a cream knitted sweater and charcoal trousers") or the body drifts.
- Same seed, same reference image and same lighting words across segments.
- Use character/object reference images or 3 s reference videos when the model supports them.
- Pose and expression words go on the body only. Asking for a wink or smile can redraw the face.

## 9. Loops

Same image as first and last frame, or ask for the last frame to match the first, then trim to the cleanest loop point with ffmpeg. One subtle motion (steam, light shift, slow parallax) loops better than a camera move.

## 10. Audio in generated clips

Models with native audio (Veo/Gemini Omni, LTX ambient) follow prompt cues: "calm background music", "high energy techno beat", "distant traffic". Generated speech rarely lip-syncs reliably across clips. For narration use TTS on a separate track and mute the clips (see music-beat-cut.md). To get fresh audio from a video edit, strip the source audio first.

## 11. Structured prompt (JSON) when a pipeline wants it

```json
{
  "title": "Night market opening",
  "background": {"description": "crowded night market, steam, lanterns", "era": "present", "location": "Taipei"},
  "characters": ["street cook"],
  "camera": {"type": "medium shot", "movement": "slow push in", "angle": "eye level", "focus": "cook in focus, bokeh lanterns"},
  "dialogue": [],
  "audio": [{"type": "sizzling wok", "volume": 1}, {"type": "crowd murmur", "volume": 0.4}]
}
```

## 12. Shot plan for a generated sequence

| Field per shot | Values |
|---|---|
| shot size | establishing wide, wide, medium, close, detail |
| camera_move | from the safe list in section 3; varied across neighbours |
| element_motion | the energy: several elements moving, written for this scene (not a template) |
| duration | 3 to 6 s; never over about 7 s |
| title | true only on the wide shot of a beat |

Coverage pattern: an establishing wide, then a hard cut to a close-up of the key element. Moving in (wide → medium → close) builds intensity; pulling out reveals context and suits endings.

## 13. Takes, cost and drafting

1. Draft at low resolution or with a fast model (`veo3.1_fast`, `gen4_turbo`, LTX `--quality fast`); upscale or re-run only the chosen take.
2. Generate 3 to 4 variations of the same concept; pick by eye.
3. Never retry with an identical prompt. Change one thing (seed, move, wording) per retry.
4. Cap at 3 rejected paid takes per shot, then rethink the shot or the route.
5. Cache and reuse b-roll across videos.
6. Verify each clip: probe duration/fps, then pull frames (`ffmpeg -ss 2 -i clip.mp4 -frames:v 1 -vf "scale=640:-1,format=yuvj420p" f.jpg`). You cannot judge an mp4 without frames.

## 14. Prompt doctor checklist (before you pay)

- [ ] One subject, one action, one camera move
- [ ] The motion is described, plus what stays still
- [ ] Style, light and mood are concrete
- [ ] No required readable text or logo inside the model output
- [ ] Mode fits the inputs (supplied media constrains the result, so use i2v, keyframes or an edit)
- [ ] Duration, aspect and resolution are within the model's limits
- [ ] Audio is described or explicitly "no dialogue"
- [ ] Deterministic needs (exact type, frame-accurate sync, final mix) are planned for post-production, not generation

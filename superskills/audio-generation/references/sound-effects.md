# Sound effects and ambiences

> Distilled from: sound-effects (elevenlabs/skills, MIT), media-use (heygen-com/hyperframes, Apache-2.0), audiocraft-audio-generation (Orchestra-Research/AI-research-SKILLs, MIT)

## 1. Retrieve or generate?

| Situation | Do |
|---|---|
| Common UI or transition sound (click, pop, whoosh, chime, riser) | Use a library file first: free, instant, known duration |
| Specific or unusual sound, or a library miss | Generate (ElevenLabs SFX, or AudioGen locally) |
| Long ambience bed (rain, room tone, city) | Generate with `loop=true`, 10-30 s, loop it in the edit |
| Offline / no key | AudioGen (`local-open-models.md`) |

Retrieval note: semantic SFX search scores are low even for good hits (~0.5-0.67). Use a
score floor around 0.4, not 0.7, or most cues get silently dropped.

## 2. Prompt formula

`[source] + [action/material] + [space/distance] + [character] + [length/shape]`

| Weak | Strong |
|---|---|
| "Rain" | "Heavy rain on a tin roof, close, steady, no thunder" |
| "Explosion" | "Distant muffled explosion, deep low-end boom, long rumbling tail" |
| "Click" | "Soft UI click, short, dry, plastic, no reverb" |
| "Scary" | "Eerie wind howling through an abandoned concrete building" |
| "Whoosh" | "Fast airy whoosh left to right, 0.6 s, no impact" |

- Name materials (glass, gravel, wood, metal) and spaces (small room, cathedral, open field).
- Say what must not be in it ("no music", "no voices").
- Genre words help for stylized effects: "8-bit retro jump", "cinematic braam, horror".
- Combine elements in one prompt for scenes ("footsteps on gravel with distant traffic"), but
  generate separate layers when you need to mix them independently.

## 3. Settings (ElevenLabs)

| Param | Range | Guidance |
|---|---|---|
| `duration_seconds` | 0.5-30 or auto | UI 0.2-1 s; transitions 0.5-1.5 s; impacts 1-3 s; ambiences 10-30 s |
| `prompt_influence` | 0-1 (default 0.3) | 0.6-0.8 for literal, predictable sounds; 0.2-0.4 for creative textures |
| `loop` | bool | true for ambiences and beds |

Generate 2-4 variants and pick. Trim silence at the head so the transient lands on the frame:
`ffmpeg -i in.wav -af silenceremove=start_periods=1:start_threshold=-50dB out.wav`.

## 4. Placement rules for video and UI

- One sound per meaningful event. A sound on every cut becomes noise.
- Hit the transient on the visual event (frame-accurate); a riser must **end** on the hit:
  start time = hit time - riser duration.
- Level: SFX sit under voice and music, about 0.3-0.4 linear gain (-8 to -10 dB) relative to
  the voice, louder only for deliberate accents.
- UI sounds: under 300 ms, soft attack, no long reverb, consistent family (same material and
  pitch range). Provide a mute option; never autoplay sound on page load.
- Ambience: fade in and out over 0.5-1 s; keep it 20-30 dB under dialogue.
- Reuse one file for repeated identical cues rather than generating near-duplicates.
- A missing effect should never block a render: skip it and note it.

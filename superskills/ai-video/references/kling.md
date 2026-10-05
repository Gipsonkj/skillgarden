# Kling: prompting and running it

> Distilled from: higgsfield-ai-prompt-skill model guide, deep model reference, camera, motion and prompt-example files (OSideMedia, MIT), vendor product, UI and credit material removed, in our own words; cinematic-demo-sites (Gipsonkj/skillgarden `authored/`, MIT) for how Kling takes camera direction compared with Wan 2.2; facts from Kling's API as listed on fal.ai model pages (fields, limits, defaults), in our own words. Kling's own API reference did not render when checked (Oct 2026).

Kling (Kuaishou) is a hosted model family: strong human realism, real camera moves, native audio, and since 3.0 several shots in one generation. Model ids, tiers and prices change often and differ per host: read the host's schema before the first call. The general formula and camera vocabulary are in generative-prompting.md; fal and other API calls in vendor-apis.md.

## 1. Versions and modes

| Model | Modes | Pick it for |
|---|---|---|
| 2.1 / 2.1 Master | t2v, i2v | Legacy; gone from some hosts |
| 2.5 Turbo | t2v, i2v | Fast drafts of a Kling look |
| 2.6 | t2v, i2v with start and optional end frame, native audio (off by default: switch it on when the prompt has sound) | One person, subtle expressions, emotional close-ups, 5 or 10 s |
| 3.0 (V3) | t2v, i2v, start+end frame, multi-shot (up to 6 cuts), element references, native audio (off by default); std / pro tiers, 4K on some hosts | Long cinematic takes up to 15 s, dialogue, a sequence in one call |
| 3.0 Turbo | t2v, single start frame | Cheaper, faster 3.0 drafts |
| 3.0 Omni (O3) | Reference-driven generation, per-shot storyboard, clone a character's look and voice from a 3 to 8 s video (1080p, mp4/mov, 16:9 or 9:16, under 200 MB, realistic people only) | When you have reference media to lock identity. Availability varies by host: verify |
| O1 | Multi-reference generation (up to 7 refs), start/end frame, 3 to 10 s (5 or 10 s with a first frame alone) | Many characters, props and a location in one coherent shot |
| O1 Edit / 3.0 Omni Edit | Video-to-video edits by instruction: relight, restyle, swap or add or remove objects, change the setting | Changing footage while keeping its motion and camera |
| 3.0 Motion Control | A character image plus a motion video: 3 to 30 s when the orientation follows the video, at most 10 s when it follows the image | Dance, sport, gestures: exact motion copied onto your character |

V3 or O3: use 3.0 when the prompt is the main driver (it plans the shots itself); use Omni when reference video or image plus audio must anchor identity, or you want to set every shot yourself.

Kling generates real people and brands where some models block them (vendor-apis.md). Use that only for consented likenesses and brands you have rights to.

## 2. Limits (checked against Kling's API docs, 5 Oct 2026; other hosts may differ)

| Model | Duration | Inputs | Audio |
|---|---|---|---|
| 2.6 | 5 or 10 s | Start image required for i2v, end image optional | Off by default (`audio`); turning it on forces 1080p; speech in Chinese and English (other languages translated); up to 2 bound voices, cited as `<<<voice_1>>>` |
| 3.0 | 3 to 15 s; multi-shot: up to 6 shots, each 1 s up to the total, adding up to the total | `multi_shot: true` uses the `multi_prompt` list and ignores `prompt`; start/end image; elements cited as `@Element1` | Off by default (`sound`); Chinese and English speech |
| O1 Edit | Source 3 to 10 s | mp4/mov, 700 to 2,160 px, up to 200 MB, 24 to 60 fps; up to 4 refs in total (elements plus style images); an element is a frontal image plus 1 to 3 other angles, each at least 300 px, aspect 0.4 to 2.5 | `keep_audio` keeps the source track |
| Motion Control | Follows the motion video: 3 to 30 s (orientation from the video), up to 10 s (orientation from the image) | One character image plus one motion video; 720p or 1080p | Can pass the reference audio through |

Aspect for t2v: 16:9, 9:16, 1:1. Shared fields: `negative_prompt` (default "blur, distort, and low quality"; up to 2,500 chars on Kling's API per host docs), `cfg_scale` 0 to 1 (default 0.5 on 3.0; higher follows the prompt more literally). Older API models also took a motion brush: `static_mask` (areas that stay still) and `dynamic_masks` (areas plus a drawn path); each mask must match the input image's aspect ratio or the job fails.

## 3. Prompt structure

Treat the prompt like a short script: action, camera, mood, sound and dialogue together. 100 to 200 words is the useful range for a single clip.

```
Aspect 16:9, 10 s, cinematic.
A woman in a rain-soaked coat waits under a bus shelter at night. First she
checks her phone, then looks up as headlights sweep across her face, then
steps back as the bus pulls in.
Camera: slow dolly in from medium to medium close-up, eye level.
Light: cold blue street light, warm amber from the bus interior.
Sound: steady rain, distant traffic, air brakes hiss. No music.
```

- **Sequential actions:** "first / then / finally" keeps a multi-step beat in order.
- **Observable words:** replace "epic, stunning, 8K masterpiece" with things a camera could measure: light source and direction, lens, materials, weather.
- **Image to video:** describe only what changes (hair lifts, head turns, lights flicker on). Re-describing the picture wastes the prompt and invites drift.
- **Ending:** a motion that never resolves can stall or loop awkwardly; end with a resting state ("then settles", "returns to its starting position").

**Dialogue (2.6, 3.0):**

```
[Speaker: Mara] "We're late." in a calm, low female voice, British accent.
[Speaker: Theo] "Not yet." in a warm male voice.
Add sound: door slams when Theo turns. Background ambient: busy station hall.
```

**Multi-shot (3.0):** up to 6 cuts in one generation. Give each shot a length, framing and one camera instruction:

```
Shot 1 (3s): wide, the station hall at dawn. Camera: static.
Shot 2 (4s): medium, Mara hurries through the crowd. Camera: tracking.
Shot 3 (3s): close-up, her eyes find the departures board. Camera: slow push in.
```

Use elements (reference images cited as `@Element1`) to keep a character or product identical across shots.

## 4. Camera and motion

Unlike Wan 2.2, Kling executes camera direction: pushes, tilts, arcs, handheld, FPV, rack focus. A real move beats a post-production crop (true parallax, no resolution lost). Rules:

- One primary move per shot; stacking a push, a pan and a tilt is the top cause of jitter. Split moves into separate shots.
- For micro-moves, state distance and time: "over the full 8 seconds the camera drifts in about 15 cm, barely noticeable".
- The move must be able to produce the end framing. A slow push can't take a wide to an extreme close-up; enlarge the move or shrink the change.
- Use "dolly" or "push in" for a physical move, "zoom" only for a lens zoom.
- **Start and end frame:** the model plans the path between two stills. Keep both in the same light and lens; the further apart they are, the more it morphs. The same image twice makes a loop.

**Motion Control inputs:** one clear performer; head and body both visible; real human motion (not animation); one continuous take with no cuts; moderate speed; 3 to 30 s. The prompt describes the scene, light and background, not the motion. Pick image orientation when the camera moves and the body stays mostly still, video orientation for full-body dance or action. An output shorter than the source means the motion was too fast or complex: slow or simplify the reference.

## 5. Edit prompts (O1 Edit, Omni Edit)

Always say what must survive: `Change [target] to [new state], keep [everything else] unchanged.`

- "Change the lighting to golden-hour dusk, keep the character and camera motion unchanged."
- "Remove the person in the background, keep everything else exactly as it is."

One change per pass; chain passes for more.

## 6. Negative prompt

Keep the default ("blur, distort, and low quality") and add concrete defects you have actually seen: "extra fingers, warped hands, flicker, subtitles, watermark". Describe the unwanted thing, not an instruction ("text overlay", not "don't add text"). Lowering `cfg_scale` loosens prompt adherence; raise it toward 1 when the model ignores details.

## 7. Failure modes

| Symptom | Fix |
|---|---|
| Jitter, unwanted rotation | One camera move per shot; split the rest |
| The move overshoots | State travel distance and time |
| Morphing between start and end frames | Bring the two frames closer (same light, lens, pose) |
| Generation stalls or ends mid-motion | End on a resting state ("then settles") |
| Wrong speaker or lip-sync | Speaker attribution lines; one line per character |
| Face drifts in Motion Control | Clearer character image; slower, single-person reference |
| Output shorter than the motion source | Reference too fast or complex; trim or slow it |
| An edit changes more than asked | Add the keep clause; one change per pass |
| Character changes between shots | Elements for identity; repeat the same wardrobe words in every shot |
| Model or field rejected | Ids and tiers differ per host; read the host's schema |

## Checklist

- [ ] Model and tier match the job (2.6 single person, 3.0 sequences and long takes, Omni or O1 with references, Motion Control for copied motion)
- [ ] Duration, inputs and audio within the limits above, checked on the host
- [ ] Prompt written as a script: action, one camera move, light, sound
- [ ] i2v prompt describes only what changes; the action ends on a resting state
- [ ] Dialogue in quotes with speaker attribution, or "No dialogue"
- [ ] Start/end frames compatible in light, lens and pose
- [ ] Edits carry a keep clause
- [ ] Real people and brands only with consent and rights
- [ ] Cost and take count stated before paid calls (vendor-apis.md rules)

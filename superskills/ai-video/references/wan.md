# Wan: prompting and running it

> Distilled from: cinematic-demo-sites (Gipsonkj/skillgarden `authored/`, MIT), the main source for Wan 2.2 image-to-video practice; Wan2.1 and Wan2.2 READMEs and configs (Wan-Video, Apache-2.0) for model sizes, frame counts, fps, VRAM notes and the default negative prompt; higgsfield-ai-prompt-skill model guide and deep reference (OSideMedia, MIT) for version notes and the Wan 3.0 prompt structure, in our own words; wan-2-7 (prime-skills/runcomfy-agent-skills, MIT) for Wan 2.7 input fields and prompting notes, in our own words; facts from Alibaba Cloud Model Studio's Wan API references (2.1 to 3.0), in our own words.

Wan is Alibaba's video family. 2.1 and 2.2 are open weights you can run yourself; 2.5 onward is hosted only (no weights in the Wan-Video GitHub org as of Oct 2026). The general formula, camera vocabulary and shot planning live in generative-prompting.md; fal and other API calls in vendor-apis.md. This file covers what is specific to Wan.

## 1. Versions

| Version | Weights | What it adds |
|---|---|---|
| 2.1 | Open, Apache-2.0: T2V 1.3B and 14B, I2V 14B, FLF2V-14B (first+last frame, 720p), VACE (all-in-one create/edit) | The base; 1.3B runs in about 8 GB VRAM at 480p |
| 2.2 | Open, Apache-2.0: T2V-A14B, I2V-A14B (two 14B experts, 27B total, 14B active per step), TI2V-5B (T2V+I2V in one), S2V-14B (speech to video), Animate-14B (character animation and replacement from a driving video) | Better motion and detail than 2.1; the 5B runs on one 24 GB card |
| 2.5 (preview) | Hosted | First Wan with audio: your track via `audio_url`, or auto background audio; 5 or 10 s |
| 2.6 | Hosted | 2 to 15 s, multi-shot (`shot_type: multi` on Alibaba), custom audio; often picked for stylised, painterly work |
| 2.7 | Hosted | T2V, I2V with first+last frame, continuation from a clip, reference-to-video (up to 5 references), video edit, audio-driven lip-sync, 5,000-char prompts |
| 3.0 / 3.0 Prime | Hosted | 2 to 30 s or smart duration, native dialogue, music and SFX, image/video/audio references, prompt-driven edits and extensions. No source says how Prime differs: don't claim a gap |

## 2. Where to run it

| Route | Good for | Notes |
|---|---|---|
| Self-hosted 2.2 (your own GPU endpoint, ComfyUI or diffusers) | Volume, zero per-clip fee, LoRAs, full control | GPU setup: `open-models` → `references/gpu-hosting-runpod-modal.md`; what fits on which card: `open-models` → `references/vram-and-sizing.md` |
| Alibaba Cloud Model Studio (first party, `DASHSCOPE_API_KEY`) | 2.5 to 3.0, the full parameter set | Async: submit a task, poll it. Image-to-video takes about 1 to 5 minutes |
| Aggregators (fal, RunComfy, Higgsfield and others) | One key for many models | Field names and limits differ per host (2.6 is listed as 5/10/15 s on one host, 2 to 15 s on Alibaba). Read the host's schema first; calls in vendor-apis.md |

Licence: 2.1 and 2.2 code and weights are Apache-2.0, with no revenue cap; Wan claims no rights over outputs, and the usual misuse limits apply. Hosted versions follow the host's terms.

A real-world data point: a reseller's Wan 2.6 at 1080p was rejected by a client as looking AI-made, and self-hosted 2.2 at 720p from a strong photoreal still was accepted. The still matters more than the version.

## 3. Limits (checked Oct 2026, verify on the host)

| Version | Duration | Resolution, fps | Audio | Prompt / negative |
|---|---|---|---|---|
| 2.2 A14B, open | 81 frames at 16 fps (about 5 s) by default | 480p (832×480) or 720p (1280×720) | Silent | No hard cap; README prompts run 50 to 80 words |
| 2.2 TI2V-5B, open | 121 frames at 24 fps (about 5 s) | 720p as 1280×704 or 704×1280 | Silent | Same |
| 2.2 hosted (Alibaba plus/flash) | Fixed 5 s | 480p to 1080p | Silent | 800 / 500 chars |
| 2.5 preview | 5 or 10 s | 480p, 720p, 1080p | `audio_url`, or auto background audio | 1,500 / 500 |
| 2.6 | 2 to 15 s | 720p, 1080p | `audio_url` | 1,500 / 500 |
| 2.7 | 2 to 15 s, default 5 (reference-to-video and video edit: 2 to 10 s) | 720p or 1080p (default 1080p), 30 fps | Driving audio wav/mp3, 2 to 30 s (one host says 3), up to 15 MB, cut to clip length; omitted = auto audio | 5,000 / 500 |
| 3.0 / Prime | 2 to 30 s, or -1 smart (one host bills -1 as 10 s) | 480p, 720p, 1080p, 30 fps | Native dialogue, music, SFX; `audio=false` to mute | Negative goes in the prompt as a list |

More 2.7 and 3.0 detail:
- **Aspect:** 16:9, 9:16, 1:1, 4:3, 3:4 (3.0 adds auto/adaptive).
- **2.7 inputs:** first/last frame images 240 to 8,000 px a side, ratio 1:8 to 8:1, up to 20 MB. Continuation clip mp4/mov, 2 to 10 s, 240 to 4,096 px a side, up to 100 MB. Up to 5 references (images plus videos) is the reference-to-video model; in i2v each media type appears once. Seed 0 to 2,147,483,647.
- **3.0 references:** up to 10 images, 5 videos (15 s total), 5 audio clips (15 s total), 20 items in all. A call uses either first/last frames or references, never both; a last frame needs a first frame.
- **Model ids on Alibaba Model Studio** (checked 5 Oct 2026): `wan2.7-t2v`, `wan2.7-i2v`, `wan2.7-r2v`, `wan2.7-videoedit` (dated versions such as `wan2.7-t2v-2026-06-12` also exist), `wan3.0-video`, `wan3.0-video-prime`. Both 2.7 and 3.0 output 30 fps MP4 per Alibaba's docs.

## 4. Prompt structure

**Text to video (2.2 to 2.7).** Use the formula in generative-prompting.md. Put the shot first ("Medium close-up, locked tripod, low angle"), then one subject and one primary action, then light and style. "She turns, then smiles" works; four simultaneous actions don't.

**Wan 3.0 (Alibaba's prompt guide).** Write it in sections and skip any you don't need:

```
Generate single shot.
Overall: a night-market cook plates noodles for a customer.
Shot 1 (0-5s): medium shot, steam rising, the cook slides the bowl forward, slow push in.
Dialogue: the cook says: "Careful, it's hot." Lip sync.
Sound: sizzling wok, crowd murmur. No background music.
Style: warm practical light, 35mm, shallow depth of field.
Negative prompt list: subtitles, watermark, extra fingers.
```

- Multi-shot: `Shot N (start-end s)`, each 2 to 5 s, end to end with no gaps; say `hard cut` or `dissolve` between them. Without `Generate single shot` it may cut on its own.
- References are numbered by upload order, separately per type (Image 1 and Video 1 can coexist). With two or more of a type, always give the number. Hosts may map their arrays to Wan's numbers differently, so test numbering on a cheap 480p draft.
- Write `No dialogue` or `No background music.` explicitly, or the model decides.

**Image to video from a photoreal still (the recipe that works on 2.2).** Make the still first with an image model (`image-creation` owns that), then animate it. Video from a convincing still stays convincing; text-to-video drifts and looks fake. Prompt only what moves, never what the image already shows:

`[one subtle, specific motion taken from the still], slow, no cuts`

- "steam curling slowly off the espresso, warm light, slow, no cuts"
- "the spit turning slowly, meat glistening under the heat lamp, slow, no cuts"
- "she turns her head slightly toward the window, slow, no cuts"

i2v is faithful: it will faithfully animate an AI-looking still. If the clip reads as fake, re-render the still, not the video. Detail (food, product, texture) reads best barely moving; let the cuts and crossfades carry the story.

## 5. Motion amount and avoiding warp

| Version | Camera moves |
|---|---|
| 2.2 (self-hosted) | Treat camera words as ignored or harmful. A requested push-in usually warps. Do the move in post with ffmpeg `zoompan` (a 2.4× push that lands at 720p needs a 1080p source) |
| 2.7, 3.0 | Takes plain-English moves ("slow dolly in", "handheld follow", "crane down"). One move per clip, as in generative-prompting.md |

- Big motion warps: melting glass, extra fingers, morphing faces. Small motion almost never does. One gentle movement per clip.
- Self-hosted frame counts follow 4n+1 (49, 57, 81) because the VAE compresses time by 4.
- On a serverless GPU worker, 81 frames at 1280×720 hit the execution timeout at about 630 s every time. Drop to about 57 frames and keep 720p. Dropping to 1024×576 at 81 frames finishes in about 360 s but looks soft and falls apart under a later post push.
- Stock 2.2 defaults are 40 sampling steps (guidance 3.5 for I2V-A14B, 5 for the 5B). One working self-hosted I2V setup runs `steps: 10`, `cfg: 2.0`, `context_overlap: 48`; settings that low only hold up with a step-distilled workflow (LightX2V-style), so match them to whatever your endpoint actually loads.

## 6. Negative prompts

Wan takes a separate `negative_prompt` (up to 500 chars on hosted 2.x); 3.0 wants it as a list inside the prompt. Name concrete defects, not vague ones: "no subtitles, no watermark, no flicker" works, "no bad lighting" is ignored.

- Short default for photoreal i2v: `blurry, low quality, distorted, warped, deformed, extra fingers, mutated hands`
- The official default (Wan README, shortened): `overexposed, static, blurred details, subtitles, worst quality, low quality, JPEG artifacts, ugly, extra fingers, poorly drawn hands, poorly drawn faces, deformed, fused fingers, still picture, messy background, three legs, many people in the background, walking backwards`. It lists "static" and "still picture" to push for motion; drop those two when you want near-still ambience.
- Don't repeat the positive prompt in the negative, and don't pad it.

## 7. Prompt expansion

Hosted Wan rewrites short prompts by default (`prompt_extend` on Alibaba, `enable_prompt_expansion` on some hosts). Self-hosted 2.2 offers the same through `--use_prompt_extend`, using Alibaba's API or a local Qwen model, and the README recommends it for richer detail.

- **On:** short creative prompts, exploration, i2v with no prompt at all (it can write one from the image).
- **Off:** brand-strict copy, exact camera or timing, multi-shot scripts, and the subtle-motion recipe above, where the expanded prompt may add motion you didn't ask for. Compare one take each way before a batch.
- Some hosts expose `enable_thinking` on 3.0: slower, better prompt adherence.

## 8. Audio and lip-sync

- **2.5 to 2.7:** pass your voice track (`audio_url` or `driving_audio`) and the face lip-syncs to it. Match the track length to the clip duration; files outside the spec are rejected or cut. Same prompt with a different track per language gives dub variants.
- Without a track, these versions add their own background audio. For a clean mix, mute the clip and lay TTS and music in post (music-beat-cut.md).
- **3.0:** native speech: `X says: "..."` plus `Lip sync`; give a voice timbre reference (`Voice timbre references Audio 1`) once per character.
- **Open weights:** S2V-14B takes an image plus a speech track, and the clip length follows the audio. Animate-14B moves a character image with a driving video, or replaces the person in it.

## 9. Running a self-hosted 2.2 endpoint

The pattern for a serverless GPU endpoint (host setup is in `open-models` → `references/gpu-hosting-runpod-modal.md`):

- Submit with `/run`, poll `/status/<id>`; the key comes from the environment (`Authorization: Bearer $RUNPOD_API_KEY`), never the command line.
- Typical body: `prompt`, `image_base64` (raw base64, no data: prefix), `negative_prompt`, `width`/`height` (1280×720 or 720×1280), `length` (frames), `steps`, `cfg`. Expose `length` in your runner rather than hard-coding 81.
- Output often comes back as base64 mp4, not a URL. Decode and save it.
- Submit in waves. Fifty jobs at once on a few workers leave most in the queue past the poll deadline. Poll for about 40 minutes by default, 150 to 180 for a busy queue, and re-render only the clips still missing.
- Stitch clips in one ffmpeg `filter_complex` with about 0.6 s crossfades; never mix the concat demuxer with `xfade` (footage-editing-ffmpeg.md).

## 10. Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Glass melts, fingers multiply, faces morph | Too much motion, or a camera move on 2.2 | One small motion, "slow, no cuts"; do the move in post |
| Clip looks AI-made though motion is fine | The still looks AI-made | Re-render the still; keep the motion prompt |
| `executionTimeout` on a serverless worker | 81 frames at 720p is too long | About 57 frames at 720p |
| Soft, mushy frames | Ran below 720p, or pushed in on a 576p clip | Keep 720p; push only on 1080p sources |
| Unwanted cuts (2.6, 3.0) | Multi-shot default | `Generate single shot` on the first line; single-shot setting |
| Voices or music you didn't want | Auto audio | `No dialogue`, `No background music.`, or mute and mix in post |
| Prompt followed loosely, extra details appear | Prompt expansion rewrote it | Turn expansion off for literal prompts |
| 422 or rejected input | Host field names or limits differ | Read that host's schema; check audio length and size, image size |
| References applied to the wrong subject (3.0) | Numbering is per type and per upload order | Number every reference explicitly; test on a 480p draft |
| FLF2V output ignores details (2.1) | Trained mostly on Chinese text | Try the prompt in Chinese |

## Checklist

- [ ] Version and host chosen; limits above checked against the host's live schema
- [ ] For photoreal: still first, judged as a photo before any video is made
- [ ] One subject, one small motion; on 2.2 no camera move, "slow, no cuts"
- [ ] Negative prompt names concrete defects; "static" removed if you want stillness
- [ ] Prompt expansion set on purpose (off for literal or subtle-motion prompts)
- [ ] Self-hosted: 4n+1 frames, 720p, a length that finishes inside the worker timeout
- [ ] Audio planned: your track for lip-sync, `No dialogue`, or mute and mix in post
- [ ] Cost and take count stated before paid hosted calls (vendor-apis.md rules)
- [ ] Frames pulled and checked for warp before stitching

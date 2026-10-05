# Vendor: Gemini Omni Flash and Veo (Google)

> Distilled from: gemini-omni-flash-api (google-gemini/gemini-skills, Apache-2.0); video-generation (bytedance/deer-flow, MIT) for the Veo/MiniMax provider note; higgsfield-ai-prompt-skill (OSideMedia/higgsfield-ai-prompt-skill, MIT) for the Veo 3.1 section. Scripts in `scripts/gemini-omni-flash-api/` are copied as-is from gemini-skills (Apache-2.0, license beside them).

Model `gemini-omni-1.1-flash`, called through the Interactions API with the `google-genai` Python SDK. It does text-to-video, first-frame and first+last-frame video, reference-guided generation (images and videos), video editing, and extensions. It makes its own audio.

## Setup

- `GEMINI_API_KEY` in the environment (never on the command line or in a prompt file).
- Python 3.10+, `google-genai >= 2.19.0` (`pip install -U google-genai`); ask the user before installing.
- ffmpeg/ffprobe on PATH (for prep, inspect, strip-audio).
- **Region limit:** uploading a video for edit or extend is not available in the EEA, Switzerland and the UK. An edit that returns instantly with no video (`total_output_tokens: 0`) is this restriction, not a prompt problem.

## Limits

| Setting | Values |
|---|---|
| Aspect | 16:9, 9:16 only |
| Resolution | 360p (640x360), 720p default (1280x720), 1080p, 4k (3840x2160; slow, use `--timeout 900`) |
| Duration | integer 3 to 10 s per generation |
| Edit input | 10 s or less; tuned for 720p/24 fps |
| Extend | +10 s per turn, total 40 s; uses the last 10 s as context and may adjust final input frames |
| Reference videos | about 3 s each, up to 3 recommended |
| Default HTTP timeout | 600 s |

## Scripts: when to run which

Run them from the user's working directory; outputs go to `media/` unless `--output` is given.

| Need | Command |
|---|---|
| Check a file | `python3 scripts/gemini-omni-flash-api/video/inspect_video.py in.mp4 --json` |
| Trim/scale a source to fit (first 10 s, 720p) | `python3 scripts/gemini-omni-flash-api/video/prep_video.py in.mp4 [--start 00:03 \| last] [--duration 10] [--strip-audio]` |
| Text to video | `python3 scripts/gemini-omni-flash-api/video/generate_video.py "prompt" --aspect-ratio 9:16 --resolution 720p --duration 6 -o media/x.mp4` |
| First frame to video | `... "The waves crash." --first-frame start.png -o media/waves.mp4` |
| Transition / loop | `... --first-frame a.png --last-frame b.png` (same file twice gives a loop) |
| Style or character reference | `... "warrior in the style of <IMAGE_REF_0>" --image ref.png` / `--video-reference ref.mp4` |
| Edit, keep audio | `... "Make this video anime. Keep everything else the same." --video in.mp4` |
| Edit, new audio | add `--strip-audio` |
| Extend | `... "The scene continues as the sun sets." --extend clip.mp4` |
| Iterate on the last result | `... "Change the setting to snowy winter." --previous-interaction-id v1_...` |
| Batch | `--prompts-file prompts.txt --concurrency 3` or `--batch jobs.json` (array of job objects with prompt, first_frame, last_frame, image, video, extend, video_reference, resolution, aspect_ratio, strip_audio, output) |
| Upload once, reuse URI | `python3 scripts/gemini-omni-flash-api/upload_file.py image.png` |

Files over 25 MB trigger a tip to run `prep_video.py` first. Do that; uploads are faster and edits behave better at 720p/24 fps.

## Prompting specifics

- **Single shot:** by default it builds a short multi-shot narrative. Say "single continuous shot, no scene cuts" when you need one take.
- **Audio:** describe it ("calm background music", "low tinny radio in the background", "no dialogue"). For a clean slate on an edit, strip audio first.
- **Edits:** short and specific. "Add a cat that jumps onto his lap, he pets it. Keep everything else the same." Not a paragraph.
- **Timing:** "After 3 seconds...", "Every 2 s cut to a new location", or `[0-3s] ... [3-6s] ...`. In an extension, 0 s is the start of the new part.
- **Text:** it can render requested text ("street sign that says 'OPEN 24H'"). Define naturally occurring text so it isn't gibberish. Still check every frame, and keep brand-critical type in code.
- **Meta prompts:** "Consider micro-detail, expression and timing; be specific about costume and background." This raises detail.
- **Extending:** spoken dialogue can't be added to an uploaded clip where someone talks. Multi-turn extensions of its own generations can add speech. Prefer prompting ("Extend this video", "The scene continues") over forcing `--task extend`, which disables reference inputs.

### Binding media to roles

Simple tags in the prompt:
- `<FIRST_FRAME>`, `<LAST_FRAME>` (last needs first)
- `<IMAGE_REF_0>`, `<IMAGE_REF_1>`... (style, subject or object refs, 0-indexed)
- `<VIDEO_REF_0>`... (character or motion refs)

For complex inputs, declare at the start and explain at the end:
```
[# Sources <FIRST_FRAME>@Image1] [# References <IMAGE_REF_0>@Image2]
A woman <IMAGE_REF_0> walks through the market. Use Image1 as the starting frame.
Use Image2 as a reference, not as a literal frame.
```

Multi-reference sequence example:
```
[0-3s] Studio fashion sequence: woman <IMAGE_REF_0> holding <IMAGE_REF_1>
[3-6s] Then the man <IMAGE_REF_2> holding <IMAGE_REF_3>
[6-10s] Finally <IMAGE_REF_4> walking with <IMAGE_REF_5>
```

## Veo 3.1 (checked against Google's docs 5 Oct 2026)

Google's other video line: 4 to 8 s clips with native audio, strongest on photoreal environments (water, fire, weather, animals). Called through the Gemini API with `client.models.generate_videos(...)`, which returns a long-running operation: poll `client.operations.get(op)` until `done`, then download. Gemini API ids: `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview` (same features, cheaper, for drafts) and `veo-3.1-lite-generate-preview` (cheapest: up to 1080p, no 4K, no reference images). **Google shuts all three down on 22 Oct 2026 and names `gemini-omni-1.1-flash` (above) as the replacement**, so new Gemini API work should start on Omni. Stable ids exist only on Vertex AI (Gemini Enterprise Agent Platform): `veo-3.1-generate-001` and `veo-3.1-fast-generate-001`, retiring 17 Nov 2026 or later. Veo 3 / 3 Fast and Veo 2 were shut down on 30 Jun 2026. Check Google's deprecations page before hard-coding an id.

| Setting | Values (Google's Veo docs) |
|---|---|
| Duration | 4, 6 or 8 s |
| Aspect | 16:9 (default), 9:16 |
| Resolution | 720p (default, any duration); 1080p and 4K at 8 s only |
| Reference images | up to 3 "asset" images (face, outfit, product), 3.1 and 3.1 Fast only |
| First + last frame | 3.1 only; it fills the motion between |
| Must be 8 s when | using reference images, extension, 1080p or 4K |
| Extension | +7 s per call, up to 20 calls (148 s total); input must be a Veo clip at 720p and under 141 s |
| Storage | clips kept 2 days on Google's side; referencing one for extension resets the timer. Download at once |

Prompting:

- Order: subject, action, style, camera move, composition, lens and focus, ambiance (light, colour), then audio.
- **Dialogue in quotes with the speaker named**: `The old sailor looks up and says, "This must be it."` Write each line once.
- **Sound effects explicitly** (`tires screeching loudly`, `a door slams off-screen`), **ambience as a soundscape** (`distant traffic, light rain on a tin roof`). Sound you leave open gets invented.
- **Negative prompt field:** list what to avoid as plain nouns, not instructions: `wall, frame, text overlay`, not "no walls".
- English dialogue is its strongest language; check other languages by ear.
- Reference images hold appearance (face, garment, prop), not the camera. Describe the move in text.

Lip-sync, the part that fails most:

- 3 to 8 s per spoken clip, medium close-up or tighter, one speaking face per shot.
- Locked-off camera or a slow push-in only; no head-motion words ("nods", "turns to look") in the same prompt.
- When sync matters most, leave music and busy ambience out of that clip and add the bed in the edit.
- Two people talking: one clip per speaker, cut between them. Multi-speaker sync is weaker than on Seedance.

| Symptom | Fix |
|---|---|
| Request rejected with refs, extension, 1080p or 4K | Set duration to 8 s |
| Extension rejected | Source is not 720p, is 141 s or longer, is older than 2 days, or is not a Veo output |
| Extension loses the voice | The source's last second is silent; voice only carries over if that second has audio |
| Lip-sync drifts | Shorter clip, tighter framing, one face, locked camera, no music |
| Stiff acting | Known weakness next to Kling; keep acting beats simple or route performance shots elsewhere |

## Veo and MiniMax through a generic script

Some pipelines pick the provider from environment variables: `GEMINI_API_KEY` set means Veo; only `MINIMAX_API_KEY` set means MiniMax Hailuo (`/v1/video_generation`, async submit, poll, download; first reference image becomes `first_frame_image`; it ignores aspect ratio and uses resolution/duration). Force with `VIDEO_GENERATION_PROVIDER=gemini|minimax`. Credentials always come from the environment.

## Failure table

| Symptom | Fix |
|---|---|
| Empty output on edit/extend | Region restriction; generate from frames instead (first-frame i2v) |
| Unwanted scene cuts | Add "single continuous shot, no scene cuts" |
| Extra chatter or SFX | "No dialogue, no extra sound effects" |
| Old audio bleeds through an edit | `--strip-audio` |
| Timeout at 4k or long extends | `--timeout 900` to `1200` |
| "Prohibited content" on a real person/brand | Don't work around it; change the source material |

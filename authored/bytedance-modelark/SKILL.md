---
name: bytedance-modelark
description: "Generate photoreal stills (Seedream 5.0), image-to-video clips (Seedance 1.5 Pro / 2.5), multi-reference videos and video edits (face/driver replacement) directly on ByteDance's first-party API, BytePlus ModelArk — no reseller markup. Use whenever a task says Seedance, Seedream, ModelArk, BytePlus, 'ByteDance video', or needs the cheapest working i2v (~$0.13 per 720p 5s clip) or a photoreal still engine when Gemini/Nano Banana credits are empty. Encodes the real gotchas: ModelNotOpen, the real-human-face gate, audio doubling the price, min 3.69 MP image canvas, base64 OK for images but web URL required for videos, second-by-second prompt timelines, and output moderation that fails randomly."
---

# ByteDance ModelArk — Seedream stills + Seedance video

One key, one base URL, three jobs: **stills**, **image-to-video**, **video edit / multi-reference**.
Everything below was verified live on one account (region Asia Pacific Johor,
`ap-southeast-1`) between 2026-09-10 and 2026-09-15. Runner: `scripts/ark.py`.

```
BASE  https://ark.ap-southeast.bytepluses.com/api/v3
KEY   $ARK_API_KEY  (Bearer header)
```

Set the key in your environment first: `export ARK_API_KEY=<your ModelArk API key>`.

## Step 0 — check before spending (free)

```bash
python3 scripts/ark.py probe
```

Lists visible models and submits one throwaway task per video model. Open on 2026-09-15:
`seedance-1-5-pro-251215`, `dreamina-seedance-2-0-mini-260615`, `dreamina-seedance-2-5-260628`. **The catalogue
lists models the account has NOT switched on** — they only fail at submit with
`ModelNotOpen`. Buying a plan does not open them. Fix: Console > Model activation,
`ai.byteplus.com/ark/region:ap-southeast-1/openManagement?tab=ComputerVision`, toggle
the model on. "Free Credits Only Mode" at the top of that page stops paid spend.

## Which model (decide by cost, not by name)

| Job | Model id | Cost measured | Notes |
|---|---|---|---|
| Photoreal still | `seedream-5-0-260128` | cents (~19k tokens) | `seedream-4-5` 404'd on the account tested. Canvas floor **3,686,400 px**: `2560x1920` ok, `2048x1536` rejected |
| i2v workhorse | `seedance-1-5-pro-251215` | **$0.13** / 720p 5s no audio | The tested account came with 2M free tokens (~18 clips). Half the RunPod price |
| i2v cheap/fast | `dreamina-seedance-2-0-mini-260615` | ~$0.15 | |
| Locked identity, long take, second-level direction, edit | `dreamina-seedance-2-5-260628` | $0.51 480p · **$1.16 720p** · $2.84 1080p per 5s | 4–30 s, up to 50 refs (30 img / 10 vid / 10 audio), task types: i2v, extension, **edit** |

`tokens = width*height*fps*duration / 1024`. **Audio doubles the rate** at the same token
count ($0.26 vs $0.13 on 1.5-pro) and the API default is audio ON, so always send
`generate_audio:false` explicitly unless someone decided to pay for it.

Rule: **1.5-pro for volume, 2.5 only where a locked face, a >10 s take, or per-second
direction earns its 9× price.**

## Stills (Seedream)

```bash
echo "<prompt>" | python3 scripts/ark.py image out.jpg --size 2560x1920
```

POST `/images/generations` `{model, prompt, size, response_format:"url", watermark:false}`.
The URL is signed and short-lived — download immediately. Realism recipe that read as a
real phone photo across 18 shots (see `references/prompting.md`):
*candid photograph, shot on a phone camera, 26mm, ONE light direction with real falloff,
imperfect white balance, off-centre handheld framing, not a render, not staged, no text,
no logos.*

## Image-to-video (Seedance 1.5 Pro)

```bash
echo "<motion prompt>" | python3 scripts/ark.py video still.png out.mp4 \
    --model seedance-1-5-pro-251215 --res 720p --dur 5 --ratio 9:16
```

POST `/contents/generations/tasks` with `content:[{type:"text",text},{type:"image_url",
image_url:{url}, role:"first_frame"}]`, then poll GET `/contents/generations/tasks/<id>`
every 15 s until `status=="succeeded"`; file is at `content.video_url`. On 1.5-pro sizing
is passed as **flags appended to the prompt text** (`--resolution 720p --duration 5
--ratio 9:16 --camerafixed true`); on 2.5 the same things are top-level JSON fields
(`resolution, duration, ratio`) — the script handles both.

- Base64 `data:image/png;base64,…` works for images. Output keeps the still's aspect.
- **Real human faces are refused at submit** (`InputImageSensitiveContentDetected.
  PrivacyInformation`, HTTP 400), even AI-generated faces, even as first_frame. Animal or
  object heads pass. Fallback: RunPod named endpoint `seedance-v1-5-pro-i2v`, or
  blur the face (see Edit below).
- **The motion prompt is what the safety filter reads**, not the image. Describe the
  motion on the object, not on the people.
- Camera moves written in the prompt are mostly ignored; bake push-ins in ffmpeg.
  Prompt motion as a physical event in the scene ("the table is STRUCK, dust jumps").
- Seedance holds the approved composition ~2 s then drifts. Cut windows by motion MINUS
  drift from frame 0, never motion alone. First ~1 s is dead; never cut from frame 0.

## Multi-reference + second-level timeline (Seedance 2.5)

Refs are bound by `@Image1`, `@Video1` mentions in the prompt, in the order of the
`content` array. Write the prompt as a timeline — this is the lever against drift:

```
<style>, referring to @Image1.
0-3s: <action>. Sound effect: <sfx>.
3-6s: <action>. Sound effect: <sfx>.
Subtitles: none
```

```bash
python3 scripts/ark.py video --model dreamina-seedance-2-5-260628 --ref a.png --ref b.png \
    --res 720p --dur 8 --ratio 9:16 out.mp4 <<< "<timeline prompt>"
```

Known misreads: "heads swivel to follow X" became "swivel to face the viewer".

## Video edit (replace a person, keep every other pixel)

`omni_reference_task_type:"edit"`, `ratio:"adaptive"`, `duration:-1`, `reference_video`
role. Costs 93k tokens ≈ $1 per 5 s 480p; a full 30 s 720p edit was 1.27M tokens ≈ $13.5
and 6–15 min.

```bash
python3 scripts/ark.py video --model dreamina-seedance-2-5-260628 --edit \
    --video "https://<signed url>" --ref asset://asset-XXXX --res 720p out.mp4 <<< "Editing task: in @Video1 replace the driver, whose face is blurred, with the man in @Image1 … keep everything else unchanged"
```

- `reference_video` **must be a web URL** (base64 refused). Recipe: upload to
  your own bucket (`gs://<your-bucket>/…`) and sign with python `google.cloud.storage`
  (`generate_signed_url(version="v4", expiration=3h)`); gsutil signurl lacks pyopenssl.
- The face gate applies to reference videos too. **Boxblur the face in the source**; edit
  mode re-renders the person from the prompt/refs and keeps everything else. Mask must be
  a head-tight tracked ellipse, not a rectangle — edit repaints only the person, so any
  other blurred pixels stay blurred. Convert VFR sources to CFR 24 before frame-indexed
  masking.
- A real face you're allowed to use: Console > My assets > Real human (liveness check,
  free tier, console only) → `asset://<id>` as `reference_image`. Keep the verified
  asset id somewhere you can reuse it. Trusted outputs of the same account
  (Seedance videos, Seedream images, 30 days) also pass.
- The "black-and-white driving video" trick is omni-REFERENCE (video = motion, images =
  identity), not edit; use edit when the rest of the frame must stay pixel-identical.
- `OutputVideoSensitiveContentDetected` fails randomly on identical inputs → resubmit.
- Mux original audio with `-af apad -t <video length>`, never `-shortest`.

## Errors, in the order you'll meet them

| Error | Meaning | Fix |
|---|---|---|
| `ModelNotOpen` | model not activated | toggle in Console > Model activation |
| 404 on a model id | wrong/old id | run `probe`; ids are dated and not guessable |
| `InputImageSensitiveContentDetected.PrivacyInformation` | real face in input | blur, use asset://, or RunPod |
| `reference_video must be provided as a web url` | base64 video | signed GCS URL |
| size rejected (image) | below 3.69 MP | `2560x1920` / `2560x1440` / `1920x2560` |
| `OutputVideoSensitiveContentDetected` | random output moderation | resubmit unchanged |
| `InvalidParameter.TaskTypeConstraint … ratio` | 2.5 given `ratio` + first_frame | drop `ratio`; output follows the image |
| `AccessDenied` | model not opened (2.0-fast, 1.0-pro-fast as of 2026-09-15) | activate in console or use 1.5-pro / 2.0-mini / 2.5 |

## Do / don't

- Do run `probe` once per session before a batch. Do state cost to the user first,
  and show ONE finished result before a batch.
- Do submit in parallel (3 concurrent on 2.5, 180 RPM) and poll all ids after.
- Don't leave `generate_audio` unset. Don't write "slow" in sports prompts. Don't put
  the key in a chat message; if it has ever been pasted into one, rotate it.

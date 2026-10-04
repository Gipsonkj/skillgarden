# Vendor APIs: Runway, ByteDance ModelArk (Seedance), fal, LTX-2, FLUX 3, Atlas Cloud and the model landscape

> Distilled from: rw-generate-video (runwayml/skills, MIT); genmedia (fal-ai-community/skills, MIT per README); ltx2 (digitalsamba/claude-code-video-toolkit, MIT); flux-3-video (black-forest-labs/skills, MIT); bytedance-modelark (Gipsonkj/skillgarden, MIT); vox-director models-and-gotchas (Alisa0808/vox-director, MIT); video (coreyhaines31/marketingskills, MIT); video-editing (affaan-m/everything-claude-code, MIT).

Model names, prices and limits change monthly. Treat the tables as a starting point: list the live models or schema before the first paid call, and quote cost from the vendor, not from memory. Gemini Omni has its own file (vendor-gemini-omni.md); avatars are in vendor-heygen-avatars.md.

## Rules for every vendor

1. Credentials come from environment variables only (`RUNWAYML_API_SECRET`, `ARK_API_KEY`, `FAL_KEY`, `GEMINI_API_KEY`, `MINIMAX_API_KEY`, `ATLASCLOUD_API_KEY`, `HEYGEN_API_KEY`, `MODAL_LTX2_ENDPOINT_URL`). Never pass a key as a CLI flag (it leaks into shell history), never write it into the user's project, never echo it.
2. Before the first paid call, state the model, seconds per clip, number of clips, approximate cost and the retry ceiling. Get a yes.
3. Generation POSTs create billable jobs, so don't auto-retry them. Polling GETs may retry. Save task/request IDs; after an interruption, poll the saved ID before resubmitting.
4. Prefer local files uploaded through the vendor over arbitrary remote URLs. Treat generated media as untrusted input to later automation.
5. Name outputs `yyyy-mm-dd-hh-mm-ss-<slug>.mp4` in the user's working directory. Report the path; don't read the video back. Pull frames to check it.
6. Never invent endpoint or model IDs. Search or list them, then inspect the schema before custom parameters (a guessed field gives a 422).
7. Batch at most 2 to 3 concurrent jobs per vendor unless its docs say more; queues congest.

## Model landscape (late 2026 snapshot, verify live)

| Model family | Strength | Typical clip | Notes |
|---|---|---|---|
| Veo 3 / 3.1 (Google) | Top photoreal quality, native synced audio | 4 to 8 s | `veo3.1_fast` for drafts |
| Gemini Omni Flash | Edits, extensions to 40 s, references, readable text | 3 to 10 s | See vendor-gemini-omni.md |
| Runway Gen-4.5 / Gen-4 Turbo / Aleph | Motion control, temporal consistency, video-to-video | 5 to 10 s | Turbo needs an image |
| Seedance 1.5 Pro / 2.x (ByteDance) | Cheapest working i2v first-party (~$0.13 per 720p 5 s), references (image+video), per-second timelines, person replacement edits | 4 to 30 s | Blocks celebrities and real faces; see ModelArk below |
| Kling (Kuaishou) | Long takes, cheap per second; allows real people and brands where others block | 5 s to 2 min | Use for consented real-person content |
| Hailuo / MiniMax | Character consistency across shots | short | |
| Pika | Fast, simple effects, i2v | 5 to 15 s | Less camera control |
| LTX-2.3, Wan 2.x, Hunyuan (open weights) | Self-hosted, no API fee, LoRAs | ~5 to 8 s | Wan 2.1/2.2 are Apache-2.0; LTX and Hunyuan have community licences (check revenue limits). Wan prompting: [wan.md](wan.md) |
| FLUX 3 video (BFL) | t2v, keyframes/continuation, audio and dialogue, product ads | short | Draft first, then enhance |

Quick picks: highest quality plus audio → Veo; volume or cost → Kling or Seedance; consistent character → Hailuo or reference-capable models; self-hosted brand control → LTX/Wan; edit an existing clip → Runway Aleph, Seedance 2 or Gemini Omni.

## Runway (`RUNWAYML_API_SECRET`)

Official skill: runwayml/skills `rw-generate-video` (a `uv run <runway-skill-dir>/scripts/generate_video.py` wrapper that submits, polls and downloads; not bundled here, install it from that repo).

| Model | Input | Credits/s (vendor list) | Use |
|---|---|---|---|
| `seedance2` | text, image and/or video refs, up to 15 s | 36 | Product ads, long clips, refs; default when unsure |
| `gen4.5` | text and/or image | 12 | High quality general purpose |
| `gen4_turbo` | image required | 5 | Fast, cheap i2v drafts |
| `gen4_aleph` | video + text/image | 15 | Video editing/transformation |
| `veo3` | text/image | 40 | Premium |
| `veo3.1` / `veo3.1_fast` | text/image | 20-40 / 10-15 | Quality / fast drafts |

Ratios are pixel strings: `1280:720`, `720:1280`, `960:960` (seedance2 adds `1112:834`, `834:1112`, `1470:630`). Typical call:

```bash
uv run <runway-skill-dir>/scripts/generate_video.py --prompt "Camera slowly pulls back, product glints" \
  --image-url ./product.jpg --model gen4_turbo --ratio 720:1280 --duration 5 \
  --filename 2026-10-03-14-20-00-product-reveal.mp4
```

Errors: `SAFETY.INPUT.*` is moderation (rephrase or change the input); `ASSET.INVALID` is a bad file format; 429 is a rate limit (back off).

## ByteDance ModelArk (BytePlus): Seedance first-party (`ARK_API_KEY`)

Seedance (and Seedream stills, see the image-creation skill) straight from ByteDance, no reseller markup. Base `https://ark.ap-southeast.bytepluses.com/api/v3`, Bearer key. Facts below were verified on one account (Asia Pacific, `ap-southeast-1`) in September 2026; ids are dated and not guessable. Runner: `scripts/bytedance-modelark/ark.py` (Python stdlib only; it calls only the BytePlus API and downloads the signed result URL it returns).

**Step 0, free:** `python3 scripts/bytedance-modelark/ark.py probe` lists visible models and submits one throwaway 1-pixel task per video model (a rejection costs nothing). The catalogue lists models the account has not switched on; they fail only at submit with `ModelNotOpen`, and buying a plan doesn't open them. The user toggles them in Console > Model activation; "Free Credits Only Mode" on that page stops paid spend.

| Job | Model id (Sept 2026) | Measured cost | Notes |
|---|---|---|---|
| i2v workhorse | `seedance-1-5-pro-251215` | $0.13 per 720p 5 s, no audio | Sizing goes as flags in the prompt text |
| i2v cheap and fast | `dreamina-seedance-2-0-mini-260615` | ~$0.15 | |
| Locked identity, long take, per-second direction, edit | `dreamina-seedance-2-5-260628` | $0.51 480p, $1.16 720p, $2.84 1080p per 5 s | 4 to 30 s; up to 30 image, 10 video, 10 audio refs; i2v, extension, edit |

- `tokens = width * height * fps * seconds / 1024`. **Audio doubles the rate** ($0.26 vs $0.13) and the API default is audio on: always send `generate_audio: false` (the script does unless `--audio`).
- Use 1.5-pro for volume; pay the ~9x for 2.5 only where a locked face, a take over 10 s or per-second direction earns it.

```bash
A=scripts/bytedance-modelark/ark.py
echo "<motion prompt>" | python3 $A video still.png out.mp4 --model seedance-1-5-pro-251215 --res 720p --dur 5 --ratio 9:16
python3 $A video --model dreamina-seedance-2-5-260628 --ref a.png --ref b.png --res 720p --dur 8 --ratio 9:16 out.mp4 <<< "<timeline prompt>"
python3 $A video --edit --video "https://<signed url>" --ref asset://<asset-id> --res 720p out.mp4 <<< "<edit prompt>"
```

The script submits to `POST /contents/generations/tasks`, polls `GET .../tasks/<id>` every 15 s (default timeout 1800 s), saves `content.video_url` and prints the token usage. Run several in parallel (3 concurrent on 2.5, 180 RPM) and let each poll.

API facts:
- `content` is an array: the text, then `image_url` parts with role `first_frame` or `reference_image`, and `video_url` with role `reference_video`. Prompt mentions `@Image1`, `@Video1` bind in array order.
- 1.5-pro takes `--resolution 720p --duration 5 --ratio 9:16 --camerafixed true` appended to the prompt text; 2.x takes `resolution`, `duration`, `ratio` as top-level fields. With a `first_frame` on 2.5, leave `ratio` out (the output follows the image; otherwise `InvalidParameter.TaskTypeConstraint`).
- Images may be base64 data URIs (output keeps the still's aspect). Reference **videos must be web URLs**: upload to your own bucket and sign it (e.g. a GCS v4 signed URL valid 3 h via `google.cloud.storage`; `gsutil signurl` needs pyopenssl).

Prompting Seedance:
- Write motion as a physical event in the scene ("the table is struck, dust jumps"), one movement per product clip, violent verbs for action, never "slow" in a sports prompt. State permanence for what must survive ("stays stationary, unchanged in shape"). Avoid glass, pours, mirrors and hand-to-hand object swaps.
- Camera words are unreliable on 1.5-pro i2v: a September batch mostly ignored them, while an August job whose whole prompt was the camera instruction did zoom in. Prompt one move alone, measure the clip, and fall back to an ffmpeg push-in.
- Put the subject on a diagonal, already past centre; a dead-centre symmetric still gives the clip nowhere to travel. A rising column tends to come back as a rigid helix: generate it falling and `-vf reverse`. Wrong-direction action: trim the window and reverse.
- 2.5 timeline format (the lever against drift):
  ```
  Photoreal handheld, referring to @Image1 as the scene and @Image2 as the person.
  0-2s: he lifts the cup, steam rises. Sound effect: porcelain clink.
  2-5s: he turns to the window; a tram passes. Sound effect: distant tram bell.
  Subtitles: none
  ```
  Known misread: "heads swivel to follow X" became "swivel to face the viewer".
- After generation, score motion as mean inter-frame luma delta (under 2 frozen, 2 to 4 weak, 4 to 8 good, over 8 violent). Seedance holds the approved composition about 2 s then drifts, and the first ~1 s is dead: choose cut windows by `motion - 0.75 * drift_from_frame0 - 0.12 * lateness`, never from frame 0.

Faces, consent and edits:
- Real human faces are refused at submit (`InputImageSensitiveContentDetected.PrivacyInformation`, HTTP 400), AI-generated faces and first frames included, and reference videos are checked too. Animal and object heads pass.
- Routes the gate allows: a liveness-verified "Real human" asset of the consenting person (Console > My assets, console only) passed as `asset://<id>`, and the account's own trusted outputs (its Seedance videos and Seedream images, 30 days). Keep a verified asset id for reuse. Never use these to show someone who hasn't agreed to it.
- **Edit** (`omni_reference_task_type: "edit"`, `ratio: "adaptive"`, `duration: -1`) replaces one person and keeps every other pixel. The person being replaced is anonymised first with a head-tight tracked ellipse blur, not a rectangle (edit repaints only the person, so other blurred pixels stay blurred); convert VFR sources to CFR 24 before frame-indexed masking. Prompt skeleton: "Editing task: in @Video1 replace <the person>, whose face is blurred, with the person in @Image1 ... keep every movement, the timing, the cuts and the camera exactly unchanged; only <the person> and their clothing change." Cost: about 93k tokens (~$1) per 5 s at 480p; a 30 s 720p edit was 1.27M tokens (~$13.5) and 6 to 15 min.
- Omni-reference (a driving video gives the motion, images give identity) is a different task type; use edit when the rest of the frame must stay identical.
- Mux the original audio back with `-af apad -t <video length>`, never `-shortest`.
- The input check reads the prompt as well as the image: a harmless scene refused over body-focused wording usually passes when the motion is written on the object (the fan spins, papers lift). This is for false refusals, never for getting restricted content through.

| Error | Meaning | Fix |
|---|---|---|
| `ModelNotOpen` / `AccessDenied` | Model not activated on the account | User toggles it in Model activation, or use an open model from `probe` |
| 404 on a model id | Old or guessed id | Run `probe` |
| `InputImageSensitiveContentDetected.PrivacyInformation` | Real face in an input | Verified asset, trusted output, or a non-human subject |
| `reference_video must be provided as a web url` | Base64 video | Signed bucket URL |
| `InvalidParameter.TaskTypeConstraint ... ratio` | `ratio` plus `first_frame` on 2.5 | Drop `ratio` |
| `OutputVideoSensitiveContentDetected` | Output moderation fails at random on identical inputs | Resubmit unchanged, once or twice |

Run `probe` once per session before a batch, state the cost, and show one finished clip before batching. Never paste the key into chat; if it ever was, rotate it.

## fal.ai via the `genmedia` CLI (`FAL_KEY`)

One CLI for 1,200+ endpoints (image, video, audio, 3D).

| Command | Purpose |
|---|---|
| `genmedia run "<prompt>" --json` | Smart routing: classifies the prompt and picks a default endpoint; the `routed` block says which ran |
| `genmedia models "<query>" --json` / `--category text-to-video` | Discover endpoints (never invent IDs) |
| `genmedia schema <endpoint> --json` | Exact input fields before custom params |
| `genmedia pricing <endpoint>` | Cost per call; quote it before running |
| `genmedia run <endpoint> --prompt ... --async --json` | Queue long video jobs; returns `request_id` |
| `genmedia status <endpoint> <request_id> --download "./out/{request_id}_{index}.{ext}" --json` | Poll and save |
| `genmedia upload ./photo.jpg --json` | Local file to fal CDN URL for i2v/edit inputs |

Always pass `--json` when you parse the output. Save with `--download`, not curl. The vendor's installer is a `curl | bash` script: tell the user to run it themselves rather than running it for them.

## LTX-2.3 self-hosted (Modal, `MODAL_LTX2_ENDPOINT_URL`)

- 22B DiT on an A100-80GB; about 2.5 min per 5 s clip; about $0.20 to $0.25 per clip; cold start 60 to 90 s.
- Frame count must satisfy `(n-1) % 8 == 0`: 25 (~1 s), 49, 73, 97, 121 (~5 s default), 161, 193 (~8 s, practical max). 24 fps.
- Width/height divisible by 64: 768x512 default, 1024x576 (16:9), 576x1024 (9:16), 512x512.
- `--quality fast` (15 steps) for drafts, `standard` (30) for finals; `--seed` for repeatability.
- Ambient audio only; ~30% of takes show stray logo/text from training data (re-seed); can't render readable text.
- Style LoRAs prepend a trigger word and may change the default resolution.
- Good uses: atmospheric b-roll, animated slide backgrounds (feed a screenshot with "gentle particle drift, very slight camera drift"), subtle portrait animation, stylized character cameos where exact lip sync doesn't matter.
- Licence: community licence, free under $10M revenue. Check before client work.

## FLUX 3 video (Black Forest Labs)

Route to the smallest set of steps:
1. **Prompt doctor** until the brief is ready (decides the shot structure).
2. **Cinematic inserts** (new t2v shot) OR **keyframes and continuation** (supplied images/video constrain the result). One of the two.
3. **Audio and dialogue** only when sound matters.
4. **Generate:** submit, poll, enhance, download, review.

Draft before committing: a full render takes minutes and the chosen draft replays at full quality. A hand-off between steps carries outcome, mode (t2v / i2v-keyframes / v2v / draft-enhance), source roles, invariants, delivery (duration, aspect, resolution), camera, audio, text strategy and risks. Exact typography and frame-accurate sync need a post-production plan, not generation. Docs: docs.bfl.ai.

## Atlas Cloud aggregator (`ATLASCLOUD_API_KEY`)

One key fronts many models (image, video, TTS, music, SFX). Learned gotchas:
- List live models with `GET https://api.atlascloud.ai/api/v1/models` (no auth; keep `display_console: true`). Per-model schemas are published as JSON.
- Send a real `User-Agent` header; the default Python UA gets a 403 from the WAF.
- Video, audio, TTS and music submit to `/api/v1/model/generateVideo`; images and background removal to `/generateImage`; poll `/model/prediction/{id}`. A persistent HTTP 500 on poll means the job failed; read `message`.
- Download outputs with curl if urllib disconnects.
- Rough costs: keyframe still ~$0.08, i2v clip ~$0.10 to $0.13, TTS ~$0.015, music ~$0.11; a 30 s six-beat film is about $0.80 to $1.00.

## Voice and music generation (when the video needs them)

- TTS: pick the voice to fit topic, language and gender requested; an unspecified voice silently defaults. Generate the full narration in one configuration so the voice doesn't change between sections.
- Audio-scene models (seed-audio and similar) add pauses and SFX to bare narration and vary length wildly. Pin a speaker and ask for "clean dry studio vocal only, no music, no effects", or use plain TTS.
- Music: request instrumental, then trim in the mix. Offer two contrasting beds; generated music defaults to "hype".
- Always take timing from the actual audio (ASR word timestamps), never from the script.
- Voice cloning only from an authorized sample of the person, with consent recorded. Never infer a voice from a face.
- For deeper audio work use the sibling `audio-generation` super skill when it is available.

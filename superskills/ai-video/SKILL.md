---
name: ai-video
description: Make, edit, generate and deliver video. Covers picking the route (code, generative, footage, avatar); HyperFrames (composition, CLI, registry, Studio, design spec, narration, beats, audio-reactive); Remotion renders; video-model prompts and APIs (Seedance, Wan, Kling, Gemini Omni/Veo, Runway, Luma Ray, ModelArk, fal, LTX-2, FLUX 3); avatars (HeyGen, Synthesia); ffmpeg transcript cuts (fillers, 9:16 reframe, grade, EDL); editable hand-offs to DaVinci Resolve, Premiere Pro, Final Cut Pro (FCPXML) and CapCut; Descript edits; captions, talking-head recuts; beat-cut music videos; launch, promo and explainer videos; delivery (loudness, safe zones, QA). Use when asked to make a video, promo, explainer, reel/short, captioned clip, music video, AI b-roll, animate a photo, screen-record a web app, edit footage, add subtitles, write a video-model prompt, call a video API (Seedance, Runway, Veo, Luma, Synthesia), batch-render Remotion, cut for Resolve, Premiere, Final Cut or Descript, or export for TikTok/Reels/YouTube.
---

# AI video

Turn a brief, a script, footage, a still or a music track into a finished, checked video file. This skill picks the production route, plans the piece, drives the tools (HyperFrames, ffmpeg, video-model APIs, avatar APIs) and verifies the output before anyone calls it done. Storyboards as a deliverable belong to the sibling super skill `storyboarding`; UI and web animation, motion curves and kinetic-type craft belong to `motion-animation`. Use those when the job is a plan or an animation rather than a video file.

## Core principles

1. **Pick the route before any tool.** Words that must be read, brand marks, data and UI go in code (HyperFrames/HTML, ffmpeg overlays). Organic motion, camera moves and photoreal texture go to a video model. Real footage gets edited, not regenerated. Most good pieces are hybrids: generated plate underneath, code text on top.
2. **One message, one sentence, before a storyboard.** Write "This video tells [audience] that [message]" and the destination. Destination sets aspect: Reels/TikTok/Shorts 1080x1920, feed 1080x1080 or 1080x1350, YouTube/web 1920x1080.
3. **Hook in the first 1.5 to 3 seconds.** Never open on a logo or a definition. Most viewers decide by second 3.
4. **Something changes every 3 to 6 seconds.** No single generated shot over about 7 s; no static card over 8 s unless it is a deliberate payoff hold.
5. **Every line of on-screen text holds long enough to read:** about 1 s plus 0.3 s per word at 1x on a phone. Fast in, then hold. Never fast in, then gone.
6. **Audio is the clock.** Lock narration (or the music track) first; real measured durations drive scene lengths, captions and cuts. Never retime audio to hide a sync problem.
7. **Cut on word boundaries and real silences.** Pad cut edges 30 to 200 ms, prefer silences of 400 ms or more, add 30 ms audio fades at every join.
8. **Generative clips: start from a strong still, one camera move per clip, prompt the motion, not the picture.** Generate 3 to 4 takes, keep the best, never polish a bad take. Draft cheap (low res, fast model), finalize once.
9. **Burned-in captions go last** in the filter chain or composition, after every overlay, timed from word-level transcripts in output-timeline time.
10. **Keep text and faces out of platform UI.** Vertical apps cover roughly the top 6 to 10%, bottom 18 to 22% and right 12 to 14%. Check with a contact sheet, not a guess.
11. **Mix to a target, then measure.** Social -14 LUFS, presenter or podcast -16 LUFS, true peak at or below -1 dBTP; music ducked about 12 to 15 dB under speech. Report numbers; you cannot listen.
12. **Look at the output before showing it.** Probe duration, size, fps and audio; pull a contact sheet at scene midpoints and every cut boundary; fix and re-check, at most 3 loops, then flag what remains.
13. **Paid generation and rendering are gated.** State model, seconds, rough cost and retry ceiling before the first paid call; render the final only after the user approves a preview. Stop after 3 rejected paid takes and ask.
14. **Credentials only from environment variables;** never in prompts, CLI flags, committed `.env` files or logs. Real people's faces or voices need recorded consent; never route around a provider's likeness or content filters. Turn tool telemetry off, and send no feedback reports or project uploads the user didn't ask for.
15. **Keep originals untouched.** Write every output to a new path (`edit/`, `renders/`), cache transcripts per source and never re-transcribe an unchanged file.

Conflicts resolved: sources disagree on on-screen text inside generated video. Gemini Omni can render short text, but other models smear it. The stronger rule wins: exact or brand text goes in code, and at most 1 to 3 incidental words go in the model, then you check them. On loudness, -14 LUFS (platform targets) beats the -16 presenter default for anything posted to social apps.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "TikTok teaser with b-roll and a screen recording: `references/plan-and-route.md` → `references/generative-prompting.md` → `references/explainers-and-promos.md` → `references/delivery-qa.md`; shot list from `storyboarding` → `references/shot-lists-and-boards.md`; voiceover from `audio-generation` → `references/voiceover-tts.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Decide the route, the brief, length, structure and beat sheet | [references/plan-and-route.md](references/plan-and-route.md) |
| Pick HyperFrames or Remotion; build or edit a HyperFrames composition; CLI loop (lint, check, snapshot, preview, render, batch); registry blocks; Studio timeline layout and safe zones; telemetry and upload defaults; Remotion projects (zod props, calculateMetadata, CLI and batch renders, Lambda limits and cost) | [references/hyperframes-workflows.md](references/hyperframes-workflows.md) |
| HyperFrames creative direction: design spec (`frame.md`), palettes and video type sizes, narration script, beat and rhythm plan, storyboard sheet, data scenes, audio-reactive visuals | [references/hyperframes-creative-direction.md](references/hyperframes-creative-direction.md) + `scripts/hyperframes-creative/extract-audio-data.py` |
| Write a text-to-video, image-to-video, extend or video-edit prompt (any model) | [references/generative-prompting.md](references/generative-prompting.md) |
| Prompting Seedance (1.5 Pro, 2.0, 2.0 mini, 2.5): version choice, limits, t2v / i2v / multi-reference prompts, 2.5 per-second timelines, extension and edits, dialogue, failure fixes, picking the usable window | [references/seedance.md](references/seedance.md) |
| Prompt or run Wan (2.2 open weights self-hosted, 2.5 to 3.0 hosted): photoreal still to clip, warp-free motion, negative prompts, lip-sync | [references/wan.md](references/wan.md) |
| Prompt Kling (2.6, 3.0, Omni, O1): long takes, camera moves, multi-shot, dialogue, start/end frames, Motion Control, video edits | [references/kling.md](references/kling.md) |
| Gemini Omni Flash and Veo 3.1: generation, edits, extensions, loops, dialogue and lip-sync prompts | [references/vendor-gemini-omni.md](references/vendor-gemini-omni.md) + `scripts/gemini-omni-flash-api/` |
| Pick a video model and where to run it (own key, self-hosted with no API fee, cheapest host); Runway, ByteDance ModelArk (Seedance i2v, multi-reference, person-replacement edits), Luma Ray 3.2, fal genmedia, LTX-2, FLUX 3, MiniMax, Atlas Cloud: models, costs, calls | [references/vendor-apis.md](references/vendor-apis.md) + `scripts/bytedance-modelark/ark.py` |
| AI presenter or avatar video, pick a provider (HeyGen Video Agent, Synthesia Video API and MCP: templates, translation, dubbing; photo-to-talking clip, lip sync) | [references/vendor-heygen-avatars.md](references/vendor-heygen-avatars.md) |
| Cut, trim, splice, de-um, reframe, grade or assemble real footage from a transcript; hand off to an editor, pick an NLE: DaVinci Resolve (scripting API timeline, markers, render jobs), Premiere Pro (FCP 7 XML, AAF, UXP, Adobe for creativity connector, multicam, Auto Reframe, SRT captions), Final Cut Pro (FCPXML) or CapCut (SRT hand-off); edit in Descript (API, MCP, Underlord) | [references/footage-editing-ffmpeg.md](references/footage-editing-ffmpeg.md) + `scripts/video-use/` |
| Captions, subtitles (pick a transcriber), karaoke words, talking-head recut with cards and lower-thirds | [references/captions-talking-head.md](references/captions-talking-head.md) |
| Beat-synced music video, montage cut to music, beat-cut film from AI stills (onset sync, style lock, type cards, render gate), SFX and the audio mix | [references/music-beat-cut.md](references/music-beat-cut.md) + `scripts/music-to-video/` |
| Faceless explainer; product launch, promo or site-tour video from a URL, script or brief; brag video; collage explainer; real screen recording of a (signed-in) web app on macOS for a tour, demo or ad | [references/explainers-and-promos.md](references/explainers-and-promos.md) + `scripts/screen-record-web/scripts/record.mjs` |
| Export specs, loudness, safe zones, poster frame, final QA and hand-off | [references/delivery-qa.md](references/delivery-qa.md) + `scripts/lanshu-create-ai-presenter-video/finalize_delivery.sh` |

Call a capability directly with "use ai-video: <task>", for example "use ai-video: captions" or "use ai-video: runway prompt".

## Scripts included (run only when the reference says so)

| Script | Does | Needs |
|---|---|---|
| `scripts/video-use/transcribe.py` | Word-level verbatim transcript (ElevenLabs Scribe), cached per source | `ELEVENLABS_API_KEY`, `requests`, ffmpeg; uploads audio, so ask first |
| `scripts/video-use/pack_transcripts.py` | Packs transcripts into phrase lines `[start-end] text` for picking cuts | Python only |
| `scripts/video-use/timeline_view.py` | Filmstrip plus waveform PNG for a time range, for decisions at cut points | numpy, Pillow, ffmpeg |
| `scripts/video-use/render.py` + `grade.py` | EDL to video: per-segment extract, grade, 30 ms fades, concat, overlays, subtitles last, -14 LUFS | ffmpeg |
| `scripts/music-to-video/analyze-beatgrid.py` | Track to `audiomap.json`: beats, energy phases, key moments, hard stops | librosa, numpy, soundfile, ffmpeg |
| `scripts/hyperframes-creative/extract-audio-data.py` | Audio or video to per-frame RMS and frequency bands (JSON) for audio-reactive compositions | numpy, ffmpeg; local only |
| `scripts/gemini-omni-flash-api/` | Upload media, prep/trim clips, generate, edit or extend video with Gemini Omni Flash | `GEMINI_API_KEY`, `google-genai>=2.19`, ffmpeg |
| `scripts/bytedance-modelark/ark.py` | `probe` which Seedance models are open (free), then Seedance i2v, 2.5 multi-reference and edit jobs: submit, poll, download | `ARK_API_KEY`, Python stdlib; paid per clip, state cost first |
| `scripts/screen-record-web/scripts/record.mjs` | `--doctor`, `--open` (a person signs in), `--route x.json --check`, then record a real cursor-driven screen take of a web app; run from `scripts/screen-record-web/` | macOS, node 22+, Chrome, clang (Xcode CLT), ffmpeg optional; Screen Recording permission |
| `scripts/lanshu-create-ai-presenter-video/finalize_delivery.sh` | Two-pass loudness, master and share encodes, full decode, black/freeze count, 3x3 contact sheet, JSON report | ffmpeg, ffprobe, jq |

Don't install missing dependencies on your own. Tell the user what is missing and the one install command.

## Other crafts

| When the request also needs | Use |
|---|---|
| A shot list, character sheets and per-shot prompts before a multi-shot film | `storyboarding` → `references/shot-lists-and-boards.md`, `references/keyframes-and-consistency.md`, `references/ai-video-prompts.md` |
| Voiceover, a music bed or SFX made from scratch, not just mixed | `audio-generation` → `references/voiceover-tts.md`, `references/music-generation.md`, `references/sound-effects.md` |
| Start frames or key art for image-to-video, kept consistent | `image-creation` → `references/prompting-fundamentals.md`, `references/editing-references-consistency.md` |
| Easing, choreography or kinetic type craft inside a scene | `motion-animation` → `references/motion-principles.md`, `references/hyperframes-animation.md` |
| Hooks, post captions and publishing for TikTok, Reels or Shorts | `social-media` → `references/short-form-video.md`, `references/publishing-apis.md` |
| A video ad that has to perform: angles, platform specs, testing | `ad-creation` → `references/short-form-video-ugc.md`, `references/platform-specs.md`, `references/testing-iteration.md` |
| A YouTube thumbnail or cover for the finished video | `poster-design` → `references/thumbnails.md` |
| The video as a looping or scroll-scrubbed hero on a website | `website-building` → `references/motion-and-scroll.md` |
| Running open video models (Wan, LTX) on your own or rented GPUs | `open-models` → `references/gpu-hosting-runpod-modal.md`, `references/vram-and-sizing.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Its site-capture and build scripts for launch, promo and site-tour videos | [product-launch-video](https://github.com/heygen-com/hyperframes/tree/main/skills/product-launch-video) (Apache-2.0; not copied: they depend on sibling skills and HeyGen audio services) |
| Its 35-style caption catalogue, run locally with transcription and segmentation | [embedded-captions](https://github.com/heygen-com/hyperframes/tree/main/skills/embedded-captions) (Apache-2.0) |
| ffmpeg recipes the guides skip, such as multicam sync, speed changes and LUTs | [ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill/tree/main) (MIT) |
| Runway's runner script that submits, polls and downloads | [rw-generate-video](https://github.com/runwayml/skills/tree/main/skills/rw-generate-video) (MIT; paid Runway credits) |
| Searching, pricing and running 1,200+ fal endpoints, plus its cinematography and UGC siblings | [genmedia](https://github.com/fal-ai-community/skills/tree/main/skills/genmedia) (MIT, stated in README; paid fal API) |
| The FLUX 3 specialists for keyframe continuation, audio and dialogue, and job submission | [flux-3-video](https://github.com/black-forest-labs/skills/tree/master/skills/flux-3-video) (MIT; needs a BFL API key) |
| LTX-2.3 on your own RunPod endpoint from the toolkit's Docker images | [ltx2](https://github.com/digitalsamba/claude-code-video-toolkit/tree/main/.claude/skills/ltx2) (MIT) |
| Remotion projects: rules for timing, audio, captions, 3D and rendering | [remotion-best-practices](https://github.com/remotion-dev/skills/tree/main/skills/remotion-best-practices) (no licence: read only; Remotion needs a company licence for teams over 3) |

## Default workflow

1. **Intake.** Read any existing project state first (`BRIEF.md`, `edit/project.md`, `hyperframes.json`). Then get the subject, input type (brief, URL, script, footage, still, music), destination and length. Ask one question at a time, and only when the answer changes the output.
2. **Route.** Choose code-rendered, generative, footage edit, avatar or hybrid with [plan-and-route.md](references/plan-and-route.md). State the choice in one line with the reason.
3. **Plan.** Echo the message sentence, then a beat table: time, on screen, motion, audio cue, and why the beat exists. For edits, write a 4 to 8 sentence strategy. Get approval before anything paid or slow.
4. **Lock audio.** Narration (TTS or recorded) or the music track. Transcribe or analyze it and use the real durations from now on.
5. **Make the pictures.** Build the scenes in HyperFrames, generate clips (fire independent generations in parallel), or cut footage from the EDL. Search the registry (`npx hyperframes catalog --query`) before hand-building any named look, and install blocks or assets before any parallel work.
6. **Assemble.** Mount scenes, media and transitions, mix (carve or duck the music under the voice), then captions last.
7. **Verify.** Run `npx hyperframes check` or probe the file, make a contact sheet at scene midpoints and cut boundaries, measure loudness. Fix the cheapest thing first, at most 3 passes.
8. **Approve and deliver.** Preview, then render on the user's yes. Run the delivery check, then hand over the path, duration, specs, contact sheet and the plan or EDL so later edits are easy.

## Done means

- [ ] Message sentence and destination stated; aspect and fps match the destination
- [ ] Hook lands in the first 3 s; no shot over about 7 s without a reason
- [ ] Every text hold passes the reading-time rule; exact text was set in code
- [ ] Captions word-synced (within about 80 ms), at most 2 lines, inside the safe zone, not over the face
- [ ] No audio pops at cuts; loudness and true peak measured and on target
- [ ] `hyperframes check` passes, or the file probes with the expected duration, size, fps and audio
- [ ] Contact sheet inspected; no black or frozen frames unless intended
- [ ] Paid calls, consent for real likeness or voice, and costs reported; no secrets in files or logs
- [ ] Output path, actual duration and specs reported; originals untouched

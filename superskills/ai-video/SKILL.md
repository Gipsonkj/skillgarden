---
name: ai-video
description: Make, edit, generate and deliver video with AI help. Covers picking the route (HTML/HyperFrames composition, generative text/image-to-video, footage edit, AI presenter); HyperFrames workflows (init, compositions, lint/check, render); prompting video models and vendor APIs (Gemini Omni/Veo, Runway, fal genmedia, LTX-2, FLUX 3, MiniMax, HeyGen avatars); cutting footage by transcript with ffmpeg (trim, silence/filler removal, reframe 9:16, grade, EDL renders); captions and subtitles, talking-head recuts with overlay cards; beat-synced music videos, product launch/brag videos and faceless explainers; delivery (loudness, safe zones, platform specs, QA contact sheets). Use when asked to make a video, promo, explainer, reel/short, captioned clip, music video, AI b-roll, animate a photo, edit/cut footage, add subtitles, write a video-model prompt, call a video API, or export for TikTok/Reels/YouTube.
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
14. **Credentials only from environment variables;** never in prompts, CLI flags, committed `.env` files or logs. Real people's faces or voices need recorded consent; never route around a provider's likeness or content filters.
15. **Keep originals untouched.** Write every output to a new path (`edit/`, `renders/`), cache transcripts per source and never re-transcribe an unchanged file.

Conflicts resolved: sources disagree on on-screen text inside generated video. Gemini Omni can render short text, but other models smear it. The stronger rule wins: exact or brand text goes in code, and at most 1 to 3 incidental words go in the model, then you check them. On loudness, -14 LUFS (platform targets) beats the -16 presenter default for anything posted to social apps.

## Pick the right guide

| Task | Read |
|---|---|
| Decide the route, the brief, length, structure and beat sheet | [references/plan-and-route.md](references/plan-and-route.md) |
| Build or edit a HyperFrames composition; pick a HyperFrames workflow; lint, check, preview, render | [references/hyperframes-workflows.md](references/hyperframes-workflows.md) |
| Write a text-to-video, image-to-video, extend or video-edit prompt (any model) | [references/generative-prompting.md](references/generative-prompting.md) |
| Gemini Omni Flash (Veo family) generation, edits, extensions, loops | [references/vendor-gemini-omni.md](references/vendor-gemini-omni.md) + `scripts/gemini-omni-flash-api/` |
| Runway, fal genmedia, LTX-2, FLUX 3, MiniMax, Atlas Cloud: models, costs, calls | [references/vendor-apis.md](references/vendor-apis.md) |
| AI presenter or avatar video (HeyGen Video Agent, photo-to-talking clip, lip sync) | [references/vendor-heygen-avatars.md](references/vendor-heygen-avatars.md) |
| Cut, trim, splice, de-um, reframe, grade or assemble real footage from a transcript | [references/footage-editing-ffmpeg.md](references/footage-editing-ffmpeg.md) + `scripts/video-use/` |
| Captions, subtitles, karaoke words, talking-head recut with cards and lower-thirds | [references/captions-talking-head.md](references/captions-talking-head.md) |
| Beat-synced music video, montage cut to music, SFX and the audio mix | [references/music-beat-cut.md](references/music-beat-cut.md) + `scripts/music-to-video/` |
| Faceless explainer, product launch / brag video, collage explainer | [references/explainers-and-promos.md](references/explainers-and-promos.md) |
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
| `scripts/gemini-omni-flash-api/` | Upload media, prep/trim clips, generate, edit or extend video with Gemini Omni Flash | `GEMINI_API_KEY`, `google-genai>=2.19`, ffmpeg |
| `scripts/lanshu-create-ai-presenter-video/finalize_delivery.sh` | Two-pass loudness, master and share encodes, full decode, black/freeze count, 3x3 contact sheet, JSON report | ffmpeg, ffprobe, jq |

Don't install missing dependencies on your own. Tell the user what is missing and the one install command.

## Default workflow

1. **Intake.** Read any existing project state first (`BRIEF.md`, `edit/project.md`, `hyperframes.json`). Then get the subject, input type (brief, URL, script, footage, still, music), destination and length. Ask one question at a time, and only when the answer changes the output.
2. **Route.** Choose code-rendered, generative, footage edit, avatar or hybrid with [plan-and-route.md](references/plan-and-route.md). State the choice in one line with the reason.
3. **Plan.** Echo the message sentence, then a beat table: time, on screen, motion, audio cue, and why the beat exists. For edits, write a 4 to 8 sentence strategy. Get approval before anything paid or slow.
4. **Lock audio.** Narration (TTS or recorded) or the music track. Transcribe or analyze it and use the real durations from now on.
5. **Make the pictures.** Build the scenes in HyperFrames, generate clips (fire independent generations in parallel), or cut footage from the EDL. Install registry blocks or assets before any parallel work.
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

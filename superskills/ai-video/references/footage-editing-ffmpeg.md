# Editing real footage: transcript-driven cuts with ffmpeg

> Distilled from: video-use (browser-use/video-use, MIT); ffmpeg-skill (kajisho5/ffmpeg-skill, MIT); video-editing (affaan-m/everything-claude-code, MIT); general-video (heygen-com/hyperframes, Apache-2.0); vox-director models-and-gotchas (Alisa0808/vox-director, MIT). Scripts in `scripts/video-use/` are copied as-is from browser-use/video-use (MIT, license beside them).

The value of AI here is compression: turn hours of footage into a tight cut. Audio leads, visuals follow. Plan from the transcript, check the pictures only at decision points, and confirm the strategy before you touch the cut.

## Hard rules (correctness, not taste)

1. **Subtitles are applied last**, after every overlay, or overlays hide them.
2. **Per-segment extract, then lossless concat** (`-c copy`). Don't build one giant filtergraph when overlays follow; that encodes every segment twice.
3. **30 ms audio fades at every segment boundary:** `afade=t=in:st=0:d=0.03,afade=t=out:st={dur-0.03}:d=0.03`. Without them every cut pops.
4. **Overlays are PTS-shifted** so their frame 0 lands at the window start: `setpts=PTS-STARTPTS+T/TB`.
5. **Subtitle times are output-timeline times:** `out = word.start - segment_start + segment_offset`.
6. **Never cut inside a word.** Snap edges to word boundaries.
7. **Pad cut edges 30 to 200 ms** (ASR timestamps drift 50 to 100 ms). Example that shipped: 50 ms before the first kept word, 80 ms after the last.
8. **Word-level verbatim ASR only.** Phrase/SRT mode loses gap data; normalized fillers lose the editing signal.
9. **Cache transcripts per source;** never re-transcribe an unchanged file.
10. **Confirm the strategy in plain English before cutting.**
11. **All outputs in `<videos_dir>/edit/`;** sources stay untouched. Never overwrite an output you didn't create in this job.
12. **Several animation overlays are built in parallel** (one sub-agent per overlay, one output file each).
13. **Match each clip's audio and video length before concat or xfade.** Probe both streams (`ffprobe -show_entries stream=codec_type,duration`). Give the clip one length: the video's, or the audio's when the sound runs more than one frame past the picture (AI clips that carry sound often do). Reach the longer length by holding the last frame (`tpad=stop_mode=clone:stop_duration=<gap>`); when the overshoot is under one frame (an AAC tail of about 20 ms), trim the audio instead. Both streams then end together at every join. Otherwise the next clip starts after the longer stream and leaves a hole in the picture or drifts sync. If holding frames pushes the total past the target length, say so and let the user choose between keeping the sound and trimming the tails.

## Process

1. **Inventory:** `ffprobe` every source (duration, fps, resolution, codecs, audio tracks, VFR suspicion: `r_frame_rate` differs from `avg_frame_rate`).
2. **Transcribe** (word-level). Choose with the user:
   - Hosted verbatim (keeps "um", speaker labels): `python3 scripts/video-use/transcribe.py clip.mp4 [--num-speakers 2] [--audio-track 1]`. Needs `ELEVENLABS_API_KEY` and uploads the audio, so ask first. Writes `edit/transcripts/<name>.json`.
   - Local, free: `npx hyperframes transcribe audio.mp3 --json` (Whisper small.en) or another local Whisper. Fine for captions; it tends to drop fillers.
   OBS-style recordings often put the mic on audio track 1, not 0.
3. **Pack** for reading: `python3 scripts/video-use/pack_transcripts.py --edit-dir edit/` writes `takes_packed.md`, phrase lines like `[002.52-005.36] S0 Ninety percent of ...`, broken on silences of 0.5 s or more. This is the main reading view, about a tenth of the tokens of raw JSON.
4. **Pre-scan** once for slips, mis-speaks and phrasings to avoid.
5. **Converse:** describe what you see; ask questions shaped by the material (type, target length/aspect, look, pacing, must-keep and must-cut moments, graphics, grade, subtitles).
6. **Propose** a 4 to 8 sentence strategy. Wait for a yes.
7. **Write `edl.json`.** For multi-take material, brief a sub-agent to pick the best take per beat and order by beat, not by source.
8. **Drill in** at ambiguous cut points: `python3 scripts/video-use/timeline_view.py clip.mp4 41.0 46.5 -o edit/verify/cut3.png` (filmstrip, waveform, word labels, silence shading). It is not a scanning tool; use it at decisions only.
9. **Render a preview:** `python3 scripts/video-use/render.py edit/edl.json -o edit/preview.mp4 --preview` (1080p CRF 22) or `--draft` (720p) to check cut points only.
10. **Self-eval** on the rendered output, not the sources: `timeline_view` ±1.5 s around every cut, plus the first 2 s, last 2 s and 2 to 3 midpoints. Look for jumps or flashes, waveform spikes (pops), subtitles hidden behind overlays, wrong overlay frames, grade drift. Check duration with `ffprobe`. Measure loudness (see delivery-qa.md). Cap at 3 fix passes, then flag what's left.
11. **Final render** on approval: `render.py edl.json -o edit/final.mp4 [--build-subtitles] [--fps 30]` (loudness normalized to -14 LUFS / -1 dBTP by default; `--no-loudnorm` to skip).
12. **Persist:** append a session note to `edit/project.md` (strategy, decisions, reasoning, outstanding). Next session, read it first.

## EDL format (input to render.py)

```json
{
  "version": 1,
  "sources": {"C0103": "/abs/path/C0103.MP4", "C0108": "/abs/path/C0108.MP4"},
  "ranges": [
    {"source": "C0103", "start": 2.42, "end": 6.85, "beat": "HOOK",
     "quote": "Ninety percent of what...", "reason": "Cleanest delivery, stops before the slip at 38.46."},
    {"source": "C0108", "start": 14.30, "end": 28.90, "beat": "SOLUTION",
     "quote": "...", "reason": "Only take without the false start."}
  ],
  "grade": "neutral_punch",
  "overlays": [{"file": "edit/animations/slot_1/render.mp4", "start_in_output": 0.0, "duration": 5.0}],
  "subtitles": "edit/master.srt",
  "total_duration_s": 87.4
}
```

`grade` is a preset (`subtle`, `neutral_punch`, `warm_cinematic`, `none`), `auto`, or a raw ffmpeg filter string. Grades are applied per segment during extraction.

## Cut craft

- Candidate cuts come from silences: 400 ms or more is cleanest; 150 to 400 ms is usable after a visual check; under 150 ms is mid-phrase, so don't cut there.
- Keep peaks: extend past punchlines to include the laugh or reaction. `(laughs)`, `(applause)` and `(sighs)` mark beats.
- Speaker handoffs want 400 to 600 ms of air (less for fast social, more for documentary).
- Every cut must work on both tracks. Don't reason about audio and video separately.
- Multi-take selection: start/end on word boundaries, prefer silences, keep an unavoidable slip only when no better take exists (note it in `reason`), and self-correct when over the runtime budget.
- Structure archetypes: launch (hook, problem, solution, benefit, example, CTA); tutorial (intro, setup, steps, gotchas, recap); interview (question, answer, follow-up); travel (arrival, highlights, quiet moments, departure); documentary (thesis, evidence, counterpoint, conclusion).

## Overlays and animation slots

Each overlay is one sub-agent with a self-contained brief: one-sentence goal, absolute output path, exact spec (resolution, fps, codec, pix_fmt, CRF, duration), palette as concrete values, font path, frame-by-frame timeline with easing, an anti-list ("no extra titles"), a deliverable checklist (render, ffprobe duration), and "do not ask questions; pick the obvious interpretation". Engine per slot: HyperFrames (web-style UI, kinetic type, transparent WebM via `--format webm`), Manim (equations, diagrams), PIL frames plus ffmpeg (simple counters and cards), or Remotion if the user already uses it.

Duration and sync: an explanation overlay needs 5 to 7 s (simple) or 8 to 14 s (diagram). Start it `reveal_duration` seconds before the payoff word so the landing frame meets the spoken word. Hold the last frame 1 s or more. Easing is never linear (ease-out cubic for reveals, ease-in-out for continuous draws). For typed text, centre on the full string's width or the text slides as it grows.

## Colour grade (only when asked)

Reason about the image, change one thing, look again. Mental model is ASC CDL: per channel `out = (in * slope + offset) ^ power`, then saturation; slope moves highlights, offset shadows, power midtones. Apply per segment during extraction. Check skin tones before going strong. Log footage (S-Log, V-Log) looks grey until a LUT is applied; iPhone HDR goes flat if pushed through an SDR path without tone mapping.

## ffmpeg recipes (verified patterns)

```bash
# Probe
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,avg_frame_rate -show_entries format=duration -of json in.mp4

# Frame-accurate segment (re-encode); lossless -c copy only when the cut lands on keyframes
ffmpeg -ss 12.30 -to 15.45 -i in.mp4 -c:v libx264 -crf 18 -preset medium -c:a aac -af "afade=t=in:d=0.03,afade=t=out:st=3.12:d=0.03" seg01.mp4

# Concat segments losslessly
for f in seg*.mp4; do echo "file '$PWD/$f'"; done > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy assembled.mp4

# Equalize one clip whose audio runs 0.40 s past the picture (before concat); both streams then end together
ffmpeg -i clip.mp4 -vf "tpad=stop_mode=clone:stop_duration=0.40" -af apad -t <audio length> -c:v libx264 -crf 18 -c:a aac clip_eq.mp4

# Find silences (cut candidates) / scene changes
ffmpeg -i in.mp4 -af silencedetect=noise=-30dB:d=0.4 -f null - 2>&1 | grep silence_
ffmpeg -i in.mp4 -vf "select='gt(scene,0.3)',showinfo" -vsync vfr -f null - 2>&1 | grep pts_time

# Reframe 16:9 -> 9:16: crop (loses ~70% of the width; set x for off-centre subjects) or blurred fill (keeps the whole picture)
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy vertical.mp4
ffmpeg -i in.mp4 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:2,eq=brightness=-0.1[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:a copy vertical_blur.mp4

# Proxy for fast work; audio for transcription
ffmpeg -i in.mp4 -vf scale=960:-2 -c:v libx264 -preset ultrafast -crf 28 proxy.mp4
ffmpeg -i in.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le audio.wav

# Slow a short clip to fill a longer slot instead of freezing the last frame
ffmpeg -i clip.mp4 -vf "setpts=1.25*PTS" -an slowed.mp4

# Contact sheet, 1 frame per second (also finds burned-in captions)
ffmpeg -i in.mp4 -vf "fps=1,scale=160:-1,tile=10x5" sheet.png

# Single frame to JPG (full-range fix)
ffmpeg -ss 3.2 -i in.mp4 -frames:v 1 -vf "format=yuvj420p" -q:v 2 frame.jpg
```

## Gotchas

- `-c copy` cuts start on the previous keyframe (often 1 to 10 s early) and can open on a frozen frame. Re-encode when accuracy matters.
- VFR phone and screen recordings: re-encode to constant fps (`-fps_mode cfr -r 30`) before mixing sources; copy-cuts on VFR are unreliable.
- Don't mix sources with different fps or sample rates in one concat without re-encoding.
- `yuv420p` needs even width and height (`scale=trunc(iw/2)*2:trunc(ih/2)*2`).
- Phone footage carries a rotation tag; probe it before computing crops.
- A minimal ffmpeg build may lack `libass`/`drawtext`. Then render captions as PNGs (Pillow) and `overlay` them.
- The `blend` filter needs both inputs in the same pixel format (e.g. `gbrp`) or the frame turns magenta.
- `sidechaincompress` output follows the sidechain's length: `apad` the voice to full duration, or `-shortest` cuts a music-only ending.
- After `xfade` transitions, recompute every later start time (each transition overlaps by its duration) so narration and captions stay in sync.
- Audio sync between devices aligns sound, not lips. Check lip sync by eye; for recordings over about 10 min from separate devices, correct drift.
- Don't normalize ambience or near-silence (-40 LUFS or quieter) to a speech target; you only raise the noise.

## Anti-patterns

Hand-tuned "moment scores" (the model picks better from the transcript); burning subtitles before overlays; one-pass filtergraphs with overlays; linear easing; unverified web fonts; stock whooshes on every cut; hard audio cuts; editing before the strategy is confirmed; re-transcribing cached sources; assuming what kind of video it is before looking.

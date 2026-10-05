# Editing real footage: transcript-driven cuts with ffmpeg

> Distilled from: video-use (browser-use/video-use, MIT); ffmpeg-skill (kajisho5/ffmpeg-skill, MIT); video-editing (affaan-m/everything-claude-code, MIT); general-video (heygen-com/hyperframes, Apache-2.0); vox-director models-and-gotchas (Alisa0808/vox-director, MIT). Scripts in `scripts/video-use/` are copied as-is from browser-use/video-use (MIT, license beside them). Desktop-editor section: Blackmagic's DaVinci Resolve scripting README and 21.1 announcement, Adobe's Premiere help and UXP reference, Adobe's adobe-for-creativity skills (Apache-2.0), Apple's FCPXML reference, Final Cut Pro 7 XML reference and Final Cut Pro guide, CapCut's help pages and Descript's API and MCP docs, in our own words.

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

## Finishing in a desktop editor: Resolve, Premiere Pro, Final Cut Pro, CapCut, Descript

Use this when the user grades, mixes or finishes in an editor, or wants the rough cut as an editable timeline instead of a flat file. Claude still does the transcript work and writes `edl.json`; the editor then owns the grade, the mix and the last tweaks. The EDL stays the source of truth: regenerate the hand-off file from it rather than patching the exported timeline.

**Pick a tool**

| The user's situation | Use | Why |
|---|---|---|
| Already finishes in, or pays for, one of these | That one, by its route below | Nothing new to learn or buy; every route starts from the same `edl.json` |
| Someone else finishes the cut | Ask which editor and version they use; don't guess | Premiere imports FCP 7 XML, not `.fcpxml`; FCPXML 1.9 needs Final Cut Pro 10.4.9+; UXP needs Premiere 25.6+ |
| Wants a finished file, no editor, no account | Plain ffmpeg (`render.py`, above) | Free and local; the EDL renders straight to MP4 |
| Grades or mixes in Resolve, batch renders from presets, or you must read back a person's edit | DaVinci Resolve | Local scripting API, no account or key; some calls need Studio, not the free version |
| Editor finishes in Premiere Pro | FCP 7 XML (default), AAF via Resolve, or UXP | Claude writes and checks the XML without Premiere |
| Quick social highlight from an uploaded copy, Adobe sign-in | Adobe for creativity connector | Works on Creative Cloud uploads only; cuts by relevance, not exact timestamps |
| Finishes in Final Cut Pro | FCPXML | No API or connector; files are the exchange |
| Quick social edit with CapCut's caption styles | CapCut: rendered MP4 plus `.srt` | Imports SRT as editable captions; don't drive it from code |
| Team edits in Descript, or wants Underlord filler removal, Studio Sound and a share link | Descript (MCP or API; API on paid plans) | Cloud transcript editing; not frame-exact, and it can't hand a timeline to another editor |

### DaVinci Resolve: build the timeline through its scripting API

Pick it for a cut the user will keep working on in Resolve, batch renders from Resolve presets, or reading back a timeline a person has edited.

- **Access:** Resolve's own Python or Lua scripting API, local only, no account or key. Resolve must be running; it can also be started without its UI using the `-nogui` launch option. The reference is the `README.txt` Blackmagic installs at `/Library/Application Support/Blackmagic Design/DaVinci Resolve/Developer/Scripting/` on macOS (with `Examples/`). Read the copy that matches the installed version.
- **Setup (macOS):** Python 3.6 or newer, 64-bit, and three environment variables: `RESOLVE_SCRIPT_API="/Library/Application Support/Blackmagic Design/DaVinci Resolve/Developer/Scripting"`, `RESOLVE_SCRIPT_LIB="/Applications/DaVinci Resolve/DaVinci Resolve.app/Contents/Libraries/Fusion/fusionscript.so"`, `PYTHONPATH="$PYTHONPATH:$RESOLVE_SCRIPT_API/Modules/"`.
- **Permission:** by default scripts run from Resolve's Console or the command line on the same machine; Resolve Preferences can narrow that to the Console only or open it to the local network. Keep it on the machine; network access lets other machines drive the project.
- **Free vs Studio:** the API is shared, but a call can return `False` when it needs a Studio function the free version lacks, when system requirements aren't met, or when its Extras download is missing. IntelliSearch, Slate ID and Speech Generator functions need their Extras downloaded first.
- **Resolve 21.1 AI assistants:** Blackmagic's 21.1 announcement names Claude, Claude Code and ChatGPT Codex as assistants that can analyse projects, organise media, adjust settings and batch render, and adds 20 scripting APIs. It does not say which edition has it or where it is switched on, so check the release notes in the user's copy before promising it. Treat its actions like a script's: confirm deletes and renders first.

Minimal EDL to timeline (run from the project folder while Resolve is open):

```python
import json
import DaVinciResolveScript as dvr

resolve = dvr.scriptapp("Resolve")
manager = resolve.GetProjectManager()
project = manager.GetCurrentProject()
pool = project.GetMediaPool()
edl = json.load(open("edit/edl.json"))

items = {k: pool.ImportMedia([path])[0] for k, path in edl["sources"].items()}
fps = 30.0  # use each source's real rate: GetClipProperty() with no key lists every property
clips = [{"mediaPoolItem": items[r["source"]],
          "startFrame": round(r["start"] * fps), "endFrame": round(r["end"] * fps)}
         for r in edl["ranges"]]
timeline = pool.CreateTimelineFromClips("Rough cut v1", clips)
if not timeline:
    raise SystemExit("Timeline not created: check paths, frame ranges and the project frame rate")
manager.SaveProject()
```

Calls that matter:

| Job | Call |
|---|---|
| Import media / an editorial file | `MediaPool.ImportMedia([paths])`; `MediaPool.ImportTimelineFromFile(path, {"timelineName": ..., "importSourceClips": True})` reads AAF, EDL, XML, FCPXML, DRT, ADL and OTIO |
| Build or extend a cut | `CreateTimelineFromClips(name, [clipInfo])`, `AppendToTimeline([clipInfo])` with `mediaPoolItem`, `startFrame`, `endFrame`, and optional `trackIndex`, `recordFrame`, `mediaType` (1 video only, 2 audio only) |
| Flag decisions for the editor | `Timeline.AddMarker(frameId, "Green", name, note, duration, customData)`; `GetMarkers()` reads them back |
| Read a person's edit back | `Timeline.Export(path, resolve.EXPORT_OTIO, resolve.EXPORT_NONE)`; AAF and EDL exports need a real subtype (for EDL: `EXPORT_CDL`, `EXPORT_SDL`, `EXPORT_MISSING_CLIPS` or `EXPORT_NONE`) |
| Render | `project.LoadRenderPreset(name)`, `project.SetRenderSettings({"TargetDir": ..., "CustomName": ...})`, `job = project.AddRenderJob()`, `project.StartRendering([job])`, then poll `IsRenderingInProgress()` and `GetRenderJobStatus(job)` |
| Captions in Resolve | `Timeline.CreateSubtitlesFromAudio({...})`, or `TranscribeAudio()` on a Media Pool folder or item |

Resolve gotchas:

- Failures come back as return values such as `False` or `None`. Check every return value before the next step.
- Frame numbers are timeline frames. Read `Timeline.GetStartFrame()` before placing markers or `recordFrame`, then check the first marker by eye.
- `Timeline.DeleteClips([items], True)` ripple-deletes. Show the exact clips and wait for a yes; never delete media from the pool on your own.
- Render jobs write files and can take a long time: state preset, target folder and file names before `StartRendering`.
- Third-party Resolve MCP servers on GitHub wrap this same local API. Read one fully before installing it, and prefer the documented calls above.

### Premiere Pro: an XML timeline the editor keeps editing

Pick it when the editor finishes in Premiere. Hand over a timeline that points at the original camera and audio files, plus captions as a sidecar file, not just a flattened MP4.

| Route | Use when | How |
|---|---|---|
| Final Cut Pro 7 XML (default) | Any case; Claude writes and checks it without Premiere | Script below, or from a Resolve timeline: `timeline.Export(path, resolve.EXPORT_FCP_7_XML, resolve.EXPORT_NONE)`. The editor opens it with File > Import. It is the format Premiere's own File > Export > Final Cut Pro XML writes. |
| AAF | Resolve is installed and the editor prefers AAF | `timeline.Export(path, resolve.EXPORT_AAF, resolve.EXPORT_AAF_NEW)`. File > Import in Premiere makes a sequence named after the file and a bin of its media; anything that didn't translate is listed in an "FCP Translation Results" file in the bin. |
| UXP script | The sequence must be built inside the open project | Premiere 25.6 or later; a person runs it from Adobe's UXP Developer Tool (see below). |
| Adobe for creativity connector | A quick social draft from an uploaded copy only | It works on Creative Cloud uploads, never on the editor's project (see below). |

Not FCPXML: Premiere can't import Final Cut Pro X `.fcpxml` directly (Adobe points to the XtoCC converter), so for Premiere write FCP 7 XML.

FCP 7 XML facts that matter (root `<xmeml version="5">`):
- All times are whole frames at the `rate`: `timebase` plus `ntsc` (`TRUE` applies the NTSC reduction, so 29.97 fps is timebase 30 with ntsc TRUE).
- `clipitem` needs `name`, `duration`, `rate`, `start`, `end`. `in`/`out` are frames in the source media; `start`/`end` are the clip's place in the sequence.
- `file` needs `duration`, `rate` and a `name` or `pathurl`. `pathurl` must start with `file://localhost` or `file:///`, point at a local volume and %-escape characters that aren't legal in a URL. Define each file once with an `id`, then reuse it as `<file id="..."/>`.
- `sourcetrack` (`mediatype` `video` or `audio`, plus `trackindex`) says which track of the file a clip uses.
- `marker` needs `name`, `in`, `out` (`-1` means no out point) and takes a `comment`: one per beat, with the EDL `reason`, tells the editor why each cut is there.

Minimal writer. Picture comes from each range's `source`; sound comes from `audio_source` (an external recorder) or the same file. `sync_offsets` holds each source's offset in seconds to one shared clock (source time + offset = clock), measured from matching timecode or by cross-correlating each camera's scratch audio with the recorder. Say how you measured it.

```python
import json, subprocess
from urllib.parse import quote
from xml.sax.saxutils import escape

edl = json.load(open("edit/edl.json"))
TB, NTSC = 30, True                      # match the cameras: 29.97 = 30/True, 25 = 25/False, 23.976 = 24/True
fps = TB * 1000 / 1001 if NTSC else TB
fr = lambda s: round(s * fps)
RATE = f"<rate><timebase>{TB}</timebase><ntsc>{'TRUE' if NTSC else 'FALSE'}</ntsc></rate>"
off, length, written = edl.get("sync_offsets", {}), {}, set()

def media_frames(k):
    if k not in length:
        out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                              edl["sources"][k]], capture_output=True, text=True, check=True).stdout
        length[k] = fr(float(out))
    return length[k]

def file_el(k):
    if k in written:
        return f'<file id="{k}"/>'
    written.add(k)
    return (f'<file id="{k}"><name>{escape(k)}</name><pathurl>file://{quote(edl["sources"][k])}</pathurl>'
            f'{RATE}<duration>{media_frames(k)}</duration></file>')

def clip(cid, k, src_in, n, rec, kind):
    return (f'<clipitem id="{cid}"><name>{escape(k)}</name><duration>{media_frames(k)}</duration>{RATE}'
            f'<start>{rec}</start><end>{rec + n}</end><in>{src_in}</in><out>{src_in + n}</out>{file_el(k)}'
            f'<sourcetrack><mediatype>{kind}</mediatype><trackindex>1</trackindex></sourcetrack></clipitem>')

video, audio, marks, rec = [], [], [], 0
for i, r in enumerate(edl["ranges"], 1):
    src, aud = r["source"], r.get("audio_source", r["source"])
    a, n = fr(r["start"]), fr(r["end"]) - fr(r["start"])
    video.append(clip(f"v{i}", src, a, n, rec, "video"))
    audio.append(clip(f"a{i}", aud, fr(r["start"] + off.get(src, 0) - off.get(aud, 0)), n, rec, "audio"))
    marks.append(f'<marker><name>{escape(r.get("beat", f"R{i}"))}</name><comment>{escape(r.get("reason", ""))}'
                 f'</comment><in>{rec}</in><out>-1</out></marker>')
    rec += n

open("edit/roughcut_fcp7.xml", "w", encoding="utf-8").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="5">'
    f'<sequence id="seq1"><name>Rough cut v1</name><duration>{rec}</duration>{RATE}'
    f'<media><video><track>{"".join(video)}</track></video><audio><track>{"".join(audio)}</track></audio></media>'
    f'{"".join(marks)}</sequence></xmeml>')
print("sequence frames:", rec)
```

Multicam: never assume angles and a separate recorder line up. Either cut between angles on V1 with the recorder's sound on A1 at measured offsets (the writer above), or hand over the files and let Premiere sync them: select the clips, Clip > Create Multi-Camera Source Sequence, and sync by Timecode (Sound Timecode for a separate recorder) or Audio; Offset Audio by shifts the audio-only clip by -100 to +100 frames.

Captions and vertical:
- Give captions as an `.srt` in sequence time, not burned in, when the editor will refine them. The editor imports it like media and drags it into the sequence; Premiere makes a caption track. Premiere also reads SCC, MCC, STL and DFXP/TTML sidecars.
- 9:16: Sequence > Auto Reframe Sequence, pick the target aspect ratio, and for a talking head set Motion Tracking to Slower Motion. It writes a duplicate sequence into an "Auto Reframe Sequences" folder and keeps the original. Or deliver your own tracked crop from ffmpeg. Either way, check a contact sheet for the face inside the vertical safe zone.

Check before handing over: the XML parses (`python3 -c "import sys,xml.dom.minidom; xml.dom.minidom.parse(sys.argv[1])" edit/roughcut_fcp7.xml`), the printed frame count matches the EDL total at that rate, and every source path exists. If Resolve is installed, also import the file with `MediaPool.ImportTimelineFromFile` and compare the duration. List every path the editor must relink if their drives differ, and say which route you used.

**UXP (scripting the open project).** Premiere's UXP DOM API reaches projects, sequences, tracks, clips and markers. No key; a person connects Premiere to the UXP Developer Tool and runs the code in its Playground (Play loads it, edits reload it). Calls that build a cut, all from the reference:
- `const app = require('premierepro')`, then `const project = await app.Project.getActiveProject()`. Methods are async; property reads are sync.
- `project.importFiles(paths, suppressUI, targetBin, asNumberedStills)`; find the items with `(await project.getRootItem()).getItems()` and `app.ClipProjectItem.cast(item)`.
- `project.createSequence(name)` or `createSequenceFromMedia(name, clipItems, targetBin)`.
- Inside `project.executeTransaction(compound => { compound.addAction(...) }, "Rough cut v1")` (one undo step): `clip.createSetInOutPointsAction(inTick, outTick)`, then `app.SequenceEditor.getEditor(sequence).createOverwriteItemAction(clip, timeTick, videoTrackIndex, audioTrackIndex)`. Times are `app.TickTime.createWithSeconds(s)`.
- Markers: `(await app.Markers.getMarkers(sequence)).createAddMarkerAction(name, markerType, startTick, durationTick, comments)`.
- `createRemoveItemsAction(selection, ripple, ...)` deletes: show the exact clips and wait for a yes. Try a new script on a copy of the project first.

**Adobe for creativity connector (Claude).** Adobe's official connector, added in Claude under Customize > Plugins (search Adobe), then Connectors > Connect; it works on web, desktop and Claude Code and signs in with Adobe. Its video tools work on files uploaded to Creative Cloud (an `assetId`), never on local paths or the editor's `.prproj`:
- `video_create_quick_cut` (`assetIds`, `target_duration`, `user_prompt`): one highlight cut picked by relevance from the transcript. `target_duration` is a soft target and may run over. It can't trim to exact timestamps or remove fillers.
- `video_render`: exact trims, and adding or replacing music, audio or images.
- `video_resize` (`assetId`, `width`, `height`, `mode` `letterbox`, `crop` or `stretch`): a plain resize; Adobe says Auto Reframe isn't available in Claude, so a 9:16 crop may cut off the face.
- Quick Cut returns a short-lived presigned URL: preview it at once, and re-upload it before resizing. Run one cut per request.
- Uploading an interview sends it to Adobe: ask first. Some features need an eligible Adobe plan.

### Final Cut Pro: FCPXML in, FCPXML out

Pick it when the user finishes in Final Cut Pro. There is no API or connector; the exchange is FCPXML files.

- **Into FCP:** File > Import > XML (or double-click the file). FCP creates the clips, events, projects or library the file describes; its Import preference decides whether media is copied or linked, and the user needs read access to every file.
- **Back out:** File > Export XML; choose the version (current or one of two older ones). Version 1.10 or later writes a `.fcpxmld` bundle; read the `Info.fcpxml` inside it.
- **Versions:** FCPXML 1.9 needs Final Cut Pro 10.4.9 or later; Apple's examples use 1.10. The file must follow Apple's DTD and be Unicode.
- **Structure:** `resources` (a `format`, and an `asset` per file with `<media-rep kind="original-media" src="file:///...">`), then `event` > `project` > `sequence format=...` > `spine` > `asset-clip` (`ref`, `offset`, `start`, `duration`, `audioRole`). Clips in the `spine` play in order.
- **Time:** rational seconds, such as `1001/30000s` per frame at 29.97 fps or `5s`. `offset` is the clip's place in the timeline, `start` its in point in the asset's own time, `duration` its length. Keep every value a whole number of frames, or FCP inserts gaps and warns.
- **Markers** sit inside an `asset-clip` and use that clip's source time, not timeline time: `<marker start="..." duration="1001/30000s" value="..."/>`; `completed="0"` makes a to-do, `chapter-marker` a chapter.
- Resolve exports FCPXML too: `resolve.EXPORT_FCPXML_1_10` (also 1_8 and 1_9).

```python
import json, subprocess
from urllib.parse import quote
from xml.sax.saxutils import quoteattr

edl = json.load(open("edit/edl.json"))
NUM, DEN = 1001, 30000                    # one frame = 1001/30000 s (29.97 fps); 25 fps = 1, 25. Camera files with picture and sound.
FORMAT = "FFVideoFormat1080p30"           # copy the format name from an FCPXML the user's FCP exported for this footage
fr = lambda s: round(s * DEN / NUM)
t = lambda frames: f"{frames * NUM}/{DEN}s"
res, ids, spine, rec = [f'<format id="r0" name="{FORMAT}"/>'], {}, [], 0
for k, p in edl["sources"].items():
    secs = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True, check=True).stdout)
    ids[k] = f"r{len(ids) + 1}"
    res.append(f'<asset id="{ids[k]}" start="0s" duration="{t(fr(secs))}" hasVideo="1" hasAudio="1" format="r0">'
               f'<media-rep kind="original-media" src="file://{quote(p)}"/></asset>')
for r in edl["ranges"]:
    a, n = fr(r["start"]), fr(r["end"]) - fr(r["start"])
    spine.append(f'<asset-clip name={quoteattr(r["source"])} ref="{ids[r["source"]]}" offset="{t(rec)}" start="{t(a)}" '
                 f'duration="{t(n)}" audioRole="dialogue"><marker start="{t(a)}" duration="{t(1)}" '
                 f'value={quoteattr(r.get("beat", "cut"))}/></asset-clip>')
    rec += n
open("edit/roughcut.fcpxml", "w", encoding="utf-8").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<fcpxml version="1.10"><resources>' + "".join(res) +
    '</resources><event name="Rough cut"><project name="Rough cut v1"><sequence format="r0"><spine>' +
    "".join(spine) + "</spine></sequence></project></event></fcpxml>")
```

After import, compare the first frame of two or three clips with the EDL `quote` lines; camera files that carry timecode are where a wrong `start` shows up first.

### CapCut: hand off files, don't drive it

Pick CapCut when the user finishes there, usually for quick social edits and its caption styles. Don't edit its project files from code; deliver files the user imports.

- **Hand-off:** the rendered cut (H.264 MP4 at the destination size) and captions as a UTF-8 `.srt`. In CapCut desktop, Captions > Add Captions imports an `.srt` or `.txt` file as editable text clips; CapCut on the web takes `.srt` only; the mobile app can't import subtitle files (imports made on desktop or web sync to it).
- If the user will style captions in CapCut, don't also burn them into the render.
- Keep the EDL and transcript; any later change is cheaper to re-render here than to redo by hand in CapCut.

### Descript: transcript editing in the cloud

Pick Descript when the user or their team edits there (podcasts, talking heads, screen recordings), or wants its Underlord edits (filler removal, Studio Sound, captions, highlight clips) and a share link. Stay with the EDL route above when the cut must be frame-exact or must open in another editor: the API's exports are transcripts (including SRT) and published media.

- **Access:** the hosted MCP at `https://api.descript.com/v2/mcp` signs in with Descript OAuth, no token. In Claude: Customize > Connectors, find Descript. In Claude Code: `claude mcp add --transport http descript https://api.descript.com/v2/mcp -s user`. Team or enterprise admins may need to allow third-party connectors first. Each connection reaches one Drive.
- **REST API:** base `https://descriptapi.com/v1`, header `Authorization: Bearer $DESCRIPT_API_TOKEN`. Create the token in Descript under Settings > API tokens; it is tied to one Drive; treat it like a password and keep it in the environment, never in a file in the repo. `GET /status` checks the token.
- **CLI:** `npm install -g @descript/platform-cli@latest` (Node 24 or later), then `descript-api config set api-key`; commands `import --name --media`, `agent --project-id --prompt`, `edit --new --prompt`.
- **Cost:** API access comes with every paid plan. Imports spend media minutes, Underlord edits spend AI credits; when either runs out the API answers 402.

| Job | Call |
|---|---|
| Import media, create a project | `POST /jobs/import/project_media`: `project_name` (or `project_id`), `add_media` (`{ref: {"url": ...}}` or `{ref: {"content_type", "file_size"}}` for a direct upload), `add_compositions` (`name`, `clips` of `{media}`), optional `language` (ISO 639-1), `callback_url` |
| Edit with Underlord | `POST /jobs/agent`: `prompt` plus `project_id` (or `project_name` for a new one), optional `composition_id`, `model` (default `auto`), `callback_url` |
| Job status | `GET /jobs/{job_id}`: `job_state` is `queued`, `running`, `stopped` or `cancelled`; when stopped, read `result` (imports report `media_seconds_used`; agent jobs report `agent_response`, `project_changed`, `ai_credits_used`). `DELETE /jobs/{job_id}` cancels. |
| Transcript or captions out | `POST /export/transcript`: `project_id`, `format` (`txt`, `markdown`, `html`, `rtf`, `docx`, `srt`), optional `include_speaker_labels`, `include_markers`, `timecodes` |
| Rendered file or share link | `POST /jobs/publish`: `project_id`, optional `composition_id`, `media_type` (`Video` or `Audio`), `resolution` (480p to 4K), `access_level` (`public`, `unlisted`, `drive`, `private`); the stopped job gives `share_url` and a time-limited `download_url` |
| Find work | `GET /projects`, `GET /projects/{project_id}`, `GET /search` |

```bash
H="Authorization: Bearer $DESCRIPT_API_TOKEN"
# 1. Import (the URL must allow HTTP Range requests; sign it for 12 to 48 hours)
curl -s -X POST https://descriptapi.com/v1/jobs/import/project_media -H "$H" -H "Content-Type: application/json" \
  -d '{"project_name": "Founder interview", "add_media": {"cam_a": {"url": "https://example.com/signed/cam_a.mp4"}},
       "add_compositions": [{"name": "Main", "clips": [{"media": "cam_a"}]}]}'
# 2. Poll until job_state is "stopped", then check result
curl -s https://descriptapi.com/v1/jobs/$JOB_ID -H "$H"
# 3. Underlord edit (spends AI credits)
curl -s -X POST https://descriptapi.com/v1/jobs/agent -H "$H" -H "Content-Type: application/json" \
  -d "{\"project_id\": \"$PROJECT_ID\", \"prompt\": \"Remove filler words and add Studio Sound to all clips\"}"
# 4. Captions for another editor
curl -s -X POST https://descriptapi.com/v1/export/transcript -H "$H" -H "Content-Type: application/json" \
  -d "{\"project_id\": \"$PROJECT_ID\", \"format\": \"srt\"}" -o edit/descript.srt
```

Gotchas:
- Local files: send `content_type` and `file_size` instead of `url`, then PUT the raw bytes to the returned `upload_urls` entry with `Content-Type: application/octet-stream` within 3 hours.
- No YouTube URLs. Google Drive and Dropbox links need direct-download URLs.
- Don't touch the project until its job has stopped. Job lists cover 7 days by default and 30 at most, so store job IDs and results yourself.
- There is no rendered-file download without publishing. Publishing makes a share page: show the project, composition, resolution and `access_level` (pick `private` or `unlisted` unless told otherwise) and wait for a yes.
- On 429, wait the `Retry-After` seconds (`X-RateLimit-Remaining` shows what is left).
- Importing uploads the footage to Descript: ask before sending anyone's recording.

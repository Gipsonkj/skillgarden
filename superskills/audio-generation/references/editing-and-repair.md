# Editing and repairing recorded speech

> Written from the vendors' official docs (Descript, Audacity, Adobe, iZotope, Apple), in our own words. Descript MCP details also from descript-mcp (descriptinc, Apache-2.0).

For audio someone recorded: a podcast, interview, lecture or voice memo that needs the ums
and long pauses cut, the voices cleaned and a finished file. Generating speech is in
`voiceover-tts.md`; the ffmpeg cleanup chain and loudness targets are in
`mixing-and-mastering.md`; cutting the picture of a video is `ai-video`.

## 1. Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| Already edits in (or pays for) one of the tools below | That one | Their projects, presets and habits live there; don't move them |
| Wants text-based editing: cut words, fillers and pauses, get a transcript and highlight clips | Descript (section 2) | Official MCP connector and API; Claude can import, edit with Underlord and export transcripts |
| Free, local, private, and Claude should run the steps | Audacity with scripting (section 3) | Free desktop editor Claude can drive over a local pipe |
| No account, no install, one noisy voice file | ffmpeg chain in `mixing-and-mastering.md` | Runs here; fine for hum, rumble and level, weak on loud noise under speech |
| One-click "make this voice sound studio-made", free | Adobe Podcast Enhance Speech (section 4) | Browser upload, no settings to learn; the user does the upload |
| Pro editor already in Creative Cloud, multitrack podcast | Adobe Audition (section 4) | Essential Sound repair, auto-ducking, loudness matching; manual |
| Hard repair: crowd, traffic, reverb, clicks, clipping | iZotope RX (section 5) | Dialogue Isolate and Repair Assistant; manual, batchable |
| On a Mac, music or podcast in GarageBand or Logic Pro | GarageBand / Logic Pro (section 6) | Already installed or owned; manual, Claude prepares files and checks the bounce |
| Speech must be separated from music by API | ElevenLabs Voice Isolator (`elevenlabs.md`) | API call, no app |

Don't guess which editor the user works in: if the request names none and nothing in the
project shows one, ask ("Do you edit in Descript, Audacity, Audition, GarageBand or Logic,
or should I do it here with ffmpeg?").

Whatever the tool: keep the raw file untouched, work on a copy, and measure the result with
ffmpeg (`mixing-and-mastering.md` section 2) before calling it done.

## 2. Descript (MCP connector or API)

Transcript-based editor: the script is the edit. Underlord, its AI co-editor, takes plain
instructions ("remove filler words and add Studio Sound").

**Access, pick one:**
- **claude.ai or the desktop app:** add Descript from the connector directory (Customize →
  Connectors, find Descript, click +), sign in, click Allow. OAuth, no token. Descript asks that
  **network egress** and **code execution** be on (Settings → Capabilities) and recommends Chat mode.
- **Claude Code:** `claude mcp add --transport http descript https://api.descript.com/v2/mcp`
  (OAuth in the browser on first use). With Descript's own skills:
  `/plugin marketplace add descriptinc/descript-mcp` then `/plugin install descript@descript`;
  read those skills before relying on them.
- **API (scripts, n8n, Zapier):** base URL `https://descriptapi.com/v1`, header
  `Authorization: Bearer $DESCRIPT_API_TOKEN`. The user creates the token in Descript under
  Settings → API tokens → Create token, picks the Drive, and exports it; it is shown once.
  Never ask for it in chat. CLI: `npm install -g @descript/platform-cli@latest` (Node 24+),
  then `descript-api config set api-key`.

MCP tools: `search_drive`, `list_projects`, `get_project`, `import_media`, `file_upload_ui`,
`prompt_project_agent`, `export_transcript`, `export_timeline`, `publish_project`,
`wait_for_job`, `list_jobs`, `cancel_job`.

**Costs, ask first.** Imports use the plan's media minutes; Studio Sound, Remove filler
words, Shorten word gaps and captions use AI credits. When either runs out, calls return
**402**. Before importing or running an edit, say what you will import or ask Underlord to do
and wait for a yes.

**Podcast clean-up flow (API shown; the MCP tools cover the same steps):**
```bash
# 1. local file: ask for an upload URL (content_type + file_size instead of url)
curl -X POST https://descriptapi.com/v1/jobs/import/project_media \
  -H "Authorization: Bearer $DESCRIPT_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"project_name":"Episode 42","add_media":{"episode42-raw.wav":{"content_type":"audio/wav","file_size":'"$(stat -f%z episode42-raw.wav)"',"language":"en"}},
       "add_compositions":[{"name":"Edit","clips":[{"media":"episode42-raw.wav"}]}]}'
# 2. PUT the bytes to upload_urls["episode42-raw.wav"].upload_url (valid 3 hours)
curl -X PUT -H "Content-Type: application/octet-stream" --data-binary @episode42-raw.wav "$UPLOAD_URL"
# 3. poll until job_state is "stopped", then check result.status
curl https://descriptapi.com/v1/jobs/$JOB_ID -H "Authorization: Bearer $DESCRIPT_API_TOKEN"
# 4. Underlord edit (another job; poll it the same way)
curl -X POST https://descriptapi.com/v1/jobs/agent -H "Authorization: Bearer $DESCRIPT_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id":"'"$PROJECT_ID"'","prompt":"Remove filler words, shorten word gaps longer than 1 second, and apply Studio Sound to both speakers"}'
# 5. transcript (returns the file itself)
curl -X POST https://descriptapi.com/v1/export/transcript -H "Authorization: Bearer $DESCRIPT_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id":"'"$PROJECT_ID"'","format":"markdown","include_speaker_labels":"changes"}' > episode42.md
```
A highlight is one more agent job: "Create a 60-second highlight reel of the strongest moment
as a new composition". Target a composition with `composition_id` (UUID, the 5-character ID
from the Descript URL, or the full project URL).

Fields that matter: import `url` must be reachable by Descript and support Range requests
(sign URLs for 12-48 h; Google Drive or Dropbox share links need converting to direct links;
YouTube URLs are refused); `language` is an ISO 639-1 code, auto-detected when omitted;
`callback_url` gets the job status POSTed when done. Transcript `format`: `txt`, `markdown`,
`html`, `rtf`, `docx`, `srt` (the MCP has no DOCX). Speaker labels: `off`, `changes`,
`every_paragraph`; `timecodes.frequency_seconds` adds timestamps.

**Gotchas:**
- **No audio download without publishing.** `POST /jobs/publish` (MCP `publish_project`)
  makes a Descript web link and returns signed URLs to the file; `access_level` is `public`,
  `unlisted`, `drive` or `private`, `media_type` `Video` or `Audio`. Publishing is publishing:
  show the composition and access level and wait for a yes. If the user said "don't publish",
  they export the audio in the app (Export → Local export: MP3, WAV or M4A, 44.1 or 48 kHz,
  Normalize to -14, -16, -18, -23 or -24 LUFS).
- Filler-word detection is English only. Studio Sound works on recorded audio, not on
  Descript's AI speech, and applies to the whole file everywhere it's used; if speech goes
  silent, the noise is too loud for it: lower its Intensity.
- One token or connection = one Drive; another Drive's project returns an error.
- Rate limits: on 429, wait the `Retry-After` seconds before retrying.
- Job records last 30 days.

## 3. Audacity (free, scripted over a local pipe)

Claude can drive a running Audacity through **mod-script-pipe**, a named pipe that takes the
same commands as Macros.

Setup (the user does it once): Edit → Preferences → Modules, set **mod-script-pipe** to
**Enabled**, restart Audacity. Audacity's own warning: anything that can write to the pipe can
make Audacity read and write files and run code, so enable it only on a single-user machine,
never on a server, and switch it off when the job is done.

Pipes: macOS/Linux `/tmp/audacity_script_pipe.to.<uid>` and `.from.<uid>`; Windows
`\\.\pipe\ToSrvPipe` and `\\.\pipe\FromSrvPipe`. A minimal client (Audacity must be open):
```python
import os
uid = os.getuid()
to_pipe = open(f"/tmp/audacity_script_pipe.to.{uid}", "w")
from_pipe = open(f"/tmp/audacity_script_pipe.from.{uid}")
def do(cmd):
    to_pipe.write(cmd + "\n"); to_pipe.flush()
    out = ""
    while True:
        line = from_pipe.readline()
        if line == "\n" and out:
            return out
        out += line

do('Import2: Filename="/abs/path/episode42-raw.wav"')
do('SelectAll:')
do('High-passFilter: frequency=80 rolloff=dB12')
do('Compressor: Threshold=-18 Ratio=3')
do('TruncateSilence: Threshold=-40 Action="Truncate Detected Silence" Minimum=1 Truncate=0.5')
do('LoudnessNormalization: LUFSLevel=-16')
do('Export2: Filename="/abs/path/episode42-clean.wav" NumChannels=1')
```
Useful commands: `Select: Start= End= Track=`, `SelectTime:`, `Normalize: PeakLevel=`,
`Limiter:`, `GetInfo: Type=Tracks Format=JSON`, `SaveProject2: Filename=`, and
`Help: Command="TruncateSilence"` to read a command's parameters in the installed version
(IDs and defaults change between versions). Booleans are `1`/`0`.

Gotchas:
- **Noise Reduction can't be scripted.** The user runs it by hand: select a noise-only
  stretch, Effect → Noise Removal and Repair → Noise Reduction → Get Noise Profile; then select
  the audio and apply (defaults: 6 dB reduction, sensitivity 6; use the lowest values that work and preview first).
- Export2 reuses the last export options saved for that format; `NumChannels` is 1 or 2.
- One project at a time; some commands need the window focused; errors are often silent, so
  check the exported file rather than trusting the reply.
- Truncate Silence finds pauses by level, not by meaning: it will also shorten dramatic
  pauses. It doesn't remove "um"; for fillers use Descript, or cut by word timestamps from
  `transcription.md`.

## 4. Adobe Podcast Enhance Speech and Adobe Audition

**Enhance Speech** (podcast.adobe.com) is a browser upload that
makes a voice sound studio-recorded. Adobe's Firefly Audio/Video API list has no Enhance
Speech endpoint, so the user uploads and downloads; Claude prepares the file and checks the result.
- Inputs: wav, mp3, m4a, aac, flac; video mp4, mov, m4v; up to 1 GB. The download comes back
  in the format you uploaded.
- Free: audio only, one file at a time, 30 min (500 MB) per file, 1 hour a day, no strength
  control. Paid (Firefly Pro): video, bulk upload, 2 h files, 4 hours a day, and sliders to
  mix speech, music and ambience back in.
- Upload a lossless WAV, not an MP3, since you get the same format back. If the result sounds
  over-processed, paid users lower the strength; free users mix the original under it with ffmpeg.

**Audition** is Adobe's desktop editor. No agent route; give the user exact steps:
- **Essential Sound** (Window → Essential Sound, on a clip in a Multitrack session): tag the
  clip **Dialogue**, tick **Repair** for Reduce Noise, Reduce Rumble (below 80 Hz), DeHum
  (50 or 60 Hz) and DeEss, each 0-10; **Loudness → Auto Match**. Tag the bed **Music** and tick
  **Ducking** to duck it under dialogue.
- **Noise Reduction** (Waveform Editor only): select at least half a second of noise only,
  Effects → Noise Reduction/Restoration → Capture Noise Print, select the audio, apply Noise
  Reduction. Reduce By 6-30 dB works; lower values avoid bubbly artifacts. For noise that
  changes, use Adaptive Noise Reduction; for sirens or phones, Sound Remover.
- **Match Loudness** (Window → Match Loudness): drop files in, Scan, pick a standard or set
  the target and Maximum True Peak, Run.

## 5. iZotope RX (heavy repair)

The repair standard for noise under speech, reverb, clicks, hum and clipping. Desktop app
and plug-ins; no agent route, so Claude writes the steps and checks the output.
- **Repair Assistant** (button at the top right of the RX Audio Editor): choose **Voice**,
  click **Learn** (no need to find a noise-only stretch), adjust Clean Up (De-noise, De-reverb,
  De-hum, De-click), Tone, De-Ess and De-Clip, then **Render**. RX Advanced can save the
  suggestion as a Module Chain.
- **Dialogue Isolate** (Standard and Advanced editions): separate gain sliders for Voice,
  Reverb and Noise, plus Sensitivity (higher removes more but costs clarity). Advanced adds a
  Best/Offline quality mode. For steady hiss or buzz, Spectral De-noise may do better.
- **Batch Processor** (Window → Batch Processor, Cmd+B / Ctrl+B): add files or folders, pick
  a Module Chain preset, choose the output folder and format (WAVE, AIFF, FLAC, Ogg Vorbis,
  MP3). For a series, save one chain and reuse it on every episode.

Ask for the edition before naming a module: Dialogue Isolate is not in every edition.

## 6. GarageBand and Logic Pro (Mac)

Both are already on many Macs (GarageBand) or owned by musicians (Logic). Claude can't drive
them; it prepares inputs and checks outputs.
- **Hand over inputs** as WAV at one sample rate (48 kHz for video, 44.1 kHz for music or
  podcast), one file per voice or stem, named in order (`01_host.wav`, `02_guest.wav`, `03_bed.wav`).
- **GarageBand export:** Share → Export Song to Disk, format AAC, MP3, AIFF or WAVE, then
  Quality. It trims silence at the start and end, so leave room-tone pads in the stems if you
  need them.
- **Logic Pro bounce:** File → Bounce → Project or Section; tick the file types, set
  Normalize (Off, Overload Protection Only, On) and Mode (Automatic, Offline, Realtime); tick
  Include Audio Tail so reverbs aren't cut. Default folder: `~/Music/Logic/Bounces`.
- **Logic Mastering Assistant** (Mix → Mastering Assistant on the stereo output): with the
  Loudness knob centred the mix lands around -14 LUFS integrated, the usual streaming target.
  Before bouncing, click Reanalyze after any mix change and turn off Loudness Compensation.
  For a -16 LUFS podcast, turn Loudness down and measure the bounce.
- **Check every bounce** with `ffmpeg -i bounce.wav -af ebur128=peak=true -f null -` against the
  destination target.

## 7. Done means (editing)

- [ ] Raw file kept; edited copy named and saved where the user expects it
- [ ] Fillers and long pauses gone without clipped words (listen or spot-check joins)
- [ ] Noise reduced without watery or robotic artifacts; both voices at similar levels
- [ ] Loudness and true peak measured against the target
- [ ] Nothing imported, spent or published in a paid service without the user's yes

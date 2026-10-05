# Transcription, subtitles and speaker labels

> Distilled from: asr-transcribe-to-text (daymade/claude-code-skills, MIT), speech-to-text (elevenlabs/skills, MIT), transcribe (openai/skills, Apache-2.0), media-use (heygen-com/hyperframes, Apache-2.0)

## 1. Before you run anything

- **Check for an existing transcript.** If a reviewed transcript already exists, use it. Raw
  audio existing is not a reason to transcribe again.
- **Transcribe where the audio lives; move only the text.** Text is ~10,000x smaller than
  audio. Uploading GBs over a slow link to reach a faster GPU usually loses.
- **Privacy**: if the user needs offline handling, use a local route (whisper.cpp, MLX);
  otherwise a cloud API is fine.

## 2. Pick the route

| Need | Route |
|---|---|
| The user already uses or pays for a transcription service | That one |
| The recording is being edited in Descript anyway | Descript's transcript export (`txt`, `markdown`, `srt`, ...; `editing-and-repair.md`) |
| Fast plain text, any platform | OpenAI `gpt-4o-mini-transcribe` (`openai-audio.md`) |
| Speaker labels + word timestamps + SRT in one call | ElevenLabs `scribe_v2` with `diarize` (`elevenlabs.md`) |
| Known speakers by name (<= 4 reference clips) | OpenAI `gpt-4o-transcribe-diarize` |
| Live captions, voice agents | ElevenLabs `scribe_v2_realtime` |
| Offline, Apple Silicon | MLX Whisper / Qwen3-ASR (15-27x realtime) |
| Offline, long recordings, any OS | whisper.cpp + VAD, then pyannote diarization |
| Word-level timing for captions | Whisper `word_timestamps=True`, or Scribe `timestamps_granularity="word"` |

## 3. Prepare the audio

```bash
# extract speech from video as 16 kHz mono WAV
ffmpeg -i in.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le speech.wav -y
# shrink for upload-capped APIs (OpenAI 25 MB): AAC 48k mono is speech-transparent
ffmpeg -i speech.wav -ac 1 -ar 16000 -c:a aac -b:a 48k speech.m4a
# duration
ffprobe -v error -show_entries format=duration -of csv=p=0 speech.m4a
```

Multi-file recorder dumps (body mics split into 30-min files): merge them **before** ASR so
context isn't lost at device cuts. Use the bundled script, which sorts by the timestamp in
filenames, normalizes to 16 kHz mono and verifies its own output (duration = sum of inputs
/ speed within 1.5 s; volume check at every splice to catch a missing or misordered segment):

```bash
uv run <skill_dir>/scripts/asr-transcribe-to-text/prepare_asr_input.py SEG*.wav -o merged.wav
uv run <skill_dir>/scripts/asr-transcribe-to-text/prepare_asr_input.py SEG*.wav -o upload.m4a --speed 1.3
```

- Output codec follows the extension: `.wav` (local pipelines), `.m4a` (uploads, ~5x smaller),
  `.ogg` (self-hosted servers that refuse MP3), `.flac` (lossless archive), `.mp3` last resort.
- Speed-up for per-minute-billed services: pitch-preserving `atempo` only, <= 1.5x (about
  +3% WER at 1.5x; above 2x is unusable). Never change sample rate to speed up: it shifts pitch
  and breaks both ASR and speaker voiceprints. Timestamps then need multiplying by the speed.
- Noisy field audio: run voice isolation first (`elevenlabs.md`).
- Keep originals until the transcript passes verification.

## 4. Improve accuracy

- Give vocabulary: ElevenLabs `keyterms` (<= 100), OpenAI/Whisper `prompt` / `initial_prompt`
  with brand names, people, jargon.
- Set the language when known; auto-detect fails on short or code-switched clips.
- Long files: let the server chunk (OpenAI `chunking_strategy=auto`). If you must chunk
  client-side, use ~18 min chunks with ~2 min overlap and fuzzy-merge the overlap.
- A timeout is not a length problem: raise the client timeout before chunking.
- Diarization: give the expected speaker count when known; separate channels per speaker
  (multichannel) beat any diarization model.

## 5. Verify (every time)

1. Not empty, and length is plausible: ~130-170 words per minute of English speech (Chinese ~400 chars/min).
   Far below that -> truncation or missed sections.
2. Read the last lines: a mid-sentence ending means truncation.
3. Show the user the first and last ~200 characters.
4. Speaker count is plausible: a 2-person interview with 5 speakers = over-segmentation;
   merge labels or rerun with a fixed count.
5. **Hallucination loops** on music-only or silent audio ("one, two, three, one, two...").
   Flag a transcript whose unique-word ratio is under ~0.06 as "no speech" instead of shipping it.
   Batch jobs: one file per process with a per-file timeout, so one bad file can't stall the batch.
6. Spot-check names and numbers against the audio.
7. Offer a correction pass: ASR always leaves homophones, broken sentences and garbled terms.

## 6. Subtitles and captions

- Get word timestamps, then group words into cues; never spread words evenly over a clip.
- Cue rules: max 2 lines, ~32-42 characters per line, 1-7 s per cue, reading speed
  <= 17 characters per second, break at punctuation or phrase boundaries, no orphan single word.
- Whisper often returns one segment for a short clip: assign words to cues by word midpoint.
- Formats: SRT for players and uploads, VTT for the web, JSON words for burned-in animated captions.
- For TTS you generated yourself, transcribe the output (or use a TTS that returns word
  timestamps) instead of estimating timings from the script.

# OpenAI audio (speech and transcription CLIs)

> Distilled from: speech (openai/skills, Apache-2.0), transcribe (openai/skills, Apache-2.0)

Two bundled CLIs, copied as-is from openai/skills. Both need `OPENAI_API_KEY` and the
`openai` Python package (`uv run --with openai python ...` avoids installing it globally).
Never ask the user to paste a key into chat; ask them to export it and confirm.
Do not edit the scripts; if a feature is missing, tell the user.

## Speech: `scripts/speech/text_to_speech.py`

Subcommands: `speak` (one file), `speak-batch` (JSONL, one job per line), `list-voices`.
`--dry-run` validates without a network call or key.

```bash
TTS=<skill_dir>/scripts/speech/text_to_speech.py
uv run --with openai python "$TTS" speak \
  --input "Meet the new dashboard. Find insights faster." \
  --voice cedar --response-format wav --out output/speech/demo.wav \
  --instructions "Voice Affect: confident. Tone: helpful, upbeat. Pacing: steady, slightly brisk."
```

Batch (write the JSONL under `tmp/`, delete after the run):
```bash
mkdir -p tmp/speech
cat > tmp/speech/jobs.jsonl <<'JSONL'
{"input":"Thank you for calling. Please hold.","voice":"cedar","response_format":"wav","out":"hold.wav"}
{"input":"For sales, press 1. For support, press 2.","voice":"marin","instructions":"Tone: clear, neutral. Pacing: slow.","speed":0.9,"out":"menu.wav"}
JSONL
python "$TTS" speak-batch --input tmp/speech/jobs.jsonl --out-dir output/speech --rpm 50
rm tmp/speech/jobs.jsonl
```
Per-job overrides: `model`, `voice`, `response_format`, `speed`, `instructions`, `out`.

Facts and limits:
- Default model `gpt-4o-mini-tts-2025-12-15`; also `gpt-4o-mini-tts`, `tts-1`, `tts-1-hd`.
- `instructions` work only on gpt-4o-mini-tts models; tts-1/tts-1-hd drop them (CLI warns).
- Input <= 4,096 characters per request; split longer text.
- Rate cap 50 requests/min (`--rpm`, max 50).
- Voices: alloy, ash, ballad, cedar, coral, echo, fable, marin, nova, onyx, sage, shimmer, verse.
  Default `cedar` (neutral); `marin` for a brighter tone. Built-in voices only.
- Formats: mp3 (default), opus, aac, flac, wav, pcm (raw 24 kHz 16-bit LE, no header).
- Speed 0.25-4.0.
- Disclose to listeners that the voice is AI-generated.

How to write `instructions`: see section 3 of `voiceover-tts.md` (labeled spec, 4-8 lines).

## Transcription: `scripts/transcribe/transcribe_diarize.py`

```bash
STT=<skill_dir>/scripts/transcribe/transcribe_diarize.py
python3 "$STT" interview.mp3 --response-format text --out interview.txt            # fast default
python3 "$STT" meeting.m4a --model gpt-4o-transcribe-diarize \
  --response-format diarized_json --known-speaker "Alice=refs/alice.wav" \
  --known-speaker "Bob=refs/bob.wav" --out-dir output/transcribe/meeting
```

Decision rules:
- Default `gpt-4o-mini-transcribe` + `text` for speed.
- Speaker labels -> `gpt-4o-transcribe-diarize` + `diarized_json`.
- Up to 4 known-speaker reference clips (NAME=PATH).
- Audio longer than ~30 s: keep `--chunking-strategy auto`.
- `--prompt` (vocabulary hints) is not supported by the diarize model.
- Input formats: mp3, mp4, mpeg, mpga, m4a, wav, webm. **Max 25 MB per request**: compress
  first (`ffmpeg -i in.wav -ac 1 -ar 16000 -c:a aac -b:a 48k out.m4a`) or use
  `scripts/asr-transcribe-to-text/prepare_asr_input.py`.
- Multiple files: use `--out-dir` so outputs don't overwrite each other.

# Local and free audio models

> Distilled from: audiocraft-audio-generation (Orchestra-Research/AI-research-SKILLs, MIT), edge-tts (aahl/skills, MIT), media-use (heygen-com/hyperframes, Apache-2.0), asr-transcribe-to-text (daymade/claude-code-skills, MIT), acestep (digitalsamba/claude-code-video-toolkit, MIT)

Use these when there is no API key, the audio is private, or cost per minute matters. Ask
before installing large packages or downloading model weights (hundreds of MB to several GB).

| Job | Model / tool | Hardware |
|---|---|---|
| TTS, free, cloud | `edge-tts` (Microsoft Edge voices) | none; needs network |
| TTS, offline | Kokoro-82M (54 voices, 9 languages) | CPU fine |
| Music, instrumental | MusicGen small/medium/large/melody/stereo/style | GPU or Apple MPS |
| Music with vocals | ACE-Step (self-host) | 8-16 GB VRAM |
| Sound effects | AudioGen medium | GPU |
| Transcription | whisper.cpp, MLX Whisper, Parakeet | CPU / Apple Silicon |
| Diarization | pyannote 3.1 (gated: accept terms on Hugging Face, set `HF_TOKEN`) | CPU/GPU |

## edge-tts

```bash
uvx edge-tts --list-voices
uvx edge-tts --voice en-US-AndrewMultilingualNeural --text "Hello there." --write-media out.mp3
uvx edge-tts --voice en-GB-SoniaNeural --rate=-10% --pitch=-2Hz --text "..." \
  --write-media out.mp3 --write-subtitles out.vtt      # subtitles with timings
```
Good voices: en-US Andrew/Ava/Brian/Emma (Multilingual variants for mixed-language text),
Aria/Christopher for news-style, en-GB Sonia/Ryan. `--rate` and `--volume` in %, `--pitch` in Hz.
Unofficial endpoint: fine for drafts and personal tools, not a production dependency.

## Kokoro

Voice ID prefix sets the language: `a` American, `b` British, `e` Spanish, `f` French,
`h` Hindi, `i` Italian, `j` Japanese, `p` Brazilian Portuguese, `z` Mandarin. Picks:
`af_heart` (default, demos), `am_adam` / `bf_emma` (tutorials), `bm_george` (docs), `af_sky` /
`am_michael` (promo). Non-English needs `espeak-ng` installed. No word timestamps: transcribe
the output for captions.

## MusicGen / AudioGen (AudioCraft)

```python
from audiocraft.models import MusicGen, AudioGen
import torchaudio
m = MusicGen.get_pretrained("facebook/musicgen-medium")
m.set_generation_params(duration=30, top_k=250, temperature=1.0, cfg_coef=3.0)
wav = m.generate(["warm lo-fi hip hop, jazzy Rhodes, vinyl crackle, relaxed 80 BPM"])
torchaudio.save("bed.wav", wav[0].cpu(), sample_rate=32000)

sfx = AudioGen.get_pretrained("facebook/audiogen-medium"); sfx.set_generation_params(duration=5)
torchaudio.save("rain.wav", sfx.generate(["heavy rain on a tin roof"])[0].cpu(), sample_rate=16000)
```

| Model | Params | VRAM fp32 / fp16 | Note |
|---|---|---|---|
| musicgen-small | 300M | ~4 / 2 GB | fast drafts |
| musicgen-medium | 1.5B | ~8 / 4 GB | balanced |
| musicgen-large | 3.3B | ~16 / 8 GB | best quality |
| musicgen-melody | 1.5B | ~8 GB | `generate_with_chroma(desc, melody, sr)` follows a hummed tune |
| musicgen-stereo-* | varies | - | stereo output |
| musicgen-style | 1.5B | - | `generate_with_style` from a reference clip |
| audiogen-medium | 1.5B | ~8 GB | sound effects, 16 kHz |

- Output: MusicGen 32 kHz, AudioGen 16 kHz. Resample to 48 kHz for video.
- `cfg_coef` higher = follows the text more strictly; raise it for poor adherence.
- Max useful clip ~30 s: for longer beds generate one 25-30 s seed and crossfade-loop it,
  rather than stitching different generations (audible seams).
- Batch prompts in one `generate` call; it's faster than a loop.
- OOM: smaller model, shorter duration, `model.half()`, `torch.cuda.empty_cache()`.
- MusicGen weights are CC-BY-NC: fine for personal and research use, **check the license
  before commercial use** of outputs.

## Local transcription

- Apple Silicon: MLX Whisper `whisper-large-v3-turbo` (~1.6 GB) for word timestamps;
  15-27x realtime.
- Long recordings (> 30 min): whisper.cpp with Silero VAD in checkpointed blocks, then fuse
  pyannote speaker turns by time overlap. Don't cut ASR input at speaker turns: it loses context.
- Parakeet transcribes faster with lower WER than whisper.cpp where available.
- Same verification rules as `transcription.md` (length plausibility, loop detection).

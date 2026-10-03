# ElevenLabs (TTS, STT, SFX, music, dubbing, voice changer, isolator)

> Distilled from: text-to-speech, speech-to-text, music, sound-effects, dubbing, voice-changer, voice-isolator (elevenlabs/skills, MIT)

All endpoints need `ELEVENLABS_API_KEY` in the environment. The Python SDK (`elevenlabs`),
JS SDK (`@elevenlabs/elevenlabs-js`, use only `@elevenlabs/*` packages) and the `elevenlabs`
CLI all read it automatically. Never expose the key to a browser: mint single-use tokens on
a backend. Model IDs change often: check the model list before hard-coding.

Common errors on every endpoint: **401** bad key, **422** bad parameter (voice_id, model_id,
range), **429** rate limit (back off and retry).

## Text-to-speech

```python
from elevenlabs import ElevenLabs, VoiceSettings
client = ElevenLabs()
audio = client.text_to_speech.convert(
    text="Welcome back.", voice_id="JBFqnCBsd6RMkjVDRZzb",   # George
    model_id="eleven_multilingual_v2", output_format="mp3_44100_128",
    voice_settings=VoiceSettings(stability=0.5, similarity_boost=0.75, style=0.0, use_speaker_boost=True))
with open("out.mp3", "wb") as f:
    for chunk in audio: f.write(chunk)
```
CLI: `elevenlabs text-to-speech convert --voice-id <id> --text "..." --model-id eleven_multilingual_v2 --output out.mp3`
(`elevenlabs say "..."` just plays it). Nested settings go in `--params '{"voice_settings":{...}}'`.

| Model | Langs | Latency | Use for |
|---|---|---|---|
| `eleven_v4` | 90+ | standard | top quality, dialogue (no `style`/`speed`) |
| `eleven_v3` | 70+ | standard | emotional range |
| `eleven_multilingual_v2` | 29 | standard | long-form, stable narration (no `language_code`) |
| `eleven_flash_v2_5` | 32 | ~75 ms | real-time agents |
| `eleven_turbo_v2_5` | 32 | ~250 ms | balance |

Premade voices: George `JBFqnCBsd6RMkjVDRZzb` (narrative), Sarah `EXAVITQu4vr4xnSDxMaL` (soft),
Daniel `onwK4e9ZLuTAKqWW03F9` (authoritative), Charlotte `XB0fDUnXU5powFXDhCwa` (conversational).
List all: `client.voices.get_all()`.

**Voice settings** (start at defaults, move one knob at a time):

| Knob | Range / default | Effect |
|---|---|---|
| `stability` | 0-1 / 0.5 | lower = more emotion, can wobble; higher = steady |
| `similarity_boost` | 0-1 / 0.75 | closer to source voice; too high amplifies artifacts |
| `style` | 0-1 / 0 | exaggerates character; costs stability; not on v4 |
| `speed` | 0.25-4.0 / 1.0 | agents platform limits to 0.7-1.2; not on v4 |
| `use_speaker_boost` | true | leave on unless artifacts |

Presets: audiobook 0.7/0.5/0; chatbot 0.4/0.75/0.3; news 0.8/0.6/0; character 0.3/0.8/0.5
(stability/similarity/style). Monotonous -> lower stability. Artifacts -> lower similarity.

Other controls:
- `language_code="fr"` (ISO 639-1) to force language on models that support it.
- `apply_text_normalization`: `auto` | `on` (speak dates/phones naturally) | `off` (literal).
- Request stitching for multi-part audio: pass `previous_text` / `next_text`.
- Streaming: `client.text_to_speech.stream(...)` with a flash model; WebSocket for live input.
- Cost: `convert.with_raw_response` -> header `x-character-count`.

Output formats: `mp3_44100_128` (default), `mp3_44100_192` (Creator+), `pcm_16000/22050/24000`,
`pcm_44100/48000` (Pro+), `wav_44100`, `opus_48000_64`, `ulaw_8000` / `alaw_8000` (telephony).

## Speech-to-text (Scribe v2)

```python
with open("talk.mp3", "rb") as f:
    r = client.speech_to_text.convert(file=f, model_id="scribe_v2", diarize=True,
        timestamps_granularity="word", keyterms=["Lumo", "Kubernetes"], language_code="en",
        additional_formats=[{"format": "srt"}])
```
- Models: `scribe_v2` (batch), `scribe_v2_medical`, `scribe_v2_realtime` (~150 ms, also `_turbo`, `_lite`).
- Limits: 5 GB, 10 h per file. Audio and video containers accepted. `source_url` can fetch hosted media.
- `diarize=true` up to 32 speakers; `num_speakers` caps it; `detect_speaker_roles` -> agent/customer.
- `keyterms`: up to 100 terms, each <= 50 chars and <= 5 words. Use for brand and jargon.
- `use_multi_channel` when each speaker has its own channel (max 5 channels, 1 h);
  `multichannel_output_style="combined"` merges by time.
- `no_verbatim=true` strips fillers and false starts. `tag_audio_events` marks laughter, applause.
- `additional_formats`: srt, txt, docx, html, pdf, segmented_json.
- Word objects have `type`: `word`, `spacing`, `audio_event`.
- Realtime: partial transcripts for live display, committed transcripts as truth. Commit
  manually for files, with VAD for microphones (e.g. silence 1.5 s, threshold 0.4). Browser:
  `useScribe` from `@elevenlabs/react` with a backend-issued token.

## Sound effects

```python
client.text_to_sound_effects.convert(text="Soft notification chime, glassy, short tail",
    duration_seconds=1.0, prompt_influence=0.8, loop=False, model_id="eleven_text_to_sound_v2")
```
- `duration_seconds` 0.5-30 (null = auto). `prompt_influence` 0-1, default 0.3: raise to 0.6-0.8
  for literal UI sounds, keep low for creative textures. `loop=True` (v2) for seamless ambiences.
- Prompting rules are in `sound-effects.md`.

## Music

```python
audio = client.music.compose(prompt="Warm lo-fi hip hop, jazzy Rhodes, vinyl crackle, 80 BPM",
                             music_length_ms=30000, model_id="music_v2_5")
```
- Methods: `compose`, `stream` (paid), `composition_plan.create`, `compose_detailed`
  (plan + metadata; `store_for_inpainting=True`), `video_to_music`, `upload` (enterprise inpainting), finetunes.
- **Composition plan**: list of `chunks`, each `text` (section tag + lyrics), `duration_ms`
  (3,000-120,000), `positive_styles`, `negative_styles`, `context_adherence` (low/medium/high).
  Max 30 chunks, total 3 s to 10 min. Put genre/instrument/vocal style in `positive_styles`,
  not in `text`; give the first chunk 6-7 styles because it sets the overall tone.
- Workflow: `composition_plan.create` -> edit chunks -> `compose(composition_plan=plan)`.
- **Inpainting**: keep a `song_id`, then build a plan mixing reference chunks
  `{"song_id": id, "range": {"start_ms": 0, "end_ms": 30000}}` with new generation chunks.
  `conditioning_ref` (<= 30 s) + `condition_strength` low/medium/high/xhigh matches feel without copying.
- **Video to music**: 1-10 videos, <= 200 MB, <= 600 s total, `description` + up to 10 `tags`.
  Defaults to `music_v1`: pass `model_id="music_v2_5"`.
- Output: `auto` -> `mp3_48000_192` for v2+; up to `mp3_48000_320`.
- No artist names, band names or copyrighted lyrics. `bad_prompt` errors return a
  `prompt_suggestion`; use it.

## Dubbing (Projects API, `dubbing_v2`)

Use `client.dubbing.project.*` / `/v1/dubbing/project`. Not the legacy `client.dubbing.create()`.

1. `project.create(file=... | source_url=..., source_language="en", keyterms=[...])` (<= 3 GiB).
2. Poll `project.get` until `ready` (or `failed`).
3. Fix the **source transcript first** (`project.transcript.update_segment`), because every
   language is translated from it; editing later marks languages `stale` and costs a regeneration.
   Transcript editing and regeneration are enterprise-only.
4. `project.language.create(project_id, target_language="es")` per language
   (optional `voice_settings={"cloning_strength": 7}`, 0-10).
5. Poll `language.list` until none are `queued`/`processing`.
6. Download `outputs.lossless_audio` (signed URL valid ~1 h; re-fetch the language for a new one).
7. Edit a translation -> language goes `stale` -> `language.transcript.regenerate` (409 = not settled; wait).

## Voice changer (speech-to-speech)

```python
client.speech_to_speech.convert(voice_id="<target>", audio=open("take.mp3","rb"),
    model_id="eleven_multilingual_sts_v2", remove_background_noise=True, seed=12345)
```
- Max 5 min and 50 MB per request: split at pauses and concatenate.
- Cost: 1,000 characters per minute of audio.
- `eleven_multilingual_sts_v2` beats the English model even on English.
- Keeps emotion, timing, breaths. Accent comes from the **source** performance, not the target voice.
- Not voice cloning: it converts into an existing `voice_id`.

## Voice isolator

```python
client.audio_isolation.convert(audio=open("noisy.mp3","rb"))   # streams clean MP3
```
- Removes noise, music and ambience from speech. Use before STT or voice changer on field recordings.
- `file_format="pcm_s16le_16"` for raw 16 kHz mono PCM input (lower latency).

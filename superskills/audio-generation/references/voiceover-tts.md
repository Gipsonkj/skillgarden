# Voiceover and text-to-speech

> Distilled from: text-to-speech (elevenlabs/skills, MIT), speech (openai/skills, Apache-2.0), media-use (heygen-com/hyperframes, Apache-2.0), edge-tts (aahl/skills, MIT), podcast-generation (bytedance/deer-flow, MIT)

A voiceover fails for three reasons: the script was written for the eye, the delivery
direction was vague or contradictory, or nobody listened to the result. Fix all three.

## 1. Pick the engine

| Need | Use | Why |
|---|---|---|
| Best expressive quality, many languages, cloned voices | ElevenLabs (`eleven_v3` / `eleven_multilingual_v2`) | Widest voice library; see `elevenlabs.md` |
| Real-time / lowest latency (~75 ms) | ElevenLabs `eleven_flash_v2_5` | Built for agents and live apps |
| Directed delivery from plain-language instructions | OpenAI `gpt-4o-mini-tts` | `instructions` field steers tone; see `openai-audio.md` |
| Directed delivery, Google stack | Gemini TTS (`style` text, prebuilt voice e.g. `Kore`) | Put directions in style, never in spoken text |
| Free, no key, quick drafts | `uvx edge-tts` (Microsoft Edge neural voices) | Unofficial endpoint: fine for drafts and personal use, not for production SLAs |
| Offline, private, deterministic | Kokoro-82M local (see `local-open-models.md`) | No network, no per-character cost |
| Word timestamps in the same call | HeyGen TTS, or any TTS + a transcription pass | Needed for captions and cut sync |

Rule: if the project already has a narrator voice, reuse it. Two voices across one product
sound like two products. Write down the voice ID, model and settings you used.

## 2. Write the script for the ear

- **Sentence length**: aim for 8 to 20 words. One idea per sentence.
- **Pace**: 145 to 155 words per minute for explainers and docs; 130 to 140 for
  accessibility and complex material; 160 to 170 for upbeat promos. Script length =
  target seconds x 2.5 words (at 150 wpm). A 30 s spot is about 75 words.
- **Numbers and symbols**: spell what must be spoken exactly. "24/7" -> "twenty-four
  seven", "$1.2M" -> "one point two million dollars", "v2.5" -> "version two point five".
  Or turn on the engine's text normalization (ElevenLabs `apply_text_normalization="on"`).
- **Acronyms**: write how they should sound. "A-I", "S-Q-L" or "sequel", "NASA" stays.
- **Names and brands**: test them first in a 1-sentence clip. If wrong, respell
  phonetically in the input text ("Nous" -> "Noose"). Pronunciation is baked into the
  take; fix it in the text, not in post.
- **Pauses**: use punctuation and line breaks. A full stop is a short pause, a paragraph
  break a longer one. Ellipses create hesitation; use sparingly.
- **No markup** in spoken text: no markdown, code, URLs, formulas. Describe them in words.

## 3. Direct the delivery

Write direction as a short labeled spec, 4 to 8 lines, in this order. Only make explicit
what the user implied; do not invent a persona, accent or emotion they did not ask for.

```
Voice Affect: warm and composed
Tone: friendly, confident
Pacing: steady, moderate
Emotion: quiet enthusiasm
Pronunciation: enunciate "A-I" and the product name "Lumo" (LOO-mo)
Pauses: brief pause after each section title
Emphasis: stress "faster" and "free"
```

- Never mix opposites ("fast and slow", "formal and casual").
- When iterating, change one thing at a time and restate the invariants ("keep pacing steady").
- Engines without an instructions field (ElevenLabs, edge-tts, tts-1) take direction
  through voice choice, settings and punctuation instead.

### Defaults by use case

| Use case | Voice character | Speed | Format | Direction core |
|---|---|---|---|---|
| Narration / explainer | warm, neutral | 1.0 | mp3 (wav if editing) | steady, stress section titles |
| Product demo / promo | confident, bright | 1.0 to 1.1 | wav for video sync | helpful, upbeat, stress benefits and CTA |
| IVR / phone menu | clear, neutral | 0.9 to 1.0 | wav, or `ulaw_8000` for telephony | slow, enunciate numbers, stress "press 1" |
| Accessibility read | neutral | 0.95 to 1.0 | mp3/wav | slow, consistent, no drama |
| Audiobook | consistent | 1.0 | mp3 44.1 kHz 128k+ | stable voice (ElevenLabs stability ~0.7) |
| Character / drama | expressive | 1.0 | wav | lower stability (~0.3), higher style |

Speed rule of thumb: 0.7 to 0.8 for tutorials, 1.0 natural, 1.1 to 1.2 intros and
transitions, above 1.5 almost never.

## 4. Long scripts

- Respect per-request limits: OpenAI 4,096 characters; ElevenLabs depends on model
  (keep chunks to a few paragraphs). Split at paragraph or sentence boundaries, never mid-sentence.
- Keep voice, model and settings identical across chunks. With ElevenLabs pass
  `previous_text` / `next_text` (request stitching) so joins don't pop or shift tone.
- Name chunks `001.wav`, `002.wav` and join with ffmpeg concat (see `mixing-and-mastering.md`).
- Generate WAV (or PCM) for anything you will edit or mix; encode to MP3/AAC once, at the end.

## 5. Check every take

1. Listen to the whole take (or transcribe it and diff against the script when you cannot listen).
2. Check names, numbers, acronyms letter by letter.
3. Check duration against the target: `ffprobe -v error -show_entries format=duration -of csv=p=0 take.wav`.
4. Check that delivery directions were not spoken aloud (Gemini/OpenAI can leak them).
5. Check level: speech should land around -16 LUFS (web/podcast) before mixing.

## 6. Ethics and disclosure

- Tell end users the voice is AI-generated (OpenAI requires it; do it everywhere).
- Clone or convert only voices you have consent for.
- Never put API keys in request files, compositions or chat. Read them from env vars
  (`ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`).

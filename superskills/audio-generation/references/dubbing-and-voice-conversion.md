# Dubbing, voice conversion and cleanup

> Distilled from: dubbing, voice-changer, voice-isolator (elevenlabs/skills, MIT), speech (openai/skills, Apache-2.0)

API calls for all three are in `elevenlabs.md`. This file is the decision logic and the
quality rules.

## 1. Which job is it?

| The user wants | Job |
|---|---|
| Same video in another language, same speakers' voices | Dubbing |
| Same performance, different voice (re-voice, character, anonymize) | Voice conversion (speech-to-speech) |
| New narration in a cloned voice from text | TTS with a cloned voice (`voiceover-tts.md`) |
| Remove noise/music from speech | Voice isolation |
| Captions in another language, no audio change | Transcribe + translate subtitles (`transcription.md`) |

Consent first: only clone or convert voices the user has the right to use. Anonymizing a
speaker with a neutral premade voice is the safe use of conversion.

## 2. Dubbing workflow

1. Clean the source if noisy (isolation), but keep the original for the music/effects track.
2. Create the project with the source language and `keyterms` (brand and product names,
   <= 1,000 terms, each <= 50 chars / 5 words).
3. **Finalize the source transcript before adding any language.** Every translation derives
   from it; fixing it later makes each language stale and costs a regeneration.
4. Add all target languages, poll the list until none are queued or processing.
5. Review translations for: brand names untranslated, numbers and units localized, lines that
   run too long for the original timing (German and French run ~20-30% longer than English;
   shorten the translation rather than speeding the voice).
6. Download outputs promptly (signed URLs expire ~1 h).
7. Spot-check sync at the start, middle and end; check every speaker kept their own voice.

## 3. Voice conversion rules

- The result can only be as good as the source performance. Flat input gives flat output;
  whispers, laughs and shouts carry over.
- Accent and cadence come from the source speaker, not the target voice. To get a British
  delivery, perform it in British English.
- Record at healthy levels with no clipping; clean noise first (`remove_background_noise=True`
  or isolation). Noise hurts conversion more than it hurts TTS.
- Split anything over 5 minutes (or 50 MB) at natural pauses, convert each, then concatenate.
- Use a `seed` when comparing settings so differences come from the settings, not chance.
- Settings: lower stability follows the source performance more freely; higher similarity
  sticks closer to the target timbre but can amplify source artifacts.

## 4. Isolation and cleanup

- Use isolation before transcription, voice conversion, or dubbing of field recordings.
- It removes music too: never run it on a track where you want to keep the score.
- After isolation, still apply the voice chain (high-pass, compression, limiter) from
  `mixing-and-mastering.md`; isolation removes noise, it doesn't fix tone or level.
- Gate vs isolation: a gate only silences pauses; noise under speech stays.

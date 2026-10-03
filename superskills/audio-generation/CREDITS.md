# Credits

All sources are license-compatible (MIT or Apache-2.0) and none is marked non-commercial.
Reference files are rewritten in our own words; scripts are copied unchanged with their licenses beside them.

| Source skill | Repo | License | What was used |
|---|---|---|---|
| text-to-speech | https://github.com/elevenlabs/skills/tree/main/text-to-speech | MIT | Models, voices, voice-settings presets, stitching, formats (elevenlabs.md, voiceover-tts.md) |
| speech-to-text | https://github.com/elevenlabs/skills/tree/main/speech-to-text | MIT | Scribe options, diarization, keyterms, realtime commit strategies (elevenlabs.md, transcription.md) |
| music | https://github.com/elevenlabs/skills/tree/main/music | MIT | Composition plans, inpainting, video-to-music (elevenlabs.md, music-generation.md) |
| sound-effects | https://github.com/elevenlabs/skills/tree/main/sound-effects | MIT | SFX params and prompt tips (elevenlabs.md, sound-effects.md) |
| dubbing | https://github.com/elevenlabs/skills/tree/main/dubbing | MIT | Projects API workflow and states (elevenlabs.md, dubbing-and-voice-conversion.md) |
| voice-changer | https://github.com/elevenlabs/skills/tree/main/voice-changer | MIT | Limits, input best practices (elevenlabs.md, dubbing-and-voice-conversion.md) |
| voice-isolator | https://github.com/elevenlabs/skills/tree/main/voice-isolator | MIT | Isolation usage and workflows |
| speech | https://github.com/openai/skills/tree/main/skills/.curated/speech | Apache-2.0 | Delivery-spec format, use-case defaults; `scripts/speech/text_to_speech.py` copied as-is |
| transcribe | https://github.com/openai/skills/tree/main/skills/.curated/transcribe | Apache-2.0 | Decision rules; `scripts/transcribe/transcribe_diarize.py` copied as-is |
| media-use | https://github.com/heygen-com/hyperframes/tree/main/skills/media-use | Apache-2.0 | TTS provider routing, BGM/SFX levels, retrieval score floor, Kokoro voices |
| hyperframes-audio | https://github.com/heygen-com/hyperframes/tree/main/skills/hyperframes-audio | Apache-2.0 | Symptom-to-EQ table, chain order, voiceover carve rules (mixing-and-mastering.md) |
| podcast-generation | https://github.com/bytedance/deer-flow/tree/main/skills/public/podcast-generation | MIT | Two-host script format and writing rules (podcast-and-dialogue.md) |
| notebooklm | https://github.com/teng-lin/notebooklm-py | MIT | Audio Overview command shape, with ToS caveat (podcast-and-dialogue.md) |
| minimax-music-gen | https://github.com/MiniMax-AI/skills/tree/main/skills/minimax-music-gen | MIT | Sentence-prompt structure, BPM table, mmx commands (music-generation.md, music-tools.md) |
| audiocraft-audio-generation | https://github.com/Orchestra-Research/AI-research-SKILLs/tree/main/18-multimodal/audiocraft | MIT | MusicGen/AudioGen usage and VRAM table (local-open-models.md) |
| songwriting-and-ai-music | https://github.com/nousresearch/hermes-agent/tree/main/skills/creative/songwriting-and-ai-music | MIT | Song structure, lyric craft, Suno tags, phonetics (music-generation.md, music-tools.md) |
| acestep | https://github.com/digitalsamba/claude-code-video-toolkit/tree/main/.claude/skills/acestep | MIT | ACE-Step params, scene presets, vocal tagging (music-tools.md) |
| edge-tts | https://github.com/aahl/skills/tree/main/skills/edge-tts | MIT | edge-tts commands and voices (local-open-models.md) |
| asr-transcribe-to-text | https://github.com/daymade/claude-code-skills/tree/main/daymade-audio/asr-transcribe-to-text | MIT | ASR routing, preprocessing, verification, loop detection; `scripts/asr-transcribe-to-text/prepare_asr_input.py` copied as-is |

## Also see (not included)

- tts (noizai/skills) - https://github.com/noizai/skills/tree/main/skills/tts - no license file, link only.

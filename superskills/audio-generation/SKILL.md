---
name: audio-generation
description: Create, transcribe and finish audio with AI: voiceovers and text-to-speech (ElevenLabs, OpenAI, Gemini), music and songs (Suno, Lyria, MiniMax), sound effects, two-host podcasts, dubbing and voice changes, noise removal and podcast edits (Descript, Audacity, iZotope RX), transcripts and SRT captions (Whisper), and mixing voice with music to a loudness target. Use when asked to make, clean, transcribe or mix audio, a voiceover, a song or a podcast.
---

# Audio generation

Everything between "I need audio" and a finished file: writing for the ear, choosing an
engine, prompting voices, music and effects, transcribing, and mixing to a delivery target.
Generation is the easy part. What makes audio usable is a script written to be heard,
consistent voices, levels that let the voice through, and a check of every take.

## Core principles

1. **Write for the ear.** Sentences of 8-20 words, numbers and acronyms spelled the way they
   are said, no markup in spoken text. Plan length at ~150 words per minute.
2. **Pick the engine by the job, then keep it.** One narrator voice, model and settings per
   project; record the IDs. Mixed voices sound like mixed products.
3. **Direct with short labeled specs.** Affect, tone, pacing, emotion, pronunciation, pauses,
   emphasis: 4-8 lines, no contradictions, nothing the user didn't ask for.
4. **Change one thing per iteration** (voice, speed, one setting, one prompt phrase) and restate
   what must stay fixed. Lock seeds while comparing.
5. **Test names, brands and numbers in a short clip first.** Pronunciation is baked into the
   take; fix it in the input text by respelling, not in post.
6. **Describe sound, never name artists.** Music and SFX prompts describe genre, era,
   instruments, texture, space and arc. Never reproduce copyrighted lyrics.
7. **Describe the arc, not just the genre.** "Starts sparse, builds at the chorus, strips back"
   gives a music model a map; 2-3 precisely named instruments beat a tag list.
8. **Generate several takes and choose.** 3-5 for music, 2-4 for SFX. Fix sections (inpaint,
   repaint, extend, regenerate one line) instead of rerolling everything.
9. **Work lossless, encode once.** WAV/PCM at one project sample rate (48 kHz for video) until
   the final export.
10. **Music under voice sits 18-24 dB down and gets out of the voice's bands.** Carve or
    sidechain-duck the bed, release slowly; never EQ the voice to fight the music.
11. **Measure, don't guess.** Integrated loudness and true peak against the target (-16 LUFS
    podcast/web, -14 LUFS YouTube/streaming, -1 dBTP); duration against the plan.
12. **Verify transcripts by plausibility**: ~130-170 words per minute, a complete last
    sentence, a sensible speaker count, no repetition loops on music or silence.
13. **Keys stay in env vars** (`ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`);
    browser apps get short-lived tokens from a backend. Never ask for a key in chat.
14. **Consent and disclosure.** Clone or convert only voices you have rights to; tell listeners
    when a voice is AI-generated.

Conflict resolved: one source suggests artist references to steer vocal gender (ACE-Step);
most APIs reject names and it's a rights risk, so use explicit vocal tags in both the prompt
and each lyric section instead.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Interview to podcast episode: `references/transcription.md` → `references/podcast-and-dialogue.md` → `references/mixing-and-mastering.md`; show notes from `content-creation` → `references/writing-from-raw-material.md`; the Reels clip from `ai-video` → `references/captions-talking-head.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

Name the task, or say "use audio-generation: <capability>".

| Task | Read |
|---|---|
| Voiceover, narration, TTS, IVR, accessibility read, audiobook; pick a TTS engine (incl. Gemini TTS) | `references/voiceover-tts.md` |
| Anything on ElevenLabs (TTS, Scribe STT, SFX, Music, Dubbing, Voice Changer, Isolator) | `references/elevenlabs.md` |
| OpenAI TTS or transcription via the bundled CLIs | `references/openai-audio.md`, `scripts/speech/text_to_speech.py`, `scripts/transcribe/transcribe_diarize.py` |
| Background music, jingles, songs, lyrics, music prompts, BPM/key choices | `references/music-generation.md` |
| Pick a music tool; MiniMax `mmx`, ACE-Step, Suno, Lyria commands and knobs | `references/music-tools.md` |
| Sound effects, UI sounds, ambiences, risers, placement | `references/sound-effects.md` |
| Transcription, speaker labels, word timestamps, SRT/VTT subtitles | `references/transcription.md`, `scripts/asr-transcribe-to-text/prepare_asr_input.py` |
| Merge recorder segments, convert to 16 kHz mono, shrink uploads before ASR | `scripts/asr-transcribe-to-text/prepare_asr_input.py` (see `references/transcription.md`) |
| Mixing, ducking, voice cleanup EQ, loudness, ffmpeg recipes, export formats | `references/mixing-and-mastering.md` |
| Edit a recorded podcast or interview: cut ums and pauses, clean voices, repair noise; pick an editor (Descript, Audacity, Audition, Enhance Speech, iZotope RX, GarageBand/Logic) | `references/editing-and-repair.md` |
| Article-to-podcast, two-host dialogue, multi-voice scripts; pick a voice tool | `references/podcast-and-dialogue.md` |
| Dubbing, voice conversion, anonymizing a speaker, noise/music removal | `references/dubbing-and-voice-conversion.md` |
| Offline or free: edge-tts, Kokoro, MusicGen/AudioGen, Whisper/whisper.cpp | `references/local-open-models.md` |

Scripts are copied unchanged from their sources; run them, don't edit them. They need their
API keys (`OPENAI_API_KEY`) and `ffmpeg`/`ffprobe` where noted; `--dry-run` works without keys.

## Other crafts

| When the request also needs | Use |
|---|---|
| Audio put under pictures (beyond the mix in `references/mixing-and-mastering.md`): beat cuts, burned-in captions, video export | `ai-video` → `references/music-beat-cut.md`, `references/captions-talking-head.md`, `references/delivery-qa.md` |
| Show notes, an article or a newsletter written from a transcript | `content-creation` → `references/writing-from-raw-material.md`, `references/repurposing.md`, `references/newsletters.md` |
| A real-time voice agent that listens and talks back | `ai-agents` → `references/voice-agents-elevenlabs.md` |
| The voiceover for a paid video ad: hooks, specs, policy | `ad-creation` → `references/ai-ad-production.md`, `references/platform-specs.md` |
| Audiograms and podcast clips posted to TikTok, Reels or Shorts | `social-media` → `references/short-form-video.md`, `references/repurposing-crossposting.md` |
| A PDF or Office file turned into clean text before an audiobook or narration | `docs-office` → `references/convert-extract.md` |
| Meeting minutes with owners and due dates from a transcript | `product-management` → `references/meetings.md` |
| A scheduled pipeline that turns new posts into audio (n8n, Make, Zapier) | `automation` → `references/automation-design.md`, `references/n8n.md` |
| Serving open speech or music models on your own GPU or a serverless endpoint | `open-models` → `references/serving-endpoints.md`, `references/gpu-hosting-runpod-modal.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Effect chains, automation envelopes and submix buses for audio inside a HyperFrames composition | [hyperframes-audio](https://github.com/heygen-com/hyperframes/tree/main/skills/hyperframes-audio) (Apache-2.0) |
| Speaker-labelled transcription from media URLs or a remote ASR endpoint | [asr-transcribe-to-text](https://github.com/daymade/claude-code-skills/tree/main/daymade-audio/asr-transcribe-to-text) (MIT) |
| Running ACE-Step 1.5 locally or on RunPod with the video toolkit's setup | [acestep](https://github.com/digitalsamba/claude-code-video-toolkit/tree/main/.claude/skills/acestep) (MIT) |
| The full songwriting craft behind the lyric rules here: prosody, hooks, rhyme | [songwriting-and-ai-music](https://github.com/nousresearch/hermes-agent/tree/main/skills/creative/songwriting-and-ai-music) (MIT) |

## Default workflow

1. **Pin the brief**: what audio, for where (video, podcast, app, phone), length, language,
   voice/mood, delivery format and loudness target. Infer from context; ask only if a
   blocking detail is missing.
2. **Check tools and keys**: which env vars are set, whether `ffmpeg` exists. Choose the
   engine from the routing table in the relevant reference; prefer what the project already uses.
3. **Write the source text**: script for the ear, lyrics with structure tags, or a precise
   SFX/music prompt. For long scripts split at paragraph boundaries.
4. **Do a short test** (one sentence, a 15-30 s music sketch, one SFX) to validate voice,
   pronunciation and style before generating everything.
5. **Generate** the full set, saving numbered WAV files and a log of text, voice/model IDs,
   settings and seeds.
6. **Check each take**: listen or transcribe-and-diff, names and numbers, duration, leaked
   directions, clipping.
7. **Mix and finish**: clean the voice, place SFX, carve/duck music, fade edges, normalize to
   target, export once.
8. **Hand over**: file paths, duration, loudness, voices/models used, and anything skipped or
   uncertain (for example, an unclear pronunciation you could not verify).

## Done means

- [ ] Every requested file exists, plays, and matches the target length (within ~5-10%)
- [ ] Names, numbers and acronyms are pronounced or transcribed correctly
- [ ] No spoken stage directions, cut-off words, pops at joins, or clipping
- [ ] Voice clearly legible over any music; bed fades rather than stops
- [ ] Loudness and true peak meet the destination target; format fits the destination
- [ ] Transcripts pass length, ending, speaker-count and loop checks
- [ ] No artist names or copyrighted lyrics in prompts; AI voice disclosed where heard by others
- [ ] Settings, voice IDs and seeds recorded so the result can be reproduced

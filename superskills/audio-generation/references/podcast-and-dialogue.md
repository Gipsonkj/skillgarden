# Podcasts and multi-voice dialogue

> Distilled from: podcast-generation (bytedance/deer-flow, MIT), speech (openai/skills, Apache-2.0), text-to-speech (elevenlabs/skills, MIT), notebooklm (teng-lin/notebooklm-py, MIT)

Turn an article, report or notes into a conversation people can follow by ear.

## 1. Plan

- Hosts: 2 is the default (one explains, one asks and reacts). 3+ voices get hard to tell apart.
- Pick two voices that differ clearly in pitch and character; keep them fixed for the series.
- Length: ~150 words per minute. 10 minutes = ~1,500 words = 40-60 lines.
- One episode, one main idea. Cut everything a listener can't use without seeing it.

## 2. Write the script

Store it as JSON so each line can be synthesized and re-done independently:

```json
{
  "title": "Why batteries get cheaper",
  "locale": "en",
  "voices": {"host_a": "<voice id>", "host_b": "<voice id>"},
  "lines": [
    {"speaker": "host_a", "text": "Welcome back. Today: why a battery pack costs a tenth of what it did in 2010."},
    {"speaker": "host_b", "text": "A tenth? That sounds made up."}
  ]
}
```

Writing rules:
- Talk like two friends who know the topic: short sentences, contractions, reactions
  ("wait, really?"), follow-up questions. Change speaker every 1-3 sentences.
- Translate technical content: code -> what it does; formulas -> words; URLs and API paths ->
  their function. Add an analogy for each abstract idea and a "why this matters" beat.
- Plain text only: no markdown, bullets or symbols in `text`.
- Drop meta information (author names, document structure, dates) unless it is the story.
- Open with a hook in the first 15 seconds; close with a one-sentence recap.
- Fact-check against the source; dialogue invites invented "color" facts.

## 3. Synthesize

1. Generate one file per line (`0001_host_a.wav`, ...) with fixed voice and settings per speaker.
   ElevenLabs: pass `previous_text`/`next_text` within a speaker's run for smooth prosody.
   OpenAI: batch JSONL with per-line `voice` (see `openai-audio.md`).
2. Retry failed lines individually with backoff on 429; never regenerate the whole show for one line.
3. Join with short gaps: 0.25-0.4 s between speakers, 0.6-1 s at topic changes (ffmpeg concat,
   see `mixing-and-mastering.md`). Overlap reactions slightly (-0.1 s) only if the tool allows.
4. Optional intro/outro music, faded under the first and last lines.
5. Normalize to -16 LUFS, -1 dBTP; export MP3 128-192 kbps.
6. Write a Markdown transcript next to the audio (speaker: text), and report duration and hosts.

## 4. Check

- Listen to (or transcribe and diff) the first minute and every topic transition.
- Names and numbers pronounced right; no line accidentally read in the wrong voice.
- Total duration within 10% of target.
- Disclose that the voices are AI-generated in the show notes.

## 5. Shortcut: NotebookLM Audio Overview

`notebooklm-py` can drive Google NotebookLM to create an "Audio Overview" podcast from uploaded
sources (`notebooklm generate audio "<instructions>" -n <notebook> -s <source> --json`, then
`notebooklm download audio`). It is an **unofficial** client using browser-session auth:
possible Google ToS risk and breakage. Use it only when the user asks for it, with a dedicated
account, and treat its auth files as secrets. For anything you need to control (voices, script,
length, accuracy), use the scripted pipeline above.

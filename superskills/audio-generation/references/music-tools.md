# Music tools: MiniMax, ACE-Step, Suno, Lyria

> Distilled from: minimax-music-gen (MiniMax-AI/skills, MIT), acestep (digitalsamba/claude-code-video-toolkit, MIT), songwriting-and-ai-music (nousresearch/hermes-agent, MIT); Lyria from Google's Gemini API docs, in our own words

Prompt and lyric craft lives in `music-generation.md`; this file is only commands and knobs.
ElevenLabs Music is in `elevenlabs.md`; MusicGen in `local-open-models.md`.

## Pick a tool

| Situation | Tool | Why / access |
|---|---|---|
| The user already uses or pays for one | That one | Their credits, account and earlier tracks are there |
| Section-by-section control, fix one part, music to a video | ElevenLabs Music (`elevenlabs.md`) | composition plans, inpainting, video-to-music; API key, paid |
| Vocal song or 30 s clip from one prompt, Google stack, or music from an image | Lyria (section below) | `GEMINI_API_KEY`; $0.04 a clip, $0.08 a song; no free tier |
| Vocal songs with a lyric optimizer, covers | MiniMax (`mmx` CLI) | API key |
| Free or self-hosted, repaint, stems, exact BPM/key | ACE-Step 1.5 | acemusic.ai key (free) or self-host |
| Strongest full songs, user drives it | Suno | web app (no official API) |
| Fully offline instrumentals | MusicGen / AudioGen (`local-open-models.md`) | GPU or Apple MPS |

## MiniMax (`mmx`)

Setup (user runs it): `npm install -g mmx-cli`, then `mmx auth login --api-key <key>`
(stored in `~/.mmx/credentials.json`); verify with `mmx quota show`.
Always pass `--quiet --non-interactive` when an agent calls it.

```bash
# vocal, lyrics written by the model
mmx music generate --prompt "<English sentence prompt>" --lyrics-optimizer \
  --genre "indie folk" --mood "bittersweet" --vocals "breathy alto" --instruments "acoustic guitar, cello" \
  --bpm 92 --out out/song.mp3 --quiet --non-interactive
# your own lyrics (always include [verse]/[chorus]/[bridge]/[intro]/[outro] markers)
mmx music generate --prompt "..." --lyrics "$(cat lyrics.txt)" --out out/song.mp3 --quiet --non-interactive
# instrumental
mmx music generate --prompt "..." --instrumental --out out/bed.mp3 --quiet --non-interactive
# cover of reference audio (mp3/wav/flac, 6 s to 6 min, <= 50 MB)
mmx music cover --prompt "stripped acoustic cover, intimate vocal" --audio-file src.mp3 --out out/cover.mp3 --quiet --non-interactive
```
- Prefer structured flags (`--genre --mood --vocals --instruments --bpm --key --tempo
  --structure --avoid --use-case`) over cramming everything into `--prompt`.
- Cover options: `--seed 0-1000000`, `--channel 1|2`, `--format mp3|wav|pcm`,
  `--sample-rate 44100`, `--bitrate 256000`. Lyrics are auto-extracted by ASR if omitted:
  replace them with original lyrics.
- Exit codes: 3 auth, 4 quota, 5 timeout (retry once), 10 content filter (rephrase).
- Generation takes 30-120 s. Playback: `afplay` (macOS), `ffplay -nodisp -autoexit`, or `mpv --no-video`.

## ACE-Step 1.5

Cloud via acemusic.ai (XL Turbo 4B + "thinking" LM, ~5-15 s per track) or self-hosted 2B
Turbo on Modal/RunPod (~2-3 s, no LM, less varied). Output 48 kHz, 10-600 s, BPM 30-300.

Parameters that matter:

| Param | Default | Notes |
|---|---|---|
| caption (prompt) | - | overall style; don't describe the melody |
| lyrics | - | structure tags and delivery, 6-10 syllables per line |
| bpm / key | - | use params, not caption text |
| guidance scale | 7.0 | 1-15, prompt adherence |
| infer method | ode | `sde` adds randomness when outputs sound samey |
| thinking | on (cloud) | LM enriches sparse captions; off = faster drafts |
| variations | 1 | up to 8 on cloud: generate 4, pick one |
| cover strength | 0.7 | 0.2 loose inspiration, 0.5 balanced, 1.0 faithful |

Tasks: text2music, cover (style transfer from reference), repaint (regenerate seconds X-Y,
cloud only), continuation (extend, cloud only), extract (stems: vocals, drums, bass, guitar,
piano, keyboard, strings, brass, woodwinds, other). Extract audio from video with ffmpeg first.

Scene presets that work for video beds:

| Scene | BPM | Key |
|---|---|---|
| corporate background | 110 | C major |
| upbeat tech launch | 128 | G major |
| ambient / overview | 72 | D major |
| dramatic reveal | 90 | D minor |
| tension / problem | 85 | A minor |
| hopeful / solution | 120 | C major |
| call to action | 135 | E major |
| lo-fi screen recording | 85 | F major |

## Suno (web)

- Use Custom Mode: separate Style field and Lyrics field.
- Style field (up to ~1,000 chars on v4.5+): Genre + Mood + Era + Instruments + Vocal persona
  + Production + Dynamic arc. Use Exclude Styles for what you don't want.
- Lyrics field ~3,000 chars (40-60 lines) with structure and performance tags; repeat key
  tags in both fields.
- Generate several takes, then Extend/Continue the best; restate style when extending.

## Lyria (Gemini API)

Google's music models, 44.1 kHz stereo, MP3 by default (Lyria 3.5 can return WAV via
`response_format`). Key in `GEMINI_API_KEY`, sent as `x-goog-api-key`.

| Model | Use | Length | Paid price |
|---|---|---|---|
| `lyria-3-clip-preview` | sketches, loops, previews | always 30 s | $0.04 per clip |
| `lyria-3.5` | full songs with verses, choruses, bridges | a couple of minutes; steer it in the prompt ("a 2-minute song") | $0.08 per song |

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/interactions" \
  -H "x-goog-api-key: $GEMINI_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"lyria-3-clip-preview",
       "input":"A warm 100 BPM indie folk instrumental, fingerpicked acoustic guitar and light claps. Instrumental only, no vocals."}' \
| jq -r '.steps[] | select(.type=="model_output") | .content[] | select(.type=="audio") | .data' \
| base64 -d > sketch.mp3
```

- The response also carries text blocks with the generated lyrics or a JSON song structure;
  keep them with the take (SDKs: `interaction.output_text`, `interaction.output_audio`).
- **Own lyrics:** put them in the prompt with `[Verse]`, `[Chorus]`, `[Bridge]` tags, clearly
  separated from the musical direction. **Timing:** `[0:00 - 0:10] Intro: ...` style
  timestamps place sections and instrument entries. **Instrumental:** say "Instrumental only,
  no vocals". **Language:** lyrics follow the prompt's language, so write the prompt in it.
  **From images (`lyria-3.5`):** make `input` a list with the text item plus up to 10
  `{"type":"image","mime_type":"image/jpeg","data":"<base64>"}` items.
- Sketch on the Clip model, then generate the full song on `lyria-3.5` once the prompt works.
- One shot per call: no multi-turn edits, results vary between calls. To fix a
  section, regenerate or use a tool with inpainting/repaint.
- Prompts naming an artist's voice or asking for copyrighted lyrics are blocked. Every output
  carries an inaudible SynthID watermark.
- Show the prompt and the take count before generating: every call is billed.

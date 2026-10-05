# Captions, subtitles and talking-head recuts

> Distilled from: embedded-captions (rail, caption-grouping, failure-modes), talking-head-recut (heygen-com/hyperframes, Apache-2.0; talking-head-recut is itself adapted from notedit/vtake-skills, MIT); video-use (browser-use/video-use, MIT); ffmpeg-skill (kajisho5/ffmpeg-skill, MIT); video (coreyhaines31/marketingskills, MIT).

Most social video is watched muted, so captions are the default for anything spoken. Two different jobs share this file:
- **Captions:** the spoken words as readable text. The footage is untouched.
- **Talking-head recut:** designed graphic cards (titles, lower-thirds, data callouts, quotes, side panels, PiP) layered on a clip that plays in full, timed to what is said.

## 1. Decision gate: refuse or fix the clip first

Probe and sample frames at 20%, 50% and 80%, plus a 1 fps contact sheet (`ffmpeg -i in.mp4 -vf "fps=1,scale=160:-1,tile=10x5" sheet.png`). Stop or split when:
- multiple speakers or hard cuts appear (split per shot, or treat as a footage edit);
- there's no speech, or less than 3 s (Whisper hallucinates "Thank you." over silence; don't caption invented words);
- the source already has burned-in captions or heavy text (no second caption system on top);
- the transcript reads as gibberish (retry once with a larger model, else refuse);
- black bars exist (compute the safe content rect and keep captions inside it).

## 2. Transcript

Word-level timestamps are required. **Pick a tool:**

| The user's situation | Use | Why |
|---|---|---|
| Already captions in Descript, Resolve, Premiere or CapCut, and will style them there | That editor's captions (editor-handoff.md) | Hand over an `.srt`; don't also burn them in |
| Free, nothing leaves the machine | `npx hyperframes transcribe audio.mp3 --json --model small.en` | Local Whisper, word-level, no key |
| Verbatim words with "um" and speaker labels | `scripts/video-use/transcribe.py` (ElevenLabs Scribe) | Needs `ELEVENLABS_API_KEY` and uploads the audio: ask first |

Then correct homophones, names, product terms and numbers **in place, keeping each word's start/end**. Clamp the last word's end to the media duration.

## 3. Group words into caption cues

Break a new group at any of these:
1. a pause of 500 ms or more between words;
2. a sentence terminator (`.`, `?`, `!`, a dash pause);
3. a comma followed by 250 ms or more;
4. a discourse reset ("but", "so", "and then");
5. the group reaching 6 words or 2.5 s, whichever comes first.

Constraints: at least 2 words per group (single words only for interjections or a punchline); at least 0.5 s on screen, otherwise merge; one group visible at a time; no strobing (keep cues from flashing; under 0.35 s, grow the chunk instead).

Timing: `in = first_word.start - 0.08`; `out = min(next.in - 0.05, last_word.end + 0.6)`. Never retime individual words; the karaoke reveal uses the original word times. Word timings stay within 80 ms of the transcript.

Editorial trimming is allowed: drop um/uh, stutters and self-corrections, and trim filler like "you know" when it bloats the pace. Keep meaning, names and numbers exact. For accessibility subtitles (SRT/VTT for platforms), stay verbatim minus disfluencies.

## 4. Caption styles

| Style | Use for | Spec |
|---|---|---|
| **Rail** (default) | Talking heads, explainers, voiceover: words must read | Lower third, centred; max 2 lines, about 32 to 42 characters per line, break at clauses, no one-word orphan line; size about 4.5% of frame height (about 48 px at 1080 p, 86 px on 1080x1920 portrait); one clean sans at weight 500 to 600; white; 150 to 250 ms fade in/out |
| **Bold overlay** | Fast social, launches | About 2-word chunks, UPPERCASE, break on punctuation and pauses of 0.3 s or more; white with a 2 px black outline |
| **Natural sentence** | Documentary, education | 4 to 7 word chunks, sentence case, larger font, more bottom margin |
| **Karaoke / active word** | Social energy | Inline highlight of the spoken word: accent colour or extra weight, scale pop at most 1.1x; it stays on the rail |
| **Embed / hero** | One peak word per thought, cinematic | A big word composited behind the subject using a person matte (30 to 55% occluded), at most one per block, at least about 0.6 s of air between heroes, never two visible together |

The rail carries most of the text; embedded hero words are rare and earned. "Cinematic everything-embedded" styles suit mood pieces, never explainers where every word must be read.

### Legibility without grading the footage

Sample the luminance under the caption region across the clip:
- under 60 (dark): light text reads as is;
- 60 to 180: add a tight glyph scrim or soft shadow;
- over 180 (bright walls, windows, sky): opaque text plus a scrim; never bare light text.

The scrim hugs the text box (a 30 to 40% rounded pill), never a full-width bar or a frame-wide grade. Blend modes: `screen` vanishes on bright areas and `overlay` vanishes on dark ones. On mixed scenes use normal blending with an opaque colour.

### Placement

- Landscape: baseline about 80 to 120 px above the bottom, inside the 90% title-safe box.
- Portrait: lower middle, roughly 600 to 700 px from the bottom on 1080x1920, clear of the platform UI (TikTok covers about the bottom 22% and right 14%; Reels 20%/12%; Shorts 18%/12%).
- Never cross the face; on close crops keep caption columns away from the head; watch for gesture zones.

## 5. Burning captions in

- ffmpeg with an SRT: `ffmpeg -i in.mp4 -vf "subtitles=master.srt:force_style='FontName=Helvetica,FontSize=18,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0,Alignment=2,MarginV=35'" -c:a copy out.mp4` (`FontSize` and `MarginV` are in units of a 288-high script, not pixels, so they scale with the frame height: `MarginV=35` lifts the text about 12% of the height off the bottom, fine for 16:9. On 1080x1920, clear the platform UI with about `MarginV=95` (about 630 px), or write an .ass file with `PlayResY: 1920` and set pixels directly; check a frame).
- Toggleable instead of burned: `ffmpeg -i in.mp4 -i subs.srt -c copy -c:s mov_text out.mp4`.
- Subtitles go **last**, after overlays and after any crop or resize. Captions burned before a reframe land off-frame; burned small and then upscaled they come out soft.
- No libass? Render cues as PNGs and `overlay` them with `enable='between(t,in,out)'`.
- Non-Latin scripts need a font that covers them. Missing glyphs (tofu) mean the job failed. Emoji need colour glyph assets or they render monochrome.
- In HyperFrames, captions are their own track, built last from word timings; one caption track per project.

## 6. Caption animation rules (from failures)

- Animate only transforms and opacity on word spans. Animating letter-spacing, font-size or blur reflows lines and makes words jump.
- Don't fade both the group container and each word; the multiplied opacity snaps in. Hold the container at 1 and animate the words.
- Give each caption absolute position inside its plane; hidden flex children still take space and push others into the face or hands.
- Constrain caption width (`max-width: calc(100% - 2*padding)`) so right-aligned words don't run off-screen.
- Matte compositing: render at the source fps, or the occlusion lags the body. Use CPU inference for matting ONNX models; mixed CoreML partitions corrupt face alpha. Human-matting models drop handheld props (mics), so text won't pass behind them.

## 7. Talking-head recut (designed cards over playing footage)

Pipeline: probe → extract audio → transcribe → correct → card storyboard → card HTML → assemble → render.

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -show_entries format=duration -of json in.mp4 > metadata.json
ffmpeg -y -i in.mp4 -vn -acodec libmp3lame -q:a 2 audio.mp3
npx hyperframes transcribe audio.mp3 -d . --json --model small.en
```

**Card count from duration and density:**

| Video length | Base seconds per card |
|---|---|
| under 60 s | 6 to 8 |
| 60 s to 3 min | 8 to 12 |
| 3 to 10 min | 12 to 20 |
| 10 to 30 min | 20 to 35 |
| over 30 min | 30 to 60 |

Multiply by 0.7 for high density (numbers, lists, a new claim every 1 to 2 sentences), 1.0 for mixed, 1.5 for one slow reflective story. `cards = max(5, round(duration / secPerCard))`. Examples: a 121 s data-rich clip gives 17 cards; a 5 min mixed interview gives 19.

Cards over about 15 s need richer content (staged sub-points, data block); a static one-liner goes stale past 8 s.

**Card fields:** `id`, `intent` (one sentence), `startSec`/`endSec`, `accentIndex` (0 to 4), `zone`, `contentHints` (kicker, title, detail, data, quote), optional `transition` (cut, fade, slide, wipe).

| Zone | Bounds | Use |
|---|---|---|
| fullscreen | whole canvas | hero moments, big numbers, mantras |
| whiteboard-area | inset 40 px (or 45% of portrait height) | dense annotated data |
| lower-third | bottom 30% band | annotations over visible speaker |
| side-panel | right 42% (landscape) or bottom 40% (portrait) | data on one side, speaker on the other |
| video-overlay | full canvas, mostly transparent | callouts on full-bleed video |

No prescribed arc: the cards come from what the transcript says. Confirm the visual direction (style family, layout, aspect, card count) with the user before designing. An outro card is optional and neutral (wordmark plus one line, 1.5 to 2 s).

**Portrait sizing (phones):** about 1.3x the landscape sizes. Titles 88 to 132 px, body 30 to 40 px, kicker 18 to 22 px, primary numbers 64 to 88 px, horizontal padding 24 to 36 px. Or use container-query `clamp()` sizes when one card must work in both layouts.

**Assembly:** stage the source re-encoded with dense keyframes (`-g fps -keyint_min fps`); video bounds are set once and moved by tweening the `#video-wrap` wrapper; program audio stays on the source video element, so no remux. QA: build each card's fully visible frame first; no unintended overlap of cards, captions and video; one paused master timeline; transforms over layout properties.

## 8. Captions QA checklist

- [ ] Reading order on screen matches spoken order
- [ ] No caption over the face, the scene's own text or another caption
- [ ] No washed-out text on bright regions
- [ ] Every cue within 80 ms of its words, at least 0.5 s on screen, max 2 lines
- [ ] Inside platform safe zones (check on a frame with the zones shaded)
- [ ] Names, numbers and product terms spelled right
- [ ] Previewed on composited frames before the full render (renders cost minutes; previews cost seconds)

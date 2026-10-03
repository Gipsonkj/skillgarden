# Music-driven video, beat cuts and the audio mix

> Distilled from: music-to-video (frame-skeleton, planning, montage) and hyperframes production loop (heygen-com/hyperframes, Apache-2.0); brag audio reference (latent-spaces/brag, MIT); video-use sound rules (browser-use/video-use, MIT); ffmpeg-skill (kajisho5/ffmpeg-skill, MIT); vox-director gotchas (Alisa0808/vox-director, MIT). `scripts/music-to-video/analyze-beatgrid.py` is copied as-is from heygen-com/hyperframes (Apache-2.0, license beside it).

Use this file when a music track sets the pacing (lyric video, slideshow, kinetic promo, montage of user clips), and for any video's music, SFX and mix.

## 1. Analyze the track once and trust it

```bash
python3 scripts/music-to-video/analyze-beatgrid.py assets/bgm.mp3 -o audiomap.json --print
```

Needs ffmpeg, `librosa`, `numpy` and `soundfile` (ask before installing). It is deterministic: the same file always gives the same map. Don't re-measure beats with another tool or by ear.

`audiomap.json` gives you `tempo` (bpm), `grid` (`beats_sec`, `downbeats_sec`), `events` (onsets with drum class and metrical position) and `onset_rate`, `rolls`, `silences`, `hard_stops`, `key_moments` (SURGE/DROP...), `energy_phases` (level, energy, density, feel), `phrases`, and `audio.duration_sec`.

### Is the grid real?

| Always trustworthy | Only on genuinely rhythmic music |
|---|---|
| energy phases, events and onset rate, rolls (and their absence), silences, hard stops, key moments, phrases, duration | bpm, beat and downbeat positions |

- **Grid is real** (pacing `beat_cut`): rolls present, dense phases, or a clearly high onset rate with a steady grid. Hard cuts and per-onset reveals may land on beats.
- **Grid is fictional** (pacing `phrase_flow`): no rolls, mostly sparse phases, low onset rate. The tracker imposed a metronome (often at double tempo). Pace by phrases and energy instead: slow crossfades, long holds, never hard cuts on the grid.

## 2. Lay out frames (scenes) from the music

1. Write the frontmatter: total duration equal to `audio.duration_sec`, canvas (1920x1080 default, 1080x1920 portrait, 1080x1080 square; 30 fps) and a one-line read of the density arc.
2. Cut the track into **frames** where the music genuinely changes state: hard stops, SURGE/DROP moments, the start or end of a roll, a long gap with no onsets, a big energy jump. Merge adjacent phases that are one gesture. Expect 1 to 6 frames; a short clip may be one.
3. Snap every boundary to an audiomap anchor; then snap to the nearest beat (within half a beat) only when the grid is real. Never put a boundary inside a roll, and never leave a fragment shorter than one bar.
4. Frames tile the track: first at 0, last at the end, no gaps or overlaps.
5. For each frame set `pacing` (`beat_cut` or `phrase_flow`), 1 to 3 moods (warm, dark, hype, elegant, glitch, cinematic, playful, tense, dreamy, aggressive) and a one-line concrete `feel` ("accelerating onset stream into a held downbeat").

Frame count tracks distinct treatments, not beats. A fast track doesn't need more scenes; the density goes inside a scene.

## 3. Fill each frame

- One brand for the whole piece: one font family plus a 4 to 6 colour palette, copied from a preset rather than invented. That unity makes different treatments read as one film.
- Usually one treatment (group) per frame. Split only when one treatment can't cover it, at a real anchor, with each group at least one bar long.
- You decide WHAT (template or primitives, copy, anchor seconds from the audiomap); the builder decides HOW (micro-timing). Never write millisecond tweens into the plan.
- A video with zero user assets is complete: typography is the floor.

## 4. Weaving user media onto the beat

| Treatment | Frame pacing | How |
|---|---|---|
| **beat cut** | `beat_cut` only | One clip per strong anchor; the hero clip lands on a key moment or downbeat; outgoing clip fades to 0 ending at the next anchor |
| **Ken Burns** | `phrase_flow` | One clip held across the span with a slow push (scale 1.00 to 1.08 plus a small drift), eased over the whole span; crossfade at the edges |
| **background under text** | either | Full-bleed clip dimmed 30 to 50% behind the type; the text rides the anchors |

Clips are muted; the music is the only audio unless the user wants a clip's own sound (then mount it at root and duck the music under it). Use local staged files only. Anchors are track seconds; a scene's local time is `track_t - frame_start`.

## 5. Cutting to the beat with ffmpeg only

Snap cut points to the nearest beat, then extract segments of exactly those lengths and concat. Rules that held up:
- Snap to **strong** anchors (downbeats, key moments), not every beat. Cutting on every beat at 120 bpm (0.5 s) is a strobe.
- Hit the downbeat a frame early rather than late; the eye reads a late cut as drift.
- Text slides can't flash on beats: anything to be read follows the reading-time rule even in a beat cut (about 0.8 s for a short label, 0.3 s per word for a sentence).
- Reading-time and beat-sync conflict? Hold the text across 2 beats and cut the background underneath.
- Recompute positions after any crossfade (each overlap shifts everything after it).
- A clip shorter than its slot: slow it (`setpts`) rather than freezing the last frame.

## 6. Sound effects

- Fewer is better. About 8 SFX in an 18 s piece reads as designed; about 20 reads as stock and cheap.
- Every effect is tied to something visible: a cut, a landing, a click, a reveal.
- **Hit on the frame:** most effects have an attack before the transient. Measure where it first passes about -30 dBFS of its peak and start the file that many seconds before the contact frame.
- Use low-hiss, low-high-frequency effects for repeated or polished moments; save harsh ones for single accents.
- Typing animations: rotate through several keypress samples so repeats don't sound robotic.
- Copy only the files you use into the project's `assets/` and reference them with relative paths. Absolute paths fail in browser renderers.
- Use licensed or CC0 libraries and keep the source and licence noted for every file.

## 7. Music bed

- Music is the user's taste call. Offer two contrasting beds and let them listen; generated music defaults to "hype".
- One tasteful bed plus a few well-timed SFX usually beats silence. Silence is also a valid, deliberate choice; say so when you choose it.
- Ramp the music out before a stinger or end card instead of letting its own tail decay under the CTA.
- Audio-reactive visuals: subtle (glow or presence breathing with bass). No equalizer bars, no strobing text.

## 8. Mixing voice and music

- **Duck** music about 12 to 15 dB under speech. In HyperFrames, carve the bed with the audio tooling; a plain volume duck alone isn't a finished mix.
- ffmpeg sidechain duck:
  ```bash
  ffmpeg -i voice.wav -i music.mp3 -filter_complex \
   "[0:a]apad,asplit=2[v][sc];[1:a]volume=0.6[m];[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=250[duck];[v][duck]amix=inputs=2:duration=first:normalize=0[mix]" \
   -map "[mix]" -t <total_seconds> mix.wav
  ```
  `apad` keeps the music-only ending alive, because sidechain output follows the sidechain's length.
- **Master once** on the final mix: two-pass `loudnorm` to -14 LUFS integrated (social) with true peak at or below -1 dBTP (see delivery-qa.md).
- Then measure per section: dialogue, music-only, end card. An end card 15 dB under the dialogue, or SFX louder than speech, is a bug.
- You can't listen. Report the measured numbers rather than claiming it "sounds good".

## 9. Lyric videos

Get line or word timing by transcribing the vocal, or ask for the lyrics and place lines on phrase boundaries. Never invent or reproduce lyrics the user didn't supply.

## 10. Verify a music video

- Total duration equals the track duration; frames tile with no gaps.
- Contact sheet at t=0, each frame start, the strongest DROP/SURGE, every hard stop and the final frame.
- Never change duration or audio timing to hide a sync problem; fix the scene instead.

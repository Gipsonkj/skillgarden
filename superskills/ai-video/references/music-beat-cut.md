# Music-driven video, beat cuts and the audio mix

> Distilled from: music-to-video (frame-skeleton, planning, montage) and hyperframes production loop (heygen-com/hyperframes, Apache-2.0); brag audio reference (latent-spaces/brag, MIT); video-use sound rules (browser-use/video-use, MIT); ffmpeg-skill (kajisho5/ffmpeg-skill, MIT); vox-director gotchas (Alisa0808/vox-director, MIT); beat-cut-films and its August 2026 lessons (Gipsonkj/skillgarden, MIT). `scripts/music-to-video/analyze-beatgrid.py` is copied as-is from heygen-com/hyperframes (Apache-2.0, license beside it).

Use this file when a music track sets the pacing (lyric video, slideshow, kinetic promo, montage of user clips, a beat-cut film built from AI stills), and for any video's music, SFX and mix. Section 11 is the beat-cut film recipe and its failure modes.

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

Snap cut points to the nearest real accent (an audiomap `event`, or an onset from section 11) within about 140 ms, not to the even beat grid, then extract segments of exactly those lengths and concat. Rules that held up:
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

## 11. Beat-cut films from AI stills (vertical promo, reel, title sequence)

A short 1080x1920 film cut hard to the accents of a track, built from generated stills (and i2v clips made from them), with type cards. Every rule below cost a wasted render.

```
reference video -> measured profile (palette, cut rhythm, transitions, in-shot motion)
theme + profile -> ONE style anchor -> image-to-image every other panel
track -> spectral onsets -> absolute cut anchors -> cut plan -> render -> beat gate
```

### Sync: where the cuts land

| Failure | Fix |
|---|---|
| Timeline built by summing shot durations; 2 to 4 frame flashes or stingers push every later cut late (measured +0.53 s at the first cut growing to +1.55 s, almost 5 beats behind) | Pin every shot to an **absolute** frame. `duration = next_anchor - own_start - burst_frames_between`. Bursts eat the gap, never add to it |
| Even grid from the tempo (184.6 bpm = every 0.325 s) | A live or human performance drifts off any grid: median 59 ms out, 42% of cuts audibly off. Detect onsets and snap each anchor to the nearest accent within ~140 ms |
| Broadband (RMS-flux) onsets | Go blind in dense passages (a 2.6 s stretch with zero accents). Use STFT spectral flux, log-compressed, minus a moving median: 87 accents with a 1.31 s worst gap, against 76 with a 2.6 s hole |
| Every cut ~167 ms early; the film is that much shorter than the audio | Segments laid from frame 0 while the first started at the first onset. Stretch segment 0 back to frame 0 (same end). One film went from 37 ms median / 18 of 23 on-beat to 10 ms / 24 of 24 |
| A long hold runs straight through the drop | Any onset above strength 0.5 always ends a segment, whatever the burst/hold cycle says |
| Flash frames | A flash **eats** frames from its own segment (never inserted) and **leads** the incoming shot. Trailing the outgoing shot puts the visible cut early (77 ms median, build refused). Flash about 3 of 4 cuts; flashing all of them is a strobe |

Checks that catch these:
- Plan check: walking the segments, the running frame total must equal each segment's start. A constant difference is the leading-gap bug.
- **Gate the render, don't just report.** Compute the median offset and the share of cuts on an accent every build, and exit non-zero when the median passes 40 ms or fewer than 75% land. A report gets ignored; a failed build doesn't.
- On a dense onset grid an early cut still lands near the previous onset and scores fine. Test on a track with irregular gaps.

### Lock the look and the character

- Generate **one** style anchor, approve it, record its id or file, and make every other panel image-to-image from it. Panels from scratch come back as a different person each time.
- Face drifted anyway? Pass two references with roles ("FIRST image for composition, SECOND for face and style"). Words like "keep the same face" don't hold.
- The background is part of the lock. Enforce the setting as strictly as the figure; dark scenes keep every style element, just unlit.
- Frame waist-up or closer. Full-length figures come back with heads near a fifth of body height instead of an eighth; use a low angle for scale. Exception: a tiny figure in a vast space.
- Gaze must be explicit ("eyes locked straight at the viewer") or the subject looks off.
- Casting is the opposite case: image-to-image keeps identity by design, so make candidates text-to-image with no source. Once chosen, i2i holds them.
- "Replace X with a smaller X" reads as "remove X": say KEEP. Add negatives for things the setting implies but the anchor lacks.

### Type on cards

- Camera moves crop the type, not the card: a 1.42x slam eats about 160 px per edge. Keep type inside rows 160 to 1760 and columns 60 to 1020 on a 1080x1920 frame.
- One fixed type position for the whole film; the viewer learns it once. This mattered more than any font or colour change.
- Run a word continuously (change colour mid-word) instead of stacking it on two lines that crop differently. Upright stacked type advances about 1.55 em per letter: size from the letter count, tighten with negative tracking.
- Verify fit by measuring the exact type colours in the rendered frames; when the art shares those colours (white cloth, rice, highlights), say "can't measure" instead of "fits".
- **Type motion goes in HyperFrames, camera on a photo goes in ffmpeg.** Per-letter staggers, mask reveals, live glow and motion blur are native there; ffmpeg zooms on a flat PNG are a weak stand-in.
- A card that animates on must not loop (its dark opening replays mid-tail): `tpad=stop_mode=clone` plays once and holds. A promo card with a logo and date needs the whole tail as one encode, not a slice of each end segment. A mid-film title card is rendered as a short clip and pinned as a shot.
- Never letterbox a vertical card into a horizontal film; rebuild it at the target size, or fill the sides with a blurred, darkened copy.

### Clips instead of stills

- Panels that want motion (falling grain, smoke, a rising figure, breathing faces) become i2v clips made **from the approved panel**, the one motion technique that can't drift the face. Self-hosted Wan 2.2 on your own RunPod endpoint (billed per GPU second) for volume, a paid model when a shot must carry.
- An i2v clip opens on its still and barely moves for about a second (measured mean inter-frame motion 1.30 in the first half-second, 5.31 in the last). Cuts can measure on-beat while the film reads as a slideshow. Give each shot a `clip_offset`, clamped so the window ends inside the clip: `off = max(0, min(requested, clip_dur - seg_len - 0.05))`. In-body motion rose 4.46 to 6.14.
- Read fps and duration from `ffprobe`; clips assumed to be 16 fps / 10 s were 32 fps / 5.03 s and every offset pointed past the end.
- A 0.3 s beat needs visible movement within about 18 frames: prompt fast physical events. Video models largely ignore camera words; describe the motion as something happening in the scene.

### Craft at speed

- Symbolism dies at cut speed: be literal. Never show the thing the caption negates.
- Fragments read as labels. A small lead over a big hit ("SO THEY / BURIED HIM") costs almost no dwell and says who did what.
- Shots under about 70 ms are invisible and 4-frame flashes read as noise; a burst on half-beats reads as rhythm.
- Movement can be variants: same framing, only the face changes (about 12/255 delta, all in the face), cut as motion. Keep superseded panels; an eyes-closed version becomes the first half of an eye-open beat.

### Reference analysis

- Measure palette, cut rhythm, transitions and in-shot motion off the pixels, but numbers never give mood. Sample keyframes from the middle of the longest shots and read them with a vision model; a frame at a cut catches the transition.
- Crop phone UI (status bar, like buttons) out of screen-recorded references first, or it pollutes palette and cut detection.
- Decide whether the reference lends the colour or only the conceptual move. Copying a winter grade onto a summer film throws its identity away.

### Iteration and process

- Content-hash each segment and re-encode only what changed, in parallel: about 150 s serial per tweak fell to 36 s cold and ~20 s warm. Keep separate caches for preview and final.
- Build the manifest from clips that exist, not the ones intended, and ask the renderer's own planner how many body segments the grid yields (import it, never reimplement it); more shots than segments is a refusal after the slow part.
- New version, new filename. Verify the output, not the exit code (a string replace that matched nothing still "succeeded").
- Approve cards, panels and palette as stills first; ask before a large generation run; two wrong guesses on one shot means stop and offer options.
- Number every contact-sheet tile (label with PIL); an unlabelled grid gets the wrong option picked.

### Tool traps met on these builds

- ffmpeg `boxblur` radius and `lutrgb` expressions can't see the frame number `n`: use `gblur=sigma=N:enable='lt(n,4)'` and `negate=enable='...'`. `eq` needs `eval=frame` before its expressions see `n`.
- `hue=h=N` is a relative shift: read the value off a test strip of that image. `rotate` past about 0.16 rad on a 1600x2844 canvas cropped to 1080x1920 swings black corners into frame.
- Per-segment `-t` rounding loses frames over a long concat: overshoot the last segment and let `-shortest` trim. `tile` silently drops frames of a different size: force `scale=W:H,setsar=1` first. Builds without libfreetype have no `drawtext`: label with PIL.
- macOS screen-recording filenames contain U+202F (narrow no-break space) before AM/PM; glob for them.
- Gemini image API: an over-long prompt can return HTTP 200 with a text part and no image (shorten and retry); exhausted credits come back as `429 RESOURCE_EXHAUSTED`; the ratio goes in `generationConfig.imageConfig.aspectRatio`. On wrappers that take a `settings` object, a top-level `aspect_ratio` is silently ignored (default 16:9): read the resolved settings back.
- HyperFrames: mark a static composition `data-no-timeline` or every render waits ~45 s polling for a timeline; set initial states with `gsap.set(...)` outside the timeline, because a zero-duration `tl.set` at 0 doesn't apply while the playhead sits on 0. Run `npx hyperframes check` before every render.
- Real neon is concentric (near-white core, gold, orange, wide red haze, plus a bloom on the background), and a tube strikes (catch, fail, catch, hold) rather than fading up.

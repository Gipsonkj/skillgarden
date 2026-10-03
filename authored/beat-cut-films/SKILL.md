---
name: beat-cut-films
description: "Build short vertical beat-cut films from AI stills — analyse a reference video for palette/rhythm/transitions, generate a style-locked image set, cut it to detected musical accents, and render. Use when making a music-cut promo, reel, or title sequence from generated art, or when a cut \"doesn't match the music\". Encodes hard-won failure modes: beat drift, character drift, zoom-crop on type, and API gotchas."
---

# Beat-cut films

> **Read `LESSONS-2026-08.md` in this folder first.** It carries the failure
> modes found in August 2026, including a constant-lead bug that put every cut
> about 167ms early. Any film cut by a planner with that bug is worth rebuilding.


Pipeline for short vertical films cut to music, built from AI stills. Everything
here was paid for in wasted renders and credits — read the failure modes before
writing code.

## Pipeline

```
reference video ──> analyse.py ──> profile.json   (palette, rhythm, transitions)
theme + profile ──> ONE style anchor ──> i2i everything else ──> panels/
audio ──────────> onset detection ──> onsets.json
panels + cards + onsets ──> cut script ──> render (beat-gated)
```

`analyse.py` is your own reference analyser (not shipped with this skill): it
measures a reference off the pixels — no AI, no credits, reproducible.

---

## The four failure modes that cost the most

### 1. Cuts drift off the music

**Never build a timeline by summing durations.** Fixed-frame material inserted
between beat-anchored shots (flash frames, 2–4 frame stingers) pushes everything
after it later. Measured on a real film: +0.53s at the first cut growing to
+1.55s by the end — up to 4.8 beats behind, while every shot individually looked
correct.

Anchor each shot to an **absolute** frame position, then:
`duration = next_anchor − own_start − frames_of_bursts_between`.
Bursts consume the gap; they never add to it.

**A beat grid is not the music.** An even grid from tempo detection (e.g. 184.6
BPM → every 0.325s) disagrees with what you hear — a chenda, a live drummer, any
human performance pushes and pulls. Measured against real accents the grid was
out by a median 59ms with 42% of cuts audibly off.

Detect **onsets** and snap anchors to the nearest real accent within ~140ms.

**Onset detection must be spectral, not broadband.** RMS-flux goes blind in dense
passages — it reported a 2.6s stretch of a drum track with zero accents. Use STFT
spectral flux, log-compressed, minus a moving median. That found 87 accents with
a 1.31s worst gap where broadband found 76 with a 2.6s hole.

**Gate the render.** Compute median offset and % on-beat every build and *raise*
if it degrades. A report gets ignored; a failure doesn't:

```python
if _med > 40 or _on < 0.75*len(_acc):
    raise SystemExit(f"BEAT CHECK FAILED: median {_med:.0f}ms")
```

### 2. Characters and style drift

**Generate ONE anchor, then image-to-image everything from it.** Panels made
independently come back as a different person every time. Lock the anchor's
generationId in a file and never generate a panel from scratch again.

**Face drifted anyway? Use multi-reference, not words.** Telling the model "keep
the same face" does not hold. Passing two references does:

```
input: [{generationId: <composition>}, {generationId: <anchor>}]
prompt: "FIRST image for composition, SECOND for face and style"
```

This recovered a crown that had flattened into a squat cap.

**The background is part of the lock.** Writing "gold figure on red damask with
mandalas" and then only enforcing the figure half let two frames drift into
generic dark cave and fall out of the film. Dark scenes keep every style element,
just unlit.

**Frame waist-up or closer.** Full-length figures come back bobble-headed —
head roughly a fifth of body height instead of an eighth. Use a low angle for
scale instead. The one exception is a *tiny* figure in a vast space, where the
ratio can't be read.

**Say "eyes locked straight at the viewer"** or the subject glances off to the
side. Same for any gaze direction — it must be explicit.

### 3. Type gets eaten

**The motion crops the type, not the card.** Zoom moves crop the frame edges —
a 1.42× slam eats ~160px. Type that measures fine in the PNG comes out as
`IS CRIME?` and `URIED` in the video. Keep type inside a safe area: roughly
`rows 160–1760, cols 60–1020` on a 1080×1920 frame.

**Predictable position beats size and glow.** Alternating gutters or anchors
makes every card a hunt. Pick one position and never move it — the viewer learns
it once. This mattered more than any font or colour change.

**One continuous word, not stacked lines.** Splitting `TOO GOOD` into two block
lines crops each by a different amount and reads as broken. Run the word
continuously and change colour mid-word instead.

**Upright stacked type advances ~1.55em per character**, not the line-height.
Size from the letter count, not the width, and tighten with negative
letter-spacing.

**Verify by measuring the exact type colours** — and know when you can't.
Artwork sharing the type's colour range (rice grains, white cloth, bright
highlights) contaminates the test. Say "can't measure" rather than "fits".

### 4. Iteration is too slow to think

Serial re-encoding of 60+ segments took ~150s per tweak. Content-hash each
segment and re-encode only what changed, in parallel: **36s cold, ~20s warm**.
Keep separate caches for preview and final so switching modes doesn't thrash.

---

## Craft rules

- **Symbolism dies at speed.** An abandoned begging bowl for "nobody was poor"
  needs the viewer to reason bowl → begging → nobody begs. There is no time. Be
  literal.
- **Never put the thing you're negating in frame.** A starving man in a shot
  captioned "nobody was poor" contradicts its own caption.
- **Fragments are not a story.** `TOO GOOD / NO POOR / BURIED` reads as labels.
  A small lead over a big hit — `SO THEY / BURIED HIM` — costs almost no dwell
  and states who did what.
- **Sub-70ms shots are invisible.** 4-frame flashes read as noise; a burst on
  half-beats reads as rhythm.
- **Keep superseded states.** The eyes-closed panel becomes the first half of an
  eye-open beat. Deleting it costs the movement.
- **Movement means variants, not one image.** Same framing, only the face
  changes → they cut as motion. Measure the delta: ~12/255, all in the face.

---

## API gotchas

- **`aspect_ratio` belongs in `settings`**, not top level. The top-level arg is
  silently ignored and the default is **16:9** — a whole batch was generated
  wide and cropped before anyone noticed. Always read `resolvedSettings` back.
- **Nano Banana *is* Gemini 2.5 Flash Image.** A separate Gemini key changes
  billing, not the model.
- Signed asset URLs are long-lived — re-download rather than regenerate.

## ffmpeg traps

- `boxblur` radius and `lutrgb` expressions **cannot see frame number `n`**.
  Use `gblur=sigma=N:enable='lt(n,4)'` and `negate=enable='...'`.
- `eq` needs `eval=frame` before its expressions see `n`.
- `hue=h=N` is a **relative** shift — read the value off a test strip made from
  *that* image.
- `rotate` fills corners with black; past ~0.16 rad on a 1600×2844 canvas
  cropped to 1080×1920 they swing into frame.
- Per-segment `-t` rounding loses a few frames across a long concat — overshoot
  the final segment and let `-shortest` trim.
- Prefix-matching dispatch (`kind.startswith("b")`) collides with named moves
  (`breathe`, `fall`). Require the remainder to be digits.

## Process

- **New version, new filename.** Reusing an output name overwrote a finished
  render. Bump the letter every time.
- **Verify the output, never the exit code.** A `str.replace()` whose search
  string had the wrong number of spaces matched nothing and reported success.
- **Show before rendering.** Cards, panels and palettes get approved as stills
  first — a wrong turn then costs one image, not a batch.
- **Ask before a large generation run.** Two wrong guesses on one shot is the
  signal to stop and offer options instead of guessing a third time.

---

## What this build UNDER-used — fix on the next one

### HyperFrames was used as a screenshot tool

An earlier film rendered HTML → PNG via headless Chrome, then animated the flat
image in ffmpeg. HyperFrames renders **HTML → MP4 with a real GSAP timeline**,
and it ships a family of agent skills (`hyperframes`, `hyperframes-animation`,
`hyperframes-core`, `hyperframes-keyframes`, ...).

Everything below was approximated in ffmpeg and should be done natively:

| approximated | should be |
|---|---|
| whole-card zoom on a flat PNG | per-letter stagger, mask reveal, draw-on |
| glow baked into the PNG | glow animating on the timeline |
| `gblur` for 4 frames | real directional motion blur |
| type welded to the panel | type animating independently of the art behind it |

**Rule: if the motion is type, do it in HyperFrames. If the motion is camera on a
photo, do it in ffmpeg.** Load `hyperframes-animation` before writing any type
motion.

### Stills where video belonged

Every panel stayed a still with a fake camera move. Panels that are asking for
image-to-video: falling rice, a tumbling crown, a rising figure, faces breathing,
smoke and embers.

- **Wan 2.2 self-hosted on RunPod** — free per clip, the default
- **Higgsfield** — premium, when a shot has to carry
- i2v **from an already-approved panel** keeps the character lock intact — it is
  the only motion technique that cannot drift the face
- Video models silently ignore camera-motion prompts: describe motion as a
  physical event, and measure every returned clip before cutting it

Budget the beat grid for it: a 0.3s beat needs a clip with visible movement
inside 18 frames, so prompt for FAST physical motion or the clip reads as a still.

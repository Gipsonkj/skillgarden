# Failure modes found August 2026

Everything here cost a wrong render or a rejected cut. Each entry is the symptom
first, because that is how you will meet it again.

---

## 1. Constant lead — every cut in every film was 167ms early

**Symptom.** Rendered film is consistently a fraction shorter than its audio
(15.83s vs 16.00s), and the cut "feels slightly ahead" but verification passes.

**Cause.** Segments are laid end to end from frame 0, but the first segment
began at `marks[0]` — the first onset, typically frame 5. Those unfilled leading
frames shift EVERY cut earlier by the same amount, and the film comes out
exactly that much short.

**Why it survived for months.** On a dense onset grid a cut that is one gap
early still lands near the PREVIOUS onset, so the verifier scores it on-beat.
It only surfaced on a chenda track with irregular gaps (0.168s median, 1.31s
largest), where some early cuts fell into gaps and measured badly.

**Fix.** Stretch the first segment back to 0 — same end, no lead:

```python
if segs and segs[0][0] > 0:
    segs[0] = (0, segs[0][1] + segs[0][0])
```

On one film, identical shots and audio: median **37ms → 10ms**, on-beat **18/23 →
24/24**.

**Diagnostic that found it.** Compare the PLAN to the onsets before suspecting
the renderer or the detector. `cum` must equal `s0` at every segment; a constant
difference between them is this bug.

```python
t = 0
for s0, n in segs:
    assert t == s0, f"drift {t - s0}"
    t += n
```

---

## 2. i2v clips are dead at the head

**Symptom.** Cuts measure on-beat but the film reads as a slideshow. The user
says "it didn't cut to the music" while the numbers say 32ms.

**Cause.** An image-to-video clip opens on its source still and barely moves for
its first second. Measured: `rave` ran 1.30 mean inter-frame motion in its first
half-second and 5.31 in its last. Cutting the head of every clip at 0.13–0.4s
shows the deadest frames.

**Key insight.** Sync verification measures WHERE cuts land, not whether
anything MOVES at them. Both readings can be correct at once.

**Fix.** `clip_offset` in the manifest, clamped per segment so the window always
ends inside the clip:

```python
room = CLIP_DUR[src] - (n / fps) - 0.05
off  = max(0.0, min(requested, room))
```

Clamping matters: an unclamped offset past the clip end produces empty segments,
and short stabs then get the liveliest tail while long holds pull back to fit.
In-body motion rose 4.46 → 6.14.

**Always read fps from ffprobe.** These clips were 32fps/5.03s, not 16fps/10s as
assumed, so the first offset pointed past the end of every clip. A motion-over-
time analysis that mislabels its own time axis points at the wrong part.

---

## 3. Holds run straight through the drop

**Symptom.** "Shots stayed even after the beat dropped."

**Cause.** burst/hold alternation means a hold spans several onsets, so one shot
can sit on screen through the loudest hit in the track. Median offset never
catches this — every cut it does make is on time.

**Fix.** Any onset above `force_strength` (0.5) always ends a segment,
regardless of where the burst/hold cycle is.

Side effect worth knowing: shorter holds produce more body segments (19 → 24 on
a 16s track), so more shots fit.

---

## 4. A flash must LEAD its shot, and must eat, never insert

Two separate rules, both learned by refusal.

**Eat, never insert.** An inserted flash frame pushes every later cut off the
beat and the drift compounds. The flash takes frames FROM its segment so the
segment length is unchanged.

**Lead, don't trail.** Putting the flash on the tail of the outgoing shot places
the visible cut `fn` frames BEFORE the beat. The verifier's 80ms dedup then
keeps that early boundary and discards the on-beat one — measured 77ms median
and the build was refused. Leading the incoming shot, the cut lands on the beat
and the flash-out is the boundary dedup absorbs.

**Sparsity.** The reference flashed 20 of 29 cuts. Flashing every cut flattens
the device into a strobe — use a `skip` so roughly a quarter of cuts stay hard.

---

## 5. Cards

- **An animated card must not be looped.** A card that animates ON — a neon
  strike, a logo build — replays its dark opening frames partway through the
  tail, which reads as the film dropping out. Use `tpad=stop_mode=clone` so it
  plays once and holds its last frame.
- **A promo card has to be READ.** The tail subdivides each end segment across
  every card, giving a card a fraction of a second. Fine for a colour slam,
  useless for a logo with a date on it. Give it the whole tail via a
  `final_card` that takes the last N segments, merged into ONE encode.
- **Cards go in the tail only.** To put a title card mid-film, render it as a
  short CLIP and pin it as a shot. That is how a title card got to position 2.
- **Never letterbox a vertical card into a horizontal film.** Relay it at the
  target size from its own source assets. If it must be scaled, fill the sides
  with a blurred, darkened copy — never dead black bars.

---

## 6. Reference analysis

`analyse.py` measures palette, cuts, rhythm, transitions, in-shot motion — plus
`character` (brightness/contrast/saturation/warmth) and `energy`. Two things it
cannot do:

- **Numbers never give you mood.** Brightness 0.33 and 41% dark pixels do not
  add up to "menacing" or "tender". Sample keyframes from the MIDDLE of the
  longest shots and let a vision model read them. A frame taken at a cut catches
  the transition, not the shot.
- **Crop the phone UI first.** A screen recording's status bar, like buttons and
  nav bar pollute the palette and the cut detection.

**Take the register, not just the palette.** Copying a reference's desaturated
winter grade onto a summer film threw away that film's identity. A reference can
be a reference for the conceptual move and not for the colour — decide which.

---

## 7. Casting and character

- **i2i preserves identity by design.** While CASTING, that is the enemy —
  every variation is the same person relit. Generate from text with no source
  image to get genuinely different people. Once the person is chosen, i2i is
  exactly right and locks them across shots.
- **Aura is photography, not expression.** Low angle, rim light out of black,
  haze, deep falloff, stillness. Instructing "keep the pose, framing and
  lighting exactly" and then asking for presence are contradictory orders.
- **"Replace X with a smaller X" reads as "remove X".** Say KEEP.
- **Negatives are needed for things the anchor does not contain.** The model
  inferred beer from the setting; "no alcohol, no beer anywhere" was required.

---

## 8. Nano Banana / Gemini image API

- **Long prompts silently return no image** — HTTP 200, `finishReason: STOP`,
  a text part instead of an image. Keep prompts short and retry with a shorter
  variant rather than re-rolling the same one.
- **Credits exhaust as `429 RESOURCE_EXHAUSTED`**, not as a malformed response.
- **`aspectRatio` belongs in `generationConfig.imageConfig`.**
- Occasional artifacts: glowing amber irises on "luminous eyes" prompts;
  "deep blue-black complexion" was taken literally and produced blue skin.

---

## 9. Tooling

- **Number every contact sheet** (label each tile with PIL).
  Reviewing an unlabelled grid means counting across rows, and that is how the
  wrong option gets picked.
- **ffmpeg `tile` silently drops frames of differing size.** Force one size with
  `scale=W:H,setsar=1` before tiling.
- **Some ffmpeg builds have no `drawtext`** (built without libfreetype) — use
  PIL for labels.
- **macOS screen-recording filenames contain U+202F**, a narrow no-break space,
  between the time and AM/PM. A path typed with a normal space will not resolve;
  glob for it.
- **Generate the manifest from the clips that EXIST**, not the ones intended.
  One failed generation otherwise refuses the whole render at the very end,
  after the slow part.
- **More shots than body segments is a guaranteed refusal.** Ask the renderer's
  own planner how many segments the grid produces — import `plan_segments`,
  never reimplement it — and hold the extras back.

---

## 10. HyperFrames

- `data-no-timeline` on a static composition, or the producer polls for a
  timeline for **45 seconds on every render**.
- Initial states go through `gsap.set(...)` OUTSIDE the timeline. A
  zero-duration `tl.set` at position 0 does not apply while the playhead sits
  exactly at 0, so frame 0 renders the un-hidden state.
- Real neon is concentric: near-white core, gold, orange, wide red haze, plus a
  bloom layer so light falls on the background. A single drop-shadow reads as a
  printed glow. And a tube STRIKES — catch, fail, catch, fail, hold — it does
  not fade up.
- Run `hyperframes check` before every render; it caught both bugs above.

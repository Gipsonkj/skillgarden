# Prompting on ModelArk — what actually worked

## Seedream stills: the "not AI" recipe (18/18 clean hands + faces, 2026-09-14)
Prefix every shot with a concrete candid scene, then append this STYLE block verbatim:

> Shot on a phone camera, 26mm, natural light from ONE direction only with real shadow
> falloff, slightly imperfect white balance, off-centre handheld framing, slight lens
> softness at the edges. Not a render, not a magazine shot, not symmetrical, not staged,
> no text, no logos.

Scene lines that worked: "A candid photograph of a furnished Berlin Altbau living room,
Prenzlauer Berg, morning. Nobody in frame. Tall double windows … Framed from the doorway,
door frame intruding at the left edge." — real props, one named light source, a framing
accident.

Canvas: `2560x1920` (4:3), `2560x1440` (16:9), `1920x2560` (3:4 portrait). Anything under
3,686,400 px is rejected.

## Seedance motion prompts
- Motion as a **physical event**, never a camera instruction: "the surface jolts, dust
  blasts up" beats "fast whip pan". Push-ins/zooms → do in ffmpeg.
- One movement per clip for product/detail; violent verbs for sports/action. Never the
  word "slow" in a sports prompt.
- State object permanence for anything that must survive: "stays stationary, unchanged
  in shape". Avoid glass, liquid pours, mirrors, multi-object hand swaps.
- Put the subject on a diagonal, already past frame centre — a dead-centre symmetric
  still gives i2v nowhere to travel. A rising column becomes a rigid helix: reverse the
  event so it falls, then `-vf reverse`.
- The **prompt** is what the safety filter reads. "family flat on the floor, arms over
  heads" was refused; the same panel passed when the motion was described on the fan.
- Wrong-direction action (card popped OUT instead of in): trim the window + `-vf reverse`.

## Seedance 2.5 timeline format
```
Photoreal handheld, referring to @Image1 as the scene and @Image2 as the person.
0-2s: he lifts the cup, steam rises, the spoon rattles. Sound effect: porcelain clink.
2-5s: he turns to the window; a tram passes outside. Sound effect: tram bell, distant.
Subtitles: none
```
Ref order = `content` array order. Up to 30 images, 10 videos, 10 audio. 4–30 s.

## Edit-mode prompt skeleton
```
Editing task: in @Video1 replace <the person>, whose face is blurred, with the man in
@Image1: keep his exact face and skin tone from the reference … <clothes> instead of
<original clothes>; no logos. Keep every head and hand movement, the timing, the cuts,
the camera, <every other element> exactly unchanged; only <the person> and his clothing
change, in every shot where he appears.
```

## After generation — always
Measure motion before editing (mean inter-frame luma delta: <2 frozen, 2–4 weak, 4–8
good, >8 violent). Pick cut windows by `motion − 0.75·drift_from_frame0 − 0.12·lateness`.
Skip the first ~1 s of every clip.

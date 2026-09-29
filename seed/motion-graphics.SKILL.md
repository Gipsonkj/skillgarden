---
name: motion-graphics
description: Plan and build short motion-graphics pieces (reels, title cards, kinetic type, product explainers) with AI help. Use when asked to animate text or graphics, make a reel intro, a lower third, an explainer, or to turn a still into motion.
---

# Motion graphics

Short motion pieces live or die on three things: timing, legibility and one clear idea per beat. Plan first, animate second.

## Pick the route before anything else

| Route | Use it for | Watch out for |
|---|---|---|
| **Code-rendered** (Remotion, HTML + CSS/GSAP, Lottie) | Exact brand text, kinetic type, data, UI demos, anything that must be edited later | Needs a render step; organic motion looks stiff |
| **Generative video** (image-to-video and text-to-video models) | Organic motion, camera moves, photoreal texture, turning a poster into a loop | Text melts or misspells; hard to repeat exactly |
| **Hybrid** | Generate the moving background, set the type in code on top | Match frame rate and colour between layers |

If the piece has words the viewer must read, the words go in code, never in the generative model.

## Write a beat sheet first

Before any animation, write a table: time (seconds and frames), what is on screen, the motion, the sound cue. One idea per beat.

```
| t (s) | frames @30 | on screen            | motion                      | sound      |
|-------|------------|----------------------|-----------------------------|------------|
| 0.0   | 0–15       | "AI made this"       | words rise 40px, stagger 3f | whoosh     |
| 0.5   | 15–45      | poster reveal        | mask wipe left→right        | hit on 15  |
```

## Timing rules that hold up

- Work at **30 fps** for social unless the brief says otherwise. Think in frames, not milliseconds.
- Hold readable text for at least **1 second plus about 0.3 seconds per word**. If it can't be read at 1x on a phone, it failed.
- Entrances use an **ease-out** curve, exits an **ease-in**, and nothing important moves on a linear curve. UI-like elements feel best on a spring (low bounce).
- Stagger related elements by **2–4 frames**. More than 6 reads as slow.
- Cut or hit on the beat of the music when there is music. Put major changes on downbeats.
- The first **1–1.5 seconds** must show the hook, not a logo.

## Layout for 9:16 reels (1080×1920)

- Keep key text out of the areas the Instagram interface covers. Meta's guidance for Reels ads is to leave about **14% at the top, 35% at the bottom and 6% on each side** clear. Organic reels are similar.
- Text size: a headline at least **72px** at 1080 wide, supporting text at least **40px**.
- High contrast: light text gets a dark scrim or shadow when over footage.

## Code route: Remotion essentials

- A composition is a React component. `useCurrentFrame()` gives the frame, `useVideoConfig()` gives `fps`, `width`, `height`, `durationInFrames`.
- Animate with `interpolate(frame, [start, end], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })`. Always clamp.
- Use `spring({ frame, fps, config: { damping: 200 } })` for smooth, non-bouncy motion. Lower damping gives more bounce.
- Sequence beats with `<Sequence from={frames} durationInFrames={frames}>`. Layer with `<AbsoluteFill>`.
- Load fonts before rendering and wait for them, or the first frames render in a fallback font.
- Remotion's licence is free for individuals and small companies. Larger companies need a company licence, so check before using it for a client.

## Generative route: prompting for motion

- Start from a strong still (image-to-video beats text-to-video for control).
- Prompt the **motion**, not the picture: subject action, camera move, speed, and what stays still. For example, "slow push-in, steam rising from the cup, background static, no text changes".
- Ask for one camera move per clip. Two moves in five seconds usually warps.
- For loops, ask for the last frame to match the first, then trim to the cleanest loop point.
- Generate 3–4 takes and pick. Don't polish a bad take.

## Deliver

- Export H.264 MP4, 1080×1920, 30 fps, AAC audio. Keep reels under 90 seconds unless there's a reason.
- Watch it once on a phone at full speed before calling it done.
- Hand over the beat sheet with the file so edits are easy.

## Checklist before handing over

- [ ] Hook shows in the first 1.5 seconds
- [ ] Every text hold passes the reading-time rule
- [ ] Nothing important sits in the top 14% or bottom 35%
- [ ] No linear easing on anything the eye follows
- [ ] Text was set in code, not generated
- [ ] Watched at 1x on a phone

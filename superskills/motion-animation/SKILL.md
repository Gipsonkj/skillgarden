---
name: motion-animation
description: "Design, build, review and fix animation and motion for interfaces, the web, apps and short motion assets. Use when asked to animate anything or make it feel smooth or snappy; choose easing, duration or springs; add hover, press, modal, drawer, toast, accordion or stagger motion; review or audit animation code or find places that need motion; name an effect ('what is this animation called'); write GSAP tweens, timelines, SplitText, Flip or ScrollTrigger; build scroll reveals, pinned or scrubbed scroll scenes, parallax, Lenis or Apple-style frame sequences; add React view transitions, shared-element morphs or Framer Motion (motion/react); animate React Native or Expo with Reanimated, gestures and haptics; author or play Lottie and dotLottie; animate an SVG logo; make a Slack GIF or emoji; animate Three.js scenes, GLTF clips or cameras; make Manim math or algorithm explainers; write seek-safe animation for HyperFrames video compositions."
---

# Motion and animation

Motion that explains, responds and feels physical, across CSS, GSAP, React (View Transitions, Motion), React Native (Reanimated), Lottie, SVG, GIF, Three.js, Manim and HyperFrames. It covers deciding whether something should move, choosing the curve and timing, building it, and reviewing it. Full video production (scripts, narration, AI clips, editing, rendering pipelines) belongs to the **ai-video** super skill. Shot lists and boards belong to **storyboarding**. This skill covers the motion inside those.

## Core principles

1. **Frequency decides first.** Actions used 100+ times a day (keyboard shortcuts, command palette, typing) get no animation. Tens of times a day get near-imperceptible motion (≤150 ms). Occasional actions get standard motion. Rare moments (onboarding, success, first run) can delight.
2. **Every animation names its purpose**: orientation, feedback, continuity, hierarchy, or a deliberate brand moment. "It looks cool" on a frequent surface is a reason to cut it.
3. **Animate `transform` and `opacity` only.** `clip-path` and `filter` are fine in moderation. Never animate `width`/`height`/`top`/`left`/`margin` (use FLIP, scale proxies or `grid-template-rows`).
4. **UI motion ends fast.** Enter and exit with a strong ease-out such as `cubic-bezier(0.23, 1, 0.32, 1)`; on-screen movement uses ease-in-out `(0.77, 0, 0.175, 1)`; never `linear` except constant spins, progress and scrubbed scroll. *Conflict:* motion-design sources prescribe ease-in for exits. That holds for video and illustration, where the exit is watched. In UI the user is already moving on, so ease-out wins.
5. **Keep UI under 300 ms.** Press 100–160, tooltip 125–200, dropdown 150–250, modal or drawer 200–500 (larger travel takes longer), page transition 200–400. Exits run at 65–80% of the entrance. Only rare, playful or cinematic moments go longer. Rendered video and marketing scroll scenes follow their own pacing (see the guides).
6. **Springs for anything gestural or interruptible.** Use duration about 0.5 s with bounce about 0.2 (or `dampingRatio` 0.7–0.9). Use bounce only when the gesture carries momentum. Animations must retarget mid-flight; nothing waits for the previous one to finish.
7. **Nothing appears from nothing.** Enter from `scale(0.95–0.97)` plus opacity, never `scale(0)`. Popovers grow from their trigger (`transform-origin`); modals stay centred.
8. **Choreograph, don't sprinkle.** One lead element, then support 30–80 ms apart. Keep the total stagger under about 500 ms, and use at most one staggered group per view.
9. **Reduced motion means gentler, not nothing.** Under `prefers-reduced-motion`, swap movement for opacity or an instant change, keep feedback, and stop autoplay, parallax and loops. Hover effects are gated behind `(hover: hover) and (pointer: fine)`.
10. **Use the cheapest tool that works.** CSS transition, then CSS keyframes or WAAPI, then Motion or GSAP, then Lottie, Three.js or Rive. Add a library only for timelines, scroll scenes, layout morphs or physics.
11. **Rendered motion is a pure function of time.** Video renders, scrubbed scroll and QA hooks must seek cleanly. Use one paused timeline, explicit from-states, no `Math.random`/`Date.now`, and no wall-clock loops.
12. **Judge feel on real frames.** Before shipping, slow animations down (DevTools animation panel at 10–25%), step through frames, test on a real phone, and re-check the next day. Check numbers against the tables; never declare it smooth from reading the code.
13. **Restraint beats decoration.** Cut idle pulse loops on UI, bounce on serious data, parallax on everything, glow and shimmer as filler, and identical stagger on every list. These are the AI-slop tells (see the review guide).

## Pick the right guide

| Task | Read |
|---|---|
| Should this animate, easing and duration tables, springs, stagger, personality, accessibility, performance | [references/motion-principles.md](references/motion-principles.md) |
| Build a UI animation in CSS: press, popover, tooltip, modal, drawer, toast, accordion, tabs, hold-to-confirm, drag-dismiss, icon swap | [references/web-ui-recipes.md](references/web-ui-recipes.md) |
| Review an animation diff, audit a codebase's motion, find animation opportunities, spot AI-slop motion | [references/review-audit-opportunities.md](references/review-audit-opportunities.md) |
| "What is this effect called?", name a motion you can describe | [references/animation-vocabulary.md](references/animation-vocabulary.md) |
| GSAP tweens, eases, timelines, matchMedia, useGSAP in React, plugins (Flip, SplitText, Draggable, MorphSVG, DrawSVG) | [references/gsap.md](references/gsap.md) |
| Scroll: reveals, ScrollTrigger pin and scrub, horizontal scroll, Lenis, cinematic storytelling, frame-sequence product scroll, CSS scroll-driven | [references/scroll-animation.md](references/scroll-animation.md) |
| React `<ViewTransition>` route and shared-element morphs; Motion (Framer Motion) presence, layout, variants, gestures | [references/react-transitions-and-motion.md](references/react-transitions-and-motion.md) |
| React Native / Expo: Reanimated, gestures, haptics, screen transitions | [references/react-native-expo.md](references/react-native-expo.md) |
| Lottie JSON authoring and playback, SVG logo animation, Slack GIFs and emoji | [references/lottie-svg-gif.md](references/lottie-svg-gif.md) |
| Logo motion QA: frame capture, easing probe, path audit | `scripts/pixel2motion/` (when to run: [references/lottie-svg-gif.md](references/lottie-svg-gif.md)) |
| Build a GIF in Python | `scripts/slack-gif-creator/` (usage: [references/lottie-svg-gif.md](references/lottie-svg-gif.md)) |
| Three.js: clock, clips, mixers, GLTF skeletal animation, morph targets, blending, deterministic 3D renders | [references/threejs-animation.md](references/threejs-animation.md) |
| Manim CE math, algorithm and data explainers | [references/manim.md](references/manim.md) |
| HyperFrames: seek-safe contract, runtime adapters, motion rules, blueprints, scene transitions | [references/hyperframes-animation.md](references/hyperframes-animation.md) |
| Full video production, narration, AI video, editing | ai-video super skill |
| Storyboards and shot lists | storyboarding super skill |

To jump straight to a capability, name the task, or say "use motion-animation: <capability>" (for example "use motion-animation: review" or "use motion-animation: gsap scroll").

## Default workflow

1. **Classify the job.** Is it UI interaction, a marketing or scroll page, a mobile app, a standalone asset (Lottie, SVG, GIF), 3D, or rendered video? Open the matching guide, plus `motion-principles.md` for any UI work.
2. **Gate it.** Check how often the user sees it, what the animation is for, and whether it can be cut. Write the decision in one line before any code.
3. **Read the context.** Check the existing stack (CSS, Motion, GSAP, Reanimated), the easing and duration tokens already in use, and the reduced-motion handling. Reuse what is there; add no new library without a reason.
4. **Spec the motion.** List the properties, the easing (as a named token), the duration, the trigger, interruption behaviour, stagger, and the reduced-motion fallback. For multi-element or video pieces, write a beat list with times.
5. **Build** with the cheapest tool, using transforms and opacity, origin-aware, interruptible, and with hover gated.
6. **Verify on frames.** Slow it down, step through it, check the first and last frames and every hand-off, and test touch and reduced motion. For seekable work, jump cold to mid-points.
7. **Report.** Say what moves, why, the numbers used, the reduced-motion behaviour, and anything you could not verify.

## Done means

- [ ] Every animation has a stated purpose; frequent actions are instant or near-instant.
- [ ] Only `transform`/`opacity` (or a justified `clip-path`/`filter`) animate; there are no layout-property tweens.
- [ ] Easing is a named curve; no UI `linear` or `ease-in` entrances; durations are inside the tables.
- [ ] Interrupting mid-animation retargets smoothly, with no jumps or queued replays.
- [ ] `prefers-reduced-motion` is handled; hover is gated to fine pointers; focus and keyboard still work.
- [ ] No slop patterns: idle UI pulses, bounce on data, blanket parallax, uniform stagger everywhere.
- [ ] Rendered or seekable motion is deterministic, with correct first, middle and final frames.
- [ ] It was checked on real frames or a device, and anything unverified is said plainly.

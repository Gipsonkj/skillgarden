---
name: motion-animation
description: "Design, build, review and fix animation and motion for interfaces, the web, apps and short motion assets. Use when asked to animate anything or make it feel smooth or snappy; choose easing, duration or springs; add hover, press, modal, drawer, toast, accordion or stagger motion; review or audit animation code or find places that need motion; name an effect ('what is this animation called'); write GSAP tweens, timelines, SplitText, Flip or ScrollTrigger; build scroll reveals, pinned or scrubbed scroll scenes, parallax, Lenis or Apple-style frame sequences; add React view transitions, shared-element morphs or Framer Motion (motion/react); animate React Native or Expo with Reanimated, gestures and haptics; author or play Lottie and dotLottie; animate an SVG logo; make a Slack GIF or emoji; animate Three.js scenes, GLTF clips or cameras; make Manim math or algorithm explainers; write seek-safe HyperFrames video animation and keyframes (punch-in, Ken Burns, camera move, whip pan). Modelling: 3d-modeling."
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

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Pinned product scroll scene: `references/motion-principles.md` → `references/scroll-animation.md` → `references/gsap.md`; product frames from `image-creation` → `references/editing-references-consistency.md`; page speed from `website-building` → `references/performance-cwv.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

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
| HyperFrames: seek-safe contract, runtime adapters, motion rules, blueprints, scene transitions; keyframes for punch-ins, zooms, Ken Burns, camera moves, crop/mask reframes, match and whip hand-offs, `hyperframes keyframes` proof | [references/hyperframes-animation.md](references/hyperframes-animation.md) |
| Full video production, narration, AI video, editing | ai-video super skill |
| Storyboards and shot lists | storyboarding super skill |

To jump straight to a capability, name the task, or say "use motion-animation: <capability>" (for example "use motion-animation: review" or "use motion-animation: gsap scroll").

## Other crafts

| When the request also needs | Use |
|---|---|
| The motion becomes a finished video: narration, renders, export specs and QA | `ai-video` → `references/plan-and-route.md`, `references/hyperframes-workflows.md`, `references/delivery-qa.md` |
| A beat sheet or shot list for a longer animated piece before building | `storyboarding` → `references/story-structure.md`, `references/shot-lists-and-boards.md` |
| The component or page around the motion: states, tokens, accessibility | `frontend-ui-design` → `references/components-and-states.md`, `references/accessibility.md` |
| A cinematic demo site from AI stills and clips, or any scroll story taken live and kept fast | `website-building` → `references/motion-and-scroll.md`, `references/performance-cwv.md` |
| Stills, product frames or textures for a frame sequence or 3D scene | `image-creation` → `references/editing-references-consistency.md`, `references/web-frontend-assets.md` |
| Sound for the motion: UI sounds, hits, whooshes or a music bed | `audio-generation` → `references/sound-effects.md`, `references/music-generation.md` |
| The native screen around Reanimated motion: navigation, haptics, platform feel | `app-building` → `references/native-feel-design.md` |
| A logo to animate that doesn't exist yet or isn't clean SVG | `poster-design` → `references/logos.md` |
| Motion written into a design hand-off spec | `figma-design` → `references/handoff-specs.md` |
| Building the model or scene before animating it: Blender, Three.js setup, glTF export | `3d-modeling` → `references/blender.md`, `references/threejs-scenes.md`, `references/gltf-pipeline.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Its animation-map script that flags dead zones and uneven stagger, and the full time-coded blueprints | [hyperframes-animation](https://github.com/heygen-com/hyperframes/tree/main/skills/hyperframes-animation) (Apache-2.0; needs the HyperFrames CLI) |
| Kinetic type, logo stings, lower-thirds and animated maps rendered as MP4 or transparent overlays | [motion-graphics](https://github.com/heygen-com/hyperframes/tree/main/skills/motion-graphics) (Apache-2.0; needs the HyperFrames CLI) |
| A local Skottie player for previewing and fixing Lottie JSON | [text-to-lottie](https://github.com/diffusionstudio/lottie/tree/main/skills/text-to-lottie) (MIT) |
| Turning a raster logo into clean SVG before animating it, with GIF and video previews | [pixel2motion](https://github.com/nolangz/pixel2motion/tree/main) (MIT; only its QA scripts are bundled here) |
| Hand-drawn looks from code in 31 styles, with composed scores | [anidoodle](https://github.com/alexgreensh/anidoodle/tree/main/skills/anidoodle) (Apache-2.0; only its laws are summarised here) |
| ManimGL instead of Community Edition (its sibling skill), or the manim-composer scene planner | [manimce-best-practices](https://github.com/adithya-s-k/manim_skill/tree/main/skills/manimce-best-practices) (MIT) |
| A working scroll-scrubbed sequence demo for video, image, canvas, SVG or DOM stages | [scroll-scrubbed-visual-sequence](https://github.com/mengto/skills/tree/main/agent-skills/web-design/scroll-scrubbed-visual-sequence) (MIT) |
| Turning motion from a Figma file into code through the Figma MCP server | [figma-implement-motion](https://github.com/figma/mcp-server-guide/tree/main/skills/figma-implement-motion) (no licence: read only) |

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

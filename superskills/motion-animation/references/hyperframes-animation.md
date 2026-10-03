> Distilled from: hyperframes-animation (heygen-com/hyperframes, Apache-2.0), motion-graphics (heygen-com/hyperframes, Apache-2.0), hyperframes-keyframes (heygen-com/hyperframes, Apache-2.0), anidoodle (alexgreensh/anidoodle, Apache-2.0)

# HyperFrames: seek-safe animation for rendered video

HyperFrames renders HTML compositions to video by **seeking** to each frame time and capturing it. Any motion that runs on its own clock breaks. This file is the animation contract and the motion vocabulary for HyperFrames compositions. Composition structure, CLI, rendering, narration and full video production belong to the ai-video super skill (and the installed `hyperframes-core` / `hyperframes-cli` skills, if present); shot planning belongs to storyboarding.

The same rules apply to any frame-capture pipeline (Puppeteer screenshots, Remotion-style renders): **state must be a pure function of time.**

## The contract (every animation obeys this)

- **One paused GSAP timeline** per composition, registered on `window.__timelines` under the root's `data-composition-id`. Never autoplay or `tl.play()`, never a second free-running timeline. Build it synchronously; if setup must wait (for example on `document.fonts.ready`), register the timeline only after every tween is added, because an empty timeline registered early renders blank. No timers or promises creating tweens later.
- **Seek-safe in both directions**: `fromTo` with explicit from-states (not `from()`, which tweens *to* current CSS and silently no-ops against `opacity: 0`); absolute values, never relative `+=`; `immediateRender: false` when a later tween re-owns a target. Any frame must be correct when jumped to cold.
- **Deterministic**: no `Math.random()`, `Date.now()`, `performance.now()`. Use index-derived pseudo-random values and baked schedules. Finite repeats; `repeat: -1` only under a finite root `data-duration`.
- **Transforms and paint only**: GSAP aliases `x`, `y`, `scale`, `rotation`, plus `opacity`, colours, `borderRadius`. Never tween `width`/`height`/`top`/`left`, `display`, or raw `visibility`. `autoAlpha` is fine on an inner wrapper, never on the timed `.clip` element itself (the framework owns its visibility).
- **Layout constants, not live measurement**: compute coordinates once at setup (single-scene compositions only); in multi-scene montages later clips may not be laid out, so use authored CSS-matched constants. Never `getBoundingClientRect()` at tween time.
- **No CSS `transition`** on animated elements (it interpolates independently of seek and flickers).
- **Stagger cap**: `items × stagger ≤ ~0.5 s` so a group arrival reads as one beat.
- `data-duration` on the root governs length; the framework owns `.clip` lifecycle, so don't `gsap.set` later-scene clips at page load.

```js
const tl = gsap.timeline({ paused: true });
tl.fromTo(".headline", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.2)
  .fromTo(".sub", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.3");
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
```

## Picking a runtime (several can coexist; each registers so one seek drives all)

| Runtime | Use for | Registration / seek |
|---|---|---|
| GSAP (default, ~95%) | timelines, transforms, eases, stagger | paused timeline on `window.__timelines` |
| Lottie / dotLottie | pre-baked After Effects motion, characters, icon loops | `autoplay: false`, explicit `loop`, push player to `window.__hfLottie` (seeked via `goToAndStop(ms)`) |
| Three.js / WebGL | 3D, camera motion, shaders | render from `hf-seek` event / `window.__hfThreeTime`; `data-duration` required (see `threejs-animation.md`) |
| CSS keyframes | simple repeated motifs, shimmer | finite durations/iterations, `animation-fill-mode: both`, `data-start` on timed elements |
| WAAPI | native keyframes without GSAP | `element.animate()` with finite duration, `fill: "both"`; adapter sets `currentTime` and pauses |
| Anime.js v4 | light tweening | `autoplay: false`, push to `window.__hfAnime` explicitly (no auto-discovery) |
| TypeGPU / WebGPU | GPU particles, custom shaders | render from seek time |

Lottie specifics: load assets from local files (no remote `path` at render time); a looping Lottie is seeked modulo its length (a numeric loop count doesn't repeat under seeking, so bake repeats); a Lottie-only composition infers duration from the file, but a looping one in a longer scene needs `data-duration`. For characters, the Lottie owns the body's acting and GSAP owns the stage; read beat times from the file's `markers` (`tm` frames ÷ `fr`). Authoring Lottie itself: `lottie-svg-gif.md`.

## Compose rules, or load a blueprint

**Default: compose 2–4 atomic rules on one timeline.** The rule families worth knowing by name:

| Family | Rules |
|---|---|
| Text & type | kinetic beat slam (phrases on one shared beat array, distinct entrances), waterfall entry, discrete text sequence (typing with typos/backspaces), hacker flip / decrypt, gradient text sweep, ASR keyword glow synced to word timestamps, chromatic glitch on quantized time, 3D text depth layers, context-sensitive cursor |
| Data | counting with dynamic scale (`tabular-nums`, `Math.round` in `onUpdate`), stat bars and fills (`scaleX`/`scaleY`), chart scrub readout |
| Camera | viewport change (transform one `.world` wrapper), coordinate target zoom (scale outer + counter-translate inner), multi-phase camera (pull-back / focus / push + micro-drift), 3D camera flight, depth-of-field rack focus |
| Layout | center-outward expansion, anchored layout expand (one-axis grow without width tweens), split tilt cards, orbit 3D entry, depth scatter assemble, avatar cloud network |
| SVG | path draw (measure `getTotalLength()` at setup), icon enrichment (use SVG `transform` attributes inside icons) |
| Ambient | sine-wave loop (finite yoyo, or derive from `tl.time()`), ambient glow bloom |
| Interaction | press-release spring, cursor click ripple, cursor drag, multi-cursor choreography, control-target sync |
| Transition-y motion | spring pop entrance (`back.out`), scale swap, card morph anchor, theme crossfade morph, reactive displacement, motion blur streak (blur peaks at max speed, 0 at settle), particle burst (deterministic), nudge curve (slow-fast-slow 10/65/25 distance) |

**Blueprints** are time-coded multi-phase shot templates (reverse-engineered from product launch clips), each with one signature move. Load one only when the shot clearly matches: kinetic type beats, typewriter reveal, spatial pan stations, camera journey, zoom-out workspace reveal, constellation hub, grid card assemble, logo assemble lockup, cursor UI demo, device surface showcase, prompt-type-submit-generate, agent progress theater, panel edit live sync, comparison split, dataviz countup, ticker takeover, overwhelm surround, video-text pivot, titlecard reveal, fixed anchor cycle, transcript scroll artifact reveal.

## Scene transitions

Non-negotiables for multi-scene pieces:

1. Every scene change uses a transition; every scene has entrance animation (`fromTo`).
2. **No exit animations before a transition**: the transition is the exit. Outgoing content stays fully visible until the transition starts. Only the final scene may fade out.
3. Outgoing and incoming animate **at the same time T**; the motion is the handoff.

```js
const T = 4.0;
tl.to("#s1", { yPercent: -100, filter: "blur(8px)", duration: 0.5, ease: "power3.in" }, T);
tl.fromTo("#s2", { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: "power3.out" }, T);
```

| Energy | Primary | Duration | Ease |
|---|---|---|---|
| Calm (wellness, luxury, brand story) | blur crossfade, focus pull | 0.5–0.8 s | `sine.inOut`, `power1` |
| Medium (SaaS, corporate, explainer) | push slide, staggered blocks | 0.3–0.5 s | `power2`, `power3` |
| High (promo, sport, music, launch) | zoom through, overexposure | 0.15–0.3 s | `power4`, `expo` |

Pick one primary transition for 60–70% of cuts plus 1–2 accents. By position: opening = most distinctive (0.4–0.6 s); between related points = primary (~0.3 s); topic change = something different; climax = boldest; wind-down and outro = gentle and slowest (0.6–1.0 s). Blur peaks scale inversely with energy (calm 20–30 px, high 3–6 px). Star iris, tilt-shift, lens flare and hinge/door don't work in CSS. Shader transitions (WebGL, per-pixel warps) are available via HyperFrames' shader-transitions package and can mix with CSS crossfades in one piece.

## Keyframes: punch-ins, camera moves, reframes

Keyframes are a pose contract: name the moving subject and the visible poses that prove the motion (the final one included), keep the subject's identity, keep the runtime seek-safe, and verify the painted pixels.

**What keyframes own.** They animate visuals on wrappers inside clips. Source cuts, trims, splices, reorders and speed belong to clip timing (the ai-video super skill's HyperFrames guide); sound fades belong to the audio automation lanes.

| Request | Mechanism |
|---|---|
| Punch-in / punch-out | `scale` plus `x`/`y` (or `xPercent`/`yPercent`) on a non-timed wrapper inside the clip; a `tl.set` or a ~0.2 s tween for a hard punch, a longer tween for a smooth push |
| Multi-state zoom or reframe | One wrapper kept alive through a pose ladder, each segment with its own ease |
| Pan, Ken Burns | Wrapper translation plus slow scale (for a photo, `scale` 1 → 1.04 over the beat); authored geometry, not face tracking |
| Chained camera moves | Labelled beats on one registered timeline |
| Match cut, whip pan | Author matching geometry, direction and speed on both sides; nothing finds the matching frame for you |
| Crop or mask reframe, wipe, iris, split screen | Interpolate `clip-path` or a mask on the inner wrapper (polygon keyframes for shaped wipes) over overlapping clips; for split screens animate each crop and the divider |
| Speed change | Not a keyframe: constant `data-playback-rate` (0.1-10) or a `rate` lane in `data-automation` |
| Freeze | A held pose, final source frame or finished sub-composition can hold; a mid-source freeze needs a pre-extracted still as its own clip |

**Procedure.** (1) Identify subject, visible states, final state and runtime. (2) Choose the smallest mechanism that proves the prompt. (3) Author seek-safe keyframes and register the runtime. (4) Verify with `lint`, `check`, `hyperframes keyframes`, one focused `--shot` and snapshots at the proof times. (5) If the proof fails, fix the source keyframes and rerun the smallest failing diagnostic before rendering.

Contract: keyframe visible channels, not hidden helper state; crossfade only when the intent is replacement or dissolve; hold readable states long enough to read; the final frame is part of the animation, so don't reset to rest or end on black unless asked; when editing a starter scene keep its layout, copy, assets, colours and final state.

```js
const id = document.querySelector("[data-composition-id]").dataset.compositionId;
const tl = gsap.timeline({ paused: true });
tl.addLabel("punch", 1.0);
tl.to("#shot .inner", {
  keyframes: [
    { scale: 1.35, xPercent: -8, duration: 0.18, ease: "power3.out" }, // hard punch-in
    { scale: 1.3, xPercent: -6, duration: 1.2, ease: "sine.inOut" },   // settle
  ],
  ease: "none",
}, "punch");
window.__timelines[id] = tl;
```

- Array keyframes are a pose ladder with per-step duration and ease; percentage keyframes give exact timing inside one tween; property arrays are compact multi-stops. Put `ease: "none"` on the parent when each stop carries its own ease; use `easeEach` when every segment shares one feel.
- Derive distances and timing from the real geometry and duration; never copy example numbers.
- One subject moving between two boxes: one continuous tween or FLIP. Split `x`/`y`/`scale` into eased segments only when the viewer should feel distinct beats; every boundary changes velocity and can read as a hitch.
- Labels for semantic states, position parameters instead of chained delays, `immediateRender: false` on later `from`/`fromTo` tweens of the same property.
- Other runtimes: CSS keyframes with finite duration and iterations, `animation-fill-mode: both`, deterministic delay; Anime.js `autoplay: false`, pushed to `window.__hfAnime`; WAAPI with finite `duration` and `fill: "both"`; Three.js/WebGL by tweening a proxy `{ progress }` and rendering in `onUpdate`, or `AnimationMixer.setTime` from HyperFrames time.

**Channels.** Prefer `x/y/z`, `xPercent/yPercent`, `scale`, `rotationX/Y/Z`, `skew`, `transformOrigin`, `svgOrigin`, `opacity`, `clip-path`, masks, CSS variables, SVG path and dash values, camera transforms, shader uniforms. Avoid `top/left`, `width/height`, margin and padding, `display`, `visibility`, late DOM creation, and helper overlays doing the subject's motion. Visibility changes: `autoAlpha` or a zero-duration `tl.set` at an explicit boundary, on a wrapper.

| Need | Mechanism | Verify |
|---|---|---|
| Same subject changes box or hierarchy | FLIP / shared element (GSAP Flip) | one identity moves; no substitute crossfade |
| Subject follows a visible route | path travel (MotionPath, tangent rotation; `ease: "none"` for constant speed) | strip shot at the bends |
| Line or ring appears | stroke draw (DrawSVG, else dash offset) | partial mid frame, complete final |
| One shape becomes another | MorphSVG or path tween (primitives converted to paths, complex silhouettes split) | first, middle, final |
| Visible reveal boundary | clip, mask or shader uniform, optional inner counter-motion | edge frames and the unclipped final |
| Many items in order | indexed stagger | first, middle and last item |
| Text moves internally | line, word, character or band wrappers | strip shot plus a readable final |
| Surface stretches or crops | parent scale/skew/clip with child counter-scale | no warped final |
| UI passes through states | explicit state machine (closed, active, loading, success/error, final) | snapshots hit the states in order |
| Depth | DOM 3D (perspective on a stable parent, `preserve-3d`, z travel, rotation, occlusion) or Three.js camera and object keys | angled `--shot`, overlap snapshot |

**Timing.** Anticipation only when it clarifies cause or direction; the peak pose shows the mechanism unmistakably; follow-through sells energy; overshoot only for elastic or tactile subjects; discrete UI states take a sharp ease-out; repeated elements get ordered offsets, not identical timing; final lockups hold longer than transition poses. Smooth means continuous velocity on the same subject. Don't overlap tweens writing the same transform unless intended and checked. Don't animate a large clip-path or mask while the same hero surface is scaling or travelling: nest the reveal after the main move settles. Scale alone is fake depth.

**Proof with the CLI.**

```bash
npx hyperframes keyframes . --json
npx hyperframes keyframes . --selector "#shot .inner" --shot proof.png --samples 8
npx hyperframes keyframes . --selector "#shot .inner" --shot strip.png --layout strip --from 1 --to 2.5
npx hyperframes keyframes . --shot ghost.png --ghost --angle <angle>   # canvas, WebGL, depth
npx hyperframes snapshot . --at <first>,<proof poses>,<final-minus-hold>,<final>
```

Reading it: `flat` means no explicit middle poses, `keyframes` explicit stops, `motionPath` a route, `trace` multi-stroke drawing, `composed with` motion inherited from a parent. Even ghost spacing is constant speed, clustered ghosts a slow-in or settle, big gaps fast travel. A helper-selector shot is not proof; trust painted pixels over logs. The text report doesn't list WAAPI, so prove it with `--shot` and snapshots.

| Failure | Fix |
|---|---|
| Endpoint-only motion | add middle poses, hold the peak, rerun `--shot` |
| Identity break | keep one element alive with shared source and final boxes; drop the substitute crossfade |
| Fake 3D | add z or camera travel and occlusion; prove it from an angle |
| Wrong final | add a final hold; snapshot final-minus-hold and the exact final |
| Unseekable runtime | pause autoplay, register the instance, remove timers |
| Unreadable text | keep line boxes, reduce displacement, add a final hold |

## Techniques beyond the rules

SVG path drawing, Canvas 2D procedural art (seeded), CSS 3D transforms, per-word kinetic typography, variable-font axis animation, GSAP MotionPath, velocity-matched transitions (outgoing exit speed equals incoming entry speed), audio-reactive animation from pre-analysed amplitude data (never live audio), clip-path reveal masks, WebGL fragment shaders driven by time. Motion blur: a short directional smear on fast moves only; never on text that must be read mid-move.

## Planning a short motion graphic

A design-led motion piece (title card, lower third, data moment, social clip) flows: **plan** (does it need sourced assets? write a shot brief) → **source** assets → **design** (palette, type, beats) → **build** (reuse rules/blueprints first) → **verify** (lint, check, stills) → **approve and render**. The full pipeline, narration and rendering live in the ai-video super skill.

## Code-drawn animation (anidoodle)

For illustrated films, drawing timelapses, loops and stickers drawn entirely in code: one pure function `(frame, env)` paints every frame, `rng(seed)` only, no clock, nothing generated or downloaded. Its laws worth borrowing anywhere: every piece has one point and one payoff; a style is a way of making marks (medium, edge, mark order), not a palette swap; prove the look on one still before building end to end. Use the anidoodle skill itself for that work.

## Verify

```bash
npx hyperframes lint      # contract violations (missing duration source, banned tweens, ...)
npx hyperframes check     # render-readiness
```

Then scrub stills at beat boundaries and transitions, both forwards and by jumping cold to a mid-point. The hyperframes-animation skill also ships an animation-map script that samples every registered tween to flag dead zones and inconsistent stagger; use it from that skill's install if available.

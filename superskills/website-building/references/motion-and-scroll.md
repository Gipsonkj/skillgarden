> Distilled from: auteur (agiwhitelist/auteur, MIT), scroll-craft (nateherkai/scroll-craft, MIT), core-web-vitals (addyosmani/web-quality-skills, MIT)

# Motion, scroll storytelling and cinematic heroes

Motion is the highest-leverage polish and the easiest to overdo. Decide whether to animate before deciding how.

## 1. Should this animate at all?

Animate only if the motion does one of six jobs: shows hierarchy, narrates a sequence, confirms an action, shows a state change, keeps spatial orientation, or smooths a jarring cut. "Looks cool" is not a job.

Frequency gate (stop at the first row that matches):

| How often the user triggers it | Rule |
|---|---|
| 100+ times a day (shortcuts, command palette) | No animation |
| Tens a day (hover, list navigation) | Near zero |
| Occasional (modal, drawer, toast) | Standard motion |
| Rare / first visit (hero, onboarding) | Delight allowed |

## 2. Numbers

| Element | Duration |
|---|---|
| Button press feedback | 100-160 ms |
| Tooltip | 125-200 ms |
| Dropdown / select | 150-250 ms |
| Modal / drawer enter | 200-500 ms (exit faster: e.g. 200 in, 150 out) |
| Any UI transition > 300 ms | needs a written reason |

- Easing: enter and exit `ease-out`; on-screen morphs `ease-in-out`; marquee and progress `linear`. Never `ease-in` on UI. Built-in curves are weak; use custom ones:
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`.
- Similar elements use identical timing.
- Press: `scale(0.97)` on `:active`. Entrances start from `scale(0.95)` + opacity 0, never `scale(0)`.
- Stagger 30-80 ms between items (≤ 50 ms for lists). Stagger never blocks interaction.
- Popovers and dropdowns scale from their trigger (`transform-origin` from the library variable); modals scale from centre.
- Springs for anything a finger drives (drag, flick): e.g. `{ type: "spring", duration: 0.5, bounce: 0.2 }`; bounce > 0.3 only for playful or momentum-carrying gestures. Easing for system state changes. Toasts and toggles use CSS `transition` (retargets mid-flight), not `@keyframes`.
- Drag-to-dismiss on velocity, not distance: dismiss when `|distance| / elapsed > 0.11 px/ms`.

## 3. Performance rules (non-negotiable)

- Animate only `transform` and `opacity` (`clip-path` for wipes). Animating `width`, `height`, `top`, `left`, `margin` forces layout every frame.
- No `window.addEventListener('scroll', …)`. Use `IntersectionObserver`, CSS `animation-timeline: view()` / `scroll()`, GSAP ScrollTrigger, or Motion's `useScroll`.
- Continuous values (pointer position, scroll progress) go through motion values or a rAF loop writing styles directly, never React `useState` per tick.
- `will-change: transform` only on elements actively animating.
- Grain/noise overlays only on a `position: fixed; inset: 0; pointer-events: none` layer.
- Full-screen shader passes (bloom, grain, depth of field) cost per pixel, not per object: cap `devicePixelRatio` at 2, and measure frame rate at DPR 2 on a production build (a dev server costs about 2x per frame). Cut a pass or resolution before cutting geometry. Measure by switching passes off one at a time.
- Library routing: Motion (Framer) for component and state animation; GSAP + ScrollTrigger (+ Lenis smooth scroll) for pinned, scrubbed, horizontal scrollytelling. Do not mix GSAP/Three.js and Motion in one component tree.

## 4. Motion budget per page

- At most 3 scroll-triggered pattern families (a family = easing + distance + direction).
- Each reveal differs from the previous in at least one dimension. Same fade-up on every section fails.
- One primary wow peak per page; supporting scenes run quieter. The act before the peak is quieter than the peak.
- Reveals enhance already-visible content. Content must be readable with JS disabled; never ship sections that start at `opacity: 0` via JS.

## 5. Reduced motion is an alternative art direction

`@media (prefers-reduced-motion: reduce)` is mandatory for scroll-driven, parallax or large motion. Keep opacity and color transitions, subtle scale ≤ 2% and state indication; drop transform travel, parallax, scrubbing and slide-ins. The reduced journey must still carry the peak's information and leave no blank sections or extra empty pinned scroll.

## 6. Scroll-driven sites (scrollytelling)

Pick structure deliberately. The biggest fork, and the user's call: **one unbroken world** (a continuous camera flight) or **distinct scenes/chapters**. Do not default to a single continuous flight: it is the most expensive and fragile build and exists mainly to hide cuts.

Device kit (vary them; use at least 4 families, never the same one twice in a row):

| Device | What it does | Rules |
|---|---|---|
| `scrub` | Pre-rendered video advances with the wheel | Max 2 per page. Hero span 2.2-3.0 viewport heights (< 1.8 flies past, > 3.5 feels broken) |
| `pin` | Frame holds while copy advances line by line | Every pin must earn its scroll length; no empty pinning |
| `pan` | Vertical scroll drives lateral travel | Reads as "options"; good for ranges and galleries |
| `reveal` | Wipe or clip-path change of state | Use for a "turn" moment |
| `kinetic` | Type assembles (per line/word) | Oversized type can be the hero at zero asset weight |
| `parallax` | Layers move at different rates | Depth from visibly different rates and occlusion |
| `count` | Numbers land | Only real numbers. No number, no counter |
| `flow` | Ordinary well-made sections | Calm acts make the peak land |
| pointer | Responds to cursor or touch | Never the only way to experience content; never lock the cursor |

Pacing: 8-14 viewport heights total is a reference for long cinematic pages, not a quota. Editorial and gallery pages stay short when the journey is complete. Never add filler acts.

Write a **feeling curve** before choosing devices: one line per act (the emotion, then what on screen causes it). Two adjacent acts with the same feeling means one is filler. The ending resolves and holds; it never fades into a footer.

### Scrub video recipe

- Encode for seeking, not playback: dense keyframes. Desktop 1080p `-g 8 -keyint_min 8 -sc_threshold 0 -crf 20`; mobile 720p `-g 4 -crf 24`; `-movflags +faststart`; strip audio (`-an`).
  `ffmpeg -i in.mp4 -an -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart out.mp4`
- Hero video ≤ 2 MB, poster ≤ 300 KB; image-sequence frames ≤ 150 KB each at 1440w.
- Never write `currentTime` straight from scroll: lerp the playhead toward a target (~0.18 per frame), skip seeks smaller than ~8 ms (20 ms on mobile), and do not queue a seek while one is pending.
- Map the clip across the stage's whole visible life (including the viewport it slides in and out), or the film freezes on its first and last frames while the section moves.
- Keep the poster up until a real video frame has painted (iOS leaves a seeked, never-played muted video blank). Fetch the clip as a Blob so seeking works without HTTP range support.
- Headless Chrome cannot reproduce an iPhone's decoder, autoplay policy or Low Power Mode. Test on a real phone before calling it done.

## 7. Layered (dimensional) hero

A single photo with a parallax transform and fading text still reads flat. For a premium marketing hero:

1. Plan planes first: background, subject, foreground, atmosphere. Name what moves independently, what overlaps, and what stays physically connected.
2. Build a clean background plate with the subject removed and the space behind rebuilt; cut the subject and foreground as real alpha cutouts (check the alpha channel; a checkerboard is not transparency).
3. Keep shared contact points anchored (a person stays on the rock) with a common pivot.
4. Move planes at visibly different rates; let type sit between planes (behind the subject) while the full headline stays readable at the opening.
5. One camera idea, short sequence with a clear payoff, then resolve into the next section.
6. Art-direct mobile separately: crop, subject position, type size and order, travel distance. Type may sit above the subject on mobile.
7. Load all layers before swapping from the poster fallback; pause offscreen work; reduced motion keeps depth as a static composition.

Honour explicit "static" or "simple" briefs; dashboards do not need an invented hero.

## 8. Verify by scrolling, not by screenshot of the top

A scroll page has no single state. Serve it over HTTP (never `file://`: fetches of video, glTF or JSON fail silently and you photograph the fallback), then:

```bash
node scripts/auteur/shoot.mjs http://localhost:4500 --stops 7 --breakpoints 390,768,1440 --reduced-motion
```

(needs `playwright` installed in the project). Look at every frame for: text overflow, blank or half-fired scenes, cues that never reach full opacity, dead scroll (nothing changes for a viewport), contrast on the brightest frame under each line, two adjacent scenes with the same layout, a reduced-motion journey that is a broken ruin. Full-page captures misplace `fixed` and `sticky` elements; judge those from viewport frames. Tab through for focus order. Then state honestly what was verified and what still needs a real phone.

## Pitfalls

- Three competing peaks, or none.
- Scroll hijacking that changes wheel speed or blocks native scroll.
- A "scroll to explore" nudge or animated mouse icon.
- Autoplaying audio; any audio on a scrub clip.
- Invented stats in counters.

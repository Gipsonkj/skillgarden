> Distilled from: auteur (agiwhitelist/auteur, MIT), scroll-craft (nateherkai/scroll-craft, MIT), core-web-vitals (addyosmani/web-quality-skills, MIT), cinematic-demo-sites and web-design-asset-stack (Gipsonkj/skillgarden, MIT)

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
- Library routing: Motion (Framer) for component and state animation; GSAP + ScrollTrigger (+ Lenis smooth scroll) for pinned, scrubbed, horizontal scrollytelling. Do not mix GSAP/Three.js and Motion in one component tree. Library verdicts (Lenis, GSAP plugins, shaders, component shops) are in `stacks-astro-vue-static.md`.
- Lenis (~3 KB) does not support CSS `scroll-snap` (use `lenis/snap`) and its interpolated scroll fights native CSS scroll-driven animations: pick one lane. Tick it from GSAP's ticker, not its own rAF loop.

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

- For a full-bleed photoreal film hero, prefer a canvas JPG frame sequence (section 9): a scrubbed `<video>` stutters on iOS Safari. Scrub a real video only with the rules below and a real-iPhone test.
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

## 9. Cinematic demo site: AI stills → image-to-video → frame-sequence hero

A one-page site for a local business whose hero is a full-bleed film that advances on scroll, built from 3 AI stills animated into short clips and stitched into one scrub. Below it: a short story, 3 offer tiles, a contact or booking CTA. The aim is that the owner sees their own shop and wants the site.

**Why it looks real.** (1) Make a photoreal still first, then animate that still (i2v); never text-to-video here, it drifts and looks fake. i2v is faithful, so an AI-looking still becomes an AI-looking clip: if a clip reads fake, fix the still, not the video. (2) One small motion per clip plus "slow, no cuts"; big motion warps (melting glass, extra fingers). The crossfades carry the story. (3) Fine detail (food, craft) reads best barely moving.

| Step | Do | Numbers |
|---|---|---|
| 1 Tokens | Palette, display and body font, one signature idea, all from the subject's own world; refuse the category reflex (design-direction.md) | 4-6 hex colours |
| 2 Stills | 3 photoreal stills in **heritage → craft → payoff** order: the place, wide and atmospheric; hands on the core element (fire, blade, dough, the pour); the finished result or a happy customer | Nano Banana Pro: 16:9 = 1376×768, 9:16 = 768×1376 |
| 3 Motion | i2v each still to ~5 s | Wan 2.2 on your own RunPod endpoint (billed per GPU second), 1280×720 or 720×1280 |
| 4 Stitch | Normalise the clips, 0.6 s crossfades, extract a JPG frame sequence plus a poster, one per aspect | ~85 frames; JPG, since many ffmpeg builds lack a webp encoder |
| 5 Assemble | Tokens and real copy in the business's own language go into a scroll-hero template driven by one config file per site | |
| 6 Ship | Cloudflare Pages preview (deploy-netlify-cloudflare.md) | |

Cost per site: 3 paid stills, about 30 min of GPU time on your own endpoint, free static hosting.

### Still prompts

- Formula: `[specific subject with real props], [emotion/action], [warm | atmospheric | dramatic] light, cinematic photorealistic, 16:9`. Food adds "appetising, cinematic food photography", rooms "moody atmospheric dramatic light", people "confident, warm light". Concrete props and place; no logos or text in the image.
- Nano Banana doesn't subtract: write "an empty street", not "no cars". Put the ratio in `generationConfig.imageConfig.aspectRatio` and state it in the prompt too.
- **What reads as generated**: subject dead centre, even light everywhere, every background face resolved and pleasant, everyone aware of the camera, front-to-back sharpness, props crammed in to signal the theme. **Direct it like a photographer instead**: name the film stock, focal length and a wide aperture; ONE dominant light with real falloff into shadow; off-centre framing with a foreground object intruding at a corner; subject sharp, foreground and background soft; background people turned away and unresolved, nobody posing; slight motion blur on the moving thing; two or three props. End with "Documentary photojournalism. Not a render, not CGI, not symmetrical, not a promotional photo." Those closing register cues measurably changed the output.
- A real person (with their consent): lock identity with image-to-image from their photo sent as an image part, never a text description of the face (that invents a new person). "Old" gets read as "the person is old": say "no ageing at all" plus the garment list, and age the place by naming the year and period dress. "Old but well-kept" must be said, or you get grime.
- Ask once before burning rounds (four of five still rounds once went on discovering these): the person as they are or aged? Which decade and city? Worn-in or clean? Background people in period or present-day dress?

### Motion on Wan 2.2 (your own RunPod serverless endpoint)

- Prompt: `[one subtle motion taken from the still], slow, no cuts`, e.g. "steam gently rising off a fresh currywurst, close-up, slow, no cuts"; "the doner spit slowly rotating, meat glistening, heat-lamp glow, slow, no cuts".
- Call: `POST /run`, poll `/status/<id>`, `Authorization: Bearer $RUNPOD_API_KEY`. Input: `prompt`, `image_base64` (raw base64), `negative_prompt: "blurry, low quality, distorted, warped, deformed, extra fingers, mutated hands"`, `cfg: 2.0`, `width`/`height`, `length: 81`, `steps: 10`, `context_overlap: 48`. Output is `{ video: <base64 mp4> }`, not a URL.
- 81 frames at 1280×720 hits `executionTimeout` at ~630 s every time. Drop `length` to ~57 and keep 720p; 1024×576 at 81 frames finishes (~360 s) but is soft and falls apart under a later push-in.
- Workers are limited: 50+ jobs at once leave most past the poll deadline ("saved 6/31"). Submit in waves, poll for 40 min (150-180 min on a congested queue), and loop re-rendering only the missing clips. Run pollers as tracked background tasks, not `nohup … &`, so you see when they finish.
- Wan warps on camera moves: do push-ins in post with `zoompan` (a 2.4× push landing at 720p needs a 1080p source). Paid models (Seedance, Sora, Kling) can execute a real move when directed like a DP: a header line (duration, aspect, grade and stock), timecoded beats that name the camera action, optics and light per beat, what moves and what stays still, and a closing "prioritise / keep / avoid" note. Behaviour varies by model version: check every clip.

### Stitching and the hero

- **Never mix the concat demuxer with `xfade`.** `-c copy` concat leaves timestamps that make `xfade` silently drop every input after the first: the film is the length of clip one and nothing errors. Build the whole join as one `filter_complex`; a hard cut is a 1-frame xfade (`duration=0.04`).
- Grade generated clips toward any real footage in the same cut (`colorbalance` takes `rs/gs/bs`, `rm/gm/bm`, `rh/gh/bh`; there is no `ms`; plus `eq=saturation=…:contrast=…`).
- The hero draws the JPG frames to a full-bleed canvas. `ResizeObserver` plus `100dvh` (fixes the "shows half on a phone" bug); `prefers-reduced-motion` gets the static poster.
- One `<h1>`, real copy in the business's language (not translated English), contact CTA in one tap. Appointment businesses (barber, salon, spa, nails, tattoo, dental, workshop, gym) get a booking block: 3 steps, a mock day and time picker (selected highlighted, booked crossed out), then a WhatsApp or phone CTA.
- Demo honesty: a "DEMO · <studio>" badge and credit footer; a concept for a real business is labelled as not its official site.
- Image key out of credit (`429 RESOURCE_EXHAUSTED`): the user tops it up. Don't switch to a vendor nobody chose.

## Pitfalls

- Three competing peaks, or none.
- Scroll hijacking that changes wheel speed or blocks native scroll.
- A "scroll to explore" nudge or animated mouse icon.
- Autoplaying audio; any audio on a scrub clip.
- Invented stats in counters.

> Distilled from: text-to-lottie (diffusionstudio/lottie, MIT), hyperframes-animation adapters/lottie (heygen-com/hyperframes, Apache-2.0), pixel2motion (nolangz/pixel2motion, MIT), slack-gif-creator (anthropics/skills, Apache-2.0), motion-design (LottieFiles/motion-design-skill, MIT)

# Lottie, SVG logo motion and GIFs

Short, self-contained motion assets: icons, loaders, state feedback, logo stings, stickers, emoji GIFs.

| Deliverable | Route |
|---|---|
| Vector animation for app/web/mobile players, editable later | Lottie JSON (`.json` / `.lottie`) |
| Logo reveal, splash, brand mark loop for the web | SVG + CSS keyframes or a small JS timeline, single HTML file |
| Slack emoji or chat reaction | GIF built with PIL (scripts below) |
| Logo sting as a video file | HyperFrames or a video pipeline (`hyperframes-animation.md`, ai-video super skill) |

## Shared timing for short assets (60 fps frames)

| Asset | Length |
|---|---|
| UI micro-interaction | 12–30 frames (0.2–0.5 s) |
| Success / error / warning icon | 30–75 frames, then a stable final pose |
| Loader / spinner | 60–120-frame seamless loop |
| Logo mark | 45–120 frames; splash reveal 1.2–2 s; header reveal 0.3–0.8 s; hover 150–300 ms |
| Lower third | 45–90 frames in, 30–60 out |
| Typography reveal | 45–150 frames by text length |
| Social promo beat | 90–180 frames for one message |

Reveal spine: build → settle → **hold** (the hold is where the brand or message registers). Stagger repeated parts by 3–6 frames (compact) or 4–14 frames (expressive). Lead element first; support 2–8 frames later. Opacity can resolve before position finishes settling (readability first). One flourish per beat.

## Lottie

### Authoring JSON by hand

Top level needs `v, fr, ip, op, w, h, nm, assets, layers`. `ip` is inclusive, `op` exclusive (`fr: 60, op: 90` renders frames 0–89).

| Concept | Shape |
|---|---|
| Static property | `{ "a": 0, "k": value }` |
| Animated property | `{ "a": 1, "k": [ keyframes sorted by t ] }` |
| Scalar keyframe values | arrays: `"s": [45]` |
| Colour | RGB(A) floats 0–1; opacity 0–100; scale in percent |
| Shape layer | `ty: 4`; shapes grouped in `ty: "gr"` with the group transform `ty: "tr"` **last** in `it` |
| Primitives | rectangle `rc`, ellipse `el`, path `sh`, polystar `sr`, fill `fl`, stroke `st`, trim path `tm` |
| Styles | apply to shapes that precede them in the same group; a shape with no fill/stroke is invisible |
| Layer life | visible when `ip <= frame < op`; `parent` composes transforms (no cycles) |
| Editable values | top-level `slots`, referenced with `sid` on a property |

Easing handles: x in 0–1, y may go beyond 0–1 for overshoot/anticipation. A CSS-style `cubic-bezier(x1, y1, x2, y2)` becomes `o: {x:[x1], y:[y1]}` and `i: {x:[x2], y:[y2]}`. Bodymovin exports put both on the segment's start keyframe; the text-to-lottie spec map describes `i` on the destination keyframe. Players differ, so verify a frame mid-ease in your target player.

Minimal example (dot pops in over 24 frames with a strong ease-out):

```json
{ "v": "5.7.0", "fr": 60, "ip": 0, "op": 60, "w": 200, "h": 200, "nm": "dot-pop", "assets": [],
  "layers": [{ "ty": 4, "ind": 1, "nm": "dot", "ip": 0, "op": 60, "st": 0, "sr": 1,
    "ks": {
      "o": { "a": 1, "k": [{ "t": 0, "s": [0], "o": {"x":[0.23],"y":[1]}, "i": {"x":[0.32],"y":[1]} }, { "t": 12, "s": [100] }] },
      "s": { "a": 1, "k": [{ "t": 0, "s": [80,80,100], "o": {"x":[0.23],"y":[1]}, "i": {"x":[0.32],"y":[1]} }, { "t": 24, "s": [100,100,100] }] },
      "p": { "a": 0, "k": [100, 100, 0] }, "a": { "a": 0, "k": [0, 0, 0] }, "r": { "a": 0, "k": 0 } },
    "shapes": [{ "ty": "gr", "it": [
      { "ty": "el", "p": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [80, 80] } },
      { "ty": "fl", "c": { "a": 0, "k": [0.2, 0.5, 1, 1] }, "o": { "a": 0, "k": 100 } },
      { "ty": "tr", "p": {"a":0,"k":[0,0]}, "a": {"a":0,"k":[0,0]}, "s": {"a":0,"k":[100,100]}, "r": {"a":0,"k":0}, "o": {"a":0,"k":100} } ] }] }] }
```

Validate before anything else: `node -e "JSON.parse(require('fs').readFileSync('anim.json','utf8'))"`.

### Easing anchors (pick by behaviour, then adjust one quality)

| Anchor | Behaviour | Bezier |
|---|---|---|
| entrance-sharp | entering, mask-wipe | .20,.75,.34,.94 |
| settle-soft | settling, count-up landing, logo lockup | .00,.65,.51,.99 |
| travel-balanced | object/camera travel between states | 1.00,.49,.00,.55 |
| exit-accelerate | exiting, before a hard cut | 1.00,.02,.54,.42 |
| expressive-pop | the one active word or brand flourish | .94,.75,.34,.94 |

Only the focal element gets the strongest personality; support uses quieter anchors. Overshoot is opt-in and premium-off: prefer a short settle-back keyframe past the target.

### Design defaults

- "Premium / clean / minimal" means subtract: no framing cards, borders, dividers, glows or stacked tints unless they do a job whitespace can't. One background tone. One divider treatment if any.
- Transparent by default for logos, icons, loaders, overlays, lower thirds; full-frame scenes get a background layer (ideally a `bgColor` slot).
- Prefer native Lottie text with the font shipped alongside; convert to paths only for stroke-on, glyph morphs or handwriting.

### Construction rules

- Trim paths (`tm`) for strokes, checks, rings, circular loaders, diagram connectors, chart axes.
- Bake counters, particles, orbits and physics into keyframes; avoid expressions.
- Fake motion blur with offset duplicate layers; treat blur, glow, glass, 3D and displacement as renderer-risky.
- Path morphs need compatible vertex structures; otherwise use masks, crossfades or staged replacement.
- Loops: identical first/last frames in position, opacity, colour and perceived velocity; integer wave cycles; closed rotations. Repeated parts get phase offsets, not lockstep.
- Data: bars grow from the baseline, lines draw left to right, numbers count with tabular numerals and an ease-out landing, labels arrive after the value resolves. Serious data never bounces.
- Kinetic type: assign anchor, support and active words; only the active word gets the strong move; preserve reading order. Don't give every word identical keyframes.
- Long or multi-idea prompts: split into chapters, one job per chapter, transition chosen by purpose (continuity, contrast, reset rhythm, land a point).

### SVG → Lottie intake

Preserve the viewBox; inline CSS-dependent styling (no classes, CSS variables, web fonts, filters); resolve nested transforms; expand strokes to fills unless the draw-on is the animation; watch even-odd vs non-zero fill rules and compound holes; prefer simple linear/radial gradients; keep semantic groups for animation (mark, wordmark, accents). Compare the settled frame to the source SVG at the same scale.

### Verify

Render in the target player (Skottie for Skia/Android-native pipelines, lottie-web or dotLottie for the web). The text-to-lottie project ships a Skottie player (`npx degit diffusionstudio/lottie my-animation && npm i && npm run dev`, frames pinned with `?frame=N`). Check frame 0, the first meaningful beat, midpoint, the settle, `op - 1`, and the loop seam. Look for blank canvas, missing assets, wrong layer order, unstyled shapes, cropped content, text overflow, and visible seams.

### Playing Lottie

```js
// web
const anim = lottie.loadAnimation({ container, renderer: "svg", loop: false, autoplay: true, path: "/anim.json" });
// dotLottie
const player = new DotLottie({ canvas, src: "/anim.lottie", loop: false, autoplay: true });
```

- Always set `loop` explicitly (lottie-web treats missing as `true`).
- Respect reduced motion: `autoplay: false` + `anim.goToAndStop(anim.totalFrames - 1, true)` to show the final pose.
- React Native: `lottie-react-native`, for illustration and celebration only, never to represent UI state.
- In a rendered video (HyperFrames), Lottie must be seekable and registered: see `hyperframes-animation.md`.
- Characters (walk cycles, mascots): the Lottie owns the body's acting; the page/timeline owns the stage around it. Use a character the user owns or one licensed for redistribution.

## SVG logo animation

**Principle: minimal smooth geometry is animatable geometry.** A logo made of 3 semantic parts choreographs cleanly; 400 traced points can't.

1. **Brief first** (`motion_spec.md`): three personality words, usage context (splash 1200–2000 ms, header 300–800 ms, loading loop, hover 150–300 ms), and a choreography sketch (which parts move, in what order, which reveal pattern).
2. **Vector from a raster** (if needed): lowest complexity that matches: primitives → composites → few-curve paths → smoothed outlines → trace only for irregular silhouettes. A smooth logo must ship as smooth curves: stair-stepped edges fail even with high IoU. Overlay the render on the source each iteration; cap at ~10 iterations and ship the best smooth candidate with residuals disclosed. Audit hand-fitted curves:
   `python3 scripts/pixel2motion/svg_path_audit.py logo.svg --out-svg bezier_segments.svg --report bezier_audit.json` (flags noisy handles, tangent jumps, stair-step runs).
3. **Structure for motion**: one element or `<g>` per semantic part with stable ids (`#mark`, `#wordmark`, `#dot`, `#letter-a`); split paths along animation seams; draw-on paths get `pathLength="1"` (then `stroke-dasharray: 1; stroke-dashoffset: 1 → 0`) and start where the pen should start; staggered letters each get their own element; scale/rotate parts get `transform-box: fill-box; transform-origin: center` (or explicit SVG pivots for awkward bounding boxes).
4. **Choreograph**: anticipation : action : settle ≈ 20 : 50 : 30 (1500 ms → 300 / 750 / 450). Overlap parts by 10–20% of their duration; never let all parts start and stop on the same frame. Heavier parts move slower. Apply at least staging, slow-in/slow-out, timing, follow-through and appeal.
5. **Personality → tokens**

| Personality | Total | Enter ease | Overshoot |
|---|---|---|---|
| Playful (consumer, kids) | ~900 ms | cubic-bezier(0.34, 1.56, 0.64, 1) | ~8%, squash up to 18% |
| Premium (luxury, hospitality) | ~1600 ms | (0.4, 0, 0.6, 1), settle (0.16, 1, 0.3, 1) | 0–2%, no squash |
| Professional (fintech, B2B, health) | ~700 ms | (0, 0, 0.2, 1) | none |
| Energetic (sport, launch) | ~600 ms | (0.16, 1, 0.3, 1) | bounce settle, squash up to 25% |

6. **Reveal patterns**: draw-on (stroke), staggered assembly, scale-pop with overshoot, mask wipe, morph from a primitive, letter cascade; idle loops and hover states as separate atoms.
7. **Final Frame Contract**: the animation must land exactly on the verified static SVG (same geometry, colour, scale, position). Reduced motion shows that final state immediately.

**Gotchas**

- `animation-timing-function: var(--token)` inside `@keyframes` is silently dropped in Chromium; the segment falls back to the base timing (usually linear), creating speed cliffs at handoffs. Use literal curves inside keyframes; tokens are fine in the `animation` shorthand.
- Draw-ons along self-crossing paths (∞ marks, signatures) reveal the other branch early: split the fill into pieces between crossings, use butt caps with dash pattern `1 1` (round caps make the tip lead by half the stroke width and stall at handoffs).
- Use `animation-fill-mode: both` so seeked frames are real states.
- Expand the viewBox or rein in motion if anything clips mid-flight.

**Deterministic QA** (the scripts need Playwright with Chromium, Pillow and numpy; ask before installing). The page must expose `#logo-root`, honour `?t=<ms>` by pausing every animation at that time, and set `window.__p2mReady = true` when seeked:

```js
const t = new URLSearchParams(location.search).get("t");
if (t !== null) document.getAnimations().forEach((a) => { a.pause(); a.currentTime = Number(t); });
window.__p2mReady = true;
```

```bash
# frames at choreography-significant times + strip + final-frame diff
python3 scripts/pixel2motion/capture_motion_frames.py logo_motion.html --times 0,300,700,1000,1500 \
  --out outputs/motion_frames --strip outputs/motion_strip.png --compare-final outputs/final_render.png
# is the designed easing the one the browser runs? (catches the silent-linear keyframe bug)
python3 scripts/pixel2motion/probe_motion_continuity.py logo_motion.html --times 500,700,900 --probe "#draw:stroke-dashoffset"
# ink-pixel deltas every 10 ms across a handoff: a flatline then a jump = stall+pop
python3 scripts/pixel2motion/probe_motion_continuity.py logo_motion.html --ink-sweep 850:1010:10
```

Capture every risk window (each crossing, handoff, occluder entry/exit), not just evenly spaced beats. Wall-clock screenshots of a running animation are not evidence.

## GIFs (Slack emoji and reactions)

| Use | Size | FPS | Colours | Length |
|---|---|---|---|---|
| Emoji | 128×128 | 10–15 | 48–64 | under 3 s |
| Message GIF | 480×480 | 15–20 | 64–128 | a few seconds |

Build frames with PIL and assemble with the bundled helpers (Pillow, imageio, imageio-ffmpeg, numpy: see `scripts/slack-gif-creator/requirements.txt`; ask the user before installing). Run from `scripts/slack-gif-creator/` (or put that folder on `sys.path`) so `core` imports:

```python
from core.gif_builder import GIFBuilder
from core.easing import interpolate  # names: linear, ease_in, ease_out, ease_in_out, bounce_in, bounce_out, bounce, elastic_in, elastic_out, elastic
from core.frame_composer import create_gradient_background, draw_circle, draw_star, draw_text
from PIL import Image, ImageDraw

b = GIFBuilder(width=128, height=128, fps=12)
n = 18
for i in range(n):
    t = i / (n - 1)
    frame = create_gradient_background(128, 128, (255, 240, 200), (255, 200, 150))  # (w, h, top_rgb, bottom_rgb)
    y = interpolate(start=-40, end=64, t=t, easing="bounce_out")
    ImageDraw.Draw(frame).ellipse([44, y - 20, 84, y + 20], fill=(240, 80, 60), outline=(120, 30, 20), width=3)
    b.add_frame(frame)
b.save("bounce.gif", num_colors=48, optimize_for_emoji=True, remove_duplicates=True)
```

```python
from core.validators import validate_gif, is_slack_ready
ok, info = validate_gif("bounce.gif", is_emoji=True, verbose=True)
```

- `interpolate` silently falls back to linear for an unknown easing name. For overshoot use `core.easing.ease_back_out(t)` directly.
- Motion ideas: shake (sin offset), pulse/heartbeat (scale 0.8–1.2, two quick beats then rest), bounce (ease-in fall, `bounce_out` land), spin (`image.rotate(angle, resample=Image.BICUBIC)`), slide with `ease_out` or `ease_back_out`, zoom, particle burst (velocity + gravity + fading alpha).
- Look polished: outlines width ≥ 2, layered shapes, highlights, gradient backgrounds, contrasting outlines. Don't use emoji fonts (unreliable across platforms).
- Loops: last frame flows into the first.
- Shrink a too-big file only when asked, in this order: fewer frames/lower FPS, fewer colours, smaller size, `remove_duplicates=True`, `optimize_for_emoji=True`.
- If the user uploads an image, decide whether to animate it directly or use it as style reference.

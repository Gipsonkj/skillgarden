> Distilled from: text-to-lottie (diffusionstudio/lottie, MIT), hyperframes-animation adapters/lottie (heygen-com/hyperframes, Apache-2.0), pixel2motion (nolangz/pixel2motion, MIT), slack-gif-creator (anthropics/skills, Apache-2.0), motion-design (LottieFiles/motion-design-skill, MIT); Rive section written in our own words from the official Rive runtime docs (rive.app/docs, link-only); "From After Effects" and "Other Lottie sources" written in our own words from the official Airbnb Lottie, lottie-web, lottie-react-native, LottieFiles, Adobe, Cavalry and Jitter docs (link-only)

# Lottie, Rive, SVG logo motion and GIFs

Short, self-contained motion assets: icons, loaders, state feedback, interactive vector controls, logo stings, stickers, emoji GIFs.

## Pick a tool

| Your situation | Use | Why |
|---|---|---|
| You (or your designer) already use or pay for one of the tools below | That one | Files, presets and habits carry over; each has a route in this guide |
| A designer will make it, and you don't know their app or the target players | Ask: which app, and which players (web, iOS, Android, React Native)? | Feature support differs by app and by player; don't guess |
| No designer, no app, no account; an icon, loader, check or small loop | Claude writes Lottie JSON by hand, previewed in text-to-lottie's local Skottie player | Free and open source (MIT), runs locally, diffable |
| Logo reveal, splash or brand loop on the web only | SVG + CSS keyframes or a small JS timeline in one HTML file | Needs no player library |
| Designer animates in After Effects; free, nothing uploaded | Bodymovin | Free and open source (MIT); exports plain JSON |
| After Effects, and you want dotLottie, an optimised file or a phone preview | LottieFiles for After Effects | Exports dotLottie and optimised formats, previews by QR code; needs a LottieFiles sign-in |
| Designer works in Cavalry | Cavalry's Lottie export | Built in (File > Export Lottie...); check its unsupported list |
| Quick motion in the browser; free plan | Jitter | A motion design tool on the web; Lottie export on every plan, Free included |
| The graphic reacts to input or app data (hover, toggle, live values, resizing) | Rive (`.riv`) with a state machine and data binding | Lottie plays a timeline; Rive runs states and bindings |
| Slack emoji or chat reaction | GIF built with PIL (scripts below) | Bundled helpers hit the emoji and message GIF specs below |
| Logo sting as a video file | HyperFrames or a video pipeline (`hyperframes-animation.md`, ai-video super skill) | It's a render, not a player asset |

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

| Your situation | Player | Why |
|---|---|---|
| The app already ships a Lottie player | Keep it | Its feature support is what you've been testing against |
| Web, `.json` file | lottie-web (`svg`, `canvas` or `html` renderer) | Runs a subset of expressions; the only player in Airbnb's table with the Fill, Stroke, Tint and Tritone layer effects |
| Web, `.lottie` file | dotLottie player | Plays the `.lottie` container |
| React Native | `lottie-react-native` | Wraps the native iOS and Android players (see "From After Effects") |
| Frame checks while authoring | text-to-lottie's Skottie player | Local, pins any frame with `?frame=N` |


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

### From After Effects (Bodymovin or the LottieFiles plugin)

Claude can't open an `.aep`. The designer exports in After Effects (or first runs the audit script in `motion-app-handoff.md`); Claude picks the settings, then reads, plays and checks the result.

| Exporter | Pick it when | How |
|---|---|---|
| Bodymovin (Airbnb's lottie-web) | Free, plain JSON, nothing leaves the machine | Install from aescripts or the ZXP in lottie-web's `build/extension`. **Window > Extensions > Bodymovin**, select the comp, pick a destination, **Render**. Images and unconverted AI layers land in an `images/` folder beside the JSON. |
| LottieFiles for After Effects | You also want dotLottie, an optimised file, a device preview by QR code or the Lottie Feature Checker | Exports Lottie JSON, Optimized Lottie JSON, dotLottie, Optimized dotLottie and TGS. Needs a LottieFiles account sign-in; free to install, with some limits. Saving to a LottieFiles workspace uploads the file: name the file and wait for a yes. |

Bodymovin needs **Allow Scripts To Write Files And Access Network**: Edit > Preferences (Windows) or After Effects > Settings (macOS) > Scripting & Expressions.

Bodymovin comp settings (the gear beside each comp): **Glyphs** turns text characters into shapes (off: supply a font file or class name); **Hidden** and **Guided** export hidden or guide layers, usually needed when expressions point at them, and they add size; **Extra Comps** adds comps that expressions reference from outside the comp tree; **Standalone** bundles the player into one file; **Demo** writes a `demo.html` preview. Under expression options, **Convert expressions to keyframes** bakes them all; to bake one, add the comment line `// lottie:bake` to that expression. Neither changes the AE project.

**What breaks where.** Airbnb's supported-features table covers lottie-android, lottie-ios and lottie-web; React Native's `lottie-react-native` uses the native players, so read those columns. dotLottie players aren't in it: test them separately. 👍 works, ⛔ unsupported, ? unknown.

| AE feature | Android | iOS (Core Animation / Main Thread) | Web (SVG, Canvas, HTML) | Fix |
|---|---|---|---|---|
| Expressions (`wiggle()`, loops) | ⛔ | ⛔ / ⛔ | 👍 (a subset; lottie-web's wiki says native functions such as `wiggle` aren't supported) | Bake: Bodymovin's option, `// lottie:bake`, or **Animation > Keyframe Assistant > Convert Expression To Keyframes** (a key on every frame; the expression is kept, switched off). For size, hand-key a few loose keys instead. |
| Gaussian Blur | 👍 (4.1+) | ⛔ / ⛔ | ? | Fake a glow with a soft shape and opacity |
| Drop Shadow | 👍 (4.1+) | 👍 / 👍 | ? | Test on the web |
| Alpha matte, alpha inverted | 👍 | 👍 / 👍 | 👍 | Keep the matte small: matte size costs performance |
| Luma matte | ⛔ | ⛔ / ⛔ | ? | Rebuild as an alpha matte |
| Merge Paths | 👍 (KitKat+) | ⛔ / ⛔ | ⛔ | Combine the shapes before export, or use a matte |
| Trim Paths, multiple shapes trimmed individually | 👍 | 👍 / 👍 | 👍 | |
| Trim Paths, multiple shapes trimmed simultaneously | 👍 | ⛔ / 👍 | 👍 | Switch to individually for iOS's default engine |
| Text: glyphs / fonts | 👍 / 👍 | ⛔ / 👍 | 👍 / 👍 | Ship the font with each player, or **Layer > Create Shapes From Text** for one look everywhere |
| Layer effects Fill, Stroke, Tint, Tritone | ⛔ | ⛔ / ⛔ | 👍 | Use shape fills and strokes |
| Auto-Orient | ⛔ | ⛔ / ⛔ | 👍 | Keyframe the rotation |
| Mask modes Lighten, Darken, Difference; mask Feather | ⛔ | ⛔ / ⛔ | ⛔ | Add or Subtract only (Intersect also fails on the web) |

- iOS uses the Core Animation engine by default since Lottie 4.0 and falls back to Main Thread by itself when a file needs it; `LottieConfiguration.renderingEngine` picks one.
- Android applies blur and shadow to each fill and stroke, so overlaps darken, and clips them at the precomp's edge: pad the precomp.
- Images, precomps and time remap work on Android, iOS and the web; image sequences, video and audio don't export.

**Keep it small.** Export with the comp at 1x (AE pixels become points and dp). Parent layers instead of copying keyframes. Path (vertex) keyframes and a key on every frame (wiggler, auto-trace, baked expressions) cost the most. Convert AI, EPS and SVG layers with **Layer > Create > Create Shapes from Vector Layer** and drop the originals. A null that drives layers must stay visible at 0% opacity or it won't export. Serve web JSON gzipped. State a size budget and report the measured size.

**React Native and the web.** Current `lottie-react-native` needs React Native 0.84+ and the New Architecture (older apps: 7.3.x). `<LottieView source={require("./hero.json")} autoPlay loop={false} style={{ width: 240, height: 240 }} />`. `loop` defaults to `true`, so set it. For `.lottie` files add `"lottie"` to Metro's `resolver.assetExts`. Under reduced motion drop `autoPlay` and pass `progress={1}` (0–1, iOS and Android) to hold the final frame. Web playback: "Playing Lottie" above.

**Verify before shipping.** Compare frame 0, the busiest middle frame and the last frame in a local player against the same frames rendered from AE, then on a real iOS and Android device. List every feature you replaced or baked, and say what you could not check. Don't drop the JSON onto lottiefiles.com or any other site without a yes.

### Other Lottie sources: Cavalry and Jitter

- **Cavalry** (procedural 2D, macOS and Windows): **File > Export Lottie...**, or the Render Manager for batches. Position, rotation, fill and stroke alpha, stroke width, trim and path animation export lean; deformers, Duplicator and primitive attribute animation export but heavy. Not exported: filters and shaders, sweep and conical gradients, dash patterns, skew, track mattes and looping animation curves; text becomes shapes. Each shape's Advanced tab has a Lottie Baking setting: Still for a static scene with a large file, Animated or Nuclear when animation goes missing.
- **Jitter** (browser app): the designer exports and hands over the file. Lottie, GIF and MP4 on every plan; WebM and ProRes 4444 MOV from Pro; transparent and frame-by-frame exports on Max and Ultra. Pro adds 1080p and 60 fps exports; Max and Ultra add 4K and 120 fps. Jitter's help page lists no limits for Free. Jitter lists no Lottie limits, so run the per-player checks above.

## Rive

Pick Rive over Lottie when the graphic has to react: hover and press states, toggles, values fed from the app, layouts that resize. Pick Lottie for play-once or looping playback. A `.riv` file is binary and authored in the Rive editor, so it can't be hand-written or diffed like Lottie JSON: Claude drives the runtime from code, and changes to the file itself go through the editor (or its MCP, below).

### Packages

| Package | When |
|---|---|
| `@rive-app/webgl2` · React: `@rive-app/react-webgl2` | Default. Draws with the Rive Renderer, the same one the editor uses, so vector feathering and every blend mode render as designed. Blend modes other than Normal are costly on mobile browsers, and browsers cap WebGL contexts per page. |
| `@rive-app/canvas` · React: `@rive-app/react-canvas` | Same API on the browser's Canvas2D. Blend modes cost nothing extra and there is no context cap, but no vector feathering yet. Switching is a one-line import change: try both on real devices. |
| `@rive-app/canvas-lite` · React: `@rive-app/react-canvas-lite` | Smallest. Drops the text, layout, audio and scripting engines; content that uses them doesn't appear. |
| `@rive-app/canvas-single` | Inlines `rive.wasm` into the JS: one request instead of two, bigger bundle. |
| `@rive-app/react-native` (with `react-native-nitro-modules`) | The new React Native runtime (`rive-react-native` is the legacy one). It has native code, so Expo needs a development build (`npx expo install expo-dev-client`), not Expo Go. |

`@rive-app/webgl` is deprecated and gets no updates after v2.37.0. Rive's Runtime Sizes page (January 2026, brotli -9) lists the web WASM at about 222 KB compressed for `canvas-lite`, 567 KB for `canvas` and 648 KB for `webgl2`; the `.riv` is extra. Measure `rive.wasm` and the `.riv` in the network panel and report the real numbers.

### Get the file contract first

Before writing code, get from the designer (or read in the editor): the artboard name, the state machine name, and the view model property names and types. Use them exactly. Ways to drive the file:

- **Data binding (current).** View model properties (boolean, number, string, colour, enum, trigger, image, list, artboard) drive transitions and any bindable property, and your code can listen to them changing.
- **State machine inputs and Rive Events (deprecated).** `useStateMachineInput` (deprecated in React v4.33.0) and, in the web runtime, `stateMachineInputs()`, `onStateChange` and `EventType.RiveEvent` (events deprecated in v2.41.0) still work and existing files needn't change, but new work uses data binding. The editor's hamburger menu has **Convert Inputs to View Models**. Legacy React form: `useStateMachineInput(rive, 'SM name', 'input name')`, then `.value = true` or `.fire()` for a trigger.

### React (Next.js)

```tsx
// LikeRive.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRive, useViewModelInstanceBoolean, useViewModelInstanceTrigger } from '@rive-app/react-webgl2';

export default function LikeRive() {
  const [reduce] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const { rive, RiveComponent } = useRive({
    src: '/rive/like.riv',   // served from your own public/ folder
    stateMachine: 'Like',
    autoplay: true,
    autoBind: true,          // binds the file's default view model instance
  });
  const vmi = rive?.viewModelInstance;
  const { value: liked, setValue: setLiked } = useViewModelInstanceBoolean('liked', vmi);
  const { trigger: hover } = useViewModelInstanceTrigger('hover', vmi);
  const { setValue: setReduced } = useViewModelInstanceBoolean('prefersReducedMotion', vmi);
  useEffect(() => { if (vmi) setReduced(reduce); }, [vmi, reduce]);

  return (
    <button type="button" aria-label="Like" aria-pressed={!!liked}
      onClick={() => setLiked(!liked)} onPointerEnter={() => { if (!reduce) hover(); }}
      style={{ width: 48, height: 48 }}>
      <RiveComponent aria-hidden="true" />
    </button>
  );
}
```

```tsx
// in a client component: Rive never runs on the server, and the fallback holds the same box
const LikeRive = dynamic(() => import('./LikeRive'), { ssr: false, loading: () => <LikeIcon /> });
```

- `ssr: false` only works inside a Client Component; Next.js errors if it's used in a Server Component.
- `useRive(params, opts)` returns `rive` and `RiveComponent`. `RiveComponent` sizes itself to its container, so the parent needs a set width and height or nothing shows. `style`/`className` land on the wrapping `<div>`; other props such as `aria-*` reach the `<canvas>`.
- `useDevicePixelRatio` defaults to `true`, so retina screens stay sharp. Layout defaults to `Fit.Contain`, `Alignment.Center`; pass `layout: new Layout({ fit, alignment })` to change it (`Fit.Layout` resizes the artboard to the canvas).
- Property hooks take a path (`'settings/volume'` for nested view models) and the instance; they return `value` plus `setValue` (`trigger` for triggers, which also accept `{ onTrigger }`). `value` is `null` when the property isn't found, so check names on first run.
- The hooks bind after the first frame has rendered, even with `autoplay: false`. To set values the first frame must show, use `autoBind: false` and do the work in `onRiveReady(rive)`: `rive.viewModelByName('VM').defaultInstance()`, set values, `rive.setViewModelInstance(inst)`, then one `rive.bind()`.
- Keep `useRive` and its `RiveComponent` together in one small component; if React remounts the canvas, the animation restarts or vanishes.
- Many graphics, one file: `useRiveFile({ src })` parses once and returns `{ riveFile, status }` to share. `useOffscreenRenderer` (WebGL2 only) defaults to `true` so instances share one WebGL context; leave it.

### Vanilla JS

```js
import { Rive, Layout, Fit, Alignment } from '@rive-app/webgl2';
const r = new Rive({
  src: '/rive/like.riv', canvas, stateMachine: 'Like', autoplay: true, autoBind: true,
  layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  onLoad: () => {
    r.resizeDrawingSurfaceToCanvas();                  // match devicePixelRatio
    r.viewModelInstance.boolean('liked').value = false;  // .number() .string() .color() .enum() .trigger('x').trigger()
  },
});
addEventListener('resize', () => r.resizeDrawingSurfaceToCanvas());
// on teardown: remove the listener, then r.cleanup();
```

- Give the canvas a CSS width and height: `resizeDrawingSurfaceToCanvas()` sizes the drawing buffer from them, and without them the canvas can double in size.
- `cleanup()` stops the render loop and frees the native objects; skip it and memory leaks. In a React `useEffect`, call it in the effect's cleanup.
- Listen with `vmi.number('x').on(cb)`, stop with `.off()`.
- Name `stateMachine` (singular, v2.41.0+; `stateMachines` is deprecated). With none named, v2 plays the artboard's first linear animation, not its state machine.

### Loading, hosting and privacy

- By default the runtime fetches `rive.wasm` from unpkg. To keep the page first-party, self-host it and call `RuntimeLoader.setWasmUrl(url)` before any instance. The WASM version must match the web package the runtime wraps; a React package's own version number differs, so read the wrapped `@rive-app/*` version from its `package.json`. Serve it as `application/wasm` with `Cache-Control: public, max-age=31536000, immutable`, and add `Access-Control-Allow-Origin` if it's on another origin.
- With `@rive-app/react-canvas` under npm or yarn, `import wasmUrl from '@rive-app/canvas/rive.wasm'` (Vite: add `?url`) emits a hashed file you pass to `setWasmUrl`; pnpm needs `@rive-app/canvas` as a direct dependency at the matching version.
- Hero graphics: call `RuntimeLoader.awaitInstance()` as early as possible (guard with `typeof window !== 'undefined'`), and add `<link rel="preload" as="fetch" crossorigin>` for both the WASM and the `.riv`. The preload `href` must equal the `setWasmUrl` URL exactly, or the file downloads twice.
- `enableRiveAssetCDN` defaults to `true`, letting the runtime pull assets such as fonts from Rive's CDN. Set it to `false` when the page must load nothing from other hosts, and embed or load those assets yourself.
- A Content-Security-Policy that blocks `unsafe-eval` stops the WASM loading; allow `wasm-unsafe-eval` instead.
- Hosting `.riv` files on a CDN or bucket needs CORS headers for your page's origin.

### Reduced motion and accessibility

- Rive does not apply reduced motion for you. Pass the preference in through a view model boolean (the docs use `prefersReducedMotion`) and let the file act on it: a separate reduced path in the state machine, timeline speed bound to 0 through a converter, opacity or colour changes in place of movement, or shorter travel. If the file has no such property, ask the designer to add one, or render a static fallback under reduced motion.
- For one control, keep a real `<button>` with `aria-pressed` around an `aria-hidden` canvas, as above. For richer graphics, roles authored in the editor are exposed with `semanticsMode: SemanticMode.Enabled` and `semanticsOptions: { riveCanvasLabel }`; nothing is exposed if no semantics were authored.

### Editing the `.riv`: the Rive editor MCP

- Works only with the Rive desktop editor (macOS or Windows) open; the docs name the Early Access app. The server is local at `http://127.0.0.1:9791/mcp`. Add it with `claude mcp add --transport http rive http://127.0.0.1:9791/mcp`.
- Tools cover artboards, the scene hierarchy and properties, shapes, paths, layouts and components, linear animations, state machines, transitions, conditions and keyframes, view models and bindings, and Luau scripts and WGSL shaders.
- Flow: open the file with an artboard created, prompt, then type **End Prompt** to let the AI apply the changes. List the exact changes for the user and wait for a yes before applying them to a file they own.
- Without the editor and MCP, Claude can't open or check a `.riv`. Say which names, inputs or behaviours you took on trust.

### Verify

Names resolve (no `null` hook values), sharp at 2× and 3×, no layout shift (fallback and canvas share one box), reduced motion and keyboard work, mount and unmount a few times without leaks, and the network panel shows the WASM and `.riv` coming from where you meant.

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

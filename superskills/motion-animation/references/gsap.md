> Distilled from: gsap-core, gsap-timeline, gsap-plugins, gsap-react (greensock/gsap-skills, MIT), hyperframes-animation adapters/gsap-easing-and-stagger (heygen-com/hyperframes, Apache-2.0)

# GSAP: tweens, timelines, plugins, React

GSAP is the default JavaScript library when you need sequencing, runtime control (pause, reverse, seek), scroll-linked motion, SVG morphing, or framework-agnostic code. For a single hover or fade, CSS is cheaper. If the project already uses another library, stay with it. Scroll work lives in `scroll-animation.md`.

**Licensing:** every GSAP plugin (SplitText, MorphSVG, DrawSVG, ScrollSmoother, Inertia…) is free, including commercial use, from the public `gsap` npm package. Never generate a `.npmrc` with a GreenSock token or point at the old private registry.

```bash
npm install gsap @gsap/react   # @gsap/react only for React
```

## Tweens

```js
gsap.to(".box", { x: 100, duration: 0.6, ease: "power3.out" });     // current → target
gsap.from(".item", { autoAlpha: 0, y: 20, stagger: 0.05 });         // vars → current (entrances)
gsap.fromTo(".bar", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center" });
gsap.set(".card", { y: 0 });                                        // immediate
```

Common vars: `duration` (s, default 0.5), `delay`, `ease`, `stagger`, `repeat` (`-1` infinite), `yoyo`, `overwrite` (`false` default, `true` kills all tweens of the target, `"auto"` kills only overlapping properties), `onStart/onUpdate/onComplete`, `immediateRender`.

- Property names are camelCase (`backgroundColor`, `rotationX`).
- **Use transform aliases**, not a raw `transform` string: `x`, `y`, `xPercent`, `yPercent`, `scale`, `scaleX/Y`, `rotation`, `rotationX/Y`, `skewX/Y`, `transformOrigin`. GSAP composes them in a fixed order and they're fast. (This differs from Motion/Framer, where `x`/`y` shorthands drop frames under load; see `react-transitions-and-motion.md`.)
- **`autoAlpha`** instead of `opacity` for show/hide: at 0 it also sets `visibility: hidden`, so invisible things stop catching clicks.
- Relative values: `x: "+=20"`, `rotation: "-=30"`, `"*=2"`.
- Directional rotation: `rotation: "-170_short"`, `"_cw"`, `"_ccw"`.
- SVG: `svgOrigin: "250 100"` rotates several elements around one global point (don't combine with `transformOrigin`).
- `clearProps: "all"` (or a list) removes inline styles at the end so CSS takes over; clearing any transform part clears the whole transform.
- CSS variables animate: `gsap.to(el, { "--hue": 180 })`.
- Function values run once per target: `x: (i) => i * 50`.
- **Stacked `from()`/`fromTo()` on the same property:** set `immediateRender: false` on the later ones, or the first one's start state is overwritten and it never shows.
- `from()` animates to the *current* state. If CSS already has `opacity: 0`, `from({opacity: 0})` is a 0→0 no-op. Use `fromTo()` when the start must be explicit.

Store the return value when you need control: `const t = gsap.to(...); t.pause(); t.reverse(); t.progress(0.5); t.kill();`

## Easing

| Ease | Use |
|---|---|
| `power3.out` | house default for entrances and reveals (≈ strong UI ease-out) |
| `power1.out`, `power2.out` | gentle secondary motion |
| `power4.out`, `expo.out` | snappy, confident, premium reveals |
| `power2.inOut`, `power3.inOut` | moving something already on screen |
| `sine.inOut` | ambient float, breathing, yoyo loops |
| `none` | scrubbed scroll, constant motion, mechanical |
| `back.out(1.7)`, `elastic.out(1, 0.3)`, `bounce.out` | explicitly playful only; never the default |
| `steps(n)` | typewriter, counters, retro |

Vary energy within the smooth families (sine/power1 calm → power3 standard → power4/expo punch) rather than adding bounce for variety. One ease everywhere reads flat; bounce everywhere reads cheap, which is worse.

Custom curve: register `CustomEase` and pass a CSS bezier, e.g. `CustomEase.create("ui-out", "0.23,1,0.32,1")`. Keep invented ease names out: only documented eases or registered custom ones.

Set defaults once: `gsap.defaults({ duration: 0.6, ease: "power3.out" })`, or per timeline (preferred, it documents that sequence's motion language).

## Stagger

```js
gsap.from(".card", { y: 24, autoAlpha: 0, stagger: 0.06 });                     // 60 ms apart
gsap.from(".dot", { scale: 0.8, autoAlpha: 0, stagger: { amount: 0.3, from: "center" } });
gsap.to(".tile", { y: -10, stagger: { each: 0.05, from: "random", grid: "auto" } });
```

`each` = per item; `amount` = total spread (better when item count varies). Keep the total under ~0.5 s for UI.

## Timelines

Prefer a timeline over chained `delay`s.

```js
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power3.out" } });
tl.from(".title", { y: 30, autoAlpha: 0 })
  .from(".subtitle", { y: 20, autoAlpha: 0 }, "-=0.3")   // overlap previous by 0.3 s
  .from(".cta", { scale: 0.95, autoAlpha: 0 }, "<0.1");  // 0.1 s after previous start
```

Position parameter (third argument):

| Value | Meaning |
|---|---|
| `1` | absolute, at 1 s |
| `"+=0.5"` / `"-=0.2"` | after / overlapping the end of the timeline |
| `"<"` / `">"` | start / end of the most recently added tween |
| `"<0.2"` | 0.2 s after the previous tween's start |
| `"intro"`, `"intro+=0.3"` | at / after a label |

Labels: `tl.addLabel("outro", "+=0.5"); tl.play("outro"); tl.tweenFromTo("intro", "outro");`. Nesting: build child timelines in functions and `master.add(child(), 0)`. Control: `play, pause, reverse, restart, seek/time(2), progress(0.5), timeScale(2), kill`. Options: `paused: true`, `repeat`, `yoyo`, `onComplete`. A timeline's duration comes from its children; don't set `duration` on the constructor expecting it to stretch.

Rules: ScrollTrigger goes on the timeline or a top-level tween, never on a tween inside a timeline. Don't nest a ScrollTriggered animation inside a parent timeline.

## Responsive and reduced motion: `gsap.matchMedia()`

```js
const mm = gsap.matchMedia();
mm.add(
  { isDesktop: "(min-width: 800px)", isMobile: "(max-width: 799px)", reduce: "(prefers-reduced-motion: reduce)" },
  (ctx) => {
    const { isDesktop, reduce } = ctx.conditions;
    if (reduce) { gsap.set(".hero > *", { autoAlpha: 1 }); return; }   // gentle or static
    gsap.from(".hero > *", { y: isDesktop ? 40 : 20, autoAlpha: 0, stagger: 0.06 });
  }
);
// later: mm.revert();
```

Everything created inside reverts automatically when the query stops matching. Don't nest `gsap.context()` inside it. `gsap.matchMediaRefresh()` re-runs handlers (e.g. after an in-app reduced-motion toggle).

## React: `useGSAP`

```jsx
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);   // once, at module level

function Hero() {
  const root = useRef(null);
  const { contextSafe } = useGSAP(() => {
    gsap.from(".word", { yPercent: 100, autoAlpha: 0, stagger: 0.04 });
  }, { scope: root });           // selectors only match inside root; auto-revert on unmount

  const onClick = contextSafe(() => gsap.to(".cta", { scale: 0.97, yoyo: true, repeat: 1, duration: 0.08 }));
  return <section ref={root}>…<button className="cta" onClick={onClick}>Go</button></section>;
}
```

- Always pass `scope`; unscoped selectors hit other components.
- Animations created later (event handlers, timeouts) must be wrapped in `contextSafe`, or they aren't reverted. Remove manually added listeners in the returned cleanup.
- Config form: `useGSAP(fn, { dependencies: [x], scope, revertOnUpdate: true })` reverts and re-runs when dependencies change.
- Without `@gsap/react`: `useEffect(() => { const ctx = gsap.context(() => {...}, root); return () => ctx.revert(); }, [])`.
- SSR (Next.js): GSAP only runs on the client, inside `useGSAP`/`useEffect`. Never call `gsap` or `ScrollTrigger` during render. Add `"use client"` to the component file in the App Router.
- Register plugins at module scope, not inside components that re-render.

## Plugins (register before use)

```js
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(Flip, SplitText);
```

| Plugin | Use for | Key usage |
|---|---|---|
| **Flip** | layout changes (reorder, filter, expand, move between containers) | `const s = Flip.getState(".item"); /* change DOM */ Flip.from(s, { duration: 0.5, ease: "power2.inOut", absolute: true, nested: true })` |
| **Draggable + InertiaPlugin** | sliders, throwable cards, knobs | `Draggable.create(".card", { type: "x,y", bounds: "#area", inertia: true, edgeResistance: 0.65 })`; `type: "rotation"` for knobs |
| **Observer** | swipe/wheel direction without scroll position (full-page section flips) | `Observer.create({ target: window, type: "wheel,touch,pointer", onUp, onDown, tolerance: 10 })` |
| **SplitText** | per char/word/line text animation | see below |
| **ScrambleText** | decode/scramble text | `scrambleText: { text: "New", chars: "01", revealDelay: 0.5 }` |
| **DrawSVG** | stroke draw-on | `gsap.from("#path", { drawSVG: 0, duration: 1 })`; value is the visible segment (`"0% 100%"`, `"20% 80%"`); needs a visible stroke |
| **MorphSVG** | shape morphs, icon to icon | `morphSVG: "#target"`; `MorphSVGPlugin.convertToPath("circle, rect")`; fix twists with `shapeIndex` (`"log"` once, paste value); try `type: "rotational"` or `curveMode: true` for kinks |
| **MotionPath** | move along a path | `motionPath: { path: "#p", align: "#p", alignOrigin: [0.5, 0.5], autoRotate: true }` |
| **ScrollTo** | animated scroll | `gsap.to(window, { scrollTo: { y: "#pricing", offsetY: 64 }, duration: 0.8 })` |
| **ScrollTrigger / ScrollSmoother** | scroll | `scroll-animation.md` |
| **CustomEase / CustomWiggle / CustomBounce / EasePack** | custom curves, wiggles, rough/slow-mo eases | register, then use the name |
| **Physics2D / PhysicsProps** | projectiles, gravity | `physics2D: { velocity: 250, angle: 80, gravity: 500 }` |
| **GSDevTools** | scrubbing UI while developing | never ship it |
| **PixiPlugin** | animate PixiJS objects | `pixi: { x, y, scale }` |

### SplitText

```js
SplitText.create(".headline", {
  type: "lines,words",
  mask: "lines",           // overflow-clipped wrapper per line for rise-from-behind reveals
  autoSplit: true,         // re-split after font load / resize
  onSplit(self) {          // create animations here and return them so re-splits stay in sync
    return gsap.from(self.lines, { yPercent: 100, duration: 0.8, ease: "power4.out", stagger: 0.08 });
  },
});
```

- Split only what you animate (skip `chars` if you animate words). Chars-only needs `smartWrap: true` to avoid mid-word breaks.
- Wait for fonts (`document.fonts.ready`) or use `autoSplit`. `font-kerning: none` avoids kerning shift when splitting chars. Avoid `text-wrap: balance` on split text.
- `aria: "auto"` (default) keeps screen readers reading the original sentence.
- Revert on unmount (`split.revert()`), or let `useGSAP`/`gsap.context()` do it.

## Performance and hygiene

- Animate transforms and opacity; layout properties (`width`, `height`, `top`, `left`) only when there's no transform equivalent. For layout changes, use Flip.
- `will-change: transform` on elements with many concurrent tweens; not everywhere.
- Kill or revert what you create: tweens, timelines, ScrollTriggers, SplitText, Draggables on route change or unmount.
- `quickTo` for high-frequency pointer follow: `const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }); onMove = e => xTo(e.clientX)`.
- Webflow Interactions are GSAP under the hood; GSAP docs and these patterns apply when debugging them.

## Do not

- Chain sequences with `delay` instead of a timeline.
- Use an ease name that doesn't exist.
- Use both `svgOrigin` and `transformOrigin` on one element.
- Use a plugin without `registerPlugin`.
- Ship `markers: true` or GSDevTools.

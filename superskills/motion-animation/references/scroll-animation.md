> Distilled from: gsap-scrolltrigger (greensock/gsap-skills, MIT), cinematic-scroll-storytelling, scroll-scrubbed-visual-sequence (mengto/skills, MIT), gsap-framer-scroll-animation (github/awesome-copilot, MIT), design-motion-principles scroll section (kylezantos/design-motion-principles, MIT)

# Scroll animation: reveals, scrubbing, pinning, storytelling, frame sequences

## Two kinds of scroll motion (pick one per element)

| Kind | Behaviour | Tool | Easing |
|---|---|---|---|
| **Scroll-triggered** | plays once over a fixed duration when the element enters | ScrollTrigger `toggleActions`/`once`, Motion `whileInView`, IntersectionObserver | normal ease-out (`power3/4.out`), 0.6–1.1 s |
| **Scroll-linked (scrubbed)** | progress = scroll position, reverses when scrolling up | ScrollTrigger `scrub`, Motion `useScroll` + `useTransform`, CSS `animation-timeline` | `ease: "none"`; let the scroll do the timing |

Don't mix `scrub` and `toggleActions` on one trigger (scrub wins). Scroll-linked entrance animations play at the speed the user scrolls, which feels wrong for UI; for "appear when visible" use triggered.

Scroll motion belongs on marketing, editorial and storytelling pages. Daily-use app screens get none.

## Library choice

| Situation | Use |
|---|---|
| Vanilla, Webflow, Vue, Svelte, pinning, horizontal scroll, complex timelines | GSAP ScrollTrigger |
| React/Next, declarative entrance or simple parallax | Motion (`motion/react`) `whileInView` / `useScroll` |
| Progress bar, simple parallax, no JS | CSS scroll-driven animations (with fallback) |
| Smooth scrolling | Lenis + ScrollTrigger, or GSAP ScrollSmoother |

## ScrollTrigger essentials

```js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

gsap.from(".card", {
  y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: "power4.out",
  scrollTrigger: { trigger: ".cards", start: "top 82%", once: true },
});
```

| Option | Notes |
|---|---|
| `start` / `end` | `"<trigger edge> <viewport edge>"`: `"top center"`, `"bottom 80%"`, `"+=1000"`, `"+=200%"`, `"max"`, `clamp(top bottom)`, or a function. Default start `"top bottom"` (`"top top"` when pinning), end `"bottom top"` |
| `scrub` | `true` = locked to scroll; number = seconds of catch-up smoothing (0.8–1.4 feels cinematic) |
| `toggleActions` | onEnter, onLeave, onEnterBack, onLeaveBack, each `play pause resume reset restart complete reverse none`. Default `"play none none none"` |
| `pin` | pin the trigger (or another element) while active. Animate its children, not the pinned element |
| `pinSpacing` | default `true` adds a spacer so following content waits; `false` only if you handle layout |
| `snap` | `0.25`, `[0, 0.5, 1]`, `"labels"`, or `{ snapTo, duration, ease }` |
| `once` | kill the trigger after first completion |
| `markers` | dev only, never ship |
| `invalidateOnRefresh` | re-read function-based values on resize (use with `x: () => …`) |
| `refreshPriority` | when triggers are created out of page order (async), set so they refresh top-to-bottom |
| `onEnter/onLeave/onUpdate/onToggle` | callbacks get the instance (`progress`, `direction`, `getVelocity()`) |

- Put ScrollTrigger on a timeline or top-level tween, never on a child of a timeline.
- Create triggers top to bottom in page order, or set `refreshPriority`.
- Call `ScrollTrigger.refresh()` after images, fonts or dynamic content change layout (`window.addEventListener("load", () => ScrollTrigger.refresh())`). Resize refresh is automatic (debounced 200 ms).
- Kill on route change: `ScrollTrigger.getAll().forEach(t => t.kill())`, or use `useGSAP` in React (auto-revert).
- `ScrollTrigger.batch(".card", { start: "top 85%", onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.1, overwrite: true }) })`: one trigger per element, callbacks batched so things entering together stagger together. Callbacks receive `(elements, triggers)`.
- Standalone: `ScrollTrigger.create({ trigger, start, end, onUpdate: self => render(self.progress) })`.

### Pinned, scrubbed scene

```js
const tl = gsap.timeline({
  scrollTrigger: { trigger: ".scene", start: "top top", end: "+=200%", pin: true, scrub: 1, anticipatePin: 1 },
});
tl.fromTo(".scene-media", { scale: 1.08 }, { scale: 1, ease: "none" })
  .fromTo(".scene-copy", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.15, ease: "none" }, 0.15);
```

### Fake horizontal scroll

```js
const track = document.querySelector(".h-track");             // wide row inside a pinned panel
const scrollTween = gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: "none",                                               // required for 1:1 mapping
  scrollTrigger: {
    trigger: ".h-panel", pin: true, scrub: 1, start: "top top",
    end: () => "+=" + (track.scrollWidth - window.innerWidth),
    invalidateOnRefresh: true,
  },
});
gsap.from(".h-item .caption", {                               // trigger by horizontal position
  y: 40, autoAlpha: 0,
  scrollTrigger: { trigger: ".h-item", containerAnimation: scrollTween, start: "left center" },
});
```

The horizontal tween must use `ease: "none"`. `containerAnimation` triggers can't pin or snap. Note: the upstream gsap-scrolltrigger example for this pattern has bugs (`Max.max`, a pixel value fed to `xPercent`); use the version above.

### Smooth scroll with Lenis

```js
import Lenis from "lenis";
import "lenis/dist/lenis.css";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (t) => lenis.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  // on unmount: lenis.destroy(); gsap.ticker.remove(raf);
}
```

Other smooth-scroll libraries need `ScrollTrigger.scrollerProxy(scroller, { scrollTop(v) {…}, getBoundingClientRect() {…} })` plus a listener that calls `ScrollTrigger.update`. ScrollSmoother needs no proxy but requires `#smooth-wrapper > #smooth-content` markup; fixed elements go outside the wrapper. If pins jitter use `pinType: "fixed"`, if they don't stick use `"transform"`.

## Cinematic scroll storytelling (editorial landing pages)

Target feel: luxury editorial, restrained. No bounce, no aggressive scale jumps, no scroll hijacking, one effect per section.

**Motion tokens**

| Token | Value |
|---|---|
| Enter ease | `power3.out` / `power4.out` |
| Scrubbed scenes | `ease: "none"`, `scrub: 0.8–1.4` |
| Text reveal | 0.8–1.1 s; word stagger 0.035–0.07 s; line stagger 0.08–0.14 s |
| Card reveal | 0.9–1.2 s; card stagger 0.06–0.1 s |
| Reveal offset | `y: 24–48`, blur 4–10 px → 0 |
| Sticky card depth | scale 1 → 0.92 |
| Parallax speed | 0.1–0.2 of viewport height |

**Page anatomy and build order**: (1) static page first, readable with JS off; (2) preloader → hero entrance; (3) masked split-text headline; (4) section fade-ups (once); (5) sticky card stack; (6) parallax layers; (7) pinned scrubbed scenes only where the story needs them; (8) reduced-motion and touch fallbacks; (9) browser QA desktop + mobile.

**Masked word reveal** (no plugin; SplitText with `mask: "lines"` is the plugin route, see `gsap.md`): wrap each word in `span.mask{display:inline-block;overflow:hidden}` > `span.word{display:inline-block}`, set `aria-label` with the full sentence on the parent and `aria-hidden` on the masks, then `gsap.fromTo(words, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: "power4.out", duration: 0.95, stagger: 0.05, scrollTrigger: { trigger: el, start: "top 82%", once: true } })`. Don't split text that contains links.

**Sticky card stack**

```css
[data-stack-card] { position: sticky; top: 12vh; transform-origin: center top; }
```
```js
cards.forEach((card, i) => {
  const next = cards[i + 1]; if (!next) return;
  gsap.to(card, { scale: 0.92 + i * 0.015, autoAlpha: 0.72, y: -24, ease: "none",
    scrollTrigger: { trigger: next, start: "top 78%", end: "top 24%", scrub: true, invalidateOnRefresh: true } });
});
```

**Parallax**: `gsap.to(layer, { y: () => innerHeight * -0.16, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true } })`. Keep distances small; parallax is a vestibular trigger.

**Preloader**: bar `scaleX 0→1` (1.1 s, power3.out), then panel `yPercent: -100` (0.9 s, power4.inOut), then remove it and start the hero. It must exit even when images load slowly; skip it entirely under reduced motion.

**QA**: content readable without JS; reduced motion shows static content and no smooth-scroll layer; reveals play once; sticky cards don't overlap the footer or trap the page; `refresh()` after fonts/images; simplify or drop pinning on mobile if it drops frames.

## Scroll-scrubbed visual sequence (Apple-style product scroll)

One visual transformation (product assembly, rotation, hero morph, UI walkthrough) driven forward and backward by native scroll.

Define the sequence as config before coding:

```js
const sequence = { scrollVh: 280, frameCount: 96, fit: "contain", posterFrame: 0, reducedMotionFrame: 95, copyStops: [0, 0.42, 0.78] };
```

One normalised progress value drives every renderer; scroll position is the only source of truth (never wheel delta, elapsed time or autoplay):

```js
const progress = Math.min(1, Math.max(0, (scrollY - sectionTop) / (sectionHeight - innerHeight)));
```

| Renderer | When | Rules |
|---|---|---|
| Video | continuous, photographic | encode with frequent keyframes (e.g. every frame or 2), reserve aspect ratio, write `currentTime` at most once per rAF |
| Image sequence | exact art-directed frames | preload the current frame first, then neighbours; never block first paint on the whole set; clamp index to `0…frameCount-1` |
| Canvas | procedural or composited | cap DPR at 2, redraw only when progress changes |
| SVG / DOM | diagrams, UI states, accessible text | transforms, opacity, clip-path, CSS variables |
| WebGL | real depth or lighting matters | static poster fallback, dispose on exit |

Stage: section in normal flow with `height: calc(var(--scrollVh) * 1vh)`, visual in a `position: sticky; top: 0; height: 100vh` stage, copy in its own semantic layer (never baked into frames). Map progress linearly first; add smoothing only after it's correct. With GSAP: `ScrollTrigger.create({ trigger: section, start: "top top", end: () => "+=" + innerHeight * 2.8, pin: stage, scrub: true, invalidateOnRefresh: true, onUpdate: ({ progress }) => render(progress) })`.

Media safety: keep a poster until the first real frame paints; cancel stale image requests during fast flicks; `object-fit` plus an explicit focal point for mobile crops; pause work offscreen and when the tab is hidden; clean up triggers, observers, rAFs, Blob URLs on unmount.

Reduced motion: remove pinning and scrubbing, show `reducedMotionFrame` statically, restore normal flow; if the sequence carries ordered information, also expose it as text or a list.

Verify: forward and reverse, fast flicks, resize mid-section, widths 390/768/1024/1440, missing frames, blocked video, keyboard order, route cleanup, no console errors. The same scroll position must always produce the same frame.

Producing the frames themselves (AI image-to-video clips, ffmpeg frame extraction) is video production; see the ai-video super skill.

## Motion (Framer Motion) scroll

```jsx
"use client";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";

// triggered
<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }} />

// linked
const ref = useRef(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const reduce = useReducedMotion();
const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -80]);
return <section ref={ref}><motion.img style={{ y }} /></section>;

// progress bar
const { scrollYProgress: p } = useScroll();
const scaleX = useSpring(p, { stiffness: 120, damping: 30, restDelta: 0.001 });
<motion.div style={{ scaleX, transformOrigin: "0% 50%" }} className="progress" />
```

Pitfalls: scroll-linked values go in `style`, not `animate`; MotionValues on a plain `div` do nothing (must be `motion.div`); without `target` + `offset`, progress tracks the whole page; attach the ref you passed as `target`; every file using motion hooks needs `"use client"` in the App Router; use `useMotionValueEvent(scrollY, "change", …)` for side effects (e.g. hide-on-scroll nav), not for styles.

Common offsets: `["start end", "end start"]` while in view; `["start start", "end start"]` while leaving the top; `["start end", "end end"]` from entering to page end.

## CSS scroll-driven animations

```css
@keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.read-progress { transform-origin: left; animation: grow linear both; animation-timeline: scroll(root); }

@supports not (animation-timeline: scroll()) { .read-progress { display: none; } }
@media (prefers-reduced-motion: reduce) { .read-progress { animation: none; } }
```

`view()` timelines with `animation-range: entry 0% cover 40%` handle simple in-view effects. Good for progress indicators and light parallax; for "play once on enter" use a timed animation triggered by IntersectionObserver.

## Reduced motion for every scroll feature

- No smooth-scroll layer, no pinning, no scrubbing, no parallax.
- Show final states: `gsap.set(targets, { autoAlpha: 1, clearProps: "transform" })`.
- In GSAP use `gsap.matchMedia()` with a `(prefers-reduced-motion: reduce)` condition and `return` early.
- Never trap scroll or block keyboard navigation; the footer stays reachable.

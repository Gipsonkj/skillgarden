# Motion and micro-interactions

> Distilled from: animate, emil-design-eng and apple-design (emilkowalski/skills, MIT), impeccable (pbakaus/impeccable, Apache-2.0), baseline-ui (ibelick/ui-skills, MIT), design-taste-frontend (leonxlnx/taste-skill, MIT), hallmark (nutlope/hallmark, MIT)

Motion in an interface is feedback and orientation, not decoration. Every animation has to survive the gate below before any code is written.

## 1. Should this animate at all?

| How often the user sees it | Decision |
|---|---|
| 100+ times a day (keyboard shortcuts, command palette toggle) | No animation. Stop here |
| Tens of times a day (hover, list navigation) | Near-imperceptible (≤ 150 ms, opacity/colour) or nothing |
| Occasionally (modals, drawers, toasts) | Standard animation |
| Rarely / first time (onboarding, success, celebration) | The delight budget lives here |

Keyboard-initiated actions are not animated. If a request fails this gate, say so and offer the non-motion alternative (an instant state change, a static affordance).

## 2. Name the purpose

Pick one word before building: **feedback** (the interface heard you), **spatial consistency** (where it came from / went), **state indication**, **preventing a jarring change**, **explanation** (marketing/onboarding only), **delight** (rare tier only). If you can't name it, don't build it. Data the user is reading or acting on doesn't move for style.

## 3. Pick the cheapest tool that works

| Need | Tool |
|---|---|
| The project already uses a motion library (`motion`, GSAP, another) | Keep it for new UI motion; don't add a second |
| Hover, press, colour, class/attribute toggles | CSS `transition` |
| Entry animation on mount, no JS state | CSS `@starting-style` |
| Predetermined motion that must stay smooth while the page is busy | CSS animation (off the main thread) |
| Programmatic control, no library | WAAPI (`element.animate()`) |
| Springs, layout animations, exit animations, gestures | `motion` (motion.dev) |
| Timelines, scroll-driven scenes, Lottie, 3D | Hand to `motion-animation` (GSAP and the rest) |

If the task is really a component (toast, drawer, command menu, dropdown), use a tested library for it rather than hand-animating a `<div>` (see [components-and-states.md](components-and-states.md)).

## 4. Properties

- Animate `transform` and `opacity` only (`clip-path` and `filter` sparingly). Never `width`, `height`, `top`, `left`, `margin`, `padding`. For height reveals use `grid-template-rows: 0fr -> 1fr`.
- Never `transition: all`; list the properties.
- Never start from `scale(0)`. Start from `scale(0.95-0.97)` with `opacity: 0`.
- Popovers, dropdowns, menus and tooltips grow from their trigger (`transform-origin` at the trigger, e.g. `var(--transform-origin)` in Base UI / Radix). Modals stay centred.
- `translateY(100%)` moves by the element's own height; prefer it to hard-coded pixels.
- In Motion, animate a full `transform` string (`transform: "translateX(100px)"`) rather than `x`/`y` shorthands when frames drop under load.
- Don't drive children's transforms from a CSS variable on the parent; set `transform` on the element.
- `will-change` only on elements actively animating, removed afterwards.

## 5. Easing and duration

**Easing by situation**

| Situation | Easing |
|---|---|
| Entering or exiting | ease-out |
| Moving or morphing on screen | ease-in-out |
| Hover / colour change | ease |
| Constant motion (marquee, progress) | linear |
| Default | ease-out |

Never `ease-in` on UI: it delays the moment the user is watching. Built-in CSS curves are weak; define named tokens and use them everywhere:

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* UI enter/exit */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* on-screen movement */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* iOS-like drawer */
  --dur-fast: 150ms; --dur-base: 200ms; --dur-slow: 300ms;
}
```

No bounce or elastic curves on buttons, modals or tooltips.

**Duration**

| Element | Duration |
|---|---|
| Button press feedback | 100-160 ms |
| Tooltips, small popovers | 125-200 ms |
| Dropdowns, selects | 150-250 ms |
| Modals, drawers | 200-300 ms (up to 500 ms for large sheets) |
| Exit | about 75% of the enter duration |
| Marketing / explanatory | Longer is fine |

UI motion stays under 300 ms. A 180 ms dropdown feels faster than a 400 ms one. Stagger lists by 30-50 ms per item, total stagger under ~300 ms.

## 6. Springs, gestures and interruption (Apple-style fluid UI)

Use a spring instead of a duration when the motion is drag with momentum, a gesture the user can interrupt or reverse, or something that should feel alive.

| Interaction | Spring (damping / response) | Motion equivalent |
|---|---|---|
| Default UI, reposition | 1.0 / 0.3-0.4 s | `{ type: "spring", bounce: 0, duration: 0.4 }` |
| Drawer / sheet | 0.8 / 0.3 s | `{ type: "spring", bounce: 0.2, duration: 0.3 }` |
| Flick / throw release | ~0.8 / 0.3-0.4 s | `bounce: 0.1-0.3`, only after momentum |

Rules:
- **Respond on pointer-down.** Highlight immediately; commit on release. Remove artificial delays on the input path.
- **1:1 tracking.** Dragged things stay under the pointer, keeping the grab offset. Use Pointer Events + `setPointerCapture`; keep a short position history to compute release velocity.
- **Interruptible always.** Never lock input during a transition. Animate from the current on-screen value, not the old target. Anything triggered rapidly (toasts, toggles) uses transitions, which retarget, not keyframes, which restart.
- **Hand off velocity.** On release, pass the pointer velocity into the spring so there is no seam between drag and animation.
- **Project momentum.** Snap to the target nearest where the gesture was going, not where it was released.
- **Soft boundaries.** Rubber-band past limits instead of a hard stop.
- **Symmetric paths.** Exit the way you entered; a sheet that slides up leaves downward.
- **Asymmetric timing where the user decides.** Slow on the deliberate phase (hold-to-confirm 2 s linear), fast on the system response (200 ms ease-out).
- Gesture thresholds: ~10 px of movement before committing to a drag direction.

## 7. Recipes (short)

| Pattern | Recipe |
|---|---|
| Button press | `:active { transform: scale(0.97) }`, `transition: transform 100ms var(--ease-out)` |
| Dropdown / popover | from `opacity:0; scale(0.96)` at trigger origin, 150-200 ms ease-out |
| Tooltip | 125-150 ms fade; ~800 ms hover delay; instant for adjacent tooltips once one is open |
| Modal | scrim fade + panel `scale(0.96)` -> 1, 200-250 ms; centred origin |
| Drawer | `translateY(100%)` -> 0 with `--ease-drawer` or a spring; drag to dismiss |
| Toast | slide + fade from its edge, transition-based so rapid toasts retarget |
| Accordion | `grid-template-rows: 0fr -> 1fr`, 200 ms |
| Tab indicator | one element translating between tabs (shared layout), not per-tab fades |
| Number change | tabular figures; animate with a number library, don't re-render text per frame |
| Page load (Persuade pages only) | one orchestrated reveal, 2-3 elements staggered; never fade-up every section |

## 8. Reduced motion, pointer gating, performance

Ship these with the animation every time:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-2px); } /* touch fires false hovers on tap */
}
```

- Reduced motion keeps opacity and colour changes but drops movement, parallax, springs and overshoot. In React use `useReducedMotion()`.
- `prefers-reduced-transparency`: make glass surfaces solid. `prefers-contrast: more`: solid backgrounds, visible borders.
- No infinite loops (pulse, float, shimmer) on informational content; anything moving more than 5 s needs pause.
- No flashing more than 3 times per second.
- Scroll-linked effects use `IntersectionObserver` or CSS scroll-driven animations, never a `scroll` listener that sets state.
- Review motion at slow speed (DevTools animation panel at 10-25%) and frame by frame before calling it done.

## 9. Motion (`motion/react`) for UI components

Reach for Motion only when section 3 says so: exits, shared or layout animation, springs, gestures. Everything here follows sections 4-8; this is just how to express them. Variants, stagger, scroll, Next.js client boundaries and React View Transitions go to `motion-animation` → `references/react-transitions-and-motion.md`.

**Install.** `npm install motion`, then `import { motion, AnimatePresence } from "motion/react"`. Moving off the old package: `npm uninstall framer-motion`, `npm install motion`, and change imports from `"framer-motion"` to `"motion/react"`. Motion durations are in seconds, not milliseconds.

| UI job | Motion API | Watch out for |
|---|---|---|
| Exit animation (popover, modal, toast) | Wrap in `<AnimatePresence>`, give the child `exit` | Direct children need a unique `key`. `initial={false}` skips the entry on first render. `mode="wait"` holds the new child until the old one has left; `mode="popLayout"` lets siblings reflow at once |
| Tab indicator, selected highlight | Render one `<motion.div layoutId="underline" />` inside the selected tab only | Same `layoutId` on two mounted elements crossfades them |
| Siblings reflowing (list reorder, accordion stack) | `layout` on each item; `<LayoutGroup>` around components that don't re-render together | Layout animation uses `transform`; set `borderRadius` and `boxShadow` in `style` so Motion corrects the scale distortion. `layout="position"` when the aspect ratio changes |
| Press and hover feedback | `whileTap`, `whileHover`, `whileFocus` | Plain CSS `:active` / `:hover` is cheaper when nothing else needs Motion |
| Spring | `transition={{ type: "spring", bounce: 0, visualDuration: 0.3 }}` | `visualDuration` is when it looks settled; keep `bounce` low on UI chrome |
| Named curve | `transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}` | Same numbers as the `--ease-out` token, so CSS and Motion match |
| Different timing per property | `transition={{ default: { type: "spring" }, opacity: { ease: "linear" } }}` | |

```tsx
import { AnimatePresence, motion } from "motion/react";

export function MenuPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu-panel"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "var(--transform-origin)" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Reduced motion.** Put `<MotionConfig reducedMotion="user">` at the app root: when the OS setting is on, Motion drops transform and layout animations and keeps opacity and colour, which is exactly section 8's rule. `"always"` forces it, `"never"` ignores the setting (don't ship that). For anything else (parallax, autoplay) branch on `useReducedMotion()`.

**Bundle size.** The full `motion` component is about 34 kb. For a few UI animations, use `LazyMotion` with the slimmer `m` component (`import * as m from "motion/react-m"`) and load only the features used: `domAnimation` (+15 kb: animations, variants, exit, tap/hover/focus) or `domMax` (+25 kb: adds drag, pan and layout animation). Add `strict` to `LazyMotion` so a stray `motion.*` import throws instead of quietly pulling the full bundle back in.

> Distilled from: animate, review-animations, improve-animations, find-animation-opportunities (emilkowalski/skills, MIT), motion-design (LottieFiles/motion-design-skill, MIT), design-motion-principles (kylezantos/design-motion-principles, MIT), hyperframes-animation (heygen-com/hyperframes, Apache-2.0), pixel2motion (nolangz/pixel2motion, MIT)

# Motion principles: decide, time, ease, choreograph

The decisions that make motion feel right, in the order you make them. Every other reference in this skill assumes these values.

## 1. Should it animate at all?

Ask how often a person sees it. Frequency beats taste.

| Frequency | Decision |
|---|---|
| 100+ times a day (keyboard shortcut, command palette, tab switch) | No animation. Ever. |
| Tens of times a day (hover, list navigation, frequent toggle) | Near-imperceptible (under 150 ms, tiny distance) or nothing |
| Occasional (modal, drawer, toast, settings) | Standard animation |
| Rare or first-time (onboarding, success, empty state, celebration) | The delight budget lives here |

- Keyboard-initiated actions never animate. Raycast's palette has no open animation, and that is correct.
- "No animation" is a valid result. Offer the static alternative (instant swap, a clearer affordance) instead.
- Data someone is reading or acting on does not move for style. A mouse-tracking effect belongs on a marketing page, not on a banking chart.

## 2. Name the purpose

Say it in one word before you pick a curve. If you can't, don't build it.

| Purpose | Example |
|---|---|
| Feedback | press scale, hold-to-confirm fill, copy icon turning into a check |
| Spatial consistency | popover grows from its trigger, toast leaves the way it came |
| State indication | toggle knob slides, accordion opens |
| Preventing a jarring change | list item slides in instead of appearing, content cross-fades |
| Explanation | onboarding or marketing demo of how a feature works |
| Delight | only at the rare/first-time tier |

## 3. Pick the cheapest tool that works (web)

| Need | Tool |
|---|---|
| Hover, press, colour, state toggled by a class or attribute | CSS transition |
| Entry on mount, no JS state | CSS `@starting-style` |
| Predetermined loop or motion that must stay smooth while the page loads | CSS animation (runs off the main thread) |
| JS control without a library | WAAPI, `element.animate()` |
| Springs, layout animation, exit animation, gestures (React) | Motion (`motion/react`) |
| Timelines, sequencing, scroll, SVG morph, framework-agnostic | GSAP (see `gsap.md`) |
| Route and shared-element transitions in React | `<ViewTransition>` (see `react-transitions-and-motion.md`) |
| A designed illustration or icon with its own timeline | Lottie (see `lottie-svg-gif.md`) |

Need a toast, drawer, dropdown or command menu? Use a component library first, then tune its motion. Hand-rolled dropdowns lose focus management.

## 4. Pick the properties

- Animate `transform` and `opacity`. They skip layout and paint. `clip-path` and `filter` are the sanctioned extras.
- `width`, `height`, `top`, `left`, `margin`, `padding`, `font-size` relayout every frame. Accordion `height` is the one tolerated exception; keep it short.
- Never start from `scale(0)`. Start at `scale(0.9–0.97)` plus `opacity: 0`. Nothing real appears from nothing.
- Popovers, dropdowns, menus and tooltips scale from their trigger (`transform-origin` at the trigger; Base UI gives `var(--transform-origin)`, Radix gives `--radix-…-transform-origin`). Modals are exempt and stay centred.
- `translateY(100%)` moves an element by its own height. Prefer percentages to hard-coded pixels for sheets and toasts.
- `transition: all` is always wrong. Name the properties.

## 5. Easing

Built-in CSS keywords are too weak for deliberate motion. Use these tokens (extend the codebase's own tokens if they exist; never fork a parallel set):

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* entering, exiting, default */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* moving or morphing on screen */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* iOS-like sheet/drawer */
}
```

| Situation | Easing |
|---|---|
| Entering or exiting UI | ease-out (strong curve above) |
| Moving from A to B while visible | ease-in-out |
| Hover or colour change | `ease` |
| Constant motion: spinner, marquee, progress, scroll-scrubbed timeline | `linear` / GSAP `"none"` |
| Anything else | ease-out |

**Conflict resolved: exits.** Classic animation guides (LottieFiles, Disney "slow in/out") put ease-in on exits. For product UI, follow Emil Kowalski: never ease-in. It delays the moment the user is watching, and `ease-out` at 200 ms feels faster than `ease-in` at 200 ms. Ease-in exits are fine in video, title cards and illustration, where the viewer is not waiting on the interface.

Other curve vocabularies you will meet, so you can map them:

| Name | cubic-bezier | GSAP nearest |
|---|---|---|
| Material 3 standard | (0.2, 0, 0, 1) | `power3.out` |
| Material 3 emphasized decelerate | (0.05, 0.7, 0.1, 1) | `expo.out` |
| Apple default | (0.25, 0.1, 0.25, 1) | `power1.inOut` |
| Overshoot settle (playful only) | (0.175, 0.885, 0.32, 1.275) | `back.out(1.7)` |

Need a curve not listed? Take it from easing.dev or easings.co, don't invent one. CSS `linear()` (Jake Archibald's generator) gives springs and bounces in pure CSS.

## 6. Duration

Product UI stays under 300 ms. A 180 ms dropdown feels faster than a 400 ms one.

| Element | Duration |
|---|---|
| Press feedback | 100–160 ms |
| Tooltip, small popover | 125–200 ms |
| Dropdown, select | 150–250 ms |
| Icon swap, toggle | 150–250 ms |
| Modal, drawer | 200–500 ms (drawers with a drawer curve can go to 500) |
| Page / route transition | platform default, or 200–400 ms |
| Marketing, explainer, logo reveal | longer is fine (logo splash 1200–2000 ms) |
| Ambient loop | 2–20 s per cycle |

- Bigger travel needs more time: 50 px ≈ 0.8x, 100 px = 1x, 200 px ≈ 1.3x, 400 px ≈ 1.6x, full screen ≈ 1.8–2x.
- Exits run at 65–80% of the matching entrance. The user has moved on.
- Exits move less than entrances: enter from `y: 20`, exit to `y: -8`. Exception: user-initiated dismissal (swipe) exits the full way it was pushed.
- **Conflict resolved: duration caps.** design-motion-principles lets polish-led contexts (consumer apps, kids, portfolios) run 200–500 ms. Keep the 300 ms cap for anything a user triggers repeatedly; relax it only for rare moments or explicitly playful products.

## 7. Springs

Use a spring when a finger or pointer drives the value, when the motion can be interrupted or reversed, or for "alive" elements (Dynamic Island, mouse-follow). Everything else uses a curve.

| Feel | Motion / Framer | Physics form |
|---|---|---|
| Production default, no overshoot | `{ type: "spring", duration: 0.45, bounce: 0 }` | stiffness 300–400, damping 25–30 |
| Apple-like, subtle | `{ type: "spring", duration: 0.5, bounce: 0.2 }` | stiffness 250–350, damping 18–24 |
| Playful | `bounce: 0.3` max | stiffness 150–250, damping 10–15 |

- Keep bounce at 0–0.3. Any bounce on a dropdown, menu, toggle, modal or settings panel is a finding.
- Bounce is earned by momentum: overshoot on a flicked card feels right, on a menu that faded in it feels wrong.
- Springs keep velocity when interrupted; keyframes restart from zero.
- Decorative pointer-follow: route the pointer through `useSpring` instead of binding position directly.

## 8. Interruption and exit

- Anything triggered rapidly (toasts, toggles, anything clickable twice a second) uses transitions or springs, not keyframes. Transitions retarget from the current value.
- Exit the way it entered. A toast that rises from the bottom leaves through the bottom.
- Asymmetric timing where the user decides: hold-to-confirm fills over 2 s linear, releases in 200 ms ease-out.
- Gestures: dismiss on velocity (`Math.abs(distance) / elapsedMs > ~0.11`) or distance, not distance alone. Rubber-band past edges instead of hard stops. Capture the pointer once dragging starts. Ignore extra touch points mid-drag.

## 9. Choreography and stagger

| Pattern | Delay between items | Total budget |
|---|---|---|
| Micro cascade (list rows, grid cells) | 20–40 ms | under 200 ms |
| Standard (cards, panels, nav) | 30–80 ms | under 400 ms |
| Dramatic (hero, marketing) | 100–200 ms | under 600 ms |

- Keep `items × stagger ≤ ~500 ms` so an arrival reads as one beat. Stagger never blocks interaction.
- Lead with the hero. Supporting elements are calmer in every dimension and enter from the same side.
- With 3+ moving elements, no more than a third move at once; element 1 settles as element 3 starts.
- No single move travels more than a third of the screen without a change in speed or direction.
- When several elements react to one trigger, start them within 50 ms of each other; they may land at different times.
- Leave 100–200 ms of stillness after a resolution before the next motion.
- Never let all parts start and stop on the same frame (lockstep reads mechanical) unless it's deliberate.

## 10. Personality

Pick one per product and keep it everywhere. Define three constants: one signature curve (used for 80% of motion), three durations (quick / standard / slow), one entrance pattern.

| Personality | Quick / standard / slow | Curve | Overshoot |
|---|---|---|---|
| Crisp productivity (default for UI) | 150 / 200 / 300 ms | `--ease-out` | 0% |
| Corporate / trustworthy | 200 / 300 / 450 ms | (0.2, 0, 0, 1) | 0–3% |
| Premium / editorial | 350 / 500 / 800 ms | (0.4, 0, 0.2, 1) or `power3.out` | 0% |
| Playful (consumer, kids) | 150 / 250 / 400 ms | back-out / spring bounce 0.2–0.3 | 10–20% |
| Energetic (sport, launch) | 100 / 180 / 300 ms | `expo.out` | 15–30% |

Three lenses for judging (from design-motion-principles): Emil Kowalski asks "should this animate?" (productivity tools, dashboards), Jakub Krehel asks "is this subtle enough for production?" (shipped consumer apps), Jhey Tompkins asks "what could this become?" (creative sites, kids apps, portfolios). Weight them by project type; don't apply one lens everywhere.

## 11. Animation principles that matter for UI and motion graphics

| Principle | Use it like this |
|---|---|
| Anticipation | 100–200 ms wind-up, 10–20% of the main move, opposite direction. Skip for micro-feedback under 150 ms |
| Squash & stretch | scale ~[1.2, 0.8] on impact, preserve volume. Skip for premium and serious brands |
| Follow-through / overlap | child parts trail the parent by 50–150 ms; stop times offset by 100–200 ms |
| Arcs | add a 5 px (corporate) to 20 px (playful) sideways offset at the path midpoint |
| Secondary action | 30–50% of the primary's amplitude, 50–100 ms later (shadow grows as a card lifts) |
| Staging | one primary action per beat; dim the rest to 40–60% if needed |
| Timing structure for reveals | anticipation : action : settle ≈ 20 : 50 : 30 |

The "three motion layers" idea (primary, secondary, ambient) from LottieFiles applies to illustrations, logo stings and video. In product UI, ambient layers usually become noise; add them only on rare, high-emotion surfaces.

## 12. Accessibility (ships with the animation)

```css
@media (prefers-reduced-motion: reduce) {
  .panel { transition: opacity 200ms ease; transform: none; } /* keep fades and colour, drop movement */
}
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-2px); } /* touch fires hover on tap */
}
```

- Reduced motion means fewer and gentler, not zero. Keep opacity and colour changes that explain a state change; drop translation, scale, parallax, zoom, spin and overshoot.
- A blanket kill-switch (`animation-duration: 0.01ms !important` on `*`) is an acceptable last-resort baseline, not a design.
- Loops that can't be paused, big zooms, spins and parallax are vestibular triggers. Gate them, and give any ambient loop a pause control.
- Test: can someone complete every task with motion off?

## 13. Performance

- `will-change: transform, opacity` only on elements about to animate, and on fewer than ~10 at once. Never `* { will-change }`.
- Keep transition-time `filter: blur()` under 20 px; Safari pays heavily for big blurs.
- Don't drive child transforms through a CSS variable on a parent (recalculates every child). Set `transform` on the element.
- CSS and WAAPI keep running smoothly while the main thread is busy; `requestAnimationFrame` loops drop frames during load.
- Animate gradients by moving `background-position` or an overlay's opacity, not colour stops.

## 14. Judge feel, don't guess it

When the result depends on feel (a cross-fade, a spring's bounce, opacity versus height in a reflowing list), say so and check it:
- play it at 2–5x duration or in the DevTools Animations panel, step frame by frame;
- test gestures on a real device (phone on the dev server by IP);
- look again the next day with fresh eyes.

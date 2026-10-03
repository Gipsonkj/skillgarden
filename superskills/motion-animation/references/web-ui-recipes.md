> Distilled from: animate (RECIPES.md), review-animations (STANDARDS.md) (emilkowalski/skills, MIT), design-motion-principles (motion-cookbook) (kylezantos/design-motion-principles, MIT), motion-design (patterns) (LottieFiles/motion-design-skill, MIT)

# Web UI animation recipes

Start from the recipe that matches, then adapt. Tokens (`--ease-out`, `--ease-in-out`, `--ease-drawer`) are defined in `motion-principles.md`. Every recipe still needs its reduced-motion line.

## Build sequence (write code only after steps 1–2 pass)

1. Frequency gate and named purpose (`motion-principles.md` §1–2).
2. Cheapest tool, properties, curve, duration.
3. Interruption and exit path.
4. Reduced motion + hover gating.
5. Output: the code, then 3 short lines: gate result (tier + purpose), ingredients (tool, properties, curve, duration), what to feel-check.

Never offer a menu of motion options. Make the call and say why in one line.

## Press feedback (any pressable)

```css
.button { transition: transform 160ms var(--ease-out); }
.button:active { transform: scale(0.97); }
```

Scale 0.95–0.98. `:active` works on touch; no hover gate needed. `scale()` carries the label and icon with it, which is what makes it feel physical.

## Popover, dropdown, menu, select

```css
.popover {
  transform-origin: var(--transform-origin);
  transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out);
}
.popover[data-starting-style],
.popover[data-ending-style] { opacity: 0; transform: scale(0.95); }
```

The origin is the point: it grows out of what was clicked.

## Tooltip

```css
.tooltip {
  transform-origin: var(--transform-origin);
  transition: transform 125ms var(--ease-out), opacity 125ms var(--ease-out);
}
.tooltip[data-starting-style], .tooltip[data-ending-style] { opacity: 0; transform: scale(0.97); }
.tooltip[data-instant] { transition-duration: 0ms; } /* once one is open, neighbours open instantly */
```

First tooltip: delay + animation. Every tooltip after it in the same toolbar: no delay, no animation.

## Modal

```css
.modal {
  transform-origin: center; /* exempt: not anchored to a trigger */
  transition: opacity 250ms var(--ease-out), transform 250ms var(--ease-out);
}
.modal[data-starting-style], .modal[data-ending-style] { opacity: 0; transform: scale(0.96); }
.backdrop { transition: opacity 250ms var(--ease-out); }
```

Optional choreography for a showcase modal: backdrop 200 ms, modal 50 ms later, content 100 ms after the modal lands.

## Drawer / sheet

```css
.drawer { transform: translateY(0); transition: transform 500ms var(--ease-drawer); }
.drawer[data-closed] { transform: translateY(100%); }
```

With drag it becomes a gesture problem: see Drag to dismiss.

## Toast

```css
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;
  @starting-style { opacity: 0; transform: translateY(100%); }
}
```

- Transitions, not keyframes: toasts stack and retarget.
- Sonner uses `ease` and 400 ms deliberately; it matches the component's elegant personality. Personality can override the generic budget when the whole product agrees.
- No `@starting-style`? Set `data-mounted` in `useEffect(() => setMounted(true), [])` and transition from the unmounted state.
- Stacking toasts: opacity versus height reflow has no formula; tune by eye, recheck the next day.

## Accordion / collapse

```css
.content { overflow: hidden; transition: height 200ms var(--ease-out), opacity 200ms var(--ease-out); }
```

Measure the content height (or use a headless primitive that exposes it); don't animate to `auto` by hand. Newer browsers allow `interpolate-size: allow-keywords` for `height: auto`. Keep it short: it relayouts every frame.

## Staggered group entrance (occasional surfaces only)

```css
.item { opacity: 0; transform: translateY(8px); animation: fade-in 300ms var(--ease-out) forwards; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
.item:nth-child(4) { animation-delay: 150ms; }
@keyframes fade-in { to { opacity: 1; transform: translateY(0); } }
```

Or index-driven: `animation-delay: calc(var(--i) * 50ms)`. Use `animation-fill-mode: both` when delays are involved, or items flash at full opacity before their delay starts. One stagger moment per view; two staggered lists in a view is the AI-slop tell.

## Hold to confirm (destructive actions)

```css
.overlay { clip-path: inset(0 100% 0 0); transition: clip-path 200ms var(--ease-out); } /* release: snap */
.button:active .overlay { clip-path: inset(0 0 0 0); transition: clip-path 2s linear; } /* press: deliberate */
.button:active { transform: scale(0.97); }
```

Linear is correct here: the fill is progress, and progress doesn't ease.

## Tab indicator with colour change

Duplicate the tab list, style the copy as "active" (background + text colour), and clip it so only the active tab shows:

```css
.tabs-active-copy { clip-path: inset(0 60% 0 20%); transition: clip-path 250ms var(--ease-in-out); }
```

Set the inset from the active tab's offset. Text and background change in perfect sync because it's one element revealed, not two colours interpolated.

## Scroll reveal (marketing surfaces only)

```css
.reveal { clip-path: inset(0 0 100% 0); transition: clip-path 600ms var(--ease-in-out); }
.reveal[data-visible] { clip-path: inset(0 0 0 0); }
```

Trigger with `IntersectionObserver` or Motion `useInView(ref, { once: true, margin: "-100px" })`. Fire once. Never on daily-use functional UI. More in `scroll-animation.md`.

## Drag to dismiss

```js
const elapsed = Date.now() - dragStart;
const velocity = Math.abs(dragDistance) / elapsed;
if (Math.abs(dragDistance) >= THRESHOLD || velocity > 0.11) dismiss();

element.style.transform = `translateY(${dragDistance}px)`; // direct, not via a parent CSS variable
```

- `setPointerCapture` once the drag starts.
- Ignore additional touch points while dragging (`if (isDragging) return`).
- Past a boundary, move less the further you go (rubber band), don't hard-stop.
- Settle with a spring so a released or interrupted drag keeps its velocity: `{ type: "spring", duration: 0.5, bounce: 0.2 }`.

## Icon swap (copy → check, loading → done)

```jsx
<AnimatePresence mode="wait" initial={false}>
  <motion.span
    key={copied ? "check" : "copy"}
    initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
  >
    {copied ? <CheckIcon /> : <CopyIcon />}
  </motion.span>
</AnimatePresence>
```

An instant swap is easy to miss; this confirms the action.

## Enter with materialise (Jakub's recipe)

`opacity 0→1`, `translateY 8px→0`, `blur 4px→0`, spring `duration 0.45, bounce 0`. Use it on one hero element or a modal, not on every block on the page (three or more identical blur entrances in a view is slop).

## Masking a cross-fade that double-exposes

```css
.content { transition: filter 200ms ease, opacity 200ms ease; }
.content.transitioning { filter: blur(2px); opacity: 0.7; }
```

The blur blends two states into one perceived change. Keep it under 20 px.

## Programmatic, no library (WAAPI)

```js
el.animate(
  [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
  { duration: 600, easing: "cubic-bezier(0.77, 0, 0.175, 1)", fill: "forwards" }
);
```

Hardware-accelerated where the properties allow it, interruptible, zero bundle cost.

## CSS techniques worth knowing

- **`@property`** types a custom property so it interpolates: `@property --hue { syntax: '<number>'; inherits: false; initial-value: 0; }` then animate `--hue`. Split `--x` and `--y` into typed properties with different keyframe timings to get curved paths from straight keyframes.
- **Negative delays** start a looping animation mid-cycle: `animation-delay: calc(var(--i) * -0.2s)` for staggered continuous motion.
- **`linear()`** easing gives springs and bounces in pure CSS; generate it, don't hand-write it.
- **3D**: `perspective` on the parent, `transform-style: preserve-3d`, `rotateX/Y` for flips and tilts.
- **`clip-path: inset(t r b l)`** reveals, wipes, before/after sliders, tab colour transitions.
- **Scroll-driven CSS** (`animation-timeline: view()`): ties progress to scroll speed, which is wrong for most UI entrances. Use it for progress indicators and parallax; for "play once when visible", trigger a normal timed animation instead. Feature-detect with `CSS.supports("animation-timeline: scroll()")` and fall back to `IntersectionObserver`.

## State feedback patterns

| Moment | Motion |
|---|---|
| Success (rare) | scale pop 0.95 → 1.0 with 5–10% overshoot, checkmark draws on (stroke-dashoffset), 300–400 ms |
| Error | 2–3 horizontal shakes of ±8–12 px, 300–400 ms, no overshoot, plus colour |
| Loading | spinner rotates linear; skeleton shimmer by moving `background-position` |
| Number change | tabular numerals (`font-variant-numeric: tabular-nums`), count with ease-out, label after the number lands |
| Hover (pointer devices) | under 100 ms in, colour/elevation; avoid `scale(1.05)` on every card |

## Never ship

| Never | Instead |
|---|---|
| `transition: all` | named properties |
| `scale(0)` entrance | `scale(0.95)` + `opacity: 0` |
| `ease-in` on UI | `--ease-out` |
| Built-in `ease-out` on a deliberate animation | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Animation on a keyboard shortcut or 100+/day action | no animation |
| UI over 300 ms without a reason | 150–250 ms |
| `transform-origin: center` on a trigger-anchored popover | trigger origin (modals exempt) |
| Keyframes on toasts, toggles, rapid triggers | transitions |
| Animating width/height/margin/padding/top/left | transform/opacity |
| Motion `x`/`y`/`scale` props on a busy page | full `transform` string (see `react-transitions-and-motion.md`) |
| Ungated `:hover` motion | `@media (hover: hover) and (pointer: fine)` |
| No reduced-motion path | gentler variant, not zero |
| Everything entering at once on an occasional surface | 30–80 ms stagger |
| Looping pulse/glow on a status dot | static treatment |

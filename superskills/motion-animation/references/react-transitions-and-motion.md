> Distilled from: vercel-react-view-transitions (vercel-labs/agent-skills, MIT per README/SKILL.md), animate, review-animations (emilkowalski/skills, MIT), design-motion-principles (kylezantos/design-motion-principles, MIT), gsap-framer-scroll-animation framer reference (github/awesome-copilot, MIT)

# React: View Transitions and Motion (Framer Motion)

Two tools, different jobs:

| Job | Tool |
|---|---|
| Route changes, shared element morphs across pages, Suspense reveals, list reorder driven by state transitions | React `<ViewTransition>` (browser View Transition API, no library) |
| Component-level enter/exit, springs, gestures, layout animation inside a page, icon swaps | Motion (`motion/react`, formerly framer-motion) |
| Timelines, scroll pinning, SVG morph | GSAP (`gsap.md`, `scroll-animation.md`) |

## Part 1: React `<ViewTransition>`

Declare *what* animates with `<ViewTransition>`, trigger *when* with `startTransition`, `useDeferredValue` or `Suspense`, control *how* with CSS classes. Unsupported browsers skip the animation and still work.

**Availability.** Next.js App Router already bundles React canary: do not install `react@canary` there. Outside Next.js, `ViewTransition` needs `react@canary react-dom@canary`. Browsers: Chromium 125+, Firefox 144+, Safari 18.2+.

### What to animate, in this order

| Priority | Pattern | Communicates |
|---|---|---|
| 1 | Shared element (`name`) | same thing, going deeper |
| 2 | Suspense reveal | data arrived |
| 3 | List identity (keyed VT per item) | same items, new order |
| 4 | Enter/exit on state change | something appeared or left |
| 5 | Route change | new place |

- Hierarchical navigation (list → detail) and ordered sequences (prev/next): directional slides, forward from the right, back from the left.
- Lateral navigation (tab to tab): plain cross-fade or none. A slide falsely implies depth.
- Background revalidation: `default="none"`, silent.

### Mechanics

```jsx
import { ViewTransition, startTransition, addTransitionType } from "react";

<ViewTransition enter="fade-in" exit="fade-out"><Panel /></ViewTransition>
```

| Trigger | Fires when |
|---|---|
| `enter` / `exit` | the VT is inserted / removed during a Transition |
| `update` | DOM inside it mutates, or it moves because a sibling changed size |
| `share` | a named VT unmounts and another with the same `name` mounts in the same Transition |

- Only `startTransition`, `useDeferredValue` or `Suspense` activate VTs. Plain `setState` and `flushSync` don't animate.
- **Placement rule:** the VT must come before any DOM node. `<div><ViewTransition>…` suppresses enter/exit.
- Prop values: `"auto"` (browser cross-fade), `"none"`, a CSS class, or a map keyed by transition type (TypeScript requires a `default` key).
- React calls `document.startViewTransition` itself. Never call it yourself.

### Directional navigation with transition types

```jsx
startTransition(() => { addTransitionType("nav-forward"); router.push("/items/1"); });

export function DirectionalTransition({ children }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >{children}</ViewTransition>
  );
}
```

Next.js 16.2+: `<Link href="/items/1" transitionTypes={["nav-forward"]}>` (works in Server Components) or `router.push(href, { transitionTypes: ["nav-forward"] })`. Check with `grep -r "transitionTypes" node_modules/next/dist/`; fall back to `startTransition` + `addTransitionType`.

- `router.back()` and the browser back button carry no types, so typed animations resolve to `default`. Use `router.push()` with a URL for typed back navigation.
- Suspense reveals run as a separate transition with no type: use plain string props there.
- Place directional VTs in page components, not in a layout wrapping `{children}` (nested VTs that mount as one unit don't fire their own enter/exit).

### Shared element morph

```jsx
{items.map((item) => (
  <ViewTransition key={item.id}>                                   {/* list identity */}
    <Link href={`/items/${item.id}`} transitionTypes={["nav-forward"]}>
      <ViewTransition name={`item-image-${item.id}`} share="morph"> {/* shared element */}
        <Image src={item.image} alt="" />
      </ViewTransition>
    </Link>
  </ViewTransition>
))}
// detail page: <ViewTransition name={`item-image-${id}`} share="morph"><Image … /></ViewTransition>
```

- Names must be unique among mounted VTs (`photo-${id}`). A reusable component with a named VT rendered in both a modal and a page breaks the morph: make the name conditional.
- `share` beats `enter`/`exit`. Where no pair forms, enter/exit fires instead: give it a fallback.
- A morph silently never fires when: `default="none"` without an explicit `share`, or a type-keyed `share` whose navigation never adds the type.
- Never fade out a page that contains a morphing element; use a directional slide or no exit.
- Incoming content must be rendered when the navigation commits (prefetch, cache it); a suspended target only has its fallback.

### Suspense reveal

```jsx
<Suspense fallback={<ViewTransition exit="slide-down"><Skeleton /></ViewTransition>}>
  <ViewTransition enter="slide-up" default="none"><Content /></ViewTransition>
</Suspense>
```

Simple version: wrap `<Suspense>` in a bare `<ViewTransition>` for a cross-fade. Force a re-enter with `key={searchParams.toString()}` (careful: re-keying Suspense refetches).

### CSS

```css
:root { --duration-exit: 150ms; --duration-enter: 210ms; --duration-move: 400ms; }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes slide { from { translate: var(--slide-offset); } to { translate: 0; } }

::view-transition-old(.fade-out) { animation: var(--duration-exit) ease-in fade reverse; }
::view-transition-new(.fade-in) { animation: var(--duration-enter) ease-out var(--duration-exit) both fade; }

::view-transition-old(.nav-forward) { --slide-offset: -60px;
  animation: var(--duration-exit) ease-in both fade reverse, var(--duration-move) ease-in-out both slide reverse; }
::view-transition-new(.nav-forward) { --slide-offset: 60px;
  animation: var(--duration-enter) ease-out var(--duration-exit) both fade, var(--duration-move) ease-in-out both slide; }
/* .nav-back: same with offsets flipped (+60px old, -60px new) */

::view-transition-group(site-header) { animation: none; z-index: 100; } /* header has style={{ viewTransitionName: "site-header" }} */

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) {
    animation-duration: 0s !important; animation-delay: 0s !important;
  }
}
```

The old snapshot is a 150 ms overlay leaving the screen, so ease-in on it is acceptable here; incoming content uses ease-out.

Timing: toggle 100–200 ms; route slide 150–250 ms; Suspense reveal 200–400 ms; shared morph 300–500 ms.

### Workflow for an existing app

1. **Audit**: every `<Link>`/`router.push`, every `<Suspense>`, every page, persistent chrome (header, sidebar), shared visuals, skeleton controls that mirror real controls. Write a navigation map: route → target → direction → VT pattern.
2. Copy only the CSS recipes you need, always including reduced motion.
3. Isolate persistent chrome with `viewTransitionName` + `animation: none` on its group.
4. Add directional page transitions, then shared elements, then Suspense reveals, then list identity.
5. Verify every navigation path, including back.

### Gotchas

- `default="none"` stops stray cross-fades but also disables `update` and `share`; keyed list items and displaced siblings want `update`.
- Content below a growing list teleports unless wrapped in a bare `<ViewTransition>` as an immediate sibling.
- The transition overlay is fixed; scrolling during a long transition looks frozen. Keep reveals short.
- Popovers open during a transition can flicker or go click-dead: portal them and give them their own `viewTransitionName`.
- `useOptimistic` values resolve before the snapshot: animate committed state.
- `border-radius` lost mid-transition: put it on the captured element.
- Imperative control: `onEnter={(instance, types) => { const a = instance.new.animate([...], { duration: 300, easing: "ease-out" }); return () => a.cancel(); }}`.

## Part 2: Motion (Framer Motion) essentials

```bash
npm install motion        # import from "motion/react"; "framer-motion" still works
```

### Enter, exit, presence

```jsx
<AnimatePresence initial={false}>
  {open && (
    <motion.div
      key="panel"
      initial={{ opacity: 0, transform: "translateY(8px) scale(0.97)" }}
      animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
      exit={{ opacity: 0, transform: "translateY(-4px) scale(0.98)" }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
    />
  )}
</AnimatePresence>
```

- **Under load, use the full `transform` string**, not `x`/`y`/`scale` props: the shorthands run on the main thread and drop frames while the page is busy. Shorthands are fine for light, idle-time motion.
- Exits are subtler than entrances (smaller travel).
- `mode="wait"` for swaps (icon change, step wizard); `mode="popLayout"` when the exiting item shouldn't hold space.

### Layout and shared layout

- `<motion.div layout />` animates size/position changes (FLIP). Use `layout="position"` when only position should animate (avoids text squish).
- `layoutId="card-1"` on two different components morphs one into the other (card → modal). Keep `layoutId` elements outside `AnimatePresence` or their enter/exit fades fight the morph. One `layoutId` mounted at a time.
- `<LayoutGroup>` coordinates layout animations across siblings (tab indicator under the active tab).

### Variants and stagger

```jsx
const list = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } } };
<motion.ul variants={list} initial="hidden" animate="show">{rows.map(r => <motion.li key={r.id} variants={item} />)}</motion.ul>
```

One staggered list per view at most.

### Springs and gestures

- `transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}` (Apple-style, easier to reason about) or `{ stiffness, damping, mass }`.
- `whileTap={{ scale: 0.97 }}` for press; `whileHover` only for pointer devices (gate in CSS or check `matchMedia("(hover: hover)")`).
- `drag="y"`, `dragConstraints`, `dragElastic={0.2}` (rubber band), `onDragEnd={(e, info) => info.velocity.y > 500 && close()}`.
- Decorative pointer-follow: `useSpring(useMotionValue(0), { stiffness: 150, damping: 20 })`.

### Reduced motion

```jsx
const reduce = useReducedMotion();
<motion.div initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} />
```

Or `<MotionConfig reducedMotion="user">` at the root: transforms are skipped, opacity kept.

### Next.js

Files using `motion.*` or hooks need `"use client"`. Keep motion components in client files and import them into Server Components. For route transitions prefer `<ViewTransition>` over `AnimatePresence` around the router.

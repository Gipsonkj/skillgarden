> Distilled from: vercel-react-best-practices (vercel-labs/agent-skills, MIT)

# React and Next.js performance (vendor-specific: Vercel)

Use when writing, reviewing or refactoring React/Next.js code for speed. Work **top-down by impact**: a request waterfall or a bloated bundle costs more than any memo. Measure first (Lighthouse, Next.js bundle analyzer, React Profiler, server timings), fix the highest category, measure again.

| Priority | Category | Impact |
|---|---|---|
| 1 | Eliminating waterfalls | Critical |
| 2 | Bundle size | Critical |
| 3 | Server-side performance | High |
| 4 | Client-side data fetching | Medium-high |
| 5 | Re-render optimisation | Medium |
| 6 | Rendering performance | Medium |
| 7 | JavaScript performance | Low-medium |
| 8 | Advanced patterns | Low |

## 1. Eliminate waterfalls

- **Parallelise independent work**:
  ```ts
  // Bad: 3 sequential round trips
  const user = await getUser(id); const posts = await getPosts(id); const prefs = await getPrefs(id);
  // Good
  const [user, posts, prefs] = await Promise.all([getUser(id), getPosts(id), getPrefs(id)]);
  ```
- **Start early, await late** in API routes and server actions: kick off promises at the top, `await` where the value is needed.
- **Defer `await` into the branch that uses it**; check cheap synchronous conditions before awaiting a flag or remote value.
- **Partial dependencies**: start what doesn't depend, chain only what does (`const p = getUser(); const q = p.then(u => getTeam(u.teamId));`).
- **Stream with `<Suspense>`**: wrap slow sections so the shell renders immediately instead of the slowest fetch gating the page.
- Restructure server components so sibling components fetch in parallel instead of parent-then-child; for per-item nested fetches, chain each item inside one `Promise.all`.

## 2. Bundle size

- **No barrel imports** for big libraries: `import { Check } from 'lucide-react/dist/esm/icons/check'` (or `optimizePackageImports` in `next.config`) instead of `from 'lucide-react'` pulling thousands of modules.
- **`next/dynamic`** for heavy, below-the-fold or interaction-only components (editors, charts, maps): `const Editor = dynamic(() => import('./Editor'), { ssr: false })`.
- **Defer third-party** analytics/logging until after hydration.
- **Load conditionally**: import a module only when its feature is turned on.
- **Preload on intent**: start `import()` on hover/focus for perceived speed.
- Use statically analysable import and file paths so bundlers don't include whole directories.

## 3. Server-side

- **Authenticate server actions** like API routes; they are public endpoints.
- **`React.cache()`** for per-request deduplication (the same `getUser()` called in several components = one query); an LRU cache for cross-request caching where data allows.
- **Minimise what crosses to the client**: pass only the fields a client component uses, not whole records; don't pass the same data twice in RSC props.
- **No module-level mutable request state** in RSC/SSR: it leaks between users' requests.
- Hoist static I/O (fonts, logos, config files) to module level so it runs once.
- **`after()`** for non-blocking work (logging, analytics, cache warming) after the response is sent.

## 4. Client-side fetching

- **SWR (or React Query)** for request deduplication, caching and revalidation instead of ad-hoc `useEffect` + `fetch`.
- Deduplicate global event listeners (one shared subscription, not one per component).
- **Passive listeners** for scroll/touch: `addEventListener('scroll', fn, { passive: true })`.
- Version and minimise anything stored in `localStorage`.

## 5. Re-renders

- **Derive state during render, not in effects**: `const fullName = first + ' ' + last`, not `useEffect(() => setFullName(...))`.
- **Functional setState** for stable callbacks: `setCount(c => c + 1)` so the callback needn't depend on `count`.
- **Lazy initial state**: `useState(() => parseBigThing())`, not `useState(parseBigThing())`.
- **Never define components inside components** (remounts every render and loses state).
- Subscribe to derived booleans, not raw values (`const isEmpty = useStore(s => s.items.length === 0)`).
- Don't subscribe to state only read in callbacks; read it at call time (ref or store getter).
- Primitive effect dependencies; split hooks whose dependencies are independent.
- Put interaction logic in event handlers, not effects reacting to state changes.
- **`startTransition` / `useDeferredValue`** for non-urgent updates (filtering a big list while typing).
- Refs for transient, high-frequency values (pointer position, scroll offset).
- `memo` for genuinely expensive subtrees; skip `useMemo` for cheap primitive expressions; hoist non-primitive default props (`const EMPTY = []`) so `memo` actually works.

## 6. Rendering

- **`content-visibility: auto`** (with `contain-intrinsic-size`) for long off-screen lists/sections.
- **Hoist static JSX** outside the component.
- **Ternary, not `&&`**, for conditional rendering: `{count > 0 ? <Badge n={count}/> : null}`; `{count && ...}` renders a literal `0`.
- Animate a wrapping `div`, not the SVG element; reduce SVG coordinate precision.
- Client-only values without hydration flicker: a small inline script sets them before paint; suppress hydration warnings only for known, expected mismatches.
- `useTransition` for loading states; React DOM resource hints (`preload`, `preconnect`) for critical assets; `defer`/`async` on script tags.

## 7. JavaScript

- **`Set`/`Map` for repeated lookups** instead of `array.includes`/`find` in loops; build an index map once.
- **Return early**; check array length before expensive comparisons.
- **Hoist `RegExp`** creation out of loops; cache property access and pure function results.
- Combine multiple `filter`/`map` passes into one loop or `flatMap`; use a loop for min/max instead of sorting.
- **`toSorted()`** instead of mutating `sort()` on props/state.
- Batch DOM style changes via a class or `cssText`; cache `localStorage` reads; push non-critical work to `requestIdleCallback`.

## 8. Advanced

- Store event handlers in refs (or a `useLatest` helper) for stable callbacks passed to long-lived subscriptions.
- Don't put `useEffectEvent` results in effect dependency arrays.
- Initialise app-wide singletons once per app load, not per render.

## Review checklist for a React/Next.js change

- [ ] No sequential awaits for independent data; slow sections behind `Suspense`
- [ ] No new barrel import of a large library; heavy components dynamically imported
- [ ] Server actions authenticated; client props trimmed to what's used
- [ ] No state derived via `useEffect`; no components defined inside components
- [ ] `&&` conditionals can't render `0`
- [ ] Bundle/timing measured before and after if the change claims a speedup

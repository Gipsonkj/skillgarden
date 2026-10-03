> Distilled from: core-web-vitals (addyosmani/web-quality-skills, MIT), web-perf (cloudflare/skills, Apache-2.0), vercel-react-best-practices (vercel-labs/agent-skills, MIT)

# Performance and Core Web Vitals

Measure, find the one thing that dominates, fix it, re-measure. Never claim a metric is failing without runtime evidence, and never claim a field improvement the day you ship: field data needs new visits.

## 1. Targets (Google judges the 75th percentile of real visits)

| Metric | Good | Needs work | Poor |
|---|---|---|---|
| LCP (loading) | ≤ 2.5 s | 2.5-4 s | > 4 s |
| INP (responsiveness) | ≤ 200 ms | 200-500 ms | > 500 ms |
| CLS (stability) | ≤ 0.1 | 0.1-0.25 | > 0.25 |
| TTFB | < 800 ms | < 1.8 s | > 1.8 s |
| FCP | < 1.8 s | < 3 s | > 3 s |
| TBT (lab proxy for INP) | < 200 ms | < 600 ms | > 600 ms |

Budgets for a marketing page: critical CSS inlined < 14 KB, hero image < 200 KB (AVIF/WebP at the displayed size), initial JS as small as the page allows.

## 2. Evidence sources (do not mix them up)

| Source | Use for |
|---|---|
| CrUX / Search Console | Real-user p75; deciding what matters. Page-level first, origin as a labelled fallback |
| Browser trace (Chrome DevTools MCP `performance_start_trace`) | Diagnosing one load or interaction |
| Lighthouse CLI / PageSpeed Insights | Controlled lab run when DevTools MCP is unavailable |
| First-party RUM (`web-vitals` library, `/attribution` build) | Production numbers by route, device, release |
| `PerformanceObserver` snippet in the console | One session while debugging; not field data |

A single lab value is not comparable to a field p75. Do not use DevTools MCP's `lighthouse_audit` for performance; it covers the other Lighthouse categories.

## 3. Audit workflow (Chrome DevTools MCP)

Check which browser tools are available first. If none, do source and network analysis and say what could not be measured. Adding the MCP server to the user's config is a config change: ask first (`"chrome-devtools": {"command": "npx", "args": ["-y", "chrome-devtools-mcp@latest"]}`).

1. `navigate_page(url)` then `performance_start_trace(autoStop: true, reload: true)` for a cold load.
2. `performance_analyze_insight(insightSetId, insightName)` only for insights tied to the failing metric: `LCPBreakdown`, `CLSCulprits`, `RenderBlocking`, `DocumentLatency`, `NetworkRequestsDepGraph`. Names drift between versions: list them from the trace response.
3. `list_network_requests(resourceTypes: ["Document","Script","Stylesheet","Font","Image"])`, then `get_network_request(reqid)` for suspects. Look for render-blocking head resources, late-discovered chains (CSS `@import`, JS-loaded fonts), weak `Cache-Control`, uncompressed or oversized bundles, preconnects to origins that received zero requests.
4. `take_snapshot(verbose: true)` for a quick accessibility pass (names, contrast, focus).
5. With code access: detect the bundler, check tree-shaking, barrel files, wholesale lodash/moment imports, `core-js` and an overly broad `browserslist`, minification, brotli/gzip, production source maps.

Report rules: be specific ("compress hero.png 450 KB to WebP", not "optimise images"); quantify with the trace's estimated savings; skip anything with 0 ms impact; if the page is already fast, say so.

Output: CWV table (metric, value, rating) → top issues with impact → specific fixes with code → codebase findings.

## 4. LCP: largest element paints late

Break it into TTFB, resource load delay, load time and render delay; fix the biggest slice.

- **Slow TTFB**: CDN and edge caching, static or streamed HTML, cheaper backend work.
- **Late discovery**: the LCP image must be in the initial HTML as an `<img>` (not a CSS background, not JS-rendered) with `fetchpriority="high"` and no `loading="lazy"`. Add `<link rel="preload" as="image">` only if the trace shows late discovery; extra preloads compete for bandwidth.
- **Render-blocking**: inline critical CSS, defer the rest; no synchronous JS in `<head>`; fonts with `font-display: swap`.
- **Client rendering**: hero text fetched in `useEffect` is late by definition. Render it on the server.
- Next.js: `<Image priority … />` for the hero. Nuxt: `<NuxtImg preload loading="eager">`.

Speculation Rules can prerender the likely next page (Chromium only, harmless elsewhere):

```html
<script type="speculationrules">
{ "prerender": [{ "where": { "href_matches": "/*" }, "eagerness": "moderate" }] }
</script>
```

`conservative` = pointer down; `moderate` = ~200 ms hover on desktop; `eager` / `immediate` cost the most. Exclude logout, checkout and anything with side effects; gate analytics on `document.prerendering` / `prerenderingchange`. Measure hit rate and bytes before widening.

## 5. INP: interactions feel sticky

Find which phase dominates before touching the handler:

| Phase | Evidence | Fix |
|---|---|---|
| Input delay | Long tasks already running when the event arrives | Less startup JS, split long tasks, delay third parties |
| Processing | The handler's own synchronous work | Do less, move CPU work to a Web Worker |
| Presentation | Style, layout, paint after the handler | Smaller DOM updates, no read/write layout thrash |

- Show feedback first (`button.classList.add('loading')`), `await scheduler.yield()` (fallback `setTimeout(0)`), then do the heavy work; send analytics in `requestIdleCallback`.
- Chunk long loops and yield between chunks; choose chunk size from the trace, not a magic number.
- React: `startTransition` / `useDeferredValue` for expensive updates; memoise only where a profile shows repeated work.
- Attribute long tasks to script URLs; third-party widgets are a frequent culprit.

## 6. CLS: things jump

The element that moved is often the victim; find the node that was inserted or resized above it.

- Every `<img>`, `<video>`, `<iframe>` gets `width`/`height` or an `aspect-ratio` wrapper. Ads and embeds get a realistic reserved minimum.
- Never prepend banners, consent UI or notices above visible content: overlay them, or fill a slot that already has its size.
- Font swap shifts: a metric-matched fallback `@font-face` with `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` derived from the actual fonts.
- Animate `transform`/`opacity`, never `top`/`height`.

## 7. After the fix

Re-run the same trace under the same conditions (device, throttling, cold or warm). Report lab before/after. Say that field data will update only after new real visits (CrUX is a 28-day window).

## Pitfalls

- Optimising by checklist instead of by the trace's biggest slice.
- `loading="lazy"` on the hero image.
- Memoising everything "for INP".
- Claiming "LCP is now 1.2 s" from one warm-cache local run.

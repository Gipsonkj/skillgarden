> Distilled from: vercel-react-best-practices (vercel-labs/agent-skills, MIT), nextjs-app-router-patterns (wshobson/agents, MIT), next-cache-components-adoption (vercel/next.js, MIT), next-dev-loop (vercel/next.js, MIT), Next.js September 2026 security release (nextjs.org)

# Next.js (App Router) and React: build it fast, verify it at runtime

Default stack for a site with real data, auth or many pages. Fix problems in priority order: waterfalls and bundle size first, micro-optimisations last.

## 1. Server vs client

| Mode | Where it runs | Use for |
|---|---|---|
| Server Component (default) | Server only | Data fetching, secrets, heavy computation |
| Client Component (`'use client'`) | Browser | State, effects, event handlers, browser APIs |
| Static | Build time | Content that rarely changes |
| Dynamic | Request time | Personalised or real-time data |
| Streaming (`<Suspense>`) | Progressive | Slow data under a fast shell |

- Start server; add `'use client'` at the smallest leaf that needs interactivity. A client boundary high in the tree drags everything below it into the bundle.
- Pass only the fields the client uses across the boundary. Passing a 50-field user object to render one name serialises all 50 into the HTML.
- File conventions: `layout.tsx`, `page.tsx`, `loading.tsx` (Suspense fallback), `error.tsx`, `not-found.tsx`, `route.ts` (API), `template.tsx` (re-mounted layout), `default.tsx` (parallel route fallback), `opengraph-image.tsx`.
- Metadata via `export const metadata` / `generateMetadata`, with a title template (`'%s | Brand'`). Fonts via `next/font` (self-hosted, no layout shift).

## 2. Rules by impact

**Critical: eliminate waterfalls**
- Independent awaits run together: `const [a, b] = await Promise.all([getA(), getB()])`. Three sequential awaits = three round trips.
- Move each `await` into the branch that needs it; check cheap synchronous conditions before awaiting anything remote.
- In route handlers, start promises early and await late.
- Restructure components so sibling server components fetch in parallel instead of a parent fetching and then a child fetching.
- Wrap slow sections in `<Suspense>` so the shell streams immediately.

**Critical: bundle size**
- No barrel imports from big libraries (icon sets and UI kits can re-export thousands of modules, 200-800 ms per cold import). Either import the direct path or list the package in `experimental.optimizePackageImports`.
- `next/dynamic` for heavy components not needed at first paint (editors, charts, maps), `ssr: false` when they need `window`.
- Load analytics, logging and chat widgets after hydration.
- Load feature modules only when the feature is switched on; preload on hover/focus for perceived speed.
- Keep import and file-system paths statically analysable; a computed `require(path)` pulls in whole directories.

**High: server**
- **Authenticate inside every Server Action.** Actions are public endpoints; middleware or a layout check does not protect them. Check session and authorisation in the action body.
- `React.cache()` for per-request dedup (current user, a DB lookup used in several components). Pass primitives, not inline objects, or every call misses.
- An LRU cache for cross-request reuse of expensive pure results.
- Never keep request data in mutable module-level variables: concurrent renders share the module and one user's data can leak into another's response.
- Hoist static I/O (fonts, logo files) to module scope.
- `after()` for logging and analytics that should not delay the response.

**Medium: client data and re-renders**
- Fetch in Server Components. On the client, use SWR or React Query (dedup, cache, revalidate), never ad-hoc `useEffect` + `fetch` in several components.
- Derive values during render; do not mirror props into state with an effect. Reset state with a `key` instead.
- Put interaction logic in event handlers, not effects that watch state.
- Functional `setState` for stable callbacks; lazy `useState(() => expensive())`; primitive effect dependencies.
- `startTransition` / `useDeferredValue` to keep input responsive while an expensive list re-renders.
- Never define a component inside another component (remounts every render).
- Refs for values that change every frame (pointer, scroll) instead of state.

**Medium: rendering**
- `{count > 0 ? <Badge/> : null}`, not `{count && <Badge/>}` (renders "0").
- Client-only values (theme from localStorage) without flicker: a tiny inline script sets the class before hydration; `suppressHydrationWarning` only on the element it touches.
- `content-visibility: auto` for long off-screen sections; animate a wrapper `div`, not the SVG itself; trim SVG coordinate precision.
- Third-party `<script>` tags get `defer` or `async` (or `next/script` with a strategy).

**Low: JavaScript micro-work** (only in measured hot paths): `Map`/`Set` for repeated lookups, one loop instead of chained `filter().map()`, hoist RegExps out of loops, early returns, `toSorted()` instead of mutating `sort()`.

## 3. Caching (classic model)

```ts
fetch(url, { cache: 'no-store' })              // always fresh
fetch(url, { cache: 'force-cache' })           // static
fetch(url, { next: { revalidate: 60 } })       // ISR, 60 s
fetch(url, { next: { tags: ['products'] } })   // tag for invalidation
// after a mutation, in a Server Action:
revalidateTag('products'); revalidatePath('/products')
```

Parallel routes (`@slot` folders) give independent loading and error states; intercepting routes (`(.)photo/[id]`) give a modal on client navigation and a full page on hard load.

## 4. Adopting Cache Components (Next.js 16.3+)

`cacheComponents: true` requires every App Router route to be prerenderable. A route that reads request data outside `<Suspense>` is "blocking" and fails the build.

**Before flipping the flag**
- App Router only (`pages/` routes are unaffected). If both `app/` and `src/app/` exist, Next builds `app/` only: ask which to migrate.
- Remove any `export const dynamic | revalidate | fetchCache` (incompatible; translate per the official migration guide). Remove `experimental.dynamicIO` (now fatal) and the redundant `experimental.useCache`.
- The app must boot with its real env; you verify against `next dev`.

**Three blocker classes**
1. Request-time reads at the top of a page or layout: `cookies()`, `headers()`, `await params`, `await searchParams`. Move the read into a `<Suspense>`-wrapped child; forward the `params` promise and await it in the child.
2. Sync IO at render or module time: `new Date()`, `Date.now()`, `Math.random()`, `crypto.randomUUID()`. These fail even with the opt-out.
3. A file with top-level `"use cache"` that reads request data. Remove the directive.

**Two strategies (ask the user in terms of PRs)**
- *One quiet PR first, then feature by feature*: commit or stash, then run `npx @next/codemod@latest cache-components-instant-false ./app` (check the file count; "0 ok" means the wrong path). It inserts `export const instant = false` plus a `// TODO: Cache Components adoption` comment in every page, layout and default file. Set `cacheComponents: true`, fix sync-IO blockers until `next build` passes, migrate previously static routes fully, then stop and check in.
- *All on one branch*: set the flag and treat the build's blocking routes as the queue.

**The loop, per feature** (one product surface, e.g. `app/posts/[slug]/**`)
- Remove opt-outs top-down (root layout first); the highest `instant = false` wins for the whole subtree.
- Reload in `next dev`, read the overlay (the route still returns 200), open the `nextjs.org/docs/messages/<slug>` page linked from each error and apply that recipe.
- Verify in a browser that the static shell shows real content first and every fallback resolves. A `◐` glyph only proves some shell exists; `<Suspense>` wrapped around the whole page body yields an empty shell.
- Build flags: `--debug-build-paths="app/posts/[slug]/page.tsx"` (file globs, not URLs; a folder alone matches nothing) and `--debug-prerender` (continue past the first failure, fuller stack).
- Done for a feature: build passes, no bare `TODO: Cache Components adoption` left (any remaining `instant = false` has a written reason), mutations followed by reads return fresh data.
- A client component in the root nav calling `usePathname()` / `useSearchParams()` blocks every dynamic route (`blocking-prerender-client-hook`); wrap it in `<Suspense>` per its docs page.
- Suggest commits; never make one without the user's yes.

## 5. Verify at runtime, not just at compile (next-dev-loop)

Requires Next.js 16.3+ on Turbopack, and `agent-browser` ≥ 0.31.1 (installing it is a global npm install: ask first).

- `/_next/mcp` (on the dev server's port; set `NEXT_MCP_URL` if not 3000) is Next's own view: `tools/list`, `get_compilation_issues`, `get_routes`, `get_errors`, `get_page_metadata`. Replies are SSE: parse with `sed -n 's/^data: //p'`.
- `agent-browser` is the browser's view: DOM, console, network, React tree and render counts. One stable session per checkout:
  ```bash
  SESSION="$(agent-browser session id --scope worktree --prefix next-dev-loop)"
  export AGENT_BROWSER_SESSION="$SESSION" AGENT_BROWSER_RESTORE="$SESSION"
  agent-browser --session "$SESSION" --restore --enable react-devtools open http://localhost:3000
  ```
- After each edit check four things: compiles, runs without server or browser errors, behaves as intended on the page, React-level behaviour (no extra renders, suspense resolved).
- Before an edit, ask the running app which files rendered the route instead of grepping the repo.
- Never delete or move `.next` while `next dev` runs. Wait with `wait --load networkidle`, not a guessed URL. A blank snapshot right after `open` is a stale session: reopen it, don't fall back to curl.
- If the views disagree, suspect the tooling before the app.

Without these tools, use Playwright (see `quality-audit-and-testing.md`) and say that framework-side checks were not run.

## 6. Stay on a patched Next.js

- Before changing a Next.js project, read the installed version (`npm ls next`) and compare it with the latest security release on nextjs.org/blog. The 30 Sep 2026 release is fixed in 16.3.8 and 15.5.27; other lines get no fix, so tell the user to move to the current patch of their line and make the bump its own change.
- Check which fixed bugs this code can hit, and fix the config as well as the version:
  - **Image Optimization SSRF (high):** only apps with `images.remotePatterns`. Pin each pattern to an exact `hostname`, `protocol` and `pathname`; no wildcards on hosts you don't control. No patterns means not affected.
  - **`'use cache'` leaks (Cache Components):** a pending cache fill is shared between a Draft Mode request and a normal one, so unpublished content can reach visitors or a prerendered page; a `'use cache'` function that calls another that reads a root param can serve one param's content for another. Keep draft-dependent data out of cached functions until patched.
  - **SSG/ISR cache poisoning:** a root-level catch-all page next to static or ISR routes (any host), and self-hosted Pages Router SSG/ISR (not Vercel). One crafted request can swap a page's cached content for every visitor.
  - **Webpack builds:** `opengraph-image` / `twitter-image` routes ignore `dynamicParams = false`; Turbopack builds are not affected.
  - **`next dev` MCP endpoint (§5):** it doesn't check where a request comes from, so a website open in the developer's browser can read source snippets, routes and logs. Update before using it and don't browse untrusted sites while the dev server runs.
- Report the version and which of these apply. Don't call a site "secure".

## Pitfalls

- `'use client'` on a layout or page "to make it work".
- Fetching in a client component what a server component could have fetched.
- Server Actions with no auth check.
- A request-scoped value cached with `"use cache"`, serving one user's data to another.
- Wildcard `remotePatterns` hosts, or shipping on a Next.js version older than the latest security release.
- Calling the build green and the route verified without looking at it in a browser.

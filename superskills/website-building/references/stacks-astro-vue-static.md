> Distilled from: astro (astrolicious/agent-skills, MIT), vue-best-practices (vuejs-ai/skills, MIT), web-artifacts-builder (anthropics/skills, Apache-2.0), netlify-frameworks (netlify/context-and-tools, MIT), web-design-asset-stack (Gipsonkj/skillgarden, MIT)

# Choosing the stack; Astro, Vue, single-file sites and add-on libraries

Pick the lightest stack that does the job. Every framework you add is JavaScript the visitor downloads and a build that can break.

## 1. Stack choice

| The site is… | Use | Why |
|---|---|---|
| One page, a demo, a prototype to share as a file | Single `index.html` (inline CSS/JS) or a bundled single-file React artifact | Zero build, opens anywhere |
| Marketing site, docs, blog, portfolio (mostly content) | **Astro** | Ships zero JS by default; islands only where interactive |
| App-like: auth, dashboards, lots of data, server mutations | **Next.js App Router** (`nextjs-react.md`) | Server components, streaming, server actions |
| The team already writes Vue / Nuxt | **Vue 3** (Nuxt for SSR) | Match the codebase |
| A static SPA with client routing only | Vite + React/Vue | Simple; remember the SPA rewrite on the host |

Existing project: use what is there. Do not migrate frameworks as a side effect of a page request.

## 2. Astro

```bash
npx astro dev        # dev server
npx astro check      # type and config errors (run before build)
npx astro build      # writes dist/
npx astro add <integration>   # react, tailwind, mdx, sitemap, an adapter...
npx astro sync       # regenerate types after changing integrations or collections
```

- Routes are files in `src/pages/` (`index.astro`, `blog/[slug].astro`). Components in `src/components`, layouts in `src/layouts`, untouched static files in `public/`.
- Set `site: 'https://example.com'` in `astro.config.*`; sitemaps and canonical URLs depend on it.
- Component script runs at build/server time inside the `---` fence; props via `Astro.props`.
- Interactivity: drop a React/Vue/Svelte component in and hydrate it only where needed with a `client:` directive (`client:visible` for below-the-fold widgets, `client:idle` for non-urgent ones, `client:load` only when it must be interactive immediately). No directive = static HTML, zero JS.
- Content-heavy sites: use content collections (typed Markdown/MDX with a schema) instead of ad-hoc file globbing.
- Images: `astro:assets` `<Image />` for sized, optimised output.
- Static by default. On-demand rendering needs an adapter: `npx astro add node | vercel | netlify | cloudflare --yes`.
- Deploy flow: add adapter if needed → `astro check` → `astro build` → confirm `dist/` exists and is non-empty → deploy per host guide.
- APIs move fast: check docs.astro.build for the current syntax before writing config from memory.

## 3. Vue 3

Default: Composition API with `<script setup lang="ts">`. Options API only if the project already uses it.

**Before coding** a non-trivial feature, write a component map: one sentence of responsibility per component, its props and emits. Keep the root and route views thin (layout, providers, composition).

**Split a component when any is true**: it owns state and markup for several sections; it has 3+ distinct UI sections (form, filters, list, footer); a block repeats. A CRUD list splits at least into container, form, list/item, and footer/filter.

**Reactivity**
- Minimal source state; derive everything with `computed`. Never assign derived values from a watcher.
- `shallowRef` for primitives and for objects you replace wholesale; `reactive` for objects you mutate in place. Do not destructure a `reactive` object (breaks reactivity); use `toRefs` if needed.
- Watchers only for side effects; `{ immediate: true }` instead of a duplicate initial call; clean up async work in the watcher's cleanup callback.
- Computed getters are pure. No filtering or sorting inside templates.

**SFCs and templates**
- Order: `<script setup>` → `<template>` → `<style scoped>`. PascalCase component names and filenames. Global CSS (reset, tokens, type) in one file; `:deep()` rarely.
- Never `v-if` and `v-for` on the same element; always a stable `:key`.
- `v-show` for frequent toggles, `v-if` for rarely shown content.
- Never `v-html` with user content.
- `useTemplateRef()` (Vue 3.5+) for element refs.

**Data flow**: props down, events up. `v-model` only for genuine two-way contracts (`defineModel`). Provide/inject only for deep shared context, with a typed `InjectionKey`. Logic that is reused, stateful or side-effectful goes in a `useXxx()` composable with a small typed API. App-wide state: Pinia.

**Optional features only when required**: slots, `<Teleport>` (overlays), `<KeepAlive>`, `<Suspense>`, `<Transition>`/`<TransitionGroup>`, async components for heavy rarely used UI.

**Performance after correctness**: virtualise long lists, `v-once`/`v-memo` for static subtrees, avoid wrapper components inside hot list rows.

## 4. Single-file deliverables

- A plain one-pager: one `index.html` with inline `<style>` and `<script>`, system or Google fonts, images as files beside it or small inline SVG. Opens by double-click unless it fetches local files (then serve it: `python3 -m http.server 4500`).
- A rich React prototype that must be one file: build with Vite + React + Tailwind (+ shadcn/ui if needed), then bundle to a single HTML with Parcel and `html-inline`. Anthropic's `web-artifacts-builder` skill automates this (not bundled here; its setup needs packages installed, so ask first).
- The design rules still apply: no centred-everything, no purple gradient, no uniform rounded cards, no Inter by reflex (`design-direction.md`).

## 5. SPA hosting reminder

Client-routed SPAs need the host to serve `index.html` for unknown paths (Netlify `/* /index.html 200`, Vercel rewrites). Remove that rule if you later add SSR. See the deploy guides.

## 6. Animation and component libraries: verdicts

Decision order: if the page renders but looks flat, it's a taste problem (design-direction.md section 7), so install nothing. Then prefer a design skill or rule over a library. Then take the smallest library that solves the job. Check the last release date of anything a reel or roundup recommends.

| Library | Verdict | Notes (September 2026) |
|---|---|---|
| Lenis (~3 KB) | Take | Inertial smooth scroll; the biggest "feels expensive" upgrade per KB. Caveats in motion-and-scroll.md section 3 |
| GSAP | Take | Every former Club plugin (SplitText, ScrollSmoother, MorphSVG, DrawSVG) is free with no licence key since the Webflow acquisition |
| anime.js | Take when GSAP is overkill | One small library for simple timelines |
| `@paper-design/shaders` | Take for shader backgrounds | Apache-2.0, zero deps, no network calls, ~25 canvas shaders (mesh gradient, fluted glass, god rays, grain gradient, liquid metal). Still 0.0.x with breaking changes inside 0.0.x: pin the exact version |
| Vanta.js | Refuse | No release since 2022, pinned to three r134. Use the shaders above |
| React Bits, Aceternity UI, Skiper UI, Watermelon UI, Vengeance UI | With care | Copy-paste component shops. Their components are recognisable, so use them for mechanics you'd otherwise hand-roll, never for the page's identity. Check each licence before shipping |

Naming the effect is most of a motion brief. Vocabulary that maps to known builds: glass gallery cube, curve gallery, scattered grid text, liquid carousel, 3D globe carousel, 3D image-stack scroll; categories: scroll animations, mouse effects, page transitions, text animations, WebGL shaders, physics effects, SVG animations.

## Pitfalls

- Next.js for a five-page brochure site.
- `client:load` on every Astro island (ships all the JS you chose Astro to avoid).
- A Vue "mega component" holding the whole feature.
- Writing Astro or Nuxt config from memory for a fast-moving API; check the docs version.

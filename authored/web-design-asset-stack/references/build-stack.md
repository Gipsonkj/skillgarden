# Build stack — full catalog

Every tool named across the 15 source reels, with what it actually is and where it came from.
Verified Sept 2026. `⚠️` = correction to what the reel said.

---

## Agent skills (change how the code gets written)

### Taste / taste-skill — tasteskill.dev
Open-source collection of ~9 "anti-slop" agent skills. Core mechanic: before writing code the
agent must read page kind, vibe words, audience, references and brand assets, then declare a
one-line **design read** and calibrate three dials — **VARIANCE, MOTION, DENSITY**. It is a
*vocabulary*, not a component library: the Reference Vocabulary names patterns, the Block
Library implements them. When the brief reads as Material / Fluent / Carbon / Polaris /
Atlassian / Primer / GOV.UK / USWDS / Bootstrap / Radix / shadcn / Tailwind, it reaches for the
official package instead of improvising. Works with Claude Code, Cursor, Codex, Windsurf,
Copilot; framework-agnostic. `Leonxlnx/taste-skill`.
**Skill name: `design-taste-frontend`.**

### Impeccable
"Design fluency for AI harnesses." Its pitch: *great design prompts require design vocabulary;
most people don't have it — you can't ask for "more vertical rhythm" if you've never used the
words.* Ships commands that put designer language in your hands, plus a live browser editor
(floating toolbar over the running page) to make changes directly.
**Skill name `impeccable` (v4.0.4 when written)** — has sub-commands: shape · audit|critique ·
animate|bolder|colorize|delight|layout|overdrive|quieter|typeset · adapt|clarify|distill ·
harden|onboard|optimize|polish · init|document|extract|live.

### Awesome Claude Design
68 ready-to-use design-system inspirations in `DESIGN.md` format, derived from real websites —
typography, spacing, buttons, layouts. Drop one in, scaffold a full UI in one shot.

### Playwright CLI — playwright.dev/docs/getting-started-cli
Official Playwright CLI aimed at coding agents: "token-efficient commands … so agents balance
browser automation with large codebases and reasoning within limited context windows." Lets the
agent open multiple browsers, drive the page, and screenshot to verify.
```
playwright-cli open https://example.com --headed
playwright-cli type "Buy groceries"
playwright-cli press Enter
playwright-cli check all
playwright-cli screenshot
```

### img2threejs — github.com/img2threejs/img2threejs (Apache-2.0)
"Rebuild the object in a reference image as a code-only, procedural, quality-gated,
animation-ready Three.js model. Token-efficient image-to-3D."
- Output is a **TypeScript factory function** you can read, diff and animate — primitives,
  procedural shaders, generated geometry. **No mesh files, no downloads, no photogrammetry.**
- A strict quality gate blocks shallow specs *before* any Three.js is generated, so tokens
  aren't spent rendering an underspecified model.
- Mechanical work is pushed into deterministic scripts; model tokens are spent only on
  judgment. "Scripts enforce, the model judges."
- Live gallery: `img2threejs/img2threejs-showcase`.

### scroll-world — github.com/oso95/scroll-world (MIT)
Agent skill (SKILL.md — Claude Code, Codex, any compatible agent) that builds an immersive
scroll-scrubbed "fly through the world" landing page for any brand or industry.
- Interviews you for topic, story beats/sections and brand kit.
- Generates cohesive **isometric diorama scenes** (GPT Image 2 via Higgsfield, or Codex CLI on
  a ChatGPT subscription), then the **camera flights** (Seedance image-to-video).
- As the visitor scrolls, a pre-rendered camera flies from outside each scene into its
  interior, then flows into the next — **one continuous connected flight, no cuts**.
- The camera genuinely moves; scroll only drives *time*. Portable, framework-agnostic
  scroll-scrub engine.
- Hardened fork `cth9191/scroll-world` adds budget tiers, spend gates, a previz draft pass and
  automated SSIM seam verification.
- Relevant to the existing `cinematic-demo-sites` skill — same shape, different generator.

---

## Animation / scroll libraries

### Lenis — github.com/darkroomengineering/lenis (~3KB)
"Lightweight, robust, performant smooth scroll library … optimized for modern browsers.
Perfect for creating smooth scrolling experiences such as WebGL scroll syncing, parallax
effects." The reel's claim: roughly 90% of Awwwards sites use it. Drop-in, instant upgrade.
⚠️ Lenis does **not** support CSS `scroll-snap` (use `lenis/snap`), and its interpolated scroll
fights native CSS scroll-driven animations. Pick one lane. Tick it off the GSAP clock, not its
own rAF loop.

### GSAP — gsap.com
GreenSock Animation Platform. **Every premium plugin is now free with no licence** since the
Webflow acquisition — SplitText, ScrollSmoother, MorphSVG, DrawSVG included. Every scroll /
text / image / UI animation. Even Webflow sites run on it.

### anime.js
Animate anything on the web with a single small library. The lighter alternative when GSAP's
surface area isn't needed.

### ⚠️ Vanta.js — DO NOT USE
The reel sells it as "fancy 3D animated backgrounds, WebGL you paste in in about five lines of
code — clouds, birds, waves for hero sections." Reality: **no release since 2022, pinned to
three r134.** Dead.
**Replacement:** `@paper-design/shaders` — free, Apache-2.0, zero deps, tree-shakeable, no
network calls, ~25 canvas shaders (fluted glass, mesh gradient, god rays, grain gradient,
liquid metal, metaballs, smoke ring). Playground: shaders.paper.design. Pin the exact version —
still 0.0.x and the README warns of breaking changes within 0.0.x.

---

## Component shops

| Library | What it is | Notes |
|---|---|---|
| **React Bits** | Copy-paste animated React components | Large, popular, recognisable. Paste selectively. |
| **Aceternity UI** | 300+ premium components / blocks / templates | Good cloud shader; just copy the JS. Has a Templates tab with full site templates. |
| **Skiper UI** (skiper-ui.com) | "Un-common components for shadcn/ui", ~24 free + ~54 premium | One file per component, no extra packages, installs with your own shadcn CLI. Geist-typeset, Vercel/Apple aesthetic: scroll effects, carousels, preloaders, micro-interactions. |
| **Watermelon UI** (ui.watermelon.sh) | Open-source React registry on Tailwind + Radix | 600+ components, 100+ animations, sections and full-page templates. **Hosted MCP server + CLI** so Cursor/Claude Code can find and compose blocks. shadcn-compatible registry, zero runtime lock-in, Motion for physics micro-interactions. |
| **Animaster Lib** | 200–300+ animated components, 100+ portfolio templates | Categories are a useful brief vocabulary: Scroll Animations, Mouse Effects, Page Transitions, Grid Animations, Sliders, Hero Animations, WebGL Shaders, Background Animations, Navigation Menus, Text Animations, 3D Animations, Physics Effects, SVG Animations. |
| **Vengeance UI** | React, ~74 components, 9 section families (heroes, CTAs, FAQs, contact) | TypeScript + Tailwind + Framer Motion, open source. |

---

## Prompt / style libraries

### designprompts (designprompts.dev)
"Drop these prompts into any AI assistant and ship beautiful, consistent interfaces in minutes."
A grid of named web-design styles — **Monochrome, Bauhaus, Modern Dark, Neo Brutalism, SaaS,
Luxury, Swiss Minimalist, Terminal** — filterable by MOOD (light/dark) and TYPE
(sans/serif/mono). Each has *Get Prompt* and *Open* (live preview). Use it to name the style
before prompting, rather than describing it badly.

---

## Ready-made interactions (Webflow / GSAP)

Named in the reel but the source site wasn't shown. The "CMS curve gallery" naming is
Webflow-native, and the set matches **osmo.supply** (Dennis Snellenberg & Ilja van Eck,
NL/BE, 35+ Awwwards Site of the Day), whose collection is exactly "scroll animations, page
transitions, navigations, sliders, cursor effects, text animations" built on GSAP.

glass gallery cube · CMS curve gallery · scattered grid text · liquid carousel ·
3d globe carousel · 3d image stack scroll · video gallery · visual carousel

Use these as **brief vocabulary** — naming the interaction you want is most of the work.

---

## Agentic site builders

### Manus — manus.im
Agentic AI that builds "design studio quality websites, slides and designs" and publishes to a
live URL in one click. Shown: public URL on `*.manus.space`, customise domain, "Anyone with the
link" visibility, SEO optimisation toggle, auto-publish-when-ready, plus built-in analytics
(page views / visits / sessions, pageviews chart, referrers, countries, devices, most-viewed
pages). Good for a fast client-visible draft; check export before committing a real project.

### Higgsfield Apps — higgsfield.ai
Builds and publishes a full **generative** application from a chat description — design, code,
database and model integration, live URL. Connects to Higgsfield's 15+ image/video/3D models.
Four app types: Custom, Simple App, Studio, **Preset** (a style-picker grid).
**The economics that matter:** users open your app and sign in with *their own* Higgsfield
account, generating on their own credits — creator cost is zero no matter how many people use
it. Custom domains on paid plans; marketplace listing for discovery and remixing.
Source reel published a public preset app of ten image effects (see SKILL.md).

---

## Framer templates

Portfolio / agency templates named as "steal one of these":
`bureaunine` (creative agency) · `operator-template` (unique portfolio) · `ethan clark`
(minimal designer portfolio) · `ovo-campione` (web studio) · `portastudio` (minimalism
premium) · `avyron-pro` (creative agency).

⚠️ **Framer cannot self-host** — their docs state no HTML export. Use these as layout and
type references, or only when the client is staying on Framer.

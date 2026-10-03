---
name: web-design-asset-stack
description: The 2026 build-and-taste stack for websites that don't look AI-generated — which animation library, component shop, agent design-skill or template to reach for, plus the composition rules (pair two aesthetics, exaggerate scale, add detail, use contrast) that separate a designed page from a generated one. Use when starting a landing page, portfolio or demo site, when a design "looks boring / plain / doesn't stand out", when picking between Lenis/GSAP/React Bits/Aceternity/Skiper, or when you need real award-site references to study instead of inventing a look.
---

# Web design asset stack

Distilled from 15 designer/vibe-coder reels (Sept 2026). Three layers: **what to install**,
**what rule to apply**, **what to study**. Most "make it look better" requests are solved by
the rule layer, not by installing another library.

## Decision order

1. **Is the problem taste or tooling?** If the page renders but looks flat, go to
   *Composition rules* below — do not install anything.
2. **Is there an agent skill for it?** Cheaper than a library: it changes how the code gets
   written. See *Agent design skills*.
3. **Only then reach for a library**, and take the smallest one that solves it.

## Composition rules (apply before installing anything)

Four diagnostic pairs from `@_tanupriya_` / allthingsdesign.co — each is a symptom → move:

| Symptom | Move |
|---|---|
| It looks boring | **Adjust the layout** — re-cut the grid, break the centred stack |
| It doesn't stand out | **Exaggerate the scale** — one element far bigger than reasonable |
| It looks plain | **Add more detail** — texture, annotation, secondary marks |
| No focus point | **Use contrast** — one colour/weight/size against everything else |

**The pairing law** (from two separate reels, one on photography, one on graphic design): one
aesthetic alone reads as *fine*; **two stacked read as intentional**. Never ship one treatment.

- black & white + colour pops → iconic
- blur + grain → interesting
- vintage photo + modern type → timeless
- low exposure + candles → intimate
- text + portraits → cool
- crossword/print artifact + photo → nostalgic
- animals + colour → eye-catching
- envelope/paper object + photo → lovely

**The aesthetic list** — ten composition levers to name what a frame is doing (or pick one
deliberately): the accent · isolation · grouping · framing · negative space · golden ratio ·
movement · a diptych · tension · symmetry.

Full worked detail: `references/composition-rules.md`.

## Agent design skills — install before writing frontend code

These make the *agent* design better, which beats fixing output afterwards.

- **Taste / taste-skill** — anti-slop skill collection; makes the agent declare a design read
  (page kind, vibe, audience) and calibrate VARIANCE / MOTION / DENSITY before coding, instead
  of defaulting to purple gradients and three centred cards. tasteskill.dev.
  ⚠️ **Skill name `design-taste-frontend`** — check whether you already have it.
- **Impeccable** — "design fluency for AI harnesses": gives you the *vocabulary* commands
  (you can't ask for "more vertical rhythm" if you've never used the words) plus a live
  in-browser editor to nudge the result directly.
  ⚠️ **Skill name `impeccable`** (v4.0.4 when written) — check whether you already have it.
- **Awesome Claude Design** — 68 ready-made DESIGN.md design systems derived from real sites
  (typography, spacing, buttons, layouts); drop one in and scaffold a whole UI in one shot.
- **Playwright CLI** — official, token-efficient browser control for coding agents
  (`playwright-cli open/type/press/check/screenshot`). Lets the agent spin up browsers, test
  the page and screenshot it without burning context. playwright.dev/docs/getting-started-cli.
- **img2threejs** — rebuilds an object from one reference image as a **code-only, procedural,
  animation-ready Three.js model** (TypeScript factory function, no mesh files, quality-gated
  before it spends tokens). Apache-2.0. github.com/img2threejs/img2threejs.
- **scroll-world** (`oso95/scroll-world`, MIT) — a SKILL.md skill that turns a brand into a
  scroll-scrubbed 3D world landing page: generates isometric diorama scenes, then camera
  flights, wired to a portable scroll-scrub engine. Scroll drives *time*, the camera genuinely
  moves, no cuts between scenes.

## Libraries — verdicts, not just names

**Take these:**
- **Lenis** (~3KB, darkroomengineering) — inertial smooth scroll. Highest perceived quality per
  KB; the single biggest "this feels expensive" upgrade. Drop-in.
- **GSAP** — **now 100% free including every former Club plugin** (SplitText, ScrollSmoother,
  MorphSVG, DrawSVG) since the Webflow acquisition. No licence key. The scroll/text/image
  animation layer the pros use.

**Take with care:**
- **React Bits** — copy-paste animated React components. Fine as a source of ideas; paste
  selectively or every section starts looking like every other React Bits site.
- **Aceternity UI** — 300+ premium components/blocks/templates, including a good cloud shader;
  copy the JS and go.
- **Skiper UI** (skiper-ui.com) — un-common shadcn/ui components, ~24 free + premium; one file
  per component, install with your own shadcn CLI. Dark/Vercel-Apple aesthetic.
- **Watermelon UI** (ui.watermelon.sh) — open-source React registry on Tailwind + Radix; 600+
  components, hosted MCP server and CLI so agents can compose blocks directly.
- **Animaster Lib / Vengeance UI** — animated component shops (scroll, mouse, page-transition,
  WebGL categories). Useful for naming an effect you want; verify licence before shipping.
- **anime.js** — animate anything on the web from one small library. Good when GSAP is overkill.
- **Manus (manus.im)** — agentic AI that builds design-studio-quality sites/slides/decks and
  publishes to a live URL in one click (custom domain, SEO toggle, built-in analytics).

**Do NOT take, despite the reels:**
- 🚩 **Vanta.js** — recommended in these videos as "fancy 3D backgrounds in five lines". It is
  **dead**: no release since 2022, pinned to three r134. Use `@paper-design/shaders` instead
  (free, Apache-2.0, ~25 shaders incl. fluted glass, mesh gradient, god rays, liquid metal).

## Templates and inspiration

- **Framer portfolio/agency templates** worth stealing from: `bureaunine`, `operator-template`,
  `ethan clark`, `ovo-campione`, `portastudio`, `avyron-pro`.
  ⚠️ Framer **cannot self-host** (no HTML export) — treat these as design references, not as a
  delivery format, unless the client stays on Framer.
- **Ready-made interactions** to name when briefing: glass gallery cube · CMS curve gallery ·
  scattered grid text · liquid carousel · 3d globe carousel · 3d image stack scroll · video
  gallery · visual carousel. ("CMS" naming ⇒ Webflow-native; almost certainly
  **osmo.supply**, Dennis Snellenberg & Ilja van Eck, 35+ Awwwards SOTD.)
- **Real sites to study**, grouped and annotated: `references/inspiration-sites.md`.
  Short list — portfolios: sandracreates.com, heatbureau.com, clicktokeep.com,
  kargo-studio.com, wairk.fr, elimarigodesign.com, barbianaliu.com. Scroll/immersive:
  kodeimmersive.com, nic0martins.com, sofaknows.com, utopiatokyo.com, omrimalka.art,
  igloo.inc, getty.edu/tracingart, jessicawells.co, drumspirit.be.

## Image treatment presets

Ten named looks worth having as a vocabulary when art-directing stills (from an image-effects
app built on **Higgsfield Apps**, which publishes a generative app to a live URL where viewers
spend *their own* credits, so creator cost is zero):

cyanotype · pixel sort · voxel relief · bubble wrapped · pixel lace · bleach dye · fogged glass ·
screen clash · 256 colors · electron scan

## Traps

- **Reels teach names, not currency.** Two of the five "free Claude design tools" were
  already-common skills; one of four libraries in the GitHub reel is abandoned. Verify last-release
  date before installing anything a reel recommends.
- **Component shops are a look.** Aceternity/React Bits/Skiper components are recognisable.
  Use them for mechanics you'd otherwise hand-roll, not for the page's identity.
- **Most of these reels gate the links behind a comment** ("comment WEB / TEMPLATE / INSPO /
  ASSETS / SCROLL"). The names are the deliverable; search the name rather than chasing the DM.

## References

- `references/build-stack.md` — full catalog, per-video sourcing, URLs
- `references/composition-rules.md` — the taste layer in full
- `references/inspiration-sites.md` — sites with what each one actually does

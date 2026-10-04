---
name: frontend-ui-design
description: Design and build distinctive, accessible, production-grade web interfaces that don't look AI-generated. Use for landing pages, app screens, dashboards, components and design systems; design direction from a brief (mode, Design Read, tokens); anti-slop review of generic UI (purple gradients, three equal cards, Inter everywhere); typography, colour, OKLCH tokens, spacing, dark mode; component states, forms, empty/loading/error, UX copy; shadcn/ui, Tailwind v4, React composition, library picks, Sonner toasts; animation, easing, springs, gestures, reduced motion; WCAG 2.2 AA accessibility audits; responsive layout and worst-case data (long names, RTL, 1,000 rows); UI audits, diff reviews, polish passes; redesigning an existing site; DESIGN.md files, single-file HTML mockups or prototypes, and live variant pickers. Triggers: "build a landing page", "looks generic", "review my UI", "add animation", "is this accessible", "break this component", "redesign", "prototype this flow", "show me a few versions".
---

# Frontend UI design

Covers the visual and interaction layer of web interfaces: deciding what a page should look like from its brief, turning that into tokens and components, making every state, motion and edge case work, and reviewing or redesigning UI that already exists. Backend, data fetching and app architecture appear only where they shape the interface.

## Core principles

1. **Read the brief before you style anything.** Name the surface, audience, one job and mode (Persuade, Operate, Read, Experience), then write a one-line Design Read. Most generic UI comes from skipping this step.
2. **The brief and the project win over taste.** Explicit user instructions, then the project's existing tokens, fonts and components, then the subject, then your judgment. Report what you'll preserve before changing anything; never import a package that isn't installed.
3. **Defaults are not decisions.** For each choice ask "would I make this for any similar brief?" If yes, change it. The tell list in references/anti-slop.md is the check. A pinned look from the user overrides the list.
4. **Spend boldness in one place.** One memorable element per page, everything else quiet; then remove one decoration before shipping.
5. **Every value is a token.** Colour roles in OKLCH, a ratio type scale (1.125-1.2 product UI, 1.25-1.333 expressive), a 4 px spacing scale, one radius scale, one depth strategy, one accent per page.
6. **Eyebrow labels are off by default.** At most one per three sections, stacked above the heading. Some sources prescribe an eyebrow on every section; that is the most recognisable template tell, so the stricter rule wins.
7. **Build every reachable state.** Hover (pointer devices only), focus-visible, active, disabled, loading, empty, error, success, long content, one item, 1,000 items. Missing states are why UI looks unfinished.
8. **Native element, then tested primitive, then hand-roll.** `<button>` not `<div onClick>`; Base UI / Radix / React Aria for dialogs, menus and comboboxes. Hand-rolling means owning keyboard, focus and ARIA.
9. **WCAG 2.2 AA is the floor.** 4.5:1 text, 3:1 large text and UI parts, visible 2 px focus rings, 24 px minimum targets (44 px on touch), keyboard-complete flows, `prefers-reduced-motion` respected.
10. **Motion needs a purpose and a budget.** Don't animate things seen 100+ times a day; transform/opacity only; UI under 300 ms; ease-out with named custom curves (`cubic-bezier(0.23,1,0.32,1)`) rather than built-ins (one source bans custom easing; strong named tokens are more consistent, so they win); never from `scale(0)`; springs for gestures.
11. **Real content, never invented proof.** No lorem ipsum, Acme or John Doe; no made-up metrics, logos or testimonials; buttons say what happens; errors say what went wrong and how to fix it.
12. **Test with worst-case data, not demo data.** Long unbroken emails, one-letter names, missing fields, plurals at 1, RTL, 320 px and 200% zoom. Report breaks before fixing design decisions.
13. **Serif display and icon families are choices.** Serif for editorial or heritage briefs, not as a "premium" shortcut. One icon family, the project's own, at one stroke width.
14. **Verify rendered output.** Screenshot or open the page at mobile and desktop widths when tooling allows; otherwise say what was not visually verified.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Settings page redesign: `references/redesign.md` → `references/visual-system.md` → `references/components-and-states.md`; tokens from `figma-design` → `references/design-tokens.md`; tests from `testing-qa` → `references/playwright-e2e.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| New page or screen: read the brief, mode, Design Read, domain exploration, token plan, content, images | [references/design-direction.md](references/design-direction.md) |
| Check for or remove generic AI look; pre-ship gate and self-critique | [references/anti-slop.md](references/anti-slop.md) |
| Typography, colour roles, contrast, spacing, layout, depth, dark mode, token block | [references/visual-system.md](references/visual-system.md) |
| Component states, forms, feedback, navigation, overlays, tables, charts, UX copy | [references/components-and-states.md](references/components-and-states.md) |
| shadcn/ui, Tailwind v4, React composition, library picks; Sonner toasts (setup, calls, styling, troubleshooting) | [references/react-shadcn-tailwind.md](references/react-shadcn-tailwind.md) |
| Animation, easing, durations, springs, gestures, reduced motion | [references/motion-and-microinteractions.md](references/motion-and-microinteractions.md) |
| WCAG 2.2 AA, keyboard, ARIA, live regions, accessibility audit | [references/accessibility.md](references/accessibility.md) |
| Responsive layout, i18n/RTL, worst-case data and break testing | [references/responsive-and-hardening.md](references/responsive-and-hardening.md) + `templates/break-ui/CATALOG.md` |
| Scored UI audit, diff-scoped change review, polish pass | [references/review-and-audit.md](references/review-and-audit.md) |
| Redesigning an existing site or app | [references/redesign.md](references/redesign.md) |
| Writing a DESIGN.md; single-file HTML mockups and prototypes; several versions of one piece behind a live picker | [references/design-md-and-prototypes.md](references/design-md-and-prototypes.md) + `templates/design-md/DESIGN.example.md`, `templates/prototype/PICKER.md` |

To use one capability directly, name the task, or say "use frontend-ui-design: <capability>" (for example "use frontend-ui-design: break this component").

## Other crafts

| When the request also needs | Use |
|---|---|
| The whole site to a live URL: page copy and journey, stack, SEO, deploy | `website-building` → `references/plan-and-copy.md`, `references/stacks-astro-vue-static.md`, `references/deploy-vercel.md` |
| Copy beyond microcopy: headlines, value props, page copy, brand voice | `content-creation` → `references/conversion-copy.md`, `references/brand-voice.md` |
| Tokens kept in step with Figma variables, or a Figma frame built as code | `figma-design` → `references/design-tokens.md`, `references/design-to-code.md` |
| Motion beyond UI transitions: GSAP timelines, scroll stories, Lottie, 3D | `motion-animation` → `references/gsap.md`, `references/scroll-animation.md` |
| Hero images, illustrations or textures made with an image model | `image-creation` → `references/web-frontend-assets.md` |
| A logo, brand kit, favicons or Open Graph images | `poster-design` → `references/logos.md`, `references/brand-kits.md`, `references/web-assets.md` |
| Charts and dashboards that have to be right about the numbers | `data-analysis` → `references/visualization.md`, `references/dashboards-kpis.md` |
| Automated end-to-end or component tests for the UI | `testing-qa` → `references/playwright-e2e.md` |
| Native mobile screens (SwiftUI, Compose, Expo) rather than web | `app-building` → `references/native-feel-design.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Search hundreds of named styles, palettes and font pairings by product type | [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/ui-ux-pro-max) (MIT; its data set wasn't copied here) |
| The full polish command set (critique, audit, distill, colorize, harden) on a codebase | [impeccable](https://github.com/pbakaus/impeccable/tree/main/plugin/skills/impeccable) (Apache-2.0) |
| Adding, searching or fixing shadcn/ui components against the current registry docs | [shadcn](https://github.com/shadcn-ui/ui/tree/main/skills/shadcn) (MIT) |
| Vercel's Web Interface Guidelines in their current, complete form | [web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) (MIT; fetches the rules at run time) |
| Pulling tokens out of a live site or another codebase | [extract-design-system](https://github.com/arvindrk/extract-design-system/tree/main/skills/extract-design-system) (MIT) |
| Ready-made colour and font themes for HTML pages, slides and docs | [theme-factory](https://github.com/anthropics/skills/tree/main/skills/theme-factory) (Apache-2.0) |

## Default workflow

1. **Scan the project.** Framework, styling (Tailwind v3/v4, CSS modules), component library, icons, fonts, tokens, motion library. State what you will keep.
2. **Read the brief.** Surface, audience, job, mode, vibe words, constraints. Write the Design Read; ask one question only if the brief is genuinely ambiguous.
3. **Plan.** Domain exploration (4 lists), token plan (colour roles, type, spacing, depth, motion stance), ASCII wireframe, rejected defaults. Review the plan against the tell list.
4. **Build.** Tokens first, then layout, then components with every reachable state, using native elements and the project's primitives. Real copy.
5. **Motion last.** Only what passes the frequency and purpose gate; reduced-motion fallback in the same change.
6. **Harden.** Worst-case data, 320 px to wide, 200% zoom, dark mode, RTL if supported, keyboard-only pass.
7. **Gate.** Run the 20-question anti-slop checklist and the six-axis self-critique; fix anything that scores below 3.
8. **Hand back.** What was built, tokens used, states covered, what was verified visually and what wasn't, images or assets still needed.

## Done means

- [ ] Design Read and mode stated; existing tokens, fonts and components respected
- [ ] Every colour, size, space and radius traces to a token; one accent
- [ ] All reachable states built: hover, focus-visible, active, disabled, loading, empty, error, success
- [ ] Contrast passes (4.5:1 / 3:1) in both themes; keyboard completes every flow; targets ≥ 24 px (44 px touch)
- [ ] No horizontal scroll from 320 px up; long and missing data handled; nothing wraps that shouldn't
- [ ] Motion uses transform/opacity, stays under 300 ms in UI, and has a reduced-motion fallback
- [ ] Anti-slop checklist answers all "no"; no invented metrics, logos, testimonials or placeholder names
- [ ] Rendered output checked at mobile and desktop widths, or the gap stated

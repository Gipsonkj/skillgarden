---
name: figma-design
description: Work with Figma (also Sketch and Penpot) files and design systems via MCP: reading frames efficiently, safe canvas writes, design tokens and variables, syncing tokens with code (Tokens Studio, Style Dictionary, Tailwind), component specs, accessibility and screen-reader specs, hand-off docs, implementing Figma designs as code with existing components (Code Connect, Storybook) and design-system audits. Use when asked to implement a Figma frame, export variables, sync tokens or spec a component.
---

# Figma and design systems

Covers the space between a design tool and a codebase: reading and writing Figma files through MCP, the tokens and variables both sides share, the specs engineers build from (component, accessibility, hand-off), turning frames into code, and auditing whether design and code still agree. Visual design taste and front-end build detail belong to the frontend UI skill; this one is about the system and the bridge.

## Core principles

1. **Values come from data, never from a screenshot.** Read design context and variables for every section; screenshots show intent and check results.
2. **Reuse before you create.** Existing components, tokens, styles and collections first; inventory a file before writing to it, and find-or-create by name so re-runs never duplicate.
3. **Tokens, not literals, in three tiers.** Primitive -> semantic -> (rare) component. UI uses semantic tokens; themes switch semantic values by mode.
4. **One owner per token tier.** Figma-first, code-first or split, written down. Generated files are build output: never hand-edit them.
5. **Ask before destructive or shared writes.** Deleting, renaming, mode changes, detaching, publishing a library. One source says never ask; the stricter rule wins because those writes reach other people's files.
6. **Names are an API.** Variable, variant and prop names match code; renames are breaking changes with a deprecation path.
7. **Every state is specified,** including focus, disabled, loading, empty and error; colour is never the only cue.
8. **Accessibility is spec'd per platform.** WCAG 2.2 AA thresholds (4.5:1, 3:1, 24 px targets) plus VoiceOver, TalkBack and ARIA tables built from a merge analysis, not a list of visual parts.
9. **Specs are for engineers who never open Figma.** Engineer-style prop names, tokens with resolved values, logical directions (start/end), known gaps listed.
10. **Audits are evidence.** Every finding has a node id or file path, rule, severity and fix; group by root cause; propose before fixing.
11. **Drift is checked both ways.** Figma vs code values per mode, missing tokens, probable renames, component parity score.
12. **Use the Plugin API route for variables.** The Variables REST API is Enterprise-only; `use_figma` scripts work on every plan, so the bundled scripts use them.
13. **Respect plan limits.** Starter and View/Collab seats get a handful of MCP calls a month: map with `get_metadata`, then targeted reads only.
14. **Verify what you produced.** Screenshot canvas writes; render code at mobile and desktop widths and compare with the frame.

## Figma's own skills

Figma's plugin (`claude plugin install figma@claude-plugins-official`) installs the MCP server and Figma's skills. They cover the tool mechanics and are not copied here (Figma Developer Terms). When installed, load the matching one before the call it guards: `figma-use` before any `use_figma` write, `figma-design-to-code` for implementing frames, `figma-generate-design` and `figma-generate-library` for pushing screens or libraries into Figma, `figma-code-connect` for Code Connect. If a task needs canvas writes and the plugin is missing, suggest installing it. The full routing table is in [references/figma-mcp.md](references/figma-mcp.md).

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Checkout frame to React: `references/figma-mcp.md` → `references/token-sync-and-drift.md` → `references/design-to-code.md`; states and shadcn build from `frontend-ui-design` → `references/components-and-states.md`, `references/react-shadcn-tailwind.md`; visual checks from `testing-qa` → `references/playwright-e2e.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Connect to Figma, choose a bridge, plan limits, read a file cheaply, `use_figma` rules, safe writes, when to load Figma's skills | [references/figma-mcp.md](references/figma-mcp.md) |
| Token tiers, naming, Figma variables (collections, modes, scopes, code syntax), DTCG files, Style Dictionary, Tailwind v4 `@theme` output; pick a token build tool | [references/design-tokens.md](references/design-tokens.md) |
| Export Figma variables to code, import tokens into Figma, Tokens Studio sync and sd-transforms build (pick a sync tool), drift and parity checks, rename detection, CI | [references/token-sync-and-drift.md](references/token-sync-and-drift.md) + `scripts/figma-export-tokens/`, `scripts/figma-import-tokens/` |
| Component spec or docs page: API, anatomy, structure, colour annotation, uSpec workflow | [references/component-specs.md](references/component-specs.md) |
| Accessibility checks on a design (pick a checker: lint script, Stark, Storybook test-run); screen-reader spec for VoiceOver, TalkBack and ARIA | [references/accessibility-specs.md](references/accessibility-specs.md) + `scripts/figma-lint-design/lint-design.js` |
| Screen or feature hand-off spec: layout, states, content rules, responsive, motion | [references/handoff-specs.md](references/handoff-specs.md) |
| Implement a Figma frame or Figma Make prototype as code: find components (pick a tool: Code Connect, Storybook MCP, repo search), reuse, token mapping, fidelity, assets, responsive, verify loop | [references/design-to-code.md](references/design-to-code.md) + `scripts/figma-check-design-parity/check-parity.js` |
| Audit a library, product files or code against the system; fix findings; governance | [references/design-system-audits.md](references/design-system-audits.md) + `scripts/figma-lint-design/lint-design.js` |
| Build variables, component sets and a library in Figma | [references/building-in-figma.md](references/building-in-figma.md) |
| Penpot or Sketch files, or `.fig` files via OpenPencil (pick a tool by where the file lives); safety for local design servers | [references/other-design-tools.md](references/other-design-tools.md) |

To use one capability directly, name the task, or say "use figma-design: <capability>" (for example "use figma-design: screen reader spec for this toggle").

## Bundled scripts (southleft/figma-console-mcp-skills, MIT)

| Script | Runs in | Does | When |
|---|---|---|---|
| `scripts/figma-export-tokens/read-variables.js` | `use_figma` (read-only) | All collections, modes, values, aliases, scopes, code syntax | First step of any Figma -> code token export or drift check |
| `scripts/figma-export-tokens/convert-tokens.mjs` | Node | Converts that JSON to DTCG, CSS vars, Tailwind v4/v3, SCSS, TS, JSON, Style Dictionary or Tokens Studio | After `read-variables.js`; never hand-convert |
| `scripts/figma-import-tokens/parse-tokens.mjs` | Node | DTCG file -> the constants for `apply-tokens.js` | Code -> Figma import |
| `scripts/figma-import-tokens/apply-tokens.js` | `use_figma` (**writes**) | Creates/updates variables in two passes, matched by id, key, name | Only after the user confirms collection, modes and conflict policy |
| `scripts/figma-lint-design/lint-design.js` | `use_figma` (read-only) | WCAG, design-system and layout findings with node ids | Accessibility pass, audits, pre-hand-off check |
| `scripts/figma-check-design-parity/check-parity.js` | `use_figma` (read-only) | Figma node vs a `CODE_SPEC`, scored 0-100 | After building a component in code, and in parity audits |

Set the `const` inputs at the top of each `use_figma` script before running; read the script first if you change more than those inputs.

## Other crafts

| When the request also needs | Use |
|---|---|
| Design taste for new screens, every component state, or React, shadcn and Tailwind build detail | `frontend-ui-design` → `references/design-direction.md`, `references/components-and-states.md`, `references/react-shadcn-tailwind.md` |
| A frame built as SwiftUI or Jetpack Compose that feels native | `app-building` → `references/swiftui.md`, `references/android-compose.md`, `references/native-feel-design.md` |
| A whole site from the designs, shipped to a live URL | `website-building` → `references/stacks-astro-vue-static.md`, `references/nextjs-react.md`, `references/deploy-vercel.md` |
| Motion in a hand-off turned into real easing, timing and code | `motion-animation` → `references/motion-principles.md`, `references/web-ui-recipes.md` |
| Visual regression or E2E tests that keep the coded screens matching the design | `testing-qa` → `references/playwright-e2e.md` |
| A logo, app icon or brand kit the system is built around | `poster-design` → `references/logos.md`, `references/brand-kits.md` |
| Images for comps and mockups made with an image model | `image-creation` → `references/web-frontend-assets.md` |
| UX copy and microcopy for specs and screens | `content-creation` → `references/conversion-copy.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Specs rendered as Figma frames, and uSpec's structure, property and motion skills | [create-component-md](https://github.com/redongreen/uSpec/tree/main/skills/create-component-md) (MIT; its rendering pipeline wasn't copied here) |
| The complete screen-reader method with its VoiceOver, TalkBack and ARIA reference files | [create-voice](https://github.com/redongreen/uSpec/tree/main/skills/create-voice) (MIT; large skill file that leans on the repo's references folder) |
| Token output for MUI, Swift or Kotlin, and a reusable "sync figma tokens" command | [token-sync-layer](https://github.com/jrpease/throughline/tree/main/skills/token-sync-layer) (MIT; part of the Throughline plugin) |
| A free two-way Figma bridge with stack-aware codegen (pairs with figma-build for code to Figma) | [figma-codegen](https://github.com/awdr74100/figwright/tree/main/skills/figma-codegen) (MIT; needs the figwright MCP server) |
| The audit, document and extend commands for a design system | [design-system](https://github.com/anthropics/knowledge-work-plugins/tree/main/design/skills/design-system) (Apache-2.0) |
| Designing screens and design systems in Penpot through its MCP tools | [penpot-uiux-design](https://github.com/github/awesome-copilot/tree/main/skills/penpot-uiux-design) (MIT) |

## Default workflow

1. **Locate.** Parse the Figma URL (file key, node id, branch); confirm which file if several are open; check the bridge and seat limits.
2. **Map.** `get_metadata` for structure; inventory variables, styles and components; scan the codebase for tokens and components.
3. **Decide ownership and scope.** Which side owns which tokens; which frames, components or repos are in scope. Agree with the user.
4. **Do the task with its guide.** Tokens, sync, spec, hand-off, code or audit, following the reference above and loading Figma's skill for MCP mechanics.
5. **Write safely.** Read-only first; propose writes with counts; confirm destructive or library-wide changes; one concern per call; return ids.
6. **Verify.** Read back variables, screenshot canvas changes, render code at 375 px and desktop, run lint or parity.
7. **Report.** What changed (with ids or paths), what was verified, gaps and probable renames, and what was not checked.

## Done means

- [ ] Every value traced to a variable, style or token (or listed as a gap)
- [ ] Nothing duplicated: existing components, tokens and collections reused
- [ ] Token ownership stated; generated files untouched by hand
- [ ] Destructive and shared-library writes confirmed by the user before running
- [ ] All states incl. focus covered; WCAG thresholds checked in every mode
- [ ] Specs readable without Figma: engineer prop names, token (value), known gaps
- [ ] Code rendered and compared at mobile and desktop, or Figma writes screenshotted
- [ ] Report lists findings with locations, what was verified and what wasn't

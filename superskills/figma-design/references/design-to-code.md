# Figma design to code

> Distilled from: figma-codegen and its grounding, responsive, assets-and-icons and verify references (awdr74100/figwright, MIT); figma-check-design-parity (southleft/figma-console-mcp-skills, MIT); design-system and design-handoff (anthropics/knowledge-work-plugins, Apache-2.0). Storybook MCP and Figma Make sections written in our own words from the Storybook, Figma developer and Figma help docs.

If Figma's plugin is installed, load its `figma-design-to-code` skill for the MCP call mechanics (it is not copied here). This guide is the judgement around it: reuse, tokens, fidelity and the verify loop. Works with any bridge that returns structured design context (Figma MCP, figwright, figma-console).

## 1. Before you write code

1. **Learn the project.** Framework, styling (Tailwind, CSS modules, CSS-in-JS), where components and tokens live, import style, naming. Match the project, not a house style.
2. **Map components.** For each Figma component instance, find the code component that already implements it (name, Code Connect mapping, a recorded mapping file, or search the repo). Reuse it with props; don't regenerate.
3. **Map tokens.** For each bound variable, find the code token (variable code syntax first, then name, then value). A bound variable always beats a value match. When several tokens share a value, choose by meaning; a semantically wrong token is worse than a flagged raw value.
4. **Plan sections.** For a full page, list its top-level sections with `get_metadata` and handle each one separately.

## 1a. Find the code components: pick a tool

| Situation | Use | Why |
|---|---|---|
| The team already keeps a component index you can query (Storybook MCP, Code Connect, a map file) | That one | It is what the team maintains; don't build a second index |
| Figma components are linked to code with Code Connect | `get_code_connect_map` on the Figma MCP | Gives the code component per Figma node directly |
| The project has Storybook (React, or Angular/Vue 3 on Vite) | Storybook MCP addon, below | Real props and example stories, not guesses from file names |
| You confirmed mappings on earlier runs | `docs/figma-component-map.md` (section 7) | Already proven by rendering |
| None of these | Search the repo (component folder, exports, usages) | Free, no setup; slower and easier to miss a variant |
| Unsure whether the team runs Storybook or Code Connect | Ask | One question beats a wrong install |

Report which frame parts mapped to which components, and which had no match.

### Storybook MCP addon

What it is: an MCP server inside the Storybook dev server that lets an agent list the documented components, read their props and stories, write stories and run component tests. Status: preview, so the API may change; check the docs before relying on a tool name.

**Setup (ask before installing or changing config):**

```bash
npx storybook add @storybook/addon-mcp
```

Then turn on the components manifest in `.storybook/main.ts` (the docs tools need it):

```ts
features: {
  componentsManifest: true,
},
```

The server runs at `http://localhost:6006/mcp` while Storybook is running (the port follows your Storybook port). Register it in Claude Code:

```bash
claude mcp add --transport http storybook --scope project http://localhost:6006/mcp
```

`--scope project` writes `.mcp.json` in the repo so the team shares it; use the default local scope if they don't want that file. Storybook also publishes a Claude Code plugin with its setup skills (`stories`, `storybook-init`, `storybook-setup`, `storybook-upgrade`): `claude plugin marketplace add storybookjs/mcp@main --scope user`, then `claude plugin install storybook@storybook --scope user`.

**Framework support.** Full support for React frameworks (react-vite, react-webpack5, nextjs, nextjs-vite, tanstack-react, react-native-web-vite), plus `@storybook/angular-vite` and `@storybook/vue3-vite` (Vue 3 also needs `experimentalDocgenServer`). Other frameworks don't generate a manifest yet, so the docs tools return nothing there; fall back to repo search.

**Tools, by toolset** (all three toolsets are on by default; turn one off in the addon's `options.toolsets`, e.g. `{ dev: false }`):

| Toolset | Tools | Use for |
|---|---|---|
| `docs` | `docs-list`, `docs-show`, `docs-show-story` | Index of components; props and example stories for one; one story in full |
| `dev` | `get-storybook-story-instructions`, `stories-find-by-component`, `stories-changed`, `stories-preview`, `review-create` | How this project wants stories written; stories for a component file; stories touched by your changes; previews in chat |
| `test` | `test-run` | Run tests for given stories; reports accessibility issues too. Needs `@storybook/addon-vitest` installed and enabled |

**Order of work for a frame:** `docs-list` → `docs-show` for each candidate → build only what has no match → `get-storybook-story-instructions` → write stories for every new component (default, hover, focus, disabled, error, plus any state the frame shows) → `test-run` on those stories → show the result.

**Gotchas.**
- Agents see what the manifest holds. JSDoc descriptions on props are what agents use to learn how to use a component; a story without the `manifest` tag is left out, which is how teams hide deprecated components.
- Values built at runtime from imports (a mapped token array in MDX) are not captured in the manifest; read the token source instead.
- Mark stories you wrote so a human reviews them (Storybook's own setup tags them `ai-generated`); don't remove the tag yourself.

## 1b. When the source is a Figma Make file

Figma Make turns prompts and design context into a working, code-backed prototype. To build it into the real codebase:

| Route | How | Notes |
|---|---|---|
| Figma MCP resources | Give the agent the Make link; it lists the project's files and fetches the ones you pick | Only on clients that support MCP resources. `get_design_context` also accepts Make files |
| Download | Download the code from Make; you get a `.zip` of the app | Read the code before running it; install nothing it asks for without checking |
| Push to GitHub | Make settings → GitHub → Create Repository, later Push to... | One-way: edits made in GitHub are overwritten on the next push; always the default branch; no GitHub Enterprise Server |

Treat Make output as a reference, not code to paste: map its components to the project's own (section 1a), swap its literals for tokens, then run the verify loop. Make is for Full seats on paid plans (other seats can try it).

## 2. Ground every value

- Every size, colour, font, radius and gap comes from design context data for **that** section. The screenshot is for intent and for checking; it is not a ruler.
- Never depth-cap a whole page to fit one call; ground section by section.
- Read text overrides on each instance; two instances of one component usually say different things.
- Wire layers that are bound to component properties to props: a text layer bound to `Label` renders `{label}`, a layer whose visibility is bound to `Show badge` renders conditionally. Otherwise every instance freezes to the one you looked at.
- Figma axes the code component has no prop for (a leading icon, a required flag) become "extend component" TODOs, not ad-hoc markup.

## 3. Fidelity checklist

Each of these is in the design data and easy to drop:

| Figma | Code |
|---|---|
| Auto layout direction, gap, padding, alignment | Flex/grid with the same gap and padding; `space-between` only if the frame says so |
| Hug / fill / fixed sizing; min/max width | `width: auto` / `flex: 1` or `w-full` / fixed; `min-width`, `max-width` |
| Drop and inner shadows, blur | `box-shadow` (inner = `inset`), `filter` / `backdrop-filter` |
| Per-side stroke weights | Per-side borders, not one border |
| Stroke align inside / outside / centre | Inside = border with `box-sizing: border-box`; outside = `outline` or box-shadow; centre = half each way |
| Per-corner radius | Four radius values |
| Dashed strokes | `border-style: dashed` or SVG `stroke-dasharray` |
| Gradients | `linear-` / `radial-` / `conic-gradient` with the same stops and angle |
| Blend modes, masks | `mix-blend-mode`, `mask-image` / `clip-path` |
| Image fill `FILL` / `FIT` / `CROP` | `object-fit: cover` / `contain`; export the composite for crops |
| Text: line height, letter spacing, case, decoration, truncation | Same values; `text-overflow: ellipsis` or `line-clamp` |
| Clip content + overflow direction | `overflow: hidden` / `overflow-x: auto` |
| Locked aspect ratio | `aspect-ratio` |
| Absolute children in auto layout | `position: absolute` inside a `position: relative` parent |
| Dev Mode annotations | Ground truth; implement what they say |

## 4. Assets

- Photos: export the original image fill and reproduce the fit in CSS. Export a composite (at 2x) only when the fill has crops, masks or image adjustments the original can't reproduce.
- Icons: reuse the project's icon files or icon library first; export SVG only for icons that exist in neither. Single-colour icons use `currentColor` so the call site colours them with a token.
- Logos are always exported, never typed.
- Never ship grey placeholder boxes for missing assets; list them.

## 5. Responsive

- Root is fluid (`width: 100%` with a `max-width` container), never the artboard's fixed width.
- Use each breakpoint frame's own values. Build mobile-first and add larger-breakpoint overrides for both layout and values.
- Swap markup (`hidden lg:block`) only when content or layout systems truly differ (hamburger vs full nav).
- Full-bleed pages need a margin reset unless the project already has one (Tailwind preflight does).

## 6. Verify loop (required)

1. Render with the project's own toolchain (dev server or build + preview), with tokens and assets wired.
2. Screenshot at the design's viewport width (use device-metrics emulation for exact widths) and take `get_screenshot` of the same node.
3. Compare; for every real difference, re-read that node's data, fix the cause, re-render.
4. Check 375 px and the desktop width: no horizontal overflow on mobile (`document.documentElement.scrollWidth === innerWidth`, except intended carousels), no desktop regression.
5. Run keyboard and screen-reader basics: focus visible, tab order matches reading order, names present.
6. Optional: `scripts/figma-check-design-parity/check-parity.js` with a `CODE_SPEC` of what you built, for a scored list of mismatches.

## 7. Record what you proved

Keep `docs/figma-component-map.md` (`| Figma name | code path |`) and `docs/figma-token-map.md` (`| Figma name | token ref |`). Add a row only for a mapping you were unsure of and then confirmed by rendering. A wrong row mis-maps every future run; delete rows that point at renamed or removed files.

## 8. Re-sync when the design changes

Save a baseline of the node's design context (or at least the screenshot and the key values) when you build. On "the design changed", re-read the same node, diff, and edit only the code mapped to changed nodes. Re-grounding the whole screen throws away reviewed work.

## 9. Report

```markdown
Built <Screen> from <Figma link> (node 12:345)
Reused: Button (primary, md), TextField, Card
New: PriceTag (src/components/PriceTag.tsx), not in the library yet
Token gaps: #F4F1EA on promo banner (no token; suggest color/bg/promo)
Verified: 375 and 1440 px, no overflow; parity 94/100 (radius 6 vs 8 on Card)
Not done: hover animation on cards (no motion data in the file)
```

## Done means

- [ ] Existing components and tokens reused; no invented component names
- [ ] Every section grounded from data; no values read off a screenshot
- [ ] Fidelity checklist walked; assets exported, none faked
- [ ] Rendered and compared at mobile and desktop; no overflow
- [ ] Gaps (raw values, missing props, missing assets) listed in the report

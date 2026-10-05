# Credits

This super skill is distilled from the open-source agent skills below. Reference files are rewritten summaries; files under `templates/` are copied unchanged with their source license beside them.

| Source skill | Repo | License | Used for |
|---|---|---|---|
| frontend-design | https://github.com/anthropics/skills/tree/main/skills/frontend-design | Apache-2.0 | Design direction, committing to an aesthetic, anti-slop tells, content rules |
| web-design-guidelines | https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines | MIT | Interface guideline checks (accessibility, responsive, review). Its runtime fetch of remote rules was not copied |
| design-taste-frontend | https://github.com/leonxlnx/taste-skill/tree/main/skills/taste-skill | MIT | Design Read line, real design systems table, tells, motion and image rules |
| redesign-existing-projects | https://github.com/leonxlnx/taste-skill/tree/main/skills/redesign-skill | MIT | Redesign scan/diagnose/fix, audit areas, fix priority, rules |
| ui-ux-pro-max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/ui-ux-pro-max | MIT | Rule categories for type, colour, forms, navigation, charts, touch targets. Its 3 MB data set was not copied (size) |
| impeccable | https://github.com/pbakaus/impeccable/tree/main/plugin/skills/impeccable | Apache-2.0 | Modes, visual system, 5-dimension audit scoring, P0-P3 severity, polish pass, hardening. Its launcher scripts were not copied |
| hallmark | https://github.com/nutlope/hallmark/tree/main/skills/hallmark | MIT | Tell catalogue, slop gate, hero sizing, token plan |
| emil-design-eng | https://github.com/emilkowalski/skills/tree/main/skills/emil-design-eng | MIT | Motion philosophy, Before/After/Why review table |
| animate | https://github.com/emilkowalski/skills/tree/main/skills/animate | MIT | Animation decision gate, tool choice, easing and duration tables, recipes |
| apple-design | https://github.com/emilkowalski/skills/tree/main/skills/apple-design | MIT | Springs, interruptibility, velocity handoff, gestures, materials, reduced transparency |
| break-ui | https://github.com/emilkowalski/skills/tree/main/skills/break-ui | MIT | Worst-case data workflow, failure signatures, truncate/wrap/clamp; `templates/break-ui/CATALOG.md` copied |
| pick-ui-library | https://github.com/emilkowalski/skills/tree/main/skills/pick-ui-library | MIT | React library picks |
| shadcn | https://github.com/shadcn-ui/ui/tree/main/skills/shadcn | MIT | shadcn CLI workflow, composition and styling rules, theming. Its auto-executing `npx shadcn info` line was not copied |
| vercel-composition-patterns | https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns | MIT | Compound components, no boolean props, React 19 patterns |
| accessibility | https://github.com/addyosmani/web-quality-skills/tree/main/skills/accessibility | MIT | WCAG 2.2 AA checklist, evidence-led audit workflow, severity triage |
| tailwind-design-system | https://github.com/wshobson/agents/tree/main/plugins/frontend-mobile-development/skills/tailwind-design-system | MIT | Tailwind v4 migration table, token hierarchy |
| interface-design | https://github.com/dammyjay93/interface-design/tree/main/.claude/skills/interface-design | MIT | Domain exploration, depth strategies, system memory file |
| baoyu-design | https://github.com/JimLiu/baoyu-design/tree/main/skills/baoyu-design | MIT | Prototype and design-artifact process |
| antislop-ui | https://github.com/miqdadbadjuber/anti-slop/tree/main/skills/antislop-ui | MIT | Pre-ship anti-slop checklist questions |
| html-prototype | https://github.com/plannotator/effective-html/tree/main/skills/html-prototype | MIT | Mockup vs prototype, state modelling, build contract, hand-off |
| frontend-ui-engineering | https://github.com/addyosmani/agent-skills/tree/main/skills/frontend-ui-engineering | MIT | Component architecture, state choice, accessibility in builds |
| interface-review | https://github.com/jakubkrehel/skills/tree/main/skills/interface-review | MIT | Diff-scoped change review, removed-signal search, finding statuses |
| baseline-ui | https://github.com/ibelick/ui-skills/tree/main/skills/baseline-ui | MIT | Baseline rules for Tailwind UI, motion limits |
| design-md | https://github.com/google-labs-code/stitch-skills/tree/main/plugins/stitch-utilities/skills/design-md | Apache-2.0 | DESIGN.md structure; `templates/design-md/DESIGN.example.md` copied |
| extract-design-system | https://github.com/arvindrk/extract-design-system/tree/main/skills/extract-design-system | MIT | Idea of reading tokens from a live site. Its `npx` install/run steps were not included |
| prototype | https://github.com/emilkowalski/skills/tree/main/skills/prototype | MIT | Several-variants workflow: one piece, named divergent axes, isolated surface, one variant at a time in context, verify, present and stop, keep/riff (design-md-and-prototypes); `templates/prototype/PICKER.md` copied verbatim with `LICENSE.source-repo` |
| ask-sonner | https://github.com/emilkowalski/skills/tree/main/skills/ask-sonner | MIT | Sonner setup, call picker, recipes, styling ladder, theme, troubleshooting table, Toaster and toast() defaults (react-shadcn-tailwind). Its scripted first-reply line was left out |

## Official docs (link-only reference, written in our own words)

| Source | Link | Used for |
|---|---|---|
| Storybook docs | https://storybook.js.org/docs (writing-stories, play-function, writing-docs/autodocs, api/arg-types, essentials/controls, writing-tests/interaction-testing, writing-tests/accessibility-testing, writing-tests/integrations/vitest-addon, writing-tests/integrations/test-runner, get-started/install, ai/mcp/overview, ai/mcp/api, ai/mcp/sharing, ai/manifests, api/main-config/main-config-features) | Stories, a11y addon, story tests in CI, Storybook MCP (component-workshop) |
| Figma MCP server docs | https://developers.figma.com/docs/figma-mcp-server/ (remote-server-installation, tools-and-prompts, rate-limits-access, code-connect-integration) | Connecting, read order, limits (component-workshop). Figma's own skills have no open-source licence and were not used |
| Figma Code Connect docs | https://developers.figma.com/docs/code-connect/ | What Code Connect adds and needs (component-workshop) |
| Claude Code MCP docs | https://code.claude.com/docs/en/mcp | `claude mcp add --transport http`, stdio servers after `--`, and scopes (component-workshop, component-library-theming) |
| axe-core API docs | https://www.deque.com/axe/core-documentation/api-documentation/ | Rule tags such as `wcag22aa` (component-workshop) |
| Motion for React docs | https://motion.dev/docs/react (react-animate-presence, react-layout-animations, react-transitions, react-accessibility, react-reduce-bundle-size, react-upgrade-guide) | Motion for UI components (motion-and-microinteractions §9) |
| Material UI docs | https://mui.com/material-ui/ (getting-started/installation, getting-started/mcp, llms.txt, customization/theming, palette, typography, theme-components, dark-mode, css-theme-variables/usage, css-theme-variables/configuration, css-theme-variables/native-color, integrations/nextjs, react-table, react-skeleton, react-grid, api/button, api/paper, migration/upgrade-to-v7, migration/upgrade-to-v9) | MUI theme, dark mode without flash, Next.js wiring, docs MCP, tables, version gotchas (component-library-theming) |
| MUI X Data Grid docs | https://mui.com/x/react-data-grid/ (quickstart, overlays) | Data Grid packages, licences, loading and empty overlays (component-library-theming) |
| Ant Design docs | https://ant.design/docs/react/introduce (customize-theme, use-with-next, mcp, llms) | ConfigProvider tokens and algorithms, Next.js registry, MCP and llms files (component-library-theming) |
| Bootstrap 5.3 docs | https://getbootstrap.com/docs/5.3/customize/sass/ (customize/sass, customize/options, customize/css-variables, customize/color-modes) | Sass override order, maps, `$enable-*` options, `--bs-` variables, colour modes (component-library-theming) |
| Sass docs | https://sass-lang.com/documentation/ (at-rules/use, breaking-changes/import, cli/dart-sass, modules/color, style-rules/declarations, libsass) | Dart Sass status, `@use`, deprecations and migrator, CLI flags, colour module (component-library-theming) |
| Chrome DevTools MCP README | https://github.com/ChromeDevTools/chrome-devtools-mcp | Usage-statistics and CrUX opt-out flags (accessibility audit picker) |
| shadcn/ui, Base UI, React Aria and Bootstrap intro pages | https://ui.shadcn.com/docs, https://base-ui.com/react/overview/quick-start, https://react-aria.adobe.com/, https://getbootstrap.com/docs/5.3/getting-started/introduction/ | What each is for, in the component-library picker (component-library-theming) |
| Lucide docs | https://lucide.dev/guide/ (react/getting-started, react/basics/stroke-width, version-1, accessibility) | lucide-react defaults and accessible icon buttons (react-shadcn-tailwind library picks) |

## Also see (not included)

- material-ui-theming and material-ui-nextjs (mui/material-ui, `skills/`, MIT): MUI's official agent skills, read only to cross-check; every fact in component-library-theming was taken from the MUI docs pages listed above.
- high-end-visual-design (leonxlnx/taste-skill, `skills/soft-skill`, MIT): conflicts with the other sources (requires eyebrow labels and `transition-all`), so little was taken.
- theme-factory (anthropics/skills, Apache-2.0): ready-made font/colour themes aimed mostly at slide decks.
- review-animations and other skills in emilkowalski/skills; better-* domain skills in jakubkrehel/skills; fixing-accessibility in ibelick/ui-skills.

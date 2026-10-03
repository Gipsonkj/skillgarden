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

## Also see (not included)

- high-end-visual-design (leonxlnx/taste-skill, `skills/soft-skill`, MIT): conflicts with the other sources (requires eyebrow labels and `transition-all`), so little was taken.
- theme-factory (anthropics/skills, Apache-2.0): ready-made font/colour themes aimed mostly at slide decks.
- review-animations and other skills in emilkowalski/skills; better-* domain skills in jakubkrehel/skills; fixing-accessibility in ibelick/ui-skills.

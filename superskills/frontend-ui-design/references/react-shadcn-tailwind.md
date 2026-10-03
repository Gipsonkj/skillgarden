# React, shadcn/ui and Tailwind v4 specifics

> Distilled from: shadcn (shadcn-ui/ui, MIT), vercel-composition-patterns (vercel-labs/agent-skills, MIT), tailwind-design-system (wshobson/agents, MIT), pick-ui-library (emilkowalski/skills, MIT), baseline-ui (ibelick/ui-skills, MIT), design-taste-frontend (leonxlnx/taste-skill, MIT), frontend-ui-engineering (addyosmani/agent-skills, MIT)

Read this only when the project uses React, shadcn/ui or Tailwind. The general rules in the other references still apply.

## Before touching code

1. Read `package.json`: framework (Next.js app router? Vite?), React version, Tailwind version (v3 `tailwind.config.*` vs v4 `@import "tailwindcss"` + `@theme`), motion library, icon library, primitive library.
2. If `components.json` exists, it's a shadcn project: note `aliases`, `style`, `base` (radix or base-ui), `iconLibrary`, and the global CSS file. `npx shadcn@latest info --json` prints all of this.
3. Never import a package that isn't installed. Give the install command with the project's package manager (`pnpm add`, `npm i`, `bun add`).

## shadcn/ui rules

**Workflow**
- Check installed components (the `components/ui` folder) before adding. Search registries before writing custom UI: `npx shadcn@latest search @shadcn -q "sidebar"`.
- Read docs for a component before using it: `npx shadcn@latest docs dialog`.
- Add with the CLI: `npx shadcn@latest add button dialog`. To update a customised component, preview first with `--dry-run` and `--diff <file>`; never `--overwrite` without the user's OK.
- Don't guess a registry when the user asks for a "block" without naming one; ask.
- After adding from a community registry, read the files and fix hard-coded import paths to the project's aliases.

**Composition**
- Compose before you invent: settings page = Tabs + Card + form controls; dashboard = Sidebar + Card + Chart + Table.
- Items live inside their group (`SelectItem` in `SelectGroup`, `DropdownMenuItem` in `DropdownMenuGroup`, `TabsTrigger` in `TabsList`).
- Dialog, Sheet and Drawer always have a Title (visually hidden with `sr-only` if needed).
- Full Card anatomy: `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter`.
- Use the built-ins: `Alert` for callouts, `Empty` for empty states, `Skeleton` for loading, `Separator` instead of `<hr>`, `Badge` instead of styled spans, `ToggleGroup` for 2-7 options, `AlertDialog` for destructive confirmation.
- Buttons have no `isLoading` prop: compose `Spinner` + `disabled`.
- Forms: `FieldGroup` + `Field` + `FieldLabel` + `FieldDescription`; invalid state is `data-invalid` on `Field` and `aria-invalid` on the control.
- Custom triggers: `asChild` (Radix base) or `render` (Base UI base).
- Toasts: `sonner` on Radix projects, the `toast` component on Base UI projects.

**Styling**
- `className` for layout, not for recolouring components. Use variants (`variant="outline"`, `size="sm"`) first.
- Semantic tokens only: `bg-primary`, `text-muted-foreground`, `border-border`. No `bg-blue-500`, no manual `dark:` colour overrides.
- `flex flex-col gap-4`, never `space-y-*`. `size-10`, not `w-10 h-10`. `truncate` shorthand.
- `cn()` for conditional classes. No manual z-index on overlay components.
- Never ship the default look: change radius, colour tokens, type and shadows to the project's direction.

**Theming**: every colour is a `name` / `name-foreground` pair of CSS variables in `:root` and `.dark` (`--background`, `--primary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--chart-1..5`, `--sidebar-*`), in OKLCH. Add custom colours in the existing global CSS file, both themes, then expose them to Tailwind (`@theme inline { --color-warning: var(--warning); }` in v4).

## Tailwind v4

| v3 | v4 |
|---|---|
| `tailwind.config.ts` theme | `@theme { --color-*: ...; --font-*: ...; }` in CSS |
| `@tailwind base; components; utilities` | `@import "tailwindcss";` |
| `darkMode: "class"` | `@custom-variant dark (&:where(.dark, .dark *));` |
| `tailwindcss-animate` | `@keyframes` inside `@theme` + `--animate-*`, `@starting-style` |
| PostCSS plugin `tailwindcss` | `@tailwindcss/postcss` or the Vite plugin |

Token hierarchy: brand primitive (`oklch(48% 0.12 160)`) -> semantic token (`--color-primary`) -> utility (`bg-primary`) -> component variant. Theme changes remap semantic tokens only.

Practical rules:
- Keep Tailwind's default scales unless the project already customised them; add tokens instead of arbitrary values (`p-[17px]` is a smell).
- `min-h-dvh` (or `min-h-[100dvh]`), never `h-screen` for full-height sections.
- `text-balance` on headings, `text-pretty` on paragraphs, `tabular-nums` on data.
- A fixed z-index scale; no `z-[9999]`.
- Never overwrite the project's entry stylesheet: keep its `@import "tailwindcss"` / `@tailwind` lines, append your tokens below.

## React component architecture

- **No boolean-prop explosion.** `isThread`, `isEditing`, `isDM` on one component doubles states each time. Make explicit variants (`<ThreadComposer>`, `<EditComposer>`) built from shared parts.
- **Compound components** for complex widgets: `<Composer.Provider>`, `<Composer.Input>`, `<Composer.Submit>` sharing context.
- **Lift state into a provider** when siblings need it; the provider is the only place that knows how state is stored. Context interface = `{ state, actions, meta }`.
- **Children over render props** (`renderHeader`) for composition.
- **React 19**: no `forwardRef` (ref is a prop); `use(Context)` instead of `useContext`.
- Separate data fetching (container: loading / error / empty / data) from presentation.
- State choice, simplest first: `useState` -> lifted state -> context (theme, auth, locale) -> URL params (filters, pagination) -> server cache (TanStack Query / SWR) -> global store (Zustand) for complex shared client state.
- Don't use `useEffect` for anything that can be computed during render.
- Next.js app router: Server Components by default; anything with state, effects, event handlers, browser APIs or motion is a small `"use client"` leaf. Providers live in a client wrapper.
- Never drive continuous values (pointer position, scroll progress) through `useState`; use motion values (`useMotionValue`, `useScroll`) or CSS.

## Motion in React

Use the `motion` package (`import { motion } from "motion/react"`) only when you need springs, layout animations, exit animations or gestures; a hover or fade is plain CSS. Use `useReducedMotion()` and skip the animation when it returns true. For hardware acceleration under load, animate a full `transform` string rather than the `x`/`y` shorthands. See [motion-and-microinteractions.md](motion-and-microinteractions.md).

## Library picks (when nothing is installed)

| Need | Pick |
|---|---|
| Accessible unstyled primitives | Base UI (or Radix / React Aria if already present) |
| Command menu (⌘K) | cmdk |
| Toasts | Sonner |
| OTP / code input | input-otp |
| Animation (springs, layout, exit) | motion |
| Animated numbers | NumberFlow |
| Charts | Recharts (live streaming charts: Liveline) |
| Drag and drop | dnd kit |
| Long lists / tables | react-virtuoso |
| Client state | Zustand |
| Conditional classes / variants | clsx / cva (+ tailwind-merge via `cn`) |
| Theme switching without flash | next-themes |
| Syntax highlighting | shiki |
| Icons | one family only; keep the project's (Lucide, Phosphor, Tabler, Radix icons), consistent stroke width |

Common mismatches to fix: hand-built toasts or dropdowns with manual focus handling; re-rendering text to animate a counter; rendering 1,000+ rows directly; template-literal class ternaries three levels deep.

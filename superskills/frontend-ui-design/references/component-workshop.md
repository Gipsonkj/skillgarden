# Component workshop: Figma frame in, tested component out

> Written in our own words from the official docs: Storybook (storybook.js.org/docs), Figma MCP server and Code Connect (developers.figma.com), Claude Code MCP (code.claude.com/docs), axe-core API (deque.com). Facts checked against those docs in October 2026; tool versions move, so recheck a command that fails.

Read this when a component has to match a Figma design, live in Storybook, or both: building a design-system component, writing stories, making accessibility violations fail CI, or giving Claude live access to the component library. The rules in [components-and-states.md](components-and-states.md) and [accessibility.md](accessibility.md) still decide what "done" looks like; this guide is how to drive the tools.

## 1. Start from a Figma frame (when there is one)

A frame that already exists settles the direction: the job is fidelity, not taste. This craft still owns the states, accessibility and worst-case data the frame doesn't show. Token sync, canvas writes and Code Connect setup go to `figma-design` → `references/figma-mcp.md`, `references/design-to-code.md`, `references/design-tokens.md`.

**Connect** (once per machine):

```bash
claude plugin install figma@claude-plugins-official        # recommended: server plus Figma's own skills
# or the server alone, available in every project:
claude mcp add --transport http figma https://mcp.figma.com/mcp --scope user
```

Start a new Claude Code session, run `/mcp`, pick **figma**, choose **Authenticate** and allow access in the OAuth page. Never ask for or paste a Figma token. Only clients listed in the Figma MCP Catalog can connect; if sign-in fails from another client, say so rather than working around it.

**Read in this order.** The remote server needs a link to a frame or layer (selection-only prompting works on the desktop server alone).

| Step | Tool | Why |
|---|---|---|
| 1. Map a big frame | `get_metadata` | Sparse XML of ids, names and boxes; cheap. Use when `get_design_context` would be huge |
| 2. Ground each section | `get_design_context` | Layout, styles and code for a frame or layer. Default output is React + Tailwind; ask for Vue, plain HTML + CSS or iOS if the project needs it |
| 3. Tokens | `get_variable_defs` | The variables and styles the selection uses (colours, spacing, type) |
| 4. Compare | `get_screenshot` | The visual target; check your rendered component against it |

Rules:
- Treat `get_design_context` output as a reference, not code to paste. Rebuild it with the project's components, tokens and conventions; map each Figma variable to an existing token and flag any value with no match instead of hard-coding it.
- With **Code Connect** set up, the output carries the real import statement and usage snippet for mapped components, so Claude reuses your `Button` instead of regenerating one. It needs a Dev or Full seat on an Organization or Enterprise plan; the CLI (`@figma/code-connect`) reads a personal access token (Code Connect: Write, File content: Read) from `FIGMA_ACCESS_TOKEN`; use the variable, never `--token` on the command line. `npx figma connect publish` uploads the mappings to Figma, where designers see them in Dev Mode's Inspect panel: show the mapping files and wait for a yes before publishing.
- Build the states the frame leaves out (focus-visible, loading, error, empty, long content) and say which ones were your call.

**Limits** (read tools; writes such as `create_new_file` and `add_code_connect_map` are exempt):

| Seat | Starter | Professional | Organization / Enterprise |
|---|---|---|---|
| View, Collab | up to 20 calls a month | up to 6 a month | up to 6 a month |
| Dev, Full | up to 200 a day | up to 200 a day | up to 600 a day |

On a View or Collab seat, plan for a handful of calls: one `get_metadata`, then only the sections you build. Per-minute caps also apply on Dev and Full seats; back off when a call is refused rather than retrying in a loop.

## 2. Storybook: when and setup

Pick Storybook when components are shared (a design system, a product with many screens) and every state needs to be seen, documented and tested in isolation. For a one-off landing page it is overhead; skip it.

**Scan first.** `package.json` for the `storybook` version and the framework package (`@storybook/react-vite`, `@storybook/nextjs-vite`, `@storybook/nextjs`, ...), `.storybook/main.ts` for addons and features, `.storybook/preview.ts` for global parameters. Never add a second setup on top of an existing one.

```bash
npm create storybook@latest            # new setup; follow its prompts
npm run storybook                      # dev server (the address is printed; usually localhost:6006)
npx storybook add @storybook/addon-a11y   # the pattern for adding any addon
```

The current docs are for Storybook 10 (10.6 in October 2026). Check the project's version before copying an API.

## 3. Stories: one per reachable state

Stories live beside the component as `Button.stories.tsx`. Write one story per state from the state matrix, plus the worst-case content from `templates/break-ui/CATALOG.md`. Use the component's real props: if the project composes a spinner and `disabled` instead of an `isLoading` prop, the story does the same.

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { Plus } from "lucide-react";           // the project's own icon family
import { Button } from "./button";

const meta = {
  component: Button,
  tags: ["autodocs"],
  args: { children: "Save changes", onClick: fn() },
  argTypes: { variant: { control: "select", options: ["primary", "secondary", "ghost"] } },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Save changes" })).toBeDisabled();
  },
};
export const IconOnly: Story = {
  args: { children: <Plus aria-hidden="true" />, "aria-label": "Add member" },
};
export const KeyboardActivates: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Save changes" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```

- `satisfies Meta<typeof Button>` keeps args type-checked; `StoryObj<typeof meta>` types each story.
- `expect` from `storybook/test` combines Vitest's matchers with jest-dom's (`toBeDisabled`, `toHaveFocus`, `toBeVisible`).
- `fn()` in `args` makes a spy you can assert on in a `play` function. `play` receives `canvas` (Testing Library queries scoped to the story), `userEvent` (`click`, `type`, `keyboard`, `tab`), `args`, `step` and `mount`. Query by role and accessible name, as a user would.
- `argTypes` are inferred from the props (react-docgen by default, or react-docgen-typescript); override only what inference gets wrong.
- `tags: ["autodocs"]` on the meta (or in `preview.ts` for all) generates a docs page with the primary story, controls and an args table; `"!autodocs"` opts a component or story out.
- JSDoc on the component and each prop shows up in the docs and in the MCP manifest (section 6). Write it.
- A Loading story uses whatever the project really renders while busy; assert the busy state the component exposes (for example `aria-busy` or a disabled button), not a prop you invented.

## 4. Accessibility checks on every story

The a11y addon runs axe-core on the rendered story. Set it to fail, not warn:

```ts
// .storybook/preview.ts
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    a11y: {
      test: "error",
      options: { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    },
  },
};
export default preview;
```

| `parameters.a11y.test` | Effect |
|---|---|
| `"error"` | Violations fail the test, in the UI and in CI. Use this |
| `"todo"` | Runs, shows violations as warnings; a temporary state while fixing a backlog |
| `"off"` | No automated run; the panel still works by hand |

- Set it in `preview.ts` for everything; override per component (meta `parameters`) or per story only with a written reason.
- `runOnly` takes axe tags; `wcag22aa` is the WCAG 2.2 AA set, `best-practice` adds Deque's extra rules. Disable a single rule with `config: { rules: [{ id: "...", enabled: false }] }` and a comment saying why.
- `globals: { a11y: { manual: true } }` on a story skips the automatic run for that story.
- Storybook's docs credit axe with catching up to 57% of WCAG issues. The rest still needs the manual pass in [accessibility.md](accessibility.md): keyboard through the flow, a screen reader, 200% zoom, reduced motion.

## 5. Run the stories as tests, locally and in CI

| Project | Runner | Setup |
|---|---|---|
| Vite-based framework (`react-vite`, `nextjs-vite`, `vue3-vite`, ...) | Vitest addon | `npx storybook add @storybook/addon-vitest`; needs Vitest 3.0 or newer (and Next.js 14.1+ with `nextjs-vite`). Runs each story in Playwright's Chromium in Vitest browser mode |
| Webpack-based framework | Test runner (Jest + Playwright; superseded by the Vitest addon where Vite is available) | `npm install @storybook/test-runner --save-dev`; needs a running or published Storybook (`--url <address>`) |

```json
{ "scripts": { "test-storybook": "vitest --project=storybook" } }
```

Every story becomes a test: stories without `play` check that they render; stories with `play` also check their assertions; with `a11y.test: "error"` each one runs axe. In CI run `npm run test-storybook`. For the test runner in CI, build first (`build-storybook`), serve the `storybook-static` folder, then run `test-storybook` against it. Report the command you ran and its result; if you couldn't run it, say so.

## 6. Storybook MCP: let Claude read and run the component library

```bash
npx storybook add @storybook/addon-mcp
```

```ts
// .storybook/main.ts (excerpt)
const config = {
  // ...framework, stories, addons
  features: { componentsManifest: true },   // off by default; needed for the docs tools
};
```

With `npm run storybook` running, the server is at `http://localhost:6006/mcp` (the port follows your Storybook config). It exists only while the dev server runs. Add it to Claude Code:

```bash
claude mcp add --transport http storybook http://localhost:6006/mcp --scope project   # writes .mcp.json for the team
```

| Toolset (`options.toolsets` on the addon, all on by default) | Tools | Use for |
|---|---|---|
| `dev` | `stories-changed`, `stories-find-by-component`, `stories-preview`, `get-storybook-story-instructions`, `review-create` | Which stories your edit touched; show a story in chat; Storybook's own story-writing instructions |
| `docs` (needs the components manifest; React frameworks, `angular-vite`, and `vue3-vite` with the `experimentalDocgenServer` feature on) | `docs-list`, `docs-show`, `docs-show-story` | The real component list, props, JSDoc, stories and import paths before writing UI |
| `test` (needs the Vitest addon) | `test-run` | Run chosen stories' tests and read the results |

Working loop: `docs-list` and `docs-show` before using a component (so no invented props), build, then `stories-changed` → `test-run` → `stories-preview` to show the result.

- `review-create` pushes a review of current changes and returns its URL; publishing your Storybook to Chromatic also publishes its MCP server, with the Storybook's visibility. Both put work outside the machine: show what will be shared and wait for a yes.
- Storybook marks its AI features as preview: the API may change and the manifest schema is not a stable public API. Pin the addon version that works.

## Done means

- [ ] Figma values traced to project tokens; anything with no match flagged, not hard-coded
- [ ] One story per reachable state plus worst-case content; real props only
- [ ] `play` functions cover click and keyboard behaviour, querying by role and name
- [ ] `a11y.test: "error"` with WCAG 2.2 AA tags; any disabled rule has a reason; manual checks listed as done or not done
- [ ] Story tests run with the command shown, or the gap stated
- [ ] Nothing published (Code Connect, Chromatic, MCP review) without an explicit yes

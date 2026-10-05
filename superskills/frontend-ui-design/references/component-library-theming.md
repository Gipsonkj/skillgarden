# Theming an existing library: MUI, Ant Design, Bootstrap, Sass

> Written in our own words from the official docs (link-only): Material UI and MUI X (mui.com), Ant Design (ant.design), Bootstrap 5.3 (getbootstrap.com), Sass (sass-lang.com), Claude Code MCP docs. No third-party skill text was copied.

Read this when the project already ships on Material UI, Ant Design, Bootstrap or Sass/SCSS. The design rules in [visual-system.md](visual-system.md), [components-and-states.md](components-and-states.md) and [redesign.md](redesign.md) still decide *what* the UI should look like; this guide is *where* each library wants those decisions written.

## Pick a tool

Every option here is a free, open-source package and none needs an account; only MUI X Data Grid Pro and Premium need a paid licence.

| Need or situation | Use | Why |
|---|---|---|
| The project already uses or pays for one (`package.json`: `@mui/material`, `antd`, `bootstrap`, `sass`, `tailwindcss`; a `components.json`; an MUI X licence) | That one | A redesign keeps the stack; two libraries means two token sets, two focus styles and a bigger bundle |
| New React app that should look like nobody else's, and the team is happy to own component code | shadcn/ui + Tailwind v4 ([react-shadcn-tailwind.md](react-shadcn-tailwind.md)) | Components are copied into the repo as open code, so there is no stock theme to fight |
| New React admin or internal tool that needs many standard widgets fast | MUI (below) | Full component set, one `createTheme` for the brand, Data Grid when tables get large |
| Dense enterprise or data-heavy back office | Ant Design (below) | Built as "enterprise-class UI"; seed tokens plus dark and compact algorithms |
| Own visual design, only the behaviour of dialogs, menus, popovers needed | Base UI (Radix if already installed) | Unstyled, accessible components that take any styling method (CSS Modules, Tailwind, CSS-in-JS) |
| Hard widgets: date and range pickers, comboboxes, drag and drop, table column resizing, many locales | React Aria | Style-free, 50+ components, translations in 30+ languages and 13 calendar systems |
| Server-rendered or non-React site (CMS theme, plain HTML) | Bootstrap 5.3 (below) | Works from plain HTML via its compiled CSS and JS with no build step; Sass when you need the brand in it |
| Plain CSS with a build step, no component library | Sass modules (below), or vanilla CSS custom properties with no build | Tokens and maths at build time, custom properties for runtime themes |
| No stack yet and the brief doesn't settle it | Ask one question: React or not, and own the component code or adopt a ready-made look? | The choice shapes every later file; don't guess |

## The rule for all four

1. **Keep the library.** Restyle through its theme layer; don't migrate to Tailwind or shadcn/ui, and never add a second component library.
2. **Brand lives in one place:** MUI `createTheme`, Ant Design `ConfigProvider theme`, Bootstrap Sass variables set before Bootstrap loads. Not in global CSS that targets the library's class names, not in `!important`, not in one-off inline style literals.
3. **Climb in order:** global tokens, then per-component defaults, then per-component overrides, then (rarely) one instance.
4. **Check the installed major version first** (`package.json`) and read docs for that version. All four change APIs between majors.
5. **Remove the stock look on purpose.** These are the defaults that make an app read as "another MUI / antd / Bootstrap app":

| Library | Defaults to replace deliberately |
|---|---|
| MUI | Roboto, uppercase button labels, the default blue primary, `Paper` elevation 1 shadow on every card and surface, 4 px radius, ripple everywhere |
| Ant Design | `colorPrimary` `#1677ff`, 6 px radius, 32 px control height on every control |
| Bootstrap | default blue `--bs-primary` (rgb 13, 110, 253), 0.375rem radius on everything, `.btn-primary` in every slot |

## Material UI (MUI)

Current docs are v9 (`npm install @mui/material @emotion/react @emotion/styled`; React 17, 18 or 19). Emotion is the default style engine.

**Read current docs from Claude.** Two official routes, no account or key needed:
- **MUI MCP server.** `claude mcp add mui-mcp -- npx -y @mui/mcp@latest` (installs to the project's local scope; add `-s user` for every project). It downloads and runs the `@mui/mcp` package from npm, so look at the package before adding it and ask the user. Tools: `useMuiDocs` fetches the docs for a package, `fetchDocs` fetches further pages, and only URLs that came back in earlier results should be passed to it. Answers quote real docs and link real pages.
- **llms.txt.** `https://mui.com/material-ui/llms.txt` indexes the docs and links Markdown versions of the pages (e.g. `https://mui.com/material-ui/integrations/nextjs.md`).

**One theme, written once.** Put it in a `'use client'` file and pass it to `ThemeProvider` near the root.

```ts
// src/theme.ts
'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },   // --mui-* variables, class on <html>
  colorSchemes: {
    light: { palette: { primary: { main: '#b45309' } } },
    dark:  { palette: { primary: { main: '#fbbf24' } } },
  },
  shape: { borderRadius: 8 },                        // default 4
  typography: {
    fontFamily: 'var(--font-brand)',                 // from next/font, see layout below
    button: { textTransform: 'none' },
    h1: { fontSize: '2rem' },                        // map your type scale per variant
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper:  { defaultProps: { variant: 'outlined' } },   // one depth strategy, not shadows everywhere
  },
});
export default theme;
```

Token facts that matter:
- `palette` keys: `primary`, `secondary`, `error`, `warning`, `info`, `success`, each with `main`, `light`, `dark`, `contrastText`. Give `main` and MUI derives the rest: `light`/`dark` from `tonalOffset` (default 0.2), `contrastText` from `contrastThreshold`.
- **`contrastThreshold` defaults to 3, which targets only 3:1.** For WCAG AA text on coloured buttons set `palette: { contrastThreshold: 4.5 }` (inside each scheme's palette when using `colorSchemes`), or set `contrastText` yourself and check it.
- If both `colorSchemes` and a top-level `palette` are given, `palette` wins. Put colours inside the schemes.
- Spacing unit is 8 px; `typography.fontSize` defaults to 14 (rem-based). There are 13 typography variants (`h1`-`h6`, `subtitle1-2`, `body1-2`, `button`, `caption`, `overline`).
- When a value depends on another, build in two steps: `theme = createTheme(theme, { … })`.
- Extra colours: `theme.palette.augmentColor({ color: { main }, name })`, plus TypeScript augmentation of `Palette` and `PaletteOptions`.
- OKLCH or P3 palette values: set `cssVariables: { nativeColor: true }` (current docs; modern browsers only, uses `color-mix` and relative colour). Check it exists in the installed version.

**Component changes go in `theme.components`, not scattered `sx`.**
- `defaultProps`: change defaults app-wide (`MuiButtonBase: { defaultProps: { disableRipple: true } }`; if you remove the ripple, make sure `:focus-visible` still shows a ring).
- `styleOverrides`: per slot, usually `root`: `MuiButton: { styleOverrides: { root: { fontWeight: 600 } } }`.
- `variants`: styles for prop combinations, or a new variant value (`{ props: { variant: 'dashed' }, style: {…} }`); in TypeScript declare it via `ButtonPropsVariantOverrides` in `declare module '@mui/material/Button'`.
- With CSS variables on, read tokens as `theme.vars.palette.primary.main` in `styled`/`sx`; translucent colours use the channel tokens: `` `rgba(${theme.vars.palette.primary.mainChannel} / 0.12)` ``. TypeScript: `import type {} from '@mui/material/themeCssVarsAugmentation'`.

**Dark mode without a flash (Next.js App Router).**

```tsx
// app/layout.tsx
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'; // use v1X-appRouter for Next.js v1X
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../src/theme';
// const brand = <font from next/font>({ subsets: ['latin'], variable: '--font-brand' });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={brand.variable} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />  {/* before the content */}
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

- Install `@mui/material-nextjs @emotion/cache`. `AppRouterCacheProvider` collects styles on the server so they land in `<head>`; `options={{ enableCssLayer: true }}` wraps MUI in `@layer mui` when Tailwind or CSS Modules sit beside it.
- `InitColorSchemeScript`'s `attribute` must match `colorSchemeSelector`; if `ThemeProvider` has a `defaultMode`, pass the same `defaultMode` to the script. Without `suppressHydrationWarning` on `<html>` React warns, because the script edits that element.
- Fonts: load with `next/font` using `variable: '--font-brand'`, put `brand.variable` on `<html>`, set `typography.fontFamily: 'var(--font-brand)'`.
- Toggle with `useColorScheme()` from `@mui/material/styles`: `mode` is `'light' | 'dark' | 'system'` and **always `undefined` on the first render**, so render a same-size placeholder until it is set (returning `null` shifts layout). `setMode('dark')` switches and persists to localStorage.
- Dark-only styles: `theme.applyStyles('dark', {…})`, never `theme.palette.mode === 'dark' ? … : …`, which is what causes the server/client flicker. In `sx`, pass an array: `sx={[{ bgcolor: '#fff' }, (theme) => theme.applyStyles('dark', { bgcolor: '#000' })]}`.
- `ThemeProvider` props: `disableTransitionOnChange` for an instant switch; `storageManager={null}` turns off persistence (the mode resets on refresh).
- Next.js 16: passing `next/link` straight to `component` can fail with "Functions cannot be passed directly to Client Components"; re-export `Link` from a small `'use client'` file and pass that.

**Tables and states.**
- `Table` maps closely to native `<table>`: give it a caption (screen readers announce it like a heading) and use `component="th" scope="row"` on row headers; `stickyHeader` for long lists; `TablePagination` for paging.
- Large data sets: MUI X `DataGrid`, only if `@mui/x-data-grid` is already installed or the user agrees (Community is MIT; `-pro` and `-premium` need a commercial licence). States are built in: `loading` with `slotProps={{ loadingOverlay: { variant: 'linear-progress', noRowsVariant: 'skeleton' } }}`; custom empty and no-match views through `slots.noRowsOverlay` and `slots.noResultsOverlay`.
- `Skeleton` (`variant` `text` | `circular` | `rectangular` | `rounded`; `animation` pulse by default, `"wave"`, or `false`) carries no ARIA, so mark the loading region `aria-busy="true"` and announce completion yourself. Respect reduced motion with `animation={false}`.
- `Button` has `loading` (shows a spinner and disables) and `loadingPosition` (`start` | `end` | `center`).

**Version gotchas.**
- v7: `Grid` is the former Grid2: widths via `size={{ xs: 12, md: 6 }}`, `offset`, no `item` prop; the old one became `GridLegacy`. `createMuiTheme` and `experimentalStyled` are gone (`createTheme`, `styled`); `Hidden` is gone (`sx` or `useMediaQuery`); deep imports more than one level down no longer resolve. Minimum TypeScript 4.9. Codemods: `v7.0.0/grid-props`, `v7.0.0/input-label-size-normal-medium`, `v7.0.0/lab-removed-components`.
- v9: `GridLegacy` removed; `Grid` no longer takes `direction="column"`. Deprecated `components`/`componentsProps`/`*Props` are gone in favour of `slots`/`slotProps` (on `TextField`: `InputProps` → `slotProps.input`, `inputProps` → `slotProps.htmlInput`; on `Checkbox`, `Radio` and `Switch`: `inputProps` → `slotProps.input`). System props removed from `Box`, `Grid`, `Stack`, `Typography`: use `sx`. Browsers: Chrome 117+, Firefox 121+, Safari 17+.
- No `makeStyles` or `@mui/styles` in new code.

## Ant Design

Current docs are v6 (`npm install antd --save`). Usual home: dense admin and enterprise screens.

**Read current docs from Claude.**
- **MCP server** from the official CLI (`@ant-design/cli`, v6.3.5+): `claude mcp add antd -- npx -y @ant-design/cli mcp` (look at the package first; it runs locally; `--version` pins the antd version it answers for). Tools: `antd_list`, `antd_info` (props), `antd_doc`, `antd_demo`, `antd_token`, `antd_design_md`, `antd_semantic` (DOM parts and styling hooks), `antd_changelog`.
- **llms files:** `https://ant.design/llms.txt` (index), `llms-full.txt` (all component docs), `llms-semantic.md` (DOM structure), `design.md` (the design language for AI tools); any component page with `.md` appended, e.g. `https://ant.design/components/button.md`.

**Theme through `ConfigProvider`.**

```tsx
import { ConfigProvider, theme } from 'antd';

<ConfigProvider
  theme={{
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: { colorPrimary: '#b45309', borderRadius: 8, fontFamily: 'var(--font-brand)', fontSize: 14 },
    components: { Button: { colorPrimary: '#b45309', algorithm: true } },
  }}
>
  <App />
</ConfigProvider>
```

- Three token layers: **seed** (design intent: `colorPrimary`, `borderRadius`, `fontSize`, `fontFamily`, `controlHeight`), **map** (derived from seeds), **alias** (per-purpose). Change seeds first; the algorithm derives the rest.
- Defaults: `colorPrimary` `#1677ff`, `borderRadius` 6, `fontSize` 14, `controlHeight` 32 (LG 40, SM 24, XS 16).
- Algorithms: `defaultAlgorithm`, `darkAlgorithm`, `compactAlgorithm`; combine as an array (`[darkAlgorithm, compactAlgorithm]`). Switching `algorithm` at runtime re-themes everything.
- Per-component tokens under `components`; `algorithm: true` there makes the component re-derive from its own seeds.
- Nested `ConfigProvider`s inherit unchanged tokens from the parent; use one to theme a region.
- Read tokens in components with `theme.useToken()`, or `getDesignToken()` outside React.
- `cssVar` emits CSS variables (prefix `ant` by default); `zeroRuntime` (v6+) skips runtime style generation and needs `import 'antd/dist/antd.css'`.
- Next.js App Router: install `@ant-design/nextjs-registry` and wrap `{children}` in `<AntdRegistry>` inside `<body>` of `app/layout.tsx`. Dot sub-components (`<Select.Option />`, `<Typography.Text />`) don't work from Server Components; import them from their full path or use them in a client component.
- Ant Design's theme docs give no no-flash dark-mode recipe: `algorithm` is a `ConfigProvider` prop you set from your own state. Test a hard refresh with dark stored and say so if you couldn't.

## Bootstrap 5.3

Current is 5.3.x. Two layers: compiled CSS variables (runtime, no build) and Sass variables (build time, the right place for a brand).

**Sass: overrides go between `functions` and `variables`.** Every Bootstrap variable is `!default`, so a value set earlier wins.

```scss
// scss/custom.scss: import only what you use
@import "bootstrap/scss/functions";

// 1. Variable overrides
$primary: #b45309;
$border-radius: .5rem;
$font-family-sans-serif: "Brand Sans", system-ui, sans-serif;
$enable-shadows: false;

@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";
// 2. Map overrides here (e.g. $theme-colors)
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/root";
// 3. Only the parts you use
@import "bootstrap/scss/reboot";
@import "bootstrap/scss/type";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/utilities";
@import "bootstrap/scss/utilities/api";   // last, generates the utility classes
// 4. Your own rules after this line
```

- Add a theme colour with `$theme-colors: map-merge($theme-colors, ("brand": #b45309));`; remove with `map-remove($theme-colors, "info", "light", "dark")` (after `variables`, before `maps`). A new theme colour also needs entries in `$theme-colors-text`, `$theme-colors-bg-subtle` and their `-dark` twins, or it looks wrong in one mode.
- Global switches, set before `variables`: `$enable-shadows` (false by default; focus shadows are unaffected), `$enable-gradients` (false), `$enable-rounded` (true), `$enable-transitions` (true), `$enable-reduced-motion` (true: keep it), `$enable-dark-mode` (true), `$enable-negative-margins` (false), `$enable-important-utilities` (true).
- Compile with Dart Sass: `sass --load-path=node_modules --style=compressed scss/custom.scss css/custom.css` (`--watch` while working). Bootstrap 5.3 still uses `@import`, so current Dart Sass prints deprecation warnings; they don't stop the build. `--quiet-deps` hides them for files reached through a load path, while still warning about your own code.

**CSS variables** (prefix `--bs-`, set by `$prefix`): root ones such as `--bs-primary`, `--bs-primary-rgb`, `--bs-body-font-family`, `--bs-border-radius` (0.375rem), `--bs-box-shadow`; component ones such as `--bs-btn-bg`, which you can override on one selector without recompiling. They can't be used inside media queries.

**Colour modes.**
- `data-bs-theme="dark"` on `<html>` switches the page; on an element it scopes that subtree (`<div class="dropdown" data-bs-theme="light">`).
- `$color-mode-type: data` (default) or `media-query` (follows `prefers-color-scheme`, no toggle). Dark values live in `_variables-dark.scss` with `-dark` names (`$body-bg-dark`, `$link-color-dark`); a custom mode is a `[data-bs-theme="name"]` block that resets `--bs-*` variables.
- No flash: a small inline script at the top of the page reads the stored choice (falling back to `prefers-color-scheme`) and sets `data-bs-theme` on `<html>` before the body renders; Bootstrap's docs advise putting that script at the top of the page to reduce flicker.

## Sass / SCSS

Dart Sass is the primary implementation of Sass (new features land there first): LibSass reached end of life in October 2025, and its wrappers (node-sass) with it. Use the npm `sass` package, or `sass-embedded` for faster builds. A `node-sass` dependency in a redesign is a migration item to flag, not to fix silently.

**Modules, not `@import`.** `@import` and global built-in functions are deprecated since Dart Sass 1.80.0 and will be removed in Dart Sass 3.0.0 (no sooner than two years after 1.80.0).

```scss
// _tokens.scss
$accent: #b45309 !default;
$radius: 8px !default;
$-internal: 2px;                    // leading - or _ = private to this file

// app.scss
@use "sass:color";
@use "tokens" with ($accent: #92400e);   // configure !default vars on first load only

:root {
  --accent: #{tokens.$accent};           // custom properties need #{} to get the value
  --accent-hover: #{color.scale(tokens.$accent, $lightness: -12%)};
  --radius: #{tokens.$radius};
}
```

- `@use` must come before other rules (except `@forward`); a module is loaded and configured once. Namespace is the file name (`tokens.$accent`), `as t` renames, `as *` drops it.
- Without `#{}`, a custom property keeps the literal text (`--x: $accent` ships as `$accent`).
- Emit Sass tokens as CSS custom properties, as above, so dark mode and runtime theming can swap them; keep Sass for build-time maths and loops.
- Colour: `@use "sass:color"`. Prefer `color.scale()` (relative change) to `darken()`/`lighten()`; `color.adjust()` takes an explicit `$space`; `color.mix(a, b, $method: oklch)` mixes in OKLCH; `color.to-space()` converts.
- Packages: `@use "pkg:some-lib"` with `--pkg-importer=node` (Dart Sass 1.71.0+) resolves through `package.json`.
- Migrating old `@import` code: Sass's official migrator, `sass-migrator module --migrate-deps entry.scss`, on a clean git tree, then review the diff and rebuild. Until then, silence knowingly with `--silence-deprecation=import` and `--silence-deprecation=global-builtin`, or `silenceDeprecations` in the JS API; `--fatal-deprecation` makes CI fail on them.
- CLI: `sass in.scss out.css`, many-to-many `sass src/:dist/` (partials starting with `_` are skipped), `--watch`, `--style=compressed`, `--no-source-map`, `-I`/`--load-path`.

## Done means (on top of the main list)

- [ ] Brand values live in the library's theme layer; no global overrides of `.Mui*` / `.ant-*` / `.btn` classes and no `!important` added
- [ ] The stock tells in the table above were changed on purpose, one accent kept
- [ ] Both colour schemes checked for 4.5:1 text and 3:1 UI contrast (MUI: `contrastThreshold` or explicit `contrastText`)
- [ ] First load in dark mode shows no light flash (hard refresh with dark stored)
- [ ] APIs match the installed major version; no package added without the user's OK

# Design tokens and Figma variables

> Distilled from: design-system-patterns and its references (wshobson/agents, MIT); figma-export-tokens and figma-import-tokens, incl. the variable-ops notes (southleft/figma-console-mcp-skills, MIT); token-sync-layer (jrpease/throughline, MIT); create-color and the structure-spec reference (redongreen/uSpec, MIT); design-system (anthropics/knowledge-work-plugins, Apache-2.0). Plus general knowledge of the W3C DTCG format and Style Dictionary.

## 1. Three tiers

| Tier | Holds | Example name | Who uses it |
|---|---|---|---|
| Primitive (global) | Raw values: ramps, scales | `color/blue/500`, `space/4` | Only semantic tokens |
| Semantic (alias) | Meaning, one per job | `color/text/primary`, `color/bg/danger`, `space/inset/md` | Components and screens |
| Component (optional) | A knob one component needs | `button/primary/bg`, `input/border/focus` | That component only |

Rules:
- UI never references a primitive directly. If a designer picks `blue/500` for a button, the fix is a semantic token, not a comment.
- Add a component token only when a component must differ from the semantic default or needs its own theming hook. Most systems need few.
- Semantic names say purpose, never colour: `danger`, not `red`; `text/muted`, not `gray-600`.
- Themes (light/dark, brands, density) switch **semantic** values; primitives stay fixed (brand ramps can be a mode on the primitive tier when each brand has its own palette).

## 2. Naming

Grammar: `category / property / variant / state`, e.g. `color/border/input/focus`, `space/stack/lg`, `radius/control`.

| Rule | Detail |
|---|---|
| One separator style per surface | Figma groups with `/`; CSS slug with `-` (`--color-border-input-focus`); JS camel or nested objects |
| Scale steps | Numeric for ramps (`50...950`, `space/1...12`), t-shirt for semantic (`sm/md/lg`) |
| State suffixes | `hover`, `pressed`, `focus`, `disabled`, `selected`; always last |
| No duplicates | Two tokens with the same value and same meaning are one token |
| Declare code names | Set each Figma variable's **code syntax** (WEB `--color-text-primary`, plus ANDROID/iOS if used) so design-to-code reads the real name instead of guessing |
| Renames are breaking | Treat a rename like an API change (see [token-sync-and-drift.md](token-sync-and-drift.md)) |

## 3. Figma variables in practice

**Types:** COLOR, FLOAT (number), STRING, BOOLEAN. Typography, shadows and gradients are composite, so they stay as **styles** (text, effect, paint) whose fields are bound to variables (font size, line height, colour).

**Collections and modes.** A sensible default layout:

| Collection | Modes | Contents |
|---|---|---|
| `Primitives` (hidden from publishing) | 1, or one per brand | Colour ramps, raw sizes |
| `Color` (semantic) | Light, Dark (+ High contrast) | Text, background, border, icon, status |
| `Spacing` / `Size` | 1, or Compact / Default / Comfortable | Insets, gaps, control heights |
| `Radius`, `Typography`, `Motion` | 1 | Scales |

- Mode count per collection is plan-limited; check before promising a 4-brand x 2-theme matrix. A plan-limited workaround is paired collections (`Color/Light/*`, `Color/Dark/*`), which code must treat as modes.
- **Scopes:** set them. New variables default to all scopes and then appear in every picker. Colour text tokens -> `TEXT_FILL`; surfaces -> `FRAME_FILL`, `SHAPE_FILL`; borders -> `STROKE_COLOR`; spacing -> `GAP` (Figma's auto-layout spacing scope); radius -> `CORNER_RADIUS`; sizes -> `WIDTH_HEIGHT`; type -> `FONT_SIZE`, `LINE_HEIGHT`, `LETTER_SPACING`.
- Hide primitives from publishing so library users pick semantic tokens.
- **Aliases** may point across collections. When importing, create literal values first and aliases second, or the target won't exist yet.
- **Opacity trap:** a FLOAT bound to a layer's opacity is stored 0-100 in Figma; CSS, Tailwind and native alpha use 0-1. Divide by 100 once, at export.
- **Float noise:** Figma stores FLOATs as 32-bit; `0.3` comes back as `0.30000001192092896`. Round at the export boundary (`Math.round(v * 100) / 100`), never by editing output.
- A component-specific collection with modes (e.g. `Tag colour`: Neutral, Success, Warning) is a valid way to model colour variants; document it as an API property, not a hidden mode.

## 4. DTCG files (the exchange format)

The W3C Design Tokens Community Group format is the neutral format between Figma, Style Dictionary, Tokens Studio and code.

```json
{
  "color": {
    "blue": { "500": { "$type": "color", "$value": "#2D6CDF" } },
    "text": {
      "primary": { "$type": "color", "$value": "{color.gray.900}", "$description": "Body and headings" }
    }
  },
  "space": { "4": { "$type": "dimension", "$value": "16px" } }
}
```

- Leaf = object with `$value`; `$type` may sit on a group and is inherited. Aliases are `{group.token}`.
- Common types: `color`, `dimension`, `number`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`; composites `typography`, `shadow`, `border`, `gradient`, `transition`.
- The stable spec (2025.10) writes colours and dimensions as objects (`{ "colorSpace": "srgb", "components": [...] }`, `{ "value": 16, "unit": "px" }`); many tools still read or write the older string form. Check what your consumer accepts before switching.
- Keep Figma identity for round trips in `$extensions` (variable id, key) so a re-import updates instead of duplicating.
- The base format has no modes. Use **one file per mode** (`semantic.light.json`, `semantic.dark.json`, primitives once). Nesting modes as groups in one file breaks per-mode builds and contrast checks.
- Mark retirements with `$deprecated: "Use color.text.primary"` and keep the old token until the next major version.
- Sort keys for stable diffs.

## 5. From tokens to code

| Target | Output | Notes |
|---|---|---|
| CSS | `:root { --color-text-primary: ... }` plus `[data-theme="dark"]` or `.dark` blocks | Keep semantic -> primitive as `var()` references so themes switch at runtime |
| Tailwind v4 | `@theme { --color-...: ...; --spacing-...: ... }` plus mode override blocks | Map FLOAT spacing to rem (divide by 16) only if the project uses rem |
| Tailwind v3 | `theme.extend` object | Single mode; aliases resolved |
| iOS / Android | Swift / Kotlin / XML constants | Flatten references (`outputReferences: false`); one build per mode; check units (pt/dp), a px-to-rem transform must never run here |
| JS/TS | Nested object, per-mode values | `as const` for types |

Style Dictionary (v4+) reads DTCG directly. Web platforms: `outputReferences: true`. Build **once per mode** with that mode's sources; a single glob over all modes silently keeps whichever file sorted last. Tokens Studio is the Figma-plugin alternative when the team stores tokens as JSON in git.

For a Figma-first pipeline use the bundled scripts: `scripts/figma-export-tokens/read-variables.js` (run through `use_figma`) then `node scripts/figma-export-tokens/convert-tokens.mjs variables.json --format dtcg --out tokens/` (formats: `dtcg`, `css-vars`, `tailwind-v4`, `tailwind-v3`, `scss`, `ts-module`, `json-flat`, `json-nested`, `style-dictionary-v3`, `tokens-studio`). It handles modes, aliases, units and weight names and warns on slug collisions; don't hand-convert.

## 6. Accessibility and theming in tokens

- Check every text/background semantic pair in **every** mode: 4.5:1 for body text, 3:1 for large text (24 px, or 18.66 px bold) and for UI parts and focus rings.
- Provide `prefers-reduced-motion` overrides for motion tokens (durations to 0 or near 0) and a high-contrast mode if the product needs one; `forced-colors` needs system colours, not tokens.
- Status colours always pair with an icon or text token; never let colour be the only signal.

## 7. Governance

- Version tokens like an API: add = minor, value tweak = patch (announce), rename or delete = major with a deprecation period.
- Every change: propose with reason, review by design and engineering, check contrast and all platforms, announce, deprecate, remove later.
- Keep a short token doc per category: purpose, do/don't, and the code name.

## 8. Pitfalls

- Token sprawl: hundreds of near-duplicates nobody can choose between. Merge by meaning.
- Mixed naming (`textPrimary`, `text-primary`, `Text/Primary`) across surfaces without a declared mapping.
- Circular aliases, and aliases into deleted variables.
- Dark mode added by duplicating components instead of adding a mode.
- Hand-edited generated files: the next sync overwrites them.

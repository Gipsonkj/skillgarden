# Visual system: type, colour, spacing, depth, theming

> Distilled from: impeccable (pbakaus/impeccable, Apache-2.0), interface-design (dammyjay93/interface-design, MIT), ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill, MIT), hallmark (nutlope/hallmark, MIT), design-taste-frontend (leonxlnx/taste-skill, MIT), frontend-design (anthropics/skills, Apache-2.0), tailwind-design-system (wshobson/agents, MIT)

Every colour, font and spacing value on the page should trace to a named token. A system that can be read from the token names alone (`--ink`, `--parchment`, `--accent`) beats one full of `gray-700` literals.

## Typography

### Choosing faces
- One family is often enough, especially for product UI. Two at most for content pages, and if two, make them clearly different. A third face only for one narrow job (a wordmark or a hero number), used in at most two places.
- Choose from the subject, with a one-line reason. Don't reach for the same family on every project. Inter, Geist, Roboto are fine in product UI or when asked for; not as an unexamined display choice.
- Serif display is a decision for editorial, heritage or publication briefs, not a shortcut to "premium".
- Load only the weights you use. Self-host or use the framework's font loader (`next/font`), with `font-display: swap` and metric-compatible fallbacks.

### Scale and roles
| Surface | Body | Ratio | Notes |
|---|---|---|---|
| Product UI | 14-16 px | 1.125-1.2 | Fixed rem scale, not fluid |
| Marketing / editorial | 16-18 px | 1.25-1.333 | Display may use `clamp()` |
| Mobile body | 16 px minimum | | Prevents iOS input zoom |

- Weight and colour do more hierarchy work than size. Three tiers at one size: value 600/primary, label 500/secondary, meta 400/muted.
- Four text levels: primary, secondary, tertiary, muted. Two is too flat.
- Body line height 1.5-1.7; display 1.0-1.15 (leave 1.1+ when italic descenders or all-caps wrap).
- Measure 45-75 characters (`max-width: 65ch` is a good default).
- Tighten tracking slightly on large display type (down to about -0.04em); never on body text.
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- `font-variant-numeric: tabular-nums` on prices, tables, timers, counters.
- Light text on dark surfaces: a touch more line height and weight.

### Hero headline sizing
- Write short headlines (≤ 7 words, ≤ 50 characters) when you are writing the copy.
- Headline ≤ 2 lines on desktop; supporting text ≤ 20 words; CTA visible without scrolling.
- If a headline wraps to 4 lines, lower the size; don't blame the copy.
- Display max about 6rem; hero top padding not more than ~6rem on desktop.

## Colour

### Build roles, not swatches
- canvas, surface, elevated surface
- ink (primary text), secondary text, muted text
- accent (primary action, focus, selection) and `accent-ink` (text on accent)
- border / separator
- success, warning, error, info
- data categories if charts exist

Use OKLCH for new palettes: lightness and chroma move predictably. Reduce chroma near white and black.

### Rules
- One accent per page, used for the primary action, selection and focus. Around 60/30/10: dominant neutral, secondary tone, small accent.
- Saturation of accents under about 80%. Tint neutrals slightly toward the brand hue when it helps cohesion; never mix warm and cool greys.
- On coloured surfaces, derive secondary text from that surface's hue; don't use generic grey.
- Shadows tinted toward the background hue, never pure black on light surfaces.
- Semantic colours stay consistent (error is always the same red) and never carry meaning alone: add an icon, text or shape.
- Status and data colours must work for colour-blind users (avoid red/green-only pairs).

### Contrast minimums (WCAG 2.2 AA)
| Content | Ratio |
|---|---|
| Body text, placeholders, helper and error text | 4.5:1 |
| Large text (≥ 24 px, or ≥ 18.66 px bold) | 3:1 |
| Icons, control borders, focus indicators, chart marks | 3:1 |

Check computed pairs, including text on images, disabled states, overlays and both themes. Quick OKLCH pre-check: if text and background lightness differ by less than 50 points, it probably fails; calculate to be sure.

## Spacing and layout

- A 4 px base scale (4, 8, 12, 16, 24, 32, 48, 64, 96). Name tokens by role (`--space-sm`, `--space-section`).
- Group by proximity before adding boxes. Tight inside groups, generous between groups, more space above a heading than below it.
- Vary rhythm on purpose: dense control zones, open content zones. Uniform padding everywhere flattens hierarchy.
- Contain content: max-width around 1200-1440 px with auto margins; prose narrower.
- CSS Grid for multi-column layouts (`grid-template-columns: repeat(3, minmax(0, 1fr))`), `gap` for sibling spacing, not percentage maths or `space-y` hacks.
- Image tracks use `minmax(0, 1fr)`; text columns in flex need `min-width: 0`.
- Full-height sections use `min-height: 100dvh`, not `100vh`.
- Squint test: blur your eyes. You should still see the primary element, the secondary element and the groups, in that order.
- Proportions speak: a 280 px sidebar says "navigation serves content"; 360 px says "peers".

### Breakpoints
Use the project's system; otherwise 640 / 768 / 1024 / 1280 / 1536. Design mobile-first and declare the narrow-screen fallback for every multi-column section in the same component.

## Depth, radius, borders

- Choose one depth strategy per product: borders only (dense tools), subtle shadows (approachable), layered shadows (premium), or tonal surface shifts.
- Elevation scale is small: page < card < dropdown < modal, each a few lightness points apart. Dropdowns sit one level above their parent.
- Inputs slightly darker than their surroundings (they are "inset").
- Borders should disappear until you look for them: low-alpha, not solid grey.
- Radius is a scale (inputs/buttons small, cards medium, modals large). Nested radius: outer = inner + padding.
- A z-index scale (for example 0 / 10 / 20 / 40 / 100 / 1000); no `z-[9999]`.
- Cards only when elevation means something; otherwise group with spacing or a single divider.

## Dark mode and theming

- Define semantic tokens once; themes remap them. Don't sprinkle `dark:` overrides on every element when the project uses CSS variables.
- Dark is not inverted light: use lighter, slightly desaturated tonal variants; shadows are weak in dark, lean on borders and surface steps.
- Keep one hue across dark surfaces and only move lightness.
- No pure `#000` or `#fff` as page surfaces in either theme.
- Test both themes: contrast, dividers, focus rings, logos, images with transparency.
- Avoid a flash of the wrong theme on load (set the theme class before paint, or use a library such as next-themes).

## Browser surfaces people forget
Theme these from the palette: text selection (`::selection`), caret colour, scrollbars where styled, focus rings, link underline offset, `accent-color` for native checkboxes and radios, and `color-scheme` so native controls match the theme.

## Token block example (CSS)

```css
:root {
  --canvas: oklch(98.5% 0.004 95);
  --surface: oklch(96.5% 0.006 95);
  --ink: oklch(22% 0.01 250);
  --ink-2: oklch(42% 0.01 250);
  --muted: oklch(55% 0.01 250);
  --border: oklch(22% 0.01 250 / 0.12);
  --accent: oklch(48% 0.12 160);
  --accent-ink: oklch(98% 0.01 160);
  --danger: oklch(52% 0.19 27);
  --font-body: "Söhne", ui-sans-serif, system-ui, sans-serif;
  --text-sm: 0.875rem; --text-base: 1.0625rem; --text-lg: 1.25rem; --text-2xl: 1.953rem;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px; --space-8: 32px; --space-12: 48px;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}
[data-theme="dark"] {
  --canvas: oklch(18% 0.008 250); --surface: oklch(22% 0.008 250);
  --ink: oklch(95% 0.005 250); --ink-2: oklch(78% 0.008 250); --muted: oklch(66% 0.008 250);
  --border: oklch(95% 0.005 250 / 0.12);
  --accent: oklch(72% 0.12 160); --accent-ink: oklch(18% 0.02 160);
}
```

For Tailwind v4 and shadcn token wiring, see [react-shadcn-tailwind.md](react-shadcn-tailwind.md).

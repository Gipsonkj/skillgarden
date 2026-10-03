# Brand kits, guidelines, themes and identity boards

> Distilled from: brand-guidelines and theme-factory (anthropics/skills, Apache-2.0), higgsfield-brandkit (higgsfield-ai/skills, MIT), brandkit (Leonxlnx/taste-skill, MIT), design/CIP (nextlevelbuilder/ui-ux-pro-max-skill, MIT), visual-design-foundations (wshobson/agents, MIT), logo-design (kaankiziltug/logo-design-skill, MIT).

Use when the user wants a brand kit, visual identity, style guide, theme for slides/docs/pages, brand board, corporate identity mockups, or wants existing brand rules applied to graphics.

## 1. Classify the request

| Request | Mode | Do |
|---|---|---|
| "Use our brand on this poster/deck" | apply-existing | Lock supplied logo, colours, fonts as fixed. Change nothing about them. |
| "We have a logo, need colours/fonts/templates" | extend-partial | Create only the missing pieces the output needs |
| "Create a brand / identity" | create-identity | Full sequence below |
| "Style this artifact with a theme" | theme | Pick or create a theme (section 6) |

Never invent positioning, values, claims, prices, certifications or statistics. Preserve the user's exact copy.

## 2. Strategy before visuals (create-identity)

Write privately, briefly:
- **Product truth**: what is materially or functionally real.
- **Audience desire**: what they want to feel or signal.
- **Positioning / values** (only from the user).
- **Name cues**: meaning, sound, initials, useful letter shapes.
- **Visual axes** (0–100, default 50): restrained↔expressive, geometric↔organic, familiar↔experimental.
- **Central mechanism**: one visual idea that can generate the palette, mark, type relationship and applications.
- **Forbidden clichés** for the category.

Anti-slop rules: leaves ≠ organic, sparkles ≠ premium, shields ≠ trust, random gradients ≠ modern, globes/orbits without product meaning, unconstructed initials, gold + serif as automatic luxury, several metaphors in one mark.

**One expressive move per direction**: expressive mark → quiet palette and type; expressive palette → simple mark and layout; expressive type → minimal graphics.

## 3. Sequence and approvals

Work in this order and get a clear yes at each step (silence or your own preference is not approval):

1. **Palette**: 2–3 options, each 3–6 named colours with hex and roles (background, text, primary, accent, support), a contrast-safe text/background pair, a one-line rationale, and 2–3 logo-mechanism seeds the palette could support. Options must differ in strategy, not just hue.
2. **Logo**: three different mark routes (letter-derived, meaning-derived, abstract). See the logos guide.
3. **Typography**: 2–3 display/body pairs, each a unique combination, real families (Google Fonts or supplied files), rendered as a specimen with the approved palette. Max two families; one family with weight contrast is valid. Never let an image model fake the specimen.
4. **Applications**: only the ones requested.

When one approved element changes, redo only its dependents: palette → logo (if generated with that palette) and type check; type → lockups, templates, decks; logo → typography check.

## 4. The Brand Lock

Single source of truth for every asset. Keep it as JSON or a short block and paste the relevant part into every generation prompt verbatim.

```text
[BRAND LOCK — DO NOT DEVIATE]
Brand spelling: Harbor & Co.
Logo: image 1 = official logo, preserve exact geometry, colours, letterforms
Palette: #0F2A3D background/text-dark · #F4EFE6 light · #E2583E primary accent · #8FB8C9 support
Typography: Fraunces 700 display · Inter 400/600 body
Layout: 12-col grid, 6% outer margin, left-aligned
Shape language: 8 px radius, no shadows, 2 px rules
Graphic device: tide-line wave rule under headlines
Never: gradients, stock photos of handshakes, more than one accent per layout
```

Field states: `fixed` (supplied/approved), `proposed`, `not_applicable`, `unknown` (do not invent). Per-format overrides go under applications (e.g. "poster uses display face at extreme scale", "kraft paper mockup uses black logo", "emboss/foil/engrave uses one-colour mark") and must not contradict fixed rules.

## 5. Brand guidelines document

Compact guidelines beat a 60-page book. Template: `templates/logo-design/brand-guidelines-template.md`. Cover:
- Logo: versions (full colour, one-colour black, white reversed), lockups, **clear space** (defined by a logo element, e.g. the height of the "H"), **minimum size** (px for screen, mm for print), misuse examples.
- Colour: HEX, RGB, CMYK, Pantone for each; usage ratio (e.g. 60/30/10); approved text/background pairs with contrast ratio.
- Typography: families, weights, fallbacks (e.g. Poppins → Arial, Lora → Georgia), hierarchy sizes, licence note.
- Imagery and graphic devices; voice (only if supplied).
- Example applications.

Applying a brand to an artifact (the brand-guidelines pattern): headings ≥ 24 pt in the display face, body in the text face, fallbacks when fonts are missing, non-text shapes cycle through the accent colours, text colour chosen for contrast against each background.

## 6. Themes for slides, docs and pages

A theme = 4-ish colours with roles + a heading/body font pair + "best used for". Ten ready-made themes are in `templates/theme-factory/themes/` (ocean-depths, sunset-boulevard, forest-canopy, modern-minimalist, golden-hour, arctic-frost, desert-rose, tech-innovation, botanical-garden, midnight-galaxy).

Workflow: show the options (name + palette swatches + font pair), let the user pick, read the theme file, apply colours and fonts consistently, check contrast. If none fits, create a new theme in the same format, give it a descriptive name, show it for approval, then apply.

Implement as tokens, not hard-coded values:
```css
:root{
  --color-bg:#F4EFE6; --color-text:#0F2A3D; --color-primary:#E2583E; --color-support:#8FB8C9;
  --font-display:"Fraunces",Georgia,serif; --font-body:"Inter",Arial,sans-serif;
  --space-1:4px; --space-2:8px; --space-4:16px; --space-8:32px; --radius:8px;
}
```
Two tiers: primitive colours → semantic tokens (bg, text, accent, border). Name by purpose, not appearance.

## 7. Brand board (one-image overview)

Default 3×3 grid on a dark or light canvas, strong even gutters, minimal text, every panel connected:
1. Logo cover · 2. Logo construction/geometry · 3. Digital application (browser bar, app icon, terminal) · 4. Brand essence (one short tagline, large) · 5. Colour system (swatches with hex) · 6. Typography specimen · 7. Physical application (card, label, packaging) · 8. Image direction (art-directed photo/texture) · 9. System detail (icon row, chips, pattern).

Alternatives: 2×3 deck overview, 2×2 concept board, 1×3 strip. Give panels rhythm: quiet, functional, emotional, technical, atmospheric. Repeat the same logo and accents across panels. Text: brand name, one tagline, 2–5 labels, no fake body copy.

Build the board in HTML/SVG with the real logo and fonts when exactness matters; use an image model only for atmosphere panels or for loose concept boards (and say they are concepts).

## 8. Corporate identity (CIP) deliverables

Categories to offer (only build what's asked): stationery (business card 85×55 mm or 3.5×2 in, letterhead A4/Letter, envelope DL, folder), ID badge/lanyard, signage and wayfinding, apparel, promotional items (tote, mug, bottle), vehicle livery, digital (social templates, email signature, slide master), packaging and labels, events (booth, roll-up, backdrop).

Mockups: put the exact approved logo on a blank surface (compositing beats generation for fidelity); correct colour variant per material (black on kraft, white on dark, one-colour for emboss/foil). Reject generic marble-pedestal scenes, fake copy, excessive bloom, floating objects.

## 9. Set-level QA

Review every asset together:

| Asset | Logo | Palette | Type | Grid/spacing | Shape/device | Format | Status |
|---|---|---|---|---|---|---|---|

Pass only when all follow the same Brand Lock. Fix with the smallest deterministic correction first (re-typeset copy, re-place logo, correct a colour token) before regenerating. Do not accept a vision model's claim as proof of an exact hex, font or radius; check the source file.

Delivery manifest: Brand Lock version, concept, editable files, previews, required fonts (with licence caveats: PPTX references fonts but does not embed them reliably; outlined SVG text is no longer editable), known limitations, stable file names (`brand-poster-a2-v1.svg`).

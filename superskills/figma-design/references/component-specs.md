# Component specs and documentation

> Distilled from: create-component-md, create-anatomy, create-api, create-color and the repo's API library and structure/colour/anatomy agent references (redongreen/uSpec, MIT); design-system document and extend modes (anthropics/knowledge-work-plugins, Apache-2.0); figma-generate-component-doc data model (southleft/figma-console-mcp-skills, MIT).

A component spec tells an engineer on any platform what to build without opening Figma. It has six parts: **Overview, API, Anatomy, Structure, Colour, Voice** (screen reader, see [accessibility-specs.md](accessibility-specs.md)), plus Motion when the component animates, and a short **Known gaps** list.

## 0. Tooling choice

| Situation | Do this |
|---|---|
| Team wants specs rendered as annotated frames in Figma | Install uSpec (`redongreen/uSpec`): run its `firstrun` skill once to link the template library and write `uspecs.config.json`, then `create-component-md` (needs the `_base.json` from its Extract plugin), then `create-anatomy`, `create-api`, `create-color`, `create-voice` render from that `.md`. Its skills render; they don't re-extract. |
| Spec as a Markdown file in the repo or docs site | Write `docs/components/<name>.md` by hand with the rules below |
| Quick docs page for a design-system site | Use the docs page template in section 7 |

## 1. Gather the evidence

1. The **component set** node (not one variant). Note its variant axes (`Size`, `Hierarchy`, `State`...) and component properties: VARIANT, BOOLEAN, TEXT, INSTANCE_SWAP, and slots.
2. **Variable collections with modes** that affect it (density, shape, a colour collection such as `Tag colour`). These are invisible in the variant panel.
3. Bound variables and styles per layer (fills, strokes, padding, gap, radius, text style).
4. Nested instances: which are fixed sub-components, which are swappable or slot content.
5. Any code that already exists for it (props, ARIA).

Where Figma and the user's description disagree, the description wins; note the disagreement under Known gaps.

## 2. API: engineer names, not Figma names

Design the API an engineer would write without having seen Figma; use Figma as evidence. Test: if a prop name only makes sense to someone who opened the file, rename it.

| Rule | Example |
|---|---|
| camelCase, platform-neutral, no component prefix | `Button label` -> `label`, not `buttonLabel` |
| `is*` = persistent state, `has*` = fixed capability, `show*` = a single visibility toggle | `isDisabled`, `hasDivider`, `showBadge` |
| Enums and slots are nouns; the off value is `none` | `trailingContent: none / icon / button / text` |
| Boolean + type pair -> one enum | Figma `Leading artwork: true` + `Type: Icon` -> `leadingArtwork: icon` |
| Transient states are not props | Hover, pressed, focused belong to the runtime |
| Split a mixed `State` axis | `State = Enabled / Hover / Disabled / Error` -> drop hover, keep `isDisabled`, `isInvalid`; record which Figma option maps to which prop values |
| Numbered slots -> an array | `tab1...tab8` -> `items[]` with min/max in notes |
| Promote child props that change the parent's contract | Text field: `isInvalid`, `errorMessage`, `maxLength`, `showCharacterCount` live on the field, not on the hint sub-component |
| Generic Figma names get real ones | `Type` -> `variant` (keep `type` for HTML type), `Asset` -> `icon`/`image`, `Content` -> `trailingContent` |
| Event handlers stay out of the spec | `onPress`, `onChange` are code details |
| Mode-controlled properties are props too | Density collection -> `density: compact / default / comfortable` |

Shared booleans with their ARIA pairing: `isDisabled` (`aria-disabled`), `isSelected` (`aria-selected` / `aria-pressed`), `isRequired`, `isInvalid`, `isReadOnly`, `isLoading` (`aria-busy`), `isExpanded`.

API table columns: `Property | Type | Values | Default | Notes`. Nest related rows (`validation` -> `isInvalid`, `errorMessage`). Add 2-4 **configuration examples** (the common case, the richest case, an edge case) as prop sets.

## 3. Anatomy

Number every visible part in reading order and give each one row: `# | Element | Type | Notes`.

Notes say what the part is and what controls it:
- Fixed sub-component: "Label sub-component - always present".
- Optional: "Icon sub-component - hidden by default, shown by `leadingIcon`".
- Swappable: "Avatar - swappable via `leadingContent`".
- Slot: "Actions slot - accepts Button items; default: one secondary Button".
- Text: quote short content: `"Save" - primary label`.
- Repeated items: one row with `(x4)`, not four rows.
- Root container: describe its layout, fill and radius in one note ("Root - horizontal auto layout, filled surface, 8 px radius").

Never write generic notes ("Frame with 3 children", "RECTANGLE").

## 4. Structure (dimensions and spacing)

| Row | Value format |
|---|---|
| `height`, `minWidth`, `maxWidth` | `40` or `size/control/md (40)` |
| `paddingStart`, `paddingEnd`, `paddingTop`, `paddingBottom` | Logical directions so RTL works; collapse to `horizontalPadding` / `padding` when equal |
| `gap` / `itemSpacing` | Token name and resolved value: `space/2 (8)` |
| `cornerRadius` | Uniform or per-corner (`topStart`...) |
| `borderWidth` | Only if a stroke is actually painted |
| `iconSize`, `leadingIcon` | Component set name (`chevron-down`), not the variant string |
| `textStyle` | Style name (`Body/M Medium`), or size/weight/line height if no style |
| Sizing | `hug`, `fill` or a fixed number |

- **Columns vs sections:** sizes and density modes that only change numbers become columns (`Small | Medium | Large`). Configurations that add or remove parts (with/without trailing content) become separate sections.
- Bound value: `token (resolved)`. Hardcoded value: the number alone, and list it under Known gaps.
- With 2+ text elements add a typography table: `Element | Family | Weight | Size | Line height | Letter spacing | Style | Notes` (truncation, wrapping).

## 5. Colour annotation

| Rule | Detail |
|---|---|
| One section per state (Enabled, Hover, Pressed, Disabled, Focus, Error) | Each with `Element | Token | Notes` |
| Visual variants multiply sections | `Primary / Hover`, `Danger / Hover` |
| Skip colour-irrelevant axes | Size, density, shape, content toggles: same tokens, pick one |
| Too many sections | If a non-state multiplier exists (type, colour mode) and you'd exceed 6 sections, use one section per variant x mode with **states as columns** |
| Style beats variable | When a layer has a paint style wrapping a variable, report the style; break multi-layer styles into rows (top layer first) |
| `none` | Only for an element absent or transparent in that state; in the states-as-columns layout every column needs a value |
| Keep element names identical across states | "Background" everywhere, not "Bg" in one table |
| Notes: 3-8 words | "Border around the control", "Focus ring, keyboard focus only" |
| Nested components | Exclude full components with their own spec (Button inside a Card) and slot content; include leaf parts the parent colours (icons) and any override the parent applies |

Light/dark need no separate tables when semantic tokens switch by mode; say so once.

## 6. Overview, Motion, Known gaps

- **Overview:** one paragraph: what it is, when to use it, when not (name the alternative), variant axes in one line.
- **Motion:** per animated property `Element | Property | From -> To | Start-End ms | Easing (cubic-bezier)`; note reduced-motion behaviour.
- **Known gaps:** defects only (unbound values, missing states, missing focus variant, naming conflicts), each with severity. Optional follow-ups go in a separate list.

## 7. Docs page template (design-system site)

```markdown
## <Component>
<What it is and when to use it. When not to, and what to use instead.>
### Variants
| Variant | Use when |
### Props
| Property | Type | Default | Description |
### States
| State | Visual | Behaviour |   <!-- default, hover, active, focus, disabled, loading, error -->
### Accessibility
Role, keyboard (Tab / Enter / Space / Esc / arrows), screen reader announcement.
### Do / Don't
| Do | Don't |
### Code example
```

For a **new** component ("extend"), lead with the problem, the existing components you checked and why they fall short, then the proposed API, variants, states, tokens used, accessibility, and open questions for design review.

## 8. Done means

- [ ] API reads without Figma; booleans prefixed correctly; no boolean+type pairs; no transient states as props
- [ ] Every Figma variant option maps to a prop value (mapping recorded)
- [ ] Anatomy numbered, semantic notes, nothing generic
- [ ] Every dimension shows token and value, logical directions, density columns where relevant
- [ ] Colour tables cover every state that changes colour; style-over-variable respected
- [ ] Voice section present (or linked); motion noted if it animates
- [ ] Known gaps list every hardcoded value and missing state

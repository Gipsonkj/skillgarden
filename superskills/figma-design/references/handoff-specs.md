# Design hand-off specs

> Distilled from: design-handoff (anthropics/knowledge-work-plugins, Apache-2.0); structure-spec conventions from create-component-md (redongreen/uSpec, MIT); responsive and motion grounding from figma-codegen (awdr74100/figwright, MIT).

A hand-off spec is the screen- or feature-level document an engineer builds from. Component internals live in component specs ([component-specs.md](component-specs.md)); the hand-off references them and adds layout, flows, content rules and edge cases.

## 1. Principles

| Rule | Why |
|---|---|
| If it isn't written down, the engineer guesses | Unspecified = inconsistent across platforms |
| Tokens, not values: `space/inset/md (16)`, not `16px` | Values drift; token names survive theme changes |
| Every state, not just the happy path | Default, hover, pressed, focus, disabled, loading, empty, error, success |
| Say why for non-obvious choices | "Actions move to a bottom bar on mobile for thumb reach" lets engineers make the next call right |
| Point at real components by name and props | `Button variant=primary size=md`, not "blue button" |
| One spec per screen or flow, versioned with the Figma link and date | Specs go stale; the link and date show how stale |

## 2. Prepare the Figma file first

Before writing, check the file is ready to hand off. If not, list fixes for the designer instead of documenting a moving target.

- [ ] Frames named for screens and states (`Checkout / Payment / Error`), not `Frame 482`
- [ ] Ready sections marked (Dev Mode "Ready for dev" or the team's equivalent)
- [ ] Library components used as instances, not detached copies
- [ ] Colours, spacing, radius and type bound to variables or styles (run the design-system lint: [design-system-audits.md](design-system-audits.md))
- [ ] One frame per breakpoint the product supports, or a written rule for the ones missing
- [ ] Empty, loading and error states drawn
- [ ] Dev Mode annotations for anything that isn't visible (scroll behaviour, sticky header, truncation)
- [ ] Prototype links or a flow diagram for multi-step flows

## 3. Spec template

```markdown
## Hand-off: <Screen or feature>
Figma: <link to the frame> (checked 2026-10-03) · Owner: <designer> · Status: ready for build

### Overview
What it does, who uses it, entry points, success criterion.

### Layout
Grid (columns, gutter, margins per breakpoint), max content width, scroll areas, sticky parts.

### Tokens used
| Token | Value (Light / Dark) | Used for |

### Components
| Component | Variant / props | Notes |
| Button | variant=primary, size=md | Full width below 600 px |

### States and interactions
| Element | Trigger / state | Behaviour |
| Submit | Loading | Spinner replaces label, width locked, `aria-busy` |

### Content rules
| Field | Min / max length | Truncation | Empty value |

### Responsive behaviour
| Breakpoint | Layout changes | Value changes (type, spacing) |

### Edge cases
Long names and translations (+30-40% length), 0 / 1 / many items, slow network, offline, missing images, permissions denied.

### Motion
| Element | Trigger | Property | Duration | Easing | Reduced motion |

### Accessibility
Focus order, keyboard, screen-reader names, live regions (see accessibility spec).

### Open questions
```

## 4. Responsive specs

- Read every breakpoint frame on its own. Mobile type, spacing and padding come from the mobile frame, never scaled down from desktop by eye.
- Split differences into **reflow** (direction, columns, hidden parts) and **value scale** (heading 28 -> 48, padding 16 -> 80). Spec both per breakpoint.
- Two same-width frames where one has a close button are usually a **state** (menu open, drawer), not another breakpoint. Spec it as an overlay on the base screen.
- A fixed-width desktop row needs a breakpoint at or above its content width, or it overflows in between; say what happens below it.
- No frame for a width the product supports? Say the behaviour is inferred and get it confirmed.

## 5. Motion specs

| Field | Format | Example |
|---|---|---|
| Trigger | Event | Panel opens |
| Property | What changes | `transform: translateY(16px -> 0)`, `opacity 0 -> 1` |
| Duration | ms, from motion tokens | `motion/duration/medium (240)` |
| Easing | Token or `cubic-bezier()` | `motion/easing/standard` = `cubic-bezier(0.2, 0, 0, 1)` |
| Delay / stagger | ms | 40 ms per item, max 6 items |
| Reduced motion | What replaces it | Opacity only, 120 ms |

Prototype "Smart animate" settings are a hint, not a spec: write the numbers.

## 6. Deliver

- Put the spec where engineers work (repo `docs/`, the ticket, the design-system site), linked from the Figma frame.
- With a project tracker connected, one sub-task per section that needs building, each linking back to the spec section.
- After build, run the parity check ([token-sync-and-drift.md](token-sync-and-drift.md) section 4) and record what differed.

## 7. Done means

- [ ] Figma link and date; frames named and marked ready
- [ ] Every value is a token (plus resolved value); every component is named with props
- [ ] All states and edge cases listed; content limits and truncation stated
- [ ] Each supported breakpoint covered from its own frame (or marked inferred)
- [ ] Motion has durations, easings and a reduced-motion rule
- [ ] Accessibility notes present; open questions listed, not hidden

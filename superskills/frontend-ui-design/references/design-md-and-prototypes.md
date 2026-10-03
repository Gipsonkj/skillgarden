# DESIGN.md files, HTML mockups and prototypes

> Distilled from: design-md (google-labs-code/stitch-skills, Apache-2.0), html-prototype (plannotator/effective-html, MIT), interface-design (dammyjay93/interface-design, MIT), baoyu-design (JimLiu/baoyu-design, MIT), extract-design-system (arvindrk/extract-design-system, MIT), impeccable (pbakaus/impeccable, Apache-2.0)

Two artifacts that sit between the brief and production code: a **DESIGN.md** that records the system so later screens stay consistent, and a **single-file HTML** mockup or prototype that answers a design question before anyone builds the real thing.

## DESIGN.md: the design system in prose

Write one when the project will get more screens later, when another agent or tool (Stitch, v0, a teammate) will generate UI from it, or when the user asks to "capture the system". Keep it at the repo root or next to the app. A filled-in example is in [templates/design-md/DESIGN.example.md](../templates/design-md/DESIGN.example.md); copy its structure, not its content.

### Sections

1. **Visual theme and atmosphere**: 2-4 sentences of mood with evocative but concrete adjectives ("airy, gallery-like, utilitarian"), the density, and the intended audience.
2. **Colour palette and roles**: each colour as *descriptive name (#hex): role*. "Deep Muted Teal-Navy (#294056): primary actions and active nav." Group into foundation, accent/interactive, text hierarchy, functional states.
3. **Typography rules**: families and why, the scale, weights per role, line heights, tracking on display sizes, numerals.
4. **Component styling**: buttons, cards, navigation, inputs and forms, plus any product-specific pattern. Describe shape in words ("pill-shaped", "gently rounded corners, about 8 px", "sharp, squared-off edges") alongside the value, and every state.
5. **Layout principles**: grid and max-width, whitespace strategy, alignment, breakpoints and touch behaviour.
6. **Notes for generation**: the phrases to use when prompting for new screens, colour references by name, reusable component prompts, and how to iterate one change at a time.

### Rules
- Extract from what exists: computed styles of the live site, the token file, Tailwind theme, component code. Don't invent a system the code doesn't have; flag disagreements ("buttons use three different radii: 6, 8 and 12 px").
- Name tokens by role, not appearance (`--accent`, not `--blue`), but give each colour a human name in prose.
- Record decisions and the reason for them ("borders only, no shadows: dense data tool"), and the defaults that were rejected.
- Keep it current: when a later change alters a token or pattern, update DESIGN.md in the same change.
- If the project uses a lighter memory file for the system (for example `.interface-design/system.md`), follow the project's convention instead of adding a second file.

## Mockup or prototype?

| The open question is... | Make a | Contains |
|---|---|---|
| Hierarchy, layout, type, colour, product fit | **Mockup** | Polished, responsive, mostly static; semantic structure and visible focus even if controls aren't wired |
| Navigation, input, state change, feedback, recovery | **Prototype** | One working flow with real states |

Don't add behaviour to make a mockup look complete. If the user wants both, keep the same content and structure in each.

## Before coding

Settle, in writing: the user and their critical job; the bounded scenario under review; mockup or prototype; where the visual direction comes from; the state model; and where the real product would take over.

Direction authority, highest first: the user's explicit instructions -> the project's established design language -> the product, audience and content -> your judgment. With no system to follow, derive one from the subject (see [design-direction.md](design-direction.md)); don't fall back to a gradient, a dark dashboard or interchangeable cards.

## Scope one credible experience

- The smallest flow that answers the review question. Depth in one flow beats breadth across a fake product.
- Realistic, internally consistent names, dates, statuses, quantities and copy. No lorem ipsum.
- Navigation works within the modelled scope. Forms have labels, validation, submission feedback and sensible defaults.
- No dead buttons. When an action belongs to the real system, show the boundary ("In the product this sends the invoice") rather than pretending it worked.

## Model the states it can reach

List them before building: loading, empty, error, success, disabled, mobile, plus any domain-specific states from the brief. An async-looking action shows loading, then success and a failure/recovery path. A collection considers empty. A gated action shows the gate. A state switcher (dev chrome, clearly separate from the design) is fine for reviewers.

## Interaction must be complete

- Native elements where they fit; the whole modelled flow works by keyboard.
- Visible focus, placed deliberately after meaningful transitions.
- Dialogs: accessible name, focus contained, Escape closes, focus returns to the trigger.
- Form errors tied to their controls; important status changes announced (`aria-live`).
- Nothing essential behind hover. `prefers-reduced-motion` respected while keeping state feedback.
- Touch-sized targets; no page-level horizontal overflow.

## Build contract

- One self-contained `.html` file: CSS and JS inline; no build step, auth, live API or external service (web fonts and an image placeholder service are acceptable if the user allows network).
- Responsive composition, not a shrunk desktop canvas.
- A small token block specific to the direction (see [visual-system.md](visual-system.md)).
- Accessible contrast; state never shown by colour alone.

## Verify and hand off

1. Open it at wide desktop and narrow mobile widths. Exercise every state and control.
2. Keyboard: Tab, Shift+Tab, Enter, Space, arrows where relevant, Escape.
3. Check computed text/background pairs on every surface, especially text inheriting the body colour inside a dark or tinted region.
4. Screenshot when browser tooling is available; otherwise say it wasn't visually verified.
5. Report: absolute file path, mode (mockup or prototype), the scenario modelled, the states implemented, and the production behaviour deliberately left out.

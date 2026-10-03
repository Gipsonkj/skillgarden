# Components, states, forms and UX copy

> Distilled from: interface-design (dammyjay93/interface-design, MIT), hallmark (nutlope/hallmark, MIT), ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill, MIT), frontend-ui-engineering (addyosmani/agent-skills, MIT), baseline-ui (ibelick/ui-skills, MIT), impeccable (pbakaus/impeccable, Apache-2.0), design-taste-frontend (leonxlnx/taste-skill, MIT), frontend-design (anthropics/skills, Apache-2.0)

Most "unfinished" UI is missing states, not missing styling. Build every component for the states it can reach, using what the project already has.

## Use what exists: native -> primitive -> hand-roll

1. **Native HTML first**: `<button>`, `<a href>`, `<input>`, `<select>`, `<dialog>`, `<details>`. Never `<div onClick>`.
2. **A tested headless primitive** for anything stateful: select, combobox, dialog, popover, tooltip, menu, tabs, date picker (Base UI, Radix, React Aria, or the project's library). They ship keyboard support, focus management and ARIA.
3. **Hand-roll only as a last resort**, and then you owe the full contract: arrow keys, Enter, Escape, focus trap and return, ARIA roles and states, touch.

Styling order: project design system -> extract a component when a class string repeats -> semantic tokens -> one-off utilities only for genuine one-offs. Never mix two primitive libraries inside one interaction surface. Check `package.json` before importing anything; if it's missing, show the install command first.

## The state matrix

| Element | States to design |
|---|---|
| Button / link | default, hover, focus-visible, active (pressed), disabled, loading, (selected for toggles) |
| Input | default, hover, focus, filled, invalid + message, disabled, read-only |
| Data view | loading, empty, error, partial, success, very long content, 1 item, 1,000 items |
| Async action | idle, pending, success, failure with retry |
| Permission-gated | allowed, denied (explain why, don't silently hide) |

Rules:
- Hover only under `@media (hover: hover) and (pointer: fine)`; touch gets press feedback instead.
- Focus rings appear instantly (no transition), ≥ 2 px, ≥ 3:1 contrast. Use `:focus-visible`; reserve `outline: 2px solid transparent` at rest so the geometry doesn't shift.
- Disabled uses three signals: native `disabled` (or `aria-disabled`), reduced emphasis (~0.4-0.55 opacity), `cursor: not-allowed`. Explain why when it isn't obvious.
- Loading: skeletons shaped like the final layout for content; spinner + disabled state inside the button for actions. Don't flash a spinner for work under ~300 ms.
- Pressed feedback within 100 ms (`transform: scale(0.97)` on `:active`).
- State changes go to colour, background, outline or shadow, never to `border-width` or padding (layout shift).

## Forms

- Visible label above every input; never placeholder-as-label. Helper text below the input; error text below that, linked with `aria-describedby`.
- Reserve the helper/error line (`min-height: 1lh`) so an error doesn't push the page.
- Inputs and buttons in the same row share one height (≥ 44 px on touch).
- Correct `type`, `inputmode` and `autocomplete` so the right keyboard and autofill appear. Never block paste.
- Validate on blur, not on every keystroke; re-validate on change after the first error.
- On failed submit with several errors: show a focusable error summary at the top linking to each field, keep inline errors, and move focus to the summary (or to the first invalid field when there is no summary).
- Mark required fields; group related fields with `fieldset` / `legend`.
- Long forms autosave or warn before leaving with unsaved changes. Multi-step flows show progress and allow going back without losing input.
- Destructive actions: confirm with a specific dialog ("Delete 3 invoices?") or, better, act immediately and offer Undo.

## Feedback patterns

| Situation | Pattern |
|---|---|
| Effect is visible on screen | Silent success (no toast) |
| Effect is invisible (saved in background, email sent) | Short toast, 3-5 s, `aria-live="polite"`, doesn't steal focus |
| Failure | Inline next to where the action happened, cause + fix + retry |
| Destructive and reversible | Do it, show "Undo" |
| Destructive and irreversible | Alert dialog naming the object and consequence |
| Long operation (> 1 s) | Progress or skeleton; > 10 s show determinate progress or allow background |

Tooltips: ~800 ms delay on hover, 0 ms on keyboard focus, and once one is open, adjacent ones open instantly. Never put essential information only in a tooltip.

Modals: only when the task needs interruption or protected focus. Give them a title, trap focus, close on Escape and on the close button, return focus to the trigger. Prefer inline editing, a side panel or progressive disclosure for simple tasks.

## Navigation

- Current location always visible (active nav style, breadcrumbs for 3+ levels).
- Navigation stays in the same place on every page. Desktop nav fits on one line; height 64-72 px.
- Back restores scroll position, filters and input. Every key screen has a URL.
- Mobile bottom nav ≤ 5 items, each icon + label. Large screens (≥ 1024 px) can use a sidebar.
- Dangerous actions (delete account, sign out) separated from normal items.
- After a route change in a SPA, move focus to the main heading or region.

## Overlays and stacking

Popovers and dropdowns inside `overflow: hidden` ancestors get clipped. Use `<dialog>`, the Popover API, a portal, or `position: fixed`. Overlay components manage their own stacking; don't add manual z-index to them.

## Lists, tables and data

- Prefer wrapping to truncating. When truncating, give a way to see the full value (title/tooltip/detail view). Middle-truncate file names, paths and emails that differ at the end. Never truncate numbers, money or dates.
- Numbers: `Intl.NumberFormat` with the user's locale, tabular figures, right-aligned in tables.
- Plurals with `Intl.PluralRules` ("1 member", "2 members").
- Lists over ~50 items: virtualise or paginate (and say which).
- Sorting state shown and exposed (`aria-sort`).
- Empty states teach the interface and offer one clear next action.

## Charts (when the UI includes data visualisation)

- Chart type from data shape: trend -> line, comparison -> bar, part of whole -> bar or (≤ 5 parts) donut.
- Label axes with units; direct-label small series instead of a far-away legend.
- Data marks ≥ 3:1 against background, low-contrast gridlines, colour not the only encoding.
- Provide a text summary or a table alternative; tooltips reachable by keyboard.
- Loading skeleton, empty state ("No data yet" + what to do), error with retry. Never an empty axis frame.

## UX copy

- Name things by what users understand ("notifications"), not by the system ("webhook config").
- Buttons are verbs that say what happens ("Save changes", "Send invoice"). The same action keeps the same word in the toast ("Invoice sent").
- Errors: what happened + how to fix it, in the interface's voice, no apology, no "Oops", no blame ("Card declined. Try another card or contact your bank.").
- Empty states: what this area is for + the first action.
- Sentence case, active voice, no exclamation marks in success messages.
- One primary CTA per screen; one label per intent across the page (don't mix "Get started", "Sign up free" and "Try now").
- Run every visible string once before shipping: anything vague, cute, broken or unclear gets replaced with a plain sentence.

## Common library picks (React)

When the project has nothing yet, these are reliable defaults: accessible primitives (Base UI or Radix), command palette (cmdk), toasts (Sonner), OTP input (input-otp), drag and drop (dnd kit), virtualised lists (react-virtuoso), animated numbers (NumberFlow), charts (Recharts), state (Zustand), class names (clsx; cva for real variants), theme switching (next-themes). Always prefer what the project already uses. Details in [react-shadcn-tailwind.md](react-shadcn-tailwind.md).

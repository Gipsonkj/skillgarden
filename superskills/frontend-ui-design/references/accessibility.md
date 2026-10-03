# Accessibility: WCAG 2.2 AA in practice

> Distilled from: accessibility (addyosmani/web-quality-skills, MIT), web-design-guidelines (vercel-labs/agent-skills, MIT), frontend-ui-engineering (addyosmani/agent-skills, MIT), ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill, MIT), apple-design (emilkowalski/skills, MIT), interface-review (jakubkrehel/skills, MIT)

Target WCAG 2.2 level AA on everything you ship. Accessibility is part of the build, not a later pass: semantic HTML gets you most of the way for free.

## POUR in one table

| Principle | Means | Typical failures |
|---|---|---|
| Perceivable | Content can be seen, heard or read by assistive tech | Missing alt, low contrast, colour-only meaning, no captions |
| Operable | Works with keyboard, touch, voice, switch | `div` buttons, focus traps, no visible focus, tiny targets |
| Understandable | Predictable, labelled, recoverable | Placeholder-as-label, vague errors, nav that moves |
| Robust | Works with current and future assistive tech | Wrong ARIA, invalid nesting, unlabelled controls |

## Perceivable

- **Text alternatives**: informative images get `alt` describing the content or function; decorative images `alt=""`; icon-only buttons get `aria-label`; icons beside text get `aria-hidden="true"`.
- **Contrast** (AA): 4.5:1 for normal text, 3:1 for large text (≥ 24 px, or ≥ 18.66 px bold), 3:1 for UI component boundaries, icons, focus indicators and chart marks. Check placeholders, disabled hints, text on images and both themes.
- **Colour is never the only signal**: add an icon, text, pattern or underline (links in body text are underlined).
- **Media**: captions for video with speech, transcripts for audio, no autoplay with sound; anything moving for more than 5 s can be paused.
- **Reflow and zoom**: content works at 320 px wide and at 200% zoom without horizontal scrolling (except data tables, maps, code). Never disable zoom (`user-scalable=no`, `maximum-scale=1`).
- **Text spacing**: layout survives users increasing line height, letter and word spacing. Use `rem` and avoid fixed-height text boxes.

## Operable

- **Keyboard**: every action reachable with Tab, Shift+Tab, Enter, Space, Escape and arrow keys where the pattern expects them. No keyboard traps (except a modal, which traps intentionally and releases on Escape).
- **Native first**: `<button>` for actions, `<a href>` for navigation. A `div` with `onClick` needs `role`, `tabindex="0"`, key handlers and states; it is almost always the wrong choice.
- **Focus visible** (2.4.7): use `:focus-visible`, at least 2 px, 3:1 contrast against both the component and the background. Never `outline: none` without a replacement.
- **Focus not obscured** (2.4.11, new in 2.2): sticky headers, cookie bars and chat widgets must not cover the focused element. Use `scroll-padding-top` equal to the sticky header height.
- **Focus order** follows visual order. Don't use positive `tabindex`.
- **Skip link** to `#main` as the first focusable element on content sites.
- **Target size** (2.5.8, new in 2.2): AA minimum 24 x 24 CSS px (or enough spacing). Recommended 44 x 44 px for touch (Apple) / 48 dp (Material). Expand small icons with padding or a pseudo-element hit area.
- **Dragging** (2.5.7, new in 2.2): anything done by dragging also has a single-pointer alternative (buttons to reorder, click to place).
- **Timing**: session timeouts warn and allow extension; carousels don't auto-advance, or can be paused.
- **Motion**: honour `prefers-reduced-motion`; nothing flashes more than 3 times per second.

## Understandable

- `<html lang="en">` (or the right language); mark inline language changes with `lang`.
- Consistent navigation and consistent help location across pages (3.2.6, new in 2.2).
- Every input has a visible `<label for>` (or wrapping label). Placeholders are hints, not labels.
- Errors are identified in text, next to the field, linked with `aria-describedby`, with `aria-invalid="true"` on the field; the message says how to fix it.
- **Redundant entry** (3.3.7, new in 2.2): don't make users retype information they already gave in the same flow; prefill or offer "same as billing".
- **Accessible authentication** (3.3.8, new in 2.2): no cognitive test to log in. Allow paste and password managers, or offer passkeys, magic links or SSO.
- Destructive or financial actions can be reviewed, confirmed or undone.

## Robust: semantics and ARIA

- Landmarks: one `<header>`, `<nav>` (labelled if more than one), one `<main>`, `<footer>`, `<aside>` where it fits.
- One `<h1>` per page; headings in order, never skipped for styling.
- Lists are `<ul>/<ol>`, tables are `<table>` with `<th scope>` and a caption.
- First rule of ARIA: don't use it when a native element does the job. Never put `role="button"` on a `<button>`, never `aria-hidden` on a focusable element.
- Required states: `aria-expanded` on disclosure triggers, `aria-controls` where useful, `aria-current="page"` in nav, `aria-selected` in tabs, `aria-pressed` on toggles, `aria-sort` on sortable headers.
- Follow the WAI-ARIA Authoring Practices pattern for composite widgets (tabs, menu, combobox, listbox, tree, grid): roving `tabindex` and arrow keys.
- **Live regions**: `aria-live="polite"` (or `role="status"`) for async results, toasts and validation summaries; `role="alert"` only for urgent errors. The region must exist in the DOM before content is injected.
- Modals: native `<dialog>` with `showModal()`, or a primitive that sets `role="dialog"`, `aria-modal`, `aria-labelledby`, traps focus, closes on Escape and returns focus to the trigger.
- SPA route changes: update `document.title` and move focus to the new page's `<h1>` or `<main>`.

## Code patterns

```html
<a class="skip-link" href="#main">Skip to content</a>

<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" aria-describedby="email-hint email-err" aria-invalid="true">
<p id="email-hint">We'll send the receipt here.</p>
<p id="email-err">Enter an email like name@example.com.</p>

<button type="button" aria-label="Close dialog"><svg aria-hidden="true">...</svg></button>

<div role="status" aria-live="polite" class="sr-only" id="announcer"></div>
```

```css
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.skip-link { position: absolute; left: 1rem; top: -100%; }
.skip-link:focus { top: 1rem; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

## User preferences to respect

| Media query | Response |
|---|---|
| `prefers-reduced-motion: reduce` | Drop movement; keep opacity/colour |
| `prefers-color-scheme` | Provide both themes if you provide one switch |
| `prefers-contrast: more` | Solid surfaces, stronger borders |
| `prefers-reduced-transparency` | Replace glass/blur with solid fills |
| `forced-colors: active` | Use system colours; don't rely on background images or box-shadow for borders/focus |

## Audit workflow (evidence first)

1. Run an automated pass on the rendered page: Lighthouse Accessibility (Chrome DevTools, or `lighthouse_audit` via Chrome DevTools MCP) or axe-core (`@axe-core/playwright`, `@axe-core/cli`, browser extension). Use mobile emulation for public pages.
2. Use the failing nodes to find the component; don't grep the whole repo for generic patterns.
3. Inspect the accessibility tree (DevTools, or a snapshot from Playwright / DevTools MCP): names, roles, states, landmarks, heading outline.
4. Manual checks automation can't do: Tab through the whole flow, operate every widget with the keyboard, read with a screen reader (VoiceOver, NVDA, TalkBack), zoom to 200%, test reduced motion and forced colours.
5. Fix at the source, then re-run the same audit and the same manual path. Automated tools find roughly a third of issues; a clean score is not a pass by itself.

## Severity for triage

| Severity | Examples |
|---|---|
| Critical (fix now) | Missing form labels, missing alt on informative images, contrast failures, keyboard traps, no focus indicator |
| Serious (before launch) | No `lang`, broken heading structure, "click here" links, autoplaying media, no skip link on long nav |
| Moderate (soon) | Unlabelled icon buttons in secondary areas, inconsistent nav, missing landmarks, timing without controls |

Reference: WCAG 2.2 Quick Reference (w3.org/WAI/WCAG22/quickref) and WAI-ARIA Authoring Practices (w3.org/WAI/ARIA/apg).

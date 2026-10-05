# Accessibility checks and screen-reader specs

> Distilled from: create-voice and the screen-reader references for VoiceOver, TalkBack and ARIA (redongreen/uSpec, MIT); figma-lint-design WCAG rules and thresholds (southleft/figma-console-mcp-skills, MIT); design-handoff accessibility section (anthropics/knowledge-work-plugins, Apache-2.0). Plus general knowledge of WCAG 2.2. Stark section written in our own words from Stark's docs.

Two jobs: **check the design** (can people see and reach it?) and **spec the semantics** (what does a screen reader land on and say, per platform?). Do the first before hand-off, the second for every interactive component.

## 1. Design-side checks

### Pick a checker

| Situation | Use | Why |
|---|---|---|
| The team already uses or pays for a checker (Stark, an audit tool) | That one | Findings land where the team tracks them |
| A Figma file and a Figma MCP that can run `use_figma` | `scripts/figma-lint-design/lint-design.js` | Free, no extra account, node ids in every finding |
| The team has Stark, or wants scans of Figma files, live URLs, source code, iOS/Android builds or a Storybook library in one place | Stark connector (below) | Scans and compliance status from chat; violations come with remediation context |
| Components live in Storybook with the MCP addon and `@storybook/addon-vitest` | Storybook `test-run` (see [design-to-code.md](design-to-code.md)) | Reports accessibility issues per story, in code |
| A designer checking by hand in Figma | Stark Figma plugin | Contrast Checker and Vision Simulator are free |
| Unsure which the team uses | Ask | Don't open a Stark trial or install an addon on a guess |

Every route still needs the hand checks in the table below that no tool can judge (reading order intent, alt text quality, disabled context).

### Stark

Accessibility suite with a Figma plugin and a remote MCP server that Claude uses as a connector.

**Connect.** In Claude (web or desktop): Settings > Connectors > Add custom connector, name `Stark`, URL `https://mcp.getstark.ai/mcp`, then Connect and sign in to Stark when prompted (no API key). Stark is also listed in Claude's connector directory. In Claude Code: `claude mcp add --transport http stark https://mcp.getstark.ai/mcp`, then `/mcp` if it asks you to authenticate. After connecting, list its tools rather than assuming names; the public docs don't list them.

**What to ask it for.**
- Scan: create an asset from a Figma file, one or more live URLs, source code, an iOS or Android build, or a Storybook library, and run it through Stark. It creates a project on the fly if none exists.
- Violations: pull every issue for a project with the context needed to fix it.
- Status: summarise accessibility posture for a project, a team or the whole Compliance Center.

**Gotchas.**
- A scan sends the asset (including source code) to Stark and creates projects in the user's Stark account. Say what you will scan and create, and wait for a yes.
- Accounts: a free two-week trial needs no card; reports and insights need a paid plan. Don't start a trial for the user.
- The Figma plugin's full set is Contrast Checker, Typography, Vision Simulator, Focus Order, Landmarks, Touch Targets and Alt-Text Annotations; Contrast Checker and Vision Simulator are free; check Stark's plans for the rest. Its focus order and alt-text annotations are a good input to the screen-reader spec in section 2.
- Treat Stark's findings like the linter's: give each one a node id or URL, rule, severity and fix, and recheck the fix.

### Lint script

Run `scripts/figma-lint-design/lint-design.js` through `use_figma` with `RULES = ['wcag']` (and `NODE_ID` set to the frame) for a fast first pass, then check by hand what a linter can't judge.

| Check | Threshold | WCAG | Linter rule |
|---|---|---|---|
| Text contrast | 4.5:1; large text (24 px, or about 18.5 px bold) 3:1 | 1.4.3 | `wcag-contrast` |
| UI parts, borders, icons that carry meaning, focus ring | 3:1 against what's next to them | 1.4.11 | `wcag-non-text-contrast` |
| Target size | At least 24x24 px (or spaced so a 24 px circle doesn't overlap a neighbour); aim for 44x44 pt iOS, 48x48 dp Android | 2.5.8 | `wcag-target-size` |
| Focus indicator | A visible focus variant on every interactive component, not colour alone | 2.4.7, 2.4.11 | `wcag-focus-indicator` |
| Colour is not the only signal | Error, status, selection, links in body text also use icon, text, weight or underline | 1.4.1 | `wcag-color-only` |
| Disabled controls | Say why somewhere nearby, or don't disable (validate on submit instead) | 3.3 (best practice) | `wcag-disabled-no-context` |
| Headings | One H1, no skipped levels, headings marked as such in the spec | 1.3.1 | `wcag-heading-hierarchy` |
| Reading order | Layer/auto-layout order matches visual order; absolute-positioned layers flagged | 1.3.2 | `wcag-reading-order` |
| Reflow | Works at 320 CSS px wide without two-way scrolling | 1.4.10 | `wcag-reflow` |
| Images | Every meaningful image has alt text in the spec; decorative ones marked decorative | 1.1.1 | `wcag-image-alt` |
| Text spacing | Survives line height 1.5x, paragraph 2x, letter 0.12x, word 0.16x without clipping | 1.4.12 | `wcag-line-height`, `wcag-letter-spacing`, `wcag-paragraph-spacing` (best practice) |
| Motion | Anything over 5 s can pause; reduced-motion alternative specified | 2.2.2, 2.3.3 | — |

Check every theme mode, not just Light. Contrast from a screenshot is a guess; compute it from the bound token values.

## 2. Screen-reader spec: method

**Step 1, list the visual parts.** Label, input, hint, icon, trailing button, container, divider.

**Step 2, merge analysis.** Most parts are not focus stops. A part is its own stop only if the user can act on it (button, input, link, switch, slider) or it is a container with internal arrow-key navigation (tab list, menu, toolbar). Everything else either merges into a stop (supplies its name, value, hint or description), is a live region (announced when it changes, never focused), or is decorative (hidden).

| Component | Merged into one stop | Separate stops |
|---|---|---|
| Text field | Label, input, hint, error | Input; trailing clear / show-password button if present |
| Checkbox with label | Label | Checkbox |
| List row (icon, title, subtitle) | All text | Row; a trailing action button |
| Removable chip | Label | Chip; remove button |
| Clickable card | Heading, body | Card link; each action button |
| Tabs | — | Tab list (one tab stop) then tabs by arrow keys |
| Accordion | — | Header button; the panel is revealed, not a stop |

Flag **conditional stops** (a clear button only when the field has text) and document them only in the states where they exist.

**Step 3, grouping.** Ask: Is there a shared heading for several items? Is there a selection model (one of many, many of many, switches views)? Would "2 of 5" help? Is it one tab stop with arrow navigation inside? Would the items confuse without the container? **Two or more yes -> document the container** with a role and name. Don't invent a container for items that merely sit next to each other; "Group" with no name helps no one.

**Step 4, states.** List enabled, disabled, selected, expanded, error, loading, read-only, plus behaviour modes from the brief (single vs multi-select). **Collapse states** that have the same focus stops, same roles/names/values and same announcement into one entry ("Enabled / Hover / Pressed"). Always keep error, disabled, read-only, loading and any state that changes the stop count separate.

**Step 5, map to each platform** with the tables below, one table per focus stop per platform.

**Disabled policy (decide once per system).** Native `disabled` removes the control from the tab order; `aria-disabled="true"` keeps it focusable so users can find it and hear why it is unavailable. The second is better when the reason matters (a submit button waiting for required fields). Write down which one the system uses and apply it everywhere.

## 3. Platform cheat sheet

| | iOS VoiceOver (SwiftUI/UIKit) | Android TalkBack (Compose) | Web |
|---|---|---|---|
| Spoken order | label, value, traits, hint | content, role, state, disabled, action hint | name, role, state (then description) |
| Name | `accessibilityLabel` | `contentDescription` / text | Visible `<label>`, `aria-labelledby`, then `aria-label` |
| Role | Traits: `.isButton`, `.isHeader`, `.isLink`, `.isSelected`, `.isToggle` | `Role.Button`, `Role.Checkbox`, `Role.Switch`, `Role.Tab`, `heading()` | Native element first (`<button>`, `<input>`), else `role` |
| Value / state | `accessibilityValue`, `.isSelected`, `.notEnabled` | `stateDescription`, `selected`, `toggleableState`, `disabled()` | `aria-checked`, `aria-selected`, `aria-pressed`, `aria-expanded`, `aria-invalid`, `aria-disabled` |
| Hint / description | `accessibilityHint` (only for non-obvious actions) | `onClickLabel`, custom actions | `aria-describedby` |
| Merge children | `.accessibilityElement(children: .combine)` | `Modifier.semantics(mergeDescendants = true)` | Implicit via label and describedby |
| Hide decoration | `.accessibilityHidden(true)` | `contentDescription = null` / `clearAndSetSemantics {}` | `aria-hidden="true"`, `alt=""` |
| Live updates | `UIAccessibility.post(.announcement, ...)` | `liveRegion = LiveRegionMode.Polite` | `aria-live="polite"` / `role="status"`, `role="alert"` for errors |
| Collections | `.accessibilitySortPriority`, rotor | `collectionInfo`, `collectionItemInfo` | `aria-setsize`, `aria-posinset`, list semantics |

Web rules: prefer native HTML over ARIA; a visible label always beats `aria-label`; placeholders are never the name; keyboard patterns follow the ARIA Authoring Practices (Tab between widgets, arrows inside composites, Esc closes, Enter/Space activate).

## 4. "Do NOT" rows

Every per-stop table ends with the warnings an engineer needs. Add each one that applies:

| When | Do NOT |
|---|---|
| A visible label merges into the stop | Expose the label as its own focusable element (it gets read twice) |
| A hint or helper merges | Make the hint a separate stop; it is the stop's hint/description |
| An error, required or loading glyph sits inside | Announce the glyph alone; fold it into the stop's state |
| A placeholder repeats the label | Use the placeholder as the name |
| A live region is nearby | Put the live region in the focus order |
| A decorative icon is inside | Let it be announced |
| A trailing control shares the row | Merge the trailing control into this stop |
| The stop is a heading styled like a button | Give it a button role |
| The item belongs to a tab or radio set | Spec the items without their group container |

Also state once per spec: keep the focus order stable across states; keep the name short (value, hint and error each go on their own property); if platforms differ (iOS merges, web doesn't), document the superset and explain the difference.

## 5. Worked example (own example)

Search field with a clear button, three states.

**Focus order** (2 stops when text is present): 1 Search input (label "Search", hint "Results update as you type" merge in); 2 Clear button (only when the field has text).

| State | iOS | Android | Web |
|---|---|---|---|
| Empty | Native search field; `accessibilityLabel` "Search"; `accessibilityHint` "Results update as you type" | `TextField` with label "Search"; hint text as supporting text | `<label>Search</label><input type="search" aria-describedby="hint">` |
| Has text | Value is the typed text; Clear: `accessibilityLabel` "Clear search", `.isButton` | Clear: `IconButton`, `contentDescription` "Clear search" | `<button aria-label="Clear search">` right after the input in DOM order |
| No results | Post the result count as an announcement; focus stays in the input | `liveRegion = Polite` on the count text | `<p role="status">No results for "shoes"</p>` |

Exact spoken wording varies by OS version and verbosity settings; spec the properties, not the sentence.

Do NOT rows: clear icon must not be an unlabeled image; the "No results" text is not a focus stop; the hint is not a separate stop.

## 6. Output template

```markdown
## <Component>: screen reader
Focus order (only if 2+ stops): 1 ..., 2 ...
### State: Enabled / Hover / Pressed
#### VoiceOver (iOS)
| Stop | Property | Value | Notes |
| Input | accessibilityLabel | "Search" | From visible label |
| Input | Do NOT | — | Don't expose the label separately |
#### TalkBack (Android)
...
#### ARIA (Web)
...
### State: Error
...
Guidelines: <merge differences, focus stability, live regions>
```

## 7. Done means

- [ ] Lint pass run (or each check done by hand) in every theme mode; findings fixed or listed
- [ ] Every interactive component has a focus variant and a target of 24 px or more
- [ ] Merge analysis done before listing stops; merged parts are properties, not stops
- [ ] Containers only where 2+ grouping questions said yes
- [ ] States collapsed where semantics match; error, disabled, loading kept separate
- [ ] Three platform tables per stop, each with its Do NOT rows
- [ ] Disabled policy stated

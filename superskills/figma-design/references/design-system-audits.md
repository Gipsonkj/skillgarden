# Design-system audits and fixes

> Distilled from: design-system audit mode (anthropics/knowledge-work-plugins, Apache-2.0); figma-lint-design and figma-check-design-parity (southleft/figma-console-mcp-skills, MIT); design-system-patterns governance and versioning (wshobson/agents, MIT); token-sync-layer rename detection (jrpease/throughline, MIT). Fix workflow written fresh for this skill.

An audit answers three questions with evidence: **is the system complete, is it used, and does code match it?** Every finding names a node id or file path, the rule, the severity and a fix.

## 1. Scope it first

| Audit | Covers | Typical input |
|---|---|---|
| Library audit | The Figma library: tokens, styles, components, docs | Library file |
| Usage audit | Product screens: are they built from the library? | One or more product files or pages |
| Code audit | Token and component use in the codebase | Repo paths |
| Parity audit | Figma component vs its code twin | Component node + code |

Agree the scope and the files with the user before running anything; a whole-org scan on a small seat quota wastes the month (see [figma-mcp.md](figma-mcp.md)).

## 2. Figma-side checks

Run `scripts/figma-lint-design/lint-design.js` through `use_figma`. Set `NODE_ID` to a frame (or `null` for the current page), `RULES` to `['design-system']`, `['layout']`, `['wcag']` or `['all']`, and raise `MAX_FINDINGS` (default 100) for big pages. Loop pages with `setCurrentPageAsync` for a whole file, one call per page.

| Rule | Finds | Severity |
|---|---|---|
| `hardcoded-color` | Fill or stroke not bound to a variable or style | warning |
| `no-text-style` | Text without a text style | warning |
| `token-misuse` | A raw value that matches an existing token | warning |
| `detached-component` | A frame that looks like a library component but isn't an instance | warning |
| `default-name` | `Frame 12`, `Rectangle 4` | warning |
| `no-autolayout` | Frames with several children and no auto layout | warning |
| `empty-container` | Frames with no children | info |
| `wcag-*` | See [accessibility-specs.md](accessibility-specs.md) | critical to info |

Then check by hand what the script can't:

| Check | How |
|---|---|
| Library coverage | Every component has all states (incl. focus), sizes, a description and docs link |
| Variable hygiene | Scopes set; primitives hidden; code syntax set; no unused or duplicate-value semantic tokens; every mode has a value |
| Naming | One grammar across variables, styles, components and variant props |
| Instance health | Overridden instances that should be a new variant; nested instances swapped to off-library components |
| Library version | Product files on old library versions (pending updates) |

## 3. Code-side checks

- Raw colours, px values and Tailwind arbitrary values where tokens exist (search commands in [token-sync-and-drift.md](token-sync-and-drift.md) section 4).
- Components re-implemented locally instead of imported from the system package.
- Token names in code that don't exist in the token source (typos, removed tokens).
- Deprecated tokens still referenced, with counts.
- Story or docs coverage per component.

## 4. Parity checks

Run `scripts/figma-check-design-parity/check-parity.js` through `use_figma` with `NODE_ID` set to the component (or component set) and `CODE_SPEC` filled with what the code renders (visual values, spacing, typography, the token names it uses, props). Only the sections you fill are compared. Score = `max(0, 100 - (critical x 15 + major x 8 + minor x 3 + info x 1))`; 90+ is in sync, 70-89 needs a ticket, below 70 needs a design-engineering review.

Watch for **probable renames**: a token missing on one side and a new token with the same value and type on the other. Report them as renames, not as an add plus a delete, because consumers of the old name will break.

## 5. Severity

| Severity | Meaning | Examples |
|---|---|---|
| Critical | Users are blocked or the system is broken | Contrast fail, missing focus state, alias to a deleted variable, mode with missing values |
| Major | Visible inconsistency or drift | Hardcoded brand colour, Figma vs code colour or spacing mismatch, detached core components |
| Minor | Hygiene that compounds | Default layer names, missing descriptions, radius off by 2 px |
| Info | Worth knowing | Unused tokens, empty frames |

## 6. Fix workflow

1. **Triage.** Group findings by root cause, not by node: 140 hardcoded colours are often three missing tokens.
2. **Propose, don't apply.** Show the fix list with counts and the exact change per group (bind to `color/text/muted`, swap to `Button/secondary` instance, rename variable). Ask before any write.
3. **Fix at the source.** A missing token is fixed in the token source, then rebound in Figma and replaced in code; never patch each screen with a closer-looking colour.
4. **Batch safely.** One kind of fix per `use_figma` call, on a branch or duplicate for large changes; return the ids changed.
5. **Rebinding rules.** Bind only exact value matches automatically; near matches (within a few RGB units or 1-2 px) are listed for a human to choose, because the "nearest" token may have the wrong meaning.
6. **Re-run the same checks** and report before/after counts and score.
7. **Prevent recurrence.** Add a lint step to CI for code, a scheduled lint for key Figma files, and a short "how to pick a token" note in the docs.

## 7. Governance (what the audit recommends)

- Versioning: added token or variant = minor; value change = patch with a note; rename or removal = major with a deprecation period and codemod or mapping.
- Contribution path: proposal (problem, existing components checked, API), design and engineering review, accessibility check, docs, release note.
- Ownership: name an owner per tier and per component family.
- Cadence: lint on every library publish; full audit quarterly or before a major release.

## 8. Report template

```markdown
## Design-system audit: <scope> (2026-10-03)
Files: <links> · Repo: <path@commit> · Rules: design-system, wcag
Score: 78/100 (critical 0, major 2, minor 7, info 4)

| # | Severity | Where | Finding | Fix |
|---|---|---|---|---|
| 1 | Major | Checkout/Payment 12:345 | 38 fills use #6B7280, no token | Bind to color/text/muted |
| 2 | Major | Button (code) vs Button (Figma) | Radius 6 vs radius/control 8 | Update code token use |

Token coverage: colour 91%, spacing 76%, type 100%
Component completeness: | Component | States | Sizes | Docs | Focus |
Probable renames: color.bg.default -> color.surface.default
Not checked: <and why>
Next actions: 1. ... 2. ... 3. ...
```

## Done means

- [ ] Scope and files agreed; checks run per page within quota
- [ ] Every finding has location, rule, severity and fix
- [ ] Findings grouped by root cause; renames called out
- [ ] Fixes proposed and confirmed before any write; before/after shown
- [ ] Unchecked areas listed with reasons

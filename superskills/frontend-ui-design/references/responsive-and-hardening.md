# Responsive layout and hardening against real data

> Distilled from: break-ui (emilkowalski/skills, MIT), web-design-guidelines (vercel-labs/agent-skills, MIT), impeccable (pbakaus/impeccable, Apache-2.0), interface-review (jakubkrehel/skills, MIT), frontend-ui-engineering (addyosmani/agent-skills, MIT), design-taste-frontend (leonxlnx/taste-skill, MIT)

UI built against kind demo data looks right and breaks in production. This guide covers two jobs: making layouts adapt across widths, and proving a component survives realistic worst-case data. The full value catalog is in [templates/break-ui/CATALOG.md](../templates/break-ui/CATALOG.md).

## Responsive rules

- Mobile-first CSS; declare the narrow fallback for every multi-column section in the same component.
- Test at 320, 375, 768, 1024, 1280 and 1920 px, plus the component's real container width (a sidebar list is not a page-wide list). No horizontal page scroll at any width.
- Prefer intrinsic layouts over breakpoints: `grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr))`, `flex-wrap`, `clamp()` for fluid display type. Use container queries (`@container`) when a component lives in different-width slots.
- `min-height: 100dvh`, not `100vh` (mobile browser chrome). Respect safe areas: `padding: env(safe-area-inset-*)` with `viewport-fit=cover`.
- Fixed and sticky elements: account for them with `scroll-padding-top`, and check they don't cover more than ~20% of a phone screen.
- Images: `width`/`height` or `aspect-ratio` to prevent layout shift; `srcset`/`sizes`; `object-fit: cover`; `loading="lazy"` below the fold, eager + `fetchpriority="high"` for the hero.
- Touch: targets ≥ 44 px, no hover-only actions, inputs at 16 px to avoid iOS zoom.
- Tables on mobile: horizontal scroll inside a labelled container, or switch to stacked cards, and say which.

## Hardening workflow (worst-case data)

1. **Map the surface.** List every value the component renders with its source, type, limit and whether it's optional. Include the easy-to-forget ones: counts in headers, relative timestamps, badges, button labels from data, tooltips, avatars, and the list length itself. Find limits in validation schemas (Zod, Yup), DB migrations, API types, `maxLength`. Note where front and back end disagree.
2. **Build a worst-case fixture** next to the demo data, same shape, using plausible or schema-backed values, never `"aaaaaaaa"`. Mix failures across rows so one dataset hits everything. Also cover **empty** (0 items, no results), **one** (single item, every count = 1) and **huge** (realistic upper bound; 1,000+ rows if unpaginated).
3. **Wire a dev-only toggle** (`?data=worst`, a prototype route, or a standalone HTML file) that swaps the fixture at the data boundary. Change the data, never the markup.
4. **Break it.** Check at the real container width, 320 px and the widest layout; at 200% zoom; in dark mode and RTL (`dir="rtl"`) if supported. Screenshot both states when browser tooling is available; otherwise say which findings were inferred from CSS.
5. **Report, then stop.** Table: # / severity (Broken, Ugly, Fragile) / field / worst-case value / what happens / fix with `file:line`. Then "Decisions for you" (truncate vs wrap, what an empty field shows, paginate vs virtualise) and "What held up". Fix only when asked; keep the fixture as a regression test.

## Failure signatures

| What you see | Cause | Fix |
|---|---|---|
| Avatar or icon squished into an oval | Flex child shrinking | `flex-shrink: 0` on fixed-size boxes |
| Text overflows instead of wrapping/truncating | Flex/grid child `min-width: auto` | `min-width: 0`; `minmax(0, 1fr)` in grid |
| Email or URL runs past the edge | No break opportunities | `overflow-wrap: anywhere` |
| Trailing menu or button pushed off-screen | Middle content took the space | `min-width: 0` on middle, `flex-shrink: 0` on action |
| Badge wraps to two lines | Badge allowed to shrink | `white-space: nowrap; flex-shrink: 0` |
| Avatar adrift beside a 3-line name | `align-items: center` | `align-items: flex-start` once text can wrap |
| Last row cut mid-glyph | Fixed height, no affordance | Visible scroll or fade mask |
| Wrong initials ("J" for "Jo", broken emoji) | `split(' ')[0][0]` | Grapheme clusters via `Intl.Segmenter`, first + last |
| Orphan "—" where a field was | Placeholder for missing optional | Omit the line, or reserve height on purpose |
| "1 members" | Hard-coded plural | `Intl.PluralRules` |
| Numbers jitter, columns misalign | Proportional figures | `font-variant-numeric: tabular-nums` |
| `1284`, `NaN`, `undefined` | Raw value rendered | `Intl.NumberFormat`; guard nulls |
| Translated button label overflows | Fixed width | Content width with `min-width` |
| Thai/Vietnamese diacritics clipped | Tight line-height + `overflow: hidden` | Looser line-height, don't clip text |
| Broken-image icon | No `onError` fallback | Fall back to initials; `object-fit: cover` |
| Ellipsis with no way to read the value | Truncation only | `title`/tooltip + full value in a detail view |
| 1,000 rows stutter | All rows rendered | Virtualise or paginate |
| Raw `&amp;` or `**text**` | Wrong escaping layer | Escape once at render; never inject user HTML |

## Truncate, wrap or clamp (decide per field)

- **Wrap** what users need in full to identify something (names, titles). Two lines fine; four means the column is too narrow.
- **End-truncate** secondary metadata where the start carries the meaning (role, preview), with a way to see the rest.
- **Middle-truncate** values that differ at the end: file names, paths, emails on a shared domain, hashes.
- **Clamp** (`line-clamp: 2`) multi-line previews in cards for even heights.
- **Never truncate** numbers, money, dates or anything compared.

## Internationalisation

- Allow +30-40% text length for translations (German, Finnish); never fixed-width buttons or tabs.
- Dates, times, numbers, currencies and lists with `Intl.*` and the user's locale; relative time with `Intl.RelativeTimeFormat`.
- Use logical properties (`margin-inline-start`, `padding-inline`, `inset-inline-end`, `text-align: start`) so RTL works by flipping `dir`. Mirror directional icons (arrows, chevrons) in RTL; don't mirror logos, media controls or checkmarks.
- Names: one free-text field beats first/last; no assumptions about length, characters or capitalisation.
- Set `lang` on the page and on inline foreign text so screen readers and hyphenation work.

## Extreme inputs checklist

- Long unbroken strings (emails, URLs, German compounds), one-character values, empty optional fields.
- 0, 1, 2 and 10,000+ counts; negative numbers and refunds; very large amounts with currency.
- Timestamps: just now, yesterday, years ago, future dates, other time zones.
- Emoji, combining characters, CJK, Arabic, Hebrew, mixed-direction strings.
- Missing images, wrong aspect ratios, slow networks (skeletons), offline, server errors.
- Permission states, expired sessions, partial data from a failed sub-request.

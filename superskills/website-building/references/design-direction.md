> Distilled from: auteur (agiwhitelist/auteur, MIT), scroll-craft (nateherkai/scroll-craft, MIT), web-artifacts-builder (anthropics/skills, Apache-2.0)

# Design direction: commit before you code, refuse the defaults

"AI slop" is predictability: the model reaches for the statistical average of its training data, and so does every other model. Taste, operationally, is making each visible choice traceable to this brand and this story. Decide on paper first; nothing is coded until the commit sheet is full.

## 1. The commit sheet (fill before any markup)

Copy `templates/auteur/COMMIT-SHEET.md` to `design/COMMIT-SHEET.md`. Every field gets a specific, non-default answer. "Modern, clean look" means the decision has not been made.

| Field | What to write | Example of a real answer |
|---|---|---|
| Peak / signature | The ONE thing a visitor describes to a friend | "Espresso machine disassembles into 9 parts as you scroll, 300vh pinned" |
| Color | Primary as OKLCH + tier + why it is not the category reflex + **target background lightness L as a number** | "oklch(0.58 0.19 35) terracotta, committed tier ~40% of surface, bg L 0.55" |
| Type | Display + text pair on a contrast axis + why not Inter | "Fraunces display / Archivo text; serif x grotesque" |
| Grid break | One concrete break from the symmetric grid | "Product photo overlaps S2/S3 boundary by 120px" |
| Motion budget | ≤ 3 scroll-pattern families, named | "scrub hero, per-word heading reveal, depth parallax in proof" |
| Reflex check | (a) what a generic AI does for this category, (b) what an AI avoiding (a) does, (c) your argued deviation from both | see table below |
| House tells broken | ≥ 2 items from §5 you will not do, and what replaces them | "near-black bg → daylit L 0.55 paper" |

Then build a **hero mockup gate**: one static throwaway hero (real copy, chosen palette and type), screenshot at 1440 and 390, run `node scripts/auteur/slopscan.mjs design/`, and get a yes (or self-check against the sheet). Approved CSS custom properties become the project tokens verbatim.

## 2. Banned defaults (rewrite the element, don't tweak it)

| Ban | Instead |
|---|---|
| Purple-to-blue gradients (both stops hue 250-290), neon glow | One committed brand hue, or no gradient |
| Gradient text (`background-clip: text`) | Solid color; emphasis by weight or size |
| Glassmorphism as decoration | Blur only when real content passes under a persistent surface (sticky nav over imagery) |
| Hero-metric template (big number, small label, stat row) | Evidence in prose, one committed visual |
| Identical card grids (icon + heading + text, x3/x6) | Vary size and content (image vs number vs quote), or drop cards: a table, a strong list, an annotated image |
| Eyebrow kicker above every section; `01 / 02 / 03` numbering | One deliberate kicker at most; numbers only for a real sequence |
| Colored `border-left` stripe on cards and callouts | Full 1px border, 4-8% tint, or a leading glyph |
| Inter / Space Grotesk as first choice; Playfair / Instrument Serif as reflex "elegant" | A pair chosen for this brand on a contrast axis |
| Cream/beige body as "warmth" (OKLCH L 0.84-0.97, C < 0.06, hue 40-100) | Warmth via accent, type and imagery; true off-white at chroma ~0, or a saturated surface |
| Every section centred; same fade-up on every section | Vary anchors (lead, trail, split); bind each reveal to its content |
| `transition: all`; `scale(0)` entrances | List properties; enter from `scale(0.95)` + opacity |
| Emoji as section icons; more than one marquee | One icon family; one marquee or none |
| A "scroll down" cue, mouse icon, section counters | Nothing. The visitor knows how to scroll |
| Full-frame dark overlay to fix text contrast | A local scrim only where the text sits |

A ban may be overridden only with a written reason tied to the brief (`/* auteur-allow: RULE_ID -- reason */`). A deliberate, argued choice is voice; a default is slop.

## 3. Category reflexes (both orders are dead)

| Category | 1st-order reflex | 2nd-order reflex (also dead) | Live directions |
|---|---|---|---|
| AI / dev tool | dark, purple glow, terminal type | editorial serif on off-white | physical-material metaphor; one drenched hue; blueprint density |
| Fintech | navy + gold, glass cards | terminal dark mode | ledger/print heritage; daylight photography; meaningful oversized numerals |
| SaaS B2B | blue gradient, 3 feature cards | cream editorial serif | real annotated product UI as hero; mono-hue drench |
| Wellness | sage + beige + airy serif | clinical white | saturated botanical color; documentary photography |
| E-commerce | white bg, symmetric grid | full-bleed lifestyle blur | product macro as texture; color pulled from the product |
| Food / craft / artisan | cream + brass + espresso | black + neon menu | forest + bone + amber; cobalt + one neutral; olive + brick |
| Luxury | black + gold + thin serif | white void | drenched jewel tone; letterboxed cinematic photography |

For unlisted categories, derive both reflexes yourself. The procedure matters more than the table.

## 4. Tokens and numbers

**Color**
- Work in OKLCH. Six roles: canvas, surface, ink, ink-soft, accent, accent-ink. One accent, locked for the whole page.
- Commitment tiers: restrained (accent ≤ 10% of surface, default for product UI), committed (one saturated color on 30-60%, fastest way to not look AI), full palette (3-4 named roles), drenched (the surface is the color).
- Tint neutrals 0.005-0.015 chroma toward the brand hue. No pure `#000`. Secondary text is tinted, never flat `#888`.
- Dark vs light is never a default. Write one sentence of physical scene ("who uses this, where, under what light") and let it decide. Record the target background L and check the screenshot against it.
- Contrast on the rendered page: body ≥ 4.5:1, large text ≥ 3:1, placeholders ≥ 4.5:1, controls and focus rings ≥ 3:1.
- When a section inverts ground, restate `color:` with the token (`.section--light { --ink: …; color: var(--ink); }`), because inherited color is already computed.

**Type**
- Max two families. Pair on contrast (serif display + sans text, geometric + humanist, mono + serif), never two similar sans faces.
- Pick by voice: name the voice in 2 adjectives, shortlist 3 candidates, test the real headline at size.
- Body 16-18px, line-height 1.4-1.6, measure 60-75ch (45-75 acceptable). Display line-height 0.95-1.1, letter-spacing ≥ -0.04em, tighten tracking as size grows.
- Display ≤ 6rem for headings in flow; a type-led hero may go larger only if the commit sheet says type is the signature. Step the hero down one size below ~700px width.
- `text-wrap: balance` on h1-h3, `text-wrap: pretty` on prose. Fluid sizes with `clamp()` on a rem base so zoom works. Load fonts with `font-display: swap`.
- Light text on dark: slightly more leading, more tracking, one weight heavier.

**Spacing and layout**
- 4px-based scale. More space above a heading than below it. Vary section padding with content weight; uniform `py-24` everywhere is rhythmless. Fluid section padding so phones do not inherit desktop air.
- Flex for 1D, Grid for 2D, `gap` over margins. `repeat(auto-fit, minmax(280px, 1fr))` for breakpointless grids.
- One named grid break per page minimum. Asymmetric splits (5/7, 4/8) over 6/6.
- Max one full-width colored band per viewport height of scroll.
- Semantic z-index scale (dropdown < sticky < backdrop < modal < toast < tooltip); never 999.
- Container queries for components in variable-width slots; viewport queries for page chrome.

**Texture and depth**: grain at 2-4% opacity on a fixed, pointer-events-none overlay (never on scrolling containers); 1px low-contrast hairline rules; shadows only when something truly floats, one light direction, blur larger than offset.

## 5. House tells (the reflexes of AI builders themselves)

Measured across many AI-built showcase sites, these recur regardless of subject. Break at least two, deliberately:
near-black background by default; tiny mono "service" labels in corners; logo-left / status-dot-centre / action-right header; "scroll to explore" footer with `01 / 05` counter; amber or acid-lime as the single accent; the brand wordmark as the whole hero; glow standing in for lighting.

## 6. Modern platform defaults (use without asking)

- `<dialog>` and the Popover API for modals and menus (free top layer, focus handling, light dismiss).
- `:focus-visible` styles that look designed; hover gated with `@media (hover: hover) and (pointer: fine)`.
- States are the product: hover, focus, active, disabled, loading, empty, error.
- `scroll-margin-top` on anchors under sticky headers; `color-scheme` declared.
- Images reserve space (`width`/`height` or `aspect-ratio`), meaningful `alt`, `loading="lazy"` only below the fold; hero is eager with `fetchpriority="high"`.
- Tables for tabular data with `font-variant-numeric: tabular-nums`; footer is a real place (sitemap, contact, legal).
- Progressive enhancement: the page reads as a complete document with CSS and JS off.

## 7. Self-check before verifying

1. Could a stranger guess the category from the palette alone? Then the reflex won.
2. Is there one element a visitor would describe to a friend?
3. Do any two sections open identically?
4. Would deleting the third font, color or pattern hurt? If not, delete it.
5. Put the hero beside the last thing you built. If they look like the same studio, you found a signature, not a direction.

Run `node scripts/auteur/slopscan.mjs <src-dir>` (zero dependencies, read-only). Exit 1 means fix every FAIL by redesigning the element, then re-run and quote the final `Summary:` line.

## Pitfalls

- Choosing dark "because premium". Write the L number and the reason.
- A light subject on a light field (white product on white sweep): put the subject below the field in value.
- Model "cheerful drift": given a desaturated reference you return a bluer, friendlier version. Record reference chroma as a number and compare.
- Fixing a weak heading with gradient or glow. The problem is the composition around it.

# Foundations: layout, type, colour, contrast

> Distilled from: visual-design-foundations (wshobson/agents, MIT), banner-design (nextlevelbuilder/ui-ux-pro-max-skill, MIT), canvas-design (anthropics/skills, Apache-2.0), latex-posters (K-Dense-AI/claude-scientific-skills, MIT), higgsfield-brandkit (higgsfield-ai/skills, MIT), logo-design (kaankiziltug/logo-design-skill, MIT).

Every other guide in this skill assumes these rules. Read this first when a design "looks off" and you can't say why.

## 1. The three-second test

A poster or graphic is read in three passes. Design for all three, in this order:

| Pass | Distance / size | What must work |
|---|---|---|
| Glance (1–3 s) | Across a room, or ~200 px wide in a feed | One focal image + headline. Nothing else. |
| Scan (5–15 s) | 1–3 m, or full phone width | Subhead, date/place/price, call to action |
| Read (30 s +) | Arm's length, or zoomed | Body copy, small print, credits |

If the glance pass needs more than one element, cut until it doesn't.

## 2. Hierarchy

- **One** dominant element per piece (image or headline). Make it obviously the biggest thing: at least **3×** the size of body/details text; on posters often 5–10×.
- Headline **≤ 6 words** (thumbnails 2–4, ads ≤ 7 words per line and ≤ 3 lines).
- Three text levels are usually enough: headline → support line → details. Four is the maximum (add captions/credits).
- Create hierarchy with size first, then weight, then colour, then position. Do not use all four at once on one element.
- Group related information (date + time + venue) into one block; separate unrelated blocks with space, not lines.

### Reading paths
- **Z-pattern** for landscape and banners: logo/headline top-left → image → CTA bottom-right.
- **F / top-down** for portrait posters: headline top, image middle, details and CTA bottom.
- **3-zone rule** for banners: top = brand or main value prop; middle = message + visual; bottom = CTA (button, QR, URL).

## 3. Space, margins, grid

| Rule | Number |
|---|---|
| Outer margin (digital) | ≥ 5% of the short side; avoid text within 50–100 px of the edge on social formats |
| Outer margin (print poster) | 2–3 cm minimum, 3–5 cm comfortable, plus bleed (see print guide) |
| Safe zone for platform crops | Critical content in the central 70–80% |
| Whitespace target | 40–60% of the canvas on covers and posters; minimal "art" posters go to 70% |
| Text coverage | Art/event posters ≤ 30% of area; ads ≤ 20% (Meta penalises text-heavy ads); research posters 40–60% text + white space |
| Spacing scale | Use a 4/8-point scale (4, 8, 16, 24, 32, 48, 64…). No magic numbers. |
| Grid | 2–3 columns for portrait posters, 12-column for wide layouts; align every element to a column edge or the centre axis |

Nothing touches the edge by accident and nothing overlaps by accident. If an element bleeds off the canvas, it does so on purpose and by a clear amount (≥ 10% of its size).

## 4. Typography

- **Max two typefaces** (one display, one text). One family with strong weight contrast is often better than two.
- **Max 2–3 weights** per family.
- Display type: tight tracking (−1% to −2%), line-height **0.9–1.1**. Body: line-height **1.4–1.6**, 45–75 characters per line.
- ALL CAPS only for short display lines (≤ 4 words) and labels; add +5–10% tracking to small caps labels.
- Avoid script/decorative fonts for anything that must be read fast; use them as one accent word at most.
- Never let an image model choose your final typeface (see the text strategy below).
- Minimum sizes:

| Medium | Headline | Body | Smallest |
|---|---|---|---|
| Social / web graphic (1080 px wide) | ≥ 64 px | ≥ 28 px | 20 px |
| Banners / ads (digital) | ≥ 32 px | ≥ 16 px | 12 px (legal only) |
| OG image (1200 px wide) | 80–120 px | ≥ 40 px | 32 px |
| Event poster A3/A2 | ≥ 72 pt | ≥ 14 pt | 9 pt |
| Research poster A0 | 72–120 pt | 24–36 pt | 18 pt (references 16 pt) |
| Large print viewed from distance | ~1 pt per foot (≈ 3 cm cap height per 10 m) | | |

Font pairing that rarely fails: a characterful display face + a neutral sans (e.g. a condensed grotesk + Inter; a high-contrast serif + a humanist sans). Pick fonts that actually exist on the target system (Google Fonts is the safe default) and say which you assumed.

## 5. Colour

- **2–4 colours** plus neutrals. One dominant (60%), one secondary (30%), one accent (10%). The accent is for the one thing you want seen second.
- Give every colour a **role** (background, text, primary, accent) and a **hex value**. "Blue-ish" is not a spec.
- Limited palettes look intentional: screen-print style = 2–5 flat colours; duotone = 1 warm + 1 cool.
- Check meaning: do not encode information by hue alone (~8% of men are colour-blind). Pair colour with shape, label or value contrast.
- Greyscale test: if the design falls apart in greyscale, the value structure is weak.
- Generate tints/shades in OKLCH or HSL steps (e.g. lightness 97/93/85/75/65/55/45/35/25/18) instead of eyeballing.
- Avoid by default: random rainbow gradients, generic purple-blue "AI glow", cheap neon on everything, gold + serif as the automatic luxury answer.

## 6. Contrast (non-negotiable)

| Element | Minimum ratio (WCAG) |
|---|---|
| Body / small text | 4.5:1 |
| Large text (≥ 24 px, or ≥ 18.5 px bold) | 3:1 (aim for 4.5:1 anyway on posters) |
| Icons, UI marks | 3:1 |
| Enhanced | 7:1 |

Text on photos: add a scrim (gradient 0 → 60% black behind the text), a solid block, a blur panel, or an outline/stroke (8–14% of cap height for punchy thumbnail type). Measure contrast against the busiest part of the image under the text.

Quick contrast check (relative luminance):
```python
def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def ratio(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
print(round(ratio('#141413','#faf9f5'),2))
```

## 7. Composition patterns that work

| Pattern | Use for | Rule of thumb |
|---|---|---|
| Single focal point | Most posters, covers | One centred or power-third subject, ≥ 40% empty space around it |
| Scale contrast | Drama, awe, isolation | Small figure in bottom 20%, huge object/space above |
| Silhouette | Mood, iconic recognition | Shape tells the story; no internal detail |
| Negative-space double image | Clever concept posters | The empty space forms a second object; 1–2 colours |
| Geometric frame | Order, period styles | Circle = unity, triangle = tension, arch = threshold |
| Layered depth | Landscapes, epic scale | Dark foreground → mid tone → pale background |
| Type as image | Announcements, manifestos | Headline fills 50–80% of the canvas; tiny supporting labels |
| Grid / editorial | Information-rich posters | Strict columns, numbered sections, pull quotes |

Rule of thirds: put the focal point on a third-line intersection unless the concept is deliberately symmetrical.

## 8. Text strategy for any generated image

| Situation | Do this |
|---|---|
| Exact copy, dates, prices, brand names, print, client work | Generate or draw the image **without text**, leave empty space, set type in HTML/SVG/Canva/Figma/LaTeX with real fonts |
| 1–5 word headline, casual social use, model known for good text | Let the model render it; put the exact text in quotes; check letter by letter |
| Rendered text came out wrong | Regenerate with a corrected prompt or switch to the no-text route. Do not paint patches over broken model text. |

Why "set it yourself" wins: it is editable, spell-checkable, uses the real font, and survives print. Both camps in the sources agree on the second half: never fake-fix garbled model text with overlays on top of it.

## 9. Pitfalls

- Everything the same size ("nothing is important").
- Centring everything by default; centre only on purpose (symmetry, iconic posters).
- Five fonts, three alignments, random spacing.
- Low-contrast grey text on photos.
- Decoration added to fix a weak idea. Refine what's there instead of adding more (the canvas-design "second pass" rule: when tempted to add a new shape, make the existing ones better).
- Invented logos, fake UI text, lorem ipsum left in a deliverable.

# Logos and brand marks

> Distilled from: logo-design (kaankiziltug/logo-design-skill, MIT), logo-creator (resciencelab/opc-skills, Apache-2.0), design/logo (nextlevelbuilder/ui-ux-pro-max-skill, MIT), brandkit (Leonxlnx/taste-skill, MIT), higgsfield-brandkit (higgsfield-ai/skills, MIT).

A logo is an identifier, not an explanation: one simple, distinctive idea that works at 16 px and on a building, in one colour.

## 1. Modes

| User wants | Do |
|---|---|
| New logo | Phases 1–7 below (fast track: ≤ 5 questions or state assumptions, go straight to 3 concepts) |
| Critique | Score idea, distinction, simplicity, relevance, scalability, craft; give concrete fixes |
| Redesign | Audit equity (what people recognise), decide refresh vs rebrand, keep the recognisable part |
| Favicon / app icon / variants from an existing mark | `export_variants.py` (section 7) or the web-assets guide |

## 2. Discovery → brief

Collect: exact name spelling, what they do, audience, **3–5 brand adjectives** (the most useful input), competitors, constraints (existing colours, where it must work), decision-maker. Write a 5–8 line brief and list your assumptions.

Word map: name + offering + adjectives + promise → nouns, metaphors, opposites. Circle intersections; concepts come from there.

List the **category clichés** and treat them as off-limits unless you give them a fresh form (fintech: blue, upward arrows, shields, globes; coffee: beans, steam, cups; AI: sparkles, brains, nodes).

## 3. Mark types

| Type | Use when | Risk |
|---|---|---|
| Wordmark | Short, distinctive name; new brand needs name recognition | Needs custom type detail to be ownable |
| Lettermark / monogram | Long name, initials are used | Generic unless constructed with a twist |
| Letterform (single letter) | App icon, strong initial | Many brands share letters |
| Pictorial | A literal object is central and can be drawn freshly | Clip-art literalism |
| Abstract | Idea is a process, benefit or relationship | Meaningless blob |
| Emblem / badge | Heritage, certification, membership, craft | Fails small |
| Mascot | Character-led, playful, family/community | Ages; hard to scale down |
| Combination | Symbol + wordmark lockup (most common deliverable) | Must also work split apart |

Explore at least two types. Concept methods that work: monogram + meaning (initial + metaphor via cuts, folds, negative space); product action as symbol (build → frame/scaffold; protect → boundary; speak → waveform); fusion of two ideas (only if both are essential); negative space (hidden arrow, protected centre); construction geometry (circles, grids, exact angles).

## 4. Concepts

- Write **8–12 one-sentence concepts** across types. Each needs an ownable twist. If a sentence could describe a competitor's logo, it is not a concept.
- Score (idea clarity, distinction, simplicity, relevance, small-size strength) and keep the **3 strongest and most different**.
- Build only those three.

## 5. Build in SVG (black first)

- Describe the construction in words first: primitives, radii, angles, grid unit. Then write the SVG.
- `viewBox="0 0 256 256"` for symbols; lockups keep height 256. Padding 4–8% inside the viewBox.
- Solid black on white; no colour yet.
- Few anchors; arcs for circles; exact angles (0/15/30/45/60/90°). Lines 1–3° off read as mistakes.
- Consistent stroke widths and radii. Monoline marks: stroke ≥ 8% of mark width to survive 24 px.
- Real holes with `fill-rule="evenodd"` (no white shapes faking knockouts).
- No `<text>`, rasters, filters or masks in final files; letters are paths.
- Save every iteration (`concept-a-v1.svg`, `-v2.svg`).
- App-icon container: rounded square with ~22% corner radius; mark at 60–70% of the tile.

**Look at your work.** Drawing SVG is drawing blind:
```bash
python3 scripts/logo-design/scripts/render_png.py a.svg b.svg c.svg --out-dir renders --size 512
```
Open the PNGs and look. If you cannot render, say so.

## 6. Test and refine (at least two loops)

```bash
python3 scripts/logo-design/scripts/svg_audit.py concept-a.svg concept-b.svg concept-c.svg
python3 scripts/logo-design/scripts/preview_sheet.py concept-a.svg concept-b.svg concept-c.svg -o preview.html
python3 scripts/logo-design/scripts/preview_sheet.py mine.svg --refs competitor1.svg competitor2.svg -o shelf.html
```
`svg_audit.py` flags live text, rasters, filters, colour count, near-miss angles, tiny details, centring; target score ≥ ~90 with no FAIL. `preview_sheet.py` builds a size ladder, 16/32 px pixel test, light/dark/brand/photo backgrounds, one-colour, blur, mirror/rotate, favicon/app/header/card contexts and a shelf test. (The bundled 1,400-logo library and `--refs-industry` are not included here; pass your own reference SVGs with `--refs`.)

Checklist:
- **Scale**: idea survives 16–24 px; otherwise make a simplified small-size version. Document a minimum size.
- **Colour/value**: works one-colour black, one-colour white (thin the reversed version 2–5% if it looks heavier), greyscale, on brand colour and photos.
- **Optical corrections**: overshoot round/pointed forms 1–3% (points 3–6%); thin horizontals 5–10%; centre optically slightly above geometric centre.
- **Form**: squint test (silhouette alone distinctive); mirror and 90°/180° rotation reveal no accidental letters, body parts, offensive or hazard-sign readings.
- **Letter test**: every modified letter still reads as itself.
- **Junctions**: no notches, slivers, lumps or hairline gaps where strokes meet. Gaps must survive reduction (a 1 px gap at 32 px vanishes).
- **Distinction**: shelf test among competitors; familiarity test (if it feels familiar and isn't yours, it's someone else's).
- **Production**: embroidery (gaps ≥ ~1 mm at chest size), engraving, one-colour print, circular avatar crop.

## 7. Show concepts, then stop

Make a one-image overview (large mark, lockup, true 64/32/16 px sizes, one-line idea, recommendation), greyscale first:
```bash
python3 scripts/logo-design/scripts/concept_sheet.py a.svg b.svg c.svg --lockups a-h.svg b-h.svg c-h.svg \
  --names "Tideline" "Harbor H" "Beacon" --notes "Wave as a horizon line" "H built from two piers" "Light cone in the counter" \
  --recommend 1 --greyscale -o concepts.png
```
Message per concept: name · mark type · one-sentence idea · 2–3 bullets on fit · one honest risk. Recommend one. Offer the full kit and **wait** for the choice before building it.

## 8. The kit (after approval)

1. Final geometry, optical corrections, small-size cut, thinned reversed file.
2. Colour: 1–2 colours ideal (≈ 75% of real logos use ≤ 3), HEX/RGB/CMYK/Pantone, accessible, still works in one colour.
3. Typography and lockups: max two families, custom letter details for ownership, optical spacing; horizontal, stacked, symbol-only, wordmark-only with locked proportions. Check the font licence allows logo use.
4. Presentation board with industry mockups (cup and bag for a café, README and terminal for a dev tool):
```bash
python3 scripts/logo-design/scripts/presentation_board.py spec.json -o presentation.html --png-dir slides
```
Spec template: `templates/logo-design/presentation-spec.example.json`.
5. Export variants:
```bash
python3 scripts/logo-design/scripts/export_variants.py final-symbol.svg --title "Brand logo" --mono "#0F7C80" --icon-bg "#0F7C80" --web-icons --favicon-source final-symbol-small.svg
python3 scripts/logo-design/scripts/export_variants.py final-horizontal.svg --title "Brand logo" --only black white mono --mono "#0F7C80" --png 1200
```
Produces black, white, mono, square, favicon and app-icon SVGs, PNG sizes, `favicon.ico`, web-icon set, webmanifest and `<head>` snippet.
6. Guidelines: `templates/logo-design/brand-guidelines-template.md` (clear space, minimum sizes, colours, backgrounds, misuse).

## 9. AI-image route (raster logos)

When the user wants an illustrative, mascot, 3D or pixel-art logo an SVG build can't reach:
1. Agree style, ratio (1:1 default), colours, references before generating.
2. Prompt pattern: `{style} logo for {brand}, {one-sentence idea}, {colours} on plain white background, centred, generous margin, no text` (add lettering only if wanted, in quotes). Styles: pixel art, minimalist flat, 3D/isometric, hand-drawn, mascot, monogram, abstract geometric.
3. Generate 8–20 variations, preview them side by side (numbered), ask which and why, iterate on favourites (`logo-05-v1.png`).
4. Finalise: crop whitespace and square it (`python3 scripts/logo-creator/crop_logo.py in.png out.png --padding 5`, needs Pillow + numpy), remove the background (any available background-removal tool), vectorise (a vectoriser such as potrace or a vectorising API) and then clean the SVG by hand and run `svg_audit.py`.
5. Be clear that a raster-born logo needs a proper vector redraw for production use.

## 10. Honesty

- You cannot guarantee trademark clearance; recommend a trademark database search and reverse image search.
- Say which fonts you assumed and that outlines were constructed.
- Don't claim tests you did not run or renders you did not look at.
- Never trace or closely imitate existing logos.

> Distilled from: baoyu-slide-deck (jimliu/baoyu-skills, MIT); scientific-slides incl. prompt-writing and PowerPoint guides (K-Dense-AI/scientific-agent-skills, MIT); html-slides guide of the docs-office craft (frontend-slides, html-ppt, baoyu-slide-deck, MIT); ppt-master (hugohe3/ppt-master, MIT)

# Image-generated slides

Some workflows render each slide as one AI image (style prompt + slide content), then stitch the images into a PDF or a picture-only PPTX. Results can look striking, but text is not editable, searchable or accessible, and small text is often wrong. Use it only when the user asks for it, mostly for social, visual or concept decks, never for working decks, numbers-heavy decks or anything others must edit. The image models, prompting and APIs belong to `image-creation`; this guide covers the deck side.

## 1. Pick the mode

| Mode | What the model makes | Use for |
|---|---|---|
| Full-slide images | The whole slide incl. title and bullets | Social carousels, visual storytelling, concept decks, title/section slides |
| Visual-only images | Illustrations, backgrounds, diagrams without text | Any editable deck: generate the visual, put real text on top in pptx/HTML |
| Hybrid | Image slides for covers and section breaks, native slides for content and data | Most talks that want the look without losing editability |

Default to visual-only or hybrid. Results slides with quantitative figures are never image-generated: embed the original chart or redraw it from data (data-slides.md).

## 2. Workflow

1. **Outline first** with real text per slide (deck-story.md): title, 2-4 short points, the visual idea. Keep this outline as the source of truth for every number and name.
2. **Lock a style** in one "formatting goal" line used in every prompt: background, text colour, accent hex values, type style (bold sans titles), layout habit (left-aligned, generous margins), "no decorative elements". Choose density (few words per image), mood and texture once.
3. **Confirm with the user** before generating: style, audience, slide count, language, which backend (and its cost). Generation is paid and slow (about 10-30 s per slide).
4. **Write each prompt to a file** before calling any backend: `prompts/NN-slide-<slug>.md`. The files are the reproducibility record and let you switch backends or regenerate one slide.
5. **Chain for consistency:** pass the previous slide (or the title slide) as a reference image with "match the attached slide's style exactly"; keep the same session if the backend supports it.
6. **Generate in batches** (about 4 at a time when the backend or runtime allows), retry failures once, report progress "Generated X/N".
7. **Review every image** at full size against the outline: spelling, numbers, names, logos, citations, made-up details.
8. **Assemble:** PDF of the images (any image-to-PDF tool, or `img2pdf`), or a PPTX with one full-bleed picture per slide plus the slide text in the notes.

Slide count heuristic from source length: under 1,000 words → 5-10 slides; 1,000-3,000 → 10-18; 3,000-5,000 → 15-25; more → consider splitting.

## 3. Prompt pattern

```
Presentation slide, 16:9, titled "Churn fell 30% after the price change".
Content: three short points with simple line icons: annual plan share up 12 points; monthly churn 4.1% to 2.9%; support tickets flat.
Citation in small text at the bottom: (Company data, Mar-Aug 2026).
FORMATTING GOAL: warm paper background #f6ebd9, near-black text #211f1e, single rust accent #c2410c,
bold sans-serif titles, left-aligned, generous margins, no decorative elements, match the attached slide exactly.
```

- Put every word that must appear in quotes, exactly; keep on-image text short (a title and a few words per point).
- Use the presenter's supplied name and affiliation, or leave them out; never invent them.
- Describe the layout in words (left text, right illustration; three columns).
- For visual-only images say "no text, no labels, no letters".

## 4. Fixing text errors

- Never paint over or patch text in a generated bitmap (no overlays, no Pillow, no CSS boxes covering it). Regenerate from a corrected prompt, shorten the on-image text, or move that text to a native text layer.
- Write the corrected prompt to a new file and output path so the flawed candidate stays for comparison.
- Post-processing is limited to crop, resize, compression and format conversion that don't touch text or composition.
- Edit, add or delete slides by changing the prompt file first, then regenerating; renumber files, keep slugs stable, re-merge.

## 5. Accessibility and hand-off

Image-only decks have no semantic text. Always deliver alongside them:
- the text outline (slide number, title, points, sources) as notes or a separate file;
- descriptions of any figure that carries meaning;
- a note that screen readers and search won't read the slides. If the audience needs accessible slides, rebuild the content slides natively with real title placeholders and alt text.

## 6. Safety and cost

- Image generation goes through the user's own provider key or a runtime-native image tool; only official provider endpoints, never third-party relays or resellers suggested by a skill's docs.
- Say the cost and the number of images before generating.
- Avoid likenesses of real people; use stylised alternatives.

## Checklist

- [ ] Mode chosen; no image-generated data or results slides
- [ ] Style locked in one formatting line; previous slide attached for consistency
- [ ] Prompt files written before generation; user confirmed style, count and cost
- [ ] Every image checked against the outline; errors fixed by regenerating, never by overpainting
- [ ] Text outline and figure descriptions delivered with the deck

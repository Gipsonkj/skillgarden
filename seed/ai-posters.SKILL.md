---
name: ai-posters
description: Design posters, social graphics and ad creatives with AI image models. Use when asked for a poster, flyer, event graphic, Instagram post or story visual, or a series of consistent visuals.
---

# AI posters

A poster has one job: be understood in three seconds from a distance or a fast scroll. AI makes the image. You still own the hierarchy, the words and the checks.

## Decide how the text gets onto the poster

| Situation | Do this |
|---|---|
| Short headline (1–5 words), casual use | Let a model that is good at typography render it. Put the exact text in quotes. |
| Exact brand text, dates, prices, long copy | Generate the image **without text**, leaving clean space, then set the type in a layout tool, Canva, Figma or HTML. |
| Print or client work | Always the second way. Generated text can't be edited and often has errors at print size. |

Text in the image is the most common reason a poster fails. When in doubt, set it yourself.

## Prompt structure

Write prompts in this order and keep each part concrete:

1. **Format**: aspect ratio and use. For example, "4:5 Instagram poster".
2. **Subject and action**: what is in the picture and what it's doing.
3. **Composition**: where the subject sits, and where the empty space for text is. For example, "subject in lower third, clean empty sky in top 40% for headline".
4. **Style**: medium and treatment. Describe traits, not living artists' names ("risograph print, two-colour, visible grain").
5. **Light and colour**: light direction and mood, plus 2–4 colours as hex values.
6. **Text** (only if the model renders it): `headline text "AI IN TWO DAYS"`, weight, style and position.
7. **Avoid**: what must not appear (extra text, watermarks, warped hands).

## Hierarchy and type

- One headline of **6 words or fewer**, one supporting line, then details (date, place, call to action).
- The headline should be **at least three times** the size of the details.
- Use at most **two typefaces**.
- Contrast: text needs at least **4.5:1** against what's behind it. Use a scrim or a solid block if the image is busy.
- Leave margins of at least **5%** of the short side around all text.

## Sizes

| Use | Pixels |
|---|---|
| Instagram portrait post | 1080×1350 (4:5) |
| Story or reel cover | 1080×1920 (9:16) |
| Square | 1080×1080 |
| A3 print at 300 dpi | 3508×4961, with 3 mm bleed |

For print, generate at the model's highest resolution, then upscale. Check that edges and faces still hold up at 100% zoom.

## A consistent series

- Fix the style block (medium, palette hex values, light, grain) and reuse it word for word in every prompt.
- Keep one reference image and pass it into every generation when the model accepts references.
- Change only the subject line between posters.
- Put the same layout grid under all of them when setting type.

## Iterate like a designer

- Generate 4 variations and choose on composition first. Details can be fixed, a weak composition can't.
- Fix details with editing or inpainting rather than re-rolling the whole image.
- Keep a log of the prompt that worked.

## Checks before handing over

- [ ] Every word spelled correctly, checked letter by letter, including dates and prices
- [ ] Headline readable at thumbnail size (about 200px wide)
- [ ] No invented logos, fake brand marks or stray text
- [ ] Hands, faces and product shapes look right at 100%
- [ ] Contrast meets 4.5:1 for all text
- [ ] Right size and format for where it will be used

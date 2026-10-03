# Marketing and brand images: social, ads, product shots, posters, brand assets

> Distilled from: image (coreyhaines31/marketingskills, MIT), higgsfield-generate (higgsfield-ai/skills, MIT), gpt-image-2-style-library (freestylefly/awesome-gpt-image-2, MIT), imagegen (openai/skills, Apache-2.0), prompt-images (replicate/skills, Apache-2.0), flux-image-best-practices (black-forest-labs/skills, MIT), image-prompt (gongnyang/gongnyang-prompt-kit, MIT)

## 1. Before starting, get four answers

1. What asset and where it runs (feed post, story, ad, blog hero, listing banner, print)? This fixes the size.
2. Brand inputs: logo files, hex colours, fonts, style guide, product photos. If the project has a product-marketing context file, read it first.
3. One-off or a repeatable template?
4. Which tools/keys are available, and budget per image?

## 2. Pick the approach

| Approach | Best for |
|---|---|
| AI generation | Unique heroes, lifestyle scenes, abstract brand visuals, concept exploration |
| AI editing | Background swaps, seasonal variants, product in new scenes |
| Design tools (Figma, Canva) | Exact brand templates, many size variants, recurring social templates |
| Screenshot + overlay | Product UI showcases, feature announcements |
| Stock | Generic scenes when speed beats uniqueness |

## 3. Sizes

| Placement | Pixels | Ratio |
|---|---|---|
| Instagram feed | 1080x1350 (or 1080x1080) | 4:5 / 1:1 |
| Stories / Reels cover / TikTok | 1080x1920 | 9:16 (keep text out of top 14% and bottom 20%) |
| X/Twitter image | 1200x675 | 16:9 |
| LinkedIn feed | 1200x627 | 1.91:1 |
| Facebook link / OG / blog hero | 1200x630 | 1.91:1 |
| LinkedIn personal cover | 1584x396 | 4:1 (keep the left third clear of the avatar) |
| X header | 1500x500 | 3:1 |
| YouTube thumbnail | 1280x720 | 16:9 |
| Product Hunt gallery | 1270x760 | ~5:3 |
| GitHub social preview | 1280x640 | 2:1 |
| Google Play feature graphic | 1024x500 | ~2:1 |
| A3 print at 300 dpi | 3508x4961 + 3 mm bleed | |

Generate at the model's nearest ratio and highest affordable resolution, then crop/resize. Center critical content; banners crop differently per device.

## 4. Model choice for marketing

```
Text/headline baked in?        → Ideogram 3 / Recraft / GPT Image 2.5 / Nano Banana Pro; or overlay
Many images, same brand look?  → references: FLUX.2 multi-ref, Nano Banana Pro, Recraft Styles
Edit an existing photo?        → Gemini, GPT Image edits, FLUX.2
Vector / illustration system?  → Recraft (SVG); finish in a design tool
Highest aesthetic?             → FLUX.2 [max], Midjourney (manual only)
Volume, low cost?              → Gemini Flash, FLUX.2 [klein], Seedream
```

## 5. Workflows

**Blog / article hero**: one visual metaphor for the topic → 1200x630 (also the OG image) → no text or a ≤ 5-word title → compress to < 200 KB WebP.

**Social post / ad image**: one message, readable in 3 seconds at thumbnail size. Headline ≤ 6 words, ≥ 3x the size of details, ≤ 2 typefaces, contrast ≥ 4.5:1, margins ≥ 5%. Make 3-4 concepts, pick on composition, then produce size variants.

**Product shot**: describe the material precisely (matte aluminium, frosted glass, kraft paper), the surface it sits on, and a lighting setup ("large softbox overhead, white bounce left, soft contact shadow"). For the **real** product, pass product photos as references and say "keep the product's exact shape, label and colours from image 1; change only the scene". Check the label letter by letter; regenerate or composite the real packshot if it drifts.

**Lifestyle with product**: real product as reference + scene description + "the product is the clear focal point, sharp, correctly scaled for a hand".

**Profile / listing banners**: brand colours + short tagline + optional product shot; directories (Product Hunt, G2) convert better with real annotated screenshots than abstract art. Preview at real display size on mobile.

**Ad variants at scale**: lock the style block and layout; vary one axis at a time (hook line, background, model, colourway) so results are testable. Platforms like Higgsfield Marketing Studio formalise this (ad formats, brand kits, avatars, products); otherwise script it with a batch runner.

## 6. Posters and campaign visuals

Prompt order: format → subject/action → composition with the empty text area → style (traits, not artist names) → light + 2-4 hex colours → text (only if the model renders it) → avoid list. Typography-led posters (the words are the art) can be rendered in-model on GPT Image 2.5 / Nano Banana Pro; information posters (dates, prices, venues) get their type set afterwards. See `text-in-images.md`.

Template families that work (from the awesome-gpt-image-2 library; lock / avoid):
- **Event or movie poster**: lock subject, headline, layout, palette, ratio; avoid moodboard collages when one finished poster is wanted.
- **Sports campaign**: lock athlete pose, motion blur direction, brand colour, one line of copy; avoid invented sponsor logos.
- **Conceptual typography poster**: the word is the image (material, distortion, scale); avoid adding a second idea.
- **Ink double-exposure**: silhouette + landscape inside it, two-tone palette; avoid busy backgrounds.
- **Nature/science poster**: one specimen, labelled callouts, cream paper texture; limit labels to ≤ 8.

## 7. Brand assets: what AI is and isn't for

| Asset | AI generation | Finish in |
|---|---|---|
| Logo | Concepts only: "vector logo mark, flat colours, strong silhouette, generous padding, no gradients, no mockup"; Recraft vector for SVG | A vector tool; always redraw/clean. Check it's not similar to existing marks. |
| App icon | Good starting point; test at 29-60 px | Design tool |
| Illustration system | Style exploration, then lock a style block or train a LoRA | Design tool for consistency |
| Favicon, social icons | No | Derive from the logo / use platform assets |
| Brand board | GPT Image "brand identity board": mark, palette hex, type, 4-6 touchpoints | Real brand guide document |

Never imitate a real company's branding or a real person; invent names for mockups.

## 8. Consistent campaign series

1. Generate 3-4 test images with different style prompts.
2. Pick the winner; save its exact prompt as the template and the image as a style reference.
3. Swap only the subject line per image; pass the reference every time.
4. Same layout grid for the type on all of them.
5. Post-process: crop to sizes, add text and logo in a layout tool, export.

## 9. Hand-over checks

- [ ] Every word correct (letter by letter, incl. dates and prices); no stray text or fake logos
- [ ] Headline readable at ~200 px wide
- [ ] Hands, faces, product shape and label right at 100%
- [ ] Brand hex colours visually match; ≤ 2 typefaces
- [ ] Correct pixel size and format per placement; web files compressed
- [ ] Prompt, model and seed (if any) logged for reuse

# Images for websites and apps: heroes, section art, design comps, game/UI assets

> Distilled from: imagegen-frontend-web (Leonxlnx/taste-skill, MIT), imagegen (openai/skills, Apache-2.0), image (coreyhaines31/marketingskills, MIT), nano-banana (kingbootoshi/nano-banana-2-skill, MIT), imagen (sanjay3290/ai-skills, Apache-2.0)

## 1. Decide: generated bitmap, code, or real screenshot?

| Asset | Best route |
|---|---|
| Hero photo / illustration, section art, blog header, textures | Generate |
| Your real product UI | **Real screenshots** at 2x, framed in a device/browser mockup. Models hallucinate UIs. |
| Icons, logos, diagrams matching the repo's SVG set | Edit/extend the SVGs |
| Simple shapes, gradients, patterns | CSS/SVG/canvas |
| Design reference for a page you'll code | Generated comps (section 4) |
| Game sprites, UI icons, tileable textures | Generate (transparent or seamless), then clean up |

## 2. Hero and section images

- Write the prompt from the layout: where the headline and CTA sit decides where the empty space goes. "Subject in the right third, calm empty area in the left 45% for the headline, nothing busy behind the text."
- Generate **without text**; the page sets the type (crisp, accessible, translatable).
- Match the page palette: give 2-4 brand hex values; ask for a restrained background so text contrast holds ≥ 4.5:1 (or plan a scrim).
- Sizes: full-width hero 1920x1080 (16:9) or 2560x1080 (21:9) for wide banners; content images at 2x their CSS display size; blog hero/OG 1200x630.
- Keep a set consistent: one style block, one colour grade, one light direction for all section images (see `editing-references-consistency.md`).

Template:
```text
Use case: stylized-concept | photorealistic-natural
Asset type: landing page hero background
Primary request: <subject / metaphor>
Composition/framing: wide; <subject placement>; usable negative space <where> for page copy
Lighting/mood: <light>
Color palette: <brand hex with names>
Constraints: no text; no logos; no watermark
```

## 3. Avoid the AI look

Default outputs collapse into the same clichés. Steer away explicitly:

| Slop | Use instead |
|---|---|
| Purple/blue glow gradients, floating blobs and orbs | One real material or photo crop; a single accent colour |
| Glassmorphism stacked everywhere | Solid surfaces, subtle texture, real shadows |
| Generic dashboard cards with fake KPIs | Real screenshots or nothing |
| Left-text / right-image hero every time | Centered over full-bleed image, bottom-left over image, stacked center, off-grid editorial, mini minimal hero |
| Fake brand names ("Acme", "Nexus", "Quantumly") and copy like "unleash, elevate, seamless, next-gen" | Short, believable words; the user's real name |
| Over-packed sections | More whitespace than feels necessary |

## 4. Website design comps (reference images for coding)

When the user wants generated visual references of a site/landing page before building it:

- **One horizontal image per section.** Never one tall image of the whole page, never several sections in one frame. Defaults if no count given: "hero" 1; landing/product page/portfolio 6; full website/marketing site 8. Label outputs "Section 2 of 8: Social proof".
- Format: 16:9 for most sections, 21:9 for wide heroes, 16:10 for dense content.
- **Continuity across all frames**: same palette and accent logic, same type family and scale, same CTA style, same corner radius, same image grade. A viewer should read them as one site.
- **Vary per section**: composition anchor, background mode (solid, full-bleed image, split, texture), section size (big art-directed / medium editorial / mini minimal).
- Hero: headline about 5-10 words, short subline, one CTA, lots of negative space; no badges, pills or fake stats.
- Typography: 1-2 families, tight tracking, controlled line count; no gradient headline text.
- Give every section a job: hook → proof → explain → convert.
- Check before delivering: hierarchy obvious? count of images = count of sections? palette consistent? could a developer code it?

## 5. Game and app assets

| Asset | Prompt essentials |
|---|---|
| Sprite / mascot | "centered, full body, clear silhouette, flat solid #00FF00 background" → key to alpha; or native transparent (GPT Image 1/1.5/2.5) |
| UI icon | "centered icon, generous padding, clear silhouette, no text, no background scene"; generate at 1024 and downscale; check legibility at 32/64 px |
| Tileable texture | "seamless tileable texture, even lighting, no focal point, no text"; verify by tiling 2x2 and fixing seams (offset + heal) |
| Environment concept | "wide establishing shot, low angle, volumetric light"; 16:9 |
| Character concept | "neutral hero pose on a plain backdrop"; same description in every call; references for consistency |
| Pixel art | Generate, then downscale with nearest-neighbour to the exact grid (e.g. 64x64) and quantise the palette; models don't produce true pixel grids |

Exact pixel sizes: generate at the closest ratio, then crop/resize in code (ImageMagick/Pillow/sharp).

## 6. Web delivery

- Formats: WebP default (quality 75-85 for photos), AVIF for max compression, PNG for transparency/screenshots, SVG for vectors, JPEG fallback.
- Resize to display size x2; never ship a 4000 px image into an 800 px slot. Hero < 200-300 KB, content images < 150 KB.
- `<img width height>` set (prevents layout shift), `loading="lazy"` below the fold, `fetchpriority="high"` on the LCP hero, `srcset`/`sizes` for responsive.
- Descriptive alt text (what it shows and why it's there), not keyword stuffing.
- Commands: `cwebp -q 80 in.png -o out.webp` · `magick in.png -resize 1600x -quality 82 out.webp` · `npx sharp-cli -i in.png -o out.avif`.
- Save assets in the project (e.g. `public/images/hero-v2.webp`) with stable descriptive names; never leave a referenced asset only in a tool's temp folder; don't overwrite existing assets without asking.

## 7. OG / social preview images

```html
<meta property="og:image" content="https://example.com/og/page.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
```
For many pages, render OG images from a template (`@vercel/og`/Satori, HTML screenshot) with a generated background plus real text.

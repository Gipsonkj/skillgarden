# Algorithmic and code-generated art (p5.js, canvas, SVG)

> Distilled from: algorithmic-art (anthropics/skills, Apache-2.0), imagegen (openai/skills, Apache-2.0)

Use code instead of an image model when the user asks for generative/algorithmic art, flow fields, particles, patterns, or when the output must be deterministic, infinitely resizable, animated or interactive. No API key needed.

## 1. Two-step process

1. **Write a short "algorithmic philosophy"** (4-6 paragraphs, saved as `.md`): name the movement in 1-2 words ("Organic Turbulence", "Stochastic Crystallization") and say how the idea is expressed in *process*: which noise, forces, growth rules, palette logic and what a viewer should feel. Keep one quiet conceptual thread from the user's request inside the algorithm; it should be felt, not announced.
2. **Express it in code**: a single self-contained HTML file with p5.js, seeded randomness, tunable parameters and a control sidebar.

The algorithm should follow from the idea, not from a menu of patterns:

| Idea | Techniques |
|---|---|
| Organic emergence | layered Perlin noise flow fields, particles leaving trails, accumulation, growth |
| Mathematical beauty | harmonics, Lissajous, phyllotaxis/golden angle, symmetry, interference |
| Controlled chaos | bounded random walks, bifurcation, thresholds, phase changes |
| Crystallisation | circle packing, Voronoi + Lloyd relaxation, reaction-diffusion |
| Recursion | L-systems, recursive subdivision, branching with shrinking line weight |

Make the work original. Don't recreate a living artist's signature piece.

## 2. Technical requirements

- **Seeded**: `randomSeed(seed); noiseSeed(seed);` at the start of every render. Same seed must give the identical image.
- **Parameters object** with the seed plus what the system needs: counts, scales, speeds, probabilities, ratios, angles, thresholds, palette.
- Canvas 1200x1200 by default (or the user's aspect ratio); `pixelDensity(1)` for export consistency, or 2 for retina previews.
- `noLoop()` for static pieces; for animation, cap particle counts so it stays ≥ 30 fps.
- Palette: 3-6 chosen colours (hex), not random RGB. Colour can be driven by velocity, density or age.
- Composition still matters: give the image a focal area and breathing room; avoid uniform noise from edge to edge.
- Everything inline except p5.js from a CDN (`https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js`).

## 3. Use the bundled template

- `templates/algorithmic-art/viewer.html`: the starting point for the artifact. It already has the layout, a seed section (display, previous/next, random, jump-to-seed), a parameters section, an optional colours section, and actions (regenerate, reset, download PNG). Keep the fixed sections; replace only the algorithm, the `params` object and the parameter controls. (Its styling uses Anthropic's fonts/colours; restyle if the user wants their own brand.)
- `templates/algorithmic-art/generator_template.js`: reference for structure (params, seeded random, classes, setup/draw). Embed the final code inline in the HTML; don't ship separate files.

Read the template first, then write the art. Required working features: every parameter has a control that updates live, seed navigation works, reset restores defaults, download saves a PNG.

## 4. Variations

- Seeds are the variation engine: one algorithm, many prints. Offer seed presets ("Seed 42", "Seed 127") or a gallery mode with thumbnails of seeds 1-12.
- For "100 variations", render seeds 1-100 to PNG with a loop (`saveCanvas`) or headless (Puppeteer/Playwright screenshot of `?seed=N`).

## 5. Static vector alternative (SVG)

For print, plotters, icons or patterns: generate SVG directly with JS or Python (`svgwrite`, plain string templates). Use a seeded PRNG (mulberry32, `random.Random(seed)`), round coordinates to 2 decimals, group by colour for plotters, and set `viewBox` so it scales.

## 6. When to choose code vs model

| Choose code | Choose an image model |
|---|---|
| Patterns, textures, abstract generative pieces | Photos, people, products, illustration with subjects |
| Must be exact, editable or resizable | "Looks like a photo of…" |
| Needs animation or interactivity | One-off raster asset |
| Diagrams, charts, icons that match a repo's SVG set | Concept art, mood images |

## 7. Done means

- [ ] Philosophy `.md` written (4-6 paragraphs, no repeated points)
- [ ] One self-contained HTML that opens in a browser with no server
- [ ] Same seed → same image (test twice)
- [ ] Every parameter has a working control; download works
- [ ] Palette deliberate, composition has a focal point, runs smoothly

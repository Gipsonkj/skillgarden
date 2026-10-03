# Web assets: favicons, app icons, Open Graph images

> Distilled from: web-asset-generator (alonw0/web-asset-generator, MIT), logo-design (kaankiziltug/logo-design-skill, MIT), banner-design (nextlevelbuilder/ui-ux-pro-max-skill, MIT).

## 1. Specs

| Asset | Size | Notes |
|---|---|---|
| favicon.ico | 16, 32 (+48) inside one ICO | Legacy browsers |
| PNG favicons | 16×16, 32×32, 96×96 | Browser tabs, taskbar, Google TV |
| SVG favicon | any | Modern browsers; can include dark-mode CSS |
| apple-touch-icon | 180×180 | iOS home screen; opaque background, no transparency |
| Android / PWA | 192×192, 512×512 | Webmanifest icons; allow ~10% safe padding for masks |
| Open Graph | 1200×630 (1.91:1) | Facebook, LinkedIn (1200×627 ok), WhatsApp, Slack, iMessage |
| Twitter/X large card | 1200×675 (16:9) | `twitter:card = summary_large_image` |
| Square variant | 1200×1200 | Some contexts and summary cards |

OG limits: Facebook min 600×315, < 8 MB; X min 300×157, < 5 MB. Aim for < 1 MB, PNG for text/flat graphics, JPEG for photos.

## 2. Design rules

- Favicon: simple silhouette, no text (one letter at most), strong contrast; test on light and dark tabs. If the logo is detailed, draw a simplified small-size version.
- App icons: square, solid background, mark at 60–70% of the tile, no fine text.
- OG images: keep text and logo in the central ~80%; 2–3 lines max, ~40 characters per line, 80–120 px type at 1200 wide (≥ 60 px minimum); logo + page-specific headline beats a generic brand image; high contrast because previews are small.

## 3. From an SVG logo (dependency-free)

```bash
python3 scripts/logo-design/scripts/export_variants.py logo-symbol.svg --web-icons --icon-bg "#0F7C80" --out-dir dist/web
python3 scripts/logo-design/scripts/export_variants.py logo-symbol.svg --favicon-source logo-symbol-small.svg --web-icons
```
Outputs favicon.ico, PNG icon set, app icons, `site.webmanifest` and a `<head>` snippet. Needs one renderer (cairosvg, rsvg-convert, Inkscape, Chrome or macOS Quick Look); `render_png.py --which` lists what's available.

## 4. From a raster logo, emoji or text (Pillow)

Check dependencies first: `python3 scripts/web-asset-generator/check_dependencies.py` (Pillow required; `pilmoji` only for emoji icons; install only with the user's OK).

```bash
# favicons + app icons from a logo image ('favicon', 'app' or 'all')
python3 scripts/web-asset-generator/generate_favicons.py logo.png out/ all
# emoji icon: get suggestions, then generate
python3 scripts/web-asset-generator/generate_favicons.py --suggest "coffee shop" out/ all
python3 scripts/web-asset-generator/generate_favicons.py --emoji "☕" --emoji-bg "#F5DEB3" out/ all
# OG images from a logo
python3 scripts/web-asset-generator/generate_og_images.py out/ --image logo.png
# OG images from text (+ optional logo)
python3 scripts/web-asset-generator/generate_og_images.py out/ --text "Ship posters in minutes" --logo logo.png --bg-color "#0F2A3D" --text-color white
```
Produces favicon-16/32/96, favicon.ico, apple-touch-icon, android-chrome-192/512, og-image (1200×630), twitter-image (1200×675), og-square (1200×1200). Add `--validate` to either script to check dimensions, file size and format against platform limits (and text contrast for OG images). `generate_og_images.py --platforms facebook|twitter|square|all` limits the outputs.

For a designed OG image (photo, layered type, brand fonts), build it in HTML/CSS at 1200×630 and screenshot it (banners guide), or generate one per page from a template.

## 5. HTML tags

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">

<meta property="og:title" content="Page title">
<meta property="og:description" content="One-sentence description">
<meta property="og:image" content="https://example.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="What the image shows">
<meta property="og:url" content="https://example.com/page">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://example.com/twitter-image.png">
```
`og:image` must be an absolute HTTPS URL. Framework homes: Next.js `app/layout.tsx` metadata (or `app/icon.png`, `opengraph-image.png` file conventions), Astro layout `<head>`, SvelteKit `src/app.html`, Nuxt `nuxt.config`/`app.vue`, plain `index.html`. Before editing a project's files, show the diff and get a yes.

## 6. Test

Facebook Sharing Debugger, LinkedIn Post Inspector, an OG preview site (e.g. opengraph.xyz); platforms cache aggressively, so re-scrape after changes. Check the favicon in a real tab, light and dark.

## 7. Checks

- [ ] All sizes present and exact; ICO contains 16 and 32
- [ ] Favicon readable at 16 px on light and dark
- [ ] App icons opaque with padding
- [ ] OG text inside the central 80%, legible as a small preview
- [ ] Tags use absolute URLs and correct dimensions

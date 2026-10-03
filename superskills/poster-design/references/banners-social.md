# Banners, social graphics, ads and resizing

> Distilled from: banner-design and design/social-photos (nextlevelbuilder/ui-ux-pro-max-skill, MIT), banner-creator (resciencelab/opc-skills, Apache-2.0), canva-resize-for-social-media (canva-sdks/canva-skills, Apache-2.0), web-asset-generator (alonw0/web-asset-generator, MIT), higgsfield-brandkit (higgsfield-ai/skills, MIT).

## 1. Sizes

### Social posts and stories
| Platform | Format | Pixels | Ratio |
|---|---|---|---|
| Instagram | Portrait post / carousel | 1080×1350 | 4:5 |
| Instagram | Square post | 1080×1080 | 1:1 |
| Instagram / Facebook / TikTok | Story, reel cover | 1080×1920 | 9:16 |
| Facebook | Link/feed post | 1200×630 | 1.91:1 |
| X / Twitter | In-feed image | 1200×675 | 16:9 |
| LinkedIn | Post | 1200×627 | 1.91:1 |
| Pinterest | Pin | 1000×1500 | 2:3 |
| Threads | Post | 1080×1080 | 1:1 |
| YouTube | Thumbnail | 1280×720 | 16:9 (see thumbnails guide) |

### Headers and covers
| Platform | Pixels | Notes |
|---|---|---|
| X / Twitter header | 1500×500 | 3:1; avatar covers bottom-left |
| LinkedIn personal | 1584×396 | 4:1; avatar covers left |
| LinkedIn company | 1128×191 | ~6:1 |
| Facebook cover | 820×312 desktop, 640×360 mobile | Keep content in the overlap |
| Facebook event | 1920×1080 | 16:9 |
| YouTube channel art | 2560×1440 | Safe area 1546×423 in the centre |
| GitHub README / social preview | 1280×640 | 2:1 |
| Discord server | 960×540 | 16:9 |
| Product Hunt gallery | 1270×760 | |
| Email header | 600×200 | |
| Website hero | 1920×600–1080 | Section banner 1200×400, blog header 1200×628 |

### Display ads (Google Display Network)
300×250 medium rectangle (best performer), 336×280, 728×90 leaderboard, 970×250 billboard, 160×600 skyscraper, 300×600 half page, 320×50 and 320×100 mobile.

### Print banners
Roll-up 850×2000 mm; trade-show 33×78 in; step-and-repeat 8×8 ft; outdoor vinyl 6×3 ft. 300 dpi at small sizes, 150 dpi for large format, CMYK, 3–5 mm bleed (see print guide).

Platform specs change; if the user's platform is not listed or exactness matters, check the platform's current help page.

## 2. Design rules

- **Safe zone**: critical text, logo and CTA in the central 70–80%; keep ≥ 50–100 px from edges; stories keep the top ~250 px and bottom ~340 px clear of UI.
- **One message, one CTA** per banner. CTA: action verb ("Get", "Start", "Book"), high contrast, bottom-right for Z-reading, min 44 px tall for tap targets.
- **Max 2 typefaces**, headline ≥ 32 px (digital banners) and ≥ 64 px on 1080-wide social, body ≥ 16 px.
- **Ads**: under ~20% of the area as text; ≤ 7 words per line, ≤ 3 lines.
- **Social covers**: about 60/40 image to text.
- Brand assets: use only the logo, colours and fonts the user supplied or approved; never invent brand rules.

## 3. Art directions (pick 2–3 per brief)

Minimalist (SaaS, 1–2 colours) · Bold typography (announcements, type is the hero) · Gradient/colour wash · Photo-based (full-bleed + overlay) · Illustrated · Geometric/abstract (tech, fintech) · Retro/vintage (halftone, muted) · Glassmorphism · 3D/sculptural · Neon/dark (gaming, events) · Duotone photo · Editorial/magazine grid · Collage/mixed media · Retro-futurism · Anti-design · Kawaii/digi-cute · Tactile/puffy · Data-led (number as hero) · Dark moody (jewel tones) · Flat solid colour · Nature/organic · Motion-ready (layered for animation).

For each option, write one line on why it fits the purpose.

## 4. Build route A: HTML/CSS → PNG (exact, editable, default)

1. One HTML file per idea × size. Root element at the exact pixel size, `overflow:hidden`, fonts loaded via Google Fonts or `@font-face`.
2. Visuals from CSS (gradients, shapes, type), supplied images, or a generated **text-free** background image.
3. Overlay headline, support line, CTA and logo as real text/SVG.
4. Wait for fonts, then screenshot at the exact viewport with device scale factor 2 (Chrome headless, Playwright, Puppeteer, or `python3 scripts/logo-design/scripts/render_png.py banner.html -o banner.png --width 1500 --height 500`).
5. Open the PNG and check: pixel size, crop, safe zone, font actually loaded, contrast, file size.
6. If capture is unavailable, deliver the HTML and say PNG export is pending. Never claim a PNG you did not produce.

Naming: `assets/banners/{campaign}/{style}-{W}x{H}.png`, kebab-case; prefix `YYMMDD-` for time-bound campaigns.

## 5. Build route B: image model, then crop

1. Generate at the widest ratio the model supports (21:9 or 16:9) so one image serves several crops. Keep text out of the generation unless it is a casual 1–5 word headline.
2. Choose on composition; iterate on favourites.
3. Crop to each target:
```bash
python3 scripts/banner-creator/crop_banner.py in.png github.png --ratio 2:1 --width 1280
python3 scripts/banner-creator/crop_banner.py in.png x-header.png --size 1500x500
python3 scripts/banner-creator/crop_banner.py in.png hero.png --ratio 16:9 --width 1920
```
(Pillow required. Centre crop; check that no subject or text crosses the crop line.)
4. Add the type layer with route A on top of the cropped image.

If the model cannot output an exact ratio (e.g. no 4:5), generate 3:4 with a centred 4:5 safe area, then crop the vertical excess (`magick in.png -gravity center -crop 100%x93.75%+0+0 +repage out.png`) and verify the final ratio.

## 6. Resizing one design to many formats

Do not just scale. For each target:
1. Re-anchor: keep the focal element and headline inside the new safe zone.
2. Reflow: horizontal layouts (1.91:1, 3:1) put image left/right of text; vertical (4:5, 9:16) stack image over text.
3. Re-check type size against the new width (a 1200-wide headline at 80 px becomes ~72 px at 1080 wide, not 40).
4. Drop secondary text in the smallest formats rather than shrinking it below the minimums.
5. Export and inspect every size; stories and posts in a set must share palette, type and logo position.

In Canva, use the Canva guide (resize via the Canva connector). In code, keep one HTML template with CSS variables for `--W/--H` and a layout class per ratio.

## 7. Consistency for a set

- Same Brand Lock (palette roles, fonts, logo variant, grid, radius) on every asset.
- Variation lives only in the content and composition section.
- Review all sizes side by side before delivering; any unexplained difference is drift.

## 8. File size limits (typical)

X < 5 MB; LinkedIn < 8 MB; Facebook < 8 MB; GitHub < 10 MB; web heroes ideally < 500 KB (export WebP/AVIF + JPEG fallback). PNG for flat graphics and text, JPEG/WebP for photos.

## 9. Checks

- [ ] Exact pixel size and ratio per platform
- [ ] Text, logo, CTA inside the safe zone; nothing hidden by avatars or UI
- [ ] Headline readable at phone size (~360 px wide view)
- [ ] Contrast ≥ 4.5:1; one CTA; ≤ 2 typefaces
- [ ] Exact supplied copy, no invented claims or prices
- [ ] All sizes in the set look like one family

---
name: poster-design
description: Poster and graphic design end to end - layout, typography, colour and contrast rules; posters, flyers, art prints and editorial posters rendered in code (PNG/PDF/SVG/HTML); AI-image posters, movie/book/album and article covers; social posts, stories, banners, headers, display ads and multi-size resizing; YouTube thumbnails and video covers; brand kits, brand guidelines, themes, brand boards and identity mockups; logos, wordmarks, monograms and app icons in SVG; infographics and visual summaries; print files, bleed, CMYK and academic/conference research posters in LaTeX or PPTX; Canva resize and bulk-create from CSV; favicons, PWA icons and Open Graph images with meta tags. Use when asked to design, make, fix or critique a poster, flyer, cover, banner, header, social graphic, ad, thumbnail, logo, brand kit, style guide, theme, infographic, research poster, favicon or OG image, or when resizing a design for several platforms.
---

# Poster & graphic design

Covers every static graphic job: posters, covers, social and ad graphics, thumbnails, logos, brand systems, infographics, print and research posters, Canva workflows and web assets. The output is a file the user can use (PNG/PDF/SVG/HTML/PPTX/LaTeX or a Canva link), built with code, an image model, or both. A graphic has one job: be understood in three seconds at its real size. You own the hierarchy, the words and the checks, whatever tool makes the pixels.

## Core principles

1. **One focal point, one message.** The glance pass (1–3 s, or ~200 px wide) shows one image and one headline. Cut until that's true.
2. **Hierarchy by size first.** Headline ≥ 3× body; ≤ 6 words (thumbnails 2–4). Three text levels; four at most.
3. **Text goes on as a separate, editable layer.** Exact copy, dates, prices, brands, print and client work: generate or draw the image without text, then set type in HTML/SVG/Canva/Figma/LaTeX. Only casual 1–5 word headlines may be model-rendered. If model text is wrong, regenerate or switch routes; never paint over it. (All sources agree on the second half; the type-layer default wins because it is editable, spell-checkable and print-safe.)
4. **Max 2 typefaces, 2–4 colours with hex values and roles** (60/30/10). Limited palettes look intentional.
5. **Contrast ≥ 4.5:1** for all text; scrim, block or stroke on busy images. Never encode meaning by colour alone.
6. **Margins and safe zones**: ≥ 5% of the short side; critical content in the central 70–80% on platform formats; print has 3 mm bleed.
7. **Exact sizes for the destination.** Build at the real pixel/mm size, then export; don't stretch.
8. **Concept before pixels.** Brainstorm several ideas (5 for thumbnails, 8–12 one-liners for logos), present 3 different directions, then build the chosen one.
9. **Describe traits, not living artists.** "3-colour screen print, halftone, mis-registration" instead of a name; never copy logos, layouts or identities from references.
10. **Never invent facts.** No made-up claims, statistics, prices, people or logos; data stays verbatim; thumbnails stay truthful to the video.
11. **Systems over one-offs.** Series share a frozen style block or Brand Lock; only the content line changes.
12. **Look at your work.** Render, open and inspect at 100% and at thumbnail size before showing anything. Don't claim checks you didn't run.
13. **Refine, don't add.** The second pass improves what exists (alignment, spacing, contrast) instead of adding decoration.
14. **Approvals are explicit.** Brand, logo and big batch steps wait for a clear yes; silence is not approval.

## Pick the right guide

Name the task, or say "use poster-design: <capability>".

| Task | Read | Scripts / templates |
|---|---|---|
| Layout, grid, hierarchy, type sizes, colour, contrast; "why does this look off" | references/foundations.md | — |
| Poster or art print rendered with code (no image model), typographic/Swiss/screen-print looks, editorial/magazine poster | references/code-rendered-posters.md | templates/magazine-poster/example.html |
| Poster, flyer, event graphic, movie/book/album or article cover with an image model; consistent series | references/ai-image-posters.md | scripts/banner-creator/crop_banner.py |
| Social posts/stories, banners, headers, display ads, website heroes; resizing one design to many sizes | references/banners-social.md | scripts/banner-creator/crop_banner.py, scripts/logo-design/scripts/render_png.py |
| YouTube thumbnail, Shorts/Reels cover | references/thumbnails.md | templates/higgsfield-youtube-thumbnail/text-overlay-bake.md |
| Brand kit, brand guidelines, theme for slides/docs/pages, brand board, CIP mockups, applying a brand | references/brand-kits.md | templates/theme-factory/themes/, templates/logo-design/brand-guidelines-template.md |
| Logo, wordmark, monogram, app icon design, logo critique or redesign | references/logos.md | scripts/logo-design/scripts/ (svg_audit, render_png, preview_sheet, concept_sheet, presentation_board, export_variants), scripts/logo-creator/crop_logo.py, templates/logo-design/presentation-spec.example.json |
| Infographic, visual summary, data poster | references/infographics.md | — |
| Print files (bleed, CMYK, dpi), research/conference poster in LaTeX, PPTX or HTML | references/print-and-academic-posters.md | templates/latex-posters/ (beamerposter, tikzposter, baposter .tex, poster_quality_checklist.md), scripts/latex-posters/review_poster.sh |
| Canva: resize a design for social, bulk-create designs from CSV | references/canva.md | — |
| Favicons, PWA/app icons, Open Graph / Twitter images, meta tags | references/web-assets.md | scripts/web-asset-generator/ (generate_favicons.py, generate_og_images.py, check_dependencies.py), scripts/logo-design/scripts/export_variants.py |
| Higgsfield CLI (paid) for thumbnails, brand mockups, logos | references/higgsfield.md | — |

Scripts are Python 3 (logo-design scripts are dependency-free; web-asset-generator, crop_banner and crop_logo need Pillow, crop_logo also numpy). Run them by full path from the skill folder; don't install packages without the user's OK.

## Default workflow

1. **Brief.** Purpose, audience, destination and exact size, exact copy (headline, details, CTA), brand assets, deadline/format. Ask at most 3–5 questions in one message; otherwise state assumptions and go.
2. **Pick the route.** Code-rendered (exact type, vector, editable) vs image model (photoreal, painterly, mood) vs hybrid (generated text-free image + code type layer, the usual best). Canva if the user works there.
3. **Concepts.** 3 distinct directions, one line each (concept, composition, palette hex, type pair). Let the user pick unless they asked you to just deliver.
4. **Build** at the exact size, on a grid, with the Brand Lock or style block if one exists. Save prompts to files; save iterations with version numbers.
5. **Look and test.** Render, open, check at 100% and at thumbnail size; run the relevant script checks (svg_audit, review_poster.sh, --validate).
6. **Refine** what's there (second pass), fix failures, re-render.
7. **Deliver** final files + editable source + fonts used + one line per decision. List anything not done or not verified.

## Done means

- [ ] Exact size/ratio (and bleed for print) for the destination
- [ ] Every word spelled correctly, checked letter by letter, matching the supplied copy
- [ ] One clear focal point; headline readable at thumbnail size (~200 px wide)
- [ ] Contrast ≥ 4.5:1; ≤ 2 typefaces; palette as specified
- [ ] Nothing important outside the safe zone; nothing overlaps or clips by accident
- [ ] No invented logos, claims, data, watermarks or stray text; faces/hands/products correct at 100%
- [ ] Editable source delivered (HTML/SVG/PDF/PPTX/.tex/Canva link) alongside the export
- [ ] You actually looked at the final render

# Canva workflows (Canva connector / MCP)

> Distilled from: canva-resize-for-social-media and canva-bulk-create (canva-sdks/canva-skills, Apache-2.0).

These need the Canva connector (MCP tools such as `search-designs`, `get-design`, `resize-design`, `search-brand-templates`, `get-brand-template-dataset`, `autofill-design`, `upload-asset-from-url`). Check which tools exist in the session first; if a needed tool is missing, say so and offer the code route (banners guide) instead. Tool names vary slightly between hosts; match by purpose.

## 1. Find the design

Accept any of:
- Design ID (starts with `D`).
- Canva URL: the ID is the segment after `/design/` and before the next `/` or `?`.
- Name: search designs with the exact phrase; if several match, list them and ask.
- "The one we just made": reuse the ID from this conversation.

Confirm it exists with `get-design` and note its title for naming.

## 2. Resize for social media

Ask which formats unless the user said "all":

| Format | Size |
|---|---|
| Facebook post | 1200×630 |
| Facebook story | 1080×1920 |
| Instagram post | 1080×1080 (offer 1080×1350 4:5 too) |
| Instagram story | 1080×1920 |
| LinkedIn post | 1200×627 |

Call `resize-design` once per format **in parallel** with `design_type: {type: "custom", width: W, height: H}`. If one fails, finish the rest and report which failed.

Present results grouped by platform with each new design's edit link (from the response's edit URL). Mention that Facebook and Instagram stories share the same size.

Canva's resize only scales and repositions; tell the user to open each result and check: text inside the safe zone, headline still large enough, nothing cropped (see the resizing checklist in the banners guide). Offer to describe fixes per format.

## 3. Bulk-create from data (one design per row)

Requires a **brand template with autofill fields** (Canva Enterprise / Teams autofill).

1. **Get the data**: uploaded CSV/XLSX, pasted table, JSON, or URL. Show headers, row count (= number of designs) and the first 3 rows.
2. **Pick a template**: search brand templates with a non-empty dataset; let the user choose.
3. **Read the template fields** (`get-brand-template-dataset`): names and types (text, image, chart). Field names are case-sensitive.
4. **Map columns to fields** in a table and confirm with the user:

| Template field | Type | CSV column | Note |
|---|---|---|---|
| product_name | text | Product Name | auto-matched |
| hero_image | image | image_url | needs upload first |

Images: a Canva asset ID column can be used directly; an image URL column must be uploaded first (`upload-asset-from-url`, right before that row) to get an asset ID; no image column → ask whether to keep the template's default image (omit the key) or stop. Chart fields need structured data: ask.
5. **Create sequentially**, one `autofill-design` call per row, titled meaningfully (`Bulk – Row 3 – Oak Chair`). Log `Row n/N: created <link>` or `failed <reason>`; continue past failures; skip rows where every mapped field is empty (and say so).
6. **Report**: attempted, succeeded (links), failed (row + reason); offer a summary CSV (`row,status,design_url,error`).

Before large runs (50+ rows): warn that it makes N API calls and cannot be undone in bulk; offer a test run on the first 3 rows.

## 4. Good practice in Canva

- Set brand colours and fonts in the Brand Kit first so every design pulls the same tokens.
- Build master designs at the largest format, then resize.
- Text set in Canva stays editable: prefer it over text baked into AI images.
- Export: PNG for social, PDF Print with bleed and crop marks for print, MP4/GIF for animated.

# Product catalog, bulk edits, audits and Merchant Center feeds

> Distilled from: shopify-products (jezweb/claude-skills, MIT); shopify-catalog-audit with triage-method and queries (kgelster/awesome-ecom-skills, MIT); google-shopping-feed (finsilabs/awesome-ecommerce-skills, MIT); mapi-developer-assistant (google/merchant-api-samples, Apache-2.0). The CSV template and the two Merchant API scripts are copied unchanged with their licences.

Clean product data feeds everything downstream: filters, search, the product page, feeds, ads, analytics and inventory. Fix data at the source (the platform), not in each channel.

## 1. Product data model

| Field | Rule |
|---|---|
| Title | Brand + product + key attribute; no promo text ("SALE!") in the title |
| Handle / slug | Stable, lowercase, hyphenated; changing it later needs a redirect |
| Description | Real content: what it is, who it's for, materials, size and care; no empty or one-line descriptions on live products |
| Product type / category | Filled for every product; map to the platform's standard taxonomy and to Google's product category |
| Vendor / brand | Filled; feeds and filters depend on it |
| Options and variants | Up to 3 options (Size, Colour, Material) on Shopify per the source; one variant per sellable combination |
| SKU | Unique per variant, stable, never reused for a different item |
| GTIN (barcode) / MPN | Add every manufacturer barcode you have; private label without GTIN uses brand + MPN |
| Price / compare-at price | Compare-at only when it is a real former price and higher than price (see [pricing-and-promotions.md](pricing-and-promotions.md)) |
| Weight, requires shipping, taxable | Set per variant; wrong weights break shipping rates |
| Images | Several angles per product, alt text on every image, variant images linked |
| Custom fields | Metafields (Shopify) or attributes; typed, defined once, reused |
| Status | Draft until reviewed; active when complete |

## 2. Bulk create and edit

| Volume | Route |
|---|---|
| 1 to 5 products | API mutations, one by one ([shopify-apps-and-apis.md](shopify-apps-and-apis.md) section 3) |
| 6 to 50 | API in a paced loop |
| 20+ new products a merchant will review | CSV import (`templates/shopify-products/product-csv-template.csv` for Shopify) |
| Thousands of updates | Platform bulk operations or import tools |

**Shopify CSV rules (per the source):** UTF-8, up to 50 MB; one row per variant; the first row of a product carries title, body and vendor, later rows carry only the `Handle` plus variant columns; an existing `Handle` updates that product; `Published = TRUE` makes it live immediately, so default to `FALSE` and publish after review.

**Every bulk edit follows the same safety loop:**

1. Export the current state of every product you will touch (CSV or JSON). That is the rollback.
2. Build the change set in code and print a diff: count of products, and old vs new for a sample of rows and every outlier (biggest price change, zero price, empty title).
3. Get the user's yes on the diff, not on the idea.
4. Apply to one product or a small batch, check it in admin and on the storefront, then run the rest.
5. Read back and compare against the intended state; report mismatches.

Sources for product data: the user's own files, their supplier's feed or price list, or their own site. Don't scrape other retailers' or marketplaces' listings.

## 3. Auditing a large catalog

Don't paste a whole catalog into the model. Build a cheap index, reason over it, deep-read only the suspicious slice, and verify against the live API.

1. **Index in code.** Paginate products with only the fields that reveal problems and compute flags per product:
   - images: 0 (missing) or 1 (thin)
   - description: empty or under about 20 characters after stripping HTML
   - price: any variant at `0.00`; compare-at set but less than or equal to price (fake or inverted sale)
   - taxonomy: empty product type or vendor
   - context: status and published date
2. **Hypothesise with reasons.** Rank clusters and say why for each: "every product from vendor X created on 3 June has no images: one broken import". No reason, no deep-read. Weight by live impact: a $0 active, published product is a revenue leak; a $0 draft is noise.
3. **Deep-read only that slice.** Pull full detail for the products the hypotheses point at.
4. **Verify against the live admin API**, not the index and not the sitemap (the sitemap lists published products only and misses drafts and archived debris).
5. **State coverage.** "Checked images, description length, pricing anomalies and type/vendor on all 6,000 products. Did not check variant option consistency, metafields, broken image URLs or SEO fields." A short findings list never means the catalog is clean.

Audits are read-only: use a `read_products` token. Fixes go through the bulk-edit loop above.

## 4. Google Merchant Center feeds

**Connect through the platform first:**

| Platform | Route |
|---|---|
| Shopify | Google & YouTube sales channel syncs products to Merchant Center |
| WooCommerce | Google for WooCommerce plugin (formerly Google Listings & Ads); a feed plugin for custom labels and supplemental feeds |
| BigCommerce | Channel Manager, Google Shopping channel |
| Custom or headless | An XML or TSV feed URL, or the Merchant API for near-real-time price and stock |

**Account basics:** verify and claim the website, accept the policies, set up shipping and returns, link Google Ads. Ads campaigns on top of the feed belong to `google-ads`.

**Custom feed: one item per variant.**

| Attribute | Rule |
|---|---|
| `id` | Stable per variant (SKU); never recycle |
| `title` | Brand + product + key attributes; up to 150 characters; the first ~70 show, so front-load |
| `description` | Up to 5,000 characters; no promo text |
| `link`, `image_link` | Landing page returns 200 and shows that variant; large, clean main image |
| `price`, `availability` | Must match the landing page exactly, including currency |
| `brand`, `gtin`, `mpn` | GTIN whenever one exists; `identifier_exists: no` only for products that truly have none |
| `google_product_category`, `product_type` | Map each product type to Google's taxonomy |
| `item_group_id` | Same value for all variants of one product; variants differ by `color`, `size`, `pattern`, `material` |
| `condition` | `new`, `refurbished` or `used` |

Serve the feed with a cache (an hour is plenty) and keep its URL stable across deploys.

**Fixing disapprovals:** open Merchant Center diagnostics and work by count.

| Issue | Usual cause and fix |
|---|---|
| Price mismatch | Feed price differs from the page or its structured data, often during a sale: update both, or use a supplemental feed for sale prices |
| Missing identifiers | Add GTIN or brand + MPN; don't fake `identifier_exists` |
| Landing page error | URL changed in a deploy or redirects; fix the link pattern |
| Image issues | Promo overlays, watermarks, placeholders or small images |
| Variants shown as separate products | Missing or inconsistent `item_group_id` |
| Policy violation | Read the named policy; health claims, counterfeit and restricted products are common |

Product structured data on the page (`Product`, `Offer`) must agree with the feed; hand that markup to `seo`.

## 5. Merchant API (developer side)

The Merchant API replaces the Content API for Shopping, and Google has announced the Content API's retirement: write new code against the Merchant API, migrate Content API code, and check the current shutdown date. Prefer `v1` (stable) samples over beta.

Look things up instead of guessing:

```bash
bash scripts/mapi-developer-assistant/query_mapi_docs.sh "What is the Merchant API equivalent of accountstatuses.get?"
bash scripts/mapi-developer-assistant/find_mapi_code_sample.sh "insert product input" python
```

Both scripts send only the question text to Google's own docs endpoint (`merchantapi.googleapis.com`). Never put tokens, merchant ids or customer data in the question. Don't run inserts, updates or deletes against a live Merchant Center account without the user's confirmation.

## Checklist

- [ ] Every live product: title, description, type, vendor, images with alt text, SKU, price, GTIN or MPN
- [ ] Bulk edits: export first, diff shown, user said yes, small batch first, read back
- [ ] Audit: indexed, hypotheses justified, verified on the live API, coverage stated
- [ ] Feed: one item per variant, `item_group_id` set, price and availability match the page
- [ ] Merchant Center diagnostics checked; disapprovals fixed at the source
- [ ] Merchant API used for new code; no live writes without confirmation

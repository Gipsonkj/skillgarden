# Product pages and store conversion

> Distilled from: shopify-expert liquid-templating and performance-optimization (jeffallan/claude-skills, MIT); shopify-catalog-audit PDP quality flags (kgelster/awesome-ecom-skills, MIT); ecom health checks for multi-item orders, cross-sell lift and free-shipping thresholds (takechanman1228/claude-ecom, MIT); dynamic-pricing-ecommerce trust rules (nexscope-ai/eCommerce-Skills, MIT). The medusajs storefront-best-practices skill has no licence and was not used.

Store conversion is mostly about removing doubt: is this the right item, what will it cost in total, when will it arrive, and can I send it back. General page copy and landing-page CRO live in `website-building`; this guide is the store-specific part.

## 1. Audit before redesigning

Measure the funnel first (needs analytics: sessions, product views, add-to-cart, checkout started, purchases) and find the biggest drop.

| Step | Healthy sign | If it drops here, look at |
|---|---|---|
| Collection to product | Clicks spread over many products | Filters, sort, product cards, thumbnails, prices on cards |
| Product to add-to-cart | Steady rate per traffic source | Images, variant picker, price clarity, shipping and returns info, reviews, stock |
| Cart to checkout | Most carts proceed | Surprise costs, forced account, discount-code hunt, slow cart |
| Checkout to purchase | Platform checkout is usually fine | Payment methods, shipping options and cost, errors on mobile |

Segment by device and traffic source before concluding: a mobile-only drop is usually a layout or speed bug.

## 2. Product page essentials

**Above the fold on mobile:** title, price (with compare-at only if it is a real former price), the main image, variant selection, availability, and the add-to-cart button.

1. **Images:** several angles, scale or on-body shots, the variant image switches with the variant, zoom works on touch. Missing or single images are the first thing a catalog audit flags.
2. **Variant picker:** buttons or swatches for 2 to 8 values, a dropdown for more; unavailable combinations disabled and labelled, not hidden; the selected variant in the URL so links and ads land on it.
3. **Price block:** the price the shopper will pay, unit price where required, instalment or subscription price clearly secondary; never a compare-at price that wasn't really charged.
4. **Delivery and returns next to the button:** delivery estimate or cost to the shopper's region, free-shipping threshold if any, returns window in one line with a link to the policy.
5. **Product details:** materials, dimensions, size guide (with a real measurement table), care, what's in the box. Write from the shopper's questions; product copy itself goes to `content-creation`.
6. **Reviews:** only real reviews from real buyers; show the count and the distribution; let shoppers filter by rating. Never write, buy or seed reviews, and never hide negative ones. Rating markup must reflect reviews visible on the page.
7. **Stock messages:** "Only 3 left" only when the stock number is real; no fake countdowns or invented "12 people are viewing this".
8. **Cross-sell:** a few genuinely related items ("pairs with", "complete the set") below the main purchase area. Base them on real co-purchase data where you have it (pairs bought together far more often than chance).
9. **Out of stock:** keep the page live with a back-in-stock option and alternatives; don't 404 a product that will return.

## 3. Collection and search pages

- Filters built from clean data: product type, size, colour, price, availability, and metafields that matter for the category. Empty or mis-typed product types break them (fix in [catalog-and-feeds.md](catalog-and-feeds.md)).
- Default sort by what sells (best sellers or a curated order), not alphabetically.
- Product cards: image, title, price, a swatch or "more colours" hint, and an out-of-stock state.
- Search handles typos and synonyms (platform search settings or a search app); zero-result searches are a weekly to-do list.
- Faceted URLs and pagination have SEO consequences: hand canonical and crawl rules to `seo`.

## 4. Cart and basket size

- The cart shows line items with images and variants, editable quantities, the subtotal, the shipping threshold progress, and the checkout button high on mobile.
- **Free-shipping threshold:** the ecom engine's default heuristic sets it around 1.2x the median order value and checks that orders near the threshold actually rise. A threshold far above most orders does nothing; one below the median gives margin away.
- **Multi-item orders:** if few orders contain two or more items, bundles, "complete the look" and sensible quantity breaks are the lever (see [store-analytics.md](store-analytics.md) for the check).
- Upsells in the cart: one or two relevant items, never added to the cart by default.

## 5. Speed is conversion

- LCP under 2.5 s, INP under 200 ms, CLS under 0.1 on mobile field data.
- The main product image is the LCP element on most PDPs: serve it sized from the CDN, eager-load it with high fetch priority, and reserve its space.
- Every app adds script weight: remove unused apps and their leftover snippets; load review and chat widgets after interaction or below the fold.
- Platform specifics: Shopify in [shopify-themes.md](shopify-themes.md) section 6; the general method in `website-building`.

## 6. Trust and honesty rules

- Total cost shown as early as possible; no fees revealed only at the last step.
- Real policies: shipping, returns, privacy, terms, contact details that work.
- No dark patterns: no pre-ticked add-ons, confirm-shaming, hidden subscriptions, fake scarcity or fake urgency, no drip pricing.
- Accessibility basics: every image has alt text, variant swatches have names, the picker works by keyboard, errors are announced.

## 7. Testing changes

- One change per test, a primary metric chosen in advance (conversion to purchase or revenue per visitor), and enough traffic to detect the effect. Small stores often can't reach significance on small tweaks: make bigger, clearly better changes and watch the trend instead.
- Watch guardrails: average order value, return rate, discount usage.
- Test design, sample size and readouts go to `data-analysis`.

## Checklist

- [ ] Funnel measured and the biggest drop named, split by device
- [ ] PDP: images, variant picker with URL state, true price, delivery and returns line, details, real reviews
- [ ] Collections: filters from clean data, sensible default sort, zero-result searches reviewed
- [ ] Cart: threshold progress, edit in place, no default-added upsells
- [ ] Mobile Core Web Vitals within targets; unused app scripts removed
- [ ] No dark patterns, no fabricated reviews, scarcity or urgency

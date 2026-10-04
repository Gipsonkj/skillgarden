# Shopify apps and APIs

> Distilled from: shopify-expert app-development, storefront-api and checkout-customization (jeffallan/claude-skills, MIT); shopify-products (jezweb/claude-skills, MIT); shopify-catalog-audit queries and store-access notes (kgelster/awesome-ecom-skills, MIT). Shopify AI Toolkit facts come from the source notes only; that skill is link-only (telemetry).

Shopify ships a new API version every quarter (`2025-07`, `2025-10`, ...). Field names, mutations and limits in this guide are as of the sources (Admin API 2025-01 to 2025-07). **Pin a version in code and check shopify.dev for the version you pin** before trusting any field name here.

## 1. Pick the surface

| Job | API | Auth |
|---|---|---|
| Read or change products, inventory, orders, customers, metafields | Admin GraphQL API | Admin access token or app session (server only) |
| Product pages, collections, search, cart in a custom front end | Storefront API | Public storefront token (safe in the browser) or private token server-side |
| Customer login and order history in a headless store | Customer Account API | OAuth on behalf of the customer |
| Custom discount, shipping, payment, validation or cart-line logic | Shopify Functions | Deployed in an app |
| UI inside checkout, thank-you or order status pages | Checkout UI extensions | Deployed in an app |
| UI inside a theme (reviews widget, size chart) | Theme app extension (app blocks) | Deployed in an app |

The REST Admin API is legacy: write new code against GraphQL.

## 2. Getting store access

- **One store, scripts or audits:** a custom app with only the scopes needed (`read_products` for an audit, `write_products` only when the user wants writes). The place to create custom apps has moved over time (store admin, now the Shopify Dev Dashboard for newer setups): follow the current docs. Export the token as an environment variable; never commit it.
- **No stored token:** Shopify CLI can authenticate interactively (`shopify store auth --store <store> --scopes read_products`) and run validated queries (`shopify store execute`), per the catalog-audit source; check `shopify version` first.
- **Apps for many merchants:** scaffold with `npm create @shopify/app@latest` (the source's template is Remix-based; newer templates may differ), declare scopes in `shopify.app.toml`, and let the library handle OAuth and session storage.

```bash
curl -s "https://$SHOPIFY_STORE/admin/api/2025-07/graphql.json" \
  -H "X-Shopify-Access-Token: $SHOPIFY_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ shop { name } }"}'
```

## 3. Admin GraphQL: products, variants, inventory

| Scenario | Method |
|---|---|
| 1 to 5 products | `productCreate` / `productUpdate` mutations |
| 6 to 50 products | Same mutations in a paced loop, reading the cost budget |
| Bulk import a merchant can review | CSV import in admin (`templates/shopify-products/product-csv-template.csv`) |
| Thousands of writes or reads | Bulk operations (`bulkOperationRunMutation` with a staged JSONL file; `bulkOperationRunQuery` for reads) |
| Add or edit variants on an existing product | `productVariantsBulkCreate` / `productVariantsBulkUpdate` |
| Stock levels | `inventorySetQuantities` per inventory item and location |
| Custom fields | `metafieldsSet` (typed: `single_line_text_field`, `list.single_line_text_field`, `json`, references) |
| Collections | `collectionAddProducts` |

Rules from the sources:

1. **Create as `DRAFT`, then publish.** Confirm with the user before setting `status: ACTIVE`; that makes products live.
2. **Prices are strings** (`"29.95"`); compare as decimals, never floats.
3. **Every mutation returns `userErrors`:** read them on every call; a 200 response can still mean nothing changed.
4. **Options and variants have limits.** The source (API 2025-01) gives 3 options and 100 variants per product; Shopify has been raising the variant limit on newer versions, so check the current limit before splitting products.
5. **Images:** pass public URLs as media on create, or use `stagedUploadsCreate` then `productCreateMedia` for local files.
6. **Inventory is per location:** query `locations` first, set quantities per `inventoryItemId` and `locationId`, and give a `reason`.
7. **Verify by reading back** the products you touched and give the user the admin URL to review.

## 4. Query cost and pagination

The Admin API is cost-throttled, not request-throttled. Every response has `extensions.cost.throttleStatus` (`maximumAvailable`, `currentlyAvailable`, `restoreRate`). The source reports a 1,000-point bucket refilling 100/s on a standard store and 10,000 refilling 1,000/s on Plus: read the live numbers rather than assuming.

- Paginate with `first` + `after: endCursor` until `hasNextPage` is false; keep `first` around 100 with lean fields.
- Nested connections multiply cost: `variants(first: 100)` inside `products(first: 100)` is expensive and **silently truncates** products with more variants. Paginate the sub-connection when it matters.
- Pause when `currentlyAvailable` drops below the next query's cost; on `THROTTLED` or 429, back off about 2 s and retry the same page without advancing the cursor.
- Narrow server-side with the `query:` argument (`status:active`, `vendor:'Acme'`, `created_at:>2026-06-01`).
- Run concurrent requests only on Plus-sized buckets, with a shared point budget.

## 5. Webhooks

- Subscribe in `shopify.app.toml` (or via the API) to the topics you act on: `orders/create`, `products/update`, `app/uninstalled`, inventory topics.
- **Verify the HMAC** (`X-Shopify-Hmac-Sha256`) on the raw body before parsing; the app libraries do this for you.
- Respond with 200 fast and process in a queue; make handlers idempotent (deliveries repeat and arrive out of order); re-fetch the object when order matters.
- Public apps must handle the privacy topics `customers/data_request`, `customers/redact` and `shop/redact`.

## 6. Storefront API and Hydrogen

- Endpoint `https://<store>/api/<version>/graphql.json` with header `X-Shopify-Storefront-Access-Token`.
- Cart: `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`; send the shopper to `cart.checkoutUrl` for Shopify's checkout. Read `userErrors` on every cart mutation.
- Localise with `@inContext(country: X, language: Y)` so prices, currency and availability follow Shopify Markets.
- Fetch only what renders: `featuredImage { url(transform: { maxWidth: 800 }) }`, `variants(first: 10)` on a PDP, fragments for product cards.
- Hydrogen is Shopify's React framework for headless storefronts, hosted on Oxygen or elsewhere. Cache by data type (`CacheLong` for menus, `CacheShort` for products, `CacheNone` for customer data). Its routing base has changed between major versions: follow the current Hydrogen docs.

## 7. Functions and checkout extensions

| Need | Use |
|---|---|
| Volume, tiered or bundle discounts | Discount Function |
| Hide, rename or reorder shipping options | Delivery customization Function |
| Hide or reorder payment methods | Payment customization Function |
| Block checkout on a rule (quantity limits, address rules) | Cart and checkout validation Function |
| Add a banner, field, upsell or message in checkout | Checkout UI extension |
| Upsell after payment | Post-purchase or thank-you page extension |

- Functions run inside Shopify (Rust or JavaScript compiled to WebAssembly) on an input GraphQL query; keep them small, deterministic and fast, with no network calls in standard targets.
- Some checkout extension targets (information, shipping, payment steps) need Shopify Plus; thank-you and order-status targets are wider. Check the plan before promising a placement.
- Generate with `shopify app generate extension`, preview with `shopify app dev` on a development store, and test guest, logged-in, express-checkout, multi-currency and error paths before `shopify app deploy`.

## 8. Safety rules for live stores

- Read-only first: run the query, show the user what will change (count, old value, new value for a sample), then write.
- Start with one product or a draft copy, check it in admin, then batch.
- Bulk price, inventory, status or delete changes need an explicit yes each time; keep the before-state (export or JSON) so you can roll back.
- Never put the Admin token in theme code, a storefront bundle or a repo.

## 9. When to install Shopify's AI Toolkit

Shopify's official AI Toolkit plugin (the `shopify` skill) covers every Shopify developer surface and validates generated GraphQL, Liquid and Functions code against the live schema before returning it. Suggest it when the user does sustained Shopify development (apps, Functions, extensions, Hydrogen) and wants schema-checked code. Install command per the source notes: `claude plugin install shopify-ai-toolkit@claude-plugins-official` (or `npx skills add shopify/shopify-ai-toolkit --skill shopify`); check the current install docs.

Tell the user before they install it: its hook and scripts send usage data to shopify.dev, including search queries, validated code, model and client ids, session and tool-use ids and, when supplied, the verbatim prompt (up to 2,000 characters). To opt out, set `OPT_OUT_INSTRUMENTATION=true` in the environment or create an empty file at `~/.config/shopify-ai-toolkit/opt-out`. Don't install it on the user's behalf without that conversation.

## Checklist

- [ ] API version pinned and checked against current docs
- [ ] Least-privilege scopes; tokens in environment variables only
- [ ] `userErrors` read on every mutation; results read back
- [ ] Cost budget respected; sub-connections paginated where truncation matters
- [ ] Webhooks HMAC-verified, idempotent, privacy topics handled (public apps)
- [ ] Live writes previewed, confirmed and reversible

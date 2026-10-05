# Choosing a store platform

> Distilled from: shopify-expert (jeffallan/claude-skills, MIT); headless-checkout-proxy (vtex/skills, MIT); woocommerce-store-api (woocommerce/woocommerce, GPL-2.0-or-later); google-shopping-feed platform notes (finsilabs/awesome-ecommerce-skills, MIT). Medusa and Saleor are described from their public positioning only; their agent skills have no licence and were not copied.

The platform decides who owns hosting, checkout, PCI scope, upgrades and the app ecosystem. Pick it from the business, not from the stack the developer likes. Most stores that fail technically fail because they built what a platform already gives them.

## 1. Ask these first

| Question | Why it decides things |
|---|---|
| How many SKUs and variants, and how often do they change? | Variant limits, bulk tooling, feed volume |
| Physical, digital, subscription, B2B or marketplace (many sellers)? | Checkout, tax, payouts (Connect), fulfilment |
| Which countries, currencies and languages? | Markets, tax registrations, translations |
| Who will run it day to day: a merchant team or developers? | Admin UX vs code ownership |
| Is there an existing site, ERP, POS or WordPress install? | Integration cost often beats licence cost |
| What must the storefront do that a good theme can't? | The only real reason to go headless |
| Budget for monthly fees, apps, transaction fees and hosting? | Total cost, not the plan price |

## 2. Options at a glance

| Platform | Fits | Owns for you | You own |
|---|---|---|---|
| **Shopify** (themes) | Most D2C brands, small teams, fast launch | Hosting, checkout, PCI, payments, CDN, upgrades | Theme code, app choice, data quality |
| **Shopify headless** (Hydrogen or custom front end on the Storefront API) | Brands with a front-end team and a UX a theme can't do | Checkout, catalog, orders | The whole front end, hosting (or Oxygen), SEO, performance |
| **WooCommerce** | Stores already on WordPress, content-heavy shops, full code control | Little: it is a plugin | Hosting, updates, security, PCI scope of your setup, plugin conflicts |
| **BigCommerce** | Mid-size catalogs wanting SaaS with open APIs | Hosting, checkout | Theme or headless front end |
| **Wix** (Wix Stores) | Small stores whose site already lives on Wix, owners who edit visually | Hosting, checkout, site builder | Products, settings; payments need a premium plan that supports them (section 8) |
| **Medusa** | Developer teams wanting an open-source Node/TypeScript commerce backend they extend in code | Commerce modules and admin | Hosting, front end, integrations |
| **Saleor** | Teams wanting an open-source, GraphQL-first headless backend (Python/Django) | Commerce API and dashboard | Hosting, front end, integrations |
| **VTEX** and other enterprise suites | Large multi-brand or marketplace retail | Commerce platform, often marketplace features | BFF and storefront for headless builds |

Platform features, plans and fees change often: check the vendor's current pricing and plan pages before recommending, and name the date you checked.

## 3. Decision rules

1. **Default to hosted Shopify with a theme** when the team is small, the catalog is ordinary and nobody wants to run servers. Its checkout is hard to beat and can't be replaced anyway, only extended.
2. **Choose WooCommerce** when the business already lives in WordPress or needs full code ownership, and someone will own updates, backups and security. Budget for a managed WordPress host.
3. **Go headless only with a named reason**: a custom experience the theme system can't express, several storefronts on one catalog, or a front end the team already maintains. Headless moves SEO, performance, caching, preview and accessibility onto you.
4. **Choose an open-source backend (Medusa, Saleor)** when the business logic is the product (custom pricing, multi-vendor rules, unusual fulfilment) and there is a developer team for the life of the store.
5. **Marketplaces with many sellers** need split payouts and seller onboarding: plan Stripe Connect or the platform's marketplace features from day one (see [checkout-and-payments.md](checkout-and-payments.md)).
6. **Don't migrate for a feature an app provides.** Price the app first.

## 4. Theme vs app vs headless on Shopify

| Need | Use |
|---|---|
| Change how the storefront looks or what a page shows | Theme: sections, blocks, snippets ([shopify-themes.md](shopify-themes.md)) |
| Merchant-facing tool, automation, integration, data sync | App on the Admin GraphQL API ([shopify-apps-and-apis.md](shopify-apps-and-apis.md)) |
| Add UI to checkout, thank-you or order status pages | Checkout UI extension (some targets need Shopify Plus) |
| Change discounts, shipping options, payment options or cart lines with logic | Shopify Functions |
| Fully custom front end | Storefront API, usually with Hydrogen |
| Replace Shopify's checkout | Not possible: extend it instead |

## 5. Headless architecture rules (any backend)

- Put a **BFF (server layer) between the browser and the commerce API** for anything carrying personal data or admin credentials. Public catalog reads can go direct with a public token.
- **Keep cart and checkout ids server-side** in a session where the platform's model allows it; never trust prices or variant attributes from the client.
- **Card data never touches your servers.** Use the provider's hosted fields, payment element or direct-to-gateway call, so your BFF stays out of PCI scope.
- **Plan caching per data type:** catalog and menus cache long, prices and stock short, cart and customer data not at all.
- Budget for what the theme gave you for free: sitemaps, structured data, image CDN, preview for merchandisers, analytics events, accessibility.

## 6. Migration checklist

- [ ] Export products, variants, images, customers, orders, gift cards and redirects; count each and compare after import.
- [ ] Map every old URL to a new one with 301s before DNS changes (hand off to `seo` for the migration plan).
- [ ] Recreate tax settings, shipping zones, payment methods and email templates; place test orders end to end.
- [ ] Reconnect feeds (Merchant Center), pixels and analytics; check conversion tracking fires once.
- [ ] Freeze catalog edits during the cut-over window; run a final delta import.

## 7. Shopify's own AI Toolkit

Shopify publishes an official AI Toolkit plugin (`shopify` skill) that searches shopify.dev and validates GraphQL, Liquid and Functions code against the live schema. It is not copied into this craft because its hook and scripts report usage to shopify.dev: search queries, validated code, model and client ids, session ids and, when supplied, the verbatim prompt (up to 2,000 characters). When to suggest it and how to opt out is in [shopify-apps-and-apis.md](shopify-apps-and-apis.md) section 9.

## 8. Running a Wix store from Claude

Wix Stores sells from a Wix site; to accept payments the site needs a Premium or Studio plan that supports them. Per store: up to 50,000 products, 6 options per product, 100 choices per option, 1,000 variants per product.

**Pick a tool**

| Need or situation | Use | Why |
|---|---|---|
| The owner already works through one of these | That one | Ask whether they use the Claude connector, an API key or the dashboard |
| Ask questions, look things up, small edits with the owner watching | Wix MCP (built-in Claude connector, or `claude mcp add --transport http wix-mcp-remote https://mcp.wix.com/mcp`) | Signs in with the owner's Wix account; no key to handle |
| Scripted or repeatable jobs (catalog audits, bulk price or stock updates, order exports) | REST API with an API key | Exact calls you can review, re-run and log |
| Owner prefers a spreadsheet, or a one-off migration | Dashboard CSV import and export | No access to grant; owner applies it |

**Wix MCP.** It searches Wix docs, writes Wix code and calls APIs on the owner's sites (`ExecuteWixAPI` is the default for store data); it can also create and publish sites. Wix warns it may change live sites: turn off auto-run in the client so each tool call needs approval, and show the exact change before any write. If the connection drops, log out and back in (or delete `~/.mcp-auth`).

**REST API.**
- Keys: the account owner (or co-owner) creates one in the API Keys Manager (`manage.wix.com/account/api-keys`), with scopes and the sites it may touch; key creation needs SMS 2-step verification. Keep it in an environment variable; ask for the narrowest scopes.
- Headers: `Authorization: $WIX_API_KEY` plus `wix-site-id` (or `wix-account-id`, never both). The site id is the part after `/dashboard/` in the dashboard URL. Host `https://www.wixapis.com`.
- **Check the catalog version first:** `GET /stores/v3/provision/version` returns `V1_CATALOG`, `V3_CATALOG` or `STORES_NOT_INSTALLED`. A site runs one or the other, permanently, and V1 and V3 endpoints aren't interchangeable. The calls below are V3.
- Products: `POST /stores/v3/products/query` (up to 100 per page; hidden products need admin read scope) or `/stores/v3/products/search`; create with `POST /stores/v3/products` (needs `name`, `productType` and a variant price; it creates no inventory items, use Create Product With Inventory for that); update with `PATCH /stores/v3/products/{id}` passing the current `revision`. Array fields such as `options` and `variantsInfo.variants` replace the whole array, so send it complete. Bulk: `POST /stores/v3/bulk/products/update`, up to 100 products.
- Inventory is per variant and per location: `POST /stores/v3/inventory-items/query` and `POST /stores/v3/bulk/inventory-items/update` (up to 1,000 items, each with `quantity` or `inStock`, plus `revision`).
- Orders: `POST /ecom/v1/orders/search` (up to 100 per page; filter on `number`, `status`, `paymentStatus`, `fulfillmentStatus`, `createdDate`). Fulfil with `POST /ecom/v1/fulfillments/orders/{orderId}/create-fulfillment` (approved orders only; `trackingNumber` and `shippingProvider` together); it may email the buyer, so confirm first.
- Errors: 429 means throttled, wait a minute and retry (no numeric limit is published); 409 means a stale `revision`, so re-read and retry.

```bash
curl -s -X POST https://www.wixapis.com/stores/v3/products/query \
  -H "Authorization: $WIX_API_KEY" -H "wix-site-id: $WIX_SITE_ID" \
  -H "Content-Type: application/json" -d '{"query":{"cursorPaging":{"limit":100}}}'
```

**CSV.** Dashboard product import takes files up to 15MB and 10,000 rows (digital products not supported; keep the column names); export gives up to 5,000 rows per file. Owner runs the import after reviewing the file.

**Headless.** A custom front end on Wix Stores uses `@wix/sdk` with `OAuthStrategy({ clientId })`; the client id is in the project's Headless Settings, no secret in the browser. Headless rules: section 5.

## Pitfalls

- Recommending headless for "speed" without a front-end team: a good theme is usually faster in practice.
- Comparing plan prices but not transaction fees, app subscriptions and payment rates.
- Picking WooCommerce without anyone owning plugin updates and backups.
- Assuming checkout can be fully redesigned on Shopify.
- Calling Wix V1 catalog endpoints on a V3 store (or the reverse): check the catalog version first.

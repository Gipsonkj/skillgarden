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

## Pitfalls

- Recommending headless for "speed" without a front-end team: a good theme is usually faster in practice.
- Comparing plan prices but not transaction fees, app subscriptions and payment rates.
- Picking WooCommerce without anyone owning plugin updates and backups.
- Assuming checkout can be fully redesigned on Shopify.

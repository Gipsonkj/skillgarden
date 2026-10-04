---
name: ecommerce
description: Build and run an online store: platform, storefront, payments, products, stock and sales. Covers picking Shopify, WooCommerce, Medusa, Saleor or headless; Shopify themes (Liquid, theme check), apps and APIs (Admin and Storefront GraphQL, bulk operations, Functions, checkout extensions, Hydrogen), when to install Shopify's AI Toolkit; WooCommerce Store API, headless carts; store checkout (Stripe Checkout, subscriptions, Stripe Tax, marketplaces); catalogs, variants, CSV imports, bulk edits, catalog audits, Merchant Center feeds and API; product pages, store CRO; pricing, discounts, repricing; inventory, reorders, orders, fulfilment; store analytics (revenue drops, AOV, LTV, cohorts); agentic commerce (UCP, ACP). Triggers: "set up a Shopify store", "build a Liquid section", "bulk update prices", "why did sales drop", "what should I reorder", "fix Merchant Center disapprovals", "let AI agents buy from our store". Shopping ads: google-ads. Stripe outside a store: backend-databases.
---

# E-commerce

Covers building and running an online store end to end: choosing the platform, Shopify themes and apps, WooCommerce and headless builds, checkout and payments for a store, product data and feeds, product pages and store conversion, pricing and promotions, inventory and fulfilment, store analytics, and selling to or buying through AI agents. General web builds, general Stripe integration, ads, SEO, product photos and copy belong to neighbouring crafts and are handed off below.

## Core principles

1. **Platform-native first.** Use the platform's checkout, apps, feed channels and Functions before custom code. Shopify's checkout can be extended, never replaced. Go headless only with a named reason and a team to own it.
2. **Writes to a live store need a yes.** Price, inventory, status, order, refund and delete changes: export the before-state, show a diff (count, old vs new, outliers), apply to one item or a small batch, read back. Theme publishes too.
3. **No purchase without the buyer's confirmation.** An agent completes a checkout only after the buyer has seen item, seller, every total line, delivery and payment, and said yes. Totals that don't add up mean hand off, not complete.
4. **Money is exact.** Integers in minor units or decimal strings, never floats; prices come from the catalog on the server, never from the client.
5. **Fulfil from webhooks, not the thank-you page.** Gate on payment status, handle async success and failure, refunds and disputes; handlers are idempotent.
6. **Tax isn't on until it's verified.** Stripe's `automatic_tax` collects nothing without an active registration; run a test calculation. Where to register is the user's tax adviser's call.
7. **Pin API versions and check current docs.** Shopify ships quarterly versions; Stripe, UCP and ACP change often. Facts here are as of the sources.
8. **Least privilege.** `read_products` for audits, admin tokens only on servers, storefront tokens are the only ones in a browser, card data never touches your servers.
9. **The variant is the unit.** Inventory, velocity, feed items, images and prices are per variant (and per location).
10. **Index, then deep-read.** Audit big catalogs from a cheap flag table, deep-read only the justified slice, verify on the live API, state what wasn't checked.
11. **Collected revenue first, then levers.** Orders x AOV, new vs returning, refunds, mix; pending is pipeline, not loss; samples of 5 or fewer are shown as counts.
12. **Stockouts are suppressed demand.** Divide by days in stock, time stockouts on the faster rate, size orders on the 28-day rate, subtract inbound, cost every line.
13. **Price on contribution.** Floors from real costs and fees; compare-at prices only when really charged; repricing bounded, logged and with a kill switch.
14. **Honest selling.** Real reviews only, no fake scarcity or urgency, no hidden fees, no scraping competitors or marketplaces against their terms.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "New Shopify store with a product import and Shopping feed: `references/platform-choice.md` → `references/catalog-and-feeds.md` → `references/shopify-themes.md`; product copy from `content-creation` → `references/conversion-copy.md`; the Shopping campaign from `google-ads` → `references/campaign-build.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Which platform (Shopify, WooCommerce, BigCommerce, Medusa, Saleor, VTEX, headless), theme vs app vs headless, migrations | [references/platform-choice.md](references/platform-choice.md) |
| Shopify theme work: sections, blocks, snippets, schema, LiquidDoc, translations, variant pickers, filters, theme performance, Shopify CLI, theme check | [references/shopify-themes.md](references/shopify-themes.md) |
| Shopify Admin GraphQL (products, variants, inventory, metafields, bulk operations), query cost, webhooks, Storefront API carts, Hydrogen, Functions, checkout extensions, Shopify's AI Toolkit (and its telemetry opt-out) | [references/shopify-apps-and-apis.md](references/shopify-apps-and-apis.md) |
| WooCommerce Store API (cart, nonce, Cart-Token, variations), extending it, running Woo safely, headless BFF rules, Medusa and Saleor | [references/woocommerce-and-headless.md](references/woocommerce-and-headless.md) |
| Store checkout: Stripe Checkout Sessions from a cart, shipping, promo codes, subscribe and save, Stripe Tax registrations, marketplaces with Connect, checkout UX, PCI | [references/checkout-and-payments.md](references/checkout-and-payments.md) |
| Product data model, CSV imports, bulk edits, catalog audits, Google Merchant Center feeds and disapprovals, Merchant API | [references/catalog-and-feeds.md](references/catalog-and-feeds.md) + `templates/shopify-products/product-csv-template.csv`, `scripts/mapi-developer-assistant/` |
| Product pages, collections, search, cart, free-shipping threshold, store funnel and CRO, trust and dark-pattern rules | [references/product-pages-and-cro.md](references/product-pages-and-cro.md) |
| Unit economics, price floors, discount health, promo calendar, stacking, dynamic repricing with guardrails | [references/pricing-and-promotions.md](references/pricing-and-promotions.md) |
| What to reorder and when, velocity, stockout dates, reorder sizing, slow movers, seasonality, POs, orders, fulfilment and returns | [references/inventory-and-fulfilment.md](references/inventory-and-fulfilment.md) |
| Why revenue dropped, AOV, repeat rate, LTV, cohorts, RFM, store health checks, business review write-ups | [references/store-analytics.md](references/store-analytics.md) |
| AI agents shopping (UCP CLI: search, cart, checkout, escalation), ACP merchant checkout endpoints, making a store agent-ready | [references/agentic-commerce.md](references/agentic-commerce.md) |

To use one capability directly, name the task, or say "use ecommerce: <capability>" (for example "use ecommerce: what should I reorder").

## Bundled scripts and templates

| File | Does | When |
|---|---|---|
| `templates/shopify-products/product-csv-template.csv` (jezweb/claude-skills, MIT) | Blank Shopify product import header row | Bulk-creating 20+ products for the merchant to review and import; fill one row per variant, `Published` = `FALSE` |
| `scripts/mapi-developer-assistant/query_mapi_docs.sh` (google/merchant-api-samples, Apache-2.0) | Asks Google's Merchant API docs endpoint a question | Any Merchant API concept, quota or Content API migration question, before answering |
| `scripts/mapi-developer-assistant/find_mapi_code_sample.sh` (same) | Returns official Merchant API code samples, optional language | Before writing Merchant API code |

Both scripts send only the question text to `merchantapi.googleapis.com`; never include tokens, merchant ids or customer data in it.

## Other crafts

| When the request also needs | Use |
|---|---|
| Stripe webhooks, signature checks, keys and API upgrades beyond the store flow in `references/checkout-and-payments.md`; auth for customer accounts | `backend-databases` → `references/stripe.md`, `references/auth.md` |
| Shopping or Performance Max campaigns on the feed, conversion tracking for purchases | `google-ads` → `references/campaign-build.md`, `references/conversion-tracking.md` |
| Product and Offer structured data, faceted navigation, migrations and redirects | `seo` → `references/schema.md`, `references/architecture-linking.md`, `references/technical.md` |
| A marketing site or landing page around the store, general CRO and page speed | `website-building` → `references/plan-and-copy.md`, `references/performance-cwv.md` |
| Product photos, packshots, lifestyle shots and consistent product images | `image-creation` → `references/marketing-brand-images.md`, `references/editing-references-consistency.md` |
| Product descriptions, category copy and email or promo copy | `content-creation` → `references/conversion-copy.md` |
| Deeper analysis than `references/store-analytics.md`: SQL cohorts, A/B test readouts, dashboards | `data-analysis` → `references/sql.md`, `references/experiments-causal.md`, `references/dashboards-kpis.md` |
| End-to-end tests of cart and checkout flows | `testing-qa` → `references/playwright-e2e.md` |
| Securing store code, secrets and API keys | `security` → `references/secure-coding.md`, `references/secrets.md` |
| Abandoned-cart, browse, post-purchase and win-back emails, and the deliverability behind them | `email-marketing` → `references/sequences-and-lifecycle.md`, `references/deliverability.md`, `references/esp-platforms-and-analytics.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Shopify's own schema-validated help for every surface (Admin, Storefront, Functions, extensions, Hydrogen, POS) | [shopify](https://github.com/Shopify/Shopify-AI-Toolkit/tree/main/skills/shopify) (MIT; link-only here: reports usage and prompts to shopify.dev unless `OPT_OUT_INSTRUMENTATION=true`) |
| Every Liquid filter, tag and object, and all 33 schema setting types with full examples | [shopify-liquid-themes](https://github.com/Shopify/liquid-skills/tree/main/plugins/liquid-skills/skills/shopify-liquid-themes) (MIT, declared in plugin.json) |
| Stripe's full Connect (Accounts v2), billing, tax and security references with current API and SDK versions | [stripe-best-practices](https://github.com/stripe/ai/tree/main/skills/stripe-best-practices) (MIT) |
| Adding Store API routes in WooCommerce core: schema design, cache priming, auth tests | [woocommerce-store-api](https://github.com/woocommerce/woocommerce/tree/trunk/.ai/skills/woocommerce-store-api) (GPL-2.0-or-later) |
| Medusa v2 modules, workflows, API routes and module links | [building-with-medusa](https://github.com/medusajs/medusa-agent-skills/tree/main/plugins/medusa-dev/skills/building-with-medusa) (no licence: read only) |
| A Python engine that computes ~30 store health checks and a REVIEW.md from an order CSV | [ecom](https://github.com/takechanman1228/claude-ecom/tree/main/skills/ecom) (MIT; its SessionStart hook pip-installs from PyPI: read it before enabling) |
| Full UCP CLI reference: catalog filters, fulfilment payloads, profiles, error codes | [ucp](https://github.com/Shopify/ucp-cli/tree/main/skills/ucp) (MIT; can complete real purchases, keep the confirmation step) |
| Reorder planning with connectors, PO documents and vendor emails in the owner's voice | [inventory-planner](https://github.com/anthropics/knowledge-work-plugins/tree/main/small-business/skills/inventory-planner) (Apache-2.0) |

## Default workflow

1. **Locate.** Which platform, plan and store; which surfaces (theme, app, API, checkout, feed); live store or development store; what access exists.
2. **Read before writing.** Pull the current state: theme files and JSON templates, product export, settings, analytics for the period. Pin API versions.
3. **Plan.** Split the request (Plan the request), pick guides, and agree scope and success measures with the user.
4. **Build on a safe copy.** Unpublished theme, development store, sandbox keys, draft products, staging WordPress.
5. **Preview and confirm.** Show diffs and totals for anything that touches the live store, money or a real purchase; wait for the yes.
6. **Apply in small batches.** One product, one SKU group or one vendor first; then the rest.
7. **Verify.** Read back via the API, `shopify theme check`, place test orders in a sandbox, check Merchant Center diagnostics, re-run the numbers.
8. **Report.** What changed (ids, counts, before and after), what was verified, what wasn't, and what the user should watch next.

## Done means

- [ ] Platform-native features used before custom code; reasons stated for any headless or custom checkout
- [ ] Live-store writes previewed, confirmed, batched, reversible and read back
- [ ] No purchase completed without the buyer's explicit confirmation of item, seller, totals, delivery and payment
- [ ] Money exact (minor units or decimal strings), prices from the server-side catalog
- [ ] Fulfilment, refunds and disputes driven by verified, idempotent webhooks
- [ ] Tax verified with a test calculation, not assumed; tax advice left to an adviser
- [ ] API versions pinned; version-specific facts checked against current docs
- [ ] Analysis states periods, levers, sample sizes and what wasn't checked
- [ ] No fake reviews, fake scarcity, hidden fees or terms-breaking scraping

# Credits

The router and references are written in this skill's own words from the licensed sources below, plus general knowledge of Shopify, WooCommerce, Stripe, Google Merchant Center and Core Web Vitals. Version-specific facts are as of the sources and are marked "check current docs" where they change often. The template and scripts are copied unchanged with their licence beside them.

## Sources used

| Source | Repo | Licence | What was used |
|---|---|---|---|
| stripe-best-practices | [stripe/ai](https://github.com/stripe/ai/tree/main/skills/stripe-best-practices) | MIT | Integration surfaces, dynamic payment methods, webhook fulfilment rules, Billing, Stripe Tax registration trap and verification, Connect Accounts v2 configurations (checkout-and-payments.md) |
| shopify-expert | [jeffallan/claude-skills](https://github.com/jeffallan/claude-skills/tree/main/skills/shopify-expert) | MIT | Theme vs app vs headless split, Liquid patterns, theme performance, app scaffolding, webhooks and privacy topics, Storefront API carts, Hydrogen caching, Functions and checkout extensions (platform-choice.md, shopify-themes.md, shopify-apps-and-apis.md) |
| shopify-liquid-themes | [Shopify/liquid-skills](https://github.com/Shopify/liquid-skills/tree/main/plugins/liquid-skills/skills/shopify-liquid-themes) | MIT (declared in plugin.json; the repo has no LICENSE file, so nothing was copied verbatim) | Theme architecture, Liquid gotchas, schema rules, LiquidDoc, translation conventions, CSS patterns (shopify-themes.md) |
| shopify-products | [jezweb/claude-skills](https://github.com/jezweb/claude-skills/tree/main/plugins/shopify/skills/shopify-products) | MIT | `product-csv-template.csv` copied to `templates/shopify-products/`; method choice by volume, CSV rules, product mutations, staged uploads, inventory (shopify-apps-and-apis.md, catalog-and-feeds.md) |
| shopify-catalog-audit | [kgelster/awesome-ecom-skills](https://github.com/kgelster/awesome-ecom-skills/tree/main/skills/shopify-catalog-audit) | MIT | Index-hypothesise-deep-read-verify audit method, flags, coverage statements, query cost and pagination notes, CLI store access (catalog-and-feeds.md, shopify-apps-and-apis.md) |
| inventory-planner | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/main/small-business/skills/inventory-planner) | Apache-2.0 | Two-window velocity, stockout and reorder formulas, buffer cap, MOQ handling, slow movers, seasonality rules, PO and vendor email gate, gotchas (inventory-and-fulfilment.md) |
| revenue-drop-triage | [woocommerce/woocommerce-claude](https://github.com/woocommerce/woocommerce-claude/tree/trunk/plugins/woocommerce-for-claude/skills/revenue-drop-triage) | GPL-3.0 | Triage order, interpretation rules and report shape, restated in this skill's own words; no text or code copied (store-analytics.md) |
| woocommerce-store-api | [woocommerce/woocommerce](https://github.com/woocommerce/woocommerce/tree/trunk/.ai/skills/woocommerce-store-api) | GPL-2.0-or-later | Store API auth model (nonce, Cart-Token), REST shape, idempotency and variation reconciliation, restated in this skill's own words; no code copied (woocommerce-and-headless.md) |
| ecom | [takechanman1228/claude-ecom](https://github.com/takechanman1228/claude-ecom/tree/main/skills/ecom) | MIT | KPI tree, health-check thresholds, RFM segments, impact formula, focused-query and review format (store-analytics.md, pricing-and-promotions.md, product-pages-and-cro.md) |
| dynamic-pricing-ecommerce | [nexscope-ai/eCommerce-Skills](https://github.com/nexscope-ai/eCommerce-Skills/tree/main/dynamic-pricing-ecommerce) | MIT | Contribution and floor formulas, SKU tiers, signal register, rule matrix, simulations, governance and staged rollout (pricing-and-promotions.md). Its closing vendor hand-off block was left out |
| headless-checkout-proxy | [vtex/skills](https://github.com/vtex/skills/tree/main/skills/headless-checkout-proxy) | MIT (declared in package.json) | BFF rules, server-side cart ids, PCI carve-out for card data, request-body handoffs between order steps (woocommerce-and-headless.md, checkout-and-payments.md) |
| ucp | [Shopify/ucp-cli](https://github.com/Shopify/ucp-cli/tree/main/skills/ucp) | MIT | Buyer-side flow, seller identity, totals and disclosure contracts, escalation and hand-off order (agentic-commerce.md) |
| acp-checkout-rest | [OrcaQubits/agentic-commerce-skills-plugins](https://github.com/OrcaQubits/agentic-commerce-skills-plugins/tree/main/acp-agentic-commerce/skills/acp-checkout-rest) | MIT | ACP operations, state machine, headers, totals and error shape (agentic-commerce.md) |
| mapi-developer-assistant | [google/merchant-api-samples](https://github.com/google/merchant-api-samples/tree/main/agent-skills/mapi-developer-assistant) | Apache-2.0 | `query_mapi_docs.sh` and `find_mapi_code_sample.sh` copied to `scripts/mapi-developer-assistant/` (they call only Google's `merchantapi.googleapis.com` docs endpoint); search-then-act rule and v1-first preference (catalog-and-feeds.md) |
| google-shopping-feed | [finsilabs/awesome-ecommerce-skills](https://github.com/finsilabs/awesome-ecommerce-skills/tree/main/skills/marketing-growth/google-shopping-feed) | MIT | Platform feed connections, feed attributes, title rules, disapproval fixes (catalog-and-feeds.md) |

Licence texts: `templates/shopify-products/LICENSE` (MIT, Copyright (c) 2025 Jeremy Dawes (Jezweb)) and `scripts/mapi-developer-assistant/LICENSE` (Apache-2.0). Other sources were distilled, not copied. GPL sources were used for ideas and structure only; no GPL text or code appears here.

Not copied: the ecom skill's Python engine, `bin/ecom` launcher and SessionStart hook (the hook pip-installs from PyPI); the UCP CLI's `views/*.jmespath` (they ship with the CLI); the escalation-hook examples that post buyer data to webhooks; shopify-liquid-themes' reference files (no LICENSE file in the repo).

## Also see (not included)

Link-only: no licence, a security concern or terms-of-service issues. Nothing from them is copied or paraphrased here.

| Skill | Link | Why not included |
|---|---|---|
| shopify (Shopify AI Toolkit) | https://github.com/Shopify/Shopify-AI-Toolkit/tree/main/skills/shopify | Telemetry: its hook and scripts report search queries, validated code, model, client and session ids and, when supplied, the verbatim prompt (up to 2,000 chars) to shopify.dev/mcp/usage. Opt out with `OPT_OUT_INSTRUMENTATION=true` or an empty `~/.config/shopify-ai-toolkit/opt-out` file. The router says when to suggest it |
| storefront-best-practices | https://github.com/medusajs/medusa-agent-skills/tree/main/plugins/ecommerce-storefront/skills/storefront-best-practices | No licence found |
| building-with-medusa | https://github.com/medusajs/medusa-agent-skills/tree/main/plugins/medusa-dev/skills/building-with-medusa | No licence found |
| amazon-listing-optimization | https://github.com/nexscope-ai/Amazon-Skills/tree/main/amazon-listing-optimization | Security and terms: a bundled script scrapes amazon.com with a spoofed browser user agent |
| etsy-seller | https://github.com/moiz-za/etsy-seller-seo-system/tree/main/skill | Terms: its keyword phase scrapes Etsy suggestion and competitor search pages |

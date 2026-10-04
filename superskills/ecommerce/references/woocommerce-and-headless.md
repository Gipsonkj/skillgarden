# WooCommerce and headless commerce

> Distilled from: woocommerce-store-api with its authentication, rest-conventions, variation-handling and schema-design notes (woocommerce/woocommerce, GPL-2.0-or-later); headless-checkout-proxy (vtex/skills, MIT declared in package.json). Written in this skill's own words; no code copied from the GPL source. Medusa and Saleor appear by name only (their agent skills have no licence).

## 1. WooCommerce: two APIs, two jobs

| API | Path | For | Auth |
|---|---|---|---|
| **Store API** | `/wp-json/wc/store/v1/*` | Shopper actions: catalog, cart, checkout. Used by the Cart, Checkout and Mini-Cart blocks and by headless front ends | None for public reads; Nonce or Cart-Token for cart writes |
| **REST API (admin)** | `/wp-json/wc/v3/*` | Store management: products, orders, customers, coupons, reports | Consumer key and secret (server only) or Application Passwords |

Don't use the admin API from a browser and don't build shopper flows on it: the Store API exists so carts behave like the real checkout (taxes, coupons, shipping, stock).

## 2. Consuming the Store API from a front end

Typical calls:

```
GET  /wc/store/v1/products?per_page=24&page=1
GET  /wc/store/v1/cart
POST /wc/store/v1/cart/add-item        {"id": 42, "quantity": 1, "variation": [{"attribute": "pa_color", "value": "blue"}]}
POST /wc/store/v1/cart/apply-coupon    {"code": "WELCOME10"}
POST /wc/store/v1/checkout             billing, shipping, payment method data
```

- **Cart identity.** Same-site front ends use the WordPress cookie session: send the `Nonce` header on every cart write and replace it with the fresh `Nonce` returned in each response. Headless front ends on another domain use the `Cart-Token` header returned by the first cart call; token-bearing requests skip the nonce check. Store the token server-side or in a first-party cookie your BFF controls.
- **Missing nonce** returns 401 `woocommerce_rest_missing_nonce`; a bad one returns 403 `woocommerce_rest_invalid_nonce`.
- **Action routes return the whole cart** (add-item, apply-coupon), so re-render totals from the response instead of recomputing them in JavaScript.
- **Variations:** send either the variation id or the parent id plus attribute slugs (lowercase taxonomy slugs such as `pa_color: blue`). The server resolves and validates them; an "Any" attribute the shopper hasn't chosen returns 400 `woocommerce_rest_missing_variation_data`, a wrong value returns 400 `woocommerce_rest_invalid_variation_data` with the allowed values.
- **Money fields** come back as integer strings in minor units with `currency_minor_unit`; format with that, never with floats.
- The Store API can apply rate limiting to shoppers (anyone without editor rights); cache catalog reads at the edge rather than hammering it.

## 3. Extending the Store API (plugin or core work)

When adding a route under `/wc/store/v1/`:

1. **Schema is the contract.** Declare every field in the schema and return exactly that; don't add fields after the schema ran. Don't ship fields that can only ever have one value.
2. **Pick the base class by risk.** Read-only or own-auth routes extend `AbstractRoute`; anything that mutates per-user state through a cookie session extends `AbstractCartRoute` (it enforces the nonce) or implements an equivalent CSRF check. A cookie-authenticated POST without a nonce is a CSRF hole.
3. **Permission callbacks as closures:** `function () { return is_user_logged_in(); }` rather than a bare string; owner-only reads check ownership.
4. **REST shape.** Path identifies the resource, JSON body carries writes, query string carries filters; no body on GET and no side effects in GET. `POST /items` returns the created item with 201; `DELETE /items/{key}` returns 204; action routes (`/cart/add-item`) return the parent.
5. **Idempotency.** Hash a stable identity tuple for keys and sort attribute arrays first so `{a,b}` and `{b,a}` produce the same key.
6. **Server-authoritative variations.** Derive attributes from the variation product; treat client attributes as a claim to validate.
7. **Errors** throw the Store API's route exception with a specific code and 400/401/403/404; anything else becomes a generic 500.
8. **Tests:** unauthenticated 401, missing nonce 401, invalid nonce 403, cross-user 403 or 404, and every variation case above.

## 4. Running a WooCommerce store safely

- Managed WordPress hosting with daily backups, staging and automatic minor updates.
- Update WordPress, WooCommerce, the theme and plugins on staging first; test checkout after every update.
- Keep the plugin list short: each plugin is code running with full access to orders and customers.
- Use a payment plugin that keeps card entry in the provider's fields (hosted or embedded), so card data never touches your server.
- Store API keys (consumer key and secret) only on the server, with the narrowest permission (read for reporting).
- Google Merchant Center: the official Google for WooCommerce plugin (formerly Google Listings & Ads) syncs the feed; see [catalog-and-feeds.md](catalog-and-feeds.md).

## 5. Headless storefronts on any backend

These rules come from the VTEX checkout proxy pattern and apply to Shopify, WooCommerce, Medusa, Saleor or VTEX front ends.

1. **A BFF sits between browser and checkout API.** Personal data (email, address, phone) and admin credentials stay server-side; the browser talks to your `/api/cart/*` routes.
2. **Cart ids live server-side.** Keep the cart or order-form id in a server session (or an httpOnly cookie your BFF owns), not in `localStorage`; forward the platform's checkout cookies between BFF and platform.
3. **Validate every input** in the BFF; never forward `req.body` untouched; never accept a price from the client.
4. **Card data goes straight from the browser to the payment gateway** (hosted fields, payment element or the gateway's direct endpoint). The BFF must not proxy it, even "redacted" or "tokenised": anything it touches enters PCI scope.
5. **Multi-step order flows pass handoff values in the request body.** Values that link "place order" and "process order" (order group, transaction id) go back to the browser and return in the next request; a per-pod session can lose them on a multi-replica deploy, which leaves a charged shopper with a failed order.
6. **Respect platform time windows.** VTEX, for example, expects place, pay and process within about five minutes; run them as one user action.
7. **Cache by sensitivity:** catalog long, prices and stock short, cart and customer never.

## 6. Open-source backends

| Backend | Shape | Start with |
|---|---|---|
| **Medusa** | Node/TypeScript commerce framework: modules, workflows for mutations, store and admin API routes, admin dashboard, Next.js starter storefront | Medusa docs; the `building-with-medusa` skill is listed in the router's Go deeper table (no licence: read only) |
| **Saleor** | GraphQL-first headless commerce in Python/Django with a dashboard and apps via webhooks | Saleor docs |

For either: model money as integers or decimals with currency, run mutations through the framework's transactional workflow layer rather than raw DB writes, and put payments behind the provider's hosted UI.

## Checklist

- [ ] Shopper flows on the Store API (or platform equivalent), admin work on the admin API server-side
- [ ] Nonce or Cart-Token handled and refreshed; cart totals rendered from responses
- [ ] Variation input validated by the server; minor-unit money formatted correctly
- [ ] BFF holds cart ids and credentials; card data bypasses your servers
- [ ] New Store API routes: schema matches response, nonce-protected writes, auth tests
- [ ] Updates tested on staging, checkout re-tested after each

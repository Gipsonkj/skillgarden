# Checkout and payments for stores

> Distilled from: stripe-best-practices with its payments, billing, tax and connect references (stripe/ai, MIT); headless-checkout-proxy PCI rules (vtex/skills, MIT declared in package.json); shopify-expert checkout-customization (jeffallan/claude-skills, MIT). Stripe facts are as of the source, which names API version `2026-09-30.endive`: check docs.stripe.com before pinning.

This guide is the store side of taking money: carts, shipping, discounts, tax, subscriptions and marketplaces. Webhook mechanics, signature checks, key handling and API upgrades for Stripe in general are in `backend-databases` (`references/stripe.md`).

## 1. Use the platform's checkout when there is one

| Platform | Checkout | What you build |
|---|---|---|
| Shopify (theme or headless) | Shopify Checkout, always | Payment settings, Functions for discount, shipping and payment logic, checkout UI extensions ([shopify-apps-and-apis.md](shopify-apps-and-apis.md)) |
| WooCommerce | Woo checkout block + a payment plugin | Plugin choice and settings; card entry stays in the provider's fields |
| BigCommerce, VTEX, Saleor, Medusa | The platform's checkout or payment provider integration | Provider configuration; headless BFF rules in [woocommerce-and-headless.md](woocommerce-and-headless.md) |
| Custom store (your own cart and catalog) | **Stripe Checkout Sessions** | Everything below |

## 2. Stripe for a custom store: pick the surface

Preference order from Stripe's own guidance:

1. **Payment Links:** no code, a few simple products.
2. **Checkout (hosted or embedded):** most stores. Handles payment methods, discounts, shipping options, adaptive pricing, tax when enabled.
3. **Payment Element:** a custom-styled form inside your page, backed by Checkout Sessions (`ui_mode: 'custom'`) rather than a raw PaymentIntent where possible.

Don't use the Charges API, Sources, Tokens or the legacy Card Element for new work. Save cards for later with Setup Intents.

## 3. Cart to Checkout Session

```ts
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: cart.lines.map(l => ({ price: catalog[l.variantId].stripePriceId, quantity: l.quantity })),
  shipping_address_collection: { allowed_countries: ['US', 'CA'] },
  shipping_options: [{ shipping_rate: 'shr_standard' }, { shipping_rate: 'shr_express' }],
  allow_promotion_codes: true,
  automatic_tax: { enabled: true },          // only after a registration exists (section 5)
  success_url: `${url}/order/thanks?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${url}/cart`,
});
```

- **Prices come from your catalog on the server,** by Price id or computed server-side; never from the client's cart payload. Amounts are integers in minor units.
- **Never pass `payment_method_types`.** Omitting it turns on dynamic payment methods (wallets, local methods) managed in the Dashboard; restrict with payment method configurations or `excluded_payment_method_types` if needed. The only exception is Terminal (`card_present`).
- **Re-check stock when the session is created** and again at fulfilment; reserve or oversell deliberately, not by accident.
- **Fulfil from the webhook, not the thank-you page.** Handle `checkout.session.completed` and `checkout.session.async_payment_succeeded`, fulfil only when `payment_status` isn't `unpaid`, handle `checkout.session.async_payment_failed`. Decrement inventory, write the order and send the confirmation email in that handler. A store without the handler silently drops orders when a shopper closes the tab.
- **Handle money going back:** `charge.refunded` (restock, reverse loyalty points), `charge.dispute.created` (pause fulfilment, gather evidence).
- On API versions from `2026-03-25.dahlia`, `integration_identifier` on `checkout.sessions.create` tags sessions for comparing checkout flows in the Dashboard (per the source).

## 4. Subscriptions in a store (subscribe and save, boxes, memberships)

- Use Billing with Checkout (`mode: 'subscription'`); never build renewals with raw PaymentIntents in a loop.
- **One Product per plan** a customer can choose; several Prices on a Product only for billing variants of the same plan (monthly vs yearly, currencies).
- Give customers the **Customer Portal** to skip, swap, change card or cancel; make cancelling as easy as signing up.
- Drive access and shipments from `customer.subscription.*`, `invoice.paid` and `invoice.payment_failed`, plus the risk events above. These handlers are required, not a later phase.
- Usage-based billing goes to Metronome per Stripe's current guidance; uncommon in physical-goods stores.
- On Shopify, subscriptions run through a subscription app on Shopify's selling plans, not through Stripe.

## 5. Sales tax, VAT and GST with Stripe Tax

**The trap:** `automatic_tax: { enabled: true }` calculates and collects **nothing** until there is an active registration in the customer's jurisdiction, and it returns no error. The store thinks tax is on.

1. Set the head office address in Tax settings (status changes from `pending` to `active`).
2. Record a registration for each jurisdiction where the business is already registered with the tax authority. Adding it in Stripe doesn't register them with the authority. Prepare it and let the user confirm; never create or expire registrations on your own.
3. Enable `automatic_tax` on the Checkout Session, Subscription, Invoice or Payment Link.
4. **Verify:** run a test tax calculation with an address in that jurisdiction and the product's tax code; check `taxability_reason`. `not_collecting` means a missing registration or a Nontaxable code (`txcd_00000000`); other reasons, including a zero amount, can be correct.

- Tax codes go on the Product, `tax_behavior` (inclusive or exclusive) on the Price. Take codes from Stripe's tax code list; never guess a `txcd_` value, and let the user confirm the choice.
- `automatic_tax` can't coexist with manual `tax_rates` on the same object: clear them first.
- B2B cross-border: collect tax ids (`tax_id_collection: { enabled: true }`), or the sale is taxed as B2C.
- Threshold monitoring (Dashboard alerts) shows where the business may need to register; it is information, not advice. Where to register is a question for the user's tax adviser; say so rather than deciding.
- Sandbox registrations and settings don't carry into live mode: recreate them before the first real order.

## 6. Marketplaces and multi-seller stores (Stripe Connect)

| Model | Dashboard | Fees / losses | Charge pattern |
|---|---|---|---|
| Marketplace, platform owns checkout | `express` | `application` / `application` | Destination charges |
| Multi-seller cart (several sellers per order) | `express` | `application` / `application` | Separate charges and transfers |
| Store builder (sellers run their own stores) | `full` | `stripe` / `stripe` | Direct charges |

- Create connected accounts with **Accounts v2** (`/v2/core/accounts`), not the old `type: 'express'` pattern.
- Check the v2 capability status before taking payments or sending transfers (recipient `stripe_transfers` for marketplaces, merchant `card_payments` for store builders).
- Don't use `application_fee_amount` with separate charges and transfers; keep the fee in the transfer maths.
- Who collects and remits tax is a legal question: route it to the user's adviser, then set `automatic_tax.liability` accordingly.

## 7. Checkout experience rules

- Guest checkout always available; account creation optional and offered after payment.
- Show shipping cost, delivery estimate and tax (or "calculated at checkout") before the payment step; surprise costs at the last step are the classic abandonment cause.
- Wallets and local methods come from dynamic payment methods; don't hide them behind a card form.
- Keep the cart editable from checkout; preserve the cart across sessions and devices where the platform allows.
- Discount code fields: one clear field, specific error messages ("expired", "minimum not met").
- No pre-ticked add-ons, no hidden fees, no fake countdown timers.

## 8. PCI and keys

- Card data only ever enters the provider's hosted page, embedded element or direct gateway endpoint; your servers and BFF never see it.
- Restricted API keys (`rk_`) on the server, publishable key in the browser; separate sandboxes for local development and CI.
- Test with the provider's test cards in a sandbox, including a declined card, a 3-D Secure challenge and a delayed payment method, before going live.

## Checklist

- [ ] Platform checkout used where one exists; custom stores on Checkout Sessions
- [ ] Prices and stock checked server-side; no `payment_method_types`
- [ ] Fulfilment, refunds and disputes handled from webhooks (details: `backend-databases`)
- [ ] Tax: head office set, registrations confirmed by the user, test calculation not `not_collecting`
- [ ] Subscriptions: one Product per plan, portal on, lifecycle handlers live
- [ ] Marketplace: Accounts v2, capability checks, tax liability decided with an adviser
- [ ] Sandbox end-to-end run incl. decline, 3DS and delayed payment

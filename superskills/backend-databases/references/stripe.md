# Stripe payments (vendor-specific)

> Distilled from: stripe-best-practices, upgrade-stripe (stripe/ai, MIT).

Use this when integrating payments, subscriptions or webhooks with Stripe, or upgrading the Stripe API version or SDK.

## 1. Pick the integration

| Need | Use |
|---|---|
| One-time or subscription checkout, fastest path | **Checkout Sessions** (hosted page or embedded) |
| Custom payment form in your UI | Payment Element with Checkout Sessions or the Payment Intents API |
| Subscriptions management by customers | Billing + Customer Portal |
| Marketplace / platform payouts | Connect (choose account type deliberately) |
| In-person | Terminal |

- Let Stripe choose payment methods dynamically (configured in the Dashboard). Do not pass `payment_method_types` except for Terminal-style cases that require it.
- Do not use the legacy Charges or Sources APIs for new work.

## 2. Webhooks are required

The redirect back to your site is not proof of payment: users close tabs, and some methods settle later.

- Fulfil on `checkout.session.completed` **when `payment_status` is `paid`**, and on `checkout.session.async_payment_succeeded` for delayed methods. Handle `checkout.session.async_payment_failed`.
- Subscriptions: drive access from `customer.subscription.created/updated/deleted` and `invoice.paid` / `invoice.payment_failed`.
- **Verify signatures** with the raw request body and the endpoint secret (`stripe.webhooks.constructEvent(rawBody, sig, secret)`); body parsers that re-serialize JSON break verification.
- Return 2xx quickly and process asynchronously; Stripe retries for up to 3 days.
- Idempotent handlers: store processed `event.id`s; events can arrive more than once and out of order. Re-fetch the object from the API when ordering matters.
- Local testing: `stripe listen --forward-to localhost:3000/api/webhooks`, `stripe trigger checkout.session.completed`.

## 3. Keys and security

- Secret keys on the server only. Prefer **restricted keys** (`rk_...`) scoped to the resources the service uses.
- Publishable key (`pk_...`) is the only key in the client.
- Use idempotency keys on server-side create calls that might be retried.
- Never log full card data; you should never see it if you use Elements or Checkout.
- Amounts are integers in the smallest currency unit (cents); compute prices server-side from your catalog, never from client input.

## 4. SDK usage

- Instantiate a client object (`new Stripe(key, { apiVersion: '...' })`, `StripeClient` in newer SDKs) rather than global configuration.
- **Pin the API version explicitly** in code so SDK upgrades do not silently change behaviour.
- Store Stripe ids (`cus_`, `sub_`, `price_`) on your records; keep your database as a cache of Stripe state updated by webhooks.

## 5. Upgrading the API version

1. Read the changelog entries between your current pinned version and the target; list breaking changes that touch the objects you use.
2. Upgrade the SDK in a branch; set the new `apiVersion` explicitly.
3. Update webhook endpoint API versions (events are rendered with the endpoint's version): create a new endpoint on the new version, run both, then retire the old one.
4. Run tests in test mode against the new version, including webhook fixtures.
5. Deploy, watch error rates and webhook failures in the Dashboard.

## 6. Checklist

- [ ] Checkout Sessions (or Payment Element) with dynamic payment methods.
- [ ] Webhook signature verified on the raw body; handler idempotent by event id.
- [ ] Fulfilment gated on `payment_status` and async success events.
- [ ] Restricted server keys; only the publishable key in the client.
- [ ] API version pinned in code and on webhook endpoints.
- [ ] Test-mode end-to-end run including a failed and a delayed payment.

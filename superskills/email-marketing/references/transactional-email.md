# Transactional email

> Distilled from: email-best-practices transactional-emails, transactional-email-catalog, email-types, sending-reliability and webhooks-events references (resend/resend-skills, MIT), postmark-email-best-practices transactional-design and testing references and postmark-webhooks (ActiveCampaign/postmark-skills, MIT), email-template-builder (alirezarezvani/claude-skills, MIT), email-marketing-bible (CosmoBlk/email-marketing-bible, MIT).

Use for "what emails should my app send", "password reset email", "order confirmation", "receipt email", "OTP email", "emails sent twice", "handle bounces", "webhook for email events", "test emails without spamming real inboxes".

Vendor-neutral. API calls for each provider: [sending-apis.md](sending-apis.md). Templates: [templates-and-html.md](templates-and-html.md). The app code that fires these events (sign-up, auth, billing) lives in `backend-databases`; this guide covers the email side.

## 1. Transactional or marketing?

| | Transactional | Marketing |
|---|---|---|
| Trigger | A user action or account event they expect | Your decision to promote |
| Examples | Verification, password reset, OTP, receipt, shipping, security alert, renewal notice, failed payment | Newsletter, promo, cart reminder, win-back, product announcement |
| Consent | Not needed (part of the service) | Needed; unsubscribe required |
| Unsubscribe | No marketing unsubscribe; keep company name and address | Required, one-click |
| Stream | Transactional subdomain or stream | Marketing subdomain or stream |

**Do not mix.** A receipt with a promotional block becomes a marketing email under most laws and loses its exemption. A "welcome" email that sells is marketing. Abandoned-cart reminders are marketing even though they are triggered. If in doubt, treat it as marketing.

## 2. Which emails an app needs

| App type | Essential | Often added |
|---|---|---|
| Any app with accounts | Email verification, password reset, security alerts (new device, password or email changed) | OTP / 2FA, account update notices, deletion confirmation |
| Newsletter / content | Verification, password reset, non-promotional welcome, subscription confirmation | OTP |
| Ecommerce / marketplace | Verification, password reset, order confirmation, shipping notice, receipt or invoice, payment failed | Security alerts, subscription confirmations for repeat orders |
| SaaS / subscription | Verification, password reset, welcome, OTP, security alerts, subscription confirmation, renewal notice, payment failed, receipt | Account updates, notices of breaking changes |
| Fintech | Verification, password reset, OTP for sensitive actions, all security alerts, transaction notices | Statements |

## 3. Content rules per email

**All transactional email**
- One purpose, one primary action, sent within seconds of the event.
- Specific subject with an identifier: "Your order #12345 has shipped", "Reset your password for Acme". Not "Action required".
- Preheader under ~90 characters that adds context: "This link expires in 1 hour."
- Above the fold: what happened, the action button, any expiry.
- No promotional content in the main area. Keep it plain; plain renders reliably.
- From a recognisable name and a real address on your transactional subdomain (`orders@t.example.com`); a monitored reply-to. Avoid `noreply@`: people reply to receipts and alerts.
- Always include a plain-text part.

**Specific emails**

| Email | Must include | Must not |
|---|---|---|
| Password reset | Button, expiry (15-60 minutes is standard), "didn't ask for this? ignore it", security contact | Show the password, allow reuse, live longer than 24 hours |
| Verification | Link or code, how long it is valid, what to do if not you | Bundle onboarding content |
| OTP / 2FA | Code at 24-32 px in a monospace font, clear label, expiry next to it, easy to copy | Put the code in the subject |
| Order confirmation | Order ID, line items, quantities, prices, subtotal, tax, shipping, total, addresses, delivery estimate, status link, support contact | Upsell blocks in the main content |
| Shipping | Prominent tracking link, carrier, estimated delivery, items, order link | Hide tracking below the fold |
| Security alert | What happened (device, place, time), "if this was you, nothing to do", clear secure-my-account action | Marketing of any kind, alarmist tone, alerts for routine logins |
| Payment failed | Friendly cause, update-payment link, what happens and when | Guilt or threats |

**Re-send and expiry handling** (verification, OTP, magic links): allow re-send after 60 seconds, cap at about 3 per hour per address, show a countdown; an expired link shows a clear message and a "send a new link" button.

## 4. Sending reliably

### Idempotency
Retries after timeouts are the usual source of duplicate emails. Send an idempotency key derived from the business event, so a retry reuses it:
```
order-confirm/<orderId>
password-reset/<userId>/<resetRequestId>
```
- Never build the key from `Date.now()` or a fresh random value per attempt. If there is no natural key, generate a UUID once and store it with the job.
- Providers keep keys for a limited window (Resend: 24 hours, keys up to 256 characters; the same key with a different payload is rejected). Finish retries well inside the window.

### Retries
| Error | Retry? |
|---|---|
| 5xx, network timeout, DNS failure | Yes, with backoff |
| 429 rate limited | Yes, after the window (honour `Retry-After`) |
| 400, 401, 403, 404, 422 | No; fix the request, key, permission or domain verification |

Backoff about 1 s → 2 s → 4 s → 8 s with jitter, capped (for example at 30 s), 3-5 attempts. API call timeout 10-30 seconds.

### Queue critical email
1. Write the email job to a queue or table as `pending` with its idempotency key.
2. A worker sends it; on success mark `sent` and store the provider message ID.
3. Retryable failure: increment the attempt count and schedule a retry.
4. Permanent failure: mark `failed` and alert (a password reset that never arrives is a support ticket).

## 5. Events, webhooks and suppression

Subscribe to at least: delivered, bounced, complained, and (if the provider has them) deferred, dropped or suppressed. Opens and clicks are optional for transactional email; many teams switch tracking **off** for it (tracking pixels and rewritten links add little to a password reset).

**Endpoint rules**
- Accept POST, answer 2xx fast (within ~5 seconds), process asynchronously from a queue.
- **Verify every webhook.** Resend signs with Svix headers (`svix-id`, `svix-timestamp`, `svix-signature`); verify against the raw request body. Postmark does not sign webhooks: protect the URL with HTTP Basic Auth over HTTPS, optionally an IP allowlist from its current docs, and validate the payload shape.
- **Be idempotent:** store the event ID and skip duplicates; providers retry.
- Know the retry policy. Some providers drop an event permanently on a 401/403 (Postmark treats every 4xx except 408 and 429 as final), so an auth misconfiguration silently loses events; monitor webhook failure counts.
- Log raw events for debugging.

**Handling**
- Hard bounce → suppress the address everywhere at once.
- Soft bounce → count; suppress after 3 consecutive (the range 3-5 is common).
- Complaint → suppress from all marketing immediately, no exceptions, and log the source for analysis.
- Keep transactional sends going to complainers only where the email is essential (password reset they asked for) and the provider allows it.
- Mirror the provider's suppression list in your own database so a provider switch does not lose it.

## 6. Testing without hurting reputation

Do not test against real consumer inboxes in bulk; repeated test traffic to Gmail or Outlook looks like spam behaviour.

| Provider | Safe test options (as of source; check current docs) |
|---|---|
| Resend | `delivered@resend.dev`, `bounced@resend.dev`, `complained@resend.dev` (the default `onboarding@resend.dev` sender only delivers to your own account address) |
| Postmark | Server token `POSTMARK_API_TEST` (accepts calls, sends nothing), `test@blackhole.postmarkapp.com`, `hardbounce@` / `softbounce@bounce-testing.postmarkapp.com`, or a separate sandbox server |
| Amazon SES | Mailbox simulator, for example `success@simulator.amazonses.com` |

Unit tests mock the provider; CI uses the test token or simulator; one or two real inboxes you own check rendering before launch. Expose a local webhook endpoint with a tunnel only for the test session.

## 7. Agent safety

- Draft and preview by default. Sending to one test address still needs the user's yes; sending to more than one person needs explicit approval with the packet in [campaigns-subject-lines-testing.md](campaigns-subject-lines-testing.md).
- API keys come from environment variables or a secrets manager, never from code or chat; scope keys to sending only where the provider allows.
- Never call an unknown mutating endpoint to "see what it does".

## Checklist

- [ ] Each email classified transactional or marketing; no promotional blocks in transactional mail
- [ ] Catalog for this app type covered; each email has its must-include items
- [ ] Sent from a transactional subdomain or stream with a monitored reply-to and a plain-text part
- [ ] Idempotency keys from business events; retries only on 5xx, 429 and timeouts, with backoff
- [ ] Critical emails queued with status and alerting
- [ ] Webhooks verified, idempotent and monitored; bounces and complaints suppressed automatically
- [ ] Tests use provider sandboxes, not real consumer inboxes

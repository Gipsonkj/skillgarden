# Sending APIs: Resend, Postmark, Amazon SES, SendGrid, Cloudflare

> Distilled from: resend and its sending, broadcasts, topics, automations and webhooks references (resend/resend-skills, MIT), postmark-send-email, postmark-templates and postmark-webhooks (ActiveCampaign/postmark-skills, MIT), amazon-ses with its onboarding and domain identity references (aws/agent-toolkit-for-aws, Apache-2.0), twilio-sendgrid-deliverability-advisor (twilio/ai, MIT), react-email SENDING reference (resend/react-email, MIT), cloudflare-email-service (cloudflare/skills, Apache-2.0).

Use for "send with Resend", "Postmark template", "set up Amazon SES", "get out of the SES sandbox", "SendGrid webhooks", "Cloudflare Email Service", "send email from a Worker", "which email API should I use".

APIs, limits and SDK versions change. Everything below is as of the sources (2026); check the provider's current docs before writing production code. Vendor-neutral rules (idempotency, retries, webhooks, testing) are in [transactional-email.md](transactional-email.md); domain records in [deliverability.md](deliverability.md).

## 0. Rules for every provider

- API keys live in environment variables or a secrets manager. Never in code, a browser bundle or chat. Call sending APIs from the server only (Resend has no CORS on purpose).
- Use the narrowest key: sending-only where offered, restricted to one domain where offered.
- The From domain must be verified with that provider and must match exactly (verified `send.acme.com` does not cover `user@acme.com`).
- Send HTML **and** plain text. Add `List-Unsubscribe` and `List-Unsubscribe-Post` headers to anything bulk or marketing if the provider does not.
- Draft or test first. Any call that sends to real people, or creates and sends a broadcast, needs the user's explicit approval ([campaigns-subject-lines-testing.md](campaigns-subject-lines-testing.md)).

## 1. Choosing

| Provider | Strong at | Watch |
|---|---|---|
| Resend | Developer experience, React Email, transactional plus broadcasts, segments, topics, automations | Rate limit (default 2 requests/second as of source); batch has no attachments |
| Postmark | Transactional speed and reputation; strict separation of transactional and broadcast streams | 100 templates per server by default; no webhook signatures |
| Amazon SES | Low cost at volume, AWS integration | Starts in a sandbox; production access is a reviewed request; you build more yourself |
| SendGrid | Large volume, marketing plus transactional, detailed reputation tooling | Dedicated IPs need warm-up; shared pools share reputation |
| Cloudflare Email Service | Sending from Workers with a binding (no API key), auto SPF/DKIM | Transactional only, not for newsletters or bulk |

A marketing team that wants flows, segments and a visual builder usually wants an ESP ([esp-platforms-and-analytics.md](esp-platforms-and-analytics.md)), not a raw API.

## 2. Resend

```ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send(
  { from: 'Acme <orders@t.acme.com>', to: ['delivered@resend.dev'], subject: 'Your order #1234 is confirmed',
    html, text, replyTo: 'support@acme.com' },
  { idempotencyKey: `order-confirm/${orderId}` }
);
if (error) { /* handle: the SDK returns errors, it does not throw */ }
```

- **The Node SDK returns `{ data, error }` and does not throw** for API errors. Check `error` every time.
- `react: <Email />` renders HTML and text for you ([templates-and-html.md](templates-and-html.md)).
- **Single vs batch:** single for one email, attachments or `scheduledAt`. Batch (`/emails/batch`) for 2-100 distinct emails, **atomic** (one invalid email fails all), no attachments, no scheduling. Larger sends: chunk with a key per chunk (`<batch-prefix>/chunk-<index>`).
- **Idempotency:** `<event-type>/<entity-id>`, up to 256 characters, kept 24 hours; same key with a different payload returns 409.
- **Templates:** variables are case-sensitive, triple mustache `{{{VAR}}}`; a template must be **published** before sending; `template` cannot be combined with `html`, `text` or `react`.
- **Broadcasts** (marketing): `broadcasts.create({ name, from, subject, segmentId, html, topicId?, previewText? })` makes a **draft**; `broadcasts.send(id, { scheduledAt? })` sends it. Include `{{{RESEND_UNSUBSCRIBE_URL}}}`. As an agent, never pass `send: true` on create: create the draft, show it, and send only after approval. Cancel reverts a scheduled broadcast to draft.
- **Topics** are subscription categories shown on the unsubscribe page; `defaultSubscription` (`opt_in` or `opt_out`) cannot be changed after creation, so decide it with the consent model in mind (opt-in for anything that needs consent).
- **Automations:** a graph of steps: `trigger` (event name), `send_email` (published template), `delay` ("3 days"), `wait_for_event` (with timeout), `condition` (branch on contact or event data). Events you send trigger them.
- **Webhooks:** verify with `resend.webhooks.verify({ payload, headers: { 'svix-id', 'svix-timestamp', 'svix-signature' }, secret })` using the raw text body, not parsed JSON. Events include `email.sent`, `email.delivered`, `email.bounced`, `email.complained`, `email.delivery_delayed`, `email.suppressed`, opens and clicks.
- **Errors:** 400/422 fix the request; 401 `restricted_api_key` means a sending-only key hit another endpoint; 403 usually means unverified or mismatched From domain, or the `onboarding@resend.dev` sandbox sender (it delivers only to your own account address); 409 idempotency conflict; 429 and 500 retry with backoff.
- Suppression is automatic for hard bounces and complaints.
- Test with `delivered@resend.dev`, `bounced@resend.dev`, `complained@resend.dev`.

## 3. Postmark

```js
const postmark = require('postmark');
const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
await client.sendEmail({ From: 'orders@t.acme.com', To: 'customer@example.com', Subject: 'Your order #1234 has shipped',
  HtmlBody: html, TextBody: text, MessageStream: 'outbound', Tag: 'order-shipped', Metadata: { orderId: '1234' } });
```

- **Message streams are mandatory thinking:** `outbound` for transactional, `broadcast` for marketing and newsletters. Never mix them. Always set `MessageStream`.
- **Endpoints:** single `/email` (10 MB); batch `/email/batch` up to 500 messages (50 MB), each validated separately, so check every result's `ErrorCode` (0 is success); template `/email/withTemplate` and batch template; `/email/bulk` for broadcast-stream campaigns.
- **Templates:** server-side Handlebars. Use `TemplateAlias`, not `TemplateId` (aliases survive re-creation and work across servers). Layout templates wrap standard ones through `{{{@content}}}`; you cannot send a layout directly. 100 templates per server by default.
- **Broadcast compliance:** add an unsubscribe link and the one-click headers on broadcast sends; Postmark's subscription-change webhook reports unsubscribes.
- **Webhooks** (Delivery, Bounce, SpamComplaint, Open, Click, SubscriptionChange) are **not signed**. Protect them with Basic Auth credentials in the HTTPS URL, optionally IP allowlisting from current docs, and payload validation. Outbound webhooks retry up to 9 times over about 72 minutes on 5xx, 408, 429 and timeouts; every other 4xx (including 401 and 403) is dropped at once, so a wrong credential loses events silently. Inbound-email webhooks use a different, longer schedule.
- DKIM: add the CNAME Postmark gives (`pm._domainkey`); Postmark rotates keys. SPF include: `spf.mtasv.net`.
- Testing: `POSTMARK_API_TEST` token, `test@blackhole.postmarkapp.com`, bounce-testing addresses, or a separate sandbox server.

## 4. Amazon SES

Use the **SES v2 API** (`aws sesv2 ...`), never the older `aws ses ...` commands: they fail silently for this job and lack production-access and combined identity reads. SES state is per Region; state the Region before any change.

**Domain setup (read state first, change only what is missing)**
1. `aws sesv2 get-account` and `aws sesv2 list-email-identities` to see sandbox status and existing identities.
2. Create a **domain** identity (Easy DKIM) if it does not exist: `aws sesv2 create-email-identity --email-identity example.com`. Never re-create an existing one, and never re-initialise DKIM on an identity already at `SUCCESS` (it can change the tokens).
3. Custom MAIL FROM subdomain for SPF alignment (ask which subdomain; suggest one): `aws sesv2 put-email-identity-mail-from-attributes`, with DNS records
   ```
   bounce.example.com  MX   10 feedback-smtp.<region>.amazonses.com
   bounce.example.com  TXT  "v=spf1 include:amazonses.com ~all"
   ```
4. DMARC at `_dmarc.example.com` if none exists (`v=DMARC1; p=none;` to start). If a stronger policy exists, keep it. Do not set `aspf=s`, or the MAIL FROM subdomain will not align.
5. Present all DNS records in one batch; wait for the user to confirm they are live.
6. Setup is complete only when `aws sesv2 get-email-identity --email-identity example.com` shows **all three**: `VerifiedForSendingStatus: true`, `DkimAttributes.Status: SUCCESS`, `MailFromAttributes.MailFromDomainStatus: SUCCESS`.

**Sandbox and production access**
- In the sandbox you can send only to verified identities (an address verified on its own, or any address at a verified domain you control) or the mailbox simulator (`success@simulator.amazonses.com`).
- Production access: `aws sesv2 put-account-details --production-access-enabled --mail-type TRANSACTIONAL|MARKETING --website-url https://...`. **Get explicit consent first:** it commits the account to sending only to people who asked for mail and to handling bounces and complaints, opens an AWS Support case, cannot be cancelled or edited while under review, and a second call returns 409. Do not pass the deprecated `UseCaseDescription`. Success returns an empty 200; read the result later with `aws sesv2 get-account` (`Details.ReviewDetails.Status`).
- IAM: read actions always; write actions only for the step being run; narrow `ses:SendEmail` so a compromised caller cannot send as anyone from the domain.
- Pass JSON payloads inline rather than `file://` paths when running through the AWS MCP server.

## 5. SendGrid

```ts
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({ to: 'user@example.com', from: 'orders@t.acme.com', subject: 'Welcome', html, text });
```

- API keys start with `SG.`. Twilio Email (Account SID and Auth Token) is a different product with different tooling.
- Settings → Sender Authentication: domain authentication (SPF, DKIM), **link branding** (tracked links on your domain instead of a shared one), reverse DNS for dedicated IPs.
- **Event Webhook** is required for visibility: `bounce`, `spam_report`, `unsubscribe`, `deferred`, `dropped` at minimum. `sg_machine_open: true` marks Apple privacy pre-fetch opens; exclude them from engagement.
- Deferred mail is retried with backoff for up to 72 hours, then becomes a block.
- Dedicated IPs (higher plans) need warm-up; the automated warm-up runs about 41 days. Shared IPs (lower plans) share reputation with other senders.
- The Engagement Quality (SEQ) score summarises bounce classification, bounce rate, engagement recency, open rate and spam rate; a low score can restrict sending.
- The Email Address Validation API can check addresses at collection.

## 6. Cloudflare Email Service

Transactional only: do not use it for newsletters or bulk marketing. It launched in 2025 and changes fast, so retrieve the current docs (`https://developers.cloudflare.com/email-service/`) before coding.

- **Set up:** `npx wrangler email sending enable example.com`, then `npx wrangler email sending dns get example.com`; `npx wrangler email sending list` shows onboarded domains. Cloudflare configures SPF and DKIM; add DMARC yourself.
- **From a Worker:** add a `send_email` binding in `wrangler.jsonc` (for example `"send_email": [{ "name": "EMAIL" }]`), run `wrangler types`, and use the generated types. No API key needed. Bindings can restrict allowed senders and destinations.
- **From an external app:** the REST API with a Bearer token. Field names differ from the binding: REST uses `from: { address, name }` and snake_case `reply_to`; the Workers binding uses `{ email, name }` and `replyTo`. Do not copy one payload to the other unchanged.
- Hard bounces are suppressed automatically (sending to one returns `E_RECIPIENT_SUPPRESSED`); soft bounces are retried; complaints feed an account suppression list.
- Always send `text` as well as `html`. Use real addresses you control for testing; check whether local development simulates or really sends.
- Inbound mail (Email Routing) is a separate feature; the raw message stream can be read only once.

## Checklist

- [ ] Provider fits the job (transactional API vs marketing ESP; Cloudflare only for transactional)
- [ ] Key in env or secrets, narrowest scope, server-side only
- [ ] From domain verified with SPF, DKIM and DMARC; SES identity shows all three statuses complete
- [ ] Streams or subdomains separate transactional and marketing (Postmark `MessageStream` always set)
- [ ] Idempotency keys on sends; errors checked (Resend returns, does not throw); retries only where safe
- [ ] Webhooks verified (Resend signature) or protected (Postmark Basic Auth) and monitored
- [ ] Broadcasts created as drafts and sent only after approval
- [ ] Tests use provider sandboxes and simulators

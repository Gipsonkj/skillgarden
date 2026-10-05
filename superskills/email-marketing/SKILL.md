---
name: email-marketing
description: Run email as a marketing and product channel: signup forms and list growth, segments, lifecycle flows (welcome, onboarding, abandoned cart, win-back), campaigns and subject lines, deliverability (SPF, DKIM, DMARC, spam), transactional email, React Email and MJML templates, sending APIs (Resend, Postmark, SES, SendGrid), ESPs (Klaviyo, Mailchimp, HubSpot), metrics and email law. Use when asked to set up flows, fix spam problems, or build or send email. One newsletter issue: content-creation.
---

# Email marketing

Covers email as a channel end to end: who is on the list and why, the automated flows and campaigns they get, the templates those emails are built from, the APIs and ESPs that send them, getting them into the inbox, the law around them, and whether any of it pays. Writing a single newsletter issue, brand voice and general copy belong to `content-creation`; this craft owns the program, the sequences, deliverability, templates and platforms.

## Core principles

1. **Consent first.** Marketing email only to people who asked for it: unchecked boxes, double opt-in for lists and lead magnets, consent records kept. Never buy, rent, scrape or append addresses.
2. **Separate the streams.** Transactional, marketing, lifecycle and cold email have different rules; keep them on separate subdomains or streams, and keep promotions out of receipts.
3. **Authenticate before the first send.** SPF (one record, `~all`, under 10 lookups), DKIM (2048-bit, aligned) and DMARC ramped from `p=none` to `reject`. Required by Gmail and Yahoo at 5,000+ a day; do it at any volume.
4. **Guard the thresholds.** Spam complaints under 0.1% (block sends at or above it), hard bounces under 2%; suppress bounces, complaints and unsubscribes at once and permanently.
5. **Make leaving easy.** One-click unsubscribe headers (RFC 8058) plus a visible link and a postal address in every marketing email; honour it within 48 hours, ideally at once.
6. **Flows before campaigns.** Welcome, abandoned cart, post-purchase or onboarding earn far more per recipient (about 30x in one source) than one-off sends; build them first.
7. **Send to the engaged.** Tier by last click or purchase (0-30, 31-60, 61-90 days); re-engage at 90 days, sunset by 180; warm new domains with the most engaged contacts on a schedule.
8. **One email, one job.** One primary CTA; the promise in the first ~30 characters of the subject; preview text that adds to it; the point in the opening live text.
9. **Judge on clicks, conversions and revenue per recipient,** not opens: privacy features inflate them. Use holdouts to prove what email really adds.
10. **Test one variable at a time** with a KPI chosen up front, enough sample per variant and 95% confidence before calling a winner.
11. **Build on a safe substrate.** React Email or MJML, 600 px single column, live text, alt text, plain-text part, dark mode checked, under 102 KB.
12. **Every send is live.** Drafts by default; show the pre-send packet; explicit approval before anything reaches more than one person; test with sandboxes, not real consumer inboxes.
13. **Send exactly once.** Idempotency keys from business events, retries only on 5xx, 429 and timeouts, verified and idempotent webhooks.
14. **Cold email stays small and personal.** One-to-one, relevant, from a real person, off the main domains, with an opt-out line; 3-5 touches at most and the breakup honoured. No scraped lists, mass sending, inbox rotation or filter evasion.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Shopify welcome flow with a quiz lead magnet: `references/strategy-and-list-growth.md` → `references/sequences-and-lifecycle.md` → `references/templates-and-html.md` → `references/deliverability.md`; signup page from `website-building` → `references/plan-and-copy.md`; email voice from `content-creation` → `references/brand-voice.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Email strategy, what to build first, lists, tags and segments, engagement tiers, signup forms, double opt-in, consent records, lead magnets, imports and ESP migrations, preference centre, frequency | [references/strategy-and-list-growth.md](references/strategy-and-list-growth.md) |
| Welcome, onboarding, nurture, abandoned cart, browse, post-purchase, VIP, win-back, sunset, dunning, trial and launch flows; timing, exits, exclusions, flow diagrams | [references/sequences-and-lifecycle.md](references/sequences-and-lifecycle.md) |
| Broadcasts and newsletters as campaigns, campaign brief, subject lines, preview text, spam patterns, A/B tests and sample sizes, calendar, BFCM, the pre-send check | [references/campaigns-subject-lines-testing.md](references/campaigns-subject-lines-testing.md) |
| SPF, DKIM, DMARC, BIMI, Gmail and Yahoo bulk-sender rules, one-click unsubscribe headers, subdomains, warm-up, bounce and complaint thresholds, list hygiene, "going to spam" diagnosis | [references/deliverability.md](references/deliverability.md) |
| Email templates in React Email or MJML, HTML email rules, Gmail clipping, images, accessibility, dark mode, merge tags, rendering tests and picking a testing tool (Litmus or real inboxes) | [references/templates-and-html.md](references/templates-and-html.md) + `templates/email-html-mjml/` |
| Transactional vs marketing, which emails an app needs, content rules per email, idempotency, retries, queues, webhooks, suppression, safe testing | [references/transactional-email.md](references/transactional-email.md) |
| Resend, Postmark, Amazon SES, SendGrid or Cloudflare Email Service: setup, calls, limits, broadcasts, templates, webhooks, sandbox and production access | [references/sending-apis.md](references/sending-apis.md) |
| Choosing or migrating an ESP, picking how to connect (connector, MCP or API), working safely in Klaviyo, MailerLite, Constant Contact, ActiveCampaign, HubSpot, Salesforce Marketing Cloud (AMPscript, SQL), Loops and others, Klaviyo audits, metrics and benchmarks, attribution, holdouts, reporting | [references/esp-platforms-and-analytics.md](references/esp-platforms-and-analytics.md) |
| CAN-SPAM, GDPR, UK PECR, CASL and other laws, consent rules, required footer, transactional exemption, cold email writing, follow-ups and limits | [references/compliance-and-cold-email.md](references/compliance-and-cold-email.md) |

To use one capability directly, name the task, or say "use email-marketing: <capability>" (for example "use email-marketing: DMARC rollout for example.com").

## Bundled templates (framix-team/skill-email-html-mjml, MIT)

| Template | Use as a starting point for | Compile |
|---|---|---|
| `templates/email-html-mjml/newsletter.mjml` | Editorial newsletter with the full dark-mode pattern, heading roles, `vertical-align` on every column | `npx mjml newsletter.mjml -o newsletter.html --config.minify=true --config.validationLevel=strict` |
| `templates/email-html-mjml/promo-sale.mjml` | Promotional email: hero and section background images (Outlook VML), navbar, non-stacking row, social icons | Same command |
| `templates/email-html-mjml/order-confirmation.mjml` | Transactional receipt: `mj-table` line items, Handlebars blocks protected for minify, conditional block, footer partial | Add `--config.allowIncludes true`, then grep the output for footer text |
| `templates/email-html-mjml/partials/footer.mjml` | Shared footer included by the order confirmation | Included, not compiled alone |

All copy, brands and URLs in them are placeholders (`example.com`, `cdn.example.com`); replace them before use. Licence in `templates/email-html-mjml/LICENSE`. Installing MJML (`npm install -D mjml`) is the user's call.

## Other crafts

| When the request also needs | Use |
|---|---|
| The newsletter issue itself, a brand voice, or a de-AI pass on email copy | `content-creation` → `references/newsletters.md`, `references/brand-voice.md`, `references/humanize-ai-writing.md` |
| The signup or lead-magnet landing page, its copy and conversion | `website-building` → `references/plan-and-copy.md` |
| Glue between forms, CRM, store and ESP in n8n, Zapier or Make | `automation` → `references/automation-design.md`, `references/n8n.md`, `references/zapier.md` |
| Auth emails wired into the app, or billing events (Stripe) that drive dunning | `backend-databases` → `references/auth.md`, `references/stripe.md` |
| Significance, power and cohort analysis for tests and email revenue | `data-analysis` → `references/experiments-causal.md`, `references/statistics.md` |
| Finding a few cold prospects without scraping | `linkedin-automation` → `references/lead-research.md` |
| A Worker or AWS account and IAM to send from | `cloud-devops` → `references/cloudflare.md`, `references/aws.md` |
| Paid ads that drive sign-ups to a lead magnet | `ad-creation` → `references/creative-strategy.md`, `references/meta-ads-creative.md` |
| Hero, product and banner images for emails | `image-creation` → `references/marketing-brand-images.md` |
| The store data and events behind cart and post-purchase flows: Shopify, catalog, store metrics | `ecommerce` → `references/shopify-apps-and-apis.md`, `references/store-analytics.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Every Resend endpoint: contacts, segments, topics, automations, events, inbound, domains, API keys, logs | [resend](https://github.com/resend/resend-skills/tree/main/skills/resend) (MIT) |
| Postmark inbound processing, template pushing across servers, webhook payload examples | [postmark](https://github.com/ActiveCampaign/postmark-skills/tree/main) (MIT) |
| The step-by-step SES onboarding with every state branch, IAM policy and failure mode | [amazon-ses](https://github.com/aws/agent-toolkit-for-aws/tree/main/skills/specialized-skills/messaging-and-streaming-skills/amazon-ses) (Apache-2.0) |
| React Email components, the embeddable visual editor, i18n and full patterns | [react-email](https://github.com/resend/react-email/tree/canary/skills/react-email) (MIT) |
| Every MJML component reference and the basic layout example | [email-html-mjml](https://github.com/framix-team/skill-email-html-mjml/tree/master/email-html-mjml) (MIT) |
| Klaviyo SOW templates, industry benchmarks and its CLI scripts (Python, needs an API key; not copied here) | [klaviyo-analyst](https://github.com/thatrebeccarae/claude-marketing/tree/main/skills/klaviyo-analyst) (MIT) |
| Industry playbooks, SMS, WhatsApp and RCS rules, design archetypes, benchmark appendices | [email-marketing-bible](https://github.com/CosmoBlk/email-marketing-bible/tree/main) (MIT; the author also co-founded an ESP it recommends) |
| Per-provider requirements table and blocklist delisting steps | [twilio-sendgrid-deliverability-advisor](https://github.com/twilio/ai/tree/main/skills/sendgrid/twilio-sendgrid-deliverability-advisor) (MIT) |

## Default workflow

1. **Intake.** Business type, list size and source, ESP or API, recipient regions, current click, bounce and complaint rates, one goal. Ask once for what is missing.
2. **Check the foundation.** Consent basis, authentication, unsubscribe handling and complaint rate. If any is broken, fix it before writing new email.
3. **Plan.** Say which guides and crafts the request needs; for programs, order the flows before the campaign calendar.
4. **Build.** Flows and campaigns with triggers, exits, exclusions and copy; templates from React Email or MJML; API or ESP setup in drafts.
5. **Test.** Sandbox or seed sends, rendering across clients and dark mode, links, merge-tag fallbacks, headers in a received message.
6. **Get approval.** Show the pre-send packet; send or schedule only after an explicit yes.
7. **Measure.** Clicks, conversions, RPR, bounces, complaints; review weekly at first, then monthly; one test at a time.
8. **Report.** What was built or changed, where it lives, what was verified, and what was not checked.

## Done means

- [ ] Every audience has a stated consent basis for its region; no bought, scraped or unverified contacts
- [ ] SPF, DKIM and DMARC pass and align on a received message; transactional and marketing separated
- [ ] Every marketing email has one-click unsubscribe headers, a visible unsubscribe link and a postal address
- [ ] Flows have triggers, exit on conversion, exclusions and re-entry rules
- [ ] Templates built on React Email or MJML, under 102 KB, with alt text, plain text, and dark mode checked
- [ ] Sends are idempotent; bounces and complaints suppressed automatically
- [ ] Nothing sent to more than one person without the pre-send packet and explicit approval
- [ ] Success measured on clicks, conversions or revenue per recipient, with tests run one variable at a time
- [ ] Report lists what changed, what was verified and what was not

# ESP platforms, agent safety and email analytics

> Distilled from: klaviyo-analyst SKILL and REFERENCE (thatrebeccarae/claude-marketing, MIT), email-marketing-bible (CosmoBlk/email-marketing-bible, MIT), email-marketing (arnabbagxd/Brand-building-skills, MIT), loops-email-sending-best-practices operational-caveats and program-strategy references (loops-so/skills, MIT), twilio-sendgrid-deliverability-advisor (twilio/ai, MIT), email-sequence (anthropics/knowledge-work-plugins, Apache-2.0).

Use for "which email platform", "audit our Klaviyo", "Mailchimp vs Kit", "set up Loops", "connect Klaviyo to Claude", "email reporting", "what is a good click rate", "email attribution", "is email working", "flow revenue".

Platform features, prices and AI or MCP integrations change monthly. Treat the platform notes as of the sources (mid-2026) and check current docs before recommending.

## 1. Choosing an ESP

| Platform | Best for | Notes from sources |
|---|---|---|
| Klaviyo | Shopify and ecommerce, deep event data | Best-in-class flows; predictive CLV and churn; official MCP server (read-only mode available) |
| Mailchimp | Small businesses, simplicity | Free tier; app in Claude and ChatGPT |
| Customer.io | Lifecycle and B2C/SaaS, event-driven messaging | Strong event and data model; AI agent features |
| Loops | SaaS lifecycle and product email | One sending domain per team; one webhook endpoint per account; transactional sends skip the marketing audience unless `addToAudience` is true |
| Kit (formerly ConvertKit) | Creators and newsletters | Free tier, tags and sequences |
| beehiiv | Newsletter-first, monetisation | Official MCP, ad network |
| Brevo | Budget, email plus SMS | Volume pricing, transactional too |
| HubSpot | B2B with CRM | Marketing tied to sales pipeline |
| Resend / Postmark | Developers; transactional first | See [sending-apis.md](sending-apis.md) |

**Decision factors:** ecommerce or product-event depth; data model (events, properties, catalog); agent interface (MCP or app vs dashboard only; read-only modes; approval and audit logs); deliverability controls (warm-up, dedicated IP, suppression); consent and preference handling; separation of transactional and marketing; cost at the list size you expect in 12 months. Choose for a year out, not today.

**Migrating:** pull unsubscribe, bounce and complaint state from the old ESP's API (exports often drop it), import suppressions first, set subscription status explicitly on import, re-permission contacts dormant 6+ months, and warm the new sending setup with the most engaged contacts in chunks ([deliverability.md](deliverability.md)).

## 2. Working in an ESP as an agent

Every segment, draft, flow edit or scheduled send in a real account is live. These gates are not optional:

1. **Read before write.** Start with an account read: lists, segments, flows, recent campaigns, deliverability, suppressions. Use read-only connections for audits (Klaviyo: `https://mcp.klaviyo.com/mcp?read-only=true` disables every write tool).
2. **No send or schedule to more than one recipient without explicit approval in the conversation.** A single test send still needs a yes.
3. **Show the pre-send packet first** (audience and count, exclusions, subject, preview, send time, from and reply-to, unsubscribe present, compliance risk): see [campaigns-subject-lines-testing.md](campaigns-subject-lines-testing.md).
4. **Block the send** if authentication is missing, the unsubscribe or address is absent, complaint rate is 0.1% or higher, consent basis is unclear, or suppressed contacts are in the audience.
5. **Never probe unknown mutating endpoints** (`/send`, `/dispatch`, `/trigger`, `/publish`). If the schedule or approve step is unclear, ask the person to click it.
6. **Verify segments against real counts**; AI-built segments tend to be too broad.
7. **Log every change** (segment edited, flow changed, campaign created, send staged) so a human can audit it.
8. **Never trust an edit to keep the footer**: re-check unsubscribe and address after any template change.
9. Writes that change consent (`subscribe_profile_to_marketing`, `unsubscribe_profile_from_marketing` and equivalents) only on the person's explicit instruction, never as a side effect.

**Keep human:** brand voice, strategy and flow priority, creative direction, domain and deliverability decisions, the final send. **Automate:** first drafts, subject variants, segment rule drafts, report pulls, anomaly flags.

## 3. Klaviyo specifics

**Connect:** official MCP over OAuth (`https://mcp.klaviyo.com/mcp`; Owner, Admin or Manager role). 40+ tools; reporting, flows, lists and segments are read-only through it; campaigns, templates, profiles and events have write tools.

**Flow settings**

| Setting | On for | Off for |
|---|---|---|
| Smart Sending (skip if emailed in the last ~16 h) | Browse abandonment, win-back, other promotional flows | Abandoned cart, order confirmation, shipping |
| Skip recently emailed | Browse abandonment, cross-sell | Welcome, abandoned cart |

Exclusion filters per flow: [sequences-and-lifecycle.md](sequences-and-lifecycle.md) section 5.

**Data pitfalls**
- Trigger flows on metrics (Started Checkout, Placed Order) rather than segment entry driven by API-synced properties, which is brittle.
- `$value` carries revenue for attribution. Nested properties (`Items[].Categories`) cannot be used in segments: send a flattened top-level `Categories` too.
- Check catalog sync freshness and variant coverage; stale catalogs break product blocks.

**Segments worth having:** engagement tiers (Active 0-30 days, Warm 31-90, At-risk 91-180, Lapsed 180+, Never engaged); RFM groups (Champions: ordered in 30 days, 4+ orders in 12 months; Loyal; Promising; At risk: no order in 90 days but 2+ ever; Lost: no order in 180 days); predictive (high CLV, high churn risk, next order within 14 days).

**Four-phase audit**
1. **Inventory:** lists, segments, flows and campaigns by status; events by source with zero-volume ones flagged; integrations; custom profile properties.
2. **Configuration:** per flow: trigger, Smart Sending, exclusions, timing vs benchmarks, splits, duration; campaign targeting and frequency caps; A/B method; authentication and warm-up.
3. **Data structure:** duplicate or missing events, nested properties blocking segments, properties collected but unused, catalog health.
4. **Recommendations:** for each finding give the evidence, the plain-language fix, and a build spec (trigger, filters, content brief, timing, test plan); estimated uplift against the current baseline; a phased roadmap.

Klaviyo's default attribution is click-based: 5 days for email, 24 hours for SMS (check the account's settings).

## 4. Other platforms (short)

- **Loops:** one loop per lifecycle state, often keyed by a contact property such as `subscriptionStatus`; start a new sender with the welcome loop and essential transactional email before campaigns; first campaigns to recent or active users, ideally useful product updates (monthly, 2-3 items, link to the changelog). Transactional emails track no opens or clicks and carry no unsubscribe; unsubscribed contacts still receive them. Webhooks are signed; verify them. Transactional email to Google Workspace group inboxes can be held by moderation.
- **Mailchimp, Kit, beehiiv, Brevo, HubSpot, Customer.io:** same program rules apply (consent, tiers, flows first, pre-send gates). Map this craft's terms to theirs: flow = automation, journey, sequence or campaign workflow; segment = segment, tag rule or list filter.

## 5. Metrics that matter

**Opens are noise.** Apple Mail Privacy Protection pre-loads pixels and inbox summaries auto-open mail, so opens inflate while clicks fall. Judge on clicks, replies, conversions and revenue per recipient (RPR). Label any open-only result low-confidence and never compare opens across ESPs.

| Metric | Good | Strong | Red flag |
|---|---|---|---|
| Click rate | 2-3% | 4%+ | under 1% |
| Click-to-open rate | 10-15% | 20%+ | under 5% |
| Unsubscribe rate | under 0.2-0.3% | under 0.1% | over 0.5% |
| Bounce rate | under 2% | under 1% | over 3% |
| Spam complaint rate | under 0.1% | under 0.05% | over 0.3% |
| List growth (monthly) | 3-5% | 5-8%+ | negative |
| Flow revenue share (ecommerce) | 30-40% of email revenue | 50%+ | under 20% |

**KPI per email type:** welcome → conversion and RPR; abandoned cart → recovery rate and RPR; promo → revenue and click rate; nurture → click-to-open and progression; newsletter → clicks and replies; cold → positive reply rate (3-5% is good); transactional → delivery and time to inbox; SaaS lifecycle → activation, trial starts, conversion, feature use.

Benchmarks vary widely by industry and source; set targets from your own first 4-8 weeks and use benchmarks only to spot outliers.

## 6. Attribution and incrementality

- ESP-reported revenue is click-window attribution: it over-credits email (people who would have bought anyway clicked first).
- A U-shaped model (40% first touch, 40% last touch, 20% spread across the middle) is a reasonable start when blending channels.
- **Incrementality is the real answer:** hold out a small random share of a flow or segment from email and compare revenue per person over the same window. Use holdouts, not last-touch credit, to judge any AI "optimisation" that reallocates live traffic.
- Track revenue (or goal actions) **per email sent** to find the frequency where more email stops paying.
- Statistical reads, cohort retention and dashboards: hand off to `data-analysis` (`references/experiments-causal.md`, `references/statistics.md`).

## 7. Reporting rhythm

- Weekly in the first month of any new flow or platform, then monthly.
- One page: sends, delivery rate, click rate, RPR, unsubscribes, complaints, bounce rate, list growth, flow vs campaign revenue, top and bottom 3 emails, tests concluded, actions next.
- Watch complaints and bounces on every send, not monthly; a spike needs action the same day ([deliverability.md](deliverability.md)).

## Checklist

- [ ] ESP chosen on data model, agent interface, deliverability controls and 12-month cost
- [ ] Migration pulls suppressions from the old API and warms the new setup
- [ ] Agent work starts read-only; sends need explicit approval and the pre-send packet
- [ ] Flow settings (Smart Sending, exclusions) reviewed per flow
- [ ] KPIs set on clicks, conversions and RPR, not opens
- [ ] A holdout measures email's incremental effect at least once a quarter

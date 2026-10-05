# ESP platforms, agent safety and email analytics

> Distilled from: klaviyo-analyst SKILL and REFERENCE (thatrebeccarae/claude-marketing, MIT), email-marketing-bible (CosmoBlk/email-marketing-bible, MIT), email-marketing (arnabbagxd/Brand-building-skills, MIT), loops-email-sending-best-practices operational-caveats and program-strategy references (loops-so/skills, MIT), twilio-sendgrid-deliverability-advisor (twilio/ai, MIT), email-sequence (anthropics/knowledge-work-plugins, Apache-2.0). Section 4 (MailerLite, Constant Contact, ActiveCampaign, HubSpot, Salesforce Marketing Cloud) is written from each vendor's official docs, listed in CREDITS.md.

Use for "which email platform", "audit our Klaviyo", "Mailchimp vs Kit", "set up Loops", "connect Klaviyo to Claude", "connect MailerLite", "Constant Contact API", "ActiveCampaign automation", "HubSpot marketing email", "Salesforce Marketing Cloud", "AMPscript", "SFMC SQL query", "email reporting", "what is a good click rate", "email attribution", "is email working", "flow revenue".

Platform features, prices and AI or MCP integrations change monthly. Treat the platform notes as of the sources (mid-2026) and check current docs before recommending.

## 1. Choosing an ESP

**Pick a tool.** If the user already has an account, the job is to connect to it, not to choose; ask which platform they log into before guessing.

| The user's situation | Use | Why |
|---|---|---|
| Already uses or pays for an ESP | That one | Moving lists costs consent records, suppressions and warm-up; connect to it (section 4 or 3) |
| Shopify and ecommerce, deep event data | Klaviyo | Best-in-class flows; predictive CLV and churn; official MCP server (read-only mode available) |
| Small business wanting simplicity, free to start | Mailchimp | Free tier; app in Claude and ChatGPT |
| Small business or creator on MailerLite | MailerLite | Official MCP that can build campaigns and automations; simple REST API (section 4) |
| Small business or nonprofit on Constant Contact | Constant Contact | Claude connector builds the draft, the user sends it in Constant Contact (section 4) |
| Automations plus a sales CRM in one tool | ActiveCampaign | Official Claude connector for contacts, lists, tags and automations (section 4) |
| B2B with HubSpot CRM | HubSpot Marketing Hub | Marketing tied to the sales pipeline; Claude connector drafts and analyses emails (section 4) |
| Enterprise on Salesforce, data extensions, journeys | Salesforce Marketing Cloud Engagement | Official hosted MCP; AMPscript and SQL for personalisation and segments (section 4) |
| Lifecycle and B2C/SaaS, event-driven messaging | Customer.io | Strong event and data model; AI agent features |
| SaaS lifecycle and product email | Loops | One sending domain per team; one webhook endpoint per account; transactional sends skip the marketing audience unless `addToAudience` is true |
| Creators and newsletters | Kit (formerly ConvertKit) | Free tier, tags and sequences |
| Newsletter-first, monetisation | beehiiv | Official MCP, ad network |
| Budget, email plus SMS | Brevo | Volume pricing, transactional too |
| Developers; transactional first | Resend / Postmark | See [sending-apis.md](sending-apis.md) |

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

## 4. Connecting MailerLite, Constant Contact, ActiveCampaign, HubSpot and Salesforce Marketing Cloud

Facts below are from each vendor's docs as of October 2026; limits and plan gates move, so re-check the linked docs (CREDITS.md) before quoting them to a user. The section 2 gates apply to all of them.

**Pick a connection.** Prefer the vendor's own connector or MCP (OAuth, the user's own permissions, nothing to store). Use the REST API when the job is scripted or bulk, with the key in an environment variable or the tool's own config, never pasted into chat or saved in the repo. Never route these accounts through a third-party MCP broker.

| Platform | Claude route | Script route | Can the agent send? |
|---|---|---|---|
| MailerLite | Official MCP `https://mcp.mailerlite.com/mcp` (OAuth) | REST, Bearer token | Yes: the schedule call sends. Gate it |
| Constant Contact | Constant Contact connector in Claude's directory | REST v3, OAuth2 only | Connector: no, the user sends in Constant Contact. API: yes, the schedule call |
| ActiveCampaign | ActiveCampaign connector (Remote MCP URL from the account) | REST v3, `Api-Token` header | MCP: no campaign send or schedule tool. API: yes, `enable` |
| HubSpot Marketing Hub | HubSpot connector in Claude's directory; `https://mcp.hubspot.com` for builders | REST, Service Key or private app token | Drafts only through the connector; API publish needs Enterprise or the transactional add-on |
| Salesforce Marketing Cloud Engagement | Official hosted MCP through an Installed Package | REST, client-credentials token | Yes, with Send, Execute or journey publish scopes. Grant them only when asked |

### MailerLite

For small businesses and creators already on MailerLite.

- **Connect:** claude.ai: Settings > Connectors > Add custom connector, URL `https://mcp.mailerlite.com/mcp`, sign in with OAuth. Claude Code: `claude mcp add --transport http mailerlite https://mcp.mailerlite.com/mcp`. Its tools cover campaigns (create, schedule, update, cancel), subscribers, groups and segments, automations, ecommerce and webhooks. Use `dry_run_automation` to check an automation and `send_test_automation` for a test before it goes live.
- **API:** base `https://connect.mailerlite.com/api`, header `Authorization: Bearer $MAILERLITE_API_TOKEN`. The user makes the token under Integrations > MailerLite API > Generate new token; it is tied to that user and dies if they leave the account. Optional `X-Version: <date you built it>` pins behaviour. The classic API (developers-classic.mailerlite.com) is a separate product; don't mix them.
- **Limits:** 120 requests a minute; imports (`POST /api/subscribers/import`, group imports, batch upserts) 5 a minute; both answer 429.
- **Subscribers:** `POST /api/subscribers` upserts without removing omitted fields or groups. `status` is `active`, `unsubscribed`, `unconfirmed`, `bounced` or `junk`; the API won't reactivate unsubscribed, bounced or junk contacts, so don't try. Record consent with `opted_in_at` (`yyyy-MM-dd HH:mm:ss`) and `optin_ip`. Lists page with `limit` (default 25) and `cursor`.
- **Campaigns:** `POST /api/campaigns` with `name`, `type: "regular"`, `emails: [{subject, from_name, from}]` (`from` must be verified) and `groups` or `segments` (segments win if both are given). Custom HTML in `content` needs the Advanced plan. Only drafts can be edited. A ready campaign can be cancelled, which puts it back to draft.
- **Send = schedule:** `POST /api/campaigns/{id}/schedule` with `delivery` = `instant`, `scheduled` (plus `schedule[date]`, `schedule[hours]`, `schedule[minutes]`, optional `schedule[timezone_id]`), `timezone_based` or `smart_sending`. `instant` goes out at once. Show the exact campaign and audience and wait for a yes before calling it.

```bash
curl -s https://connect.mailerlite.com/api/campaigns \
  -H "Authorization: Bearer $MAILERLITE_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"October news","type":"regular","groups":["GROUP_ID"],
       "emails":[{"subject":"Your October picks","from_name":"Ana at Example","from":"ana@example.com"}]}'
# creates a draft; nothing is sent until /schedule is called
```

### Constant Contact

For small businesses and nonprofits already on Constant Contact.

- **Connect in Claude:** Customize > Connectors > Browse connectors, search Constant Contact, Connect. Claude builds the email (or a social post) with desktop and mobile previews, then hands back a link. The user adds the list and sends in Constant Contact. Best route for one campaign: the send stays with the user.
- **API:** base `https://api.cc.email/v3`, header `Authorization: Bearer <access token>`. OAuth2 only, no plain API keys: authorization code, PKCE, device flow or (legacy) implicit. Authorize at `https://authz.constantcontact.com/oauth2/default/v1/authorize`, token at `.../v1/token`. The device flow (`.../v1/device/authorize`) suits a CLI. The user creates an app in the Developer Portal (New Application); the API key is the client ID, and the client secret shows only once. Since July 2026 new apps are private: only the user who created the app can authorize it until Constant Contact approves wider use.
- **Tokens and scopes:** access tokens last 24 hours; refresh tokens expire after 180 days unused and need the `offline_access` scope. `contact_data` covers contacts and reports; creating campaigns needs `campaign_data`. Keep tokens in the OS keychain or an env var.
- **Limits:** 4 requests a second and 10,000 a day; 429 with `error_key` `throttled` (per second) or `quota_exceeded` (daily).
- **Build a campaign:**
  1. `POST /emails` with `name` and `email_campaign_activities: [{format_type: 5, from_name, from_email, reply_to_email, subject, html_content}]`. Both addresses must be confirmed in the account. The HTML must contain `[[trackingImage]]` and be a valid JSON string. The response has `campaign_id` and a `campaign_activity_id` with role `primary_email`; status is Draft.
  2. Recipients can't be set in that call: `PUT /emails/activities/{campaign_activity_id}` with `contact_list_ids`.
  3. Test: `POST /emails/activities/{id}/tests` with `email_addresses` (up to 5) and an optional `personal_message`. 50 test recipients a day; tests skip merge variables, so check personalisation another way.
  4. Send: `POST /emails/activities/{id}/schedules` with `scheduled_date` (ISO-8601) or `"0"`, which sends now. Works only on a `primary_email` activity in DRAFT, DONE or ERROR. Show the packet and wait for a yes.

### ActiveCampaign

For teams running automations plus a sales CRM.

- **Connect in Claude:** in ActiveCampaign, Settings > Developer, copy the Remote MCP URL (unique to the account). In Claude, Settings > Connectors > Browse, ActiveCampaign, Connect, paste the URL, log in and approve. On a corporate Claude account, a Claude administrator connects and approves it for the organisation first.
- **What the MCP does:** reads contacts, lists, tags, custom fields, campaigns (`list_campaigns`, `get_campaign`, `get_campaign_links`, `get_campaign_messages`), automations, deals and email activity. It writes contacts (`create_or_update_contact`), tags, lists (`add_contact_to_list`), custom fields, deals, automations (`add_contact_to_automation`, `remove_contact_from_automation`) and campaign message content (`update_campaign_message`). No tool sends or schedules a campaign. Adding contacts to a list or automation can still lead to email, so confirm the exact contacts first.
- **API:** `https://<account>.api-us1.com/api/3/`, header `Api-Token: $ACTIVECAMPAIGN_API_KEY`. The URL and key are in Settings > Developer; each user has their own key, so use a key for a user with the right permissions. 5 requests a second per account; 429 comes with `Retry-After`. Pages use `limit` (default 20, max 100) and `offset`.
- **Contacts:** `POST /contact/sync` with `{contact: {email, firstName, lastName, fieldValues: [{field, value}]}}` upserts (200 updated, 201 created) but does not subscribe. Subscribe with `POST /contactLists` and `{contactList: {list, contact, status: 1}}`; `status: 2` unsubscribes. Moving a contact from 2 back to 1 re-subscribes someone who left; do it only on their own new opt-in.
- **Campaigns:** create with `POST /campaign` (`name`, `type`). Test with `POST /campaigns/test-send` (`campaignId`, `messageId`, `subject`, `toEmail`; one address). `PUT /campaigns/{id}/enable` queues a one-off campaign to send at its set time, so it is the send: show the packet and wait for a yes. Only draft (0) or disabled (6) campaigns can be enabled. A refusal comes back as HTTP 200 with `succeeded: 0`; check that field, not the status code.

### HubSpot Marketing Hub

For B2B teams whose contacts live in the HubSpot CRM.

- **Connect in Claude:** Settings > Connectors > Browse, HubSpot, Connect, log in, choose permissions. Works on every HubSpot plan; Claude needs a paid plan (Pro, Max, Team or Enterprise). Super Admins and users with App Marketplace Access connect directly; anyone else needs a Super Admin's approval. It respects the user's HubSpot permissions. It can analyse marketing email performance and create and update marketing emails. It can't delete records, bulk changes are 10 records at a time, and with Sensitive Data on it can't see engagement data.
- **Remote MCP for builders:** `https://mcp.hubspot.com`, OAuth 2.1 with PKCE through an MCP auth app (Development > MCP Auth Apps). Email tools: `manage_marketing_email` (templates, subscription types, from addresses; create, update and clone drafts; preview; A/B variants) and `get_marketing_email_analytics` (sends, deliveries, opens, clicks, bounces, unsubscribes, per-contact engagement, health by MX group). Its docs cover drafts, not scheduling or publishing: the user publishes in HubSpot.
- **API:** `/marketing/v3/emails`: `POST` creates (`name`, `subject`, `templatePath` such as `@hubspot/email/dnd/welcome.html`), `GET` lists, `GET /{emailId}` reads. Scopes `content` and `marketing-email`. Use `folderIdV2`; `folderId` was dropped in January 2025. Auth: a Service Key (Settings > Integrations > Service Keys; needs Super Admin or Developer tools access; least-privilege scopes) or a legacy private app token, sent as `Authorization: Bearer $HUBSPOT_TOKEN`.
- **Publish = send:** `POST /marketing/v3/emails/{emailId}/publish` needs Marketing Hub Enterprise or the transactional email add-on. Show the packet and wait for a yes.
- **Private app limits:** Free and Starter 100 requests per 10 seconds and 250,000 a day per account; Professional 190 and 625,000; Enterprise 190 and 1,000,000. Over the limit you get 429.

### Salesforce Marketing Cloud Engagement (SFMC)

For enterprises on Marketing Cloud: data extensions, Journey Builder, Automation Studio, AMPscript.

- **Connect (official hosted MCP):** in Setup > Apps > Installed Packages, create a package. Add an API Integration component of type Public App, with a placeholder redirect `https://salesforce.com`, and only the scopes the task needs. Note the client ID (24 characters) and the tenant ID (the 28-character `mc…` part of the Authentication Base URI). Then set the redirect to the callback for the nearest region and point Claude at the MCP URL. US: `https://mai-mce-mcp-cdp1.sfdc-yfeipo.svc.sfdcfc.net/t/{tenantId}/c/{clientId}/api/mcp`. EU: the same path on `mai-mce-mcp-cdp1.sfdc-yzvdd4.svc.sfdcfc.net`; the callback is the same URL ending `/api/mcp/oauth/callback`. Claude Code: `claude mcp add -s user --transport http sfmc <MCP URL>`, then `/mcp` > Authenticate. The package's scopes decide what the agent can do.
- **Scopes are the safety gate.** An audit needs only read scopes. `Channels | Email | Send` (for `sfmc_send_transactional_email`), `Automation | Automations | Execute` (`sfmc_run_automation`, `sfmc_run_sql_query`) and journey publish, write or delete scopes let the agent act on live data. Grant them only for a task that needs them. Tools marked Destructive (for example `sfmc_update_content_builder_asset`, `sfmc_delete_journey`) change data for good: ask for a dry run or the exact code and record count first, as Salesforce's own docs advise.
- **Useful tools:** `sfmc_create_email` and `sfmc_get_content_assets` (Content Builder); `sfmc_create_sql_query`, `sfmc_validate_sql_query`, `sfmc_run_sql_query` (Automation Studio); `sfmc_get_journeys`, `sfmc_create_journey_builder_journey`, `sfmc_publish_journey` (asynchronous; check with `sfmc_get_journey_publish_status`); `sfmc_insert_contacts_into_journey_async`.
- **Errors and cost:** 401 means the connection or an expired client secret; 403 means a scope is missing; 500 usually means a wrong tenant or client ID. The MCP costs nothing extra but spends the account's yearly API call allowance.
- **API without MCP:** an API Integration of type server-to-server. `POST https://<subdomain>.auth.marketingcloudapis.com/v2/token` with `grant_type: "client_credentials"`, `client_id` and `client_secret`, plus optional `scope` and `account_id` (the business unit MID). The token lives 20 minutes (`expires_in` is 1080, so refresh 2 minutes early). Reuse it across calls rather than asking per request. Call `rest_instance_url` from the response. Use only the tenant's `marketingcloudapis.com` hosts, never `exacttargetapis.com`. Create an HTML email with `POST /asset/v1/content/assets` and `assetType.id` 208 (`htmlemail`); 207 is template-based and 209 text-only.
- **AMPscript:** blocks go in `%%[ … ]%%`; inline output in `%%= … =%%` (one function, nesting allowed); or `<script runat="server" language="ampscript">`. Close with the same kind you opened. Prefer `AttributeValue("Field")` over a bare field reference: it returns null instead of failing the send, so add a fallback with `Empty()`. `Lookup("DE name", "ReturnCol", "SearchCol", value)` returns the first match, and the search column and value are case-sensitive.

```
%%[
  Var @tier
  Set @tier = AttributeValue("LoyaltyTier")
  If Empty(@tier) Then
    Set @tier = "member"
  EndIf
]%%
<p>Thanks for being a %%=v(@tier)=%%.</p>
```

- **SQL Query Activity (segments):** `SELECT` only, against data extensions or system data views (up to six months of subscriber and journey data). The dialect is based on SQL Server 2016 but not identical: no variables, temp tables, CTEs or `--` comments, and no `SELECT *` with a join (name the columns). Refer to a data extension by Name, not External Key; prefix `ENT.` for the parent account's. Queries time out at 30 minutes, and one that fails 24 times in a row is suspended. Validate with `sfmc_validate_sql_query` and show the row count before anything writes to a sendable data extension.

## 5. Other platforms (short)

- **Loops:** one loop per lifecycle state, often keyed by a contact property such as `subscriptionStatus`; start a new sender with the welcome loop and essential transactional email before campaigns; first campaigns to recent or active users, ideally useful product updates (monthly, 2-3 items, link to the changelog). Transactional emails track no opens or clicks and carry no unsubscribe; unsubscribed contacts still receive them. Webhooks are signed; verify them. Transactional email to Google Workspace group inboxes can be held by moderation.
- **Mailchimp, Kit, beehiiv, Brevo, Customer.io:** same program rules apply (consent, tiers, flows first, pre-send gates). Map this craft's terms to theirs: flow = automation, journey, sequence or campaign workflow; segment = segment, tag rule or list filter.

## 6. Metrics that matter

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

## 7. Attribution and incrementality

- ESP-reported revenue is click-window attribution: it over-credits email (people who would have bought anyway clicked first).
- A U-shaped model (40% first touch, 40% last touch, 20% spread across the middle) is a reasonable start when blending channels.
- **Incrementality is the real answer:** hold out a small random share of a flow or segment from email and compare revenue per person over the same window. Use holdouts, not last-touch credit, to judge any AI "optimisation" that reallocates live traffic.
- Track revenue (or goal actions) **per email sent** to find the frequency where more email stops paying.
- Statistical reads, cohort retention and dashboards: hand off to `data-analysis` (`references/experiments-causal.md`, `references/statistics.md`).

## 8. Reporting rhythm

- Weekly in the first month of any new flow or platform, then monthly.
- One page: sends, delivery rate, click rate, RPR, unsubscribes, complaints, bounce rate, list growth, flow vs campaign revenue, top and bottom 3 emails, tests concluded, actions next.
- Watch complaints and bounces on every send, not monthly; a spike needs action the same day ([deliverability.md](deliverability.md)).

## Checklist

- [ ] ESP chosen on data model, agent interface, deliverability controls and 12-month cost
- [ ] Migration pulls suppressions from the old API and warms the new setup
- [ ] Agent work starts read-only; sends need explicit approval and the pre-send packet
- [ ] Connected through the vendor's own connector, MCP or API; keys in env vars or the tool's config; send, execute and publish scopes granted only when the task needs them
- [ ] Flow settings (Smart Sending, exclusions) reviewed per flow
- [ ] KPIs set on clicks, conversions and RPR, not opens
- [ ] A holdout measures email's incremental effect at least once a quarter

> Distilled from: ads + analytics (coreyhaines31/marketingskills, MIT), ads (AgriciDaniel/claude-ads, MIT), analytics-tracking (alirezarezvani/claude-skills, MIT), data-manager-api-event-ingestion and google-ads-api-account-diagnostics (google/skills, Apache-2.0), google-ads (arnabbagxd/brand-building-skills, MIT), google-ads (kostja94/marketing-skills, MIT)

# Conversion tracking, GA4, consent and offline conversions

Get this right before spending. Smart Bidding optimises toward whatever you mark as a primary conversion; wrong data makes it confidently wrong.

## 1. Define what counts

| Conversion | Category | Value | Count | Role |
|---|---|---|---|---|
| Purchase | Purchase | Dynamic order value + currency | Every | Primary |
| Qualified lead / demo | Submit lead form / Book appointment | Fixed estimate = deal value × close rate | One | Primary |
| Phone call ≥ 60 s | Phone call lead | Fixed estimate | One | Primary if calls matter |
| Signup / trial | Sign-up | Fixed estimate | One | Primary only if it predicts revenue |
| Add to cart, pricing view, scroll | — | — | — | Secondary (observe only) or not at all |
| Offline: SQL, opportunity, closed-won | Imported | Real deal value | One | Primary once flowing (B2B) |

Rules:
- One source of truth per action. A GA4 import **and** a Google Ads tag counting the same purchase doubles conversions; pick one as primary.
- Purchases count "Every" with a `transaction_id` for deduplication; leads count "One".
- Micro-conversions as primary goals teach the bidder to buy cheap, low-intent traffic.
- Conversion window: 30 days for most lead gen and ecommerce; up to 90 days for long consideration cycles.
- Attribution: data-driven (the default) or last click are the remaining models. Keep the model consistent before comparing periods.
- Check campaign-level custom goals too: a campaign can pull in a secondary action you thought was observe-only.

## 2. Install the Google tag

Via Google Tag Manager (preferred when there are several tags) or gtag.js on every page:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXX');
</script>
```

Fire the conversion only after a **confirmed** action (thank-you page or server confirmation), never on button click:

```js
gtag('event', 'conversion', {
  send_to: 'AW-XXXXXXXXX/LABEL',
  value: 99.00, currency: 'USD',
  transaction_id: 'ORDER-123'   // purchases: prevents double counting on reloads
});
```

GTM pattern: the site pushes to the dataLayer, GTM fires the tag.

```js
window.dataLayer.push({ ecommerce: null });   // clear previous ecommerce object
window.dataLayer.push({
  event: 'purchase',
  ecommerce: { transaction_id: 'T123', value: 99.99, currency: 'USD',
               items: [{ item_id: 'SKU1', item_name: 'Widget', price: 99.99, quantity: 1 }] }
});
```

Turn on **auto-tagging** (adds `gclid`) and link GA4 in Google Ads.

## 3. Enhanced Conversions

Sends hashed first-party data (email, phone, name, address) with the conversion so Google can match it to signed-in users when cookies are missing. Enable under Goals > Settings, then pass data via the tag or GTM:

```js
gtag('set', 'user_data', { email: 'user@example.com', phone_number: '+11234567890' }); // gtag hashes (SHA-256)
```

- Normalise first: lowercase, trim spaces, phone in E.164.
- **Enhanced conversions for leads**: capture the hashed email at form submit; later upload the CRM outcome keyed on that email (or gclid). This is the modern path for offline lead imports.
- Check the conversion action's diagnostics tab for match-rate warnings a few days after enabling.

## 4. Consent Mode v2 (required for EEA/UK traffic)

Four signals: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`. Set defaults **before** any tag fires, then update from the consent banner (CMP: Cookiebot, OneTrust, Usercentrics, etc.):

```js
gtag('consent', 'default', {
  ad_storage: 'denied', analytics_storage: 'denied',
  ad_user_data: 'denied', ad_personalization: 'denied',
  wait_for_update: 500
});
// after the user accepts:
gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted',
                            ad_user_data: 'granted', ad_personalization: 'granted' });
```

| Mode | Tags before consent | Result for decliners |
|---|---|---|
| None | Fire regardless | Legal exposure in EEA/UK |
| Basic | Blocked until consent | No data at all |
| Advanced | Send cookieless pings | Conversions modelled |

Modelling has eligibility thresholds (Google lists about 700 ad clicks over 7 days per country and domain grouping); low-traffic accounts may get no modelled data. Hashing is not consent: never send user data where consent was refused.

## 5. GA4 and Google Ads together

- GA4 renamed "conversions" to **key events** (March 2024). "Conversions" now means Google Ads conversion actions.
- Link GA4 ↔ Google Ads (GA4 Admin > Product links). Importing GA4 key events is fine for simple sites; the native Google Ads tag plus Enhanced Conversions is usually more accurate for bidding. Never use both as primary for the same action.
- Mark at most a handful of real outcomes as key events (GA4 allows 30 per property).
- Event names: `object_action` in snake_case (`form_submitted`, `demo_requested`, `checkout_completed`); use GA4 recommended names (`purchase`, `generate_lead`, `sign_up`) where they fit.
- UTMs: lowercase, consistent (`utm_source=google&utm_medium=cpc`). Auto-tagging already attributes Google Ads; never put UTMs on internal links.
- Cross-domain journeys (site → checkout domain): configure both domains in the Google tag settings, or sessions and gclid break.
- Expect GA4 and Google Ads numbers to differ: different attribution models, windows, click-date vs session-date reporting, and consent coverage. Compare trends, not absolute totals.
- Similar audiences no longer exist; use Customer Match lists and GA4 audiences as signals instead.

To draft a tracking plan (event taxonomy, parameters, GTM/GA4 checklist), run `python3 <skill-dir>/scripts/analytics-tracking/tracking_plan_generator.py [plan.json] [--json]` (stdlib, local only; without an input file it prints a SaaS sample). Review every generated name against the rules above before implementing.

## 6. Offline conversions (CRM → Google Ads)

The highest-impact move for lead gen and B2B: send CRM outcomes back so bidding buys pipeline, not form fills.

1. Capture `gclid` (plus `gbraid`/`wbraid` for iOS app/web journeys) in a hidden form field and store it on the lead record, along with the hashed email.
2. Create offline conversion actions per stage (qualified lead, opportunity, closed-won) with real values.
3. Upload daily via a native CRM integration (HubSpot, Salesforce), Google Ads scheduled uploads, or the **Data Manager API** (developer path, see [api-mcp-gaql.md](api-mcp-gaql.md#data-manager-api-offline-conversions)). Uploads must arrive within the conversion window (≤ 90 days after the click).
4. Make the deepest stage with enough volume (roughly 15–30 a month) the primary bidding goal; keep earlier stages secondary or value-weighted.
5. Reconcile against the CRM monthly. Where they disagree, the CRM wins.

## 7. Test before launch

Trace one real test event through every layer, bottom-up:

| Layer | Check with |
|---|---|
| 1. Site code / dataLayer | Browser console: `dataLayer` contents after the action |
| 2. GTM | Preview mode: did the tag fire on the right trigger with the right values? |
| 3. Network | DevTools Network: request to `googleadservices`/`google-analytics.com/g/collect` with value, currency, transaction_id |
| 4. Platform | Tag Assistant; Google Ads conversion action status and diagnostics; GA4 DebugView |
| 5. Reports | Conversions appear within ~3 h in Ads (up to 24 h); standard GA4 reports in 24–48 h |

Checklist:
- [ ] Fires once per real action (no reload duplicates, no GTM + hardcoded double fire)
- [ ] Value and currency correct; test values removed before launch
- [ ] Works on mobile, Safari, and across any payment or booking redirect
- [ ] Consent: tested both accepted and declined states
- [ ] Internal traffic excluded in GA4
- [ ] Only intended actions are primary

## Common failures

| Symptom | Likely cause |
|---|---|
| Conversions doubled overnight | GA4 import and Ads tag both primary; tag in GTM and hardcoded; thank-you page reloads without transaction_id |
| Conversions dropped to zero | Tag removed in a site deploy; consent banner change; thank-you URL changed |
| GA4 shows events, Ads shows none | Import not linked or not primary; auto-tagging off; gclid stripped by redirects |
| Paid traffic shows as "direct" | UTMs missing or stripped; cross-domain not configured |
| Offline uploads accepted but not matched | gclid older than the window, wrong conversion action name, timestamps without timezone |

Severity: missing primary conversion, confirmed double counting, wrong value/currency, or bidding on a non-business event are critical. A missing server-side setup alone is an opportunity, not a failure.

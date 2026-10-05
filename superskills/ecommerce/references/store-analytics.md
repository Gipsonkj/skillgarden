# Store analytics: revenue drops, AOV, retention and reviews

> Distilled from: revenue-drop-triage (woocommerce/woocommerce-claude, GPL-3.0; written in this skill's own words, no text copied); ecom with its health checks, impact formulas, benchmarks, focused-query and report-format references (takechanman1228/claude-ecom, MIT; its Python engine and SessionStart hook were not copied).

Answer the store owner's question with the store's own numbers, separate the levers, and end with checks they can run today. Deeper statistics, SQL and dashboards go to `data-analysis`.

## 1. The KPI tree

```
Revenue (collected: paid orders, net of refunds)
├── Orders = customers x orders per customer
│   ├── New customers (acquisition)
│   └── Returning customers (retention, repeat purchase)
└── Average order value = items per order x average item price - discounts
Side branches: refunds, pending / on-hold pipeline, product mix, channel mix, discount rate
```

- **Collected revenue first.** Keep pending and on-hold orders separate and never call them lost revenue; they are pipeline or checkout risk.
- Use like-for-like periods: the previous matching period by default (last 30 days vs the 30 before), or the months the owner names. Calendar-month questions use calendar months, not a trailing 30-day window.
- Check data quality before trends: partial months, test orders, a data import, currency mixing, duplicated rows.

## 2. Revenue-drop triage

1. **Is it a real drop?** Compare collected revenue, orders, AOV, customers, refunds and items sold with the comparison period. If revenue is flat or up, say so plainly, then mention any softer signals; don't force a decline story.
2. **Which lever moved?** Order volume, AOV, new vs returning customers, refunds, pending pipeline. Name the two or three with the most signal, not everything.
3. **Where?** Products that fell or dropped out of the top list (with stock status), channels that fell or dropped out, countries or payment methods only when they explain something.
4. **Severity:** low, medium or high, with one sentence on why (size of the move, concentration of the drivers, refund pressure, pipeline).
5. **Likely checks (2-3):** stock on the products that fell, recent product page, price or discount changes, campaign tagging and attribution coverage, email cadence, payment gateway errors, fulfilment delays, refund reasons.
6. **Next actions (3):** each doable today in the store admin, product content, marketing tools, the payment dashboard, carrier tools or analytics.

Interpretation rules:

- Fewer new customers suggests acquisition softness; fewer returning customers suggests retention softness; lower AOV suggests basket size, discounting or mix. Phrase these as checks, not conclusions.
- Attribution is order-source context, not ad performance. Don't claim ROAS, sessions, conversion rate or CTR without an ads or analytics source; if attribution coverage is low, say channel conclusions are partial.
- Refunds explain a net drop only when refund value or rate moved materially.
- **Small samples get counts:** if a driver rests on 5 or fewer orders, refunds or customers, give the count before any percentage.
- Don't invent causes (competitors, seasonality, ad budgets, stockouts, ranking changes) unless the owner said so or the data shows it.
- Keep it aggregate: no customer names or emails in a triage.

## 3. Health checks (defaults from the ecom engine)

Thresholds are defaults for a typical D2C store; adjust by category (consumables repeat far more than furniture).

| Area | Check | Pass | Watch | Fail |
|---|---|---|---|---|
| Revenue | Month-on-month revenue | 3 months of growth | latest -5% to 0% | below -5% or 3+ months down |
| Revenue | AOV change per month | decline under 5% | 5-10% | over 10% |
| Revenue | Order count change per month | above -5% | -10% to -5% | below -10% |
| Revenue | Largest single order share | under 5% | 5-10% | over 10% |
| Revenue | Daily revenue volatility (CV) | under 0.5 | 0.5-0.8 | over 0.8 |
| Customers | Repeat purchase rate (first-time buyers who buy again) | over 25% | 15-25% | under 15% |
| Customers | Repeat customer revenue share | over 30% | 20-30% | under 20% |
| Customers | Median days to second purchase | under 60 | 60-90 | over 90 |
| Customers | Top 10% of customers' revenue share | under 60% | 60-80% | over 80% |
| Products | Revenue from top 20% of products | 60-80% | 80-90% or under 50% | over 90% or under 40% |
| Products | Active SKUs with at least one sale | over 70% | 50-70% | under 50% |
| Products | Orders with 2+ items | over 25% | 15-25% | under 15% |

Discount checks are in [pricing-and-promotions.md](pricing-and-promotions.md); stock checks in [inventory-and-fulfilment.md](inventory-and-fulfilment.md).

## 4. Retention, LTV and cohorts

- **Repeat purchase rate** = customers with 2+ orders / customers (by first-order cohort, so new customers don't dilute it).
- **Cohort table:** rows = month of first order, columns = months since, cells = share of the cohort that ordered again (or cumulative revenue per customer). Read down the columns to see whether newer cohorts retain better.
- **LTV:** use observed cumulative revenue (or contribution) per customer at 3, 6 and 12 months by cohort rather than a formula with an assumed lifetime. State the margin basis.
- **RFM segments** (recency, frequency, monetary scores 1-5): Champions and Loyal (high R and F), At risk (low R, high F), Lost (low R and F). Watch the at-risk share (watch above 25%, fail above 35%) and act before they become lost.
- Impact sizing, when asked: extra second purchases = new customers x improvement in repeat rate (percentage points) x (LTV of a repeat buyer - LTV of a one-time buyer). State every input and call it an estimate.

## 5. Writing the review

**Focused question** (10-30 lines): direct answer with the key numbers, one or two observations that add nuance, one actionable takeaway.

**Full business review** (about 150 lines, sections in this order):

1. Executive summary: 4-6 line narrative and a scoreboard (green / amber / red markers, no scores or grades).
2. Last 30 days: KPI tree with markers, at most 1 finding.
3. Last 90 days: KPI tree, drivers, at most 2 findings.
4. Last 365 days: KPI tree, drivers, at most 3 findings.
5. Action plan: at most 5 items by time horizon, each with an owner metric, ending with 2-3 guardrail metrics that must not get worse.
6. Data notes: 2-4 lines on coverage and quality.

Each finding runs **what is** (a number) → **why it matters** (the tension) → **what to do** (a direction). Banned verbs: consider, improve, optimise, explore. Never repeat a finding across periods. Omit what you can't measure instead of writing "N/A". Write the whole report in the owner's language.

## 6. Data sources

**Pick a tool**

| Need or situation | Use | Why |
|---|---|---|
| The owner already has a dashboard or analytics tool they trust | That tool | Their numbers are the ones they act on; ask which one before pulling anything |
| Revenue, orders, AOV, customers, refunds, product mix | The store's order export or platform reports (Shopify ShopifyQL, Woo analytics) | Orders are the source of truth for money; free, no extra account |
| Sessions, funnel steps, traffic sources, landing pages | Google Analytics 4 through the Data API or the GA MCP server (section 7) | The store doesn't see visits that didn't buy |
| "The store and GA4 disagree" | Both, joined on order id (section 7) | Only the join tells a normal gap from a tracking bug |

- Platform analytics or exports (orders with line items, customers, refunds, discounts); Shopify also offers ShopifyQL reports. An order CSV with order id, date, customer id or email and revenue (after discounts, before tax and shipping) is enough for most of this guide.
- Compute in code, interpret in words: never hand-calculate deltas the tool already returns, and never present a number without what it means.
- Customer-level analysis stays inside the store's systems; share aggregates only.

## 7. Google Analytics 4: pulling purchases and reconciling with orders

GA4 is the visit-side view of the store. Read it; don't change tags or property settings without the owner's yes.

**Access (read-only).**
- Scope `https://www.googleapis.com/auth/analytics.readonly`. Sign in with Application Default Credentials: `gcloud auth application-default login --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly"`, or point `GOOGLE_APPLICATION_CREDENTIALS` at a service-account key file kept outside the repo. A service account only sees properties it has been granted access to in GA4 (the Viewer role can see data and settings through the UI or the APIs).
- **GA MCP server** (official, marked experimental): `claude mcp add analytics-mcp --scope user -e "GOOGLE_APPLICATION_CREDENTIALS=..." -e "GOOGLE_PROJECT_ID=..." -- pipx run analytics-mcp`. Needs the Analytics Admin API and Data API enabled in the Cloud project. Tools: `get_account_summaries`, `get_property_details`, `list_google_ads_links`, `run_report`, `run_funnel_report`, `get_custom_dimensions_and_metrics`, `run_realtime_report`; all read.
- **Data API directly:** `POST https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runReport`. Python: `pip install google-analytics-data`.

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

client = BetaAnalyticsDataClient()  # uses Application Default Credentials
resp = client.run_report(RunReportRequest(
    property="properties/481516234",
    dimensions=[Dimension(name="date"), Dimension(name="transactionId")],
    metrics=[Metric(name="ecommercePurchases"), Metric(name="purchaseRevenue")],
    date_ranges=[DateRange(start_date="2026-09-01", end_date="2026-09-30")],
    limit=100000,
    return_property_quota=True,
))
print(resp.metadata.time_zone, resp.metadata.currency_code,
      resp.metadata.subject_to_thresholding, resp.metadata.data_loss_from_other_row)
```

**Fields that matter.**
- `ecommercePurchases` counts `purchase` events only. `transactions` also counts in-app purchases, subscription events and refunds: don't use it to match an order count.
- `purchaseRevenue` is purchase revenue minus refunds; `grossPurchaseRevenue` before refunds; `itemRevenue` excludes tax and shipping; `totalRevenue` adds subscription and ad revenue.
- `transactionId` and `date` (`YYYYMMDD`) are the join keys.
- Rows: 10,000 by default, up to 250,000 per request with `limit`; page with `offset`. Rows whose metrics are all zero are dropped unless `keepEmptyRows` is true.

**Limits (standard property; Analytics 360 gets 2,000,000 tokens a day and 50 concurrent requests).** 200,000 core tokens per property per day, 40,000 per hour, 14,000 per project per property per hour, 10 concurrent requests, 120 potentially thresholded requests per hour. `returnPropertyQuota: true` reports what each call used.

**Check the response metadata every time.**
- `subjectToThresholding`: low counts or demographic dimensions may hide rows; widen the date range or drop the dimension.
- `dataLossFromOtherRow`: rows were rolled into "(other)"; high-cardinality dimensions (500+ values) can do this. Split the range.
- `samplingMetadatas`: present only when the report is sampled.
- `timeZone`: days are counted in the property's reporting time zone, not the store's or the shopper's.

**Reconciling store orders with GA4 purchases**

1. Same window and clock: export store orders for the period in the property's time zone; skip the last 48 hours (GA4 processing can take 24-48 hours and numbers change meanwhile).
2. Clean the store side: drop test, cancelled and voided orders, and channels the web tag never sees (POS, draft or manual orders, marketplace orders). Compare revenue on the same basis (GA4 `value` should exclude tax and shipping) and the same currency.
3. Join on order id = `transactionId`. List orders missing from GA4 by gateway, device and day, and GA4 ids missing from the store (test or foreign orders).
4. Duplicates: GA4 deduplicates web purchases with the same `transaction_id`, but not app-stream purchases, and every purchase sent with an empty `transaction_id` collapses into one. Duplicated or empty ids point to a tag firing twice or a missing parameter.
5. Expected loss: shoppers who decline consent are missing (behavioral modeling, when the property qualifies, models users, not event counts), and blocked tags never send. Report this share as normal, with the order count behind it.
6. Bug signals: missing orders clustered on one payment method (an off-site redirect that never returns to the thank-you page), one device or browser, or one date (a theme or app change); revenue off by a constant factor (tax or shipping included, wrong currency).
7. Separate the two with counts: "x of y orders missing; z of those on one gateway". State the threshold you used and what you couldn't verify (consent rate, thresholded rows).
8. Fixes are proposals until the owner says yes. Verify a fix with a test order in DebugView: enable debug mode via Tag Assistant or preview, or `gtag('config', 'G-XXXX', { debug_mode: true })` (remove the parameter to turn it off; `false` doesn't).

The `purchase` event itself needs `transaction_id`, `value`, `currency` (required when `value` is set) and `items`. Ad-platform conversion tracking for purchases goes to `google-ads`.

## Checklist

- [ ] Collected revenue compared like for like; pending kept separate
- [ ] Drop confirmed (or not) before any explanation
- [ ] Levers separated: volume, AOV, new vs returning, refunds, mix
- [ ] Small samples shown as counts; no invented causes; attribution caveats stated
- [ ] Health checks marked pass / watch / fail with category context
- [ ] Every finding: what is, why it matters, what to do; 3 doable next actions
- [ ] GA4 read-only; store vs GA4 joined on order id in the property's time zone; thresholding and "(other)" checked

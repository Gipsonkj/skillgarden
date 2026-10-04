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

- Platform analytics or exports (orders with line items, customers, refunds, discounts); Shopify also offers ShopifyQL reports. An order CSV with order id, date, customer id or email and revenue (after discounts, before tax and shipping) is enough for most of this guide.
- Compute in code, interpret in words: never hand-calculate deltas the tool already returns, and never present a number without what it means.
- Customer-level analysis stays inside the store's systems; share aggregates only.

## Checklist

- [ ] Collected revenue compared like for like; pending kept separate
- [ ] Drop confirmed (or not) before any explanation
- [ ] Levers separated: volume, AOV, new vs returning, refunds, mix
- [ ] Small samples shown as counts; no invented causes; attribution caveats stated
- [ ] Health checks marked pass / watch / fail with category context
- [ ] Every finding: what is, why it matters, what to do; 3 doable next actions

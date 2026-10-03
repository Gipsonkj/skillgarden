> Distilled from: startup-financial-modeling (wshobson/agents, MIT), financial-statements (anthropics/knowledge-work-plugins, Apache-2.0)

# Startup financial models and management reporting

## 1. Startup model structure

- **Horizon:** monthly for years 1–2, quarterly for year 3, annual for years 4–5 (key lines only).
- **Scenarios:** Conservative (P10, used for cash management), Base (P50, used for board reporting), Optimistic (P90, upside planning). Each is a separate driver set; one selector switches them (see `excel-modeling-standards.md`).
- **Sheets:** Assumptions → Revenue build → Headcount → Opex → P&L → Cash flow and runway → Metrics → Funding/cap table summary.

## 2. Revenue builds by business model

| Model | Drivers | Typical benchmarks (early stage, rough) |
|---|---|---|
| SaaS | New MRR (new customers × ARPU) + expansion − contraction − churned MRR | Gross margin 75–85%; S&M 40–60% of revenue; CAC payback < 12 months; net revenue retention 100–120% |
| Marketplace | GMV × take rate = net revenue; buyers and sellers modelled separately | Take rate 10–30% by category; contribution margin 60–70% |
| E-commerce | Traffic × conversion × average order value × purchase frequency | Gross margin 40–60%; contribution margin 20–35%; CAC payback 3–6 months |
| Services/agency | Billable headcount × utilisation × rate | Gross margin 50–70%; utilisation 70–85% |
Benchmarks are reference points to question assumptions, not targets. Keep units consistent: ARR = 12 × MRR (a model showing $100K MRR at year end implies $1.2M run-rate ARR, not $500K; recognised revenue for the year is a different number again).

Build bottom-up (pipeline, conversion rates, sales capacity × quota × ramp), and cross-check against a top-down market-share sanity check.

## 3. Costs and headcount

- Headcount plan by role and start month; fully loaded cost = salary × (1.2–1.4) for benefits, payroll tax, equipment.
- Hiring lag 3–6 months to fill; productivity ramp 3–6 months (sales quota ramps); attrition 10–15%/yr.
- COGS: hosting, third-party fees, support and onboarding staff.
- Opex: S&M (paid acquisition, sales team), R&D, G&A (finance, legal, office, tools). Add a contingency buffer (≈ 10–20%).

## 4. Unit economics

```
CAC              = S&M spend in period / new customers in period (blended and paid)
LTV              = ARPU × gross margin % / churn rate (monthly figures, or annual consistently)
LTV / CAC        > 3 is the usual bar
CAC payback (mo) = CAC / (ARPU × gross margin %)
Burn multiple    = Net burn / Net new ARR     (< 1.5 good, > 2 concerning)
Rule of 40       = Revenue growth % + FCF (or EBITDA) margin %
Magic number     = (ΔQuarterly revenue × 4) / prior-quarter S&M
```

## 5. Cash, burn, runway

```
Gross burn = total cash operating expenses per month
Net burn   = cash out − cash in per month
Runway (months) = Cash balance / average net burn (use the forward plan, not last month)
```
- Model cash timing: annual prepay vs monthly billing, payment terms (DSO), payables, deferred revenue.
- Raise to reach the next milestone plus ~6 months buffer; start fundraising with 9–12 months of runway left.

## 6. Fundraising maths

```
Post-money = Pre-money + Investment
New investor ownership = Investment / Post-money
Existing holders diluted by the same %, plus any option-pool top-up created pre-money
```
Example: $5M at $20M pre → $25M post → 20% dilution. Show use of funds by category and the milestones it buys (e.g. product launch, $1M ARR, CAC break-even, Series A metrics).

## 7. Model validation checklist

- Revenue growth plausible versus comparable companies at the same stage.
- Unit economics realistic (LTV/CAC > 3, payback < 18 months) and consistent with S&M spend and growth.
- Headcount matches the revenue plan (sales capacity, support ratio).
- Cash never negative without a funding event; runway computed from the forward plan.
- Scenarios differ by drivers, and all three are internally consistent.
- Assumptions documented with sources.

## 8. Management reporting (monthly/quarterly close)

**Income statement pack:** current period, prior period, variance $ and %, budget, budget variance; YTD columns; margins in % and basis-point changes.

**Variance analysis:**
1. Set a materiality threshold (e.g. > 10% and > a fixed dollar amount, scaled to the line's size).
2. For each material variance, decompose: volume, price/rate, mix, timing (accruals, cut-off), one-off items, FX.
3. Give the business driver in one sentence and say whether it is expected to persist.
4. Flag items needing follow-up (owner and date).

**Balance sheet and cash flow:** roll-forwards for key accounts, working-capital metrics (DSO, DIO, DPO), cash flow bridge from net income to change in cash.

**KPI page:** the 5–8 metrics leadership tracks (e.g. ARR, NRR, gross margin, burn, runway, CAC payback), each with trend and target.

Statements for external reporting, tax or audit purposes must be reviewed by a qualified accountant; this skill supports preparation and analysis only.

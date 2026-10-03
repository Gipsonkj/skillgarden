> Distilled from: comps-analysis (anthropics/financial-services, Apache-2.0), initiating-coverage (anthropics/financial-services, Apache-2.0)

# Comparable company analysis (trading comps)

Read `references/excel-modeling-standards.md` for spreadsheet rules.

## 1. Frame it first

Ask (or infer and state):
1. The question: undervalued? most efficient? fastest growing? best cash generator?
2. Audience: investment committee, board, quick reference, memo.
3. Context: M&A, IPO/funding pricing, portfolio monitoring, sector overview.
4. Format: user template or default.

Not a good fit: pre-revenue startups, distressed companies, conglomerates, unique business models (use DCF or sum-of-the-parts instead).

## 2. Peer group

- 4–10 companies with similar business model, end market, scale and geography. Explain each inclusion and any notable exclusion.
- Same period basis for everyone (LTM, or NTM consensus, dated). Calendarize different fiscal years.
- Same units throughout (state $m or $bn).

## 3. Layout

Header: title; tickers; "As of <date> | USD millions except per share and ratios".

**Operating block** (core): Company, Revenue, Revenue growth %, Gross profit, Gross margin %, EBITDA, EBITDA margin %. Optional by context: FCF and FCF margin, net income, Rule of 40 (SaaS: growth % + FCF or EBITDA margin %), CapEx/revenue.

**Valuation block** (core): Market cap, Enterprise value, EV/Revenue, EV/EBITDA, P/E. Optional: FCF yield, PEG, P/B, ROE, net debt/EBITDA.

**Statistics rows** under each block, after one blank row: Max, 75th percentile (`QUARTILE(range,3)`), **Median**, 25th percentile, Min. Statistics only for comparable ratios (margins, growth, multiples), not size metrics (revenue, market cap, EV).

Keep it to about 5 operating + 5 valuation columns; over 15 metrics is noise.

## 4. Formulas

```
Gross margin   = Gross profit / Revenue
EBITDA margin  = EBITDA / Revenue
EV             = Market cap + Debt + Preferred + Minority interest − Cash
EV/Revenue     = EV / LTM revenue
EV/EBITDA      = EV / LTM EBITDA
P/E            = Market cap / Net income   (or Price / diluted EPS)
FCF yield      = FCF / Market cap
PEG            = P/E / (EPS growth % × 100)
```
Valuation formulas reference the operating block's cells; never re-enter revenue.

Match numerator and denominator: EV multiples use enterprise-level metrics (revenue, EBITDA); equity multiples (P/E, P/B) use equity-level metrics. Same period on both sides.

## 5. Metrics by sector

| Sector | Must have | Optional | Skip |
|---|---|---|---|
| Software/SaaS | Growth, gross margin, Rule of 40, EV/Revenue | ARR, net revenue retention, CAC payback | Asset turnover |
| Industrials | EBITDA margin, CapEx/revenue, EV/EBITDA | ROA, backlog, inventory turns | Rule of 40 |
| Banks/financials | ROE, ROA, efficiency ratio, P/E, P/B | Net interest margin, credit losses | Gross margin, EBITDA |
| Retail/e-commerce | Growth, gross margin, inventory turns | Same-store sales, CAC | Heavy R&D metrics |

## 6. Applying the comps

1. Pick the 1–2 multiples the market actually uses for this sector.
2. Use the median (and 25th–75th range), not the mean; outliers distort averages.
3. Apply to the target's metric → implied EV range → equity bridge → per-share range.
4. Justify a premium or discount to the median with specific differences (growth, margins, risk, scale).
5. Show it on a football-field chart beside DCF and precedent-transaction ranges.

**Precedent transactions** (M&A context): deals in the last ~3–5 years in the same sector; EV/EBITDA and EV/Revenue at announcement; note control premium (typically 20–40% over unaffected price) and the market cycle at the time.

## 7. Sanity checks

- Gross margin > EBITDA margin > net margin for every row.
- EV/EBITDA usually 8–25×; P/E 10–50×; EV/Revenue varies widely by sector. Values outside → check data or explain.
- Higher growth generally pairs with higher multiples; if not, ask why.
- Negative or tiny EBITDA/earnings make the multiple meaningless: show "n.m." not a number.

## 8. Notes section (required)

Data sources and dates, definitions (EBITDA = operating income + D&A, adjusted or not; FCF = CFO − CapEx), period basis, adjustments (one-offs excluded), and how to read the quartiles. Every hardcoded input has a cell comment with its source.

## Common mistakes

Mixing market cap and EV in one multiple; LTM numerator with quarterly denominator; averaging percentages instead of taking the median; non-comparable peers; undated or stale data; too many columns.

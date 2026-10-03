> Distilled from: dcf-model (anthropics/financial-services, Apache-2.0), initiating-coverage (anthropics/financial-services, Apache-2.0), equity-research (rollingSirius/equity-research-skill, MIT)

# DCF valuation

Read `references/excel-modeling-standards.md` first when the output is a spreadsheet.

## 1. Inputs to confirm before projecting

Show the user this block and confirm it:
- Latest revenue (LTM or last fiscal year), gross, EBIT and FCF margins (3–5 years of history)
- D&A and CapEx as % of revenue; net working capital change as % of revenue change
- Tax rate (effective and statutory; 21–28% typical for US)
- **Diluted** shares (include options/RSUs via treasury stock method; check recent buybacks/issuance)
- Total debt, cash, preferred, minority interest; **net debt vs net cash** (sign errors here swing value the most)
- Current share price and date

## 2. Projections (5 years standard; 7–10 for long-runway growers; 3 for very stable)

- **Revenue:** Revenue_t = Revenue_{t−1} × (1 + g_t). Show both dollars and growth %. Years 1–2 reflect visibility; fade toward the industry rate by years 4–5 and toward terminal growth after.
- **Costs:** model gross margin and each opex line (S&M, R&D, G&A) as **% of revenue** (not of gross profit). Show operating leverage: % falls as revenue scales, with a stated reason.
- **Unlevered FCF:**
```
EBIT
− Taxes on EBIT (EBIT × tax rate)
= NOPAT
+ D&A
− CapEx           (maintenance ~2–3% of revenue + growth capex)
− Increase in NWC (typically −2% to +2% of the revenue change; a decrease is a cash source)
= Unlevered free cash flow
```
- Three cases (Bear/Base/Bull) with explicit drivers, not a haircut on Base.

## 3. Base rates: keep assumptions honest

Put each key assumption next to how often history achieved it:
- Revenue growth mean-reverts fast. Companies growing > 20%/yr rarely sustain it for 10 years (only low single-digit percent do); 10–20% growers typically fade to mid-single digits within ~5 years. Size makes it harder: each order of magnitude of revenue roughly halves the odds of sustaining a growth rate.
- Long-term growth forecasts from analysts tend to run several points too high.
- Gross margin is sticky (a business-model trait); operating margins mean-revert, slower for firms with durable high ROIC.
- An assumption above roughly the 80th percentile of history needs a structural reason and a leading indicator you can watch; otherwise cut it.
- A bear case that still grows double digits is not a bear case.
Cite these as rough empirical ranges (Mauboussin, McKinsey long-run studies), not exact statistics.

## 4. Discount rate (WACC)

```
Cost of equity  Ke = Rf + β × ERP           (+ size/country premium only with a stated reason)
Rf              current 10-year government yield (same currency as cash flows), dated
ERP             4.5–6.0%, state the source
β               2–5 yr regression vs the main index, or industry unlevered beta relevered:
                β_L = β_U × (1 + (1 − t) × D/E)
After-tax Kd    pre-tax yield on the company's debt (or rating-implied) × (1 − t)
WACC            Ke × E/(D+E) + Kd × D/(D+E), market-value or target weights
```
- Use gross debt (or a target structure) for weights. A net-cash company does not get a negative debt weight; use WACC ≈ Ke and add the cash in the equity bridge.
- Sanity ranges: large stable 7–9%, growth 9–12%, high-risk 12–15%+. One WACC for the whole report.

## 5. Discounting

- Mid-year convention: discount periods 0.5, 1.5, 2.5, ... ; factor = 1 / (1 + WACC)^period.
- PV_t = UFCF_t × factor_t.
- Example: FCF 1,000, WACC 10%, period 0.5 → 1,000 / 1.10^0.5 = 953.

## 6. Terminal value

**Perpetuity growth (primary):** TV = UFCF_N × (1 + g) / (WACC − g).
- g must be below WACC and should not exceed long-run nominal GDP or the risk-free rate; 2.0–3.0% is the usual range, 3.5%+ needs a reason.
- Under the mid-year convention discount a perpetuity-growth TV at period N − 0.5 (consistent with mid-year flows); an exit-multiple TV at period N. Pick one convention, state it, and use it everywhere.

**Exit multiple (cross-check):** TV = EBITDA_N × multiple (from comps or precedents, typically 8–15× for mature businesses). Back out the implied perpetual growth and the implied multiple from the other method; if they disagree wildly, one assumption is off.

**TV share check:** PV(TV) usually 50–75% of EV. Above ~75% the answer rests on the terminal assumption; below ~40% check whether terminal inputs are too low.

## 7. Equity bridge

```
Σ PV(UFCF) + PV(TV)                     = Enterprise value
− Debt − Preferred − Minority interest
+ Cash and non-operating assets         = Equity value
÷ Diluted shares                        = Value per share
vs current price                        = Implied upside/downside
```

## 8. Reverse DCF (what the price implies)

Hold WACC and terminal assumptions, solve for the revenue growth or margin that makes value per share equal the current price (Goal Seek or a small solver). Compare that implied path to the base rates in §3. "The price implies 18% growth for 10 years, which few companies have done" is often more useful than a point target.

## 9. Sensitivities

Three 5×5 grids at the bottom of the DCF sheet:
1. WACC (±0.5% steps) × terminal growth (±0.25–0.5%) → value per share
2. Revenue growth × EBIT margin → value per share
3. WACC × exit multiple (or terminal growth) → EV
Centre cell = base output (see standards). Also show Bear/Base/Bull values side by side, and optionally probability-weighted value with the weights stated.

## 10. Validate

1. Recalculate the workbook (see standards §1).
2. Run `python3 scripts/dcf-model/validate_dcf.py model.xlsx [results.json]` (needs `openpyxl`). It flags formula errors, terminal growth ≥ WACC, WACC outside 5–20%, and TV share outside 40–80%. Exit code 1 = fix before delivery.
3. Manual checks: net debt sign; diluted not basic shares; growth % row matches dollar row; tax on EBIT not EBT; TV discount period matches the stated convention; centre sensitivity cell = output.

## Top errors

| Error | Fix |
|---|---|
| Opex % of gross profit | % of revenue |
| Net cash treated as debt (or vice versa) | Recheck sign in bridge |
| Basic shares | Diluted, treasury stock method |
| g ≥ WACC or g > GDP | Cap g, explain |
| TV > 80% of EV unexamined | Lengthen projection or revisit growth fade |
| Hardcoded projections | Formulas to drivers |
| Mixing levered FCF with WACC | Unlevered FCF with WACC; levered FCF with cost of equity |

Output framing: a value range and the assumptions it depends on. Not a personal buy/sell call (see the router's advice rule).

> Distilled from: lbo-model (anthropics/financial-services, Apache-2.0), merger-model (anthropics/financial-services, Apache-2.0)

# LBO and merger (accretion/dilution) models

Read `references/excel-modeling-standards.md` first.

## Part A — LBO

### 1. Template first
If the user attached a template, use it exactly; copy and populate, never rebuild from scratch. If none, ask whether they have one; otherwise build the standard sections: Sources & Uses, operating model, debt schedule, returns, sensitivities. Map every section, the timeline (closing / pro forma column, projection years) and existing formulas before writing.

### 2. Formula hierarchy for each empty cell
1. What the template's label, comment or neighbouring pattern says.
2. What the user specified.
3. Standard LBO practice, with the assumption noted. Ask if genuinely unclear.

### 3. Sections and rules

**Sources & Uses**
```
Uses:    Purchase equity value (or EV) + Refinanced debt + Transaction fees + Financing fees (+ minimum cash)
Sources: Term loans / senior notes / sub debt (each = multiple × EBITDA) + Rollover + Sponsor equity (PLUG)
Check:   Total sources − total uses = 0
```
Entry EV = entry multiple × LTM EBITDA.

**Operating model:** revenue growth, EBITDA margin, D&A, CapEx, ΔNWC, taxes → unlevered FCF → less interest and mandatory amortization → cash available for sweep.

**Debt schedule**
- Interest on **opening** balance (avoids circularity), or average with iteration enabled and a breaker.
- Mandatory amortization per tranche (e.g. 1%/yr term loan A/B).
- Cash sweep in seniority order: `=MIN(cash available, opening balance − mandatory)`; balances never negative (`MAX(0, ...)`).
- Track leverage (Debt/EBITDA) and coverage (EBITDA/interest) each year.

**Taxes:** tax on EBT only; decide and state whether losses create a shield.

**Exit and returns**
```
Exit EV        = Exit multiple × exit-year EBITDA
Exit equity    = Exit EV − net debt at exit
MOIC           = Exit equity to sponsor / Sponsor equity invested
IRR            = IRR(cash flows: −equity at t0, dividends, +exit equity at tN)  (XIRR with dates)
```
Investment negative, proceeds positive, consecutive periods for IRR. Rule-of-thumb: 2.0× over 5 years ≈ 15% IRR; 3.0× over 5 ≈ 25%.

**Sensitivities (odd grids, centre = base):** IRR and MOIC vs entry multiple × exit multiple; IRR vs leverage × EBITDA growth.

### 4. Verification
- Sources = Uses; plug is the sponsor equity.
- BS balances (if built), cash ties, opening = prior closing on every schedule.
- No negative debt; sweep respects seniority.
- Returns signs correct; centre sensitivity = model IRR/MOIC; neighbouring cells differ.
- Zero formula errors after recalculation.

## Part B — Merger model (accretion/dilution)

### 1. Inputs
- **Acquirer:** price, diluted shares, LTM/NTM EPS (GAAP and adjusted), tax rate, cash, debt, pre-tax cost of debt, interest earned on cash.
- **Target:** price, diluted shares, net income/EPS (LTM/NTM), net debt.
- **Deal:** offer price or premium, cash/stock mix, new debt, synergies (cost and revenue) with phase-in, fees (deal and financing), expected close.

### 2. Purchase price
Offer price × target diluted shares = equity value; + net debt assumed = EV. Show premium to unaffected price and implied EV/EBITDA and P/E.

### 3. Sources & Uses
Sources: new debt, acquirer cash, new shares issued. Uses: equity purchase, refinanced target debt, fees. Must balance.
New shares = stock consideration ÷ acquirer share price.

### 4. Pro forma EPS (years 1–3)
```
  Acquirer net income
+ Target net income
+ Synergies × (1 − t)              (year 1 often only 25–50% of run-rate)
− Forgone interest on cash used × (1 − t)
− Interest on new debt × (1 − t)
− New intangible amortization × (1 − t)  (from purchase price allocation)
= Pro forma net income
÷ (Acquirer shares + new shares)
= Pro forma EPS;  Accretion % = PF EPS / standalone EPS − 1
```
Use the acquirer's marginal tax rate for all adjustments. Show GAAP and adjusted EPS where they differ.

Quick test for all-stock deals: accretive in year 1 if target P/E (at offer) < acquirer P/E, before synergies and amortization. For cash deals compare the target's earnings yield (1/offer P/E) with the after-tax cost of debt or forgone cash interest.

### 5. Sensitivities and breakeven
- Accretion/dilution vs synergies × offer premium (5×5).
- Accretion/dilution vs cash/stock mix (100/0 … 0/100) by year.
- **Breakeven synergies:** pre-tax synergies needed for year-1 EPS-neutral = (standalone EPS × PF shares − PF net income ex-synergies) ÷ (1 − t).

### 6. Output
Assumptions tab, Sources & Uses, pro forma P&L, accretion/dilution summary, sensitivities, breakeven, plus a one-page merger-consequences summary.

> Distilled from: 3-statement-model (anthropics/financial-services, Apache-2.0), financial-statements (anthropics/knowledge-work-plugins, Apache-2.0)

# Three-statement model (IS, BS, CF)

Read `references/excel-modeling-standards.md` first.

## 1. Map the template before touching cells

- List the tabs: IS / P&L, BS, CF, working capital, D&A/PP&E, debt, tax/NOL, assumptions, checks.
- Find input cells (blue font / shading) vs formula cells; named ranges; scenario selector.
- Confirm units, sign convention (expenses positive or negative), fiscal year labels (FY2024A, FY2025E), and the historical/projection boundary.
- Show the user the map and confirm before filling anything.

## 2. Order of work (confirm after each)

1. Historicals entered and tied to source (10-K/10-Q or user data).
2. Income statement projections → check subtotals.
3. Balance sheet → check Assets = Liabilities + Equity every period.
4. Cash flow → check CF ending cash = BS cash every period.
5. Scenarios toggled → checks pass in each case.

## 3. Core formulas

```
Gross profit         = Net revenue − Cost of revenue   (net of returns, allowances, discounts)
EBITDA               = EBIT + D&A
Opex lines (forecast)= Net revenue × % assumption (COGS, S&M, R&D, G&A, SBC)
Interest expense     = Opening debt × rate  (or average debt with iterative calc enabled)
Net income           = EBT − Taxes (tax only on positive EBT unless NOLs are modelled)
```

**Working capital**
```
DSO = AR / Revenue × 365          AR_end  = Revenue × DSO / 365
DIO = Inventory / COGS × 365      Inv_end = COGS × DIO / 365
DPO = AP / COGS × 365             AP_end  = COGS × DPO / 365
NWC = AR + Inventory − AP         ΔNWC = NWC_t − NWC_{t−1}
```

**Roll-forwards** (opening = prior closing, always)
```
PP&E:  Opening gross + CapEx = Closing gross; Accumulated dep + Dep = Closing; Net = Gross − Acc. dep
Debt:  Opening + Borrowings − Repayments = Closing
RE:    Opening RE + Net income − Dividends (± SBC/other per template) = Closing RE
Equity raise: ΔCommon stock/APIC on BS = Equity issuance in CFF
```

**Cash flow**
```
CFO = Net income + D&A + SBC − ΔAR − ΔInventory + ΔAP (± other)
CFI = −CapEx (± acquisitions, asset sales)
CFF = + Debt issued − Debt repaid + Equity issued − Dividends − Buybacks
Ending cash = Opening cash + CFO + CFI + CFF
```

Sign convention: increase in an asset = use of cash (negative); increase in a liability = source (positive); CapEx, repayments, dividends negative.

## 4. Integrity checks (all must be 0)

| Check | Formula |
|---|---|
| Balance | Total assets − total liabilities − total equity |
| Cash tie | CF ending cash − BS cash |
| Net income link | IS net income − CF starting net income |
| Retained earnings | Prior RE + NI − dividends (± adjustments) − BS RE |
| Equity financing | ΔAPIC − equity issued in CFF |
| Monthly vs annual (if both) | Closing cash monthly − annual |

If the balance check fails: compare the period's change in the gap to each roll-forward; the usual culprits are a missing CF line for a BS account, a sign flip on a working-capital item, or RE not picking up net income.

## 5. Circularity

Interest → net income → cash → debt balance → interest. Either use the opening balance for interest (no circularity) or enable iterative calculation with a circuit-breaker toggle cell. Say which.

## 6. Optional outputs (only if asked or the template has them)

**Margins** under each profit line: gross, EBITDA, EBIT, net.

**Credit metrics:** Total debt/EBITDA, Net debt/EBITDA, EBITDA/interest, Debt/(Debt+Equity), current ratio, quick ratio. Hierarchy check across scenarios: leverage Upside < Base < Downside; coverage and liquidity the reverse. Add covenant headroom rows when covenants are known.

**Scenarios:** Base = guidance/consensus; Upside = above-guidance growth and margin expansion; Downside = below-trend growth, margin compression. Sensitize growth, gross margin, SG&A %, DSO/DIO/DPO, CapEx %, rate, tax rate.

## 7. Template etiquette

- Edit only input cells; never overwrite a formula unless intended, and note the original.
- Paste values, not formats, from sources.
- Do not delete rows/columns without tracing dependents across tabs.
- Expect temporary `#DIV/0!` until all inputs exist; none may remain at delivery.

## 8. Reporting statements (accounting close)

For monthly/quarterly P&L packs: columns Current, Prior period, Variance $, Variance %, Budget, Budget variance. Flag material variances with a threshold (e.g. > $100k or > 10% for mid-size lines; tighter for large lines), decompose into volume, price/rate, mix, one-offs, timing and FX, then give the business reason and whether it is a trend. Margins change in basis points. Statements for reporting or filings must be reviewed by a qualified accountant.

SEC data: pull from the 10-K/10-Q financial statements and notes (segment data, debt maturities, share counts on the cover page); cite filing and page.

> Distilled from: dcf-model, comps-analysis, 3-statement-model, lbo-model (anthropics/financial-services, Apache-2.0)

# Spreadsheet model standards (all Excel models)

Applies to DCF, comps, three-statement, LBO and merger models.

## 1. Environment

- **Inside a live Excel session (Office.js add-in):** write with `range.formulas = [["=D19*(1+$B$8)"]]`, never `.values` for derived cells. Excel recalculates itself.
  - Merged headers: write the text to the top-left cell first, then merge and format the range. Calling `.merge()` and then setting `.values` on the whole range throws `InvalidArgument`.
- **Standalone .xlsx (Python/openpyxl):** write formula strings (`ws["D20"] = "=D19*(1+$B$8)"`). openpyxl does not calculate: before reading results or running a validator, recalculate (open and save in Excel, run LibreOffice headless, or use an available recalc helper such as the xlsx skill's `recalc.py`). Fix every `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?` before delivery.

## 2. Formulas over hardcodes (non-negotiable)

- Only three kinds of typed numbers: historical actuals, assumption drivers, current market data (price, shares, debt).
- Everything else (projections, margins, discount factors, PVs, sensitivities, checks) is a live formula that flexes when an input changes.
- If you computed a number in Python and are about to paste it into a cell, stop and write the formula.
- Never enter the same raw number twice; reference the first cell.

## 3. Layout before formulas

1. Plan every section's row positions.
2. Write all headers and labels.
3. Write dividers and blank rows.
4. Then write formulas against the locked rows; test one column, then fill across.
Inserting rows after formulas exist is the main source of off-by-one references and `#REF!`.

## 4. Colour and format conventions

Font colour says what a cell is:
| Font | Meaning |
|---|---|
| Blue `#0000FF` | Hardcoded input |
| Black | Formula |
| Green `#008000` | Link to another sheet |
| Purple `#800080` (LBO convention, optional) | Direct link within the same sheet |

Fill colour says where you are (default palette; a user or template palette always wins):
| Element | Fill |
|---|---|
| Section header | Dark blue `#1F4E79`, white bold text |
| Column header | Light blue `#D9E1F2`, bold |
| Inputs | White or light grey `#F2F2F2` |
| Key outputs, check rows, sensitivity base case | Medium blue `#BDD7EE`, bold |

Number formats: currency `$#,##0;($#,##0);"-"`, percentages `0.0%`, multiples `0.0"x"` (MOIC `0.00"x"`), negatives in parentheses, units row stating $m / $bn. Right-align numbers.

## 5. Sources on every input

Add a cell comment as each input is typed, not at the end: `Source: <system/document>, <date>, <reference>, <URL>` (e.g. "FY2024 10-K p.42, Total revenue, sec.gov link"). For assumptions: the reasoning ("15% EBITDA margin = peer median; company does not disclose").

Data priority: connected institutional data tools (MCP servers for filings/market data) → user-provided data → primary filings (SEC EDGAR 10-K/10-Q/8-K, annual reports) → reputable web sources, each with date. Never fill gaps from memory; write "not available" and ask.

## 6. Scenarios

- Separate Bear / Base / Bull (or Downside / Base / Upside) blocks, each with its own year-header row so every assumption maps to a year.
- One case selector cell (1/2/3). A "selected case" column pulls the active values with `INDEX` or `CHOOSE`; projection formulas reference only that column. No nested IFs scattered through the model.
- Check that toggling the selector moves every statement and that all checks still pass in every case.

## 7. Sensitivity grids

- Odd dimensions (5×5, sometimes 7×7) so there is a true centre.
- Axis values symmetric around the model's base inputs: `[base − 2·step, base − step, base, base + step, base + 2·step]`.
- The centre cell must equal the model's actual output; highlight it (`#BDD7EE`, bold). If it doesn't match, the grid is wired wrong.
- Every cell is a full formula recalculation for that pair of inputs (write them in a loop). Not Excel's Data Table feature, no linear approximations, no placeholders.
- Each cell must differ from its neighbours; identical values mean the axis references are broken. Use mixed references (`$A5`, `B$4`).

## 8. Checks

Put a check row on each sheet that shows 0 when the model is consistent (balance sheet balances, cash ties, sources = uses). Conditional-format non-zero checks.

## 9. Work in stages, confirm each

Do not build end-to-end and present the finished file. Stop after each stage (inputs → revenue → costs → cash flow → discount rate → valuation → sensitivities), show the block, and confirm before building the next. A wrong input found after the sensitivity tables means rebuilding everything downstream.

## 10. Delivery

- File name: `<Ticker>_<Model>_<YYYY-MM-DD>.xlsx`.
- Zero formula errors; all checks zero; centre cells match; sources commented.
- Summarise key outputs and the 3 assumptions the answer is most sensitive to.
- Add: "For research and education only; not investment advice."

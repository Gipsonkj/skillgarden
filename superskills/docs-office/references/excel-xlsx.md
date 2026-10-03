> Distilled from: minimax-xlsx (MiniMax-AI/skills, MIT), officecli (iOfficeAI/OfficeCLI, Apache-2.0), gws-sheets (googleworkspace/cli, Apache-2.0), markdown-exporter (bowenliang123/markdown-exporter, Apache-2.0)

# Excel workbooks (.xlsx, .xlsm, .csv)

Two rules decide most outcomes: derived numbers are live formulas, and an existing workbook is edited in place, never rebuilt.

## Choose the path

| Task | Path |
|---|---|
| Analyse data in a workbook or CSV | `scripts/minimax-xlsx/xlsx_reader.py` for structure, then pandas |
| New model or report with formulas and formatting | openpyxl (simple) or the XML template `templates/minimax-xlsx/minimal_xlsx/` + `xlsx_pack.py` (full control) |
| Fill cells, add a row/column, add formulas in an existing file | unpack → edit XML → pack (scripts below) |
| Repair `#REF!`, `#NAME?`, `#DIV/0!` | `formula_check.py` → fix `<f>` nodes → pack → re-check |
| Apply financial formatting to an existing file | append styles to `xl/styles.xml`, update cell `s` attributes |
| Markdown tables to a sheet | `markdown-exporter md_to_xlsx` or pandas `to_excel` |
| Google Sheets | google-workspace.md |

**Edit-in-place rule.** For existing files never create a new `Workbook()` and never round-trip through openpyxl when the file has macros (.xlsm), pivot tables, charts, slicers, sparklines, data validation or external links: openpyxl silently drops or damages them. Unpack, edit the XML, repack. openpyxl is fine for brand-new workbooks and for plain data-only files.

## Scripts (scripts/minimax-xlsx/, stdlib Python)

| Command | Use |
|---|---|
| `python3 xlsx_reader.py in.xlsx [--sheet NAME]` | sheets, dimensions, headers, types, sample rows |
| `python3 xlsx_unpack.py in.xlsx work/` | unzip and pretty-print for editing |
| `python3 xlsx_pack.py work/ out.xlsx` | rezip in the correct order |
| `python3 xlsx_add_column.py work/ --col G --sheet "Sheet1" --header "% of Total" --formula '=F{row}/$F$10' --formula-rows 2:9 --total-row 10 --total-formula '=SUM(G2:G9)' --numfmt '0.0%' --border-row 10 --border-style medium` | add a formula column, copying neighbour styles |
| `python3 xlsx_insert_row.py work/ --at 5 --sheet "Budget" --text A=Utilities --values B=3000 C=3000 --formula 'F=SUM(B{row}:E{row})' --copy-style-from 4` | insert a row, shift rows below, extend SUM ranges |
| `python3 xlsx_shift_rows.py work/ insert 5 1` | low-level row shift (insert_row calls it for you) |
| `python3 formula_check.py out.xlsx [--json|--report] [--sheet NAME]` | static formula validation; exit 0 = clean |
| `python3 libreoffice_recalc.py in.xlsx recalculated.xlsx [--timeout 120]` / `--check` | full recalculation through headless LibreOffice; exit 2 = LibreOffice missing (report as skipped) |
| `python3 style_audit.py out.xlsx [--json|--summary]` | find colour-role and number-format violations |
| `shared_strings_builder.py` | rebuild `sharedStrings.xml` counts |

**Row lookup rule.** When a request says "after row 5 (Office Rent)", find the label in the XML (`grep -n "Office Rent" work/xl/sharedStrings.xml`, then its index in the sheet) instead of trusting the number in the prompt.

## Create from the XML template

1. Plan sheets, rows, inputs vs calculations, and which cells reference other sheets.
2. Copy `templates/minimax-xlsx/minimal_xlsx/` to a work folder.
3. Add sheets: one `<sheet>` in `xl/workbook.xml`, a relationship in `xl/_rels/workbook.xml.rels` (new sheets use rId4+, since rId1-3 are taken), an `<Override>` in `[Content_Types].xml`, and the `xl/worksheets/sheetN.xml` file.
4. Put text in `sharedStrings.xml`; keep `count` and `uniqueCount` equal to the number of `<si>` entries.
5. Write cells: text `<c r="A1" t="s" s="4"><v>0</v></c>`; number `<c r="B2" s="5"><v>85000000</v></c>`; formula `<c r="B4" s="6"><f>SUM(B2:B3)</f><v></v></c>` (no leading `=` inside `<f>`).
6. Pack with `xlsx_pack.py`, then run `formula_check.py`, and `libreoffice_recalc.py` when available so cached values exist for viewers that don't calculate.

Template style slots (`s` attribute):

| s | Role | s | Role |
|---|---|---|---|
| 0 | default | 7 | percent input (blue, 0.0%) |
| 1 | input / assumption (blue) | 8 | percent formula (black, 0.0%) |
| 2 | formula (black) | 9 | integer input (blue, #,##0) |
| 3 | cross-sheet formula (green) | 10 | integer formula (black, #,##0) |
| 4 | header (bold) | 11 | year (blue, format `0`, so 2026 not 2,026) |
| 5 | currency input (blue, $#,##0) | 12 | key assumption to review (blue on yellow) |
| 6 | currency formula (black, $#,##0) | | |

New styles: append only. Add a `<numFmt>` (custom IDs from 164), font/fill/border if needed, then a new `<xf>` at the end of `<cellXfs>`, update every `count` attribute. Never modify an existing `<xf>`; other cells point at it. Colours are 8-digit AARRGGBB (`FF0000FF` blue).

## Financial modelling conventions

| Cell role | Font colour |
|---|---|
| Hard-coded input or assumption | blue `0000FF` |
| Formula on the same sheet | black |
| Formula referencing another sheet | green `008000` |
| Link to another file | red `FF0000` (fragile, flag it) |
| Assumption awaiting confirmation | blue on yellow fill |

A blue cell must not contain a formula; a black number must not be hard-coded.

Number formats:

| Data | Format code |
|---|---|
| Currency, negatives in brackets, zero as dash | `$#,##0;($#,##0);"-"` |
| Currency with cents | `$#,##0.00;($#,##0.00);"-"` |
| Thousands / millions | `#,##0,"K"` / `#,##0,,"M"` |
| Percent | `0.0%` (store 12.5% as 0.125) |
| Multiple | `0.0x` |
| Year | `0` |

Model layout: assumptions on their own sheet or block at the top; calculations reference assumption cells (absolute refs like `$B$3`), never typed constants; one formula pattern per row copied across periods; totals with `SUM` over the full range; a checks row (e.g. balance sheet balances = 0). Label units in headers ("Revenue ($000)").

## Formulas

- Quote sheet names with spaces: `'Sales Data'!D2:D13`. Escape `&` as `&amp;` in XML.
- Prefer `INDEX/MATCH` or `XLOOKUP` (Excel 365 only; LibreOffice supports it from 24.8) over hard-coded positions.
- Guard divisions: `IFERROR(x/y, 0)` or `IF(y=0, "-", x/y)`; don't hide real errors with blanket `IFERROR`.
- No circular references unless iterative calculation is intended and documented.
- Dynamic-array and newer functions (`FILTER`, `UNIQUE`, `LET`, `LAMBDA`) break in older Excel; ask about the audience's version.

| Error | Usual cause | Fix |
|---|---|---|
| `#REF!` | deleted row/sheet, wrong sheet name | rebuild the reference |
| `#NAME?` | misspelled function, unquoted sheet name, function not in this Excel | correct the name |
| `#DIV/0!` | empty or zero denominator | guard with `IF`/`IFERROR` |
| `#VALUE!` | text in a numeric operation | fix the type (numbers stored as text: drop `t="s"`) |
| `#N/A` | lookup miss | check keys, trailing spaces, exact-match flag |

## Reading and analysis

- Run `xlsx_reader.py` first; then `pandas.read_excel(path, sheet_name=None)` for all sheets. Use `header=` and `skiprows=` when the header isn't on row 1.
- Merged cells and multi-row headers need explicit handling; check the first rows before trusting column names.
- Compute aggregates from the dataframe columns directly; don't re-derive values first.
- If the user asks for N decimal places, format every number that way (`f"{v:.2f}"`).
- Never modify the source file during analysis.
- `openpyxl.load_workbook(path, data_only=True)` returns cached values; they are `None` for formulas never calculated by a spreadsheet app (run `libreoffice_recalc.py` first).

## Delivery checklist

- [ ] Output opens without a repair prompt; same sheet names and original data as the input (for edits)
- [ ] `formula_check.py` reports 0 errors; LibreOffice recalc run or reported as skipped
- [ ] Every calculated cell has `<f>`; inputs blue, formulas black, cross-sheet green
- [ ] `count` attributes match in sharedStrings and styles; every `s` < cellXfs count
- [ ] Years show without thousands separators; percentages stored as fractions
- [ ] Header row frozen (`<pane ySplit="1" topLeftCell="A2" state="frozen"/>`), sensible column widths
- [ ] Assumptions and their sources documented on the sheet or in a notes tab

> Distilled from: docx (NousResearch/hermes-agent, MIT), minimax-docx (MiniMax-AI/skills, MIT), officecli (iOfficeAI/OfficeCLI, Apache-2.0), markdown-exporter (bowenliang123/markdown-exporter, Apache-2.0)

# Word documents (.docx)

Pick the lightest tool that can do the job, then verify by reading the result back.

## Choose the path

| Situation | Path |
|---|---|
| New report, letter, memo, contract from structured content | `scripts/hermes-docx/docx_create.py` with a JSON spec |
| Fill `{{tokens}}` in a user's template | `docx_template.py --strict` |
| Change text, cells, styles in an existing file | `docx_edit.py` (run `normalize` first) |
| Review or resolve tracked changes / comments | `docx_revisions.py`, `docx_comments.py` |
| Markdown draft already exists, formatting is simple | `pandoc in.md -o out.docx --reference-doc=house.docx` or `markdown-exporter md_to_docx` |
| Heavy layout: multi-section headers, per-section page numbering, floating images, thesis templates | python-docx + raw OpenXML, or the OpenXML SDK (.NET); see "Raw OpenXML rules" |
| `officecli` binary already installed | `officecli add/set/view` (see bottom) |
| Legacy `.doc` | `soffice --headless --convert-to docx file.doc` first |

All `hermes-docx` scripts need `pip install python-docx`, print JSON, support `--help`, and take `-o out.docx` to keep the original (omit to edit in place).

## Script cheat sheet (scripts/hermes-docx/)

| Task | Command |
|---|---|
| Create from spec | `python docx_create.py spec.json out.docx` |
| All text (body, tables, headers, footers) | `python docx_read.py f.docx --text` |
| Heading outline + table shapes | `python docx_read.py f.docx --structure` |
| Styles in use | `python docx_read.py f.docx --styles` |
| Extract images | `python docx_read.py f.docx --images outdir/` |
| Detect revisions/comments | `python docx_read.py f.docx --revisions` |
| Find/replace keeping formatting | `python docx_edit.py replace f.docx --find A --replace B -o out.docx` |
| Merge fragmented runs | `python docx_edit.py normalize f.docx -o out.docx` |
| Set a table cell | `python docx_edit.py set-cell f.docx --table 0 --row 1 --col 2 --text X` |
| Insert / delete / restyle paragraph N | `docx_edit.py insert|delete|style f.docx --index N ...` |
| TOC field before paragraph N | `docx_edit.py toc f.docx --index N -o out.docx` |
| "Page X of Y" footer | `docx_edit.py page-numbers f.docx` |
| Fill tokens | `python docx_template.py tpl.docx values.json out.docx --strict` |
| List / accept / reject revisions | `docx_revisions.py list|accept-all|reject-all|accept --id 3 f.docx` |
| List / add / delete comments | `docx_comments.py list f.docx`; `add f.docx --target "phrase" --text "note" --author Name`; `delete f.docx --id 0` |
| Package health check | `python docx_validate.py f.docx` (exit 1 on errors) |

Spec format for `docx_create.py` is documented at the top of the script: `page` (mm sizes and margins), `header`, `footer`, `footer_page_numbers`, `styles` (name, base, font, size_pt, bold, color hex), and `blocks` of type `heading` (level 1-9), `paragraph` (`text` or `runs` with bold/italic/underline), `bullet_list`, `numbered_list`, `table` (`header`, `rows`, optional `style` like `Table Grid`), `image` (`path`, `width_mm`), `toc`, `page_break`.

## Workflow

1. **Intake**: document type, audience, page size (A4 international, Letter for US), house template if any, must-keep formatting.
2. **Read first** (edits): `--structure` and `--styles`. Never guess paragraph indices; take them from the read output.
3. **Normalize** documents that went through heavy Word editing, so search strings are not split across runs.
4. **Write** with styles, not direct formatting. Declare custom styles in the spec before using them.
5. **Verify**: re-read with `--text` (new strings present, old ones gone), `--structure` (heading outline as planned), run `docx_validate.py` after any revision, comment or field surgery. For layout, convert to PDF and look at the pages (`soffice --headless --convert-to pdf --outdir out/ f.docx`, then `pdftoppm -png -r 80 out/f.pdf page`).

## Formatting defaults that look professional

| Element | Business report | Academic (APA/MLA) | Contract/legal |
|---|---|---|---|
| Body | 11 pt, line 1.15 | 12 pt, double spaced | 12 pt, line 1.15-1.5 |
| H1 / H2 / H3 | 18-20 / 14-16 / 12-13 bold | 12 bold centred / 12 bold left / 12 bold italic | 14 bold caps / 12 bold / 12 bold |
| Margins | 1 in (2.54 cm) all round | 1 in | 1 in; 1.5 in left if bound |
| Page numbers | bottom right | per style guide | "Page X of Y" |

- Two font families at most (three with CJK). Pair a serif with a sans, or use weight contrast within one family.
- Paragraph spacing after body text 6-8 pt; space before a heading 2-3x the space after it, so the heading belongs to what follows.
- Body text near-black (#333333 or black), one accent colour for headings and table headers. Academic documents: all text black.
- Tables: repeat the header row on each page, right-align numbers, left-align text; three-line (booktabs) style for academic work, light grid or banded rows for business.
- Contrast at least 4.5:1; never encode meaning in colour alone.

## Raw OpenXML rules (when python-docx is not enough)

Word reports "unreadable content" mostly because of element order or broken references.

| Parent | Required child order |
|---|---|
| `w:p` | `w:pPr` then runs |
| `w:r` | `w:rPr` then `w:t` / `w:br` / `w:tab` |
| `w:tbl` | `w:tblPr` then `w:tblGrid` then `w:tr` |
| `w:tr` | `w:trPr` then `w:tc` |
| `w:tc` | `w:tcPr` then at least one `w:p` (an empty cell still needs `<w:p/>`) |
| `w:body` | block content, `w:sectPr` last |

Units:

| Unit | Used for | Conversions |
|---|---|---|
| DXA (twips) | margins, indents, spacing, page size | 1 in = 1440, 1 cm = 567, 1 pt = 20 |
| Half-points | `w:sz` font size | 12 pt = 24 |
| Eighths of a point | border width | 0.5 pt = 4 |
| EMU | images, drawings | 1 in = 914400, 1 cm = 360000 |
| 240ths of a line | `w:spacing w:line` with `lineRule="auto"` | single 240, 1.15 = 276, 1.5 = 360, double 480 |

With `lineRule="exact"` or `"atLeast"`, `w:line` is in twips (240 = exactly 12 pt).

Page sizes in DXA: A4 11906 x 16838, Letter 12240 x 15840, Legal 12240 x 20160.

Other rules:
- Heading styles need an outline level (H1 = 0, H2 = 1, ...) or the TOC and navigation pane ignore them.
- In tracked changes, deleted text sits in `w:delText` inside `w:del`; inserted text uses `w:t` inside `w:ins`. Mixing them corrupts the file.
- Copying content into a template: strip direct run/paragraph formatting (`rFonts`, colour, size, shading, borders) and keep only the style reference and text, otherwise the source formatting overrides the template. Keep `w:eastAsia` font hints for CJK text.
- Map style IDs by style **name**, not ID: templates (often Chinese theses) use IDs like `1`, `2` instead of `Heading1`, and IDs are case-sensitive.
- Multi-section templates (cover, abstract with Roman numbers, body with Arabic): copy the template as the base and replace body content; never rebuild headers and footers by hand.
- Never pad with empty paragraphs for spacing or section breaks; use `w:spacing` before/after and section-break properties.
- Don't unzip and `sed` the XML. Parse it (lxml or `defusedxml`) or use the scripts.

## Templates, mail merge and fields

- Put `{{snake_case}}` tokens in the template, fill from JSON, run with `--strict` so leftover tokens fail.
- If tokens refuse to match, the token is split across runs: run `normalize`, or retype the token in Word in one go.
- TOC, PAGE and NUMPAGES are fields. python-docx writes the field code; Word or LibreOffice computes the value when the file is opened (Word may ask to update fields). Say so to the user instead of faking numbers.

## Tracked changes and comments

- `docx_revisions.py` resolves run-level insertions and deletions. Paragraph-mark, table-row, formatting and move revisions are detected but not auto-resolved; hand those to Word and say so.
- After accept/reject, `docx_revisions.py list` must return `[]` or only the IDs you left on purpose.
- Comments added by the script are top-level; replies and "resolved" state live in `commentsExtended.xml`, which the script ignores.
- To propose edits as tracked changes for a reviewer, wrap new text in `w:ins` and old text in `w:del` with `w:author` and `w:date`; keep surrounding runs untouched.

## Pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| "We found a problem with some content" | element order, missing `w:p` in a cell, broken relationship | validate, fix order, check `_rels` targets |
| Headings look like body text after templating | style IDs don't match the template | map by style name |
| Whole document in the wrong font | direct `rFonts` from the source | strip direct formatting |
| Numbered lists continue instead of restarting | `List Number` shares one numbering instance | create a new `w:num` with a restart override, or warn the user |
| `KeyError` applying a style | style not defined in the file | declare it in the spec or use a built-in name |
| `set-cell` lost bold | it assigns `cell.text`, which resets runs | re-apply formatting or edit runs directly |
| TOC shows "Right-click to update" | field not computed yet | expected; update fields in Word or via LibreOffice conversion |

## officecli (optional binary)

`officecli` edits .docx/.xlsx/.pptx through a DOM-style CLI without Office installed. Install only with the user's agreement (it ships an install script from its vendor). Useful commands: `officecli view f.docx outline|issues|text`, `officecli add f.docx /body --type paragraph --prop text="..." --prop style=Heading1`, `officecli validate f.docx`, `officecli help docx paragraph` for property names. Run `officecli close f.docx` before another program reads the file.

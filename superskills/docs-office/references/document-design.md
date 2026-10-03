> Distilled from: kami (tw93/Kami, MIT), minimax-docx (MiniMax-AI/skills, MIT), minimax-pdf (MiniMax-AI/skills, MIT), pdf (openai/skills, Apache-2.0), lark-doc (larksuite/cli, MIT)

# Writing and typesetting professional documents

Applies to reports, proposals, one-pagers, letters, resumes, white papers and memos, whatever the output format (docx, PDF, HTML, Google Doc).

## Lock the contract first

Before writing, settle six things and state them to the user in one line: language, document type, output format(s), length or page target, visual standard (house template, brand, or your choice), and how you'll verify it. Ask at most one compact question, and only if purpose, audience or a hard constraint is genuinely unknown.

| User asks for | Document | Typical length |
|---|---|---|
| exec summary, one-pager, brief | one-pager: problem, proposal, evidence, ask above the fold | 1 page |
| letter, memo, resignation, recommendation | letter: purpose in sentence one, detail, clear close | 1 page |
| resume / CV | scope, outcomes, skills with evidence | 1-2 pages |
| proposal | recommendation, scope, approach, timeline, cost, risks, decision needed | 3-10 pages |
| report / white paper | executive summary, findings, analysis, recommendations, appendix | 6-15+ pages |
| portfolio / case studies | project, role, problem, approach, result, visuals | 3-6 pages |
| weekly / status report | progress vs plan, metrics, blockers, next week | 1-2 pages |
| PRD / technical doc | context, goals and non-goals, requirements, design, open questions | varies |

## Content rules

- **Lead with the conclusion.** The first paragraph (or the summary box) says what the reader must know or decide.
- **Numbers over adjectives.** "Revenue grew 34% YoY to $12M", not "significant growth". Pin vague time words to dates ("Q1 2026", not "recently").
- **Every factual claim has a source** you actually read; note source and date for facts that drive decisions (versions, prices, market figures). Match the source's precision.
- **No fabrication.** Missing facts become `[DATA NEEDED: what]` in the draft and one gap table for the user. No invented metrics, quotes, logos, or stock images described as real.
- **Body adds information.** A paragraph must not restate its heading; a caption must not restate the figure title.
- **Resume bullets** = action + honest scope + observable result ("Led 8-person team to ship v2.0, cutting churn 15%").
- **One-pagers and proposals** state the ask explicitly, not by implication.
- **Comparisons** name the alternative and the method, or drop the claim.
- **Cut AI tone**: openers like "In today's fast-paced world", connectors like "It's worth noting that", stacked em-dashes, "leverage/unlock/empower". Say what the thing does.
- Keep every atomic fact the user gave you (names, numbers, dates); distil prose, never drop facts silently.

## Typography

| Token | Typical value |
|---|---|
| Body | 10.5-12 pt; line height 1.4-1.6 (1.15 in Word terms for business docs) |
| H1 / H2 / H3 | about 1.8-2.2x / 1.3-1.5x / 1.1x body, or bold at body size for academic styles |
| Captions, footnotes | 8.5-9 pt |
| Line length | 60-75 characters (wider for tables, narrower for one-column reports with sidebars) |
| Margins | 2-2.8 cm (0.8-1.1 in); 1 in for academic/legal; larger inside margin if bound |
| Paragraph spacing | 6-8 pt after body paragraphs; space before headings 2-3x the space after |

- Two typeface families at most. Serif text for long reading and formal documents, sans for UI-like reports and slides; or one family in several weights.
- CJK: give a full fallback chain (e.g. `"Source Han Serif SC", "Noto Serif CJK SC", "Songti SC"`) so mixed text doesn't fall back to a mismatched system face; set lining, tabular numerals (`font-variant-numeric: lining-nums tabular-nums`) for figures.
- Numbers in tables right-aligned with consistent decimals; units in the column header.
- Headings never sit alone at a page bottom (`keep-with-next` in Word, `page-break-after: avoid` in CSS).

## Colour and layout

- One accent colour derived from the content (deep teal for research, forest green for sustainability, burgundy for culture, slate for neutral corporate). Avoid defaulting to blue and avoid navy-plus-gold cliché.
- The accent marks structure: rules, callout bars, table headers, the cover. Body text stays near-black.
- At most 3 colours in the system; meaning never carried by colour alone; contrast 4.5:1 for text.
- Whitespace separates sections better than boxes and lines. Group related items close together; align to one grid.
- Covers: title large and left-aligned or centred, author/date metadata small, one strong graphic device. Long documents: table of contents, running header or footer, page numbers.

## Figures and tables

- Every figure and table numbered, referenced in the text, captioned with what to notice.
- Chart titles state the insight; label axes with units; start bar axes at zero; highlight the key series.
- Tables: header row repeated across pages, three-line style for formal/academic documents, light banding for business data.
- Diagrams: simple shapes, labels inside or adjacent, arrows that show one direction of flow. Mermaid is fine for drafts; render to SVG/PNG for final documents.

## Delivery and verification

1. Render the final document and look at every page (PDF pages via `pdftoppm -png -r 80`).
2. Check: page count matches the target, no orphaned headings, no overflow, fonts embedded/available, images sharp, no placeholder or `[DATA NEEDED]` left unless the user accepted the gaps.
3. Report the gaps table and any assumptions in one short message.

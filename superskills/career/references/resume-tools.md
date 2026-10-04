# Resume and job-search tools: Reactive Resume, LaTeX CVs, career-ops, RenderCV

> Distilled from: resume-builder and its schema reference (reactive-resume/reactive-resume, MIT; schema copied to `templates/resume-builder/schema.md`), job-application-assistant CV and cover-letter LaTeX guides (MadsLorentzen/ai-job-search, MIT), career-ops router (career-ops-hq/career-ops, MIT). RenderCV facts come from the Skill Garden catalog entry only; the RenderCV skill itself has no licence and wasn't used.

Tool-specific detail lives here so the other guides stay tool-neutral. Tool versions and features change: check the current docs before relying on a field name or command. For a designed PDF or Word resume without these tools, use docs-office.

## 1. Reactive Resume (JSON import, free and open source)

Reactive Resume (rxresu.me, or a self-hosted instance) imports a resume as one JSON object. Data goes only to that host or the user's own instance.

**Workflow:**
1. Gather content per [resume-writing.md](resume-writing.md): never invent dates, employers or achievements; ask one question at a time.
2. Ask: template, page format (A4 or Letter), sections and their order.
3. Read `templates/resume-builder/schema.md` for exact field names before writing JSON.
4. Output one complete JSON object; the user imports it in the app.

**Rules from the schema (as of the copied version):**
- Required top level: `picture`, `basics`, `summary`, `sections`, `customSections`, `metadata`.
- Every item `id` is a UUID; generate real UUIDs (`python3 -c "import uuid;print(uuid.uuid4())"`), never `"1"`.
- `description` and `summary.content` are HTML strings (`<ul><li>...</li></ul>`).
- Website fields are objects `{url, label}` (plus `inlineLink` on items); URLs need `https://`.
- Colours are `rgba(r, g, b, a)`; fonts must exist on Google Fonts.
- `metadata.template` is one of: azurill, bronzor, chikorita, ditgar, ditto, gengar, glalie, kakuna, lapras, leafish, meowth, onyx (default), pikachu, rhyhorn, scizor.
- `metadata.page.format`: `a4`, `letter` or `free-form`.
- Experience items can hold several `roles` (each with its own `id`, `position`, `period`, `description`) to show progression at one employer; `period` on the item is total tenure.
- `metadata.layout.pages[]` has `main` and `sidebar` arrays of section ids. For ATS safety, put everything in `main` and set `fullWidth: true` (sidebars can scramble extraction; see [tailoring-and-ats.md](tailoring-and-ats.md)).
- Set `picture.hidden: true` unless the target market expects a photo.

**Validate before handing over:** parse the JSON (`python3 -m json.tool resume.json`), check every required key from the schema is present, and check UUIDs are unique.

**Application tracking through the Reactive Resume MCP** (only when the user has connected it with their own account key): `list_applications` before changing anything; `create_application` or `import_applications` (CSV rows); `update_application` for stage, contacts, follow-up dates, linked resume; `add_application_note`; `add_application_interview` / `update_application_interview`; `attach_application_document`. Its copilot tools (`score_application_match`, `tailor_resume_for_application`, `draft_application_message`) produce drafts: review every generated letter or message with the user before anything is sent.

## 2. LaTeX CVs and cover letters

Common setups: `moderncv` (e.g. banking style) for CVs, a custom class for letters. Compile and inspect every time.

**Engines:** prefer `lualatex` for moderncv (pdflatex can fail with fontawesome5 on some installs); letters using `fontspec` need `xelatex` or `lualatex`.

```bash
lualatex -interaction=nonstopmode cv_acme_analyst.tex
xelatex  -interaction=nonstopmode cover_acme_analyst.tex
```

**Compile-and-inspect loop:** check the page count (e.g. CV exactly 2, letter exactly 1), open the PDF and look: no entry title orphaned at a page bottom, no section alone on an extra page, signature fits. Fixes: `\needspace{5\baselineskip}` before the one orphaned entry (never before a section heading); `\enlargethispage{2\baselineskip}` for a near-miss overflow; real overflow = cut content by relevance, never shrink geometry.

**Escape special characters from plain text:**

| Char | Write | Trap |
|---|---|---|
| `%` | `\%` | Unescaped, it silently deletes the rest of the line: "cut latency by 40% and saved..." renders as "cut latency by 40" |
| `&` | `\&` | Company names (H\&M); fails loudly |
| `$ # _` | `\$ \# \_` | Money, rankings, identifiers |
| `~ ^` | `\textasciitilde{}` `\textasciicircum{}` | URLs, versions |
| Leading `[` in an `\item` | `\item {[text]}` | Otherwise parsed as the item label and clipped off the page |

**ATS details specific to LaTeX:**
- In date fields write `2016-2024` with a single hyphen: `--` becomes an en dash that some parsers don't read as a range. Keep `--` for prose ranges.
- Under pdflatex add `\usepackage[T1]{fontenc}` so accented letters extract as single characters; lualatex doesn't need it.
- Contact icons extract as glyph names; make sure the email is also printed as text.
- Translate the fixed section headings (Experience, Education...) when the CV isn't in English.
- In-progress degrees: say "In progress, expected <Month Year>" inside the entry.

Then run the text-layer check in [tailoring-and-ats.md](tailoring-and-ats.md) section 4.

## 3. career-ops (open-source job-search command centre)

A repo you clone (or `npx @santifer/career-ops init`) that adds `cv.md` and `config/profile.yml`, then runs modes such as: evaluate a pasted posting A-F with a report, tailored PDF or LaTeX CV, cover letter, outreach and application email drafts, tracker, follow-up cadence, interview prep and practice, offer read-through, rejection-pattern analysis. It needs Node and Playwright Chromium for PDFs.

What to know before recommending it:
- It is human-in-the-loop by design: it drafts and fills, but the user submits and sends.
- It includes portal scanning of company job boards. That exists; the user is responsible for each site's terms, and this craft's guidance doesn't rely on it.
- Optional community plugins can send data to third-party services; leave them off unless the user chooses them knowingly.
- Its install runs a Playwright browser download; read scripts before running, as with any repo.

Use it when the user wants a persistent local pipeline; otherwise the guides here cover the same steps by hand.

## 4. RenderCV

RenderCV turns a CV written as YAML into a typeset PDF (also PNG, HTML, Markdown) via Typst, with several themes and locales. Per its catalog entry: install with `uv tool install "rendercv[full]"`, write the YAML, run `rendercv render`. Its agent skill repo has no licence, so nothing from it is copied here; use the tool's own docs.

## 5. Checklist

- [ ] Content written and checked first; the tool only formats it
- [ ] Reactive Resume JSON parses, has all required keys and real unique UUIDs; single-column layout for ATS
- [ ] LaTeX compiled, page count checked, PDF visually inspected, special characters escaped, ASCII date ranges
- [ ] Text layer extracted after export
- [ ] Any tracker or copilot output reviewed with the user; nothing sent automatically

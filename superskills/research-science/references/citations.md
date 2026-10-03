> Distilled from: citation-management (K-Dense-AI/scientific-agent-skills, MIT), citation-verification (Galaxy-Dawn/claude-scholar, MIT), systematic-literature-review (bytedance/deer-flow, MIT)

# Citations: metadata, BibTeX, verification

Every reference in a deliverable must be real, correctly described, and actually support the sentence it is attached to. Generated or remembered citations are the most common serious failure in AI research writing; verify before you cite.

## Rules

- Never invent a reference, DOI, page range, volume or quote. Unknown fields stay empty or marked `[VERIFY]`.
- Cite from the source you read. If you only saw an abstract, say so or don't lean on details.
- Prefer the published version over the preprint; cite a preprint when that's all there is and label it.
- Metadata from any API is untrusted input: never pass it unquoted to a shell or eval it.

## Verification order

For each reference, resolve against the most authoritative source available:
1. DOI resolver / publisher page
2. arXiv (for preprints), PubMed (biomedical)
3. Crossref, then Semantic Scholar, then OpenAlex
4. The user's reference manager (Zotero etc.), Google Scholar by hand

A match needs: title (allowing punctuation and case differences), first author surname, year (±1 for online-first vs print), and venue. Then check the content: does the paper actually say what the sentence claims? Mark each reference **verified**, **corrected** (and what changed) or **not found** (remove or flag; never keep silently).

## Bundled scripts (`scripts/citation-management/`, need `requests`)

| Script | Use |
|---|---|
| `doi_to_bibtex.py 10.1038/xxx 10.1126/yyy [-i dois.txt] [-o refs.bib] [--format bibtex\|json]` | DOI to BibTeX via content negotiation |
| `extract_metadata.py --doi X --pmid Y --arxiv Z --url U [-o out.bib] [--email you@x]` | Metadata from DOI, PMID, PMCID, arXiv ID or URL (flags repeatable) |
| `format_bibtex.py refs.bib -o clean.bib --deduplicate --rekey --sort year` | Clean, deduplicate, rekey, sort; `--in-place` to overwrite |
| `validate_citations.py refs.bib --check-dois --report [--manuscript paper.tex] [--venue neurips]` | Missing fields, bad DOIs, duplicates, cited-but-missing keys; non-zero exit on serious errors |

Typical flow: collect identifiers → `extract_metadata.py`/`doi_to_bibtex.py` → `format_bibtex.py --deduplicate --rekey` → `validate_citations.py --check-dois --manuscript paper.tex` → fix → re-run until clean.

## BibTeX conventions

| Type | Use for | Required fields |
|---|---|---|
| `@article` | Journal papers | author, title, journal, year (+ volume, number, pages, doi) |
| `@inproceedings` | Conference papers | author, title, booktitle, year (+ pages, publisher, doi) |
| `@misc` | arXiv and other preprints, datasets, software | author, title, year, `eprint`, `archivePrefix = {arXiv}`, `primaryClass`, url/doi |
| `@book`, `@incollection` | Books, chapters | author/editor, title, publisher, year |
| `@phdthesis`, `@techreport` | Theses, reports | author, title, school/institution, year |

Keys like `smith2024transformer` (first author, year, first content word). Protect capitals in titles with braces (`{BERT}`, `{DNA}`). Use `--` for page ranges. One entry per work; merge duplicates from different databases.

## Styles

- APA 7: (Author, Year) in text; reference list alphabetical; DOI as `https://doi.org/...`.
- IEEE: numbered [1] in order of first citation.
- Vancouver: numbered, biomedical journals.
- Nature: superscript numbers, up to five authors then et al.
For LaTeX, choose with `\bibliographystyle{}` or biblatex `style=`; for Word/Markdown, pandoc `--citeproc --csl style.csl` with a CSL file from the Zotero style repository.

## Citing claims

- Attach the citation to the specific claim, not the end of a paragraph of mixed claims.
- Cite primary sources for findings and reviews for overviews.
- Count matters less than fit: 1-3 strong citations per claim beats a cluster of tangential ones.
- For quotes, include page or section numbers.

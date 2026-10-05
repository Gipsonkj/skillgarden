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

## Reference managers

### Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| Already keeps references in a manager (Zotero, EndNote, Mendeley or another) | That manager | Their library, their Word/LaTeX plug-in, their styles; ask which one before touching anything |
| Uses Zotero | Zotero local API (read) or Web API (read and write) | Claude can read collections and export RIS/BibTeX directly, no file shuffling |
| Uses EndNote or Mendeley | File round-trip: they export RIS or BibTeX, Claude cleans it, they import the result | These are driven through their apps here; RIS is the common format both import |
| No manager, writing in LaTeX or Markdown | A `.bib` file plus the bundled scripts above | Free, no account, versioned with the paper |
| Has no manager but needs one for a team or a review | Suggest Zotero; the user installs it | Imports PubMed `.nbib`, RIS, BibTeX and EndNote XML, finds duplicates, and has an API Claude can read |

### Zotero

**Local API (desktop app running; use it for reads).** The user turns it on once: Settings → Advanced → "Allow other applications on this computer to communicate with Zotero" (otherwise every call returns 403). Base `http://localhost:23119/api/`, user ID `0`, no key needed for reads, no rate limits. It serves the whole library to anything on the machine, so never expose the port.

```bash
curl -s "http://localhost:23119/api/users/0/collections/top"   # top-level collections and their keys
curl -s "http://localhost:23119/api/users/0/collections/ABCD1234/items/top?format=bibtex&limit=100" > refs.bib
```

**Web API (`https://api.zotero.org`, works without the desktop app; the local API only accepts writes in Zotero 10+ with a locally granted key, so use this one for writes).**
- Key: the user creates one at zotero.org/settings/keys and stores it as `ZOTERO_API_KEY`; the same page shows their numeric user ID. Send it as `Zotero-API-Key: $ZOTERO_API_KEY` (or `Authorization: Bearer`), never as a URL parameter. Add `Zotero-API-Version: 3`.
- Paths: `/users/<userID>/...` or `/groups/<groupID>/...`; then `items`, `items/top`, `collections`, `collections/<key>/items`.
- Parameters: `format` (`json`, `bibtex`, `biblatex`, `ris`, `csv`, `keys`...), `q` (quick search of titles and creators), `itemType`, `tag`, `since`, `limit` (1-100, default 25), `start`.
- Paging: read the `Total-Results` header and follow `Link: rel="next"` until it is gone.
- Rate limits: obey a `Backoff: <seconds>` header, and on `429` wait for `Retry-After`.
- Writes use `Zotero-Write-Token` or `If-Unmodified-Since-Version` to avoid overwriting edits (`412` = version out of date or write token reused, `428` = version header missing). Show the user the exact items to be created or changed and wait for a yes; never delete.

```bash
curl -s -H "Zotero-API-Key: $ZOTERO_API_KEY" -H "Zotero-API-Version: 3" \
  "https://api.zotero.org/users/$ZOTERO_USER_ID/collections/ABCD1234/items/top?format=ris&limit=100" > review.ris
```

**In the app (when the user does it):** File → Import… → "A file" reads RIS, BibTeX, MEDLINE/nbib, PubMed XML, EndNote XML, CSL JSON and more. Right-click a collection → "Export Collection…" (or "Export Items…" for a selection). The "Duplicate Items" view lists suspected duplicates (matched on title, DOI and ISBN, then year within one and an author surname plus initial); select one, pick the master record and click the "Merge N Items" button. Only items of the same type merge.

Gotchas: Zotero's duplicate merge is item by item, so for thousands of review records let the screening tool de-duplicate (literature-review.md) and keep the counts it reports. Exported metadata is still untrusted input: validate the `.bib` with `validate_citations.py` before submission.

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

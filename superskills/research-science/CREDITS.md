# Credits

This super skill is distilled from the open-licensed skills below. Text was rewritten and merged in our own words; only the scripts and templates listed were copied as-is, each with its source license beside it (`LICENSE.source-repo`).

| Skill | Repo | License | What was used |
|---|---|---|---|
| literature-review | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/literature-review | MIT | Seven-phase review workflow, records/reports/studies distinction, database paging limits, pitfalls |
| citation-management | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/citation-management | MIT | Metadata/BibTeX workflow, untrusted-metadata rule; `scripts/citation-management/` copied as-is |
| scientific-writing | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/scientific-writing | MIT | No-fabrication rules, evidence binding with claim IDs, reporting guideline list, statistics reporting, authorship and AI disclosure |
| peer-review | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/peer-review | MIT | Authorisation/confidentiality gate, orientation map, claim–evidence matrix, methods review order; `templates/peer-review/` copied as-is |
| hypothesis-generation | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/hypothesis-generation | MIT | Distinct research objects, rival classes, discriminating predictions, bounded search wording; `templates/hypothesis-generation/` copied as-is |
| biopython | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/biopython | MIT | Module overview and Entrez etiquette |
| rdkit | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/rdkit | MIT | Parsing, embedding, fingerprint and standardisation rules; `scripts/rdkit/` copied as-is |
| systematic-literature-review | https://github.com/bytedance/deer-flow/tree/main/skills/public/systematic-literature-review | MIT | Default paper counts, extraction fields, thematic synthesis, citation formats; `scripts/arxiv-search/arxiv_search.py` copied as-is |
| deep-research | https://github.com/bytedance/deer-flow/tree/main/skills/public/deep-research | MIT | Broad-then-deep search, source diversity dimensions, current-year rule |
| research | https://github.com/mattpocock/skills/tree/main/skills/engineering/research | MIT | Primary sources, findings written to a file with a citation per claim |
| nature-academic-search | https://github.com/Yuan1z0825/nature-skills/tree/main/skills/nature-academic-search | Apache-2.0 | Source tiers, query construction (OR within concepts, AND across), result-count tuning, domain routing |
| nature-writing | https://github.com/Yuan1z0825/nature-skills/tree/main/skills/nature-writing | Apache-2.0 | Summary-paragraph structure |
| literature-search-openalex | https://github.com/google-deepmind/science-skills/tree/main/skills/literature_search_openalex | Apache-2.0 | OpenAlex usage notes; `scripts/openalex/openalex_cli.py` copied as-is |
| pubmed-database | https://github.com/google-deepmind/science-skills/tree/main/skills/pubmed_database | Apache-2.0 | PubMed function overview; `scripts/pubmed/pubmed_api.py` copied as-is |
| arxiv | https://github.com/NousResearch/hermes-agent/tree/main/skills/research/arxiv | MIT | arXiv API query syntax and rate etiquette |
| research-paper-writing | https://github.com/Master-cai/Research-Paper-Writing-Skills/tree/main/research-paper-writing | MIT | Paragraph discipline, abstract shapes, introduction logic chain, experiments checklist, five-dimension self-review |
| orx-lit-review | https://github.com/alphaXiv/OpenResearch/tree/main/agent-skills/orx-lit-review | MIT | Keyword vs embedding search, date bounds, original figures, no invented acronym expansions |
| citation-verification | https://github.com/Galaxy-Dawn/claude-scholar/tree/main/skills/citation-verification | MIT | Verification authority order and match criteria |
| deep-research | https://github.com/199-biotechnologies/claude-deep-research-skill | MIT (stated in README) | Depth modes, phase list, report shape, sources/evidence/claims ledgers, placeholder check (ideas only; no files copied) |

## Official documentation (tool guides added October 2026)

Docs, link-only reference, written in our own words:

| Tool | Docs used | Used in |
|---|---|---|
| Covidence | https://support.covidence.org/help/study-imports, https://support.covidence.org/help/troubleshooting-reference-imports, https://support.covidence.org/help/tracking-and-reporting-snowballed-references, https://support.covidence.org/help/switching-from-dual-to-single-reviewer-mode, https://support.covidence.org/help/how-to-create-and-manage-eligibility-criteria, https://support.covidence.org/help/customising-reasons-for-exclusion, https://support.covidence.org/help/does-covidence-record-exclusion-reasons-at-the-title-and-abstract-screening-stage, https://support.covidence.org/knowledge_base/topics/viewing-duplicates, https://support.covidence.org/help/export-prisma | literature-review.md |
| PubMed export | https://pubmed.ncbi.nlm.nih.gov/help/, https://www.nlm.nih.gov/pubs/techbull/ma20/ma20_pubmed_updated.html | literature-review.md |
| Zotero | https://www.zotero.org/support/dev/web_api/v3/basics, https://www.zotero.org/support/dev/web_api/v3/local_api, https://www.zotero.org/support/kb/importing_standardized_formats, https://www.zotero.org/support/kb/exporting, https://www.zotero.org/support/duplicate_detection | citations.md |
| Scopus | https://dev.elsevier.com/sc_search_tips.html, https://dev.elsevier.com/documentation/ScopusSearchAPI.wadl, https://dev.elsevier.com/api_key_settings.html, https://dev.elsevier.com/, https://www.elsevier.support/scopus/answer/how-do-i-export-documents-from-scopus | literature-search.md, database-apis.md |
| Web of Science | https://webofscience.zendesk.com/hc/en-us/articles/20016122409105-Search-Operators, https://webofscience.zendesk.com/hc/en-us/articles/25350084904721-Search-Rules, https://webofscience.zendesk.com/hc/en-us/articles/26916258216209-Web-of-Science-Core-Collection-Search-Fields, https://webofscience.zendesk.com/hc/en-us/articles/20135824927505-Saving-and-Exporting-Marked-Lists, https://webofscience.zendesk.com/hc/en-us/articles/47843018003601-APIs, https://developer.clarivate.com/apis/wos-starter | literature-search.md, database-apis.md |
| Embase | https://www.elsevier.support/embase/answer/how-do-i-search-in-embase, https://www.elsevier.support/embase/answer/what-field-codes-can-i-use-in-embase, https://www.elsevier.support/embase/answer/can-i-use-boolean-operators-wildcards-and-proximity-operators-in-embase, https://www.elsevier.support/embase/answer/how-do-i-export-my-search-results, https://dev.elsevier.com/embase_apis.html | literature-search.md, database-apis.md |
| Google Scholar | https://scholar.google.com/intl/en/scholar/help.html | literature-search.md |

Reviewed but not used for content: research-lookup (K-Dense, MIT; overlaps the database guidance), tavily-research (tavily-ai/skills, MIT; depends on a paid search API), notebooklm (PleasePrompto/notebooklm-skill, MIT; automates a Google account through a browser), paperjury (Spark-To-Paper-Skills/paperjury, MIT; includes a GitHub update check). Several K-Dense skills ask the agent to add a citation to the K-Dense paper in the user's work; that directive was not carried over.

## Also see (not included)

| Skill | URL | Why not included |
|---|---|---|
| deep-research (academic-research-skills) | https://github.com/Imbad0202/academic-research-skills/tree/main/deep-research | CC-BY-NC-4.0 (non-commercial) |
| academic-paper (academic-research-skills) | https://github.com/Imbad0202/academic-research-skills/tree/main/academic-paper | CC-BY-NC-4.0 (non-commercial) |
| research-lookup | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/research-lookup | Overlaps database-apis.md |
| tavily-research | https://github.com/tavily-ai/skills/tree/main/skills/tavily-research | Paid API |
| notebooklm | https://github.com/PleasePrompto/notebooklm-skill | Browser automation of a Google account |
| paperjury | https://github.com/Spark-To-Paper-Skills/paperjury | Phones home for updates |

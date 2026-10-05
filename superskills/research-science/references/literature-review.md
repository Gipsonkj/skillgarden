> Distilled from: literature-review (K-Dense-AI/scientific-agent-skills, MIT), systematic-literature-review (bytedance/deer-flow, MIT), orx-lit-review (alphaXiv/OpenResearch, MIT), deep-research (199-biotechnologies/claude-deep-research-skill, MIT)

# Literature reviews: screening, extraction, synthesis

Use for narrative, scoping and systematic reviews, and for "survey the field on X" requests. Search itself is in literature-search.md; citation handling in citations.md.

## Pick the review type

| Type | When | Must have |
|---|---|---|
| Quick summary | "What's known about X?" in an afternoon | 5-10 key papers, stated search scope, citations per claim |
| Narrative / survey | Field overview, thesis chapter, related-work section | Thematic structure, transparent search, balanced coverage |
| Scoping review | Map what exists, find gaps; no quality grading needed | Protocol, PRISMA-ScR flow, charting table |
| Systematic review | Answer a focused question with all eligible evidence | Registered protocol (e.g. PROSPERO), ≥2 databases, dual screening, risk-of-bias, PRISMA 2020 |
| Meta-analysis | Pool comparable quantitative effects | All of the above plus effect-size extraction and heterogeneity analysis (only with a statistician-level plan) |

Default for agent work: a transparent narrative review of about 20 papers (cap 50), APA or the user's style. Don't call it "systematic" unless it meets that bar.

## Seven phases

1. **Plan:** question, inclusion/exclusion criteria (population, design, outcomes, years, language), databases, protocol written down before screening.
2. **Search:** per literature-search.md; log every query.
3. **Screen:**
   - Deduplicate first.
   - Title/abstract screening against the criteria; when in doubt, include for full text.
   - Full-text screening with a reason for each exclusion.
   - Keep counts of records (search hits), reports (documents) and studies (a study can have several reports) separate; PRISMA needs all three.
   - Systematic reviews: two independent screeners at least at full text, with disagreements resolved and agreement reported. An agent can be one screener, not both.
4. **Extract:** one row per study in a table (CSV) with fixed columns: citation, design, sample/setting, intervention/exposure, comparator, outcomes, key results with effect sizes and uncertainty, limitations, funding/conflicts. For non-empirical papers: research question, method, 3-5 key findings, limitations.
5. **Appraise quality:** a named tool fitted to the design (RoB 2 for RCTs, ROBINS-I for non-randomised interventions, Newcastle-Ottawa for observational, QUADAS-2 for diagnostic accuracy, AMSTAR 2 for reviews, CASP checklists generally). Grade certainty of a body of evidence with GRADE when making recommendations.
6. **Synthesise:** by theme, not paper by paper (see below).
7. **Verify and write:** check every citation (citations.md), then write and produce the PRISMA flow diagram if relevant.

## Screening tools

### Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| The team already screens in a platform (Covidence, Rayyan, EPPI-Reviewer, DistillerSR...) or the supervisor names one | That platform | Votes, conflicts and the PRISMA counts must live in one place; ask which before preparing files |
| Systematic or scoping review, institution has Covidence (or the team will pay for it) | Covidence | Dual screening by default, de-duplicates on import, drafts the PRISMA 2020 flow diagram |
| Small review, no platform and no budget | A shared spreadsheet (one row per record, one decision column per reviewer, a reason column) | Free and transparent; Claude can de-duplicate and count, two humans still decide |
| Quick or narrative review | A CSV in the working folder | No dual screening needed; keep the decisions and reasons anyway |

Paid seats or a new subscription spend money: name the option and wait for a yes.

### Covidence (web app, driven by files)

Claude prepares the import files, the eligibility text and the PRISMA numbers; the user does the clicks in their own account. Don't log in for them or automate the site.

**Files it imports:** RIS, PubMed text format and EndNote XML; up to 50 MB and 15,000 references per file (split bigger sets), one file per import, as many imports as needed.
- PubMed: Send to → Citation manager saves an `.nbib` file in PubMed format (up to 10,000 records); Save → Format: PubMed gives the same format as text.
- Scopus, Web of Science, Embase: export RIS with abstracts (literature-search.md §3a).
- Anything else (CSV, BibTeX, a Google Scholar list): import into a reference manager such as Zotero and export RIS. Google Scholar exports have no abstracts.
- If a RIS import comes out garbled, look for quotation marks around tags (`"A1` instead of `A1`) and strip them in a text editor.

**Set up the review (user, in this order):**
1. Create the review and add the second reviewer to it.
2. Review Setup → Eligibility criteria: pick the framework (PICOS, PECOS, PCC, SPIDER...) and paste the inclusion and exclusion criteria Claude drafted. Reviewers see them in a sidebar while screening.
3. Review Setup → Full-text exclusion reasons: enter the agreed list in the order of the criteria (wrong population, wrong intervention, wrong comparator, wrong outcome, wrong design...).
4. Review Settings: reviewers required for screening and for full text are separate settings; both default to 2. Leave them at 2. Switching to 1 mid-review moves every record with one vote forward, and that can't be undone in bulk.
5. Import: Review Summary → Import → choose the stage (title and abstract screening) → pick the source (add "PubMed", "Scopus", "Web of Science" under Manage sources) → Choose file → Import. One file per database, so the PRISMA diagram shows records per source.

**Screening rules to agree before the first vote:** each reviewer votes alone; a conflict needs a third, final vote (discussion or a third person, decided in the protocol); title-and-abstract stage takes no exclusion reasons (use tags if the team wants counts, knowing tags are visible to all); full-text exclusions always get a reason. If AI help is used for screening, it supports one reviewer at most, and the methods must say so.

**Duplicates:** Covidence matches on title, year, volume and authors at import and holds duplicates aside; reviewers can also mark duplicates while screening, and "Not a duplicate" returns a record. The PRISMA "duplicates removed" box is the sum of both. If you de-duplicate before upload instead, report your own count and don't let the two methods double-count.

**PRISMA you can report before screening:**

| Box | Where the number comes from |
|---|---|
| Records identified, per database | The search log (hits at export) and Covidence's Import history (records per file); they should match, explain any gap |
| Duplicates removed | Covidence Review Summary / Import history after all imports |
| Records screened | Identified minus duplicates removed (check it against the title-and-abstract count in Covidence) |
| Excluded, sought for retrieval, assessed, included | Pending: mark `[PENDING: screening]` |

Covidence updates the flow diagram on the Review Summary page as screening proceeds; Download DOCX gives a PRISMA 2020 version. In the DOCX, "Studies not retrieved" is always 0: correct it by hand.

## Synthesis

- Group into 3-6 themes or research questions. For each: what the evidence shows, how strong and consistent it is, and where studies disagree and why (populations, methods, measures).
- Compare, don't list: "Three RCTs (n=1,240) found..., while two cohort studies reported..., likely because...".
- Separate findings from interpretations; quantify where possible (effect sizes, ranges, counts of studies).
- Name the gaps: populations, methods, outcomes or settings that are missing, and contradictions that need a decisive study.
- Weight by quality and size, not by how often a claim is repeated.
- Where a figure carries the argument, describe or reproduce the original figure (with credit) rather than inventing a summary graphic.

## Output structure

```
Title
Abstract / executive summary (200-400 words)
1. Introduction: question, why it matters, scope
2. Methods: databases, queries, dates, criteria, screening, appraisal tool
3. Results: study flow (PRISMA counts), study characteristics table
4. Thematic synthesis (one section per theme)
5. Discussion: overall strength of evidence, gaps, limitations of this review
6. Conclusions and future directions
References (verified)
Appendix: search strings, extraction table
```

## Pitfalls

- One database; no record of queries; undisclosed date of search.
- Treating "DOI exists" as "paper supports the claim": open the paper.
- Study-by-study summaries with no synthesis.
- Mixing preprints with peer-reviewed results without flagging.
- Over-claiming from a scoping or quick review ("the literature proves...").
- Fabricated or padded references to reach a target count.

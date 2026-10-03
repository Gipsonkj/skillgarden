---
name: seo
description: Audit, fix and grow a site's organic search and AI search visibility. Use for SEO audits, traffic or ranking drops, pages not indexed, crawling, robots.txt, sitemaps, canonicals, redirects, site migrations, JavaScript rendering, Core Web Vitals (LCP, INP, CLS), hreflang and international SEO, keyword research, search intent, topic clusters, title tags and meta descriptions, writing or refreshing content to rank, E-E-A-T, schema markup and JSON-LD, rich results, site architecture, URL structure, internal linking, programmatic SEO and template pages at scale, AI search / GEO / AEO (AI Overviews, ChatGPT, Perplexity, Copilot citations, llms.txt, AI crawlers), local SEO and Google Business Profile, reviews, NAP citations, backlinks and link building, directory submissions and Product Hunt launches, competitor "alternative" and "vs" pages, and SEO tools such as Search Console, PageSpeed, CrUX, Screaming Frog, Ahrefs, Semrush and DataForSEO.
---

# SEO

SEO is getting the right pages crawled, indexed and chosen: by Google and Bing results, and by AI answer engines that retrieve from the same indexes. Most wins come from fixing what blocks indexing, matching search intent better than the pages that already rank, and linking to your own money pages. This skill covers audits and drop triage, technical SEO, keywords and content, schema, architecture, programmatic pages, AI search, local, and off-page work.

## Core principles

1. **Indexing before everything.** Check in this order: crawlable, indexable, rendered, then fast, then relevant, then authoritative. A `noindex` or a blocked render makes content work worthless. Fix the top of that list first.
2. **The SERP is the spec.** Classify intent from the live top 10, and match its format (guide, list, tool, comparison) before you worry about word count. A page that misses intent doesn't rank at any length.
3. **One query cluster, one URL.** Keep a keyword-to-URL map. Two pages chasing the same cluster cannibalise each other: merge them or split them by intent.
4. **Evidence, not vibes.**
   - Label every metric as Measured, Estimated, Proxy or Unknown, with its source and date.
   - Search volume is not visits.
   - Check rankings live and date the check: "#10 (page 1)".
   - Missing data never supports a zero or an all-clear.
5. **Observations aren't causes.** "Clicks fell 38% on 12 Aug" is a fact. "Because of the canonical change" is a hypothesis until it is verified. Give every recommendation a check that would show it failed.
6. **Field data ranks, lab data debugs.** Core Web Vitals are judged at the 75th percentile of real users: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1. INP replaced FID in March 2024, so never cite FID. CWV is a tiebreaker, not a substitute for relevance.
7. **Put the important HTML in the server response.** The title, canonical, robots meta, main content, `<a href>` links and JSON-LD all belong in the server HTML. Google renders JavaScript late, and most AI crawlers don't render it at all.
8. **Thresholds are lint, not law.** Titles of 50–60 characters, descriptions of 120–160, one clear H1: flag anything outside these for review, never as a hard fail. Google truncates by pixel width and rewrites titles. Several valid H1s are not an error, but one clear H1 is the house style.
9. **Schema describes, it doesn't rank.** Mark up only what is visible on the page, as JSON-LD in an `@graph`.
   - FAQ rich results are fully retired as of May 2026, and HowTo since 2023. Leave existing FAQPage markup alone, and never add it expecting stars or "AI visibility". The newer Google rule overrides older sources that still recommend it.
10. **AI search is still SEO, plus extractable answers.** Google says AI Overviews use the normal index, and `llms.txt` is ignored by Google Search.
    - Lead each question-style section with a direct 40–60 word answer, and keep the section self-contained (under about 150 words).
    - Cite sources and dated statistics.
    - Allow AI *search* crawlers.
    - Treat blocking *training* crawlers as a separate business decision.
    - `llms.txt` stays optional: worth it for developer docs, not as a ranking lever.
11. **Scale needs unique data.** Programmatic and location pages need 40–60% or more content that is unique per page, and must pass the swap test. Warn at 30 location pages and stop at 50 without real local data. Scaled thin pages are spam under Google's policy.
12. **Links follow assets; honesty survives scrutiny.** Earn links with data, tools and PR. Never buy them. Disavow only after a manual action or an attack. On competitor pages, write "not listed (as of date)", never an unverified "doesn't have".
13. **Never promise rankings, traffic, indexing or AI citations.** Report dated rates and ranges instead.
14. **Ask before side effects.** Installing CLIs, scheduling cron jobs, IndexNow pings, directory and review submissions, and GBP edits all need the owner's approval.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Traffic drop after a migration: `references/audit.md` → `references/technical.md` → `references/keywords-content.md`; code fixes from `website-building` → `references/nextjs-react.md`; rewrites from `content-creation` → `references/long-form-articles.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:garden`, or `get_super_skill` with craft `garden` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Full or single-page audit, traffic or ranking drop, prioritising fixes, report layout | [references/audit.md](references/audit.md) |
| Crawling, indexing, canonicals, redirects, sitemaps, JS rendering, Core Web Vitals, mobile, hreflang, migrations | [references/technical.md](references/technical.md) |
| Keyword research, intent, scoring, topic clusters, writing pages that rank, titles and meta, E-E-A-T, content decay and refresh | [references/keywords-content.md](references/keywords-content.md) |
| JSON-LD, rich results, which type per page, retired features, validation | [references/schema.md](references/schema.md) |
| Site structure, URL rules, navigation, internal linking, faceted navigation, architecture deliverables | [references/architecture-linking.md](references/architecture-linking.md) |
| Template pages at scale: playbooks, data, quality gates, rollout | [references/programmatic.md](references/programmatic.md) |
| AI Overviews, ChatGPT, Perplexity, Copilot, AI crawlers, llms.txt, agent readiness, measuring AI citations | [references/ai-search.md](references/ai-search.md) |
| Google Business Profile, reviews, NAP, citations, location pages, geo-grid tracking | [references/local.md](references/local.md) |
| Backlink review, link earning, disavow, directory submissions, Product Hunt, competitor and alternative pages | [references/offpage-competitors.md](references/offpage-competitors.md) |
| Specific tools: Search Console, PSI and CrUX APIs, Screaming Frog, squirrelscan, Firecrawl, DataForSEO, OpenSEO, claude-seo, the `seo` CLI, Apify | [references/tools-vendors.md](references/tools-vendors.md) |
| Tracking a directory submission campaign | [templates/directory-submissions/submission-tracker-template.csv](templates/directory-submissions/submission-tracker-template.csv) |

## Other crafts

| When the request also needs | Use |
|---|---|
| Writing the articles or page copy, or a full content calendar (beyond the briefs in `references/keywords-content.md`) | `content-creation` → `references/long-form-articles.md`, `references/content-strategy.md`, `references/conversion-copy.md` |
| Code fixes for rendering, metadata or Core Web Vitals (beyond the checks in `references/technical.md`) | `website-building` → `references/nextjs-react.md`, `references/performance-cwv.md` |
| Large Search Console exports in SQL or BigQuery, or measuring a change's real effect | `data-analysis` → `references/sql.md`, `references/warehouses.md`, `references/experiments-causal.md` |
| Paid search on the same queries, or testing titles and offers with ads first | `google-ads` → `references/campaign-build.md`, `references/keywords-negatives.md` |
| Open Graph images, favicons and share previews | `poster-design` → `references/web-assets.md` |
| YouTube titles, descriptions and chapters for video search | `social-media` → `references/youtube-seo-thumbnails.md` |
| The audit delivered as a client-ready PDF or slide deck | `docs-office` → `references/pdf.md`, `references/deck-writing.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Industry-aware audits from a 30+ skill suite, including the backlinks, maps, images and hreflang skills not copied here | [claude-seo](https://github.com/AgriciDaniel/claude-seo/tree/main/skills/seo) (MIT; optional DataForSEO, Ahrefs or Firecrawl keys) |
| GEO audits with citability scoring, brand-mention scans, llms.txt generation and client-ready reports | [geo](https://github.com/zubair-trabzada/geo-seo-claude/tree/main/geo) (MIT) |
| A 260+ rule site audit (SEO, performance, security, accessibility) fixed in source and re-run | [audit-website](https://github.com/squirrelscan/skills/tree/main/skills/audit-website) (MIT; needs the squirrelscan CLI) |
| Recurring checks of whether you and competitors are cited in AI Overviews, ChatGPT, Perplexity, Copilot and Gemini | [apify-ai-search-visibility-tracker](https://github.com/apify/awesome-skills/tree/main/skills/apify-ai-search-visibility-tracker) (Apache-2.0; needs APIFY_TOKEN, paid runs) |
| 70+ audit tools in a local CLI: rankings, keywords, backlinks, indexing, redirects, Core Web Vitals | [seo (iannuttall)](https://github.com/iannuttall/seo/tree/main/skills/seo) (Apache-2.0; needs the bundled CLI and some data-provider keys) |
| An audit against live search data that returns only the few changes most likely to grow converting traffic | [seo-audit](https://github.com/every-app/open-seo/tree/main/plugins/openseo/skills/seo-audit) (MIT; needs the OpenSEO app and DataForSEO credentials) |
| Keyword research in English and Chinese, from a 16-skill SEO and GEO set | [keyword-research](https://github.com/aaron-he-zhu/aaron-marketing-skills/tree/main/seo-geo/survey/keyword-research) (Apache-2.0) |

## Default workflow

1. **Scope**: the site, its goal and money pages, the market and language, the access you have (Search Console, analytics, code, tools), and any recent changes (deploys, migrations, Google updates). Say which data is missing.
2. **Baseline**: 28-day and year-on-year clicks, impressions and positions per page type, indexed page count, and CWV field data. Date everything.
3. **Technical gate**: robots, status codes, canonicals, noindex, rendering, sitemaps, redirects. Anything here that blocks indexing is Critical.
4. **Intent and content**: check each money page against its live SERP, find striking-distance queries (position 5–20, 50 or more impressions), cannibalisation and decay.
5. **Structure**: click depth (3 or fewer), orphan pages, internal links to money pages, schema per template.
6. **Authority and visibility**: referring-domain gap against the top 3 competitors, local signals if relevant, and an AI citation check (each prompt run 3–5 times).
7. **Prioritise**: lead with 1–3 recommendations, then Critical, High (within 1 week), Medium (within 1 month) and Low items. Each gets its evidence, the fix, the effort, the owner and a failure check.
8. **Fix and verify**: fix templates rather than single pages, re-crawl, request indexing, then read the results at 7, 14, 28 and 56 days against the baseline.

## Done means

- [ ] Every finding has an evidence URL or data source with a date, and observations are kept separate from causes
- [ ] Nothing that blocks indexing (robots, noindex, canonical, render, 4xx/5xx) is left unaddressed
- [ ] Each money page has one target query cluster, matches the SERP intent, and is 3 clicks or fewer from the homepage
- [ ] Schema validates in the Rich Results Test and matches what is visible on the page
- [ ] CWV is judged on field data (LCP, INP, CLS), and FID is not mentioned
- [ ] Recommendations are ranked, start with the top 1–3, and each has a verification check and a re-measure date
- [ ] No promised rankings or traffic, and no unapproved installs, submissions or external pings

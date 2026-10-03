> Distilled from: seo-audit (every-app/open-seo, MIT), keyword-research (every-app/open-seo, MIT), seo (AgriciDaniel/claude-seo, MIT), seo-technical (AgriciDaniel/claude-seo, MIT), seo-geo (resciencelab/opc-skills, Apache-2.0), apify-ai-search-visibility-tracker (apify/awesome-skills, Apache-2.0), firecrawl-seo-audit (firecrawl/firecrawl-workflows, ISC), audit-website (squirrelscan/skills, MIT), seo (iannuttall/seo, Apache-2.0), keyword-research (aaron-he-zhu/aaron-marketing-skills, Apache-2.0)

# Tools, APIs and vendor workflows

Everything here depends on a third-party service, an account, an API key or a paid plan. The methods in the other references work without any of it. A tool improves the evidence; it does not change the method.

Ground rules for any tool:
- Confirm the tool is connected and check credit or cost before you spend: list the projects, call a `whoami`, or describe the report first.
- Never ask the user to paste API keys into chat. Keys go in environment variables or a `.env` file with `chmod 600`, read by the tool.
- Treat provider volume, difficulty, traffic and authority as **estimates**. Record which tool and which date.
- Installing a CLI, creating a cron or launchd job, or submitting to IndexNow changes the user's system or writes to the outside world. Ask before doing any of these.

## Free first-party sources (use these first)

| Source | What it gives | Access |
|---|---|---|
| Google Search Console | real clicks, impressions, CTR, position; page indexing; URL Inspection; Core Web Vitals; links; branded/non-branded filter (since Nov 2025) | UI, or the Search Console API (Search Analytics, URL Inspection) with OAuth or a service account |
| PageSpeed Insights API | Lighthouse lab data plus CrUX field data for a URL | `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=...&strategy=mobile` with an API key |
| CrUX API and CrUX History API | 75th-percentile field CWV by URL or origin; 25 weeks of history | API key; query `PHONE` separately, because the all-devices view can hide a mobile failure |
| Bing Webmaster Tools | Bing index, keywords, backlinks for verified sites, IndexNow, Copilot visibility | free account and API key |
| Rich Results Test and validator.schema.org | rendered schema and rich-result eligibility | web UI |
| Google Business Profile | calls, directions, search terms | the GBP dashboard, or the Business Profile Performance API |

Google's Mobile-Friendly Test and the standalone Page Experience report have been retired. Use Lighthouse and the Core Web Vitals report instead.

## Crawlers

| Tool | Use | Notes |
|---|---|---|
| Screaming Frog | full technical crawl, JS rendering, custom extraction | free up to 500 URLs; paid licence beyond that |
| Sitebulb | crawl with prioritised hints | paid |
| squirrelscan (`squirrel` CLI) | 260+ rules across SEO, performance, security, accessibility; a compact LLM report format; diff against a baseline | run `squirrel audit <url> --format llm`. Coverage modes: `quick` 25 pages, `surface` 100 (one per URL pattern), `full` 500. Score targets: under 50 → 75+, 50–70 → 85+, 70–85 → 90+. Sign off on a `full` crawl. Use `squirrel report --diff <id>` to catch regressions |
| Firecrawl | map, scrape and search via API, returning Markdown | needs `FIRECRAWL_API_KEY` (a keyless free tier of about 1,000 credits a month exists for search); good for scraping competitor SERP pages for comparison |

For any crawler-based audit, first check that the site doesn't block unknown bots (Cloudflare, Shopify). If it does, crawl with authorised headers or from an allow-listed IP rather than reporting false 403s.

## Keyword and SERP data

| Tool | Notes |
|---|---|
| Ahrefs, Semrush, Moz Pro, SE Ranking | full platforms (from about $65–140 a month); their volumes differ, so keep to one source per report |
| DataForSEO API | pay-per-call SERP, keyword, backlink and domain data. Credentials go in `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`. Good for scripted keyword volume, live SERP checks and competitor gaps |
| Google Autocomplete | free keyword ideas from an unofficial endpoint, with no volumes; can break or rate-limit at any time |
| Google Trends, Wikipedia pageviews | free attention and seasonality proxies, never volume |
| Keyword Planner | ranges only unless you spend on ads |

## OpenSEO (MCP server)

An MCP server with project memory, site audits, rankings, SERP and keyword data. Its audit method generalises well:
1. Call `whoami` to check the connection and credits, then resolve or create the project and read the project context.
2. Start `run_site_audit`. While it crawls, pull the backlink and domain overview and a domain-level ranked-keyword sample (orientation only, since these are estimates).
3. List the page families from the sitemap. For each one that matters, read its best and its typical page, and ask whether it answers the searcher or just swaps in a keyword.
4. Run a live `get_serp_results` (depth 20) for every query behind a recommendation. Count the organic spots yourself and write "#10 (page 1)". A failed lookup is "unknown", not "not ranking".
5. Shortlist 5–10 candidates across at least 3 kinds of opportunity, then recommend 1–3 of them.
6. Write durable facts back to the project context and log the research.

Its keyword skill uses Search Console striking-distance queries (position 5–20, 50 or more impressions) before broad discovery.

## claude-seo (plugin with Python scripts)

A large plugin covering 20+ sub-skills: audit, technical, schema, GEO, local, maps, backlinks, Google APIs.
- Google APIs: PageSpeed and CrUX checks, 25-week CrUX history, and URL Inspection through its bundled runner, when Google credentials are configured.
- Free backlink sources, with confidence weights:

  | Source | Weight |
  |---|---|
  | DataForSEO | 1.0 |
  | Direct verification crawl | 0.95 |
  | Moz API (free tier 2,500 rows a month, 1 request per 10 s) | 0.85 |
  | Bing Webmaster | 0.7 |
  | Common Crawl (domain-level only) | 0.5 |

  With only Common Crawl data, report "Not assessed", never a score.
- Maps: Overpass (OpenStreetMap, free, about 2 concurrent queries per IP, ODbL attribution) for finding competitor locations; geo-grid rank checks need a paid SERP API.

## iannuttall `seo` CLI and MCP

A local CLI and MCP server with a catalogue of reports: `report`, `site-crawl`, `index-coverage`, `traffic-anomaly`, `update-correlation`, `striking-distance`, `cannibalisation`, `ai-readiness`, `pseo-audit`, `monthly-report` and more.
- Describe a report before running it: `seo reports describe <id> --json`, then `seo reports run <id> --params '<json>' --json`.
- For a broad audit, run `seo report --url <url> --actions-only --json` and resolve every finding as fixed, deferred or not needed, with evidence.
- Its source tells the agent to run `npm i -g seo` if the CLI is missing. Ask the user first; that is a global install.
- IndexNow submissions write to external services. Use `--dry-run`, and only send with approval.

## AI visibility tracking

| Tool | Notes |
|---|---|
| Apify `google-search-scraper` | one actor with add-ons for AI Overviews, AI Mode, ChatGPT, Perplexity, Copilot and Gemini answers plus their sources. Pay per result; disable sources you don't need. Needs `APIFY_TOKEN` |
| Profound, Otterly.ai, Ahrefs Brand Radar, Semrush and SE Ranking AI toolkits | hosted dashboards (Profound starts at about $499 a month) |

The Apify tracker skill runs 4 workflows:
1. Discover the prompts where competitors appear.
2. Find the domains and content types AI engines cite.
3. Gap-check your pages against the top-cited pages.
4. Recurring snapshots.

Matching rules worth copying:
- **Cited**: the registrable domain of the source URL equals yours. `blog.x.com` counts for `x.com`; `github.com/x` doesn't.
- **Mentioned**: a whole-word, case-insensitive match of the brand name in the answer text.
- Write a row even when nothing is returned, and keep the run ID so results can be re-checked.

Its scheduler installs a launchd agent or crontab entry on the user's machine. That is a persistent system change, so get explicit approval and show how to uninstall it.

## Choosing quickly

| Need | Cheapest good option |
|---|---|
| Is it indexed? Why not? | Search Console URL Inspection |
| Real CWV | CrUX (PSI API or CrUX Vis) |
| Full crawl under 500 URLs | Screaming Frog free, or squirrelscan `surface` |
| Keyword volumes | one paid tool or DataForSEO; label everything as estimates |
| Live ranking check | a manual incognito search with country set, or a SERP API; date it |
| Backlink gap | Ahrefs or Semrush; otherwise Moz free plus Bing Webmaster |
| AI citations | a manual prompt set run 3–5 times, or Apify or a hosted tracker |

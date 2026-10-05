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
| Google Analytics 4 | sessions, engagement, key events and revenue per organic landing page; AI-engine referrals | the GA4 Data API or Google's read-only GA4 MCP server ([below](#analytics-google-analytics-4-organic-outcomes)) |

Google's Mobile-Friendly Test and the standalone Page Experience report have been retired. Use Lighthouse and the Core Web Vitals report instead.

## Analytics: Google Analytics 4 (organic outcomes)

Search Console says who clicked; GA4 says what those visits did. Use it to rank pages by organic key events or revenue, to confirm a traffic drop is real (see `audit.md`), and to count AI-engine referrals. If the site runs a different analytics tool, ask and use that one.

**Access, from Claude:**
- **MCP (easiest):** Google's `analytics-mcp` server, local and read-only (it can't change GA settings). Tools: `get_account_summaries`, `get_property_details`, `run_report`, `run_funnel_report`, `run_realtime_report`, `get_custom_dimensions_and_metrics`, `list_google_ads_links`.
  1. In a Google Cloud project, enable the Google Analytics Admin API and the Google Analytics Data API.
  2. Create Application Default Credentials for a user who can see the property, with the scope `https://www.googleapis.com/auth/analytics.readonly`: `gcloud auth application-default login --scopes https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform --client-id-file=YOUR_CLIENT_JSON_FILE`. The credentials file stays where gcloud saved it. Never copy it into the repo or chat.
  3. Ask before adding it (it installs via `pipx`): `claude mcp add analytics-mcp --scope user -e "GOOGLE_APPLICATION_CREDENTIALS=PATH_TO_CREDENTIALS_JSON" -e "GOOGLE_PROJECT_ID=YOUR_PROJECT_ID" -- pipx run analytics-mcp`.
- **API:** `POST https://analyticsdata.googleapis.com/v1beta/properties/GA_PROPERTY_ID:runReport`, OAuth scope `analytics.readonly`. Body fields: `dateRanges`, `dimensions`, `metrics`, `dimensionFilter`, `limit`, `returnPropertyQuota`.

**Minimal report**: organic landing pages by key events, last 28 days:

```json
{
  "dateRanges": [{ "startDate": "28daysAgo", "endDate": "yesterday" }],
  "dimensions": [{ "name": "landingPage" }],
  "metrics": [{ "name": "sessions" }, { "name": "engagedSessions" }, { "name": "keyEvents" }, { "name": "totalRevenue" }],
  "dimensionFilter": { "filter": { "fieldName": "sessionDefaultChannelGroup", "stringFilter": { "value": "Organic Search" } } },
  "limit": 1000
}
```

For AI referrals, swap the dimension to `sessionSource` and drop the filter, then read the rows for `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com` and `gemini.google.com`.

**Fields that matter:**
- `landingPage` is the path of the first pageview in a session, without the query string. `landingPagePlusQueryString` keeps it.
- `sessionDefaultChannelGroup` includes `Organic Search`, `Referral` and `Paid Search`.
- `keyEvents` counts events marked as key. Marking an event as key affects data only from then on; it doesn't change history.
- `engagedSessions` are sessions longer than 10 seconds, or with a key event, or with 2 or more screen views.

**Limits:**
- A standard property gets 200,000 core tokens a day and 40,000 an hour, 14,000 per project per property an hour, and 10 concurrent requests. Analytics 360 gets ten times the daily and hourly tokens.
- Bigger date ranges, more rows and complex filters cost more tokens. Daily quotas reset at midnight Pacific time.
- Rows default to 10,000 per request, and the maximum is 250,000. Page through for more.

**Gotchas:**
- GA4 sessions and Search Console clicks measure different things. Report both, each labelled with its source.
- Check that nothing broke tracking before blaming rankings: the tag, consent banner changes, filters.

## Crawlers

**Pick a tool**

| Situation | Tool | Why |
|---|---|---|
| The user already has one (licence, account or CLI installed) | that one | their saved configs and history carry over; ask which before you install anything |
| Under 500 URLs, no licence | Screaming Frog free, or squirrelscan `surface` | both free; squirrelscan gives a compact report Claude can read |
| Over 500 URLs, or you need Search Console clicks next to every URL, or scheduled runs | Screaming Frog (licence) | headless CLI, GSC and GA4 per URL, built-in scheduling, MCP |
| A prioritised hint list for a non-technical owner | Sitebulb | paid; ranks hints by importance |
| A source-code audit with a fix-and-rerun loop | squirrelscan | 260+ rules, `--diff` against a baseline |
| Scraping a handful of competitor pages to Markdown | Firecrawl | API, no desktop app |

| Tool | Use | Notes |
|---|---|---|
| Screaming Frog | full technical crawl, JS rendering, custom extraction, GSC and GA4 data per URL | free up to 500 URLs; licence beyond that. Headless CLI and MCP: [below](#screaming-frog-seo-spider-headless-cli-and-mcp) |
| Sitebulb | crawl with prioritised hints | paid |
| squirrelscan (`squirrel` CLI) | 260+ rules across SEO, performance, security, accessibility; a compact LLM report format; diff against a baseline | run `squirrel audit <url> --format llm`. Coverage modes: `quick` 25 pages, `surface` 100 (one per URL pattern), `full` 500. Score targets: under 50 → 75+, 50–70 → 85+, 70–85 → 90+. Sign off on a `full` crawl. Use `squirrel report --diff <id>` to catch regressions |
| Firecrawl | map, scrape and search via API, returning Markdown | needs `FIRECRAWL_API_KEY` (a keyless free tier of about 1,000 credits a month exists for search); good for scraping competitor SERP pages for comparison |

For any crawler-based audit, first check that the site doesn't block unknown bots (Cloudflare, Shopify). If it does, crawl with authorised headers or from an allow-listed IP rather than reporting false 403s.

### Screaming Frog SEO Spider: headless CLI and MCP

**Licence.** The free version crawls up to 500 URLs. A licence (£199 a year in the docs today) removes that limit and unlocks:
- saved crawls and saved configurations
- JavaScript rendering
- the Google Search Console and GA integrations
- scheduling
- the MCP server

**One-time setup, in the app's window.** Do this before any command-line run.
1. Open the app once, accept the EULA, enter the licence and keep database storage mode (the default).
2. Connect Search Console: Configuration > API Access > Google Search Console. Sign in with Google (OAuth), then pick the property. The app remembers the account, so no password or token ever goes into a script.
   - It fetches clicks, impressions, CTR and position for the last 30 days by default. Change the range in the Search Analytics tab.
   - Optional: "Enable URL Inspection" adds Google's index verdict for up to 2,000 URLs per property a day.
3. Set what has no command-line flag, then save it as a profile with Config > Profiles > Save As (a `.seospiderconfig` file):
   - JavaScript rendering: Configuration > Spider > Rendering.
   - Excludes.
   - Speed: Configuration > Speed. The default is 5 threads. Cap Max URI/s for a fragile server, and agree the crawl rate with whoever runs the site.

**Run headless on macOS.** Get the full flag list from `"/Applications/Screaming Frog SEO Spider.app/Contents/MacOS/ScreamingFrogSEOSpiderLauncher" --help`. For the exact tab, filter and export names, use `--help export-tabs` and `--help bulk-export`.

```bash
SF="/Applications/Screaming Frog SEO Spider.app/Contents/MacOS/ScreamingFrogSEOSpiderLauncher"
"$SF" --crawl https://www.example.com --headless \
  --config "$HOME/sf/weekly.seospiderconfig" \
  --use-google-search-console "GOOGLE_ACCOUNT" "https://www.example.com/" \
  --project-name "example.com" --task-name "Weekly" \
  --output-folder "$HOME/sf/exports" --timestamped-output --export-format csv \
  --export-tabs "Internal:All,Response Codes:Client Error (4xx),Response Codes:Server Error (5XX),Canonicals:Canonicalised,Canonicals:Missing,Directives:Noindex,Search Console:Non-Indexable with Search Analytics Data" \
  --bulk-export "Response Codes:Internal & External:Client Error (4xx) Inlinks"
```

**Flags that matter:**
- `--export-tabs "Tab:Filter,..."` uses names as they appear in the UI.
- `--bulk-export "Submenu:Export"` and `--save-report "Submenu:Report"` (for example `"Redirects:All Redirects"`) work the same way.
- `--export-format csv|xls|xlsx|gsheet`.
- `--use-google-analytics-4 "google account" "account" "property" "data stream"` adds GA4 data to the crawl.
- `--project-crawl-comparison "true"` compares the last two crawls in a project. `--crawl-comparison <id> <id>` compares any two, with IDs from `--list-crawls`.
- `--load-crawl <file or database ID>` re-exports an old crawl without recrawling.
- `--save-crawl` isn't needed in database mode, because crawls are stored automatically.

**Reading the result:**
- The `Internal:All` export carries the Search Console columns (Clicks, Impressions, CTR, Position) next to status, indexability and canonicals.
- Join the 4xx inlinks bulk export to it on URL and sort by clicks. Broken or non-indexable URLs that still get clicks go first.
- The Search Console filters do the rest:
  - `Non-Indexable with Search Analytics Data`
  - `Indexable URL Not Indexed`
  - `User-Declared Canonical Not Selected`
  - `No Search Analytics Data`: URLs with no impressions, or URLs that differ from the ones in GSC.
- Label the clicks Measured (Search Console, with the date range). Compare each week with the previous crawl rather than reading one run on its own.

**Scheduling:**
- Prefer the app's own File > Scheduling. It runs a crawl once or at intervals, headless when it exports, to a local folder or Google Sheets, and can email when it finishes. `--email-on-complete` does the same from the CLI.
- A cron or launchd job instead is a persistent system change. Ask first, show the exact entry, and show how to remove it.

**MCP server (version 24+, licence only):**
- It lets Claude start crawls and read reports and exports. It needs database storage mode.
- Turn it on in File > Settings > MCP Server. STDIO mode installs into Claude Desktop as an extension (`spider-mcp.mcpb`) and runs the app headless. Streamable HTTP mode runs alongside the visible app.
- Its Node tools are off by default. They let the model `npm install` packages and run its own scripts. Screaming Frog's Claude Desktop setup steps ask the user to turn the Node.js runtime on in the same settings page. That is the user's call: explain what it allows and don't switch it on for them.

**Gotchas:**
- A headless run that exports nothing usually means `--output-folder` doesn't exist or isn't empty. Use `--timestamped-output`.
- Don't end a quoted argument with `\`.

## Keyword and SERP data

**Pick a tool**

| Situation | Tool | Why |
|---|---|---|
| The user already pays for a platform | that one (Ahrefs, Semrush, Moz Pro, SE Ranking) | volumes differ between tools, so keep one source per report |
| Real queries the site already shows for | Search Console (striking distance: position 5–20, 50+ impressions) | measured, free, about your own site |
| Google's own volume and bid ranges, free with a Google Ads account | Keyword Planner (UI) | first-party; ask whether they have Ads access |
| Hundreds of keywords scripted, no platform | DataForSEO, or the Keyword Planner API if they already have Basic API access | pay per call vs. gated by Google Ads API access level |
| Ideas only, no account | Google Autocomplete, Google Trends | free; no volumes |

| Tool | Notes |
|---|---|
| Ahrefs, Semrush, Moz Pro, SE Ranking | full platforms (from about $65–140 a month); their volumes differ, so keep to one source per report |
| DataForSEO API | pay-per-call SERP, keyword, backlink and domain data. Credentials go in `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`. Good for scripted keyword volume, live SERP checks and competitor gaps |
| Google Autocomplete | free keyword ideas from an unofficial endpoint, with no volumes; can break or rate-limit at any time |
| Google Trends, Wikipedia pageviews | free attention and seasonality proxies, never volume |
| Google Keyword Planner | Google's rounded volumes and bid ranges; free inside Google Ads ([below](#google-keyword-planner)) |

### Google Keyword Planner

For volume, competition and top-of-page bids straight from Google, for a chosen location, language and network. Label its numbers Estimated (Keyword Planner, geo, date): they are rounded.

**UI route (most users):**
- Google Ads > Tools > Keyword Planner. The account setup, including billing information, must be complete before even "Get ideas for new keywords" works. The user does that; never enter payment details.
- **Discover new keywords**: start from keywords (comma and space separated) or from a website. A keyword plus a URL gives more ideas than a URL alone.
- **Get search volume and forecasts**: paste a list, or upload a CSV with one column headed `Keyword`.

**What the numbers mean:**
- *Avg. monthly searches* covers the keyword and its close variants, averaged over 12 months by default, for the chosen location and network. It is always exact-match, whatever match type you pick.
- Volumes are rounded, so totals across several locations won't add up.
- *Top of page bid (low/high range)* is roughly the 20th and 80th percentile of past top-of-page bids, from the last 30 days.
- Very low-volume and sensitive keywords can't be found at all. That is "Unknown", not zero.

**API route** (Google Ads API, `KeywordPlanIdeaService`):
- `GenerateKeywordIdeas` takes exactly one seed: `keyword_seed`, `url_seed`, `keyword_and_url_seed`, or `site_seed` (a whole domain, up to 250,000 ideas).
  - Targeting fields: `language`, `geo_target_constants`, `keyword_plan_network` (`GOOGLE_SEARCH` or `GOOGLE_SEARCH_AND_PARTNERS`), `include_adult_keywords` and `historical_metrics_options`.
  - Results are paged. Each has `text` and `keyword_idea_metrics` (`avg_monthly_searches`, `competition`).
- `GenerateKeywordHistoricalMetrics` covers a list you already have: average monthly searches over 12 months, per-month volume, competition level and index, and 20th/80th percentile bids.
- Access is the catch. The Explorer access level excludes `KeywordPlanIdeaService`, so the developer token needs Basic access (15,000 operations a day) or Standard.
- Planning calls are rate limited more tightly than other services. Cache results: historical metrics refresh monthly.
- Google's official Google Ads MCP server has no keyword-ideas tool (only `search`, `get_resource_metadata` and `list_accessible_customers`). Use the client library.
- Credentials (developer token, OAuth, `google-ads.yaml` kept outside the repo): `google-ads` → `references/api-mcp-gaql.md`.

```python
from google.ads.googleads.client import GoogleAdsClient
client = GoogleAdsClient.load_from_storage("/path/outside/repo/google-ads.yaml")
ideas = client.get_service("KeywordPlanIdeaService")
req = client.get_type("GenerateKeywordIdeasRequest")
req.customer_id = "CUSTOMER_ID"
req.language = client.get_service("GoogleAdsService").language_constant_path("1000")  # 1000 = English
req.geo_target_constants.append(client.get_service("GeoTargetConstantService").geo_target_constant_path("GEO_ID"))
req.keyword_plan_network = client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
req.keyword_seed.keywords.extend(["trail running shoes"])
for idea in ideas.generate_keyword_ideas(request=req):
    m = idea.keyword_idea_metrics
    print(idea.text, m.avg_monthly_searches, m.competition.name)
```

Location IDs are in Google's geotargets list. For SEO, use `GOOGLE_SEARCH`: organic results only appear on Google Search itself, so partner sites don't matter here.

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

## WordPress SEO plugins: Yoast SEO and Rank Math

On WordPress, titles, meta descriptions, canonicals, robots meta, schema, sitemaps and often redirects come from the SEO plugin. Fix them there, not in theme code, or the plugin overwrites your fix.

**Pick a tool**

| Situation | Tool | Why |
|---|---|---|
| A plugin is already active (check the page source or the `/wp-json/` route list) | that one | keep to one SEO plugin; ask before switching |
| Need an AI agent to read and change robots, canonical or schema type per post | Yoast SEO (WordPress 6.9+) | its Abilities can read and update a post's SEO data |
| Need redirects without a paid plan | Rank Math | its Redirections module is in the free plugin; Yoast's Redirect Manager is Premium |
| Headless site that needs the head tags | either: Yoast `get_head`, Rank Math `getHead` | both return the plugin's head markup for any URL |

**Auth for anything that writes.** The user creates a WordPress Application Password (Users > Edit User, WordPress 5.6+), and requests send it as Basic Auth over HTTPS only. Keep it in an environment variable (`WP_USER`, `WP_APP_PASSWORD`), never in chat or the repo. Show each change and wait for a yes before sending it.

### Yoast SEO

- **Read any URL's head:** `GET /wp-json/yoast/v1/get_head?url=https://example.com/page/` returns `html` (the full head block, with schema), `json` (the same as key/value data) and `status`. WP REST responses (`/wp-json/wp/v2/posts/ID`) also gain the fields `yoast_head` and `yoast_head_json`.
  - This REST API is read-only.
  - A 404 for a real page usually means its indexable isn't built yet. Run `wp yoast index` (add `--reindex` to rebuild from scratch), or re-save the post.
- **Read and write per-post SEO data (Abilities API, WordPress 6.9+, indexables built):**
  - List the abilities: `GET /wp-json/wp-abilities/v1/abilities?category=yoast-seo`.
  - Read: `GET /wp-json/wp-abilities/v1/abilities/yoast-seo/get-post-seo-data/run?input[post_id]=5`. You can use `input[permalink]` (URL-encoded) or `input[title]` instead: up to 10 comma-separated phrases, 10 results a page.
    - It returns `seo_title`, `meta_description` and `canonical`, each with a `*_rendered` twin showing what is actually output, plus `focus_keyphrase`.
    - It also returns `noindex` (`true`, `false`, or `null` for the post-type default), the other robots flags, `schema_page_type`, `schema_article_type` and the analysis scores.
  - Write: `POST /wp-json/wp-abilities/v1/abilities/yoast-seo/update-post-seo-data/run` with `{"input": {"post_id": 5, "noindex": false, "canonical": "https://example.com/page/"}}`. Only the fields you send change. Writable fields: `canonical`, `is_cornerstone`, `noindex`, `nofollow`, `noimageindex`, `noarchive`, `nosnippet`, `schema_page_type`, `schema_article_type`.
  - **SEO title and meta description are not writable here.** Change them in the post editor's Yoast panel, or hand the user a list of the new titles and descriptions.
  - Permission: the user needs the `wpseo_edit_advanced_metadata` capability.
- **Sitemaps:** `/sitemap_index.xml`, with `/sitemap.xml` redirecting to it. Each sitemap holds up to 1,000 entries. Noindexed posts, and posts canonicalised elsewhere, are left out.
- **Redirects:** the Redirect Manager (301, 302, 410 and more) is a Premium feature. On free Yoast, redirect at the server or with a redirect plugin.

### Rank Math

- **Head tags:** turn on Rank Math SEO > General Settings > Others > Headless CMS Support (needs Advanced mode). Then `GET /wp-json/rankmath/v1/getHead?url=https://example.com/page/` returns `success` and `head`.
  - The `url` must be a full URL, not a slug. There is no per-tag query: parse the canonical or robots out of `head`.
  - "No route was found" means the toggle is off. A security plugin or firewall may also need the route allow-listed.
- **Sitemaps:** `/sitemap_index.xml`. Rank Math recommends 200 links per sitemap, down from its old default of 1,000.
- **Redirections:** enable the module in Rank Math SEO > Dashboard > Modules (Advanced mode).
  - Types: 301, 302 and 307, plus 410 and 451 as status codes.
  - Regex sources and CSV import and export are supported. Categories and scheduled redirects are PRO.

**Gotchas:**
- Re-fetch the live page (or `get_head` / `getHead`) after any change. If it still shows the old head, ask the user to purge the page cache.
- Plugin-generated schema counts as on-page schema. Check it in the Rich Results Test like hand-written JSON-LD (`schema.md`), and don't add a second copy of the same type in the theme.

## Choosing quickly

| Need | Cheapest good option |
|---|---|
| Is it indexed? Why not? | Search Console URL Inspection |
| Real CWV | CrUX (PSI API or CrUX Vis) |
| Full crawl under 500 URLs | Screaming Frog free, or squirrelscan `surface` |
| Full crawl over 500 URLs with GSC clicks per URL | Screaming Frog licence, headless CLI |
| Which organic pages convert | GA4 (Data API or the `analytics-mcp` server) |
| Keyword volumes | one paid tool or DataForSEO; label everything as estimates. Free: Keyword Planner inside Google Ads |
| Change titles, robots, canonicals on WordPress | the active SEO plugin (Yoast or Rank Math) |
| Live ranking check | a manual incognito search with country set, or a SERP API; date it |
| Backlink gap | Ahrefs or Semrush; otherwise Moz free plus Bing Webmaster |
| AI citations | a manual prompt set run 3–5 times, or Apify or a hosted tracker |

> Distilled from: apify-ads-intelligence (apify/awesome-skills, Apache-2.0), ad-library-teardown (scrapecreators/social-media-research-skills, MIT)

# Vendor notes: Meta Ad Library API, Apify and ScrapeCreators

Use these when a teardown needs more ads than you can review by hand, or a CSV/JSON export. Meta's own API is free but narrow; Apify and ScrapeCreators are paid and need the user's own account. Which to pick: the table at the top of [competitor-ad-research.md](competitor-ad-research.md), which also has the method and the output template.

## Meta Ad Library API (official, free)

**For:** structured Meta ad data straight from Meta, at no cost. It covers ads of any type delivered in the EU or UK during the past year, and political and issue ads worldwide from the past seven years. Ads that reached no EU country come back only if they are political or issue ads, so for a US-only commercial competitor use the free web library by hand or a paid scraper.

**Access.** The user confirms identity and location at facebook.com/ID (the same check Meta uses for political advertisers), creates a Meta for Developers account, then creates an app from the Ad Library API page (Access the API → My apps → Create app) and generates an access token. Keep it in an environment variable (here `META_AD_LIBRARY_TOKEN`); never paste it into chat or a file in the repo.

**Endpoint:** `GET https://graph.facebook.com/<VERSION>/ads_archive`

| Parameter | Values |
|---|---|
| `ad_reached_countries` (required) | ISO codes, e.g. `['DE']`, or `ALL` |
| `search_terms` or `search_page_ids` (one required) | Keywords, or the competitor's Page IDs |
| `search_type` | `KEYWORD_UNORDERED` (any order) or `KEYWORD_EXACT_PHRASE` |
| `ad_type` | `ALL`, `POLITICAL_AND_ISSUE_ADS`, `EMPLOYMENT_ADS`, `HOUSING_ADS`, `FINANCIAL_PRODUCTS_AND_SERVICES_ADS` |
| `ad_active_status` | `ACTIVE`, `INACTIVE`, `ALL` |
| `media_type` | `ALL`, `IMAGE`, `MEME`, `VIDEO`, `NONE` |
| `publisher_platforms` | e.g. `FACEBOOK`, `INSTAGRAM`, `MESSENGER`, `AUDIENCE_NETWORK`, `THREADS` |
| `ad_delivery_date_min` / `_max` | `YYYY-mm-dd` |

Fields worth asking for: `page_name`, `page_id`, `ad_creative_bodies`, `ad_creative_link_titles`, `ad_creative_link_descriptions`, `ad_delivery_start_time`, `ad_delivery_stop_time`, `ad_snapshot_url`, `publisher_platforms`, `languages`, and for EU ads `eu_total_reach` and `target_ages`. `spend` and `impressions` (as ranges) exist only for political and issue ads.

```bash
curl -G "https://graph.facebook.com/<VERSION>/ads_archive" \
  -d "search_page_ids=['<PAGE_ID>']" \
  -d "ad_reached_countries=['DE']" \
  -d "ad_active_status=ACTIVE" \
  -d "fields=page_name,ad_creative_bodies,ad_creative_link_titles,ad_delivery_start_time,ad_snapshot_url,publisher_platforms" \
  -d "access_token=$META_AD_LIBRARY_TOKEN" > meta_ads.json
```

- Results arrive in `data`; the next page is linked under `paging`. Save each page to disk and analyse from the files.
- Days running = today minus `ad_delivery_start_time` (the longevity signal in the teardown method).
- Error 613 means you hit the rate limit: wait and retry, don't loop.
- Keyword search also matches text in images, audio from video and the CTA button, so filter by `page_name` before analysing.

Before any run: confirm the user has an account and the key is set as an environment variable (don't ask them to paste it into chat), set a result limit, and warn before runs of 500+ ads. Don't install CLIs without the user's go-ahead.

## Apify Actors

**Needs**: Apify CLI 1.5+ and auth via `apify login` or `APIFY_TOKEN`. `jq` helps. Verify with `apify info`.

| Intent | Platform | Primary Actor | Fallback |
|---|---|---|---|
| Competitor's ads | Meta | `apify/facebook-ads-scraper` (takes Page URLs, not keywords) | `brilliant_gum/facebook-ads-library-scraper` |
| | Google | `dz_omar/google-ads-scraper` (`resultsPerQuery` ≥ 10) | `solidcode/ads-transparency-scraper` |
| | TikTok | `brilliant_gum/tiktok-ads-library-scraper` (`source: library`, EU country) | `silva95gustavo/tiktok-ads-scraper` |
| | LinkedIn | `silva95gustavo/linkedin-ad-library-scraper` | `dz_omar/linkedin-ads-scraper` |
| | X (heuristic) | `apidojo/twitter-scraper-lite` + filter | `apidojo/tweet-scraper` |
| Ads on a keyword | Meta | `brilliant_gum/facebook-ads-library-scraper` | `apify/facebook-ads-scraper` with an Ad Library search URL |
| | Google | `apify/google-search-scraper` (`focusOnPaidAds: true`) | |
| Top/long-running creatives | Meta | `brilliant_gum/facebook-ads-library-scraper`, rank by `daysRunning` | |
| | TikTok | `burbn/tiktok-top-ads-spy` (CTR, impressions) | library scraper with `source: creative_center` |
| Landing pages | Meta | `brilliant_gum/facebook-ads-library-scraper` (`resolveSnapshotUrls: true`) | |
| | Google | `apify/google-search-scraper` (paid ads) | `dz_omar/google-ads-scraper` (`destinationUrl`) |

Default counts: 30 per competitor or keyword query, 20 for top creatives, 50 for landing-page audits, 15 per platform for a cross-platform audit. Default country US; TikTok library needs an EU code (DE, FR, NL...), so use `creative_center` for US/global.

Steps:

```bash
apify actors info "ACTOR_ID" --input --json        # read the input schema first
apify actors call "ACTOR_ID" -i '{"...": "...", "maxResults": 30}' --json > run.json
apify datasets get-items DATASET_ID --limit 1 --format json | jq '.[0]'   # learn field names
apify datasets get-items DATASET_ID --format json > 2026-10-03_brand_meta.json
```

- Take `.defaultDatasetId` from the run output. Save to a file once and analyse from disk; `get-items` re-downloads every time.
- For a cross-platform audit, background the four platform calls and `wait`.
- Quirks: Meta Page URL is `https://www.facebook.com/<PageName>`; LinkedIn uses `https://www.linkedin.com/ad-library/search?accountOwner=<slug>&countries=<XX>` (or `?keyword=`); empty Google paid results can be a real answer; X only shows the brand's own timeline (flag posts with a non-empty `card` or a `source` containing "Ads" as *likely* promoted, and say so).
- Errors: 0 results → fallback Actor, then another country; `proxy is required` → add `"proxy": {"useApifyProxy": true}`; long runs → `--timeout` or a smaller count.
- Cost: most primaries were free at the time of writing; `apify/facebook-ads-scraper` charges about $0.001-0.006 per ad.

The source skill tells agents to always add a `--user-agent apify-awesome-skills/...` flag for the vendor's usage telemetry. It isn't needed for the commands to work; leave it out unless the user wants it.

## ScrapeCreators API

**Needs**: `SCRAPECREATORS_API_KEY`. Base URL and auth header are in the docs at scrapecreators.com.

| Library | Find / list | Ad detail | Transcript |
|---|---|---|---|
| Meta | `/v1/facebook/adLibrary/search/companies`, `/v1/facebook/adLibrary/company/ads`, `/v1/facebook/adLibrary/search/ads` | `/v1/facebook/adLibrary/ad` | `/v1/facebook/adLibrary/ad/transcript` |
| Google | `/v1/google/adLibrary/advertisers/search`, `/v1/google/company/ads` | `/v1/google/ad` | none |
| LinkedIn | `/v1/linkedin/ads/search` | `/v1/linkedin/ad` | none |

Flow: search the company → list its active ads → fetch details for representative ads → fetch transcripts for Meta video ads → cluster and write the teardown. Don't skip transcripts when the question is about video hooks.

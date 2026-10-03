> Distilled from: seo-audit (coreyhaines31/marketingskills, MIT), seo (AgriciDaniel/claude-seo, MIT), seo-audit (every-app/open-seo, MIT), seo-audit (anthropics/knowledge-work-plugins, Apache-2.0), seo (affaan-m/ECC, MIT), firecrawl-seo-audit (firecrawl/firecrawl-workflows, ISC), seo (iannuttall/seo, Apache-2.0)

# SEO audit and ranking-drop triage

An audit is a ranked list of fixes with evidence, not a checklist dump. Lead with what blocks indexing, then what wastes the traffic you already have, then new opportunities.

## Before you start

Ask for, or infer from context:
- the site URL and the 1–3 page types that make money (product, service, location, article)
- the goal: a full audit, one page, a traffic drop, or a pre-launch check
- access: Search Console export or API, analytics, a crawler, the source code
- target market and language
- recent changes: migration, redesign, CMS switch, new templates, a Google update

If there is no Search Console data, say so in the report. Without it you can't see impressions, real positions or index status, so findings about those are guesses.

## Order of checks

Work top down. A problem higher up makes the ones below it irrelevant.

1. **Crawlable**: robots.txt allows the important paths, there are no 4xx/5xx responses on key pages, and redirect chains have at most 1 hop.
2. **Indexable**: no stray `noindex`, the canonical points to itself or to the right page, and the page is in the sitemap. Use URL Inspection to compare the indexed and live versions.
3. **Rendered**: the main content, links, title, canonical and JSON-LD are in the raw HTML, or survive rendering. See [technical.md](technical.md).
4. **Fast enough**: Core Web Vitals field data at the 75th percentile (LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1).
5. **On-page**: titles, meta descriptions, H1, headings, internal links, image alt text.
6. **Content**: matches search intent, has depth, is not thin or duplicated, and shows first-hand experience.
7. **Authority**: referring domains, brand mentions and local signals compared with the pages that outrank you.
8. **AI search readiness**: crawler access and answer structure. See [ai-search.md](ai-search.md).

## On-page lint thresholds

These are proxies for review, not rules Google applies.

| Element | Target | Flag when |
|---|---|---|
| Title | 50–60 characters, primary term near the start, unique | under 30 or over 60 characters, duplicated, or templated with no variation |
| Meta description | 120–160 characters, unique, adds to the title | missing, duplicated, or just repeats the title |
| H1 | one clear H1 matching intent | none, or an H1 that differs from the topic (several valid H1s is not a failure) |
| Primary term | in the first 100 words | absent, or stuffed into every sentence |
| URL | under 75 characters, lowercase, hyphens | over 100 characters, has parameters, has dates in evergreen paths |
| Images | alt text of 10–125 characters, `alt=""` on decorative images | missing alt on content images |
| Internal links | about 5–10 contextual links per 1,000 words | orphan pages, or "click here" anchors |
| Click depth | 3 or fewer from the homepage | money pages 4 or more clicks deep |

Google truncates titles by pixel width (roughly 580–600 px) and rewrites many of them. Report a long title as "may truncate", not as an error.

## Thin-content gates

Use these minimum word counts to flag a page for review, never to pad it out.

| Page type | Minimum words |
|---|---|
| Homepage | 500 |
| Service page | 800 |
| Blog post or guide | 1,500 |
| Product or category page | 400 |
| Location page | 500–600, of which 40–60% is unique to that location |

A short page that fully answers a narrow query is fine. A long page that repeats a template is not.

## Ranking or traffic drop triage

1. **Confirm the drop is real.** Compare the same weekday ranges and the same year-on-year period. Check for tracking breaks: a missing analytics tag, a consent banner change, a GA4 filter, or a Search Console property switch.
2. **Size it.** Bands: 10–20% is watch, 20–40% investigate, 40–60% urgent, over 60% emergency.
3. **Localise it.** Is it the whole site, one directory, one template, one country or one device? A site-wide drop on a known date suggests a Google update or a technical change. A drop in one section suggests a template, an internal-link or a content issue.
4. **Line it up with dates:**
   - deploys and migrations
   - robots.txt or canonical changes
   - Google core and spam updates
   - the start of AI Overviews on your queries
   - competitor launches
5. **Separate clicks from impressions.** Impressions holding steady while clicks fall usually means CTR loss to SERP features or AI Overviews, not a ranking loss. When impressions fall, it's a ranking or indexing loss.
6. **Check the affected URLs** with URL Inspection, a live fetch, the rendered HTML and the response codes.
7. **Write observations and causes separately.** "Clicks on /blog/ fell 38% from 12 Aug" is an observation. "Caused by the 14 Aug canonical change" is a hypothesis until URL Inspection or a revert confirms it.

Common causes:
- a migration that left redirects missing or chained
- noindex shipped from staging
- canonical tags pointing to the homepage
- JavaScript-only content after a framework change
- an internal-link section removed from a template
- a helpful-content-style quality demotion of thin or templated pages
- cannibalisation after new posts were published

## Opportunity finding from your own data

- **Striking distance**: queries at position 5–20 with at least 50 impressions over 28 days. These are the fastest wins.
  - The Search Console API has no position filter. Pull a high `rowLimit` and filter the results yourself.
- **CTR underperformers**: compare a page's CTR with the expected CTR for its position. Expected CTR by position: #1 25–35%, #2 12–18%, #3 8–12%, #4–5 5–8%, #6–10 2–5%. Rewrite the titles and descriptions of pages more than 30% below expected.
- **Second page**: pages ranking #11–20 that need depth, links or a better intent match.
- **Cannibalisation**: two or more URLs swapping positions for the same query. Merge them, or split them by intent.

## How to state findings

- Lead with 1–3 recommendations that matter most. Put the long tail in a table.
- Give positions in context: "#10 (page 1)", "#14 (page 2)".
- Search volume is not visits. Label any traffic scenario as hypothetical and show the CTR you assumed.
- Before you claim a current ranking, check it live. Date every live check.
- Say what you checked and found fine in a "What else we checked" table, so a reader knows silence means checked, not skipped.
- Intentional controls (noindex, canonicals, robots rules) are observations until the owner confirms they are unintended.
- Never promise rankings, clicks, indexing or AI citations.
- Missing, sampled or capped data never supports a "zero" or an all-clear. Name the gap.

## Priority buckets

| Priority | Meaning | Examples |
|---|---|---|
| Critical | blocks indexing or causes penalties, fix now | site-wide noindex, robots blocks `/`, broken canonicals, hacked pages |
| High | material traffic impact, fix within 1 week | missing redirects after a migration, JS-only content, money pages 4+ clicks deep |
| Medium | fix within 1 month | duplicate titles, thin category pages, missing schema |
| Low | backlog | alt text on old posts, URL tidy-ups |

Give every item an expected impact (high, medium or low), the effort (under 2 hours, half a day, several days), the owner, and a check that would show the fix failed: "If impressions on /pricing don't recover within 28 days of the redirect fix, re-inspect the canonical."

## Optional health score

If the user wants one number, weight the categories as follows and show the subscores. Never show the number on its own.

| Category | Weight |
|---|---|
| Technical | 22 |
| Content quality | 23 |
| On-page | 20 |
| Schema | 10 |
| Core Web Vitals | 10 |
| AI search readiness | 10 |
| Images | 5 |

## Report layout

1. Executive summary: 3–5 sentences covering the biggest strength, the top 3 priorities, and an overall verdict (strong, needs work, or critical issues).
2. Critical and High findings, each with its evidence URL, the fix and the verification check.
3. On-page issue table: `Page | Issue | Severity | Fix`.
4. Technical checklist: `Check | Pass/Warn/Fail | Detail`.
5. Keyword and content opportunities: 15–25 rows, scored. See [keywords-content.md](keywords-content.md).
6. Competitor comparison: `Dimension | You | A | B | Winner`.
7. Quick wins (this week) and strategic investments (this quarter).
8. What else we checked, plus data sources and dates.

## Fix loop when you own the code

1. Run the audit and show the findings.
2. Agree with the user which items to fix.
3. Find the template or component behind each issue. Fix the template, not each page.
4. Fix in batches, then build and run the tests.
5. Re-audit the local build, and show the before and after.
6. Leave judgement calls (remove this link? merge these pages?) for a human. Don't guess.

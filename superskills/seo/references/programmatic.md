> Distilled from: programmatic-seo (coreyhaines31/marketingskills, MIT), seo (AgriciDaniel/claude-seo, MIT), seo-local (AgriciDaniel/claude-seo, MIT), seo (iannuttall/seo, Apache-2.0)

# Programmatic SEO

Programmatic SEO means many pages built from one template and a dataset. It works when every page answers a real query with data the visitor can't get elsewhere. It fails, and can take the whole site down with it, when pages are the same text with one word swapped. Google treats that as scaled content abuse or doorway pages.

## Go or no-go

Answer these before building anything:

1. **Is there a repeating search pattern?** For example "[tool] alternatives", "[city] coworking", "[A] to [B] converter". Check at least 10 sample variants in a keyword tool or Search Console.
2. **Is the demand real?** Most patterns are long-tail. Check the spread of volume across variants: if 90% of the volume sits in 20 variants, build those 20 well.
3. **Do you have data that differs per page?** No data, no pages.
4. **Can you compete?** Look at who ranks for 5 sample variants. If every result is a big directory with years of reviews, a new template won't beat it.
5. **Does each page have a conversion path?** A page that ranks but doesn't connect to the product is a cost, not an asset.

## Data defensibility

Ranked from strongest to weakest:

1. **Proprietary**: data you created, such as benchmarks, tests or prices you collected.
2. **Product-derived**: aggregated usage from your own users, such as "most-used Slack integrations".
3. **User-generated**: reviews, templates or answers from your community.
4. **Licensed**: exclusive or paid data.
5. **Public**: anyone can scrape it. This is the weakest; it is only defensible if you add analysis.

## The 12 playbooks

| Playbook | Query pattern | Example | Works best with |
|---|---|---|---|
| Templates | "[type] template" | "invoice template" | design or document products |
| Curation | "best [category]" | "best website builders" | real testing or expertise |
| Conversions | "[X] to [Y]" | "100 USD to GBP" | a working tool on the page |
| Comparisons | "[X] vs [Y]" | "Webflow vs WordPress" | honest, dated feature data |
| Examples | "[type] examples" | "landing page examples" | a curated gallery with notes |
| Locations | "[service] in [city]" | "dentists in Austin" | real local data or presence |
| Personas | "[product] for [audience]" | "CRM for real estate" | segment-specific features and proof |
| Integrations | "[A] [B] integration" | "Slack Asana integration" | a product with real integrations |
| Glossary | "what is [term]" | "what is churn rate" | expertise and examples |
| Translations | localised versions | `/de/`, `/fr/` | real translation plus hreflang |
| Directory | "[category] tools" | "AI copywriting tools" | proprietary listings and filters |
| Profiles | "[entity]" | "Stripe CEO" | structured entity data |

Playbooks can be stacked, for example "best coworking spaces in San Diego" combines curation and locations. Competitor-related patterns ("alternatives", "vs") are covered in [offpage-competitors.md](offpage-competitors.md).

## Template design

Each page needs:
- an H1 and title with the variant's exact query, and a unique meta description built from that variant's data, not one fixed sentence;
- a unique intro written from the variant's data: numbers, names, a specific verdict;
- data sections that change with the variant (tables, prices, specs, counts, maps) and conditional blocks that only appear when the data supports them;
- something useful you can do on the page: a calculator, filter, comparison, download or booking;
- links to the parent hub, 3–5 sibling variants and the relevant product page;
- schema that fits the page type (Product, LocalBusiness, SoftwareApplication, BreadcrumbList);
- a call to action that matches the query intent.

## Quality gates

| Gate | Threshold |
|---|---|
| Unique content per page | 40–60% or more of the visible text differs from sibling pages |
| Minimum words | about 400 for product and integration pages; 500–600 for location pages |
| Swap test | if you swap the city or product name and the page still reads correctly, it is a doorway page: rewrite it |
| Location pages | warn at 30 or more; hard stop at 50 or more without real per-location data or a physical presence |
| Data freshness | show an "updated" date; refresh on a schedule tied to how fast the data changes |
| Empty variants | don't publish a page with 0 results, or noindex it until it has data |

## Rollout

1. Build 10–20 of the highest-demand variants first, and check them by hand.
2. Publish, submit a separate sitemap for that page type, and link the pages from a hub.
3. After 4–8 weeks, check how many are indexed (Search Console page indexing filtered by that sitemap).
   - If fewer than about 50% are indexed, or many show "Crawled – currently not indexed", Google doesn't see enough value. Improve the template before adding more pages.
4. Scale in batches of a few hundred. Watch for an indexed rate that keeps falling, rising "Duplicate without user-selected canonical" counts, and impressions spread thin.
5. Noindex or 410 variants that get no impressions after 3–6 months, rather than letting them dilute the site.

## Indexation strategy

- Use subfolders (`/integrations/slack/`), not subdomains.
- Hub-and-spoke linking from a crawlable hub page, with pagination where needed. Never leave pages reachable only through search or filters.
- One sitemap per pattern, so indexing can be read per template.
- Use self-referencing canonicals. Never canonicalise all variants to the hub.
- Noindex thin combinations rather than publishing them indexable.

## Common failures

- Swapping the city or product name in the same 300 words.
- Producing thousands of variants with no search demand.
- Two patterns targeting the same query (for example `/crm-for-realtors/` and `/real-estate-crm/`).
- Scraped data with errors that nobody reviews.
- Pages written for crawlers, with nothing a visitor can use.

## Deliverables

1. **Opportunity sheet**: pattern, number of variants, total and top-20 volume, current competitors.
2. **Data plan**: source, fields per variant, update cadence, owner.
3. **Template spec**: URL pattern, title and meta formulas, section outline with conditional logic, schema, internal links.
4. **Rollout plan**: first batch, success thresholds, when to scale and when to stop.

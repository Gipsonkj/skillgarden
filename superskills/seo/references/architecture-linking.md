> Distilled from: site-architecture (coreyhaines31/marketingskills, MIT), seo-audit (coreyhaines31/marketingskills, MIT), keyword-research (aaron-he-zhu/aaron-marketing-skills, Apache-2.0), seo (AgriciDaniel/claude-seo, MIT), seo-technical (AgriciDaniel/claude-seo, MIT)

# Site architecture and internal linking

Structure tells search engines which pages matter and how topics relate. Internal links are the cheapest ranking lever you control.

## Questions to answer first

1. Is this a new site or a restructure? If a restructure, which URLs must keep working?
2. What type of site is it? (See the table below.)
3. How many pages exist or are planned?
4. What are the 5 most important pages for the business?
5. Who are the audiences, and what is each one trying to do?

## Depth by site type

| Site type | Levels | Primary sections | URL pattern |
|---|---|---|---|
| Small business | 1–2 | Home, Services, About, Contact | `/services/name` |
| SaaS marketing | 2–3 | Home, Features, Pricing, Blog, Docs | `/features/name`, `/blog/slug` |
| Content or blog | 2–3 | Home, Blog, Categories, About | `/blog/slug`, `/category/slug` |
| E-commerce | 3–4 | Home, Categories, Products | `/category/subcategory/product` |
| Documentation | 3–4 | Guides, API reference | `/docs/section/page` |
| Multi-location | 2–3 | Locations, Services | `/locations/city/`, `/locations/city/service/` |

- Every important page should be reachable within 3 clicks of the homepage.
- Go as flat as you can while keeping the navigation clean. If one dropdown would hold 20 or more items, add a level.

## URL rules

1. Readable, lowercase words separated by hyphens: `/features/analytics`, not `/f/a123` or `/Features_Analytics`.
2. The path mirrors the hierarchy, and the breadcrumb mirrors the path.
3. Choose one trailing-slash policy and 301 the other form to it.
4. Keep URLs short and descriptive, under about 75 characters. Use `/blog/landing-page-conversions`, not the full post title.
5. No dates in evergreen blog URLs, no numeric IDs, and no `?id=` query parameters for content.
6. Use subfolders, not subdomains, for content you want to share the main site's authority: `/blog/` beats `blog.example.com`.
7. Every changed URL gets a 301 to its new home. Update internal links so they skip the redirect.

## Navigation

- The header nav has 4–7 items. A mega menu has at most 3–4 columns.
- Put the most important commercial pages (product, pricing) in the header.
- The footer can hold secondary links (legal, careers, full service lists), but footer links count for less than links in the body.
- Breadcrumbs on every page below level 1, marked up with `BreadcrumbList`.
- Use plain `<a href>` links that crawlers can follow. Never rely on JS-only menus or search boxes for discovery.

## Internal linking rules

1. **No orphans.** Every indexable page has at least one internal link from a crawlable page. A sitemap alone is not enough.
2. **Descriptive anchors** that describe the target ("CRM pricing comparison"), never "click here" or "read more". Vary them naturally; exact-match anchors on every link look manufactured.
3. **Density**: about 5–10 contextual links per 1,000 words. Fewer on short service and product pages: 3–5 on service pages, 2–4 on product pages.
4. **Push authority to money pages.** Link from high-traffic posts and pages with many backlinks to the pages you want to rank.
5. **Hub and spoke.** The pillar links to every cluster page, each cluster page links back to the pillar, and siblings link to 2–3 related siblings.
6. **Body first.** Links in the main content carry more weight than sidebar or footer links.
7. **Related sections**: "Related guides" blocks at the end of articles, chosen by topic rather than date.
8. **Fix links on the template.** Point internal links at the final 200 URL, with no redirects and no 404s.

### Finding link opportunities

- Search the site for the target page's main term, for example `site:example.com "crm pricing"`, then add links from pages that mention it without linking.
- In Search Console's Links report, find pages with many internal links that don't matter, and important pages with few.
- Run a crawler (Screaming Frog, Sitebulb, squirrelscan) to list orphans, click depth and inlink counts.
- After publishing a new page, add 3–5 links to it from existing related pages that already have traffic. This is the step most often skipped.

## Faceted navigation (e-commerce and listings)

- Decide which filter combinations deserve their own indexable page. They should have real search demand, such as "red running shoes women".
- Give those combinations clean static URLs, unique titles and intro text, and a place in the sitemap.
- For other facets, canonicalise to the parent, keep them out of internal links (use buttons or `#` state), and block crawl-trap parameters in robots.txt only when they are never meant to be indexed.

## Deliverables for an architecture plan

1. **Page hierarchy** as an ASCII tree:
   ```
   /
   ├── /features/
   │   ├── /features/analytics/
   │   └── /features/automation/
   ├── /pricing/
   └── /blog/
       └── /blog/{slug}/
   ```
2. **Visual sitemap** in Mermaid (`graph TD`), with nodes coloured by section.
3. **URL map table**: `Page | URL | Parent | Nav location | Priority | Target keyword`.
4. **Navigation spec**: header items, dropdown contents, footer groups and breadcrumb pattern.
5. **Internal linking plan**: hub pages, which spokes link to which, and the "related" logic.
6. **Redirect map** when restructuring: `Old URL | New URL | Status`, with every old URL listed.

## Checklist

- [ ] Important pages are 3 clicks or fewer from the homepage
- [ ] Header has 4–7 items, and breadcrumbs are on every page below level 1
- [ ] No orphan pages and no internal links to 3xx or 4xx URLs
- [ ] URLs are lowercase and hyphenated, with no dates, IDs or content parameters
- [ ] Each keyword cluster has exactly one target URL
- [ ] Every old URL is 301-redirected after a restructure

> Distilled from: seo-technical (AgriciDaniel/claude-seo, MIT), seo (AgriciDaniel/claude-seo, MIT), seo-audit (coreyhaines31/marketingskills, MIT), seo (addyosmani/web-quality-skills, MIT), seo (affaan-m/ECC, MIT), seo-aeo-best-practices (sanity-io/agent-toolkit, MIT), seo-geo (resciencelab/opc-skills, Apache-2.0)

# Technical SEO

Technical work decides whether Google can fetch, render and index the page at all. If you fix nothing else, fix these.

## Crawling

- `robots.txt` lives at the root, is under 500 KiB, and returns 200. A 5xx response on robots.txt can pause crawling of the whole site.
- `Disallow` stops crawling, not indexing. A blocked URL can still be indexed from links, without its content. To remove a page from the index, let it be crawled and serve `noindex`.
- Never block CSS or JS that is needed to render the page.
- Reference the sitemap in robots.txt: `Sitemap: https://example.com/sitemap.xml`.
- There is no manual crawl-rate setting any more. Google slows down on its own when it sees 429, 500 or 503 responses. Use 503 with `Retry-After` for planned downtime, and keep it under about 2 days.
- Googlebot processes the first 2 MB of an HTML file and the first 64 MB of a PDF. Content after that cut-off is ignored.
- Crawl budget only matters above roughly 10,000 URLs, or where facets and parameters multiply URLs. Fix infinite spaces (calendars, sort orders, session IDs) first.

## Indexing signals

| Signal | Rule |
|---|---|
| Canonical | absolute URL, self-referencing on every indexable page, one per page, points to a 200 page that is indexable |
| noindex | meta robots or `X-Robots-Tag` header; never on a page you also canonicalise to |
| Status codes | 200 for real pages, 301/308 for permanent moves, 404/410 for gone pages; never a "soft 404" (200 with "not found" text) |
| Redirects | 1 hop; never chains or loops; update internal links to point at the final URL |
| Duplicates | `http`/`https`, `www`/non-`www`, and trailing slash all resolve to one version with a single 301 |
| Parameters | canonicalise tracking and sort parameters; keep facets you don't want indexed out of internal links |
| Pagination | each page has a self-referencing canonical; `rel=next/prev` has been unused since 2019; never canonicalise page 2 to page 1 |

Canonical tags are hints. Google may pick another URL when the signals conflict: internal links, sitemaps and redirects that point elsewhere. Make every signal agree.

## Sitemaps

- At most 50,000 URLs or 50 MB uncompressed per file. Use a sitemap index for more.
- List only canonical, indexable URLs that return 200. No redirects, noindex pages or 404s.
- `lastmod` should be the real date the content last changed. Google ignores `priority` and `changefreq`.
- Use one sitemap per page type (products, posts, locations) so the Search Console coverage report shows which template has problems.
- With full hreflang alternates inside the sitemap, keep each file to about 2,000–5,000 URLs.
- IndexNow pings Bing, Yandex and others when content changes. Google does not support it.

## JavaScript rendering

Google renders JavaScript, but later and less reliably than plain HTML. Other crawlers, including most AI crawlers, do not run JavaScript at all.

| Strategy | Use for |
|---|---|
| SSG or ISR | marketing pages, docs, blogs: the best default |
| SSR | personalised or very fresh public pages |
| CSR only | content behind a login that doesn't need to rank |
| Dynamic rendering | legacy workaround only; treat it as technical debt |

Rules:
- The title, meta description, canonical, robots meta, H1, main content, internal links (as `<a href>`) and JSON-LD should all be in the initial HTML.
- When raw HTML and rendered HTML disagree, Google may act on either version.
  - A `noindex` in raw HTML can be honoured even if JS removes it later.
  - Keep a JS-injected canonical identical to the raw one.
- Google does not render pages that return a non-200 status. A JS app that shows an error page with a 200 response creates soft 404s. Return the real status from the server.
- Links must be crawlable `<a href="/path">`. `onclick` handlers and `#fragment` routes are not followed.
- Lazy-load below-the-fold images only. Never lazy-load the LCP image or content that needs a scroll or click to appear.
- Test with URL Inspection's "View crawled page" or the Rich Results Test. `curl` shows the raw HTML only.

## Core Web Vitals

| Metric | Good | Needs work | Poor |
|---|---|---|---|
| LCP (loading) | ≤2.5 s | 2.5–4.0 s | >4.0 s |
| INP (responsiveness) | ≤200 ms | 200–500 ms | >500 ms |
| CLS (visual stability) | ≤0.1 | 0.1–0.25 | >0.25 |

- The scores are judged on field data (CrUX) at the 75th percentile, per URL group, for mobile and desktop separately. Lab data from Lighthouse is for debugging only.
- INP replaced FID on 12 March 2024. Don't report FID.
- CWV is a tiebreaker ranking signal. A fast page that doesn't match intent won't rank, but a slow one can lose close contests.
- Use CrUX Vis or the CrUX API for history. The old CrUX Dashboard has been retired.

**LCP fixes**, in the order of its subparts (TTFB → load delay → load time → render delay):
- Keep TTFB under 800 ms with a CDN, caching and fewer server hops.
- Make the LCP image discoverable in the HTML. Give it `fetchpriority="high"` and never `loading="lazy"`.
- Serve AVIF or WebP at the displayed size, using `srcset`.
- Inline critical CSS and defer non-critical JS.

**INP fixes:**
- Break up long tasks so none runs over 50 ms; yield to the main thread.
- Defer third-party scripts.
- Keep the DOM under about 1,500 elements.
- Debounce input handlers.

**CLS fixes:**
- Set `width` and `height` (or `aspect-ratio`) on images, video and embeds.
- Reserve space for ads and banners.
- Use `font-display: optional` or a size-matched fallback font.
- Never insert content above content that has already loaded.

## Mobile

- Google indexes mobile-first. The main risk is content parity: text, links, schema or images that exist on desktop but are missing on mobile are lost.
- Use `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Base font size of at least 16 px. Tap targets at least 24×24 px (the WCAG minimum), with 48×48 px as the comfortable size.
- Avoid intrusive interstitials that cover the main content on arrival.

## Security and spam hygiene

- HTTPS everywhere, with no mixed content. Set HSTS once HTTPS is stable.
- Check for hacked content: run `site:` searches for spammy terms, and check Search Console's security issues report.
- Back-button hijacking (scripts that trap or rewrite browser history) is a spam-policy violation, enforced from 15 June 2026.
- Keep user-generated links `rel="ugc"` and paid links `rel="sponsored"`.

## International: hreflang

1. Each language or region version lists every version, including itself.
2. Every link is reciprocal. If A points to B, B must point back to A, or Google ignores the pair.
3. Codes are an ISO 639-1 language with an optional ISO 3166-1 region: `en`, `en-GB`, `pt-BR`. `en-UK` is invalid.
4. Add `x-default` for the fallback or language picker page.
5. The canonical of each version is itself. Never canonicalise one locale to another; the canonical URL must be a member of the hreflang set.
6. Put it in one place only: HTML `<link>` tags, HTTP headers (for PDFs), or the sitemap.

Further rules:
- Use subdirectories (`/de/`) or ccTLDs. Avoid `?lang=` parameters and cookie-only switching.
- Never auto-redirect by IP or `Accept-Language`. Googlebot mostly crawls from US IPs and sends no `Accept-Language` header, so it would only ever see one version. Show a dismissible banner suggesting the other locale instead.
- Bing largely ignores hreflang. It reads `<html lang>` and the `content-language` meta.
- In Next.js, `alternates.languages` does not add the self-reference automatically. Include the current locale yourself.

## Migrations and redesigns

1. Crawl the old site and export every URL that has traffic, links or impressions.
2. Map each old URL 1:1 to its closest new URL with a 301. Never redirect everything to the homepage.
3. Carry over titles, content, internal links, schema and hreflang.
4. On launch day:
   - update the canonicals and sitemap;
   - remove any staging `noindex` or password protection;
   - use Search Console's Change of Address tool for domain moves.
5. Keep the redirects for at least 1 year. Watch Search Console's coverage and 404 reports daily for 2 weeks.
6. Expect 2–8 weeks of turbulence. A drop lasting longer than that points to missing redirects or lost content.

## Quick command-line checks

```bash
curl -sI https://example.com/page                 # status, X-Robots-Tag, redirects
curl -sIL https://example.com/old | grep -i -E "^(HTTP|location)"   # count hops
curl -sL https://example.com/page | grep -i -E "<title>|name=\"robots\"|rel=\"canonical\"|hreflang"
curl -s https://example.com/robots.txt
```

Remember that `curl` sees the raw HTML only. JSON-LD or content injected by JavaScript will not appear in its output.

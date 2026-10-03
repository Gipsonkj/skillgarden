> Distilled from: schema (coreyhaines31/marketingskills, MIT), seo (AgriciDaniel/claude-seo, MIT), seo-local (AgriciDaniel/claude-seo, MIT), seo-aeo-best-practices (sanity-io/agent-toolkit, MIT), seo-geo (resciencelab/opc-skills, Apache-2.0), seo (addyosmani/web-quality-skills, MIT)

# Schema and structured data

Structured data helps search engines and AI systems understand what a page is. It qualifies some pages for rich results, but it does not directly raise rankings. Only mark up what is visible on the page.

## Format rules

- Use JSON-LD in a `<script type="application/ld+json">` block, with `"@context": "https://schema.org"`.
- One page can carry several types. Join them in a single `@graph` and connect them with `@id` references (for example `"@id": "https://example.com/#org"`) instead of repeating the organisation on every block.
- Server-render the JSON-LD. Google can read JSON-LD added by JavaScript, but most other crawlers can't, and neither can `curl` or a simple fetch tool.
  - When you audit, don't report "no schema" from raw HTML alone. Confirm with the Rich Results Test or a rendered fetch.
- Values must match the visible page: prices, ratings, dates, author, address.
- Use absolute URLs, ISO 8601 dates (`2026-09-14`), and real image URLs that are crawlable and at least 1,200 px wide for Article images.

## Which type for which page

| Page | Types | Required or important properties |
|---|---|---|
| Homepage | `Organization` (or `LocalBusiness`), `WebSite` | name, url, logo, sameAs (social and Wikipedia profiles) |
| Article or blog post | `Article` / `BlogPosting` / `NewsArticle` | headline, image, datePublished, dateModified, author (`Person` with url) |
| Product page | `Product` + `Offer` | name, image, offers.price, priceCurrency, availability; aggregateRating only from real on-page reviews |
| Software or SaaS | `SoftwareApplication` | name, operatingSystem, applicationCategory, offers |
| Local business | `LocalBusiness` subtype (Dentist, Plumber, Restaurant…) | name, address, telephone, geo, openingHoursSpecification, url |
| Event | `Event` | name, startDate, location, eventStatus, eventAttendanceMode |
| Breadcrumbs | `BreadcrumbList` | an ordered list matching the visible breadcrumb and URL path |
| Video | `VideoObject` | name, thumbnailUrl, uploadDate, duration, contentUrl or embedUrl |
| Author page | `Person` / `ProfilePage` | name, jobTitle, sameAs, knowsAbout |
| User Q&A or forum thread | `QAPage` / `DiscussionForumPosting` | real questions with user-submitted answers |
| Recipe, job posting, course list, dataset | `Recipe`, `JobPosting`, `Course`, `Dataset` | follow Google's feature docs per type |

## Retired and restricted features (as of 2026)

Don't promise these rich results.

| Markup | Status | What to do |
|---|---|---|
| `FAQPage` | FAQ rich results fully retired, 7 May 2026 (restricted to gov and health sites since 2023) | Flag existing markup at Info level only; it is harmless. Don't add it for SERP benefit. Use `QAPage` for genuine user Q&A. |
| `HowTo` | rich results removed Sep 2023 | Don't add it for SERP benefit |
| `SpecialAnnouncement`, `CourseInfo`, `ClaimReview` rich result, `VehicleListing`, `EstimatedSalary`, `LearningVideo`, Practice Problem | retired | Leave existing markup; don't add new |
| Sitelinks search box (`SearchAction`) | no longer shown | Optional only |
| `Attorney` | deprecated type | Use `LegalService` plus `Person` |
| `Dataset` | still used by Dataset Search | Keep it for real datasets |

Some sources still say FAQ schema gives "+40% AI visibility". No study supports that number for schema; it is a mix-up with the Princeton GEO study's "cite sources" result. Plain on-page Q&A text helps AI answers. The schema wrapper does not add a proven boost.

## Detail rules worth remembering

- `MerchantReturnPolicy` needs `returnPolicyCountry`. Merchant listings also want `shippingDetails`.
- `geo` coordinates need at least 5 decimal places (about 1 m precision).
- Multi-location businesses:
  - give each location its own page and `LocalBusiness` block, with a unique `@id`;
  - link each location to the brand with `branchOf` or `parentOrganization`;
  - put the brand `Organization` on the homepage.
- Review markup on your own business (self-serving reviews) does not earn stars for `LocalBusiness` or `Organization`.
- Product `aggregateRating` needs `ratingValue` and `reviewCount`, and the reviews must be visible on the page.
- `dateModified` should change only when the content changes.
- `sameAs` should list profiles you control: LinkedIn, X, YouTube, Crunchbase, Wikipedia and Wikidata. This strengthens entity understanding for AI systems too.

## Example: a connected @graph

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#org",
      "name": "Example Co",
      "url": "https://example.com/",
      "logo": "https://example.com/logo.png",
      "sameAs": ["https://www.linkedin.com/company/example"]
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com/",
      "name": "Example Co",
      "publisher": { "@id": "https://example.com/#org" }
    },
    {
      "@type": "BlogPosting",
      "@id": "https://example.com/blog/post/#article",
      "headline": "How to choose a CRM in 2026",
      "image": "https://example.com/img/crm.jpg",
      "datePublished": "2026-03-02",
      "dateModified": "2026-09-14",
      "author": { "@type": "Person", "name": "Ana Ruiz", "url": "https://example.com/team/ana" },
      "publisher": { "@id": "https://example.com/#org" },
      "isPartOf": { "@id": "https://example.com/#website" }
    }
  ]
}
```

## Next.js pattern

Render JSON-LD on the server inside the page component:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
/>
```

The `<` escape stops a `</script>` string inside CMS content from breaking out of the tag.

## Validate

1. Run the Rich Results Test (search.google.com/test/rich-results) to see which Google features the page qualifies for.
2. Run the Schema Markup Validator (validator.schema.org) to check general schema.org validity.
3. After deploy, watch Search Console's Enhancements reports for errors on each template.

Fix errors on the template, not page by page. A warning about a missing optional property is not a failure.

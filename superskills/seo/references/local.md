> Distilled from: seo-local (AgriciDaniel/claude-seo, MIT), seo (AgriciDaniel/claude-seo, MIT), schema (coreyhaines31/marketingskills, MIT), programmatic-seo (coreyhaines31/marketingskills, MIT), geo (zubair-trabzada/geo-seo-claude, MIT)

# Local SEO

Local SEO wins the map pack (the 3 map results) and "near me" searches for businesses that serve a place. Nothing you control outweighs proximity, so work on the factors you can move: the Google Business Profile (GBP), reviews, the location pages, and citations that agree with each other.

## What moves the map pack (2026 snapshots)

- **Whitespark 2026:** GBP signals make up about 32% of local-pack weight and reviews about 20%. The rest is on-page, links, citations and behaviour.
- **Strongest individual factors:** the primary GBP category, keywords in the real business name, and proximity to the searcher.
- **Search Atlas:** proximity explained about 55% of ranking variance and review count about 19%.
- **Biggest self-inflicted error:** a wrong primary category.

## Google Business Profile

1. **Primary category**: the most specific category that matches the main service, such as "Emergency veterinarian" rather than "Veterinarian". Check what the top 3 competitors use.
2. **Additional categories**: up to about 4 relevant ones. Don't list services you don't offer.
3. **Business name**: the real-world name only. Adding keywords that aren't in the legal or signage name breaks the guidelines and can get the profile suspended.
4. **Address or service area**: a storefront shows its address. A service-area business hides the address and lists the areas it serves. Virtual offices and coworking addresses get suspended.
5. **Description**: 250–750 characters covering services, area, and what sets the business apart. No URLs or promotions.
6. **Hours**, including holiday hours. Inaccurate hours hurt both conversions and trust.
7. **Photos**: at least 10 real ones (exterior, interior, team, work), plus new ones every month.
8. **Services or products** with descriptions and prices where possible.
9. **Posts** for offers, events and updates. They help conversions more than rankings.
10. **UTM tags** on the website link (`?utm_source=google&utm_medium=organic&utm_campaign=gbp`) so GBP traffic shows up separately in analytics.

The GBP Q&A API was discontinued on 3 Nov 2025. Put common questions on the website and in the description instead.

## Reviews

- **Count**: 10 reviews is the first real threshold. After that, aim to match or beat the top-3 competitors' count.
- **Velocity**: get a steady flow and avoid gaps longer than about 3 weeks. 74% of consumers only care about reviews from the last 3 months.
- **Rating**: 68% of consumers only use businesses rated 4 stars or more.
- **Ask every customer** at the moment of delivery, using a direct review link (QR code, SMS or email).
- **Reply to every review** within about 48 hours. For negative reviews, be calm, factual, offer to continue offline, and never reveal customer details.
- **Never** gate reviews (only asking happy customers), buy them, offer incentives for them, or post them yourself. These break Google's policy and FTC rules. The FTC can fine up to $53,088 per violation.

## NAP consistency

The business **N**ame, **A**ddress and **P**hone must be identical, character for character, on:
- the website footer or contact page;
- the `LocalBusiness` schema;
- the GBP;
- Bing Places and Apple Business Connect;
- the main directories.

Choose one format (for example "Suite 4" or "#4") and use it everywhere.

## Where to be listed

| Tier | Listings |
|---|---|
| Must have | Google Business Profile, Bing Places (it also feeds ChatGPT, Copilot and Alexa), Apple Business Connect (Apple Maps and Siri) |
| Data aggregators | Data Axle, Foursquare, Neustar/TransUnion: they feed hundreds of smaller sites |
| Major directories | Yelp, Facebook, BBB, Nextdoor; plus TripAdvisor for hospitality |
| Industry | Healthgrades/Zocdoc (medical), Avvo/Justia (legal), Houzz/Angi (home services) and similar |
| Local | chamber of commerce, local news, sponsorships, local associations |

Quality and consistency matter more than count. Clean up duplicate and outdated listings first.

## Location pages

- One page per real location, at `/locations/city/` (with `/locations/city/service/` if each service has demand there).
- Each page holds:
  - the full NAP, matching GBP;
  - an embedded map;
  - opening hours;
  - local photos;
  - staff at that location;
  - reviews from that location;
  - local landmarks and directions or parking;
  - the services offered there;
  - an FAQ specific to that location.
- 500–600 words or more, with 40–60% or more unique to the location. Use the swap test: if replacing the city name leaves a page that still reads correctly, it is a doorway page.
- Service-area pages for cities without an office are riskier. Write them only where you have real jobs, projects, testimonials or pricing for that area. Pause at 30 such pages, and stop at 50 unless each one has real local content.
- Link each location page from a `/locations/` hub and from the footer or nav. Link the GBP to that location's page, not to the homepage.
- Internal links: 2–5 contextual links per location page, to its services and to nearby locations.

## Schema

- Use the most specific `LocalBusiness` subtype (`Dentist`, `Plumber`, `Restaurant`, `LegalService`…).
- Include: name, address (`PostalAddress`), telephone, url, `geo` (latitude and longitude to 5 or more decimal places), `openingHoursSpecification`, `areaServed` for service-area businesses, `priceRange`, image, and `sameAs` links to the GBP and social profiles.
- For multi-location businesses: one block per location page, each with a unique `@id`, linked to the brand `Organization` with `branchOf` or `parentOrganization`.
- Self-serving review stars don't show for local businesses, so don't mark up your own testimonials expecting stars.

See [schema.md](schema.md).

## Tracking

- **Geo-grid rank tracking**: check rankings from a grid of points around the business, for example 7×7 points spread over 5 km. Rank from the office address alone looks better than what customers actually see.
- **Share of Local Voice** = grid points where you rank in the top 3 ÷ total grid points.
- **GBP Performance**: calls, direction requests, website clicks and the search terms that triggered the profile.
- Track reviews (count, average and velocity) against the top 3 competitors every month.

Geo-grid tools (Local Falcon, BrightLocal and others) and maps APIs are in [tools-vendors.md](tools-vendors.md).

## Local audit order

1. GBP: check the categories, the name against guidelines, NAP, hours, photo count and review stats against the top 3.
2. Check NAP consistency across the site, the schema and the top 10 listings.
3. Location pages: do they exist, how unique are they, which schema do they use, and how are they linked.
4. Reviews: count, rating, velocity, reply rate, and the gap to competitors.
5. Citations: missing core listings and duplicates.
6. Local links and mentions: chamber of commerce, sponsorships, local press.

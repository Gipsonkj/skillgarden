> Distilled from: ads (coreyhaines31/marketingskills, MIT), google-ads (openclaudia/openclaudia-skills, MIT), google-ads-builder (mikefutia/google-ads-builder, MIT), google-ads (arnabbagxd/brand-building-skills, MIT), google-ads-manager (claude-office-skills/skills, MIT), google-ads (kostja94/marketing-skills, MIT), ads (AgriciDaniel/claude-ads, MIT)

# RSA copy and assets

Limits change occasionally. The numbers below are the long-standing Google values; if a field is rejected, check the current Google Ads Help page for that asset.

## Character limits

| Field | Limit | Count |
|---|---|---|
| RSA headline | 30 chars | 3 min, 15 max (write 15) |
| RSA description | 90 chars | 2 min, 4 max (write 4) |
| Display path 1 / 2 | 15 chars each | 2 |
| Enabled RSAs per ad group | — | 3 max |
| Sitelink text | 25 chars | write 4–8 |
| Sitelink description lines | 35 chars each | 2 |
| Callout | 25 chars | write 4–6 |
| Structured snippet value | 25 chars | header + 3–10 values |
| Business name | 25 chars | 1 |
| PMax / Demand Gen headline | 30 chars | 3–15 (PMax), up to 5 (DG) |
| PMax long headline | 90 chars | 1–5 |
| PMax description | 90 chars (one must be ≤ 60) | 2–5 |
| Responsive display long headline | 90 chars | 1 |

Count every character including spaces. Print the count after every line so the reader can verify.

## Writing RSAs

**Headline mix for 15 slots** (2–3 of each):
1. Keyword: contains the ad group's core keyword or close variant (at least 3 headlines)
2. Benefit: what the buyer gets ("Close Books in 2 Days")
3. Feature/spec: what it is or does
4. Offer/price: real prices, discounts, free trial, free shipping
5. Proof: rating, customer count, years, awards — only if true and on the site
6. CTA: "Get a Free Quote", "Book a Demo"
7. Differentiator / objection: "No Setup Fees", "Cancel Anytime"

**Descriptions (4):** each stands alone. Lead with the benefit or offer, handle the main objection, end at least two with a CTA. Include the keyword naturally once or twice.

**Rules:**
- Every headline must read correctly next to any other headline. No two headlines with the same meaning (it hurts Ad Strength and wastes slots).
- Specific beats vague: "Save 40%" > "Save Money", "5-Min Setup" > "Easy Setup".
- Title Case headlines, sentence case descriptions.
- Urgency only when true ("Ends Sunday" must end Sunday).
- Pin sparingly. Pin only what must always show (brand name, legally required text) to position 1 or 2. Every pin reduces combinations and usually Ad Strength. Default: unpinned.
- Aim for Ad Strength "Good" or "Excellent", but judge ads on conversions, not the Ad Strength label.
- Display paths add relevance: `/crm/small-business`.
- Dynamic keyword insertion `{KeyWord:Default}` only when every keyword in the group reads well in the slot.

**Policy-safe copy** (common disapprovals):
- No exclamation marks in headlines; at most one in descriptions.
- No ALL CAPS words (except real acronyms), no repeated punctuation or gimmicky symbols.
- No phone numbers in ad text (use a call asset).
- No unprovable superlatives ("#1", "Best") unless a cited third party says so, shown on the landing page.
- No competitor trademarks in copy without authorisation.
- Regulated categories (health, finance, gambling, alcohol, housing, employment, credit, political) need a current Google Ads policy check and sometimes certification. Platform approval is not legal clearance.

## Assets (formerly extensions)

| Asset | Write | Notes |
|---|---|---|
| Sitelinks | 4–8, each to a distinct real page | 25-char text + two 35-char lines; pricing, reviews, specific services |
| Callouts | 4–6 | 25 chars; USPs not already in headlines ("Free Returns", "24/7 Support") |
| Structured snippets | 1 header + 3+ values | Headers are a fixed list: Brands, Courses, Degree programs, Destinations, Featured hotels, Insurance coverage, Models, Neighborhoods, Service catalog, Shows, Styles, Types, Amenities |
| Call | If calls are a goal | Track calls as conversions; set schedule to staffed hours |
| Location | Local businesses | Link the Business Profile |
| Price | 3+ items | Price qualifier (From, Up to, Average) |
| Image | Square 1:1 and landscape 1.91:1 | Relevant to the ad and page |
| Lead form | When an on-Google form beats the site | Sync leads to the CRM same day |
| Promotion | Live sales | Dates must match the actual sale |

Assets raise CTR and Ad Rank at no extra cost per click. Every Search campaign should have at least sitelinks, callouts and snippets.

## Performance Max / Demand Gen asset package

Per asset group (supply the maximum where you have real material):

| Asset | Count | Spec |
|---|---|---|
| Headlines | 3–15 | ≤ 30 chars |
| Long headlines | 1–5 | ≤ 90 chars |
| Descriptions | 2–5 | ≤ 90 chars, one ≤ 60 |
| Landscape images | up to 20 total images | 1.91:1, e.g. 1200×628 |
| Square images | | 1:1, e.g. 1200×1200 |
| Portrait images | | 4:5, e.g. 960×1200 |
| Logos | 1–5 | 1:1 (1200×1200) and 4:1 (1200×300) |
| Videos | 1–5 | Horizontal, vertical and square; ≥ 10 s; supply your own |
| Business name, CTA, final URL | 1 each | |

Image rules: product or person in the centre safe area (crops differ per placement), no text-heavy images, no fake buttons. Concepts should differ materially, not only in colour or crop. Demand Gen and YouTube placements need hooks in the first 2–3 seconds, captions, and vertical versions for Shorts. Verify current specs per placement before producing final files.

## Display / responsive display copy

Browsing users are not searching: lead with a pain point or aspiration, not a feature. Short headline ≤ 30, long headline ≤ 90, description ≤ 90, business name ≤ 25.

## Required output shape

Deliver in this order (the long RSA block last, so nothing important is cut off):

```
Ad group structure:
- AG1 <theme>: keywords (match types) -> landing URL -> RSA1
Negative keywords: campaign-level ... | ad-group level ...   (from real search terms when the account exists)
Sitelinks (4+): text (≤25) | line 1 (≤35) | line 2 (≤35) | URL
Callouts (4+, ≤25 each)
Structured snippet: header: values
RSA1 — <ad group>
  Final URL | Path1 (≤15) | Path2 (≤15)
  Headlines (15, ≤30):  1. <text> (NN)  ...
  Descriptions (4, ≤90): 1. <text> (NN) ...
  Pins: none (or explicit)
```

Self-check before sending: exactly 15 headlines and 4 descriptions per RSA; every count printed and within limit; no duplicate meanings; ≥ 3 headlines with the keyword; every claim supported by the site or brief. Rewrite anything that fails; never ship a partial RSA.

## Testing copy

- Test one message hypothesis at a time (offer A vs offer B), not random wording.
- Use ad variations or experiments; read results on conversions per impression, not CTR alone.
- Replace assets rated "Low" after they have enough impressions (thousands, not dozens); keep the rest stable.
- Refresh copy every 2–3 months or when offers change. Mirror the winning headline on the landing page H1.

## Export to Google Ads Editor

`scripts/google-ads-builder/render_report.py` (stdlib Python, no network) turns a campaign JSON into an Editor import CSV and an HTML preview with red flags on any headline > 30 or description > 90 characters.

1. Write `./search-ads-run/campaign.json` in the working directory:

```json
{
  "business": "Acme CRM", "url": "https://acme.example", "goal": "lead",
  "geo": "US", "budget_monthly": 3000,
  "settings": {"bidding": "Maximize conversions", "networks": "Search only", "schedule": "All hours", "notes": ""},
  "ad_groups": [{
    "name": "Category - CRM software", "theme": "high-intent",
    "keywords": [{"text": "crm software", "match": "phrase"}],
    "rsa": {"headlines": ["...15 items"], "descriptions": ["...4 items"], "paths": ["crm", "small-business"]}
  }],
  "negatives": [{"text": "jobs", "match": "phrase"}],
  "extensions": {"sitelinks": [{"text": "", "desc1": "", "desc2": "", "url": ""}], "callouts": [], "snippets": {"header": "Types", "values": []}},
  "caveats": ["Draft only: add conversion tracking and real budgets before launch; volumes are directional."]
}
```

2. Run `python3 <skill-dir>/scripts/google-ads-builder/render_report.py --no-open` from that working directory.
3. Outputs `search-ads-run/google-ads-editor.csv` (import via Google Ads Editor > Account > Import) and `search-ads-run/campaign-dashboard.html`. Fix every overflow the script reports before handing over. The CSV covers keywords, RSAs and negatives; add assets and settings in Editor.

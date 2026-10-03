> Distilled from: ads (coreyhaines31/marketingskills, MIT), ads + ads-google (AgriciDaniel/claude-ads, MIT), google-ads (openclaudia/openclaudia-skills, MIT), google-ads (kostja94/marketing-skills, MIT), google-ads (arnabbagxd/brand-building-skills, MIT), google-ads-manager (claude-office-skills/skills, MIT), google-ads-builder (mikefutia/google-ads-builder, MIT)

# Account structure and campaign build

Use this to plan a new account, add a campaign type, or rebuild a messy structure. Copy rules live in [ad-copy-assets.md](ad-copy-assets.md); keyword lists in [keywords-negatives.md](keywords-negatives.md); bids in [bidding-budgets.md](bidding-budgets.md).

## Intake (ask before building)

| Question | Why it changes the build |
|---|---|
| What is sold, at what price, to whom, where? | Campaign types, geo, language |
| Primary conversion (purchase, lead, call, booking) and its value | Bidding, CTAs, what to import |
| Is conversion tracking live and tested? | No tracking = build drafts only, launch after [conversion-tracking.md](conversion-tracking.md) |
| Monthly budget and target CPA/ROAS (or margin) | Number of campaigns you can feed |
| Brand terms to protect, competitors to target | Brand / competitor campaigns |
| Landing pages per product or service | One ad group theme per landing page |
| Product feed / Merchant Center (ecommerce) | Shopping and PMax eligibility |

If tracking, budget or the landing page are missing, say so and keep going with a labeled draft. Never invent prices, reviews or claims.

## Search captures demand; it does not create it

Google Search harvests people already looking. If the category has near-zero search volume, say so and push budget to Demand Gen, YouTube or other channels instead of forcing keywords nobody types.

**Open spend rung by rung.** Each tier gets budget only after the one below converts to real business outcomes:

1. **Brand** (your name, name + pricing/login). Cheapest, highest conversion rate. Always on, own budget.
2. **High-intent non-brand** ("buy X", "X for Y", "best X"). The profit centre; most budget lives here.
3. **Competitor** ("[competitor] alternative", "vs"). Higher CPC, lower CVR; needs a dedicated comparison page.
4. **Problem-aware** ("how to fix Z"). Longer payback; only after 1–2 work.
5. **Awareness** (Display, YouTube, Demand Gen, broad). Last, with spare budget.

## Default account shape

```
Account
├── Search – Brand                 (own budget, exact + phrase only)
├── Search – Non-brand – <theme>   (themed ad groups, 5–15 keywords each)
├── Search – Competitor            (optional, own budget)
├── Shopping or PMax – Feed        (ecommerce, after Search/feed are healthy)
├── Remarketing (Display / Demand Gen)
└── PMax                            (only once tracking + Search are profitable)
```

Rules:
- **Independent budgets.** A shared budget lets brand (always cheapest) starve the campaigns you need data from.
- **Themed ad groups, not SKAGs.** 5–15 closely related keywords sharing one intent and one landing page. If two keywords need different pages or promises, split the group. Max 3 enabled RSAs per ad group (Google limit); 1–2 is normal.
- **Consolidate for data.** A campaign that cannot reach roughly 15–30 conversions a month is too thin for target-based Smart Bidding; merge it with a neighbour rather than adding structure.
- **One home per query.** Same keyword + match type in two ad groups or campaigns splits data. Use negatives to route each query to one place, and add brand as a negative in non-brand campaigns.
- **Naming:** `GOOG_<Type>_<Theme>_<Geo>_<Goal>` (for example `GOOG_Search_NonBrand-CRM_US_Leads`). Ad groups: `<Theme> – <Intent>`. Names are labels; audits must still read the keywords.

## Search campaign settings to set on every build

| Setting | Default | Why |
|---|---|---|
| Networks | Search only. Search Partners and Display **off** until proven | Partner/Display traffic is lower quality and blends into Search data |
| Location option | **Presence**: people in or regularly in the area | Default "presence or interest" serves people who merely search about the place |
| Language | Languages your customers use | Keys off the user's Google settings, not the query language |
| Ad schedule | All hours at launch; trim only after 2–4 weeks of hour/day data | Early cuts are guesses |
| Ad rotation | Optimize | Required for RSA asset learning |
| Auto-apply recommendations | Review and switch off the ones that add keywords, broad match or budget | Keeps changes deliberate |
| Automatically created assets / final URL expansion | Decide on purpose and record the choice | Generated copy and URLs are account-governed settings |

## Campaign types: when to use each

| Type | Use when | Must have first | Watch-outs |
|---|---|---|---|
| **Search** | People search for the offer | Tracking, landing page per theme | Core of almost every account |
| **Shopping (Standard)** | Ecommerce with a feed | Merchant Center feed with no major disapprovals | You optimise the feed, not keywords; negatives still apply |
| **Performance Max** | Scaling after Search/Shopping are profitable | Solid conversion tracking + values, full asset set, brand exclusions | Cannibalises brand and remarketing if unguarded |
| **Demand Gen** | Creating demand on YouTube, Discover, Gmail with image/video | Creative in several ratios, audience signals | Report by format/network; blended numbers hide waste |
| **Display** | Remarketing; cheap reach | Remarketing lists, placement exclusions | Cold prospecting on Display rarely converts |
| **Video (YouTube)** | Awareness, consideration, product demos | Real video (Google auto-makes a poor one if you supply none) | Judge on view-through + assisted, not last click |

### Performance Max guardrails

- Never the first campaign, never on weak tracking, never on a tiny budget.
- Account-level **brand exclusions** so it does not claim brand Search credit.
- **Audience signals**: customer lists, converters, custom segments built from converting search terms and competitor URLs. Signals are hints, not targeting.
- **Search themes** per asset group from your proven keywords.
- **Negatives** from day one where your account supports them (campaign-level or account-level lists).
- **Asset groups by audience intent or product line**, each with its own final URL and full asset set (see [ad-copy-assets.md](ad-copy-assets.md)).
- Supply your own video; review channel/placement reporting monthly.
- Give it 4–6 weeks before judging. Weekly health flags: brand terms supplying a large share of conversions, unexpected geos, one placement eating a big share of spend, asset groups stuck below "Good".
- For B2B, check CRM quality of PMax leads separately; cheap PMax leads that close at half the rate of Search leads are expensive.

### Shopping and Merchant Center

| Feed attribute | Rule |
|---|---|
| Title | Highest-intent keyword + key attribute in the first ~70 characters; brand first only if people search the brand |
| Product type / category | Most specific Google category available |
| Images | Clean, product fills the frame, white or plain background where required; distinct from competitors |
| Price, availability | Must match the landing page exactly or products get disapproved |
| GTIN / MPN / brand | Fill for every product that has them |
| Shipping, returns | Match real fulfilment; reflect free-shipping thresholds |
| Promotions, ratings | Set up so promotion links and stars can show |

Structure: start with one Shopping/PMax campaign over the full catalog; split out best sellers or margin tiers only when each segment can reach roughly 30–50 conversions a month. Check Merchant Center diagnostics weekly; disapproved products are silent zero-impression revenue leaks.

### Competitor campaigns

- Own campaign and budget, exact + phrase only, your brand as a negative.
- You may bid on competitor names; do not use their trademark in ad text without permission.
- Send traffic to a comparison page whose H1 mirrors the query ("X vs Y"), not a blog post or the homepage.
- Expect lower Quality Score and higher CPC; judge on cost per qualified lead, not CPC.

## Landing pages decide Quality Score and conversion rate

- Page headline echoes the ad promise and the query (message match). Mirror your best-performing ad headline in the H1.
- One job and one primary CTA per page; proof above the fold.
- Loads in under ~3 s on mobile; no layout shift on the form.
- Form length is an intent gate: short forms buy volume, longer qualifying forms buy quality. Match it to the conversion you feed back.

## Launch checklist

- [ ] Conversion action tested with a real conversion, correct value and currency
- [ ] Auto-tagging on; GA4 linked
- [ ] Brand, non-brand (and competitor) split with independent budgets
- [ ] Networks, location option, language set as above
- [ ] Negative lists attached (from real research, see keywords file)
- [ ] 1–3 RSAs per ad group within limits; 4+ sitelinks, 4+ callouts
- [ ] Final URLs load, are mobile-friendly and match the ad
- [ ] Bid strategy matches conversion volume (see bidding file)
- [ ] Change log started: date, what changed, why

## Build output format

```
Campaign: <name> | type | daily budget | bid strategy | networks | geo (Presence) | language
  Ad group: <theme>  -> landing page URL
    Keywords: [exact] / "phrase" (match type per keyword)
    Negatives: ad-group level
    RSA 1: 15 headlines (chars), 4 descriptions (chars), path1/path2, pins
Shared negative lists: <name>: terms (match type)
Assets: sitelinks, callouts, snippets, call/location if relevant
Caveats: what is estimated, what to verify before launch
```

To turn a finished build into a Google Ads Editor import file, use the script described in [ad-copy-assets.md](ad-copy-assets.md#export-to-google-ads-editor).

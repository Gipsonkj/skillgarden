> Distilled from: competitors (coreyhaines31/marketingskills, MIT), directory-submissions (coreyhaines31/marketingskills, MIT), seo (AgriciDaniel/claude-seo, MIT), ai-seo (coreyhaines31/marketingskills, MIT), seo-audit (anthropics/knowledge-work-plugins, Apache-2.0)

# Off-page: links, directories and competitor pages

Links and mentions from other sites are still how search engines and AI systems judge whether you are worth citing. Earn them with assets worth linking to, list the product where buyers look, and build pages that capture competitor demand honestly.

## Backlink profile review

What to look at, in the profile and against the 3 sites that outrank you:
- **Referring domains**: unique linking domains matter more than total links.
- **Relevance**: links from sites in your topic beat high-authority links from unrelated sites.
- **Link targets**: are links landing on pages you want to rank, or only on the homepage?
- **Anchor text mix**: compare with the benchmarks below.
- **Velocity**: new and lost referring domains per month.
- **Gap**: domains that link to 2 or more competitors but not to you. These are your outreach list.

### Anchor text benchmarks

| Industry | Branded | URL | Generic | Exact match | Partial match |
|---|---|---|---|---|---|
| SaaS | 40–55% | 15–20% | 10–15% | 3–8% | 10–15% |
| E-commerce | 35–45% | 15–25% | 10–15% | 5–10% | 10–20% |
| Local service | 45–60% | 10–15% | 15–20% | 5–10% | 5–10% |
| Publisher | 30–40% | 20–30% | 10–15% | 3–8% | 10–20% |

An exact-match share well above these ranges looks manipulated.

### Red flags

| Pattern | What to do |
|---|---|
| 10× the normal number of new links in a week | Check the sources; this may be negative SEO |
| More than 50% of links lost in a month | Check Search Console for manual actions and for broken target pages |
| No new links for 3+ months | Nothing on the site attracts links; build linkable assets |
| Many links from one network, one country or one TLD | Possible link scheme; diversify |

### Disavow: rarely

- **Do disavow:**
  - after a manual action for unnatural links;
  - during a clear negative-SEO attack;
  - when known PBN or link-farm domains make up more than about 10% of the profile.
- **Don't disavow:**
  - ordinary low-quality links, which Google already ignores;
  - nofollow links;
  - small legitimate sites;
  - spam under about 2% of the profile.
- Use one `domain:example.com` line per bad domain, and include a dated comment header.

## Earning links

Ordered roughly by return on effort:
1. **Original data**: surveys, benchmarks, price indexes, "state of" reports. Journalists and AI answers cite numbers.
2. **Free tools and templates**: calculators, generators, checklists.
3. **Digital PR**: newsjacking with expert comment, and journalist request services (Qwoted, Featured, Source of Sources).
4. **Unlinked mentions**: find brand mentions that don't link, and ask for a link.
5. **Broken-link replacement**: find dead links on relevant pages and offer your equivalent page.
6. **Partner, integration and customer pages**: "works with" directories, case studies, supplier lists.
7. **Guest contributions** on genuinely relevant sites. Never buy links or join link exchanges: Google's link-spam policy treats them as schemes. Mark any paid placement `rel="sponsored"`.

## Directory and listing submissions

Directories pass some authority, put the product where in-market buyers browse, and feed AI answers to "best [category]" questions. They are a foundation layer, not a strategy.

### Hard rules

1. **Foundation first.** Before submitting, the landing page must be live and indexed, with a real pricing page, privacy policy and terms, logo files (PNG, SVG, 1024×1024), 5–8 real screenshots, and ideally a 60–90 second demo video.
2. **Destination pages first.** Have 3–5 `/alternatives/[competitor]` pages and 3–5 use-case pages live, so referral traffic and link equity land on pages that convert.
3. **Vary the positioning by directory type:**

   | Directory type | Lead with |
   |---|---|
   | Startup | the outcome |
   | SaaS review | the alternative framing |
   | AI directories | how the AI works |
   | MCP and agent registries | the agent use case |
   | Developer | technical depth |

   Never paste the same long description everywhere.
4. **Judge directories by real traffic and audience fit, not by Domain Rating alone.** Many high-DR directories send nothing.
5. **A human approves each submission.** Account creation, terms and form submission need the owner's go-ahead; an agent prepares the copy and the tracker.

### Tiers

| Tier | When | Examples |
|---|---|---|
| Launch | launch week | Product Hunt (the anchor event), BetaList, Show HN (only with a technical angle), DevHunt |
| SaaS and review | week 1, then ongoing | G2, Capterra, AlternativeTo, SaaSHub, SourceForge |
| AI directories | weeks 1–3 | There's An AI For That, Futurepedia, Toolify |
| Agent and MCP | if the product is agent-facing | the official MCP Registry first (aggregators copy from it), then the other registries |
| Integration marketplaces | when integrations ship | Zapier, Slack, HubSpot, Notion |
| Niche and local | when relevant | vertical directories, chamber of commerce, local listings (see [local.md](local.md)) |

Third-party skill and plugin directories have shipped malware: in Feb 2026 hundreds of malicious skills were found in one of them. Vet any registry before you list in it or install from it.

### Product Hunt essentials

- Launch at 12:01 AM Pacific time on a Tuesday, Wednesday or Thursday.
- The first 2 hours decide it; you need a warm audience already lined up.
- Ask people for feedback, not upvotes. Reply to every comment within 30 minutes.
- Prepare 3 weeks ahead: warm up your account, publish an "Upcoming" page, and prepare gallery images at 1270×760.

### Review sites (G2, Capterra, TrustRadius)

- A listing with no reviews is close to worthless. 10 reviews is the first threshold.
- **10-in-30 plan**: ask 20 active users with a direct review link, follow up once after 5 days, and expect about 50% to respond.
- G2 and TrustRadius allow small thank-you incentives under their own rules. Google reviews never allow incentives.

### Tracking

Use [templates/directory-submissions/submission-tracker-template.csv](../templates/directory-submissions/submission-tracker-template.csv). It lists about 270 directories with tier, URL, category, DR, dofollow status, submission status, live URL and the positioning variant used.

To verify a live listing's link, fetch the page HTML and inspect the anchor itself. Header-only requests can't show `rel` values.

```bash
curl -sL "https://directory.example/listing/yourapp" | grep -io '<a [^>]*yourdomain\.com[^>]*>'
# then check that tag for rel="nofollow" / "ugc" / "sponsored"
```

## Competitor and alternative pages

These pages capture high-intent "switch" and "compare" searches, and convert far better than generic blog posts.

| Format | URL | Target queries | Structure |
|---|---|---|---|
| Alternative (singular) | `/alternatives/[competitor]` | "[X] alternative", "switch from [X]" | why people leave, you as the alternative, comparison, who should and shouldn't switch, migration, proof, call to action |
| Alternatives (plural) | `/alternatives/[competitor]-alternatives` | "[X] alternatives", "tools like [X]" | selection criteria, then 4–7 real options with you included but honest, a summary table, picks by use case |
| You vs competitor | `/vs/[competitor]` | "[you] vs [X]", "[X] vs [you]" | 2–3 sentence TL;DR, a table, comparison by category, who each is best for, migration |
| Competitor vs competitor | `/compare/[a]-vs-[b]` | "[A] vs [B]" | a fair comparison of both, then you as the third option |

### Evidence discipline

These pages are public claims about another company, so they must survive that company's legal team.
- "Not listed on their pricing page (as of Mar 2026)" is not the same as "doesn't have". Only write ✗ when their docs or a hands-on trial confirm the feature is missing.
- Put an "as of" date on every price and feature table. Re-verify every quarter and before republishing.
- State what changed, not why. Leave motives out.
- Keep competitor facts in one central data file (YAML, JSON or CMS) so a single fix updates every page.
- Name who the competitor is best for. Honesty is what makes the page credible, and it ranks better.

A self-ranked "best X" list can earn an AI citation while the AI answer recommends a competitor. Off-site consensus (reviews, forums, analysts) decides recommendations. See [ai-search.md](ai-search.md).

### Auditing existing competitive content

For each claim on a competitor page:
1. List the claim and the asset it appears in.
2. Re-check it against the competitor's current site, docs or changelog, and record the date.
3. Mark it **Current**, **Changed**, **Unverifiable** (soften or remove it) or **Overclaimed** (rewrite or remove it).
4. Fix public pages first, then sales scripts, then internal documents.

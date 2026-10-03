# Influencer and brand-collab research

> Distilled from: apify-influencer-brand-collabs (apify/awesome-skills, Apache-2.0; analysis method only, flagged HIGH risk), instagram-marketing / ig-audience-insights (sergebulaev/instagram-skills, MIT; normalisation and honesty rules), instagram (sickn33/agentic-awesome-skills, MIT; hashtag API limits), instagram-scraper (gooseworks-ai/goose-skills, MIT; named only as a HIGH-risk option, no code copied).

> ToS: official Graph API / Instagram API only (Business or Creator), user-approved actions, no bots or cold DMs, scraping is HIGH risk and never the default.

The aim is to answer questions like "who does this brand work with?", "which brands has this creator worked with?" and "is this creator worth paying?" without putting the user's account at risk.

## Data sources, safest first

| Source | Risk | What it gives | Limits |
|---|---|---|---|
| Data the user supplies (screenshots, media kits, CSV exports, the creator's own Insights screenshots) | Allowed | Anything the creator shares | Ask creators for **Insights screenshots** of reach, audience location and age. This is the most accurate data there is. |
| **Business Discovery API** (`GET /{your-ig-id}?fields=business_discovery.username(handle){followers_count,media_count,biography,media{caption,like_count,comments_count,timestamp,permalink,media_type}}`) | Allowed | Public counts and recent posts of other **Business/Creator** accounts | Professional accounts only. No audience demographics, no reach. Like counts can be hidden. |
| **Hashtag search API** (`ig_hashtag_search` → `/{hashtag-id}/top_media` or `recent_media`) | Allowed | Top and recent public posts under a tag | 30 unique hashtags per 7 days per account. No usernames on some fields. |
| **Meta Ad Library**, including branded content search, browsed by hand | Allowed | Branded-content (paid partnership) posts and ads for a brand or creator | Covers only what Meta classified as branded content or ads. Browse in a normal browser. |
| Instagram's own creator tools (creator marketplace, partnership ads) where the account has access | Allowed | Opt-in creators with their stats | Availability varies by region and account |
| **Apify actors** (instagram-profile/post/reel scrapers, brand-collaboration-scraper), **ScrapeCreators / instagram-scraper**, any cookie or session tool | **Risky (HIGH)** | Bulk public profile, post and collab data | Against Meta's terms on automated collection. Research only, public data only, small volume, the user's explicit informed choice, never the default. Never logged in, never private accounts, no personal contact harvesting. |

When the user asks for something only the HIGH-risk row can deliver, say so in one line and offer the allowed alternatives first. Example:

> Bulk-pulling 500 creators' stats needs a scraper, which breaks Instagram's terms (HIGH risk; your account and the vendor's both carry it). Safer: I can use the Business Discovery API on a shortlist of 20-30, or you can request Insights screenshots from the creators.

## Method: brand ↔ creator collabs

These steps work the same whether the data comes from the Ad Library by hand, a supplied export, or (only if the user explicitly chose it) a scraper.

1. **Resolve the handle.** Strip deep-link prefixes from the URL (`instagram.com/_u/name` → `name`). Ignore reserved paths: explore, reels, stories, direct, accounts, about, p, reel, tv, tags, locations.
2. **Set the window.** Default to the last 90 days. Widen it if the results are thin.
3. **Collect branded-content items:** creator handle, brand partner, date, post or Reel URL.
4. **Work out the direction from the data, not from the account type.** Count how often the target appears as creator versus as brand partner. If it is mostly the creator, the results are brands. If it is mostly the brand partner, the results are creators. "Business account" flags are unreliable for this.
5. **Engagement (optional):** `likes + comments (+ views where available)` per collab. Match posts by shortcode (`/(p|reel|tv)/([A-Za-z0-9_-]+)`).
6. **Present the results:**
   - total collabs and unique partners
   - format mix (Reels usually lead)
   - weekly timeline (spikes show campaign launches)
   - top 5 collabs by engagement (only when engagement data exists)
   - a per-partner card: handle, followers, category, number of collabs, average engagement

For "who" questions, the partner list alone is the answer. Don't run the engagement enrichment unless the question is "which worked best".

## Vetting a creator

| Check | How | Red flag |
|---|---|---|
| Engagement rate | (likes + comments) ÷ followers, median of the last 12 posts. **Normalise by follower size**: rates fall as accounts grow. | Far below peers of the same size, or wildly above with generic comments |
| Reels reach | Ask for Insights: views from non-followers and average watch time | They won't share Insights |
| Comment quality | Read 20-30 comments on 3 posts | Emoji-only comments, repeated phrases, off-topic praise |
| Follower growth | Ask for a growth screenshot, or compare follower counts over time from Business Discovery | Sudden jumps of thousands with no viral post |
| Audience fit | Their Insights for top countries, cities and age | Audience outside the market you sell to |
| Brand safety | Read the last 30-60 days of captions and Stories | Conflicts with the brand, misinformation, competitor deals |
| Disclosure habits | Look for the "Paid partnership" label or #ad | Sponsored posts without disclosure, which is a legal risk for you too |

Only call a post a "winner" if it beats that creator's own median. Big accounts' averages hide breakout posts from small ones. A pattern has to show up across several top posts, not just one. Never invent a number. If data is missing, say "not available".

## Outreach (manual, policy-safe)

- **Contact channel:** use the creator's listed business email, contact button or management agency first. A one-to-one DM written and sent by the user is fine.
- **Never automate outreach.** No bulk or scripted DMs, and no scraped email lists.
- **Brief:** what you want, deliverables (e.g. 1 Reel + 3 Stories), usage rights and duration, timeline, fee or product, and disclosure requirements (the Paid partnership label). Then confirm in writing.
- **Collab posts and partnership ads:** use Instagram's Collab feature and branded-content tools so both accounts get credit, and so the brand can boost the post through official ads.

## Output template

```
RESEARCH: [brand or creator], window [dates], sources: [Business Discovery / Ad Library manual / supplied CSV]
Risk level used: Allowed | HIGH (user-approved scraper: [tool], [date])
Partners (N): ...
Format mix: Reels x%, posts y%
Timeline: [weekly counts, spikes]
Top collabs (if engagement data): ...
Shortlist + vetting notes: [handle | followers | median ER vs peer band | fit | flags]
Gaps: [what was not available and why]
```

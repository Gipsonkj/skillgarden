# Analytics

> Distilled from: linkedin-marketing engagement-metrics taxonomy, industry benchmarks and algorithm heuristics (sergebulaev/linkedin-skills, MIT), linkedin-skills platform canon and operating agreement (alirezarezvani/claude-skills, MIT), linkedin-content (openclaudia/openclaudia-skills, MIT). Export steps from LinkedIn Help; Buffer and Hootsuite metrics tools from their developer docs, in our own words.

ToS reminder: analyse **the user's own data**, exported from LinkedIn or read through the official API. Never scrape other people's posts, engagers or profiles to analyse them ([tos-and-safe-automation.md](tos-and-safe-automation.md)).

## Getting the data

### Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| Already schedules through a tool with analytics (Buffer, Hootsuite) | That tool's metrics | Already joined to the posts it sent. Ask which they use |
| Own profile, no tools | Creator analytics export (below) | Free, first-party, one XLSX file |
| A company page | Page analytics export (below) | Free for page admins; adds visitors, followers and competitors |
| A developer with page access already approved | Community Management API share and follower statistics | Repeatable pulls; same app as [publishing-official-api.md](publishing-official-api.md) |
| Just a few numbers | The user pastes them from each post's analytics | Fastest; enough for a weekly review |

| Source | What |
|---|---|
| Post analytics (on each post) and the Analytics tab | Impressions, members reached, reactions, comments, reposts, saves and sends (where shown), profile views from the post, follower gains |
| Analytics export (creator or company page) | XLSX/XLS of content and follower metrics over a date range |
| Settings, then Data privacy, then "Get a copy of your data" | Posts, connections, messages, profile |
| Official API (company pages via Community Management API) | Share statistics, follower statistics |
| Buffer `get_aggregated_post_metrics` | Totals and averages for posts it sent over up to 365 days; refreshed once a day, so up to a day behind |
| Hootsuite Perch MCP analytics tools | Metrics for connected profiles: `get_entitled_workspaces` (analytics side), `list_providers`, `search_sources`, `search_metrics`, `query_analytics` |
| A simple post log (date, first line, format, hook shape, pillar, time posted) | Lets you join metrics to what you did |

If the user pastes numbers, use those. Never invent a baseline.

### LinkedIn's own exports, step by step

The user downloads these by hand and shares the file; Claude never logs in to LinkedIn to fetch them.

- **Creator analytics (own posts):** Me, View Profile, the Analytics section, **Show all analytics**, open **Post impressions**, then **Export** (top right). The file is `.xlsx`. Ranges come as presets (such as the past 7 days); a custom date range is only in the mobile app.
- **Page analytics (admins):** page admin view, **Analytics**, pick **Content**, **Visitors**, **Followers** or **Competitors**, then **Export**, choose the timeframe, **Export**. The file is XLS.
- **Full account archive:** Me, **Settings & Privacy**, **Data privacy**, **Get a copy of your data**, **Request archive**. A download link arrives at the primary email address. Connections' email addresses appear only where they allowed it, only 1st-degree connections are included, and the CSV and vCard files don't support extended character sets such as Chinese, Japanese or Hebrew.

Reading the file: open it with Python (`openpyxl` or pandas), list the sheet names and header rows first, and map columns from what is actually there. Don't assume a layout; it changes. Keep the raw file out of any shared repo, since it holds the user's own data.

## Four layers: don't mix them in one report

| Layer | Decides | Metrics |
|---|---|---|
| Per post | What to write more of | Impressions, engagement rate = (reactions + comments + reposts) / impressions, comments (depth), saves, profile views from the post |
| Account | Whether the strategy works | Weekly follower change, profile views trend, search appearances, inbound connection requests |
| Team (advocacy) | Staffing, expansion | Total reach, participation rate (active / total), contribution |
| Business | Budget | Inbound DMs, meetings where LinkedIn was the first touch, deals, hires, partnerships |

Main KPI: **conversations and opportunities**, not followers. The 90-day success criteria should be things someone else could check (conversations you didn't start, specific referrals, invitations).

## How much data before concluding

| Posts | What you can say |
|---|---|
| Fewer than 10 | Nothing reliable. Keep posting |
| 10-20 | Describe: best and worst, rough patterns, labelled as tentative |
| 20-60 | Test one hypothesis (format A vs B, hook shape) with similar topics and times |
| 6-8 weeks of consistent posting and commenting | First reliable signal for the overall strategy |

Change one variable at a time. A single viral post is an outlier, not a strategy.

## Weekly review (20 min)

1. Top 3 posts by engagement rate, and top 3 by saves or comments.
2. Posts more than 50% below the user's own median. Check hook, format, timing and whether the topic is off-pillar.
3. How often the author replied to comments within the first hour.
4. Inbound conversations this week, and which posts or comments led to them.
5. One change for next week.

## Benchmarks (🟡 third-party, for calibration only)

| Followers | Typical engagement rate |
|---|---|
| 1K-5K | 4-8% |
| 5K-10K | 3-5% |
| 10K-50K | 2-4% |
| 50K+ | 1-3% |

| Format (vs single image) | Reported reach |
|---|---|
| Document / PDF carousel | 1.7-2.3x |
| Native video, under 90 s, captioned | 1.4-1.8x (falling year on year) |
| Text only | 1.0-1.3x |
| Poll | About 1.1x reach; strong for votes, burns trust if overused |
| External link in body | 0.4-0.6x |

Signal weights are widely repeated but **not confirmed by LinkedIn** (🔴/🟡): a save about 5x a like, a substantive comment about 3x a like. What LinkedIn has published (🟢): the feed uses multi-objective ranking (LiRank, KDD 2024), and **dwell time** is an explicit objective. So write posts worth reading to the end, and don't pad: padding hurts the other signals.

Average reach is about 8-12% of followers per post and falling year on year (🟡 van der Blom). A focused audience of a few thousand beats a large unfocused one.

## Diagnosing "my reach dropped"

1. Compare against the user's own trailing median, not someone else's numbers.
2. Check what changed: posting frequency (2+ a day?), links in the body, more hashtags, engagement bait, format change, topic drift, heavy edits after posting, posting time.
3. Check engagement quality: one-word comments only? Did the author stop replying?
4. Check for restriction signals: warnings, sudden near-zero reach. If they used automation tools or pods, stop at once. Recovery is reported at weeks (🟡 6-8).
5. Industry-wide drops happen. If the direction matches published trend reports, adjust expectations, not tactics.

## Report format

```
Period: <dates>  ·  Posts: <n>  ·  Data: <source>
What worked: <2-3 posts, why (format/hook/pillar), with numbers>
What didn't: <1-2 posts, likely cause>
Business outcomes: <conversations, meetings, inbound>
Confidence: <descriptive only / tested>  (n = <posts>)
Next: <one change to try, how we'll judge it>
```

## Pitfalls

- Averaging engagement rate across very different formats or authors.
- Treating posting frequency as an outcome.
- Quoting a precise percentage with no named study. Label it 🔴 or leave it out.
- "Engager analytics" built by scraping who liked other people's posts. That's prohibited; don't build it.

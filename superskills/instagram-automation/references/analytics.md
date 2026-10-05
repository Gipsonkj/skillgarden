# Analytics: insights, diagnosis and reporting

> Distilled from: viral-instagram-reels (vyralcontent/content-skills, MIT; Insights metrics, diagnose-flop order, readout worksheet), instagram (sickn33/agentic-awesome-skills, MIT; insights endpoints, best-times analysis), instagram-automation (sickn33/agentic-awesome-skills, MIT; Composio insights tools), instagram-marketing (sergebulaev/instagram-skills, MIT; signal weights). Metricool, Buffer, Hootsuite, Sprout Social and Linktree: their official docs (link-only).

Total views on their own don't mean much. Compare each post with **the account's own baseline** for the same format, read the metrics in a fixed order, and fix the earliest failure first.

## Where numbers come from

**Pick a tool**

| The user's situation | Use | Why |
|---|---|---|
| Already reports from Metricool, Buffer, Hootsuite or Sprout Social | That tool | Their baseline and past reports already live there; compare like with like |
| Not sure which tool holds their numbers | **Ask** | Sources differ in lag and history, so don't mix them in one comparison |
| No tools, or needs the skip rate or retention curve | In-app Insights (screenshot or export) | Free, the richest source, and some numbers aren't in any API |
| Trial Reel readout at 24 h | In-app Insights | API data can lag up to 48 h, and Buffer refreshes once a day |
| Developer pulling numbers by code | Graph API (or Composio's insights tools in an MCP client) | Every metric the API exposes; 30 days per account request |
| Best times to post, or competitor posts | Metricool | `get_best_time_to_post` and `get_network_competitors_posts`; Free sees 30 days of history |
| A year-long report | Sprout Social API | Up to 1 year per request |
| Clicks on the bio link | Linktree Insights, beside `profile_links_taps` | Free shows 28 days, Starter 90, Pro 365, Premium the whole lifetime; Pro and Premium add sources |

| Source | What it has | Notes |
|---|---|---|
| In-app Insights (professional accounts) | Everything, including the Reels **skip rate**, the retention curve, and followers gained from the post | The richest source. Users can screenshot or export it. |
| Graph API media insights `GET /{media-id}/insights?metric=...` | reach, views, likes, comments, saved, shares, total_interactions, Reels average watch time and total view time, follows and profile visits (where supported) | Needs `*_manage_insights`. Data can lag up to 48 h. |
| Graph API account insights `GET /{ig-user-id}/insights?metric=...&period=day&since&until` | reach, views, accounts_engaged, total_interactions, follower_count, follows_and_unfollows, profile_links_taps, online_followers, audience demographics | At most 30 days per request. Some metrics need 100+ followers. `period` must match the metric. |
| Composio | `INSTAGRAM_GET_IG_MEDIA_INSIGHTS`, `INSTAGRAM_GET_USER_INSIGHTS` | The same rules apply |
| Metricool connector | `get_instagram_posts`, `get_instagram_reels`, `get_instagram_stories` (each takes `init_date`, `end_date` and a `blog_id`), `get_metrics` then `get_analytics`, `get_best_time_to_post` (scores per day and hour; higher is better), `get_network_competitors_posts` | Free plan sees only 30 days of history. Setup in `graph-api-publishing.md`. |
| Buffer | `get_aggregated_post_metrics` (MCP), or `metrics` on a sent post (API) | Buffer refreshes metrics once a day, so they can trail Instagram by about 24 h |
| Hootsuite Perch connector | Performance metrics for the workspace's posts; best times to post | List the connector's tools first; setup in `graph-api-publishing.md` |
| Sprout Social API | Posts: `POST /v1/{customer_id}/analytics/posts` with `filters` (`customer_profile_id.eq(...)`, `created_time.in(start..end)`), `metrics` (e.g. `lifetime.views` for Instagram), `fields` (`perma_link`, `text`, `created_time`), `timezone`, `page`. Profiles: `POST /v1/{customer_id}/analytics/profiles` with `reporting_period.in(...)` and `metrics` (e.g. `views`) | Up to 1 year per request, 50 posts per page. Several Instagram profile click metrics were deprecated in January 2025. |
| Linktree Insights | Views, clicks and click rate for the bio link; Pro and Premium add most-clicked links, traffic sources and locations | Free shows the last 28 days, Starter 90, Pro 365, Premium the whole lifetime. CSV export (Premium): Insights → Linktree activity → date range → Download CSV, a ZIP with Activity, Cities, Countries, Devices and Referrers files. |

Meta renamed metrics in 2025: `impressions`, `plays` and `video_views` were replaced by `views` on current API versions. If a request fails with error 100 ("invalid metric"), check the metric list for the API version you are calling instead of guessing. Not every in-app number (skip rate, for example) is exposed by the API. Ask for a screenshot when you need it.

> ToS: official Graph API / Instagram API only (Business or Creator), user-approved actions, no bots or cold DMs, scraping is HIGH risk and never the default.

## Signal weights (what to optimise)

| Signal | Weight | What it tells you |
|---|---|---|
| Sends / shares per reach | Highest for cold reach | The payoff was worth passing to a specific person |
| Watch time, retention, rewatch (Reels) | High | The hook and pacing held |
| Saves | High | Reference value (lists, how-tos) |
| Comments (with author replies) | Medium-high | A real conversation is happening |
| Followers from the post | The growth outcome | The topic was clear and the profile converted |
| Likes | Low | Cheap approval, mostly reach among existing followers |
| Hide, "not interested", unfollow, report | Heavy negative | A mismatch or bait |

Useful ratios:

- share rate = shares ÷ reach
- save rate = saves ÷ reach
- follow rate = follows ÷ reach
- engagement rate = total_interactions ÷ reach

Use reach as the denominator rather than followers when judging posts. Use followers when comparing different accounts.

## Diagnose an underperforming post (stop at the first failure)

1. **Originality cap.** Several recent Reels fell sharply in non-follower reach and the hooks don't explain it. Look for watermarks or reposts in the last 30 days. Fix: post only original work for 30+ days. Nothing in this one Reel will save it.
2. **Hook.** Skip rate well above the baseline, or retention falling off before 3 s. Fix: recut the first 3 s, using `reels-scripting.md`.
3. **Body.** The hook held, but retention drops:

   | Where it drops | Fix |
   |---|---|
   | At 5-10 s | Move the payoff earlier |
   | Flat through the middle | Add a re-hook |
   | Just before the payoff | Cut the build-up |

4. **Topic legibility.** Good reach and watch time but almost no follows. Check that:
   - the first-frame text and caption line 1 name the topic in searchable words
   - the bio matches the topic
   - the post is on-topic for the account
5. **Send signal.** Watch time and saves are fine but shares are below baseline. Look for a generic CTA, or a payoff that isn't useful to one specific person. Fix: a send prompt that names that person (`captions-hashtags-ctas.md`).
6. **Audio.** The Reel plays muted on a second account because licensing failed, often on Business accounts. Fix: recut with Sound Collection or original audio.
7. **Caption SEO.** Low reach across the board even though the hook was fine. Check:
   - keyword in line 1
   - 150-300 characters
   - 3-5 relevant tags
   - the caption and on-screen text use the same words

Give the verdict with numbers, e.g. "the hook failed: skip rate 62% against your baseline of 38%, everything after was fine". Then give **one** concrete next action: recut the opening, rewrite the caption, re-run as a trial, or make a fresh Reel with a payoff aimed at a named person. If every step looks healthy, call it variance or topic fit. Don't change the format because of one outlier.

## Readout worksheet (24 h for a trial, 72 h or more for a public post)

```
POST: [title]  type: [Reel/carousel/image]  published: [date, trial/public]  hours live:
Reach:            Views:          Skip rate:      (baseline: )
Avg watch time:   Retention cliff at:  s
Share rate:       (baseline: )    Save rate:      (baseline: )
Likes/reach:      Comments:       Follows from post:  (baseline: )
Earliest failure: [originality | hook | body | topic | sends | audio | caption | none]
One fix:          ...
Keep:             ...
Next:             [re-trial | recut | fresh post in same format]
```

## Account-level report (weekly or monthly)

1. **Pull the data.** Media from the period (`GET /{ig-user-id}/media?fields=id,caption,media_type,timestamp,permalink`), then insights for each media ID. Store them locally (CSV or SQLite) so you don't spend API calls fetching the same data again.
2. **Table:** one row per post with its format, pillar, hook formula, reach and the ratios above.
3. **Top and bottom 3** by share rate and by follow rate, with what they have in common (format, hook type, length, topic).
4. **Best times:** group posts by weekday and hour, and compare median reach and engagement. Use `online_followers` if it's available. Report a time only if it is backed by 3 or more posts.
5. **Growth:** follower count change, follows minus unfollows, and profile link taps. If the bio link is a Linktree, set its clicks for the same dates beside the taps to see where visitors drop off.
6. **Actions:** 3 or fewer changes for next period, e.g. "more how-I Reels at 11:00 Tue/Thu, retire the listicle hook, add a send prompt to every carousel".

Don't treat as verdicts:

- view counts without reach
- likes alone
- day-one numbers on public Reels (they can keep spreading for days)
- comparisons with other people's accounts without normalising for size

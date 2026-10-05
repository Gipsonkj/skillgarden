# Publishing and insights by API: Graph API, Composio, schedulers

> Distilled from: instagram-automation (sickn33/agentic-awesome-skills, MIT; Composio/Rube MCP workflows), instagram (sickn33/agentic-awesome-skills, MIT; Portuguese docs on endpoints, permissions, rate limits and the approval/audit pattern), instagram-post (publora/skills, MIT), instagram-marketing (sergebulaev/instagram-skills, MIT; Publora media flow), social-publisher (affaan-m/ECC, MIT; SocialClaw). Trial Reels and paid-partnership fields: Meta's Instagram Platform Content Publishing docs (read, restated in our words). Meta Business Suite, Buffer, Metricool, Hootsuite, Sprout Social and Later: their official help centres and developer docs (link-only, restated in our words).

> ToS: official Graph API / Instagram API only (Business or Creator), user-approved actions, no bots or cold DMs, scraping is HIGH risk and never the default.

Endpoint names, versions and metric names change. Treat everything below as the shape of the work, and check Meta's current Instagram Platform docs before writing production code.

## Pick a route

**Pick a tool**

| The user's situation | Use | Why |
|---|---|---|
| Already uses or pays for one of the tools below | That one | Their accounts, slots, teammates and history are already there |
| Not sure which scheduler they log into, or whether the account is Business or Creator | **Ask** before picking | Both decide the route: Hootsuite and Later auto-publish only for Business profiles, Publora needs Business |
| Personal account | Post manually in the app | Personal accounts have no API, so no scheduler can auto-publish for them |
| Wants it free with nothing third-party connected | Meta Business Suite | Meta's own planner, schedules for free; Claude hands over a paste block |
| Creator account that wants posts to go out on their own | Buffer or Metricool | Both auto-publish for Business **and** Creator; Hootsuite sends Creator posts as a phone notification |
| Wants posts dropped into fixed weekly slots | Buffer | Queue-based, `addToQueue` fills the next free slot |
| Wants scheduling, best times and reports in one place | Metricool | Official connector on every plan; Free covers 1 brand and 20 scheduled posts a month |
| Team or agency with sign-off before posting | Hootsuite (Perch) or Sprout Social | Hootsuite's Request approval; Sprout's API makes drafts only, so the user schedules in Sprout |
| Plans by how the grid will look | Later | Visual Planner grid preview; Claude hands over the paste block |
| Developer who wants full control, or Trial Reels and paid-partnership fields by code | Graph API direct | Every field, including `trial_params` and `branded_content_sponsor_ids` |
| Agent in an MCP client, no scheduler yet | Composio (Rube MCP) or Publora | Composio connects Instagram by OAuth and wraps the Graph API; Publora takes an API key and needs a Business account |
| One campaign across several networks from a CLI | SocialClaw | `validate` before `apply` |
| Post needs music, interactive stickers or product tags | The Instagram app | Buffer turns these into a phone notification to finish by hand, and so does Metricool for stickers and audio outside its library |

**All routes**

| Route | Best for | Setup | Notes |
|---|---|---|---|
| Manual (app, Edits, Meta Business Suite) | Personal accounts, low volume, Trial Reels | None | Business Suite schedules natively for free |
| **Instagram Graph API / Instagram API** direct | Developers, full control | A Meta app, OAuth, a Business or Creator account | This file |
| **Composio Instagram toolkit** (Rube MCP) | Agents in MCP clients | Add the MCP server, connect Instagram through OAuth | Tools wrap the Graph API |
| **Publora** (MCP or REST) | Quick agent scheduling | Account, connect IG, API key | Requires a **Business** account. No mixed-media carousels. |
| **SocialClaw** (CLI or API) | Multi-platform campaigns | Workspace key, connect accounts in its dashboard | `validate` before `apply` |
| **Buffer** (GraphQL API or MCP) | A simple queue the user already runs, posting at set slots | API key from Buffer settings, IG connected in Buffer | Auto-publish needs Business or Creator. Below. |
| **Metricool** (Claude connector) | Scheduling plus analytics and best times in one place | Add the official connector, sign in (OAuth) | Free plan: 1 brand, 20 scheduled posts a month. Below. |
| **Hootsuite** (Perch MCP) | Teams and agencies already on Hootsuite, with approvals | Add the Perch connector, sign in to the Hootsuite workspace (OAuth) | Direct publishing for Business profiles only. Below. |
| **Sprout Social** (Public API) | Organisations on a Sprout plan with API access | API token or OAuth client from Sprout's settings | The API creates drafts only; the user schedules them in Sprout. Below. |
| **Later** (no code) | Instagram-first planning with a grid preview | None for Claude; the user works in Later | No connector here, so Claude hands over a paste block. Below. |

Whichever route you use, the agent drafts, the user approves, and then one call publishes. Never let the agent publish on its own initiative.

## Account and login paths

- **API with Instagram Login** (`graph.instagram.com`): a Business or Creator account, no Facebook Page needed. Scopes:
  - `instagram_business_basic`
  - `instagram_business_content_publish`
  - `instagram_business_manage_comments`
  - `instagram_business_manage_messages`
  - `instagram_business_manage_insights`
- **API with Facebook Login** (`graph.facebook.com`): the IG professional account must be linked to a Facebook Page. Scopes:
  - `instagram_basic`
  - `instagram_content_publish`
  - `instagram_manage_comments`
  - `instagram_manage_insights`
  - `instagram_manage_messages`
  - `pages_show_list`
  - `pages_read_engagement`
  - Discovery runs `GET /me/accounts` → `GET /{page-id}?fields=instagram_business_account`.
- **Personal accounts:** no API at all. The account type field returns `PERSONAL`. Guide the user to switch to a professional account.
- **Development vs live mode:** in development mode, only the app's roles and testers can use it. That's enough for a single owner managing their own account. Serving other people's accounts needs App Review for each permission, and messaging is the strictest.
- **Tokens:** long-lived tokens last about 60 days. Refresh before expiry (e.g. when 7 days remain). Keep them in environment variables. Never print them.
- **Request only the scopes you need.** A publish-only tool shouldn't ask for messages.

## Publishing flow (two-phase)

```
0. GET  /{ig-user-id}/content_publishing_limit?fields=quota_usage,config   -> stop if at quota
1. POST /{ig-user-id}/media   (create container)
     image:    image_url=<public https>  caption=...  [alt_text=...]
     reel:     media_type=REELS  video_url=...  caption=...  [share_to_feed, cover_url, thumb_offset]
               [trial_params={"graduation_strategy":"MANUAL"|"SS_PERFORMANCE"}]
     story:    media_type=STORIES  image_url | video_url
     carousel item: is_carousel_item=true  image_url | video_url     (repeat 2-10x)
     carousel:  media_type=CAROUSEL  children=<id1,id2,...>  caption=...
     sponsored post (any type, on the parent for a carousel): [branded_content_sponsor_ids=[<brand-ig-id>, ...]]  [is_paid_partnership=true]
   -> {"id": "<container_id>"}
2. GET  /{container_id}?fields=status_code       poll every 5-10 s until FINISHED (timeout ~5 min)
     IN_PROGRESS | FINISHED | ERROR | EXPIRED
3. POST /{ig-user-id}/media_publish  creation_id=<container_id>   -> {"id": "<ig_media_id>"}
4. GET  /{ig_media_id}?fields=permalink,timestamp                  -> report the permalink
```

Rules:

- **Media must sit at a public HTTPS URL** that Meta can fetch. URLs behind authentication, cookies or a CDN block will fail. Short-lived pre-signed URLs can expire before processing ends.
  - Host the files on the user's own storage.
  - Don't push private media to anonymous public image hosts.
- **Wait for the video container.** Publishing a container that isn't `FINISHED` returns an error. Every carousel child must be finished before you create the parent container.
- **Containers expire** (about 24 h). Recreate them rather than reusing old IDs.
- **Read the publishing limit live.** Sources quote 25 or 50 posts per rolling 24 h; `content_publishing_limit` is the truth. Carousels count as one post. The window rolls rather than resetting at midnight.
- **Scheduling:** don't count on a native schedule parameter for Instagram media. Keep a local queue and publish at the time with a cron or worker, or use a scheduler (Business Suite, Buffer, Metricool, Hootsuite, Sprout Social, Later, Publora, SocialClaw).
- **Caption:** 2,200 characters, at most 30 hashtags, mentions allowed. You can't add clickable links.
- **After publishing:** treat each publish as final. Deleting a post is done in the app, and caption edits through the API may not be available on your version. Proof-read on the approval card.
- **Crash safety:** keep a status per job (draft → approved → container_created → published | failed). On restart, check whether the container is still valid, then publish it or recreate it.
- **Trial Reels by API:** `trial_params` on a Reel container shares it only with non-followers. `MANUAL` means you graduate it to followers yourself in the app; `SS_PERFORMANCE` graduates it automatically if it performs well. Default to `MANUAL`, so nothing reaches followers without the user's say-so, and read the result at 24 h (`analytics.md`).
- **Paid partnerships:** ask whether the post is sponsored. If so, set `branded_content_sponsor_ids` (the brand's Instagram IDs, professional accounts, at most 2); that turns on `is_paid_partnership` and the "Paid partnership" label. Needs the API with Facebook Login and the `instagram_branded_content_creator` or `instagram_basic` permission. Not available for close-friends-only or remixed media. The label shows as pending until the brand approves the creator. Never publish sponsored content without the label; disclosure wording is in `social-media` → `influencer-marketing.md`. If the field is rejected, report the exact error and stop; don't rewrite the user's caption to compensate.

## Media specs (API)

| Type | Spec |
|---|---|
| Image | JPEG (some routes convert PNG or WebP), 8 MB max, ratio from 4:5 to 1.91:1, sRGB, min width 320 px. 1080x1350 recommended. |
| Reel | MP4 or MOV (H.264 video, AAC audio), 9:16, 1080x1920. Keep under ~300 MB. 3 s minimum. 5-90 s is the core Reels-tab range. |
| Story | 9:16 image or video. Video up to 60 s. Gone after 24 h. |
| Carousel | 2-10 items. Images, video or mixed are allowed by the Graph API (Publora rejects mixed). Use one aspect ratio. Videos up to 60 s each. |

## Composio (Rube MCP) tool map

Always call `RUBE_SEARCH_TOOLS` first: tool schemas change. Then connect with `RUBE_MANAGE_CONNECTIONS` (toolkit `instagram`) until the connection shows ACTIVE.

| Task | Tool |
|---|---|
| Get the IG user id | `INSTAGRAM_GET_USER_INFO` |
| Create a container | `INSTAGRAM_CREATE_MEDIA_CONTAINER` (image_url / video_url, caption) |
| Create a carousel | `INSTAGRAM_CREATE_CAROUSEL_CONTAINER` (children) |
| Check container status | `INSTAGRAM_GET_POST_STATUS` |
| Publish | `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH` or `INSTAGRAM_CREATE_POST` (creation_id) |
| Check the limit | `INSTAGRAM_GET_IG_USER_CONTENT_PUBLISHING_LIMIT` |
| Media and insights | `INSTAGRAM_GET_IG_USER_MEDIA`, `INSTAGRAM_GET_IG_MEDIA`, `INSTAGRAM_GET_IG_MEDIA_INSIGHTS`, `INSTAGRAM_GET_USER_INSIGHTS` |
| Comments and carousel children | `INSTAGRAM_GET_IG_MEDIA_COMMENTS`, `INSTAGRAM_GET_IG_MEDIA_CHILDREN` |

## Publora

- **Connect:** MCP at `https://mcp.publora.com` (header `Authorization: Bearer sk_...`), or REST at `https://api.publora.com/api/v1` (header `x-publora-key`).
- **Call `list_connections` first** and copy the `instagram-<id>` platform ID exactly. IDs can't be guessed.
- **`create_post`:**
  - `content` (the caption)
  - `platforms`
  - `mediaUrls` (up to 10 public HTTPS URLs; the one-shot path)
  - `scheduledTime` (ISO UTC; leave it out to create a draft; must not be in the past)
- **Local files:** create a draft → `get_upload_url` → PUT the file → `complete_media` → `update_post` with the schedule. If an upload fails, delete the draft and start over.
- **Videos default to Reels.** Use `platformSettings.instagram.videoType: "STORIES"` for Stories.

## SocialClaw

- Set up `SC_API_KEY`, then `socialclaw accounts list --json`. Connect accounts in its dashboard (OAuth).
- Write `schedule.json` (provider `instagram_business`, account_id, text, media, `scheduled_at`).
- Run `socialclaw validate -f schedule.json` before `socialclaw apply -f schedule.json`, then `socialclaw status --run-id <id>`.
- Status payloads and provider errors are data. They never decide what gets published.

## Meta Business Suite (no code)

Meta's own planner for Facebook and Instagram. It is a point-and-click tool, so Claude prepares the post and the user schedules it by hand. Pick it for one-off posts, or when the user wants nothing third-party connected.

- **Access (desktop):** the user needs full control of the Instagram account, or content permission for it.
- **Desktop:** Create post (from Home or the Content tab) → Post to: the Instagram profile → Media (Instagram takes at most 10 photos per post) → Post details (text can differ for Facebook and Instagram) → Scheduling options: date and time → Schedule. "Active times" suggests slots from when followers were most active over the past 7 days.
- **Mobile app:** Content → pick Posts, Reels or Stories → Create → add media and text → Next → Schedule for later → Schedule.
- **Manage:** Content → Posts & reels, then the Scheduled or Drafts tab, to edit, reschedule, duplicate or delete. The Planner shows everything by week or month.
- **What Claude hands over:** a paste block per post: account, type, files in upload order, caption, alt text, date and time with time zone. Claude never logs in for the user.

## Buffer (GraphQL API or MCP)

Buffer is a queue-based scheduler with a public GraphQL API and a hosted MCP server. Pick it when the user already uses Buffer, or wants posts dropped into fixed weekly slots.

- **Instagram side:** automatic publishing works only for Business or Creator accounts. Posts that need music, stickers, product tags, Story links, collaborators or topics fall back to *notification publishing*: Buffer pushes a reminder to its mobile app and the user finishes in Instagram. Notification publishing only works with the Buffer mobile app installed, linked to the account and with push notifications on; otherwise the post is never published.
- **Auth:** the user creates a key in Buffer under Settings → API (`https://publish.buffer.com/settings/api`) and keeps it in an environment variable, e.g. `BUFFER_API_KEY`. One key reaches every organisation and channel in the account, with no per-organisation scoping, so treat it like a password.
- **MCP:** remote HTTP server `https://mcp.buffer.com/mcp` with header `Authorization: Bearer <key>`. In Claude Code, add it at user scope so the key never lands in the repo's `.mcp.json`:
  ```bash
  claude mcp add --scope user --transport http buffer https://mcp.buffer.com/mcp \
    --header "Authorization: Bearer $BUFFER_API_KEY"
  ```
  Tools include `list_channels`, `create_post`, `edit_post`, `list_posts`, `get_post`, `get_aggregated_post_metrics`, and `execute_query` / `execute_mutation` for anything else. `delete_post` exists; use it only when the user names the post to delete.
- **API:** one endpoint, `POST https://api.buffer.com`, header `Authorization: Bearer $BUFFER_API_KEY`, body `{"query": "..."}`.
  1. `account { organizations { id name } }` → the organisation ID.
  2. `channels(input: { organizationId: "..." }) { id name service }` → the Instagram channel ID.
  3. `createPost` with `channelId`, `text`, `schedulingType: automatic` (or `notification` for a reminder), `mode` (`addToQueue` for the next free slot, `customScheduled` plus `dueAt` in ISO 8601 UTC for an exact time, `shareNow`), `assets` and `metadata.instagram`.
- **Instagram fields** (`metadata.instagram`): `type` (`post`, `story` or `reel`, required), `shouldShareToFeed` (required; for Reels it can't be changed after publishing), `firstComment` (auto-published posts and Reels only), `isAiGenerated`, `geolocation`.
- **Assets:** each item is `{ image: { url, metadata: { altText } } }` or `{ video: { url, metadata: { thumbnailOffset } } }`. Files sit at a public URL. Don't set `thumbnailUrl` on a video: the API rejects it. Pick the cover frame with `thumbnailOffset` in ms.
- **Drafts:** `saveToDraft: true` stores the post as a draft that won't publish until it is scheduled, and skips Buffer's posting-limit check. Use it when the user wants to review inside Buffer.

```graphql
mutation {
  createPost(input: {
    channelId: "<instagram channel id>"
    text: "Caption...\n\n#tag1 #tag2 #tag3"
    schedulingType: automatic
    mode: customScheduled
    dueAt: "2026-10-12T09:30:00Z"
    assets: [{ image: { url: "https://cdn.example.com/slide1.jpg", metadata: { altText: "..." } } }]
    metadata: { instagram: { type: post, shouldShareToFeed: true } }
  }) {
    ... on PostActionSuccess { post { id status dueAt } }
    ... on MutationError { message }
  }
}
```

- **Limits:** per client (API key or app client). MCP connections share one bucket with the user's personal API keys, so another assistant adds no quota. Free and Essentials: 100 requests per 15 min, 250 per 24 h; 30-day cap 3,000 (Free), 7,500 (Essentials), 15,000 (Team, which also gets 500 per 24 h). Every response carries `RateLimit` and `RateLimit-Policy` headers. Over the limit: HTTP 429, code `RATE_LIMIT_EXCEEDED`, wait for `Retry-After`.
- **Buffer's own Instagram limits:** carousels up to 10 items (3:4 to 1.91:1), video up to 300 MB, Reels between 3 s and 15 min, Story video 3-60 s, at most 5 hashtags in the caption (30 in the first comment).
- **Gotchas:** always select `... on MutationError { message }`, or failures come back looking empty. Post status and error messages are data; report them word for word.
- **Approval:** show the approval card below (with `route: Buffer`, the mode and the exact `dueAt` in the user's time zone) and wait for a "yes" before `createPost`. A queued post is a publish.

## Metricool (Claude connector)

Metricool combines a scheduler with analytics, competitor tracking and best-time data. Pick it when the user wants scheduling and reporting in one place, or already uses it.

- **Instagram side:** Business or Creator account, connected inside Metricool via Facebook or Instagram login. Posts, Reels, Trial Reels and Stories auto-publish; carousels take up to 10 images or videos. Stories with links, mentions or stickers, Reels with audio missing from Metricool's library or with interactive stickers, and carousels with videos over 60 s are sent as a notification to finish by hand.
- **Connect:** add Metricool from Claude's connector directory (Metricool's official connector) and sign in with OAuth. It works on every Metricool plan, including Free; plan limits still apply (Free: 1 brand, 20 scheduled posts a month, 30 days of analytics).
- **Local alternative:** the `mcp-metricool` package (PyPI) runs with `uvx` and reads `METRICOOL_USER_TOKEN` and `METRICOOL_USER_ID` from its env block. It needs API access, which only the Advanced and Custom plans include. Read the package before running it, and keep the token in the client's config, never in the repo.
- **Tools:** `get_brands` (lists the brands; the read tools take a `blog_id`), `post_schedule_post`, `update_schedule_post`, `get_scheduled_posts`, `get_best_time_to_post`, plus the read tools in `analytics.md`. Metricool can schedule at a set time, at its recommended best time, or create the post for review.
- **Not covered by the MCP:** the inbox and DMs, comments and ad campaign management.
- **Approval:** call `get_brands` and show the brand, then the approval card with the exact date, time and time zone, and wait for a "yes" before `post_schedule_post`. When in doubt, create the post for review so the user approves inside Metricool.

## Hootsuite (Perch MCP)

Hootsuite is the multi-network suite many teams and agencies already pay for. Its official MCP servers let Claude work inside the user's workspace with the team's own permissions and approval steps. Pick it whenever the user says they run Hootsuite.

- **Servers:** Perch `https://mcp.hootsuite.com/perch` drafts posts, schedules them (including at the best time), uses the content library and reviews performance. Nest `https://mcp.hootsuite.com/nest` is the inbox (`dms-and-comments.md`). Each needs an active Hootsuite account with access to that product.
- **Connect in Claude (desktop or web):** Settings → Connectors → Add → Add custom connector → a name and the Perch URL → under Authentication pick **Sign in now**, OAuth client **Register automatically** → Add, then sign in to the Hootsuite workspace. No key to copy, and never the Instagram password.
- **Connect in Claude Code:** add it at user scope, then sign in in the browser:
  ```bash
  claude mcp add --scope user --transport http hootsuite-perch https://mcp.hootsuite.com/perch
  claude mcp login hootsuite-perch      # or run /mcp inside Claude Code
  ```
- **Tool names:** Hootsuite's pages don't list them. List the connector's tools first and use the names it reports; don't guess.
- **Instagram side:** direct publishing (Post now or Schedule for later) works only for Instagram **Business** profiles. **Creator** profiles, and Stories with more than one image or video, go through the *mobile notification* workflow: at the set time the user finishes the post in the Instagram app. Tell the user this before scheduling a Creator account.
- **Instagram limits in Hootsuite:** up to 10 images per post, a single video publishes as a Reel (shared to the Reels tab and the feed), captions up to 2,200 characters, 30 hashtags shared between the caption and the first comment, up to 3 collaborators. Direct publishing counts toward Instagram's limit for third-party tools (Hootsuite's help puts it at 25 posts or Reels per rolling 24 h); notification posts don't count.
- **Approvals:** Hootsuite's **Request approval** (Advanced plans and up) sends a post to a teammate before it goes live. If the workspace uses it, create the posts as drafts or approval requests rather than scheduled posts.
- **REST API (developers only):** needs a Hootsuite App Directory app. Tokens come from `https://platform.hootsuite.com/oauth2/token` and last about an hour. Schedule with `POST https://platform.hootsuite.com/v1/messages` (`text`, `socialProfileIds`, `scheduledSendTime` in UTC ISO 8601 ending in `Z`, at least 5 minutes ahead; video at least 15 minutes). Media: `POST /v1/media` with `sizeBytes` and `mimeType` returns an `uploadUrl` (valid about 10 minutes) that takes a PUT with a matching `Content-Type` and exact `Content-Length`; mp4, mov, gif, jpeg and png. Custom video thumbnails aren't supported. For an agent, the MCP is simpler.

A week of posts through Perch:

1. Confirm the Instagram profile and its type (Business = direct; Creator = notification) and the time zone.
2. Check every asset against the specs above (Reels 9:16 1080x1920 with text in the safe zone, carousels 2-10 items at 4:5, caption length, 3-5 hashtags, alt text). Flag failures; don't upload them.
3. Ask Perch for the best times for this account. If it has no data, say so and offer defaults labelled as guesses.
4. Create each item as a draft (or an approval request), then show one approval card per post and wait for a "yes" on each before scheduling.
5. Report each post's ID or link in Hootsuite and how to edit or cancel it there. Report errors word for word.

## Sprout Social (Public API)

Sprout is the enterprise and agency suite. Its Public API is on plans that enable API access and **creates drafts only** (`"is_draft": true` is required), which fits this skill: Claude prepares, the user schedules or publishes in Sprout. Sprout's own AI connection is built and documented for ChatGPT only, not Claude, so use the API; don't install community MCP servers that ask for the token.

- **Auth:** an API token (Settings → Global Features → API → API Token Management; shown once) or an OAuth 2.0 client-credentials app (same page, OAuth Client Management). Keep the token in an environment variable such as `SPROUT_API_TOKEN`; header `Authorization: Bearer $SPROUT_API_TOKEN`.
- **Base URL** `https://api.sproutsocial.com`. Find the IDs first:
  1. `GET /v1/metadata/client` → `customer_id`.
  2. `GET /v1/{customer_id}/metadata/customer` → profiles with `customer_profile_id`, `network_type`, `native_id`; pick the Instagram one.
  3. `GET /v1/{customer_id}/metadata/customer/groups` → `group_id` (every profile in a post must sit in that group).
- **Media:** `POST /v1/{customer_id}/media/` as form data, `media` (the file) or `media_url`, up to 50 MB; larger files use `/media/submission` with 5 MB parts. The response has `media_id` and an `expiration_time`, so create the post before the media expires.
- **Draft post:** `POST /v1/{customer_id}/publishing/posts` with `group_id`, `customer_profile_ids`, `is_draft: true`, `text`, `media` (`media_id` + `media_type` PHOTO or VIDEO) and, for a proposed time, `delivery: {"type": "SCHEDULED", "scheduled_times": ["2026-10-12T09:30:00Z"]}`. The response's `perma_link` opens the draft in Sprout's publishing calendar; give it to the user.
- **Instagram gotchas:** Stories and Instagram Mobile Publisher posts can't be created by API; they arrive as normal media posts for the user to change in Sprout. In a multi-profile request, media a profile can't take is dropped without an error, so compare the response's `media` with what you sent.
- **Limits:** 60 requests a minute and 250,000 a month; HTTP 429 means wait. HTTP 202 means the answer isn't ready yet; retry shortly.

```bash
curl -s -X POST "https://api.sproutsocial.com/v1/$CUSTOMER_ID/publishing/posts" \
  -H "Authorization: Bearer $SPROUT_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"group_id": 55667788, "customer_profile_ids": [2345], "is_draft": true,
       "text": "Caption...\n\n#tag1 #tag2 #tag3",
       "media": [{"media_id": "<from upload>", "media_type": "PHOTO"}],
       "delivery": {"type": "SCHEDULED", "scheduled_times": ["2026-10-12T09:30:00Z"]}}'
```

Even as a draft, show the approval card before the call; the user's "yes" in Sprout is what publishes it.

## Later (no code)

Later is the Instagram-first planner: a media library, a calendar and a **Visual Planner** grid preview, with best-time suggestions and first comments. There is no connector for it here, so Claude prepares and the user schedules. Pick it when the user plans by how the grid will look, or already uses Later.

- **Auto publishing** needs an Instagram Business profile connected to Later and covers single photos, carousels and Reels. Stories go out by **notification publishing**: a phone reminder at the set time, and the user posts in Instagram.
- **Reel steps:** Add Social Profile → Instagram → upload the video to the Media Library → Post Type: **Reels** → caption and hashtags → crop or trim and pick a cover frame → date and time → schedule.
- **What Claude hands over:** per post, the file names in order, the post type, caption, first comment, alt text, cover frame (in seconds) and the date and time with time zone, plus a 9-tile grid order if the user plans the feed.

## Errors

| Code | Meaning | Action |
|---|---|---|
| 4 / 17 / 32, HTTP 429 | App, user or page rate limit | Back off (respect `Retry-After` or the usage headers, up to 1 h). Never loop. |
| "limit reached" on publish | Publishing quota used up | Check `content_publishing_limit` and wait for the window to roll |
| 10 / 200 | Missing permission | Check scopes and App Review |
| 100 | Invalid parameter or metric | Check the field names for your API version |
| 190 | Token expired or invalid | Refresh the token, or ask the user to re-authorise |
| 2207xxx | Media problem (format, size, URL can't be fetched, container not ready) | Fix the file or URL. Poll status. |
| 368 | Blocked for policy | Stop. Review the content against Community Guidelines. |

Retry transient errors with exponential backoff (2 s, 4 s, 8 s, then give up and report). Fail immediately on 190, 10 and 200.

## Approval card (show before every publish)

```
PUBLISH TO INSTAGRAM?  account: @handle (Business)   route: Graph API
type: carousel (7 slides, 1080x1350)   media: slide1.jpg ... slide7.jpg
caption (first 125): "..."
hashtags: #a #b #c #d    alt text: yes
trial: no | yes (MANUAL graduation)   partnership: none | @brand (pending until the brand approves)
when: now | 2026-10-05 11:30 Europe/Berlin
quota: 3/50 used in last 24h
Reply "publish" to go, or tell me what to change.
```

Log every action: time, action, parameters, result and approver.

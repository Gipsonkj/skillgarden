# Publishing via the official API and schedulers (vendor file)

> Distilled from: linkedin-automation (sickn33/agentic-awesome-skills, MIT): Composio / Rube MCP workflows; linkedin-post (publora/skills, MIT): API-partner scheduler, limits and restrictions; linkedin-marketing (sergebulaev/linkedin-skills, MIT): draft, approve, publish pattern, URN types, thread quirks; linkedin-skills policy (alirezarezvani/claude-skills, MIT). LinkedIn API details are summarised from LinkedIn's developer documentation; the native scheduler from LinkedIn Help; Buffer and Hootsuite from their developer docs (October 2026), in our own words. **Endpoints, versions and scopes change: check the current docs before building.**

ToS reminder: publish **only** through LinkedIn's official API with OAuth, LinkedIn's native scheduler, or a tool that uses that API. Never with passwords, session cookies (`li_at`), browser automation or extensions. Only publish the user's own approved content, after an explicit yes, every time ([tos-and-safe-automation.md](tos-and-safe-automation.md)).

## Choose a route

### Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| Already uses or pays for a scheduler (Buffer, Hootsuite, Publora or another) | That one | Their channels, approvals and history are already there. If you don't know which they log into, ask; don't guess |
| One post, no scheduler account, no budget | Manual paste, or [LinkedIn's own scheduler](#linkedins-own-scheduler) | Free and first-party. Claude hands over the text; the user schedules it in the composer |
| A free scheduler Claude can drive, a few channels | [Buffer](#buffer) (Free plan) | MCP server and GraphQL API on every plan, including Free |
| A team with sign-offs, already on Hootsuite | [Hootsuite](#hootsuite) (Perch MCP) | Claude only saves drafts; a person publishes from Hootsuite, so the team's approval flow stays intact |
| A developer wants their own code, or a company page document post with no vendor | [LinkedIn Posts API](#linkedin-posts-api-essentials) | Full control. Company pages need `w_organization_social` (approval needed) |
| An agent workflow with no scheduler account | [Composio](#composio--rube-mcp-pattern) | Managed OAuth to the official API; good for single text and image posts |
| An API scheduler built around LinkedIn's post types | [Publora](#api-partner-scheduler-pattern-publora-example) | Official skills for text, image grid, video and PDF posts |

| Route | Setup | Good for | Notes |
|---|---|---|---|
| Manual paste (default) | None | Everything | The draft arrives in a code block. The user pastes it, adds the first comment, and posts |
| LinkedIn native scheduler | None | Your own posts, page posts | In the post composer, use the clock icon. Details below |
| LinkedIn Posts API, your own app | LinkedIn developer app plus OAuth | Developers who want full control | Scope `w_member_social` (the "Share on LinkedIn" product, self-serve). Company pages need `w_organization_social` through the Community Management API (needs approval) |
| Composio official-API connector (e.g. via Rube MCP) | Connect LinkedIn by OAuth in Composio | Agent workflows posting text and images | Call the search-tools step first for current schemas. Use it for **posts**; don't use its comment tool to auto-comment |
| API-partner scheduler (Buffer, Hootsuite, Publora) | Vendor account plus OAuth connection to LinkedIn | Scheduling a content calendar | Check that the vendor connects through LinkedIn OAuth and the official API. Avoid any vendor that asks for your LinkedIn password or a browser extension |

Avoid: tools whose LinkedIn features rely on a browser extension, a cookie or "cloud browser" sessions. Many "schedulers" bundled with auto-DM features fall into this group. Treat them as HIGH risk.

## The approval gate (all routes)

1. Show the final text, media, visibility (PUBLIC or CONNECTIONS), the target account (person or page) and the scheduled time.
2. Wait for an explicit "yes / post / schedule". Approval for one post doesn't carry over to the next.
3. Publish or schedule, then report the returned post URN or ID and the scheduled time.
4. Post the link as the first comment **by hand**, or only if the user explicitly approves that specific comment. Never auto-reply to or auto-like other people's content.
5. Log the date, first line and URN for [analytics.md](analytics.md).

Never call a "publish now" endpoint without confirmation, because it can't be undone. Deleting a post is permanent, so confirm first.

## LinkedIn's own scheduler

Free, first-party, and no API: Claude prepares everything and the user clicks. Pick it when the user has no scheduler or only needs a few posts a week.

| | Your own profile | A company page |
|---|---|---|
| Who | Any member | Super admins and content admins of the page |
| Where | Home, **Start a post**, write, then the **clock icon** (lower right on desktop, upper right on mobile) | Page admin view, **Page posts**, **Start a post**, then the schedule icon |
| Window | 10 minutes to 3 months ahead | 1 hour to 3 months ahead |
| Can't be scheduled | Events, jobs, services | Events, multiple photos, reshares, polls, jobs, services |

- The date picker offers 30-minute slots, but an exact time can be typed in. Profile times are stored in UTC from the device's time zone, so confirm the user's zone before naming a time.
- Scheduled profile posts: clock icon, **View all scheduled posts**; the More menu has **Modify schedule** and **Edit post**.
- A scheduled page post can't be picked for sponsoring in Campaign Manager until it has gone live.

Hand-over from Claude: the final text in a code block with its character count, the media file names, the account (person or page), the date, time and time zone, and the first comment to post by hand once it's live.

## LinkedIn Posts API essentials

- OAuth 2.0 3-legged flow. Access tokens last about 60 days. Store them as secrets and never print them.
- Headers: `Authorization: Bearer <token>`, `LinkedIn-Version: <YYYYMM>`, `X-Restli-Protocol-Version: 2.0.0`.
- Author URN: `urn:li:person:<id>` (from the OpenID `userinfo` / `/v2/me` endpoint) or `urn:li:organization:<id>`.
- Create a text post: `POST https://api.linkedin.com/rest/posts`

```json
{
  "author": "urn:li:person:XXXX",
  "commentary": "Post text (plain text, up to 3,000 characters)",
  "visibility": "PUBLIC",
  "distribution": {"feedDistribution": "MAIN_FEED", "targetEntities": [], "thirdPartyDistributionChannels": []},
  "lifecycleState": "PUBLISHED",
  "isReshareDisabledByAuthor": false
}
```

- Images: `POST /rest/images?action=initializeUpload`, `PUT` the binary to the returned upload URL, then reference the image URN in `content.media`.
- Documents (PDF carousels): `/rest/documents?action=initializeUpload`, then use it the same way. Videos use `/rest/videos` (multi-part upload).
- Mentions in `commentary` use URN syntax, and the display name must match exactly. Reserved characters in `commentary` (`( ) [ ] { } < > @ # | ~ _ * \`) must be backslash-escaped.
- Not supported: rich text or bold, organic swipeable image carousels (use a PDF), mixing images with video or documents in one post.
- Rate limits: daily per member and per app. On HTTP 429, back off and respect `Retry-After`. Don't loop.
- The native API has no "schedule" field for member posts. Scheduling means your own job runner or a scheduler vendor. Keep the approval gate before the job is queued.

## Composio / Rube MCP pattern

1. Confirm the search-tools step responds. Connect the `linkedin` toolkit and complete OAuth. Check the status is ACTIVE.
2. `LINKEDIN_GET_MY_INFO` gets the author URN (it returns only the authenticated user and can't look up others).
3. Optional: `LINKEDIN_REGISTER_IMAGE_UPLOAD`, upload the binary, then `LINKEDIN_GET_IMAGES` to check.
4. `LINKEDIN_CREATE_LINKED_IN_POST` with `text` and an explicit `visibility`.
5. Company page: needs the numeric organisation ID and an admin role.
6. The connector also offers comment and delete tools. Use comments only for a single comment the user wrote and approved (for example their own first-comment link), never in bulk or unattended. Delete only on explicit request.

Common errors: 401 means the token expired, so re-authorise. A wrong URN form means always pass the full `urn:li:...`. Image not ready means wait and check.

## API-partner scheduler pattern (Publora example)

- The user creates the account and connects LinkedIn by OAuth in the vendor dashboard. The agent gets an API key or MCP connection the user set up. Never ask for LinkedIn credentials.
- `list_connections` gives the platform ID (copy it exactly). `create_post` takes `platforms`, `content` and an optional `scheduledTime` in ISO UTC (leave it out to create a draft). Media goes in through `mediaUrls` or the upload-URL flow.
- Limits: 3,000 characters; images up to 10 (grid); video MP4 up to 500 MB / 30 min; one media type per post.
- Keep a draft-first default: create the draft, show it, schedule only on a yes.

## Buffer

A scheduler with a free plan, an MCP server and a GraphQL API. Pick it for a solo creator or small team that wants Claude to fill the queue.

- **Access:** MCP server `https://mcp.buffer.com/mcp`, or GraphQL at `https://api.buffer.com` (POST, JSON body `{"query": ...}`).
- **Auth:** the user creates an API key in Buffer under Settings, then API, and sends it as `Authorization: Bearer <key>`. The key reaches every organisation and channel in the account. Keep it in an environment variable, never in chat or the repo. In Claude Code: `claude mcp add --transport http buffer https://mcp.buffer.com/mcp --header "Authorization: Bearer $BUFFER_API_KEY"` (the client then stores the key in its config file, so keep that file out of git).
- **Plans:** Free gives 3 channels, 10 scheduled posts per channel, 1 API key and no first-comment scheduling. Essentials ($5) and Team ($10) are per channel per month with unlimited scheduled posts; Team adds approval workflows.
- **Rate limits** (shared by MCP and API): every plan 100 requests per 15 minutes; 250 a day on Free and Essentials, 500 on Team; 3,000 / 7,500 / 15,000 per 30 days. On 429, wait the `Retry-After` seconds; a 429 doesn't use quota.

MCP tools that matter: `get_account` (organisations, time zone, current local time), `list_channels` (needs `organizationId`), `create_post`, `edit_post`, `list_posts`, `delete_post`, `get_aggregated_post_metrics`.

`create_post` fields: `channelId`, `schedulingType` (`automatic` publishes for you, `notification` sends a reminder to post by hand), `mode` (`addToQueue` default, `shareNow`, `shareNext`, `customScheduled` with `dueAt`), `text`, `assets`, `metadata`, `saveToDraft`. For LinkedIn, `metadata.linkedin.firstComment` holds the link comment and an asset may be a `document` (PDF) with `url`, `title` and `thumbnailUrl`.

```graphql
mutation {
  createPost(input: {
    channelId: "<LinkedIn channel id from list_channels>",
    text: "<approved post text>",
    schedulingType: automatic,
    mode: customScheduled,
    dueAt: "2026-10-13T08:30:00+05:30",
    assets: [{ document: { url: "https://<public host>/guide.pdf", title: "<deck title>", thumbnailUrl: "https://<public host>/cover.png" } }],
    metadata: { linkedin: { firstComment: "Full write-up: https://<link>" } }
  }) {
    ... on PostActionSuccess { post { id status dueAt } }
    ... on MutationError { message }
  }
}
```

Gotchas:
- **There's no upload endpoint.** Media must sit at a public, permanent URL that stays reachable until the post goes out. Signed or expiring links (S3 pre-signed, Drive or Dropbox share links) fail when Buffer fetches them later. Test the URL in a private window first.
- `linkAttachment` and a non-empty `assets` list can't be sent together.
- LinkedIn limits in Buffer: 3,000 characters for the post, 1,250 for the first comment, counted in UTF-16 units, so emoji and Unicode pseudo-bold count double.
- `shareNow` and `create_post` can publish at once, and `delete_post` can't be undone. Show the exact post, channel and time and wait for a yes before each write; `saveToDraft: true` is the safe default while the user is still deciding.
- `edit_post` keeps any field you leave out, but replaces `assets` and a `metadata` object wholesale, and sending `mode` reschedules the post.

## Hootsuite

The team scheduler. Pick it when the user's organisation already plans and approves posts in Hootsuite.

**Perch MCP (`https://mcp.hootsuite.com/perch`)**: add it as a remote connector and sign in with the Hootsuite workspace (OAuth, one time). It needs an active Hootsuite account with access to the product.

- **It saves drafts and never publishes.** `create_draft` with a `scheduledDate` (ISO-8601) puts a grey draft on the Planner calendar; a person still has to publish it in Hootsuite. Tell the user that final step is theirs.
- Call chain: `get_entitled_workspaces`, then `get_social_profiles(workspaceScope)` (LinkedIn pages show `networkType` `LINKEDIN_COMPANY`), optionally `get_recommended_times`, then `create_draft(workspaceScope, socialProfiles, text, mediaAttachments?, scheduledDate?)`.
- Copy `workspaceScope` and profile objects exactly as returned. If several workspaces come back, let the user choose.
- `update_draft` overwrites the whole draft: read it first and resend every field.
- Media: `request_media_upload` (PNG, JPEG, GIF, MP4 or QuickTime, up to 1 GB), PUT the bytes to the `uploadUrl`, then `poll_media_upload` every 3 seconds, up to 20 times. PDFs aren't on that list, so a document post is finished in Hootsuite by hand or sent another way.

**REST API (developers)**: OAuth 2.0 bearer token against `https://platform.hootsuite.com`. `GET /v1/socialProfiles` gives the profile `id`; `POST /v1/messages` with `text`, `socialProfileIds` and `scheduledSendTime` (UTC, ISO-8601 ending in `Z`, at least 5 minutes ahead) creates a **real scheduled message** that will publish. Limits: 20 requests a second and 100,000 a day; 429 means back off until the window ends. Because this one publishes on its own, the approval gate above applies in full.

## Post URN types (when the user gives a post URL)

| URL fragment | URN |
|---|---|
| `/posts/...-activity-7448...` | `urn:li:activity:7448...` |
| `/posts/...-share-7449...` | `urn:li:share:7449...` |
| `/feed/update/urn:li:ugcPost:7447...` | `urn:li:ugcPost:7447...` |

Use the URL only to identify the user's own post (for analytics or editing). Don't fetch other people's posts with scrapers.

## Pitfalls

- Treating approval of a draft as approval to publish.
- Scheduling more than one post a day, or several for the same minute across team accounts (cannibalisation, and it looks coordinated).
- Editing heavily within the first hours after publishing (🟡 can reset distribution).
- Storing tokens in the repo. Use `.env` or a secret store, and keep it out of git.

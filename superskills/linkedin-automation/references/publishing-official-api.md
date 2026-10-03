# Publishing via the official API and schedulers (vendor file)

> Distilled from: linkedin-automation (sickn33/agentic-awesome-skills, MIT): Composio / Rube MCP workflows; linkedin-post (publora/skills, MIT): API-partner scheduler, limits and restrictions; linkedin-marketing (sergebulaev/linkedin-skills, MIT): draft, approve, publish pattern, URN types, thread quirks; linkedin-skills policy (alirezarezvani/claude-skills, MIT). LinkedIn API details are summarised from LinkedIn's developer documentation. **Endpoints, versions and scopes change: check the current docs before building.**

ToS reminder: publish **only** through LinkedIn's official API with OAuth, LinkedIn's native scheduler, or a tool that uses that API. Never with passwords, session cookies (`li_at`), browser automation or extensions. Only publish the user's own approved content, after an explicit yes, every time ([tos-and-safe-automation.md](tos-and-safe-automation.md)).

## Choose a route

| Route | Setup | Good for | Notes |
|---|---|---|---|
| Manual paste (default) | None | Everything | The draft arrives in a code block. The user pastes it, adds the first comment, and posts |
| LinkedIn native scheduler | None | Your own posts, page posts | In the post composer, use the clock icon |
| LinkedIn Posts API, your own app | LinkedIn developer app plus OAuth | Developers who want full control | Scope `w_member_social` (the "Share on LinkedIn" product, self-serve). Company pages need `w_organization_social` through the Community Management API (needs approval) |
| Composio official-API connector (e.g. via Rube MCP) | Connect LinkedIn by OAuth in Composio | Agent workflows posting text and images | Call the search-tools step first for current schemas. Use it for **posts**; don't use its comment tool to auto-comment |
| API-partner scheduler (e.g. Publora; others such as Buffer or Hootsuite) | Vendor account plus OAuth connection to LinkedIn | Scheduling a content calendar | Check that the vendor connects through LinkedIn OAuth and the official API. Avoid any vendor that asks for your LinkedIn password or a browser extension |

Avoid: tools whose LinkedIn features rely on a browser extension, a cookie or "cloud browser" sessions. Many "schedulers" bundled with auto-DM features fall into this group. Treat them as HIGH risk.

## The approval gate (all routes)

1. Show the final text, media, visibility (PUBLIC or CONNECTIONS), the target account (person or page) and the scheduled time.
2. Wait for an explicit "yes / post / schedule". Approval for one post doesn't carry over to the next.
3. Publish or schedule, then report the returned post URN or ID and the scheduled time.
4. Post the link as the first comment **by hand**, or only if the user explicitly approves that specific comment. Never auto-reply to or auto-like other people's content.
5. Log the date, first line and URN for [analytics.md](analytics.md).

Never call a "publish now" endpoint without confirmation, because it can't be undone. Deleting a post is permanent, so confirm first.

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
- Mentions in `commentary` use URN syntax, and the display name must match exactly. Reserved characters in `commentary` (`( ) [ ] { } < > @ | ~ _ *`) must be backslash-escaped.
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

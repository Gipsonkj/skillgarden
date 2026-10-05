# Site builders and CMS: WordPress, Wix, Webflow, Squarespace

When the site lives on a hosted builder or CMS, build inside that platform: the owner keeps editing it there after you leave, so a code export they cannot edit is a worse result even if it is faster. The brief, copy and design direction from the other guides still apply; only the build and publish steps change. Facts below were checked against each vendor's docs in October 2026; these platforms change often, so confirm a limit before relying on it.

## 1. Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| They already have a site on (or pay for) one of these | **That platform** | Never migrate as a side effect of a page request. Ask which one they log into if it isn't clear |
| Owner wants to edit pages and posts themselves, needs plugins, or wants to self-host | **WordPress** (REST API, WP-CLI, MCP adapter) | Every part is scriptable: REST, CLI and MCP |
| Small business that wants blog, bookings, forms or store managed in one dashboard | **Wix** (remote MCP) | Its MCP can create, update and publish sites and call site APIs |
| Designer-led marketing site with a CMS and fine layout control | **Webflow** (MCP + Data API) | Designer and CMS both reachable from Claude |
| Designer-led site already built in Framer | **Framer** (its own agent connection, framer.com/agents/external) | Agent changes land on a branch; no HTML export (`design-direction.md`) |
| Template site the owner edits by hand | **Squarespace** (manual workflow + code injection) | No page-editing API: Claude writes copy, CSS and a click list |
| Developer-owned site nobody edits in a dashboard, or no builder account | **Code stack** (`stacks-astro-vue-static.md`) and a deploy guide | No platform account or plan needed to build |
| An online store (products, checkout) | `ecommerce` craft | Platform choice and store build live there |
| Not sure which builder, which plan, or who owns the account | **Ask** | Plan tier decides what is possible (code injection, API, rate limits) |

## 2. Rules for every builder

- **Publishing is public.** Before any publish, delete, bulk CMS change or app install, show the exact list (pages, items, domains) and wait for a yes. Prefer drafts and staged items; publish once, at the end.
- **Credentials.** Use the vendor's OAuth through the MCP connector (`/mcp` in Claude Code opens the browser login). When a key is unavoidable (automation, REST), the user creates it with the narrowest scopes and puts it in an environment variable or the client's MCP config; never in chat, a committed file or client-side code.
- **Back up before bulk edits** (WordPress: `wp db export`; others: export or duplicate the site or collection first when the platform offers it).
- **Verify on the published preview or staging URL** at 390 / 768 / 1440 like any other site (`quality-audit-and-testing.md`).

## 3. WordPress

| Route | Use when | Auth |
|---|---|---|
| REST API (`https://SITE/wp-json/wp/v2/...`) | Remote site, create or update pages, posts, media | Application Password over HTTPS |
| WP-CLI (`wp ...`) | You have a shell on the server or a local copy | The shell user |
| MCP adapter (official WordPress package) | The site exposes abilities to agents | WP-CLI user (STDIO) or Application Password (HTTP) |

**Application Passwords** (built in since WordPress 5.6): the user creates one under Users → Edit User, then you send it with Basic auth over HTTPS only. Keep it in env vars:

```bash
# WP_USER / WP_APP_PASSWORD set by the user in their shell, not pasted into chat
curl --user "$WP_USER:$WP_APP_PASSWORD" -X POST https://example.com/wp-json/wp/v2/pages \
  -H 'Content-Type: application/json' \
  -d '{"title":"Pricing","content":"<p>…</p>","status":"draft"}'
```

- Routes: `/wp/v2/pages` and `/wp/v2/posts`; update with `POST /wp/v2/pages/<id>`. `status` is one of `publish`, `future`, `draft`, `pending`, `private`: create as `draft`, switch to `publish` only after the yes.
- Pages also take `parent` and `template`.
- Cookie + nonce auth only works for code running inside WordPress with a logged-in user; without the nonce the request is treated as logged out.

**WP-CLI**

```bash
wp db export --add-drop-table                      # backup before anything bulk
wp post create --post_type=page --post_title='Pricing' --post_status=draft --porcelain   # prints the new id
wp search-replace 'http://old.test' 'https://example.com' --dry-run   # report only; rerun without --dry-run after the yes
```

`wp post create` defaults to `draft`. `search-replace` handles PHP-serialized data and leaves primary keys alone; `--precise` is slower but more thorough, `--all-tables` reaches tables outside the WordPress prefix.

**MCP adapter.** Turns WordPress abilities (plugin, theme and core functions registered with the Abilities API) into MCP tools. Abilities are private until marked public; the default server exposes three meta-tools (`mcp-adapter/discover-abilities`, `mcp-adapter/get-ability-info`, `mcp-adapter/execute-ability`).

- Local site, STDIO: client config runs `wp --path=/path/to/site mcp-adapter serve --server=mcp-adapter-default-server --user=<editor-account>`. `--user` decides what the agent may do; use a role no higher than the job needs. `wp mcp-adapter list` shows the servers.
- Remote site, HTTP: endpoint `/wp-json/mcp/mcp-adapter-default-server`, reached through Automattic's `@automattic/mcp-wordpress-remote` proxy with `WP_API_URL`, `WP_API_USERNAME`, `WP_API_PASSWORD` (an Application Password) in the client's MCP config env.
- Installing the adapter is a plugin change on their site: ask first.

**Themes.** Block themes keep design tokens in `theme.json` at the theme root (schema `version: 3`, from WordPress 6.6). Put the commit-sheet palette in `settings.color.palette` (`slug`, `color`, `name`) and type in `settings.typography.fontFamilies` / `fontSizes`; WordPress emits `--wp--preset--color--{slug}` and matching custom properties, so blocks pick them up instead of inline colours.

**Go deeper:** WordPress's own `agent-skills` repo (block themes, WP-CLI ops, REST, Playground) is GPL-2.0-or-later: read it at github.com/WordPress/agent-skills, don't copy from it.

## 4. Wix

**Connect.** Remote MCP at `https://mcp.wix.com/mcp`, OAuth login:

```bash
claude mcp add --transport http wix https://mcp.wix.com/mcp   # then /mcp in Claude Code to log in
```

For headless automation Wix also accepts an API key plus account ID as headers (`Authorization`, `wix-account-id`). Keys are long-lived, carry scopes plus site access, and site-level calls work only with a key from the account that owns the site: restrict each key to the sites it needs. The key belongs in the client's MCP config env (`${WIX_API_KEY}`), not in the repo.

**Tools that matter**

| Tool | Does |
|---|---|
| `WixREADME` | Entry point; call it first for management tasks, it routes to the right tool or recipe |
| `ListWixSites`, `GetSiteContext` | Find the site and its ID, properties, installed apps |
| `CallWixSiteAPI`, `ExecuteWixAPI` | One REST call, or a script that chains/paginates calls, against one site (CMS, blog, bookings, stores) |
| `ManageWixSite` | Account-level: create, update or **publish** a site. Cannot read per-site business data |
| `UploadImageToWixSite` | Images into the site's Media Manager |
| `ReadFullDocsMethodSchema`, `SearchWixAPISpec` | Exact request/response schema before a write |
| `SupportAndFeedback` | Sends feedback to Wix; use only when the user asks |

Flow for "add a pricing section and blog posts": `WixREADME` → `GetSiteContext` → check the schema → create blog posts as drafts with `ExecuteWixAPI` → list them for the user → publish posts and the site only after the yes.

**Gotchas**

- Name "Wix" and the business solution in the request (Stores, Events and Restaurants each have an Orders API).
- Wix's own advice: keep tool auto-run off so each MCP call asks permission. Do the same.
- If the connection fails, log out and back in to the Wix server from `/mcp`. After a long idle spell or a switch of Wix account it can go stale; Wix also says deleting `~/.mcp-auth` may help.
- The `npx @wix/mcp-remote` fallback (for clients without remote MCP) needs Node 19.9.0+.
- Official skills (MIT, marked experimental): `/plugin marketplace add wix/skills` then `/plugin install wix@wix` (headless sites, business-solution recipes). Ask before installing.

## 5. Webflow

**Connect.**

```bash
claude mcp add --transport http webflow https://mcp.webflow.com/mcp   # browser OAuth: pick sites; installs the MCP Bridge App
```

- **Designer API tools** (elements, styles, variables) work only while the MCP Bridge App is open in the Webflow Designer. **Data API tools** (CMS, assets, site metadata) work without Webflow open.
- The MCP covers a limited set of API tools and cannot create new localized CMS items; fall back to REST for those.

**REST (Data API v2).** Site token from Site settings → Apps & integrations → API access, with the minimal scopes; max 5 per site; expires after 365 days unused. Header `authorization: Bearer $WEBFLOW_TOKEN`.

```bash
# Draft CMS item (scope cms:write)
curl -X POST "https://api.webflow.com/v2/collections/$COLLECTION_ID/items" \
  -H "authorization: Bearer $WEBFLOW_TOKEN" -H 'Content-Type: application/json' \
  -d '{"isDraft":true,"isArchived":false,"fieldData":{"name":"Pricing FAQ","slug":"pricing-faq"}}'

# Publish (scope sites:write) - only after the yes
curl -X POST "https://api.webflow.com/v2/sites/$SITE_ID/publish" \
  -H "authorization: Bearer $WEBFLOW_TOKEN" -H 'Content-Type: application/json' \
  -d '{"publishToWebflowSubdomain":true}'
```

- Bulk: `POST /v2/collections/{collection_id}/items/insert` takes up to 100 items per request (each locale counts as one).
- Publish body needs `customDomains` (list) or `publishToWebflowSubdomain`; publish to the webflow.io subdomain first as the preview.
- Rate limits: 60 requests/min (Starter, Basic), 120/min (CMS, eCommerce, Business), custom on Enterprise; **one successful publish per minute**. A 429 carries `Retry-After` (usually 60 s): wait, don't retry in a loop.

**Go deeper:** Webflow's official skills (MIT): `claude plugin marketplace add webflow/webflow-skills`, then `claude plugin install webflow-skills@webflow-skills`; its `safe-publish` skill is the confirm-before-publish flow.

## 6. Squarespace

There is **no page-editing API**. The owner (or you, through their browser with them watching) edits in Fluid Engine, the 7.1 editor; Claude supplies the copy, the design decisions, the CSS and code, and a click-by-click change list.

| Place | Takes | Limits |
|---|---|---|
| Custom CSS panel | Fonts, colours, backgrounds (Squarespace advises nothing else); upload custom files `.jpg .png .gif .ttf .otf .webp .woff` | Support won't troubleshoot custom code |
| Code injection: Header / Footer | Site-wide code in `<head>` / before `</body>` (analytics tags, font loaders) | Core, Plus, Advanced (and some legacy plans); none on checkout pages |
| Code injection: Lock Page, order confirmation and order status pages | Code on those pages | As above |
| Page settings → Advanced → Page Header Code Injection | Code for one page | As above |
| Code block | HTML, Markdown, CSS inside `<style>`; JavaScript and iframes | JS/iframes on Core, Plus, Advanced, Business, Commerce Basic, Commerce Advanced; 400 KB per block |

- If custom code breaks the editor, append `/safe` to the editing URL to turn scripts off while editing; visitors are unaffected.
- Keep a `squarespace-code.md` in the project listing every snippet and where it was pasted; Squarespace support will not help with it.
- Domain ideas and availability: the official MCP `https://mcp.squarespace.com/mcp` (`domains_generate_names`, `domains_search`) needs no account and is read-only; it never registers a domain. The user buys on squarespace.com.
- Orders, products, inventory (Commerce APIs) → `ecommerce` craft.

## Pitfalls

- Rebuilding a client's Wix or WordPress site in Next.js because it was easier for you.
- Publishing a whole site to push one CMS item, or hitting Webflow's one-publish-a-minute limit in a loop.
- An admin-level Application Password or an all-sites Wix key for a one-page job.
- `search-replace` without `--dry-run` and a backup.
- Squarespace snippets pasted with no record of where they went.

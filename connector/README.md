# Skill Garden on Cloudflare: website + connector

One Cloudflare Worker serves two things:

- **The website** at `/`: a public, read-only copy of Skill Garden. It has Explore, craft pages,
  previews, ⌘K search, the bundle builder, and downloads of every super skill and every
  sub-skill whose license allows sharing. Review, the scout and anything that changes data
  stay on your Mac.
- **The connector** at `/mcp`: a read-only MCP server for claude.ai and the Claude apps.
  Its tools are `list_crafts`, `get_super_skill`, `get_guide`, `get_chain` and `search_skills`, and it
  reads live from the GitHub repo (`REF` in `wrangler.toml`).

`npx wrangler deploy` first runs `node build-site.mjs`, which builds `./public` from
`../superskills`, `../catalog/catalog.json` and the SkillGarden library folder next to the app.
Run the deploy from this Mac, and run it again after you approve changes to refresh the website.

## Deploy

```bash
cd ~/Desktop/Claude/SkillGarden/skillgarden-app/connector
read -s CLOUDFLARE_API_TOKEN && export CLOUDFLARE_API_TOKEN   # paste your API token, press Enter
npx wrangler whoami
openssl rand -hex 16                    # your first access key for the connector
npx wrangler secret put ACCESS_KEYS     # paste it (or several, comma-separated)
npx wrangler deploy                     # prints https://skillgarden.<you>.workers.dev
```

The API token needs the "Edit Cloudflare Workers" template (My Profile → API Tokens).
Instead of a token you can run `npx wrangler login` once.
If you have several Cloudflare accounts, also `export CLOUDFLARE_ACCOUNT_ID=<id>`.
If the deploy says you need a workers.dev subdomain, pick one in the dashboard under
Workers & Pages → Account details → Subdomain, then deploy again.

## Connect the connector

- **claude.ai / Claude apps:** Settings → Connectors → Add custom connector, URL
  `https://skillgarden.<you>.workers.dev/mcp/<your-key>`, Authentication "No sign-in".
  The dialog can also send the key as a request header instead: URL ending in `/mcp`, header
  `Authorization` with value `Bearer <your-key>`.
- **Claude Code:** `claude mcp add --transport http skillgarden https://…/mcp --header "Authorization: Bearer <key>"`
  (the plugin is the better route in Claude Code).

Add or revoke keys by running `npx wrangler secret put ACCESS_KEYS` again with the new list.

**Feedback.** `POST /feedback` takes notes people choose to send from `/skillgarden:feedback`
(the connector's `send_feedback` tool does the same) and keeps them 90 days in the `FEEDBACK`
KV store (its id is in `wrangler.toml`). The Mac collects them with its own key:
`npx wrangler secret put FEEDBACK_KEY` and paste the contents of
`~/.claude/secrets/skillgarden-feedback.key`.
The repo is public, so keys gate the connector, not the skill text.

## Try it on this computer

```bash
npx wrangler dev --var ACCESS_KEYS:test-key   # http://localhost:8787
```
`node dev.mjs` runs only the connector, without the website.

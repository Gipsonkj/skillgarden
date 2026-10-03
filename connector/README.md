# Skill Garden connector

A small read-only MCP server that gives claude.ai, the Claude apps and any MCP client the
29 super skills and the ranked sub-skill catalog. It reads them from the GitHub repo
on each request (cached for 5 minutes), so anything pushed to the repo shows up without a
redeploy.

Tools: `list_crafts`, `get_super_skill`, `get_guide`, `search_skills`.

## Try it on this computer

```bash
cd connector
REF=superskills-29 ACCESS_KEYS=my-test-key node dev.mjs     # http://localhost:8787/mcp
claude mcp add --transport http skillgarden http://localhost:8787/mcp --header "Authorization: Bearer my-test-key"
```

## Deploy to Cloudflare Workers (free tier)

```bash
cd connector
npx wrangler login                      # opens Cloudflare in your browser
npx wrangler secret put ACCESS_KEYS     # paste one or more keys, comma-separated
npx wrangler deploy                     # prints https://skillgarden-connector.<you>.workers.dev
```

`REF` in `wrangler.toml` picks the branch it reads (`main` once the PR is merged).

## Connect it

- **claude.ai / Claude apps:** Settings → Connectors → Add custom connector, URL
  `https://skillgarden-connector.<you>.workers.dev/mcp/<your-key>`. claude.ai custom
  connectors can't send a header, so the key goes at the end of the URL.
- **Claude Code:** `claude mcp add --transport http skillgarden https://…/mcp --header "Authorization: Bearer <key>"`
  (the plugin is the better route in Claude Code).

## Access keys

Each key in `ACCESS_KEYS` unlocks the connector. Give each buyer their own key and remove it
to revoke (`npx wrangler secret put ACCESS_KEYS` with the new list). Leave `ACCESS_KEYS`
unset only if you want it open. Note the repo itself is public, so the keys protect the
convenience of the connector, not the skill text.

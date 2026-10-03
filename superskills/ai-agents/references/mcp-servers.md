# Building MCP servers

> Distilled from: build-mcp-server (anthropics/claude-plugins-official, Apache-2.0), mcp-builder (anthropics/skills, Apache-2.0), mcp-apps-builder (mcp-use/mcp-use, MIT), agents-sdk (cloudflare/skills, Apache-2.0)

An MCP server exposes tools (and optionally resources and prompts) to any MCP host: Claude Code, Claude.ai/Desktop, ChatGPT, Cursor, your own agent. Its quality is measured by how well a model with no other context can finish real tasks with it. Discovery first, code second.

## 1. Five discovery questions (ask in one batch)

| Question | Steers |
|---|---|
| What does it connect to? Cloud API / local files or app / OS / nothing | Remote vs local |
| Who uses it? Me / my team / anyone who installs it | Distribution |
| How many distinct actions? | Tool pattern (<15 → one tool each; dozens+ → search + execute) |
| Does a tool need mid-call user input or a rich display? | Elicitation vs MCP app widget (mcp-apps.md) |
| Upstream auth? None / API key / OAuth | Remote server if OAuth |

If the user's first message answers these, skip straight to the recommendation.

## 2. Pick one deployment model (be opinionated)

| Scenario | Deployment | Tool pattern |
|---|---|---|
| Wrap a small SaaS API | **Remote streamable HTTP** (default) | One per action |
| Wrap a large API (50+ endpoints) | Remote HTTP | Search + execute, top 3–5 promoted |
| SaaS API with pickers, charts, dashboards | MCP app (remote) | One per action |
| Read local files / drive a desktop app / OS access | **MCPB** (local server bundled with its runtime) | Depends |
| Personal prototype | Local stdio via `npx`/`uvx` | Whatever's fastest |

Why remote wins: users add a URL, one deployment serves everyone, you control upgrades, OAuth redirects work. Local stdio is fine for prototypes but painful to distribute (runtime installs, no pushed updates); point to MCPB as the upgrade path.

Transports: **streamable HTTP** for remote (stateless JSON mode unless tools truly share session state), **stdio** for local. SSE is deprecated. stdio servers must log to **stderr**, never stdout.

## 3. Pick a framework

| Framework | When |
|---|---|
| Official TypeScript SDK `@modelcontextprotocol/sdk` + Zod | Default: best spec coverage, first to get features |
| FastMCP 3.x (`pip install fastmcp`, jlowin's package) | Python teams or wrapping a Python library; type hints → schema, docstring → description |
| mcp-use (TS) | Projects already on it; read the installed version's types before using any API |
| Cloudflare `McpAgent` (`agents/mcp`) | Fastest free `https://` URL: `npm create cloudflare@latest -- my-mcp --template=cloudflare/ai/demos/remote-mcp-authless`, then `npx wrangler deploy` |

Naming: Python `{service}_mcp`, Node `{service}-mcp-server`, no version numbers.

## 4. Build order

1. Read the upstream API docs: endpoints, auth, rate limits, pagination, data model. List the operations, most-used first.
2. Shared infrastructure: one API client with auth, one error formatter, one pagination helper, response formatting (JSON + markdown).
3. Tools, following tool-design.md: tight Zod/Pydantic schemas, described parameters, annotations (`title`, `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`), `outputSchema` + `structuredContent` with a text fallback, actionable `isError` results.
4. `instructions` on the server for cross-tool hints ("search before get: IDs aren't guessable").
5. Resources only for browsable context the host fetches (files, schemas, `db://{table}` templates); prompts only for user-invoked canned workflows (slash commands). Most servers need tools only.
6. Long tools: honour the abort signal (`extra.signal`), send progress if the client gave a `progressToken`.

Minimal TS shape (stateless HTTP):
```typescript
const server = new McpServer({ name: "acme", version: "0.1.0" },
  { instructions: "Use acme_search_items before acme_get_item." });
server.registerTool("acme_search_items", {
  title: "Search items",
  description: "Search items by keyword. Returns up to `limit` matches, newest first.",
  inputSchema: { query: z.string().describe("Keywords"),
                 limit: z.number().int().min(1).max(50).default(10) },
  annotations: { readOnlyHint: true },
}, async ({ query, limit }) => ({
  content: [{ type: "text", text: JSON.stringify(await api.search(query, limit), null, 2) }],
}));
app.post("/mcp", async (req, res) => {
  const t = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => t.close());
  await server.connect(t);
  await t.handleRequest(req, res, req.body);
});
```

## 5. Asking the user mid-tool: elicitation

Elicitation lets a tool pause and ask for a confirmation, a choice or a small flat form; the host renders a native form.
- **Always check** `server.getClientCapabilities()?.elicitation` first; the SDK throws if unsupported. Fallback: return text asking the model to relay the question and call again.
- Schemas: flat object, primitives only (`string`, `number`, `integer`, `boolean`, `enum`), string formats `email`/`uri`/`date`/`date-time`. Needs nesting, search, previews or live updates → build a widget (mcp-apps.md).
- Handle three outcomes: `accept` (validated content), `decline` (deliberate no), `cancel` (dismissed).
- **Never** request passwords, API keys or tokens through elicitation (spec rule). Use OAuth or the bundle's sensitive config.

## 6. Auth

| Tier | When | Notes |
|---|---|---|
| None / API key from env | Most internal servers | Validate at startup; never hardcode |
| OAuth 2.x via **CIMD** (client ID metadata document) | Preferred per spec 2025-11-25 | Serve `/.well-known/oauth-authorization-server` with `client_id_metadata_document_supported: true` and protected-resource metadata |
| OAuth via **DCR** | Back-compat for hosts not on CIMD yet | Registration endpoint stores clients |

- Validate the token **audience** (RFC 8707): reject tokens minted for another server even if the signature checks out.
- **No token passthrough**: don't forward the user's token upstream; exchange it or use the server's own credentials.
- Token storage: stateless remote → none; stateful remote → session store; local → OS keychain, never plaintext.
- Don't hand-roll: the TS SDK ships `mcpAuthRouter`, `bearerAuth`, `proxyProvider`. MCP-focused hosts can run the OAuth server for you.
- Claude specifics: supported types are DCR, CIMD, Anthropic-held credentials, custom connection, none. User-pasted static bearer tokens are private-deploy only and block Directory listing. Callback URL: `https://claude.ai/api/mcp/auth_callback`. Fetch `https://claude.com/docs/llms-full.txt` for current connector rules before submission.

## 7. Security checklist

- Validate `Origin` on `/mcp` (DNS-rebinding protection; spec MUST). Bind local HTTP servers to `127.0.0.1`.
- Honour `MCP-Protocol-Version` (400 on unsupported).
- Sanitise paths (no `..` traversal), validate URLs/IDs, never build shell commands from input.
- Errors: helpful to the model, silent about internals.
- Health check on its own route, not `/mcp`. CORS only if browser clients connect.
- Treat everything a tool fetches (web pages, emails, tickets) as untrusted data that may contain injected instructions.

## 8. Test

```bash
npx @modelcontextprotocol/inspector            # UI on localhost:6274; pick transport, connect
npx @modelcontextprotocol/inspector --cli http://localhost:3000/mcp --transport http --method tools/list
npx @modelcontextprotocol/inspector --cli http://localhost:3000/mcp --transport http \
  --method tools/call --tool-name acme_search_items --tool-arg query=test
```
- TS: `npm run build` must pass. Python: `python -m py_compile server.py`.
- Test in the real host: Claude Code `claude mcp add --transport http <name> <url>` (`--scope user`, `--header "Authorization: Bearer …"`); Claude.ai/Desktop via Settings → Connectors → Add custom connector (remote servers in `claude_desktop_config.json` are ignored). Tunnel local servers with a Cloudflare tunnel.
- Then write 10 eval questions and run the harness (evaluation.md).

## 9. Ship

- Deploy anywhere Node/Python runs (Render, Railway, Fly, Cloud Run, a VPS; container `node:20-slim`) or Workers.
- Directory submission (Anthropic): every tool has `title` + `readOnlyHint`/`destructiveHint`; names ≤64 chars; reads and writes in separate tools; no behaviour-steering text in descriptions; freeform-endpoint tools link the API docs; OAuth or authless.
- Consider shipping a plugin that pairs the server with a skill explaining multi-step workflows, instead of stuffing workflows into tool descriptions.

## 10. Done checklist

- [ ] `initialize` returns capabilities; `tools/list` shows complete schemas
- [ ] Every tool: described params, annotations, actionable errors, pagination where lists
- [ ] Errors are MCP results, not HTML 500s
- [ ] Origin check, secrets from env, health route
- [ ] Inspector smoke test + real-host test passed
- [ ] 10-question eval file written and run, tool feedback reviewed

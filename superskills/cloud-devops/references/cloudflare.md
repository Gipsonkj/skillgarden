# Cloudflare (Workers, Wrangler, Durable Objects)

> Distilled from: cloudflare, wrangler, workers-best-practices, durable-objects (cloudflare/skills, Apache-2.0)

Your memory of Cloudflare APIs, flags and limits may be stale. Check the project's installed Wrangler version, `node_modules/wrangler/config-schema.json`, generated types, and current docs (https://developers.cloudflare.com/llms.txt) before writing config or code.

## CLI first check

- If the repo has `cloudflare.config.ts` or the user asks for the new `cf` CLI: use the `cf` docs, not Wrangler. Don't run `cf dev/build/deploy` in a project that only has Wrangler config.
- Otherwise use the project-local Wrangler via its package scripts (`npx wrangler`, `pnpm wrangler`). Don't silently upgrade Wrangler.

## Product picker (need → product)

| Need | Product |
|---|---|
| New site, SPA or full-stack app | Workers + Static Assets (preferred over Pages for new projects) |
| API / webhooks | Workers |
| Relational data | D1 (SQLite); existing Postgres/MySQL via Hyperdrive |
| Read-heavy config / key-value | KV (eventually consistent) |
| Files, uploads, large objects | R2 (pair with D1 for searchable metadata) |
| Per-room/per-user coordination, WebSockets, strong consistency | Durable Objects |
| Background jobs, burst buffering | Queues |
| Multi-step durable processes with retries/waits | Workflows |
| Scheduled work | Cron Triggers (+ Queues/Workflows for the work) |
| AI inference / RAG | Workers AI; AI Search (managed RAG) or Vectorize + Workers AI (custom) |
| Caching app responses | Workers Cache first; Cache API/KV only for a concrete gap |
| Containers / Linux software | Containers; Sandbox SDK for agent shells |
| Protect forms / APIs | Turnstile, WAF, Bot Management, API Shield |
| Expose a private server | Cloudflare Tunnel |

Recommend the smallest set that meets the requirement, e.g. uploads app = Workers + R2 + D1 + Queues.

## wrangler.jsonc essentials

```jsonc
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "YYYY-MM-DD",          // today for new projects
  "compatibility_flags": ["nodejs_compat"],     // most npm libs need it
  "observability": { "enabled": true, "traces": { "enabled": true } },
  "vars": { "API_BASE_URL": "https://api.example.com" }  // non-secret only
}
```

- Prefer `wrangler.jsonc` for new projects; keep the existing format otherwise.
- Advancing an existing `compatibility_date` changes runtime behaviour: review the changelog and run tests.
- Environments: some fields (bindings, vars) are **not inherited**; define them per env. Pass the same `--env` to every command.
- Wrangler deploys overwrite dashboard-edited vars/routes: reconcile first.
- Binding existing resources: verify the IDs; missing IDs can trigger automatic provisioning of new resources.
- With the Vite plugin, pick the env with `CLOUDFLARE_ENV` at build time; `--env` at deploy doesn't retarget a built config.
- After changing bindings: run `wrangler types` and re-typecheck. Never hand-write `Env`.

## Secrets

- `wrangler secret put NAME` (interactive/stdin), never as a CLI argument or in config. Local dev uses git-ignored `.dev.vars`/`.env`; those are not uploaded.
- `secret put`/`secret delete` immediately create and deploy a new version. Use `wrangler versions secret put` to stage instead.
- For CI or scoped access use an account-owned API token with the narrowest permissions; `wrangler login` OAuth isn't granular. Never ask users to paste a token into chat.

## Deploy, preview, rollback

- Validate: `wrangler deploy --dry-run` (checks build/packaging only, not bindings or runtime).
- Workers Previews for branch/PR environments (requires a recent Wrangler, 4.135+). Preview URLs are public unless protected. Check which bindings are isolated vs shared with production before allowing writes.
- Version URLs inspect a specific upload against production resources; Wrangler environments are separate persistent Workers.
- Rollback restores code only; D1/KV/R2/DO data is not rolled back.
- Local dev can hit **remote** bindings: check before testing writes.

## Workers code review: anti-patterns

| Don't | Do |
|---|---|
| `await res.text()` on unbounded bodies | Stream request/response bodies |
| Floating promises | `await`, return, or `ctx.waitUntil(p)` |
| `const { waitUntil } = ctx` | Call `ctx.waitUntil(...)` (keeps the receiver) |
| Module-level mutable per-request state | Pass state explicitly; isolates are reused across requests |
| `Math.random()` for tokens | `crypto.randomUUID()` / `crypto.getRandomValues()` |
| `a === b` on secrets | Constant-time compare via Web Crypto (HMAC both, compare digests) |
| REST API calls for things a binding does | Use the binding |
| `ctx.passThroughOnException()` as error handling | Explicit try/catch and structured error responses |
| `any` on `Env`/handlers, `as unknown as T` | Generated types; fix the contract |
| `implements DurableObject` | `extends DurableObject` (gets `this.ctx`, `this.env`) |
| Same serialization assumption for Queues, Workflows, DO storage, WebSockets | Check each API's supported types |

Also: enable logs + traces (both flags), log structured JSON, set sampling for high-traffic Workers.

## Durable Objects

Use for: coordination (rooms, games, docs), strong consistency (inventory, bookings), per-entity storage, WebSockets, per-entity scheduled work. Not for stateless handlers or high fan-out independent requests.

Rules:
1. One DO per coordination unit (room, user, document), never one global DO.
2. Route deterministically: `env.MY_DO.getByName("room-123")`. `newUniqueId()` only if you store the mapping.
3. SQLite-backed storage: migration `{ "tag": "v1", "new_sqlite_classes": ["MyDO"] }`.
4. Schema setup in the constructor inside `ctx.blockConcurrencyWhile()`; never use it per request or across external I/O.
5. Call RPC methods on the stub (compat date ≥ 2024-04-03) instead of `fetch()` routing.
6. Persist to storage first, then update in-memory caches. Memory is lost on eviction.
7. Don't `await` between related writes (breaks atomic batching).
8. One alarm per DO: `setAlarm()` replaces the previous one; re-arm inside `alarm()` if recurring.

```ts
import { DurableObject } from "cloudflare:workers";
export class Room extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS msgs (id INTEGER PRIMARY KEY, body TEXT NOT NULL)`);
    });
  }
  async post(body: string) {
    return this.ctx.storage.sql.exec<{ id: number }>("INSERT INTO msgs (body) VALUES (?) RETURNING id", body).one().id;
  }
}
```

Test with Cloudflare's Vitest integration (check current docs for setup).

## Report back

What changed, target account/Worker/env, checks run (`types`, typecheck, tests, dry-run), and remaining gaps. Link the docs used when behaviour depends on current versions.

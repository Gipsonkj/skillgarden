# Backend architecture: services, frameworks, caching, jobs

> Distilled from: nodejs-backend-patterns (wshobson/agents, MIT), fastify-best-practices (mcollina/skills, MIT), fastapi-templates (wshobson/agents, MIT), golang-pro (Jeffallan/claude-skills, MIT), backend-patterns (affaan-m/ECC, MIT), prisma-compute (prisma/skills, MIT), convex (get-convex/agent-skills, Apache-2.0).

Use this when structuring a backend service, choosing a framework or platform, adding caching or background jobs, or preparing a service to deploy.

## 1. Layering

```
route/controller -> service (business rules) -> repository (data access) -> database
```

- Routes parse and validate input, call one service method, map the result to HTTP. No SQL in routes.
- Services hold business rules and transactions; they do not know about HTTP.
- Repositories hide the ORM/SQL; easy to fake in tests.
- Configuration from environment, validated at startup (zod/pydantic settings); fail fast on missing values.
- Dependency injection by constructor or framework (`Depends()` in FastAPI, decorators/plugins in Fastify), not module-level singletons that tests cannot replace.

## 2. Framework notes

| Stack | Defaults that matter |
|---|---|
| Fastify | Plugins with encapsulation (`fastify-plugin` only for things meant to be shared); JSON Schema for body, params, query and **response**; `pino` logger built in; use `inject()` for tests; handle shutdown with `close()` hooks |
| Express | Async error wrapper or Express 5; `helmet`, body size limits; central error middleware last |
| FastAPI | Pydantic v2 models for request and response; `async def` only when every call inside is async (otherwise a blocking call stalls the event loop; use `def` or run in a threadpool); lifespan handler for pools; `Depends` for auth and DB sessions |
| Go | `net/http` with explicit server timeouts (`ReadHeaderTimeout`, `ReadTimeout`, `WriteTimeout`, `IdleTimeout`); `context.Context` first argument and honoured for cancellation; errors wrapped with `%w`; `errgroup` for bounded concurrency; table-driven tests with `-race` |

## 3. Reliability basics

- **Timeouts on every outbound call** (HTTP, DB, cache), shorter than the caller's timeout.
- **Retries** only for idempotent operations, with exponential backoff and jitter, capped (for example 3 attempts).
- **Graceful shutdown**: stop accepting, drain in-flight requests (for example up to 30 s), close pools.
- **Health checks**: `/healthz` (process alive) separate from `/readyz` (dependencies reachable).
- **Structured logs** (JSON) with request id; metrics for rate, errors, duration per route.

## 4. Caching

| Pattern | Use |
|---|---|
| Cache-aside | Read: cache, else DB then set with TTL. Default choice |
| Write-through | Writes update cache and DB together; read-heavy data that must be fresh |
| HTTP caching | `Cache-Control`, `ETag` for public GETs; often cheaper than Redis |

- Every cached key has a TTL. Invalidate on write by key, not by flushing.
- Protect against stampedes on hot keys (single-flight lock or early refresh).
- Never cache per-user data under a shared key.

## 5. Background jobs

- Anything slower than about 1 s or touching third parties (email, webhooks out, image processing) goes to a queue (BullMQ, Celery/RQ, SQS, Postgres `skip locked`, platform queues).
- Jobs are idempotent (safe to run twice), carry ids not full objects, have retry limits and a dead-letter queue.
- Scheduled jobs: one scheduler, with a lock so multiple instances do not double-run.

## 6. Deploy readiness

- Bind to `0.0.0.0` and read the port from `PORT`; respond to the platform's health check quickly (some platforms, such as Prisma Compute, expect the app to answer within about 60 s of start).
- Build once, configure by environment. Migrations run as a separate release step over a direct DB connection.
- Containers: non-root user, small base image, `.dockerignore` excluding `.env` and `node_modules`.

## 7. Choosing a data platform

| Need | Good fit |
|---|---|
| The team already runs or pays for a database that fits | Keep it; ask before adding another |
| Relational data, SQL, mature tooling | Postgres (managed: Supabase, Neon, RDS, Cloud SQL) |
| Existing MySQL or SQL Server estate, or a .NET/Azure shop | MySQL or SQL Server (see sql-engines.md) |
| Single host, local tool, tests or prototype, no account | SQLite file; over the network from edge code: Turso (see sql-engines.md) |
| Postgres + auth + storage + realtime in one | Supabase (see supabase.md) |
| Serverless Postgres, branching per preview | Neon (see neon.md) |
| Realtime reactive app state with TypeScript functions | Convex: queries/mutations are TypeScript functions with automatic reactivity; validate args with `v` validators and check auth inside every public function |
| Mobile-first with offline sync, document model | Firebase Firestore (see firebase.md) |
| Flexible documents, varied shapes | MongoDB (see nosql-analytics.md) |
| Cache, rate limits, queues, sessions | Redis (see nosql-analytics.md) |
| Analytics over billions of rows | ClickHouse (see nosql-analytics.md) |
| Full-text relevance search, facets | Elasticsearch or OpenSearch beside the main database (see nosql-analytics.md) |

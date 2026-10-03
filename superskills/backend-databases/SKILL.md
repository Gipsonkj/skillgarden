---
name: backend-databases
description: Backend services and databases. Use when designing Postgres tables, keys, constraints or migrations; fixing slow queries, indexes, N+1, pagination, connection pooling or timeouts; designing REST or GraphQL (Apollo) APIs, error formats and versioning; structuring Node/Fastify/Express, FastAPI or Go services with caching and background jobs; implementing auth, sessions, JWT, OAuth, passwords and RBAC; Supabase RLS, keys and CLI migrations; Neon pooled vs direct URLs and branching; Prisma schema, raw SQL and transactions; Stripe Checkout, webhooks and API upgrades; Firestore modeling, rules and Data Connect @auth; MongoDB schema design, Redis data types, ClickHouse table design.
---

# Backend and databases

Scope: designing and building server-side code and its data layer: relational schema and queries, API contracts, service structure, auth, and the vendor platforms people most often pair with them (Supabase, Neon, Prisma, Stripe, Firebase, MongoDB, Redis, ClickHouse). Outputs are migrations, endpoints, configuration and tests that hold up in production.

## Core principles

1. **Model the data first, from the queries you must serve.** Schema mistakes outlive code mistakes.
2. **Postgres by default.** Pick another store only for a workload it clearly serves better (see the table in backend-architecture.md).
3. **Keys: `bigint` identity internally, UUIDv7 or a random public id for anything exposed.** Conflict: one source warns against guessable public ids, another against random UUIDv4 keys fragmenting indexes; resolved by keeping both concerns with two columns or time-ordered UUIDs.
4. **Constraints in the database**: `NOT NULL`, foreign keys with explicit `ON DELETE`, `UNIQUE`, `CHECK`. Index every foreign key.
5. **Measure before optimizing** with `explain (analyze, buffers)` and `pg_stat_statements`; fix the top queries by total time.
6. **Cursor pagination with a limit** (default 20, max 100); offsets only for small admin lists.
7. **Short transactions, no network calls inside them**; timeouts on every connection and outbound call.
8. **Pooled connections for app traffic, direct connections for migrations** and session features.
9. **Authorization enforced server-side per resource**, ideally in the database too (RLS). Roles never come from user-editable metadata.
10. **Secrets server-side only**: `service_role`, Stripe secret keys and DB URLs never reach a client bundle.
11. **Webhooks are the source of truth for external state** (payments): verify signatures, process idempotently by event id.
12. **Forward-only, reviewed migrations** applied by a tool in CI; online-safe patterns for large tables.
13. **Pin versions that change behaviour**: Stripe API version, SDKs, ORM, database major version.
14. **One error shape and one naming convention** across an API.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Booking API on Neon: `references/postgres-schema.md` → `references/neon.md` → `references/api-design.md` → `references/stripe.md`; Cloud Run deploy from `cloud-devops` → `references/docker.md`, `references/gcp.md`; threat model from `security` → `references/threat-modeling.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:garden`, or `get_super_skill` with craft `garden` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Tables, types, keys, constraints, multi-tenancy, migrations | [references/postgres-schema.md](references/postgres-schema.md) |
| Slow query, index design, N+1, pagination, pooling, timeouts | [references/query-performance.md](references/query-performance.md) |
| REST endpoints, status codes, errors, versioning, GraphQL/Apollo | [references/api-design.md](references/api-design.md) + `templates/api-design-principles/api-design-checklist.md` |
| Service layering, Fastify/Express/FastAPI/Go, caching, jobs, deploy, platform choice (incl. Convex) | [references/backend-architecture.md](references/backend-architecture.md) |
| Login, sessions, JWT, OAuth, passwords, API keys, RBAC | [references/auth.md](references/auth.md) |
| Supabase RLS, keys, views/functions, CLI, storage | [references/supabase.md](references/supabase.md) |
| Neon connection strings, serverless driver, branching | [references/neon.md](references/neon.md) |
| Prisma setup, queries, raw SQL, transactions, Prisma Compute | [references/prisma.md](references/prisma.md) |
| Stripe Checkout, webhooks, keys, API version upgrades | [references/stripe.md](references/stripe.md) |
| Firestore modeling, indexes, rules; Data Connect `@auth` | [references/firebase.md](references/firebase.md) |
| MongoDB schema, Redis data types, ClickHouse tables | [references/nosql-analytics.md](references/nosql-analytics.md) |

## Other crafts

| When the request also needs | Use |
|---|---|
| Hosting the service: container, platform and a CI pipeline that runs migrations as a release step | `cloud-devops` → `references/platform-choice.md`, `references/docker.md`, `references/ci-cd.md` |
| A threat model, upload and input hardening, or secret storage and leak response | `security` → `references/threat-modeling.md`, `references/secure-coding.md`, `references/secrets.md` |
| A test strategy and integration tests against a real database | `testing-qa` → `references/test-strategy.md`, `references/unit-runners-by-language.md` |
| Reporting queries, KPIs or a warehouse fed from the app database | `data-analysis` → `references/sql.md`, `references/dashboards-kpis.md`, `references/warehouses.md` |
| Next.js Server Actions, route handlers and caching that call this backend | `website-building` → `references/nextjs-react.md` |
| An MCP server or agent tools on top of the API | `ai-agents` → `references/mcp-servers.md`, `references/tool-design.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Supabase Vectors, Cron and Queues, and SSR setups for Next.js, SvelteKit or Astro | [supabase](https://github.com/supabase/agent-skills/tree/main/skills/supabase) (MIT) |
| Stripe Connect (Accounts v2), Tax and Treasury, beyond Checkout and webhooks | [stripe-best-practices](https://github.com/stripe/ai/tree/main/skills/stripe-best-practices) (MIT) |
| Neon Auth, Object Storage, Functions and AI Gateway around Postgres | [neon](https://github.com/neondatabase/agent-skills/tree/main/skills/neon) (Apache-2.0) |
| Building on Convex: correct queries, mutations and actions, scheduling and file storage | [convex](https://github.com/get-convex/agent-skills/tree/main/skills/convex) (Apache-2.0) |
| The full Prisma Client API: filters, operators, relations, transactions and client methods | [prisma-client-api](https://github.com/prisma/skills/tree/main/prisma-client-api) (MIT) |
| Redis modelling with its reference docs; the repo adds clustering, search and semantic-cache skills | [redis-core](https://github.com/redis/agent-skills/tree/main/skills/redis-core) (MIT) |
| All 31 ClickHouse rules for ordering keys, partitioning, data types and inserts | [clickhouse-best-practices](https://github.com/clickhouse/agent-skills/tree/main/skills/clickhouse-best-practices) (Apache-2.0) |
| Adding Clerk auth with its CLI and framework quickstarts, or migrating to it from another system | [clerk-setup](https://github.com/clerk/skills/tree/main/skills/core/clerk-setup) (MIT, declared in SKILL.md; no LICENSE file in the repo) |

## Default workflow

1. **Clarify the workload**: entities, main reads and writes, expected volume, tenancy, who may access what.
2. **Read the matching guide(s)**; for a vendor, read its file plus the general one (Supabase -> supabase.md + postgres-schema.md).
3. **Design the schema and API contract** together; write the migration and the request/response schemas.
4. **Implement in layers** (route -> service -> repository) with validation at the boundary and authorization per resource.
5. **Add indexes for the real queries** and check them with `explain`.
6. **Test**: happy path, validation errors, denied access, concurrency/idempotency for payments and jobs; run migrations on a fresh database (or Neon branch).
7. **Prepare deploy**: env vars validated at startup, pooled URL for the app, migrations as a release step, health checks.

## Done means

- [ ] Migrations apply cleanly on an empty database and are checked in.
- [ ] Foreign keys indexed; hot queries verified with `explain`.
- [ ] Every endpoint validates input, checks authorization and returns the shared error shape.
- [ ] No secret keys in client code; RLS on for every exposed Supabase table.
- [ ] Webhook handlers verify signatures and are idempotent.
- [ ] Tests cover denied access and validation failures, not only the happy path.

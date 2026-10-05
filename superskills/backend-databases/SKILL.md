---
name: backend-databases
description: Backend services and databases: Postgres schemas, migrations, indexes and slow queries; REST and GraphQL API design; Node, FastAPI and Go services with caching and background jobs; auth, sessions, JWT, OAuth and roles; Supabase, Neon, Prisma, Drizzle, Firestore, MongoDB, Redis, MySQL, SQLite and Elasticsearch; Stripe Checkout and webhooks. Use when asked to design a schema or API, fix a slow query, add auth or payments, or structure a backend service.
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

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Tables, types, keys, constraints, multi-tenancy, time zones, migrations | [references/postgres-schema.md](references/postgres-schema.md) |
| Slow query, index design, N+1, pagination, pooling, timeouts | [references/query-performance.md](references/query-performance.md) |
| REST endpoints, status codes, errors, versioning, GraphQL/Apollo | [references/api-design.md](references/api-design.md) + `templates/api-design-principles/api-design-checklist.md` |
| Service layering, Fastify/Express/FastAPI/Go, caching, jobs, deploy, pick a database or platform (incl. Convex) | [references/backend-architecture.md](references/backend-architecture.md) |
| Login, sessions, JWT, OAuth, passwords, API keys, RBAC; pick an auth provider; Auth0 | [references/auth.md](references/auth.md) |
| Supabase RLS, keys, views/functions, CLI, storage | [references/supabase.md](references/supabase.md) |
| Neon connection strings, serverless driver, branching | [references/neon.md](references/neon.md) |
| Prisma or Drizzle setup, queries, raw SQL, transactions, migrations, Prisma Compute; pick an ORM | [references/prisma.md](references/prisma.md) |
| Stripe Checkout, webhooks, keys, API version upgrades | [references/stripe.md](references/stripe.md) |
| Firestore modeling, indexes, rules; Data Connect `@auth` | [references/firebase.md](references/firebase.md) |
| MongoDB schema, Redis data types, ClickHouse tables; search with Elasticsearch or OpenSearch, pick a search tool | [references/nosql-analytics.md](references/nosql-analytics.md) |
| MySQL, SQL Server / Azure SQL, SQLite or Turso; pick a SQL database | [references/sql-engines.md](references/sql-engines.md) |

## Other crafts

| When the request also needs | Use |
|---|---|
| Hosting the service: container, platform and a CI pipeline that runs migrations as a release step | `cloud-devops` → `references/platform-choice.md`, `references/docker.md`, `references/ci-cd.md` |
| A threat model, upload and input hardening, or secret storage and leak response | `security` → `references/threat-modeling.md`, `references/secure-coding.md`, `references/secrets.md` |
| A test strategy and integration tests against a real database | `testing-qa` → `references/test-strategy.md`, `references/unit-runners-by-language.md` |
| Reporting queries, KPIs or a warehouse fed from the app database | `data-analysis` → `references/sql.md`, `references/dashboards-kpis.md`, `references/warehouses.md` |
| Next.js Server Actions, route handlers and caching that call this backend | `website-building` → `references/nextjs-react.md` |
| An MCP server or agent tools on top of the API | `ai-agents` → `references/mcp-servers.md`, `references/tool-design.md` |
| A store's catalog, cart and checkout on Shopify, WooCommerce or Medusa | `ecommerce` → `references/platform-choice.md`, `references/checkout-and-payments.md`, `references/shopify-apps-and-apis.md` |
| Transactional email (receipts, password resets) that reaches the inbox | `email-marketing` → `references/transactional-email.md`, `references/deliverability.md`, `references/sending-apis.md` |

## Go deeper (original skills)

Original community skills behind these guides, for a part the guides don't cover in full: `references/go-deeper.md`. Read any script there before running it.

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

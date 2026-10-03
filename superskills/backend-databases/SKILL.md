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

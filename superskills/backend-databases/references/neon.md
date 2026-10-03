# Neon serverless Postgres (vendor-specific)

> Distilled from: neon-postgres (neondatabase/agent-skills, Apache-2.0), neon (neondatabase/agent-skills, Apache-2.0).

Use this for projects on Neon: choosing connection strings and drivers, branching for previews and tests, and autoscaling settings.

## 1. Connection strings

| String | Host contains | Use |
|---|---|---|
| Pooled | `-pooler` | Application traffic, serverless functions (PgBouncer, transaction mode) |
| Direct | no `-pooler` | Migrations, `pg_dump`/`pg_restore`, `LISTEN/NOTIFY`, session-level features, long-lived workers |

Keep both in env vars, for example `DATABASE_URL` (pooled) and `DIRECT_URL` (direct; Prisma's `directUrl`). Always `sslmode=require`.

## 2. Drivers

| Runtime | Driver |
|---|---|
| Edge / serverless (Vercel, Cloudflare Workers) | `@neondatabase/serverless`: HTTP for one-shot queries (lowest latency), WebSocket `Pool` for transactions |
| Node server with long-lived processes | Standard `pg` / `postgres.js` over the pooled string |
| ORMs | Drizzle (`drizzle-orm/neon-http` or `neon-serverless`), Prisma (driver adapter `@prisma/adapter-neon` for edge) |

In serverless handlers create the client per request (or reuse a module-level pool where the platform allows it) and close WebSocket pools at the end of the request.

## 3. Branching

- A branch is a copy-on-write copy of a database at a point in time; creating one takes seconds regardless of size.
- Uses:
  - **Preview environments**: one branch per pull request, created in CI, deleted on merge.
  - **Tests**: branch from production-like data, run migrations and tests, discard.
  - **Safe migrations**: rehearse on a branch of production first.
  - **Recovery**: branch from a past point in time to inspect or restore data.
- Name branches after the PR or purpose; set expiry or clean up in CI so they do not accumulate.
- Personal data copied into branches is still personal data: restrict who can access preview branches or anonymize.

## 4. Compute and autoscaling

- Compute scales between a min and max size and can **scale to zero** after inactivity. The first query after suspend pays a cold start (typically a few hundred milliseconds).
- Production: set a minimum size that holds the working set in memory, and consider disabling scale-to-zero for latency-sensitive apps.
- Dev and preview branches: scale to zero to save cost.
- Read replicas share storage and need no data copy; route read-heavy analytics there.

## 5. Tooling

- Neon CLI (`neonctl`) or the API for branches in CI: create branch, get connection string, run migrations, run tests, delete branch.
- Neon Auth and the Data API exist as optional add-ons; evaluate them like any auth provider (see auth.md) before adopting.

## 6. Checklist

- [ ] App uses the pooled string; migrations use the direct string.
- [ ] Edge code uses the serverless driver; transactions use the WebSocket pool.
- [ ] Preview and test branches created and deleted by CI.
- [ ] Production minimum compute and scale-to-zero chosen deliberately.

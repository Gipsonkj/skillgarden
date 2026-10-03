# Prisma ORM (vendor-specific)

> Distilled from: prisma-orm-setup, prisma-client-api, prisma-compute (prisma/skills, MIT).

Use this when setting up Prisma, writing queries, raw SQL, transactions, or migrations with Prisma.

## 1. Setup

1. `npm i -D prisma` and `npm i @prisma/client`; `npx prisma init --datasource-provider postgresql`.
2. `schema.prisma`: datasource `url = env("DATABASE_URL")`; for poolers add `directUrl = env("DIRECT_URL")` so migrations bypass the pooler.
3. Model, then `npx prisma migrate dev --name <change>` locally (creates and applies a migration, regenerates the client).
4. Production/CI: `npx prisma migrate deploy` (applies pending migrations only; never `migrate dev` or `db push` against production).
5. One `PrismaClient` per process. In dev with hot reload, cache it on `globalThis` to avoid exhausting connections.

## 2. Modeling

- `id BigInt @id @default(autoincrement())` or `String @id @default(uuid(7))` for exposed ids (check your Prisma version supports UUIDv7).
- `@@index([tenantId, createdAt])` for common filters; Prisma does not add indexes for relation scalars on Postgres automatically: add `@@index([authorId])`.
- `@updatedAt` for modified timestamps; `@db.Timestamptz` and `@db.Decimal(12,2)` for precise types.
- `onDelete: Cascade` / `Restrict` explicitly on relations.

## 3. Queries

- `select` only needed fields; `include` related data in one query instead of looping (N+1).
- Cursor pagination: `findMany({ take: 20, skip: 1, cursor: { id }, orderBy: { id: 'desc' } })`.
- `createMany` for bulk inserts; `upsert` for create-or-update.
- `findUniqueOrThrow` when absence is an error; map Prisma error codes (`P2002` unique violation -> 409, `P2025` not found -> 404).

## 4. Raw SQL safely

| API | Safe with user input? |
|---|---|
| ``prisma.$queryRaw`SELECT ... WHERE id = ${id}` `` (tagged template) | Yes, values become parameters |
| `Prisma.sql` / `Prisma.join` building blocks | Yes |
| `$queryRawUnsafe(str, ...params)` | Only if `str` is a constant and values go in `params` |
| `Prisma.raw(str)` | No: inserts text verbatim. Only for allowlisted identifiers |

Typed SQL (`prisma/sql/*.sql` with `--sql` generation) gives typed results for complex queries.

## 5. Transactions

- Sequential: `prisma.$transaction([op1, op2])` for independent writes that must commit together.
- Interactive: `prisma.$transaction(async (tx) => { ... }, { maxWait: 5000, timeout: 10000, isolationLevel: 'Serializable' })`. Use `tx` for every call inside; keep it short; no external API calls inside.
- Optimistic concurrency: a `version` column and `updateMany({ where: { id, version }, data: { ..., version: { increment: 1 } } })`, then check the count.

## 6. Serverless and edge

- Use a pooled connection string (Neon `-pooler`, Supabase transaction pooler, Prisma Accelerate) for app traffic.
- Edge runtimes need a driver adapter (for example `@prisma/adapter-neon`, `@prisma/adapter-pg`).

## 7. Deploying on Prisma Compute

- Bind the server to `0.0.0.0` and the `PORT` env var; the app must start answering within about 60 seconds.
- Configure `DATABASE_URL` in the platform's environment, run `prisma migrate deploy` as a release step.

## 8. Checklist

- [ ] `directUrl` set when using a pooler.
- [ ] Indexes on relation scalars and common filters.
- [ ] No `Prisma.raw` or `$queryRawUnsafe` with user input.
- [ ] Interactive transactions have timeouts.
- [ ] `migrate deploy` in CI/CD, never `db push` to production.

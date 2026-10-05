# Prisma and Drizzle ORMs (vendor-specific)

> Distilled from: prisma-orm-setup, prisma-client-api, prisma-compute (prisma/skills, MIT). Drizzle section written in our own words from the Drizzle docs.

Use this when setting up Prisma or Drizzle, writing queries, raw SQL, transactions, or migrations with either.

## Pick an ORM

| Situation | Use | Why |
|---|---|---|
| The project already uses one | That one | Two ORMs means two schemas and two migration histories |
| Wants a schema file, generated client and a rich query API; Node server or Prisma Compute | Prisma (sections 1-8) | Mature migrations, typed client, `$transaction` with timeouts |
| Wants SQL-shaped TypeScript, serverless or edge (Workers, Vercel Edge) | Drizzle (section 9) | Schema is plain TypeScript; drivers for Neon HTTP, libSQL/Turso and others |
| Python, Go or .NET service | That language's own ORM or driver (backend-architecture.md) | Prisma and Drizzle are Node.js/TypeScript ORMs |
| A handful of queries, no ORM wanted | The driver plus SQL migrations (postgres-schema.md) | Free and no extra layer |

If the user has not said, ask which they prefer before scaffolding; switching later means rewriting the schema and data access.

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

## 9. Drizzle ORM

Docs at orm.drizzle.team now describe Drizzle 1.0, installed as `drizzle-orm@rc` and `drizzle-kit@rc`. Check `package.json` first: 0.x projects define relations per table with `relations()`, pass them as `drizzle(url, { schema })`, and write `orderBy` as a callback; 1.0 uses one `defineRelations()` passed as `drizzle(url, { relations })` and object `orderBy`. The examples below are 1.0.

**Install (Neon over HTTP):** `npm i drizzle-orm@rc @neondatabase/serverless` and `npm i -D drizzle-kit@rc`.

**Schema** (`src/db/schema.ts`). In 1.0 column names come from the object keys, so use snake_case keys or pass a name (`integer('author_id')`):

```ts
import { pgTable, integer, text, timestamp, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text().notNull().unique(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  author_id: integer().notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text().notNull(),
  body: text().notNull(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("posts_author_created_idx").on(t.author_id, t.created_at)]);
```

Postgres does not index foreign keys for you; the composite index above serves "a user's latest posts".

**Relations** (`src/db/relations.ts`):

```ts
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: { posts: r.many.posts() },
  posts: { author: r.one.users({ from: r.posts.author_id, to: r.users.id }) },
}));
```

**Config** (`drizzle.config.ts`). Migrations use the direct (non-pooled) URL; the app uses the pooled one (neon.md):

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",          // also mysql, sqlite, turso, mssql, singlestore, cockroach
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DIRECT_URL! },
});
```

**Migrations:**

| Command | Does | Use |
|---|---|---|
| `npx drizzle-kit generate` | Writes SQL migration files from schema changes | Every change; commit the files |
| `npx drizzle-kit migrate` | Applies pending generated migrations | CI/release step, dev and production |
| `npx drizzle-kit push` | Applies the schema straight to the database, no files | Local prototyping only, never production |
| `npx drizzle-kit check` | Checks generated migrations for collisions | CI, before `migrate` |
| `npx drizzle-kit pull` | Writes a Drizzle schema from an existing database | Adopting Drizzle on an existing DB |
| `npx drizzle-kit studio` | Opens Drizzle Studio to browse data | Local inspection |

Applied migrations are recorded in `drizzle.__drizzle_migrations`. Apps can also apply them at startup with `migrate(db, { migrationsFolder: "./drizzle" })` from the driver's `migrator` module. Run `migrate` against a Neon branch or dev database first, and ask before running it against production.

**Client and queries:**

```ts
import { drizzle } from "drizzle-orm/neon-http";
import { relations } from "./db/relations";

const db = drizzle(process.env.DATABASE_URL!, { relations }); // pooled URL; on Workers read it from env

const user = await db.query.users.findFirst({
  where: { id: userId },
  with: { posts: { orderBy: { created_at: "desc" }, limit: 10 } },
});
```

The relational query API builds one SQL statement however deep the `with` goes. `findFirst` adds `limit 1`; `columns` picks fields.

**Transactions:** `await db.transaction(async (tx) => { ... })`; `tx.rollback()` aborts; Postgres options include isolation level and access mode. The `neon-http` driver does not support interactive transactions: use `drizzle-orm/neon-serverless` (WebSocket) where you need `db.transaction`. In Node that driver also needs the `ws` package set as its WebSocket constructor.

**Turso / libSQL:** `import { drizzle } from "drizzle-orm/libsql"` with `@libsql/client`, and `dialect: "turso"` plus `dbCredentials: { url, authToken }` in the config (sql-engines.md).

**Checklist:**

- [ ] Version checked (0.x or 1.0) before copying examples.
- [ ] Every foreign key has `onDelete` and an index; `timestamp` uses `withTimezone: true`.
- [ ] `generate` + `migrate` in CI with the direct URL; `push` never used on shared databases.
- [ ] Database URLs come from env vars or the platform's secret store, never the repo.

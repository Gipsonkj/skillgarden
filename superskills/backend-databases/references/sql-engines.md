# MySQL, SQL Server, SQLite and Turso

> Written in our own words from the official MySQL 8.4, Microsoft SQL Server, SQLite and Turso docs (see CREDITS.md).

Use this when the database is not Postgres: an existing MySQL/MariaDB or SQL Server system, a SQLite file, or Turso at the edge. The general rules in postgres-schema.md and query-performance.md still apply (model from the queries, constraints in the database, measure before tuning); this guide covers what each engine does differently.

## Pick a SQL database

| Situation | Use | Why |
|---|---|---|
| The team already runs or pays for one | That one | A second engine doubles backups, monitoring and skills. Ask which one before guessing |
| New app, no constraint | Postgres (postgres-schema.md; managed: supabase.md, neon.md) | The rest of this craft's guides assume it |
| Existing MySQL/MariaDB system, or MySQL is what the host offers | MySQL (section 1) | Keep what runs; section 1 covers the differences that bite |
| .NET shop, Azure, or an existing SQL Server estate | SQL Server / Azure SQL (section 2) | Microsoft's stack end to end: `sqlcmd`, SSMS, Azure SQL |
| One app server, local tool, tests, prototype; no account needed | SQLite file (section 3) | Free, zero setup, one file |
| SQLite semantics but reached over the network from serverless or edge code | Turso (section 4) | Hosted libSQL with an HTTP client and per-database tokens |

Ask before choosing when the user has not said where the database runs; moving engines later means rewriting SQL and migrations.

## 1. MySQL (8.4)

**Access:** the `mysql` client, the app's driver, or an ORM (Drizzle: `dialect: "mysql"` in `drizzle.config.ts`).

**Auth:** never put the password on the command line (`-pSECRET` is visible to `ps`). Use `-p` to be prompted, a `[client]` section in `~/.my.cnf` with `chmod 600`, or a login path:

```bash
mysql_config_editor set --login-path=app --host=db.example.com --user=app --password
mysql --login-path=app app_db
```

The login-path file is only obfuscated, not strongly encrypted; treat it like a password file. In apps, read the URL from an env var.

**Schema rules that differ from Postgres:**

- Defaults are `utf8mb4` / `utf8mb4_0900_ai_ci`. Never use `utf8` or `utf8mb3`: they hold at most 3 bytes per character, so no emoji. `utf8` is a deprecated alias for `utf8mb3`.
- Foreign keys need InnoDB (or NDB). InnoDB creates an index on the foreign key columns automatically if none exists.
- `ON DELETE SET DEFAULT` is parsed but rejected by InnoDB; use `CASCADE`, `SET NULL` or `RESTRICT`.
- DDL commits implicitly: `CREATE TABLE`/`ALTER TABLE` end the open transaction and cannot be rolled back. A migration that fails halfway leaves the earlier statements applied, so keep one change per migration and make each re-runnable.
- Default isolation is `REPEATABLE READ` (Postgres: `READ COMMITTED`); code ported from Postgres may lock differently.

**Upserts:** use a row alias; `VALUES()` in the update clause is deprecated.

```sql
INSERT INTO page_views (page_id, day, views) VALUES (?, ?, 1) AS new
  ON DUPLICATE KEY UPDATE views = page_views.views + new.views;
```

**Online schema changes:** state the algorithm so MySQL errors instead of silently copying the table.

```sql
ALTER TABLE orders ADD COLUMN note VARCHAR(200) NULL, ALGORITHM=INSTANT;
ALTER TABLE orders ADD INDEX idx_orders_customer (customer_id), ALGORITHM=INPLACE, LOCK=NONE;
```

`INSTANT` covers adding a column, renaming a column, changing a default and a few more; adding a secondary index runs in place and allows reads and writes meanwhile. Changing a column type usually needs `ALGORITHM=COPY` (a full rebuild): schedule it.

**Finding slow queries:**

1. `sys.statement_analysis` lists normalized statements, sorted by total latency (worst first), with `exec_count` and `rows_examined_avg`.
2. Slow query log: `slow_query_log=1`, `long_query_time` (default 10 seconds; lower it, for example to 1), optionally `log_queries_not_using_indexes`; summarize the file with `mysqldumpslow`.
3. `EXPLAIN ANALYZE <select>` runs the statement and prints the plan tree with actual time, rows and loops per step. It executes the query, so do not point it at a slow write in production.

## 2. Microsoft SQL Server and Azure SQL

**Access:** `sqlcmd` (the Go version runs on macOS, Linux and Windows), SSMS, or the app's driver / EF Core.

**Local server for development** (container image from Microsoft):

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=$MSSQL_SA_PASSWORD" \
  -p 1433:1433 --name sql1 --hostname sql1 -d \
  mcr.microsoft.com/mssql/server:2022-latest
```

- Accepting the EULA is the user's decision: show them the command and wait for a yes.
- The SA password must be at least 8 characters from three of: upper case, lower case, digits, symbols; otherwise the container stops. `SA_PASSWORD` is deprecated; use `MSSQL_SA_PASSWORD`.
- The password is visible in the container's environment; this is for local use only. Use a dedicated login, not `sa`, for apps.
- The Go `sqlcmd` can also start one: `sqlcmd create mssql --accept-eula` (with `--tag 2025-latest` for SQL Server 2025).

**Auth for `sqlcmd`:** never pass `-P` on the command line; set `SQLCMDPASSWORD` in the environment or let it prompt.

**Schema rules that differ from Postgres:**

- A primary key creates a unique index, clustered by default when the table has no clustered index yet.
- A foreign key does **not** create an index: add one on every foreign key column, as in Postgres.
- Time: `datetimeoffset` stores the UTC offset (range -14:00 to +14:00, 100 ns accuracy) and compares in UTC; `datetime2` has no offset. Store UTC in `datetime2` or use `datetimeoffset`; convert with `AT TIME ZONE`.
- Paging: `ORDER BY ... OFFSET n ROWS FETCH NEXT m ROWS ONLY`. Stable pages need a unique `ORDER BY`; for deep lists prefer keyset pagination (query-performance.md).

**Concurrency:** the default `READ COMMITTED` takes shared locks, so readers and writers block each other. `READ_COMMITTED_SNAPSHOT` switches it to row versioning; it is already ON in Azure SQL Database, OFF on SQL Server. Turning it on (`ALTER DATABASE app SET READ_COMMITTED_SNAPSHOT ON;`) needs every other connection closed, so plan it as a maintenance step.

**Finding slow queries:** Query Store keeps query plans and runtime stats over time. It is on by default for new databases from SQL Server 2022 and in Azure SQL Database; older versions need `ALTER DATABASE app SET QUERY_STORE = ON (OPERATION_MODE = READ_WRITE);`. Read the top queries from `sys.query_store_query`, `sys.query_store_plan` and `sys.query_store_runtime_stats`, or the Regressed Queries report in SSMS; a plan regression can be fixed by forcing the earlier plan.

## 3. SQLite

**Access:** the `sqlite3` CLI or the language's built-in or standard driver. No server, no account.

**When it fits:** data on the same machine as the app, low write concurrency, under a terabyte. SQLite allows one writer at a time. Choose a client/server database when the data sits on a different machine from the app or many clients write at once.

**Settings to apply on every connection** (put them in the code that opens the database):

```sql
PRAGMA foreign_keys = ON;      -- off by default, per connection
PRAGMA busy_timeout = 5000;    -- wait up to 5 s for a lock instead of failing at once
PRAGMA journal_mode = WAL;     -- persistent once set; readers and the writer stop blocking each other
PRAGMA synchronous = NORMAL;   -- the docs' suggested balance in WAL mode
```

- WAL does not work on a network filesystem.
- `synchronous = NORMAL` in WAL mode can lose the last commits on power loss (still atomic and consistent); keep `FULL` where every commit must survive.
- SQLite does not index foreign key columns for you; create the index.
- Ordinary tables use loose type affinity and do not enforce declared types. Add `STRICT` (SQLite 3.37.0+) to enforce declared types; allowed types are `INT`, `INTEGER`, `REAL`, `TEXT`, `BLOB`, `ANY`.

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX posts_author_idx ON posts(author_id);
```

## 4. Turso (hosted libSQL / SQLite)

**Access:** Turso CLI for databases and tokens; `@libsql/client` for queries (the client Drizzle and Prisma use); `@tursodatabase/serverless` is a fetch-only alternative.

**Setup** (macOS; on other systems follow the installation page and read any script before running it):

```bash
brew install tursodatabase/tap/turso
turso auth login
turso db create app-db
turso db show app-db --url                # -> TURSO_DATABASE_URL
turso db tokens create app-db --expiration 30d   # -> TURSO_AUTH_TOKEN; add --read-only for read-only use
```

Put the URL and token in environment variables or the platform's secret store, never in the repo or chat. Prefer tokens with an expiry over `never`.

**Client:**

```ts
import { createClient } from "@libsql/client"; // edge runtimes without native modules: "@libsql/client/web"

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const { rows } = await db.execute({ sql: "SELECT * FROM posts WHERE author_id = ?", args: [userId] });

await db.batch([
  { sql: "INSERT INTO users (email) VALUES (?)", args: [email] },
  { sql: "INSERT INTO audit (action) VALUES (?)", args: ["signup"] },
], "write"); // runs as one implicit transaction
```

- Placeholders: positional `?` or named `:id` (also `@id`, `$id`). Never build SQL by string concatenation.
- Interactive transactions: `const tx = await db.transaction("write")`, then `tx.execute(...)`, `tx.commit()` or `tx.rollback()`. Keep them short.
- Embedded replica (local reads, writes go to Turso): `createClient({ url: "file:local.db", syncUrl, authToken, syncInterval: 60 })`.
- Importing an existing SQLite file: `turso db create app-db --from-file ./app.db` (up to 2 GB).
- With Drizzle: `dialect: "turso"` in `drizzle.config.ts` with `dbCredentials: { url, authToken }`, and `import { drizzle } from "drizzle-orm/libsql"` (see prisma.md for Drizzle).

## 5. Checklist

- [ ] Engine chosen deliberately; the user confirmed where it runs.
- [ ] MySQL: `utf8mb4`, InnoDB, one DDL change per migration, online `ALGORITHM` stated.
- [ ] SQL Server: index on every foreign key, `READ_COMMITTED_SNAPSHOT` decided, Query Store on.
- [ ] SQLite: `foreign_keys`, `busy_timeout` and WAL set on every connection; `STRICT` tables.
- [ ] Turso: URL and token in env vars, token with expiry, parameters never string-built.
- [ ] No passwords on command lines (`mysql -p`, `sqlcmd -P`) or in files in the repo.

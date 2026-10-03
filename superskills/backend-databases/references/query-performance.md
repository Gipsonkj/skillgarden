# Query performance, indexing and connections

> Distilled from: sql-optimization-patterns (wshobson/agents, MIT), supabase-postgres-best-practices (supabase/agent-skills, MIT), postgres-patterns (affaan-m/ECC, MIT).

Use this for slow queries, index design, pagination, N+1 problems, connection limits and timeouts.

## 1. Measure first

```sql
explain (analyze, buffers) select ...;
```

| Plan signal | Meaning | Usual fix |
|---|---|---|
| `Seq Scan` on a large table with a selective filter | No usable index | Add an index matching the filter |
| Estimated rows far from actual rows | Stale statistics | `ANALYZE table` |
| `Sort` with `external merge` | Not enough `work_mem` or missing index for `ORDER BY` | Index in sort order, or raise `work_mem` per session |
| `Nested Loop` with many loops | Join on unindexed column | Index the join column (often a foreign key) |
| High `Buffers: shared read` | Data not cached | Covering index, smaller rows, fewer columns |

Enable `pg_stat_statements` and fix the top queries by total time, not the slowest single run.

## 2. Index types

| Type | Use for | Example |
|---|---|---|
| B-tree composite | Equality filters then a range or sort | `(tenant_id, status, created_at)`: equality columns first, range/sort column last |
| Partial | Queries that always filter on one value | `create index on orders (created_at) where status = 'pending'` |
| Covering | Avoid heap lookups for hot reads | `create index on orders (customer_id) include (total_cents, status)` |
| Expression | Filters on a function | `create index on users (lower(email))` |
| GIN | `jsonb` containment, arrays, full-text | `create index on docs using gin (data jsonb_path_ops)` |
| BRIN | Huge append-only tables ordered by time | `create index on events using brin (created_at)` |

Every index slows writes and uses memory: drop unused ones (`pg_stat_user_indexes.idx_scan = 0` over a representative period).

## 3. Query patterns

- Select only needed columns; never `select *` in hot paths.
- **N+1**: fetch related rows in one query (`where id = any($1)`, a join, or a DataLoader / ORM `include`).
- **Pagination**: cursor (keyset) pagination for feeds and large tables:
  ```sql
  select * from orders
  where tenant_id = $1 and (created_at, id) < ($2, $3)
  order by created_at desc, id desc
  limit 20;
  ```
  `OFFSET` reads and discards every skipped row; acceptable only for small tables or admin screens.
- Batch inserts (multi-row `insert` or `copy`) instead of row-by-row loops; upsert with `on conflict ... do update`.
- Use `exists` rather than `count(*) > 0`.
- Keep transactions short: no network calls (HTTP, email, payment API) inside a transaction.
- Queue tables: `select ... for update skip locked limit n` so workers do not block each other.

## 4. Connections and pooling

- Postgres connections are processes (several MB each). Serverless and many app instances exhaust `max_connections` quickly.
- Put a pooler in front (PgBouncer, Supavisor, Neon's pooled endpoint, RDS Proxy).
  - **Transaction mode**: best for serverless and web apps; no session state (no session-level `SET`, advisory locks held across transactions, `LISTEN`, or some prepared statement setups).
  - **Session mode**: needed for those features and for migrations.
- App-side pool size: start near `cores * 2 + effective_spindles` on the database server, divided across app instances; more connections rarely means more throughput.

## 5. Timeouts and memory

```sql
alter role app_user set statement_timeout = '30s';
alter role app_user set idle_in_transaction_session_timeout = '30s';
alter role app_user set lock_timeout = '5s';
```

- `work_mem` is per sort/hash operation, per connection: keep `work_mem x max_connections` within about 25% of RAM, and raise it per session for reporting queries instead of globally.
- Vacuum: keep autovacuum on; tune per-table thresholds for very hot tables rather than disabling it.

## 6. Checklist for a slow endpoint

- [ ] Captured the actual SQL and its `explain (analyze, buffers)`.
- [ ] Indexes match the filter, join and sort columns in the right order.
- [ ] No N+1 (count queries per request in logs).
- [ ] Cursor pagination with a limit (default 20, max 100).
- [ ] Pooler in place; timeouts set on the app role.

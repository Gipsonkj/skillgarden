# MongoDB, Redis and ClickHouse

> Distilled from: mongodb-schema-design (mongodb/agent-skills, Apache-2.0), redis-core (redis/agent-skills, MIT), clickhouse-best-practices (clickhouse/agent-skills, Apache-2.0).

Use this when the data store is MongoDB (document modeling), Redis (cache, counters, queues, sessions) or ClickHouse (analytics).

## 1. MongoDB schema design

Model for the application's access patterns; data that is read together is stored together.

| Relationship | Default |
|---|---|
| One-to-few (under about 100, bounded) and read with the parent | Embed |
| One-to-many (hundreds to thousands) | Reference: child holds parent id, or parent holds an array of ids if bounded |
| One-to-squillions (logs, events) | Child documents reference the parent; never an array on the parent |
| Many-to-many | Arrays of ids on one or both sides, sized deliberately |

- Hard limit: 16 MB per document. Unbounded arrays are the most common design bug.
- Useful patterns: **extended reference** (copy a few fields of the referenced doc), **subset** (keep the 10 latest reviews embedded, the rest elsewhere), **computed** (store running totals), **bucket** (group time-series readings per hour), **outlier** (overflow documents for rare huge cases), **schema versioning** (`schemaVersion` field, migrate lazily).
- Indexes: follow the ESR rule (Equality, Sort, Range field order); check with `explain("executionStats")`; every query in a hot path should be `IXSCAN`, not `COLLSCAN`.
- Schema validation with `$jsonSchema`: introduce it with `validationLevel: "moderate"` and `validationAction: "warn"`, then tighten to `strict`/`error` once existing data conforms.

## 2. Redis

Pick the data type by access pattern:

| Need | Type | Example |
|---|---|---|
| Cached object or counter | String (`SET key val EX 300`, `INCR`) | `user:42:profile` |
| Object with fields updated independently | Hash | `HSET session:abc user_id 42` |
| Leaderboard, rate-limit window, scheduled items | Sorted set | `ZADD leaderboard 1500 user:42` |
| Unique membership | Set | `SADD post:7:likes user:42` |
| Simple queue | List (`LPUSH` / `BRPOP`) | job queue |
| Durable event stream with consumer groups | Stream | `XADD orders * ...` |
| Approximate unique counts | HyperLogLog | daily unique visitors |
| JSON documents and secondary search | JSON + Query Engine (Redis Stack / Redis 8) | product catalog search |

- Key naming `entity:id:attribute`, colon-separated, consistent.
- Every cache key gets a TTL; set `maxmemory` and an eviction policy (`allkeys-lru` for pure cache, `noeviction` for data you cannot lose).
- Avoid `KEYS *` in production; use `SCAN`. Avoid huge keys (big hashes/lists) that block the single thread.
- Pipelining or `MULTI` for batches; Lua or functions for atomic read-modify-write.
- Redis is not the system of record unless persistence (AOF) and replication are configured for it.

## 3. ClickHouse

- Table engine `MergeTree` family. **`ORDER BY` is the primary index and cannot be changed later** without rebuilding: choose columns you filter on, ordered from low to high cardinality (`ORDER BY (tenant_id, event_type, toDate(ts), user_id)`).
- `PARTITION BY` coarsely (usually by month, `toYYYYMM(ts)`); aim for roughly 100-1,000 partitions in total, never per user or per day for years of data.
- Insert in batches of about 10,000-100,000 rows (or use async inserts); thousands of tiny inserts create too many parts.
- Prefer non-nullable columns with defaults; `Nullable` adds overhead. Use `LowCardinality(String)` for repeated strings.
- Avoid `ALTER TABLE ... UPDATE/DELETE` mutations for routine work; model updates with `ReplacingMergeTree` (dedupe by version) or `CollapsingMergeTree`, and lightweight deletes sparingly.
- Pre-aggregate with materialized views into `AggregatingMergeTree` / `SummingMergeTree` for dashboards.
- Query: filter on the `ORDER BY` prefix, select only needed columns, avoid `SELECT *` and large `JOIN`s on the right side (put the smaller table on the right, or use dictionaries).

## 4. Choosing between them

| Workload | Store |
|---|---|
| Transactions, relations, reporting on moderate data | Postgres |
| Variable document shapes, per-entity reads | MongoDB |
| Sub-millisecond cache, counters, rate limits, ephemeral queues | Redis |
| Aggregations over hundreds of millions of rows | ClickHouse |

# MongoDB, Redis, ClickHouse and search engines

> Distilled from: mongodb-schema-design (mongodb/agent-skills, Apache-2.0), redis-core (redis/agent-skills, MIT), clickhouse-best-practices (clickhouse/agent-skills, Apache-2.0). Search section written in our own words from the Elasticsearch and OpenSearch docs.

Use this when the data store is MongoDB (document modeling), Redis (cache, counters, queues, sessions), ClickHouse (analytics) or Elasticsearch/OpenSearch (full-text search).

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

## 4. Search: Elasticsearch and OpenSearch

A search engine is a secondary index fed from the database of record, not the system of record. Rebuild it from the database when the mapping changes.

**Pick a search tool**

| Situation | Use | Why |
|---|---|---|
| The team already runs or pays for one | That one | Reindexing into a second engine is a project |
| Search over one modest table, no new service wanted | Postgres full-text search (`tsvector` + GIN index) | Free, stays transactional; no sync job |
| Relevance-ranked search, facets, logs, large volume; Elastic Cloud or self-managed | Elasticsearch | Query DSL with scoring and filters, official clients |
| On AWS (Amazon OpenSearch Service) or wants the Apache-2.0 project | OpenSearch | Same request shapes for the basics (bulk, bool queries); separate client and docs |

Ask which one they have before writing client code; the clients and some features differ.

**Access and auth:** official clients (`npm install @elastic/elasticsearch`; `npm install @opensearch-project/opensearch`) or the REST API. Elasticsearch takes an API key; keep it in an env var:

```ts
import { Client } from "@elastic/elasticsearch";
const es = new Client({ node: process.env.ES_URL!, auth: { apiKey: process.env.ES_API_KEY! } }); // Elastic Cloud: cloud: { id } instead of node
```

Amazon OpenSearch Service signs requests with AWS SigV4 (`AwsSigv4Signer` from `@opensearch-project/opensearch/aws-v3`, `service: "es"`; Serverless uses `"aoss"`), using the AWS credential chain, so no key sits in code.

**Mappings first.** Create the index with an explicit mapping and `"dynamic": "strict"`, which rejects documents with unknown fields instead of adding them:

```json
PUT /products
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "name":  { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "sku":   { "type": "keyword" },
      "price": { "type": "scaled_float", "scaling_factor": 100 },
      "updated_at": { "type": "date" }
    }
  }
}
```

- `text` is analyzed for full-text search; `keyword` is the exact value for filters, sorting, aggregations and `term` queries. Don't run full-text search on `keyword`. Use a multi-field (`name` + `name.keyword`) when you need both.
- Dynamic mapping on user-shaped JSON causes a mapping explosion; `index.mapping.total_fields.limit` defaults to 1000 fields.

**Indexing:** use `_bulk` with NDJSON: an action line, then the document line, and a final newline. Send `Content-Type: application/x-ndjson`; with curl use `--data-binary`, because `-d` strips newlines. No batch size is right for everyone: try a few sizes on your own data and keep the fastest. The response can succeed overall while single items fail, so check each item's error. Requests over 100 MB (the default HTTP limit) are refused.

**Querying:** put scoring clauses in `bool.must`/`should` and yes/no conditions in `bool.filter` (no scoring, cached, faster):

```json
GET /products/_search
{
  "query": { "bool": {
    "must":   [ { "match": { "name": "trail shoe" } } ],
    "filter": [ { "term": { "sku": "TS-42" } }, { "range": { "price": { "lte": 120 } } } ]
  } },
  "size": 20
}
```

**Pagination:** `from` + `size` stops at 10,000 hits (`index.max_result_window`). Beyond that use `search_after` with a point in time (PIT) and a sort; the PIT adds `_shard_doc` as the tiebreaker. Scroll is no longer recommended for this.

**Freshness:** search is near real time. Indices refresh every second by default, but only those searched in the last 30 seconds; a document is not searchable until the next refresh. Don't read-after-write through search; read the database.

## 5. Choosing between them

| Workload | Store |
|---|---|
| The team already runs one that fits | Keep it |
| Transactions, relations, reporting on moderate data | Postgres |
| Variable document shapes, per-entity reads | MongoDB |
| Sub-millisecond cache, counters, rate limits, ephemeral queues | Redis |
| Aggregations over hundreds of millions of rows | ClickHouse |
| Full-text relevance search, facets, log search | Elasticsearch or OpenSearch (section 4), fed from the main database |

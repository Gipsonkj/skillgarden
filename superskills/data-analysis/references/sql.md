# Analytical SQL

> Distilled from: sql-queries (anthropics/knowledge-work-plugins, Apache-2.0), query (duckdb/duckdb-skills, MIT), bigquery-basics (google/skills, Apache-2.0)

Warehouse-specific cost and safety rules (BigQuery, dbt, DuckDB sandboxing) are in [warehouses.md](warehouses.md).

## Habits

- Explore with `LIMIT` and an explicit column list; never `SELECT *` on a large table.
- Filter early on the partition/date column; filter before joining.
- One CTE per logical step, named for what it holds (`orders_2024`, `first_purchase`), not `t1`.
- Check row counts after every join. Know the join cardinality before you write it.
- Use `COUNT(DISTINCT ...)` deliberately; it's expensive and often a sign of an unintended fan-out.
- Compute ratios from sums: `SUM(conversions) * 1.0 / NULLIF(SUM(visits), 0)`, not `AVG(daily_rate)`.
- Protect integer division (`* 1.0` or `CAST`) and division by zero (`NULLIF`).
- `NULL` doesn't equal anything: `WHERE col <> 'x'` drops nulls; use `IS DISTINCT FROM` or `COALESCE` when that matters.
- Prefer `QUALIFY` (Snowflake, BigQuery, Databricks, DuckDB) over a wrapping subquery for window filters.

## Dialect cheatsheet

| Task | PostgreSQL | Snowflake | BigQuery | Redshift | Databricks / Spark SQL |
|---|---|---|---|---|---|
| Truncate date | `date_trunc('month', ts)` | `DATE_TRUNC('month', ts)` | `DATE_TRUNC(d, MONTH)` / `TIMESTAMP_TRUNC(ts, MONTH)` | `DATE_TRUNC('month', ts)` | `date_trunc('month', ts)` |
| Add interval | `ts + interval '7 days'` | `DATEADD(day, 7, ts)` | `DATE_ADD(d, INTERVAL 7 DAY)` | `DATEADD(day, 7, ts)` | `date_add(d, 7)` |
| Date difference | `d2 - d1` (days) | `DATEDIFF(day, d1, d2)` | `DATE_DIFF(d2, d1, DAY)` | `DATEDIFF(day, d1, d2)` | `datediff(d2, d1)` |
| Safe cast | `NULLIF` + cast | `TRY_CAST` | `SAFE_CAST` | none: validate with regex first | `try_cast` |
| String agg | `string_agg(x, ',')` | `LISTAGG(x, ',')` | `STRING_AGG(x, ',')` | `LISTAGG(x, ',')` | `array_join(collect_list(x), ',')` |
| JSON field | `j->>'key'` | `j:key::string` | `JSON_VALUE(j, '$.key')` | `JSON_EXTRACT_PATH_TEXT(j, 'key')` | `j:key` or `get_json_object` |
| Unnest array | `unnest(arr)` | `LATERAL FLATTEN(input => arr)` | `UNNEST(arr)` | `PartiQL` / `SUPER` navigation | `explode(arr)` |
| Approx distinct | extension | `APPROX_COUNT_DISTINCT` | `APPROX_COUNT_DISTINCT` | `APPROXIMATE COUNT(DISTINCT x)` | `approx_count_distinct` |

Note the BigQuery argument order (`DATE_DIFF(later, earlier, part)`) and part name without quotes. Redshift: distribution and sort keys drive join speed; match `DISTKEY` on frequent join columns.

## Window functions

```sql
-- latest row per key (dedup)
SELECT * FROM events
QUALIFY ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_ts DESC) = 1;

-- running total and 7-day moving average
SELECT d, revenue,
       SUM(revenue) OVER (ORDER BY d) AS running_revenue,
       AVG(revenue) OVER (ORDER BY d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma7
FROM daily_revenue;

-- period over period
SELECT month, revenue,
       revenue - LAG(revenue) OVER (ORDER BY month) AS mom_change
FROM monthly_revenue;

-- share of total
SELECT region, revenue, revenue * 1.0 / SUM(revenue) OVER () AS share FROM by_region;
```

`ROW_NUMBER` breaks ties arbitrarily: add a tiebreak column so results are deterministic. `RANK` leaves gaps after ties, `DENSE_RANK` doesn't. A moving average over a date series with gaps needs a date spine (calendar table left-joined) first.

## Patterns

**Cohort retention**

```sql
WITH first_month AS (
  SELECT user_id, DATE_TRUNC('month', MIN(order_ts)) AS cohort
  FROM orders GROUP BY user_id),
activity AS (
  SELECT DISTINCT o.user_id, f.cohort, DATE_TRUNC('month', o.order_ts) AS active_month
  FROM orders o JOIN first_month f USING (user_id))
SELECT cohort,
       DATEDIFF(month, cohort, active_month) AS months_since,   -- adapt per dialect
       COUNT(DISTINCT user_id) AS users
FROM activity GROUP BY 1, 2 ORDER BY 1, 2;
```
Divide each cell by month 0 of its cohort for the retention percentage. Exclude the current incomplete month.

**Funnel** (ordered steps per user)

```sql
WITH steps AS (
  SELECT user_id,
         MIN(CASE WHEN event = 'view'     THEN ts END) AS t_view,
         MIN(CASE WHEN event = 'cart'     THEN ts END) AS t_cart,
         MIN(CASE WHEN event = 'purchase' THEN ts END) AS t_purchase
  FROM events WHERE ts >= '2024-01-01' GROUP BY user_id)
SELECT COUNT(t_view) AS viewed,
       COUNT(CASE WHEN t_cart > t_view THEN 1 END) AS carted,
       COUNT(CASE WHEN t_purchase > t_cart AND t_cart > t_view THEN 1 END) AS purchased
FROM steps;
```

**Gaps and islands / sessions**: flag a new session when `ts - LAG(ts) > 30 minutes`, then `SUM(flag) OVER (PARTITION BY user ORDER BY ts)` gives a session id.

**Year-over-year**: join a month to the same month last year, or `LAG(x, 12)` over a complete monthly series.

## DuckDB friendly SQL (also handy for local files)

```sql
FROM 'data/*.parquet' LIMIT 10;                  -- FROM-first, globbing
SELECT * EXCLUDE (raw_json) FROM tbl;            -- drop columns
SELECT * REPLACE (amount / 100 AS amount) FROM tbl;
SELECT region, product, SUM(amount) FROM tbl GROUP BY ALL ORDER BY ALL;
SUMMARIZE tbl;                                   -- instant profile
DESCRIBE tbl;
SELECT * FROM trades ASOF JOIN quotes USING (symbol, ts);   -- nearest earlier match
SELECT * FROM read_csv('f.csv', auto_detect = true);
```

Also: `COLUMNS('regex')` to apply an expression to many columns, `PIVOT`/`UNPIVOT`, `list` and `struct` types, `arg_max(value, ts)` for "value at latest time".

## Fixing common errors

| Symptom | Likely cause | Fix |
|---|---|---|
| Totals too high after join | Many-to-many or one-to-many fan-out | Aggregate the child table before joining; check key uniqueness |
| Column "must appear in GROUP BY" | Non-aggregated column in select | Add to GROUP BY, aggregate it, or use `ANY_VALUE` |
| Ratio is 0 | Integer division | Multiply by `1.0` or cast |
| Division by zero | Empty denominator | `NULLIF(den, 0)` |
| Rows vanish after `WHERE` on a left-joined table | Filter turned the left join into an inner join | Move the condition into the `ON` clause |
| Window filter error | Can't use window function in `WHERE` | `QUALIFY` or a wrapping CTE |
| Timestamps off by hours | Time zone mismatch | Convert explicitly to one zone before truncating to dates |
| Query slow / expensive | Full scan, no partition filter, `SELECT *`, cross join | Filter on partition column, select needed columns, check the plan with `EXPLAIN` |

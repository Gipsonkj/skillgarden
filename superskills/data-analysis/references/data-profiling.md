# Profiling a new dataset

> Distilled from: explore-data (anthropics/knowledge-work-plugins, Apache-2.0), exploratory-data-analysis (K-Dense-AI/scientific-agent-skills, MIT), pandas-pro (Jeffallan/claude-skills, MIT), query (duckdb/duckdb-skills, MIT)

Profile before you analyse. Most wrong answers come from a misunderstood grain, a silent join fan-out, or placeholder values counted as real data.

## 1. Structure first

- **Grain**: what does one row represent (an order, an order line, a user-day)? Write it down in one sentence.
- **Primary key**: which column(s) are unique? Test it: `COUNT(*)` vs `COUNT(DISTINCT key)`. If they differ, find out why before going further.
- **Row count and time span**: min/max of every date column; are recent days partial?
- **Column classes**: identifier, dimension (categorical), measure (numeric), timestamp, free text, boolean, nested/JSON.

## 2. Per-column profile

| Class | Metrics |
|---|---|
| All | type, null count and %, distinct count, top 5–10 values with counts |
| Numeric | min, p1, p25, median, p75, p99, max, mean, std, zeros, negatives |
| Text/categorical | length range, empty strings, leading/trailing spaces, case variants of the same value |
| Date/time | min, max, gaps in the series, future dates, timezone, day-of-week pattern |
| Boolean | true/false/null split |

Quick ways to get it:
- DuckDB: `SUMMARIZE tbl;` or `SUMMARIZE SELECT * FROM 'file.parquet';`
- pandas: `df.info()`, `df.describe(include="all")`, `df.isna().mean()`, `df[col].value_counts(dropna=False).head(10)`
- Polars: `df.describe()`, `df.null_count()`

## 3. Quality thresholds

Nulls: over 5% → note it; over 20% → flag it and ask what a null means here.

Completeness bands for reporting:

| Non-null | Label |
|---|---|
| > 99% | Complete |
| 95–99% | Mostly complete; check whether nulls cluster in a segment or period |
| 80–95% | Gappy; analyses using this column need a caveat |
| < 80% | Unreliable for headline numbers |

Look for disguised missing values: `0`, `-1`, `999`, `9999`, `1900-01-01`, `1970-01-01`, `"N/A"`, `"null"`, `"none"`, `"TBD"`, empty string, whitespace. Count them and treat them as missing in the analysis.

Other red flags:
- Duplicate keys or fully duplicated rows.
- Values outside a plausible range (negative ages, prices of 0 on paid items, percentages above 100).
- Sudden step changes in volume over time (pipeline change, not behaviour).
- Distributions with a spike at one value (default fill).
- Foreign keys that don't match the parent table (orphans).

## 4. Relationships

- Good dimensions for slicing usually have about 3–50 distinct values. Above that, group into "top N + other".
- Correlation matrix on numeric measures; flag pairs with |r| > 0.7 (redundant or derived columns).
- Check join cardinality before joining: one-to-one, many-to-one, or many-to-many. A many-to-many join silently multiplies sums.
- In pandas: `left.merge(right, on="id", how="left", validate="m:1", indicator=True)` then check `_merge` counts.

## 5. Missing data: don't fix it automatically

Report missingness by column, by segment, and over time. Only impute when the analysis needs it, choose the method deliberately, fit it on training data only (inside a pipeline, see [machine-learning.md](machine-learning.md)), and say in the write-up what was imputed and how. Dropping rows also changes the population; report how many and from which groups.

## 6. Scripts (local, bounded, no network)

From the K-Dense EDA skill. All take a local file inside `--root`, cap reads with `--max-bytes`/`--max-rows`, and redact column names and raw values (hashed ids) unless `--reveal-identifiers` is passed; use that flag only on non-sensitive data. Output is JSON (add `--output path.json`). The CSV/TSV tools use only the Python standard library.

```bash
R=scripts/exploratory-data-analysis/scripts
python3 $R/tabular_profile.py data/orders.csv --root .           # schema + per-column profile
python3 $R/missingness_leakage_audit.py data/orders.csv --root . \
  --entity-column customer_id --time-column order_date --split-column split   # missingness + leakage across splits
python3 $R/distribution_sensitivity.py data/orders.csv --root .  # skew, transforms, outlier sensitivity
python3 $R/eda_analyzer.py data/file.json --root . --format markdown  # CSV/TSV, JSON, NumPy, HDF5, images; Parquet etc. get guidance only
python3 $R/report_scaffold.py --input data/orders.csv --root . --output eda_report.md  # report skeleton
```

`report_scaffold.py` fills `scripts/exploratory-data-analysis/assets/report_template.md`. Run `--help` on any script before first use; flags may differ slightly.

## 7. Write it down

A short data note for every new source:

```
Table: <name>          Grain: one row per <...>        Key: <cols> (verified unique: yes/no)
Rows: <n>              Period: <min> to <max>          Refresh: <how often, last load>
Columns: <name | type | meaning | null % | notes>
Known issues: <placeholders, gaps, duplicates, definition changes>
Safe joins: <table on key, cardinality>
```

Keep it next to the analysis so later questions don't re-derive it.

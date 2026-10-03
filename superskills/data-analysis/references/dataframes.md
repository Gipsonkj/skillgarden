# pandas and Polars

> Distilled from: pandas-pro (Jeffallan/claude-skills, MIT), polars (K-Dense-AI/scientific-agent-skills, MIT), exploratory-data-analysis (K-Dense-AI/scientific-agent-skills, MIT)

Pick one per project. pandas is the default when the codebase or libraries expect it (statsmodels, seaborn, most sklearn examples). Polars is faster and more memory-efficient for large files, and its lazy engine optimises whole queries. For SQL-shaped work on files, DuckDB is often simplest ([sql.md](sql.md)).

## pandas rules

- **Vectorise.** No `for` loops or `iterrows()` over rows; avoid `apply(axis=1)` where a column expression works. Use `np.where`/`np.select` for conditional columns, `.str` and `.dt` accessors for strings and dates.
- **Select explicitly**: `df.loc[mask, "col"] = value`. Chained indexing (`df[mask]["col"] = value`) may write to a copy and silently do nothing.
- Take `.copy()` when you slice a frame you'll modify.
- **Dtypes on load**: `pd.read_csv(path, dtype={...}, parse_dates=[...], usecols=[...])`. Low-cardinality strings → `category`; downcast numeric types for large data; nullable types (`Int64`, `boolean`, `string`) to keep missing values without turning ints into floats.
- **Named aggregation** keeps outputs readable:
  ```python
  out = (df.groupby("region", observed=True)
           .agg(orders=("order_id", "nunique"), revenue=("amount", "sum"), aov=("amount", "mean"))
           .reset_index())
  ```
- **Safe merges**: `pd.merge(a, b, on="key", how="left", validate="m:1", indicator=True)`; check `_merge` value counts and the row count before and after.
- `transform` for group-level values aligned to rows (share of group total); `pd.Grouper(key="ts", freq="W")` or `resample` for time buckets.
- Method chaining with `.assign()`, `.pipe()`, `.query()` keeps steps readable; break long chains when debugging.
- Missing data: inspect first (`isna().mean()`), then decide per column. Don't blanket `fillna(0)` or mode-fill; see [data-profiling.md](data-profiling.md).
- Large files: read only needed columns, `chunksize=` for streaming aggregation, or switch to Parquet + Polars/DuckDB.
- Memory check: `df.memory_usage(deep=True).sum() / 1e6` MB.

## Polars rules

- Prefer **lazy** scans: `pl.scan_parquet("data/*.parquet")` / `pl.scan_csv(...)`, build the query, then `.collect()`. Predicate and projection pushdown mean only needed rows and columns are read.
- Express logic with expressions inside contexts: `select`, `with_columns`, `filter`, `group_by().agg()`.
- Window functions with `.over()`: `pl.col("amount").sum().over("customer_id")`.
- Conditional columns: `pl.when(cond).then(a).otherwise(b)`.
- Larger-than-memory data: `.collect(engine="streaming")`, or write straight to disk with `.sink_parquet("out.parquet")`.
- Check a lazy plan with `.explain()`.
- Joins take `validate="m:1"` too; use `how="left"`, `"inner"`, `"anti"` (rows without a match), `"semi"`.
- Dates: `pl.col("ts").dt.truncate("1mo")`; parse strings with `str.to_datetime(format=...)`.
- Avoid `map_elements` (Python UDF per row): it's slow and blocks optimisation.

## pandas → Polars mapping

| pandas | Polars |
|---|---|
| `df[df.x > 0]` | `df.filter(pl.col("x") > 0)` |
| `df.assign(y=df.x * 2)` | `df.with_columns((pl.col("x") * 2).alias("y"))` |
| `df.groupby("g").agg(s=("x","sum"))` | `df.group_by("g").agg(pl.col("x").sum().alias("s"))` |
| `df.groupby("g")["x"].transform("sum")` | `pl.col("x").sum().over("g")` |
| `df.sort_values("x", ascending=False)` | `df.sort("x", descending=True)` |
| `df.merge(o, on="k", how="left")` | `df.join(o, on="k", how="left")` |
| `df.rename(columns={"a": "b"})` | `df.rename({"a": "b"})` |
| `pd.concat([a, b])` | `pl.concat([a, b])` |
| `df.drop_duplicates(["k"])` | `df.unique(subset=["k"])` |

Convert at boundaries only: `df.to_pandas()` / `pl.from_pandas(pdf)` (needs pyarrow).

## Reproducibility

- Set random seeds for sampling (`df.sample(frac=0.1, random_state=42)`).
- Save intermediate results as Parquet, not CSV (keeps dtypes, smaller, faster).
- Assert assumptions in code: `assert df["order_id"].is_unique`, row counts after joins.

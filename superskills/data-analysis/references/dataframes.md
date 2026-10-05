# pandas, Polars and R (tidyverse)

> Distilled from: pandas-pro (Jeffallan/claude-skills, MIT), polars (K-Dense-AI/scientific-agent-skills, MIT), exploratory-data-analysis (K-Dense-AI/scientific-agent-skills, MIT); R section written from the tidyverse and R docs (see CREDITS.md)

## Pick a tool

Pick one per project.

| The user's situation | Use | Why |
|---|---|---|
| The project or team already uses one | That one | Reuses their code, packages and reviewers |
| Not clear whether they work in Python or R | Ask | Mixing both in one project doubles the setup |
| Python, libraries expect it (statsmodels, seaborn, most sklearn examples) | pandas | The default most Python tools accept |
| Large files, speed or memory matter | Polars | Faster, lazy engine optimises whole queries |
| Statisticians or research teams, ggplot2 charts, existing R scripts | R with the tidyverse | dplyr verbs read like the question; strong statistics ecosystem |
| SQL-shaped work on files | DuckDB ([sql.md](sql.md)) | No dataframe code at all |
| Input is an Excel workbook | `pd.read_excel` or `readxl::read_excel` (below) | Read it into a frame first; building or editing workbooks is `docs-office` → `references/excel-xlsx.md` |
| Input is a Google Sheet | `docs-office` → `references/google-workspace.md` to read it | Then analyse here |

Excel inputs: `pd.read_excel(path, sheet_name=None)` returns a dict of every sheet; `header=`, `skiprows=` and `usecols="A:E"` handle reports whose table doesn't start in A1. In R, `readxl::read_excel(path, sheet = "Data", range = "B3:H200", na = c("", "n/a"))`; by default readxl treats blank cells as missing.

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

## R and the tidyverse

`install.packages("tidyverse")` installs the core packages (ggplot2, dplyr, tidyr, readr, purrr, tibble, stringr, forcats, lubridate) plus import packages such as readxl, haven (SPSS, Stata, SAS files), googlesheets4 and DBI; `library(tidyverse)` loads the core ones. Run scripts from Claude with `Rscript analysis.R` or one-liners with `Rscript -e '...'`; Rscript's own options go before the file or `-e`.

```r
library(tidyverse)

orders <- read_csv("data/orders.csv",
                   col_types = cols(order_id = col_character(),
                                    order_date = col_date(),
                                    amount = col_double(),
                                    .default = col_guess()),
                   na = c("", "NA", "n/a"))
problems(orders)                       # parsing failures; spec(orders) shows the column spec

by_region <- orders |>
  inner_join(customers, by = join_by(customer_id),
             relationship = "many-to-one", unmatched = c("error", "drop")) |>
  filter(order_date >= as.Date("2026-07-01")) |>
  group_by(region) |>
  summarise(orders = n_distinct(order_id),
            revenue = sum(amount, na.rm = TRUE),
            .groups = "drop") |>
  arrange(desc(revenue))

ggplot(by_region, aes(x = reorder(region, revenue), y = revenue)) +
  geom_col() + coord_flip() +
  labs(title = "North leads revenue since July", x = NULL, y = "Revenue (EUR)")
ggsave("out/revenue_by_region.png", width = 7, height = 4, dpi = 300)
```

Rules:
- **Set column types on read.** Without `col_types`, readr guesses from the first 1,000 rows, so a column that turns text late gets mis-typed. Check `problems()` after every read.
- **Declare join cardinality.** `relationship = "many-to-one"` errors on fan-out; `unmatched = "error"` errors when a join would silently drop rows, and which table it checks depends on the join: a left join checks `y` (the right table), a right join checks `x`, an inner join checks both (pass a length-2 vector such as `c("error", "drop")` to set `x` and `y` separately). The example uses an inner join so an order with no customer stops the script. dplyr warns on many-to-many matches by default; never silence that with `relationship = "many-to-many"` unless the grain really is many-to-many.
- **Missing values are explicit.** `sum()`, `mean()` and friends return `NA` if any input is `NA`; pass `na.rm = TRUE` deliberately and report how many rows were dropped, as for pandas.
- **Same verbs, bigger data.** dbplyr translates dplyr to SQL for databases; duckplyr runs dplyr code on DuckDB (`library(duckplyr)` overrides dplyr for the session, falls back to dplyr for anything DuckDB can't run, `methods_restore()` undoes it); arrow handles larger-than-memory files.
- `ggsave()` infers the format from the extension and defaults to the last plot at 300 dpi; give width and height so charts don't depend on the window size.

| pandas | dplyr |
|---|---|
| `df[df.x > 0]` | `filter(df, x > 0)` |
| `df.assign(y=df.x * 2)` | `mutate(df, y = x * 2)` |
| `df[["a", "b"]]` | `select(df, a, b)` |
| `df.groupby("g").agg(s=("x","sum"))` | `df \|> group_by(g) \|> summarise(s = sum(x))` |
| `df.sort_values("x", ascending=False)` | `arrange(df, desc(x))` |
| `df.merge(o, on="k", how="left", validate="m:1")` | `left_join(df, o, by = join_by(k), relationship = "many-to-one")` |

## Reproducibility

- Set random seeds for sampling (`df.sample(frac=0.1, random_state=42)`).
- Save intermediate results as Parquet, not CSV (keeps dtypes, smaller, faster).
- Assert assumptions in code: `assert df["order_id"].is_unique`, row counts after joins.

# Notebooks: marimo and Jupyter

> Distilled from: marimo-notebook (marimo-team/skills, Apache-2.0), jupyter-notebook (openai/skills, Apache-2.0)

Use whichever the project already uses. For new work: marimo when you want a reactive, reproducible notebook that is plain Python (git-friendly, runs as a script, deployable as an app); Jupyter when the team or tooling expects `.ipynb`.

## marimo

A marimo notebook is a `.py` file of `@app.cell` functions. Cells re-run automatically when the variables they read change; the dependency graph comes from variable names, so cell order doesn't matter.

```python
# /// script
# requires-python = ">=3.12"
# dependencies = ["marimo", "polars", "altair"]
# ///
import marimo
app = marimo.App(width="medium")

@app.cell
def _():
    import marimo as mo
    import polars as pl
    return mo, pl

@app.cell
def _(pl):
    df = pl.read_parquet("data/orders.parquet")
    return (df,)

@app.cell
def _(mo):
    region = mo.ui.dropdown(["EU", "US", "APAC"], value="EU", label="Region")
    region
    return (region,)

@app.cell
def _(df, pl, region):
    df.filter(pl.col("region") == region.value).group_by("month").agg(pl.col("amount").sum())
    return

if __name__ == "__main__":
    app.run()
```

Rules:
- Declare dependencies in the PEP 723 header so `uv run notebook.py` works anywhere.
- Each global variable is defined in exactly one cell. Don't mutate objects across cells (`lst.append` in another cell); create new objects instead.
- **The last expression of a cell is its output.** An expression indented inside `if`/`for`/`with` doesn't render; build the value and put it last.
- Don't wrap cells in `if x is not None:` guards or `try/except` to control flow. Let dependencies drive execution; use `mo.stop(condition, mo.md("Waiting..."))` to halt a cell deliberately, and `mo.ui.run_button()` + `mo.stop(not btn.value)` for expensive steps.
- `mo.state()` only for genuinely bidirectional UI state; plain variables cover almost everything.
- SQL cells: `mo.sql(f"SELECT ... FROM df")` runs DuckDB in memory over dataframes in scope and returns a Polars frame; pass `engine=` for a database connection.
- Cache expensive functions with `@mo.cache` (or `mo.persistent_cache` across runs).
- Detect script mode with `mo.app_meta().mode == "script"` and keep the same widgets in both modes.

Commands:
```bash
uvx marimo check notebook.py      # lint: run before handing the notebook back
uv run notebook.py                # run as a script (tests that it executes)
uv run marimo edit notebook.py    # edit in the browser
uv run marimo run notebook.py     # serve as a read-only app
uvx marimo export html notebook.py -o report.html   # also: pdf, script, ipynb, md
```

## Jupyter

Create notebooks from a template rather than an empty file:

```bash
python3 scripts/jupyter-notebook/scripts/new_notebook.py --kind experiment --title "Churn drivers Q3" --out notebooks/churn_q3.ipynb
python3 scripts/jupyter-notebook/scripts/new_notebook.py --kind tutorial --title "Using the orders API" --out notebooks/orders_tutorial.ipynb
```

Templates live in `scripts/jupyter-notebook/assets/` (`experiment-template.ipynb`, `tutorial-template.ipynb`). The experiment template runs objective → setup → plan (hypothesis, metrics) → parameters → results → next steps; the tutorial one runs audience/prerequisites → outline → setup → steps → exercises. Add `--force` to overwrite.

Rules:
- One purpose per notebook; the first markdown cell says what question it answers and the data period.
- Imports and configuration (paths, seeds, parameters) in the first code cells; no hidden state from cells run out of order. Before sharing: **Restart & Run All** must succeed top to bottom.
- Keep cells short; move reusable logic into a `.py` module and import it.
- Markdown before each section saying what's being done and, after results, what they show.
- Don't commit large outputs or data; clear output or use `nbstripout` if the team does. Never leave credentials in cells.
- Parameterise for reruns (papermill) when the same notebook runs per segment or period.
- Edit `.ipynb` JSON carefully: keep `cells`, `metadata`, `nbformat` intact; validate with `python -c "import nbformat; nbformat.validate(nbformat.read('x.ipynb', 4))"` when nbformat is available.

## Either way

The notebook is the reproducible record of the analysis: the final numbers in a write-up should come from a clean top-to-bottom run, with the data source and date range stated near the top.

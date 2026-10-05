# Credits

This super skill is distilled from the open-source skills below. Text was rewritten and merged in our own words; only the scripts and notebook templates listed were copied as-is, with their licenses beside them.

| Skill | Repo | License | What was used |
|---|---|---|---|
| data-visualization | https://github.com/anthropics/knowledge-work-plugins/tree/main/data/skills/data-visualization | Apache-2.0 | Chart-selection guide, honest-encoding rules, insight titles, accessibility checklist |
| build-dashboard | https://github.com/anthropics/knowledge-work-plugins/tree/main/data/skills/build-dashboard | Apache-2.0 | Dashboard layout, single-file HTML + Chart.js recipe, data-size and chart-size limits, table pagination |
| kpi-dashboard-design | https://github.com/wshobson/agents/tree/main/plugins/business-analytics/skills/kpi-dashboard-design | MIT | Strategic/tactical/operational levels, KPI selection, MRR and cohort definitions, pre-aggregated snapshots, dynamic thresholds |
| explore-data | https://github.com/anthropics/knowledge-work-plugins/tree/main/data/skills/explore-data | Apache-2.0 | Grain and key checks, column profiling, null and completeness thresholds, placeholder values, schema note |
| analyze | https://github.com/anthropics/knowledge-work-plugins/tree/main/data/skills/analyze | Apache-2.0 | Question sizing, analysis workflow, validation checklist, write-up structure |
| sql-queries | https://github.com/anthropics/knowledge-work-plugins/tree/main/data/skills/sql-queries | Apache-2.0 | Dialect differences, window functions, cohort/funnel/dedup patterns, common error fixes |
| statistical-analysis | https://github.com/anthropics/knowledge-work-plugins/tree/main/data/skills/statistical-analysis | Apache-2.0 | Descriptive statistics, outlier rules, test table, practical vs statistical significance, Simpson's paradox and survivorship bias |
| exploratory-data-analysis | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/exploratory-data-analysis | MIT | No-automatic-imputation rule, missingness and leakage audit; `scripts/exploratory-data-analysis/` (scripts and report template) copied as-is |
| statistical-analysis | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/statistical-analysis | MIT | Pre-specified Welch default, effect-size table, power analysis, FWER/FDR control, reporting format; `scripts/statistical-analysis/assumption_checks.py` copied as-is |
| scikit-learn | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/scikit-learn | MIT | Pipeline/ColumnTransformer pattern, grouped and time-aware CV, imbalance metrics, which models need scaling |
| scientific-visualization | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/scientific-visualization | MIT | Okabe–Ito palette, WCAG contrast, constrained layout, uncertainty display, publication sizing |
| polars | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/polars | MIT | Lazy scans, expressions, `over()`, streaming collect and sinks, pandas mapping |
| statsmodels | https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/skills/statsmodels | MIT | Explicit constant, `missing="raise"`, OLS/Logit/count/ARIMA workflows, robust and clustered SEs |
| pandas-pro | https://github.com/Jeffallan/claude-skills/tree/main/skills/pandas-pro | MIT | Vectorisation, `.loc`/`.copy()`, named aggregation, validated merges, dtype and memory tips |
| marimo-notebook | https://github.com/marimo-team/skills/tree/main/skills/marimo-notebook | Apache-2.0 | Cell structure, PEP 723 header, reactivity rules, `mo.stop`/`mo.sql`/caching, `marimo check` and export commands |
| jupyter-notebook | https://github.com/openai/skills/tree/main/skills/.curated/jupyter-notebook | Apache-2.0 | Notebook hygiene; `scripts/jupyter-notebook/` (`new_notebook.py` and two `.ipynb` templates) copied as-is with LICENSE.txt |
| bigquery-basics | https://github.com/google/skills/tree/main/skills/cloud/bigquery-basics | Apache-2.0 | `bq` commands, cost controls (partition filters, dry run, no `SELECT *`) |
| using-dbt-for-analytics-engineering | https://github.com/dbt-labs/dbt-agent-skills/tree/main/skills/dbt/skills/using-dbt-for-analytics-engineering | Apache-2.0 | `ref`/`source`, extend-before-adding, `dbt show` validation, breaking-change rule, cost-aware selection, test placement, untrusted-data rule |
| query | https://github.com/duckdb/duckdb-skills/tree/main/skills/query | MIT | Sandboxed ad-hoc queries, result-size guard, Friendly SQL |
| senior-data-scientist | https://github.com/alirezarezvani/claude-skills/tree/main/engineering-team/skills/senior-data-scientist | MIT | A/B design (one primary metric, MDE, duration), SRM check, difference-in-differences, model evaluation baselines |

## Official documentation

Docs, link-only reference, written in our own words. Used for the BI tool, Snowflake, Databricks and R sections; no text or code was copied.

| Source | URL | Used for |
|---|---|---|
| Power BI MCP servers overview (Microsoft Learn) | https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview | Authoring vs Fabric IQ, hosted vs local |
| Power BI Authoring MCP server (Microsoft Learn) | https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp | Endpoint, permissions, tenant setting, limits, safe-editing advice |
| Register Power BI MCP servers for MCP clients (Microsoft Learn) | https://learn.microsoft.com/en-us/power-bi/developer/mcp/remote-mcp-server-external-clients | Entra app registration, redirect URI, delegated scopes, Claude Desktop connector |
| Fabric IQ MCP server (Microsoft Learn) | https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp | Endpoint, scopes, tools, row defaults, limitations |
| DAX queries, DIVIDE, SAMEPERIODLASTYEAR, date tables (Microsoft Learn) | https://learn.microsoft.com/en-us/dax/dax-queries | DEFINE MEASURE, EVALUATE, ORDER BY, DIVIDE, time intelligence, marking a date table |
| Tableau MCP docs (tableau.github.io) | https://tableau.github.io/tableau-mcp/ | Hosted server, client setup, env vars, tools, PAT and query-datasource notes |
| Looker-managed MCP server and MCP Toolbox (Google Cloud docs) | https://docs.cloud.google.com/looker/docs/mcp | Managed endpoint, admin enablement, OAuth client, Toolbox config and tools |
| Snowflake-managed MCP server (Snowflake docs) | https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp | CREATE MCP SERVER, tool types, read_only, OAuth, limits |
| Snowflake CLI and warehouses (Snowflake docs) | https://docs.snowflake.com/en/developer-guide/snowflake-cli/connecting/configure-connections | Connections, authenticators, `snow sql`, billing and timeouts |
| Databricks managed MCP servers (Databricks docs) | https://docs.databricks.com/aws/en/agents/mcp-tools/managed-mcp | Server URLs, Genie, SQL server writes policy, client connection |
| Databricks CLI auth and SQL Connector for Python (Databricks docs) | https://docs.databricks.com/aws/en/dev-tools/python-sql-connector | OAuth login, profiles, connector example |
| Claude Code MCP docs | https://code.claude.com/docs/en/mcp | `claude mcp add` flags, pre-configured OAuth, `.mcp.json` variable expansion |
| tidyverse, dplyr, readr, readxl, ggplot2, duckplyr docs | https://www.tidyverse.org/packages/ | Packages, verbs, join checks, column types, `ggsave`, duckplyr |
| R manual (Rscript, sum) | https://stat.ethz.ch/R-manual/R-devel/library/utils/html/Rscript.html | Rscript usage, `NA` handling |
| pandas `read_excel` | https://pandas.pydata.org/docs/reference/api/pandas.read_excel.html | Reading workbooks |

Left out on purpose: the "citing" sections of the K-Dense skills (they ask the agent to add the K-Dense paper to the user's references) and the usage-attribution instructions in bigquery-basics (telemetry environment variables and User-Agent tags). Neither is about doing the analysis.

## Also see (not included)

| Skill | URL | Why not included |
|---|---|---|
| lieflat-charts | https://github.com/larashero3-dotcom/lieflat-charts | PolyForm Noncommercial license; link only |
| xlsx (Excel workbooks) | https://github.com/anthropics/skills/tree/main/skills/xlsx | Proprietary / source-available license; link only |

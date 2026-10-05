# KPIs and dashboards

> Distilled from: build-dashboard (anthropics/knowledge-work-plugins, Apache-2.0), kpi-dashboard-design (wshobson/agents, MIT), data-visualization (anthropics/knowledge-work-plugins, Apache-2.0); BI tool sections written from the Microsoft, Tableau and Looker docs (see CREDITS.md)

## Choose the KPIs first

Match the dashboard to its audience:

| Level | Audience | Refresh | Content |
|---|---|---|---|
| Strategic | Leadership | Monthly/weekly | 5–7 outcome KPIs, trend vs target, few drill-downs |
| Tactical | Department leads | Weekly/daily | Drivers of the outcomes, segment breakdowns |
| Operational | Teams on the floor | Real-time/hourly | Queues, SLAs, alerts, exceptions |

Good KPIs are tied to a decision, owned by someone, clearly defined, and have a target. Pair a leading indicator (pipeline, activation) with each lagging one (revenue, churn). Keep a written definition per KPI: name, formula, filters, grain, source table, owner, target, refresh.

Common definitions to get right:
- **MRR**: normalise every plan to monthly (annual ÷ 12), exclude one-off fees; break movement into new, expansion, contraction, churned, reactivated.
- **Churn**: logo churn (customers) and revenue churn are different; net revenue retention includes expansion.
- **Retention**: by monthly signup cohort, not as a blended rate.
- **Conversion**: name the denominator (visitors, sessions, signups) and the window (within 7 days).
- **CAC / LTV**: say which costs are included and how lifetime is estimated.

## Layout

Top to bottom:
1. **Header**: title, date range, last-updated time, filters.
2. **KPI cards**: value, comparison (vs previous period and vs target), sparkline. Up arrow/down arrow with sign, coloured by good/bad meaning (an increase in churn is bad).
3. **Trend charts**: main KPIs over time with target lines.
4. **Breakdowns**: by segment, channel, region.
5. **Detail table**: sortable, paginated (50–200 rows per page), exportable.

Status thresholds: fixed targets where they exist; otherwise dynamic bands (e.g. flag values more than 2 standard deviations from the trailing mean) so normal noise doesn't trigger alarms. Use colour plus symbols for status (see [visualization.md](visualization.md)).

## Data behind the dashboard

Pre-aggregate. Dashboards should read small summary tables (daily snapshot per KPI and segment), not scan raw events on every load. Keep the SQL for each tile in version control, ideally as dbt models ([warehouses.md](warehouses.md)).

Size guide for a self-contained HTML dashboard:

| Rows needed in the browser | Approach |
|---|---|
| < 1,000 | Embed the data as JSON in the page |
| 1,000–10,000 | Pre-aggregate before embedding; keep raw rows out |
| 10,000–100,000 | Aggregate in the database/warehouse; embed only summaries |
| > 100,000 | Use a BI tool (see [BI tools](#bi-tools-power-bi-tableau-looker) below) or a backend API |

Chart limits for readability and speed: line charts under about 500 points per series, bar charts under about 50 bars, scatter plots around 1,000 points (sample or use hexbin beyond).

## Single-file HTML dashboard recipe

- One `index.html`, no build step: Chart.js 4 from a CDN (`https://cdn.jsdelivr.net/npm/chart.js@4`), data in `<script id="data" type="application/json">`.
- CSS grid: KPI cards in a row (`grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`), charts in a two-column grid that collapses to one on narrow screens.
- Filters (date range, segment) re-filter the embedded data and call `chart.update()`; keep one `render()` function that redraws everything from the current filter state.
- Format numbers with `Intl.NumberFormat`; show "last updated" from the data, not the page load time.
- Set `maintainAspectRatio: false` and give chart containers a fixed height so the layout doesn't jump.
- Provide a table view of each chart's data for accessibility.
- Test with empty data, one row, and a very large value.

## BI tools: Power BI, Tableau, Looker

### Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| Already uses or pays for a BI tool | That one | Metrics, security and refresh already live there; answers match the reports people trust |
| Unsure which BI the company runs, or which workspace or site | Ask | Each tool needs the user's own sign-in and a named model, data source or instance; don't guess |
| No BI tool, a one-off or shareable view | Single-file HTML (recipe above) | No account, works offline, under ~100k rows after aggregation |
| Power BI semantic models (DAX), Microsoft Fabric | Power BI MCP servers (below) | Official Microsoft servers; reads and builds the model the reports use |
| Tableau Cloud or Tableau Server | Tableau MCP (below) | Official server; queries published data sources and views |
| Looker (LookML models and Explores) | Looker MCP (below) | Official Google server; queries go through the governed model |
| Metabase or Superset already in place | Their own docs | No guide here yet; same rules: read the model first, ask before changing anything |

Rules for every BI tool:
- Sign in as the user through the tool's official OAuth (or a token kept in an environment variable). Never ask for passwords or tokens in chat or put them in a file in the repo.
- Read the model or data source metadata first and reuse existing measures and fields; a new formula that disagrees with the official one creates a second truth.
- Reconcile one total against a number the user already trusts before reporting.
- Anything that writes (a measure, a dashboard, a refresh, a delete): show the exact item and wait for a yes.
- Metadata and query results reach the model provider through the client; check that's allowed for the data.

### Power BI

Microsoft has two MCP servers. Pick by job and register only the one you need:

| Job | Server | Endpoint or package |
|---|---|---|
| Ask business questions of an existing report or semantic model (read-only) | Fabric IQ (generally available) | `https://fabriciq.svc.cloud.microsoft/v1/mcp/fabriciq` |
| Create or change measures, tables, relationships; run DAX to validate while building | Power BI Authoring, hosted (preview) | `https://api.fabric.microsoft.com/v1/mcp/powerbi/authoring` |
| The same against Power BI Desktop or PBIP/TMDL files on disk | Power BI Authoring, local (generally available) | npm `@microsoft/powerbi-modeling-mcp` |

Microsoft says not to use the Authoring server for consumption (it runs DAX only to validate a model), and not to register the hosted and local Authoring servers together (overlapping tools, extra tokens).

**Connect.** Microsoft Entra ID doesn't support dynamic client registration, so Claude needs an Entra app registration (single tenant) whose Application (client) ID it uses as the OAuth client ID. Ask the user or their admin for one; the client ID isn't a secret.
- Redirect URI (platform: Mobile and desktop applications): `https://claude.ai/api/mcp/auth_callback` for Claude Desktop; `http://localhost:8080/callback` for Claude Code with `--callback-port 8080`.
- Delegated Power BI Service permissions: Authoring needs `Workspace.Read.All` and `SemanticModel.ReadWrite.All`; Fabric IQ needs `Item.Read.All`, `Item.Execute.All` and `Dataset.Read.All`.
- The hosted Authoring server also needs the tenant setting **Users can use the Power BI Model Context Protocol server endpoint** turned on by a Fabric admin.
- Claude Desktop: Settings → Connectors → Add custom connector, with the endpoint and the OAuth Client ID. Claude Code:

  ```bash
  claude mcp add --transport http --client-id <entra-app-id> --callback-port 8080 \
    powerbi-authoring https://api.fabric.microsoft.com/v1/mcp/powerbi/authoring
  # then /mcp in a session to sign in with the user's Entra account
  ```
- Don't add an `Authorization` header to Fabric IQ: it overrides the interactive sign-in.

**Permissions.** Both servers act with the signed-in user's rights. Changing the model needs Write permission on it; with only Build permission the Authoring server can just run DAX queries. Fabric IQ needs no workspace role or Build permission, and row-level and object-level security still apply, so two users can get different numbers.

**Workflow** (for example "sales and margin % by category, last quarter vs the same quarter last year, and add Margin % if missing"):
1. Connect by name: `Connect to semantic model 'Sales' in Fabric workspace '<workspace>'`, then a read-only check: `List the tables and measures in this model`.
2. Find existing measures (a margin or margin % measure may already exist under another name) and the date table; reuse them.
3. Test the numbers with a query-scoped measure. `DEFINE MEASURE` exists only for that query and doesn't change the model (names below are examples; use the model's own):

   ```dax
   DEFINE
       MEASURE Sales[Margin % test] = DIVIDE([Total Margin], [Total Sales])
       MEASURE Sales[Sales PY] = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))
   EVALUATE
   SUMMARIZECOLUMNS(
       'Product'[Category],
       FILTER(VALUES('Date'[Fiscal Quarter]), 'Date'[Fiscal Quarter] = "FY26 Q2"),
       "Sales", [Total Sales],
       "Sales PY", [Sales PY],
       "Margin %", [Margin % test]
   )
   ORDER BY [Sales] DESC
   ```
4. Before writing a measure to the model: show its name, DAX, display folder and format string, say it needs Write permission and may be hard to undo, and wait for a yes. Suggest a backup first or working in PBIP files under Git so the change shows as a diff.

**Limits and gotchas**
- Authoring DAX query tools have a hard limit of 100,000 rows. Fabric IQ's `ExecuteQuery` returns 250 rows unless you set `maxRows`, targets one semantic model per call, and returns data as fresh as the model's last refresh.
- The local Authoring server doesn't support macOS: on a Mac use the hosted one. The hosted one has no transactions or traces, and keeps a session (`mcp-Session-Id`).
- `DIVIDE(n, d)` returns BLANK on a zero denominator (or a constant you pass as the third argument); prefer it to `/` for ratios.
- Classic time-intelligence functions (`SAMEPERIODLASTYEAR`, `DATEADD`) need a date table marked as one: unique dates, no nulls, contiguous from start to end. `SAMEPERIODLASTYEAR(d)` returns the same dates as `DATEADD(d, -1, year)`.
- Fabric IQ isn't available in Power BI-only regions or sovereign clouds, and doesn't cover dashboards, paginated reports or Power BI apps.

### Tableau

| Situation | Route |
|---|---|
| Tableau Cloud | Hosted Tableau MCP at `https://mcp.tableau.com`: OAuth 2.1, each user signs in with their own Tableau Cloud identity and site role. claude.ai: Customize → Connectors → Add → Browse connectors → "Tableau Cloud connector". Claude Code: `claude mcp add --transport http Tableau https://mcp.tableau.com`, then `/mcp` → Tableau → Authenticate |
| Tableau Server | Run the official server locally (`@tableau/mcp-server`, Apache-2.0) with a personal access token (PAT); read the release you install or pin a version rather than `@latest` |

Local setup with secrets kept in environment variables (`.mcp.json` expands `${VAR}`, so the file holds no secret):

```json
{
  "mcpServers": {
    "tableau": {
      "command": "npx",
      "args": ["-y", "@tableau/mcp-server@<reviewed-version>"],
      "env": {
        "SERVER": "${TABLEAU_SERVER}",
        "SITE_NAME": "${TABLEAU_SITE}",
        "PAT_NAME": "${TABLEAU_PAT_NAME}",
        "PAT_VALUE": "${TABLEAU_PAT_VALUE}",
        "PRODUCT_TELEMETRY_ENABLED": "false",
        "MAX_RESULT_LIMIT": "1000"
      }
    }
  }
}
```

Tools for analysis: `list-datasources` → `get-datasource-metadata` (fields, types) → `query-datasource` (a VizQL Data Service query: `datasourceLuid`, a `query` with `fields` and `filters`, optional `limit`). For existing views: `list-workbooks`, `list-views`, `get-view-data`, `get-view-image`.

Gotchas:
- The user needs the **API Access** permission on the data source (a 403 otherwise), and VizQL Data Service must be enabled (on Tableau Server an admin may need to turn it on).
- `PAT_NAME` is the token's name, not the username. Signing in with the same PAT twice at once ends the earlier session, so don't share one PAT across clients. Unused PATs can expire after 15 days.
- Product telemetry is on by default (`PRODUCT_TELEMETRY_ENABLED=true`); set it to `false`. `MAX_RESULT_LIMIT` has no default limit; set one.
- A TOP or BOTTOM filter combined with dimension filters can return fewer rows than expected unless those filters set `"context": true`.
- Admin tools (`delete-content` and others) are off unless `ADMIN_TOOLS_ENABLED` is set, and flow runs need `FLOW_WRITE_TOOLS_ENABLED`; leave both off for analysis. `delete-content` permanently deletes a workbook or data source: preview, show the exact item, and wait for a yes before confirming.

### Looker

| Instance | Route |
|---|---|
| Hosted by Looker (Looker (Google Cloud core) or Looker (original)) | Looker-managed MCP server at `<instance-url>/mcp` (preview). A Looker admin enables it and picks the tools in Admin → Platform → Model Context Protocol (MCP); all tools start disabled |
| Customer-hosted | Google's MCP Toolbox with `--stdio --prebuilt looker` and a Looker API key (`LOOKER_BASE_URL`, `LOOKER_CLIENT_ID`, `LOOKER_CLIENT_SECRET`, `LOOKER_VERIFY_SSL` as environment variables) |

Managed server from Claude Code: an admin registers an OAuth client with the `register_oauth_client_app` API (your own `CLIENT_GUID`, redirect URI `http://localhost:8080/callback`), then:

```json
{ "mcpServers": { "looker": { "type": "http", "url": "https://<instance>/mcp",
    "oauth": { "clientId": "<CLIENT_GUID>", "callbackPort": 8080 } } } }
```

Work through the model: `get_models` → `get_explores` → `get_dimensions` / `get_measures` → `query`. The Toolbox also has tools that create or change content (`make_look`, `make_dashboard`, `add_dashboard_element`, and LookML file create, update and delete); ask before any of them. The managed server has no extra cost but uses normal API quotas.

## Dashboard review

- [ ] Each tile answers a question someone asked; nothing decorative
- [ ] KPI definitions documented and match finance/other reports
- [ ] Comparisons shown (period, target), partial periods labelled
- [ ] Loads in a few seconds; queries hit aggregates
- [ ] Filters work together; defaults sensible
- [ ] Readable on a laptop screen and in a screenshot pasted into a deck

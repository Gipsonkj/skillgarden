# KPIs and dashboards

> Distilled from: build-dashboard (anthropics/knowledge-work-plugins, Apache-2.0), kpi-dashboard-design (wshobson/agents, MIT), data-visualization (anthropics/knowledge-work-plugins, Apache-2.0)

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
| > 100,000 | Use a BI tool (Looker, Metabase, Superset, Tableau, Power BI) or a backend API |

Chart limits for readability and speed: line charts under about 500 points per series, bar charts under about 50 bars, scatter plots around 1,000 points (sample or use hexbin beyond).

## Single-file HTML dashboard recipe

- One `index.html`, no build step: Chart.js 4 from a CDN (`https://cdn.jsdelivr.net/npm/chart.js@4`), data in `<script id="data" type="application/json">`.
- CSS grid: KPI cards in a row (`grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`), charts in a two-column grid that collapses to one on narrow screens.
- Filters (date range, segment) re-filter the embedded data and call `chart.update()`; keep one `render()` function that redraws everything from the current filter state.
- Format numbers with `Intl.NumberFormat`; show "last updated" from the data, not the page load time.
- Set `maintainAspectRatio: false` and give chart containers a fixed height so the layout doesn't jump.
- Provide a table view of each chart's data for accessibility.
- Test with empty data, one row, and a very large value.

## Dashboard review

- [ ] Each tile answers a question someone asked; nothing decorative
- [ ] KPI definitions documented and match finance/other reports
- [ ] Comparisons shown (period, target), partial periods labelled
- [ ] Loads in a few seconds; queries hit aggregates
- [ ] Filters work together; defaults sensible
- [ ] Readable on a laptop screen and in a screenshot pasted into a deck

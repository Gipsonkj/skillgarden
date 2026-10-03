# Charts that tell the truth

> Distilled from: data-visualization (anthropics/knowledge-work-plugins, Apache-2.0), scientific-visualization (K-Dense-AI/scientific-agent-skills, MIT), kpi-dashboard-design (wshobson/agents, MIT)

## Pick the chart from the question

| Question | Chart |
|---|---|
| Change over time | Line (bars for few discrete periods) |
| Compare categories | Horizontal bar, sorted by value |
| Ranking | Sorted bar or dot plot |
| Part of a whole | Stacked bar, or a pie/donut only for ≤ 5–6 slices that differ clearly |
| Distribution | Histogram, box/violin plot, ECDF |
| Relationship between two measures | Scatter (add a trend line if useful); hexbin or alpha for many points |
| Many series over time | Small multiples rather than one tangled chart |
| Composition over time | Stacked area (few series) or 100% stacked bar |
| Matrix (cohort retention, correlation) | Heatmap with a sequential or diverging scale |
| Single headline number | Big number with comparison (vs target, vs previous period) |
| Geography | Choropleth only for rates or densities, not raw counts |

Never use 3D charts. Avoid dual y-axes; use two aligned charts instead.

## Honest encoding

- **Bar charts start at zero.** Line charts may zoom in, but label the axis clearly.
- Don't truncate or stretch axes to exaggerate a change.
- Same scale across small multiples unless you say otherwise.
- Area and length must map linearly to values (no scaled icons).
- Show uncertainty when you have it: error bars or bands with what they represent (95% CI, SD, IQR) in the caption. In Seaborn: `errorbar=("ci", 95)`.
- Show raw points or distributions for small samples instead of only a bar of means.
- Label partial periods (current month) or drop them.

## Make it readable

- **The title states the finding**: "Mobile conversion fell 18% after the March release", not "Conversion by device".
- Sort categories by value unless the order is natural (time, age bands, funnel steps).
- Label lines directly instead of a legend where possible.
- Remove chart junk: heavy gridlines, borders, backgrounds, redundant labels.
- Format numbers for humans: 1.2M, 34%, £4.5k; consistent decimals.
- Annotate events that explain changes (launches, outages, price changes).
- Highlight the series that matters in colour and grey out the rest.

## Colour and accessibility

- About 8% of men have red–green colour vision deficiency. Don't encode good/bad with red vs green alone. Use colour **plus** a sign, arrow or label (▲ +4.2% / ▼ −3.1%), and prefer a blue/orange pair for good/bad or two groups.
- Okabe–Ito categorical palette (colourblind-safe): `#E69F00 #56B4E9 #009E73 #F0E442 #0072B2 #D55E00 #CC79A7 #000000`.
- Sequential data: a perceptually uniform map (viridis, cividis). Diverging data around a meaningful midpoint (0, target): a diverging map centred on that point. Never rainbow/jet.
- Contrast: text at least 4.5:1 against background, chart elements and large text at least 3:1 (WCAG).
- No more than about 6–8 categorical colours; group the rest into "Other".
- Check the figure in greyscale and with a colour-blindness simulator.
- Provide alt text or a one-line text summary of what the chart shows.

## Python specifics

matplotlib:
- Use `fig, ax = plt.subplots(figsize=(8, 4.5), layout="constrained")`; don't mix with `tight_layout()`.
- Save with `fig.savefig("chart.png", dpi=200)` (raster) or `.svg`/`.pdf` (vector, for print). Close figures in loops (`plt.close(fig)`).
- Spines: `ax.spines[["top", "right"]].set_visible(False)`.
- Thousands separators: `ax.yaxis.set_major_formatter(matplotlib.ticker.StrMethodFormatter("{x:,.0f}"))`.

Seaborn: good for statistical plots (`histplot`, `boxplot`, `lineplot` with CI, `relplot` for small multiples); pass a tidy (long) DataFrame.

Plotly: interactive charts for notebooks and HTML; static export needs `kaleido`. Set `template="simple_white"` and explicit colours for consistency.

For publication figures: match the journal's size (single column ≈ 89 mm, double ≈ 183 mm), fonts 6–9 pt at final size, vector output, consistent panel labels (a, b, c).

## Before sharing a chart

- [ ] Title states the insight; axes labelled with units
- [ ] Bars start at zero; scales not misleading
- [ ] Sorted sensibly; ≤ 8 colours; colourblind-safe; not colour-only
- [ ] Source and date range in a caption; partial periods marked
- [ ] Numbers formatted; uncertainty shown where relevant
- [ ] Checked at the size it will be viewed

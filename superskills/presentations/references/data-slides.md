> Distilled from: scientific-slides data visualization guide (K-Dense-AI/scientific-agent-skills, MIT); pitch-deck formatting and calculation standards (anthropics/financial-services, Apache-2.0); consulting-pptx-skill slide rules (carnot-tech/consulting-pptx-skill, MIT); deck-writing and powerpoint-pptx guides of the docs-office craft (kami (tw93/Kami, MIT), pptx-generator (MiniMax-AI/skills, MIT)); presentation-creator (mblode/agent-skills, MIT); revealjs charts reference (ryanbbrown/revealjs-skill, MIT); presenting-conference-talks (Orchestra-Research/AI-Research-SKILLs, MIT)

# Data slides: charts, tables and numbers

A slide chart is not a report chart. A journal or dashboard figure is studied; a slide figure is grasped in seconds from across a room. This guide covers putting numbers on slides. The analysis itself, chart-type theory and honest statistics belong to `data-analysis` (analysis-workflow, visualization); this guide picks up when the finding is known.

## 1. One finding per data slide

1. Write the finding as the title: "Churn fell 30% after the price change", never "Churn analysis". The chart proves the title.
2. Add the "so what" beside it (right column) unless the title already says it and the chart reads at a glance.
3. A chart must add something the text doesn't (trend, comparison, distribution). Don't chart three numbers already in the title; use big-number tiles instead.
4. Trends, composition, distributions and correlations get a chart, not a table of numbers.
5. One comparison per slide. A six-panel paper figure becomes three slides of one or two panels.

## 2. Simplify for the room

Remove: minor gridlines, legends (label lines and bars directly), secondary axes, dense ticks, 3D, decorative fills, chart borders.

Keep: units on every axis, the sample size and the uncertainty that could change the reading (error bars, intervals), the selection criterion when you show a subset.

| Element | Slide size |
|---|---|
| Axis labels | 18-24 pt |
| Tick labels | 16-20 pt |
| Direct labels / annotations | 18-24 pt |
| Lines | 2-4 pt (key line thicker than references) |
| Markers | 8-12 pt |

Distance test: if it isn't readable from 2-3 feet away from a laptop screen, it won't work in a room.

## 3. Direct the eye

- **Highlight one series**, grey the rest. Key bar or line in the accent colour; comparisons in neutral grey.
- Annotate the point that matters: "34% increase" with an arrow, a shaded band for a period, a vertical line for an event.
- Order bars by value unless the categories have a natural order; horizontal bars for long names; at most 8-10 categories (6 is better).
- Line charts: at most 4-5 lines; label at the line end.
- Bars start at zero.
- Colour: sequential palettes for ordered data, diverging with a neutral midpoint for +/- data, 5-7 colour-blind-safe categorical colours at most, the same colour for the same series on every slide. No rainbow scales, no red/green pairs.
- First time a box plot or unusual chart appears, say what the parts mean.
- Build complex figures progressively: axes → first group → comparison → highlight → interpretation. In pptx use animation or a sequence of slides; Beamer `\pause`/overlays; Slidev `v-click`.

## 4. Big numbers and KPI tiles

- 2-4 tiles per slide, each: the number large, a short label, the period, and the comparison basis ("vs Q2", "YoY").
- Match precision to the source; round only when it doesn't change the figure. Typical conventions: markets ≥ $10bn to the nearest $1bn, smaller to $0.5bn or $0.1bn; CAGR to a whole % or 0.5%; multiples to one decimal (9.7x); ranges at the precision of the sources.
- Same metric, same value, same format on every slide where it appears. Update one, update all.
- Numbers with caveats keep the caveat on the slide and in the notes, verbatim ("$2.1M, excluding the pilot cohort").
- Check the arithmetic you show: CAGR = (end / start)^(1 / years) - 1; shares sum to 100%; totals match their parts. Flag differences from the source's own numbers instead of silently choosing one.

## 5. Tables on slides

- A table is a real table object (pptx `add_table`, PptxGenJS `addTable`, HTML `<table>`), never text with `|`, tabs or spaces lining up columns.
- Rows = items, columns = criteria; group the left axis into meaningful categories rather than a flat list.
- Header row larger or bolder than the body, no heavy fills; no rule below the last row; numbers right-aligned with consistent decimals.
- More than about 6 rows x 5 columns on a speaking slide: cut to the rows that matter, highlight the focus row, put the full table in the appendix.
- Cells hold a phrase or one sentence; two sentences become bullets.

## 6. Building charts per format

| Format | Chart route |
|---|---|
| PowerPoint (PptxGenJS) | Native `slide.addChart(pres.charts.BAR, data, opts)` with `data = [{name, labels, values}]`; native charts stay editable. Types: BAR, LINE, PIE, DOUGHNUT, SCATTER, BUBBLE, RADAR |
| PowerPoint (python-pptx) | `shapes.add_chart(XL_CHART_TYPE..., x, y, cx, cy, ChartData())` |
| Existing template | Paste the chart object only (not the source cells), resized to fill its designated area |
| HTML deck / reveal.js | SVG or a chart library inside a flex container with a fixed height; Chart.js needs `maintainAspectRatio: false` in a sized parent or it overflows |
| Slidev / Marp | Image from matplotlib/plotly at slide resolution, or Mermaid for diagrams |
| Beamer | pgfplots or an exported PDF/SVG figure from the analysis |
| Google Slides | Build in Sheets and link, or insert the image; see google-slides-keynote.md |

Prefer native, editable charts in decks someone else will update. Images are fine for one-off talks if exported at slide resolution (at least 1920 px wide for full-width, PNG or SVG).

Research results: embed the original figure or regenerate it from the source data. Never let an image model redraw a results chart: it invents points, axes and labels.

## 7. Sources and honesty

- Source and date in a small caption on every data slide ("Source: company filings, FY2025").
- Don't truncate axes to exaggerate; if you must zoom, say so on the slide.
- Don't drop the inconvenient series; disclose subsets.
- Projections look different from actuals (dashed line, lighter fill, a label).

## Checklist

- [ ] Title states the finding; the chart proves it; "so what" present
- [ ] One comparison per slide; complex figures split or built up
- [ ] Labels ≥ 18 pt, direct labels, no legend hunting, units on axes
- [ ] One series highlighted; colour-blind safe; same colours per series across slides
- [ ] Numbers consistent across slides; caveats kept; arithmetic checked
- [ ] Tables are real table objects; source and date on every data slide

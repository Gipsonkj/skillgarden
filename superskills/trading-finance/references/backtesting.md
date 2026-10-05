> Distilled from: backtesting-frameworks (wshobson/agents, MIT), backtest-expert (tradermonty/claude-trading-skills, MIT), vectorbt (agiprolabs/claude-trading-skills, MIT), alpaca-trading-backtest (alpacahq/alpaca-skills, Apache-2.0), vibe-trading (HKUDS/Vibe-Trading, MIT)

# Backtesting strategies

A backtest is a hypothetical simulation. Its job is to try to break the idea, not to confirm it.

## Pick a tool

The rules in §1–§5 apply whichever engine runs the test.

| The user's situation | Use | Why |
|---|---|---|
| Already builds strategies in one of these | That one | Their code, data and past runs are there; ask which platform they use if unclear |
| Lives on TradingView charts, wants a quick visual test of an indicator idea | TradingView Pine Script (§11) | Strategy report on the chart; Claude writes the script, the user pastes it in |
| Wants Claude to create, run and read backtests end to end on hosted data | QuantConnect MCP (§12) | Official MCP with project, backtest and optimisation tools; needs a paid plan |
| Python, many parameter combinations, fast research | vectorbt (§7) | Vectorised sweeps; bundled example script |
| US equities or crypto with a reproducible audit trail | Alpaca CLI run folders (§8) | Data via the CLI, one readable `run.py` per run |
| Multi-market engines and factor libraries already set up | Vibe-Trading MCP (§10) | Broad toolkit; same validation rules |
| No platform account | vectorbt or a plain pandas loop on free data (`market-signals.md` §6) | Runs locally, nothing to sign up for |

## 1. Formalise the strategy first

Turn the idea into rules and show them to the user before writing code (unless the request was already exact):
- Symbols/universe, asset class, timeframe, date range, data source and feed, adjustment mode (split/dividend).
- Indicator definitions with exact parameters and warm-up (e.g. "SMA(50) = arithmetic mean of last 50 completed daily closes").
- Entry and exit triggers with inclusive/exclusive bounds; crossover vs threshold logic stated.
- Position sizing, rounding, cash handling, shorting allowed or not.
- **Signal timing vs fill timing** (default: signal on bar T close, fill at bar T+1 open).
- Fees, slippage, spread; benchmark (usually buy-and-hold of the same asset or index).

## 2. Biases to rule out

| Bias | How it sneaks in | Guard |
|---|---|---|
| Look-ahead | Using bar T's close to trade at bar T; restated fundamentals; centred indicators | Shift signals one bar; point-in-time data |
| Survivorship | Universe = today's constituents | Include delisted names, historical index membership |
| Overfitting / data snooping | Many parameter combos, keep the best | Few parameters, walk-forward, out-of-sample, count trials |
| Selection | Only reporting the variant that worked | Log every variant tried |
| Unrealistic fills | Mid-price, no slippage, ignoring liquidity | Next-bar fills, slippage model, volume caps |
| Corporate actions | Mixing adjusted bars with separate split logic | One adjustment approach, documented |

## 3. Costs and slippage

Default slippage by liquidity (per side, adjust to the market):
| Asset | Typical slippage |
|---|---|
| Mega/large-cap equities, major FX, BTC/ETH | 1–5 bps |
| Mid-caps | 5–15 bps |
| Small-caps | 15–50 bps |
| Micro-caps, illiquid alts | 50–200+ bps |
Add commissions/exchange fees, borrow cost for shorts, funding for perpetual futures. Stress test at 1.5–2× the base slippage; a strategy that dies at 2× has no margin.

## 4. Validation

- **Split:** in-sample (develop) / out-of-sample (touch once). Typical 70/30.
- **Walk-forward:** rolling or anchored windows: optimise on window k, test on k+1, stitch the out-of-sample segments. Report the stitched equity curve.
- **Degradation check:** out-of-sample Sharpe or return below ~50% of in-sample is a warning sign of overfitting.
- **Parameter stability:** results should hold across neighbouring parameter values (a plateau, not a spike). Stops tested from 50% to 150% of baseline should not flip the sign of returns.
- **Regimes:** test bull, bear, sideways, high-volatility periods separately (e.g. 2008, 2020, 2022).
- **Monte Carlo:** reshuffle trade order or bootstrap returns to get a drawdown distribution, not a single number.
- **Sample size:** fewer than 30 trades is anecdote; 100+ is usable; 200+ for high confidence. Fewer parameters per trade is better.

## 5. Metrics to report

Lead with the "teaching five": total return vs benchmark, max drawdown, number of trades, win rate, Sharpe vs benchmark. Then annualised return (CAGR), Sortino, Calmar, profit factor, expectancy, average win/loss, exposure %, turnover, fees paid, first and last trade. Formulas in `risk-metrics.md`. Compute daily Sharpe from daily returns with sample standard deviation (N−1). If there were zero trades, say so and why (warm-up, no signal, cash, data gaps).

## 6. Scoring script (bundled)

`scripts/backtest-expert/evaluate_backtest.py` (standard library only) scores a finished backtest 0–100 across sample size, expectancy, risk management, robustness and execution realism, flags red flags and gives a Deploy / Refine / Abandon verdict.
```bash
python3 scripts/backtest-expert/evaluate_backtest.py \
  --total-trades 150 --win-rate 62 --avg-win-pct 1.8 --avg-loss-pct 1.2 \
  --max-drawdown-pct 15 --years-tested 8 --num-parameters 4 \
  --slippage-tested --output-dir reports/
```
`--avg-loss-pct` is a positive number. Writes a JSON and a Markdown report to `--output-dir`. Treat "Deploy" as "worth paper trading", never as permission to go live.

## 7. Fast parameter sweeps with vectorbt (bundled example)

`scripts/vectorbt/parameter_sweep.py` shows a vectorised EMA-crossover grid with a 70/30 split, ranking in-sample and checking out-of-sample. It uses synthetic prices; replace the data loader with real OHLCV. Needs `vectorbt`, `pandas`, `numpy` (ask the user to install; do not install silently).

Key vectorbt patterns:
```python
import vectorbt as vbt
fast = vbt.MA.run(close, window=[10, 20, 30], short_name="fast")
slow = vbt.MA.run(close, window=[50, 100], short_name="slow")
entries = fast.ma_crossed_above(slow); exits = fast.ma_crossed_below(slow)
pf = vbt.Portfolio.from_signals(close, entries, exits, fees=0.001, slippage=0.0005, freq="1D")
pf.stats(); pf.sharpe_ratio(); pf.max_drawdown()
```
Watch for: signals must be shifted or filled next bar to avoid look-ahead; grids explode combinatorially, so count trials and keep out-of-sample untouched; `freq` must be set for annualised metrics.

Event-driven engines (Backtrader, Zipline, custom loops) are better when you need order types, partial fills, multi-asset portfolio logic or exact fill timing; vectorised is better for fast research sweeps.

## 8. Reproducible run folders (Alpaca CLI workflow)

For US equities/crypto with the Alpaca CLI (`alpaca doctor` to check install and auth; `alpaca data bars --symbol SPY --start ... --end ... --timeframe 1Day --quiet` for data; `--schema` and `--help` are the source of truth for flags):
```text
runs/YYYY-MM-DD_symbol_strategy_timeframe/
  notes.md  strategy_spec.json  config.json  run.py
  raw/ (CLI outputs)   normalized/ (CSV)
  summary.json  report.md  trades.csv  round_trips.csv  equity.csv
  benchmark_equity.csv  data_fingerprint.json  warnings.json  fee_source.json
```
- One readable `run.py`, not a framework. Deterministic sorting, explicit timezones, no network calls after the data fetch.
- Fill models: `next_open` (default), `time_based`, `same_bar` (only on request, with a look-ahead warning).
- Reuse cached data only when the data fingerprint matches; `notes.md` records what changed from a prior run.
- A historical backtest never submits orders, paper or live.

## 9. Disclosure (put in every report)

> This backtest is a hypothetical historical simulation and does not represent actual trading performance. Past or simulated results do not guarantee future results. Results depend on data quality, corporate-action handling, fees, slippage, liquidity, taxes and execution assumptions. For research and education only; not investment advice or a recommendation to buy or sell any security or digital asset.

When paper trading is involved, add that paper results are simulated and may differ from live fills.

## 10. Vibe-Trading MCP (optional toolkit)

If the user has `vibe-trading-mcp` configured (`pip install vibe-trading-ai`, user installs it), it offers multi-market backtest engines, factor/alpha libraries, options pricing and trade-journal analysis with free data sources for US/HK/crypto. Workflow: `list_skills()` → `load_skill("strategy-generate")` → write `config.json` and `code/signal_engine.py` → `backtest()`. Its `run_swarm` sends prompts to an external OpenAI-compatible LLM; only use with the user's agreement. Apply the same validation rules above to its output.

## 11. TradingView (Pine Script v6)

Claude writes the Pine code, the user pastes it into the **Pine Editor** (open it from the chart), clicks **Add to chart**, and reads the strategy report in the chart's bottom panel, then shares the numbers or the exported file.
```pine
//@version=6
strategy("SMA cross test", overlay = true, commission_type = strategy.commission.percent, commission_value = 0.05, slippage = 2)
int lenInput = input.int(20, "Fast length", minval = 2)
float fastMA = ta.sma(close, lenInput)
float slowMA = ta.sma(close, lenInput * 2)
if ta.crossover(fastMA, slowMA)
    strategy.entry("Long", direction = strategy.long)
if ta.crossunder(fastMA, slowMA)
    strategy.close("Long")
```
- `strategy()` declares a strategy; orders come from `strategy.entry`, `strategy.exit` (stops, targets, trailing), `strategy.order`, `strategy.close` / `strategy.close_all`, `strategy.cancel`.
- Fill timing: by default an order made on a bar fills at the next bar's open (`process_orders_on_close = false`, `calc_on_every_tick = false`), which matches §1. Slippage defaults to 0 ticks: set `commission_value` and `slippage` yourself. `pyramiding` defaults to 1.
- `use_bar_magnifier = true` uses intrabar data for more realistic fills where the user's plan allows it.
- Report tabs: Metrics and Trades (plus Properties on published strategies). Data downloads as XLSX, and the Trades tab as CSV; ask for the CSV to recompute metrics with `risk-metrics.md`.
- Over the default range only the latest 9,000 trades keep trade-level detail; Deep Backtesting with a custom date range keeps all of them.
- Gotchas: the chart's symbol and timeframe are part of the test, so record them; the report has no out-of-sample split, so do §4 by hand (test a date range you did not tune on).
- Alerts: `alert()` (frequency `alert.freq_once_per_bar`, `alert.freq_once_per_bar_close`, `alert.freq_all`) and the `alert_message` parameter on strategy orders create alert events; the user creates the running alert in the UI. A webhook alert sends an HTTP POST with the alert message (JSON gets `application/json`, else `text/plain`) to ports 80 or 443 only, needs 2-factor authentication on the account, and is cancelled if the server takes longer than 3 seconds. Anything that turns webhooks into orders falls under `brokers-exchanges.md` §1: paper first, per-order confirmation for live.

## 12. QuantConnect (LEAN, MCP server)

Hosted backtesting on QuantConnect's data with an official MCP server. A paid plan is required for the remote MCP.
- **Connect (user does it):** add a custom connector with the URL `https://www.quantconnect.com/api/v2/mcp`, then sign in to QuantConnect in the browser and pick the organization to authorize. In Claude Code: `claude mcp add --transport http quantconnect https://www.quantconnect.com/api/v2/mcp`, then `/mcp` to log in. Test with "Read the open project" (`read_open_project`). The older Docker server (`quantconnect/mcp-server`) is deprecated by QuantConnect.
- **Loop:** `create_project` (Python entry point `main.py`, C# `main.cs`) → `create_file` / `edit_file` (each compiles and returns errors) → `create_compile` → `create_backtest` → results arrive as a new message when the run ends; do not poll `read_backtest` for a run from this conversation → `read_backtest_orders`, `search_backtest_logs` to audit fills.
- **Sweeps:** `create_optimization` runs many backtests over parameter combinations; count every combination as a trial (§2, §4) and keep an untouched out-of-sample period.
- **Research:** `jupyter_*` tools edit and run cells in QuantConnect Research; `list_datasets` / `get_dataset_details` show available data.
- **Live tools:** `create_live_algorithm` deploys to paper trading with the QuantConnect brokerage; `stop_live_algorithm` stops without closing positions, `liquidate_live_algorithm` closes positions at market. Treat every live tool as an order action: say the environment and wait for the user's yes before each call. Notification tools (`send_email_notification`, `send_sms_notification`, `send_telegram_notification`) send messages: show the exact text and wait for a yes.
- `delete_backtest` and `delete_optimization` cannot be undone; never call them without the user asking.
- Limits: QuantConnect sets no API quota; file and notebook size follow the organization's plan.

## 13. Path from backtest to live

Backtest → out-of-sample/walk-forward → paper trading for weeks with reconciliation of expected vs actual fills → small live size only on the user's explicit decision, using the broker rules in `brokers-exchanges.md`.

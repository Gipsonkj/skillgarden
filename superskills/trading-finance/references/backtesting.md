> Distilled from: backtesting-frameworks (wshobson/agents, MIT), backtest-expert (tradermonty/claude-trading-skills, MIT), vectorbt (agiprolabs/claude-trading-skills, MIT), alpaca-trading-backtest (alpacahq/alpaca-skills, Apache-2.0), vibe-trading (HKUDS/Vibe-Trading, MIT)

# Backtesting strategies

A backtest is a hypothetical simulation. Its job is to try to break the idea, not to confirm it.

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

## 11. Path from backtest to live

Backtest → out-of-sample/walk-forward → paper trading for weeks with reconciliation of expected vs actual fills → small live size only on the user's explicit decision, using the broker rules in `brokers-exchanges.md`.

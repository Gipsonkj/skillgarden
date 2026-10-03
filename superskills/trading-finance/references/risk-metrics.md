> Distilled from: risk-metrics-calculation (wshobson/agents, MIT), backtest-expert (tradermonty/claude-trading-skills, MIT), alpaca-trading-backtest (alpacahq/alpaca-skills, Apache-2.0)

# Risk and performance metrics

Use these definitions consistently. State the return frequency, the annualisation factor and the risk-free rate used.

## 1. Conventions

- Simple return r_t = P_t / P_{t−1} − 1 (use log returns only when stated).
- Annualisation factor A: 252 for daily equities, 365 for crypto daily, 52 weekly, 12 monthly.
- Sample standard deviation (N−1).
- Risk-free rate per period: r_f / A (state the source and date, e.g. 3-month T-bill).

## 2. Return and volatility

```
Total return         = Π(1 + r_t) − 1
CAGR                 = (Ending value / Starting value)^(1 / years) − 1
Annualised vol σ_a   = std(r_t) × √A
Downside deviation   = √( mean( min(r_t − MAR, 0)^2 ) ) × √A    (MAR usually 0 or r_f)
```

## 3. Risk-adjusted ratios

```
Sharpe      = (mean(r_t) − r_f/A) / std(r_t) × √A
Sortino     = (mean(r_t) − MAR/A) × A / downside deviation
Calmar      = CAGR / |Max drawdown|
Information = mean(r_p − r_b) / std(r_p − r_b) × √A
Treynor     = (CAGR − r_f) / β
```
Rough reading for Sharpe on a real (not backtested) track record: < 0.5 weak, 0.5–1 acceptable, 1–2 good, > 2 rare (check for errors or overfitting in backtests).

## 4. Drawdown

```
Running peak_t = max(Equity_0..t)
Drawdown_t     = Equity_t / Running peak_t − 1
Max drawdown   = min(Drawdown_t)
```
Also report drawdown duration (peak to recovery) and the longest underwater period. Recovery math: a −20% loss needs +25%, −50% needs +100%.

## 5. Value at Risk and Expected Shortfall

Losses are reported as positive numbers at confidence level c (95% or 99%) over horizon h.
```
Historical VaR_c   = −percentile(r, 1 − c)
Parametric VaR_c   = −(μ + z_{1−c} × σ)      where z_{0.05} = −1.645, z_{0.01} = −2.326
                    = z_c × σ − μ            (same thing, z_c positive)
CVaR / ES_c        = −mean(r | r ≤ −VaR_c)
Horizon scaling    ≈ VaR_1d × √h  (assumes i.i.d. returns; understates fat tails)
```
Check the sign: a 95% one-day parametric VaR for μ = 0.05%, σ = 1.2% is 1.645 × 1.2% − 0.05% ≈ 1.92% of portfolio value. Parametric VaR assumes normality; prefer historical or Monte Carlo for fat-tailed assets (crypto, options books) and always report CVaR beside VaR.

## 6. Market sensitivity

```
β       = cov(r_p, r_m) / var(r_m)
α (ann) = (mean(r_p) − [r_f/A + β × (mean(r_m) − r_f/A)]) × A
Correlation, rolling 60/120-day, to see regime changes
Tracking error = std(r_p − r_b) × √A
```

## 7. Trade statistics

```
Win rate        = winning trades / total trades
Payoff ratio    = average win / |average loss|
Profit factor   = gross profit / |gross loss|      (> 1.5 decent, > 2 strong, < 1 losing)
Expectancy      = win rate × avg win − (1 − win rate) × |avg loss|   (per trade, in % or R)
Breakeven win rate = 1 / (1 + payoff ratio)
```

## 8. Position sizing

- **Fixed fractional:** risk a fixed % of equity per trade (commonly 0.5–2%). Shares = (equity × risk %) / (entry − stop).
- **Volatility targeting:** position weight = target vol / asset vol (e.g. 10% / 40% = 0.25 of capital).
- **ATR stop sizing:** stop = entry − k × ATR(14); size from the fixed-fractional formula.
- **Kelly:** f* = W − (1 − W) / R, with W = win rate and R = payoff ratio. Full Kelly is too aggressive with estimated inputs; use a fraction (¼ to ½ Kelly) or none. Negative f* means no edge.
- **Portfolio caps:** single-position max weight, sector/asset-class caps, gross and net exposure limits, max leverage, correlation-adjusted risk (positions with ρ > 0.7 behave like one bet).

These are mechanics for the user's own rules, not a recommendation of how much the user should invest.

## 9. Stress testing

- Historical scenarios: 2008 GFC, 2020 Covid crash, 2022 rate shock, crypto events (e.g. May 2022, Nov 2022) applied to current weights.
- Hypothetical shocks: equity −20%, rates +200 bps, volatility ×2, correlations → 1.
- Liquidity: days to exit = position size / (participation rate × average daily volume).

## 10. Reporting

One table with: CAGR, vol, Sharpe, Sortino, max drawdown (and duration), Calmar, VaR/CVaR (method, level, horizon), β vs benchmark, and trade statistics, each beside the benchmark. State the period, frequency, risk-free rate, and whether results are live, paper or backtested.

Python: compute with pandas/numpy (`returns.std(ddof=1)`, `returns.quantile(0.05)`, `(equity / equity.cummax() - 1).min()`). Double-check signs and annualisation on one metric by hand.

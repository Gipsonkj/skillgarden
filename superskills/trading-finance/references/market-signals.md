> Distilled from: digital-oracle (komako-workshop/digital-oracle, MIT), okx-cex-market (okx/agent-skills, MIT), gmgn-market (gmgnai/gmgn-skills, MIT), us-stock-analysis (tradermonty/claude-trading-skills, MIT), ccxt-python (ccxt/ccxt, MIT)

# Market data and signal reading

Signals describe what markets are pricing. They are inputs to the user's own judgment, not trade instructions. Report raw values with dates, then interpret.

## 1. Technical indicators (definitions)

| Indicator | Definition | Common reading |
|---|---|---|
| SMA(n) / EMA(n) | Mean of last n closes / exponentially weighted (α = 2/(n+1)) | Price vs 50/200-day; golden/death cross |
| RSI(14) | 100 − 100/(1 + avg gain/avg loss), Wilder smoothing | > 70 overbought, < 30 oversold; divergences |
| MACD(12,26,9) | EMA12 − EMA26; signal = EMA9 of MACD; histogram = difference | Signal-line crosses, zero-line crosses |
| Bollinger(20,2) | SMA20 ± 2 std | Band squeeze = low vol; walks along band in trends |
| ATR(14) | Wilder average of true range | Volatility for stops and sizing |
| Stochastic / KDJ | Close position within n-period range | Overbought/oversold in ranges |
| VWAP | Σ(price × volume) / Σvolume, intraday | Institutional reference price |
| OBV / volume | Cumulative signed volume | Confirms or diverges from price moves |
Always name the variant and parameters; indicators lag and fail in regime changes. Test any indicator rule with `backtesting.md` before relying on it.

## 2. Multi-signal reading (probability-style questions)

For "what is the market pricing about X" questions (recession, conflict, rate path, bubble, crash probability):
1. **Decompose:** core variable, time window, whether real money trades on it.
2. **Pick at least 3 independent signal families**, for example:
   - Prediction markets: Polymarket, Kalshi (event contracts, Fed rate-decision series).
   - Rates: yield-curve slopes (10Y−2Y, 10Y−3M), real yields, breakevens, policy-rate paths.
   - Commodities and ratios: gold, oil, copper/gold ratio, gold/silver ratio.
   - Positioning: CFTC Commitments of Traders (managed money vs commercials).
   - Options: implied vol, skew, put/call ratio, implied move.
   - Credit and stress: high-yield spreads, VIX, MOVE.
   - Insider activity: SEC Form 4 clusters.
   - Crypto: BTC futures basis, funding rates, total market cap and dominance.
   - FX and country ETFs for country risk.
3. **Route:** keep only signals that are relevant, match the horizon, and add independent information.
4. **Fetch** with dates; label each signal's horizon (a 30-day option vs a 3-year capex cycle) and do not mix horizons in one vote.
5. **Report** as: layered signal table (signal, value, date, horizon, what it implies) → contradictions and how you weigh them → probability scenarios with ranges → signal-consistency rating.
Rules: trading data over opinions; explicit reasoning from price to conclusion; never conclude from one signal. Convert prediction-market prices to probabilities only after noting fees, liquidity and resolution criteria.

## 3. OKX public market data (no API key)

CLI `okx` (npm `@okx_ai/okx-trade-cli`; user installs it). All `okx market ...` commands are read-only and need no credentials:
| Need | Command |
|---|---|
| Price / 24h stats | `okx market ticker BTC-USDT` |
| Candles | `okx market candles BTC-USDT --bar 1H --limit 200` (bar uppercase: `1H`, `4H`, `1D`) |
| Order book | `okx market orderbook BTC-USDT --sz 20` |
| Funding (perps) | `okx market funding-rate BTC-USDT-SWAP [--history]` |
| Open interest / OI change scan | `okx market open-interest --instType SWAP`, `okx market oi-change --instType SWAP --sortBy absOiDeltaPct` |
| Screener | `okx market filter --instType SPOT --quoteCcy USDT --sortBy chg24hPct` |
| Indicators | `okx market indicator rsi BTC-USDT --bar 1Dutc --params 14` (indicator bars use `1Dutc`, `1Wutc`; no `1m`) |
| Non-crypto instruments | `okx market instruments-by-category --instCategory 4` (3 stock tokens, 4 metals, 5 commodities, 6 FX, 7 bonds) |
Instrument ID formats: spot `BTC-USDT`, perp `BTC-USDT-SWAP`, future `BTC-USDT-250328`, option `BTC-USD-250328-95000-C`, index `BTC-USD`. Add `--json` for raw output. Before pulling a long history, estimate the candle count (range / bar length) and confirm with the user if it exceeds ~500. Rate limit about 20 requests per 2 s.

## 4. Exchange data via ccxt (no API key for public data)

```python
import ccxt
ex = ccxt.binance({"enableRateLimit": True})
ex.load_markets()
ex.fetch_ticker("BTC/USDT"); ex.fetch_order_book("BTC/USDT", limit=20)
ex.fetch_ohlcv("BTC/USDT", timeframe="1h", limit=500)   # [ts, o, h, l, c, v]
```
Check `ex.has["fetchOHLCV"]` before calling; paginate with `since` (ms). For anything authenticated see `brokers-exchanges.md`.

## 5. On-chain meme/new tokens (GMGN)

`gmgn-cli market ...` (user-installed, user-configured API key) covers K-lines, trending, new launchpad tokens ("trenches"), signals, hot searches and search across Solana, BSC, Base, Ethereum and others. Field meanings that matter:
| Field | Meaning | Risk reading |
|---|---|---|
| `rug_ratio` | 0–1 rug-pull likelihood | < 0.1 lower; 0.1–0.3 caution; > 0.3 high risk |
| `is_honeypot` | EVM only: contract blocks selling | 1 = cannot sell. Empty on Solana does not mean safe |
| `top_10_holder_rate` | Concentration | > 0.5 high |
| `is_wash_trading`, `bundler_rate`, `rat_trader_amount_rate` | Fake volume, bot-bundled launch buys, insider trading | true or > 0.3 = manipulated activity |
| `renounced_mint`, `renounced_freeze_account` | Solana: creator gave up mint/freeze powers | Both 1 is a minimum baseline |
| `creator_token_status` | `creator_hold` vs `creator_close` | Dev still holding = sell pressure |
| `volume` vs `amount` (kline) | USD value vs token units | Do not confuse |
Omitting `--filter` still applies chain-default safety filters (SOL: renounced, frozen; EVM: not_honeypot, verified, renounced). Present these fields as risk flags. Newly launched tokens are extremely high risk; never frame "smart money" counts as a reason for the user to buy.

## 6. Equity data sources

Free: SEC EDGAR (filings, Form 4), company IR sites, Yahoo Finance/yfinance (unofficial, best effort), Stooq, FRED (macro), US Treasury yield curve. Keyed: FMP, Finnhub, Alpha Vantage, Tiingo, Polygon, broker data APIs (Alpaca `alpaca data bars`). State the source and timestamp of every quote; quotes from free sources may be delayed 15+ minutes.

## 7. Output rules

- Show raw values, time stamps and sources before interpretation.
- Say which environment a figure comes from (live vs demo/testnet) when relevant.
- Separate "what the market prices" from "what will happen".
- End with the strongest contrary signal.

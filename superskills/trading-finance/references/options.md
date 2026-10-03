> Distilled from: options-strategy-advisor (tradermonty/claude-trading-skills, MIT), digital-oracle (komako-workshop/digital-oracle, MIT), vibe-trading (HKUDS/Vibe-Trading, MIT)

# Options: pricing, Greeks, strategy payoffs

Educational analysis of option mechanics and strategy payoffs. No specific trade recommendations for the user.

## 1. Black-Scholes-Merton (European, continuous dividend yield q)

```
d1 = [ln(S/K) + (r − q + σ²/2)·T] / (σ·√T)
d2 = d1 − σ·√T
Call = S·e^(−qT)·N(d1) − K·e^(−rT)·N(d2)
Put  = K·e^(−rT)·N(−d2) − S·e^(−qT)·N(−d1)
```
S spot, K strike, T years to expiry (calendar days / 365), r risk-free (continuous), σ annualised implied vol, q dividend yield. American options (early exercise, especially calls before dividends and deep ITM puts) need a binomial/trinomial model; BSM is an approximation for them.

**Put-call parity (European):** C − P = S·e^(−qT) − K·e^(−rT). A violation beyond costs means a data error or an American-exercise effect.

## 2. Greeks

| Greek | Call | Put | Meaning |
|---|---|---|---|
| Delta | e^(−qT)·N(d1) | e^(−qT)·(N(d1) − 1) | Price change per $1 in S; rough probability of finishing ITM (use N(d2) for the risk-neutral probability) |
| Gamma | e^(−qT)·n(d1) / (S·σ·√T) | same | Delta change per $1 in S; highest ATM near expiry |
| Theta | per day = annual / 365 | | Time decay; accelerates in final weeks |
| Vega | S·e^(−qT)·n(d1)·√T / 100 | same | Price change per 1 vol point |
| Rho | K·T·e^(−rT)·N(d2) / 100 | −K·T·e^(−rT)·N(−d2) / 100 | Per 1% rate change |

## 3. Bundled pricer

`scripts/options-strategy-advisor/black_scholes.py` provides an `OptionPricer` class (needs `numpy` and `scipy`; `requests` only for its optional market-data helpers). It has no command-line flags; running the file prints a worked example. Use it from Python:
```python
import sys; sys.path.insert(0, "scripts/options-strategy-advisor")
from black_scholes import OptionPricer, calculate_historical_volatility
p = OptionPricer(S=180, K=185, T=30/365, r=0.045, sigma=0.28, q=0.005)
p.get_all_greeks("call")    # price, delta, gamma, theta, vega, rho
vol = calculate_historical_volatility(close_prices, window=30)
```
Check one result against a second calculator, and confirm units (theta per day, vega per vol point).

## 4. Volatility

- **Historical (realised) vol:** std of daily log returns × √252 (window 20–30 days typical).
- **Implied vol:** solve BSM for σ given the market price (Newton or bisection).
- **IV vs HV:** IV well above HV means options are pricing more movement than recent history (premium rich); below means cheap. Compare IV with its own 1-year range (IV rank / percentile).
- **Skew:** downside puts usually carry higher IV (crash protection demand).
- **Expected move:** ≈ S × IV × √(days/365); or the ATM straddle price ≈ 0.8 × one standard deviation move. Around earnings, compare the implied move with historical earnings moves.

## 5. Strategy payoff table

| Strategy | Construction | Max profit | Max loss | Breakeven(s) |
|---|---|---|---|---|
| Long call | +C(K) | Unlimited | Premium | K + premium |
| Long put | +P(K) | K − premium | Premium | K − premium |
| Covered call | +stock, −C(K) | K − S0 + premium | S0 − premium | S0 − premium |
| Cash-secured put | −P(K), cash K | Premium | K − premium | K − premium |
| Protective put | +stock, +P(K) | Unlimited | S0 − K + premium | S0 + premium |
| Bull call spread | +C(K1), −C(K2), K1<K2 | K2 − K1 − debit | Debit | K1 + debit |
| Bear put spread | +P(K2), −P(K1) | K2 − K1 − debit | Debit | K2 − debit |
| Bull put credit spread | −P(K2), +P(K1) | Credit | K2 − K1 − credit | K2 − credit |
| Iron condor | short put spread + short call spread | Net credit | Wider wing − credit | Short put − credit; short call + credit |
| Long straddle | +C(K), +P(K) | Unlimited | Total premium | K ± total premium |
| Long strangle | +C(K2), +P(K1) | Unlimited | Total premium | K1 − premium; K2 + premium |
| Collar | +stock, +P(K1), −C(K2) | K2 − S0 − net cost | S0 − K1 + net cost | S0 + net cost |
| Calendar | −near C(K), +far C(K) | Depends on IV | Net debit | Model it |

Per-contract values × 100 (US equity options multiplier). Short naked calls have unlimited risk; short puts can require buying the stock at K.

## 6. How to present a strategy analysis

1. State the view being expressed (direction, volatility, time) as the user's hypothesis, not yours.
2. Price each leg with dated inputs (spot, IV, rate, dividend, days).
3. Show net debit/credit, max profit, max loss, breakevens, probability of profit estimate, and position Greeks.
4. P/L table at expiry for a range of prices (e.g. −20% to +20% in 5% steps), and optionally before expiry at current IV.
5. Scenario notes: IV crush after events, early assignment on short ITM legs (ex-dividend), liquidity (bid-ask width, open interest).
6. Compare 2–3 structures that express the same view, with trade-offs.

## 7. Reading markets through options

Put/call ratio, IV skew and implied moves are sentiment and expected-range signals; combine them with other independent signals (see `market-signals.md`) before drawing conclusions, and label the horizon (an option expiring in 30 days says nothing about next year).

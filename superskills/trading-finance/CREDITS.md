# Credits

This super skill is distilled from the open-source skills below. Text was rewritten and merged; only the four scripts listed were copied as-is, each with its source license beside it (`LICENSE.source-repo`).

| Skill | Repo | License | What was used |
|---|---|---|---|
| backtesting-frameworks | https://github.com/wshobson/agents/tree/main/plugins/quantitative-trading/skills/backtesting-frameworks | MIT | Bias catalogue, walk-forward and out-of-sample design, event-driven vs vectorised trade-offs, cost modelling |
| dcf-model | https://github.com/anthropics/financial-services/tree/main/plugins/vertical-plugins/financial-analysis/skills/dcf-model | Apache-2.0 | DCF build order, UFCF, WACC/CAPM, mid-year convention, terminal value checks, sensitivity grid rules, Office.js vs openpyxl, staged confirmation; `scripts/dcf-model/validate_dcf.py` copied as-is |
| comps-analysis | https://github.com/anthropics/financial-services/tree/main/plugins/vertical-plugins/financial-analysis/skills/comps-analysis | Apache-2.0 | Peer framing, operating/valuation blocks, quartile statistics, sector metric table, sanity ranges, notes section |
| 3-statement-model | https://github.com/anthropics/financial-services/tree/main/plugins/vertical-plugins/financial-analysis/skills/3-statement-model | Apache-2.0 | Template mapping, linkages, working-capital formulas, roll-forwards, integrity checks, credit metrics, scenario hierarchy |
| earnings-analysis | https://github.com/anthropics/financial-services/tree/main/plugins/vertical-plugins/equity-research/skills/earnings-analysis | Apache-2.0 | Beat/miss-first update structure, estimate revisions, citation requirements, report sizing |
| vibe-trading | https://github.com/HKUDS/Vibe-Trading/tree/main/agent | MIT | MCP toolkit summary, backtest workflow, connector paper/read-only behaviour |
| ccxt-python | https://github.com/ccxt/ccxt/tree/master/.claude/skills/ccxt-python | MIT | Unified API calls, precision and limits, error hierarchy, rate limiting, async usage |
| risk-metrics-calculation | https://github.com/wshobson/agents/tree/main/plugins/quantitative-trading/skills/risk-metrics-calculation | MIT | Metric definitions, VaR/CVaR methods, drawdown, beta, stress tests (VaR sign convention corrected) |
| lbo-model | https://github.com/anthropics/financial-services/tree/main/plugins/vertical-plugins/financial-analysis/skills/lbo-model | Apache-2.0 | Template-first rule, formula hierarchy, debt schedule and cash sweep, returns, verification list, font colour conventions |
| initiating-coverage | https://github.com/anthropics/financial-services/tree/main/plugins/vertical-plugins/equity-research/skills/initiating-coverage | Apache-2.0 | Five-task one-at-a-time pipeline, input verification, deliverable standards |
| merger-model | https://github.com/anthropics/financial-services/tree/main/plugins/vertical-plugins/investment-banking/skills/merger-model | Apache-2.0 | Pro forma EPS build, sources & uses, sensitivities, breakeven synergies |
| financial-statements | https://github.com/anthropics/knowledge-work-plugins/tree/main/finance/skills/financial-statements | Apache-2.0 | Management reporting layout, variance decomposition and materiality, accountant-review caveat |
| startup-financial-modeling | https://github.com/wshobson/agents/tree/main/plugins/startup-business-analyst/skills/startup-financial-modeling | MIT | P10/P50/P90 scenarios, horizon, business-model templates and benchmarks, headcount pitfalls, dilution maths (ARR/MRR example inconsistency not carried over) |
| us-stock-analysis | https://github.com/tradermonty/claude-trading-skills/tree/main/skills/us-stock-analysis | MIT | Quick-analysis structure, fundamental and technical checklist, comparison format |
| backtest-expert | https://github.com/tradermonty/claude-trading-skills/tree/main/skills/backtest-expert | MIT | Stress-testing thresholds, sample-size rules, slippage by liquidity; `scripts/backtest-expert/evaluate_backtest.py` copied as-is |
| options-strategy-advisor | https://github.com/tradermonty/claude-trading-skills/tree/main/skills/options-strategy-advisor | MIT | Strategy payoff set, IV vs HV, presentation steps; `scripts/options-strategy-advisor/black_scholes.py` copied as-is |
| okx-cex-market | https://github.com/okx/agent-skills/tree/github-main/skills/okx-cex-market | MIT | Public market-data commands, instrument ID formats, bar formats, history-size confirmation |
| binance | https://github.com/binance/binance-skills-hub/tree/main/skills/binance/binance | MIT | Profiles and environments, security rules, spot endpoints including order-test (prod default overridden to testnet/demo here) |
| alpaca-trading-backtest | https://github.com/alpacahq/alpaca-skills/tree/main/skills/trading-api/backtest | Apache-2.0 | Strategy formalisation, run-folder artifact contract, fill models, teaching-five reporting, disclosures, paper forward-validation |
| gmgn-market | https://github.com/gmgnai/gmgn-skills/tree/main/skills/gmgn-market | MIT | Token risk field meanings and thresholds, chain-default filters |
| serenity-skill | https://github.com/muxuuu/serenity-skill | MIT | Evidence ladder, six-step investment logic, research-priority labels, research boundaries |
| equity-research | https://github.com/rollingSirius/equity-research-skill | MIT | Base-rate discipline, reverse DCF, forensic checks (accruals, M-Score), counterargument step |
| vectorbt | https://github.com/agiprolabs/claude-trading-skills/tree/main/skills/vectorbt | MIT | Vectorised signal/portfolio patterns and pitfalls; `scripts/vectorbt/parameter_sweep.py` copied as-is |
| digital-oracle | https://github.com/komako-workshop/digital-oracle | MIT | Multi-signal method, signal menu by question type, routing tests, structured report |

Notes on sources:
- The Binance skill installs its CLI by piping a remote script to `sh` and defaults to the production environment. Neither is carried over: the router has the user install the CLI themselves and switches to a testnet/demo profile by default.
- The GMGN skill tells the agent to collect the user's API key in chat and apply it with a config command. Not carried over: users configure keys themselves.
- Vibe-Trading's optional `run_swarm` sends prompts to an external OpenAI-compatible LLM API; the reference says to use it only with the user's agreement.
- Factual issues corrected rather than copied: a sign error in risk-metrics' parametric VaR example, a negative-debt-weight WACC allowance in the DCF source (replaced with gross/target weights), and an ARR/MRR mismatch in the startup-model example.
- No source contained instructions to exfiltrate data or disable safeguards.

## Also see (not included)

All 24 sources in this topic's research list were usable and are credited above; nothing was excluded for licence reasons.

# A/B tests and causal questions

> Distilled from: senior-data-scientist (alirezarezvani/claude-skills, MIT), statistical-analysis (K-Dense-AI/scientific-agent-skills, MIT), statistical-analysis (anthropics/knowledge-work-plugins, Apache-2.0), statsmodels (K-Dense-AI/scientific-agent-skills, MIT)

## Designing an A/B test

Write this down before launch:

1. **Hypothesis**: "Changing X will increase Y because Z."
2. **One primary metric** (decides the test), a few **guardrail metrics** (must not get worse: revenue per user, errors, latency, unsubscribes), and secondary metrics labelled exploratory.
3. **Unit of randomisation** (user, account, session) and the unit of analysis. They should match; if you randomise accounts but analyse users, use clustered standard errors.
4. **Minimum detectable effect (MDE)**: the smallest lift worth acting on, not the lift you hope for.
5. **Sample size and duration** from a power calculation. Run at least two weeks and whole business cycles (weekday/weekend, pay cycles), even if the sample is reached sooner.
6. **Stopping rule**: fixed horizon. No peeking and stopping when p dips below 0.05; that inflates false positives a lot. If you must monitor, use a sequential design planned up front.

Sample size for a conversion rate:

```python
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
h = proportion_effectsize(0.12, 0.10)          # 10% baseline → 12% target
n = NormalIndPower().solve_power(effect_size=h, alpha=0.05, power=0.8, ratio=1.0)  # per arm
```

Small baselines and small lifts need very large samples; say so early rather than running an underpowered test.

## Checking the test is valid

- **Sample ratio mismatch (SRM)**: compare observed arm sizes with the planned split using a chi-square goodness-of-fit test. p < 0.001 means assignment or logging is broken; don't interpret the results until it's explained.
- Pre-period balance on key covariates.
- Exposure logged at the point of the change, not at login (dilution otherwise).
- No novelty spike driving everything: look at the effect by week.
- Bots, internal users and test accounts excluded the same way in both arms.

## Analysing

- Conversion: two-proportion z-test (`statsmodels.stats.proportion.proportions_ztest`) plus a CI for the difference in percentage points and relative lift.
- Continuous (revenue per user): Welch's t-test; revenue is heavy-tailed, so also check a bootstrap CI or a winsorised version.
- Variance reduction (CUPED): adjust the outcome with a pre-period covariate to shrink CIs, when pre-period data exist.
- Segment results are exploratory unless pre-registered; apply a multiple-comparison correction ([statistics.md](statistics.md)).
- Readout: decision, primary metric effect with CI, guardrails, SRM check result, duration and sample, caveats.

## When you can't randomise

Be explicit that the result is observational. Options, weakest to strongest in common practice:

| Design | Use when | Key assumption / check |
|---|---|---|
| Regression with controls | You can measure the main confounders | No important unmeasured confounding; say it's associational |
| Propensity score matching / weighting | Treated and untreated differ on observed covariates | Overlap in propensity scores; balance after matching (standardised mean difference < 0.1) |
| **Difference-in-differences** | A change hit one group/region at a known time and a comparable group wasn't affected | Parallel pre-trends: plot both groups before the change and test pre-period interaction terms |
| Interrupted time series | One series, a clear intervention date | No other change at the same time; model seasonality |
| Regression discontinuity | Treatment assigned by a cutoff on a score | No manipulation around the cutoff |
| Synthetic control | One treated unit (a country, a store), many donors | Good pre-period fit |

Difference-in-differences in statsmodels:

```python
import statsmodels.formula.api as smf
m = smf.ols("outcome ~ treated * post", data=df).fit(
    cov_type="cluster", cov_kwds={"groups": df["unit_id"]})
effect = m.params["treated:post"]
```

Cluster standard errors by the unit that was treated (store, region). With few clusters (fewer than about 30), CIs from clustered SEs are too narrow; say so or use a wild cluster bootstrap.

## Language

"Associated with" for observational results; "caused" only with randomisation or a design whose assumptions you checked and stated. Always name the plausible confounders you couldn't rule out.

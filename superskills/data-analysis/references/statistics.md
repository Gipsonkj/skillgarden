# Statistics: describe, test, model

> Distilled from: statistical-analysis (anthropics/knowledge-work-plugins, Apache-2.0), statistical-analysis (K-Dense-AI/scientific-agent-skills, MIT), statsmodels (K-Dense-AI/scientific-agent-skills, MIT), exploratory-data-analysis (K-Dense-AI/scientific-agent-skills, MIT)

## Describing data

- Report **median and IQR** for skewed data (revenue, durations, counts); mean and SD when roughly symmetric. Report both when they differ a lot and say why.
- Percentiles (p50, p90, p95, p99) describe latency, order values and anything with a long tail better than an average.
- Always state n. A rate on 12 users needs a different tone than one on 12,000.
- Outliers: flag with z-score > 3 (only for roughly normal data) or outside Q1 − 1.5×IQR / Q3 + 1.5×IQR. Investigate before removing; report results with and without when they matter. Never delete them silently.

## Choosing a test

Decide the test, the primary outcome, alpha and the comparison **before** looking at results.

| Question | Data | Default | Alternative |
|---|---|---|---|
| Two independent groups differ? | Continuous | **Welch's t-test** (doesn't assume equal variances) | Mann–Whitney U for ordinal or heavily skewed data |
| Same units measured twice? | Continuous, paired | Paired t-test | Wilcoxon signed-rank |
| Three or more groups? | Continuous | Welch ANOVA, then Games–Howell | Kruskal–Wallis, then Dunn |
| Two proportions differ? | Binary | Two-proportion z-test or chi-square | Fisher's exact when expected counts < 5 |
| Categorical association? | Counts table | Chi-square of independence | Fisher's exact for 2×2 small samples |
| Linear association? | Two continuous | Pearson r | Spearman ρ for monotonic/ordinal |
| Effect of several predictors? | Mixed | Regression (below) | |

There's no universal "n ≥ 30 makes it normal" rule. With skewed data or small samples, check assumptions, use a robust or non-parametric test, or bootstrap a confidence interval.

Assumption screens (normality per group, variance homogeneity, outliers, linearity, regression residuals) are in `scripts/statistical-analysis/assumption_checks.py`:

```python
import sys; sys.path.insert(0, "scripts/statistical-analysis")
from assumption_checks import comprehensive_assumption_check, check_regression_diagnostics
report = comprehensive_assumption_check(df, value_col="time_on_task", group_col="variant", alpha=0.05, plot=False)
```

Needs numpy, pandas, scipy, matplotlib. Use it to inform the choice, not to switch tests after seeing which one gives p < 0.05.

## Effect size and uncertainty beat p-values

Always report an effect size with a 95% confidence interval alongside any p-value.

| Measure | Small | Medium | Large |
|---|---|---|---|
| Cohen's d / Hedges' g (mean difference) | 0.2 | 0.5 | 0.8 |
| Partial η² (ANOVA) | 0.01 | 0.06 | 0.14 |
| r (correlation) | 0.1 | 0.3 | 0.5 |
| Cramér's V (df=1) | 0.1 | 0.3 | 0.5 |

These labels are rough; the business meaning of the difference (pp of conversion, £ per user) is what matters. **Statistically significant ≠ practically important**: with a million rows, trivial differences are "significant". **Not significant ≠ no effect**: report the CI to show what effects are still plausible.

## Multiple comparisons

When you test many metrics, segments or pairs, control errors: Holm (family-wise, more powerful than Bonferroni) when any false positive is costly; Benjamini–Hochberg (false discovery rate) for exploratory screens. Better still, name one primary metric in advance and label the rest exploratory.

## Power and sample size

Plan sample size before collecting data:

```python
from statsmodels.stats.power import tt_ind_solve_power
n_per_group = tt_ind_solve_power(effect_size=0.5, alpha=0.05, power=0.8)   # ≈ 64 per group
```

`FTestAnovaPower().solve_power(...)` returns the **total** sample size across all groups, not per group. Don't compute "observed power" after the fact; it's just a restatement of the p-value. For conversion-rate experiments see [experiments-causal.md](experiments-causal.md).

## Regression with statsmodels

General rules:
- Add the intercept explicitly with the array API: `sm.add_constant(X)`. The formula API (`smf.ols("y ~ x1 + C(region)", data=df)`) adds it for you.
- Pass `missing="raise"` so dropped rows don't go unnoticed; handle missing values yourself first.
- Check residuals, leverage and influence (Cook's distance), and multicollinearity (VIF > 5–10 is a warning).
- Use robust standard errors when residual variance isn't constant (`cov_type="HC3"`), or clustered ones when observations are grouped (`cov_type="cluster", cov_kwds={"groups": df.firm}`).

| Outcome | Model | Notes |
|---|---|---|
| Continuous | OLS (`smf.ols`) | Check linearity, residual normality and variance; log-transform skewed outcomes and interpret as % change |
| Binary | Logit (`smf.logit`) | Report odds ratios `np.exp(params)` or, better, average marginal effects `get_margeff()` |
| Counts | Poisson (`smf.poisson`) | If variance ≫ mean (overdispersion), use Negative Binomial; many structural zeros → zero-inflated (ZIP/ZINB) |
| Time series | ARIMA/SARIMAX (`tsa.arima.model.ARIMA`) | Test stationarity with ADF and KPSS together; difference as needed; check residuals with Ljung–Box; forecast with intervals |
| Grouped / repeated | Mixed effects (`smf.mixedlm`) or GEE | When rows aren't independent (users with many sessions) |

Interpretation: a coefficient is the expected change in the outcome per unit change of the predictor, holding the others fixed. In observational data this is association, not causation.

## Reporting format

"Variant B users completed onboarding more often (62.4% vs 58.1%, difference 4.3 pp, 95% CI 1.9 to 6.7 pp; two-proportion z-test, z = 3.5, p < .001; n = 4,812 and 4,790)."

Include: test name, statistic, exact p (or p < .001), effect size with CI, n per group, any exclusions and why, and whether the analysis was pre-specified or exploratory.

`pingouin` is a convenient alternative that returns effect sizes and CIs together (`pg.ttest`, `pg.welch_anova`, `pg.pairwise_gameshowell`) when it's installed.

# Predictive models with scikit-learn

> Distilled from: scikit-learn (K-Dense-AI/scientific-agent-skills, MIT), senior-data-scientist (alirezarezvani/claude-skills, MIT), exploratory-data-analysis (K-Dense-AI/scientific-agent-skills, MIT)

## Before modelling

- Is prediction the goal? If the question is "why" or "what was the effect", use statistics or causal methods ([statistics.md](statistics.md), [experiments-causal.md](experiments-causal.md)).
- Define the target precisely and the moment of prediction: only features known **at that moment** are allowed.
- Pick the metric from the business cost of errors before training.
- Start with a baseline: `DummyClassifier`/`DummyRegressor`, then a simple model (logistic or linear regression), then something stronger (gradient boosting). Report all three.

## Leakage: the most common failure

- Split **before** any fitting step (scaling, imputation, encoding, feature selection, target encoding, resampling). Put those steps inside a `Pipeline` so cross-validation refits them per fold.
- Lag and rolling features must use only past data relative to each row's timestamp, computed within each split or with strict time-aware logic. Never compute them over the whole dataset before splitting.
- **Grouped data** (several rows per customer, patient, device): use `GroupKFold`/`StratifiedGroupKFold` so the same entity isn't in train and test.
- **Time-ordered data**: `TimeSeriesSplit` or a chronological holdout; never shuffle.
- Watch for features that are consequences of the target (refund flag predicting churn, "days since cancellation").
- Suspiciously high scores (AUC > 0.95 on a hard problem) mean: look for leakage first.
- `scripts/exploratory-data-analysis/scripts/missingness_leakage_audit.py` checks entity, group and time overlap across a split column (see [data-profiling.md](data-profiling.md)).

## Standard pipeline

```python
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate

pre = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), num_cols),
    ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")),
                      ("onehot", OneHotEncoder(handle_unknown="ignore", min_frequency=20))]), cat_cols),
])
model = Pipeline([("pre", pre), ("clf", HistGradientBoostingClassifier(random_state=0))])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
scores = cross_validate(model, X_train, y_train, cv=cv, scoring=["roc_auc", "average_precision"])
```

Imputation here is a deliberate choice made inside the pipeline; report it. Add `add_indicator=True` to `SimpleImputer` when missingness itself may carry signal.

Which models need scaling: linear/logistic regression, SVMs, k-NN, neural nets, PCA, k-means. Tree ensembles (random forest, gradient boosting) don't. `HistGradientBoosting*` handles missing values and (with `categorical_features`) categories natively.

## Tuning and evaluation

- Hold out a final test set; tune with cross-validation on the training set only (`GridSearchCV`/`RandomizedSearchCV`/`HalvingRandomSearchCV` around the whole pipeline). Touch the test set once.
- Nested CV when you need an unbiased estimate of a tuned model's performance on small data.
- Report mean ± SD across folds, not the best fold.

Metrics:

| Task | Use | Notes |
|---|---|---|
| Balanced classification | ROC AUC, accuracy, F1 | |
| Imbalanced classification | **Average precision (PR AUC)**, recall at a fixed precision, F1 | Accuracy and ROC AUC look good on rare positives while missing them |
| Probabilities used for decisions | Brier score, calibration curve (`CalibrationDisplay`) | Calibrate with `CalibratedClassifierCV` if needed |
| Regression | MAE (robust, interpretable), RMSE (penalises large errors), R² | Compare to the baseline's error |
| Ranking | NDCG, precision@k | |

Imbalance: try `class_weight="balanced"` and threshold tuning (`TunedThresholdClassifierCV`) before resampling. If you resample (SMOTE), do it only inside training folds.

Choose the decision threshold from costs (cost of a false positive vs false negative), not 0.5 by default.

## Interpreting

- Permutation importance on held-out data (`sklearn.inspection.permutation_importance`) is more reliable than impurity-based importance.
- Partial dependence / ICE plots (`PartialDependenceDisplay`) for how a feature moves predictions.
- SHAP if installed, for per-prediction explanations.
- Importance is not causation.

## Unsupervised

- Clustering: scale features first; k-means for compact round clusters (choose k with silhouette score plus business sense), DBSCAN/HDBSCAN for irregular shapes and noise. Describe clusters by their feature profiles and sizes.
- Dimensionality reduction: PCA for linear structure and preprocessing (check explained variance); t-SNE/UMAP for visualisation only, not distances.

## Shipping a model

- Persist the whole pipeline (`joblib.dump(model, "model.joblib")`) with the sklearn version recorded.
- Write a model card: purpose, data period, features, metrics on the test set by segment, known failure modes, fairness checks if decisions affect people.
- Monitor input drift and performance after launch; set a retraining trigger.

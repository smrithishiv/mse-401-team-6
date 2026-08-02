"""
Demand Forecasting Model Comparison
Food Bank of Waterloo Region — "Breaking Bread" Capstone (MSE 401)

Forecasts `total_people_served` (unique individuals served, i.e. the sum of
household sizes across households) and compares five approaches head-to-head:

  1. SARIMAX with 2 lagged socioeconomic regressors (order + trend selected
     by held-out validation RMSE, not just in-sample AIC)
  2. Damped-trend Holt-Winters exponential smoothing (no exogenous inputs —
     the benchmark method used in the Rakestraw MIT food-bank study cited in
     the project report)
  3. Linear trend regression: time trend + annual seasonality (sin/cos) +
     the same 2 lagged exogenous regressors, fit by OLS. Simpler and more
     stable than SARIMAX on a ~40-90 row sample, in line with Lentz et al.'s
     preference for transparent regression models over complex ones.
  4. Ridge regression: time trend + seasonality + ALL 7 available lagged
     socioeconomic indicators (employment, inflation x2, housing, and 3
     population/vulnerability measures). SARIMAX and OLS couldn't handle
     this many correlated regressors (near-singular covariance, exploding
     coefficients) — Ridge's L2 penalty is specifically built to stay stable
     under multicollinearity, so it can incorporate the fuller indicator set
     your project's "≥4 socioeconomic indicators" requirement calls for
     without the numerical blowups SARIMAX had.
  5. Seasonal naive baseline (this month = same month last year)

Two training-window configurations are each run through all five models so
you can see whether more (but older, pre-2022) history helps or hurts.

Usage
-----
    python sarimax_model.py

Expects a CSV named Model_Ready.csv (edit DATA_PATH below if it lives
elsewhere), with at least these columns:
    month, total_people_served, unemployment_rate_lag1, total_homeless_lag1,
    cpi_all_items_lag1, cpi_food_lag1, cpi_shelter_lag1,
    ow_beneficiaries_lag1, odsp_beneficiaries_lag1

Outputs (written to ./sarimax_outputs_N/ — auto-incrementing so past runs
are never overwritten):
    metrics_comparison.csv                        - MAE/RMSE/WAPE/Bias/R2 for every model x range, long format
    actual_vs_predicted_<range>.png               - all 5 forecasts vs. actual, per range
    feature_importance_sarimax_<range>.png/.csv    - SARIMAX standardized exog coefficients
    feature_importance_linear_<range>.png/.csv     - OLS linear model standardized coefficients
    feature_importance_ridge_<range>.png/.csv      - Ridge model standardized coefficients (all 7 indicators)
    model_summary_sarimax_<range>.txt             - full statsmodels SARIMAX summary
    model_summary_linear_<range>.txt              - full statsmodels OLS summary
    model_summary_ridge_<range>.txt               - selected alpha + coefficients
    model_summary_holtwinters_<range>.txt         - fitted smoothing parameters
"""

import itertools
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.api as sm
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import TimeSeriesSplit
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.exponential_smoothing.ets import ETSModel

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# CONFIG — edit these to match your data / desired experiment setup
# ---------------------------------------------------------------------------
# Anchored to this script's own folder (sarimax_model/) so it works no matter
# where you run `python sarimax.py` from. Adjust the relative part if you
# move clean_data/ elsewhere.
DATA_PATH = Path(__file__).resolve().parent / ".." / "clean_data" / "Model_Ready.csv"
TARGET = "total_people_served"

# Lagged socioeconomic regressors. Using the *_lag1 versions (prior month's
# value) means every regressor is already known at forecast time, so there's
# no leakage when producing a real 1-month-ahead forecast.
#
# Trimmed from the original 6 candidates to these 2: the dropped ones
# (cpi_all_items_lag1, cpi_food_lag1, ow_beneficiaries_lag1,
# odsp_beneficiaries_lag1) are all pairwise-correlated at 0.63-0.99 with
# total_homeless_lag1 and each other (they're all riding the same secular
# growth trend), which produced a near-singular covariance matrix
# (condition number ~1e22) and made every coefficient statistically
# meaningless. unemployment_rate_lag1 and total_homeless_lag1 are the pair
# with the lowest mutual correlation (-0.25) and the most direct causal
# link to food-bank demand. Both SARIMAX and the linear model below use
# this same trimmed set.
EXOG_COLS = [
    "unemployment_rate_lag1",
    "total_homeless_lag1",
]

# Full candidate set of lagged socioeconomic indicators, used only by the
# Ridge model below. Covers your project's required categories: employment
# (unemployment_rate), inflation (cpi_all_items, cpi_food), housing
# (cpi_shelter), and population/vulnerability (ow_beneficiaries,
# odsp_beneficiaries, total_homeless) — 7 indicators, satisfying the "≥4
# socioeconomic indicators as input features" requirement outright. SARIMAX
# and OLS can't use this full set (that's what caused the near-singular
# covariance matrix / exploding coefficients you saw); Ridge's L2 penalty
# is built to stay stable when regressors are this correlated.
FULL_EXOG_COLS = [
    "unemployment_rate_lag1",
    "cpi_all_items_lag1",
    "cpi_food_lag1",
    "cpi_shelter_lag1",
    "ow_beneficiaries_lag1",
    "odsp_beneficiaries_lag1",
    "total_homeless_lag1",
]

SEASONAL_PERIOD = 12  # monthly data -> annual seasonality

# Two training/testing windows to compare, per project requirements.
# Both test on Jul 2025 onward; they differ only in how far back training goes.
EXPERIMENTS = {
    "range1": {
        "label": "Range 1: Train 2019-02–2025-06 / Test 2025-07 onward",
        "train_start": "2019-02-01",
        "train_end": "2025-06-30",
        "test_start": "2025-07-01",
    },
    "range2": {
        "label": "Range 2: Train 2022–2025-06 / Test 2025-07 onward",
        "train_start": "2022-01-01",
        "train_end": "2025-06-30",
        "test_start": "2025-07-01",
    },
}

# SARIMAX order search grid (kept small so the script finishes in a
# reasonable time on ~50-90 monthly observations). Widen if you want a more
# exhaustive search, or swap in pmdarima.auto_arima if you have it installed.
P_RANGE = range(0, 3)
D_RANGE = (0, 1)
Q_RANGE = range(0, 3)
SEASONAL_P_RANGE = range(0, 2)
SEASONAL_D_RANGE = (0, 1)
SEASONAL_Q_RANGE = range(0, 2)

# Deterministic trend to fit alongside (p,d,q): None lets differencing alone
# handle any trend, "t" adds an explicit linear time trend. total_people_served
# grows almost monotonically rather than oscillating around a stable level, so
# letting the grid search compare both against validation RMSE (it'll skip
# combos where trend order <= d, which statsmodels rejects) lets the data decide.
TREND_OPTIONS = (None, "t")

# Create sarimax_outputs_3, sarimax_outputs_4, ... inside this script's folder.
_BASE_DIR = Path(__file__).resolve().parent

def _next_output_dir():
    n = 3
    while (_BASE_DIR / f"sarimax_outputs_{n}").exists():
        n += 1
    out = _BASE_DIR / f"sarimax_outputs_{n}"
    out.mkdir(parents=True, exist_ok=False)
    return out

OUTPUT_DIR = _next_output_dir()


# ---------------------------------------------------------------------------
# DATA LOADING
# ---------------------------------------------------------------------------
def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["month"])
    df = df.sort_values("month").set_index("month")
    df = df.asfreq("MS")  # enforce monthly-start frequency; exposes any gaps as NaN rows

    # Model_Ready contains earlier years where socioeconomic variables are
    # unavailable. Keep only complete months before passing data to any model.
    df = df.dropna()

    if df.empty:
        raise ValueError(
            f"No complete rows remain after dropping missing values from {path}."
        )

    print(
        f"Using complete data from {df.index.min().date()} "
        f"to {df.index.max().date()} ({len(df)} months)"
    )
    return df


# ---------------------------------------------------------------------------
# METRICS
# ---------------------------------------------------------------------------
def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    wape = np.sum(np.abs(y_true - y_pred)) / np.sum(np.abs(y_true)) * 100
    # Bias = mean signed error (pred - actual), NOT mean absolute error.
    # Negative = model systematically underpredicts; positive = overpredicts.
    # Same convention as the Random Forest team's numbers, so this is
    # directly comparable across the whole team's model comparison matrix.
    bias = np.mean(y_pred - y_true)
    r2 = r2_score(y_true, y_pred)
    return {"MAE": mae, "RMSE": rmse, "WAPE_%": wape, "Bias": bias, "R2": r2}


# ---------------------------------------------------------------------------
# TRAIN-SET (IN-SAMPLE) RMSE — for reading off overfitting/underfitting:
# Train_RMSE << test RMSE means the model fit the training window closely
# but didn't generalize (overfitting); both high means it didn't even fit
# its own training data well (underfitting). fitted may have leading NaNs
# (e.g. ARIMA differencing eats the first few observations), so align and
# drop them before scoring rather than letting them propagate to NaN RMSE.
# ---------------------------------------------------------------------------
def train_rmse(y_train: pd.Series, fitted: pd.Series) -> float:
    aligned = pd.concat([y_train.rename("actual"), fitted.rename("fitted")], axis=1).dropna()
    if aligned.empty:
        return np.nan
    return np.sqrt(mean_squared_error(aligned["actual"], aligned["fitted"]))


# ---------------------------------------------------------------------------
# STD-DEV OF PER-ORIGIN WAPE — a variance/stability signal distinct from the
# pooled WAPE in compute_metrics(): a model can have a low pooled WAPE but
# swing wildly from one rolling origin to the next (high variance / very
# sensitive to which window it happened to be trained on), which the pooled
# number alone can't reveal. df must have "origin", "actual", "predicted"
# columns (the raw rolling-backtest record format used by every rolling
# script in this project).
# ---------------------------------------------------------------------------
def wape_std_across_origins(df: pd.DataFrame) -> float:
    per_origin_wape = df.groupby("origin").apply(
        lambda g: np.sum(np.abs(g["actual"] - g["predicted"])) / np.sum(np.abs(g["actual"])) * 100,
        include_groups=False,
    )
    return per_origin_wape.std()


# ---------------------------------------------------------------------------
# SEASONAL NAIVE BASELINE (this month = same month last year)
# ---------------------------------------------------------------------------
def seasonal_naive_forecast(train: pd.DataFrame, test: pd.DataFrame,
                             target: str, period: int = 12) -> pd.Series:
    history = pd.concat([train[target], test[target]])
    preds = []
    for date in test.index:
        ref_date = date - pd.DateOffset(months=period)
        preds.append(history.get(ref_date, train[target].iloc[-1]))
    return pd.Series(preds, index=test.index)


# ---------------------------------------------------------------------------
# NAIVE BASELINE (persistence: forecast = last observed value, repeated for
# every step of the horizon) — no seasonality, no exogenous inputs. Distinct
# from seasonal_naive_forecast() above, which uses the same month last year
# instead of the most recent month.
# ---------------------------------------------------------------------------
def naive_forecast(train: pd.DataFrame, test: pd.DataFrame, target: str) -> pd.Series:
    last_value = train[target].iloc[-1]
    return pd.Series([last_value] * len(test), index=test.index)


# ---------------------------------------------------------------------------
# HOLT-WINTERS (DAMPED TREND) — no exogenous inputs
# Falls back to trend-only (no seasonal component) if there isn't enough
# history to estimate a full seasonal cycle reliably.
# ---------------------------------------------------------------------------
def holt_winters_forecast(train: pd.DataFrame, test: pd.DataFrame,
                           target: str, seasonal_period: int = 12):
    y_train = train[target]
    use_seasonal = len(y_train) >= 2 * seasonal_period + 1
    if not use_seasonal:
        print(f"  [Holt-Winters] Only {len(y_train)} training rows — not enough for a "
              f"reliable seasonal component (need >= {2 * seasonal_period + 1}); "
              f"fitting damped trend only.")

    model = ExponentialSmoothing(
        y_train,
        trend="add",
        damped_trend=True,
        seasonal="add" if use_seasonal else None,
        seasonal_periods=seasonal_period if use_seasonal else None,
        initialization_method="estimated",
    )
    fit = model.fit(optimized=True)
    y_pred = fit.forecast(len(test))
    y_pred.index = test.index
    return y_pred, fit


# ---------------------------------------------------------------------------
# LINEAR TREND REGRESSION — time trend + annual seasonality (sin/cos) + exog
# Fit by OLS (statsmodels) rather than sklearn so it exposes p-values,
# letting it reuse the same exog_feature_importance() table as SARIMAX.
# Sin/cos terms capture the annual cycle with 2 parameters instead of 11
# month dummies, which matters when training sets are only 40-80 rows.
# ---------------------------------------------------------------------------
def _linear_design_matrix(idx: pd.DatetimeIndex, anchor: pd.Timestamp,
                           exog: pd.DataFrame, seasonal_period: int) -> pd.DataFrame:
    months_since_anchor = ((idx.year - anchor.year) * 12 + (idx.month - anchor.month)).astype(float)
    X = pd.DataFrame({
        "trend": months_since_anchor,
        "month_sin": np.sin(2 * np.pi * idx.month / seasonal_period),
        "month_cos": np.cos(2 * np.pi * idx.month / seasonal_period),
    }, index=idx)
    return pd.concat([X, exog], axis=1)


def linear_trend_forecast(train: pd.DataFrame, test: pd.DataFrame, target: str,
                           exog_cols: list, seasonal_period: int = 12):
    anchor = train.index.min()
    X_train = _linear_design_matrix(train.index, anchor, train[exog_cols], seasonal_period)
    X_test = _linear_design_matrix(test.index, anchor, test[exog_cols], seasonal_period)

    # standardize on train stats — keeps coefficients comparable to each
    # other (feature importance) and numerically well-scaled
    X_mean = X_train.mean()
    X_std = X_train.std().replace(0, 1)
    X_train_z = sm.add_constant((X_train - X_mean) / X_std, has_constant="add")
    X_test_z = sm.add_constant((X_test - X_mean) / X_std, has_constant="add")

    y_train = train[target]
    fit = sm.OLS(y_train, X_train_z).fit()
    y_pred = pd.Series(fit.predict(X_test_z), index=test.index)
    return y_pred, fit


# ---------------------------------------------------------------------------
# RIDGE REGRESSION — time trend + seasonality + ALL socioeconomic indicators
#
# Same design as linear_trend_forecast, but (a) uses the full 7-indicator
# set instead of the trimmed 2, and (b) fits with L2-penalized (Ridge)
# regression instead of plain OLS. The penalty shrinks correlated
# coefficients together instead of letting them blow up, which is exactly
# what OLS/SARIMAX couldn't handle about this feature set. Alpha (penalty
# strength) is picked by time-series cross-validation on the training set
# only, so no test-period information leaks into model selection.
# ---------------------------------------------------------------------------
def ridge_trend_forecast(train: pd.DataFrame, test: pd.DataFrame, target: str,
                          exog_cols: list, seasonal_period: int = 12):
    anchor = train.index.min()
    X_train = _linear_design_matrix(train.index, anchor, train[exog_cols], seasonal_period)
    X_test = _linear_design_matrix(test.index, anchor, test[exog_cols], seasonal_period)

    X_mean = X_train.mean()
    X_std = X_train.std().replace(0, 1)
    X_train_z = (X_train - X_mean) / X_std
    X_test_z = (X_test - X_mean) / X_std

    y_train = train[target]
    n_splits = min(5, max(len(y_train) // 8, 2))
    tscv = TimeSeriesSplit(n_splits=n_splits)
    alphas = np.logspace(-2, 3, 30)
    ridge = RidgeCV(alphas=alphas, cv=tscv)
    ridge.fit(X_train_z, y_train)
    y_pred = pd.Series(ridge.predict(X_test_z), index=test.index)
    train_pred = pd.Series(ridge.predict(X_train_z), index=train.index)

    # Ridge coefficients don't come with classical p-values (regularization
    # biases the estimator, so standard-error theory doesn't directly
    # apply) — the importance table here is coefficient magnitude only.
    importance = pd.DataFrame({
        "feature": X_train.columns,
        "std_coefficient": ridge.coef_,
        "abs_std_coefficient": np.abs(ridge.coef_),
    }).sort_values("abs_std_coefficient", ascending=False).reset_index(drop=True)

    return y_pred, ridge, importance, train_pred


# ---------------------------------------------------------------------------
# ORDER SELECTION — small grid search, scored on held-out validation RMSE
#
# AIC alone isn't enough here: it only measures in-sample fit, so it can
# (and did, in practice) pick a candidate whose AR/trend combination is
# stable in-sample but explodes when extrapolated 12 steps ahead. Holding
# out the last `validation_size` months of the training window and scoring
# each candidate on its actual forecast error catches that — an exploding
# or non-finite forecast just loses on validation RMSE instead of silently
# winning on AIC.
# ---------------------------------------------------------------------------
def grid_search_sarimax(y: pd.Series, exog: pd.DataFrame, seasonal_period: int,
                         validation_size: int = 12):
    n_val = min(validation_size, max(len(y) // 4, 1))
    y_fit, y_val = y.iloc[:-n_val], y.iloc[-n_val:]
    if exog is not None:
        exog_fit, exog_val = exog.iloc[:-n_val], exog.iloc[-n_val:]
    else:
        exog_fit, exog_val = None, None

    best_rmse = np.inf
    best_order = None
    best_seasonal_order = None
    best_trend = None
    for p, d, q in itertools.product(P_RANGE, D_RANGE, Q_RANGE):
        for P, D, Q in itertools.product(SEASONAL_P_RANGE, SEASONAL_D_RANGE, SEASONAL_Q_RANGE):
            for trend in TREND_OPTIONS:
                try:
                    model = SARIMAX(
                        y_fit, exog=exog_fit,
                        order=(p, d, q),
                        seasonal_order=(P, D, Q, seasonal_period),
                        trend=trend,
                        enforce_stationarity=False,
                        enforce_invertibility=False,
                    )
                    fit = model.fit(disp=False)
                    pred = fit.get_forecast(steps=n_val, exog=exog_val).predicted_mean
                    if not np.all(np.isfinite(pred)):
                        continue
                    rmse = np.sqrt(mean_squared_error(y_val, pred))
                    if rmse < best_rmse:
                        best_rmse = rmse
                        best_order = (p, d, q)
                        best_seasonal_order = (P, D, Q, seasonal_period)
                        best_trend = trend
                except Exception:
                    continue
    if best_order is None:
        # fallback if every candidate failed to converge
        best_order, best_seasonal_order, best_trend = (1, 1, 1), (0, 0, 0, seasonal_period), None
    return best_order, best_seasonal_order, best_trend, best_rmse


# ---------------------------------------------------------------------------
# AUTO-ETS ORDER SELECTION — small grid search over trend/damping/seasonal
# component combinations, scored on held-out validation RMSE (same procedure
# as grid_search_sarimax above). Error is fixed to additive: Holt-Winters
# (damped additive trend, additive seasonal) is one specific point in this
# grid, so this searches the wider ETS family around it rather than assuming
# damped trend is the right choice.
# ---------------------------------------------------------------------------
def grid_search_ets(y: pd.Series, seasonal_period: int, validation_size: int = 12):
    n_val = min(validation_size, max(len(y) // 4, 1))
    y_fit, y_val = y.iloc[:-n_val], y.iloc[-n_val:]

    trend_options = (None, "add")
    seasonal_options = (None, "add") if len(y_fit) >= 2 * seasonal_period + 1 else (None,)

    best_rmse = np.inf
    best_trend = None
    best_damped = False
    best_seasonal = None
    for trend in trend_options:
        damped_options = (False, True) if trend is not None else (False,)
        for damped in damped_options:
            for seasonal in seasonal_options:
                try:
                    model = ETSModel(
                        y_fit, error="add", trend=trend, damped_trend=damped,
                        seasonal=seasonal,
                        seasonal_periods=seasonal_period if seasonal else None,
                    )
                    fit = model.fit(disp=False)
                    pred = fit.forecast(n_val)
                    if not np.all(np.isfinite(pred)):
                        continue
                    rmse = np.sqrt(mean_squared_error(y_val, pred))
                    if rmse < best_rmse:
                        best_rmse = rmse
                        best_trend, best_damped, best_seasonal = trend, damped, seasonal
                except Exception:
                    continue
    if best_trend is None and best_seasonal is None and best_rmse == np.inf:
        # fallback if every candidate failed to converge
        best_trend, best_damped, best_seasonal, best_rmse = "add", True, None, np.nan
    return best_trend, best_damped, best_seasonal, best_rmse


# ---------------------------------------------------------------------------
# AUTO-ETS forecast with a FIXED (already-chosen) configuration.
# ---------------------------------------------------------------------------
def ets_forecast(train: pd.DataFrame, test: pd.DataFrame, target: str, seasonal_period: int,
                  trend, damped: bool, seasonal):
    y_train = train[target]
    model = ETSModel(
        y_train, error="add", trend=trend, damped_trend=damped if trend is not None else False,
        seasonal=seasonal, seasonal_periods=seasonal_period if seasonal else None,
    )
    fit = model.fit(disp=False)
    pred = fit.forecast(len(test))
    pred.index = test.index
    return pred, fit


# ---------------------------------------------------------------------------
# FEATURE IMPORTANCE
# Works for any statsmodels result with .params / .pvalues (SARIMAX or OLS).
# Since exog is z-scored before fitting, each coefficient already represents
# the effect of a 1-SD change in that regressor, so magnitudes are directly
# comparable across features.
# ---------------------------------------------------------------------------
def exog_feature_importance(fit_result, feature_cols: list) -> pd.DataFrame:
    params = fit_result.params
    pvalues = fit_result.pvalues
    rows = []
    for col in feature_cols:
        if col in params.index:
            rows.append({
                "feature": col,
                "std_coefficient": params[col],
                "abs_std_coefficient": abs(params[col]),
                "p_value": pvalues.get(col, np.nan),
            })
    imp = pd.DataFrame(rows).sort_values("abs_std_coefficient", ascending=False)
    imp["significant_p<0.05"] = imp["p_value"] < 0.05
    return imp.reset_index(drop=True)


# ---------------------------------------------------------------------------
# RUN ONE EXPERIMENT (one training/testing window, all 5 models)
# ---------------------------------------------------------------------------
def run_experiment(df: pd.DataFrame, key: str, cfg: dict):
    label = cfg["label"]
    print(f"\n{'=' * 70}\n{label}\n{'=' * 70}")

    train = df.loc[cfg["train_start"]:cfg["train_end"]]
    test = df.loc[cfg["test_start"]:]

    # Missing rows were already removed globally in load_data(), ensuring
    # every model is trained and evaluated on the same complete months.

    if len(train) < 24:
        print(f"  Only {len(train)} training rows available (need >= 24 for a "
              f"seasonal model) — skipping this range.")
        return None
    if len(test) == 0:
        print("  No test rows available in this window — skipping.")
        return None

    y_train = train[TARGET]
    exog_train = train[EXOG_COLS]
    y_test = test[TARGET]
    exog_test = test[EXOG_COLS]

    # standardize exog (fit on train only) for numerical stability and
    # directly comparable feature-importance coefficients
    exog_mean = exog_train.mean()
    exog_std = exog_train.std().replace(0, 1)
    exog_train_z = (exog_train - exog_mean) / exog_std
    exog_test_z = (exog_test - exog_mean) / exog_std

    print(f"  Train: {y_train.index.min().date()} to {y_train.index.max().date()} "
          f"({len(y_train)} months)")
    print(f"  Test:  {y_test.index.min().date()} to {y_test.index.max().date()} "
          f"({len(y_test)} months)")

    # ---------------- 1. SARIMAX ----------------
    print("  [SARIMAX] Searching order (grid search on held-out validation RMSE)... "
          "this may take a minute.")
    order, seasonal_order, trend, val_rmse = grid_search_sarimax(y_train, exog_train_z, SEASONAL_PERIOD)
    print(f"  [SARIMAX] Best order={order}, seasonal_order={seasonal_order}, trend={trend!r}, "
          f"validation RMSE={val_rmse:.2f}")

    sarimax_model = SARIMAX(
        y_train, exog=exog_train_z, order=order, seasonal_order=seasonal_order, trend=trend,
        enforce_stationarity=False, enforce_invertibility=False,
    )
    sarimax_fit = sarimax_model.fit(disp=False)
    aic = sarimax_fit.aic

    sarimax_forecast = sarimax_fit.get_forecast(steps=len(y_test), exog=exog_test_z)
    sarimax_pred = sarimax_forecast.predicted_mean
    sarimax_pred.index = y_test.index
    sarimax_ci = sarimax_forecast.conf_int()
    sarimax_ci.index = y_test.index

    sarimax_importance = exog_feature_importance(sarimax_fit, EXOG_COLS)

    # ---------------- 2. Holt-Winters (damped trend) ----------------
    print("  [Holt-Winters] Fitting damped-trend exponential smoothing...")
    hw_pred, hw_fit = holt_winters_forecast(train, test, TARGET, SEASONAL_PERIOD)

    # ---------------- 3. Linear trend + seasonality + exog (2 indicators) ----------------
    print("  [Linear Trend] Fitting OLS (trend + seasonality + exog)...")
    linear_pred, linear_fit = linear_trend_forecast(train, test, TARGET, EXOG_COLS, SEASONAL_PERIOD)
    linear_feature_cols = ["trend", "month_sin", "month_cos"] + EXOG_COLS
    linear_importance = exog_feature_importance(linear_fit, linear_feature_cols)

    # ---------------- 4. Ridge regression + seasonality (7 indicators) ----------------
    print("  [Ridge] Fitting Ridge regression (trend + seasonality + all socioeconomic indicators)...")
    ridge_pred, ridge_fit, ridge_importance, ridge_train_pred = ridge_trend_forecast(
        train, test, TARGET, FULL_EXOG_COLS, SEASONAL_PERIOD
    )
    print(f"  [Ridge] Selected alpha={ridge_fit.alpha_:.3f}")

    # ---------------- 5. Seasonal naive baseline ----------------
    naive_pred = seasonal_naive_forecast(train, test, TARGET, SEASONAL_PERIOD)

    # ---------------- metrics for all 5 ----------------
    metrics_by_model = {
        "SARIMAX": compute_metrics(y_test.values, sarimax_pred.values),
        "Holt-Winters (damped)": compute_metrics(y_test.values, hw_pred.values),
        "Linear Trend + Exog": compute_metrics(y_test.values, linear_pred.values),
        "Ridge (All Socioeconomic Indicators)": compute_metrics(y_test.values, ridge_pred.values),
        "Seasonal Naive": compute_metrics(y_test.values, naive_pred.values),
    }

    # ---------------- train-set (in-sample) RMSE, for reading off
    # overfitting/underfitting: Train_RMSE far below test RMSE means the
    # model fit its training window closely but didn't generalize; both
    # high means it didn't even fit training data well. Seasonal Naive has
    # no fitted parameters to overfit/underfit with, so it's left NaN.
    # ---------------------------------------------------------------------
    train_rmse_by_model = {
        "SARIMAX": train_rmse(y_train, sarimax_fit.fittedvalues),
        "Holt-Winters (damped)": train_rmse(y_train, hw_fit.fittedvalues),
        "Linear Trend + Exog": train_rmse(y_train, linear_fit.fittedvalues),
        "Ridge (All Socioeconomic Indicators)": train_rmse(y_train, ridge_train_pred),
        "Seasonal Naive": np.nan,
    }
    for model_name, m in metrics_by_model.items():
        m["Train_RMSE"] = train_rmse_by_model[model_name]
        m["Overfit_Gap_%"] = (
            (m["RMSE"] - m["Train_RMSE"]) / m["Train_RMSE"] * 100
            if np.isfinite(m["Train_RMSE"]) and m["Train_RMSE"] > 0
            else np.nan
        )

    print()
    for model_name, metrics in metrics_by_model.items():
        print(f"  --- {model_name} ---")
        for k, v in metrics.items():
            print(f"    {k}: {v:,.3f}")
    best_model_name = min(metrics_by_model, key=lambda m: metrics_by_model[m]["RMSE"])
    print(f"\n  Best model by RMSE: {best_model_name} "
          f"(RMSE={metrics_by_model[best_model_name]['RMSE']:,.2f})")

    # ---- actual vs. predicted plot (all 5 models) ----
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(y_train.index, y_train, label="Train (actual)", color="gray")
    ax.plot(y_test.index, y_test, label="Test (actual)", color="black", marker="o", linewidth=2)
    ax.plot(y_test.index, sarimax_pred, label="SARIMAX", color="tab:blue", marker="o")
    ax.fill_between(y_test.index, sarimax_ci.iloc[:, 0], sarimax_ci.iloc[:, 1],
                     color="tab:blue", alpha=0.12, label="SARIMAX 95% CI")
    ax.plot(y_test.index, hw_pred, label="Holt-Winters (damped)", color="tab:green", marker="s")
    ax.plot(y_test.index, linear_pred, label="Linear Trend + Exog", color="tab:red", marker="^")
    ax.plot(y_test.index, ridge_pred, label="Ridge (All Socioeconomic Indicators)", color="tab:purple", marker="d")
    ax.plot(y_test.index, naive_pred, label="Seasonal Naive", color="tab:orange", linestyle="--")
    ax.set_title(f"Actual vs. Predicted — {label}")
    ax.set_ylabel(TARGET)
    ax.legend(fontsize=8)
    fig.autofmt_xdate()
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / f"actual_vs_predicted_{key}.png", dpi=150)
    plt.close(fig)

    # ---- SARIMAX feature importance plot ----
    fig2, ax2 = plt.subplots(figsize=(8, 4))
    ax2.barh(sarimax_importance["feature"], sarimax_importance["abs_std_coefficient"], color="tab:blue")
    ax2.set_xlabel("|Standardized coefficient| (effect of a 1-SD change in the regressor)")
    ax2.set_title(f"SARIMAX Exogenous Feature Importance — {label}")
    ax2.invert_yaxis()
    fig2.tight_layout()
    fig2.savefig(OUTPUT_DIR / f"feature_importance_sarimax_{key}.png", dpi=150)
    plt.close(fig2)

    # ---- Linear model feature importance plot ----
    fig3, ax3 = plt.subplots(figsize=(8, 4))
    ax3.barh(linear_importance["feature"], linear_importance["abs_std_coefficient"], color="tab:red")
    ax3.set_xlabel("|Standardized coefficient|")
    ax3.set_title(f"Linear Trend Model Feature Importance — {label}")
    ax3.invert_yaxis()
    fig3.tight_layout()
    fig3.savefig(OUTPUT_DIR / f"feature_importance_linear_{key}.png", dpi=150)
    plt.close(fig3)

    # ---- Ridge model feature importance plot ----
    fig4, ax4 = plt.subplots(figsize=(8, 4))
    ax4.barh(ridge_importance["feature"], ridge_importance["abs_std_coefficient"], color="tab:purple")
    ax4.set_xlabel("|Standardized coefficient|")
    ax4.set_title(f"Ridge Model Feature Importance (All Socioeconomic Indicators) — {label}")
    ax4.invert_yaxis()
    fig4.tight_layout()
    fig4.savefig(OUTPUT_DIR / f"feature_importance_ridge_{key}.png", dpi=150)
    plt.close(fig4)

    sarimax_importance.to_csv(OUTPUT_DIR / f"feature_importance_sarimax_{key}.csv", index=False)
    linear_importance.to_csv(OUTPUT_DIR / f"feature_importance_linear_{key}.csv", index=False)
    ridge_importance.to_csv(OUTPUT_DIR / f"feature_importance_ridge_{key}.csv", index=False)

    with open(OUTPUT_DIR / f"model_summary_sarimax_{key}.txt", "w") as f:
        f.write(str(sarimax_fit.summary()))
    with open(OUTPUT_DIR / f"model_summary_linear_{key}.txt", "w") as f:
        f.write(str(linear_fit.summary()))
    with open(OUTPUT_DIR / f"model_summary_ridge_{key}.txt", "w") as f:
        f.write("Ridge Regression (trend + seasonality + all socioeconomic indicators)\n")
        f.write("=" * 60 + "\n")
        f.write(f"Selected alpha (via TimeSeriesSplit CV): {ridge_fit.alpha_:.4f}\n\n")
        f.write("Standardized coefficients:\n")
        f.write(ridge_importance.to_string(index=False))
        f.write("\n\n(Note: Ridge coefficients are regularized point estimates, not\n"
                "classical OLS estimates, so no p-values are reported here — "
                "regularization biases the estimator in a way that standard\n"
                "significance testing doesn't directly apply to.)\n")
    with open(OUTPUT_DIR / f"model_summary_holtwinters_{key}.txt", "w") as f:
        params = hw_fit.params
        f.write("Holt-Winters (damped trend) fitted parameters\n")
        f.write("=" * 50 + "\n")
        for name in ["smoothing_level", "smoothing_trend", "damping_trend", "smoothing_seasonal"]:
            if name in params:
                f.write(f"{name}: {params[name]:.4f}\n")
        f.write(f"\nSSE: {hw_fit.sse:.2f}\n")
        f.write(f"AIC: {hw_fit.aic:.2f}\n")

    return {
        "key": key,
        "label": label,
        "order": order,
        "seasonal_order": seasonal_order,
        "trend": trend,
        "aic": aic,
        "ridge_alpha": ridge_fit.alpha_,
        "metrics_by_model": metrics_by_model,
        "best_model": best_model_name,
        "sarimax_importance": sarimax_importance,
        "linear_importance": linear_importance,
        "ridge_importance": ridge_importance,
    }


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    df = load_data(DATA_PATH)
    missing = [c for c in [TARGET] + FULL_EXOG_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing expected columns in {DATA_PATH}: {missing}")

    results = []
    for key, cfg in EXPERIMENTS.items():
        res = run_experiment(df, key, cfg)
        if res:
            results.append(res)

    if not results:
        print("\nNo experiment produced results — check your date ranges against "
              "the actual date coverage of Model_Ready.csv.")
        return

    # long format: one row per (experiment, model) so it scales cleanly if
    # more models get added later
    comparison_rows = []
    for res in results:
        for model_name, metrics in res["metrics_by_model"].items():
            row = {"experiment": res["label"], "model": model_name}
            if model_name == "SARIMAX":
                row["order"] = str(res["order"])
                row["seasonal_order"] = str(res["seasonal_order"])
                row["trend"] = str(res["trend"])
                row["AIC"] = res["aic"]
            elif model_name == "Ridge (All Socioeconomic Indicators)":
                row["ridge_alpha"] = res["ridge_alpha"]
            row.update(metrics)
            row["is_best_in_experiment"] = model_name == res["best_model"]
            comparison_rows.append(row)
    comparison_df = pd.DataFrame(comparison_rows)
    comparison_df.to_csv(OUTPUT_DIR / "metrics_comparison.csv", index=False)

    print(f"\n\n{'=' * 70}\nMETRICS COMPARISON ACROSS RANGES AND MODELS\n{'=' * 70}")
    print(comparison_df.to_string(index=False))
    print("\nBest model per range (by RMSE):")
    for res in results:
        print(f"  {res['label']}: {res['best_model']}")
    print(f"\nAll outputs saved to: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()
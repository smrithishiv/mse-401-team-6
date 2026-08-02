"""
Rolling-Origin Backtest — Ridge Regression (10 Socioeconomic Indicators)
Food Bank of Waterloo Region — "Breaking Bread" Capstone (MSE 401)

lagged_regression.ipynb only evaluates two fixed train/test splits (train
2019-2025-06 or 2022-2025-06, both tested on 2025-07 onward). This script
instead walks forward one month at a time across all available history —
same design as sarimax_model/rollingoriginbacktest.py and
modeling/gam/gam_rolling_backtest.py — so this model's 1-3 month
operational accuracy can be compared on equal footing with the other models
in this project.

Model and feature set are unchanged from the notebook: StandardScaler +
Ridge(alpha=1) on the same 20-column feature list (time features,
autoregressive demand lags/rolling averages, and 10 lagged socioeconomic
indicators spanning OW, ODSP, homelessness, CPI, and unemployment). Ridge is
cheap enough to refit at every origin (unlike SARIMAX's order search), so
there's no "select once" step here — alpha is already fixed at 1 in the
notebook, not cross-validated, so nothing needs to be pinned down before the
rolling loop starts.

Holt-Winters (damped) and Seasonal Naive are included as reference points,
imported directly from sarimax_model/sarimax.py, so results are directly
comparable to sarimax_model/rolling_backtest_outputs_* and
modeling/gam/gam_rolling_backtest_outputs_*.

Setup
-----
Must be run with sarimax_model/ two directories up (../../sarimax_model
relative to this file) so the Holt-Winters / Seasonal Naive imports resolve.

Usage
-----
    python regression_rolling_backtest.py

Outputs (written to ./rolling_backtest_outputs_N/):
    rolling_backtest_raw.csv              - every individual origin/horizon/model forecast vs. actual
    rolling_backtest_summary.csv          - MAE/RMSE/WAPE/Bias/R2 per model, broken out by horizon (1/2/3mo)
    rolling_backtest_overall.csv          - same metrics per model, pooled across all horizons
    rolling_backtest_wape_by_horizon.png  - WAPE vs. forecast horizon, one line per model
"""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge

_BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(_BASE_DIR))
sys.path.append(str(_BASE_DIR.parent.parent / "sarimax_model"))

from preprocess import load_and_clean
from sarimax import (
    TARGET,
    SEASONAL_PERIOD,
    compute_metrics,
    wape_std_across_origins,
    seasonal_naive_forecast,
    naive_forecast,
    holt_winters_forecast,
)

# ---------------------------------------------------------------------------
# CONFIG — matches sarimax_model/rollingoriginbacktest.py's rolling settings
# ---------------------------------------------------------------------------
ROLLING_MIN_TRAIN_MONTHS = 36
ROLLING_HORIZON = 3
ROLLING_STEP = 1

DATA_PATH = _BASE_DIR / ".." / ".." / "clean_data" / "Model_Ready.csv"

# Same 20-column feature list as lagged_regression.ipynb cell 3.
FEATURES = [
    "year", "month_num",
    "total_people_served_lag1", "total_people_served_lag2",
    "total_people_served_lag3", "total_people_served_lag6",
    "total_people_served_lag12",
    "total_people_served_rollingavg3", "total_people_served_rollingavg6",
    "total_people_served_rollingavg12",
    "ow_cases_official_lag1", "ow_beneficiaries_lag1",
    "odsp_cases_official_lag1", "odsp_beneficiaries_lag1",
    "total_homeless_lag1", "total_chronic_homeless_lag1",
    "cpi_all_items_lag1", "cpi_food_lag1", "cpi_shelter_lag1",
    "unemployment_rate_lag1",
]


def _next_output_dir() -> Path:
    n = 1
    while (_BASE_DIR / f"rolling_backtest_outputs_{n}").exists():
        n += 1
    out = _BASE_DIR / f"rolling_backtest_outputs_{n}"
    out.mkdir(parents=True, exist_ok=False)
    return out


OUTPUT_DIR = _next_output_dir()


# ---------------------------------------------------------------------------
# SANITY CHECK — same idea as the other rolling-backtest scripts.
# ---------------------------------------------------------------------------
def is_sane_forecast(pred: pd.Series, train_target: pd.Series, max_multiple: float = 20.0) -> bool:
    values = pred.values.astype(float)
    if not np.all(np.isfinite(values)):
        return False
    bound = max_multiple * train_target.abs().max()
    if np.any(np.abs(values) > bound):
        return False
    return True


# ---------------------------------------------------------------------------
# RIDGE REGRESSION forecast — refit fresh at every origin (same Pipeline as
# the notebook: StandardScaler + Ridge(alpha=1))
# ---------------------------------------------------------------------------
def ridge_forecast(train: pd.DataFrame, test: pd.DataFrame) -> pd.Series:
    X_train, y_train = train[FEATURES], train[TARGET]
    X_test = test[FEATURES]

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("ridge", Ridge(alpha=1)),
    ])
    model.fit(X_train, y_train)
    pred = pd.Series(model.predict(X_test), index=test.index)
    return pred


# ---------------------------------------------------------------------------
# ROLLING-ORIGIN BACKTEST
# ---------------------------------------------------------------------------
def run_rolling_origin_backtest(df: pd.DataFrame):
    print(f"\n{'=' * 70}\nROLLING-ORIGIN BACKTEST — Ridge Regression (10 indicators) "
          f"({ROLLING_HORIZON}-month horizon, step={ROLLING_STEP} month)\n{'=' * 70}")

    n = len(df)
    records = []
    n_origins = 0
    n_ridge_unstable = 0
    unstable_origins = []

    for start in range(ROLLING_MIN_TRAIN_MONTHS, n - ROLLING_HORIZON + 1, ROLLING_STEP):
        train = df.iloc[:start]
        test = df.iloc[start:start + ROLLING_HORIZON]
        origin_date = train.index[-1]

        ridge_pred = None
        try:
            candidate = ridge_forecast(train, test)
            if is_sane_forecast(candidate, train[TARGET]):
                ridge_pred = candidate
            else:
                n_ridge_unstable += 1
                unstable_origins.append(str(origin_date.date()))
        except Exception:
            n_ridge_unstable += 1
            unstable_origins.append(str(origin_date.date()))

        hw_pred, _ = holt_winters_forecast(train, test, TARGET, SEASONAL_PERIOD)
        seasonal_naive_pred = seasonal_naive_forecast(train, test, TARGET, SEASONAL_PERIOD)
        naive_pred = naive_forecast(train, test, TARGET)

        preds_by_model = {
            "Holt-Winters (damped) [reference]": hw_pred,
            "Seasonal Naive [reference]": seasonal_naive_pred,
            "Naive [reference]": naive_pred,
        }
        if ridge_pred is not None:
            preds_by_model["Ridge Regression (10 Indicators)"] = ridge_pred

        for h, date in enumerate(test.index, start=1):
            actual = test[TARGET].loc[date]
            for model_name, pred in preds_by_model.items():
                records.append({
                    "origin": origin_date,
                    "target_month": date,
                    "horizon": h,
                    "model": model_name,
                    "actual": actual,
                    "predicted": pred.loc[date],
                })
        n_origins += 1

    print(f"Ran {n_origins} forecast origins "
          f"(training window grew from {ROLLING_MIN_TRAIN_MONTHS} to {n - ROLLING_HORIZON} months).")
    if n_ridge_unstable > 0:
        print(f"Ridge Regression produced a numerically unstable/implausible forecast on "
              f"{n_ridge_unstable} of {n_origins} origins ({n_ridge_unstable / n_origins:.0%}) — "
              f"those origins are excluded from its averages below (the reference models still "
              f"include them).")
        print(f"  Unstable origins: {', '.join(unstable_origins)}")

    if n_origins == 0:
        print("No origins produced results — check ROLLING_MIN_TRAIN_MONTHS against your data length.")
        return None, None, None

    results_df = pd.DataFrame(records)
    results_df.to_csv(OUTPUT_DIR / "rolling_backtest_raw.csv", index=False)

    summary_rows = []
    for (model_name, h), group in results_df.groupby(["model", "horizon"]):
        m = compute_metrics(group["actual"].values, group["predicted"].values)
        m["model"] = model_name
        m["horizon"] = h
        m["n_origins"] = len(group)
        m["WAPE_std_%"] = wape_std_across_origins(group)
        summary_rows.append(m)
    summary_df = pd.DataFrame(summary_rows)[
        ["model", "horizon", "n_origins", "MAE", "RMSE", "WAPE_%", "WAPE_std_%", "Bias", "R2"]
    ].sort_values(["horizon", "WAPE_%"]).reset_index(drop=True)
    summary_df.to_csv(OUTPUT_DIR / "rolling_backtest_summary.csv", index=False)

    print("\nRolling-origin backtest — accuracy by forecast horizon (averaged across all origins):")
    print(summary_df.to_string(index=False))

    overall_rows = []
    for model_name, group in results_df.groupby("model"):
        m = compute_metrics(group["actual"].values, group["predicted"].values)
        m["model"] = model_name
        m["n_forecasts"] = len(group)
        m["WAPE_std_%"] = wape_std_across_origins(group)
        overall_rows.append(m)
    overall_df = pd.DataFrame(overall_rows)[
        ["model", "n_forecasts", "MAE", "RMSE", "WAPE_%", "WAPE_std_%", "Bias", "R2"]
    ].sort_values("WAPE_%").reset_index(drop=True)
    overall_df.to_csv(OUTPUT_DIR / "rolling_backtest_overall.csv", index=False)

    print("\nOverall (all 1-3 month horizons pooled):")
    print(overall_df.to_string(index=False))

    fig, ax = plt.subplots(figsize=(8, 5))
    colors = {
        "Ridge Regression (10 Indicators)": "tab:purple",
        "Holt-Winters (damped) [reference]": "tab:green",
        "Seasonal Naive [reference]": "tab:orange",
        "Naive [reference]": "tab:gray",
    }
    for model_name in summary_df["model"].unique():
        sub = summary_df[summary_df["model"] == model_name].sort_values("horizon")
        ax.plot(sub["horizon"], sub["WAPE_%"], marker="o", label=model_name,
                color=colors.get(model_name))
    ax.set_xlabel("Forecast horizon (months ahead)")
    ax.set_ylabel("WAPE %")
    ax.set_xticks(sorted(results_df["horizon"].unique()))
    ax.set_title(f"Rolling-Origin Backtest (Ridge Regression): WAPE by Forecast Horizon\n"
                 f"({n_origins} origins, {ROLLING_MIN_TRAIN_MONTHS}+ months training each)")
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / "rolling_backtest_wape_by_horizon.png", dpi=150)
    plt.close(fig)

    return results_df, summary_df, overall_df


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    df_full, df_model_ready = load_and_clean(str(DATA_PATH))
    df = df_model_ready.set_index("month", drop=False).asfreq("MS")

    missing = [c for c in [TARGET] + FEATURES if c not in df.columns]
    if missing:
        raise ValueError(f"Missing expected columns: {missing}")

    run_rolling_origin_backtest(df)

    print(f"\nAll outputs saved to: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()

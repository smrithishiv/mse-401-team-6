"""
Rolling-Origin Backtest — GAM Model, 1-3 Month Forecast Horizon
Food Bank of Waterloo Region — "Breaking Bread" Capstone (MSE 401)

gam_notebook.ipynb only evaluates the GAM on ONE fixed train/test split
(train < 2025-07, test >= 2025-07). This script instead walks forward one
month at a time across all available history — same design as
sarimax_model/rollingoriginbacktest.py and sarimax_model/othermodels.py —
so the GAM's 1-3 month operational accuracy can be compared on equal footing
with the other models in this project.

The GAM structure and hyperparameters (n_splines/lam per term) are fixed to
the "final tuned model" selected in gam_notebook.ipynb's grid search (cell
12-13: n_splines=7, lam=20 on the trend term; n_splines=12 cyclic on
seasonality; n_splines=8 on each of the 3 selected drivers) and reused at
every origin, rather than re-tuned per origin — same rationale as SARIMAX's
order being selected once in rollingoriginbacktest.py: re-gridsearching at
~50 origins would be slow, and re-tuning per window risks overfitting the
window rather than testing robustness of one chosen specification.

Holt-Winters (damped) and Seasonal Naive are included as reference points,
imported directly from sarimax_model/sarimax.py, so results are directly
comparable to sarimax_model/rolling_backtest_outputs_*.

Setup
-----
Needs pygam (`pip install pygam`) and must be run with sarimax_model/ two
directories up (../../sarimax_model relative to this file) so the
Holt-Winters / Seasonal Naive imports resolve.

Usage
-----
    python gam_rolling_backtest.py

Outputs (written to ./gam_rolling_backtest_outputs_N/):
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
from pygam import LinearGAM, s

_BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(_BASE_DIR))
sys.path.append(str(_BASE_DIR.parent.parent / "sarimax_model"))

from data_prep import load_and_clean, add_gam_features
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

# Selected drivers from gam_notebook.ipynb (cell 3), chosen via
# correlation / detrended-correlation analysis.
SELECTED_DRIVERS = [
    "unemployment_rate_lag1",
    "odsp_cases_official_lag1",
    "cpi_food_lag1",
]
FEATURE_COLS = ["time_index", "month_num"] + SELECTED_DRIVERS


def _next_output_dir() -> Path:
    n = 1
    while (_BASE_DIR / f"gam_rolling_backtest_outputs_{n}").exists():
        n += 1
    out = _BASE_DIR / f"gam_rolling_backtest_outputs_{n}"
    out.mkdir(parents=True, exist_ok=False)
    return out


OUTPUT_DIR = _next_output_dir()


# ---------------------------------------------------------------------------
# SANITY CHECK — same idea as the other rolling-backtest scripts'
# is_sane_forecast(): a forecast that's finite but numerically implausible
# (GAM extrapolating a spline well past its training range) shouldn't
# silently corrupt the averages.
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
# GAM forecast with FIXED hyperparameters (the notebook's "final model")
# ---------------------------------------------------------------------------
def gam_forecast_fixed(train: pd.DataFrame, test: pd.DataFrame) -> pd.Series:
    X_train = train[FEATURE_COLS].values
    y_train_log = train["log_total_people_served"].values
    X_test = test[FEATURE_COLS].values

    gam = LinearGAM(
        s(0, n_splines=7, lam=20)
        + s(1, basis="cp", edge_knots=[0.5, 12.5], n_splines=12)
        + s(2, n_splines=8)
        + s(3, n_splines=8)
        + s(4, n_splines=8)
    ).fit(X_train, y_train_log)

    pred_log = gam.predict(X_test)
    pred = pd.Series(np.exp(pred_log), index=test.index)
    return pred


# ---------------------------------------------------------------------------
# ROLLING-ORIGIN BACKTEST
# ---------------------------------------------------------------------------
def run_rolling_origin_backtest(df: pd.DataFrame):
    print(f"\n{'=' * 70}\nROLLING-ORIGIN BACKTEST — GAM "
          f"({ROLLING_HORIZON}-month horizon, step={ROLLING_STEP} month)\n{'=' * 70}")
    print(f"GAM hyperparameters fixed at the notebook's final-tuned config "
          f"(trend n_splines=7 lam=20, seasonality n_splines=12 cyclic, "
          f"drivers n_splines=8 each), selected once and reused at every origin")

    n = len(df)
    records = []
    n_origins = 0
    n_gam_unstable = 0
    unstable_origins = []

    for start in range(ROLLING_MIN_TRAIN_MONTHS, n - ROLLING_HORIZON + 1, ROLLING_STEP):
        train = df.iloc[:start]
        test = df.iloc[start:start + ROLLING_HORIZON]
        origin_date = train.index[-1]

        gam_pred = None
        try:
            candidate = gam_forecast_fixed(train, test)
            if is_sane_forecast(candidate, train[TARGET]):
                gam_pred = candidate
            else:
                n_gam_unstable += 1
                unstable_origins.append(str(origin_date.date()))
        except Exception:
            n_gam_unstable += 1
            unstable_origins.append(str(origin_date.date()))

        hw_pred, _ = holt_winters_forecast(train, test, TARGET, SEASONAL_PERIOD)
        seasonal_naive_pred = seasonal_naive_forecast(train, test, TARGET, SEASONAL_PERIOD)
        naive_pred = naive_forecast(train, test, TARGET)

        preds_by_model = {
            "Holt-Winters (damped) [reference]": hw_pred,
            "Seasonal Naive [reference]": seasonal_naive_pred,
            "Naive [reference]": naive_pred,
        }
        if gam_pred is not None:
            preds_by_model["GAM"] = gam_pred

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
    if n_gam_unstable > 0:
        print(f"GAM produced a numerically unstable/implausible or non-converging forecast on "
              f"{n_gam_unstable} of {n_origins} origins ({n_gam_unstable / n_origins:.0%}) — "
              f"those origins are excluded from GAM's averages below (the reference models still "
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
        "GAM": "tab:red",
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
    ax.set_title(f"Rolling-Origin Backtest (GAM): WAPE by Forecast Horizon\n"
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
    gam_df = add_gam_features(df_model_ready)
    df = gam_df.set_index("month", drop=False).asfreq("MS")

    missing = [c for c in [TARGET, "log_total_people_served"] + FEATURE_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing expected columns: {missing}")

    run_rolling_origin_backtest(df)

    print(f"\nAll outputs saved to: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()

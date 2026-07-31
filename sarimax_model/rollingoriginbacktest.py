"""
Rolling-Origin Backtest — 1-3 Month Forecast Horizon
Food Bank of Waterloo Region — "Breaking Bread" Capstone (MSE 401)

The fixed-range experiments in sarimax.py each do ONE forecast: train once,
then predict every month of a 12-month test period from that single frozen
starting point. That's a legitimate backtest, but it answers "how good is a
12-month-ahead blind forecast" — a much harder task than this project's
actual "1-3 month operational forecasting" requirement, where in practice
you'd re-run the model monthly as new actuals arrive.

This script instead walks forward one month at a time across all available
history: at each origin, train on everything up to that point, forecast only
ROLLING_HORIZON months ahead, score it, then move the origin forward by
ROLLING_STEP and repeat. Averaging error across many origins is far more
representative of real-world 1-3 month accuracy than one 12-month point
estimate, and it also shows whether accuracy degrades a lot between a
1-month-ahead forecast and a 3-month-ahead one.

SARIMAX's (p,d,q)(P,D,Q,trend) is selected ONCE — via a fresh grid search on
all available history, using the exact same grid_search_sarimax() function
imported from sarimax.py — rather than re-searched at every origin.
Re-running the full grid search (144+ candidates) at each of ~50 origins
would take a long time, and re-selecting the order per origin risks the same
overfitting-to-one-window problem the validation-RMSE search was built to
avoid in the first place. Instead, this script tests how robust that ONE
chosen specification is across every rolling-origin window.

Setup
-----
This file imports its model-fitting functions (SARIMAX helpers, Holt-Winters,
Linear Trend, Ridge, seasonal naive, metrics, data loading) directly from
sarimax.py, so it MUST live in the same folder as sarimax.py, and that file
must still be named exactly `sarimax.py` (not renamed). It reads the same
Model_Ready.csv location that sarimax.py is configured to use.

Usage
-----
    python rolling_backtest.py

Outputs (written to ./rolling_backtest_outputs_N/ — auto-incrementing so
past runs are never overwritten):
    rolling_backtest_raw.csv              - every individual origin/horizon/model forecast vs. actual
    rolling_backtest_summary.csv          - MAE/RMSE/WAPE/Bias/R2 per model, broken out by horizon (1/2/3mo)
    rolling_backtest_overall.csv          - same metrics per model, pooled across all horizons
    rolling_backtest_wape_by_horizon.png  - WAPE vs. forecast horizon, one line per model
"""

from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX

# ---------------------------------------------------------------------------
# Shared functions and config, imported from sarimax.py so nothing here can
# silently drift out of sync with how those models are actually defined.
# ---------------------------------------------------------------------------
from sarimax import (
    DATA_PATH,
    TARGET,
    EXOG_COLS,
    FULL_EXOG_COLS,
    SEASONAL_PERIOD,
    load_data,
    compute_metrics,
    seasonal_naive_forecast,
    holt_winters_forecast,
    linear_trend_forecast,
    ridge_trend_forecast,
    grid_search_sarimax,
)

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
# Minimum months of history before the first forecast origin. Needs to be
# >= 24 for Holt-Winters/SARIMAX seasonal components to be estimable at all;
# 36 gives them a bit more room to be reliable at the earliest origins.
ROLLING_MIN_TRAIN_MONTHS = 36
# How many months ahead to forecast from each origin. 3 matches this
# project's "1-3 month" operational forecasting requirement, and lets you
# see accuracy broken out separately by 1/2/3-month-ahead horizon.
ROLLING_HORIZON = 3
# How many months to advance between origins. 1 = re-forecast every month
# (maximum number of origins, most overlap between windows).
ROLLING_STEP = 1

_BASE_DIR = Path(__file__).resolve().parent


def _next_output_dir() -> Path:
    n = 1
    while (_BASE_DIR / f"rolling_backtest_outputs_{n}").exists():
        n += 1
    out = _BASE_DIR / f"rolling_backtest_outputs_{n}"
    out.mkdir(parents=True, exist_ok=False)
    return out


OUTPUT_DIR = _next_output_dir()


# ---------------------------------------------------------------------------
# SARIMAX forecast with a FIXED (already-chosen) order — no grid search here,
# that only happens once in main() before the rolling loop starts.
# ---------------------------------------------------------------------------
def sarimax_forecast_fixed(train: pd.DataFrame, test: pd.DataFrame, target: str,
                            exog_cols: list, order: tuple, seasonal_order: tuple, trend):
    exog_train = train[exog_cols]
    exog_test = test[exog_cols]
    exog_mean = exog_train.mean()
    exog_std = exog_train.std().replace(0, 1)
    exog_train_z = (exog_train - exog_mean) / exog_std
    exog_test_z = (exog_test - exog_mean) / exog_std

    y_train = train[target]
    model = SARIMAX(
        y_train, exog=exog_train_z, order=order, seasonal_order=seasonal_order, trend=trend,
        enforce_stationarity=False, enforce_invertibility=False,
    )
    fit = model.fit(disp=False)
    pred = fit.get_forecast(steps=len(test), exog=exog_test_z).predicted_mean
    pred.index = test.index
    return pred


# ---------------------------------------------------------------------------
# SANITY CHECK for SARIMAX forecasts.
#
# A fixed (p,d,q)(P,D,Q) order that's numerically stable on the training
# window it was chosen from is NOT guaranteed to stay stable on every other
# rolling-origin window. When it doesn't, statsmodels can return a forecast
# that's technically a finite float but numerically meaningless (values like
# 1e79) rather than raising an exception — np.isfinite() alone won't catch
# that, since 1e79 IS finite. Comparing the forecast's magnitude to the
# training data's own scale does catch it: total_people_served has never
# been anywhere near, say, 20x its own historical max, so a "forecast" that
# large is a numerical blowup, not a real prediction.
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
# ROLLING-ORIGIN BACKTEST
# ---------------------------------------------------------------------------
def run_rolling_origin_backtest(df: pd.DataFrame, sarimax_order: tuple,
                                 sarimax_seasonal_order: tuple, sarimax_trend):
    print(f"\n{'=' * 70}\nROLLING-ORIGIN BACKTEST "
          f"({ROLLING_HORIZON}-month horizon, step={ROLLING_STEP} month)\n{'=' * 70}")
    print(f"SARIMAX order fixed at {sarimax_order}{sarimax_seasonal_order}, trend={sarimax_trend!r} "
          f"(selected once on all available history, then validated across every origin below)")

    n = len(df)
    records = []
    n_origins = 0
    n_sarimax_unstable = 0
    unstable_origins = []
    for start in range(ROLLING_MIN_TRAIN_MONTHS, n - ROLLING_HORIZON + 1, ROLLING_STEP):
        train = df.iloc[:start]
        test = df.iloc[start:start + ROLLING_HORIZON]
        origin_date = train.index[-1]

        sarimax_pred = None
        try:
            candidate = sarimax_forecast_fixed(
                train, test, TARGET, EXOG_COLS, sarimax_order, sarimax_seasonal_order, sarimax_trend
            )
            if is_sane_forecast(candidate, train[TARGET]):
                sarimax_pred = candidate
            else:
                n_sarimax_unstable += 1
                unstable_origins.append(str(origin_date.date()))
        except Exception:
            n_sarimax_unstable += 1
            unstable_origins.append(str(origin_date.date()))

        hw_pred, _ = holt_winters_forecast(train, test, TARGET, SEASONAL_PERIOD)
        linear_pred, _ = linear_trend_forecast(train, test, TARGET, EXOG_COLS, SEASONAL_PERIOD)
        ridge_pred, _, _ = ridge_trend_forecast(train, test, TARGET, FULL_EXOG_COLS, SEASONAL_PERIOD)
        naive_pred = seasonal_naive_forecast(train, test, TARGET, SEASONAL_PERIOD)

        preds_by_model = {
            "Holt-Winters (damped)": hw_pred,
            "Linear Trend + Exog": linear_pred,
            "Ridge (All Socioeconomic Indicators)": ridge_pred,
            "Seasonal Naive": naive_pred,
        }
        # SARIMAX only included for this origin if its forecast passed the
        # sanity check — an unstable origin is excluded from SARIMAX's own
        # average rather than corrupting it, but every other model still
        # gets scored on this origin normally.
        if sarimax_pred is not None:
            preds_by_model["SARIMAX"] = sarimax_pred

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
    if n_sarimax_unstable > 0:
        print(f"SARIMAX produced a numerically unstable/implausible forecast on "
              f"{n_sarimax_unstable} of {n_origins} origins ({n_sarimax_unstable / n_origins:.0%}) — "
              f"those origins are excluded from SARIMAX's averages below (all other models still "
              f"include them). This fixed order was chosen for stability on one specific training "
              f"window, so instability on some other windows is itself a meaningful robustness finding, "
              f"not just noise to discard.")
        print(f"  Unstable origins: {', '.join(unstable_origins)}")

    if n_origins == 0:
        print("No origins produced results — check ROLLING_MIN_TRAIN_MONTHS against your data length.")
        return None, None, None

    results_df = pd.DataFrame(records)
    results_df.to_csv(OUTPUT_DIR / "rolling_backtest_raw.csv", index=False)

    # ---- summary per model x horizon ----
    summary_rows = []
    for (model_name, h), group in results_df.groupby(["model", "horizon"]):
        m = compute_metrics(group["actual"].values, group["predicted"].values)
        m["model"] = model_name
        m["horizon"] = h
        m["n_origins"] = len(group)
        summary_rows.append(m)
    summary_df = pd.DataFrame(summary_rows)[
        ["model", "horizon", "n_origins", "MAE", "RMSE", "WAPE_%", "Bias", "R2"]
    ].sort_values(["horizon", "WAPE_%"]).reset_index(drop=True)
    summary_df.to_csv(OUTPUT_DIR / "rolling_backtest_summary.csv", index=False)

    print("\nRolling-origin backtest — accuracy by forecast horizon (averaged across all origins):")
    print(summary_df.to_string(index=False))

    # ---- overall summary, all horizons pooled ----
    overall_rows = []
    for model_name, group in results_df.groupby("model"):
        m = compute_metrics(group["actual"].values, group["predicted"].values)
        m["model"] = model_name
        m["n_forecasts"] = len(group)
        overall_rows.append(m)
    overall_df = pd.DataFrame(overall_rows)[
        ["model", "n_forecasts", "MAE", "RMSE", "WAPE_%", "Bias", "R2"]
    ].sort_values("WAPE_%").reset_index(drop=True)
    overall_df.to_csv(OUTPUT_DIR / "rolling_backtest_overall.csv", index=False)

    print("\nOverall (all 1-3 month horizons pooled):")
    print(overall_df.to_string(index=False))

    # ---- plot: WAPE by horizon per model ----
    fig, ax = plt.subplots(figsize=(8, 5))
    colors = {
        "SARIMAX": "tab:blue", "Holt-Winters (damped)": "tab:green",
        "Linear Trend + Exog": "tab:red", "Ridge (All Socioeconomic Indicators)": "tab:purple",
        "Seasonal Naive": "tab:orange",
    }
    for model_name in summary_df["model"].unique():
        sub = summary_df[summary_df["model"] == model_name].sort_values("horizon")
        ax.plot(sub["horizon"], sub["WAPE_%"], marker="o", label=model_name,
                color=colors.get(model_name))
    ax.set_xlabel("Forecast horizon (months ahead)")
    ax.set_ylabel("WAPE %")
    ax.set_xticks(sorted(results_df["horizon"].unique()))
    ax.set_title(f"Rolling-Origin Backtest: WAPE by Forecast Horizon\n"
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
    df = load_data(DATA_PATH)
    missing = [c for c in [TARGET] + FULL_EXOG_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing expected columns in {DATA_PATH}: {missing}")

    print("Selecting a SARIMAX specification once, using all available history "
          "(same grid_search_sarimax() logic as sarimax.py)... this may take a minute.")
    exog_full = df[EXOG_COLS]
    exog_full_z = (exog_full - exog_full.mean()) / exog_full.std().replace(0, 1)
    fixed_order, fixed_seasonal_order, fixed_trend, val_rmse = grid_search_sarimax(
        df[TARGET], exog_full_z, SEASONAL_PERIOD
    )
    print(f"Selected order={fixed_order}, seasonal_order={fixed_seasonal_order}, "
          f"trend={fixed_trend!r} (validation RMSE={val_rmse:.2f})")

    run_rolling_origin_backtest(df, fixed_order, fixed_seasonal_order, fixed_trend)

    print(f"\nAll outputs saved to: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()
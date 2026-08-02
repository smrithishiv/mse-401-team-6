"""
New Univariate Benchmarks — Auto-ETS and SARIMAX (No Exog)
Food Bank of Waterloo Region — "Breaking Bread" Capstone (MSE 401)

Companion script to sarimax.py and rolling_backtest.py. It's become a
recurring finding across this project — Holt-Winters (which uses no
socioeconomic indicators at all) has been the best-performing model in most
runs, suggesting the exogenous indicators aren't adding much lift over a
pure trend/seasonality signal. This script adds two more purely univariate
models to test that finding further:

  1. SARIMAX (No Exog): the same order-search procedure as sarimax.py's
     SARIMAX, but with no exogenous regressors at all — isolates how much
     the exogenous coefficients themselves are helping vs. hurting SARIMAX,
     independent of the ARIMA structure itself.
  2. Auto-ETS: a small grid search over error/trend/damping/seasonal
     component combinations (statsmodels ETSModel), scored the same way as
     the SARIMAX order search (held-out validation RMSE). Holt-Winters is
     really just one specific ETS configuration (additive error, damped
     additive trend, additive seasonal) — Auto-ETS searches that whole
     family instead of assuming damped trend is the right choice.

Holt-Winters (damped) and Seasonal Naive are also included in every result
here as reference points, so you can tell whether either new model actually
beats Holt-Winters without needing to cross-reference sarimax_outputs_N
separately.

Two sections, mirroring the project's existing fixed-range vs. rolling-origin
split:
  - run_fixed_range_experiment(): one 12-month-ahead forecast per training
    window, same two ranges as sarimax.py (EXPERIMENTS, imported from there).
  - run_rolling_origin_backtest(): walks forward one month at a time,
    forecasting ROLLING_HORIZON months ahead from every origin — the more
    representative estimate of this project's actual 1-3 month operational
    forecasting accuracy. Same walk-forward design as rolling_backtest.py.

Setup
-----
This file imports its shared model-fitting functions (data loading, metrics,
Holt-Winters, seasonal naive, the SARIMAX order search generalized to accept
exog=None, and the new grid_search_ets/ets_forecast functions) directly from
sarimax.py, so it MUST live in the same folder as sarimax.py, and that file
must still be named exactly `sarimax.py` (not renamed).

Usage
-----
    python new_models.py

Outputs (written to ./new_models_outputs_N/ — auto-incrementing so past runs
are never overwritten):
    fixed_range_metrics_comparison.csv        - MAE/RMSE/WAPE/Bias/R2 for every model x range, long format
    fixed_range_actual_vs_predicted_<range>.png - forecasts vs. actual, per range
    fixed_range_model_summary_sarimax_noexog_<range>.txt - full statsmodels pure-SARIMA summary
    fixed_range_model_summary_ets_<range>.txt  - selected ETS config + fitted parameters
    rolling_backtest_raw.csv                  - every individual origin/horizon/model forecast vs. actual
    rolling_backtest_summary.csv              - MAE/RMSE/WAPE/Bias/R2 per model, broken out by horizon (1/2/3mo)
    rolling_backtest_overall.csv              - same metrics per model, pooled across all horizons
    rolling_backtest_wape_by_horizon.png      - WAPE vs. forecast horizon, one line per model
"""

from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX

# ---------------------------------------------------------------------------
# Shared functions and config, imported from sarimax.py so nothing here can
# silently drift out of sync with how those models / that data are actually
# defined.
# ---------------------------------------------------------------------------
from modeling.sarimax_model.sarimax import (
    DATA_PATH,
    TARGET,
    FULL_EXOG_COLS,
    SEASONAL_PERIOD,
    EXPERIMENTS,
    load_data,
    compute_metrics,
    seasonal_naive_forecast,
    naive_forecast,
    holt_winters_forecast,
    grid_search_sarimax,
    grid_search_ets,
    ets_forecast,
    train_rmse,
    wape_std_across_origins,
)

# ---------------------------------------------------------------------------
# CONFIG — rolling-origin settings, matching rolling_backtest.py
# ---------------------------------------------------------------------------
ROLLING_MIN_TRAIN_MONTHS = 36
ROLLING_HORIZON = 3
ROLLING_STEP = 1

_BASE_DIR = Path(__file__).resolve().parent


def _next_output_dir() -> Path:
    n = 1
    while (_BASE_DIR / f"new_models_outputs_{n}").exists():
        n += 1
    out = _BASE_DIR / f"new_models_outputs_{n}"
    out.mkdir(parents=True, exist_ok=False)
    return out


OUTPUT_DIR = _next_output_dir()


# ---------------------------------------------------------------------------
# SANITY CHECK — same idea as rolling_backtest.py's is_sane_forecast().
# Duplicated here (rather than imported from rolling_backtest.py) because
# importing that module would trigger its own _next_output_dir() side effect
# and create an empty rolling_backtest_outputs_N folder just from the import.
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
# SARIMAX (No Exog) forecast with a FIXED (already-chosen) order — no grid
# search here, that only happens once per range/origin-set in the callers
# below.
# ---------------------------------------------------------------------------
def sarimax_noexog_forecast_fixed(train: pd.DataFrame, test: pd.DataFrame, target: str,
                                   order: tuple, seasonal_order: tuple, trend):
    y_train = train[target]
    model = SARIMAX(
        y_train, exog=None, order=order, seasonal_order=seasonal_order, trend=trend,
        enforce_stationarity=False, enforce_invertibility=False,
    )
    fit = model.fit(disp=False)
    pred = fit.get_forecast(steps=len(test)).predicted_mean
    pred.index = test.index
    return pred, fit


# ===========================================================================
# PART 1 — FIXED-RANGE COMPARISON (mirrors sarimax.py's run_experiment)
# ===========================================================================
def run_fixed_range_experiment(df: pd.DataFrame, key: str, cfg: dict):
    label = cfg["label"]
    print(f"\n{'=' * 70}\n[Fixed-Range] {label}\n{'=' * 70}")

    train = df.loc[cfg["train_start"]:cfg["train_end"]]
    test = df.loc[cfg["test_start"]:]

    if len(train) < 24:
        print(f"  Only {len(train)} training rows available (need >= 24 for a "
              f"seasonal model) — skipping this range.")
        return None
    if len(test) == 0:
        print("  No test rows available in this window — skipping.")
        return None

    y_train = train[TARGET]
    y_test = test[TARGET]

    print(f"  Train: {y_train.index.min().date()} to {y_train.index.max().date()} "
          f"({len(y_train)} months)")
    print(f"  Test:  {y_test.index.min().date()} to {y_test.index.max().date()} "
          f"({len(y_test)} months)")

    # ---------------- SARIMAX (No Exog) ----------------
    print("  [SARIMAX (No Exog)] Searching order (grid search on held-out validation RMSE)... "
          "this may take a minute.")
    order, seasonal_order, trend, val_rmse = grid_search_sarimax(y_train, None, SEASONAL_PERIOD)
    print(f"  [SARIMAX (No Exog)] Best order={order}, seasonal_order={seasonal_order}, "
          f"trend={trend!r}, validation RMSE={val_rmse:.2f}")
    sarimax_ne_pred, sarimax_ne_fit = sarimax_noexog_forecast_fixed(
        train, test, TARGET, order, seasonal_order, trend
    )

    # ---------------- Auto-ETS ----------------
    print("  [Auto-ETS] Searching error/trend/damping/seasonal config on held-out validation RMSE...")
    ets_trend, ets_damped, ets_seasonal, ets_val_rmse = grid_search_ets(y_train, SEASONAL_PERIOD)
    print(f"  [Auto-ETS] Best trend={ets_trend!r}, damped={ets_damped}, seasonal={ets_seasonal!r}, "
          f"validation RMSE={ets_val_rmse:.2f}")
    ets_pred, ets_fit = ets_forecast(train, test, TARGET, SEASONAL_PERIOD, ets_trend, ets_damped, ets_seasonal)

    # ---------------- reference baselines ----------------
    print("  [Holt-Winters] Fitting damped-trend exponential smoothing (reference baseline)...")
    hw_pred, hw_fit = holt_winters_forecast(train, test, TARGET, SEASONAL_PERIOD)
    seasonal_naive_pred = seasonal_naive_forecast(train, test, TARGET, SEASONAL_PERIOD)
    naive_pred = naive_forecast(train, test, TARGET)

    metrics_by_model = {
        "SARIMAX (No Exog)": compute_metrics(y_test.values, sarimax_ne_pred.values),
        "Auto-ETS": compute_metrics(y_test.values, ets_pred.values),
        "Holt-Winters (damped) [reference]": compute_metrics(y_test.values, hw_pred.values),
        "Seasonal Naive [reference]": compute_metrics(y_test.values, seasonal_naive_pred.values),
        "Naive [reference]": compute_metrics(y_test.values, naive_pred.values),
    }

    # ---------------- train-set (in-sample) RMSE — overfit/underfit read.
    # The two naive baselines have no fitted parameters, so left NaN.
    # ---------------------------------------------------------------------
    train_rmse_by_model = {
        "SARIMAX (No Exog)": train_rmse(y_train, sarimax_ne_fit.fittedvalues),
        "Auto-ETS": train_rmse(y_train, ets_fit.fittedvalues),
        "Holt-Winters (damped) [reference]": train_rmse(y_train, hw_fit.fittedvalues),
        "Seasonal Naive [reference]": np.nan,
        "Naive [reference]": np.nan,
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

    # ---- actual vs. predicted plot ----
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(y_train.index, y_train, label="Train (actual)", color="gray")
    ax.plot(y_test.index, y_test, label="Test (actual)", color="black", marker="o", linewidth=2)
    ax.plot(y_test.index, sarimax_ne_pred, label="SARIMAX (No Exog)", color="tab:cyan", marker="x")
    ax.plot(y_test.index, ets_pred, label="Auto-ETS", color="tab:brown", marker="P")
    ax.plot(y_test.index, hw_pred, label="Holt-Winters (damped) [reference]", color="tab:green",
            marker="s", linestyle="--")
    ax.plot(y_test.index, seasonal_naive_pred, label="Seasonal Naive [reference]", color="tab:orange",
            linestyle="--")
    ax.plot(y_test.index, naive_pred, label="Naive [reference]", color="tab:gray",
            linestyle=":")
    ax.set_title(f"Actual vs. Predicted (New Models) — {label}")
    ax.set_ylabel(TARGET)
    ax.legend(fontsize=8)
    fig.autofmt_xdate()
    fig.tight_layout()
    fig.savefig(OUTPUT_DIR / f"fixed_range_actual_vs_predicted_{key}.png", dpi=150)
    plt.close(fig)

    with open(OUTPUT_DIR / f"fixed_range_model_summary_sarimax_noexog_{key}.txt", "w") as f:
        f.write(str(sarimax_ne_fit.summary()))
    with open(OUTPUT_DIR / f"fixed_range_model_summary_ets_{key}.txt", "w") as f:
        f.write("Auto-ETS selected configuration\n")
        f.write("=" * 50 + "\n")
        f.write("error: add\n")
        f.write(f"trend: {ets_trend!r}\n")
        f.write(f"damped_trend: {ets_damped}\n")
        f.write(f"seasonal: {ets_seasonal!r}\n")
        f.write(f"seasonal_periods: {SEASONAL_PERIOD if ets_seasonal else None}\n\n")
        f.write(str(ets_fit.summary()))

    return {
        "key": key,
        "label": label,
        "order": order,
        "seasonal_order": seasonal_order,
        "trend": trend,
        "aic": sarimax_ne_fit.aic,
        "ets_trend": ets_trend,
        "ets_damped": ets_damped,
        "ets_seasonal": ets_seasonal,
        "ets_aic": ets_fit.aic,
        "metrics_by_model": metrics_by_model,
        "best_model": best_model_name,
    }


# ===========================================================================
# PART 2 — ROLLING-ORIGIN BACKTEST (mirrors rolling_backtest.py)
# ===========================================================================
def run_rolling_origin_backtest(df: pd.DataFrame, sarimax_ne_order: tuple,
                                 sarimax_ne_seasonal_order: tuple, sarimax_ne_trend,
                                 ets_trend, ets_damped: bool, ets_seasonal):
    print(f"\n{'=' * 70}\n[Rolling-Origin] New Models Backtest "
          f"({ROLLING_HORIZON}-month horizon, step={ROLLING_STEP} month)\n{'=' * 70}")
    print(f"SARIMAX (No Exog) order fixed at {sarimax_ne_order}{sarimax_ne_seasonal_order}, "
          f"trend={sarimax_ne_trend!r} (selected once on all available history)")
    print(f"Auto-ETS config fixed at trend={ets_trend!r}, damped={ets_damped}, seasonal={ets_seasonal!r} "
          f"(selected once on all available history)")

    n = len(df)
    records = []
    n_origins = 0
    unstable_counts = {"SARIMAX (No Exog)": 0, "Auto-ETS": 0}
    unstable_origins_by_model = {"SARIMAX (No Exog)": [], "Auto-ETS": []}

    for start in range(ROLLING_MIN_TRAIN_MONTHS, n - ROLLING_HORIZON + 1, ROLLING_STEP):
        train = df.iloc[:start]
        test = df.iloc[start:start + ROLLING_HORIZON]
        origin_date = train.index[-1]

        sarimax_ne_pred = None
        try:
            candidate, _ = sarimax_noexog_forecast_fixed(
                train, test, TARGET, sarimax_ne_order, sarimax_ne_seasonal_order, sarimax_ne_trend
            )
            if is_sane_forecast(candidate, train[TARGET]):
                sarimax_ne_pred = candidate
            else:
                unstable_counts["SARIMAX (No Exog)"] += 1
                unstable_origins_by_model["SARIMAX (No Exog)"].append(str(origin_date.date()))
        except Exception:
            unstable_counts["SARIMAX (No Exog)"] += 1
            unstable_origins_by_model["SARIMAX (No Exog)"].append(str(origin_date.date()))

        ets_pred = None
        try:
            candidate, _ = ets_forecast(train, test, TARGET, SEASONAL_PERIOD, ets_trend, ets_damped, ets_seasonal)
            if is_sane_forecast(candidate, train[TARGET]):
                ets_pred = candidate
            else:
                unstable_counts["Auto-ETS"] += 1
                unstable_origins_by_model["Auto-ETS"].append(str(origin_date.date()))
        except Exception:
            unstable_counts["Auto-ETS"] += 1
            unstable_origins_by_model["Auto-ETS"].append(str(origin_date.date()))

        hw_pred, _ = holt_winters_forecast(train, test, TARGET, SEASONAL_PERIOD)
        seasonal_naive_pred = seasonal_naive_forecast(train, test, TARGET, SEASONAL_PERIOD)
        naive_pred = naive_forecast(train, test, TARGET)

        preds_by_model = {
            "Holt-Winters (damped) [reference]": hw_pred,
            "Seasonal Naive [reference]": seasonal_naive_pred,
            "Naive [reference]": naive_pred,
        }
        # Fixed-config models are only included for an origin if their
        # forecast passed the sanity check — an unstable origin is excluded
        # from that model's own average rather than corrupting it, but the
        # reference models still get scored on this origin normally.
        if sarimax_ne_pred is not None:
            preds_by_model["SARIMAX (No Exog)"] = sarimax_ne_pred
        if ets_pred is not None:
            preds_by_model["Auto-ETS"] = ets_pred

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
    for model_name, n_unstable in unstable_counts.items():
        if n_unstable > 0:
            print(f"{model_name} produced a numerically unstable/implausible forecast on "
                  f"{n_unstable} of {n_origins} origins ({n_unstable / n_origins:.0%}) — "
                  f"those origins are excluded from {model_name}'s averages below (the reference "
                  f"models still include them).")
            print(f"  Unstable origins: {', '.join(unstable_origins_by_model[model_name])}")

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
        "SARIMAX (No Exog)": "tab:cyan", "Auto-ETS": "tab:brown",
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
    ax.set_title(f"Rolling-Origin Backtest (New Models): WAPE by Forecast Horizon\n"
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

    # ---------------- Part 1: fixed-range comparison ----------------
    results = []
    for key, cfg in EXPERIMENTS.items():
        res = run_fixed_range_experiment(df, key, cfg)
        if res:
            results.append(res)

    if results:
        comparison_rows = []
        for res in results:
            for model_name, metrics in res["metrics_by_model"].items():
                row = {"experiment": res["label"], "model": model_name}
                if model_name == "SARIMAX (No Exog)":
                    row["order"] = str(res["order"])
                    row["seasonal_order"] = str(res["seasonal_order"])
                    row["trend"] = str(res["trend"])
                    row["AIC"] = res["aic"]
                elif model_name == "Auto-ETS":
                    row["ets_trend"] = str(res["ets_trend"])
                    row["ets_damped"] = res["ets_damped"]
                    row["ets_seasonal"] = str(res["ets_seasonal"])
                    row["AIC"] = res["ets_aic"]
                row.update(metrics)
                row["is_best_in_experiment"] = model_name == res["best_model"]
                comparison_rows.append(row)
        comparison_df = pd.DataFrame(comparison_rows)
        comparison_df.to_csv(OUTPUT_DIR / "fixed_range_metrics_comparison.csv", index=False)

        print(f"\n\n{'=' * 70}\nFIXED-RANGE METRICS COMPARISON (NEW MODELS)\n{'=' * 70}")
        print(comparison_df.to_string(index=False))
        print("\nBest model per range (by RMSE):")
        for res in results:
            print(f"  {res['label']}: {res['best_model']}")
    else:
        print("\nNo fixed-range experiment produced results — check your date ranges against "
              "the actual date coverage of Model_Ready.csv.")

    # ---------------- Part 2: rolling-origin backtest ----------------
    print("\n\nSelecting a SARIMAX (No Exog) specification once, using all available history...")
    fixed_ne_order, fixed_ne_seasonal_order, fixed_ne_trend, val_rmse_ne = grid_search_sarimax(
        df[TARGET], None, SEASONAL_PERIOD
    )
    print(f"Selected order={fixed_ne_order}, seasonal_order={fixed_ne_seasonal_order}, "
          f"trend={fixed_ne_trend!r} (validation RMSE={val_rmse_ne:.2f})")

    print("\nSelecting an Auto-ETS configuration once, using all available history...")
    fixed_ets_trend, fixed_ets_damped, fixed_ets_seasonal, ets_val_rmse = grid_search_ets(
        df[TARGET], SEASONAL_PERIOD
    )
    print(f"Selected trend={fixed_ets_trend!r}, damped={fixed_ets_damped}, "
          f"seasonal={fixed_ets_seasonal!r} (validation RMSE={ets_val_rmse:.2f})")

    run_rolling_origin_backtest(
        df, fixed_ne_order, fixed_ne_seasonal_order, fixed_ne_trend,
        fixed_ets_trend, fixed_ets_damped, fixed_ets_seasonal,
    )

    print(f"\nAll outputs saved to: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()
"""
Generates the dashboard's real Holt-Winters forecast output.

This does NOT re-derive the model methodology — it reuses the exact
config that holt_winters_model.ipynb identified as the winner (additive
trend + additive seasonality, damped, trained from 2019-01 onward): the
only positive R^2 among the four configs x two training windows tested
there. See that notebook for the comparison this config was chosen from.

Unlike the notebook (which holds out Jul 2025 - latest as a test set to
score the model), this script fits on ALL available actual history and
forecasts forward past the end of the data, since its job is production
forecasting rather than backtesting.

Usage:
    cd modeling/baselines
    python -m venv .venv && source .venv/bin/activate   # first run only
    pip install -r requirements.txt                      # first run only
    python export_forecast.py

Writes dashboard/public/data/forecast_holtwinters.json.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing

TARGET = "total_people_served"
SEASONAL_PERIOD = 12
TRAIN_START = "2019-01-01"  # TR1 in the notebook — outperformed TR2 (2022 start) on every metric
FORECAST_HORIZON_MONTHS = 3
INTERVAL_LEVEL = 0.8  # 80% empirical interval (10th/90th percentile of simulated paths)
N_SIMULATIONS = 1000
RANDOM_STATE = 42

HW_CONFIG = dict(trend="add", seasonal="add", damped_trend=True)  # notebook's winning config

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = REPO_ROOT / "clean_data" / "Model_Ready.csv"
OUTPUT_PATH = REPO_ROOT / "dashboard" / "public" / "data" / "forecast_holtwinters.json"

# Backtest metrics from the notebook's TR1 "HW add/add damped" row — reported
# alongside the live forecast for transparency, NOT recomputed here (that
# would silently re-score against a shifting holdout every time this script
# runs). Re-run the notebook's evaluate() cell to refresh these if the
# holdout window changes.
BACKTEST_METRICS = {
    "trainRange": {"start": "2019-01", "end": "2025-06"},
    "testRange": {"start": "2025-07", "end": "2026-06"},
    "wapePct": 4.76,
    "r2": 0.086,
    "note": "From holt_winters_model.ipynb's TR1 backtest of this config; not recomputed by this script.",
}


def load_series() -> pd.Series:
    df = pd.read_csv(DATA_PATH, parse_dates=["month"])
    df = df.sort_values("month").set_index("month").asfreq("MS")
    return df[TARGET]


def fit_and_forecast(series: pd.Series, horizon: int):
    train = series.loc[TRAIN_START:]
    model = ExponentialSmoothing(
        train,
        seasonal_periods=SEASONAL_PERIOD,
        initialization_method="estimated",
        **HW_CONFIG,
    )
    fit = model.fit()
    point_forecast = fit.forecast(horizon)

    # Empirical prediction interval via simulation (statsmodels' classic
    # ExponentialSmoothing has no closed-form get_prediction()/conf_int()
    # like the newer ETSModel does, so this is the standard workaround for
    # this class rather than a change to the fitted model itself).
    sims = fit.simulate(
        nsimulations=horizon, repetitions=N_SIMULATIONS, error="add", random_state=RANDOM_STATE
    )
    lower_pct = (1 - INTERVAL_LEVEL) / 2 * 100
    upper_pct = 100 - lower_pct
    lower = sims.quantile(lower_pct / 100, axis=1)
    upper = sims.quantile(upper_pct / 100, axis=1)

    return train, point_forecast, lower, upper


def build_output(series, train, point_forecast, lower, upper):
    historical = [
        {"date": d.strftime("%Y-%m"), "actual": None if pd.isna(v) else round(float(v))}
        for d, v in series.items()
        if not pd.isna(v)
    ]

    forecast = []
    for i, (d, v) in enumerate(point_forecast.items(), start=1):
        forecast.append(
            {
                "date": d.strftime("%Y-%m"),
                "horizonMonths": i,
                "value": round(float(v)),
                "lowerBound": round(float(lower.iloc[i - 1])),
                "upperBound": round(float(upper.iloc[i - 1])),
            }
        )

    return {
        "model": "Holt-Winters",
        "modelStatus": "Provisional operational recommendation",
        "modelStatusNote": "Current operational model while other candidates (Naive, SARIMAX, Random Forest, GAM) are still being evaluated. Not designated as the final model.",
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "metric": TARGET,
        "config": {
            "trend": HW_CONFIG["trend"],
            "seasonal": HW_CONFIG["seasonal"],
            "dampedTrend": HW_CONFIG["damped_trend"],
            "seasonalPeriods": SEASONAL_PERIOD,
            "trainStart": train.index.min().strftime("%Y-%m"),
            "trainEnd": train.index.max().strftime("%Y-%m"),
        },
        "interval": {
            "level": INTERVAL_LEVEL,
            "method": "simulation",
            "nSimulations": N_SIMULATIONS,
        },
        "backtest": BACKTEST_METRICS,
        "historical": historical,
        "forecast": forecast,
    }


def main():
    series = load_series()
    train, point_forecast, lower, upper = fit_and_forecast(series, FORECAST_HORIZON_MONTHS)
    output = build_output(series, train, point_forecast, lower, upper)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(output, indent=2) + "\n")

    print(f"Wrote {OUTPUT_PATH}")
    print(f"Train: {output['config']['trainStart']} -> {output['config']['trainEnd']} ({len(train)} months)")
    print("Forecast:")
    for f in output["forecast"]:
        print(f"  {f['date']}  value={f['value']}  [{f['lowerBound']}, {f['upperBound']}]")


if __name__ == "__main__":
    main()

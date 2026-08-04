# Holt-Winters → dashboard integration

`export_forecast.py` is the bridge between `holt_winters_model.ipynb`
(the source of truth for the model methodology) and the dashboard. It
does not re-derive the model: it reuses the exact config the notebook's
comparison identified as the winner — additive trend + additive
seasonality, damped, trained from 2019-01 onward — and fits it on all
available actual history to forecast 3 months forward.

This is a manual pipeline, not an automated one: someone has to run the
script and commit/redeploy the output whenever `clean_data/Model_Ready.csv`
is updated. There is no scheduled job wired up.

## Rerunning the model and refreshing the dashboard

```bash
cd modeling/baselines
python3 -m venv .venv          # first time only
source .venv/bin/activate
pip install -r requirements.txt  # first time only
python export_forecast.py
```

This writes `dashboard/public/data/forecast_holtwinters.json`. Reload
the dashboard (dev server or redeploy) to pick it up — no other steps
are required; the dashboard reads that file as a static asset.

If the file is missing, unreadable, or missing required fields, the
dashboard does **not** crash or fabricate numbers — `forecastService`
and `overviewService` fall back to the existing sample/mock data and
show a "Showing sample forecast data" notice + a "Sample data" badge,
so it's always visible when you're looking at real model output vs.
illustrative placeholder data.

## What's real vs. still mock

| Dashboard surface | Source |
|---|---|
| Overview — "Predicted hamper demand" hero card | Real (Holt-Winters export) |
| Overview — "Next month forecast" KPI | Real |
| Forecast page — Operational **Monthly** view (cards + chart) | Real |
| Forecast page — Operational **Weekly** view | Mock — HW forecasts monthly only, this stays illustrative and is labelled as such in the UI |
| Forecast page — **Strategic** (2/3/5/10-year, demand-driver breakdowns) | Mock — HW doesn't produce multi-year or demographic-segmented output |
| Per-month "driver explanations" panel | Mock — HW has no feature-importance output (see notebook's own "Feature importance: N/A") |
| Overview — active agencies / allocation alerts / population signals | Mock — unrelated to the forecast model |

## Confidence badge

High/low confidence thresholds have **not** been statistically
calibrated for this model. Every real Holt-Winters forecast is shown
with a `pending` confidence state ("Calibration pending" badge) rather
than a fabricated high/low judgement — see `ConfidenceBadge` and
`CONFIDENCE_TOOLTIPS.pending` in the dashboard source. The export does
carry an 80% empirical prediction interval (via simulation — see
`fit_and_forecast()`), and that interval is what's shown as the
range/shaded band; it's just not mapped to a calibrated confidence
label yet.

## Regenerating after methodology changes

If the notebook's winning config changes (different training window,
different trend/seasonal combination), update `TRAIN_START` and
`HW_CONFIG` at the top of `export_forecast.py` to match, and re-run.
`BACKTEST_METRICS` in this script is copied from the notebook's own
evaluation cell, not recomputed — refresh it by hand from the
notebook's `results_df` output if the backtest changes.

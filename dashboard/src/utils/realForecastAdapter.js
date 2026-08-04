/**
 * Transforms the raw Holt-Winters export (modeling/baselines/export_forecast.py's
 * output, loaded via services/realForecastData.js) into the shapes the
 * Forecast and Overview pages already render — so components never need to
 * know whether they're looking at real model output or mock data.
 *
 * Both forecastService.js and overviewService.js import from here, so a
 * given forecast month always reads the same everywhere it appears.
 */

function monthDate(isoMonth) {
  return new Date(`${isoMonth}-01T00:00:00`);
}

/** '2026-07' -> 'jul-2026', matching the existing mock id convention. */
export function monthId(isoMonth) {
  const d = monthDate(isoMonth);
  return `${d.toLocaleString('en-US', { month: 'short' }).toLowerCase()}-${d.getFullYear()}`;
}

/** '2026-07' -> 'July 2026' */
export function monthLabel(isoMonth) {
  const d = monthDate(isoMonth);
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

/** '2026-07' -> 'Jul' */
export function monthChartLabel(isoMonth) {
  const d = monthDate(isoMonth);
  return d.toLocaleString('en-US', { month: 'short' });
}

function marginPct(low, high, value) {
  if (!value) return 0;
  return Math.round(((high - value) / value) * 1000) / 10;
}

/**
 * Builds a MonthlyForecastCard (see utils/types.js) for one forecast-export
 * entry. Confidence is always 'pending' for real Holt-Winters output — the
 * export has a prediction interval but no calibrated high/low threshold
 * (see ConfidenceBadge / CONFIDENCE_TOOLTIPS.pending), so this must never be
 * coerced into 'high'/'low'.
 */
function predictedMonthCard(forecastEntry) {
  const { date: isoMonth, value, lowerBound, upperBound } = forecastEntry;
  return {
    id: monthId(isoMonth),
    isoMonth,
    label: monthLabel(isoMonth),
    type: 'predicted',
    value,
    range: { low: lowerBound, high: upperBound, marginPct: marginPct(lowerBound, upperBound, value) },
    confidence: 'pending',
    statusKey: 'forecast-pending',
    chartLabel: monthChartLabel(isoMonth),
  };
}

function actualMonthCard(isoMonth, value) {
  return {
    id: monthId(isoMonth),
    isoMonth,
    label: monthLabel(isoMonth),
    type: 'actual',
    value,
    statusKey: 'actual',
    chartLabel: monthChartLabel(isoMonth),
  };
}

/**
 * Builds the operational-monthly forecast response (same shape as
 * mockForecastData.js's `operationalForecast`) from a validated export
 * payload. Always includes the model/status metadata the UI needs to label
 * this as real, provisional Holt-Winters output.
 */
export function buildOperationalForecast(exportData) {
  const lastActual = exportData.historical[exportData.historical.length - 1];
  const trailingActuals = exportData.historical.slice(-6);

  const months = [actualMonthCard(lastActual.date, lastActual.actual), ...exportData.forecast.map(predictedMonthCard)];

  const chartHistorical = trailingActuals.map((h) => ({ label: monthChartLabel(h.date), value: h.actual }));
  const chartForecast = [
    { label: monthChartLabel(lastActual.date), value: lastActual.actual, low: lastActual.actual, high: lastActual.actual },
    ...exportData.forecast.map((f) => ({
      label: monthChartLabel(f.date),
      value: f.value,
      low: f.lowerBound,
      high: f.upperBound,
    })),
  ];

  return {
    months,
    defaultSelectedMonthId: monthId(exportData.forecast[0].date),
    chart: { historical: chartHistorical, forecast: chartForecast },
    model: exportData.model,
    modelStatus: exportData.modelStatus,
    modelStatusNote: exportData.modelStatusNote,
    generatedAt: exportData.generatedAt,
    isSampleData: false,
  };
}

/**
 * Builds the two Overview-page snapshot pieces that actually come from the
 * forecast model: `predictedDemand` (current period) and `nextMonthForecast`.
 * Everything else on Overview (agencies, allocation alerts, population
 * signals) is unrelated to Holt-Winters and stays sourced from mock data —
 * callers merge this in, they don't replace the whole snapshot.
 *
 * Returns { current, previous } so the period dropdown can show either the
 * latest actual month or the current (1-month-ahead) prediction, mirroring
 * the existing mock's actual/predicted pair.
 */
export function buildOverviewForecastSnapshots(exportData) {
  const lastActual = exportData.historical[exportData.historical.length - 1];
  const [f1, f2] = exportData.forecast;

  const vsPrevPct = Math.round(((f1.value - lastActual.actual) / lastActual.actual) * 1000) / 10;

  const previous = {
    predictedDemand: {
      monthLabel: monthLabel(lastActual.date),
      value: lastActual.actual,
      vsPrevPct: null,
      range: null,
      confidence: null,
      isActual: true,
      recommendationTitle: 'Recorded actual — no forecast action needed',
      recommendationHelp: `${monthLabel(lastActual.date)} figures are recorded hamper-visit counts, not a model prediction.`,
    },
    nextMonthForecast: f1
      ? { monthLabel: monthLabel(f1.date), isoMonth: f1.date, value: f1.value, confidence: 'pending' }
      : undefined,
  };

  const current = {
    predictedDemand: {
      monthLabel: monthLabel(f1.date),
      value: f1.value,
      vsPrevPct,
      range: { low: f1.lowerBound, high: f1.upperBound },
      confidence: 'pending',
      isActual: false,
      recommendationTitle: 'Provisional forecast — confidence not yet calibrated',
      recommendationHelp:
        "This is Holt-Winters' point forecast and prediction interval, shown as a provisional operational recommendation. High/low confidence thresholds haven't been statistically calibrated yet, so use judgement before treating this as final.",
    },
    nextMonthForecast: f2
      ? { monthLabel: monthLabel(f2.date), isoMonth: f2.date, value: f2.value, confidence: 'pending' }
      : undefined,
  };

  return {
    current,
    previous,
    lastUpdated: `${lastActual.date}-01T00:00:00`,
    modelLastRun: exportData.generatedAt,
  };
}

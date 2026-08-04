import { describe, it, expect } from 'vitest';
import { buildOperationalForecast, buildOverviewForecastSnapshots, monthId, monthLabel } from './realForecastAdapter';

const SAMPLE_EXPORT = {
  model: 'Holt-Winters',
  modelStatus: 'Provisional operational recommendation',
  modelStatusNote: 'Current operational model while other candidates are still being evaluated.',
  generatedAt: '2026-08-01T12:00:00+00:00',
  metric: 'total_people_served',
  historical: [
    { date: '2026-04', actual: 50000 },
    { date: '2026-05', actual: 51000 },
    { date: '2026-06', actual: 52000 },
  ],
  forecast: [
    { date: '2026-07', horizonMonths: 1, value: 53000, lowerBound: 50000, upperBound: 56000 },
    { date: '2026-08', horizonMonths: 2, value: 54000, lowerBound: 50500, upperBound: 57500 },
    { date: '2026-09', horizonMonths: 3, value: 55000, lowerBound: 51000, upperBound: 59000 },
  ],
};

describe('realForecastAdapter — id/label helpers', () => {
  it('formats an ISO month into the existing kebab id convention', () => {
    expect(monthId('2026-07')).toBe('jul-2026');
  });

  it('formats an ISO month into a full "Month Year" label', () => {
    expect(monthLabel('2026-07')).toBe('July 2026');
  });
});

describe('buildOperationalForecast', () => {
  const result = buildOperationalForecast(SAMPLE_EXPORT);

  it('includes the last actual month plus all forecast months, in order', () => {
    expect(result.months.map((m) => m.isoMonth)).toEqual(['2026-06', '2026-07', '2026-08', '2026-09']);
    expect(result.months[0].type).toBe('actual');
    expect(result.months.slice(1).every((m) => m.type === 'predicted')).toBe(true);
  });

  it('produces forecasts for horizon 1, 2, and 3 months ahead', () => {
    const predicted = result.months.filter((m) => m.type === 'predicted');
    expect(predicted).toHaveLength(3);
    expect(predicted.map((m) => m.value)).toEqual([53000, 54000, 55000]);
  });

  it('never labels a predicted month as calibrated high/low confidence', () => {
    const predicted = result.months.filter((m) => m.type === 'predicted');
    expect(predicted.every((m) => m.confidence === 'pending')).toBe(true);
    expect(predicted.every((m) => m.statusKey === 'forecast-pending')).toBe(true);
  });

  it('does not label the historical actual month as a forecast', () => {
    const actual = result.months[0];
    expect(actual.type).toBe('actual');
    expect(actual.confidence).toBeUndefined();
    expect(actual.range).toBeUndefined();
  });

  it('defaults selection to the nearest (1-month-ahead) forecast', () => {
    expect(result.defaultSelectedMonthId).toBe(monthId('2026-07'));
  });

  it('connects the chart historical/forecast series at the last actual month', () => {
    const lastHistoricalLabel = result.chart.historical[result.chart.historical.length - 1].label;
    expect(result.chart.forecast[0].label).toBe(lastHistoricalLabel);
    expect(result.chart.forecast[0].value).toBe(52000);
  });

  it('carries model identity and status through, and marks itself as real (non-sample) data', () => {
    expect(result.model).toBe('Holt-Winters');
    expect(result.modelStatus).toBe('Provisional operational recommendation');
    expect(result.isSampleData).toBe(false);
  });
});

describe('buildOverviewForecastSnapshots', () => {
  const { current, previous, lastUpdated, modelLastRun } = buildOverviewForecastSnapshots(SAMPLE_EXPORT);

  it('"previous" reflects the last recorded actual, not a prediction', () => {
    expect(previous.predictedDemand.isActual).toBe(true);
    expect(previous.predictedDemand.value).toBe(52000);
    expect(previous.predictedDemand.confidence).toBeNull();
    expect(previous.nextMonthForecast.value).toBe(53000);
  });

  it('"current" reflects the 1-month-ahead forecast with an uncalibrated confidence badge', () => {
    expect(current.predictedDemand.isActual).toBe(false);
    expect(current.predictedDemand.value).toBe(53000);
    expect(current.predictedDemand.confidence).toBe('pending');
    expect(current.predictedDemand.range).toEqual({ low: 50000, high: 56000 });
    expect(current.nextMonthForecast.value).toBe(54000);
  });

  it('exposes freshness timestamps derived from the export, not hardcoded', () => {
    expect(lastUpdated).toBe('2026-06-01T00:00:00');
    expect(modelLastRun).toBe('2026-08-01T12:00:00+00:00');
  });
});

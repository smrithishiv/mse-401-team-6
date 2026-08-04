import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getOverviewSummary, getOperationalSummary } from './overviewService';
import { __resetRealForecastCacheForTests } from './realForecastData';

const REAL_EXPORT = {
  model: 'Holt-Winters',
  modelStatus: 'Provisional operational recommendation',
  modelStatusNote: 'Provisional — other candidate models are still being evaluated.',
  generatedAt: '2026-08-01T12:00:00+00:00',
  historical: [
    { date: '2026-05', actual: 51000 },
    { date: '2026-06', actual: 52000 },
  ],
  forecast: [
    { date: '2026-07', horizonMonths: 1, value: 53000, lowerBound: 50000, upperBound: 56000 },
    { date: '2026-08', horizonMonths: 2, value: 54000, lowerBound: 50500, upperBound: 57500 },
  ],
};

describe('overviewService', () => {
  beforeEach(() => {
    __resetRealForecastCacheForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back to sample data (tagged isSampleData) when the export file is unavailable, without throwing', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    const summary = await getOverviewSummary('current');

    expect(summary.isSampleData).toBe(true);
    expect(summary.predictedDemand).toBeDefined();
  });

  it('uses the real forecast for predictedDemand/nextMonthForecast while keeping mock agency/population fields', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => REAL_EXPORT });

    const summary = await getOverviewSummary('current');

    expect(summary.isSampleData).toBe(false);
    expect(summary.model).toBe('Holt-Winters');
    expect(summary.predictedDemand.value).toBe(53000);
    expect(summary.predictedDemand.confidence).toBe('pending');
    expect(summary.nextMonthForecast.value).toBe(54000);
    // Unrelated to the forecast model — must still come from the mock snapshot.
    expect(summary.activeAgencies).toBeDefined();
    expect(summary.populationSignals.length).toBeGreaterThan(0);
  });

  it('"previous" period reflects the real last-actual month as isActual, not a prediction', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => REAL_EXPORT });

    const summary = await getOverviewSummary('previous');

    expect(summary.predictedDemand.isActual).toBe(true);
    expect(summary.predictedDemand.value).toBe(52000);
    expect(summary.predictedDemand.confidence).toBeNull();
  });

  it('getOperationalSummary builds its items from the same real forecast values (consistent across Overview surfaces)', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => REAL_EXPORT });

    const items = await getOperationalSummary('current');
    const forecastItem = items.find((i) => i.id === 'current-forecast');

    expect(forecastItem.message).toContain('53,000');
  });

  it('never claims a calibrated low/high confidence for the next-month summary line when the model is uncalibrated', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => REAL_EXPORT });

    const items = await getOperationalSummary('current');
    const nextMonthItem = items.find((i) => i.id === 'next-month-confidence');

    expect(nextMonthItem.message).not.toMatch(/confidence is (low|high)/);
    expect(nextMonthItem.message).toMatch(/not been calibrated/);
  });
});

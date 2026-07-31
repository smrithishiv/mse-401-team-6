import { describe, it, expect } from 'vitest';
import {
  getOperationalForecast,
  getOperationalForecastWeekly,
  getStrategicForecast,
  getStrategicHorizonOptions,
  getDriverExplanations,
  getModelStatus,
} from './forecastService';

describe('forecastService', () => {
  it('resolves operational forecast values matching the mock data contract', async () => {
    const data = await getOperationalForecast({});
    const august = data.months.find((m) => m.id === 'aug-2026');

    expect(august.value).toBe(54200);
    expect(august.confidence).toBe('high');
    expect(august.range).toEqual({ low: 51800, high: 56600, marginPct: 4.4 });
  });

  it('resolves strategic forecast summary values at the default 5-year horizon', async () => {
    const data = await getStrategicForecast({});
    expect(data.horizonYears).toBe(5);
    expect(data.summary.forecastValue).toBe(2750000);
    expect(data.summary.expectedVariation).toBe(33280);
  });

  it('scales values down when a demographic filter narrows the population', async () => {
    const unfiltered = await getOperationalForecast({});
    const filtered = await getOperationalForecast({ gender: 'male' });
    const augustUnfiltered = unfiltered.months.find((m) => m.id === 'aug-2026').value;
    const augustFiltered = filtered.months.find((m) => m.id === 'aug-2026').value;

    expect(augustFiltered).toBeLessThan(augustUnfiltered);
  });

  it('rejects when the forceError flag is set, for exercising error UI', async () => {
    await expect(getOperationalForecast({ forceError: true })).rejects.toThrow();
  });

  it('resolves weekly operational forecast values matching the mock data contract', async () => {
    const data = await getOperationalForecastWeekly({});
    const week = data.weeks.find((w) => w.id === 'wk-2026-07-28');

    expect(week.value).toBe(13500);
    expect(week.confidence).toBe('high');
    expect(week.statusKey).toBe('on-track');
    expect(week.range).toEqual({ low: 12950, high: 14050, marginPct: 4.1 });
  });

  it('scales weekly values down when a demographic filter narrows the population', async () => {
    const unfiltered = await getOperationalForecastWeekly({});
    const filtered = await getOperationalForecastWeekly({ gender: 'male' });
    const unfilteredValue = unfiltered.weeks.find((w) => w.id === 'wk-2026-07-28').value;
    const filteredValue = filtered.weeks.find((w) => w.id === 'wk-2026-07-28').value;

    expect(filteredValue).toBeLessThan(unfilteredValue);
  });

  it('resolves demand-driver explanations for a known period id', async () => {
    const data = await getDriverExplanations('aug-2026');
    expect(data.periodLabel).toBe('August 2026');
    const newcomers = data.groups.find((g) => g.groupId === 'newcomer-families');
    expect(newcomers.shareOfDemand).toBe(28);
    expect(newcomers.contributingFactors.length).toBeGreaterThan(0);
  });

  it('resolves an empty explanation set for an unknown period id', async () => {
    const data = await getDriverExplanations('not-a-real-period');
    expect(data.groups).toEqual([]);
  });

  it('resolves the supported strategic horizon options', async () => {
    const options = await getStrategicHorizonOptions();
    expect(options.supportedHorizons).toEqual([2, 3, 5, 10]);
    expect(options.defaultHorizonYears).toBe(5);
  });

  it('widens the confidence band as the horizon extends further out, reflecting growing long-range uncertainty', async () => {
    const fiveYear = await getStrategicForecast({}, 5);
    const tenYear = await getStrategicForecast({}, 10);

    const fiveYearFinal = fiveYear.chart.forecast[fiveYear.chart.forecast.length - 1];
    const tenYearFinal = tenYear.chart.forecast[tenYear.chart.forecast.length - 1];

    const fiveYearGap = fiveYearFinal.high - fiveYearFinal.low;
    const tenYearGap = tenYearFinal.high - tenYearFinal.low;

    expect(tenYearGap).toBeGreaterThan(fiveYearGap);

    // Within the 10-year bucket itself, uncertainty should keep growing year over year.
    const gaps = tenYear.chart.forecast.map((p) => p.high - p.low);
    for (let i = 1; i < gaps.length; i += 1) {
      expect(gaps[i]).toBeGreaterThanOrEqual(gaps[i - 1]);
    }
  });

  it('resolves a shorter horizon bucket for a 2-year request', async () => {
    const data = await getStrategicForecast({}, 2);
    expect(data.horizonYears).toBe(2);
    expect(data.chart.forecast[data.chart.forecast.length - 1].label).toBe('2028');
  });

  it('resolves distinct operational and strategic freshness timestamps', async () => {
    const status = await getModelStatus();
    expect(status.operationalForecast.generatedAt).not.toBe(status.strategicForecast.generatedAt);
    expect(status.operationalForecast.refreshCadence).toBe('weekly');
    expect(status.strategicForecast.refreshCadence).toBe('quarterly');
  });
});

import { describe, it, expect } from 'vitest';
import { getOperationalForecast, getStrategicForecast } from './forecastService';

describe('forecastService', () => {
  it('resolves operational forecast values matching the mock data contract', async () => {
    const data = await getOperationalForecast({});
    const august = data.months.find((m) => m.id === 'aug-2026');

    expect(august.value).toBe(54200);
    expect(august.confidence).toBe('high');
    expect(august.range).toEqual({ low: 51800, high: 56600, marginPct: 4.4 });
  });

  it('resolves strategic forecast summary values', async () => {
    const data = await getStrategicForecast({});
    expect(data.summary.fiveYearForecastValue).toBe(2750000);
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
});

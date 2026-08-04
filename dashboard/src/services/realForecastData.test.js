import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRealForecast, __resetRealForecastCacheForTests } from './realForecastData';

const VALID_PAYLOAD = {
  model: 'Holt-Winters',
  historical: [{ date: '2026-06', actual: 52000 }],
  forecast: [{ date: '2026-07', horizonMonths: 1, value: 53000, lowerBound: 50000, upperBound: 56000 }],
};

describe('realForecastData', () => {
  beforeEach(() => {
    __resetRealForecastCacheForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves the parsed export when the file fetches successfully and is well-formed', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => VALID_PAYLOAD });

    const data = await getRealForecast();

    expect(data).toEqual(VALID_PAYLOAD);
    expect(global.fetch).toHaveBeenCalledWith('/data/forecast_holtwinters.json');
  });

  it('memoizes successful fetches so repeated calls only hit the network once', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => VALID_PAYLOAD });

    await getRealForecast();
    await getRealForecast();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('rejects (does not fabricate data) when the file is missing (404)', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(getRealForecast()).rejects.toThrow(/unavailable/i);
  });

  it('rejects when the file exists but is missing required fields', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ model: 'Holt-Winters' }) });

    await expect(getRealForecast()).rejects.toThrow(/missing required fields/i);
  });

  it('does not cache a failure, so the next call can retry', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, json: async () => VALID_PAYLOAD });

    await expect(getRealForecast()).rejects.toThrow();
    const data = await getRealForecast();

    expect(data).toEqual(VALID_PAYLOAD);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

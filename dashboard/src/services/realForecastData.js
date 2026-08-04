/**
 * Loads the Holt-Winters forecast export produced by
 * modeling/baselines/export_forecast.py (see that script + its README for
 * how to regenerate it). The dashboard reads it as a static file rather than
 * calling a backend — see api.js for why: no backend exists yet, and this is
 * the "manual/semi-automated pipeline" phase of the integration.
 */

const FORECAST_URL = '/data/forecast_holtwinters.json';

let cachedPromise = null;

function isValidForecastPayload(data) {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.historical) &&
    data.historical.length > 0 &&
    Array.isArray(data.forecast) &&
    data.forecast.length > 0
  );
}

async function fetchRealForecast() {
  let res;
  try {
    res = await fetch(FORECAST_URL);
  } catch {
    throw new Error('Unable to reach the forecast data file.');
  }
  if (!res.ok) {
    throw new Error(`Forecast data file unavailable (HTTP ${res.status}). Run export_forecast.py to generate it.`);
  }
  const data = await res.json();
  if (!isValidForecastPayload(data)) {
    throw new Error('Forecast data file is missing required fields (historical/forecast).');
  }
  return data;
}

/**
 * Returns the parsed Holt-Winters export, memoized across calls within a
 * page session. Throws (rejects) if the file is missing or malformed —
 * callers are responsible for falling back to sample data or showing an
 * error state; this function never fabricates a value.
 */
export function getRealForecast() {
  if (!cachedPromise) {
    cachedPromise = fetchRealForecast().catch((err) => {
      cachedPromise = null; // don't cache a failure — allow retry next call
      throw err;
    });
  }
  return cachedPromise;
}

/** Test-only: clears the memoized promise so each test starts fresh. */
export function __resetRealForecastCacheForTests() {
  cachedPromise = null;
}

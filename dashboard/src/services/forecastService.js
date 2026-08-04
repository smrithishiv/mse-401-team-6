import { mockRequest } from './api';
import { operationalForecast, operationalForecastWeekly, strategicForecastByHorizon } from '../data/mockForecastData';
import { driverExplanations, EMPTY_DRIVER_EXPLANATION } from '../data/mockDriverExplanations';
import { modelStatus } from '../data/mockModelStatus';
import { getRealForecast } from './realForecastData';
import { buildOperationalForecast } from '../utils/realForecastAdapter';

/**
 * Future backend integration:
 *   export function getOperationalForecast(filters) {
 *     return apiFetch(`/api/forecast/operational/monthly${toQueryString(filters)}`);
 *   }
 * Same pattern applies to getOperationalForecastWeekly and getStrategicForecast below.
 *
 * getOperationalForecast (monthly) is the one function wired to the real
 * Holt-Winters export today — see utils/realForecastAdapter.js. Weekly and
 * strategic stay on mock data: the model doesn't forecast at weekly
 * granularity or multi-year horizons, and fabricating either would violate
 * the "don't invent what the model doesn't produce" rule this integration
 * follows throughout.
 */

/**
 * Real Holt-Winters output if the export file is present and valid;
 * otherwise the existing mock `operationalForecast`, tagged `isSampleData:
 * true` so the UI can show it's not live model output. Never throws —
 * callers always get a renderable shape.
 */
async function loadOperationalMonthly() {
  try {
    const exportData = await getRealForecast();
    return buildOperationalForecast(exportData);
  } catch (err) {
    console.warn('[forecastService] Real forecast unavailable, falling back to sample data:', err.message);
    return { ...operationalForecast, isSampleData: true };
  }
}

const GENDER_SHARE = { male: 0.52, female: 0.4, other: 0.08 };

function scaleByFilters(value, filters) {
  let factor = 1;
  if (filters?.gender && filters.gender !== 'all') {
    factor *= GENDER_SHARE[filters.gender] ?? 1;
  }
  if (filters?.ageGroup && filters.ageGroup !== 'all') {
    factor *= 0.6; // demonstrates that narrowing the population reduces volume
  }
  if (filters?.income && filters.income !== 'all') {
    factor *= 0.7;
  }
  return factor;
}

export async function getOperationalForecast(filters = {}) {
  const real = await loadOperationalMonthly();
  const data = await mockRequest(real, { forceError: filters.forceError });
  const factor = scaleByFilters(1, filters);

  if (factor === 1) return data;

  return {
    ...data,
    months: data.months.map((m) => ({
      ...m,
      value: Math.round(m.value * factor),
      range: m.range
        ? {
            ...m.range,
            low: Math.round(m.range.low * factor),
            high: Math.round(m.range.high * factor),
          }
        : m.range,
    })),
    chart: {
      historical: data.chart.historical.map((p) => ({ ...p, value: Math.round(p.value * factor) })),
      forecast: data.chart.forecast.map((p) => ({
        ...p,
        value: Math.round(p.value * factor),
        low: Math.round(p.low * factor),
        high: Math.round(p.high * factor),
      })),
    },
  };
}

export async function getOperationalForecastWeekly(filters = {}) {
  const data = await mockRequest(operationalForecastWeekly, { forceError: filters.forceError });
  const factor = scaleByFilters(1, filters);

  if (factor === 1) return data;

  return {
    ...data,
    weeks: data.weeks.map((w) => ({
      ...w,
      value: Math.round(w.value * factor),
      range: w.range
        ? {
            ...w.range,
            low: Math.round(w.range.low * factor),
            high: Math.round(w.range.high * factor),
          }
        : w.range,
      currentAllocation: w.currentAllocation !== undefined ? Math.round(w.currentAllocation * factor) : w.currentAllocation,
      recommendedAllocation:
        w.recommendedAllocation !== undefined ? Math.round(w.recommendedAllocation * factor) : w.recommendedAllocation,
    })),
    chart: {
      historical: data.chart.historical.map((p) => ({ ...p, value: Math.round(p.value * factor) })),
      forecast: data.chart.forecast.map((p) => ({
        ...p,
        value: Math.round(p.value * factor),
        low: Math.round(p.low * factor),
        high: Math.round(p.high * factor),
      })),
    },
  };
}

/**
 * Future backend integration:
 *   export function getDriverExplanations(periodId, filters) {
 *     return apiFetch(`/api/forecast/drivers?period=${periodId}${toQueryString(filters)}`);
 *   }
 */
export async function getDriverExplanations(periodId, filters = {}) {
  return mockRequest(driverExplanations[periodId] ?? EMPTY_DRIVER_EXPLANATION, { forceError: filters.forceError });
}

/**
 * Future backend integration:
 *   export function getStrategicHorizonOptions() {
 *     return apiFetch('/api/forecast/horizons');
 *   }
 */
export async function getStrategicHorizonOptions() {
  return mockRequest({
    supportedHorizons: strategicForecastByHorizon.supportedHorizons,
    defaultHorizonYears: strategicForecastByHorizon.defaultHorizonYears,
  });
}

export async function getStrategicForecast(filters = {}, horizonYears = strategicForecastByHorizon.defaultHorizonYears) {
  const bucket =
    strategicForecastByHorizon.horizons[horizonYears] ??
    strategicForecastByHorizon.horizons[strategicForecastByHorizon.defaultHorizonYears];

  const data = await mockRequest(
    {
      horizonYears,
      supportedHorizons: strategicForecastByHorizon.supportedHorizons,
      ...bucket,
    },
    { forceError: filters.forceError }
  );
  const factor = scaleByFilters(1, filters);

  if (factor === 1) return data;

  return {
    ...data,
    summary: {
      ...data.summary,
      forecastValue: Math.round(data.summary.forecastValue * factor),
      expectedVariation: Math.round(data.summary.expectedVariation * factor),
    },
    chart: {
      historical: data.chart.historical.map((p) => ({ ...p, value: Math.round(p.value * factor) })),
      forecast: data.chart.forecast.map((p) => ({
        ...p,
        value: Math.round(p.value * factor),
        low: Math.round(p.low * factor),
        high: Math.round(p.high * factor),
      })),
    },
  };
}

/**
 * Future backend integration:
 *   export function getModelStatus() {
 *     return apiFetch('/api/model/status');
 *   }
 */
export async function getModelStatus() {
  return mockRequest(modelStatus);
}

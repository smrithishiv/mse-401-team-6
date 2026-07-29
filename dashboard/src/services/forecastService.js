import { mockRequest } from './api';
import { operationalForecast, strategicForecast } from '../data/mockForecastData';

/**
 * Future backend integration:
 *   export function getOperationalForecast(filters) {
 *     return apiFetch(`/api/forecast/operational${toQueryString(filters)}`);
 *   }
 * Same pattern applies to getStrategicForecast below.
 */

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
  const data = await mockRequest(operationalForecast, { forceError: filters.forceError });
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

export async function getStrategicForecast(filters = {}) {
  const data = await mockRequest(strategicForecast, { forceError: filters.forceError });
  const factor = scaleByFilters(1, filters);

  if (factor === 1) return data;

  return {
    ...data,
    summary: {
      ...data.summary,
      fiveYearForecastValue: Math.round(data.summary.fiveYearForecastValue * factor),
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

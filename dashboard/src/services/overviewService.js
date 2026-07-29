import { mockRequest } from './api';
import { getOverviewSnapshot } from '../data/mockOverviewData';
import { getAgencyAlerts } from './agencyService';
import { buildOperationalSummary } from '../utils/buildOperationalSummary';

/**
 * Future backend integration:
 *   export function getOverviewSummary(period) {
 *     return apiFetch(`/api/overview${toQueryString({ period })}`);
 *   }
 *   export function getOperationalSummary(period) {
 *     return apiFetch(`/api/overview/operational-summary${toQueryString({ period })}`);
 *   }
 */

/** @param {string} period - e.g. 'aug-2026' */
export async function getOverviewSummary(period = 'aug-2026', options = {}) {
  return mockRequest(getOverviewSnapshot(period), options);
}

/**
 * Builds the Overview page's "Operational Summary" from the same snapshot
 * + live agency data the rest of the page uses — deterministic, not an
 * LLM call, so it updates automatically whenever the underlying model
 * output or agency data changes without any change to this function.
 */
export async function getOperationalSummary(period = 'aug-2026') {
  const snapshot = getOverviewSnapshot(period);
  const alerts = await getAgencyAlerts();

  const items = buildOperationalSummary({
    currentForecast: { monthLabel: snapshot.predictedDemand.monthLabel, value: snapshot.predictedDemand.value },
    currentConfidence: snapshot.predictedDemand.confidence,
    allocationRecommendation: snapshot.predictedDemand.recommendationTitle,
    agencyAlerts: alerts,
    nextMonthForecast: snapshot.nextMonthForecast,
    populationSignals: snapshot.populationSignals,
  });

  return mockRequest(items);
}

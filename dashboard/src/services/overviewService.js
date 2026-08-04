import { mockRequest } from './api';
import { getOverviewSnapshot } from '../data/mockOverviewData';
import { getAgencyAlerts } from './agencyService';
import { buildOperationalSummary } from '../utils/buildOperationalSummary';
import { getRealForecast } from './realForecastData';
import { buildOverviewForecastSnapshots } from '../utils/realForecastAdapter';

/**
 * Future backend integration:
 *   export function getOverviewSummary(period) {
 *     return apiFetch(`/api/overview${toQueryString({ period })}`);
 *   }
 *   export function getOperationalSummary(period) {
 *     return apiFetch(`/api/overview/operational-summary${toQueryString({ period })}`);
 *   }
 */

/**
 * The Overview snapshot's `predictedDemand`/`nextMonthForecast`/freshness
 * fields come from the real Holt-Winters export when it's available;
 * everything else on Overview (active agencies, allocation alerts,
 * population signals) is unrelated to the forecast model and always comes
 * from the mock snapshot — merging the two here means the rest of the page
 * never has to know which source produced which field.
 *
 * Falls back to the plain mock snapshot (tagged `isSampleData: true`) if
 * the export file is missing or invalid, rather than throwing — Overview
 * should still render.
 *
 * @param {string} period - 'current' | 'previous'
 */
async function getMergedSnapshot(period) {
  const mockSnapshot = getOverviewSnapshot(period);

  try {
    const exportData = await getRealForecast();
    const real = buildOverviewForecastSnapshots(exportData);
    const piece = period === 'previous' ? real.previous : real.current;

    return {
      ...mockSnapshot,
      predictedDemand: piece.predictedDemand,
      nextMonthForecast: piece.nextMonthForecast ?? mockSnapshot.nextMonthForecast,
      lastUpdated: real.lastUpdated,
      modelLastRun: real.modelLastRun,
      model: exportData.model,
      modelStatus: exportData.modelStatus,
      modelStatusNote: exportData.modelStatusNote,
      isSampleData: false,
    };
  } catch (err) {
    console.warn('[overviewService] Real forecast unavailable, falling back to sample data:', err.message);
    return { ...mockSnapshot, isSampleData: true };
  }
}

/** @param {string} period - 'current' | 'previous' */
export async function getOverviewSummary(period = 'current', options = {}) {
  const snapshot = await getMergedSnapshot(period);
  return mockRequest(snapshot, options);
}

/**
 * Builds the Overview page's "Operational Summary" from the same snapshot
 * + live agency data the rest of the page uses — deterministic, not an
 * LLM call, so it updates automatically whenever the underlying model
 * output or agency data changes without any change to this function.
 */
export async function getOperationalSummary(period = 'current') {
  const snapshot = await getMergedSnapshot(period);
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

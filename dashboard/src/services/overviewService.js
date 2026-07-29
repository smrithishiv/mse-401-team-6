import { mockRequest } from './api';
import { getOverviewSnapshot, agencyAlerts } from '../data/mockOverviewData';

/**
 * Future backend integration:
 *   export function getOverviewSummary(period) {
 *     return apiFetch(`/api/overview${toQueryString({ period })}`);
 *   }
 *   export function getAgencyAlerts(filters) {
 *     return apiFetch(`/api/agencies/alerts${toQueryString(filters)}`);
 *   }
 */

/** @param {string} period - e.g. 'aug-2026' */
export async function getOverviewSummary(period = 'aug-2026', options = {}) {
  return mockRequest(getOverviewSnapshot(period), options);
}

/** @param {{ agency?: string, forceError?: boolean }} filters */
export async function getAgencyAlerts(filters = {}) {
  const filtered =
    filters.agency && filters.agency !== 'all'
      ? agencyAlerts.filter((a) => a.id === filters.agency)
      : agencyAlerts;

  return mockRequest(filtered, { forceError: filters.forceError });
}

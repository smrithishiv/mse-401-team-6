import { mockRequest } from './api';
import { overviewSummary, agencyAlerts } from '../data/mockOverviewData';

/**
 * Future backend integration:
 *   export function getOverviewSummary() {
 *     return apiFetch('/api/overview');
 *   }
 *   export function getAgencyAlerts() {
 *     return apiFetch('/api/agencies/alerts');
 *   }
 */

export async function getOverviewSummary(options = {}) {
  return mockRequest(overviewSummary, options);
}

export async function getAgencyAlerts(options = {}) {
  return mockRequest(agencyAlerts, options);
}

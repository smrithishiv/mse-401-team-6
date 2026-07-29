import { mockRequest } from './api';
import {
  atRiskMetrics,
  riskRegions,
  riskLegend,
  socioeconomicSignals,
  atRiskPopulationSignals,
} from '../data/mockRiskData';

/**
 * Future backend integration:
 *   export function getAtRiskGroups(filters) {
 *     return apiFetch(`/api/at-risk-groups${toQueryString(filters)}`);
 *   }
 */

export async function getAtRiskGroups(filters = {}) {
  return mockRequest(
    {
      metrics: atRiskMetrics,
      regions: riskRegions,
      legend: riskLegend,
      signals: socioeconomicSignals,
      populationSignals: atRiskPopulationSignals,
    },
    { forceError: filters.forceError }
  );
}

import { mockRequest } from './api';
import {
  getRiskSnapshot,
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

function filterRegions(regions, filters) {
  return regions.filter((region) => {
    if (filters.geography && filters.geography !== 'all' && region.id !== filters.geography) {
      return false;
    }
    if (filters.riskLevel && filters.riskLevel !== 'all' && region.riskLevel !== filters.riskLevel) {
      return false;
    }
    return true;
  });
}

function filterPopulationSignals(signals, filters) {
  if (!filters.populationGroup || filters.populationGroup === 'all') return signals;
  return signals.filter((s) => s.id === filters.populationGroup);
}

function filterSocioeconomicSignals(signals, filters) {
  if (!filters.socioeconomicIndicator || filters.socioeconomicIndicator === 'all') return signals;
  return signals.filter((s) => s.id === filters.socioeconomicIndicator);
}

export async function getAtRiskGroups(filters = {}) {
  const snapshot = getRiskSnapshot(filters.reportingPeriod);

  const payload = {
    metrics: snapshot.metrics,
    regions: filterRegions(snapshot.regions, filters),
    legend: riskLegend,
    signals: filterSocioeconomicSignals(socioeconomicSignals, filters),
    populationSignals: filterPopulationSignals(atRiskPopulationSignals, filters),
  };

  return mockRequest(payload, { forceError: filters.forceError });
}

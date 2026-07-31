import { mockRequest } from './api';
import {
  getRiskSnapshot,
  riskLegend,
  atRiskPopulationSignalsByPeriod,
  getRegionRiskIndex,
  getHighRiskGroups,
  getHighRiskAreas,
  getCpiFood,
  getRegionalMetrics,
  riskIndexMeta,
  REGION_NAME_BY_ID,
} from '../data/mockRiskData';
import { formatNumber } from '../utils/format';

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

function formatMetricValue(metric) {
  if (metric.value === null || metric.value === undefined) return 'Not available';
  if (metric.id === 'living-wage-gap') return `$${metric.value.toFixed(2)}`;
  if (metric.id === 'social-assistance-cases') return formatNumber(metric.value);
  return `${metric.value}${metric.unit}`;
}

const STATUS_LABEL = { critical: 'Critical', elevated: 'Elevated', normal: 'Normal', unavailable: 'Unavailable' };

/** Adapts a regional metric into the tile shape SocioeconomicSignalCard expects. */
function toSignalCard(metric, regionLabel, reportingPeriodLabel) {
  return {
    id: metric.id,
    label: metric.label,
    value: formatMetricValue(metric),
    description: `${regionLabel} · ${reportingPeriodLabel}`,
    status: STATUS_LABEL[metric.status] || metric.status,
    geographyLevel: metric.geographyLevel,
  };
}

function scalePopulationSignalsForRegion(signals, regionId, regions) {
  if (!regionId) return signals;
  const region = regions.find((r) => r.id === regionId);
  if (!region) return signals;

  const multiplier = { low: 0.75, medium: 1, 'med-high': 1.15, high: 1.35 }[region.riskLevel] ?? 1;
  return signals.map((s) => ({ ...s, changePct: Math.max(0, Math.min(99, Math.round(s.changePct * multiplier))) }));
}

function filterHighRiskGroupsForRegion(groups, regionId) {
  if (!regionId) return groups;
  const matched = groups.filter((g) => g.regions.includes(regionId));
  return matched.length > 0 ? matched : groups;
}

export async function getAtRiskGroups(filters = {}) {
  const period = filters.reportingPeriod;
  const snapshot = getRiskSnapshot(period);
  const regionId = filters.region || null;
  const regionName = regionId ? REGION_NAME_BY_ID[regionId] : null;
  const reportingPeriodLabel = period === 'may-2026' ? 'May 2026' : 'June 2026';

  const regionRiskIndex = regionId ? getRegionRiskIndex(regionId, period) : null;
  const avgRiskIndex = regionRiskIndex
    ? { value: regionRiskIndex.value, prevValue: regionRiskIndex.prevValue }
    : snapshot.metrics.avgRiskIndex;

  const regionalMetrics = getRegionalMetrics(regionId, period);
  const regionLabelForCards = regionName || 'Waterloo Region';
  const signalCards = regionalMetrics.map((m) => toSignalCard(m, regionLabelForCards, reportingPeriodLabel));

  const basePopulationSignals = atRiskPopulationSignalsByPeriod[period] || atRiskPopulationSignalsByPeriod['jun-2026'];
  const populationSignals = scalePopulationSignalsForRegion(basePopulationSignals, regionId, snapshot.regions);

  const highRiskGroups = filterHighRiskGroupsForRegion(getHighRiskGroups(period), regionId);

  const payload = {
    metrics: { ...snapshot.metrics, avgRiskIndex },
    regions: filterRegions(snapshot.regions, filters),
    legend: riskLegend,
    signals: filterSocioeconomicSignals(signalCards, filters),
    populationSignals: filterPopulationSignals(populationSignals, filters),
    regionalMetrics,
    highRiskGroups,
    highRiskAreas: getHighRiskAreas(period),
    riskIndexMeta,
    cpiFood: getCpiFood(period),
    selectedRegion: regionId,
    selectedRegionName: regionName,
  };

  return mockRequest(payload, { forceError: filters.forceError });
}

import { riskRegions } from '../data/mockRiskData';

/**
 * Single source of truth for the region catalog. At-risk Groups filters
 * consume this today; if geography is later promoted to a dashboard-wide
 * context (shared across Forecast/Overview/At-risk once the forecast model
 * supports regional breakdowns), that context should read from here too
 * rather than duplicating the region list.
 */
export const GEOGRAPHY_OPTIONS = riskRegions.map((region) => ({
  value: region.id,
  label: region.name,
}));

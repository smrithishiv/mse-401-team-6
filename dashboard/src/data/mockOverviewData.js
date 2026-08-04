/**
 * Mock/fallback data backing the Overview page. Agency-level data (used to
 * be a separate `agencyAlerts` export here) now lives in `mockAgencyData.js`
 * / `agencyService.js` — Overview's review queue reads from there so there
 * is one source of truth for agency data across Overview and the Agencies
 * page.
 *
 * Snapshot keys are the generic 'current'/'previous' period identifiers
 * (not specific calendar months) so the same two keys work whether
 * overviewService is serving this mock data or the real Holt-Winters
 * export (see utils/realForecastAdapter.js) — a real forecast's "current"
 * period isn't always a fixed month, so the period selector can't hardcode
 * one.
 */

export const OVERVIEW_REPORTING_PERIOD_OPTIONS = [
  { value: 'current', label: 'Current period (predicted)' },
  { value: 'previous', label: 'Previous period (actual)' },
];

const overviewSnapshots = {
  current: {
    predictedDemand: {
      monthLabel: 'August 2026',
      value: 54200,
      vsPrevPct: 4.5,
      range: { low: 51800, high: 56600 },
      confidence: 'high',
      isActual: false,
      recommendationTitle: 'Proceed with current allocation plan, no manual review needed',
      recommendationHelp:
        "Confidence is high when the forecast range is within ±5% of the predicted number. Below that it's flagged low and needs manual confirmation.",
    },
    activeAgencies: { value: 61, subtitle: 'No change' },
    allocationAlerts: { value: 3, subtitle: '2 need review' },
    nextMonthForecast: { monthLabel: 'September 2026', isoMonth: '2026-09', value: 57100, confidence: 'low' },
    lastUpdated: '2026-07-01T06:00:00-04:00',
    modelLastRun: '2026-06-30T23:45:00-04:00',
    populationSignals: [
      { id: 'newcomer-families', label: 'Newcomer families', changePct: 78 },
      { id: 'single-parent', label: 'Single-parent HH', changePct: 61 },
      { id: 'seniors', label: 'Seniors (65+)', changePct: 44 },
    ],
  },
  previous: {
    predictedDemand: {
      monthLabel: 'July 2026',
      value: 51840,
      vsPrevPct: null,
      range: null,
      confidence: null,
      isActual: true,
      recommendationTitle: 'Recorded actual — no forecast action needed',
      recommendationHelp: 'July 2026 figures are recorded hamper-visit counts, not a model prediction.',
    },
    activeAgencies: { value: 60, subtitle: '+1 since June' },
    allocationAlerts: { value: 1, subtitle: '0 need review' },
    nextMonthForecast: { monthLabel: 'August 2026', isoMonth: '2026-08', value: 54200, confidence: 'high' },
    lastUpdated: '2026-06-01T06:00:00-04:00',
    modelLastRun: '2026-05-31T23:45:00-04:00',
    populationSignals: [
      { id: 'newcomer-families', label: 'Newcomer families', changePct: 71 },
      { id: 'single-parent', label: 'Single-parent HH', changePct: 55 },
      { id: 'seniors', label: 'Seniors (65+)', changePct: 40 },
    ],
  },
};

/** @param {string} period */
export function getOverviewSnapshot(period = 'current') {
  return overviewSnapshots[period] || overviewSnapshots.current;
}

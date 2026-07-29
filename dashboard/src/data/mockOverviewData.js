/**
 * Mock data backing the Overview page.
 */

export const OVERVIEW_REPORTING_PERIOD_OPTIONS = [
  { value: 'aug-2026', label: 'August 2026 (predicted)' },
  { value: 'jul-2026', label: 'July 2026 (actual)' },
];

const overviewSnapshots = {
  'aug-2026': {
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
    nextMonthForecast: { value: 57100, confidence: 'low' },
    lastUpdated: '2026-07-01T06:00:00-04:00',
    populationSignals: [
      { id: 'newcomer-families', label: 'Newcomer families', changePct: 78 },
      { id: 'single-parent', label: 'Single-parent HH', changePct: 61 },
      { id: 'seniors', label: 'Seniors (65+)', changePct: 44 },
    ],
  },
  'jul-2026': {
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
    nextMonthForecast: { value: 54200, confidence: 'high' },
    lastUpdated: '2026-06-01T06:00:00-04:00',
    populationSignals: [
      { id: 'newcomer-families', label: 'Newcomer families', changePct: 71 },
      { id: 'single-parent', label: 'Single-parent HH', changePct: 55 },
      { id: 'seniors', label: 'Seniors (65+)', changePct: 40 },
    ],
  },
};

/** @param {string} period */
export function getOverviewSnapshot(period = 'aug-2026') {
  return overviewSnapshots[period] || overviewSnapshots['aug-2026'];
}

export const agencyAlerts = [
  {
    id: 'kw-ymca',
    name: 'KW YMCA',
    status: 'High demand',
    trend: [32, 38, 55, 68],
  },
  {
    id: 'cambridge-food-bank',
    name: 'Cambridge Food Bank',
    status: 'Watch',
    trend: [30, 34, 46, 52],
  },
  {
    id: 'waterloo-community-centre',
    name: 'Waterloo Community Centre',
    status: 'Normal',
    trend: [40, 39, 41, 40],
  },
];

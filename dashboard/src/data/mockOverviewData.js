/**
 * Mock data backing the Overview page.
 */

export const overviewSummary = {
  predictedDemand: {
    monthLabel: 'August 2026',
    value: 54200,
    vsPrevPct: 4.5,
    range: { low: 51800, high: 56600 },
    confidence: 'high',
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
};

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

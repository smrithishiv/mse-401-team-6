/**
 * Mock data backing the Forecast page (operational + strategic views).
 * Shapes here mirror the contracts documented in src/utils/types.js so that
 * swapping in real API responses later requires no changes to components.
 */

export const operationalForecast = {
  months: [
    {
      id: 'jul-2026',
      label: 'July 2026',
      subLabel: '(Jul – Sep 2026)',
      type: 'actual',
      value: 51840,
      subtitle: 'Recorded, not a forecast',
    },
    {
      id: 'aug-2026',
      label: 'Aug 2026',
      type: 'predicted',
      value: 54200,
      range: { low: 51800, high: 56600, marginPct: 4.4 },
      confidence: 'high',
      action: 'Proceed with current allocation',
    },
    {
      id: 'sep-2026',
      label: 'Sept 2026',
      type: 'predicted',
      value: 57100,
      range: { low: 50400, high: 63800, marginPct: 11.7 },
      confidence: 'low',
      action: 'Confirm allocation manually before distributing',
    },
  ],
  defaultSelectedMonthId: 'aug-2026',
  warning:
    'September confidence is lower because two of its inputs (unemployment and rental vacancy) are projected forward rather than measured, and projections beyond 60 days carry more error.',
  warningLinkLabel: 'Learn how projections work',
  chart: {
    historical: [
      { label: 'Jan', value: 44200 },
      { label: 'Feb', value: 45400 },
      { label: 'Mar', value: 46300 },
      { label: 'Apr', value: 47100 },
      { label: 'May', value: 47900 },
      { label: 'Jun', value: 48600 },
    ],
    forecast: [
      { label: 'Jun', value: 48600, low: 48600, high: 48600 },
      { label: 'Jul', value: 51840, low: 51840, high: 51840 },
      { label: 'Aug', value: 54200, low: 51800, high: 56600 },
      { label: 'Sep', value: 57100, low: 50400, high: 63800 },
    ],
  },
  driverBreakdown: {
    monthLabel: 'August',
    drivers: [
      { id: 'newcomer-families', label: 'Newcomer Families', pctOfDemand: 28 },
      { id: 'single-parent', label: 'Single Parent Households', pctOfDemand: 22 },
      { id: 'seniors', label: 'Seniors (65+)', pctOfDemand: 14 },
    ],
  },
};

export const strategicForecast = {
  summary: {
    fiveYearForecastValue: 2750000,
    vsChangePct: 51,
    expectedVariation: 33280,
    expectedVariationPct: 1.2,
    lastModelRun: '2026-06-30',
  },
  chart: {
    historical: [
      { label: '2024', value: 430000 },
      { label: '2025', value: 452000 },
      { label: '2026', value: 468000 },
    ],
    forecast: [
      { label: '2026', value: 468000, low: 468000, high: 468000 },
      { label: '2027', value: 495000, low: 483000, high: 507000 },
      { label: '2028', value: 520000, low: 498000, high: 542000 },
      { label: '2029', value: 552000, low: 519000, high: 585000 },
      { label: '2030', value: 583000, low: 538000, high: 628000 },
      { label: '2031', value: 618000, low: 555000, high: 681000 },
    ],
  },
  demandBreakdown: {
    gender: [
      { label: 'M', pct: 52, color: 'var(--bb-blue)' },
      { label: 'F', pct: 40, color: 'var(--bb-red)' },
      { label: 'Other', pct: 8, color: 'var(--bb-grey)' },
    ],
    ageGroup: [
      { label: '<18', pct: 34, color: 'var(--bb-purple)' },
      { label: '18-44', pct: 28, color: 'var(--bb-blue)' },
      { label: '45-64', pct: 24, color: 'var(--bb-green)' },
      { label: '65+', pct: 14, color: 'var(--bb-yellow)' },
    ],
    income: [
      { label: '<$20k', pct: 29, color: 'var(--bb-red)' },
      { label: '$20-40k', pct: 35, color: 'var(--bb-green)' },
      { label: '$40-60k', pct: 22, color: 'var(--bb-purple)' },
      { label: '$60k+', pct: 14, color: 'var(--bb-grey)' },
    ],
  },
};

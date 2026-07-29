/**
 * Mock data backing the Forecast page (operational + strategic views).
 * Shapes here mirror the contracts documented in src/utils/types.js so that
 * swapping in real API responses later requires no changes to components.
 */

export const operationalForecast = {
  months: [
    {
      id: 'jul-2026',
      isoMonth: '2026-07',
      label: 'July 2026',
      subLabel: '(Jul – Sep 2026)',
      type: 'actual',
      value: 51840,
      subtitle: 'Recorded, not a forecast',
    },
    {
      id: 'aug-2026',
      isoMonth: '2026-08',
      label: 'Aug 2026',
      type: 'predicted',
      value: 54200,
      range: { low: 51800, high: 56600, marginPct: 4.4 },
      confidence: 'high',
      action: 'Proceed with current allocation',
    },
    {
      id: 'sep-2026',
      isoMonth: '2026-09',
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
  // Powers the "Demand drivers — 5-year outlook" panel. `years` matches
  // chart.forecast above (2026 = the connecting/base year through 2031).
  // Each segment's `points[].people` is that segment's pct share of the
  // matching year's total from chart.forecast, so segment people sum to
  // the year's total demand exactly.
  demandDrivers: {
    years: [2026, 2027, 2028, 2029, 2030, 2031],
    dimensions: {
      ageGroup: {
        // Real model output: age-group mix projected forward from
        // historical hamper-visit trends + StatCan age-distribution indicators.
        dataType: 'model_forecast',
        segments: [
          {
            id: 'under18',
            label: '<18',
            color: 'var(--bb-purple)',
            points: [
              { year: 2026, pct: 34, people: 159120 },
              { year: 2027, pct: 33, people: 163350 },
              { year: 2028, pct: 32, people: 166400 },
              { year: 2029, pct: 31, people: 171120 },
              { year: 2030, pct: 30, people: 174900 },
              { year: 2031, pct: 29, people: 179220 },
            ],
          },
          {
            id: '18-44',
            label: '18-44',
            color: 'var(--bb-blue)',
            points: [
              { year: 2026, pct: 28, people: 131040 },
              { year: 2027, pct: 28, people: 138600 },
              { year: 2028, pct: 28, people: 145600 },
              { year: 2029, pct: 29, people: 160080 },
              { year: 2030, pct: 29, people: 169070 },
              { year: 2031, pct: 29, people: 179220 },
            ],
          },
          {
            id: '45-64',
            label: '45-64',
            color: 'var(--bb-green)',
            points: [
              { year: 2026, pct: 24, people: 112320 },
              { year: 2027, pct: 24, people: 118800 },
              { year: 2028, pct: 24, people: 124800 },
              { year: 2029, pct: 23, people: 126960 },
              { year: 2030, pct: 23, people: 134090 },
              { year: 2031, pct: 23, people: 142140 },
            ],
          },
          {
            id: '65+',
            label: '65+',
            color: 'var(--bb-yellow)',
            points: [
              { year: 2026, pct: 14, people: 65520 },
              { year: 2027, pct: 15, people: 74250 },
              { year: 2028, pct: 16, people: 83200 },
              { year: 2029, pct: 17, people: 93840 },
              { year: 2030, pct: 18, people: 104940 },
              { year: 2031, pct: 19, people: 117420 },
            ],
          },
        ],
      },
      income: {
        // Planning assumption, not a statistical projection: assumes the
        // current living-wage gap (see At-risk Groups) persists, gradually
        // shifting more households into the lowest income bracket. Swap for
        // a model_forecast once income is modelled directly.
        dataType: 'planning_scenario',
        segments: [
          {
            id: 'under20k',
            label: '<$20k',
            color: 'var(--bb-red)',
            points: [
              { year: 2026, pct: 29, people: 135720 },
              { year: 2027, pct: 30, people: 148500 },
              { year: 2028, pct: 31, people: 161200 },
              { year: 2029, pct: 32, people: 176640 },
              { year: 2030, pct: 33, people: 192390 },
              { year: 2031, pct: 34, people: 210120 },
            ],
          },
          {
            id: '20-40k',
            label: '$20-40k',
            color: 'var(--bb-green)',
            points: [
              { year: 2026, pct: 35, people: 163800 },
              { year: 2027, pct: 35, people: 173250 },
              { year: 2028, pct: 34, people: 176800 },
              { year: 2029, pct: 34, people: 187680 },
              { year: 2030, pct: 33, people: 192390 },
              { year: 2031, pct: 33, people: 203940 },
            ],
          },
          {
            id: '40-60k',
            label: '$40-60k',
            color: 'var(--bb-purple)',
            points: [
              { year: 2026, pct: 22, people: 102960 },
              { year: 2027, pct: 21, people: 103950 },
              { year: 2028, pct: 21, people: 109200 },
              { year: 2029, pct: 20, people: 110400 },
              { year: 2030, pct: 20, people: 116600 },
              { year: 2031, pct: 19, people: 117420 },
            ],
          },
          {
            id: '60k-plus',
            label: '$60k+',
            color: 'var(--bb-grey)',
            points: [
              { year: 2026, pct: 14, people: 65520 },
              { year: 2027, pct: 14, people: 69300 },
              { year: 2028, pct: 14, people: 72800 },
              { year: 2029, pct: 14, people: 77280 },
              { year: 2030, pct: 14, people: 81620 },
              { year: 2031, pct: 14, people: 86520 },
            ],
          },
        ],
      },
      gender: {
        // No gender-specific forecasting model exists yet — today's
        // measured split is held constant across all five years rather than
        // projected. Shown with a distinct label so it never reads as a
        // model-generated forecast.
        dataType: 'current_proportions',
        segments: [
          {
            id: 'male',
            label: 'Male',
            color: 'var(--bb-blue)',
            points: [
              { year: 2026, pct: 52, people: 243360 },
              { year: 2027, pct: 52, people: 257400 },
              { year: 2028, pct: 52, people: 270400 },
              { year: 2029, pct: 52, people: 287040 },
              { year: 2030, pct: 52, people: 303160 },
              { year: 2031, pct: 52, people: 321360 },
            ],
          },
          {
            id: 'female',
            label: 'Female',
            color: 'var(--bb-red)',
            points: [
              { year: 2026, pct: 40, people: 187200 },
              { year: 2027, pct: 40, people: 198000 },
              { year: 2028, pct: 40, people: 208000 },
              { year: 2029, pct: 40, people: 220800 },
              { year: 2030, pct: 40, people: 233200 },
              { year: 2031, pct: 40, people: 247200 },
            ],
          },
          {
            id: 'other',
            label: 'Other',
            color: 'var(--bb-grey)',
            points: [
              { year: 2026, pct: 8, people: 37440 },
              { year: 2027, pct: 8, people: 39600 },
              { year: 2028, pct: 8, people: 41600 },
              { year: 2029, pct: 8, people: 44160 },
              { year: 2030, pct: 8, people: 46640 },
              { year: 2031, pct: 8, people: 49440 },
            ],
          },
        ],
      },
    },
  },
};

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
      statusKey: 'actual',
      chartLabel: 'Jul',
    },
    {
      id: 'aug-2026',
      isoMonth: '2026-08',
      label: 'Aug 2026',
      type: 'predicted',
      value: 54200,
      range: { low: 51800, high: 56600, marginPct: 4.4 },
      confidence: 'high',
      statusKey: 'on-track',
      chartLabel: 'Aug',
    },
    {
      id: 'sep-2026',
      isoMonth: '2026-09',
      label: 'Sept 2026',
      type: 'predicted',
      value: 57100,
      range: { low: 50400, high: 63800, marginPct: 11.7 },
      confidence: 'low',
      statusKey: 'manual-review',
      chartLabel: 'Sep',
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
};

// Week-level counterpart to `operationalForecast`, covering the same
// Jun–Aug window at finer granularity. Per-group "who's driving the
// number" explanations live in mockDriverExplanations.js, keyed by week id.
export const operationalForecastWeekly = {
  weeks: [
    {
      id: 'wk-2026-06-30',
      weekStart: '2026-06-30',
      weekEnd: '2026-07-06',
      label: 'Jun 30 – Jul 6',
      type: 'actual',
      value: 12100,
      changeFromPreviousWeekPct: null,
      statusKey: 'actual',
    },
    {
      id: 'wk-2026-07-07',
      weekStart: '2026-07-07',
      weekEnd: '2026-07-13',
      label: 'Jul 7 – 13',
      type: 'actual',
      value: 12480,
      changeFromPreviousWeekPct: 3.1,
      statusKey: 'actual',
    },
    {
      id: 'wk-2026-07-14',
      weekStart: '2026-07-14',
      weekEnd: '2026-07-20',
      label: 'Jul 14 – 20',
      type: 'actual',
      value: 12800,
      changeFromPreviousWeekPct: 2.6,
      statusKey: 'actual',
    },
    {
      id: 'wk-2026-07-21',
      weekStart: '2026-07-21',
      weekEnd: '2026-07-27',
      label: 'Jul 21 – 27',
      type: 'actual',
      value: 13100,
      changeFromPreviousWeekPct: 2.3,
      statusKey: 'actual',
    },
    {
      id: 'wk-2026-07-28',
      weekStart: '2026-07-28',
      weekEnd: '2026-08-03',
      label: 'Jul 28 – Aug 3',
      type: 'predicted',
      value: 13500,
      changeFromPreviousWeekPct: 3.1,
      range: { low: 12950, high: 14050, marginPct: 4.1 },
      confidence: 'high',
      statusKey: 'on-track',
      currentAllocation: 13000,
      recommendedAllocation: 13500,
    },
    {
      id: 'wk-2026-08-04',
      weekStart: '2026-08-04',
      weekEnd: '2026-08-10',
      label: 'Aug 4 – 10',
      type: 'predicted',
      value: 14100,
      changeFromPreviousWeekPct: 4.4,
      range: { low: 12600, high: 15600, marginPct: 10.6 },
      confidence: 'low',
      statusKey: 'manual-review',
      currentAllocation: 13500,
      recommendedAllocation: 14100,
    },
  ],
  defaultSelectedWeekId: 'wk-2026-07-28',
  warning:
    'The week of Aug 4–10 has lower confidence because two of its inputs (unemployment and rental vacancy) are projected forward rather than measured, and projections beyond 60 days carry more error.',
  warningLinkLabel: 'Learn how projections work',
  chart: {
    historical: [
      { label: 'Jun 30 – Jul 6', value: 12100 },
      { label: 'Jul 7 – 13', value: 12480 },
      { label: 'Jul 14 – 20', value: 12800 },
      { label: 'Jul 21 – 27', value: 13100 },
    ],
    forecast: [
      { label: 'Jul 21 – 27', value: 13100, low: 13100, high: 13100 },
      { label: 'Jul 28 – Aug 3', value: 13500, low: 12950, high: 14050 },
      { label: 'Aug 4 – 10', value: 14100, low: 12600, high: 15600 },
    ],
  },
};

// Full 5-year historical+forecast series, kept as the source data that the
// 2/3-year buckets are sliced from and the 10-year bucket extends.
const FIVE_YEAR_HISTORICAL = [
  { label: '2024', value: 430000 },
  { label: '2025', value: 452000 },
  { label: '2026', value: 468000 },
];

const FIVE_YEAR_FORECAST = [
  { label: '2026', value: 468000, low: 468000, high: 468000 },
  { label: '2027', value: 495000, low: 483000, high: 507000 },
  { label: '2028', value: 520000, low: 498000, high: 542000 },
  { label: '2029', value: 552000, low: 519000, high: 585000 },
  { label: '2030', value: 583000, low: 538000, high: 628000 },
  { label: '2031', value: 618000, low: 555000, high: 681000 },
];

// Hand-authored continuation of FIVE_YEAR_FORECAST through 2036. The
// [low, high] band widens noticeably faster than the 5-year bucket's does,
// year over year, so the strategic chart visibly shows uncertainty growing
// with a longer horizon — this is what the ">5 years" notice refers to.
const TEN_YEAR_FORECAST_TAIL = [
  { label: '2032', value: 655000, low: 565000, high: 745000 },
  { label: '2033', value: 693000, low: 565000, high: 821000 },
  { label: '2034', value: 732000, low: 553000, high: 911000 },
  { label: '2035', value: 772000, low: 525000, high: 1019000 },
  { label: '2036', value: 813000, low: 480000, high: 1146000 },
];

// Powers the "Demand drivers — N-year outlook" panel. `years` matches the
// 5-year chart above (2026 = the connecting/base year through 2031). Each
// segment's `points[].people` is that segment's pct share of the matching
// year's total from FIVE_YEAR_FORECAST, so segment people sum to the
// year's total demand exactly.
const FIVE_YEAR_DEMAND_DRIVERS = {
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
  };
/** Slices a chart's forecast series (plus its unchanged historical series) to years <= throughYear. */
function sliceChart(historical, forecast, throughYear) {
  return {
    historical,
    forecast: forecast.filter((p) => Number(p.label) <= throughYear),
  };
}

/** Slices demand-driver years/points to years <= throughYear — used for the 2/3-year buckets. */
function sliceDemandDrivers(demandDrivers, throughYear) {
  return {
    years: demandDrivers.years.filter((y) => y <= throughYear),
    dimensions: Object.fromEntries(
      Object.entries(demandDrivers.dimensions).map(([key, dimension]) => [
        key,
        {
          dataType: dimension.dataType,
          segments: dimension.segments.map((seg) => ({
            ...seg,
            points: seg.points.filter((p) => p.year <= throughYear),
          })),
        },
      ])
    ),
  };
}

/**
 * Extends demand-driver years/points through 2036 for the 10-year bucket by
 * continuing each segment's most recent year-over-year pct trend, then
 * rescaling each year's segments to sum to 100% and deriving `people` from
 * the 10-year chart's total demand for that year. This is a mechanical
 * extrapolation for demo purposes, not a real model projection.
 */
function extendDemandDrivers(demandDrivers, extraYears, totalByYear) {
  const dimensions = Object.fromEntries(
    Object.entries(demandDrivers.dimensions).map(([key, dimension]) => {
      const segments = dimension.segments.map((seg) => {
        const points = [...seg.points];
        const last = points[points.length - 1];
        const prev = points[points.length - 2];
        const yearlyDelta = last.pct - prev.pct;
        let currentPct = last.pct;

        extraYears.forEach((year) => {
          currentPct = Math.max(0, currentPct + yearlyDelta);
          points.push({ year, pct: currentPct, people: 0 });
        });

        return { ...seg, points };
      });

      extraYears.forEach((year) => {
        const yearPoints = segments.map((seg) => seg.points.find((p) => p.year === year));
        const total = yearPoints.reduce((sum, p) => sum + p.pct, 0);
        const scale = total > 0 ? 100 / total : 1;
        let runningPct = 0;

        yearPoints.forEach((point, i) => {
          const isLast = i === yearPoints.length - 1;
          point.pct = isLast ? 100 - runningPct : Math.round(point.pct * scale);
          runningPct += point.pct;
          point.people = Math.round((point.pct / 100) * totalByYear[year]);
        });
      });

      return [key, { dataType: dimension.dataType, segments }];
    })
  );

  return {
    years: [...demandDrivers.years, ...extraYears],
    dimensions,
  };
}

const TEN_YEAR_FORECAST = [...FIVE_YEAR_FORECAST, ...TEN_YEAR_FORECAST_TAIL];
const TEN_YEAR_TOTAL_BY_YEAR = Object.fromEntries(TEN_YEAR_FORECAST.map((p) => [Number(p.label), p.value]));

/** Cumulative demand across a horizon's predicted years (excludes the connecting/base year). */
function cumulativeForecastValue(forecast) {
  return forecast.slice(1).reduce((sum, p) => sum + p.value, 0);
}

function summaryForBucket(forecast, vsChangePct) {
  const finalYear = forecast[forecast.length - 1];
  const expectedVariation = Math.round((finalYear.high - finalYear.low) / 2);
  return {
    forecastValue: cumulativeForecastValue(forecast),
    vsChangePct,
    expectedVariation,
    expectedVariationPct: Math.round((expectedVariation / finalYear.value) * 1000) / 10,
  };
}

const HORIZON_2_CHART = sliceChart(FIVE_YEAR_HISTORICAL, FIVE_YEAR_FORECAST, 2028);
const HORIZON_3_CHART = sliceChart(FIVE_YEAR_HISTORICAL, FIVE_YEAR_FORECAST, 2029);
const HORIZON_10_CHART = { historical: FIVE_YEAR_HISTORICAL, forecast: TEN_YEAR_FORECAST };

export const strategicForecastByHorizon = {
  supportedHorizons: [2, 3, 5, 10],
  defaultHorizonYears: 5,
  horizons: {
    2: {
      summary: summaryForBucket(HORIZON_2_CHART.forecast, 20),
      chart: HORIZON_2_CHART,
      demandDrivers: sliceDemandDrivers(FIVE_YEAR_DEMAND_DRIVERS, 2028),
    },
    3: {
      summary: summaryForBucket(HORIZON_3_CHART.forecast, 31),
      chart: HORIZON_3_CHART,
      demandDrivers: sliceDemandDrivers(FIVE_YEAR_DEMAND_DRIVERS, 2029),
    },
    5: {
      summary: { forecastValue: 2750000, vsChangePct: 51, expectedVariation: 33280, expectedVariationPct: 1.2 },
      chart: { historical: FIVE_YEAR_HISTORICAL, forecast: FIVE_YEAR_FORECAST },
      demandDrivers: FIVE_YEAR_DEMAND_DRIVERS,
    },
    10: {
      summary: summaryForBucket(HORIZON_10_CHART.forecast, 85),
      chart: HORIZON_10_CHART,
      demandDrivers: extendDemandDrivers(FIVE_YEAR_DEMAND_DRIVERS, [2032, 2033, 2034, 2035, 2036], TEN_YEAR_TOTAL_BY_YEAR),
    },
  },
};

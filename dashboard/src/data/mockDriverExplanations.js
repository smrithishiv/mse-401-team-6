/**
 * Per-period demand-driver explanations, keyed by the same month/week id
 * used in mockForecastData.js. Supersedes the old flat driverBreakdown /
 * driverBreakdownByWeekId shapes with per-group contributing-factor detail.
 *
 * Every `explanation` string uses correlational language only
 * ("associated with", "contributing signal", "the model indicates",
 * "forecast influenced by") — never causal language — since these are mock
 * explanations standing in for a not-yet-finalized model, not validated
 * causal findings.
 */
export const driverExplanations = {
  'jul-2026': {
    periodLabel: 'July 2026',
    groups: [
      {
        groupId: 'newcomer-families',
        name: 'Newcomer Families',
        shareOfDemand: 26,
        projectedChangePercent: 1.8,
        contributingFactors: [
          {
            id: 'arrivals-volume',
            name: 'Newcomer arrivals volume',
            direction: 'positive',
            contribution: 0.6,
            explanation:
              'Recorded newcomer arrivals were associated with steady demand at intake-adjacent agencies this period.',
          },
        ],
        detailHref: '/help/projections#external-indicators',
      },
      {
        groupId: 'single-parent-households',
        name: 'Single Parent Households',
        shareOfDemand: 21,
        projectedChangePercent: 2.1,
        contributingFactors: [
          {
            id: 'household-benefit-level',
            name: 'Household benefit level',
            direction: 'negative',
            contribution: 0.5,
            explanation: 'Household support levels this period were a contributing signal in recorded demand.',
          },
        ],
      },
      {
        groupId: 'seniors',
        name: 'Seniors (65+)',
        shareOfDemand: 14,
        projectedChangePercent: 0.6,
        contributingFactors: [
          {
            id: 'fixed-income-pressure',
            name: 'Fixed-income cost pressure',
            direction: 'positive',
            contribution: 0.4,
            explanation: 'The model indicates fixed-income cost pressure was a modest contributing signal this period.',
          },
        ],
      },
    ],
  },
  'aug-2026': {
    periodLabel: 'August 2026',
    groups: [
      {
        groupId: 'newcomer-families',
        name: 'Newcomer Families',
        shareOfDemand: 28,
        projectedChangePercent: 6.2,
        contributingFactors: [
          {
            id: 'arrivals-volume',
            name: 'Newcomer arrivals volume',
            direction: 'positive',
            contribution: 0.55,
            explanation:
              'A projected increase in newcomer arrivals is associated with increased demand at intake-adjacent agencies.',
          },
          {
            id: 'settlement-support',
            name: 'Settlement support funding',
            direction: 'negative',
            contribution: 0.2,
            explanation:
              'Reduced settlement funding is a contributing signal the model associates with slower transition off hamper support.',
          },
        ],
        detailHref: '/help/projections#external-indicators',
      },
      {
        groupId: 'single-parent-households',
        name: 'Single Parent Households',
        shareOfDemand: 22,
        projectedChangePercent: 8.4,
        contributingFactors: [
          {
            id: 'household-benefit-level',
            name: 'Household benefit level',
            direction: 'negative',
            contribution: 0.34,
            explanation: 'A projected reduction in household support is associated with increased demand.',
          },
        ],
      },
      {
        groupId: 'seniors',
        name: 'Seniors (65+)',
        shareOfDemand: 14,
        projectedChangePercent: 3.1,
        contributingFactors: [
          {
            id: 'fixed-income-pressure',
            name: 'Fixed-income cost pressure',
            direction: 'positive',
            contribution: 0.45,
            explanation: 'Forecast influenced by rising fixed-income cost pressure, a contributing signal the model tracks.',
          },
        ],
      },
    ],
  },
  'sep-2026': {
    periodLabel: 'September 2026',
    groups: [
      {
        groupId: 'newcomer-families',
        name: 'Newcomer Families',
        shareOfDemand: 29,
        projectedChangePercent: 7.5,
        contributingFactors: [
          {
            id: 'arrivals-volume',
            name: 'Newcomer arrivals volume',
            direction: 'positive',
            contribution: 0.5,
            explanation: 'Projected newcomer arrivals remain a contributing signal associated with elevated demand.',
          },
        ],
        detailHref: '/help/projections#external-indicators',
      },
      {
        groupId: 'single-parent-households',
        name: 'Single Parent Households',
        shareOfDemand: 23,
        projectedChangePercent: 9.9,
        contributingFactors: [
          {
            id: 'household-benefit-level',
            name: 'Household benefit level',
            direction: 'negative',
            contribution: 0.4,
            explanation:
              'A further projected reduction in household support is associated with increased demand for this group.',
          },
          {
            id: 'rental-vacancy',
            name: 'Rental vacancy rate',
            direction: 'negative',
            contribution: 0.22,
            explanation: 'A tightening rental vacancy rate is a contributing signal the model associates with housing cost pressure.',
          },
        ],
      },
      {
        groupId: 'seniors',
        name: 'Seniors (65+)',
        shareOfDemand: 13,
        projectedChangePercent: 2.4,
        contributingFactors: [
          {
            id: 'fixed-income-pressure',
            name: 'Fixed-income cost pressure',
            direction: 'positive',
            contribution: 0.38,
            explanation: 'The model indicates continued fixed-income cost pressure as a contributing signal.',
          },
        ],
      },
    ],
  },
  'wk-2026-07-28': {
    periodLabel: 'Jul 28 – Aug 3',
    groups: [
      {
        groupId: 'newcomer-families',
        name: 'Newcomer Families',
        shareOfDemand: 27,
        projectedChangePercent: 2.9,
        contributingFactors: [
          {
            id: 'arrivals-volume',
            name: 'Newcomer arrivals volume',
            direction: 'positive',
            contribution: 0.52,
            explanation: 'Weekly newcomer arrivals are associated with a modest increase in this week’s demand.',
          },
        ],
        detailHref: '/help/projections#external-indicators',
      },
      {
        groupId: 'single-parent-households',
        name: 'Single Parent Households',
        shareOfDemand: 23,
        projectedChangePercent: 3.4,
        contributingFactors: [
          {
            id: 'household-benefit-level',
            name: 'Household benefit level',
            direction: 'negative',
            contribution: 0.3,
            explanation: 'Household benefit levels this week are a contributing signal in the forecast.',
          },
        ],
      },
      {
        groupId: 'seniors',
        name: 'Seniors (65+)',
        shareOfDemand: 14,
        projectedChangePercent: 1.1,
        contributingFactors: [
          {
            id: 'fixed-income-pressure',
            name: 'Fixed-income cost pressure',
            direction: 'positive',
            contribution: 0.3,
            explanation: 'Fixed-income cost pressure remains a small contributing signal this week.',
          },
        ],
      },
    ],
  },
  'wk-2026-08-04': {
    periodLabel: 'Aug 4 – 10',
    groups: [
      {
        groupId: 'newcomer-families',
        name: 'Newcomer Families',
        shareOfDemand: 29,
        projectedChangePercent: 5.6,
        contributingFactors: [
          {
            id: 'arrivals-volume',
            name: 'Newcomer arrivals volume',
            direction: 'positive',
            contribution: 0.58,
            explanation:
              'A projected rise in newcomer arrivals is associated with increased demand this week at intake-adjacent agencies.',
          },
        ],
        detailHref: '/help/projections#external-indicators',
      },
      {
        groupId: 'single-parent-households',
        name: 'Single Parent Households',
        shareOfDemand: 24,
        projectedChangePercent: 6.8,
        contributingFactors: [
          {
            id: 'household-benefit-level',
            name: 'Household benefit level',
            direction: 'negative',
            contribution: 0.36,
            explanation: 'A projected reduction in household support is associated with increased demand this week.',
          },
          {
            id: 'rental-vacancy',
            name: 'Rental vacancy rate',
            direction: 'negative',
            contribution: 0.24,
            explanation: 'Tightening rental vacancy is a contributing signal the model associates with this week’s uncertainty.',
          },
        ],
      },
      {
        groupId: 'seniors',
        name: 'Seniors (65+)',
        shareOfDemand: 13,
        projectedChangePercent: 1.9,
        contributingFactors: [
          {
            id: 'fixed-income-pressure',
            name: 'Fixed-income cost pressure',
            direction: 'positive',
            contribution: 0.33,
            explanation: 'The model indicates fixed-income cost pressure as a contributing signal this week.',
          },
        ],
      },
    ],
  },
};

export const EMPTY_DRIVER_EXPLANATION = { periodLabel: '', groups: [] };

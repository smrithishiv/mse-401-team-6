/**
 * Per-page filter configuration. Each page gets the fields that match its
 * analytical purpose — never the same panel everywhere — but all of them are
 * rendered by the same generic FilterDrawer / CompactFilterBar components,
 * driven by these field lists. Only fields the underlying mock/service data
 * can actually answer are included; see the Geography note below.
 */

import { GEOGRAPHY_OPTIONS } from '../utils/geography';
import { atRiskPopulationSignals, socioeconomicSignals, riskLegend, REPORTING_PERIOD_OPTIONS } from '../data/mockRiskData';
import { OVERVIEW_REPORTING_PERIOD_OPTIONS } from '../data/mockOverviewData';
import { AGENCY_STATUS_LABELS, AGENCY_CITIES } from '../data/mockAgencyData';

const withAll = (options, allLabel = 'All') => [{ value: 'all', label: allLabel }, ...options];

// ---------------------------------------------------------------------------
// Forecast page
// ---------------------------------------------------------------------------

export const forecastFilterDefaults = {
  from: '2026-07-01',
  to: '2026-12-31',
  gender: 'all',
  ageGroup: 'all',
  income: 'all',
};

// Geography is intentionally omitted: /api/forecast/* has no region-level
// breakdown yet (mockForecastData is region-agnostic), so showing a
// Geography control here would imply model support that doesn't exist.
// Add a `geography` field once the forecast service returns per-region data
// — it can reuse GEOGRAPHY_OPTIONS below, the same source At-risk Groups uses.
export const forecastFilterFields = [
  { id: 'from', label: 'From', type: 'date' },
  { id: 'to', label: 'To', type: 'date' },
  {
    id: 'gender',
    label: 'Gender',
    type: 'select',
    options: withAll([
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
    ]),
  },
  {
    id: 'ageGroup',
    label: 'Age Group',
    type: 'select',
    options: withAll([
      { value: 'under18', label: 'Under 18' },
      { value: '18-44', label: '18–44' },
      { value: '45-64', label: '45–64' },
      { value: '65+', label: '65+' },
    ]),
  },
  {
    id: 'income',
    label: 'Income',
    type: 'select',
    options: withAll([
      { value: 'under20k', label: 'Under $20k' },
      { value: '20-40k', label: '$20k–$40k' },
      { value: '40-60k', label: '$40k–$60k' },
      { value: '60k+', label: '$60k+' },
    ]),
  },
];

// ---------------------------------------------------------------------------
// At-risk Groups page
// ---------------------------------------------------------------------------

export const atRiskFilterDefaults = {
  reportingPeriod: 'jun-2026',
  geography: 'all',
  populationGroup: 'all',
  riskLevel: 'all',
  socioeconomicIndicator: 'all',
};

export const atRiskFilterFields = [
  {
    id: 'reportingPeriod',
    label: 'Reporting Period',
    type: 'select',
    options: REPORTING_PERIOD_OPTIONS,
  },
  {
    id: 'geography',
    label: 'Geography',
    type: 'select',
    options: withAll(GEOGRAPHY_OPTIONS),
  },
  {
    id: 'populationGroup',
    label: 'Population Group',
    type: 'select',
    options: withAll(atRiskPopulationSignals.map((s) => ({ value: s.id, label: s.label }))),
  },
  {
    id: 'riskLevel',
    label: 'Risk Level',
    type: 'select',
    options: withAll(riskLegend.map((l) => ({ value: l.level, label: l.label }))),
  },
  {
    id: 'socioeconomicIndicator',
    label: 'Socioeconomic Indicator',
    type: 'select',
    options: withAll(socioeconomicSignals.map((s) => ({ value: s.id, label: s.label }))),
  },
];

// ---------------------------------------------------------------------------
// Overview page — compact, not a drawer, and no per-agency selector: the
// page represents the whole organization and must be useful without picking
// an agency first. Just a reporting period.
// ---------------------------------------------------------------------------

export const overviewCompactFilterDefaults = {
  period: 'aug-2026',
};

export const overviewCompactFilterFields = [
  {
    id: 'period',
    label: 'Reporting period',
    options: OVERVIEW_REPORTING_PERIOD_OPTIONS,
  },
];

// ---------------------------------------------------------------------------
// Agencies directory page
// ---------------------------------------------------------------------------

export const agencyFilterDefaults = {
  status: 'all',
  city: 'all',
  reviewRequired: 'all',
  trend: 'all',
};

export const agencyFilterFields = [
  {
    id: 'status',
    label: 'Status',
    options: withAll(Object.entries(AGENCY_STATUS_LABELS).map(([value, label]) => ({ value, label }))),
  },
  {
    id: 'city',
    label: 'City / service area',
    options: withAll(AGENCY_CITIES.map((city) => ({ value: city, label: city }))),
  },
  {
    id: 'reviewRequired',
    label: 'Review required',
    options: [
      { value: 'all', label: 'All' },
      { value: 'true', label: 'Requires review' },
      { value: 'false', label: 'No review required' },
    ],
  },
  {
    id: 'trend',
    label: 'Demand trend',
    options: [
      { value: 'all', label: 'All' },
      { value: 'rising', label: 'Rising' },
      { value: 'stable', label: 'Stable' },
      { value: 'falling', label: 'Falling' },
    ],
  },
];

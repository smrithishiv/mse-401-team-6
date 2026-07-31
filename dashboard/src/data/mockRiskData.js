/**
 * Mock data backing the At-risk Groups page, including a simplified
 * (non-geographically-precise) SVG polygon map of Waterloo Region.
 */

export const RISK_LEVEL_ORDER = ['low', 'medium', 'med-high', 'high'];

function shiftRiskLevel(level, steps) {
  const idx = RISK_LEVEL_ORDER.indexOf(level);
  const next = Math.min(RISK_LEVEL_ORDER.length - 1, Math.max(0, idx + steps));
  return RISK_LEVEL_ORDER[next];
}

/**
 * Simplified, gapless grid layout (viewBox "0 0 480 420") — not
 * geographically precise, but visually reads as adjoining regions the way
 * the prototype's map does. This is the June 2026 (current/default) snapshot.
 */
const juneRiskRegions = [
  {
    id: 'wilmot',
    name: 'Wilmot',
    type: '',
    riskLevel: 'low',
    points: '20,130 90,130 90,360 20,360',
    labelPos: { x: 55, y: 245 },
    vertical: true,
  },
  {
    id: 'wellesley',
    name: 'Wellesley',
    type: 'Township',
    riskLevel: 'low',
    points: '90,20 280,20 280,130 90,130',
    labelPos: { x: 185, y: 70 },
  },
  {
    id: 'woolwich',
    name: 'Woolwich',
    type: 'Township',
    riskLevel: 'low',
    points: '280,20 460,20 460,130 280,130',
    labelPos: { x: 370, y: 70 },
  },
  {
    id: 'waterloo',
    name: 'Waterloo',
    type: 'City',
    riskLevel: 'medium',
    points: '90,130 280,130 280,230 90,230',
    labelPos: { x: 185, y: 175 },
  },
  {
    id: 'n-dumfries',
    name: 'N. Dumfries',
    type: 'Township',
    riskLevel: 'medium',
    points: '280,130 460,130 460,360 280,360',
    labelPos: { x: 370, y: 195 },
  },
  {
    id: 'n-kitchener',
    name: 'N. Kitchener',
    type: '',
    riskLevel: 'high',
    points: '90,230 280,230 280,300 90,300',
    labelPos: { x: 185, y: 268 },
  },
  {
    id: 's-kitchener',
    name: 'S. Kitchener',
    type: '',
    riskLevel: 'med-high',
    points: '90,300 280,300 280,360 90,360',
    labelPos: { x: 185, y: 333 },
  },
  {
    id: 'cambridge',
    name: 'Cambridge',
    type: 'City',
    riskLevel: 'med-high',
    points: '90,360 460,360 460,400 90,400',
    labelPos: { x: 275, y: 378 },
  },
];

/** May 2026: one risk tier lower per region, reflecting risk climbing into June. */
const mayRiskRegions = juneRiskRegions.map((region) => ({
  ...region,
  riskLevel: shiftRiskLevel(region.riskLevel, -1),
}));

const riskRegionsByPeriod = {
  'jun-2026': juneRiskRegions,
  'may-2026': mayRiskRegions,
};

const atRiskMetricsByPeriod = {
  'jun-2026': {
    highRiskGroups: { value: 3, subtitle: '1 new signal' },
    highRiskAreas: { value: 4, subtitle: '↑ N. Kitchener' },
    avgRiskIndex: { value: 6.4, prevValue: 5.1 },
    cpiFoodIndex: { valuePct: 9.2, subtitle: 'June 2026 YoY' },
  },
  'may-2026': {
    highRiskGroups: { value: 2, subtitle: 'Stable' },
    highRiskAreas: { value: 3, subtitle: 'No change' },
    avgRiskIndex: { value: 5.1, prevValue: 4.6 },
    cpiFoodIndex: { valuePct: 7.8, subtitle: 'May 2026 YoY' },
  },
};

export const REPORTING_PERIOD_OPTIONS = [
  { value: 'jun-2026', label: 'June 2026' },
  { value: 'may-2026', label: 'May 2026' },
];

/** @param {string} period */
export function getRiskSnapshot(period = 'jun-2026') {
  return {
    metrics: atRiskMetricsByPeriod[period] || atRiskMetricsByPeriod['jun-2026'],
    regions: riskRegionsByPeriod[period] || riskRegionsByPeriod['jun-2026'],
  };
}

// Exported for geography.js (canonical region catalog) and any code that
// needs the full region list independent of a reporting period.
export const riskRegions = juneRiskRegions;

export const REGION_NAME_BY_ID = Object.fromEntries(juneRiskRegions.map((r) => [r.id, r.name]));

export const riskLegend = [
  { level: 'low', label: 'Low' },
  { level: 'medium', label: 'Medium' },
  { level: 'med-high', label: 'Med-High' },
  { level: 'high', label: 'High' },
];

export const socioeconomicSignals = [
  {
    id: 'unemployment-rate',
    label: 'Unemployment Rate',
    value: '7.4%',
    description: 'Waterloo Region · June 2026',
    status: 'Elevated',
  },
  {
    id: 'rental-vacancy',
    label: 'Rental Vacancy Rate',
    value: '1.1%',
    description: 'Below 3% safe threshold',
    status: 'Critical',
  },
  {
    id: 'living-wage-gap',
    label: 'Living Wage Gap',
    value: '$5.40',
    description: '$23 living wage vs. $17.60 min wage',
    status: 'Elevated',
  },
  {
    id: 'social-assistance-cases',
    label: 'Social Assistance Cases',
    value: '38,420',
    description: '+14% YoY · Region of Waterloo',
    status: 'Critical',
  },
];

export const atRiskPopulationSignals = [
  { id: 'newcomer-families', label: 'Newcomer families', changePct: 78 },
  { id: 'single-parent', label: 'Single-parent HH', changePct: 61 },
  { id: 'seniors', label: 'Seniors (65+)', changePct: 44 },
  { id: 'youth', label: 'Youth (under 18)', changePct: 32 },
  { id: 'two-parent', label: 'Two-parent families', changePct: 18 },
];

/** May 2026 population signals, prior to the climb reflected in June's numbers. */
export const atRiskPopulationSignalsByPeriod = {
  'jun-2026': atRiskPopulationSignals,
  'may-2026': atRiskPopulationSignals.map((s) => ({ ...s, changePct: Math.round(s.changePct * 0.8) })),
};

// ---------------------------------------------------------------------------
// Average risk index — per-region values, so the metric can be recomputed
// for whichever area is selected on the map, plus the explanatory content
// backing its InfoTooltip and the /help/risk-index chapter.
// ---------------------------------------------------------------------------

const RISK_INDEX_BY_REGION = {
  'jun-2026': {
    wilmot: 2.1,
    wellesley: 2.4,
    woolwich: 2.6,
    waterloo: 5.0,
    'n-dumfries': 5.4,
    'n-kitchener': 8.7,
    's-kitchener': 7.1,
    cambridge: 6.8,
  },
  'may-2026': {
    wilmot: 1.6,
    wellesley: 1.8,
    woolwich: 2.0,
    waterloo: 3.9,
    'n-dumfries': 4.3,
    'n-kitchener': 7.0,
    's-kitchener': 5.6,
    cambridge: 5.3,
  },
};

const PREVIOUS_PERIOD = { 'jun-2026': 'may-2026', 'may-2026': null };

/**
 * Risk index for a single region in a given period, with the change versus
 * the prior period when one is available.
 * @param {string} regionId
 * @param {string} period
 */
export function getRegionRiskIndex(regionId, period = 'jun-2026') {
  const table = RISK_INDEX_BY_REGION[period] || RISK_INDEX_BY_REGION['jun-2026'];
  const value = table[regionId];
  if (value === undefined) return null;

  const prevPeriod = PREVIOUS_PERIOD[period];
  const prevTable = prevPeriod ? RISK_INDEX_BY_REGION[prevPeriod] : null;
  const prevValue = prevTable ? prevTable[regionId] : null;

  return {
    value,
    prevValue,
    change: prevValue === null || prevValue === undefined ? null : +(value - prevValue).toFixed(1),
  };
}

/**
 * Placeholder explanatory content for the Average Risk Index tooltip and the
 * /help/risk-index documentation chapter. The scale is intentionally left
 * unspecified until the risk methodology is finalized — do not invent one.
 */
export const riskIndexMeta = {
  whatItMeasures:
    'A composite indicator of food-insecurity risk for an area, combining its regional risk tier with local socioeconomic signals (employment, housing, and income pressure).',
  scale: 'The final 0–N scale is still being defined alongside the risk methodology. This tooltip will be updated once it is finalized.',
  higherLowerMeaning:
    'Once the scale is finalized: higher values will indicate greater food-insecurity risk for that area, and lower values will indicate lower risk.',
  contributingIndicators: [
    'Unemployment rate',
    'Rental vacancy rate',
    'Living wage gap',
    'Social assistance caseload',
    'Food price inflation (CPI)',
  ],
  recalculationCadence: 'Recalculated monthly, alongside each reporting period refresh.',
};

// ---------------------------------------------------------------------------
// High-risk Groups / High-risk Areas — the data backing the expandable
// summary cards on the At-risk Groups page.
// ---------------------------------------------------------------------------

const highRiskGroupDefs = [
  {
    id: 'newcomer-families',
    riskLevel: 'high',
    primarySignal: 'Rental vacancy rate',
    regions: ['n-kitchener', 's-kitchener'],
  },
  {
    id: 'single-parent',
    riskLevel: 'med-high',
    primarySignal: 'Living wage gap',
    regions: ['cambridge', 's-kitchener'],
  },
  {
    id: 'seniors',
    riskLevel: 'medium',
    primarySignal: 'Social assistance caseload',
    regions: ['n-dumfries', 'waterloo'],
  },
];

/**
 * High-risk groups for a reporting period. Count matches
 * atRiskMetricsByPeriod[period].highRiskGroups.value — May 2026 only
 * surfaced 2 groups; "seniors" is the new June signal.
 * @param {string} period
 */
export function getHighRiskGroups(period = 'jun-2026') {
  const count = (atRiskMetricsByPeriod[period] || atRiskMetricsByPeriod['jun-2026']).highRiskGroups.value;
  const juneSignals = atRiskPopulationSignalsByPeriod['jun-2026'];
  const periodSignals = atRiskPopulationSignalsByPeriod[period] || juneSignals;

  return highRiskGroupDefs.slice(0, count).map((def) => {
    const juneSignal = juneSignals.find((s) => s.id === def.id);
    const periodSignal = periodSignals.find((s) => s.id === def.id);
    const change =
      periodSignal && period !== 'jun-2026'
        ? null
        : juneSignal && periodSignal
        ? juneSignal.changePct - periodSignal.changePct
        : null;

    return {
      id: def.id,
      name: juneSignal?.label || def.id,
      riskLevel: def.riskLevel,
      changeFromPrevious: change === null ? null : `${change > 0 ? '+' : ''}${change} pts`,
      primarySignal: def.primarySignal,
      regions: def.regions,
    };
  });
}

/**
 * High-risk areas for a reporting period: the top N regions by risk index,
 * where N matches atRiskMetricsByPeriod[period].highRiskAreas.value.
 * @param {string} period
 */
export function getHighRiskAreas(period = 'jun-2026') {
  const count = (atRiskMetricsByPeriod[period] || atRiskMetricsByPeriod['jun-2026']).highRiskAreas.value;
  const regions = riskRegionsByPeriod[period] || juneRiskRegions;

  return regions
    .map((region) => ({ region, index: getRegionRiskIndex(region.id, period) }))
    .sort((a, b) => (b.index?.value ?? 0) - (a.index?.value ?? 0))
    .slice(0, count)
    .map(({ region, index }) => ({
      id: region.id,
      name: region.name,
      riskLevel: region.riskLevel,
      riskIndex: index?.value ?? null,
      changeFromPrevious: index?.change === null || index?.change === undefined ? null : `${index.change > 0 ? '+' : ''}${index.change}`,
    }));
}

// ---------------------------------------------------------------------------
// Food price inflation (formerly "CPI Food Index")
// ---------------------------------------------------------------------------

export const cpiFoodByPeriod = {
  'jun-2026': {
    valuePct: 9.2,
    reportingPeriod: 'June 2026',
    comparisonType: 'Year over year',
    cadence: 'Updated monthly',
    source: 'Statistics Canada, Consumer Price Index (Food)',
  },
  'may-2026': {
    valuePct: 7.8,
    reportingPeriod: 'May 2026',
    comparisonType: 'Year over year',
    cadence: 'Updated monthly',
    source: 'Statistics Canada, Consumer Price Index (Food)',
  },
};

export function getCpiFood(period = 'jun-2026') {
  return cpiFoodByPeriod[period] || cpiFoodByPeriod['jun-2026'];
}

// ---------------------------------------------------------------------------
// Regional data granularity — each socioeconomic indicator is only measured
// at a certain geographic level. Cities generally have municipal/local
// breakdowns; townships mostly rely on regional aggregates or estimates.
// ---------------------------------------------------------------------------

const REGIONAL_METRIC_DEFS = [
  { id: 'unemployment-rate', label: 'Unemployment rate', unit: '%', baseValue: 7.4 },
  { id: 'rental-vacancy', label: 'Rental vacancy rate', unit: '%', baseValue: 1.1 },
  { id: 'living-wage-gap', label: 'Living wage gap', unit: '$', baseValue: 5.4 },
  { id: 'social-assistance-cases', label: 'Social assistance cases', unit: '', baseValue: 38420 },
];

const REGION_GEOGRAPHY_LEVELS = {
  wilmot: { 'unemployment-rate': 'estimated', 'rental-vacancy': 'regional', 'living-wage-gap': 'regional', 'social-assistance-cases': 'unavailable' },
  wellesley: { 'unemployment-rate': 'estimated', 'rental-vacancy': 'regional', 'living-wage-gap': 'regional', 'social-assistance-cases': 'unavailable' },
  woolwich: { 'unemployment-rate': 'estimated', 'rental-vacancy': 'regional', 'living-wage-gap': 'regional', 'social-assistance-cases': 'estimated' },
  'n-dumfries': { 'unemployment-rate': 'estimated', 'rental-vacancy': 'regional', 'living-wage-gap': 'regional', 'social-assistance-cases': 'unavailable' },
  waterloo: { 'unemployment-rate': 'municipal', 'rental-vacancy': 'regional', 'living-wage-gap': 'regional', 'social-assistance-cases': 'municipal' },
  'n-kitchener': { 'unemployment-rate': 'municipal', 'rental-vacancy': 'regional', 'living-wage-gap': 'regional', 'social-assistance-cases': 'local' },
  's-kitchener': { 'unemployment-rate': 'municipal', 'rental-vacancy': 'regional', 'living-wage-gap': 'regional', 'social-assistance-cases': 'local' },
  cambridge: { 'unemployment-rate': 'municipal', 'rental-vacancy': 'regional', 'living-wage-gap': 'regional', 'social-assistance-cases': 'municipal' },
};

const RISK_TIER_MULTIPLIER = { low: 0.8, medium: 1, 'med-high': 1.2, high: 1.45 };

/**
 * Per-metric values for a given region (or the whole region when
 * `regionId` is falsy), tagged with the geographic level that value is
 * actually available at. Mirrors the shape the future backend response is
 * expected to use.
 * @param {string|null} regionId
 * @param {string} period
 */
export function getRegionalMetrics(regionId, period = 'jun-2026') {
  const regions = riskRegionsByPeriod[period] || juneRiskRegions;
  const region = regionId ? regions.find((r) => r.id === regionId) : null;
  const tierMultiplier = region ? RISK_TIER_MULTIPLIER[region.riskLevel] : 1;
  const reportingPeriod = period === 'may-2026' ? '2026-05' : '2026-06';

  return REGIONAL_METRIC_DEFS.map((def) => {
    const geographyLevel = region ? REGION_GEOGRAPHY_LEVELS[regionId]?.[def.id] || 'unavailable' : 'regional';
    const unavailable = geographyLevel === 'unavailable';

    let value = null;
    if (!unavailable) {
      if (def.id === 'rental-vacancy') value = Math.max(0.1, +(def.baseValue / tierMultiplier).toFixed(1));
      else if (def.id === 'living-wage-gap') value = +(def.baseValue * tierMultiplier).toFixed(2);
      else if (def.id === 'social-assistance-cases') value = Math.round(def.baseValue * tierMultiplier);
      else value = +(def.baseValue * tierMultiplier).toFixed(1);
    }

    const status = unavailable ? 'unavailable' : tierMultiplier >= 1.2 ? 'critical' : tierMultiplier >= 1 ? 'elevated' : 'normal';

    return {
      id: def.id,
      label: def.label,
      value,
      unit: def.unit,
      geographyLevel,
      requestedRegion: regionId || 'waterloo-region',
      status,
      reportingPeriod,
    };
  });
}

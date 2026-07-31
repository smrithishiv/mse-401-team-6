import { strategicForecastByHorizon } from './mockForecastData';

export const SCENARIO_DISCLAIMER = 'Planning scenario — not the official forecast';

/**
 * Business-language scenario inputs. Deliberately expressed as "change from
 * baseline" controls (e.g. "increase newcomer growth by 10%") rather than
 * raw model coefficients/weights — no ML parameters are exposed here, since
 * this app has no analyst-mode gating to restrict them to.
 */
export const scenarioInputs = {
  baselineOptions: [{ id: 'strategic-baseline-2026-q2', label: 'Strategic forecast — official baseline' }],
  horizonOptions: strategicForecastByHorizon.supportedHorizons,
  assumptions: [
    {
      id: 'newcomerGrowthAdjustmentPercent',
      label: 'Newcomer / immigrant growth',
      unit: '%',
      min: -20,
      max: 50,
      step: 5,
      defaultValue: 0,
      description: 'Increase or decrease the assumed rate of newcomer arrivals relative to the baseline forecast.',
    },
    {
      id: 'unemploymentAdjustmentPoints',
      label: 'Unemployment rate change',
      unit: 'pts',
      min: -5,
      max: 10,
      step: 0.5,
      defaultValue: 0,
      description: 'Shift the assumed unemployment rate up or down, in percentage points, relative to the baseline.',
    },
    {
      id: 'rentalVacancyAdjustmentPoints',
      label: 'Rental vacancy rate change',
      unit: 'pts',
      min: -5,
      max: 5,
      step: 0.5,
      defaultValue: 0,
      description: 'Shift the assumed rental vacancy rate up or down, in percentage points.',
    },
    {
      id: 'foodCpiAdjustmentPoints',
      label: 'Food inflation change',
      unit: 'pts',
      min: -5,
      max: 15,
      step: 0.5,
      defaultValue: 0,
      description: 'Increase or decrease assumed food price inflation, in percentage points.',
    },
    {
      id: 'householdSupportAdjustmentPercent',
      label: 'Social-assistance benefit level change',
      unit: '%',
      min: -20,
      max: 20,
      step: 5,
      defaultValue: 0,
      description: 'Increase or decrease assumed social-assistance/household support levels.',
    },
    {
      id: 'livingWageGapAdjustmentPercent',
      label: 'Living-wage gap change',
      unit: '%',
      min: -20,
      max: 20,
      step: 5,
      defaultValue: 0,
      description: 'Widen or narrow the assumed gap between minimum/living wage and cost of living.',
    },
    {
      id: 'populationGrowthAdjustmentPoints',
      label: 'Population growth change',
      unit: 'pts',
      min: -3,
      max: 5,
      step: 0.25,
      defaultValue: 0,
      description: 'Shift assumed overall population growth up or down, in percentage points.',
    },
    {
      id: 'policySupportAdjustment',
      label: 'Policy-support change',
      unit: 'index',
      min: -2,
      max: 2,
      step: 1,
      defaultValue: 0,
      description: 'A relative index of new policy support (negative = reduced support, positive = expanded support).',
    },
    {
      id: 'vulnerabilityAdjustment',
      label: 'Demographic vulnerability assumption',
      unit: 'index',
      min: -2,
      max: 2,
      step: 1,
      defaultValue: 0,
      description: 'A relative index of assumed demographic vulnerability (e.g. housing precarity, benefit dependency).',
    },
  ],
};

export const savedScenarios = [];

// Deterministic weights translating each business-language assumption into
// a demand effect, standing in for the real model until it's finalized.
// Every weight is 0-centered on defaultValue 0, so an unmoved assumption
// contributes nothing.
const ASSUMPTION_WEIGHTS = {
  newcomerGrowthAdjustmentPercent: 0.006,
  unemploymentAdjustmentPoints: 0.02,
  rentalVacancyAdjustmentPoints: -0.015,
  foodCpiAdjustmentPoints: 0.015,
  householdSupportAdjustmentPercent: -0.01,
  livingWageGapAdjustmentPercent: 0.012,
  populationGrowthAdjustmentPoints: 0.01,
  policySupportAdjustment: -0.03,
  vulnerabilityAdjustment: 0.03,
};

const AFFECTED_GROUP_SENSITIVITY = [
  {
    groupId: 'newcomer-families',
    name: 'Newcomer Families',
    baselineShareOfDemand: 28,
    sensitiveTo: ['newcomerGrowthAdjustmentPercent', 'policySupportAdjustment'],
    weight: 0.15,
  },
  {
    groupId: 'single-parent-households',
    name: 'Single Parent Households',
    baselineShareOfDemand: 22,
    sensitiveTo: ['householdSupportAdjustmentPercent', 'livingWageGapAdjustmentPercent'],
    weight: 0.12,
  },
  {
    groupId: 'seniors',
    name: 'Seniors (65+)',
    baselineShareOfDemand: 14,
    sensitiveTo: ['foodCpiAdjustmentPoints', 'vulnerabilityAdjustment'],
    weight: 0.08,
  },
];

function netEffectPct(assumptions, yearsOut) {
  const baseSignal = Object.entries(assumptions).reduce(
    (sum, [id, value]) => sum + (ASSUMPTION_WEIGHTS[id] ?? 0) * (value || 0),
    0
  );
  // Effect compounds the further out the year is, echoing how uncertainty
  // (and the room for an assumption to matter) grows with distance.
  const growth = 1 + 0.15 * Math.max(0, yearsOut - 1);
  return baseSignal * growth;
}

function computeAffectedGroups(assumptions) {
  return AFFECTED_GROUP_SENSITIVITY.map((group) => {
    const signal = group.sensitiveTo.reduce((sum, id) => sum + (assumptions[id] || 0), 0);
    const changePct = Math.round(signal * group.weight * 10) / 10;
    const scenarioShareOfDemand = Math.max(0, Math.round((group.baselineShareOfDemand + changePct / 5) * 10) / 10);
    return {
      groupId: group.groupId,
      name: group.name,
      baselineShareOfDemand: group.baselineShareOfDemand,
      scenarioShareOfDemand,
      changePct,
    };
  });
}

/**
 * Pure, deterministic mock "model": applies netEffectPct to each predicted
 * year of the selected baseline horizon bucket. The connecting/base year
 * (index 0) is never adjusted — assumptions only affect forward-looking
 * years. When every assumption is at its defaultValue (0), scenarioForecast
 * is identical to baselineForecast.
 *
 * @param {import('../utils/types').ScenarioRunParameters} parameters
 * @returns {import('../utils/types').ScenarioResult}
 */
export function buildScenarioResult(parameters) {
  const { name, baselineId, horizonYears, assumptions = {} } = parameters;
  const bucket =
    strategicForecastByHorizon.horizons[horizonYears] ??
    strategicForecastByHorizon.horizons[strategicForecastByHorizon.defaultHorizonYears];
  const baselineForecast = bucket.chart.forecast;

  let yearsOut = 0;
  const scenarioForecast = baselineForecast.map((point, i) => {
    if (i === 0) return { ...point };
    yearsOut += 1;
    const effect = netEffectPct(assumptions, yearsOut);
    return {
      ...point,
      value: Math.round(point.value * (1 + effect)),
      low: Math.round(point.low * (1 + effect)),
      high: Math.round(point.high * (1 + effect)),
    };
  });

  const differenceByYear = baselineForecast.map((point, i) => {
    const scenarioPoint = scenarioForecast[i];
    const difference = scenarioPoint.value - point.value;
    const differencePct = point.value ? Math.round((difference / point.value) * 1000) / 10 : 0;
    return {
      year: Number(point.label),
      baselineValue: point.value,
      scenarioValue: scenarioPoint.value,
      difference,
      differencePct,
    };
  });

  const finalYear = differenceByYear[differenceByYear.length - 1];
  const summarySentence =
    finalYear.difference === 0
      ? `Under this scenario, projected demand in ${finalYear.year} is unchanged from the baseline forecast.`
      : `Under this scenario, projected demand in ${finalYear.year} is ${Math.abs(finalYear.differencePct)}% ${
          finalYear.difference > 0 ? 'higher' : 'lower'
        } than the baseline forecast.`;

  return {
    scenarioId: `scenario-temp-${Date.now()}`,
    name,
    status: 'completed',
    baselineId,
    horizonYears,
    assumptionsApplied: assumptions,
    baselineForecast,
    scenarioForecast,
    differenceByYear,
    affectedGroups: computeAffectedGroups(assumptions),
    generatedAt: new Date().toISOString(),
    summarySentence,
    scenarioDisclaimer: SCENARIO_DISCLAIMER,
  };
}

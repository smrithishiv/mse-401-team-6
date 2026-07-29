/**
 * Human-readable labels for the `dataType` field on a demand-drivers
 * dimension. Every dimension in the demand-drivers mock/response must carry
 * one of these so the UI never presents a planning assumption as a
 * model-generated forecast.
 */
export const DEMAND_DATA_TYPES = {
  model_forecast: {
    label: 'Model forecast',
    description: 'Statistically projected from historical trends and demographic indicators.',
    tone: 'blue',
  },
  planning_scenario: {
    label: 'Planning scenario',
    description: 'A policy/assumption-based projection, not a statistical forecast.',
    tone: 'yellow',
  },
  current_proportions: {
    label: 'Current proportions (held constant)',
    description: "Today's measured split, held flat — not projected forward.",
    tone: 'grey',
  },
};

export function getDemandDataTypeInfo(dataType) {
  return DEMAND_DATA_TYPES[dataType] || DEMAND_DATA_TYPES.current_proportions;
}

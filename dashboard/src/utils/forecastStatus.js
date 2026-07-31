/**
 * Canonical status vocabulary for forecast/allocation cards. Every status
 * badge on the Forecast page must resolve through this map so colour always
 * communicates the same meaning: grey for recorded fact, green for
 * on-track, yellow for manual confirmation, red reserved for conditions
 * that require immediate intervention (no mock data maps to it yet, but the
 * key is documented here so a future `critical` status has a defined home
 * instead of ad hoc styling).
 */
export const FORECAST_STATUS = {
  actual: {
    label: 'Actual recorded demand',
    tone: 'grey',
    icon: 'FileCheck',
    tooltip: 'This value comes from completed reporting data and is not a model prediction.',
  },
  'on-track': {
    label: 'Allocation on track',
    tone: 'green',
    icon: 'CheckCircle2',
    tooltip:
      'The forecast range and current allocation are within the accepted operational threshold. No adjustment is currently recommended.',
  },
  'manual-review': {
    label: 'Manual confirmation recommended',
    tone: 'yellow',
    icon: 'AlertTriangle',
    tooltip:
      'Forecast uncertainty or projected demand exceeds the accepted threshold. Review local conditions before confirming the allocation.',
  },
  critical: {
    label: 'Critical — immediate action required',
    tone: 'red',
    icon: 'AlertOctagon',
    tooltip: 'Demand is far outside the accepted threshold and requires immediate intervention.',
  },
};

export function getForecastStatusInfo(statusKey) {
  return FORECAST_STATUS[statusKey] || FORECAST_STATUS.actual;
}

export const CONFIDENCE_TOOLTIPS = {
  high: 'The forecast range is within ±5% of the predicted number and can generally be used without manual confirmation.',
  low: 'The range is wider than usual, typically because one or more inputs are projected rather than measured. Confirm allocation manually before distributing.',
};

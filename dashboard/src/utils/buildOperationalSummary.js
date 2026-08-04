import { formatNumber } from './format';

/**
 * Deterministically converts current forecast/agency/population data into
 * an ordered list of plain-language operational summary statements. This is
 * rule-based (no LLM) so it stays reproducible and auditable — the same
 * inputs always produce the same output, and every statement traces back to
 * a specific field on the input object.
 *
 * @param {{
 *   currentForecast?: { monthLabel: string, value: number },
 *   currentConfidence?: 'high' | 'low' | 'pending',
 *   allocationRecommendation?: string,
 *   agencyAlerts?: Array<{ reviewRequired: boolean, status: string }>,
 *   nextMonthForecast?: { monthLabel: string, value: number, confidence: 'high' | 'low' | 'pending' },
 *   populationSignals?: Array<{ label: string, changePct: number }>,
 * }} input
 * @returns {Array<{ id: string, severity: 'success'|'warning'|'critical'|'info', message: string, destination: string }>}
 */
export function buildOperationalSummary({
  currentForecast,
  currentConfidence,
  allocationRecommendation,
  agencyAlerts = [],
  nextMonthForecast,
  populationSignals = [],
} = {}) {
  const items = [];

  if (currentForecast?.value != null) {
    items.push({
      id: 'current-forecast',
      severity: 'info',
      message: `${currentForecast.monthLabel} demand is forecasted at ${formatNumber(currentForecast.value)} people.`,
      destination: '/forecast',
    });
  }

  if (currentConfidence) {
    const isHigh = currentConfidence === 'high';
    const month = currentForecast?.monthLabel ? `${currentForecast.monthLabel} ` : '';
    items.push({
      id: 'allocation-status',
      severity: isHigh ? 'success' : 'warning',
      message:
        allocationRecommendation ||
        (isHigh
          ? `Current ${month}allocation remains on track.`
          : `Confirm ${month}allocation manually before distributing.`),
      destination: '/forecast',
    });
  }

  const needingReview = agencyAlerts.filter((a) => a.reviewRequired);
  const hasCritical = needingReview.some((a) => a.status === 'critical');
  if (needingReview.length > 0) {
    items.push({
      id: 'agency-alerts',
      severity: hasCritical ? 'critical' : 'warning',
      message: `${needingReview.length} ${needingReview.length === 1 ? 'agency requires' : 'agencies require'} manual review.`,
      destination: '/agencies?status=review',
    });
  } else {
    items.push({
      id: 'agency-alerts',
      severity: 'success',
      message: 'All active agencies are currently within accepted allocation thresholds.',
      destination: '/agencies',
    });
  }

  if (nextMonthForecast) {
    const monthParam = nextMonthForecast.isoMonth ? `?month=${nextMonthForecast.isoMonth}` : '';
    // 'pending' means no calibrated high/low threshold exists yet — must
    // never be folded into "low" or "high" here, since that would state a
    // confidence judgement the model hasn't actually made.
    const isPending = nextMonthForecast.confidence === 'pending';
    const isLow = nextMonthForecast.confidence === 'low';
    items.push({
      id: 'next-month-confidence',
      severity: isPending ? 'info' : isLow ? 'warning' : 'success',
      message: isPending
        ? `${nextMonthForecast.monthLabel} forecast confidence has not been calibrated yet.`
        : `${nextMonthForecast.monthLabel} forecast confidence is ${isLow ? 'low' : 'high'}.`,
      destination: `/forecast${monthParam}`,
    });
  }

  if (populationSignals.length > 0) {
    const top = populationSignals[0];
    items.push({
      id: 'population-signal',
      severity: 'info',
      message: `${top.label} remain the strongest population signal.`,
      destination: '/at-risk-groups',
    });
  }

  return items;
}

import { describe, it, expect } from 'vitest';
import { buildOperationalSummary } from './buildOperationalSummary';

const baseInput = {
  currentForecast: { monthLabel: 'August 2026', value: 54200 },
  currentConfidence: 'high',
  allocationRecommendation: 'Proceed with current allocation plan, no manual review needed',
  agencyAlerts: [
    { reviewRequired: true, status: 'high-demand' },
    { reviewRequired: false, status: 'watch' },
  ],
  nextMonthForecast: { monthLabel: 'September 2026', isoMonth: '2026-09', value: 57100, confidence: 'low' },
  populationSignals: [{ label: 'Newcomer families', changePct: 78 }],
};

describe('buildOperationalSummary', () => {
  it('is deterministic: the same input always produces the same output', () => {
    expect(buildOperationalSummary(baseInput)).toEqual(buildOperationalSummary(baseInput));
  });

  it('produces one statement per recognized input, each with an id/severity/message/destination', () => {
    const items = buildOperationalSummary(baseInput);
    expect(items.map((i) => i.id)).toEqual([
      'current-forecast',
      'allocation-status',
      'agency-alerts',
      'next-month-confidence',
      'population-signal',
    ]);
    items.forEach((item) => {
      expect(item).toHaveProperty('severity');
      expect(item).toHaveProperty('message');
      expect(item).toHaveProperty('destination');
    });
  });

  it('updates its output when the underlying agency alerts change (no code change required)', () => {
    const withOneAlert = buildOperationalSummary(baseInput);
    const alertItem1 = withOneAlert.find((i) => i.id === 'agency-alerts');
    expect(alertItem1.message).toBe('1 agency requires manual review.');
    expect(alertItem1.severity).toBe('warning');

    const withNoAlerts = buildOperationalSummary({
      ...baseInput,
      agencyAlerts: [{ reviewRequired: false, status: 'watch' }],
    });
    const alertItem2 = withNoAlerts.find((i) => i.id === 'agency-alerts');
    expect(alertItem2.severity).toBe('success');
    expect(alertItem2.message).toMatch(/within accepted allocation thresholds/);
  });

  it('escalates severity to critical when a reviewRequired agency is critical', () => {
    const items = buildOperationalSummary({
      ...baseInput,
      agencyAlerts: [{ reviewRequired: true, status: 'critical' }],
    });
    expect(items.find((i) => i.id === 'agency-alerts').severity).toBe('critical');
  });

  it('flips allocation-status and next-month-confidence severity based on confidence', () => {
    const lowConfidence = buildOperationalSummary({
      ...baseInput,
      currentConfidence: 'low',
      allocationRecommendation: undefined,
      nextMonthForecast: { ...baseInput.nextMonthForecast, confidence: 'high' },
    });

    expect(lowConfidence.find((i) => i.id === 'allocation-status').severity).toBe('warning');
    expect(lowConfidence.find((i) => i.id === 'allocation-status').message).toMatch(/Confirm/);
    expect(lowConfidence.find((i) => i.id === 'next-month-confidence').severity).toBe('success');
  });

  it('routes destinations to the pages that resolve each statement', () => {
    const items = buildOperationalSummary(baseInput);
    expect(items.find((i) => i.id === 'agency-alerts').destination).toBe('/agencies?status=review');
    expect(items.find((i) => i.id === 'next-month-confidence').destination).toBe('/forecast?month=2026-09');
    expect(items.find((i) => i.id === 'population-signal').destination).toBe('/at-risk-groups');
  });

  it('omits statements for inputs that were not provided', () => {
    const items = buildOperationalSummary({});
    expect(items.map((i) => i.id)).toEqual(['agency-alerts']);
  });
});

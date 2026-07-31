import { describe, it, expect } from 'vitest';
import { mergeBaselineAndScenario } from './chart';

describe('mergeBaselineAndScenario', () => {
  it('merges same-year baseline and scenario points into one row per label', () => {
    const baseline = [
      { label: '2026', value: 468000 },
      { label: '2027', value: 495000 },
    ];
    const scenario = [
      { label: '2026', value: 468000 },
      { label: '2027', value: 520000 },
    ];

    const merged = mergeBaselineAndScenario(baseline, scenario);

    expect(merged).toEqual([
      { label: '2026', baseline: 468000, scenario: 468000 },
      { label: '2027', baseline: 495000, scenario: 520000 },
    ]);
  });

  it('returns an empty array when both series are empty', () => {
    expect(mergeBaselineAndScenario([], [])).toEqual([]);
  });
});

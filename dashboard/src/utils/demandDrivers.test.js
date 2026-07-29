import { describe, it, expect } from 'vitest';
import { buildChartData, computeShifts, formatDriverValue, formatDriverChange } from './demandDrivers';

const dimension = {
  dataType: 'model_forecast',
  segments: [
    {
      id: 'a',
      label: 'Segment A',
      color: '#000',
      points: [
        { year: 2026, pct: 60, people: 60000 },
        { year: 2027, pct: 55, people: 60500 },
      ],
    },
    {
      id: 'b',
      label: 'Segment B',
      color: '#fff',
      points: [
        { year: 2026, pct: 40, people: 40000 },
        { year: 2027, pct: 45, people: 49500 },
      ],
    },
  ],
};

describe('buildChartData', () => {
  it('reshapes per-segment points into one row per year, keyed by segment id', () => {
    const rows = buildChartData(dimension, 'percentage');
    expect(rows).toEqual([
      { year: 2026, a: 60, b: 40 },
      { year: 2027, a: 55, b: 45 },
    ]);
  });

  it('uses the people field when displayMode is population', () => {
    const rows = buildChartData(dimension, 'population');
    expect(rows).toEqual([
      { year: 2026, a: 60000, b: 40000 },
      { year: 2027, a: 60500, b: 49500 },
    ]);
  });
});

describe('computeShifts', () => {
  it('computes start/end values and sorts by the largest absolute change first', () => {
    const shifts = computeShifts(dimension, 'percentage');
    expect(shifts[0]).toMatchObject({ id: 'a', startValue: 60, endValue: 55, change: -5, direction: 'down' });
    expect(shifts[1]).toMatchObject({ id: 'b', startValue: 40, endValue: 45, change: 5, direction: 'up' });
  });

  it('reports a flat direction when start and end values are equal', () => {
    const flatDimension = {
      segments: [{ id: 'c', label: 'C', color: '#111', points: [{ year: 2026, pct: 50, people: 1000 }, { year: 2027, pct: 50, people: 1000 }] }],
    };
    const [shift] = computeShifts(flatDimension, 'percentage');
    expect(shift.direction).toBe('flat');
    expect(shift.change).toBe(0);
  });
});

describe('formatDriverValue / formatDriverChange', () => {
  it('formats percentage values with a % sign and pp changes', () => {
    expect(formatDriverValue(34, 'percentage')).toBe('34%');
    expect(formatDriverChange(5, 'percentage')).toBe('+5pp');
    expect(formatDriverChange(-5, 'percentage')).toBe('-5pp');
    expect(formatDriverChange(0, 'percentage')).toBe('0pp');
  });

  it('formats population values with thousands separators', () => {
    expect(formatDriverValue(159120, 'population')).toBe('159,120');
    expect(formatDriverChange(20100, 'population')).toBe('+20,100');
  });
});

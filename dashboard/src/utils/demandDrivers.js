import { formatNumber } from './format';

/**
 * Reshapes a DemandDriversDimension's per-segment point arrays into one
 * row per year (`{ year, [segmentId]: value }`), which is what Recharts
 * needs for a single multi-series chart.
 */
export function buildChartData(dimension, displayMode) {
  const { segments } = dimension;
  if (!segments?.length) return [];

  const years = segments[0].points.map((p) => p.year);

  return years.map((year) => {
    const row = { year };
    segments.forEach((seg) => {
      const point = seg.points.find((p) => p.year === year);
      row[seg.id] = displayMode === 'percentage' ? point.pct : point.people;
    });
    return row;
  });
}

/**
 * Per-segment start (base year) vs. end (final year) comparison, sorted by
 * the size of the change so the largest movers surface first.
 */
export function computeShifts(dimension, displayMode) {
  return dimension.segments
    .map((seg) => {
      const start = seg.points[0];
      const end = seg.points[seg.points.length - 1];
      const startValue = displayMode === 'percentage' ? start.pct : start.people;
      const endValue = displayMode === 'percentage' ? end.pct : end.people;
      const change = endValue - startValue;

      return {
        id: seg.id,
        label: seg.label,
        color: seg.color,
        startYear: start.year,
        endYear: end.year,
        startValue,
        endValue,
        change,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
      };
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

export function formatDriverValue(value, displayMode) {
  return displayMode === 'percentage' ? `${value}%` : formatNumber(value);
}

export function formatDriverChange(change, displayMode) {
  const sign = change > 0 ? '+' : '';
  return displayMode === 'percentage' ? `${sign}${change}pp` : `${sign}${formatNumber(change)}`;
}

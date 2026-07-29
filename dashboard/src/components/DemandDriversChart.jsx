import {
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { buildChartData } from '../utils/demandDrivers';
import { formatNumber, formatCompactNumber } from '../utils/format';
import styles from './DemandDriversChart.module.css';

function DemandTooltip({ active, payload, label, segments, displayMode, hiddenSeries }) {
  if (!active || !payload?.length) return null;

  const visibleSegments = segments.filter((seg) => !hiddenSeries.has(seg.id));

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipYear}>{label}</p>
      {visibleSegments.map((seg) => {
        const point = seg.points.find((p) => p.year === label);
        const base = seg.points[0];
        if (!point) return null;

        const delta =
          displayMode === 'percentage' ? point.pct - base.pct : point.people - base.people;
        const deltaLabel =
          displayMode === 'percentage'
            ? `${delta >= 0 ? '+' : ''}${delta}pp vs ${base.year}`
            : `${delta >= 0 ? '+' : ''}${formatNumber(delta)} vs ${base.year}`;

        return (
          <div key={seg.id} className={styles.tooltipRow}>
            <span className={styles.tooltipSwatch} style={{ background: seg.color }} aria-hidden="true" />
            <div>
              <p className={styles.tooltipLabel}>{seg.label}</p>
              <p className={styles.tooltipValue}>
                {point.pct}% · {formatNumber(point.people)} people
              </p>
              <p className={styles.tooltipDelta}>{deltaLabel}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Stacked area on wide screens (clearest way to show a composition summing
 * to a whole); multi-line on narrow screens, where a stacked area gets hard
 * to read once it's compressed.
 *
 * @param {{
 *   dimension: import('../utils/types').DemandDriversDimension,
 *   displayMode: 'percentage' | 'population',
 *   hiddenSeries: Set<string>,
 *   onToggleSeries: (id: string) => void,
 * }} props
 */
export default function DemandDriversChart({ dimension, displayMode, hiddenSeries, onToggleSeries }) {
  const isNarrow = useMediaQuery('(max-width: 720px)');
  const data = buildChartData(dimension, displayMode);
  const yFormatter = displayMode === 'percentage' ? (v) => `${v}%` : formatCompactNumber;
  const tooltip = (
    <Tooltip
      content={
        <DemandTooltip segments={dimension.segments} displayMode={displayMode} hiddenSeries={hiddenSeries} />
      }
    />
  );

  return (
    <div className={styles.wrap}>
      <div
        className={styles.chartArea}
        role="img"
        aria-label={`${displayMode === 'percentage' ? 'Percentage of demand' : 'Forecasted population'} by segment, 2026 to 2031`}
      >
        <ResponsiveContainer width="100%" height={320}>
          {isNarrow ? (
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={{ stroke: 'var(--border-color)' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={yFormatter}
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              {tooltip}
              {dimension.segments.map((seg) => (
                <Line
                  key={seg.id}
                  type="monotone"
                  dataKey={seg.id}
                  name={seg.label}
                  stroke={seg.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: seg.color }}
                  hide={hiddenSeries.has(seg.id)}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={{ stroke: 'var(--border-color)' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={yFormatter}
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              {tooltip}
              {dimension.segments.map((seg) => (
                <Area
                  key={seg.id}
                  type="monotone"
                  dataKey={seg.id}
                  name={seg.label}
                  stackId="demand-drivers"
                  stroke={seg.color}
                  fill={seg.color}
                  fillOpacity={0.75}
                  hide={hiddenSeries.has(seg.id)}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className={styles.legend} role="group" aria-label="Toggle segments shown in chart">
        {dimension.segments.map((seg) => {
          const isVisible = !hiddenSeries.has(seg.id);
          return (
            <button
              key={seg.id}
              type="button"
              className={`${styles.legendItem} ${isVisible ? '' : styles.legendItemHidden}`}
              aria-pressed={isVisible}
              onClick={() => onToggleSeries(seg.id)}
            >
              <span className={styles.legendSwatch} style={{ background: seg.color }} aria-hidden="true" />
              {seg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

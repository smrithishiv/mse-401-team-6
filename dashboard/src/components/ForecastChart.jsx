import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { mergeHistoricalAndForecast } from '../utils/chart';
import { formatCompactNumber, formatNumber } from '../utils/format';
import styles from './ForecastChart.module.css';

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const historical = payload.find((p) => p.dataKey === 'historical');
  const forecast = payload.find((p) => p.dataKey === 'forecast');
  const row = payload[0]?.payload;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {historical?.value !== undefined && (
        <p>
          <span className={styles.dotHistorical} /> Historical: {formatNumber(historical.value)}
        </p>
      )}
      {forecast?.value !== undefined && (
        <p>
          <span className={styles.dotForecast} /> Forecast: {formatNumber(forecast.value)}
        </p>
      )}
      {row?.low !== undefined && row?.high !== undefined && (
        <p className={styles.tooltipRange}>
          Range: {formatNumber(row.low)}–{formatNumber(row.high)}
        </p>
      )}
    </div>
  );
}

/**
 * Renders a larger, ringed dot at the point matching `selectedLabel`
 * (falls back to the default small dot everywhere else) so a selected
 * week/month is visually highlighted on the chart, not just in cards/table.
 */
function makeSelectableDot(color, selectedLabel) {
  return ({ cx, cy, value, payload }) => {
    if (value === undefined || value === null) return null;
    const isSelected = selectedLabel && payload.label === selectedLabel;
    return isSelected ? (
      <circle key={`dot-${payload.label}`} cx={cx} cy={cy} r={6} fill={color} stroke="var(--bg-card)" strokeWidth={2} />
    ) : (
      <circle key={`dot-${payload.label}`} cx={cx} cy={cy} r={3} fill={color} />
    );
  };
}

/**
 * @param {{ historical: Array, forecast: Array, height?: number, yFormatter?: (v:number)=>string, selectedLabel?: string }} props
 */
export default function ForecastChart({
  historical,
  forecast,
  height = 320,
  yFormatter = formatCompactNumber,
  selectedLabel,
}) {
  const data = mergeHistoricalAndForecast(historical, forecast);

  return (
    <div style={{ width: '100%', height }} role="img" aria-label="Historical and forecast demand chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-color)' }} tickLine={false} />
          <YAxis
            tickFormatter={yFormatter}
            tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<ForecastTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="plainline"
            wrapperStyle={{ fontSize: 13, color: 'var(--text-secondary)' }}
          />
          {selectedLabel && (
            <ReferenceLine x={selectedLabel} stroke="var(--border-color-strong)" strokeDasharray="4 4" />
          )}
          <Area
            dataKey={(d) => (d.low !== undefined && d.high !== undefined ? [d.low, d.high] : [null, null])}
            name="Confidence range"
            stroke="none"
            fill="var(--bb-green)"
            fillOpacity={0.15}
            isAnimationActive={false}
            legendType="none"
          />
          <Line
            type="monotone"
            dataKey="historical"
            name="Historical"
            stroke="var(--bb-blue)"
            strokeWidth={2.5}
            dot={makeSelectableDot('var(--bb-blue)', selectedLabel)}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecast"
            stroke="var(--bb-green)"
            strokeWidth={2.5}
            strokeDasharray="6 5"
            dot={makeSelectableDot('var(--bb-green)', selectedLabel)}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

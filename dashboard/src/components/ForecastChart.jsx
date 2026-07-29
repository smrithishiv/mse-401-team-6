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
 * @param {{ historical: Array, forecast: Array, height?: number, yFormatter?: (v:number)=>string }} props
 */
export default function ForecastChart({ historical, forecast, height = 320, yFormatter = formatCompactNumber }) {
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
            dot={{ r: 3, fill: 'var(--bb-blue)' }}
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
            dot={{ r: 3, fill: 'var(--bb-green)' }}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

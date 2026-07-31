import { ResponsiveContainer, ComposedChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { mergeBaselineAndScenario } from '../utils/chart';
import { formatCompactNumber, formatNumber } from '../utils/format';
import styles from './ScenarioComparisonChart.module.css';

function ScenarioTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const baseline = payload.find((p) => p.dataKey === 'baseline');
  const scenario = payload.find((p) => p.dataKey === 'scenario');

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {baseline?.value !== undefined && (
        <p>
          <span className={styles.dotBaseline} /> Baseline: {formatNumber(baseline.value)}
        </p>
      )}
      {scenario?.value !== undefined && (
        <p>
          <span className={styles.dotScenario} /> Scenario: {formatNumber(scenario.value)}
        </p>
      )}
    </div>
  );
}

/**
 * Baseline-vs-scenario comparison chart. Deliberately not a reuse of
 * ForecastChart — historical/forecast and baseline/scenario are different
 * semantics — and uses a distinct colour pairing (grey/purple) so it's
 * never visually confusable with the historical/forecast blue/green chart
 * used on the official Forecast page.
 *
 * @param {{ baselineForecast: Array, scenarioForecast: Array, height?: number }} props
 */
export default function ScenarioComparisonChart({ baselineForecast, scenarioForecast, height = 320 }) {
  const data = mergeBaselineAndScenario(baselineForecast, scenarioForecast);

  return (
    <div style={{ width: '100%', height }} role="img" aria-label="Baseline versus scenario demand comparison chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-color)' }} tickLine={false} />
          <YAxis
            tickFormatter={formatCompactNumber}
            tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<ScenarioTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="plainline"
            wrapperStyle={{ fontSize: 13, color: 'var(--text-secondary)' }}
          />
          <Line
            type="monotone"
            dataKey="baseline"
            name="Baseline forecast"
            stroke="var(--bb-grey)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: 'var(--bb-grey)' }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="scenario"
            name="Scenario forecast"
            stroke="var(--bb-purple)"
            strokeWidth={2.5}
            strokeDasharray="6 5"
            dot={{ r: 3, fill: 'var(--bb-purple)' }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

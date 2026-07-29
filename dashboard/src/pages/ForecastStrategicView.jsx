import MetricCard from '../components/MetricCard';
import ForecastChart from '../components/ForecastChart';
import ConfidenceBand from '../components/ConfidenceBand';
import DemandDriversPanel from '../components/DemandDriversPanel';
import { formatCompactNumber, formatNumber, formatPct, formatDate } from '../utils/format';
import styles from './ForecastStrategicView.module.css';

/**
 * @param {{ data: object }} props - strategicForecast shape from forecastService
 */
export default function ForecastStrategicView({ data }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.cardsRow}>
        <MetricCard
          label="5-Year Forecast"
          value={formatCompactNumber(data.summary.fiveYearForecastValue)}
          trend={{ direction: 'up', label: `${formatPct(data.summary.vsChangePct)} vs previous 5 years`, tone: 'positive' }}
        />
        <MetricCard
          label="Expected Variation"
          value={`±${formatNumber(data.summary.expectedVariation)}`}
          subtitle={`${data.summary.expectedVariationPct}% of 5-Year Forecast`}
        />
        <MetricCard label="Last Model Run" value={formatDate(data.summary.lastModelRun)} />
      </div>

      <section className={`card ${styles.chartCard}`}>
        <h2 className={styles.chartTitle}>Demand forecast — 5 Years</h2>
        <ForecastChart historical={data.chart.historical} forecast={data.chart.forecast} height={320} />
        <ConfidenceBand />
      </section>

      <DemandDriversPanel data={data.demandDrivers} />
    </div>
  );
}

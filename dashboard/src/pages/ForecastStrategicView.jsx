import MetricCard from '../components/MetricCard';
import ForecastChart from '../components/ForecastChart';
import ConfidenceBand from '../components/ConfidenceBand';
import DemandDriversPanel from '../components/DemandDriversPanel';
import HorizonSelector from '../components/HorizonSelector';
import StrategicFreshnessCard from '../components/StrategicFreshnessCard';
import NoticeBanner from '../components/NoticeBanner';
import InfoTooltip from '../components/InfoTooltip';
import { formatCompactNumber, formatNumber, formatPct } from '../utils/format';
import styles from './ForecastStrategicView.module.css';

const LONG_RANGE_NOTICE =
  'Uncertainty increases substantially beyond five years. Use this view for strategic and scenario planning rather than operational allocation decisions.';

/**
 * @param {{ data: import('../utils/types').StrategicForecastResponse, onHorizonChange: (years: number) => void, modelStatus: import('../utils/types').ModelStatusEntry }} props
 */
export default function ForecastStrategicView({ data, onHorizonChange, modelStatus }) {
  const isLongRange = data.horizonYears > 5;

  return (
    <div className={styles.wrap}>
      <div className={styles.horizonRow}>
        <span className={styles.horizonLabel}>
          Forecast horizon
          <InfoTooltip
            label="What is the strategic forecast horizon?"
            content="How many years ahead the strategic forecast projects. Longer horizons give more planning runway but carry wider uncertainty."
          />
        </span>
        <HorizonSelector options={data.supportedHorizons} value={data.horizonYears} onChange={onHorizonChange} />
      </div>

      {isLongRange && <NoticeBanner text={LONG_RANGE_NOTICE} />}

      <div className={styles.cardsRow}>
        <MetricCard
          label={`${data.horizonYears}-Year Forecast`}
          value={formatCompactNumber(data.summary.forecastValue)}
          trend={{ direction: 'up', label: `${formatPct(data.summary.vsChangePct)} vs previous ${data.horizonYears} years`, tone: 'positive' }}
        />
        <MetricCard
          label="Expected Variation"
          value={`±${formatNumber(data.summary.expectedVariation)}`}
          subtitle={`${data.summary.expectedVariationPct}% of ${data.horizonYears}-Year Forecast`}
        >
          <span className={styles.variationTooltip}>
            <InfoTooltip
              label="Why does uncertainty grow with a longer horizon?"
              content="Long-range uncertainty widens because more of the forecast's inputs are projected forward rather than measured, the further out the horizon extends."
            />
          </span>
        </MetricCard>
        <StrategicFreshnessCard status={modelStatus} />
      </div>

      <section className={`card ${styles.chartCard}`}>
        <h2 className={styles.chartTitle}>Demand forecast — {data.horizonYears} Years</h2>
        <ForecastChart historical={data.chart.historical} forecast={data.chart.forecast} height={320} />
        <ConfidenceBand />
      </section>

      <DemandDriversPanel data={data.demandDrivers} />
    </div>
  );
}

import { AlertCircle } from 'lucide-react';
import ConfidenceBadge from '../components/ConfidenceBadge';
import ForecastChart from '../components/ForecastChart';
import ConfidenceBand from '../components/ConfidenceBand';
import { formatNumber, formatRange, formatPct } from '../utils/format';
import styles from './ForecastOperationalView.module.css';

function MonthCard({ month, selected, onSelect }) {
  const isPredicted = month.type === 'predicted';
  return (
    <button
      type="button"
      className={`card ${styles.monthCard} ${selected ? styles.monthCardSelected : ''}`}
      onClick={() => onSelect(month.id)}
      aria-pressed={selected}
    >
      <div className={styles.monthCardHeader}>
        <span className={styles.monthLabel}>
          {month.label} · {isPredicted ? 'predicted' : 'actual'}
        </span>
        {isPredicted && <ConfidenceBadge level={month.confidence} />}
      </div>
      {month.subLabel && <span className={styles.subLabel}>{month.subLabel}</span>}

      <p className={styles.monthValue}>{formatNumber(month.value)}</p>

      {month.subtitle && <p className={styles.recordedNote}>{month.subtitle}</p>}

      {month.range && (
        <p className={styles.rangeText}>
          Range {formatRange(month.range)} ({formatPct(month.range.marginPct, { signed: true })})
        </p>
      )}

      {month.action && (
        <p className={`${styles.action} ${month.confidence === 'high' ? styles.actionGood : styles.actionWarn}`}>
          {month.action}
        </p>
      )}
    </button>
  );
}

/**
 * @param {{ data: object }} props - operationalForecast shape from forecastService
 */
export default function ForecastOperationalView({ data, selectedMonthId, onSelectMonth }) {
  const activeMonthId = selectedMonthId || data.defaultSelectedMonthId;

  return (
    <div className={styles.wrap}>
      <div className={styles.cardsRow}>
        {data.months.map((month) => (
          <MonthCard
            key={month.id}
            month={month}
            selected={month.id === activeMonthId}
            onSelect={onSelectMonth}
          />
        ))}
      </div>

      {data.warning && (
        <div className={styles.warningBanner} role="note">
          <AlertCircle size={18} aria-hidden="true" className={styles.warningIcon} />
          <p>
            {data.warning} <a href="#learn-more">{data.warningLinkLabel}</a>
          </p>
        </div>
      )}

      <section className={`card ${styles.chartCard}`}>
        <h2 className={styles.chartTitle}>Demand forecast — July to September 2026</h2>
        <ForecastChart historical={data.chart.historical} forecast={data.chart.forecast} height={300} />
        <ConfidenceBand />
      </section>

      <section className={`card ${styles.driversCard}`}>
        <h2 className={styles.chartTitle}>Who&rsquo;s driving the {data.driverBreakdown.monthLabel} number</h2>
        <div className={styles.driverGrid}>
          {data.driverBreakdown.drivers.map((d) => (
            <div key={d.id} className={styles.driverStat}>
              <p className={styles.driverLabel}>{d.label}</p>
              <p className={styles.driverValue}>{d.pctOfDemand}% of Demand</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

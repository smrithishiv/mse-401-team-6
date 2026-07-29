import { Link } from 'react-router-dom';
import AgencyStatusBadge from './AgencyStatusBadge';
import FourWeekTrend from './FourWeekTrend';
import { formatNumber, formatDateTime } from '../utils/format';
import styles from './AgencyMobileCard.module.css';

/** @param {{ agency: object }} props */
export default function AgencyMobileCard({ agency }) {
  return (
    <Link to={`/agencies/${agency.id}`} className={`card ${styles.card}`}>
      <div className={styles.header}>
        <span className={styles.name}>{agency.name}</span>
        <AgencyStatusBadge status={agency.status} withTooltip={false} />
      </div>
      <p className={styles.area}>{agency.serviceArea}</p>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Current</span>
          <span className={styles.metricValue}>{formatNumber(agency.currentDemand)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Forecasted</span>
          <span className={styles.metricValue}>{formatNumber(agency.forecastedDemand)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Difference</span>
          <span className={styles.metricValue}>
            {agency.forecastDifferencePercent > 0 ? '+' : ''}
            {agency.forecastDifferencePercent}%
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <FourWeekTrend values={agency.weeklyDemand} trend={agency.trend} withTooltip={false} />
        <span className={styles.updated}>Updated {formatDateTime(agency.lastUpdated)}</span>
      </div>
    </Link>
  );
}

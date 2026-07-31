import InfoTooltip from './InfoTooltip';
import { formatDate, formatDateTime } from '../utils/format';
import styles from './StrategicFreshnessCard.module.css';

function capitalize(word) {
  return word ? word[0].toUpperCase() + word.slice(1) : word;
}

/**
 * Replaces the old single, ambiguous "Last Model Run" metric card with
 * clearer strategic-forecast freshness metadata: when it was generated and
 * how often it refreshes, with the underlying data-through/next-refresh
 * detail available in a tooltip rather than crowding the card itself.
 *
 * @param {{ status: import('../utils/types').ModelStatusEntry }} props
 */
export default function StrategicFreshnessCard({ status }) {
  if (!status) return null;

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.header}>
        <p className={styles.label}>Strategic forecast updated</p>
        <InfoTooltip
          label="Strategic forecast freshness details"
          content={
            <>
              <div>Data through: {formatDate(status.dataThrough)}</div>
              {status.nextScheduledRefresh && (
                <div>Next scheduled refresh: {formatDateTime(status.nextScheduledRefresh)}</div>
              )}
            </>
          }
        />
      </div>
      <p className={styles.value}>{formatDate(status.generatedAt)}</p>
      <p className={styles.subtitle}>{capitalize(status.refreshCadence)} refresh</p>
    </div>
  );
}

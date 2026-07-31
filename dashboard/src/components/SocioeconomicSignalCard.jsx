import StatusBadge from './StatusBadge';
import GeographyLevelBadge from './GeographyLevelBadge';
import styles from './SocioeconomicSignalCard.module.css';

/**
 * @param {{ signal: { label: string, value: string, description: string, status: string, geographyLevel?: string } }} props
 */
export default function SocioeconomicSignalCard({ signal }) {
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.header}>
        <span className={styles.label}>{signal.label}</span>
        <StatusBadge status={signal.status} />
      </div>
      <p className={styles.value}>{signal.value}</p>
      <p className={styles.description}>{signal.description}</p>
      {signal.geographyLevel && (
        <div className={styles.footer}>
          <GeographyLevelBadge level={signal.geographyLevel} />
        </div>
      )}
    </div>
  );
}

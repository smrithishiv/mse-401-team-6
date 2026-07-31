import InfoTooltip from './InfoTooltip';
import { CONFIDENCE_TOOLTIPS } from '../utils/forecastStatus';
import styles from './ConfidenceBadge.module.css';

/** @param {{ level: 'high' | 'low', withTooltip?: boolean }} props */
export default function ConfidenceBadge({ level, withTooltip = true }) {
  const isHigh = level === 'high';
  const label = `${isHigh ? 'High' : 'Low'} confidence`;

  return (
    <span className={styles.wrap}>
      <span className={`${styles.badge} ${isHigh ? styles.high : styles.low}`}>{label}</span>
      {withTooltip && (
        <InfoTooltip label={`What does "${label}" mean?`} content={CONFIDENCE_TOOLTIPS[level]} />
      )}
    </span>
  );
}

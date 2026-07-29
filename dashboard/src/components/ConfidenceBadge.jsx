import styles from './ConfidenceBadge.module.css';

/** @param {{ level: 'high' | 'low' }} props */
export default function ConfidenceBadge({ level }) {
  const isHigh = level === 'high';
  return (
    <span className={`${styles.badge} ${isHigh ? styles.high : styles.low}`}>
      {isHigh ? 'High' : 'Low'} confidence
    </span>
  );
}

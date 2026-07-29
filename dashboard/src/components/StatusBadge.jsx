import styles from './StatusBadge.module.css';

const TONE_BY_STATUS = {
  'High demand': 'red',
  Critical: 'red',
  High: 'red',
  Watch: 'yellow',
  Elevated: 'yellow',
  'Med-High': 'orange',
  'med-high': 'orange',
  Normal: 'green',
  Low: 'green',
  low: 'green',
  medium: 'yellow',
  high: 'red',
};

/** @param {{ status: string, tone?: 'red'|'yellow'|'orange'|'green'|'blue'|'grey' }} props */
export default function StatusBadge({ status, tone }) {
  const resolvedTone = tone || TONE_BY_STATUS[status] || 'grey';
  return <span className={`${styles.badge} ${styles[resolvedTone]}`}>{status}</span>;
}

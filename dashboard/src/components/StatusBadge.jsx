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

/**
 * `wrap` lets long labels wrap onto a second line inside the pill instead of
 * staying nowrap — only opt into it where the badge has room to grow
 * vertically (e.g. a card), never in a table cell/row, where a shrinkable
 * pill collapses to one character per line instead.
 * @param {{ status: string, tone?: 'red'|'yellow'|'orange'|'green'|'blue'|'grey', wrap?: boolean }} props
 */
export default function StatusBadge({ status, tone, wrap = false }) {
  const resolvedTone = tone || TONE_BY_STATUS[status] || 'grey';
  return (
    <span className={`${styles.badge} ${styles[resolvedTone]} ${wrap ? styles.badgeWrap : ''}`}>{status}</span>
  );
}

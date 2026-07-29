import styles from './StackedBreakdownBar.module.css';

/**
 * Horizontal stacked bar used for demographic breakdowns (gender, age, income).
 * @param {{ label: string, segments: {label: string, pct: number, color: string}[] }} props
 */
export default function StackedBreakdownBar({ label, segments }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <div
        className={styles.track}
        role="img"
        aria-label={`${label} breakdown: ${segments.map((s) => `${s.label} ${s.pct}%`).join(', ')}`}
      >
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={styles.segment}
            style={{ width: `${seg.pct}%`, background: seg.color }}
            title={`${seg.label}: ${seg.pct}%`}
          >
            {seg.pct >= 8 && (
              <span className={styles.segmentLabel}>
                {seg.pct}% {seg.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

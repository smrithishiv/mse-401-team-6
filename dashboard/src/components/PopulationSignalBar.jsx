import styles from './PopulationSignalBar.module.css';

/**
 * Horizontal progress-style bar showing a population segment's relative
 * change (e.g. "+78%"). `max` controls what value maps to a full-width bar.
 * @param {{ label: string, changePct: number, max?: number }} props
 */
export default function PopulationSignalBar({ label, changePct, max = 100 }) {
  const width = Math.min(100, Math.round((Math.abs(changePct) / max) * 100));
  const tone = changePct >= 50 ? styles.high : changePct >= 25 ? styles.medium : styles.low;

  return (
    <div className={styles.row}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={`${styles.change} ${tone}`}>
          {changePct > 0 ? '+' : ''}
          {changePct}%
        </span>
      </div>
      <div className={styles.track} role="progressbar" aria-valuenow={changePct} aria-valuemin={0} aria-valuemax={max} aria-label={`${label} change`}>
        <div className={`${styles.fill} ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

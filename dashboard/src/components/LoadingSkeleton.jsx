import styles from './LoadingSkeleton.module.css';

/**
 * @param {{ variant?: 'cards' | 'chart' | 'table' | 'block', count?: number, height?: number }} props
 */
export default function LoadingSkeleton({ variant = 'block', count = 3, height }) {
  if (variant === 'cards') {
    return (
      <div className={styles.cardRow} role="status" aria-label="Loading data">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`card ${styles.card}`}>
            <div className={`${styles.bar} ${styles.short}`} />
            <div className={`${styles.bar} ${styles.tall}`} />
            <div className={`${styles.bar} ${styles.medium}`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`card ${styles.chart}`} style={{ height: height || 320 }} role="status" aria-label="Loading chart">
        <div className={styles.chartShimmer} />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`card ${styles.table}`} role="status" aria-label="Loading table">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={styles.row} />
        ))}
      </div>
    );
  }

  return <div className={styles.blockBar} style={{ height: height || 24 }} role="status" aria-label="Loading" />;
}

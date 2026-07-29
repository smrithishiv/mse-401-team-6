import styles from './Sparkline.module.css';

/**
 * Minimal bar-style sparkline for a table cell (4-week trend). Deliberately
 * lightweight (plain SVG) rather than a full Recharts instance since it
 * renders many times inside a table.
 * @param {{ values: number[], tone?: 'red' | 'yellow' | 'blue' }} props
 */
export default function Sparkline({ values, tone = 'blue' }) {
  const max = Math.max(...values, 1);
  const barWidth = 8;
  const gap = 4;
  const height = 28;

  return (
    <svg
      className={styles.sparkline}
      width={values.length * (barWidth + gap)}
      height={height}
      role="img"
      aria-label={`4-week trend: ${values.join(', ')}`}
    >
      {values.map((v, i) => {
        const barHeight = Math.max(2, (v / max) * height);
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx={2}
            className={`${styles.bar} ${styles[tone]} ${i === values.length - 1 ? styles.last : ''}`}
          />
        );
      })}
    </svg>
  );
}

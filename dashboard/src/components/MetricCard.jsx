import styles from './MetricCard.module.css';

/**
 * Generic KPI card: label, big value, optional trend/subtitle line, optional
 * children slot for extra content (badges, mini charts, etc).
 */
export default function MetricCard({
  label,
  value,
  subtitle,
  trend, // { direction: 'up' | 'down', label: string, tone: 'positive' | 'negative' | 'neutral' }
  highlighted = false,
  children,
  className = '',
}) {
  return (
    <div className={`card ${styles.card} ${highlighted ? styles.highlighted : ''} ${className}`}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {trend && (
        <p className={`${styles.trend} ${styles[trend.tone || 'neutral']}`}>
          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : ''} {trend.label}
        </p>
      )}
      {subtitle && !trend && <p className={styles.subtitle}>{subtitle}</p>}
      {children}
    </div>
  );
}

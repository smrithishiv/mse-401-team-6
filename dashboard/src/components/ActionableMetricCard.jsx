import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './ActionableMetricCard.module.css';

/**
 * Same visual language as MetricCard, but the whole card navigates
 * somewhere — used for Overview's KPI cards so a manager can click straight
 * through instead of the card being a dead end. Deliberately still reads as
 * a card (not a button): hover/focus just lift it and reveal the arrow.
 *
 * @param {{
 *   to: string, ariaLabel: string, label: string, value: import('react').ReactNode,
 *   subtitle?: string, trend?: { direction: 'up'|'down', label: string, tone?: string },
 *   children?: import('react').ReactNode,
 * }} props
 */
export default function ActionableMetricCard({ to, ariaLabel, label, value, subtitle, trend, children }) {
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <Link to={to} aria-label={ariaLabel} className={`card ${styles.card}`} onKeyDown={handleKeyDown}>
      <div className={styles.header}>
        <p className={styles.label}>{label}</p>
        <ArrowRight size={16} className={styles.arrow} aria-hidden="true" />
      </div>
      <p className={styles.value}>{value}</p>
      {trend && (
        <p className={`${styles.trend} ${styles[trend.tone || 'neutral']}`}>
          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : ''} {trend.label}
        </p>
      )}
      {subtitle && !trend && <p className={styles.subtitle}>{subtitle}</p>}
      {children}
    </Link>
  );
}

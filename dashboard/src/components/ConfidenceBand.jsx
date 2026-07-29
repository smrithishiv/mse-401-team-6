import { Info } from 'lucide-react';
import styles from './ConfidenceBand.module.css';

/**
 * Small explanatory note placed near a ForecastChart, clarifying what the
 * shaded confidence region represents. Kept separate from ForecastChart so
 * it can be reused (or omitted) independently of the chart itself.
 */
export default function ConfidenceBand({
  text = 'Shaded band shows model confidence — the range the forecast is likely to fall within.',
}) {
  return (
    <p className={styles.note}>
      <Info size={14} aria-hidden="true" className={styles.icon} />
      {text}
    </p>
  );
}

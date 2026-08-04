import InfoTooltip from './InfoTooltip';
import { CONFIDENCE_TOOLTIPS } from '../utils/forecastStatus';
import styles from './ConfidenceBadge.module.css';

const BADGE_STYLE = { high: styles.high, low: styles.low, pending: styles.pending };
const BADGE_LABEL = { high: 'High confidence', low: 'Low confidence', pending: 'Calibration pending' };

/**
 * `pending` is for forecasts that carry a prediction interval but haven't
 * had high/low thresholds statistically calibrated yet — it must never be
 * silently coerced into `high`/`low`, since that would present an
 * uncalibrated badge as if it were a real confidence judgement.
 * `wrap` lets the badge wrap onto a second line where there's room to grow
 * vertically (currently only the Forecast page's monthly cards) — see
 * StatusBadge's `wrap` prop for why this isn't the default everywhere.
 * @param {{ level: 'high' | 'low' | 'pending', withTooltip?: boolean, wrap?: boolean }} props
 */
export default function ConfidenceBadge({ level, withTooltip = true, wrap = false }) {
  const label = BADGE_LABEL[level] ?? BADGE_LABEL.pending;
  const badgeStyle = BADGE_STYLE[level] ?? BADGE_STYLE.pending;

  return (
    <span className={`${styles.wrap} ${wrap ? styles.wrapEnabled : ''}`}>
      <span className={`${styles.badge} ${badgeStyle}`}>{label}</span>
      {withTooltip && (
        <InfoTooltip
          label={`What does "${label}" mean?`}
          content={CONFIDENCE_TOOLTIPS[level] ?? CONFIDENCE_TOOLTIPS.pending}
        />
      )}
    </span>
  );
}

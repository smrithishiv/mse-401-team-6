import { FileCheck, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import StatusBadge from './StatusBadge';
import InfoTooltip from './InfoTooltip';
import { getForecastStatusInfo } from '../utils/forecastStatus';
import styles from './ForecastStatusBadge.module.css';

const ICONS = { FileCheck, CheckCircle2, AlertTriangle, AlertOctagon, Info };

/**
 * Reusable, accessible status badge for forecast/allocation state. Resolves
 * label, colour tone, icon and tooltip copy from the single canonical map
 * in `utils/forecastStatus.js` so colour never drifts from meaning.
 *
 * `wrap` lets the pill wrap onto a second line where there's room to grow
 * vertically (currently only the Forecast page's monthly cards) — see
 * StatusBadge's `wrap` prop for why this isn't the default everywhere.
 * @param {{ statusKey: 'actual'|'on-track'|'manual-review'|'critical'|'forecast-pending', withTooltip?: boolean, wrap?: boolean }} props
 */
export default function ForecastStatusBadge({ statusKey, withTooltip = true, wrap = false }) {
  const info = getForecastStatusInfo(statusKey);
  const Icon = ICONS[info.icon];

  return (
    <span className={styles.wrap}>
      <span className={styles.badgeRow}>
        <Icon size={13} aria-hidden="true" />
        <StatusBadge status={info.label} tone={info.tone} wrap={wrap} />
      </span>
      {withTooltip && <InfoTooltip label={`What does "${info.label}" mean?`} content={info.tooltip} />}
    </span>
  );
}

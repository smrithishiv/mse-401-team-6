import { FileCheck, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import StatusBadge from './StatusBadge';
import InfoTooltip from './InfoTooltip';
import { getForecastStatusInfo } from '../utils/forecastStatus';
import styles from './ForecastStatusBadge.module.css';

const ICONS = { FileCheck, CheckCircle2, AlertTriangle, AlertOctagon };

/**
 * Reusable, accessible status badge for forecast/allocation state. Resolves
 * label, colour tone, icon and tooltip copy from the single canonical map
 * in `utils/forecastStatus.js` so colour never drifts from meaning.
 *
 * @param {{ statusKey: 'actual'|'on-track'|'manual-review'|'critical', withTooltip?: boolean }} props
 */
export default function ForecastStatusBadge({ statusKey, withTooltip = true }) {
  const info = getForecastStatusInfo(statusKey);
  const Icon = ICONS[info.icon];

  return (
    <span className={styles.wrap}>
      <span className={styles.badgeRow}>
        <Icon size={13} aria-hidden="true" />
        <StatusBadge status={info.label} tone={info.tone} />
      </span>
      {withTooltip && <InfoTooltip label={`What does "${info.label}" mean?`} content={info.tooltip} />}
    </span>
  );
}

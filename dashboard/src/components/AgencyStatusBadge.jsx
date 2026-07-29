import StatusBadge from './StatusBadge';
import InfoTooltip from './InfoTooltip';
import { AGENCY_STATUS_LABELS } from '../data/mockAgencyData';
import styles from './AgencyStatusBadge.module.css';

const TONE_BY_STATUS = { normal: 'green', watch: 'yellow', 'high-demand': 'orange', critical: 'red' };

const DESCRIPTION_BY_STATUS = {
  normal: 'Recorded and forecasted demand are within the expected range for this agency.',
  watch: 'Demand is trending above expected levels. Being monitored, no action required yet.',
  'high-demand': 'Demand is meaningfully above the expected range — allocation should be reviewed.',
  critical: 'Demand is far above the expected range, often paired with low forecast confidence — needs manual confirmation.',
};

/** @param {{ status: string, withTooltip?: boolean }} props */
export default function AgencyStatusBadge({ status, withTooltip = true }) {
  return (
    <span className={styles.wrap}>
      <StatusBadge status={AGENCY_STATUS_LABELS[status] || status} tone={TONE_BY_STATUS[status] || 'grey'} />
      {withTooltip && (
        <InfoTooltip label="What does this status mean?" content={DESCRIPTION_BY_STATUS[status] || 'Agency status.'} />
      )}
    </span>
  );
}

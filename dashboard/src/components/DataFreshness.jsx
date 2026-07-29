import { RotateCw } from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import { formatDateTime } from '../utils/format';
import styles from './DataFreshness.module.css';

/**
 * Compact freshness indicator for the page header. Distinguishes "data
 * last updated" (when hamper-visit/agency data was last ingested) from
 * "model last run" (when the forecast model last recalculated) — the two
 * are different events and collapsing them into one line has previously
 * caused confusion, so both are always available, just condensed into a
 * tooltip when horizontal space is tight.
 *
 * @param {{ dataUpdated: string, modelLastRun?: string }} props
 */
export default function DataFreshness({ dataUpdated, modelLastRun }) {
  return (
    <div className={styles.wrap}>
      <RotateCw size={13} aria-hidden="true" className={styles.icon} />
      <span>Data updated {formatDateTime(dataUpdated)}</span>
      {modelLastRun && (
        <InfoTooltip
          label="Data freshness details"
          content={
            <>
              <div>Data updated: {formatDateTime(dataUpdated)}</div>
              <div>Model last run: {formatDateTime(modelLastRun)}</div>
            </>
          }
        />
      )}
    </div>
  );
}

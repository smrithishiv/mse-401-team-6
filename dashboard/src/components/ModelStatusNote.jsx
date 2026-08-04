import StatusBadge from './StatusBadge';
import InfoTooltip from './InfoTooltip';
import styles from './ModelStatusNote.module.css';

/**
 * Identifies which model produced a forecast and its status (e.g.
 * "Holt-Winters — Provisional operational recommendation"). Model/status
 * text always comes straight from the forecast export (see
 * modeling/baselines/export_forecast.py), never hardcoded here — this
 * component just displays whatever the export says, so it can't drift into
 * implying a model is final on its own.
 *
 * @param {{ model?: string, status?: string, statusNote?: string, isSampleData?: boolean }} props
 */
export default function ModelStatusNote({ model, status, statusNote, isSampleData }) {
  if (!model) return null;

  return (
    <div className={styles.wrap}>
      <StatusBadge status={`Model: ${model}`} tone="grey" />
      {status && <span className={styles.status}>{status}</span>}
      {statusNote && <InfoTooltip label={`About the ${model} model status`} content={statusNote} />}
      {isSampleData && <StatusBadge status="Sample data" tone="yellow" />}
    </div>
  );
}

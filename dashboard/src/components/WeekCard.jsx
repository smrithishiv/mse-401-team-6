import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge';
import ForecastStatusBadge from './ForecastStatusBadge';
import SelectableCard from './SelectableCard';
import { formatNumber, formatPct } from '../utils/format';
import styles from './WeekCard.module.css';

function ChangeRow({ changePct }) {
  if (changePct === null || changePct === undefined) {
    return <span className={styles.change}>No prior week to compare</span>;
  }
  const Icon = changePct > 0 ? ArrowUp : changePct < 0 ? ArrowDown : Minus;
  return (
    <span className={styles.change}>
      <Icon size={13} aria-hidden="true" />
      {formatPct(changePct, { signed: true })} vs previous week
    </span>
  );
}

/**
 * Weekly counterpart to ForecastOperationalView's MonthCard: date range,
 * value, status, confidence (predicted weeks only), and change vs the
 * previous week. Clicking selects the week for the chart/table/driver panel.
 *
 * @param {{ week: import('../utils/types').WeeklyForecastCard, selected: boolean, onSelect: (id: string) => void }} props
 */
export default function WeekCard({ week, selected, onSelect }) {
  const isPredicted = week.type === 'predicted';

  return (
    <SelectableCard
      className={`card ${styles.weekCard} ${selected ? styles.weekCardSelected : ''}`}
      selected={selected}
      onSelect={() => onSelect(week.id)}
    >
      <div className={styles.header}>
        <span className={styles.label}>
          {week.label} · {isPredicted ? 'predicted' : 'actual'}
        </span>
        {isPredicted && <ConfidenceBadge level={week.confidence} />}
      </div>

      <p className={styles.value}>{formatNumber(week.value)}</p>

      <ForecastStatusBadge statusKey={week.statusKey} />

      <ChangeRow changePct={week.changeFromPreviousWeekPct} />
    </SelectableCard>
  );
}

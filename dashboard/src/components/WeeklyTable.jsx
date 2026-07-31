import SortableHeader from './SortableHeader';
import ForecastStatusBadge from './ForecastStatusBadge';
import ConfidenceBadge from './ConfidenceBadge';
import { formatNumber, formatRange, formatPct } from '../utils/format';
import styles from './WeeklyTable.module.css';

const COLUMNS = [
  { key: 'week', label: 'Week' },
  { key: 'value', label: 'Predicted demand' },
  { key: null, label: 'Forecast range' },
  { key: 'change', label: 'Change from previous week' },
  { key: null, label: 'Confidence' },
  { key: 'currentAllocation', label: 'Current allocation' },
  { key: 'recommendedAllocation', label: 'Recommended allocation' },
  { key: null, label: 'Recommended action' },
];

/**
 * Weekly counterpart to AgencyTable: sortable, horizontally-scrollable on
 * narrow viewports, and highlights whichever row matches the week selected
 * via the WeekCard row / chart.
 *
 * @param {{ weeks: import('../utils/types').WeeklyForecastCard[], selectedWeekId: string, onSelectWeek: (id: string) => void, sortBy: string, sortDir: 'asc'|'desc', onSort: (key: string) => void }} props
 */
export default function WeeklyTable({ weeks, selectedWeekId, onSelectWeek, sortBy, sortDir, onSort }) {
  if (!weeks.length) {
    return <p className={styles.empty}>No weekly forecast data available.</p>;
  }

  return (
    <div className={styles.scrollWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.label} scope="col">
                <SortableHeader label={col.label} columnKey={col.key} sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => {
            const selected = week.id === selectedWeekId;
            return (
              <tr
                key={week.id}
                className={selected ? styles.rowSelected : undefined}
                aria-selected={selected}
                onClick={() => onSelectWeek(week.id)}
              >
                <td className={styles.nameCell}>{week.label}</td>
                <td>{formatNumber(week.value)}</td>
                <td className={styles.mutedCell}>{week.range ? formatRange(week.range) : '—'}</td>
                <td className={styles.mutedCell}>
                  {week.changeFromPreviousWeekPct === null || week.changeFromPreviousWeekPct === undefined
                    ? '—'
                    : formatPct(week.changeFromPreviousWeekPct, { signed: true })}
                </td>
                <td>{week.confidence ? <ConfidenceBadge level={week.confidence} withTooltip={false} /> : '—'}</td>
                <td>{week.currentAllocation !== undefined ? formatNumber(week.currentAllocation) : '—'}</td>
                <td>{week.recommendedAllocation !== undefined ? formatNumber(week.recommendedAllocation) : '—'}</td>
                <td>
                  <ForecastStatusBadge statusKey={week.statusKey} withTooltip={false} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

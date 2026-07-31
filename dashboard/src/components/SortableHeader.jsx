import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import styles from './SortableHeader.module.css';

/**
 * Shared sortable-column-header control for data tables. Renders a plain
 * span for non-sortable columns (`columnKey` falsy), otherwise a button
 * that toggles sort via `onSort(columnKey)` and shows the current
 * direction. Extracted from AgencyTable so other tables (e.g. WeeklyTable)
 * share the same sort affordance instead of re-implementing it.
 *
 * @param {{ label: string, columnKey: string|null, sortBy: string, sortDir: 'asc'|'desc', onSort: (key: string) => void }} props
 */
export default function SortableHeader({ label, columnKey, sortBy, sortDir, onSort }) {
  if (!columnKey) return <span>{label}</span>;
  const isActive = sortBy === columnKey;
  const Icon = isActive ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <button type="button" className={styles.sortButton} onClick={() => onSort(columnKey)}>
      {label}
      <Icon size={12} aria-hidden="true" className={isActive ? styles.sortActive : styles.sortIdle} />
    </button>
  );
}

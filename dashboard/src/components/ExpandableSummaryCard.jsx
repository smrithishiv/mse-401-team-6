import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './ExpandableSummaryCard.module.css';

/**
 * A MetricCard that expands into a popover panel listing the items behind
 * the headline number (e.g. the specific groups/areas behind a "3
 * high-risk groups" count), each with an action to drill into it further.
 * Used instead of a plain <select> so every row can carry multiple fields
 * (risk level, change, contributing signal) rather than a single label.
 *
 * @param {{
 *   label: string, value: import('react').ReactNode, subtitle?: string,
 *   trend?: { direction: 'up'|'down', label: string, tone?: string },
 *   panelTitle: string, items: Array<{id: string}>,
 *   renderItem: (item: any, helpers: { close: () => void }) => import('react').ReactNode,
 *   emptyMessage?: string,
 * }} props
 */
export default function ExpandableSummaryCard({
  label,
  value,
  subtitle,
  trend,
  panelTitle,
  items,
  renderItem,
  emptyMessage = 'Nothing to show.',
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={`card ${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <div className={styles.headerRow}>
          <p className={styles.label}>{label}</p>
          <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
        </div>
        <p className={styles.value}>{value}</p>
        {trend && (
          <p className={`${styles.trend} ${styles[trend.tone || 'neutral']}`}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : ''} {trend.label}
          </p>
        )}
        {subtitle && !trend && <p className={styles.subtitle}>{subtitle}</p>}
      </button>

      {open && (
        <div id={panelId} role="group" aria-label={panelTitle} className={styles.panel}>
          <p className={styles.panelTitle}>{panelTitle}</p>
          {items.length > 0 ? (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  {renderItem(item, { close: () => setOpen(false) })}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

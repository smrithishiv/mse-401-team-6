import { X } from 'lucide-react';
import styles from './FilterDrawer.module.css';

/**
 * Generic, config-driven filter drawer. Renders whatever `fields` a page
 * passes in (date inputs or selects) — the panel itself has no knowledge of
 * Forecast vs. At-risk Groups, so each page can configure only the fields
 * that match its own analytical purpose instead of sharing one fixed panel.
 *
 * @param {{
 *   isOpen: boolean,
 *   title?: string,
 *   fields: {id: string, label: string, type: 'date'|'select', options?: {value:string,label:string}[]}[],
 *   draftValues: Record<string, string>,
 *   onChangeField: (id: string, value: string) => void,
 *   onClose: () => void,
 *   onApply: () => void,
 *   onReset: () => void,
 * }} props
 */
export default function FilterDrawer({
  isOpen,
  title = 'Filters',
  fields,
  draftValues,
  onChangeField,
  onClose,
  onApply,
  onReset,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close filters">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {fields.map((field) => (
            <div className={styles.field} key={field.id}>
              <label htmlFor={`filter-${field.id}`}>{field.label}</label>
              {field.type === 'date' ? (
                <input
                  id={`filter-${field.id}`}
                  type="date"
                  value={draftValues[field.id]}
                  onChange={(e) => onChangeField(field.id, e.target.value)}
                />
              ) : (
                <select
                  id={`filter-${field.id}`}
                  value={draftValues[field.id]}
                  onChange={(e) => onChangeField(field.id, e.target.value)}
                >
                  {field.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.resetButton} onClick={onReset}>
            Reset
          </button>
          <button type="button" className={styles.applyButton} onClick={onApply}>
            Apply filters
          </button>
        </div>
      </aside>
    </>
  );
}

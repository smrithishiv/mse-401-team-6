import styles from './CompactFilterBar.module.css';

/**
 * Inline filter row for pages that don't need a full drawer — currently
 * just Overview, which stays a stable organization-wide summary with only a
 * reporting-period and agency selector rather than the full filter panel.
 *
 * @param {{
 *   fields: {id: string, label: string, options: {value:string,label:string}[]}[],
 *   values: Record<string, string>,
 *   onChange: (id: string, value: string) => void,
 * }} props
 */
export default function CompactFilterBar({ fields, values, onChange }) {
  return (
    <div className={styles.bar} role="group" aria-label="Report filters">
      {fields.map((field) => (
        <label key={field.id} className={styles.field}>
          <span className={styles.label}>{field.label}</span>
          <select value={values[field.id]} onChange={(e) => onChange(field.id, e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

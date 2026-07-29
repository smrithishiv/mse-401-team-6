import { Search, X } from 'lucide-react';
import styles from './AgencySearch.module.css';

/**
 * @param {{ value: string, onChange: (v: string) => void, resultCount: number }} props
 */
export default function AgencySearch({ value, onChange, resultCount }) {
  return (
    <div className={styles.wrap}>
      <Search size={16} className={styles.icon} aria-hidden="true" />
      <input
        type="text"
        className={styles.input}
        placeholder="Search agencies by name, city, or status"
        aria-label="Search agencies by name, city, or status"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className={styles.clearButton} onClick={() => onChange('')} aria-label="Clear search">
          <X size={14} />
        </button>
      )}
      <span className={styles.count} aria-live="polite">
        {resultCount} {resultCount === 1 ? 'agency' : 'agencies'}
      </span>
    </div>
  );
}

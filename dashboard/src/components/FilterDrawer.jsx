import { X } from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import styles from './FilterDrawer.module.css';

const GENDER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const AGE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'under18', label: 'Under 18' },
  { value: '18-44', label: '18–44' },
  { value: '45-64', label: '45–64' },
  { value: '65+', label: '65+' },
];

const INCOME_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'under20k', label: 'Under $20k' },
  { value: '20-40k', label: '$20k–$40k' },
  { value: '40-60k', label: '$40k–$60k' },
  { value: '60k+', label: '$60k+' },
];

export default function FilterDrawer() {
  const { isDrawerOpen, closeDrawer, draftFilters, setDraftFilter, applyFilters, resetFilters } =
    useFilters();

  if (!isDrawerOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={closeDrawer} aria-hidden="true" />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Filters">
        <div className={styles.header}>
          <h2 className={styles.title}>Filters</h2>
          <button type="button" className={styles.closeButton} onClick={closeDrawer} aria-label="Close filters">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label htmlFor="filter-from">From</label>
            <input
              id="filter-from"
              type="date"
              value={draftFilters.from}
              onChange={(e) => setDraftFilter('from', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="filter-to">To</label>
            <input
              id="filter-to"
              type="date"
              value={draftFilters.to}
              onChange={(e) => setDraftFilter('to', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="filter-gender">Gender</label>
            <select
              id="filter-gender"
              value={draftFilters.gender}
              onChange={(e) => setDraftFilter('gender', e.target.value)}
            >
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="filter-age">Age Group</label>
            <select
              id="filter-age"
              value={draftFilters.ageGroup}
              onChange={(e) => setDraftFilter('ageGroup', e.target.value)}
            >
              {AGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="filter-income">Income</label>
            <select
              id="filter-income"
              value={draftFilters.income}
              onChange={(e) => setDraftFilter('income', e.target.value)}
            >
              {INCOME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.resetButton} onClick={resetFilters}>
            Reset
          </button>
          <button type="button" className={styles.applyButton} onClick={applyFilters}>
            Apply filters
          </button>
        </div>
      </aside>
    </>
  );
}

import styles from './SegmentedToggle.module.css';

/**
 * @param {{ options: {value: string, label: string}[], value: string, onChange: (v: string) => void, ariaLabel: string }} props
 */
export default function SegmentedToggle({ options, value, onChange, ariaLabel }) {
  return (
    <div className={styles.group} role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`${styles.option} ${selected ? styles.selected : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

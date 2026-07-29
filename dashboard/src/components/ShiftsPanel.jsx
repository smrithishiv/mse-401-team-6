import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { computeShifts, formatDriverValue, formatDriverChange } from '../utils/demandDrivers';
import styles from './ShiftsPanel.module.css';

const DIRECTION_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus };

/**
 * @param {{ dimension: import('../utils/types').DemandDriversDimension, displayMode: 'percentage' | 'population' }} props
 */
export default function ShiftsPanel({ dimension, displayMode }) {
  const shifts = computeShifts(dimension, displayMode);
  const [{ startYear, endYear }] = shifts;

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Largest projected shifts</h3>
      <p className={styles.subtitle}>
        {startYear} → {endYear}
      </p>
      <ul className={styles.list}>
        {shifts.map((shift) => {
          const Icon = DIRECTION_ICON[shift.direction];
          return (
            <li key={shift.id} className={styles.row}>
              <span className={styles.swatch} style={{ background: shift.color }} aria-hidden="true" />
              <div className={styles.info}>
                <span className={styles.label}>{shift.label}</span>
                <span className={styles.values}>
                  {formatDriverValue(shift.startValue, displayMode)} →{' '}
                  {formatDriverValue(shift.endValue, displayMode)}
                </span>
              </div>
              <span
                className={`${styles.change} ${styles[shift.direction]}`}
                aria-label={`${shift.direction === 'up' ? 'Increased' : shift.direction === 'down' ? 'Decreased' : 'No change'} by ${formatDriverChange(shift.change, displayMode)}`}
              >
                <Icon size={14} aria-hidden="true" />
                {formatDriverChange(shift.change, displayMode)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

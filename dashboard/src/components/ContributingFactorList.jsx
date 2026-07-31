import { ArrowUp, ArrowDown } from 'lucide-react';
import styles from './ContributingFactorList.module.css';

/**
 * @param {{ factors: import('../utils/types').ContributingFactor[] }} props
 */
export default function ContributingFactorList({ factors }) {
  if (!factors?.length) return null;

  return (
    <ul className={styles.list}>
      {factors.map((factor) => {
        const Icon = factor.direction === 'positive' ? ArrowUp : ArrowDown;
        return (
          <li key={factor.id} className={styles.row}>
            <span className={`${styles.direction} ${styles[factor.direction]}`}>
              <Icon size={13} aria-hidden="true" />
            </span>
            <div className={styles.body}>
              <div className={styles.headerRow}>
                <span className={styles.name}>{factor.name}</span>
                <span className={styles.contribution}>{Math.round(factor.contribution * 100)}% weight</span>
              </div>
              <p className={styles.explanation}>{factor.explanation}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

import { AlertTriangle, RotateCw } from 'lucide-react';
import styles from './ErrorState.module.css';

/** @param {{ message?: string, onRetry?: () => void }} props */
export default function ErrorState({ message, onRetry }) {
  return (
    <div className={`card ${styles.wrap}`} role="alert">
      <AlertTriangle size={22} className={styles.icon} aria-hidden="true" />
      <p className={styles.message}>{message || 'Something went wrong while loading this data.'}</p>
      {onRetry && (
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          <RotateCw size={14} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}

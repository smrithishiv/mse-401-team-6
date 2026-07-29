import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import AgencyStatusBadge from './AgencyStatusBadge';
import styles from './AgencyDetailHeader.module.css';

/** @param {{ agency: object }} props */
export default function AgencyDetailHeader({ agency }) {
  return (
    <div className={styles.wrap}>
      <Link to="/agencies" className={styles.backLink}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to Agencies
      </Link>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>{agency.name}</h1>
          <p className={styles.location}>
            {agency.serviceArea} · {agency.city}
          </p>
        </div>
        <div className={styles.badges}>
          <AgencyStatusBadge status={agency.status} />
          {agency.reviewRequired && (
            <span className={styles.reviewFlag}>
              <AlertTriangle size={13} aria-hidden="true" /> Requires review
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

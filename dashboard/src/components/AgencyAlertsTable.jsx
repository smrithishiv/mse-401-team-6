import { Link } from 'react-router-dom';
import AgencyStatusBadge from './AgencyStatusBadge';
import FourWeekTrend from './FourWeekTrend';
import styles from './AgencyAlertsTable.module.css';

/**
 * Focused list of agencies currently flagged for attention (not the full
 * 61-agency directory — that's the Agencies page). Used on Overview's
 * "Agencies needing review" panel.
 * @param {{ agencies: Array }} props
 */
export default function AgencyAlertsTable({ agencies }) {
  if (!agencies?.length) {
    return <p className={styles.empty}>No agencies currently need review.</p>;
  }

  return (
    <div className={styles.scrollWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Agency</th>
            <th scope="col">Status</th>
            <th scope="col">Reason flagged</th>
            <th scope="col">4-week trend</th>
            <th scope="col">Recommended action</th>
            <th scope="col">Review</th>
          </tr>
        </thead>
        <tbody>
          {agencies.map((agency) => (
            <tr key={agency.id}>
              <td className={styles.nameCell}>{agency.name}</td>
              <td>
                <AgencyStatusBadge status={agency.status} />
              </td>
              <td className={styles.reasonCell}>{agency.reasonFlagged || '—'}</td>
              <td>
                <FourWeekTrend values={agency.weeklyDemand} trend={agency.trend} />
              </td>
              <td className={styles.reasonCell}>{agency.recommendedAction}</td>
              <td>
                <Link to={`/agencies/${agency.id}`} className={styles.reviewButton}>
                  Review →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

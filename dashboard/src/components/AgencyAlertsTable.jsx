import StatusBadge from './StatusBadge';
import Sparkline from './Sparkline';
import styles from './AgencyAlertsTable.module.css';

const TREND_TONE = { 'High demand': 'red', Watch: 'yellow', Normal: 'blue' };

/**
 * @param {{ agencies: Array, onReview: (agency: object) => void }} props
 */
export default function AgencyAlertsTable({ agencies, onReview }) {
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
            <th scope="col">4-week trend</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {agencies.map((agency) => (
            <tr key={agency.id}>
              <td className={styles.nameCell}>{agency.name}</td>
              <td>
                <StatusBadge status={agency.status} />
              </td>
              <td>
                <Sparkline values={agency.trend} tone={TREND_TONE[agency.status] || 'blue'} />
              </td>
              <td>
                <button
                  type="button"
                  className={styles.reviewButton}
                  onClick={() => onReview?.(agency)}
                >
                  Review →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

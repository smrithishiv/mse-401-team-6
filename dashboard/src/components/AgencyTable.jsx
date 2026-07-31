import { Link } from 'react-router-dom';
import AgencyStatusBadge from './AgencyStatusBadge';
import FourWeekTrend from './FourWeekTrend';
import StatusBadge from './StatusBadge';
import SortableHeader from './SortableHeader';
import { formatNumber, formatDateTime } from '../utils/format';
import styles from './AgencyTable.module.css';

const ALLOCATION_TONE = { 'on-track': 'green', review: 'yellow' };
const ALLOCATION_LABEL = { 'on-track': 'On track', review: 'Needs review' };

const COLUMNS = [
  { key: 'name', label: 'Agency' },
  { key: null, label: 'Service area' },
  { key: 'demand', label: 'Current demand' },
  { key: null, label: 'Forecasted demand' },
  { key: 'difference', label: 'Difference' },
  { key: 'status', label: 'Status' },
  { key: null, label: '4-week trend' },
  { key: null, label: 'Allocation status' },
  { key: 'lastUpdated', label: 'Last updated' },
  { key: null, label: 'Action' },
];

/**
 * @param {{ agencies: Array, sortBy: string, sortDir: 'asc'|'desc', onSort: (key: string) => void }} props
 */
export default function AgencyTable({ agencies, sortBy, sortDir, onSort }) {
  if (!agencies.length) {
    return <p className={styles.empty}>No agencies match your search or filters.</p>;
  }

  return (
    <div className={styles.scrollWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.label} scope="col">
                <SortableHeader label={col.label} columnKey={col.key} sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {agencies.map((agency) => (
            <tr key={agency.id}>
              <td className={styles.nameCell}>
                <Link to={`/agencies/${agency.id}`}>{agency.name}</Link>
              </td>
              <td className={styles.mutedCell}>{agency.serviceArea}</td>
              <td>{formatNumber(agency.currentDemand)}</td>
              <td>{formatNumber(agency.forecastedDemand)}</td>
              <td
                className={
                  agency.forecastDifferencePercent > 0
                    ? styles.diffUp
                    : agency.forecastDifferencePercent < 0
                      ? styles.diffDown
                      : styles.mutedCell
                }
              >
                {agency.forecastDifferencePercent > 0 ? '+' : ''}
                {agency.forecastDifferencePercent}%
              </td>
              <td>
                <AgencyStatusBadge status={agency.status} withTooltip={false} />
              </td>
              <td>
                <FourWeekTrend values={agency.weeklyDemand} trend={agency.trend} withTooltip={false} />
              </td>
              <td>
                <StatusBadge
                  status={ALLOCATION_LABEL[agency.allocationStatus]}
                  tone={ALLOCATION_TONE[agency.allocationStatus]}
                />
              </td>
              <td className={styles.mutedCell}>{formatDateTime(agency.lastUpdated)}</td>
              <td>
                <Link to={`/agencies/${agency.id}`} className={styles.actionLink}>
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

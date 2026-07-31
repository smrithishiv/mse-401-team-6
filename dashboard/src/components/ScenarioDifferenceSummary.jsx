import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import ScenarioBadge from './ScenarioBadge';
import { formatNumber, formatPct } from '../utils/format';
import styles from './ScenarioDifferenceSummary.module.css';

const DIRECTION_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus };

function directionOf(value) {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

/**
 * @param {{ result: import('../utils/types').ScenarioResult }} props
 */
export default function ScenarioDifferenceSummary({ result }) {
  const sortedByImpact = [...result.differenceByYear].sort(
    (a, b) => Math.abs(b.difference) - Math.abs(a.difference)
  );
  const mostImpactedYears = sortedByImpact.slice(0, 3);

  return (
    <section className={`card ${styles.wrap}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Baseline vs. scenario comparison</h2>
        <ScenarioBadge />
      </div>

      <p className={styles.summarySentence}>{result.summarySentence}</p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Baseline</th>
              <th scope="col">Scenario</th>
              <th scope="col">Difference</th>
              <th scope="col">% change</th>
            </tr>
          </thead>
          <tbody>
            {result.differenceByYear.map((row) => {
              const Icon = DIRECTION_ICON[directionOf(row.difference)];
              return (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{formatNumber(row.baselineValue)}</td>
                  <td>{formatNumber(row.scenarioValue)}</td>
                  <td>
                    <span className={styles.diffCell}>
                      <Icon size={13} aria-hidden="true" />
                      {formatNumber(Math.abs(row.difference))}
                    </span>
                  </td>
                  <td>{formatPct(row.differencePct, { signed: true })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.detailGrid}>
        <div>
          <h3 className={styles.detailTitle}>Years with the largest impact</h3>
          <ul className={styles.list}>
            {mostImpactedYears.map((row) => (
              <li key={row.year}>
                {row.year}: {formatPct(row.differencePct, { signed: true })} ({formatNumber(Math.abs(row.difference))})
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={styles.detailTitle}>Population groups most affected</h3>
          <ul className={styles.list}>
            {result.affectedGroups.map((group) => (
              <li key={group.groupId}>
                {group.name}: {formatPct(group.changePct, { signed: true })} share of demand
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

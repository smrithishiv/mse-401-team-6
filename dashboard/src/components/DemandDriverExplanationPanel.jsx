import { Link } from 'react-router-dom';
import ContributingFactorList from './ContributingFactorList';
import { formatPct } from '../utils/format';
import styles from './DemandDriverExplanationPanel.module.css';

/**
 * Expands the old static "Who's driving the number" grid into per-group
 * explanations: share of demand, projected change, and the contributing
 * signals the model associates with that change. Renders only structural
 * labels — every explanatory string is passed through from `groups` as
 * provided by the service/mock layer, never authored here, so the
 * component can't invent language that overstates confidence or causation.
 *
 * @param {{ periodLabel: string, groups: import('../utils/types').DemandDriverGroup[] }} props
 */
export default function DemandDriverExplanationPanel({ periodLabel, groups }) {
  if (!groups?.length) return null;

  return (
    <section className={`card ${styles.panel}`}>
      <h2 className={styles.title}>Who&rsquo;s driving the {periodLabel} number</h2>

      <div className={styles.groups}>
        {groups.map((group) => (
          <details key={group.groupId} className={styles.group}>
            <summary className={styles.summary}>
              <span className={styles.groupName}>{group.name}</span>
              <span className={styles.groupStats}>
                <span>{group.shareOfDemand}% of demand</span>
                <span className={styles.change}>
                  {formatPct(group.projectedChangePercent, { signed: true })} projected change
                </span>
              </span>
            </summary>

            <div className={styles.detail}>
              <p className={styles.factorsLabel}>Contributing signals</p>
              <ContributingFactorList factors={group.contributingFactors} />
              {group.detailHref && (
                <Link to={group.detailHref} className={styles.detailLink}>
                  More about how projections work →
                </Link>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

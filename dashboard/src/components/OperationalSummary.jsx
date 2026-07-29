import OperationalSummaryItem from './OperationalSummaryItem';
import styles from './OperationalSummary.module.css';

/**
 * Renders whatever `buildOperationalSummary()` returned — this component
 * has no statement text of its own, so the summary automatically reflects
 * new forecast/agency/population data without any change here.
 * @param {{ items: Array }} props
 */
export default function OperationalSummary({ items }) {
  if (!items?.length) return null;

  return (
    <section className={`card ${styles.panel}`} aria-label="Operational summary">
      <h2 className={styles.title}>Operational Summary</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <OperationalSummaryItem item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

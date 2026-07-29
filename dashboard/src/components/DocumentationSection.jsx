import styles from './DocumentationSection.module.css';

/**
 * Reusable anchor-able content block for the Help page. Content is passed
 * in (from src/data/helpContent.js today) rather than hardcoded here, so
 * swapping the source for a CMS/backend response later doesn't require
 * touching this component.
 * @param {{ id: string, title: string, children: import('react').ReactNode }} props
 */
export default function DocumentationSection({ id, title, children }) {
  return (
    <section id={id} className={styles.section} tabIndex={-1}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

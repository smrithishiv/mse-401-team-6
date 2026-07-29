import styles from './PageContainer.module.css';

export default function PageContainer({ title, actions, children }) {
  return (
    <main className={styles.container}>
      {(title || actions) && (
        <div className={styles.headerRow}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {children}
    </main>
  );
}

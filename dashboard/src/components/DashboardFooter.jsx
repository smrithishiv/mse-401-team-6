import styles from './DashboardFooter.module.css';

export default function DashboardFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>In partnership with the Food Bank of Waterloo Region</p>
        <p>
          Breaking Bread — MSE Capstone, University of Waterloo · v1.0 ·{' '}
          <a href="#support">Contact support</a>
        </p>
      </div>
    </footer>
  );
}

import { AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './NoticeBanner.module.css';

const ICON_BY_TONE = { warning: AlertCircle, info: Info };

/**
 * Reusable inline notice banner with an optional link. Generalizes the
 * warning banner that used to live inline in ForecastOperationalView so it
 * can be reused wherever a forecast surface needs to point at more
 * explanation (e.g. `/help/projections`) without hardcoding a dead anchor.
 *
 * @param {{ text: string, link?: { to: string, label: string }, tone?: 'warning'|'info' }} props
 */
export default function NoticeBanner({ text, link, tone = 'warning' }) {
  const Icon = ICON_BY_TONE[tone] || AlertCircle;

  return (
    <div className={`${styles.banner} ${styles[tone]}`} role="note">
      <Icon size={18} aria-hidden="true" className={styles.icon} />
      <p>
        {text} {link && <Link to={link.to}>{link.label}</Link>}
      </p>
    </div>
  );
}

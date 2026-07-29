import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, ChevronRight } from 'lucide-react';
import styles from './OperationalSummaryItem.module.css';

const ICON_BY_SEVERITY = { success: CheckCircle2, warning: AlertTriangle, critical: AlertOctagon, info: Info };
const LABEL_BY_SEVERITY = { success: 'On track', warning: 'Needs attention', critical: 'Critical', info: 'Info' };

/** @param {{ item: { id: string, severity: string, message: string, destination: string } }} props */
export default function OperationalSummaryItem({ item }) {
  const Icon = ICON_BY_SEVERITY[item.severity] || Info;

  return (
    <Link to={item.destination} className={`${styles.item} ${styles[item.severity] || ''}`}>
      <Icon size={18} className={styles.icon} aria-hidden="true" />
      <span className={styles.message}>{item.message}</span>
      <span className="visually-hidden">{LABEL_BY_SEVERITY[item.severity]}</span>
      <ChevronRight size={16} className={styles.chevron} aria-hidden="true" />
    </Link>
  );
}

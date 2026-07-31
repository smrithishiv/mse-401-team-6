import { FlaskConical } from 'lucide-react';
import { SCENARIO_DISCLAIMER } from '../data/mockScenarioData';
import styles from './ScenarioBadge.module.css';

/**
 * Single source of truth for the "not the official forecast" disclaimer.
 * Every scenario output surface (page header, comparison chart, difference
 * summary, exported report) renders this exact component/string so the
 * copy can never drift between surfaces.
 */
export default function ScenarioBadge() {
  return (
    <span className={styles.badge}>
      <FlaskConical size={13} aria-hidden="true" />
      {SCENARIO_DISCLAIMER}
    </span>
  );
}

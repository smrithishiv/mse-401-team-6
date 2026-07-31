import styles from './GeographyLevelBadge.module.css';

const LEVEL_LABEL = {
  local: 'Local data',
  municipal: 'Municipal data',
  regional: 'Regional data',
  estimated: 'Estimated',
  unavailable: 'Not available at this level',
};

const LEVEL_DESCRIPTION = {
  local: 'Measured directly for this area.',
  municipal: 'Measured at the city/township level.',
  regional: 'Only available as a Waterloo Region-wide aggregate.',
  estimated: 'Modelled from nearby/regional data, not directly measured here.',
  unavailable: 'Not currently collected at this geographic level.',
};

/**
 * Small pill indicating the geographic granularity a metric value is
 * actually available at (local/municipal/regional/estimated/unavailable) —
 * so a regional aggregate isn't mistaken for a hyper-local measurement.
 * @param {{ level: 'local'|'municipal'|'regional'|'estimated'|'unavailable' }} props
 */
export default function GeographyLevelBadge({ level }) {
  const label = LEVEL_LABEL[level] || level;
  return (
    <span className={`${styles.badge} ${styles[level] || ''}`} title={LEVEL_DESCRIPTION[level] || undefined}>
      {label}
    </span>
  );
}

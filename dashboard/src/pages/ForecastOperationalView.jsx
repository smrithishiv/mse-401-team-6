import SegmentedToggle from '../components/SegmentedToggle';
import DataFreshness from '../components/DataFreshness';
import ForecastOperationalMonthlyView from './ForecastOperationalMonthlyView';
import ForecastOperationalWeeklyView from './ForecastOperationalWeeklyView';
import styles from './ForecastOperationalView.module.css';

const GRANULARITY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
];

/**
 * Thin switcher between the Monthly and Weekly operational forecast views.
 * `data` is already shaped for whichever granularity is active — ForecastPage
 * fetches monthly and weekly data independently so toggling never briefly
 * renders one granularity's view with the other's data shape.
 */
export default function ForecastOperationalView({
  data,
  granularity,
  onGranularityChange,
  selectedMonthId,
  onSelectMonth,
  selectedWeekId,
  onSelectWeek,
  operationalStatus,
}) {
  return (
    <div className={styles.wrap}>
      {operationalStatus && (
        <DataFreshness dataUpdated={operationalStatus.dataThrough} modelLastRun={operationalStatus.generatedAt} />
      )}
      <SegmentedToggle
        options={GRANULARITY_OPTIONS}
        value={granularity}
        onChange={onGranularityChange}
        ariaLabel="Operational forecast granularity"
      />
      {granularity === 'monthly' ? (
        <ForecastOperationalMonthlyView data={data} selectedMonthId={selectedMonthId} onSelectMonth={onSelectMonth} />
      ) : (
        <ForecastOperationalWeeklyView data={data} selectedWeekId={selectedWeekId} onSelectWeek={onSelectWeek} />
      )}
    </div>
  );
}

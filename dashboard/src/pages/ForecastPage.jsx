import PageContainer from '../components/PageContainer';
import SegmentedToggle from '../components/SegmentedToggle';
import FilterDrawer from '../components/FilterDrawer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExportReportButton from '../components/ExportReportButton';
import ForecastOperationalView from './ForecastOperationalView';
import ForecastStrategicView from './ForecastStrategicView';
import { useAsync } from '../hooks/useAsync';
import { usePageFilters } from '../hooks/usePageFilters';
import { useForecastMode } from '../hooks/useForecastMode';
import { getOperationalForecast, getStrategicForecast } from '../services/forecastService';
import { forecastFilterFields, forecastFilterDefaults } from '../config/filterFields';

const MODE_OPTIONS = [
  { value: 'operational', label: 'Operational' },
  { value: 'strategic', label: 'Strategic' },
];

export default function ForecastPage() {
  const filters = usePageFilters({ fields: forecastFilterFields, defaults: forecastFilterDefaults });
  const { mode, setMode, selectedMonthId, setSelectedMonthId } = useForecastMode();

  // Fetched independently (rather than switched on `mode`) so toggling modes
  // can never briefly render one mode's view with the other mode's data shape
  // while a shared request is still in flight.
  const operational = useAsync(() => getOperationalForecast(filters.appliedFilters), [filters.appliedFilters]);
  const strategic = useAsync(() => getStrategicForecast(filters.appliedFilters), [filters.appliedFilters]);
  const { data, loading, error, retry } = mode === 'operational' ? operational : strategic;

  return (
    <PageContainer
      title="Forecast"
      actions={
        <>
          <SegmentedToggle
            options={MODE_OPTIONS}
            value={mode}
            onChange={setMode}
            ariaLabel="Forecast mode"
          />
          <ExportReportButton data={data} filename={`forecast-${mode}-report`} />
        </>
      }
    >
      <FilterDrawer
        isOpen={filters.isDrawerOpen}
        title="Forecast Filters"
        fields={filters.fields}
        draftValues={filters.draftFilters}
        onChangeField={filters.setDraftFilter}
        onClose={filters.closeDrawer}
        onApply={filters.applyFilters}
        onReset={filters.resetFilters}
      />

      {error && <ErrorState message={error} onRetry={retry} />}

      {!error && loading && (
        <>
          <LoadingSkeleton variant="cards" count={3} />
          <LoadingSkeleton variant="chart" height={320} />
          <LoadingSkeleton variant="table" count={3} />
        </>
      )}

      {!error && !loading && data && mode === 'operational' && (
        <ForecastOperationalView
          data={data}
          selectedMonthId={selectedMonthId}
          onSelectMonth={setSelectedMonthId}
        />
      )}

      {!error && !loading && data && mode === 'strategic' && <ForecastStrategicView data={data} />}
    </PageContainer>
  );
}

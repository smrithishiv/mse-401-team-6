import PageContainer from '../components/PageContainer';
import SegmentedToggle from '../components/SegmentedToggle';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExportReportButton from '../components/ExportReportButton';
import ForecastOperationalView from './ForecastOperationalView';
import ForecastStrategicView from './ForecastStrategicView';
import { useAsync } from '../hooks/useAsync';
import { useFilters } from '../context/FilterContext';
import { useForecastMode } from '../hooks/useForecastMode';
import { getOperationalForecast, getStrategicForecast } from '../services/forecastService';

const MODE_OPTIONS = [
  { value: 'operational', label: 'Operational' },
  { value: 'strategic', label: 'Strategic' },
];

export default function ForecastPage() {
  const { appliedFilters } = useFilters();
  const { mode, setMode, selectedMonthId, setSelectedMonthId } = useForecastMode();

  // Fetched independently (rather than switched on `mode`) so toggling modes
  // can never briefly render one mode's view with the other mode's data shape
  // while a shared request is still in flight.
  const operational = useAsync(() => getOperationalForecast(appliedFilters), [appliedFilters]);
  const strategic = useAsync(() => getStrategicForecast(appliedFilters), [appliedFilters]);
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

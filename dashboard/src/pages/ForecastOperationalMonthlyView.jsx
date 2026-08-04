import ConfidenceBadge from '../components/ConfidenceBadge';
import ForecastChart from '../components/ForecastChart';
import ConfidenceBand from '../components/ConfidenceBand';
import ForecastStatusBadge from '../components/ForecastStatusBadge';
import NoticeBanner from '../components/NoticeBanner';
import DemandDriverExplanationPanel from '../components/DemandDriverExplanationPanel';
import SelectableCard from '../components/SelectableCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { useAsync } from '../hooks/useAsync';
import { getDriverExplanations } from '../services/forecastService';
import { formatNumber, formatRange, formatPct } from '../utils/format';
import styles from './ForecastOperationalView.module.css';

function MonthCard({ month, selected, onSelect }) {
  const isPredicted = month.type === 'predicted';
  return (
    <SelectableCard
      className={`card ${styles.monthCard} ${selected ? styles.monthCardSelected : ''}`}
      selected={selected}
      onSelect={() => onSelect(month.id)}
    >
      <div className={styles.monthCardHeader}>
        <span className={styles.monthLabel}>
          {month.label} · {isPredicted ? 'predicted' : 'actual'}
        </span>
        {isPredicted && <ConfidenceBadge level={month.confidence} wrap />}
      </div>
      {month.subLabel && <span className={styles.subLabel}>{month.subLabel}</span>}

      <p className={styles.monthValue}>{formatNumber(month.value)}</p>

      <ForecastStatusBadge statusKey={month.statusKey} wrap />

      {month.range && (
        <p className={styles.rangeText}>
          Range {formatRange(month.range)} ({formatPct(month.range.marginPct, { signed: true })})
        </p>
      )}
    </SelectableCard>
  );
}

/**
 * @param {{ data: object }} props - operationalForecast shape from forecastService
 */
export default function ForecastOperationalMonthlyView({ data, selectedMonthId, onSelectMonth }) {
  const activeMonthId = selectedMonthId || data.defaultSelectedMonthId;
  const activeMonth = data.months.find((m) => m.id === activeMonthId);
  const firstMonth = data.months[0];
  const lastMonth = data.months[data.months.length - 1];
  const chartTitle =
    firstMonth && lastMonth && firstMonth !== lastMonth
      ? `Demand forecast — ${firstMonth.label} to ${lastMonth.label}`
      : 'Demand forecast';

  const { data: explanations, loading: explanationsLoading, error: explanationsError, retry } = useAsync(
    () => getDriverExplanations(activeMonthId),
    [activeMonthId]
  );

  return (
    <>
      <div className={styles.cardsRow}>
        {data.months.map((month) => (
          <MonthCard
            key={month.id}
            month={month}
            selected={month.id === activeMonthId}
            onSelect={onSelectMonth}
          />
        ))}
      </div>

      {data.warning && (
        <NoticeBanner
          text={data.warning}
          link={{ to: '/help/projections', label: data.warningLinkLabel }}
        />
      )}

      <section className={`card ${styles.chartCard}`}>
        <h2 className={styles.chartTitle}>{chartTitle}</h2>
        <ForecastChart
          historical={data.chart.historical}
          forecast={data.chart.forecast}
          height={300}
          selectedLabel={activeMonth?.chartLabel}
        />
        <ConfidenceBand />
      </section>

      {explanationsError && <ErrorState message={explanationsError} onRetry={retry} />}
      {!explanationsError && explanationsLoading && <LoadingSkeleton variant="block" height={160} />}
      {!explanationsError && !explanationsLoading && explanations && (
        <DemandDriverExplanationPanel periodLabel={explanations.periodLabel} groups={explanations.groups} />
      )}
    </>
  );
}

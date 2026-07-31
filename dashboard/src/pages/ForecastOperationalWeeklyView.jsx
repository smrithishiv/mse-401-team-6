import { useState } from 'react';
import ForecastChart from '../components/ForecastChart';
import ConfidenceBand from '../components/ConfidenceBand';
import NoticeBanner from '../components/NoticeBanner';
import WeekCard from '../components/WeekCard';
import WeeklyTable from '../components/WeeklyTable';
import ForecastStatusBadge from '../components/ForecastStatusBadge';
import DemandDriverExplanationPanel from '../components/DemandDriverExplanationPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { useAsync } from '../hooks/useAsync';
import { getDriverExplanations } from '../services/forecastService';
import { formatNumber } from '../utils/format';
import styles from './ForecastOperationalView.module.css';
import weeklyStyles from './ForecastOperationalWeeklyView.module.css';

function sortWeeks(weeks, sortBy, sortDir) {
  if (!sortBy) return weeks;
  const dir = sortDir === 'asc' ? 1 : -1;
  const key = { week: 'label', value: 'value', change: 'changeFromPreviousWeekPct' }[sortBy] || sortBy;

  return [...weeks].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    if (typeof av === 'string') return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });
}

/**
 * @param {{ data: import('../utils/types').WeeklyOperationalForecastResponse }} props
 */
export default function ForecastOperationalWeeklyView({ data, selectedWeekId, onSelectWeek }) {
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const activeWeekId = selectedWeekId || data.defaultSelectedWeekId;
  const activeWeek = data.weeks.find((w) => w.id === activeWeekId);

  const { data: explanations, loading: explanationsLoading, error: explanationsError, retry } = useAsync(
    () => getDriverExplanations(activeWeekId),
    [activeWeekId]
  );

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const sortedWeeks = sortWeeks(data.weeks, sortBy, sortDir);

  return (
    <>
      <div className={styles.cardsRow}>
        {data.weeks.map((week) => (
          <WeekCard key={week.id} week={week} selected={week.id === activeWeekId} onSelect={onSelectWeek} />
        ))}
      </div>

      {data.warning && (
        <NoticeBanner text={data.warning} link={{ to: '/help/projections', label: data.warningLinkLabel }} />
      )}

      <section className={`card ${styles.chartCard}`}>
        <h2 className={styles.chartTitle}>Weekly demand forecast</h2>
        <ForecastChart
          historical={data.chart.historical}
          forecast={data.chart.forecast}
          height={300}
          selectedLabel={activeWeek?.label}
        />
        <ConfidenceBand />
      </section>

      <section className={`card ${weeklyStyles.tableCard}`}>
        <h2 className={styles.chartTitle}>Weekly forecast detail</h2>
        <WeeklyTable
          weeks={sortedWeeks}
          selectedWeekId={activeWeekId}
          onSelectWeek={onSelectWeek}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      </section>

      {activeWeek?.currentAllocation !== undefined && (
        <section className={`card ${weeklyStyles.actionCard}`}>
          <h2 className={styles.chartTitle}>Recommended allocation action — {activeWeek.label}</h2>
          <div className={weeklyStyles.actionRow}>
            <div>
              <p className={weeklyStyles.actionLabel}>Current allocation</p>
              <p className={weeklyStyles.actionValue}>{formatNumber(activeWeek.currentAllocation)}</p>
            </div>
            <div>
              <p className={weeklyStyles.actionLabel}>Recommended allocation</p>
              <p className={weeklyStyles.actionValue}>{formatNumber(activeWeek.recommendedAllocation)}</p>
            </div>
            <ForecastStatusBadge statusKey={activeWeek.statusKey} />
          </div>
        </section>
      )}

      {explanationsError && <ErrorState message={explanationsError} onRetry={retry} />}
      {!explanationsError && explanationsLoading && <LoadingSkeleton variant="block" height={160} />}
      {!explanationsError && !explanationsLoading && explanations && (
        <DemandDriverExplanationPanel periodLabel={explanations.periodLabel} groups={explanations.groups} />
      )}
    </>
  );
}

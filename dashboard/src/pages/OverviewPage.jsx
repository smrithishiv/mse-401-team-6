import { useCallback } from 'react';
import { Users, Bell, TrendingUp } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import MetricCard from '../components/MetricCard';
import ConfidenceBadge from '../components/ConfidenceBadge';
import PopulationSignalBar from '../components/PopulationSignalBar';
import AgencyAlertsTable from '../components/AgencyAlertsTable';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExportReportButton from '../components/ExportReportButton';
import { useAsync } from '../hooks/useAsync';
import { useFilters } from '../context/FilterContext';
import { getOverviewSummary, getAgencyAlerts } from '../services/overviewService';
import { formatNumber, formatPct, formatRange, formatDateTime } from '../utils/format';
import styles from './OverviewPage.module.css';

async function loadOverview(filters) {
  const [summary, agencies] = await Promise.all([
    getOverviewSummary({ forceError: filters.forceError }),
    getAgencyAlerts({ forceError: filters.forceError }),
  ]);
  return { summary, agencies };
}

export default function OverviewPage() {
  const { appliedFilters } = useFilters();
  const { data, loading, error, retry } = useAsync(
    () => loadOverview(appliedFilters),
    [appliedFilters]
  );

  const handleReview = useCallback((agency) => {
    // eslint-disable-next-line no-alert
    alert(`Opening review workflow for ${agency.name} (not yet implemented).`);
  }, []);

  return (
    <PageContainer
      title="Overview"
      actions={<ExportReportButton data={data} filename="overview-report" />}
    >
      {error && <ErrorState message={error} onRetry={retry} />}

      {!error && loading && (
        <>
          <LoadingSkeleton variant="block" height={90} />
          <LoadingSkeleton variant="cards" count={3} />
          <LoadingSkeleton variant="chart" height={140} />
          <LoadingSkeleton variant="table" count={2} />
        </>
      )}

      {!error && !loading && data && (
        <>
          <section className={`card ${styles.heroCard}`}>
            <p className={styles.heroLabel}>Predicted hamper demand — {data.summary.predictedDemand.monthLabel}</p>
            <div className={styles.heroRow}>
              <h2 className={styles.heroValue}>{formatNumber(data.summary.predictedDemand.value)} people</h2>
              <ConfidenceBadge level={data.summary.predictedDemand.confidence} />
            </div>
            <p className={styles.heroSubtitle}>
              {formatPct(data.summary.predictedDemand.vsPrevPct, { signed: true })} vs July · range{' '}
              {formatRange(data.summary.predictedDemand.range)} people
            </p>
            <div className={styles.recommendation}>
              <strong>{data.summary.predictedDemand.recommendationTitle}</strong>
              <p>{data.summary.predictedDemand.recommendationHelp}</p>
            </div>
          </section>

          <section className={styles.metricGrid}>
            <MetricCard
              label="Active agencies"
              value={data.summary.activeAgencies.value}
              subtitle={data.summary.activeAgencies.subtitle}
            >
              <Users size={16} className={styles.cardIcon} aria-hidden="true" />
            </MetricCard>
            <MetricCard
              label="Allocation alerts"
              value={data.summary.allocationAlerts.value}
              subtitle={data.summary.allocationAlerts.subtitle}
            >
              <Bell size={16} className={styles.cardIcon} aria-hidden="true" />
            </MetricCard>
            <MetricCard label="Next month forecast" value={formatNumber(data.summary.nextMonthForecast.value)}>
              <ConfidenceBadge level={data.summary.nextMonthForecast.confidence} />
            </MetricCard>
          </section>

          <p className={styles.updated}>
            <TrendingUp size={14} aria-hidden="true" /> Data last updated{' '}
            <strong>{formatDateTime(data.summary.lastUpdated)}</strong>
          </p>

          <div className={styles.twoCol}>
            <section className={`card ${styles.panel}`}>
              <div className={styles.panelHeader}>
                <h2>Top population signals</h2>
                <a href="#view-all-signals">View all →</a>
              </div>
              <div className={styles.signalList}>
                {data.summary.populationSignals.map((s) => (
                  <PopulationSignalBar key={s.id} label={s.label} changePct={s.changePct} max={100} />
                ))}
              </div>
            </section>

            <section className={`card ${styles.panel}`}>
              <div className={styles.panelHeader}>
                <h2>Agencies needing review</h2>
                <a href="#view-all-agencies">View all {data.summary.activeAgencies.value} →</a>
              </div>
              <AgencyAlertsTable agencies={data.agencies} onReview={handleReview} />
            </section>
          </div>
        </>
      )}
    </PageContainer>
  );
}

import { useCallback, useState } from 'react';
import { Users, Bell, TrendingUp } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import MetricCard from '../components/MetricCard';
import ConfidenceBadge from '../components/ConfidenceBadge';
import StatusBadge from '../components/StatusBadge';
import PopulationSignalBar from '../components/PopulationSignalBar';
import AgencyAlertsTable from '../components/AgencyAlertsTable';
import CompactFilterBar from '../components/CompactFilterBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExportReportButton from '../components/ExportReportButton';
import { useAsync } from '../hooks/useAsync';
import { getOverviewSummary, getAgencyAlerts } from '../services/overviewService';
import { overviewCompactFilterFields, overviewCompactFilterDefaults } from '../config/filterFields';
import { formatNumber, formatPct, formatRange, formatDateTime } from '../utils/format';
import styles from './OverviewPage.module.css';

async function loadOverview(period, agency) {
  const [summary, agencies] = await Promise.all([
    getOverviewSummary(period),
    getAgencyAlerts({ agency }),
  ]);
  return { summary, agencies };
}

// Overview intentionally stays a stable, organization-wide summary — no full
// filter drawer here (see FilterUIContext: this page never registers one, so
// AppHeader's filter icon doesn't appear on this route). Just a compact
// reporting-period + agency selector, both backed by real mock snapshots.
export default function OverviewPage() {
  const [compactFilters, setCompactFilters] = useState(overviewCompactFilterDefaults);
  const { data, loading, error, retry } = useAsync(
    () => loadOverview(compactFilters.period, compactFilters.agency),
    [compactFilters.period, compactFilters.agency]
  );

  const handleCompactFilterChange = useCallback((id, value) => {
    setCompactFilters((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleReview = useCallback((agency) => {
    // eslint-disable-next-line no-alert
    alert(`Opening review workflow for ${agency.name} (not yet implemented).`);
  }, []);

  return (
    <PageContainer
      title="Overview"
      actions={
        <>
          <CompactFilterBar
            fields={overviewCompactFilterFields}
            values={compactFilters}
            onChange={handleCompactFilterChange}
          />
          <ExportReportButton data={data} filename="overview-report" />
        </>
      }
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
              {data.summary.predictedDemand.confidence && (
                <ConfidenceBadge level={data.summary.predictedDemand.confidence} />
              )}
              {data.summary.predictedDemand.isActual && <StatusBadge status="Actual" tone="grey" />}
            </div>
            <p className={styles.heroSubtitle}>
              {data.summary.predictedDemand.range ? (
                <>
                  {formatPct(data.summary.predictedDemand.vsPrevPct, { signed: true })} vs previous period · range{' '}
                  {formatRange(data.summary.predictedDemand.range)} people
                </>
              ) : (
                'Recorded actual figure for this reporting period.'
              )}
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

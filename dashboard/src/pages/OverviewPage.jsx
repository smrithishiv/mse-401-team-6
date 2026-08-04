import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, ArrowRight } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import ActionableMetricCard from '../components/ActionableMetricCard';
import ConfidenceBadge from '../components/ConfidenceBadge';
import StatusBadge from '../components/StatusBadge';
import InfoTooltip from '../components/InfoTooltip';
import DataFreshness from '../components/DataFreshness';
import ModelStatusNote from '../components/ModelStatusNote';
import NoticeBanner from '../components/NoticeBanner';
import OperationalSummary from '../components/OperationalSummary';
import PopulationSignalBar from '../components/PopulationSignalBar';
import AgencyAlertsTable from '../components/AgencyAlertsTable';
import CompactFilterBar from '../components/CompactFilterBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExportReportButton from '../components/ExportReportButton';
import { useAsync } from '../hooks/useAsync';
import { getOverviewSummary, getOperationalSummary } from '../services/overviewService';
import { getAgencyAlerts } from '../services/agencyService';
import { overviewCompactFilterFields, overviewCompactFilterDefaults } from '../config/filterFields';
import { formatNumber, formatPct, formatRange } from '../utils/format';
import styles from './OverviewPage.module.css';

async function loadOverview(period) {
  const [summary, agencies, operationalSummary] = await Promise.all([
    getOverviewSummary(period),
    getAgencyAlerts(),
    getOperationalSummary(period),
  ]);
  return { summary, agencies, operationalSummary };
}

// Overview intentionally stays a stable, organization-wide summary — no full
// filter drawer here (see FilterUIContext: this page never registers one, so
// AppHeader's filter icon doesn't appear on this route), and no agency
// selector: it represents the whole organization and must be useful without
// picking an agency first (use the Agencies page for that).
export default function OverviewPage() {
  const [compactFilters, setCompactFilters] = useState(overviewCompactFilterDefaults);
  const { data, loading, error, retry } = useAsync(
    () => loadOverview(compactFilters.period),
    [compactFilters.period]
  );

  const handleCompactFilterChange = (id, value) => {
    setCompactFilters((prev) => ({ ...prev, [id]: value }));
  };

  const needingReview = data?.agencies.filter((a) => a.reviewRequired) ?? [];

  return (
    <PageContainer
      title="Overview"
      actions={
        <>
          {data && <DataFreshness dataUpdated={data.summary.lastUpdated} modelLastRun={data.summary.modelLastRun} />}
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
          <LoadingSkeleton variant="block" height={90} />
          <LoadingSkeleton variant="cards" count={3} />
          <LoadingSkeleton variant="table" count={2} />
        </>
      )}

      {!error && !loading && data && (
        <>
          <OperationalSummary items={data.operationalSummary} />

          {data.summary.isSampleData && (
            <NoticeBanner
              tone="info"
              text="Showing sample forecast data — the real Holt-Winters output file wasn't found. Run modeling/baselines/export_forecast.py, then reload."
            />
          )}

          <Link to="/forecast" className={`card ${styles.heroCard}`} aria-label="Predicted hamper demand — view forecast details">
            <p className={styles.heroLabel}>Predicted hamper demand — {data.summary.predictedDemand.monthLabel}</p>
            <div className={styles.heroRow}>
              <h2 className={styles.heroValue}>{formatNumber(data.summary.predictedDemand.value)} people</h2>
              {data.summary.predictedDemand.confidence && (
                <span className={styles.heroBadgeRow}>
                  <ConfidenceBadge level={data.summary.predictedDemand.confidence} />
                </span>
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
            <ModelStatusNote model={data.summary.model} status={data.summary.modelStatus} statusNote={data.summary.modelStatusNote} />
            <span className={styles.heroLink}>
              View forecast details <ArrowRight size={14} aria-hidden="true" />
            </span>
          </Link>

          <section className={styles.metricGrid}>
            <ActionableMetricCard
              to="/agencies"
              ariaLabel={`Active agencies: ${data.summary.activeAgencies.value}. View all agencies.`}
              label="Active agencies"
              value={data.summary.activeAgencies.value}
              subtitle={data.summary.activeAgencies.subtitle}
            >
              <Users size={16} className={styles.cardIcon} aria-hidden="true" />
            </ActionableMetricCard>
            <ActionableMetricCard
              to="/agencies?status=review"
              ariaLabel={`Allocation alerts: ${data.summary.allocationAlerts.value}. Open review queue.`}
              label="Allocation alerts"
              value={data.summary.allocationAlerts.value}
              subtitle={data.summary.allocationAlerts.subtitle}
            >
              <Bell size={16} className={styles.cardIcon} aria-hidden="true" />
            </ActionableMetricCard>
            <ActionableMetricCard
              to={`/forecast?month=${data.summary.nextMonthForecast.isoMonth}`}
              ariaLabel={`Next month forecast: ${formatNumber(data.summary.nextMonthForecast.value)}. View forecast.`}
              label="Next month forecast"
              value={formatNumber(data.summary.nextMonthForecast.value)}
            >
              <ConfidenceBadge level={data.summary.nextMonthForecast.confidence} />
            </ActionableMetricCard>
          </section>

          <div className={styles.twoCol}>
            <section className={`card ${styles.panel}`}>
              <div className={styles.panelHeader}>
                <h2>
                  Top population signals{' '}
                  <InfoTooltip content="Shows which demographic groups are driving demand growth fastest, as a percentage change versus a baseline period." />
                </h2>
                <Link to="/at-risk-groups">View all →</Link>
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
                {needingReview.length > 0 && <Link to="/agencies?status=review">Open review queue →</Link>}
              </div>
              <AgencyAlertsTable agencies={data.agencies} />
            </section>
          </div>
        </>
      )}
    </PageContainer>
  );
}

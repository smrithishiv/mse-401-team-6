import PageContainer from '../components/PageContainer';
import MetricCard from '../components/MetricCard';
import RiskMap from '../components/RiskMap';
import SocioeconomicSignalCard from '../components/SocioeconomicSignalCard';
import PopulationSignalBar from '../components/PopulationSignalBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExportReportButton from '../components/ExportReportButton';
import { useAsync } from '../hooks/useAsync';
import { useFilters } from '../context/FilterContext';
import { getAtRiskGroups } from '../services/riskService';
import { formatPct } from '../utils/format';
import styles from './AtRiskGroupsPage.module.css';

export default function AtRiskGroupsPage() {
  const { appliedFilters } = useFilters();
  const { data, loading, error, retry } = useAsync(
    () => getAtRiskGroups(appliedFilters),
    [appliedFilters]
  );

  return (
    <PageContainer
      title="At-risk Groups"
      actions={<ExportReportButton data={data} filename="at-risk-groups-report" />}
    >
      {error && <ErrorState message={error} onRetry={retry} />}

      {!error && loading && (
        <>
          <LoadingSkeleton variant="cards" count={4} />
          <LoadingSkeleton variant="chart" height={420} />
          <LoadingSkeleton variant="chart" height={120} />
        </>
      )}

      {!error && !loading && data && (
        <>
          <section className={styles.metricGrid}>
            <MetricCard label="High-risk groups" value={data.metrics.highRiskGroups.value} subtitle={data.metrics.highRiskGroups.subtitle} />
            <MetricCard label="High-risk areas" value={data.metrics.highRiskAreas.value} subtitle={data.metrics.highRiskAreas.subtitle} />
            <MetricCard
              label="Average risk index"
              value={data.metrics.avgRiskIndex.value}
              trend={{ direction: 'up', label: `from ${data.metrics.avgRiskIndex.prevValue}`, tone: 'negative' }}
            />
            <MetricCard
              label="CPI food index"
              value={formatPct(data.metrics.cpiFoodIndex.valuePct, { signed: true })}
              subtitle={data.metrics.cpiFoodIndex.subtitle}
            />
          </section>

          <div className={styles.twoCol}>
            <section className={`card ${styles.mapPanel}`}>
              <h2 className={styles.panelTitle}>Food Insecurity Risk – Waterloo Region</h2>
              <RiskMap regions={data.regions} legend={data.legend} />
            </section>

            <section className={styles.signalsPanel}>
              <h2 className={styles.panelTitle}>Socioeconomic signals</h2>
              <div className={styles.signalGrid}>
                {data.signals.map((signal) => (
                  <SocioeconomicSignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            </section>
          </div>

          <section className={`card ${styles.populationPanel}`}>
            <h2 className={styles.panelTitle}>Top population signals</h2>
            <div className={styles.populationGrid}>
              {data.populationSignals.map((s) => (
                <PopulationSignalBar key={s.id} label={s.label} changePct={s.changePct} max={100} />
              ))}
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}

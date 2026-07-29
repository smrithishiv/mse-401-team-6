import PageContainer from '../components/PageContainer';
import MetricCard from '../components/MetricCard';
import RiskMap from '../components/RiskMap';
import SocioeconomicSignalCard from '../components/SocioeconomicSignalCard';
import PopulationSignalBar from '../components/PopulationSignalBar';
import FilterDrawer from '../components/FilterDrawer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExportReportButton from '../components/ExportReportButton';
import { useAsync } from '../hooks/useAsync';
import { usePageFilters } from '../hooks/usePageFilters';
import { getAtRiskGroups } from '../services/riskService';
import { atRiskFilterFields, atRiskFilterDefaults } from '../config/filterFields';
import { formatPct } from '../utils/format';
import styles from './AtRiskGroupsPage.module.css';

export default function AtRiskGroupsPage() {
  const filters = usePageFilters({ fields: atRiskFilterFields, defaults: atRiskFilterDefaults });
  const { data, loading, error, retry } = useAsync(
    () => getAtRiskGroups(filters.appliedFilters),
    [filters.appliedFilters]
  );

  return (
    <PageContainer
      title="At-risk Groups"
      actions={<ExportReportButton data={data} filename="at-risk-groups-report" />}
    >
      <FilterDrawer
        isOpen={filters.isDrawerOpen}
        title="At-risk Groups Filters"
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
              {data.regions.length > 0 ? (
                <RiskMap regions={data.regions} legend={data.legend} />
              ) : (
                <p className={styles.emptyMap}>No regions match the selected filters.</p>
              )}
            </section>

            <section className={styles.signalsPanel}>
              <h2 className={styles.panelTitle}>Socioeconomic signals</h2>
              <div className={styles.signalGrid}>
                {data.signals.length > 0 ? (
                  data.signals.map((signal) => <SocioeconomicSignalCard key={signal.id} signal={signal} />)
                ) : (
                  <p className={styles.emptyMap}>No indicators match the selected filters.</p>
                )}
              </div>
            </section>
          </div>

          <section className={`card ${styles.populationPanel}`}>
            <h2 className={styles.panelTitle}>Top population signals</h2>
            <div className={styles.populationGrid}>
              {data.populationSignals.length > 0 ? (
                data.populationSignals.map((s) => (
                  <PopulationSignalBar key={s.id} label={s.label} changePct={s.changePct} max={100} />
                ))
              ) : (
                <p className={styles.emptyMap}>No population groups match the selected filters.</p>
              )}
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}

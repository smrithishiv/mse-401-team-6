import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import MetricCard from '../components/MetricCard';
import ExpandableSummaryCard from '../components/ExpandableSummaryCard';
import RiskMap from '../components/RiskMap';
import SocioeconomicSignalCard from '../components/SocioeconomicSignalCard';
import PopulationSignalBar from '../components/PopulationSignalBar';
import StatusBadge from '../components/StatusBadge';
import GeographyLevelBadge from '../components/GeographyLevelBadge';
import InfoTooltip from '../components/InfoTooltip';
import FilterDrawer from '../components/FilterDrawer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExportReportButton from '../components/ExportReportButton';
import { useAsync } from '../hooks/useAsync';
import { usePageFilters } from '../hooks/usePageFilters';
import { getAtRiskGroups } from '../services/riskService';
import { atRiskFilterFields, atRiskFilterDefaults } from '../config/filterFields';
import { formatPct, formatNumber } from '../utils/format';
import styles from './AtRiskGroupsPage.module.css';

function riskIndexTooltipContent(meta) {
  return (
    <>
      <p>{meta.whatItMeasures}</p>
      <p>Scale: {meta.scale}</p>
      <p>{meta.higherLowerMeaning}</p>
      <p>Contributing indicators: {meta.contributingIndicators.join(', ')}</p>
      <p>{meta.recalculationCadence}</p>
    </>
  );
}

const FOOD_INFLATION_TOOLTIP =
  "Food price inflation tracks the year-over-year change in the cost of a standard grocery basket, based on Statistics Canada's Consumer Price Index for food. Rising food prices add direct pressure to already-strained household budgets.";

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatRegionalMetricValue(metric) {
  if (metric.value === null || metric.value === undefined) return 'Not available';
  if (metric.id === 'living-wage-gap') return `$${metric.value.toFixed(2)}`;
  if (metric.id === 'social-assistance-cases') return formatNumber(metric.value);
  return `${metric.value}${metric.unit}`;
}

export default function AtRiskGroupsPage() {
  const filters = usePageFilters({ fields: atRiskFilterFields, defaults: atRiskFilterDefaults });
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRegion = searchParams.get('region');

  const queryFilters = useMemo(
    () => ({ ...filters.appliedFilters, region: selectedRegion }),
    [filters.appliedFilters, selectedRegion]
  );

  const { data, loading, error, retry } = useAsync(() => getAtRiskGroups(queryFilters), [queryFilters]);

  function selectRegion(regionId) {
    const next = new URLSearchParams(searchParams);
    if (regionId) next.set('region', regionId);
    else next.delete('region');
    setSearchParams(next);
  }

  function selectGroup(group) {
    filters.applyFiltersWith({ ...filters.appliedFilters, populationGroup: group.id });
  }

  const regionName = data?.selectedRegionName || null;
  const pageTitle = regionName ? `At-risk Groups — ${regionName}` : 'At-risk Groups';
  const riskIndexLabel = regionName ? `${regionName} risk index` : 'Waterloo Region average risk index';
  const contextLabel = regionName || 'Waterloo Region';

  return (
    <PageContainer
      title={pageTitle}
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
          {regionName && (
            <div className={styles.selectionBar} role="status">
              <span>
                Showing data for <strong>{regionName}</strong>
              </span>
              <button type="button" className={styles.clearSelectionButton} onClick={() => selectRegion(null)}>
                Clear selection
              </button>
            </div>
          )}

          <section className={styles.metricGrid}>
            <ExpandableSummaryCard
              label="High-risk groups"
              value={data.metrics.highRiskGroups.value}
              subtitle={data.metrics.highRiskGroups.subtitle}
              panelTitle="High-risk groups"
              items={data.highRiskGroups}
              emptyMessage="No high-risk groups match the current selection."
              renderItem={(group) => (
                <div className={styles.panelRow}>
                  <div className={styles.panelRowHeader}>
                    <span className={styles.panelRowName}>{group.name}</span>
                    <StatusBadge status={group.riskLevel} />
                  </div>
                  <p className={styles.panelRowMeta}>
                    {group.changeFromPrevious ? `${group.changeFromPrevious} vs. previous period` : 'No prior-period comparison available'}
                  </p>
                  <p className={styles.panelRowMeta}>Primary signal: {group.primarySignal}</p>
                  <button type="button" className={styles.panelRowAction} onClick={() => selectGroup(group)}>
                    Filter page to this group
                  </button>
                </div>
              )}
            />

            <ExpandableSummaryCard
              label="High-risk areas"
              value={data.metrics.highRiskAreas.value}
              subtitle={data.metrics.highRiskAreas.subtitle}
              panelTitle="High-risk areas"
              items={data.highRiskAreas}
              emptyMessage="No high-risk areas match the current selection."
              renderItem={(area) => (
                <div className={styles.panelRow}>
                  <div className={styles.panelRowHeader}>
                    <span className={styles.panelRowName}>{area.name}</span>
                    <StatusBadge status={area.riskLevel} />
                  </div>
                  <p className={styles.panelRowMeta}>Risk index: {area.riskIndex}</p>
                  <p className={styles.panelRowMeta}>
                    {area.changeFromPrevious ? `${area.changeFromPrevious} vs. previous period` : 'No prior-period comparison available'}
                  </p>
                  <button type="button" className={styles.panelRowAction} onClick={() => selectRegion(area.id)}>
                    Select on map
                  </button>
                </div>
              )}
            />

            <MetricCard
              label={riskIndexLabel}
              value={data.metrics.avgRiskIndex.value}
              trend={{
                direction: 'up',
                label: `from ${data.metrics.avgRiskIndex.prevValue ?? '—'}`,
                tone: 'negative',
              }}
            >
              <InfoTooltip label="About the risk index" wide content={riskIndexTooltipContent(data.riskIndexMeta)} />
            </MetricCard>

            <MetricCard label="Food price inflation" value={formatPct(data.cpiFood.valuePct, { signed: true })}>
              <p className={styles.cardMeta}>
                {data.cpiFood.reportingPeriod}, {data.cpiFood.comparisonType.toLowerCase()}
              </p>
              <p className={styles.cardMeta}>{data.cpiFood.cadence}</p>
              {data.cpiFood.source && <p className={styles.cardMeta}>{data.cpiFood.source}</p>}
              <InfoTooltip label="About food price inflation" content={FOOD_INFLATION_TOOLTIP} />
            </MetricCard>
          </section>

          <div className={styles.twoCol}>
            <section className={`card ${styles.mapPanel}`}>
              <h2 className={styles.panelTitle}>Food Insecurity Risk – Waterloo Region</h2>
              {data.regions.length > 0 ? (
                <RiskMap regions={data.regions} legend={data.legend} selectedId={selectedRegion} onSelectRegion={selectRegion} />
              ) : (
                <p className={styles.emptyMap}>No regions match the selected filters.</p>
              )}
            </section>

            <section className={styles.signalsPanel}>
              <h2 className={styles.panelTitle}>Socioeconomic signals — {contextLabel}</h2>
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
            <h2 className={styles.panelTitle}>Top population signals — {contextLabel}</h2>
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

          <section className={`card ${styles.regionalDetailPanel}`}>
            <h2 className={styles.panelTitle}>Regional detail metrics — {contextLabel}</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Geographic level</th>
                    <th>Reporting period</th>
                  </tr>
                </thead>
                <tbody>
                  {data.regionalMetrics.map((metric) => (
                    <tr key={metric.id}>
                      <td>{metric.label}</td>
                      <td>{formatRegionalMetricValue(metric)}</td>
                      <td>
                        <StatusBadge status={capitalize(metric.status)} />
                      </td>
                      <td>
                        <GeographyLevelBadge level={metric.geographyLevel} />
                      </td>
                      <td>{metric.reportingPeriod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}

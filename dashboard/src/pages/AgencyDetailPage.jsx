import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PageContainer from '../components/PageContainer';
import AgencyDetailHeader from '../components/AgencyDetailHeader';
import MetricCard from '../components/MetricCard';
import ConfidenceBadge from '../components/ConfidenceBadge';
import StatusBadge from '../components/StatusBadge';
import AgencyStatusBadge from '../components/AgencyStatusBadge';
import InfoTooltip from '../components/InfoTooltip';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { useAsync } from '../hooks/useAsync';
import { getAgencyById } from '../services/agencyService';
import { formatNumber, formatDateTime } from '../utils/format';
import styles from './AgencyDetailPage.module.css';

const ALLOCATION_TONE = { 'on-track': 'green', review: 'yellow' };
const ALLOCATION_LABEL = { 'on-track': 'On track', review: 'Needs review' };

export default function AgencyDetailPage() {
  const { agencyId } = useParams();
  const { data: agency, loading, error, retry } = useAsync(() => getAgencyById(agencyId), [agencyId]);

  const weeklyChartData = agency?.weeklyDemand.map((value, i) => ({ week: `Week ${i + 1}`, value })) ?? [];

  return (
    <PageContainer>
      {error && <ErrorState message={error} onRetry={retry} />}

      {!error && loading && (
        <>
          <LoadingSkeleton variant="block" height={70} />
          <LoadingSkeleton variant="cards" count={4} />
          <LoadingSkeleton variant="chart" height={240} />
        </>
      )}

      {!error && !loading && !agency && (
        <div className={`card ${styles.notFound}`}>
          <p>We couldn&rsquo;t find an agency with id &ldquo;{agencyId}&rdquo;.</p>
          <Link to="/agencies">Back to Agencies</Link>
        </div>
      )}

      {!error && !loading && agency && (
        <>
          <AgencyDetailHeader agency={agency} />

          <section className={styles.metricGrid}>
            <MetricCard label="Current demand" value={formatNumber(agency.currentDemand)} />
            <MetricCard label="Forecasted demand" value={formatNumber(agency.forecastedDemand)}>
              <span
                className={
                  agency.forecastDifferencePercent > 0
                    ? styles.diffUp
                    : agency.forecastDifferencePercent < 0
                      ? styles.diffDown
                      : styles.diffFlat
                }
              >
                {agency.forecastDifferencePercent > 0 ? '+' : ''}
                {agency.forecastDifferencePercent}% vs current
              </span>
            </MetricCard>
            <MetricCard label="Forecast confidence" value={<ConfidenceBadge level={agency.confidence} />} />
            <MetricCard label="Current allocation" value={formatNumber(agency.currentAllocation)} />
            <MetricCard label="Recommended allocation" value={formatNumber(agency.recommendedAllocation)}>
              <StatusBadge status={ALLOCATION_LABEL[agency.allocationStatus]} tone={ALLOCATION_TONE[agency.allocationStatus]} />
            </MetricCard>
          </section>

          <section className={`card ${styles.chartCard}`}>
            <div className={styles.chartTitleRow}>
              <h2 className={styles.sectionTitle}>4-week trend</h2>
              <InfoTooltip content="Shows the agency's recorded hamper demand over the previous four reporting weeks. Rising bars indicate increasing demand." />
            </div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-color)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Bar dataKey="value" fill="var(--bb-blue)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={`card ${styles.panel}`}>
            <h2 className={styles.sectionTitle}>Recent alerts</h2>
            {agency.reasonFlagged ? (
              <p className={styles.alertRow}>
                <AgencyStatusBadge status={agency.status} withTooltip={false} />
                {agency.reasonFlagged}
              </p>
            ) : (
              <p className={styles.noAlerts}>No recent alerts for this agency.</p>
            )}
          </section>

          <section className={`card ${styles.panel}`}>
            <h2 className={styles.sectionTitle}>Recommended action</h2>
            <p className={styles.recommendedAction}>{agency.recommendedAction}</p>
            <p className={styles.lastUpdated}>Last updated {formatDateTime(agency.lastUpdated)}</p>
          </section>
        </>
      )}
    </PageContainer>
  );
}

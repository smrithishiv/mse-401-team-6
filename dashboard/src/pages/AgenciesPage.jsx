import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import AgencySearch from '../components/AgencySearch';
import AgencyFilters from '../components/AgencyFilters';
import AgencyTable from '../components/AgencyTable';
import AgencyMobileCard from '../components/AgencyMobileCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import DataFreshness from '../components/DataFreshness';
import { useAsync } from '../hooks/useAsync';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getAgencies, getAgencySummary, applyFilters, sortAgencies } from '../services/agencyService';
import { agencyFilterFields } from '../config/filterFields';
import styles from './AgenciesPage.module.css';

const PAGE_SIZE_OPTIONS = ['10', '25', '50', 'all'];

async function loadAgenciesPageData() {
  const [list, summary] = await Promise.all([getAgencies({}), getAgencySummary()]);
  return { list, summary };
}

export default function AgenciesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 780px)');
  const { data, loading, error, retry } = useAsync(loadAgenciesPageData, []);

  // `status=review` is the shorthand KPI cards / Operational Summary link
  // with (e.g. Allocation Alerts → /agencies?status=review) — it isn't a
  // real status value, it maps onto the Review Required filter.
  const rawStatus = searchParams.get('status') || 'all';
  const isReviewShorthand = rawStatus === 'review';

  const search = searchParams.get('search') || '';
  const status = isReviewShorthand ? 'all' : rawStatus;
  const city = searchParams.get('city') || 'all';
  const reviewRequired = isReviewShorthand ? 'true' : searchParams.get('reviewRequired') || 'all';
  const trend = searchParams.get('trend') || 'all';
  const sortBy = searchParams.get('sortBy') || 'name';
  const sortDir = searchParams.get('sortDir') || 'asc';
  const page = Number(searchParams.get('page') || 1);
  const pageSize = searchParams.get('pageSize') || '25';

  const updateParams = (updates, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 'all') {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    if (!data?.list) return [];
    const withFilters = applyFilters(data.list, { search, status, city, reviewRequired, trend });
    return sortAgencies(withFilters, sortBy, sortDir);
  }, [data, search, status, city, reviewRequired, trend, sortBy, sortDir]);

  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filtered.length / Number(pageSize)));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paged =
    pageSize === 'all' ? filtered : filtered.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

  const handleSort = (key) => {
    if (sortBy === key) {
      updateParams({ sortDir: sortDir === 'asc' ? 'desc' : 'asc' }, { resetPage: false });
    } else {
      updateParams({ sortBy: key, sortDir: 'asc' }, { resetPage: false });
    }
  };

  const filterValues = { status, city, reviewRequired, trend };

  return (
    <PageContainer>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Agencies</h1>
          <p className={styles.subtitle}>
            Monitor demand, allocation status, and review requirements across all active agencies.
          </p>
        </div>
        {data?.summary && (
          <div className={styles.headerStats}>
            <span>
              <strong>{data.summary.total}</strong> active agencies
            </span>
            <span>
              <strong>{data.summary.needingReview}</strong> need review
            </span>
            <DataFreshness dataUpdated={data.summary.lastUpdated} />
          </div>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={retry} />}

      {!error && loading && (
        <>
          <LoadingSkeleton variant="block" height={54} />
          <LoadingSkeleton variant="table" count={6} />
        </>
      )}

      {!error && !loading && data && (
        <>
          <AgencySearch value={search} onChange={(v) => updateParams({ search: v })} resultCount={filtered.length} />
          <AgencyFilters fields={agencyFilterFields} values={filterValues} onChange={(id, v) => updateParams({ [id]: v })} />

          {isMobile ? (
            <div className={styles.mobileList}>
              {paged.length === 0 && <p className={styles.empty}>No agencies match your search or filters.</p>}
              {paged.map((agency) => (
                <AgencyMobileCard key={agency.id} agency={agency} />
              ))}
            </div>
          ) : (
            <div className="card">
              <AgencyTable agencies={paged} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
            </div>
          )}

          {filtered.length > 0 && (
            <div className={styles.pagination}>
              <label className={styles.pageSizeLabel}>
                Rows per page
                <select
                  value={pageSize}
                  onChange={(e) => updateParams({ pageSize: e.target.value })}
                  className={styles.pageSizeSelect}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size === 'all' ? 'All' : size}
                    </option>
                  ))}
                </select>
              </label>

              {pageSize !== 'all' && (
                <div className={styles.pageControls}>
                  <button
                    type="button"
                    className={styles.pageButton}
                    onClick={() => updateParams({ page: currentPage - 1 }, { resetPage: false })}
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className={styles.pageStatus}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className={styles.pageButton}
                    onClick={() => updateParams({ page: currentPage + 1 }, { resetPage: false })}
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}

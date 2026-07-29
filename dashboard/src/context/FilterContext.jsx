import { createContext, useContext, useMemo, useState, useCallback } from 'react';

export const DEFAULT_FILTERS = {
  from: '2026-07-01',
  to: '2026-12-31',
  gender: 'all',
  ageGroup: 'all',
  income: 'all',
};

const FilterContext = createContext(null);

/**
 * Holds both the "applied" filters (what services/pages actually query with)
 * and a "draft" copy edited inside the FilterDrawer. Draft changes only take
 * effect once the user clicks Apply, so charts/cards don't refetch on every
 * keystroke or dropdown change.
 */
export function FilterProvider({ children }) {
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => {
    setDraftFilters(appliedFilters);
    setIsDrawerOpen(true);
  }, [appliedFilters]);

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const setDraftFilter = useCallback((key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setIsDrawerOpen(false);
  }, [draftFilters]);

  const resetFilters = useCallback(() => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }, []);

  const activeFilterCount = useMemo(
    () => Object.entries(appliedFilters).filter(([key, value]) => {
      if (key === 'from' || key === 'to') return value !== DEFAULT_FILTERS[key];
      return value !== 'all';
    }).length,
    [appliedFilters]
  );

  const value = useMemo(
    () => ({
      appliedFilters,
      draftFilters,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      setDraftFilter,
      applyFilters,
      resetFilters,
      activeFilterCount,
    }),
    [appliedFilters, draftFilters, isDrawerOpen, openDrawer, closeDrawer, setDraftFilter, applyFilters, resetFilters, activeFilterCount]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within a FilterProvider');
  return ctx;
}

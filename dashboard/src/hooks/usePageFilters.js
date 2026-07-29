import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFilterUI } from '../context/FilterUIContext';

/**
 * Owns filter state for a single page: draft values edited in that page's
 * FilterDrawer, applied values services actually query with, and drawer
 * open/close. State is local (useState) to whichever page instantiates
 * this hook — nothing here is shared across routes, so filters never leak
 * from Forecast into At-risk Groups or vice versa, and reset naturally when
 * a page unmounts.
 *
 * Also registers this page's drawer trigger with FilterUIContext so
 * AppHeader's filter button opens *this* page's drawer, and unregisters on
 * unmount so the button disappears on pages that don't call this hook.
 *
 * @param {{ fields: Array, defaults: Object }} config
 */
export function usePageFilters({ fields, defaults }) {
  const [appliedFilters, setAppliedFilters] = useState(defaults);
  const [draftFilters, setDraftFilters] = useState(defaults);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { registerPageFilterUI, clearPageFilterUI } = useFilterUI();

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
    setDraftFilters(defaults);
    setAppliedFilters(defaults);
  }, [defaults]);

  const activeFilterCount = useMemo(
    () => Object.entries(appliedFilters).filter(([key, value]) => value !== defaults[key]).length,
    [appliedFilters, defaults]
  );

  useEffect(() => {
    registerPageFilterUI({ hasFilters: true, activeCount: activeFilterCount, openDrawer });
    return clearPageFilterUI;
  }, [activeFilterCount, openDrawer, registerPageFilterUI, clearPageFilterUI]);

  return {
    fields,
    appliedFilters,
    draftFilters,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    setDraftFilter,
    applyFilters,
    resetFilters,
    activeFilterCount,
  };
}

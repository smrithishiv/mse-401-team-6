import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const FilterUIContext = createContext(null);

const NONE = { hasFilters: false, activeCount: 0, openDrawer: () => {} };

/**
 * Lets whichever page is currently mounted register its own filter-drawer
 * trigger (or nothing at all, e.g. Overview) so AppHeader can show/hide the
 * filter button and wire it up — without owning any filter *values* itself.
 *
 * This is deliberately separate from filter state: filter values live in
 * each page via usePageFilters (page-local, never shared), while this
 * context only carries the tiny bit of UI wiring the header needs. Because
 * registration happens in an effect that cleans up on unmount, navigating
 * to a route that doesn't call usePageFilters (Overview) automatically
 * resets this back to `NONE` — no filter icon leaks across pages.
 */
export function FilterUIProvider({ children }) {
  const [pageFilterUI, setPageFilterUI] = useState(NONE);

  const registerPageFilterUI = useCallback((ui) => setPageFilterUI(ui), []);
  const clearPageFilterUI = useCallback(() => setPageFilterUI(NONE), []);

  const value = useMemo(
    () => ({ pageFilterUI, registerPageFilterUI, clearPageFilterUI }),
    [pageFilterUI, registerPageFilterUI, clearPageFilterUI]
  );

  return <FilterUIContext.Provider value={value}>{children}</FilterUIContext.Provider>;
}

export function useFilterUI() {
  const ctx = useContext(FilterUIContext);
  if (!ctx) throw new Error('useFilterUI must be used within a FilterUIProvider');
  return ctx;
}

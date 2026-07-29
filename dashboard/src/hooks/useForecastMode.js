import { useState } from 'react';

/**
 * Lightweight hook holding Forecast-page-local UI state: which mode
 * (operational vs strategic) is active, and which operational month card is
 * selected. Kept separate from the Forecast page's filters (usePageFilters)
 * since this is view-mode state, not a query parameter.
 */
export function useForecastMode(defaultMode = 'operational', defaultMonthId = null) {
  const [mode, setMode] = useState(defaultMode);
  const [selectedMonthId, setSelectedMonthId] = useState(defaultMonthId);

  return { mode, setMode, selectedMonthId, setSelectedMonthId };
}

import { useState } from 'react';

/**
 * Lightweight hook holding Forecast-page-local UI state: which mode
 * (operational vs strategic) is active, and which operational month card is
 * selected. Kept out of FilterContext since it doesn't need to be shared
 * outside the Forecast page.
 */
export function useForecastMode(defaultMode = 'operational', defaultMonthId = null) {
  const [mode, setMode] = useState(defaultMode);
  const [selectedMonthId, setSelectedMonthId] = useState(defaultMonthId);

  return { mode, setMode, selectedMonthId, setSelectedMonthId };
}

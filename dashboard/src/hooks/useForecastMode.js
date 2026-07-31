import { useState } from 'react';

/**
 * Lightweight hook holding Forecast-page-local UI state: which mode
 * (operational vs strategic) is active, which operational granularity
 * (monthly vs weekly) is active, which month/week card is selected, and
 * which strategic horizon is selected. Kept separate from the Forecast
 * page's filters (usePageFilters) since this is view-mode state, not a
 * query parameter.
 */
export function useForecastMode(
  defaultMode = 'operational',
  defaultMonthId = null,
  defaultGranularity = 'monthly',
  defaultWeekId = null,
  defaultHorizonYears = 5
) {
  const [mode, setMode] = useState(defaultMode);
  const [selectedMonthId, setSelectedMonthId] = useState(defaultMonthId);
  const [granularity, setGranularity] = useState(defaultGranularity);
  const [selectedWeekId, setSelectedWeekId] = useState(defaultWeekId);
  const [horizonYears, setHorizonYears] = useState(defaultHorizonYears);

  return {
    mode,
    setMode,
    selectedMonthId,
    setSelectedMonthId,
    granularity,
    setGranularity,
    selectedWeekId,
    setSelectedWeekId,
    horizonYears,
    setHorizonYears,
  };
}

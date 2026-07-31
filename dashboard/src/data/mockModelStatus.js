/**
 * Forecast freshness metadata, kept as two clearly separate entries so
 * operational and strategic "last updated" facts are never collapsed into
 * one ambiguous card (see StrategicFreshnessCard / DataFreshness).
 */
export const modelStatus = {
  operationalForecast: {
    generatedAt: '2026-07-01T06:00:00',
    dataThrough: '2026-06-30',
    refreshCadence: 'weekly',
    nextScheduledRefresh: '2026-07-08T06:00:00',
  },
  strategicForecast: {
    generatedAt: '2026-06-30T23:45:00',
    dataThrough: '2026-06-30',
    refreshCadence: 'quarterly',
    nextScheduledRefresh: '2026-09-30T23:45:00',
  },
};

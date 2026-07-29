/**
 * Merges a historical series and a forecast series (which share a connecting
 * point) into one row-per-label dataset suitable for a single ComposedChart,
 * so the historical line renders solid and the forecast line renders dashed
 * from the same axis.
 */
export function mergeHistoricalAndForecast(historical = [], forecast = []) {
  const rows = new Map();

  historical.forEach((point) => {
    rows.set(point.label, { label: point.label, historical: point.value });
  });

  forecast.forEach((point) => {
    const existing = rows.get(point.label) || { label: point.label };
    rows.set(point.label, {
      ...existing,
      forecast: point.value,
      low: point.low,
      high: point.high,
    });
  });

  return Array.from(rows.values());
}

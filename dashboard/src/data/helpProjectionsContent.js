/**
 * Placeholder content for the /help/projections chapter. Sections are
 * intentionally high-level — the forecasting model's final methodology is
 * not yet finalized, so this documents what the chapter will eventually
 * cover rather than inventing specifics.
 */
export const PROJECTIONS_NOTICE =
  'Detailed methodology will be added after the forecasting model is finalized.';

export const PROJECTIONS_SECTIONS = [
  {
    id: 'data-used',
    title: 'Data used by the model',
    paragraphs: [
      'This section will describe the historical hamper-visit records and external indicators the model is trained on, once the data pipeline is finalized.',
    ],
  },
  {
    id: 'generation-process',
    title: 'Forecast-generation process',
    paragraphs: [
      'This section will describe, at a high level, how the model turns historical and current data into a forecast.',
    ],
  },
  {
    id: 'external-indicators',
    title: 'External indicators',
    paragraphs: [
      'This section will list the external socioeconomic indicators (e.g. employment, housing, income) that inform the forecast.',
    ],
  },
  {
    id: 'forecast-ranges',
    title: 'Forecast ranges',
    paragraphs: [
      'This section will explain how the low–high forecast range shown on charts and cards is calculated.',
    ],
  },
  {
    id: 'confidence-levels',
    title: 'Confidence levels',
    paragraphs: [
      'This section will explain what determines whether a forecast is shown as high or low confidence.',
    ],
  },
  {
    id: 'uncertainty-over-time',
    title: 'Why uncertainty increases over time',
    paragraphs: [
      'This section will explain why forecasts further in the future carry wider ranges and lower confidence than near-term forecasts.',
    ],
  },
  {
    id: 'operational-vs-strategic',
    title: 'Operational versus strategic projections',
    paragraphs: [
      'This section will explain how operational forecasts (weeks/months ahead) differ in purpose and methodology from strategic forecasts (years ahead).',
    ],
  },
  {
    id: 'refresh-schedules',
    title: 'Model refresh schedules',
    paragraphs: [
      'This section will describe how often operational and strategic forecasts are recalculated.',
    ],
  },
  {
    id: 'known-limitations',
    title: 'Known limitations',
    paragraphs: [
      'This section will document known limitations of the current model, so forecasts are not over-relied upon in situations they were not designed for.',
    ],
  },
];

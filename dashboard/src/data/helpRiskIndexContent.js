/**
 * Placeholder content for the /help/risk-index chapter. The risk index's
 * final scale and weighting are not yet finalized, so this documents what
 * the chapter will eventually cover rather than inventing a scale.
 */
export const RISK_INDEX_NOTICE =
  'The risk index scale and weighting will be documented here once the risk methodology is finalized.';

export const RISK_INDEX_SECTIONS = [
  {
    id: 'what-it-measures',
    title: 'What the risk index measures',
    paragraphs: [
      'The average risk index is a composite indicator of food-insecurity risk for an area, combining its regional risk tier (Low / Medium / Med-High / High) with local socioeconomic signals such as employment, housing, and income pressure.',
    ],
  },
  {
    id: 'scale',
    title: 'Scale',
    paragraphs: [
      'The final numeric scale is still being defined alongside the risk methodology and is not documented yet. This section will be updated with the confirmed scale, and what counts as low versus high on it, once that work is complete.',
    ],
  },
  {
    id: 'contributing-indicators',
    title: 'Contributing indicators',
    paragraphs: [
      'The index currently draws on unemployment rate, rental vacancy rate, living wage gap, social assistance caseload, and food price inflation (CPI). The relative weight given to each indicator will be documented here once finalized.',
    ],
  },
  {
    id: 'recalculation-schedule',
    title: 'Recalculation schedule',
    paragraphs: [
      'The index is recalculated monthly, alongside each reporting period refresh.',
    ],
  },
  {
    id: 'regional-vs-area',
    title: 'Region-wide versus area-specific values',
    paragraphs: [
      'When no area is selected, the index reflects a Waterloo Region-wide average. Selecting an area on the map (or from the High-risk Areas summary card) recalculates the index for that specific area instead.',
    ],
  },
];

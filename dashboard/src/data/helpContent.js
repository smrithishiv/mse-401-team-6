/**
 * Static content for the /help page, organized as data rather than inline
 * JSX so it can later be swapped for a CMS/backend response without
 * touching HelpPage or DocumentationSection.
 */
export const HELP_SECTIONS = [
  {
    id: 'overview',
    title: '1. Overview',
    paragraphs: [
      'The Overview page summarizes the whole organization: the current month’s predicted hamper demand, active agency count, allocation alerts, and an auto-generated Operational Summary that flags anything needing attention.',
      'It does not require selecting an agency first — for a specific agency, use the Agencies page.',
    ],
  },
  {
    id: 'forecast-values',
    title: '2. Forecast values',
    paragraphs: [
      'Forecast values are the model’s predicted hamper demand for a given period, shown alongside a range and a confidence level. Operational forecasts cover the next 1–2 months; Strategic forecasts project 5 years forward.',
    ],
  },
  {
    id: 'actual-vs-predicted',
    title: '3. Actual versus predicted demand',
    paragraphs: [
      '"Actual" figures are recorded hamper-visit counts for a period that has already closed — they are not a forecast and carry no confidence range.',
      '"Predicted" figures are the model’s forward-looking estimate for a period that hasn’t happened yet.',
    ],
  },
  {
    id: 'forecast-ranges',
    title: '4. Forecast ranges',
    paragraphs: [
      'A forecast range is the band the model expects actual demand to fall within — shown as a shaded region on charts and as a low–high figure on forecast cards. Narrower ranges indicate a more confident prediction.',
    ],
  },
  {
    id: 'confidence-levels',
    title: '5. Confidence levels',
    paragraphs: [
      'High confidence means the forecast range is within ±5% of the predicted number, and the forecast can generally be used without manual confirmation.',
      'Low confidence means the range is wider than that — usually because one or more model inputs are projected forward rather than measured — and allocation should be confirmed manually before distributing.',
    ],
  },
  {
    id: 'allocation-recommendations',
    title: '6. Allocation recommendations',
    paragraphs: [
      'Allocation recommendations translate a forecast’s confidence into a concrete next step: "Proceed with current allocation" for high-confidence forecasts, or "Confirm allocation manually before distributing" when confidence is low.',
    ],
  },
  {
    id: 'agency-statuses',
    title: '7. Agency statuses',
    paragraphs: [
      'Normal: recorded and forecasted demand are within the expected range.',
      'Watch: demand is trending above expected levels; being monitored, no action required yet.',
      'High demand: demand is meaningfully above the expected range — allocation should be reviewed.',
      'Critical: demand is far above the expected range, often paired with low forecast confidence — needs manual confirmation.',
    ],
  },
  {
    id: 'four-week-trends',
    title: '8. Four-week trends',
    paragraphs: [
      'The four-week trend shows an agency’s recorded hamper demand over the previous four reporting weeks as a small bar chart. Rising bars indicate increasing demand; falling bars indicate decreasing demand.',
    ],
  },
  {
    id: 'population-signals',
    title: '9. Population signals',
    paragraphs: [
      'Population signals highlight which demographic groups are driving demand growth fastest (e.g. newcomer families, single-parent households, seniors), shown as a percentage change versus a baseline period.',
    ],
  },
  {
    id: 'risk-indicators',
    title: '10. Risk indicators',
    paragraphs: [
      'The At-risk Groups page combines regional risk levels (Low / Medium / Med-High / High) with socioeconomic signals — unemployment, rental vacancy, living wage gap, and social assistance caseload — to flag areas of elevated food-insecurity risk.',
    ],
  },
  {
    id: 'data-update-schedule',
    title: '11. Data update schedule',
    paragraphs: [
      'Hamper-visit and agency data is refreshed daily. The "Data updated" timestamp shown in each page header reflects the most recent ingestion.',
    ],
  },
  {
    id: 'model-update-schedule',
    title: '12. Model update schedule',
    paragraphs: [
      'The forecasting model is recalculated weekly. The "Model last run" timestamp is distinct from data freshness — data can update daily while the model that interprets it only reruns weekly.',
    ],
  },
  {
    id: 'data-sources',
    title: '13. Data sources',
    paragraphs: [
      '24 months of historical hamper-visit data from partner agencies, combined with StatCan income, employment, and housing indicators, feed the forecasting model.',
    ],
  },
  {
    id: 'faq',
    title: '14. Frequently asked questions',
    faqs: [
      {
        q: 'Why does a forecast’s confidence change from month to month?',
        a: 'Confidence depends on how many of that period’s inputs are measured versus projected forward. Further-out months rely on more projected inputs, which widens the range and can lower confidence.',
      },
      {
        q: 'Why is an agency flagged if its demand looks normal to me?',
        a: 'Status is driven by the gap between recorded and forecasted demand, not recorded demand alone — an agency can look "normal" today but still be flagged if the model expects a sharp increase.',
      },
      {
        q: 'Where do I go to review flagged agencies?',
        a: 'Use the Allocation Alerts card on Overview, or the Agencies page filtered to "Requires review".',
      },
    ],
  },
];

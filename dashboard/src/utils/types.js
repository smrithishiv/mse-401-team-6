/**
 * Shared data contracts used across mock data and (future) real API responses.
 * These are documented with JSDoc typedefs instead of TypeScript interfaces so
 * the shapes stay enforceable by editors/IDE tooling without a TS build step.
 */

/**
 * @typedef {Object} HistoricalPoint
 * @property {string} label - e.g. "Jan" or "2024"
 * @property {number} value
 */

/**
 * @typedef {Object} ForecastPoint
 * @property {string} label
 * @property {number} value
 * @property {number} [low] - lower bound of the confidence band
 * @property {number} [high] - upper bound of the confidence band
 */

/**
 * @typedef {Object} ConfidenceRange
 * @property {number} low
 * @property {number} high
 * @property {number} marginPct - +/- percentage of the predicted value
 */

/**
 * @typedef {'high' | 'low'} ConfidenceLevel
 */

/**
 * @typedef {Object} MonthlyForecastCard
 * @property {string} id
 * @property {string} label - e.g. "August 2026"
 * @property {'actual' | 'predicted'} type
 * @property {number} value
 * @property {ConfidenceRange} [range]
 * @property {ConfidenceLevel} [confidence]
 * @property {string} [action] - recommended action copy
 * @property {string} [subtitle]
 */

/**
 * @typedef {Object} DemographicSegment
 * @property {string} label
 * @property {number} pct
 * @property {string} color
 */

/**
 * @typedef {Object} DemographicBreakdown
 * @property {DemographicSegment[]} gender
 * @property {DemographicSegment[]} ageGroup
 * @property {DemographicSegment[]} income
 */

/**
 * @typedef {Object} PopulationSignal
 * @property {string} id
 * @property {string} label
 * @property {number} pctOfDemand
 * @property {number} [changePct]
 */

/**
 * @typedef {Object} AgencyAlert
 * @property {string} id
 * @property {string} name
 * @property {'High demand' | 'Watch' | 'Normal'} status
 * @property {number[]} trend - last 4 weeks of relative demand
 */

/**
 * @typedef {Object} SocioeconomicSignal
 * @property {string} id
 * @property {string} label
 * @property {string} value
 * @property {string} description
 * @property {'Elevated' | 'Critical' | 'Normal'} status
 */

/**
 * @typedef {'low' | 'medium' | 'med-high' | 'high'} RiskLevel
 */

/**
 * @typedef {Object} RegionalRiskArea
 * @property {string} id
 * @property {string} name
 * @property {string} type - e.g. "Township" or "City"
 * @property {RiskLevel} riskLevel
 * @property {string} points - SVG polygon points
 * @property {{x: number, y: number}} labelPos
 */

/**
 * @typedef {Object} FilterState
 * @property {string} from - ISO date
 * @property {string} to - ISO date
 * @property {string} gender - 'all' | 'male' | 'female' | 'other'
 * @property {string} ageGroup - 'all' | 'under18' | '18-44' | '45-64' | '65+'
 * @property {string} income - 'all' | 'under20k' | '20-40k' | '40-60k' | '60k+'
 */

export {};

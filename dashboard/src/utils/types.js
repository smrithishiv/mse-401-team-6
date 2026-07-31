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
 * @property {'actual'|'on-track'|'manual-review'|'critical'} statusKey - resolves label/tone/tooltip via utils/forecastStatus.js
 * @property {string} chartLabel - matches this month's point label in `chart.historical`/`chart.forecast`, for chart selection highlighting
 */

/**
 * @typedef {Object} WeeklyForecastCard
 * @property {string} id
 * @property {string} weekStart - ISO date
 * @property {string} weekEnd - ISO date
 * @property {string} label - e.g. "Jul 28 – Aug 3"
 * @property {'actual' | 'predicted'} type
 * @property {number} value
 * @property {number | null} changeFromPreviousWeekPct
 * @property {ConfidenceRange} [range]
 * @property {ConfidenceLevel} [confidence]
 * @property {'actual'|'on-track'|'manual-review'|'critical'} statusKey
 * @property {number} [currentAllocation]
 * @property {number} [recommendedAllocation]
 */

/**
 * @typedef {Object} WeeklyOperationalForecastResponse
 * @property {WeeklyForecastCard[]} weeks
 * @property {string} defaultSelectedWeekId
 * @property {string} [warning]
 * @property {string} [warningLinkLabel]
 * @property {{ historical: HistoricalPoint[], forecast: ForecastPoint[] }} chart
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
 * @typedef {Object} ContributingFactor
 * @property {string} id
 * @property {string} name
 * @property {'positive'|'negative'} direction - direction of the underlying signal itself, not of demand
 * @property {number} contribution - relative weight among a group's factors, 0-1
 * @property {string} explanation - correlational language only ("associated with", "the model indicates") — never causal
 */

/**
 * @typedef {Object} DemandDriverGroup
 * @property {string} groupId
 * @property {string} name
 * @property {number} shareOfDemand - % of projected demand, 0-100
 * @property {number} projectedChangePercent - signed %
 * @property {ContributingFactor[]} contributingFactors
 * @property {string} [detailHref]
 */

/**
 * @typedef {Object} DriverExplanationResponse
 * @property {string} periodLabel
 * @property {DemandDriverGroup[]} groups
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
 * @typedef {Object} ModelStatusEntry
 * @property {string} generatedAt - ISO datetime
 * @property {string} dataThrough - ISO date
 * @property {string} refreshCadence - e.g. "weekly", "quarterly"
 * @property {string} [nextScheduledRefresh] - ISO datetime
 */

/**
 * @typedef {Object} ModelStatusResponse
 * @property {ModelStatusEntry} operationalForecast
 * @property {ModelStatusEntry} strategicForecast
 */

/**
 * @typedef {2 | 3 | 5 | 10} SupportedHorizon
 */

/**
 * @typedef {Object} StrategicForecastResponse
 * @property {number} horizonYears - the horizon this response was generated for
 * @property {SupportedHorizon[]} supportedHorizons
 * @property {{ forecastValue: number, vsChangePct: number, expectedVariation: number, expectedVariationPct: number }} summary
 * @property {{ historical: HistoricalPoint[], forecast: ForecastPoint[] }} chart
 * @property {DemandDriversResponse} demandDrivers
 */

/**
 * @typedef {Object} FilterState
 * @property {string} from - ISO date
 * @property {string} to - ISO date
 * @property {string} gender - 'all' | 'male' | 'female' | 'other'
 * @property {string} ageGroup - 'all' | 'under18' | '18-44' | '45-64' | '65+'
 * @property {string} income - 'all' | 'under20k' | '20-40k' | '40-60k' | '60k+'
 */

/**
 * @typedef {'model_forecast' | 'planning_scenario' | 'current_proportions'} DemandDataType
 * Every DemandDriversDimension must carry one of these so the UI can label
 * whether a segment's 5-year trend is real model output, a policy/planning
 * assumption, or just today's split held flat. Never render a
 * `planning_scenario` or `current_proportions` series as if it were a
 * `model_forecast`.
 */

/**
 * @typedef {Object} DemandDriverPoint
 * @property {number} year
 * @property {number} pct - this segment's share of total demand that year (0-100)
 * @property {number} people - forecasted population for this segment that year
 */

/**
 * @typedef {Object} DemandDriverSegment
 * @property {string} id
 * @property {string} label
 * @property {string} color
 * @property {DemandDriverPoint[]} points - one entry per year in DemandDriversDimension.years
 */

/**
 * @typedef {Object} DemandDriversDimension
 * @property {DemandDataType} dataType
 * @property {DemandDriverSegment[]} segments
 */

/**
 * @typedef {Object} DemandDriversResponse
 * @property {number[]} years
 * @property {{ ageGroup: DemandDriversDimension, income: DemandDriversDimension, gender: DemandDriversDimension }} dimensions
 */

/**
 * @typedef {Object} ScenarioAssumptionField
 * @property {string} id
 * @property {string} label
 * @property {string} unit - e.g. "%", "pts", "index"
 * @property {number} min
 * @property {number} max
 * @property {number} step
 * @property {number} defaultValue
 * @property {string} description
 */

/**
 * @typedef {Object} ScenarioInputsResponse
 * @property {{id: string, label: string}[]} baselineOptions
 * @property {SupportedHorizon[]} horizonOptions
 * @property {ScenarioAssumptionField[]} assumptions
 */

/**
 * @typedef {Object} ScenarioRunParameters
 * @property {string} name
 * @property {string} baselineId
 * @property {number} horizonYears
 * @property {Object.<string, number>} assumptions
 * @property {boolean} [forceError] - test-only, exercises the error UI path
 */

/**
 * @typedef {Object} ScenarioYearComparison
 * @property {number} year
 * @property {number} baselineValue
 * @property {number} scenarioValue
 * @property {number} difference
 * @property {number} differencePct
 */

/**
 * @typedef {Object} ScenarioAffectedGroup
 * @property {string} groupId
 * @property {string} name
 * @property {number} baselineShareOfDemand
 * @property {number} scenarioShareOfDemand
 * @property {number} changePct
 */

/**
 * @typedef {Object} ScenarioResult
 * @property {string} scenarioId
 * @property {string} name
 * @property {'completed'|'error'} status
 * @property {string} baselineId
 * @property {number} horizonYears
 * @property {Object.<string, number>} assumptionsApplied
 * @property {ForecastPoint[]} baselineForecast
 * @property {ForecastPoint[]} scenarioForecast
 * @property {ScenarioYearComparison[]} differenceByYear
 * @property {ScenarioAffectedGroup[]} affectedGroups
 * @property {string} generatedAt
 * @property {string} summarySentence
 * @property {string} scenarioDisclaimer - always "Planning scenario — not the official forecast"
 */

/**
 * @typedef {Object} SavedScenarioSummary
 * @property {string} id
 * @property {string} name
 * @property {string} createdAt
 * @property {number} horizonYears
 */

export {};

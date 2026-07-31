import { describe, it, expect } from 'vitest';
import { getScenarioInputs, runScenario } from './scenarioService';
import { SCENARIO_DISCLAIMER } from '../data/mockScenarioData';

async function defaultAssumptions() {
  const inputs = await getScenarioInputs();
  return Object.fromEntries(inputs.assumptions.map((f) => [f.id, f.defaultValue]));
}

describe('scenarioService', () => {
  it('resolves scenario inputs with baseline, horizon, and assumption options', async () => {
    const inputs = await getScenarioInputs();
    expect(inputs.baselineOptions.length).toBeGreaterThan(0);
    expect(inputs.horizonOptions).toEqual([2, 3, 5, 10]);
    expect(inputs.assumptions.length).toBeGreaterThan(0);
    // No raw ML parameters/weights should ever be exposed on an input field.
    inputs.assumptions.forEach((field) => {
      expect(field).not.toHaveProperty('weight');
      expect(field).not.toHaveProperty('coefficient');
    });
  });

  it('produces zero difference from baseline when every assumption is at its default value', async () => {
    const assumptions = await defaultAssumptions();
    const result = await runScenario({
      name: 'No change',
      baselineId: 'strategic-baseline-2026-q2',
      horizonYears: 5,
      assumptions,
    });

    expect(result.status).toBe('completed');
    result.differenceByYear.forEach((row) => {
      expect(row.difference).toBe(0);
    });
    expect(result.scenarioForecast).toEqual(result.baselineForecast);
  });

  it('produces a non-zero difference and a summary sentence when an assumption changes', async () => {
    const assumptions = await defaultAssumptions();
    assumptions.newcomerGrowthAdjustmentPercent = 25;

    const result = await runScenario({
      name: 'Higher newcomer growth',
      baselineId: 'strategic-baseline-2026-q2',
      horizonYears: 5,
      assumptions,
    });

    const finalYear = result.differenceByYear[result.differenceByYear.length - 1];
    expect(finalYear.difference).not.toBe(0);
    expect(result.summarySentence).toMatch(/projected demand in \d{4} is/);
  });

  it('always includes the "not the official forecast" disclaimer', async () => {
    const assumptions = await defaultAssumptions();
    const result = await runScenario({
      name: 'Any scenario',
      baselineId: 'strategic-baseline-2026-q2',
      horizonYears: 5,
      assumptions,
    });

    expect(result.scenarioDisclaimer).toBe(SCENARIO_DISCLAIMER);
  });

  it('rejects when forceError is set, for exercising the error UI', async () => {
    const assumptions = await defaultAssumptions();
    await expect(
      runScenario({ name: 'x', baselineId: 'b', horizonYears: 5, assumptions, forceError: true })
    ).rejects.toThrow();
  });
});

import { mockRequest } from './api';
import { scenarioInputs, savedScenarios, buildScenarioResult } from '../data/mockScenarioData';

/**
 * Future backend integration:
 *   export function getScenarioInputs() {
 *     return apiFetch('/api/scenarios/inputs');
 *   }
 *   export function runScenario(parameters) {
 *     return apiFetch('/api/scenarios/run', { method: 'POST', body: JSON.stringify(parameters) });
 *   }
 *   export function getSavedScenarios() {
 *     return apiFetch('/api/scenarios');
 *   }
 *   export function getScenarioById(id) {
 *     return apiFetch(`/api/scenarios/${id}`);
 *   }
 */

export async function getScenarioInputs() {
  return mockRequest(scenarioInputs);
}

/** @param {import('../utils/types').ScenarioRunParameters} parameters */
export async function runScenario(parameters) {
  const result = buildScenarioResult(parameters);
  return mockRequest(result, { forceError: parameters?.forceError });
}

export async function getSavedScenarios() {
  return mockRequest(savedScenarios);
}

export async function getScenarioById(id) {
  const found = savedScenarios.find((s) => s.id === id);
  return mockRequest(found ? buildScenarioResult(found.parameters) : null);
}

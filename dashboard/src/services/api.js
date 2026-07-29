/**
 * Thin API abstraction layer.
 *
 * Today every service function resolves mock data through `mockRequest`,
 * which adds an artificial delay so loading states are exercised in the UI.
 * Once the backend/model is ready, replace the body of each service function
 * with a call to `apiFetch(path, options)` — the base URL, error handling,
 * and JSON parsing are already wired up here so callers don't change shape.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const MOCK_DELAY_MS = 500;

/**
 * Resolves `data` after a short artificial delay to emulate network latency.
 * Pass `{ forceError: true }` inside filters (used by tests / demos) to
 * exercise the error + retry UI path without a real backend.
 */
export function mockRequest(data, { delay = MOCK_DELAY_MS, forceError = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (forceError) {
        reject(new Error('Unable to reach the forecasting service. Please try again.'));
        return;
      }
      resolve(data);
    }, delay);
  });
}

/**
 * Real backend fetch helper — not yet used by any service function.
 * Swap `mockRequest(...)` calls for `apiFetch('/api/...')` once endpoints exist.
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }

  return res.json();
}

/** Builds a URLSearchParams-friendly query string from a filters object. */
export function toQueryString(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 'all' && value !== '') {
      params.set(key, value);
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

import { mockRequest } from './api';
import { agencies } from '../data/mockAgencyData';

/**
 * Future backend integration:
 *   export function getAgencies(filters) {
 *     return apiFetch(`/api/agencies${toQueryString(filters)}`);
 *   }
 *   export function getAgencyById(agencyId) {
 *     return apiFetch(`/api/agencies/${agencyId}`);
 *   }
 *   export function getAgencyAlerts(filters) {
 *     return apiFetch(`/api/agencies/alerts${toQueryString(filters)}`);
 *   }
 *   export function getAgencySummary() {
 *     return apiFetch('/api/agencies/summary');
 *   }
 */

function matchesSearch(agency, search) {
  if (!search) return true;
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    agency.name.toLowerCase().includes(needle) ||
    agency.city.toLowerCase().includes(needle) ||
    agency.serviceArea.toLowerCase().includes(needle) ||
    agency.status.toLowerCase().includes(needle) ||
    agency.id.toLowerCase().includes(needle)
  );
}

// applyFilters/sortAgencies are exported so AgenciesPage can filter the
// already-fetched agency list client-side (instant search-as-you-type,
// no per-keystroke network round trip). Once a real backend exists, swap
// that client-side call for `await getAgencies(filters)` on every filter
// change instead — same filter semantics, just server-side.
export function applyFilters(list, filters = {}) {
  return list.filter((agency) => {
    if (!matchesSearch(agency, filters.search)) return false;
    if (filters.status && filters.status !== 'all' && agency.status !== filters.status) return false;
    if (filters.city && filters.city !== 'all' && agency.city !== filters.city) return false;
    if (filters.serviceArea && filters.serviceArea !== 'all' && agency.serviceArea !== filters.serviceArea) {
      return false;
    }
    if (filters.trend && filters.trend !== 'all' && agency.trend !== filters.trend) return false;
    if (filters.reviewRequired && filters.reviewRequired !== 'all') {
      const wantsReview = filters.reviewRequired === 'true';
      if (agency.reviewRequired !== wantsReview) return false;
    }
    return true;
  });
}

export function sortAgencies(list, sortBy = 'name', sortDir = 'asc') {
  const dir = sortDir === 'desc' ? -1 : 1;
  const sorted = [...list].sort((a, b) => {
    switch (sortBy) {
      case 'demand':
        return (a.currentDemand - b.currentDemand) * dir;
      case 'difference':
        return (a.forecastDifferencePercent - b.forecastDifferencePercent) * dir;
      case 'status':
        return a.status.localeCompare(b.status) * dir;
      case 'lastUpdated':
        return (new Date(a.lastUpdated) - new Date(b.lastUpdated)) * dir;
      case 'name':
      default:
        return a.name.localeCompare(b.name) * dir;
    }
  });
  return sorted;
}

/** @param {{ search?: string, status?: string, city?: string, serviceArea?: string, trend?: string, reviewRequired?: string, sortBy?: string, sortDir?: string, forceError?: boolean }} filters */
export async function getAgencies(filters = {}) {
  const filtered = applyFilters(agencies, filters);
  const sorted = sortAgencies(filtered, filters.sortBy, filters.sortDir);
  return mockRequest(sorted, { forceError: filters.forceError });
}

export async function getAgencyById(agencyId, options = {}) {
  const agency = agencies.find((a) => a.id === agencyId) || null;
  return mockRequest(agency, options);
}

/** Agencies that are flagged (status !== 'normal'), used by Overview's review queue. */
export async function getAgencyAlerts(filters = {}) {
  const flagged = agencies.filter((a) => a.status !== 'normal');
  const filtered = applyFilters(flagged, filters);
  return mockRequest(filtered, { forceError: filters.forceError });
}

export async function getAgencySummary(options = {}) {
  const total = agencies.length;
  const needingReview = agencies.filter((a) => a.reviewRequired).length;
  const flagged = agencies.filter((a) => a.status !== 'normal').length;
  const lastUpdated = agencies.reduce(
    (latest, a) => (new Date(a.lastUpdated) > new Date(latest) ? a.lastUpdated : latest),
    agencies[0]?.lastUpdated
  );

  return mockRequest({ total, needingReview, flagged, lastUpdated }, options);
}

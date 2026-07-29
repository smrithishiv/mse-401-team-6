import { describe, it, expect } from 'vitest';
import { getAgencies, getAgencyById, getAgencyAlerts, getAgencySummary } from './agencyService';

describe('agencyService', () => {
  it('resolves exactly 61 agencies, matching the Overview "Active agencies" count', async () => {
    const agencies = await getAgencies({});
    expect(agencies).toHaveLength(61);
  });

  it('search filters by agency name', async () => {
    const results = await getAgencies({ search: 'KW YMCA' });
    expect(results.map((a) => a.id)).toEqual(['kw-ymca']);
  });

  it('search filters by city', async () => {
    const results = await getAgencies({ search: 'Cambridge' });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((a) => {
      expect(a.city.toLowerCase().includes('cambridge') || a.name.toLowerCase().includes('cambridge')).toBe(true);
    });
  });

  it('filters by status', async () => {
    const results = await getAgencies({ status: 'critical' });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((a) => expect(a.status).toBe('critical'));
  });

  it('filters by reviewRequired', async () => {
    const results = await getAgencies({ reviewRequired: 'true' });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((a) => expect(a.reviewRequired).toBe(true));
  });

  it('combines search, status, and reviewRequired filters together', async () => {
    const results = await getAgencies({ search: 'kw', status: 'high-demand', reviewRequired: 'true' });
    expect(results.map((a) => a.id)).toEqual(['kw-ymca']);
  });

  it('returns an empty array when nothing matches', async () => {
    const results = await getAgencies({ search: 'no-agency-named-this-xyz' });
    expect(results).toEqual([]);
  });

  it('getAgencyById resolves a single agency or null', async () => {
    const found = await getAgencyById('kw-ymca');
    expect(found.name).toBe('KW YMCA');

    const missing = await getAgencyById('does-not-exist');
    expect(missing).toBeNull();
  });

  it('getAgencyAlerts only returns non-normal-status agencies', async () => {
    const alerts = await getAgencyAlerts();
    expect(alerts.length).toBeGreaterThan(0);
    alerts.forEach((a) => expect(a.status).not.toBe('normal'));
  });

  it('getAgencySummary reports totals consistent with the full dataset', async () => {
    const [all, summary] = await Promise.all([getAgencies({}), getAgencySummary()]);
    expect(summary.total).toBe(all.length);
    expect(summary.needingReview).toBe(all.filter((a) => a.reviewRequired).length);
  });
});

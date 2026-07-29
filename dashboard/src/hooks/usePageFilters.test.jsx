import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FilterUIProvider } from '../context/FilterUIContext';
import { usePageFilters } from './usePageFilters';

const fields = [{ id: 'gender', label: 'Gender', type: 'select', options: [] }];
const defaults = { gender: 'all' };

function wrapper({ children }) {
  return <FilterUIProvider>{children}</FilterUIProvider>;
}

describe('usePageFilters', () => {
  it('only updates applied filters once applyFilters is called, not on every draft change', () => {
    const { result } = renderHook(() => usePageFilters({ fields, defaults }), { wrapper });

    expect(result.current.appliedFilters.gender).toBe('all');

    act(() => result.current.setDraftFilter('gender', 'female'));
    expect(result.current.draftFilters.gender).toBe('female');
    expect(result.current.appliedFilters.gender).toBe('all');

    act(() => result.current.applyFilters());
    expect(result.current.appliedFilters.gender).toBe('female');
  });

  it('resetFilters returns both draft and applied filters to defaults', () => {
    const { result } = renderHook(() => usePageFilters({ fields, defaults }), { wrapper });

    act(() => result.current.setDraftFilter('gender', 'female'));
    act(() => result.current.applyFilters());
    act(() => result.current.resetFilters());

    expect(result.current.appliedFilters.gender).toBe('all');
    expect(result.current.draftFilters.gender).toBe('all');
  });

  it('keeps two page instances fully independent — filters never leak across pages', () => {
    const forecastDefaults = { gender: 'all' };
    const atRiskDefaults = { riskLevel: 'all' };

    const { result: forecast } = renderHook(
      () => usePageFilters({ fields, defaults: forecastDefaults }),
      { wrapper }
    );
    const { result: atRisk } = renderHook(
      () => usePageFilters({ fields, defaults: atRiskDefaults }),
      { wrapper }
    );

    act(() => forecast.current.setDraftFilter('gender', 'male'));
    act(() => forecast.current.applyFilters());

    expect(forecast.current.appliedFilters.gender).toBe('male');
    expect(atRisk.current.appliedFilters).toEqual({ riskLevel: 'all' });
  });
});

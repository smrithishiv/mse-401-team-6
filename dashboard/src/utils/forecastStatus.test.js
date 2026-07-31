import { describe, it, expect } from 'vitest';
import { getForecastStatusInfo } from './forecastStatus';

describe('forecastStatus', () => {
  it('maps actual recorded demand to a neutral grey tone, never red', () => {
    const info = getForecastStatusInfo('actual');
    expect(info.label).toBe('Actual recorded demand');
    expect(info.tone).toBe('grey');
    expect(info.tone).not.toBe('red');
  });

  it('maps on-track allocation to green', () => {
    const info = getForecastStatusInfo('on-track');
    expect(info.label).toBe('Allocation on track');
    expect(info.tone).toBe('green');
  });

  it('maps manual-review to yellow', () => {
    const info = getForecastStatusInfo('manual-review');
    expect(info.label).toBe('Manual confirmation recommended');
    expect(info.tone).toBe('yellow');
  });

  it('falls back to the actual status for an unrecognized key', () => {
    expect(getForecastStatusInfo('unknown').label).toBe('Actual recorded demand');
  });
});

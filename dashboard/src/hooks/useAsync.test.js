import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('starts loading, then resolves data', async () => {
    const asyncFn = () => Promise.resolve({ hello: 'world' });
    const { result } = renderHook(() => useAsync(asyncFn, []));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ hello: 'world' });
    expect(result.current.error).toBeNull();
  });

  it('captures a rejected promise as an error message, and retry() clears it', async () => {
    let shouldFail = true;
    const asyncFn = vi.fn(() =>
      shouldFail ? Promise.reject(new Error('boom')) : Promise.resolve({ ok: true })
    );

    const { result } = renderHook(() => useAsync(asyncFn, []));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('boom');
    expect(result.current.data).toBeNull();

    shouldFail = false;
    result.current.retry();

    await waitFor(() => expect(result.current.data).toEqual({ ok: true }));
    expect(result.current.error).toBeNull();
    expect(asyncFn).toHaveBeenCalledTimes(2);
  });
});

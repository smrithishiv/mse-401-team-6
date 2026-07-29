import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic data-fetching hook used by every page to call into the service
 * layer. Tracks loading/error/data state and exposes `retry` so
 * ErrorState components can re-run the request without a full page reload.
 *
 * @param {() => Promise<any>} asyncFn
 * @param {any[]} deps - re-runs the request when any dependency changes
 */
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    asyncFn()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Something went wrong.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refreshIndex]);

  const retry = useCallback(() => setRefreshIndex((n) => n + 1), []);

  return { data, loading, error, retry };
}

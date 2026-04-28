/**
 * StudyTrack AI — Reusable API Hook
 * Optimized: avoids flickering on refresh, preserves stale data during re-fetch,
 * memoized params, and cancellation-safe via mounted flag.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';

export function useApi(apiFunction, params = []) {
  const { refreshKey } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // Stringify params to create a stable dep key
  const paramKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    try {
      // Only set loading=true on first load; on refresh, keep data visible
      setLoading(prev => data === null ? true : prev);
      setError(null);
      const result = await apiFunction(...params);
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const detail = err?.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : err.message || 'Something went wrong');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, paramKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

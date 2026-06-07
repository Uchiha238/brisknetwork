import { useState, useEffect, useCallback } from 'react';

export function useAsync(fetchFn, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const run = useCallback(async () => {
    try { setLoading(true); setError('');
      const result = await fetchFn();
      setData(result);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, setData, loading, error, refetch: run };
}

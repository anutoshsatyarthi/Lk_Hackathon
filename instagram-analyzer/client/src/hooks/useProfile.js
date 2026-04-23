import { useState, useEffect, useCallback } from 'react';
import { fetchProfile } from '../api/client.js';

export default function useProfile(username) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (u) => {
    if (!u) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProfile(u);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(username); }, [username, load]);

  return { data, loading, error, refetch: () => load(username) };
}

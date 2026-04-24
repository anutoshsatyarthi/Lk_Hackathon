import { useState, useCallback } from 'react';
import { fetchAnalysis } from '../api/client.js';

export default function useAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (username, posts = [], profile = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalysis(username, posts, profile);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, analyze };
}

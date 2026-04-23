import { useState, useCallback } from 'react';
import { predictROI } from '../api/client.js';

export default function useROIPrediction() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = useCallback(async (username, campaignConfig, profileData, mediaData, brandCollabs) => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictROI(username, {
        campaignConfig,
        profileData: profileData || {},
        mediaData: mediaData || {},
        brandCollabs: brandCollabs || [],
      });
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setData(null); setError(null); }, []);

  return { data, loading, error, predict, reset };
}

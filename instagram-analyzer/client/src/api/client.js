import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 min — Apify scraping can be slow
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Request failed';
    const enhanced = new Error(message);
    enhanced.status = err.response?.status;
    enhanced.data = err.response?.data;
    return Promise.reject(enhanced);
  }
);

export const fetchProfile = (username) => api.get(`/profile/${username}`).then((r) => r.data);
export const fetchMedia = (username, limit = 50) => api.get(`/media/${username}?limit=${limit}`).then((r) => r.data);
export const fetchAnalysis = (username, posts) => api.post('/analyze', { username, posts }).then((r) => r.data);
export const fetchInsights = (username) => api.get(`/insights/${username}`).then((r) => r.data);
export const fetchNetwork = (username) => api.get(`/network/${username}`).then((r) => r.data);
export const checkHealth = () => api.get('/health').then((r) => r.data);

const API_BASE = '/api';

export async function predictROI(username, payload) {
  const res = await fetch(`${API_BASE}/roi/predict/${username}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `ROI prediction failed: ${res.status}`);
  }
  return res.json();
}

export default api;

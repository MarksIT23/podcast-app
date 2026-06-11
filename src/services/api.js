import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('podcastai_auth');
      if (stored) {
        const { token } = JSON.parse(stored);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (only if previously authenticated)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const stored = localStorage.getItem('podcastai_auth');
      // Only hard-redirect if there WAS a session (prevents intercepting login failures)
      if (stored) {
        localStorage.removeItem('podcastai_auth');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

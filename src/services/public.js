/**
 * Public Data Service — calls unauthenticated API endpoints.
 * Used by public-facing pages (homepage, podcast detail, etc.).
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export async function fetchLatestEpisodes({ page = 1, pageSize = 10 } = {}) {
  const res = await fetch(`${API_BASE}/episodes?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error('Failed to fetch episodes');
  return res.json();
}

export async function fetchPublicPodcasts({ page = 1, pageSize = 20 } = {}) {
  const res = await fetch(`${API_BASE}/podcasts?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error('Failed to fetch podcasts');
  return res.json();
}

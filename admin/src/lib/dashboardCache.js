const CACHE_KEY = 'admin_dashboard_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

export function readDashboardCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeDashboardCache(data) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
}

export function clearDashboardCache() {
  sessionStorage.removeItem(CACHE_KEY);
}

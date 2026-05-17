import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/apiClient';
import { readDashboardCache, writeDashboardCache } from '../lib/dashboardCache';

export function useDashboard({ onUnauthorized } = {}) {
  const [initialCache] = useState(() => readDashboardCache());
  const [restaurant, setRestaurant] = useState(initialCache?.restaurant ?? null);
  const [dishes, setDishes] = useState(initialCache?.dishes ?? []);
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState(null);
  const onUnauthorizedRef = useRef(onUnauthorized);
  onUnauthorizedRef.current = onUnauthorized;

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/api/restaurants/me/dashboard');
      setRestaurant(data.restaurant);
      setDishes(data.dishes);
      writeDashboardCache(data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        onUnauthorizedRef.current?.();
        return;
      }
      setError((prev) => prev || 'Impossible de charger les données. Réessayez.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(!!initialCache);
  }, [refresh, initialCache]);

  return { restaurant, dishes, loading, error, refresh };
}

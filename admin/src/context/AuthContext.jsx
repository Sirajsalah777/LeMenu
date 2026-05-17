import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import api from '../lib/apiClient';
import { clearDashboardCache } from '../lib/dashboardCache';

const AuthContext = createContext(null);

function readToken() {
  const t = localStorage.getItem('token');
  return t && t !== 'null' && t !== 'undefined' ? t : null;
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('restaurant_id');
  localStorage.removeItem('restaurant_slug');
  clearDashboardCache();
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const stored = readToken();
    if (!stored) {
      setBooting(false);
      return;
    }

    api
      .get('/api/restaurants/me', { timeout: 8000 })
      .then(() => setToken(stored))
      .catch(() => clearSession())
      .finally(() => setBooting(false));
  }, []);

  const login = useCallback((data) => {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('restaurant_id', String(data.restaurant_id));
    localStorage.setItem('restaurant_slug', data.slug);
    setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated: !!token, booting, login, logout }),
    [token, booting, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

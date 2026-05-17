import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext(null);

function readToken() {
  const t = localStorage.getItem('token');
  return t && t !== 'null' && t !== 'undefined' ? t : null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);

  const login = useCallback((data) => {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('restaurant_id', String(data.restaurant_id));
    localStorage.setItem('restaurant_slug', data.slug);
    setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant_id');
    localStorage.removeItem('restaurant_slug');
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated: !!token, login, logout }),
    [token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

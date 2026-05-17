import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { writeDashboardCache } from '../lib/dashboardCache';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const res = await api.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      login(res.data);

      try {
        const dash = await api.get('/api/restaurants/me/dashboard');
        writeDashboardCache(dash.data);
      } catch {
        /* dashboard se rechargera sur la page suivante */
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Identifiants incorrects');
      } else if (status >= 500 || !err.response) {
        setError('Le serveur est indisponible. Réessayez dans quelques instants.');
      } else {
        setError(err.response?.data?.detail || 'Connexion impossible');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <div className="login-logo">LeMenu</div>
        <h2 className="text-center">Administration</h2>
        {error && (
          <div className="alert-error" style={{ color: 'red', marginBottom: '20px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
            {error}
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <button type="submit" className="btn-primary w-100" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

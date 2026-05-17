import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { clearDashboardCache } from '../lib/dashboardCache';
import LoadingScreen from '../components/LoadingScreen';

const QRCodeSVG = lazy(() => import('qrcode.react').then((m) => ({ default: m.QRCodeSVG })));

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('plats');
  const [stats, setStats] = useState({ scans_today: 0, total_scans: 0, top_dishes: [] });
  const [newPassword, setNewPassword] = useState('');
  const [themeColor, setThemeColor] = useState('#c2410c');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const slug = localStorage.getItem('restaurant_slug');
  const BASE_MENU_URL = window.location.origin;
  const menuPreviewUrl = slug ? `${BASE_MENU_URL}/${slug}` : BASE_MENU_URL;

  const handleLogout = () => {
    clearDashboardCache();
    logout();
    navigate('/', { replace: true });
  };

  const { restaurant, dishes, loading, error, refresh } = useDashboard({
    onUnauthorized: handleLogout,
  });

  useEffect(() => {
    if (restaurant?.theme_color) setThemeColor(restaurant.theme_color);
  }, [restaurant?.theme_color]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/analytics/summary');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
  }, [activeTab]);

  const handleToggle = async (id) => {
    try {
      await api.patch(`/api/dishes/${id}/toggle`, {});
      refresh(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce plat ?')) {
      try {
        await api.delete(`/api/dishes/${id}`);
        refresh(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const printMainQRCode = () => {
    const svg = document.getElementById('main-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>QR Code - ${restaurant.name}</title>
      <style>
        body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif; margin: 0; }
        h2 { margin-bottom: 8px; font-size: 32px; } p { color: #666; margin-bottom: 32px; font-size: 20px; }
      </style></head><body>
        <h2>${restaurant.name}</h2>
        <p>Scannez pour voir notre menu</p>
        <div style="transform: scale(1.5)">${svgData}</div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        <button onClick={handleLogout} className="btn-primary">Retour à la connexion</button>
      </div>
    );
  }

  if (loading && !restaurant) {
    return <LoadingScreen message="Chargement de l'administration..." />;
  }

  if (!restaurant) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#78716c', marginBottom: '1rem' }}>Session expirée ou connexion lente.</p>
        <button onClick={handleLogout} className="btn-primary">Retour à la connexion</button>
      </div>
    );
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3 style={{ color: restaurant.theme_color }}>{restaurant.name}</h3>
        </div>
        <nav className="nav-menu">
          <button className={activeTab === 'plats' ? 'active' : ''} onClick={() => setActiveTab('plats')}>Mes Plats</button>
          <button className={activeTab === 'qr' ? 'active' : ''} onClick={() => setActiveTab('qr')}>Mon QR Code</button>
          <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>Statistiques</button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Paramètres</button>
          <button className={`nav-link ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>Apercu menu</button>
        </nav>
        <button onClick={handleLogout} className="btn-logout">Deconnexion</button>
      </aside>
      <main className="content">
        {loading && (
          <div className="sync-indicator" aria-hidden="true">Mise à jour…</div>
        )}

        {activeTab === 'plats' && (
          <section>
            <div className="header-actions">
              <h2>Mes Plats</h2>
              <Link to="/dish/new" className="btn-primary">Ajouter un plat</Link>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Nom</th>
                  <th>Categorie</th>
                  <th>Prix</th>
                  <th>Dispo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish) => (
                  <tr key={dish.id}>
                    <td><img src={dish.photos?.[0] || 'https://via.placeholder.com/50'} alt="" className="thumb" loading="lazy" /></td>
                    <td>{dish.name}</td>
                    <td>{dish.category}</td>
                    <td>{dish.price} Dh</td>
                    <td>
                      <label className="switch">
                        <input type="checkbox" checked={dish.is_available} onChange={() => handleToggle(dish.id)} />
                        <span className="slider round"></span>
                      </label>
                    </td>
                    <td>
                      <Link to={`/dish/edit/${dish.id}`} className="btn-edit">Modifier</Link>
                      <button onClick={() => handleDelete(dish.id)} className="btn-delete">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'qr' && (
          <section style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div className="header-actions">
              <h2>Mon QR Code Unique</h2>
              <button onClick={printMainQRCode} className="btn-primary">Imprimer le QR Code</button>
            </div>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>
              Utilisez ce QR code unique pour toutes vos tables.
            </p>
            <div className="qr-card" style={{ padding: '40px', display: 'inline-block' }}>
              <div className="qr-card-header" style={{ fontSize: '20px' }}>{restaurant.name}</div>
              <div className="qr-card-body" style={{ padding: '20px 0' }}>
                <Suspense fallback={<div className="spinner" style={{ margin: '0 auto' }} />}>
                  <QRCodeSVG
                    id="main-qr"
                    value={menuPreviewUrl}
                    size={240}
                    level="H"
                    includeMargin
                    fgColor={restaurant.theme_color || '#000000'}
                  />
                </Suspense>
              </div>
              <div className="qr-card-url" style={{ fontSize: '12px', marginTop: '15px' }}>
                {menuPreviewUrl}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'stats' && (
          <div className="stats-container">
            <h3>Aperçu des performances</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.scans_today}</div>
                <div className="stat-label">Scans Aujourd'hui</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.total_scans}</div>
                <div className="stat-label">Scans Totaux</div>
              </div>
            </div>
            <div className="top-dishes-card">
              <h4>Plats les plus consultés</h4>
              <table>
                <thead>
                  <tr>
                    <th>Plat</th>
                    <th>Vues</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_dishes.map((d, i) => (
                    <tr key={i}>
                      <td>{d.name}</td>
                      <td>{d.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <h3>Paramètres du restaurant</h3>
            <div className="form-group">
              <label>Couleur du thème</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} style={{ width: '60px', height: '40px', padding: 0, border: 'none' }} />
                <span>{themeColor}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" />
            </div>
            <button
              className="btn-primary"
              onClick={async () => {
                try {
                  await api.put('/api/restaurants/me', {
                    password: newPassword || undefined,
                    theme_color: themeColor,
                  });
                  alert('Sauvegardé !');
                  setNewPassword('');
                  refresh(true);
                } catch {
                  alert('Erreur');
                }
              }}
            >
              Sauvegarder
            </button>
          </div>
        )}

        {activeTab === 'preview' && (
          <section>
            <div className="header-actions">
              <h2>Apercu du Menu</h2>
              <a href={menuPreviewUrl} target="_blank" rel="noreferrer" className="btn-primary">Ouvrir dans un nouvel onglet</a>
            </div>
            <div className="iframe-container">
              <iframe src={menuPreviewUrl} title="apercu" className="phone-preview" loading="lazy" />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

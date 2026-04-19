import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const [dishes, setDishes] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState('plats');
  const [stats, setStats] = useState({ scans_today: 0, total_scans: 0, top_dishes: [] });
  const [newPassword, setNewPassword] = useState('');
  const [themeColor, setThemeColor] = useState('#c2410c');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const slug = localStorage.getItem('restaurant_slug');
  const headers = { Authorization: `Bearer ${token}` };

  // Replace with your production domain when deploying
  const BASE_MENU_URL = 'http://localhost:5173';

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/analytics/summary', { headers });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
  }, [activeTab]);

  const fetchMe = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/restaurants/me', { headers });
      setRestaurant(res.data);
      setThemeColor(res.data.theme_color || '#c2410c');
      fetchDishes(res.data.id);
    } catch (err) {
      if(err.response?.status === 401) handleLogout();
    }
  };

  const fetchDishes = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/dishes/restaurant/${id}`);
      setDishes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/dishes/${id}/toggle`, {}, { headers });
      fetchDishes(restaurant.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce plat ?')) {
      try {
        await axios.delete(`http://localhost:8000/api/dishes/${id}`, { headers });
        fetchDishes(restaurant.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant_id');
    localStorage.removeItem('restaurant_slug');
    navigate('/');
    window.location.reload();
  };

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    try {
        const payload = {
          theme_color: restaurant.theme_color,
          name: restaurant.name
        };
        if (newPassword) payload.password = newPassword;

        await axios.put(`http://localhost:8000/api/restaurants/me`, payload, { headers });
        alert('Parametres mis a jour !');
        setNewPassword('');
    } catch (err) {
        console.error(err);
        alert('Erreur lors de la mise a jour.');
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
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if(!restaurant) return <div style={{padding: '2rem'}}>Chargement...</div>;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          {restaurant && (
            <h3 style={{color: restaurant.theme_color}}>{restaurant.name}</h3>
          )}
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
                {dishes.map(dish => (
                  <tr key={dish.id}>
                    <td><img src={dish.photos?.[0] || 'https://via.placeholder.com/50'} alt="dish" className="thumb"/></td>
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
          <section style={{textAlign: 'center', maxWidth: '600px', margin: '0 auto'}}>
            <div className="header-actions">
              <h2>Mon QR Code Unique</h2>
              <button onClick={printMainQRCode} className="btn-primary">Imprimer le QR Code</button>
            </div>
            <p style={{color: '#6b7280', marginBottom: '32px'}}>
              Utilisez ce QR code unique pour toutes vos tables. Les clients pourront acceder a votre menu complet en un scan.
            </p>
            <div className="qr-card" style={{padding: '40px', display: 'inline-block'}}>
              <div className="qr-card-header" style={{fontSize: '20px'}}>{restaurant.name}</div>
              <div className="qr-card-body" style={{padding: '20px 0'}}>
                <QRCodeSVG 
                  id="main-qr"
                  value={`${BASE_MENU_URL}/${slug}`}
                  size={240}
                  level="H"
                  includeMargin={true}
                  fgColor={restaurant.theme_color || '#000000'}
                />
              </div>
              <div className="qr-card-url" style={{fontSize: '12px', marginTop: '15px'}}>
                {BASE_MENU_URL}/{slug}
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
              <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} style={{width: '60px', height: '40px', padding: '0', border: 'none'}} />
                <span>{themeColor}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" />
            </div>
            <button className="btn-primary" onClick={async () => {
              try {
                await axios.put('http://localhost:8000/api/restaurants/me', { 
                  password: newPassword || undefined,
                  theme_color: themeColor
                }, { headers });
                alert('Sauvegardé !');
                setNewPassword('');
                fetchMe();
              } catch(e) { alert('Erreur'); }
            }}>Sauvegarder</button>
          </div>
        )}

        {activeTab === 'preview' && (
          <section>
            <div className="header-actions">
              <h2>Apercu du Menu</h2>
              <a href={`http://localhost:5173/${slug}`} target="_blank" rel="noreferrer" className="btn-primary">Ouvrir dans un nouvel onglet</a>
            </div>
            <div className="iframe-container">
              <iframe src={`http://localhost:5173/${slug}`} title="apercu" className="phone-preview" />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

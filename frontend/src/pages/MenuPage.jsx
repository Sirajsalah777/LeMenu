import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import DishCard from '../components/DishCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function MenuPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');

  const [restaurant, setRestaurant] = useState(null);
  const [dishesByCategory, setDishesByCategory] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/restaurants/${slug}`)
      .then(res => {
        setRestaurant(res.data.restaurant);
        setDishesByCategory(res.data.dishes_by_category);
        if (res.data.restaurant.theme_color) {
          document.documentElement.style.setProperty('--primary-color', res.data.restaurant.theme_color);
        }
        
        // Log scan event
        axios.post(`${API_URL}/api/analytics/log?event_type=scan&restaurant_id=${res.data.restaurant.id}`);

        // Auto-open first category
        const cats = Object.keys(res.data.dishes_by_category);
        if (cats.length > 0) setOpenCategory(cats[0]);
        setLoading(false);
      })
      .catch(err => {
        setError("Restaurant non trouvé.");
        setLoading(false);
      });
  }, [slug]);

  const toggleCategory = (cat) => {
    setOpenCategory(openCategory === cat ? null : cat);
  };

  if (loading) return <div className="loader">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="menu-container pb-safe">
      <header className="menu-header" style={{ backgroundColor: 'var(--primary-color)' }}>
        {restaurant?.logo_url && <img src={restaurant.logo_url} alt="Logo" className="restaurant-logo" />}
        <h1>{restaurant?.name}</h1>
        {tableNumber && <div className="table-badge">Table {tableNumber}</div>}
      </header>

      <div className="menu-content">
        {Object.entries(dishesByCategory).map(([category, dishes]) => (
          <div key={category} className="category-accordion">
            <button 
              className={`category-header ${openCategory === category ? 'open' : ''}`}
              onClick={() => toggleCategory(category)}
              style={openCategory === category ? { backgroundColor: 'var(--primary-color)' } : {}}
            >
              <span>{category}</span>
              <div className="cat-meta">
                <span className="cat-count">{dishes.length} plats</span>
                <span className={`cat-arrow ${openCategory === category ? 'rotated' : ''}`}>▼</span>
              </div>
            </button>
            
            {openCategory === category && (
              <div className="category-body">
                <div className="dish-list">
                  {dishes.map(dish => (
                    <DishCard key={dish.id} dish={dish} slug={slug} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

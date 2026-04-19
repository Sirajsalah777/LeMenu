import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Viewer360 from '../components/Viewer360';
import VideoPlayer from '../components/VideoPlayer';
import IngredientsList from '../components/IngredientsList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function DishDetail() {
  const { slug, dishId } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState(null);
  const [activeTab, setActiveTab] = useState('3d');

  useEffect(() => {
    axios.get(`${API_URL}/api/restaurants/${slug}`)
      .then(res => {
        let found = null;
        Object.values(res.data.dishes_by_category).forEach(catDishes => {
          const d = catDishes.find(d => d.id.toString() === dishId);
          if (d) found = d;
        });
        setDish(found);
        if (found) {
            axios.post(`${API_URL}/api/analytics/log?event_type=dish_view&restaurant_id=${res.data.restaurant.id}&target_id=${found.id}`);
        }
      });
  }, [slug, dishId]);

  if (!dish) return <div className="loader">Chargement...</div>;

  return (
    <div className="dish-detail-page pb-safe">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Retour
      </button>
      
      <div className="tabs">
        <button className={activeTab === '3d' ? 'active' : ''} onClick={() => setActiveTab('3d')}>Vue 3D</button>
        <button className={activeTab === 'video' ? 'active' : ''} onClick={() => setActiveTab('video')}>Vidéo</button>
        <button className={activeTab === 'ingredients' ? 'active' : ''} onClick={() => setActiveTab('ingredients')}>Ingrédients</button>
      </div>

      <div className="tab-content">
        {activeTab === '3d' && <Viewer360 dish={dish} />}
        {activeTab === 'video' && <VideoPlayer dish={dish} />}
        {activeTab === 'ingredients' && <IngredientsList dish={dish} />}
      </div>
      
      <div className="dish-meta-info">
        <h2>{dish.name}</h2>
        <p className="price">{dish.price} Dh</p>
        <div className="nutrition">
          {dish.weight_grams && <span>{dish.weight_grams} g</span>}
          {dish.calories && <span>{dish.calories} kcal</span>}
        </div>
      </div>
    </div>
  );
}

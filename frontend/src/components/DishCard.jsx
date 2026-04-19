import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DishCard({ dish, slug }) {
  const navigate = useNavigate();
  const photo = dish.photos && dish.photos.length > 0 ? dish.photos[0] : 'https://via.placeholder.com/150';

  return (
    <div 
      className={`dish-card ${!dish.is_available ? 'unavailable' : ''}`}
      onClick={() => dish.is_available && navigate(`/${slug}/dish/${dish.id}`)}
    >
      <img src={photo} alt={dish.name} className="dish-thumbnail" />
      <div className="dish-info">
        <h3>{dish.name}</h3>
        <p className="dish-desc line-clamp-2">{dish.description}</p>
        <div className="dish-footer">
          <span className="dish-price">{dish.price} Dh</span>
          {dish.model_url && <button className="btn-3d-hint">Voir en 3D</button>}
        </div>
        {dish.allergens && dish.allergens.length > 0 && (
          <div className="allergens-min">
            {dish.allergens.map((a, i) => <span key={i} className="allergen-pill">{a}</span>)}
          </div>
        )}
      </div>
      {!dish.is_available && <div className="unavailable-overlay">Indisponible</div>}
    </div>
  );
}

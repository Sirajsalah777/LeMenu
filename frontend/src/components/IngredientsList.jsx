import React from 'react';

export default function IngredientsList({ dish }) {
  return (
    <div className="ingredients-container">
      <h3>Description</h3>
      <p>{dish.description || "Aucune description disponible."}</p>
      
      {dish.allergens && dish.allergens.length > 0 && (
        <div className="allergens-section mt-4">
          <h3>Allergènes</h3>
          <div className="allergens-pills">
            {dish.allergens.map((allergen, idx) => (
              <span key={idx} className="allergen-pill warning">{allergen}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

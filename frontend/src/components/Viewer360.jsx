import React, { useState } from 'react';

export default function Viewer360({ dish }) {
  const [photoIndex, setPhotoIndex] = useState(0);

  if (dish.model_url) {
    return (
      <div className="viewer-container model-viewer-wrap">
        <p className="hint">Glisser pour explorer · AR disponible en bas</p>
        <model-viewer
          src={dish.model_url}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          touch-action="pan-y"
          shadow-intensity="1"
          exposure="1"
          style={{ width: '100%', height: 'min(360px, 55vh)', background: '#f5f5f4' }}
        >
          <button
            slot="ar-button"
            type="button"
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              borderRadius: '20px',
              border: 'none',
              padding: '12px 25px',
              fontWeight: '600',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            }}
          >
            Voir en AR
          </button>
        </model-viewer>
      </div>
    );
  }

  if (dish.photos?.length > 0) {
    return (
      <div className="viewer-container fake-360">
        <img src={dish.photos[photoIndex]} alt="Vue du plat" className="w-100" />
        {dish.photos.length > 1 && (
          <div className="photo-dots">
            {dish.photos.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === photoIndex ? 'active' : ''}
                onClick={() => setPhotoIndex(i)}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}
        <p className="hint">Photos du plat</p>
      </div>
    );
  }

  return <div className="viewer-container empty">Aucune vue disponible</div>;
}

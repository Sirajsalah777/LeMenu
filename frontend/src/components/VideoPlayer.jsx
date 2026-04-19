import React from 'react';

export default function VideoPlayer({ dish }) {
  if (dish.video_url) {
    return (
      <div className="video-container">
        <p className="section-label">Préparation de votre plat</p>
        <video 
          controls 
          className="w-100" 
          poster={dish.photos && dish.photos.length > 0 ? dish.photos[0] : null}
          preload="metadata"
        >
          <source src={dish.video_url} type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>
      </div>
    );
  }

  return (
    <div className="video-container empty">
      <div className="placeholder-card">
        <span className="icon">📷</span>
        <p>Vidéo bientôt disponible</p>
      </div>
    </div>
  );
}

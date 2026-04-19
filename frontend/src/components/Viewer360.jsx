import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={[1.5, 1.5, 1.5]} position={[0, -1, 0]} />;
}

export default function Viewer360({ dish }) {
  const [rotationIndex, setRotationIndex] = useState(0);

  if (dish.model_url) {
    return (
      <div className="viewer-container" style={{ position: 'relative' }}>
        <p className="hint">Glisser pour explorer</p>
        <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Model url={dish.model_url} />
          <OrbitControls autoRotate autoRotateSpeed={1.0} enableZoom={true} />
          <Environment preset="city" />
        </Canvas>

        {/* Model Viewer AR Capabilities */}
        <model-viewer
          src={dish.model_url}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          shadow-intensity="1"
          style={{ width: '100%', height: '20px', position: 'absolute', bottom: '20px', pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}
        >
          <button slot="ar-button" style={{ 
            backgroundColor: 'var(--primary-color)', 
            color: 'white', 
            borderRadius: '20px', 
            border: 'none', 
            padding: '12px 25px', 
            pointerEvents: 'auto',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            fontWeight: '600'
          }}>
            Voir en AR
          </button>
        </model-viewer>
      </div>
    );
  }

  if (dish.photos && dish.photos.length > 0) {
    // Fake 360 viewer with photos
    const handleDrag = (e) => {
      // Logic for cycling photos based on drag
    };
    return (
      <div className="viewer-container fake-360">
        <img src={dish.photos[rotationIndex]} alt="Vue 360" className="w-100" />
        <p className="hint">Faites glisser pour tourner (Photos)</p>
      </div>
    );
  }

  return <div className="viewer-container empty">Aucune vue disponible</div>;
}

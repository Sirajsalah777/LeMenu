import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    let html5QrCode;
    
    if (showScanner) {
      html5QrCode = new Html5Qrcode("reader");
      
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          let targetPath = null;
          let text = decodedText.trim();
          
          try {
              const url = new URL(text);
              targetPath = url.pathname + url.search;
          } catch (e) {
              if (text.startsWith('/')) {
                  targetPath = text;
              } else if (/^[a-zA-Z0-9_-]+$/.test(text)) {
                  targetPath = '/' + text;
              } else {
                  alert("QR Code non reconnu : " + text);
                  return;
              }
          }
          
          if (targetPath) {
              if (targetPath.length > 1 && targetPath.endsWith('/')) {
                  targetPath = targetPath.slice(0, -1);
              }
              html5QrCode.stop().then(() => {
                setShowScanner(false);
                navigate(targetPath);
              }).catch(err => {
                console.warn(err);
                setShowScanner(false);
                navigate(targetPath);
              });
          }
        },
        (errorMessage) => {
          // silent error during scanning
        }
      ).catch((err) => {
        console.warn("Camera start failed callback", err);
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(e => console.warn("Scanner cleanup failed", e));
      }
    };
  }, [showScanner, navigate]);

  return (
    <div className="landing-container">
      <div className="landing-card">
        <div className="landing-logo">LeMenu</div>
        
        <div className="landing-actions">
          {!showScanner ? (
            <>
              <button 
                className="btn-scan-qr"
                onClick={() => setShowScanner(true)}
              >
                <span className="icon-qr"></span>
                Scanner le QR Code
              </button>
            </>
          ) : (
            <div className="scanner-box">
              <div id="reader"></div>
              <button 
                className="btn-cancel"
                onClick={() => setShowScanner(false)}
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        <footer className="landing-footer">
          Scannez le code sur votre table pour commander
        </footer>
      </div>
    </div>
  );
}

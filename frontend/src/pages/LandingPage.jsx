import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        // Assume decodedText is a URL like http://localhost:5173/gusto or http://localhost:5173/gusto?table=5
        try {
            const url = new URL(decodedText);
            const path = url.pathname + url.search;
            scanner.clear();
            setShowScanner(false);
            navigate(path);
        } catch (e) {
            // If not a full URL, try to use it as a path if it starts with /
            if (decodedText.startsWith('/')) {
                scanner.clear();
                setShowScanner(false);
                navigate(decodedText);
            } else {
                alert("QR Code non reconnu : " + decodedText);
            }
        }
      }, (error) => {
        // silent error during scanning
      });

      return () => {
        scanner.clear().catch(e => console.warn("Scanner cleanup failed", e));
      };
    }
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

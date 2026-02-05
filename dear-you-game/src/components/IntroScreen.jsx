import React, { useState, useEffect } from "react";

const IntroScreen = ({ onStart, bgm }) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [cherryBlossoms] = useState(() => {
    const petals = [];
    for (let i = 0; i < 50; i++) {
      petals.push({
        id: i,
        startX: 80 + Math.random() * 40,
        startY: -20 + Math.random() * 80,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 8,
        size: 6 + Math.floor(Math.random() * 4) * 2,
      });
    }
    return petals;
  });

  useEffect(() => {
    // Fade in main content
    setTimeout(() => setFadeIn(true), 200);

    // Show logo with typewriter effect
    setTimeout(() => setLogoVisible(true), 800);

    // Show play button after logo
    setTimeout(() => setButtonVisible(true), 2500);
  }, []);

  useEffect(() => {
    if (bgm && bgm.paused) {
      bgm.play().catch(() => {
        console.log("Autoplay waiting for interaction...");
      });
    }
  }, [bgm]);

  const handlePlayClick = () => {
    // Start BGM on user interaction
    if (bgm) {
      bgm.play().catch(err => console.log("BGM play error:", err));
    }
    onStart();
  };

  const handleLogoClick = (e) => {
    // Prevent double play from container onClick
    e.stopPropagation();
    if (bgm) {
      bgm.play().catch(() => { });
    }
    setShowCreator(false);
    setTimeout(() => setShowCreator(true), 0);
  };

  return (
    <div
      onClick={() => {
        if (bgm && bgm.paused) {
          bgm.play().catch(() => { });
        }
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        zIndex: 10000,
      }}
    >
      {/* Main background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/assets/common/main.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 1.5s ease-in",
        }}
      />

      {/* Cherry Blossom Container */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10001,
        }}
      >
        {cherryBlossoms.map((petal) => (
          <div
            key={petal.id}
            style={{
              position: "absolute",
              left: `${petal.startX}%`,
              top: `${petal.startY}%`,
              width: `${petal.size}px`,
              height: `${petal.size}px`,
              backgroundColor: "#ffb6c1",
              imageRendering: "pixelated",
              boxShadow: `
                1px 0 0 #ff99aa,
                0 1px 0 #ff99aa,
                -1px 0 0 #ffccdd,
                0 -1px 0 #ffccdd,
                2px 2px 4px rgba(255, 105, 180, 0.4)
              `,
              animation: `cherryDiagonal ${petal.duration}s linear ${petal.delay}s infinite`,
              pointerEvents: "none",
            }}
          />
        ))}
      </div>

      {/* Content Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          zIndex: 10002,
        }}
      >
        {/* Main Logo */}
        <div
          style={{
            marginTop: "110px",
            width: logoVisible ? "100%" : "0%",
            maxWidth: "600px",
            transition: "width 2s ease-out",
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {showCreator && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "0",
                transform: "translate(-50%, -110%)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  animation: "float 3s ease-in-out infinite",
                  animationDelay: "0.2s",
                }}
              >
                <img
                  src="/assets/common/creator.png"
                  alt="Creator"
                  style={{
                    width: "140px",
                    height: "auto",
                    imageRendering: "pixelated",
                    animation: "pop 0.2s ease-out",
                  }}
                />
              </div>
            </div>
          )}
          <div
            style={{
              overflow: "hidden",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src="/assets/common/mainlogo.png"
              alt="Game Logo"
              onClick={handleLogoClick}
              style={{
                width: "46vw",
                maxWidth: "330px",
                height: "auto",
                imageRendering: "pixelated",
                filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3))",
                opacity: logoVisible ? 1 : 0,
                transition: "opacity 0.5s ease-in 0.5s",
                animation: logoVisible ? "float 3s ease-in-out infinite" : "none",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </div>

      {/* Play Button */}
      <div
        onClick={handlePlayClick}
        style={{
          position: "absolute",
          bottom: "60px",
          right: "80px",
          cursor: "pointer",
          opacity: buttonVisible ? 1 : 0,
          transition: "opacity 1s ease-in, transform 0.2s",
          animation: buttonVisible ? "pulse 2s ease-in-out infinite" : "none",
          zIndex: 10003,
        }}
      >
        <img
          src="/assets/common/play.png"
          alt="Play Button"
          style={{
            width: "180px",
            height: "auto",
            imageRendering: "pixelated",
            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))",
          }}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes cherryDiagonal {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 0.8; }
          100% { transform: translate(-150vw, 120vh) rotate(-360deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); filter: brightness(1) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4)); }
          50% { transform: scale(1.08); filter: brightness(1.15) drop-shadow(0 6px 12px rgba(255, 255, 255, 0.6)); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default IntroScreen;

import React, { useState, useEffect } from "react";

const TimeWidget = () => {
    const [currentTime, setCurrentTime] = useState(9); // Start at 9:00 AM

    useEffect(() => {
        // Add pixel font to document
        const style = document.createElement("style");
        style.innerHTML = `
      @font-face {
        font-family: 'PixelFont';
        src: url('/assets/fonts/pixelFont.ttf') format('truetype');
      }
    `;
        document.head.appendChild(style);

        // Update time every 10 seconds = 10 minutes in game (2 minutes real = 1 hour game = 20 minutes real for full day)
        const interval = setInterval(() => {
            setCurrentTime((prevTime) => {
                const nextTime = prevTime + 1;
                return nextTime > 18 ? 9 : nextTime;
            });
        }, 10000); // 10 seconds

        return () => {
            clearInterval(interval);
            document.head.removeChild(style);
        };
    }, []);

    // Calculate weather index based on time
    // Morning (9-11): 0, Noon (12-14): 1, Afternoon (15-17): 2, Evening (18): 3
    let weatherIndex = 0;
    if (currentTime >= 9 && currentTime <= 11) weatherIndex = 0;
    else if (currentTime >= 12 && currentTime <= 14) weatherIndex = 1;
    else if (currentTime >= 15 && currentTime <= 17) weatherIndex = 2;
    else weatherIndex = 3;

    // Calculate arrow position for timeline (9-18, 10 slots)
    const timeProgress = ((currentTime - 9) / 9) * 100; // 0% to 100%

    return (
        <div
            style={{
                position: "absolute",
                top: "15px",
                left: "15px",
                zIndex: 200,
                pointerEvents: "none",
            }}
        >
            {/* Time widget background */}
            <div style={{ position: "relative", width: "200px", height: "auto" }}>
                <img
                    src="/assets/common/time.png"
                    alt="Time"
                    style={{
                        width: "200px",
                        height: "auto",
                        imageRendering: "pixelated",
                        filter: "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))",
                    }}
                />

                {/* Time text overlay (top left of widget) */}
                <div
                    style={{
                        position: "absolute",
                        top: "8px",
                        left: "12px",
                        fontFamily: "PixelFont, 'Courier New', monospace",
                        fontSize: "18px",
                        color: "#2c2416",
                        fontWeight: "bold",
                        letterSpacing: "1px",
                    }}
                >
                    {String(currentTime).padStart(2, '0')}:00
                </div>

                {/* Weather icon (uses sprite sheet - top right area) */}
                <div
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "12px",
                        width: "32px",
                        height: "32px",
                        backgroundImage: "url('/assets/common/Weather.png')",
                        backgroundSize: `${4 * 100}% 100%`,
                        backgroundPosition: `${weatherIndex * -100}% 0`,
                        imageRendering: "pixelated",
                    }}
                />

                {/* Arrow indicator on timeline (bottom section) */}
                <img
                    src="/assets/common/arrow.png"
                    alt="Arrow"
                    style={{
                        position: "absolute",
                        bottom: "8px",
                        left: `${10 + timeProgress * 0.75}%`, // Adjust based on timeline width
                        width: "10px",
                        height: "auto",
                        imageRendering: "pixelated",
                        transform: "translateX(-50%)",
                    }}
                />
            </div>
        </div>
    );
};

export default TimeWidget;

import React, { useEffect, useState, useRef, useCallback } from "react";

const CatchBallModal = ({ isOpen, onClose, onWin }) => {
    const [gameState, setGameState] = useState("intro"); // 'intro', 'playing', 'success', 'failed'
    const [currentRound, setCurrentRound] = useState(1); // 1, 2, 3
    const [lives, setLives] = useState(3); // 3 hearts
    const [gaugePosition, setGaugePosition] = useState(0); // 0~100
    const [gaugeDirection, setGaugeDirection] = useState(1); // 1 or -1
    const [fadeIn, setFadeIn] = useState(false);
    const [showResult, setShowResult] = useState(null); // 'success' or 'fail'

    const animationFrameRef = useRef(null);
    const lastTimeRef = useRef(0);

    // Difficulty settings for each round
    const getDifficulty = (round) => {
        switch (round) {
            case 1:
                return {
                    name: "하",
                    image: "ha.png",
                    speed: 1.5,
                    targetMin: 40,
                    targetMax: 60
                };
            case 2:
                return {
                    name: "중",
                    image: "jung.png",
                    speed: 2.5,
                    targetMin: 42,
                    targetMax: 58
                };
            case 3:
                return {
                    name: "상",
                    image: "sang.png",
                    speed: 3.5,
                    targetMin: 45,
                    targetMax: 55
                };
            default:
                return {
                    name: "하",
                    image: "ha.png",
                    speed: 1.5,
                    targetMin: 40,
                    targetMax: 60
                };
        }
    };

    const currentDifficulty = getDifficulty(currentRound);

    const checkHit = useCallback(() => {
        const { targetMin, targetMax } = currentDifficulty;

        if (gaugePosition >= targetMin && gaugePosition <= targetMax) {
            // Success!
            setShowResult("success");
            setGameState("result");

            setTimeout(() => {
                if (currentRound >= 3) {
                    // Game Won!
                    setGameState("success");
                    setTimeout(() => {
                        onWin();
                        onClose();
                    }, 2000);
                } else {
                    // Next round
                    setCurrentRound(prev => prev + 1);
                    setGaugePosition(0);
                    setGaugeDirection(1);
                    setShowResult(null);
                    setGameState("playing");
                }
            }, 1500);
        } else {
            // Failed!
            setShowResult("fail");
            setGameState("result");

            setTimeout(() => {
                const newLives = lives - 1;
                setLives(newLives);

                if (newLives <= 0) {
                    // Game Over
                    setGameState("failed");
                    setTimeout(() => {
                        onClose();
                    }, 2000);
                } else {
                    // Try again same round
                    setGaugePosition(0);
                    setGaugeDirection(1);
                    setShowResult(null);
                    setGameState("playing");
                }
            }, 1500);
        }
    }, [currentDifficulty, gaugePosition, currentRound, lives, onWin, onClose]);

    // Reset game state when modal opens
    useEffect(() => {
        let openTimer = null;
        let fadeTimer = null;

        if (isOpen) {
            openTimer = setTimeout(() => {
                setGameState("intro");
                setCurrentRound(1);
                setLives(3);
                setGaugePosition(0);
                setGaugeDirection(1);
                setShowResult(null);
                setFadeIn(false);
                fadeTimer = setTimeout(() => setFadeIn(true), 50);
            }, 0);
        } else {
            openTimer = setTimeout(() => {
                setGameState("intro");
                setCurrentRound(1);
                setLives(3);
                setGaugePosition(0);
                setShowResult(null);
            }, 0);
        }

        return () => {
            if (openTimer) clearTimeout(openTimer);
            if (fadeTimer) clearTimeout(fadeTimer);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isOpen]);

    // Gauge animation
    useEffect(() => {
        if (gameState !== "playing") {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            return;
        }

        const animate = (currentTime) => {
            const deltaTime = lastTimeRef.current ? currentTime - lastTimeRef.current : 0;
            lastTimeRef.current = currentTime;

            setGaugePosition((prev) => {
                let newPos = prev + (gaugeDirection * currentDifficulty.speed * deltaTime / 16.67);

                if (newPos >= 100) {
                    newPos = 100;
                    setGaugeDirection(-1);
                } else if (newPos <= 0) {
                    newPos = 0;
                    setGaugeDirection(1);
                }

                return newPos;
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameState, gaugeDirection, currentDifficulty.speed]);

    // Handle spacebar press
    useEffect(() => {
        if (gameState !== "playing") return;

        const handleKeyPress = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                checkHit();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [gameState, checkHit]);

    if (!isOpen) return null;

    const handleStartGame = () => {
        setGameState("playing");
        setGaugePosition(0);
        setGaugeDirection(1);
        lastTimeRef.current = 0;
    };

    // Intro Screen
    if (gameState === "intro") {
        return (
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    opacity: fadeIn ? 1 : 0,
                    transition: "opacity 0.3s ease-in",
                }}
            >
                <div
                    style={{
                        width: "500px",
                        minHeight: "400px",
                        backgroundImage: "url('/assets/common/modal1.png')",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "60px 40px",
                        color: "#4E342E",
                        imageRendering: "pixelated",
                        animation: "slideIn 0.4s ease-out",
                    }}
                >
                    {/* Title */}
                    <h2
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "24px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        ⚾ 캐치볼 게임 ⚾
                    </h2>

                    {/* Description */}
                    <div
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "14px",
                            textAlign: "center",
                            lineHeight: "2",
                            marginBottom: "30px",
                            maxWidth: "400px",
                        }}
                    >
                        <p style={{ marginBottom: "15px" }}>
                            🎯 <strong>게임 방법</strong>
                        </p>
                        <p style={{ fontSize: "13px", marginBottom: "8px" }}>
                            • 게이지가 빨간색 구간에 있을 때<br />
                            스페이스바를 눌러 공을 잡으세요!
                        </p>
                        <p style={{ fontSize: "13px", marginBottom: "8px" }}>
                            • 총 3단계를 성공하면 클리어!
                        </p>
                        <p style={{ fontSize: "13px", marginBottom: "8px" }}>
                            • 실패하면 하트 1개가 깎입니다
                        </p>
                        <p style={{ fontSize: "13px" }}>
                            • 하트가 모두 사라지면 게임 오버!
                        </p>
                    </div>

                    {/* Start Button (Image) */}
                    <img
                        src="/assets/common/o.png"
                        alt="시작"
                        onClick={handleStartGame}
                        style={{
                            width: "60px",
                            height: "60px",
                            cursor: "pointer",
                            imageRendering: "pixelated",
                            transition: "transform 0.1s",
                        }}
                        onMouseDown={(e) => {
                            e.target.style.transform = "scale(0.95)";
                        }}
                        onMouseUp={(e) => {
                            e.target.style.transform = "scale(1)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                        }}
                    />

                    {/* CSS Animations */}
                    <style>{`
            @keyframes slideIn {
              from {
                transform: translateY(-50px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
                </div>
            </div>
        );
    }

    // Success Screen
    if (gameState === "success") {
        return (
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                    backgroundColor: "rgba(0,0,0,0.7)",
                }}
            >
                <div
                    style={{
                        width: "400px",
                        minHeight: "300px",
                        backgroundImage: "url('/assets/common/modal1.png')",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px",
                        color: "#4E342E",
                        imageRendering: "pixelated",
                        animation: "celebration 0.6s ease-out",
                    }}
                >
                    <h2
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "32px",
                            marginBottom: "20px",
                            animation: "bounce 0.5s infinite",
                        }}
                    >
                        🎉 성공! 🎉
                    </h2>
                    <p
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "16px",
                            textAlign: "center",
                        }}
                    >
                        캐치볼에 성공했습니다!<br />
                        ⚾ 홈런! ⚾
                    </p>

                    <style>{`
            @keyframes celebration {
              0% {
                transform: scale(0.8);
                opacity: 0;
              }
              50% {
                transform: scale(1.1);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            @keyframes bounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-10px);
              }
            }
          `}</style>
                </div>
            </div>
        );
    }

    // Failed Screen
    if (gameState === "failed") {
        return (
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                    backgroundColor: "rgba(0,0,0,0.7)",
                }}
            >
                <div
                    style={{
                        width: "400px",
                        minHeight: "300px",
                        backgroundImage: "url('/assets/common/modal1.png')",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px",
                        color: "#4E342E",
                        imageRendering: "pixelated",
                    }}
                >
                    <h2
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "28px",
                            marginBottom: "20px",
                        }}
                    >
                        😢 실패...
                    </h2>
                    <p
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "14px",
                            textAlign: "center",
                        }}
                    >
                        다음엔 더 잘할 수 있을 거예요!
                    </p>
                </div>
            </div>
        );
    }

    // Playing or Result Screen
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                backgroundColor: "rgba(0,0,0,0.5)",
            }}
        >
            <div
                style={{
                    width: "500px",
                    minHeight: "350px",
                    backgroundImage: "url('/assets/common/modal1.png')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "50px 40px",
                    color: "#4E342E",
                    imageRendering: "pixelated",
                }}
            >
                {/* Lives Display */}
                <div style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px",
                    position: "absolute",
                    top: "30px"
                }}>
                    {[1, 2, 3].map((i) => (
                        <img
                            key={i}
                            src={i <= lives ? "/assets/common/heart.png" : "/assets/common/broken.png"}
                            alt={i <= lives ? "heart" : "broken"}
                            style={{
                                width: "28px",
                                height: "28px",
                                imageRendering: "pixelated",
                            }}
                        />
                    ))}
                </div>

                {/* Round and Difficulty */}
                <div style={{
                    marginTop: "40px",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    <h3
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "18px",
                            marginBottom: "10px",
                        }}
                    >
                        {currentRound}단계 / 3단계
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <span style={{ fontFamily: "Galmuri", fontSize: "14px" }}>난이도:</span>
                        <img
                            src={`/assets/ground/${currentDifficulty.image}`}
                            alt={currentDifficulty.name}
                            style={{
                                height: "20px",
                                imageRendering: "pixelated",
                            }}
                        />
                    </div>
                </div>

                {/* Gauge Container */}
                <div
                    style={{
                        width: "400px",
                        height: "40px",
                        position: "relative",
                        marginBottom: "30px",
                    }}
                >
                    {/* Base Bar */}
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundImage: "url('/assets/ground/bar.png')",
                            backgroundSize: "100% 100%",
                            imageRendering: "pixelated",
                            position: "absolute",
                            border: "3px solid #4E342E",
                        }}
                    />

                    {/* Target Zone (Red) */}
                    <div
                        style={{
                            position: "absolute",
                            left: `${currentDifficulty.targetMin}%`,
                            width: `${currentDifficulty.targetMax - currentDifficulty.targetMin}%`,
                            height: "100%",
                            backgroundColor: "rgba(255, 50, 50, 0.6)",
                            border: "2px solid #ff0000",
                            zIndex: 1,
                        }}
                    />

                    {/* Moving Indicator */}
                    <div
                        style={{
                            position: "absolute",
                            left: `${gaugePosition}%`,
                            top: "-8px",
                            width: "6px",
                            height: "calc(100% + 16px)",
                            backgroundColor: "#FFD700",
                            border: "2px solid #000",
                            zIndex: 2,
                            transform: "translateX(-50%)",
                            boxShadow: "0 0 10px rgba(255, 215, 0, 0.8)",
                        }}
                    />
                </div>

                {/* Instructions or Result Message */}
                {showResult === null && (
                    <p
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "14px",
                            textAlign: "center",
                            marginBottom: "20px",
                        }}
                    >
                        빨간색 구간에서 <strong>스페이스바</strong>를 누르세요!
                    </p>
                )}

                {showResult === "success" && (
                    <p
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "18px",
                            textAlign: "center",
                            marginBottom: "20px",
                            color: "#2E7D32",
                            fontWeight: "bold",
                            animation: "successPop 0.3s ease-out",
                        }}
                    >
                        ⚾ 성공! 멋진 캐치! ⚾
                    </p>
                )}

                {showResult === "fail" && (
                    <p
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "18px",
                            textAlign: "center",
                            marginBottom: "20px",
                            color: "#C62828",
                            fontWeight: "bold",
                            animation: "failShake 0.3s ease-out",
                        }}
                    >
                        💔 아쉽... 다시 시도! 💔
                    </p>
                )}

                {gameState === "playing" && showResult === null && (
                    <button
                        onClick={onClose}
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "10px",
                            padding: "7px 14px",
                            backgroundColor: "#666",
                            color: "#fff",
                            border: "2px solid #4E342E",
                            cursor: "pointer",
                            fontWeight: "bold",
                            marginTop: "10px",
                        }}
                    >
                        포기
                    </button>
                )}

                <style>{`
          @keyframes successPop {
            0% {
              transform: scale(0.5);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes failShake {
            0%, 100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-10px);
            }
            75% {
              transform: translateX(10px);
            }
          }
        `}</style>
            </div>
        </div>
    );
};

export default CatchBallModal;

import React, { useState, useEffect, useCallback, useRef } from "react";

const EatingGameModal = ({ isOpen, onClose, onWin }) => {
    const [gameState, setGameState] = useState("intro"); // intro, playing, won, lost
    const [playerFood, setPlayerFood] = useState(100);
    const [enemyFood, setEnemyFood] = useState(100);
    const [lives, setLives] = useState(3);
    const [currentKey, setCurrentKey] = useState(null);
    const [feedback, setFeedback] = useState("");
    const startBtnRef = useRef(null);

    const keyMap = {
        ArrowUp: "위",
        ArrowDown: "아래",
        ArrowLeft: "왼쪽",
        ArrowRight: "오른쪽",
    };
    const currentKeyLabel = currentKey ? keyMap[currentKey] : "";

    const getRandomKey = () => {
        const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        return keys[Math.floor(Math.random() * keys.length)];
    };

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            setGameState("intro");
            setPlayerFood(100);
            setEnemyFood(100);
            setLives(3);
            setFeedback("");
            setCurrentKey(getRandomKey());
        }, 0);
        return () => clearTimeout(timer);
    }, [isOpen]);

    const resetGame = useCallback(() => {
        setGameState("intro");
        setPlayerFood(100);
        setEnemyFood(100);
        setLives(3);
        setFeedback("");
        setCurrentKey(getRandomKey());
    }, []);

    const startGame = useCallback(() => {
        setGameState("playing");
    }, []);

    useEffect(() => {
        const handleStartKey = (e) => {
            if (isOpen && gameState === "intro" && e.key.toLowerCase() === "o") {
                startGame();
            }
        };
        window.addEventListener("keydown", handleStartKey);
        return () => window.removeEventListener("keydown", handleStartKey);
    }, [isOpen, gameState, startGame]);

    useEffect(() => {
        if (gameState !== "playing") return;
        const interval = setInterval(() => {
            setEnemyFood((prev) => {
                const next = prev - 0.7;
                if (next <= 0) {
                    setGameState("lost");
                    return 0;
                }
                return next;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [gameState]);

    const handleKeyDown = useCallback((e) => {
        if (gameState !== "playing") return;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
            if (e.key === currentKey) {
                setPlayerFood((prev) => {
                    const next = prev - 5;
                    if (next <= 0) {
                        setGameState("won");
                        return 0;
                    }
                    return next;
                });
                setCurrentKey(getRandomKey());
                setFeedback("좋아!");
                setTimeout(() => setFeedback(""), 200);
            } else {
                setLives((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        setGameState("lost");
                    }
                    return next;
                });
                setFeedback("실수!");
                setTimeout(() => setFeedback(""), 200);
            }
        }
    }, [gameState, currentKey]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (gameState === "won") {
            setTimeout(() => {
                onWin();
                onClose();
            }, 2000);
        }
    }, [gameState, onWin, onClose]);

    if (!isOpen) return null;



    // Intro Screen with O button
    if (gameState === "intro") {
        return (
            <div style={modalOverlayStyle(true)}>
                <div style={modalContentStyle}>
                    <h2 style={titleStyle}>먹방 대결!</h2>
                    <p style={descStyle}>
                        배서연과 먹기 대결을 합니다!<br />
                        화면에 나타나는 <strong>방향키</strong>를 빠르게 눌러주세요.<br />
                        틀리면 <strong>목숨</strong>이 줄어듭니다.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <div style={{ ...descStyle, marginBottom: "0" }}>
                            아래 버튼을 눌러 시작하세요!
                        </div>
                        <img
                            src="/assets/common/o.png"
                            alt="Start Button"
                            ref={startBtnRef}
                            style={{
                                width: "40px",
                                cursor: "pointer",
                                transition: "transform 0.1s",
                                imageRendering: "pixelated"
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
                            onMouseUp={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                startGame();
                            }}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Won/Lost screens serve as overlays or replacements? 
    // The current code replaces the whole modal content. 
    // I will keep the structure but ensure consistent styling if needed.
    if (gameState === "won") {
        return (
            <div style={modalOverlayStyle(true)}>
                <div style={modalContentStyle}>
                    <h2 style={titleStyle}>성공!</h2>
                    <p style={descStyle}>맛있게 다 먹었습니다!</p>
                </div>
            </div>
        );
    }

    if (gameState === "lost") {
        return (
            <div style={modalOverlayStyle(true)}>
                <div style={modalContentStyle}>
                    <h2 style={titleStyle}>실패...</h2>
                    <p style={descStyle}>배가 너무 아파요. 다시 도전해볼까요?</p>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={resetGame} style={primaryBtnStyle}>다시 하기</button>
                        <button onClick={onClose} style={secondaryBtnStyle}>나가기</button>
                    </div>
                </div>
            </div>
        );
    }

    // Playing State Layout
    return (
        <div style={modalOverlayStyle(true)}>
            <div style={{ ...modalContentStyle, width: "600px", minHeight: "400px", padding: "26px" }}>
                {/* Header: Lives and Total Progress (Optional, removing progress text as user wants bars) */}
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                        {[1, 2, 3].map((i) => (
                            <img
                                key={i}
                                src={lives >= i ? "/assets/common/heart.png" : "/assets/common/broken.png"}
                                alt="heart"
                                style={{ width: "24px", height: "24px" }}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Game Area Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 1fr",
                    width: "100%",
                    alignItems: "end", // Align items to bottom of their cells
                    gap: "10px"
                }}>

                    {/* Left Column: BSY */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontSize: "16px", marginBottom: "6px", color: "#4E342E", fontWeight: "bold" }}>배서연</div>
                        {/* Gauge Bar */}
                        <div style={{ width: "100%", height: "16px", backgroundColor: "#333", border: "2px solid #4E342E", marginBottom: "12px", position: "relative" }}>
                            <div style={{
                                width: `${enemyFood}%`,
                                height: "100%",
                                backgroundColor: "#d84315", // Red/Orange for enemy
                                transition: "width 0.1s linear"
                            }}></div>
                        </div>

                        {/* Character Container */}
                        <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
                            <img
                                src="/assets/common/character/bsy_idle.png"
                                style={{ width: "96px", imageRendering: "pixelated", zIndex: 1 }}
                                alt="배서연"
                            />
                            {/* Food: Starts big, shrinks to 0 */}
                            <img
                                src="/assets/kaimaru/spaghetti.png"
                                style={{
                                    position: "absolute",
                                    bottom: "0px",
                                    left: "50%",
                                    width: "64px", // Base size
                                    imageRendering: "pixelated",
                                    transform: `translateX(-50%) scale(${(enemyFood / 100) * 1.5})`, // Scale 1.5 -> 0
                                    transformOrigin: "bottom center",
                                    opacity: enemyFood > 0 ? 1 : 0,
                                    transition: "transform 0.1s",
                                    zIndex: 2 // Overlay on character? Or base? User said "Food icons large... shrinks" usually implies getting eaten. Let's put in front.
                                }}
                                alt="Spaghetti"
                            />
                        </div>
                    </div>

                    {/* Center Column: VS and Key Prompt */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", paddingBottom: "20px" }}>
                        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4E342E", marginBottom: "20px" }}>VS</div>

                        {/* Key Prompt Area */}
                        {gameState === "playing" && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                                <div style={{
                                    width: "60px",
                                    height: "60px",
                                    backgroundColor: "#fff",
                                    border: "3px solid #4E342E",
                                    borderRadius: "10px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: "5px",
                                    boxShadow: "0 4px 0 #4E342E"
                                }}
                                title={currentKeyLabel}
                                aria-label={currentKeyLabel}
                                >
                                    {/* Render Arrow Icon based on key */}
                                    <span style={{ fontSize: "32px", fontWeight: "bold", color: "#333" }}>
                                        {currentKey === "ArrowUp" && "↑"}
                                        {currentKey === "ArrowDown" && "↓"}
                                        {currentKey === "ArrowLeft" && "←"}
                                        {currentKey === "ArrowRight" && "→"}
                                    </span>
                                </div>
                                <div style={{
                                    position: "absolute",
                                    top: "100%", // Below the key box
                                    marginTop: "8px",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    color: feedback === "좋아!" ? "green" : "red",
                                    whiteSpace: "nowrap"
                                }}>
                                    {feedback}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Player */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontSize: "16px", marginBottom: "6px", color: "#4E342E", fontWeight: "bold" }}>나</div>
                        {/* Gauge Bar */}
                        <div style={{ width: "100%", height: "16px", backgroundColor: "#333", border: "2px solid #4E342E", marginBottom: "12px", position: "relative" }}>
                            <div style={{
                                width: `${playerFood}%`,
                                height: "100%",
                                backgroundColor: "#2e7d32", // Green for player
                                transition: "width 0.1s linear"
                            }}></div>
                        </div>

                        {/* Character Container */}
                        <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
                            <div style={{
                                width: "20px",
                                height: "20px",
                                backgroundImage: "url(/assets/common/character/main_character.png)",
                                backgroundPosition: "0px 0px",
                                backgroundSize: "580px 20px",
                                imageRendering: "pixelated",
                                transform: "scale(5)", // 20*5 = 100px width approximately
                                transformOrigin: "bottom center",
                                marginBottom: "0px",
                                zIndex: 1
                            }}></div>

                            {/* Food: Starts big, shrinks to 0 */}
                            <img
                                src="/assets/kaimaru/taco.png"
                                style={{
                                    position: "absolute",
                                    bottom: "0px",
                                    left: "50%",
                                    width: "64px", // Base size
                                    imageRendering: "pixelated",
                                    transform: `translateX(-50%) scale(${(playerFood / 100) * 1.5})`, // Scale 1.5 -> 0
                                    transformOrigin: "bottom center",
                                    opacity: playerFood > 0 ? 1 : 0,
                                    transition: "transform 0.1s",
                                    zIndex: 2
                                }}
                                alt="Taco"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EatingGameModal;

const modalOverlayStyle = (visible) => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    opacity: visible ? 1 : 0,
    transition: "opacity 0.3s",
    fontFamily: "Galmuri11-Bold",
});

const modalContentStyle = {
    backgroundImage: "url('/assets/common/modal1.png')",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "460px",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    imageRendering: "pixelated",
};

const titleStyle = {
    fontFamily: "Galmuri11-Bold",
    fontSize: "18px",
    marginBottom: "12px",
    textAlign: "center",
    color: "#4E342E",
};

const descStyle = {
    fontFamily: "Galmuri11-Bold",
    fontSize: "12px",
    textAlign: "center",
    lineHeight: "1.5",
    marginBottom: "16px",
    color: "#4E342E",
};

const primaryBtnStyle = {
    fontFamily: "Galmuri11-Bold",
    fontSize: "12px",
    padding: "8px 14px",
    backgroundColor: "#fff",
    color: "#4E342E",
    border: "2px solid #4E342E",
    cursor: "pointer",
};

const secondaryBtnStyle = {
    fontFamily: "Galmuri11-Bold",
    fontSize: "12px",
    padding: "8px 14px",
    backgroundColor: "#d7ccc8",
    color: "#4E342E",
    border: "2px solid #4E342E",
    cursor: "pointer",
};

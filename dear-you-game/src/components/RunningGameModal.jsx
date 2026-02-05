import React, { useState, useEffect, useRef, useCallback } from "react";

const RunningGameModal = ({ isOpen, onClose, onWin }) => {
    const [gameState, setGameState] = useState("idle"); // idle, playing, finished
    const [countDown, setCountDown] = useState(3);
    const [playerPos, setPlayerPos] = useState(0); // 0 to 100 (%)
    const [itbPos, setItbPos] = useState(0); // 0 to 100 (%)
    const [result, setResult] = useState(null); // 'win' or 'lose'

    const playerVelocity = useRef(0);
    const finishLine = 90; // Finish at 90%
    const gameLoopRef = useRef(null);

    // Constants
    const FRICTION = 0.5;
    const SPEED_BOOST = 3.0; // Speed added per spacebar press
    const MAX_SPEED = 5;
    const ITB_SPEED = 0.9; // Increased speed

    const resetGame = useCallback(() => {
        setGameState("idle");
        setCountDown(3);
        setPlayerPos(0);
        setItbPos(0);
        setResult(null);
        playerVelocity.current = 0;
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (!isOpen) return;
        let countdown = null;
        const timer = setTimeout(() => {
            resetGame();
            countdown = setInterval(() => {
                setCountDown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdown);
                        setGameState("playing");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            gameLoopRef.current = countdown;
        }, 0);

        return () => {
            clearTimeout(timer);
            if (countdown) clearInterval(countdown);
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
                gameLoopRef.current = null;
            }
        };
    }, [isOpen, resetGame]);

    const endGame = useCallback((res) => {
        setGameState("finished");
        setResult(res);
        cancelAnimationFrame(gameLoopRef.current);
        if (res === "win") {
            setTimeout(() => {
                if (onWin) onWin();
            }, 100);
        }
    }, [onWin]);

    // Game Loop
    useEffect(() => {
        if (gameState !== "playing") return;

        const loop = () => {
            // Move Player
            setPlayerPos((prev) => {
                const next = prev + (playerVelocity.current * 0.1); // Scale factor
                if (next >= finishLine) {
                    endGame("win");
                    return finishLine;
                }
                return next;
            });

            // Move ITB
            setItbPos((prev) => {
                if (playerPos >= finishLine) return prev; // If player won, stop ITB update (handled in endGame but just in case)

                // ITB accelerates slightly near the end? No, constant for now.
                const next = prev + (ITB_SPEED * 0.1);
                if (next >= finishLine) {
                    endGame("lose");
                    return finishLine;
                }
                return next;
            });

            // Friction
            playerVelocity.current = Math.max(0, playerVelocity.current - FRICTION * 0.1);

            gameLoopRef.current = requestAnimationFrame(loop);
        };

        gameLoopRef.current = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameState, endGame, finishLine, ITB_SPEED, playerPos]);

    /*

    const endGame = (res) => {
        setGameState("finished");
        setResult(res);
        cancelAnimationFrame(gameLoopRef.current);
        if (res === "win") {
            setTimeout(() => {
                alert("승리!");
                if (onWin) onWin();
            }, 100);
        }
    };

    */
    // Input Handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState === "playing" && e.code === "Space") {
                playerVelocity.current = Math.min(playerVelocity.current + SPEED_BOOST, MAX_SPEED);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameState]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 2000,
                fontFamily: "Galmuri11-Bold",
            }}
        >
            <div
                style={{
                    width: "600px",
                    height: "350px",
                    backgroundColor: "#8bc34a", // Grass color
                    backgroundImage: "url('/assets/ground/grass.png')",
                    backgroundSize: "64px",
                    position: "relative",
                    border: "4px solid #fff",
                    borderRadius: "12px",
                    overflow: "hidden",
                    imageRendering: "pixelated",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                }}
            >
                {/* Title / Header */}
                <div style={{
                    position: "absolute",
                    top: "20px",
                    left: "0",
                    width: "100%",
                    textAlign: "center",
                    color: "white",
                    textShadow: "2px 2px 0 #000",
                    fontSize: "24px",
                    zIndex: 10
                }}>
                    {gameState === 'idle' ? `준비... ${countDown}` : gameState === 'playing' ? "스페이스바를 연타하세요!" : result === 'win' ? "승리!" : "패배..."}
                </div>

                {/* Tracks */}
                <div style={{
                    position: "absolute",
                    top: "100px",
                    left: "0",
                    width: "100%",
                    height: "160px",
                    // backgroundImage: "url('/assets/ground/track_tile.png')",
                    // Let's make 2 lanes
                }}>
                    {/* Lane 1 (Player) */}
                    <div style={{
                        position: "absolute",
                        top: "10px",
                        left: "0",
                        width: "100%",
                        height: "60px",
                        backgroundColor: "#d2b48c", // Dirt/Track color
                        backgroundImage: "url('/assets/ground/track_tile.png')",
                        backgroundSize: "contain",
                        backgroundRepeat: "repeat-x"
                    }} />

                    {/* Lane 2 (ITB) */}
                    <div style={{
                        position: "absolute",
                        top: "90px",
                        left: "0",
                        width: "100%",
                        height: "60px",
                        backgroundColor: "#d2b48c",
                        backgroundImage: "url('/assets/ground/track_tile.png')",
                        backgroundSize: "contain",
                        backgroundRepeat: "repeat-x"
                    }} />

                    {/* Finish Line */}
                    <div style={{
                        position: "absolute",
                        top: "0",
                        left: `${finishLine}%`,
                        width: "10px",
                        height: "100%",
                        backgroundImage: "repeating-linear-gradient(0deg, #fff, #fff 10px, #000 10px, #000 20px)",
                        opacity: 0.8
                    }} />

                    {/* Player Character */}
                    <div style={{
                        position: "absolute",
                        top: "15px",
                        left: `${playerPos}%`,
                        width: "20px",
                        height: "20px",
                        backgroundImage: "url('/assets/common/character/main_character.png')",
                        backgroundPosition: "-380px 0",
                        backgroundSize: "580px 20px",
                        transform: "scale(2.5)",
                        transformOrigin: "bottom center",
                        imageRendering: "pixelated",
                        transition: "left 0.05s linear",
                        animation: gameState === 'playing' ? "playerRun 0.6s steps(1) infinite" : "none"
                    }} />
                    <div style={{
                        position: "absolute",
                        top: "65px",
                        left: `${playerPos}%`,
                        width: "100px",
                        textAlign: "center",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: "bold",
                        textShadow: "1px 1px 0 #000",
                        transform: "translateX(-40px)"
                    }}>나</div>

                    {/* ITB Character */}
                    <div style={{
                        position: "absolute",
                        top: "95px",
                        left: `${itbPos}%`,
                        width: "20px",
                        height: "20px",
                        backgroundImage: "url('/assets/common/character/itb.png')",
                        backgroundPosition: "0 0",
                        backgroundSize: "auto 20px",
                        transform: "scale(2.5)",
                        transformOrigin: "bottom center",
                        imageRendering: "pixelated",
                        transition: "left 0.05s linear",
                        animation: gameState === 'playing' ? "runBounce 0.2s infinite alternate" : "none"
                    }} />
                    <div style={{
                        position: "absolute",
                        top: "145px",
                        left: `${itbPos}%`,
                        width: "100px",
                        textAlign: "center",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: "bold",
                        textShadow: "1px 1px 0 #000",
                        transform: "translateX(-40px)"
                    }}>ITB</div>

                </div>

                <style>{`
                    @keyframes playerRun {
                        0% { background-position: -380px 0; }
                        16.6% { background-position: -400px 0; }
                        33.3% { background-position: -420px 0; }
                        50% { background-position: -380px 0; }
                        66.6% { background-position: -440px 0; }
                        83.3% { background-position: -460px 0; }
                        100% { background-position: -380px 0; }
                    }
                    @keyframes runBounce {
                        0% { transform: scale(2.5) translateY(0); }
                        100% { transform: scale(2.5) translateY(-2px); }
                    }
                `}</style>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "transparent",
                        border: "none",
                        color: "white",
                        fontSize: "20px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        textShadow: "1px 1px 2px black"
                    }}
                >
                    X
                </button>

                {gameState === 'finished' && (
                    <div style={{
                        position: "absolute",
                        bottom: "30px",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px"
                    }}>
                        <button
                            onClick={() => {
                                resetGame();
                            }}
                            style={{
                                padding: "10px 20px",
                                fontFamily: "Galmuri11-Bold",
                                fontSize: "16px",
                                cursor: "pointer",
                                backgroundColor: "#fff",
                                border: "2px solid #000",
                                borderRadius: "8px"
                            }}
                        >
                            다시 하기
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RunningGameModal;

import React, { useEffect, useState, useRef } from "react";

const MiniGameModal = ({ isOpen, onClose, onWin }) => {
    const [gameState, setGameState] = useState("intro"); // 'intro', 'playing', 'success'
    const [volume, setVolume] = useState(0);
    const [message, setMessage] = useState("소리를 질러보세요!");
    const [permission, setPermission] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);
    const rafIdRef = useRef(null);

    const WIN_THRESHOLD = 50;

    // Reset game state when modal opens
    useEffect(() => {
        let openTimer = null;
        let fadeTimer = null;

        if (isOpen) {
            openTimer = setTimeout(() => {
                setGameState("intro");
                setFadeIn(false);
                fadeTimer = setTimeout(() => setFadeIn(true), 50);
            }, 0);
        } else {
            // Cleanup when closing
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (sourceRef.current) sourceRef.current.disconnect();
            openTimer = setTimeout(() => {
                setGameState("intro");
                setPermission(false);
                setVolume(0);
            }, 0);
        }

        return () => {
            if (openTimer) clearTimeout(openTimer);
            if (fadeTimer) clearTimeout(fadeTimer);
        };
    }, [isOpen]);

    useEffect(() => {
        if (gameState !== "playing") return;

        const handleWin = () => {
            setGameState("success");
            setMessage("성공!");
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            setTimeout(() => {
                onWin();
                onClose();
            }, 2500);
        };

        const detectVolume = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            const array = dataArrayRef.current;
            let sum = 0;
            for (let i = 0; i < array.length; i++) {
                sum += array[i];
            }
            const average = sum / array.length;
            const normalizedVolume = Math.min(100, (average / 128) * 100);

            setVolume(normalizedVolume);

            if (normalizedVolume > WIN_THRESHOLD) {
                handleWin();
                return;
            }

            rafIdRef.current = requestAnimationFrame(detectVolume);
        };

        const initAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                setPermission(true);

                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioContext = new AudioContext();

                // Resume logic for browsers that suspend default audio
                if (audioContext.state === "suspended") {
                    await audioContext.resume();
                }

                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);

                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                source.connect(analyser);

                audioContextRef.current = audioContext;
                analyserRef.current = analyser;
                dataArrayRef.current = dataArray;
                sourceRef.current = source;

                detectVolume();
            } catch (err) {
                console.error("Microphone access denied:", err);
                setMessage("마이크 권한이 필요합니다.");
            }
        };

        initAudio();

        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (sourceRef.current) sourceRef.current.disconnect();
        };
    }, [gameState, onWin, onClose, WIN_THRESHOLD]);

    if (!isOpen) return null;

    const handleStartGame = () => {
        setGameState("playing");
        setMessage("소리를 질러보세요!");
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
                        width: "420px",
                        minHeight: "320px",
                        backgroundImage: "url('/assets/common/minigame_modal.png')",
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
                        animation: "slideIn 0.4s ease-out",
                    }}
                >
                    {/* Logo */}
                    <img
                        src="/assets/dormitory/logo.png"
                        alt="Mini Game Logo"
                        style={{
                            width: "340px",
                            height: "auto",
                            marginBottom: "30px",
                            imageRendering: "pixelated",
                            animation: "bounce 1s ease-in-out infinite",
                        }}
                    />

                    {/* Description */}
                    <p
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "14px",
                            textAlign: "center",
                            lineHeight: "1.8",
                            marginBottom: "30px",
                            maxWidth: "350px",
                        }}
                    >
                        103호의 말 소리가 너무 커서<br />
                        잘 안들린듯 하다..<br />
                        그렇다면 방법은....
                    </p>

                    {/* Start Button */}
                    <button
                        onClick={handleStartGame}
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "14px",
                            padding: "10px 28px",
                            backgroundColor: "#ff6b35",
                            color: "#4E342E",
                            border: "4px solid #fff",
                            borderRadius: "0",
                            cursor: "pointer",
                            fontWeight: "bold",
                            boxShadow: "0 4px 0 #c44520",
                            transition: "all 0.1s",
                            imageRendering: "pixelated",
                        }}
                        onMouseDown={(e) => {
                            e.target.style.transform = "translateY(4px)";
                            e.target.style.boxShadow = "0 0 0 #c44520";
                        }}
                        onMouseUp={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 4px 0 #c44520";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 4px 0 #c44520";
                        }}
                    >
                        시작하기!
                    </button>

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

    // Playing or Success Screen
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
                    width: "340px",
                    height: "250px",
                    backgroundImage: "url('/assets/common/minigame_modal.png')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    color: "#4E342E",
                    imageRendering: "pixelated",
                    animation: gameState === "success" ? "successPulse 0.6s ease-out" : "none",
                }}
            >
                <h2
                    style={{
                        marginBottom: "20px",
                        fontFamily: "Galmuri",
                        fontSize: gameState === "success" ? "28px" : "20px",
                        transition: "font-size 0.3s",
                    }}
                >
                    {message}
                </h2>

                {permission && gameState === "playing" && (
                    <div
                        style={{
                            width: "180px",
                            height: "26px",
                            border: "2px solid #4E342E",
                            marginBottom: "20px",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.min(volume, 100)}%`,
                                height: "100%",
                                backgroundColor: volume > WIN_THRESHOLD ? "#4caf50" : "#f44336",
                                transition: "width 0.1s linear, background-color 0.2s",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                left: `${WIN_THRESHOLD}%`,
                                top: 0,
                                bottom: 0,
                                width: "2px",
                                backgroundColor: "yellow",
                            }}
                        />
                    </div>
                )}

                {gameState === "playing" && (
                    <button
                        onClick={onClose}
                        style={{
                            fontFamily: "Galmuri",
                            fontSize: "10px",
                            padding: "7px 14px",
                            backgroundColor: "#666",
                            color: "#4E342E",
                            border: "2px solid #4E342E",
                            cursor: "pointer",
                            fontWeight: "bold",
                            marginTop: "20px",
                        }}
                    >
                        닫기
                    </button>
                )}

                <style>{`
          @keyframes successPulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
            </div>
        </div>
    );
};

export default MiniGameModal;

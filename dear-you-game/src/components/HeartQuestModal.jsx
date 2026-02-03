import React, { useState, useEffect } from "react";

const HeartQuestModal = ({ isOpen, onClose, onWin, onFail }) => {
    const [lives, setLives] = useState(3);
    const [breakingIndex, setBreakingIndex] = useState(null);
    const [level, setLevel] = useState(1); // 1: Easy, 2: Medium, 3: Hard
    const [problem, setProblem] = useState(null);
    const [options, setOptions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isGameOver, setIsGameOver] = useState(false);

    const generateProblem = (currentLevel) => {
        let num1, num2, answer, operator;

        switch (currentLevel) {
            case 1: // Easy: Addition (1-10)
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                operator = "+";
                answer = num1 + num2;
                setTimeLeft(10);
                break;
            case 2: // Medium: Subtraction (10-30) or Multiplication (2-9)
                if (Math.random() > 0.5) {
                    num1 = Math.floor(Math.random() * 20) + 10;
                    num2 = Math.floor(Math.random() * 10) + 1;
                    operator = "-";
                    answer = num1 - num2;
                } else {
                    num1 = Math.floor(Math.random() * 8) + 2;
                    num2 = Math.floor(Math.random() * 8) + 2;
                    operator = "x";
                    answer = num1 * num2;
                }
                setTimeLeft(8);
                break;
            case 3: // Hard: Mixed Operation (e.g. A + B - C)
                num1 = Math.floor(Math.random() * 20) + 10;
                num2 = Math.floor(Math.random() * 10) + 5;
                const num3 = Math.floor(Math.random() * 10) + 1;
                operator = `+ ${num2} - ${num3}`; // visual only
                answer = num1 + num2 - num3;
                setTimeLeft(5);
                break;
            default:
                break;
        }

        // Generate options
        const newOptions = new Set([answer]);
        while (newOptions.size < 3) {
            const offset = Math.floor(Math.random() * 10) - 5; // -5 to +4
            if (offset !== 0) {
                newOptions.add(answer + offset);
            }
        }

        // Shuffle options
        const shuffledOptions = Array.from(newOptions).sort(() => Math.random() - 0.5);

        setProblem({
            text: currentLevel === 3 ? `${num1} ${operator} = ?` : `${num1} ${operator} ${num2} = ?`,
            answer
        });
        setOptions(shuffledOptions);
    };

    useEffect(() => {
        if (isOpen) {
            resetGame();
        }
    }, [isOpen]);

    const resetGame = () => {
        setLives(3);
        setBreakingIndex(null);
        setLevel(1);
        setIsGameOver(false);
        generateProblem(1);
    };

    useEffect(() => {
        if (!isOpen || lives <= 0 || isGameOver) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleWrongAnswer();
                    return prev;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, lives, problem, isGameOver]);

    const handleAnswer = (selectedAmount) => {
        if (selectedAmount === problem.answer) {
            if (level < 3) {
                setLevel((prev) => {
                    const next = prev + 1;
                    generateProblem(next);
                    return next;
                });
            } else {
                if (onWin) onWin();
                onClose();
            }
        } else {
            handleWrongAnswer();
        }
    };

    const handleWrongAnswer = () => {
        if (lives > 0) {
            const targetIndex = lives - 1;
            setBreakingIndex(targetIndex);

            setTimeout(() => {
                setLives((prev) => prev - 1);
                setBreakingIndex(null);
                if (lives - 1 === 0) {
                    setIsGameOver(true);
                    if (onFail) onFail();
                    setProblem(null);
                } else {
                    generateProblem(level);
                }
            }, 500);
        }
    };

    if (!isOpen) return null;

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
                zIndex: 2000,
                backgroundColor: "rgba(0,0,0,0.5)",
            }}
        >
            <div
                style={{
                    width: "360px",
                    minHeight: "280px",
                    backgroundImage: "url('/assets/common/heartdialog.png')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "40px",
                    position: "relative",
                    imageRendering: "pixelated",
                }}
            >
                {/* Hearts Container - Moved slightly up and right based on image feedback */}
                <div
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "24px",
                        display: "flex",
                        gap: "4px",
                    }}
                >
                    {Array.from({ length: 3 }).map((_, i) => {
                        let isBroken = i >= lives;
                        if (i === breakingIndex) isBroken = false;

                        return (
                            <img
                                key={i}
                                src={`/assets/common/${isBroken ? "broken" : "heart"}.png`}
                                alt="Heart"
                                style={{
                                    width: "24px",
                                    height: "24px",
                                    imageRendering: "pixelated",
                                    animation: i === breakingIndex ? "heartBreak 0.5s forwards" : "none",
                                    transition: "transform 0.2s",
                                }}
                            />
                        );
                    })}
                </div>

                <div style={{ marginTop: "40px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Galmuri11-Bold", color: "#4E342E" }}>

                    {!isGameOver ? (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "0 10px", marginBottom: "10px" }}>
                                <span style={{ fontSize: "14px" }}>Level {level}</span>
                                <span style={{ fontSize: "14px", color: timeLeft <= 3 ? "red" : "#4E342E" }}>Time: {timeLeft}s</span>
                            </div>

                            <h2 style={{ fontSize: "28px", marginBottom: "20px", marginTop: "10px" }}>{problem ? problem.text : "..."}</h2>

                            <div style={{ display: "flex", flexDirection: "row", gap: "8px", width: "100%", justifyContent: "center" }}>
                                {options.map((option, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            if (lives <= 0) return;
                                            handleAnswer(option);
                                        }}
                                        style={{
                                            width: "80px",
                                            height: "40px",
                                            backgroundImage: "url('/assets/common/modal1.png')",
                                            backgroundSize: "100% 100%",
                                            backgroundRepeat: "no-repeat",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                            transition: "transform 0.1s",
                                            imageRendering: "pixelated",
                                            userSelect: "none"
                                        }}
                                        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                                        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: "center", marginTop: "20px" }}>
                            <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#c62828" }}>Game Over</h2>
                            <button
                                onClick={resetGame}
                                style={{
                                    padding: "8px 16px",
                                    fontFamily: "Galmuri11-Bold",
                                    fontSize: "14px",
                                    backgroundColor: "#4E342E",
                                    color: "#E6D2B5",
                                    border: "2px solid #2d1d19",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginBottom: "10px"
                                }}
                            >
                                다시하기
                            </button>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        style={{
                            marginTop: "24px",
                            fontFamily: "Galmuri11-Bold",
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#4E342E",
                            cursor: "pointer",
                            fontSize: "12px",
                            textDecoration: "underline"
                        }}
                    >
                        닫기
                    </button>
                </div>

                <style>{`
          @keyframes heartBreak {
            0% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.2) rotate(10deg); filter: brightness(1.5) hue-rotate(-20deg); }
            100% { transform: scale(0); opacity: 0; }
          }
        `}</style>
            </div>
        </div>
    );
};

export default HeartQuestModal;

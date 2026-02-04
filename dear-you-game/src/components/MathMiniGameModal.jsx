import React, { useState, useEffect, useCallback } from "react";

const MathMiniGameModal = ({ isOpen, onClose, onWin }) => {
    const [problem, setProblem] = useState({ q: "", a: 0 });
    const [userAnswer, setUserAnswer] = useState("");
    const [feedback, setFeedback] = useState(""); // Correct! or Wrong!

    const generateProblem = useCallback(() => {
        // Generate random A + B or A - B
        const a = Math.floor(Math.random() * 90) + 10; // 10-99
        const b = Math.floor(Math.random() * 90) + 10;
        const isPlus = Math.random() > 0.5;

        if (isPlus) {
            setProblem({ q: `${a} + ${b} = ?`, a: a + b });
        } else {
            // Ensure positive result for subtraction simplicity
            const big = Math.max(a, b);
            const small = Math.min(a, b);
            setProblem({ q: `${big} - ${small} = ?`, a: big - small });
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            generateProblem();
            setUserAnswer("");
            setFeedback("");
        }, 0);
        return () => clearTimeout(timer);
    }, [isOpen, generateProblem]);

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (parseInt(userAnswer) === problem.a) {
            setFeedback("정답입니다!");
            setTimeout(() => {
                onWin();
            }, 1000);
        } else {
            setFeedback("틀렸습니다. 다시 시도해보세요.");
            setUserAnswer("");
            // Optional: generate new problem? No, let them retry or new logic could be added.
        }
    };

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
                    width: "400px",
                    height: "300px",
                    backgroundColor: "#3e4e38", // Blackboard green
                    border: "8px solid #8b5a2b", // Wood frame
                    borderRadius: "4px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    color: "white",
                }}
            >
                <div
                    style={{
                        fontSize: "20px",
                        marginBottom: "20px",
                        textShadow: "1px 1px 0 #000"
                    }}
                >
                    산수 문제를 풀어보세요!
                </div>

                <div
                    style={{
                        fontSize: "36px",
                        marginBottom: "30px",
                        fontFamily: "Galmuri11-Bold"
                    }}
                >
                    {problem.q}
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        autoFocus
                        style={{
                            fontSize: "24px",
                            padding: "10px",
                            textAlign: "center",
                            width: "150px",
                            borderRadius: "8px",
                            border: "2px solid #fff",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            color: "white",
                            fontFamily: "Galmuri11-Bold",
                            outline: "none"
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            marginTop: "10px",
                            padding: "8px 20px",
                            fontSize: "16px",
                            cursor: "pointer",
                            backgroundColor: "#f1d1a8",
                            border: "2px solid #8b5a2b",
                            borderRadius: "6px",
                            fontFamily: "Galmuri11-Bold",
                            color: "#4e342e"
                        }}
                    >
                        제출
                    </button>
                </form>

                {feedback && (
                    <div style={{ marginTop: "20px", color: feedback.includes("정답") ? "#aaffaa" : "#ffaaaa", textShadow: "1px 1px 0 #000" }}>
                        {feedback}
                    </div>
                )}

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
                    }}
                >
                    X
                </button>
            </div>
        </div>
    );
};

export default MathMiniGameModal;

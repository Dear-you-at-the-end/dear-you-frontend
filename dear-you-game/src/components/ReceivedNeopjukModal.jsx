import React, { useEffect, useState } from "react";

const ReceivedNeopjukModal = ({ isOpen, onClose, npcName }) => {
    const [animationState, setAnimationState] = useState("enter"); // enter, show,  exit

    useEffect(() => {
        if (!isOpen) return;

        const t0 = setTimeout(() => setAnimationState("enter"), 0);
        const t1 = setTimeout(() => setAnimationState("show"), 300);
        const t2 = setTimeout(() => setAnimationState("exit"), 2500);
        const t3 = setTimeout(() => {
            onClose();
        }, 3000);

        return () => {
            clearTimeout(t0);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div
                style={{
                    ...modalStyle,
                    opacity: animationState === "enter" ? 0 : animationState === "exit" ? 0 : 1,
                    transform:
                        animationState === "enter"
                            ? "translateY(-20px) scale(0.9)"
                            : animationState === "exit"
                                ? "translateY(20px) scale(0.9)"
                                : "translateY(0) scale(1)",
                    transition: "all 0.3s ease",
                }}
            >
                <div style={contentStyle}>
                    <img
                        src="/assets/common/character/nj.png"
                        alt="넙죽이"
                        style={{
                            width: "120px",
                            imageRendering: "pixelated",
                            marginBottom: "20px",
                        }}
                    />
                    <div style={textStyle}>넙죽이를 받았다!</div>
                    <div style={subTextStyle}>
                        {npcName || "NPC"}가 고마움의 표시로 선물을 줬다 😊
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceivedNeopjukModal;

const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
    fontFamily: "Galmuri11-Bold",
};

const modalStyle = {
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
    padding: "40px 24px",
    imageRendering: "pixelated",
};

const contentStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
};

const textStyle = {
    fontFamily: "Galmuri11-Bold",
    fontSize: "18px",
    color: "#4E342E",
    marginBottom: "12px",
    textAlign: "center",
    fontWeight: "bold",
};

const subTextStyle = {
    fontFamily: "Galmuri11-Bold",
    fontSize: "14px",
    color: "#6b4e38",
    textAlign: "center",
    lineHeight: "1.6",
};

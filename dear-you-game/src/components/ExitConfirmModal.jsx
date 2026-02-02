import React from "react";

const ExitConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
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
                zIndex: 1000,
                backgroundColor: "rgba(0,0,0,0.7)",
            }}
        >
            <div
                style={{
                    width: "270px",
                    minHeight: "140px",
                    backgroundImage: "url('/assets/common/modal1.png')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    color: "#4E342E",
                    imageRendering: "pixelated",
                }}
            >
                {/* Question Text */}
                <h2
                    style={{
                        fontFamily: "Galmuri",
                        fontSize: "14px",
                        marginBottom: "12px",
                                                textAlign: "center",
                    }}
                >
                    103호를 나가시겠습니까?
                </h2>

                {/* Buttons Container */}
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                    }}
                >
                    {/* Yes Button (O image) */}
                    <div
                        onClick={onConfirm}
                        style={{
                            cursor: "pointer",
                            width: "48px",
                            height: "48px",
                            backgroundImage: "url('/assets/common/o.png')",
                            backgroundSize: "44px 48px",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            imageRendering: "pixelated",
                            transition: "transform 0.1s",
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = "scale(0.95)";
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    />

                    {/* No Button (X image) */}
                    <div
                        onClick={onCancel}
                        style={{
                            cursor: "pointer",
                            width: "48px",
                            height: "48px",
                            backgroundImage: "url('/assets/common/x.png')",
                            backgroundSize: "44px 48px",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            imageRendering: "pixelated",
                            transition: "transform 0.1s",
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = "scale(0.95)";
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExitConfirmModal;

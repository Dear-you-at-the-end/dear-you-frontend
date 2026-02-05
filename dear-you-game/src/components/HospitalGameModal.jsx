import React, { useEffect, useState, useRef, useCallback } from "react";

const HospitalGameModal = ({ isOpen, onClose, onWin }) => {
    const [gameState, setGameState] = useState("intro"); // 'intro', 'playing', 'success', 'failed'
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [fadeIn, setFadeIn] = useState(false);

    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const lastTimeRef = useRef(0);
    const lastSpawnTimeRef = useRef(0);
    const playerRef = useRef({ x: 50 });
    const itemsRef = useRef([]);
    const scoreRef = useRef(0);
    const livesRef = useRef(3);

    // Asset Preloading
    const assetsRef = useRef({
        player: null,
        good: null,
        bads: []
    });

    const GAME_WIDTH = 400;
    const GAME_HEIGHT = 300;
    const PLAYER_SIZE = 40;
    const ITEM_SIZE = 30;
    const TARGET_SCORE = 5;

    useEffect(() => {
        // Preload images
        const playerImg = new Image();
        playerImg.src = "/assets/common/character/kjy.png";

        const goodImg = new Image();
        goodImg.src = "/assets/hospital/mini/Health_Kit.png";

        const badImgs = [];
        for (let i = 1; i <= 9; i++) {
            const img = new Image();
            img.src = `/assets/hospital/mini/f${i}.png`;
            badImgs.push(img);
        }

        assetsRef.current = {
            player: playerImg,
            good: goodImg,
            bads: badImgs
        };
    }, []);

    // Initial Setup
    useEffect(() => {
        let openTimer = null;
        let fadeTimer = null;

        if (isOpen) {
            openTimer = setTimeout(() => {
                setGameState("intro");
                setScore(0);
                setLives(3);
                scoreRef.current = 0;
                livesRef.current = 3;
                itemsRef.current = [];
                playerRef.current = { x: 50 };
                setFadeIn(false);
                fadeTimer = setTimeout(() => setFadeIn(true), 50);
            }, 0);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            setGameState("intro");
        }

        return () => {
            if (openTimer) clearTimeout(openTimer);
            if (fadeTimer) clearTimeout(fadeTimer);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isOpen]);

    // Game Loop
    const spawnItem = useCallback(() => {
        const isGood = Math.random() < 0.4; // 40% chance for health kit
        const type = isGood ? 'good' : 'bad';
        const imgIndex = !isGood ? Math.floor(Math.random() * 9) : 0;

        itemsRef.current.push({
            id: Date.now() + Math.random(),
            x: Math.random() * (GAME_WIDTH - ITEM_SIZE),
            y: -ITEM_SIZE,
            type: type,
            imgIndex: imgIndex,
            speed: isGood ? 1.5 : 1.8 + Math.random() * 0.5 // Slower
        });
    }, []);

    const updateGame = useCallback(function tick(time) {
        if (gameState !== 'playing') return;

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        // Spawn items
        if (time - lastSpawnTimeRef.current > 1000) { // Spawn every 1s
            spawnItem();
            lastSpawnTimeRef.current = time;
        }

        // Move items & Check collisions
        const newItems = [];
        // Calculate dimensions based on score (Growth Animation)
        const scale = 1 + (scoreRef.current * 0.1);
        const currentSize = PLAYER_SIZE * scale;

        const playerRect = {
            x: (playerRef.current.x / 100) * GAME_WIDTH - currentSize / 2 + (5 * scale),
            y: GAME_HEIGHT - currentSize - 5,
            w: currentSize - (10 * scale),
            h: currentSize
        };

        itemsRef.current.forEach(item => {
            item.y += item.speed * (deltaTime > 200 ? 1 : deltaTime / 16); // Normalize speed

            // Check collision
            const itemRect = { x: item.x, y: item.y, w: ITEM_SIZE, h: ITEM_SIZE };

            let hit = false;
            // AABB Collision
            if (
                playerRect.x < itemRect.x + itemRect.w &&
                playerRect.x + playerRect.w > itemRect.x &&
                playerRect.y < itemRect.y + itemRect.h &&
                playerRect.y + playerRect.h > itemRect.y
            ) {
                hit = true;
                if (item.type === 'good') {
                    scoreRef.current += 1;
                    setScore(scoreRef.current);
                    if (scoreRef.current >= TARGET_SCORE) {
                        setGameState('success');
                        setTimeout(() => {
                            onWin();
                            onClose();
                        }, 2000);
                    }
                } else {
                    livesRef.current -= 1;
                    setLives(livesRef.current);
                    if (livesRef.current <= 0) {
                        setGameState('failed');
                        setTimeout(onClose, 2000);
                    }
                }
            }

            if (!hit && item.y < GAME_HEIGHT) {
                newItems.push(item);
            }
        });

        itemsRef.current = newItems;

        // Draw
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            // Draw Items
            itemsRef.current.forEach(item => {
                let img;
                if (item.type === 'good') {
                    img = assetsRef.current.good;
                } else {
                    img = assetsRef.current.bads[item.imgIndex];
                }
                if (img && img.complete) {
                    ctx.drawImage(img, item.x, item.y, ITEM_SIZE, ITEM_SIZE);
                } else {
                    ctx.fillStyle = item.type === 'good' ? 'green' : 'red';
                    ctx.fillRect(item.x, item.y, ITEM_SIZE, ITEM_SIZE);
                }
            });

            // Draw Player with Growth Scale
            const scale = 1 + (scoreRef.current * 0.1);
            const currentSize = PLAYER_SIZE * scale;
            const px = (playerRef.current.x / 100) * GAME_WIDTH - currentSize / 2;
            const py = GAME_HEIGHT - currentSize - 5;

            const pImg = assetsRef.current.player;
            if (pImg && pImg.complete) {
                // If sprite sheet, usually take first frame, but assuming full image for now based on request
                // If it is small, scale it up
                ctx.drawImage(pImg, 0, 0, 20, 20, px, py, currentSize, currentSize);
            } else {
                ctx.fillStyle = 'blue';
                ctx.fillRect(px, py, currentSize, currentSize);
            }
        }

        if (scoreRef.current < TARGET_SCORE && livesRef.current > 0) {
            requestRef.current = requestAnimationFrame(tick);
        }
    }, [gameState, onWin, onClose, spawnItem]);

    // Input Handling
    useEffect(() => {
        if (gameState !== 'playing') return;

        // Continuous movement handling could be smoother but keydown is simple start
        // Better: track keys held
        const keys = { ArrowLeft: false, ArrowRight: false, a: false, A: false, d: false, D: false };
        const down = (e) => { if (Object.prototype.hasOwnProperty.call(keys, e.key)) keys[e.key] = true; };
        const up = (e) => { if (Object.prototype.hasOwnProperty.call(keys, e.key)) keys[e.key] = false; };

        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);

        const moveInterval = setInterval(() => {
            if (keys.ArrowLeft || keys.a || keys.A) {
                playerRef.current.x = Math.max(5, playerRef.current.x - 1.5);
            }
            if (keys.ArrowRight || keys.d || keys.D) {
                playerRef.current.x = Math.min(95, playerRef.current.x + 1.5);
            }
        }, 16);

        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
            clearInterval(moveInterval);
        };
    }, [gameState]);


    // Start/Stop Loop
    useEffect(() => {
        if (gameState === 'playing') {
            lastTimeRef.current = performance.now();
            requestRef.current = requestAnimationFrame(updateGame);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    }, [gameState, updateGame]);

    if (!isOpen) return null;

    const handleStart = () => {
        setGameState('playing');
        itemsRef.current = [];
        setScore(0);
        scoreRef.current = 0;
        setLives(3);
        livesRef.current = 3;
    };

    // Intro Screen
    if (gameState === "intro") {
        return (
            <div style={modalOverlayStyle(fadeIn)}>
                <div style={modalContentStyle}>
                    <h2 style={titleStyle}>01년생 회복시키기</h2>
                    <p style={descStyle}>
                        위에서 떨어지는 <strong style={{ color: 'green' }}>회복키트</strong>를 받아 김지연을 회복시키세요!<br />
                        <strong style={{ color: 'red' }}>가짜 약</strong>은 피해야 합니다.<br />
                        <strong>A, D</strong> 키로 김지연을 움직여
                        <strong>10개</strong>를 모으면 성공!
                    </p>
                    <img
                        src="/assets/common/o.png"
                        alt="Start"
                        onClick={handleStart}
                        style={btnStyle}
                    />
                </div>
            </div>
        );
    }

    // Success Screen
    if (gameState === "success") {
        return (
            <div style={modalOverlayStyle(true)}>
                <div style={modalContentStyle}>
                    <h2 style={titleStyle}>🎉 성공! 🎉</h2>
                    <p style={descStyle}>물자를 모두 확보했습니다!</p>
                </div>
            </div>
        );
    }

    // Failed Screen
    if (gameState === "failed") {
        return (
            <div style={modalOverlayStyle(true)}>
                <div style={modalContentStyle}>
                    <h2 style={titleStyle}>💔 실패... 💔</h2>
                    <p style={descStyle}>다시 시도해주세요.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={modalOverlayStyle(true)}>
            <div style={{ ...modalContentStyle, width: '450px', padding: '20px' }}>
                {/* UI Header */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3].map(i => (
                            <img
                                key={i}
                                src={i <= lives ? "/assets/common/heart.png" : "/assets/common/broken.png"}
                                style={{ width: '24px', height: '24px' }}
                                alt="life"
                            />
                        ))}
                    </div>
                    <div style={{ fontFamily: 'Galmuri', fontSize: '18px', color: '#4E342E' }}>
                        확보: {score} / {TARGET_SCORE}
                    </div>
                </div>

                {/* Game Canvas */}
                <div style={{
                    width: GAME_WIDTH,
                    height: GAME_HEIGHT,
                    position: 'relative',
                    backgroundColor: '#f0f4c3',
                    border: '3px solid #4E342E',
                    overflow: 'hidden'
                }}>
                    <canvas
                        ref={canvasRef}
                        width={GAME_WIDTH}
                        height={GAME_HEIGHT}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>

                <button
                    onClick={onClose}
                    style={quitBtnStyle}
                >
                    포기
                </button>
            </div>
        </div>
    );
};

// Styles
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
});

const modalContentStyle = {
    backgroundImage: "url('/assets/common/modal1.png')",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "420px",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    imageRendering: "pixelated",
};

const titleStyle = {
    fontFamily: "Galmuri",
    fontSize: "24px",
    marginBottom: "20px",
    textAlign: "center",
    color: "#4E342E",
};

const descStyle = {
    fontFamily: "Galmuri",
    fontSize: "13px",
    textAlign: "center",
    lineHeight: "1.6",
    marginBottom: "30px",
    color: "#4E342E",
};

const btnStyle = {
    width: "60px",
    height: "60px",
    cursor: "pointer",
    transition: "transform 0.1s",
};

const quitBtnStyle = {
    fontFamily: "Galmuri",
    fontSize: "10px",
    padding: "7px 14px",
    backgroundColor: "#666",
    color: "#fff",
    border: "2px solid #4E342E",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
};

export default HospitalGameModal;

import React, { useCallback, useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import "./App.css";
import MiniGameModal from "./components/MiniGameModal";
import ExitConfirmModal from "./components/ExitConfirmModal";
import IntroScreen from "./components/IntroScreen";
import HallwayScene from "./scenes/HallwayScene";

const canvasWidth = 480;
const canvasHeight = 360;
const directionOrder = ["down", "right", "up", "left"];
const rowIndexByDir = {
  down: 0,
  right: 2,
  left: 3,
  up: 4,
};
const spriteFrame = {
  size: 20,
  spacing: 0,
  margin: 0,
};

function App() {
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [bgm, setBgm] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [gameMinutes, setGameMinutes] = useState(0);
  const [letterCount, setLetterCount] = useState(21);
  const [writtenCount, setWrittenCount] = useState(0);
  const [npcs, setNpcs] = useState([
    { id: "npc-1", name: "전하은", hasLetter: false, hasWritten: false },
  ]);
  const [showWriteConfirm, setShowWriteConfirm] = useState(false);
  const [showLetterWrite, setShowLetterWrite] = useState(false);
  const [letterText, setLetterText] = useState("");
  const [activeNpcId, setActiveNpcId] = useState(null);
  const [envelopeFrame, setEnvelopeFrame] = useState(1);
  const [writtenLetters, setWrittenLetters] = useState([]);
  const [showLetterRead, setShowLetterRead] = useState(false);
  const [readIndex, setReadIndex] = useState(0);
  const writtenLettersRef = useRef([]);
  const gameRef = useRef(null);

  const inventoryConfig = {
    slots: 7,
    width: 352,
    height: 72,
    slotSize: 36,
    gap: 12,
    padX: 12,
    padY: 10,
  };
  const letterPaper = {
    width: 240,
    height: 320,
    padX: 22,
    padTop: 36,
    padBottom: 32,
  };

  useEffect(() => {
    const audio = new Audio("/assets/common/bgm.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
    setBgm(audio);
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const handleIntroStart = useCallback(() => {
    setShowIntro(false);
    if (!bgm) return;
    const playPromise = bgm.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => { });
    }
  }, [bgm]);

  useEffect(() => {
    if (showIntro) {
      setGameMinutes(0);
      return;
    }
    const start = Date.now();
    const totalGameMinutes = 9 * 60;
    const totalRealMinutes = 30;
    const tick = () => {
      const elapsedMinutes = (Date.now() - start) / 60000;
      const progressed = Math.min(
        totalGameMinutes,
        (elapsedMinutes / totalRealMinutes) * totalGameMinutes
      );
      setGameMinutes(Math.floor(progressed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [showIntro]);

  useEffect(() => {
    if (showIntro) return;
    const handleWheel = (event) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? 1 : -1;
      setSelectedSlot((prev) => {
        const next = (prev + direction + inventoryConfig.slots) % inventoryConfig.slots;
        return next;
      });
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [showIntro, inventoryConfig.slots]);

  useEffect(() => {
    if (!showLetterWrite) return;
    setEnvelopeFrame(1);
    const t1 = setTimeout(() => setEnvelopeFrame(2), 500);
    const t2 = setTimeout(() => setEnvelopeFrame(3), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showLetterWrite]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("writtenLetters");
      if (saved) {
        const parsed = JSON.parse(saved);
        setWrittenLetters(parsed);
        if (Array.isArray(parsed)) {
          setWrittenCount(parsed.length);
          setNpcs((prev) =>
            prev.map((n) => ({
              ...n,
              hasWritten: parsed.some((l) => l.npcId === n.id),
            }))
          );
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    writtenLettersRef.current = writtenLetters;
  }, [writtenLetters]);


  const gameStateRef = useRef({
    isMiniGameOpen: false,
    setShowMiniGame: setShowMiniGame,
    setShowExitConfirm: setShowExitConfirm,
    setShowWriteConfirm: setShowWriteConfirm,
    setShowLetterWrite: setShowLetterWrite,
    getSelectedSlot: () => selectedSlot,
    getLetterCount: () => letterCount,
    getWrittenCount: () => writtenCount,
    getNpcState: (id) => npcs.find((n) => n.id === id),
    setNpcHasLetter: (id) =>
      setNpcs((prev) => prev.map((n) => (n.id === id ? { ...n, hasLetter: true } : n))),
    setNpcWritten: (id) =>
      setNpcs((prev) => prev.map((n) => (n.id === id ? { ...n, hasWritten: true } : n))),
  });

  useEffect(() => {
    if (showIntro) return; // Do not initialize game until intro is done
    gameStateRef.current.isMiniGameOpen = showMiniGame;
    gameStateRef.current.getSelectedSlot = () => selectedSlot;
    gameStateRef.current.getLetterCount = () => letterCount;
    gameStateRef.current.getWrittenCount = () => writtenCount;
    gameStateRef.current.getNpcState = (id) => npcs.find((n) => n.id === id);
  }, [showMiniGame, showIntro, selectedSlot, letterCount, writtenCount, npcs]);

  useEffect(() => {
    if (showIntro) return;

    // index.css handles layout
    // const style = document.createElement("style"); ... removed

    const config = {
      type: Phaser.AUTO,
      width: canvasWidth,
      height: canvasHeight,
      parent: "game-container",
      pixelArt: true,
      backgroundColor: "#222222",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: true,
        },
      },
      scene: [HallwayScene, { key: "Room103", preload, create, update }],
    };

    function preload() {
      const dormitoryPath = "/assets/dormitory/";
      const commonPath = "/assets/common/";

      this.load.image("floor", `${dormitoryPath}tile.png`);
      this.load.image("tile2", `${dormitoryPath}tile2.png`);
      this.load.image("wall", `${dormitoryPath}wall.png`);
      this.load.image("outline_top", `${dormitoryPath}outline_top.png`);
      this.load.image("outline_side", `${dormitoryPath}outline_side.png`);
      this.load.image("bed", `${dormitoryPath}bed.png`);
      this.load.image("closet", `${dormitoryPath}closet.png`);
      this.load.image("deskl", `${dormitoryPath}deskl.png`);
      this.load.image("deskr", `${dormitoryPath}deskr.png`);
      this.load.image("door", `${dormitoryPath}door.png`);
      this.load.image("door_inside", `${dormitoryPath}door_inside.png`);
      this.load.image("window", `${dormitoryPath}window.png`);
      this.load.image("quest_icon", `${commonPath}quest_icon2.png`);
      this.load.image("happy_icon", `${commonPath}happy.png`);
      this.load.image("letter_icon", `${commonPath}letter.png`);
      this.load.image("letter_written", `${commonPath}letter_wirte.png`);

      const characterPath = `${commonPath}character/`;
      const spriteConfig = {
        frameWidth: spriteFrame.size,
        frameHeight: spriteFrame.size,
        margin: spriteFrame.margin,
        spacing: spriteFrame.spacing,
      };

      this.load.spritesheet("player_walk", `${characterPath}16x16 Walk-Sheet.png`, spriteConfig);
      this.load.spritesheet("player_run", `${characterPath}16x16 Run-Sheet.png`, spriteConfig);
      this.load.spritesheet("player_jump", `${characterPath}16x16 Jump-Sheet.png`, spriteConfig);
      this.load.spritesheet("player_idle", `${characterPath}16x16 Idle-Sheet.png`, spriteConfig);
    }

    function create() {
      const pixelScale = 3;
      const roomW = 380;
      const roomH = 450;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const startX = centerX - roomW / 2;
      const startY = centerY - roomH / 2;

      this.physics.world.setBounds(startX, startY, roomW, roomH);

      this.add
        .tileSprite(centerX, centerY, roomW, roomH, "floor")
        .setTileScale(pixelScale)
        .setDepth(0);

      this.add
        .tileSprite(centerX, startY + 65, roomW, 120, "wall")
        .setTileScale(pixelScale)
        .setDepth(1);

      // Create wall collision barriers (all 4 sides)
      const walls = this.physics.add.staticGroup();

      // Top wall
      const topWall = walls.create(centerX, startY + 60, null);
      topWall.setSize(roomW, 120).setVisible(false).refreshBody();

      // Bottom wall
      const bottomWall = walls.create(centerX, startY + roomH, null);
      bottomWall.setSize(roomW, 10).setVisible(false).refreshBody();

      // Left wall
      const leftWall = walls.create(startX, centerY, null);
      leftWall.setSize(10, roomH).setVisible(false).refreshBody();

      // Right wall
      const rightWall = walls.create(startX + roomW, centerY, null);
      rightWall.setSize(10, roomH).setVisible(false).refreshBody();

      // Top shoe rack area
      const shoeRackTopW = 100;
      const shoeRackTopH = 40;
      this.add
        .tileSprite(centerX, startY + 55, shoeRackTopW, shoeRackTopH, "tile2")
        .setTileScale(pixelScale)
        .setDepth(0);

      const obstacles = this.physics.add.staticGroup();
      const createFurniture = ({ x, y, texture, scaleX = 1, scaleY = 1 }) => {
        const furniture = obstacles.create(x, y, texture);
        furniture.setScale(pixelScale * scaleX, pixelScale * scaleY);
        furniture.refreshBody();
        furniture.setDepth(Math.round(furniture.y));
        return furniture;
      };

      const marginX = 75;  // More margin to keep furniture inside walls
      const leftX = startX + marginX;
      const rightX = startX + roomW - marginX;

      // Y positions for 4 rows - tighter spacing, realistic overlap
      const row1Y = startY + 135;  // Top row - below wall
      const row2Y = startY + 215;  // Second row
      const row3Y = startY + 295;  // Third row - tighter
      const row4Y = startY + 375;  // Bottom row - above door

      // Left side (from top to bottom): 책상, 침대, 옷장, 옷장
      createFurniture({ x: leftX, y: row1Y, texture: "deskl", scaleX: 1 });
      createFurniture({ x: leftX, y: row2Y, texture: "bed", scaleX: 0.85 });
      createFurniture({ x: leftX, y: row3Y, texture: "closet", scaleX: 1 });
      createFurniture({ x: leftX, y: row4Y, texture: "closet", scaleX: 1 });

      // Right side (from top to bottom): 책상, 책상, 침대, 옷장
      createFurniture({ x: rightX, y: row1Y, texture: "deskr", scaleX: 1 });
      createFurniture({ x: rightX, y: row2Y, texture: "deskr", scaleX: 1 });
      createFurniture({ x: rightX, y: row3Y, texture: "bed", scaleX: 0.85 });
      createFurniture({ x: rightX, y: row4Y, texture: "closet", scaleX: 1 });

      const outlineTopH =
        this.textures.get("outline_top").getSourceImage().height * pixelScale;
      const outlineSideW =
        this.textures.get("outline_side").getSourceImage().width * pixelScale;
      const outlineW = roomW + outlineSideW * 2;
      const outlineDepth = 9999;

      this.add
        .tileSprite(centerX, startY, outlineW, outlineTopH, "outline_top")
        .setOrigin(0.5, 1)
        .setTileScale(pixelScale)
        .setDepth(outlineDepth);
      this.add
        .tileSprite(centerX, startY + roomH, outlineW, outlineTopH, "outline_top")
        .setOrigin(0.5, 0)
        .setTileScale(pixelScale)
        .setFlipY(true)
        .setDepth(outlineDepth);
      this.add
        .tileSprite(startX, centerY, outlineSideW, roomH, "outline_side")
        .setOrigin(1, 0.5)
        .setTileScale(pixelScale)
        .setDepth(outlineDepth)
        .setFlipX(true);
      this.add
        .tileSprite(startX + roomW, centerY, outlineSideW, roomH, "outline_side")
        .setOrigin(0, 0.5)
        .setTileScale(pixelScale)
        .setDepth(outlineDepth);

      const getFramesPerRow = (textureKey) => {
        const source = this.textures.get(textureKey).getSourceImage();
        const denom = spriteFrame.size + spriteFrame.spacing;
        const numer = source.width - spriteFrame.margin * 2 + spriteFrame.spacing;
        return Math.max(1, Math.floor(numer / denom));
      };

      const createDirectionalAnims = ({ action, textureKey, frameRate, repeat }) => {
        const framesPerRow = getFramesPerRow(textureKey);
        directionOrder.forEach((dir) => {
          const rowIndex = rowIndexByDir[dir];
          const start = rowIndex * framesPerRow;
          const end = start + framesPerRow - 1;
          this.anims.create({
            key: `${action}-${dir}`,
            frames: this.anims.generateFrameNumbers(textureKey, { start, end }),
            frameRate,
            repeat,
          });
        });
      };

      createDirectionalAnims({
        action: "idle",
        textureKey: "player_idle",
        frameRate: 4,
        repeat: -1,
      });
      createDirectionalAnims({
        action: "walk",
        textureKey: "player_walk",
        frameRate: 10,
        repeat: -1,
      });
      createDirectionalAnims({
        action: "run",
        textureKey: "player_run",
        frameRate: 14,
        repeat: -1,
      });
      createDirectionalAnims({
        action: "jump",
        textureKey: "player_jump",
        frameRate: 10,
        repeat: 0,
      });

      // ?좊컻???곸뿭 (?섎떒 以묒븰)
      const shoeRackW = 120;
      const shoeRackH = 40;
      this.add
        .tileSprite(centerX, startY + roomH - 20, shoeRackW, shoeRackH, "tile2")
        .setTileScale(pixelScale)
        .setDepth(0);

      this.door = this.add
        .image(centerX, startY + roomH, "door_inside")
        .setOrigin(0.5, 1)
        .setScale(pixelScale)
        .setDepth(startY + roomH);


      // 臾????곹샇?묒슜 ?띿뒪??
      this.exitText = this.add.text(centerX, startY + roomH - 60, "Press SPACE", {
        fontSize: "22px",
        fontFamily: "Galmuri",
        color: "#C49A6C",
        backgroundColor: "#000000",
        padding: { x: 4, y: 4 }
      }).setOrigin(0.5).setDepth(99999).setVisible(false);

      // NPC - 침대 옆 (left bed)
      this.npcId = "npc-1";
      this.npc = this.physics.add.staticSprite(
        leftX + 70,
        row2Y + 10,
        "player_idle",
        0
      );
      this.npc.setScale(pixelScale);
      this.npc.setDepth(this.npc.y);
      this.npc.refreshBody();
      this.npc.anims.play("idle-right");

      // Quest icon (show when near NPC)
      this.questIcon = this.add.image(this.npc.x, this.npc.y - 40, "quest_icon");
      this.questIcon.setScale(pixelScale * 0.6);
      this.questIcon.setDepth(99999);
      this.questIcon.setVisible(false);

      this.tweens.add({
        targets: this.questIcon,
        y: this.questIcon.y - 5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.happyIcon = this.add.image(this.npc.x, this.npc.y - 40, "happy_icon");
      this.happyIcon.setScale(pixelScale * 0.6);
      this.happyIcon.setDepth(99999);
      this.happyIcon.setVisible(false);
      this.happyTimer = null;
      this.prevRight = false;

      this.player = this.physics.add.sprite(
        centerX,
        centerY + 50,
        "player_idle",
        0
      );
      this.player.setScale(pixelScale).setCollideWorldBounds(true);
      this.player.body.setSize(10, 8).setOffset(5, 12);

      this.physics.add.collider(this.player, obstacles);
      this.physics.add.collider(this.player, this.npc);
      this.physics.add.collider(this.player, walls);

      this.cameras.main.setBounds(startX, startY, roomW, roomH);
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

      this.player.anims.play("idle-down");

      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.lastDirection = "down";
      this.isJumping = false;
      this.jumpTween = null;
      this.jumpHeight = 8;
      this.jumpDuration = 140;
    }

    const startJump = () => {
      // Jump disabled to prevent wall clipping
      return;
    };

    function update() {
      if (!this.player) return;

      // Handle MiniGame state
      if (gameStateRef.current.isMiniGameOpen) {
        if (this.jumpTween) {
          this.jumpTween.stop();
          this.jumpTween = null;
        }
        this.isJumping = false;
        this.player.body.setVelocity(0);
        this.player.anims.play(`idle-${this.lastDirection}`, true);
        return;
      }

      // Interaction & Jump logic
      const isNearNPC = this.npc && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y) < 60;
      const isNearDoor = this.door && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.door.x, this.door.y) < 50;
      const activeNpc = gameStateRef.current.getNpcState(this.npcId);
      const activeNpcHasLetter = activeNpc?.hasLetter ?? false;
      const activeNpcHasWritten = activeNpc?.hasWritten ?? false;
      if (this.questIcon) {
        this.questIcon.setVisible(!activeNpcHasLetter && !this.happyIcon?.visible);
      }
      const pointer = this.input.activePointer;
      const rightDown = pointer.rightButtonDown();
      const rightJustDown = rightDown && !this.prevRight;
      this.prevRight = rightDown;

      // Door interaction
      if (isNearDoor) {
        this.exitText.setVisible(true);
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          gameStateRef.current.setShowExitConfirm(true);
          this.player.body.setVelocity(0);
          this.player.anims.play(`idle-${this.lastDirection}`, true);
          return;
        }
      } else {
        this.exitText.setVisible(false);
      }

      // NPC interaction
      if (isNearNPC) {
        setActiveNpcId(this.npcId);
        if (rightJustDown) {
          const canWrite =
            !activeNpcHasLetter &&
            !activeNpcHasWritten &&
            gameStateRef.current.getLetterCount() > 0 &&
            gameStateRef.current.getSelectedSlot() === 0;
          const canGiveWritten =
            !activeNpcHasLetter &&
            gameStateRef.current.getWrittenCount() > 0 &&
            gameStateRef.current.getSelectedSlot() === 1 &&
            writtenLettersRef.current.some((l) => l.npcId === this.npcId);
          if (canWrite) {
            gameStateRef.current.setShowWriteConfirm(true);
            return;
          }
          if (canGiveWritten) {
            setWrittenLetters((prev) => {
              const index = prev.findIndex((l) => l.npcId === this.npcId);
              if (index === -1) return prev;
              const next = [...prev.slice(0, index), ...prev.slice(index + 1)];
              setWrittenCount(next.length);
              try {
                localStorage.setItem("writtenLetters", JSON.stringify(next));
              } catch {
                // Ignore localStorage errors
              }
              return next;
            });
            gameStateRef.current.setNpcHasLetter(this.npcId);
            this.questIcon.setVisible(false);
            this.happyIcon.setVisible(true);
            if (this.happyTimer) {
              this.happyTimer.remove(false);
            }
            this.happyTimer = this.time.delayedCall(1200, () => {
              if (this.happyIcon) {
                this.happyIcon.setVisible(false);
              }
            });
            return;
          }
        }
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          gameStateRef.current.setShowMiniGame(true);
          this.player.body.setVelocity(0);
          this.player.anims.play(`idle-${this.lastDirection}`, true);
          return;
        }
      } else {
        if (!activeNpcHasLetter) {
          this.happyIcon.setVisible(false);
        }
        // Jump only when not near NPC
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          startJump();
        }
      }

      if (this.isJumping) {
        this.player.body.setVelocity(0);
        this.player.setDepth(this.player.y);
        return;
      }

      // Determine speed based on Shift key (walk vs run)
      const isRunning = this.shiftKey.isDown;
      const speed = isRunning ? 200 : 100;
      const animPrefix = isRunning ? "run" : "walk";

      this.player.body.setVelocity(0);

      // Movement with walk/run animations
      if (this.cursors.left.isDown) {
        this.player.body.setVelocityX(-speed);
        this.player.anims.play(`${animPrefix}-left`, true);
        this.lastDirection = "left";
      } else if (this.cursors.right.isDown) {
        this.player.body.setVelocityX(speed);
        this.player.anims.play(`${animPrefix}-right`, true);
        this.lastDirection = "right";
      } else if (this.cursors.up.isDown) {
        this.player.body.setVelocityY(-speed);
        this.player.anims.play(`${animPrefix}-up`, true);
        this.lastDirection = "up";
      } else if (this.cursors.down.isDown) {
        this.player.body.setVelocityY(speed);
        this.player.anims.play(`${animPrefix}-down`, true);
        this.lastDirection = "down";
      } else {
        this.player.anims.play(`idle-${this.lastDirection}`, true);
      }

      this.player.setDepth(this.player.y);
    }

    const game = new Phaser.Game(config);
    gameRef.current = game;
    return () => {
      if (game.sound) {
        game.sound.stopAll();
      }
      gameRef.current = null;
      game.destroy(true);
    };
  }, [showIntro]);

  return (
    <div id="game-container">
      <style>{`
        @font-face {
          font-family: "PixelFont";
          src: url("/assets/fonts/pixelFont.ttf") format("truetype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "Galmuri11";
          src: url("/assets/fonts/galmuri11.ttf") format("truetype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {!showIntro && (
        <>
          {showWriteConfirm && (
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
                zIndex: 1400,
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  width: "420px",
                  minHeight: "170px",
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
                }}
              >
                <div style={{ fontFamily: "Galmuri", fontSize: "16px", textAlign: "center" }}>
                  {`${npcs.find((n) => n.id === activeNpcId)?.name ?? "전하은"}에게 편지를 쓰시겠습니까?`}
                </div>
                <div style={{ display: "flex", gap: "16px", marginTop: "18px" }}>
                  <div
                    onClick={() => {
                      setShowWriteConfirm(false);
                      const activeNpc = npcs.find((n) => n.id === activeNpcId);
                      const alreadyWritten = writtenLetters.some((l) => l.npcId === activeNpcId);
                      if (
                        letterCount > 0 &&
                        activeNpc &&
                        !activeNpc.hasLetter &&
                        !activeNpc.hasWritten &&
                        !alreadyWritten
                      ) {
                        setLetterCount((prev) => Math.max(0, prev - 1));
                        setSelectedSlot(1);
                        setShowLetterWrite(true);
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      width: "64px",
                      height: "64px",
                      backgroundImage: "url('/assets/common/o.png')",
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      imageRendering: "pixelated",
                    }}
                  />
                  <div
                    onClick={() => setShowWriteConfirm(false)}
                    style={{
                      cursor: "pointer",
                      width: "64px",
                      height: "64px",
                      backgroundImage: "url('/assets/common/x.png')",
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      imageRendering: "pixelated",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {showLetterWrite && (
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
                zIndex: 1400,
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  width: `${letterPaper.width + 160}px`,
                  minHeight: `${letterPaper.height + 180}px`,
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
                  gap: "12px",
                }}
              >
                <div style={{ fontFamily: "Galmuri", fontSize: "16px" }}>편지를 작성하세요</div>
                <div
                  style={{
                    position: "relative",
                    width: `${letterPaper.width}px`,
                    height: `${letterPaper.height}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    imageRendering: "pixelated",
                  }}
                >
                  {envelopeFrame < 3 && (
                    <img
                      src={`/assets/common/${envelopeFrame === 1 ? "Envelope1" : "Envelope2"}.png`}
                      alt="Envelope"
                      style={{
                        width: "90px",
                        height: "auto",
                        imageRendering: "pixelated",
                        animation: "popIn 0.4s ease-out forwards",
                      }}
                    />
                  )}
                  {envelopeFrame === 3 && (
                    <>
                      <img
                        src="/assets/common/letter1.png"
                        alt="Letter Paper"
                        style={{
                          width: `${letterPaper.width}px`,
                          height: `${letterPaper.height}px`,
                          imageRendering: "pixelated",
                          animation: "fadeIn 0.6s ease-out forwards",
                        }}
                      />
                      <textarea
                        value={letterText}
                        onChange={(e) => setLetterText(e.target.value)}
                        style={{
                          position: "absolute",
                          top: `${letterPaper.padTop}px`,
                          left: `${letterPaper.padX}px`,
                          width: `${letterPaper.width - letterPaper.padX * 2}px`,
                          height: `${letterPaper.height - letterPaper.padTop - letterPaper.padBottom}px`,
                          resize: "none",
                          fontFamily: "Galmuri11",
                          fontSize: "12px",
                          color: "#4E342E",
                          backgroundColor: "transparent",
                          border: "none",
                          outline: "none",
                        }}
                      />
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowLetterWrite(false);
                    const payload = {
                      npcId: activeNpcId,
                      text: letterText,
                      createdAt: Date.now(),
                    };
                    setWrittenLetters((prev) => {
                      if (prev.some((l) => l.npcId === activeNpcId)) {
                        return prev;
                      }
                      const next = [...prev, payload];
                      try {
                        localStorage.setItem("writtenLetters", JSON.stringify(next));
                      } catch {
                        // Ignore localStorage errors
                      }
                      setWrittenCount(next.length);
                      return next;
                    });
                    setNpcs((prev) =>
                      prev.map((n) =>
                        n.id === activeNpcId ? { ...n, hasWritten: true } : n
                      )
                    );
                    setLetterText("");
                  }}
                  style={{
                    fontFamily: "Galmuri",
                    fontSize: "12px",
                    padding: "6px 14px",
                    backgroundColor: "transparent",
                    color: "#4E342E",
                    border: "2px solid #4E342E",
                    cursor: "pointer",
                  }}
                >
                  작성 완료
                </button>
              </div>
            </div>
          )}
          {showLetterRead && (
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
                zIndex: 1400,
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  width: `${letterPaper.width + 160}px`,
                  minHeight: `${letterPaper.height + 180}px`,
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
                  gap: "10px",
                }}
              >
                <div style={{ fontFamily: "Galmuri", fontSize: "16px" }}>작성한 편지</div>
                {writtenLetters.length > 0 && (
                  <div
                    style={{
                      position: "relative",
                      width: `${letterPaper.width}px`,
                      height: `${letterPaper.height}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      imageRendering: "pixelated",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "14px",
                        fontFamily: "Galmuri11",
                        fontSize: "10px",
                        color: "#4E342E",
                        pointerEvents: "none",
                      }}
                    >
                      {npcs.find(
                        (n) => n.id === writtenLetters[Math.min(readIndex, writtenLetters.length - 1)]?.npcId
                      )?.name ?? ""}
                    </div>
                    <img
                      src="/assets/common/letter1.png"
                      alt="Letter Paper"
                      style={{
                        width: `${letterPaper.width}px`,
                        height: `${letterPaper.height}px`,
                        imageRendering: "pixelated",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: `${letterPaper.padTop}px`,
                        left: `${letterPaper.padX}px`,
                        width: `${letterPaper.width - letterPaper.padX * 2}px`,
                        height: `${letterPaper.height - letterPaper.padTop - letterPaper.padBottom}px`,
                        fontFamily: "Galmuri11",
                        fontSize: "12px",
                        color: "#4E342E",
                        whiteSpace: "pre-wrap",
                        overflow: "hidden",
                      }}
                    >
                      {writtenLetters[Math.min(readIndex, writtenLetters.length - 1)]?.text}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setReadIndex((prev) => Math.max(0, prev - 1))}
                    style={{
                      fontFamily: "Galmuri",
                      fontSize: "12px",
                      padding: "4px 10px",
                      backgroundColor: "transparent",
                      color: "#4E342E",
                      border: "2px solid #4E342E",
                      cursor: "pointer",
                    }}
                  >
                    이전
                  </button>
                  <button
                    onClick={() =>
                      setReadIndex((prev) =>
                        Math.min(writtenLetters.length - 1, prev + 1)
                      )
                    }
                    style={{
                      fontFamily: "Galmuri",
                      fontSize: "12px",
                      padding: "4px 10px",
                      backgroundColor: "transparent",
                      color: "#4E342E",
                      border: "2px solid #4E342E",
                      cursor: "pointer",
                    }}
                  >
                    다음
                  </button>
                  <button
                    onClick={() => setShowLetterRead(false)}
                    style={{
                      fontFamily: "Galmuri",
                      fontSize: "12px",
                      padding: "4px 10px",
                      backgroundColor: "transparent",
                      color: "#4E342E",
                      border: "2px solid #4E342E",
                      cursor: "pointer",
                    }}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {!showIntro && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "-6px",
            transform: "translateX(-50%)",
            zIndex: 120,
            width: `${inventoryConfig.width}px`,
            height: `${inventoryConfig.height}px`,
            backgroundImage: "url('/assets/common/inventory.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        >
          {Array.from({ length: inventoryConfig.slots }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setSelectedSlot(index);
                if (index === 1 && writtenLetters.length > 0) {
                  setReadIndex(0);
                  setShowLetterRead(true);
                }
              }}
              aria-label={`Inventory slot ${index + 1}`}
              style={{
                position: "absolute",
                left: `${inventoryConfig.padX + index * (inventoryConfig.slotSize + inventoryConfig.gap)}px`,
                top: `${inventoryConfig.padY}px`,
                width: `${inventoryConfig.slotSize}px`,
                height: `${inventoryConfig.slotSize}px`,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            />
          ))}
          <img
            src="/assets/common/letter.png"
            alt="Letter"
            style={{
              position: "absolute",
              left: `${inventoryConfig.padX + 4}px`,
              top: `${inventoryConfig.padY + 4}px`,
              width: `${inventoryConfig.slotSize - 8}px`,
              height: `${inventoryConfig.slotSize - 8}px`,
              imageRendering: "pixelated",
              opacity: letterCount > 0 ? 1 : 0,
              pointerEvents: "none",
            }}
          />
          <img
            src="/assets/common/letter_wirte.png"
            alt="Written Letter"
            style={{
              position: "absolute",
              left: `${inventoryConfig.padX + (inventoryConfig.slotSize + inventoryConfig.gap) + 4}px`,
              top: `${inventoryConfig.padY + 4}px`,
              width: `${inventoryConfig.slotSize - 8}px`,
              height: `${inventoryConfig.slotSize - 8}px`,
              imageRendering: "pixelated",
              opacity: writtenCount > 0 ? 1 : 0,
              pointerEvents: "none",
            }}
          />
          {letterCount > 0 && (
            <span
              style={{
                position: "absolute",
                left: `${inventoryConfig.padX + inventoryConfig.slotSize - 12}px`,
                top: `${inventoryConfig.padY + inventoryConfig.slotSize - 10}px`,
                fontFamily: "PixelFont",
                fontSize: "11px",
                color: "#8B5A2B",
                pointerEvents: "none",
              }}
            >
              {letterCount}
            </span>
          )}
          {writtenCount > 0 && (
            <span
              style={{
                position: "absolute",
                left: `${inventoryConfig.padX + (inventoryConfig.slotSize + inventoryConfig.gap) + inventoryConfig.slotSize - 12}px`,
                top: `${inventoryConfig.padY + inventoryConfig.slotSize - 10}px`,
                fontFamily: "PixelFont",
                fontSize: "11px",
                color: "#8B5A2B",
                pointerEvents: "none",
              }}
            >
              {writtenCount}
            </span>
          )}
          <img
            src="/assets/common/focus.png"
            alt=""
            style={{
              position: "absolute",
              left: `${inventoryConfig.padX + selectedSlot * (inventoryConfig.slotSize + inventoryConfig.gap) - 3}px`,
              top: `${inventoryConfig.padY - 3}px`,
              width: `${inventoryConfig.slotSize + 6}px`,
              height: `${inventoryConfig.slotSize + 6}px`,
              imageRendering: "pixelated",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
      {!showIntro && (
        <div
          style={{
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "340px",
            height: "150px",
            backgroundImage: `url('/assets/common/${9 + Math.floor(gameMinutes / 60) < 12
              ? "morning"
              : 9 + Math.floor(gameMinutes / 60) < 15
                ? "afternoon"
                : "evening"
              }.png')`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left top",
            imageRendering: "pixelated",
            zIndex: 130,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: "20px",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              fontFamily: "PixelFont",
              fontSize: "36px",
              color: "#C49A6C",
            }}
          >
            {(() => {
              const total = 9 * 60 + gameMinutes;
              const hours = Math.min(18, Math.floor(total / 60));
              const minutes = Math.min(59, total % 60);
              return `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}`;
            })()}
          </span>
        </div>
      )}
      {!showIntro && (
        <div
          onClick={() => alert("퀘스트 메뉴 준비중!")}
          style={{
            position: "absolute",
            top: "12px",
            right: "8px",
            cursor: "pointer",
            zIndex: 125,
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
        >
          <img
            src="/assets/common/quest.png"
            alt="Quest"
            style={{
              width: "52px",
              height: "auto",
              imageRendering: "pixelated",
              filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))",
            }}
          />
        </div>
      )}
      {!showIntro && (
        <>
          <MiniGameModal
            isOpen={showMiniGame}
            onClose={() => setShowMiniGame(false)}
            onWin={() => alert("미니게임 클리어!")}
          />
          <ExitConfirmModal
            isOpen={showExitConfirm}
            onConfirm={() => {
              setShowExitConfirm(false);
              const game = gameRef.current;
              if (game) {
                game.scene.start("Hallway", { x: 1000, y: 450 });
              }
            }}
            onCancel={() => setShowExitConfirm(false)}
          />
        </>
      )}
      {showIntro && <IntroScreen onStart={handleIntroStart} />}
    </div>
  );
}

export default App;

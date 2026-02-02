import React, { useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import MiniGameModal from "./components/MiniGameModal";
import ExitConfirmModal from "./components/ExitConfirmModal";
import IntroScreen from "./components/IntroScreen";

const canvasWidth = 800;
const canvasHeight = 600;
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

  const gameStateRef = useRef({
    isMiniGameOpen: false,
    setShowMiniGame: setShowMiniGame,
    setShowExitConfirm: setShowExitConfirm,
  });

  useEffect(() => {
    if (showIntro) return; // Do not initialize game until intro is done
    gameStateRef.current.isMiniGameOpen = showMiniGame;
  }, [showMiniGame, showIntro]);

  useEffect(() => {
    if (showIntro) return;
    const style = document.createElement("style");
    style.innerHTML = `
      body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #000; }
      #game-container { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; position: relative; }
    `;
    document.head.appendChild(style);

    const config = {
      type: Phaser.AUTO,
      width: canvasWidth,
      height: canvasHeight,
      parent: "game-container",
      pixelArt: true,
      backgroundColor: "#000000",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
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
      this.load.audio("bgm", `${commonPath}bgm.mp3`);

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
      const roomW = 450;
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

      this.add
        .image(startX + 180, startY + 55, "window")
        .setScale(pixelScale)
        .setDepth(startY + 55);

      const obstacles = this.physics.add.staticGroup();
      const createFurniture = ({ x, y, texture, scaleX = 1, scaleY = 1 }) => {
        const furniture = obstacles.create(x, y, texture);
        furniture.setScale(pixelScale * scaleX, pixelScale * scaleY);
        furniture.refreshBody();
        furniture.setDepth(Math.round(furniture.y));
        return furniture;
      };

      const marginX = 70;
      const leftX = startX + marginX;
      const rightX = startX + roomW - marginX;
      const topY = startY + 110;
      const midY = startY + 235;
      const lowY = startY + 360;
      const bottomY = startY + roomH - 70;

      // 왼쪽 벽 배치 (위아래)
      createFurniture({ x: leftX, y: topY, texture: "deskl", scaleX: 1 });
      createFurniture({ x: leftX, y: midY, texture: "bed", scaleX: 0.85 });
      createFurniture({ x: leftX, y: lowY, texture: "closet", scaleX: 1 });

      // 오른쪽 벽 배치 (위아래)
      createFurniture({ x: rightX, y: topY, texture: "deskr", scaleX: 1 });
      createFurniture({ x: rightX, y: midY, texture: "bed", scaleX: 0.85 });
      createFurniture({ x: rightX, y: bottomY, texture: "closet", scaleX: 1 });

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

      this.doorInside = this.add
        .image(centerX, startY + roomH, "door_inside")
        .setOrigin(0.5, 1)
        .setScale(pixelScale)
        .setDepth(startY + roomH);

      // 臾?(?섎떒 以묒븰)
      this.door = this.add
        .image(centerX, startY + roomH - 20, "door")
        .setScale(pixelScale)
        .setDepth(startY + roomH - 20);

      // 臾????곹샇?묒슜 ?띿뒪??
      this.exitText = this.add.text(centerX, startY + roomH - 60, "Press SPACE", {
        fontSize: "22px",
        fontFamily: "Galmuri",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 4, y: 4 }
      }).setOrigin(0.5).setDepth(99999).setVisible(false);

      // NPC - 침대 옆
      this.npc = this.physics.add.staticSprite(
        leftX + 70,
        midY + 10,
        "player_idle",
        0
      );
      this.npc.setScale(pixelScale);
      this.npc.setDepth(this.npc.y);
      this.npc.refreshBody();
      this.npc.anims.play("idle-right");

      // Interaction Text (using Galmuri font)
      this.interactionText = this.add.text(this.npc.x, this.npc.y - 40, "Press SPACE", {
        fontSize: "22px",
        fontFamily: "Galmuri",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 4, y: 4 }
      }).setOrigin(0.5).setDepth(99999).setVisible(false);

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

      this.player.anims.play("idle-down");

      this.bgm = this.sound.add("bgm", { loop: true, volume: 0.35 });
      if (!this.bgm.isPlaying) {
        this.bgm.play();
      }

      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.lastDirection = "down";
      this.isJumping = false;
      this.jumpTween = null;
      this.jumpHeight = 8;
      this.jumpDuration = 140;
    }

    const startJump = (scene) => {
      if (!scene.player || scene.isJumping) return;
      scene.isJumping = true;

      if (scene.jumpTween) {
        scene.jumpTween.stop();
        scene.jumpTween = null;
      }

      const startY = scene.player.y;
      scene.player.body.setVelocity(0);
      scene.player.anims.play(`jump-${scene.lastDirection}`, true);

      scene.jumpTween = scene.tweens.add({
        targets: scene.player,
        y: startY - scene.jumpHeight,
        duration: scene.jumpDuration,
        yoyo: true,
        ease: "Quad.out",
        onComplete: () => {
          scene.isJumping = false;
          scene.player.y = startY;
          scene.jumpTween = null;
        },
      });
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
        this.interactionText.setVisible(true);
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          gameStateRef.current.setShowMiniGame(true);
          this.player.body.setVelocity(0);
          this.player.anims.play(`idle-${this.lastDirection}`, true);
          return;
        }
      } else {
        this.interactionText.setVisible(false);
        // Jump only when not near NPC
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          startJump(this);
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
    return () => {
      document.head.removeChild(style);
      if (game.sound) {
        game.sound.stopAll();
      }
      game.destroy(true);
    };
  }, [showIntro]);

  return (
    <div id="game-container">
      {!showIntro && (
        <div
          onClick={() => setShowMiniGame(true)}
          style={{
            position: "absolute",
            top: "50%",
            right: "30px",
            transform: "translateY(-50%)",
            cursor: "pointer",
            zIndex: 100,
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(0.95)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; }}
        >
          <img
            src="/assets/common/quest.png"
            alt="Quest"
            style={{
              width: "80px",
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
            onConfirm={() => setShowExitConfirm(false)}
            onCancel={() => setShowExitConfirm(false)}
          />
        </>
      )}
      {showIntro && <IntroScreen onStart={() => setShowIntro(false)} />}
    </div>
  );
}

export default App;

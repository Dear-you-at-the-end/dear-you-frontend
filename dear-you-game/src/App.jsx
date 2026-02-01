import React, { useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import MiniGameModal from "./components/MiniGameModal";

const canvasWidth = 800;
const canvasHeight = 600;
const directionFrames = {
  down: [216, 217, 218, 219],
  left: [236, 237, 239],
  right: [270, 272, 273],
  up: [252, 253, 254, 255],
};

function App() {
  const [showMiniGame, setShowMiniGame] = useState(false);

  // Use a ref to share state with Phaser without re-initializing the game
  const gameStateRef = useRef({
    isMiniGameOpen: false,
    setShowMiniGame: setShowMiniGame,
  });

  // Update ref when state changes
  useEffect(() => {
    gameStateRef.current.isMiniGameOpen = showMiniGame;
  }, [showMiniGame]);

  useEffect(() => {
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
      this.load.image("wall", `${dormitoryPath}wall.png`);
      this.load.image("outline_top", `${dormitoryPath}outline_top.png`);
      this.load.image("outline_side", `${dormitoryPath}outline_side.png`);
      this.load.image("bed", `${dormitoryPath}bed.png`);
      this.load.image("closet", `${dormitoryPath}closet.png`);
      this.load.image("deskl", `${dormitoryPath}deskl.png`);
      this.load.image("deskr", `${dormitoryPath}deskr.png`);
      this.load.image("window", `${dormitoryPath}window.png`);

      this.load.spritesheet("character", `${commonPath}character.png`, {
        frameWidth: 16,
        frameHeight: 16,
      });
    }

    function create() {
      const pixelScale = 3;
      const roomW = 360;
      const roomH = 380;
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

      createFurniture({ x: startX + 50, y: startY + 150, texture: "bed", scaleX: 0.85 });
      createFurniture({ x: startX + 312, y: startY + 300, texture: "bed", scaleX: 0.85 });
      createFurniture({ x: startX + 25, y: startY + 200, texture: "deskl", scaleX: 1 });
      createFurniture({ x: startX + 335, y: startY + 130, texture: "deskr", scaleX: 1 });
      createFurniture({ x: startX + 335, y: startY + 180, texture: "deskr", scaleX: 1 });
      createFurniture({ x: startX + 19, y: startY + 305, texture: "closet", scaleX: 1 });

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
        .tileSprite(
          centerX,
          startY + roomH,
          outlineW,
          outlineTopH,
          "outline_top",
        )
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
        .tileSprite(
          startX + roomW,
          centerY,
          outlineSideW,
          roomH,
          "outline_side",
        )
        .setOrigin(0, 0.5)
        .setTileScale(pixelScale)
        .setDepth(outlineDepth);

      // NPC
      this.npc = this.physics.add.staticSprite(startX + 300, startY + 250, "character", 60);
      this.npc.setScale(pixelScale);
      this.npc.setDepth(this.npc.y);
      this.npc.refreshBody();

      // Interaction Text
      this.interactionText = this.add.text(this.npc.x, this.npc.y - 40, "Press SPACE", {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 4, y: 4 }
      }).setOrigin(0.5).setDepth(99999).setVisible(false);

      this.player = this.physics.add.sprite(
        centerX,
        centerY + 50,
        "character",
        0,
      );
      this.player.setScale(pixelScale).setCollideWorldBounds(true);

      this.player.body.setSize(12, 16).setOffset(2, 0);

      this.physics.add.collider(this.player, obstacles);
      this.physics.add.collider(this.player, this.npc);

      const createDirectionAnim = (key, frames) => {
        this.anims.create({
          key,
          frames: frames.map((frame) => ({ key: "character", frame })),
          frameRate: 8,
          repeat: -1,
        });
      };

      createDirectionAnim("walk-down", directionFrames.down);
      createDirectionAnim("walk-left", directionFrames.left);
      createDirectionAnim("walk-right", directionFrames.right);
      createDirectionAnim("walk-up", directionFrames.up);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.lastDirection = "down";
    }

    function update() {
      if (!this.player) return;

      // Handle MiniGame state
      if (gameStateRef.current.isMiniGameOpen) {
        this.player.body.setVelocity(0);
        this.player.anims.stop();
        const idleFrames = {
          down: directionFrames.down[0],
          right: directionFrames.right[0],
          up: directionFrames.up[0],
          left: directionFrames.left[0],
        };
        this.player.setFrame(idleFrames[this.lastDirection] || idleFrames.down);
        return;
      }

      // Interaction
      if (this.npc) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y);
        if (dist < 60) {
          this.interactionText.setVisible(true);
          if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            gameStateRef.current.setShowMiniGame(true);
          }
        } else {
          this.interactionText.setVisible(false);
        }
      }

      const speed = 200;
      this.player.body.setVelocity(0);
      this.player.setDepth(this.player.y);

      if (this.cursors.left.isDown) {
        this.player.body.setVelocityX(-speed);
        this.player.anims.play("walk-left", true);
        this.lastDirection = "left";
      } else if (this.cursors.right.isDown) {
        this.player.body.setVelocityX(speed);
        this.player.anims.play("walk-right", true);
        this.lastDirection = "right";
      } else if (this.cursors.up.isDown) {
        this.player.body.setVelocityY(-speed);
        this.player.anims.play("walk-up", true);
        this.lastDirection = "up";
      } else if (this.cursors.down.isDown) {
        this.player.body.setVelocityY(speed);
        this.player.anims.play("walk-down", true);
        this.lastDirection = "down";
      } else {
        this.player.anims.stop();
        const idleFrames = {
          down: directionFrames.down[0],
          right: directionFrames.right[0],
          up: directionFrames.up[0],
          left: directionFrames.left[0],
        };
        this.player.setFrame(idleFrames[this.lastDirection] || idleFrames.down);
      }
    }

    const game = new Phaser.Game(config);
    return () => {
      document.head.removeChild(style);
      game.destroy(true);
    };
  }, []);

  return (
    <div id="game-container">
      <button
        onClick={() => setShowMiniGame(true)}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 100,
          padding: "10px 20px",
          backgroundColor: "#4a90e2",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}
      >
        Quest (Test)
      </button>

      <MiniGameModal
        isOpen={showMiniGame}
        onClose={() => setShowMiniGame(false)}
        onWin={() => alert("미니게임 승리!")}
      />
    </div>
  );
}

export default App;

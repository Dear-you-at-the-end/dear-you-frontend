import Phaser from "phaser";

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 360;
const FLOOR_HEIGHT = 110;

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

export default class HallwayScene extends Phaser.Scene {
  constructor() {
    super({ key: "Hallway" });
  }

  init(data) {
    this.spawnX = data?.x ?? 200;
    this.spawnY = data?.y ?? MAP_HEIGHT - FLOOR_HEIGHT / 2;
  }

  preload() {
    const dormitoryPath = "/assets/dormitory/";
    const commonPath = "/assets/common/";

    this.load.image("hall_floor", `${dormitoryPath}tile2.png`);
    this.load.image("hall_wall", `${dormitoryPath}wall2.png`);
    this.load.image("hall_door", `${dormitoryPath}door.png`);

    const characterPath = `${commonPath}character/`;
    const spriteConfig = {
      frameWidth: spriteFrame.size,
      frameHeight: spriteFrame.size,
      margin: spriteFrame.margin,
      spacing: spriteFrame.spacing,
    };

    this.load.spritesheet("player_walk", `${characterPath}16x16 Walk-Sheet.png`, spriteConfig);
    this.load.spritesheet("player_run", `${characterPath}16x16 Run-Sheet.png`, spriteConfig);
    this.load.spritesheet("player_idle", `${characterPath}16x16 Idle-Sheet.png`, spriteConfig);
  }

  create() {
    const pixelScale = 2;

    this.cameras.main.setBackgroundColor("#222222");
    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    const floorTop = MAP_HEIGHT - FLOOR_HEIGHT;
    const floorY = floorTop + FLOOR_HEIGHT / 2;

    this.add
      .tileSprite(MAP_WIDTH / 2, floorY, MAP_WIDTH, FLOOR_HEIGHT, "hall_floor")
      .setTileScale(pixelScale)
      .setDepth(0);

    const wallTexture = this.textures.get("hall_wall").getSourceImage();
    const wallHeight = wallTexture.height * pixelScale;
    const wallY = floorTop - wallHeight / 2;

    this.add
      .tileSprite(MAP_WIDTH / 2, wallY, MAP_WIDTH, wallHeight, "hall_wall")
      .setTileScale(pixelScale)
      .setDepth(1);

    const wall = this.physics.add.staticImage(MAP_WIDTH / 2, wallY, "hall_wall");
    wall.setDisplaySize(MAP_WIDTH, wallHeight);
    wall.body.setSize(wall.displayWidth, wall.displayHeight * 0.2);
    wall.body.setOffset(0, wall.displayHeight * 0.8);
    wall.refreshBody();

    this.doors = this.physics.add.staticGroup();
    const doorTexture = this.textures.get("hall_door").getSourceImage();
    const doorHeight = doorTexture.height * pixelScale;
    const doorY = floorTop - doorHeight / 2 + 4;

    const doorPositions = [
      { x: 200, room: "101" },
      { x: 600, room: "102" },
      { x: 1000, room: "103" },
    ];

    doorPositions.forEach(({ x, room }) => {
      const door = this.doors.create(x, doorY, "hall_door");
      door.setScale(pixelScale);
      door.setDepth(2);
      door.roomNumber = room;
      door.refreshBody();

      this.add
        .text(x, doorY - doorHeight / 2 - 8, room, {
          fontSize: "14px",
          fontFamily: "Galmuri",
          color: "#FFFFFF",
        })
        .setOrigin(0.5)
        .setDepth(3);
    });

    this.createPlayerAnimations();

    this.player = this.physics.add.sprite(this.spawnX, this.spawnY, "player_idle", 0);
    this.player.setScale(pixelScale).setCollideWorldBounds(true);
    this.player.body.setSize(10, 8).setOffset(5, 12);
    this.player.setDepth(100);

    this.physics.add.collider(this.player, wall);

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.lastDirection = "down";
    this.player.anims.play("idle-down");

    this.nearDoor = null;

    this.createVignette();
  }

  createPlayerAnimations() {
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
        if (!this.anims.exists(`${action}-${dir}`)) {
          this.anims.create({
            key: `${action}-${dir}`,
            frames: this.anims.generateFrameNumbers(textureKey, { start, end }),
            frameRate,
            repeat,
          });
        }
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
  }

  createVignette() {
    const width = this.scale.width;
    const height = this.scale.height;
    const vignetteWidth = 70;
    const alpha = 0.25;

    this.add
      .rectangle(0, 0, vignetteWidth, height, 0x000000, alpha)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(9999);

    this.add
      .rectangle(width - vignetteWidth, 0, vignetteWidth, height, 0x000000, alpha)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(9999);
  }

  update() {
    if (!this.player) return;

    this.nearDoor = null;
    this.doors.children.entries.forEach((door) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        door.x,
        door.y
      );
      if (distance < 60) {
        this.nearDoor = door;
      }
    });

    if (this.nearDoor && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.nearDoor.roomNumber === "103") {
        this.scene.start("Room103");
      } else {
        console.log(`Enter Room ${this.nearDoor.roomNumber}`);
      }
    }

    const isRunning = this.shiftKey.isDown;
    const speed = isRunning ? 200 : 110;
    const animPrefix = isRunning ? "run" : "walk";

    this.player.body.setVelocity(0);

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
}

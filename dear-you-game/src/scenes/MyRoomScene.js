import Phaser from "phaser";

const MAP_WIDTH = 500;
const MAP_HEIGHT = 420;

export default class MyRoomScene extends Phaser.Scene {
  constructor() {
    super({ key: "MyRoom" });
  }

  init(data) {
    this.spawnX = data?.x ?? MAP_WIDTH / 2;
    this.spawnY = data?.y ?? MAP_HEIGHT - 80;
  }

  preload() {
    const roomPath = "/assets/myroom/";
    const commonPath = "/assets/common/";

    this.load.image("my_floor", `${roomPath}tile6.png`);
    this.load.image("my_wall", `${roomPath}wall4.png`);
    this.load.image("my_bed", `${roomPath}bed1.png`);
    this.load.image("my_bedside", `${roomPath}bedside.png`);
    this.load.image("my_chair", `${roomPath}chair1.png`);
    this.load.image("my_desk", `${roomPath}desk1.png`);
    this.load.image("my_rug", `${roomPath}rug.png`);
    this.load.image("my_door", `${roomPath}door.png`);
    this.load.image("letter_icon", `${commonPath}letter.png`);
    this.load.image("letter_written", `${commonPath}letter_wirte.png`);

    const characterPath = `${commonPath}character/`;
    this.load.atlas(
      "main_character",
      `${characterPath}main_character.png`,
      `${characterPath}main_character.json`
    );
  }

  create() {
    const pixelScale = 2;

    this.cameras.main.setBackgroundColor("#222222");
    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    const floorHeight = 300;
    const floorTop = MAP_HEIGHT - floorHeight;
    const floorY = floorTop + floorHeight / 2;

    this.add
      .tileSprite(MAP_WIDTH / 2, floorY, MAP_WIDTH, floorHeight, "my_floor")
      .setTileScale(pixelScale)
      .setDepth(0);

    const wallTexture = this.textures.get("my_wall").getSourceImage();
    const wallHeight = wallTexture.height * pixelScale;
    const wallY = floorTop - wallHeight / 2;

    this.add
      .tileSprite(MAP_WIDTH / 2, wallY, MAP_WIDTH, wallHeight, "my_wall")
      .setTileScale(pixelScale)
      .setDepth(1);

    const wallBody = this.physics.add.staticImage(MAP_WIDTH / 2, wallY, "my_wall");
    wallBody.setDisplaySize(MAP_WIDTH, wallHeight);
    wallBody.setVisible(false);
    wallBody.body.setSize(MAP_WIDTH, wallHeight * 0.2);
    wallBody.body.setOffset(0, wallHeight * 0.8);
    wallBody.refreshBody();

    const obstacles = this.physics.add.staticGroup();

    const rug = obstacles.create(MAP_WIDTH / 2, floorTop + 140, "my_rug");
    rug.setScale(pixelScale);
    rug.refreshBody();
    rug.body.setSize(rug.displayWidth, rug.displayHeight * 0.2);
    rug.body.setOffset(0, rug.displayHeight * 0.8);
    rug.setDepth(rug.y);

    const bed = obstacles.create(120, floorTop + 110, "my_bed");
    bed.setScale(pixelScale);
    bed.refreshBody();
    bed.body.setSize(bed.displayWidth, bed.displayHeight * 0.3);
    bed.body.setOffset(0, bed.displayHeight * 0.7);
    bed.setDepth(bed.y);

    const bedside = obstacles.create(200, floorTop + 120, "my_bedside");
    bedside.setScale(pixelScale);
    bedside.refreshBody();
    bedside.body.setSize(bedside.displayWidth, bedside.displayHeight * 0.3);
    bedside.body.setOffset(0, bedside.displayHeight * 0.7);
    bedside.setDepth(bedside.y);

    const desk = obstacles.create(MAP_WIDTH - 140, floorTop + 120, "my_desk");
    desk.setScale(pixelScale);
    desk.refreshBody();
    desk.body.setSize(desk.displayWidth, desk.displayHeight * 0.3);
    desk.body.setOffset(0, desk.displayHeight * 0.7);
    desk.setDepth(desk.y);

    const chair = obstacles.create(MAP_WIDTH - 170, floorTop + 170, "my_chair");
    chair.setScale(pixelScale);
    chair.refreshBody();
    chair.body.setSize(chair.displayWidth, chair.displayHeight * 0.5);
    chair.body.setOffset(0, chair.displayHeight * 0.5);
    chair.setDepth(chair.y);

    const doorY = MAP_HEIGHT - 20;
    this.exitDoor = this.add.image(MAP_WIDTH / 2, doorY, "my_door");
    this.exitDoor.setScale(pixelScale);
    this.exitDoor.setDepth(999);

    const firstFrame = "16x16 All Animations 0.aseprite";
    this.player = this.physics.add.sprite(this.spawnX, this.spawnY, "main_character", firstFrame);
    this.player.setScale(pixelScale).setCollideWorldBounds(true);
    this.player.body.setSize(10, 8).setOffset(5, 12);
    this.player.setDepth(this.player.y);

    this.handItem = this.add.image(0, 0, "letter_icon").setScale(1).setDepth(200).setVisible(false);

    this.physics.add.collider(this.player, wallBody);
    this.physics.add.collider(this.player, obstacles);

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1.6);
    this.cameras.main.roundPixels = true;

    this.moveKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.createPlayerAnimations();
    this.lastDirection = "down";
    this.player.anims.play("idle-down");
    this.prevRight = false;
  }

  createPlayerAnimations() {
    if (this.anims.exists("idle-down")) return;

    const makeAnim = (key, start, end, frameRate, repeat) => {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNames("main_character", {
          start,
          end,
          prefix: "16x16 All Animations ",
          suffix: ".aseprite",
        }),
        frameRate,
        repeat,
      });
    };

    makeAnim("idle-down", 0, 3, 4, -1);
    makeAnim("idle-left", 4, 7, 4, -1);
    makeAnim("idle-right", 8, 11, 4, -1);
    makeAnim("idle-up", 0, 3, 4, -1);

    makeAnim("walk-down", 12, 15, 10, -1);
    makeAnim("walk-right", 16, 19, 10, -1);
    makeAnim("walk-left", 20, 23, 10, -1);
    makeAnim("walk-up", 24, 27, 10, -1);

    makeAnim("run-right", 28, 33, 14, -1);
    makeAnim("run-left", 34, 39, 14, -1);
    makeAnim("run-down", 12, 15, 14, -1);
    makeAnim("run-up", 24, 27, 14, -1);
  }

  update() {
    if (!this.player) return;

    const pointer = this.input.activePointer;
    const pointerRightDown = pointer.rightButtonDown();
    const rightJustDown = pointerRightDown && !this.prevRight;
    this.prevRight = pointerRightDown;

    const distanceToDoor = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.exitDoor.x,
      this.exitDoor.y
    );

    const canTrigger = !this.lastTriggerTime || this.time.now - this.lastTriggerTime > 1000;
    const isMovingDown = this.moveKeys.down.isDown;

    if (distanceToDoor < 60 && canTrigger && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey) || isMovingDown)) {
      this.lastTriggerTime = this.time.now;
      window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "LeaveMyRoom" } }));
      this.player.body.setVelocity(0);
      return;
    }

    const isRunning = this.shiftKey.isDown;
    const speed = isRunning ? 200 : 110;
    const animPrefix = isRunning ? "run" : "walk";
    const animKey = (action, dir) => {
      const map = {
        idle: { down: "idle-down", left: "idle-left", right: "idle-right", up: "idle-down" },
        walk: { down: "walk-down", left: "walk-left", right: "walk-right", up: "walk-up" },
        run: { down: "run-down", left: "run-left", right: "run-right", up: "run-up" },
      };
      return map[action]?.[dir] ?? "idle-down";
    };

    this.player.body.setVelocity(0);

    const leftDown = this.moveKeys.left.isDown || this.moveKeys.a.isDown;
    const rightDown = this.moveKeys.right.isDown || this.moveKeys.d.isDown;
    const upDown = this.moveKeys.up.isDown || this.moveKeys.w.isDown;
    const downDown = this.moveKeys.down.isDown || this.moveKeys.s.isDown;

    if (leftDown) {
      this.player.body.setVelocityX(-speed);
      this.player.anims.play(animKey(animPrefix, "left"), true);
      this.lastDirection = "left";
    } else if (rightDown) {
      this.player.body.setVelocityX(speed);
      this.player.anims.play(animKey(animPrefix, "right"), true);
      this.lastDirection = "right";
    } else if (upDown) {
      this.player.body.setVelocityY(-speed);
      this.player.anims.play(animKey(animPrefix, "up"), true);
      this.lastDirection = "up";
    } else if (downDown) {
      this.player.body.setVelocityY(speed);
      this.player.anims.play(animKey(animPrefix, "down"), true);
      this.lastDirection = "down";
    } else {
      this.player.anims.play(animKey("idle", this.lastDirection), true);
    }

    this.player.setDepth(this.player.y);

    if (this.handItem) {
      const selectedSlot = this.registry.get("selectedSlot") ?? 0;
      const letterCount = this.registry.get("letterCount") ?? 0;
      const writtenCount = this.registry.get("writtenCount") ?? 0;

      if (selectedSlot === 0 && letterCount > 0) {
        this.handItem.setTexture("letter_icon");
        this.handItem.setVisible(true);
      } else if (selectedSlot === 1 && writtenCount > 0) {
        this.handItem.setTexture("letter_written");
        this.handItem.setVisible(true);
      } else {
        this.handItem.setVisible(false);
      }

      if (this.handItem.visible) {
        this.handItem.x = this.player.x + (this.lastDirection === "left" ? -8 : 8);
        this.handItem.y = this.player.y + 10;
        this.handItem.setDepth(this.player.depth + 1);
      }
    }
  }
}

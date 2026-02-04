import Phaser from "phaser";

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 720;

export default class KaimaruScene extends Phaser.Scene {
  constructor() {
    super({ key: "Kaimaru" });
  }

  init(data) {
    this.spawnX = data?.x ?? MAP_WIDTH / 2;
    this.spawnY = data?.y ?? MAP_HEIGHT - 80;
  }

  preload() {
    const kaimaruPath = "/assets/kaimaru/";
    const commonPath = "/assets/common/";

    this.load.image("kaimaru_floor", `${kaimaruPath}tile4.png`);
    this.load.image("kaimaru_wall", `${kaimaruPath}wall3.png`);
    this.load.image("kaimaru_door", `${kaimaruPath}door.png`);
    this.load.image("kaimaru_table_set", `${kaimaruPath}tableset.png`);
    this.load.image("kaimaru_table_set_back", `${kaimaruPath}tableset_bk.png`);
    this.load.image("kaimaru_table_main", `${kaimaruPath}table_main.png`);
    this.load.image("kaimaru_table", `${kaimaruPath}table.png`);
    this.load.image("npc_bsy", `${commonPath}character/bsy.png`);
    this.load.image("npc_kys", `${commonPath}character/kys.png`);
    this.load.image("npc_thj", `${commonPath}character/thj.png`);
    this.load.image("npc_jjw", `${commonPath}character/jjw.png`);
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
    const pixelScale = 3;
    const canvasWidth = this.scale.width;
    const canvasHeight = this.scale.height;
    const roomW = 800;
    const roomH = 560;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const startX = centerX - roomW / 2;
    const startY = centerY - roomH / 2;

    this.cameras.main.setBackgroundColor("#222222");
    this.cameras.main.setZoom(1);
    this.physics.world.setBounds(startX, startY, roomW, roomH);

    // Floor
    this.add
      .tileSprite(centerX, centerY, roomW, roomH, "kaimaru_floor")
      .setTileScale(pixelScale)
      .setDepth(0);

    // Wall (Top)
    const wallTexture = this.textures.get("kaimaru_wall").getSourceImage();
    const wallHeight = wallTexture.height * pixelScale;
    const wallY = startY + wallHeight / 2;

    this.add
      .tileSprite(centerX, wallY, roomW, wallHeight, "kaimaru_wall")
      .setTileScale(pixelScale)
      .setDepth(1);

    // Wall Barriers (Invisible)
    const walls = this.physics.add.staticGroup();
    // Top
    const topWall = walls.create(centerX, wallY, null);
    topWall.setSize(roomW, wallHeight).setVisible(false).refreshBody();
    // Left
    const leftWall = walls.create(startX, centerY, null);
    leftWall.setSize(10, roomH).setVisible(false).refreshBody();
    // Right
    const rightWall = walls.create(startX + roomW, centerY, null);
    rightWall.setSize(10, roomH).setVisible(false).refreshBody();
    // Bottom
    const bottomWall = walls.create(centerX, startY + roomH, null);
    bottomWall.setSize(roomW, 20).setVisible(false).refreshBody();

    const obstacles = this.physics.add.staticGroup();

    // Door (Bottom Center)
    const doorTex = this.textures.get("kaimaru_door").getSourceImage();
    const doorH = doorTex.height * pixelScale;
    const doorY = startY + roomH - doorH / 2 - 10;
    const door = this.add.image(centerX, doorY, "kaimaru_door");
    door.setScale(pixelScale);
    door.setDepth(Math.round(doorY) + 2);
    this.exitDoor = door;

    // Tables - 3 columns x 3 rows (more spacing, centered)
    const rowSpacing = 120;
    const rowStart = centerY - rowSpacing;
    const colOffsets = [-200, 0, 200];
    const rowOffsets = [0, rowSpacing, rowSpacing * 2];
    const tablePositions = [];
    rowOffsets.forEach((rowOffset) => {
      colOffsets.forEach((colOffset) => {
        tablePositions.push({ x: centerX + colOffset, y: rowStart + rowOffset });
      });
    });

    tablePositions.forEach((pos, index) => {
      // Main table logic: Let's make the top-right one main? Or top-left?
      // Old logic: index 1 was main (top-center).
      // Let's make index 1 (top-right) main.
      const isMainTable = index === 4;

      let textureKey;
      if (isMainTable) {
        textureKey = "kaimaru_table_main";
      } else {
        // Aesthetic variety
        if (index % 2 === 0) textureKey = "kaimaru_table_set";
        else textureKey = "kaimaru_table_set_back";
      }

      const table = obstacles.create(pos.x, pos.y, textureKey);
      table.setScale(pixelScale);
      table.refreshBody();

      if (isMainTable) {
        table.body.setSize(table.displayWidth, table.displayHeight * 0.45);
        table.body.setOffset(0, table.displayHeight * 0.55);
      } else {
        table.body.setSize(table.displayWidth * 0.9, table.displayHeight * 0.6);
        table.body.setOffset(table.displayWidth * 0.05, table.displayHeight * 0.3);
      }
      table.setDepth(Math.round(table.y));

      if (isMainTable) {
        // NPCs around main table (match reference: top/bottom on each side)
        const sideX = 56;
        const topY = -18;
        const bottomY = 18;
        this.add.image(pos.x - sideX, pos.y + topY, "npc_bsy").setScale(pixelScale).setDepth(pos.y + topY);
        this.add.image(pos.x - sideX, pos.y + bottomY, "npc_kys").setScale(pixelScale).setDepth(pos.y + bottomY);
        this.add.image(pos.x + sideX, pos.y + topY, "npc_jjw").setScale(pixelScale).setDepth(pos.y + topY);
        this.add.image(pos.x + sideX, pos.y + bottomY, "npc_thj").setScale(pixelScale).setDepth(pos.y + bottomY);
      }
    });

    const firstFrame = "16x16 All Animations 0.aseprite";
    this.player = this.physics.add.sprite(this.spawnX, this.spawnY, "main_character", firstFrame);
    this.player.setScale(pixelScale).setCollideWorldBounds(true);
    this.player.body.setSize(10, 8).setOffset(5, 12);
    this.player.setDepth(Math.round(this.player.y));

    this.handItem = this.add.image(0, 0, "letter_icon").setScale(1).setDepth(200).setVisible(false);

    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, obstacles);

    this.cameras.main.setBounds(startX, startY, roomW, roomH);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1.3);
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
    const isMovingDown = this.moveKeys.down.isDown || this.moveKeys.s.isDown;

    if (distanceToDoor < 60 && canTrigger && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey) || isMovingDown)) {
      this.lastTriggerTime = this.time.now;
      window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "LeaveKaimaru" } }));
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

    this.player.setDepth(Math.round(this.player.y));

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

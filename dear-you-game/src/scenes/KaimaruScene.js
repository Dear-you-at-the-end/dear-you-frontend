import Phaser from "phaser";

const MAP_WIDTH = 900;
const MAP_HEIGHT = 520;
const FLOOR_TOP = 120;

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
    const pixelScale = 2;

    this.cameras.main.setBackgroundColor("#222222");
    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    const floorHeight = MAP_HEIGHT - FLOOR_TOP;
    const floorY = FLOOR_TOP + floorHeight / 2;

    this.add
      .tileSprite(MAP_WIDTH / 2, floorY, MAP_WIDTH, floorHeight, "kaimaru_floor")
      .setTileScale(pixelScale)
      .setDepth(0);

    const wallTexture = this.textures.get("kaimaru_wall").getSourceImage();
    const wallHeight = wallTexture.height * pixelScale;
    const wallY = FLOOR_TOP - wallHeight / 2;

    this.add
      .tileSprite(MAP_WIDTH / 2, wallY, MAP_WIDTH, wallHeight, "kaimaru_wall")
      .setTileScale(pixelScale)
      .setDepth(1);

    const wallBody = this.physics.add.staticImage(MAP_WIDTH / 2, wallY, "kaimaru_wall");
    wallBody.setDisplaySize(MAP_WIDTH, wallHeight);
    wallBody.setVisible(false);
    wallBody.body.setSize(MAP_WIDTH, wallHeight * 0.2);
    wallBody.body.setOffset(0, wallHeight * 0.8);
    wallBody.refreshBody();

    const obstacles = this.physics.add.staticGroup();

    const doorTexture = this.textures.get("kaimaru_door").getSourceImage();
    const doorHeight = doorTexture.height * pixelScale;
    const doorY = MAP_HEIGHT - doorHeight / 2 - 8;
    const door = this.add.image(MAP_WIDTH / 2, doorY, "kaimaru_door");
    door.setScale(pixelScale);
    door.setDepth(Math.round(doorY) + 2);
    this.exitDoor = door;

    const tablePositions = [
      { x: 200, y: FLOOR_TOP + 90 },
      { x: 450, y: FLOOR_TOP + 90 },
      { x: 700, y: FLOOR_TOP + 90 },
      { x: 200, y: FLOOR_TOP + 190 },
      { x: 450, y: FLOOR_TOP + 190 },
      { x: 700, y: FLOOR_TOP + 190 },
    ];

    tablePositions.forEach((pos, index) => {
      const isMainTable = index === 1;
      const back = this.add.image(pos.x, pos.y - 12, "kaimaru_table_set_back");
      back.setScale(pixelScale);
      back.setDepth(Math.round(back.y));

      const table = obstacles.create(pos.x, pos.y, isMainTable ? "kaimaru_table_main" : "kaimaru_table_set");
      table.setScale(pixelScale);
      table.refreshBody();
      table.body.setSize(table.displayWidth, table.displayHeight * 0.45);
      table.body.setOffset(0, table.displayHeight * 0.55);
      table.setDepth(Math.round(table.y));

      if (isMainTable) {
        const npcLeft = this.add.image(pos.x - 36, pos.y + 12, "npc_bsy");
        npcLeft.setScale(pixelScale);
        npcLeft.setDepth(Math.round(npcLeft.y));
        const npcLeft2 = this.add.image(pos.x - 12, pos.y + 12, "npc_kys");
        npcLeft2.setScale(pixelScale);
        npcLeft2.setDepth(Math.round(npcLeft2.y));
        const npcRight = this.add.image(pos.x + 12, pos.y + 12, "npc_thj");
        npcRight.setScale(pixelScale);
        npcRight.setDepth(Math.round(npcRight.y));
        const npcRight2 = this.add.image(pos.x + 36, pos.y + 12, "npc_jjw");
        npcRight2.setScale(pixelScale);
        npcRight2.setDepth(Math.round(npcRight2.y));
      }
    });

    const firstFrame = "16x16 All Animations 0.aseprite";
    this.player = this.physics.add.sprite(this.spawnX, this.spawnY, "main_character", firstFrame);
    this.player.setScale(pixelScale).setCollideWorldBounds(true);
    this.player.body.setSize(10, 8).setOffset(5, 12);
    this.player.setDepth(Math.round(this.player.y));

    this.handItem = this.add.image(0, 0, "letter_icon").setScale(1).setDepth(200).setVisible(false);

    this.physics.add.collider(this.player, wallBody);
    this.physics.add.collider(this.player, obstacles);

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1.2);
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

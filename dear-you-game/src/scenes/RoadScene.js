import Phaser from "phaser";

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 320;

export default class RoadScene extends Phaser.Scene {
  constructor() {
    super({ key: "Road" });
  }

  init(data) {
    this.spawnX = data?.x ?? null;
    this.spawnY = data?.y ?? null;
  }

  preload() {
    const roadPath = "/assets/road/";
    const commonPath = "/assets/common/";

    this.load.image("tile_grass", `${roadPath}tile_grass.png`);
    this.load.image("tile_up", `${roadPath}tile_up.png`);
    this.load.image("tile_center", `${roadPath}tile3.png`);
    this.load.image("tile_down", `${roadPath}tile_down.png`);
    this.load.image("road_sarang_hall", `${roadPath}building/sarang_hall.png`);
    this.load.image("road_kaimaru", `${roadPath}building/kaimaru.png`);
    this.load.image("post_office_flag", `${roadPath}post_office_flag.png`);
    this.load.image("road_tree", `${roadPath}tree.png`);
    this.load.image("road_bush", `${roadPath}bush.png`);
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
    const baseTile = this.textures.get("tile_grass").getSourceImage();
    const tileSize = baseTile.width;
    const rows = Math.ceil(MAP_HEIGHT / tileSize);
    const cols = Math.ceil(MAP_WIDTH / tileSize);
    const mapHeight = rows * tileSize;
    const topGrassRows = 5;
    const bottomGrassRows = 3;

    this.physics.world.setBounds(0, 0, MAP_WIDTH, mapHeight);

    const pickRowKey = (row) => {
      const topEdgeRow = topGrassRows;
      const bottomEdgeRow = rows - bottomGrassRows - 1;

      if (row < topGrassRows || row >= rows - bottomGrassRows) return "tile_grass";
      if (row === topEdgeRow) return "tile_up";
      if (row === bottomEdgeRow) return "tile_down";
      return "tile_center";
    };

    const addTile = (key, col, row) => {
      const source = this.textures.get(key).getSourceImage();
      const scale = tileSize / source.width;
      const x = col * tileSize + tileSize / 2;
      const y = row * tileSize + tileSize / 2;
      this.add.image(x, y, key).setScale(scale).setDepth(0);
    };

    for (let row = 0; row < rows; row += 1) {
      const key = pickRowKey(row);
      for (let col = 0; col < cols; col += 1) {
        addTile(key, col, row);
      }
    }

    const obstacles = this.physics.add.staticGroup();

    const buildingScale = 1;
    const buildingBottomTarget = tileSize * topGrassRows - 2;
    const buildingDefs = [
      { key: "road_sarang_hall", x: 160, scale: 1.2 },
      { key: "road_kaimaru", x: 620, scale: 1.35 },
      { key: "post_office_flag", x: 1080 },
    ];

    const buildingBlocks = buildingDefs.map((def) => {
      const tex = this.textures.get(def.key).getSourceImage();
      const width = tex.width * (def.scale ?? buildingScale);
      return { x: def.x, half: width / 2 + 60 };
    });

    buildingDefs.forEach((def) => {
      const tex = this.textures.get(def.key).getSourceImage();
      const scale = def.scale ?? buildingScale;
      const height = tex.height * scale;
      const bottomY = Math.max(buildingBottomTarget, Math.ceil(height / 2) + 4);
      const y = Math.round(bottomY - height / 2);
      const building = obstacles.create(def.x, y, def.key);
      building.setScale(scale);
      building.refreshBody();
      building.body.setSize(building.displayWidth, building.displayHeight * 0.3);
      building.body.setOffset(0, building.displayHeight * 0.7);
      building.setDepth(Math.round(bottomY));
      def.bottomY = bottomY;
    });

    const grassTopY = Math.round(tileSize * (topGrassRows / 2));
    const grassBottomY = Math.round(mapHeight - tileSize * (bottomGrassRows / 2));
    const treeScale = 0.4;
    const bushScale = 0.6;
    const treeSpacing = 200;
    const treePositions = [];

    for (let x = 120; x <= MAP_WIDTH - 120; x += treeSpacing) {
      if (buildingBlocks.some((b) => Math.abs(x - b.x) < b.half)) continue;
      treePositions.push({ x, y: grassTopY });
      treePositions.push({ x, y: grassBottomY });
    }

    treePositions.forEach((pos) => {
      const tree = obstacles.create(pos.x, pos.y, "road_tree");
      tree.setScale(treeScale);
      tree.refreshBody();
      tree.body.setSize(tree.displayWidth, tree.displayHeight * 0.4);
      tree.body.setOffset(0, tree.displayHeight * 0.6);
      tree.setDepth(Math.round(tree.y));
    });

    const bushPositions = [];
    for (let x = 180; x <= MAP_WIDTH - 180; x += 160) {
      if (buildingBlocks.some((b) => Math.abs(x - b.x) < b.half)) continue;
      bushPositions.push({ x, y: grassTopY });
      bushPositions.push({ x, y: grassBottomY });
    }

    bushPositions.forEach((pos) => {
      const bush = obstacles.create(pos.x, pos.y, "road_bush");
      bush.setScale(bushScale);
      bush.refreshBody();
      bush.setDepth(Math.round(bush.y));
    });

    const sarang = buildingDefs[0];
    this.entranceX = sarang.x;
    this.entranceY = Math.round((sarang.bottomY ?? buildingBottomTarget) - 8);

    this.createPlayerAnimations();
    const firstFrame = "16x16 All Animations 0.aseprite";
    const postFlag = buildingDefs.find((def) => def.key === "post_office_flag");
    // Spawn in front of post office flag if no position provided
    const spawnX = this.spawnX ?? Math.round(postFlag?.x ?? MAP_WIDTH / 2);
    const spawnY = this.spawnY ?? Math.round(tileSize * (topGrassRows + 2));
    this.player = this.physics.add.sprite(spawnX, spawnY, "main_character", firstFrame);
    this.player.setScale(pixelScale).setCollideWorldBounds(true);
    this.player.body.setSize(10, 8).setOffset(5, 12);
    this.player.setDepth(10000);

    this.handItem = this.add.image(0, 0, "letter_icon").setScale(1).setDepth(200).setVisible(false);

    this.physics.add.collider(this.player, obstacles);

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, mapHeight);
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
    const rightDown = pointer.rightButtonDown();
    const rightJustDown = rightDown && !this.prevRight;
    this.prevRight = rightDown;

    const distanceToEntrance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.entranceX,
      this.entranceY
    );

    const canTrigger = !this.lastTriggerTime || (this.time.now - this.lastTriggerTime > 1000);
    const isMovingUp = this.moveKeys.up.isDown;

    if (distanceToEntrance < 50 && canTrigger && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey) || isMovingUp)) {
      this.lastTriggerTime = this.time.now;
      window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "EnterHallway" } }));
      // Stop movement to prevent sliding
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

    if (this.scene.isPaused) return; // Prevent movement if paused (optionally)

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

    this.player.setDepth(10000);

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

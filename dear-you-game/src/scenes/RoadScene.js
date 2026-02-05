import Phaser from "phaser";

const MAP_WIDTH = 2400;
const MAP_HEIGHT = 600;

export default class RoadScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  init(data) {
    this.spawnX = data?.x ?? null;
    this.spawnY = data?.y ?? null;
  }

  preload() {
    const roadPath = "/assets/road/";
    const commonPath = "/assets/common/";

    this.load.image("tile_grass", `${roadPath}tile_grass.png`);
    this.load.image("tile_top", `${roadPath}tile_top.png`);
    this.load.image("tile_center", `${roadPath}tile3.png`);
    this.load.image("tile_down", `${roadPath}tile_down.png`);
    this.load.image("road_sarang_hall", `${roadPath}building/sarang_hall.png`);
    this.load.image("road_kaimaru", `${roadPath}building/kaimaru.png`);
    this.load.image("post_office_flag", `${roadPath}post_office_flag.png`);
    this.load.image("road_tree", `${roadPath}tree.png`);
    this.load.image("road_bush", `${roadPath}bush.png`);
    this.load.image("road_lamp", `${roadPath}lamp.png`);
    this.load.image("road_bus", `${roadPath}bus.png`);
    this.load.image("block", `${roadPath}block.png`);
    this.load.image("stair_down", `${roadPath}stair_down.png`);
    for (let i = 1; i <= 6; i++) {
      this.load.image(`b${i}`, `${roadPath}bicycle/b${i}.png`);
    }
    this.load.image("letter_icon", `${commonPath}letter.png`);
    this.load.image("letter_written", `${commonPath}letter_wirte.png`);
    this.load.image("letter_written", `${commonPath}letter_wirte.png`);
    this.load.spritesheet("cat", "/assets/road/cat.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("goose", "/assets/road/goose.png", { frameWidth: 32, frameHeight: 32 });

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
    const tileSize = baseTile.height;
    const rows = Math.ceil(MAP_HEIGHT / tileSize);
    const mapHeight = rows * tileSize;
    const topGrassRows = 10;
    const bottomGrassRows = 8;

    this.physics.world.setBounds(0, 0, MAP_WIDTH, mapHeight);

    // Base grass layer to avoid gaps
    this.add.tileSprite(MAP_WIDTH / 2, mapHeight / 2, MAP_WIDTH, mapHeight, "tile_grass").setDepth(-1);

    const pickRowKey = (row) => {
      const topEdgeRow = topGrassRows;
      const bottomEdgeRow = rows - bottomGrassRows - 1;

      if (row < topGrassRows || row >= rows - bottomGrassRows) return "tile_grass";
      if (row === topEdgeRow) return "tile_top";
      if (row === bottomEdgeRow) return "tile_down";
      return "tile_center";
    };

    for (let row = 0; row < rows; row += 1) {
      const key = pickRowKey(row);
      const tex = this.textures.get(key).getSourceImage();

      let spriteHeight = tileSize;
      let y = row * tileSize + tileSize / 2;
      let originY = 0.5;

      if (key === "tile_top") {
        spriteHeight = tex.height;
        y = (row + 1) * tileSize;
        originY = 1;
      } else if (key === "tile_down") {
        spriteHeight = tex.height;
        y = row * tileSize - 2; // Align to top and move up 2px to overlap
        originY = 0;
      }

      const depth = (key === "tile_top" || key === "tile_down") ? 1 : 0;
      this.add.tileSprite(MAP_WIDTH / 2, y, MAP_WIDTH, spriteHeight, key)
        .setOrigin(0.5, originY)
        .setDepth(depth);
    }

    const obstacles = this.physics.add.staticGroup();

    const buildingScale = 1.6;
    const buildingBottomTarget = tileSize * topGrassRows - 2;
    const buildingDefs = [
      { key: "road_sarang_hall", x: 260, scale: 2.1 },
      { key: "road_kaimaru", x: 1060, scale: 2.3 },
      { key: "post_office_flag", x: 2000, scale: 1.1 },
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
      building.body.setSize(building.displayWidth * 0.85, building.displayHeight * 0.4);
      building.body.setOffset(building.displayWidth * 0.075, building.displayHeight * 0.6);
      building.setDepth(Math.round(bottomY));
      def.bottomY = bottomY;
    });

    const roadTopY = tileSize * topGrassRows;
    const roadBottomY = tileSize * (rows - bottomGrassRows);

    // Bus - Lower roadside between Kaimaru and Post Office Flag
    // Kaimaru x=1060, PostFlag x=2000 => Bus x ~1530
    // Place bus BEFORE decorations so it registers in buildingBlocks
    const busX = 1530;
    const busY = roadBottomY - 25; // moved further up
    const bus = obstacles.create(busX, busY, "road_bus");
    bus.setScale(0.25);
    bus.setDepth(busY);
    bus.refreshBody();
    bus.body.setSize(bus.displayWidth * 0.6, bus.displayHeight * 0.4);
    bus.body.setOffset(bus.displayWidth * 0.05, bus.displayHeight * 0.35);
    this.busEntranceX = busX + 40;
    this.busEntranceY = busY + 10;
    // Add bus boundary to building blocks so random items don't overlap heavily
    // Using a larger 'half' value to ensure clear space around it
    buildingBlocks.push({ x: busX, half: (bus.displayWidth) / 2 + 80 });

    const bushScale = 1.8;
    const treeScale = 1.6;
    const lampScale = 1.5;
    // Scattered Decorations (Bushes, Trees, Lamps)
    // Avoid buildings: buildingBlocks contains {x, half}
    const safeDist = 80;
    const grassYRanges = [
      { min: 40, max: roadTopY - 40 }, // Top Grass Area
      { min: roadBottomY + 40, max: mapHeight - 40 } // Bottom Grass Area
    ];

    const decorations = [
      { key: "road_tree", count: 8, scale: treeScale, minGap: 140, body: { w: 0.25, h: 0.25, offY: 0.75 } },
      { key: "road_bush", count: 12, scale: bushScale, minGap: 90, body: { w: 0.8, h: 0.5, offY: 0.5 } },
      { key: "road_lamp", count: 4, scale: lampScale, minGap: 160, body: { w: 0.2, h: 0.2, offY: 0.8 } }
    ];

    const placedDecorations = [];

    const fixedDecorations = [
      // Gap between Sarang(260) and Kaimaru(1060)
      { x: 380, y: roadBottomY + 60, key: "road_tree", scale: treeScale, body: { w: 0.25, h: 0.25, offY: 0.75 } },
      { x: 500, y: roadTopY - 60, key: "road_tree", scale: treeScale, body: { w: 0.25, h: 0.25, offY: 0.75 } },
      { x: 600, y: roadBottomY + 60, key: "road_lamp", scale: lampScale, body: { w: 0.2, h: 0.2, offY: 0.8 } },
      { x: 740, y: roadTopY - 80, key: "road_bush", scale: bushScale, body: { w: 0.8, h: 0.5, offY: 0.5 } },
      { x: 800, y: roadBottomY + 50, key: "road_tree", scale: treeScale, body: { w: 0.25, h: 0.25, offY: 0.75 } },

      // Gap between Kaimaru(1060) and Bus(1530)
      { x: 1260, y: roadTopY - 90, key: "road_tree", scale: treeScale, body: { w: 0.25, h: 0.25, offY: 0.75 } },
      { x: 1300, y: roadTopY - 50, key: "road_lamp", scale: lampScale, body: { w: 0.2, h: 0.2, offY: 0.8 } },
      { x: 1380, y: roadBottomY + 60, key: "road_tree", scale: treeScale, body: { w: 0.25, h: 0.25, offY: 0.75 } },

      // Gap between Bus(1530) and Flag(2000)
      { x: 1750, y: roadBottomY + 70, key: "road_tree", scale: treeScale, body: { w: 0.25, h: 0.25, offY: 0.75 } },
      { x: 1850, y: roadTopY - 70, key: "road_bush", scale: bushScale, body: { w: 0.8, h: 0.5, offY: 0.5 } },
      { x: 1940, y: roadBottomY + 60, key: "road_tree", scale: treeScale, body: { w: 0.25, h: 0.25, offY: 0.75 } },

      // Far right
      { x: 2200, y: roadBottomY + 60, key: "road_lamp", scale: lampScale, body: { w: 0.2, h: 0.2, offY: 0.8 } },
      { x: 2300, y: roadTopY - 60, key: "road_tree", scale: treeScale, body: { w: 0.25, h: 0.25, offY: 0.75 } },
    ];

    fixedDecorations.forEach(deco => {
      const item = obstacles.create(deco.x, deco.y, deco.key);
      item.setScale(deco.scale);
      item.setDepth(deco.y);
      item.refreshBody();
      if (deco.body) {
        const w = item.displayWidth * deco.body.w;
        const h = item.displayHeight * deco.body.h;
        item.body.setSize(w, h);
        item.body.setOffset((item.displayWidth - w) / 2, item.displayHeight * deco.body.offY);
      }
      // treat fixed ones as buildings for random logic to avoid overlap
      buildingBlocks.push({ x: deco.x, half: 40 });
    });

    decorations.forEach(deco => {
      for (let i = 0; i < deco.count; i++) {
        let attempts = 0;
        let placed = false;
        while (attempts < 50 && !placed) {
          const x = Phaser.Math.Between(50, MAP_WIDTH - 50);
          const range = grassYRanges[Phaser.Math.Between(0, 1)];
          const y = Phaser.Math.Between(range.min, range.max);

          const hitsBuilding = buildingBlocks.some(b => Math.abs(x - b.x) < (b.half + safeDist));
          const tooCloseToOther = placedDecorations.some((p) => {
            const minDist = Math.max(deco.minGap, p.minGap);
            return Phaser.Math.Distance.Between(x, y, p.x, p.y) < minDist;
          });

          if (!hitsBuilding && !tooCloseToOther) {
            const item = obstacles.create(x, y, deco.key);
            item.setScale(deco.scale);
            item.setDepth(y);
            item.refreshBody();

            // Physics Body Customization (Collision)
            if (deco.body) {
              const w = item.displayWidth * deco.body.w;
              const h = item.displayHeight * deco.body.h;
              item.body.setSize(w, h);
              item.body.setOffset(
                (item.displayWidth - w) / 2,
                item.displayHeight * deco.body.offY
              );
            }
            placedDecorations.push({ x, y, minGap: deco.minGap });
            placed = true;
          }
          attempts++;
        }
      }
    });

    // Blockade at the far right
    const blockYPos = Math.round((roadTopY + roadBottomY) / 2);
    const blockade = obstacles.create(MAP_WIDTH - 60, blockYPos, "block");
    blockade.setScale(2);
    blockade.setDepth(blockade.y);
    blockade.refreshBody();
    blockade.body.setSize(20, roadBottomY - roadTopY);
    blockade.body.setOffset(blockade.width / 2 - 10, blockade.height / 2 - (roadBottomY - roadTopY) / 2);

    // Bicycles (mixed colors) near road edges
    const bikeScaleLarge = 2.4;
    const bikeScaleSmall = 2.0;
    const upperStripY = roadTopY + 12;
    const lowerStripY = roadBottomY - 12;
    const scatteredPositions = [
      // Sarang Hall Cluster (Right) - b1, b3, b5
      { x: 380, y: upperStripY, key: "b1" },
      { x: 420, y: upperStripY, key: "b3" },
      { x: 460, y: upperStripY, key: "b5" },

      // Kaimaru Cluster (Left) - b1, b5, b3
      { x: 900, y: upperStripY, key: "b1" },
      { x: 940, y: upperStripY, key: "b5" },
      { x: 980, y: upperStripY, key: "b3" },


      // Scattered Singles (b2, b4, b6)
      { x: 700, y: upperStripY, key: "b2" },
      { x: 1600, y: upperStripY, key: "b4" },
      { x: 2300, y: lowerStripY, key: "b6" },
      { x: 100, y: lowerStripY, key: "b2" },
    ];

    scatteredPositions.forEach((pos) => {
      const bikeKey = pos.key;
      const bike = obstacles.create(pos.x, pos.y, bikeKey);
      const scale = (bikeKey === "b2" || bikeKey === "b4" || bikeKey === "b6") ? bikeScaleSmall : bikeScaleLarge;
      bike.setScale(scale);
      bike.setDepth(bike.y);
      bike.refreshBody();
      bike.body.setSize(bike.displayWidth * 0.85, bike.displayHeight * 0.4);
      bike.body.setOffset(bike.displayWidth * 0.075, bike.displayHeight * 0.6);
    });




    // No bikes directly in front of building doors (avoid clutter)

    const sarang = buildingDefs[0];
    this.entranceX = sarang.x - 32;
    this.entranceY = Math.round((sarang.bottomY ?? buildingBottomTarget) + 24);
    const kaimaru = buildingDefs.find((def) => def.key === "road_kaimaru");
    this.kaimaruEntranceX = kaimaru?.x ?? null;
    this.kaimaruEntranceY = kaimaru ? Math.round((kaimaru.bottomY ?? buildingBottomTarget) - 8) : null;

    // Stairs (two connected tiles) under bottom grass
    const stairScale = 2;
    const stairTex = this.textures.get("stair_down").getSourceImage();
    const stairW = stairTex.width * stairScale;
    const stairsY = Math.round(mapHeight - tileSize / 2 + 2);
    const placeStairPair = (centerX) => {
      const left = this.add.image(centerX - stairW / 2, stairsY, "stair_down");
      left.setScale(stairScale);
      left.setDepth(Math.round(left.y));
      const right = this.add.image(centerX + stairW / 2, stairsY, "stair_down");
      right.setScale(stairScale);
      right.setDepth(Math.round(right.y));
      this.stairCenterX = centerX;
      this.stairCenterY = stairsY;
    };
    placeStairPair(sarang.x);

    this.createPlayerAnimations();
    const firstFrame = "16x16 All Animations 0.aseprite";
    const postFlag = buildingDefs.find((def) => def.key === "post_office_flag");
    const spawnX = this.spawnX ?? Math.round(postFlag?.x ?? MAP_WIDTH / 2);
    const spawnY = this.spawnY ?? Math.round(tileSize * (topGrassRows + 2));
    this.player = this.physics.add.sprite(spawnX, spawnY, "main_character", firstFrame);
    this.player.setScale(pixelScale).setCollideWorldBounds(true);
    this.player.body.setSize(10, 8).setOffset(5, 12);
    this.player.setDepth(10000);

    this.handItem = this.add.image(0, 0, "letter_icon").setScale(1).setDepth(200).setVisible(false);

    this.physics.add.collider(this.player, obstacles);

    // Create Cat Animations - using 2 frames (alternating feet) for each direction
    if (!this.anims.exists("cat-walk-down")) {
      this.anims.create({ key: "cat-walk-down", frames: this.anims.generateFrameNumbers("cat", { frames: [0, 2] }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: "cat-walk-left", frames: this.anims.generateFrameNumbers("cat", { frames: [3, 5] }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: "cat-walk-right", frames: this.anims.generateFrameNumbers("cat", { frames: [6, 8] }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: "cat-walk-up", frames: this.anims.generateFrameNumbers("cat", { frames: [9, 11] }), frameRate: 6, repeat: -1 });
    }

    // Create Goose Animations
    // Row 1: Front/Down (0-2)
    // Row 2: Right (3-5)
    // Row 3: Back/Up (6-8)
    // Row 4: Left (9-11)
    if (!this.anims.exists("goose-walk-down")) {
      this.anims.create({ key: "goose-walk-down", frames: this.anims.generateFrameNumbers("goose", { frames: [0, 2] }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: "goose-walk-right", frames: this.anims.generateFrameNumbers("goose", { frames: [3, 5] }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: "goose-walk-up", frames: this.anims.generateFrameNumbers("goose", { frames: [6, 8] }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: "goose-walk-left", frames: this.anims.generateFrameNumbers("goose", { frames: [9, 11] }), frameRate: 6, repeat: -1 });
    }

    // Cat
    this.cat = this.physics.add.sprite(
      Phaser.Math.Between(100, MAP_WIDTH - 100),
      Phaser.Math.Between(200, MAP_HEIGHT - 50),
      "cat"
    );
    this.cat.setScale(pixelScale * 0.8);
    this.cat.setCollideWorldBounds(true);
    this.cat.body.setSize(this.cat.width * 0.8, this.cat.height * 0.6);
    this.cat.body.setOffset(this.cat.width * 0.1, this.cat.height * 0.4);
    this.physics.add.collider(this.cat, obstacles);
    this.cat.setDepth(10000);
    this.catNextDecisionTime = 0;
    this.catMoveDir = "idle";
    this.catMoveSpeed = 50;

    // Goose
    this.goose = this.physics.add.sprite(
      Phaser.Math.Between(100, MAP_WIDTH - 100),
      Phaser.Math.Between(200, MAP_HEIGHT - 50),
      "goose"
    );
    this.goose.setScale(pixelScale * 0.8);
    this.goose.setCollideWorldBounds(true);
    this.goose.body.setSize(this.goose.width * 0.8, this.goose.height * 0.6);
    this.goose.body.setOffset(this.goose.width * 0.1, this.goose.height * 0.4);
    this.physics.add.collider(this.goose, obstacles);
    this.goose.setDepth(10000);
    this.gooseNextDecisionTime = 0;
    this.gooseMoveDir = "idle";
    this.gooseMoveSpeed = 40;

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, mapHeight);
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

    makeAnim("idle-down", 1, 3, 6, -1);
    makeAnim("idle-left", 4, 7, 6, -1);
    makeAnim("idle-right", 8, 11, 6, -1);
    makeAnim("idle-up", 24, 27, 6, -1);

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
    if (!this.player || !this.player.body) return;

    const pointer = this.input.activePointer;
    const pointerRightDown = pointer.rightButtonDown();
    const rightJustDown = pointerRightDown && !this.prevRight;
    this.prevRight = pointerRightDown;

    const distanceToEntrance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.entranceX,
      this.entranceY
    );
    const distanceToKaimaru = this.kaimaruEntranceX
      ? Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.kaimaruEntranceX,
        this.kaimaruEntranceY
      )
      : Infinity;
    const distanceToBus = this.busEntranceX
      ? Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.busEntranceX,
        this.busEntranceY
      )
      : Infinity;

    const canTrigger = !this.lastTriggerTime || (this.time.now - this.lastTriggerTime > 1000);
    const isMovingUp = this.moveKeys.up.isDown;

    if (canTrigger && distanceToBus < 50 && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey) || isMovingUp)) {
      this.lastTriggerTime = this.time.now;
      window.dispatchEvent(new CustomEvent("bus-enter"));
      this.player.body.setVelocity(0);
      return;
    }

    if (canTrigger && ((distanceToKaimaru < 50 && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey) || isMovingUp)) || distanceToKaimaru < 30)) {
      this.lastTriggerTime = this.time.now;
      window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "EnterKaimaru" } }));
      this.player.body.setVelocity(0);
      return;
    }

    if (canTrigger && ((distanceToEntrance < 50 && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey) || isMovingUp)) || distanceToEntrance < 35)) {
      this.lastTriggerTime = this.time.now;
      window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "EnterHallway" } }));
      this.player.body.setVelocity(0);
      return;
    }

    if (this.stairCenterX && this.stairCenterY) {
      const distanceToStairs = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.stairCenterX,
        this.stairCenterY
      );
      const isMovingDown = this.moveKeys.down.isDown || this.moveKeys.s.isDown;
      if (canTrigger && distanceToStairs < 50 && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey) || isMovingDown)) {
        this.lastTriggerTime = this.time.now;
        window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "EnterGround", x: this.stairCenterX, y: this.stairCenterY } }));
        this.player.body.setVelocity(0);
        return;
      }
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
    const playIfExists = (target, key) => {
      if (!key || !target?.anims) return;
      const anim = this.anims.get(key);
      if (!anim || !anim.frames || anim.frames.length === 0) return;
      target.anims.play(key, true);
    };

    this.player.body.setVelocity(0);
    const leftDown = this.moveKeys.left.isDown || this.moveKeys.a.isDown;
    const rightDown = this.moveKeys.right.isDown || this.moveKeys.d.isDown;
    const upDown = this.moveKeys.up.isDown || this.moveKeys.w.isDown;
    const downDown = this.moveKeys.down.isDown || this.moveKeys.s.isDown;

    if (leftDown) {
      this.player.body.setVelocityX(-speed);
      playIfExists(this.player, animKey(animPrefix, "left"));
      this.lastDirection = "left";
    } else if (rightDown) {
      this.player.body.setVelocityX(speed);
      playIfExists(this.player, animKey(animPrefix, "right"));
      this.lastDirection = "right";
    } else if (upDown) {
      this.player.body.setVelocityY(-speed);
      playIfExists(this.player, animKey(animPrefix, "up"));
      this.lastDirection = "up";
    } else if (downDown) {
      this.player.body.setVelocityY(speed);
      playIfExists(this.player, animKey(animPrefix, "down"));
      this.lastDirection = "down";
    } else {
      playIfExists(this.player, animKey("idle", this.lastDirection));
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

    // Cat AI Update
    if (this.cat && this.time.now > this.catNextDecisionTime) {
      const action = Math.random();
      if (action < 0.4) {
        this.cat.setVelocity(0);
        this.catMoveDir = "idle";
      } else {
        const speed = this.catMoveSpeed ?? 50;
        const dir = Math.random();
        if (dir < 0.25) {
          this.cat.setVelocity(speed, 0);
          this.catMoveDir = "right";
        } else if (dir < 0.5) {
          this.cat.setVelocity(-speed, 0);
          this.catMoveDir = "left";
        } else if (dir < 0.75) {
          this.cat.setVelocity(0, speed);
          this.catMoveDir = "down";
        } else {
          this.cat.setVelocity(0, -speed);
          this.catMoveDir = "up";
        }
      }
      this.catNextDecisionTime = this.time.now + Phaser.Math.Between(2000, 5000);
    }

    if (this.cat) {
      const speed = this.catMoveSpeed ?? 50;
      if (this.catMoveDir === "left") {
        this.cat.setVelocity(-speed, 0);
        this.cat.body.velocity.y = 0;
        playIfExists(this.cat, "cat-walk-left");
      } else if (this.catMoveDir === "right") {
        this.cat.setVelocity(speed, 0);
        this.cat.body.velocity.y = 0;
        playIfExists(this.cat, "cat-walk-right");
      } else if (this.catMoveDir === "up") {
        this.cat.setVelocity(0, -speed);
        this.cat.body.velocity.x = 0;
        playIfExists(this.cat, "cat-walk-up");
      } else if (this.catMoveDir === "down") {
        this.cat.setVelocity(0, speed);
        this.cat.body.velocity.x = 0;
        playIfExists(this.cat, "cat-walk-down");
      } else {
        this.cat.setVelocity(0);
        this.cat.anims.stop();
      }
      this.cat.setDepth(this.cat.y);
    }

    // Goose AI Update
    if (this.goose && this.time.now > this.gooseNextDecisionTime) {
      const action = Math.random();
      if (action < 0.4) {
        this.goose.setVelocity(0);
        this.gooseMoveDir = "idle";
      } else {
        const speed = this.gooseMoveSpeed ?? 40;
        const dir = Math.random();
        if (dir < 0.25) {
          this.goose.setVelocity(speed, 0);
          this.gooseMoveDir = "right";
        } else if (dir < 0.5) {
          this.goose.setVelocity(-speed, 0);
          this.gooseMoveDir = "left";
        } else if (dir < 0.75) {
          this.goose.setVelocity(0, speed);
          this.gooseMoveDir = "down";
        } else {
          this.goose.setVelocity(0, -speed);
          this.gooseMoveDir = "up";
        }
      }
      this.gooseNextDecisionTime = this.time.now + Phaser.Math.Between(2000, 5000);
    }

    if (this.goose) {
      const speed = this.gooseMoveSpeed ?? 40;
      if (this.gooseMoveDir === "left") {
        this.goose.setVelocity(-speed, 0);
        this.goose.body.velocity.y = 0;
        playIfExists(this.goose, "goose-walk-left");
        this.goose.setFlipX(false);
      } else if (this.gooseMoveDir === "right") {
        this.goose.setVelocity(speed, 0);
        this.goose.body.velocity.y = 0;
        playIfExists(this.goose, "goose-walk-right");
        this.goose.setFlipX(false);
      } else if (this.gooseMoveDir === "up") {
        this.goose.setVelocity(0, -speed);
        this.goose.body.velocity.x = 0;
        playIfExists(this.goose, "goose-walk-up");
      } else if (this.gooseMoveDir === "down") {
        this.goose.setVelocity(0, speed);
        this.goose.body.velocity.x = 0;
        playIfExists(this.goose, "goose-walk-down");
      } else {
        this.goose.setVelocity(0);
        this.goose.anims.stop();
      }
      this.goose.setDepth(this.goose.y);
    }
  }
}

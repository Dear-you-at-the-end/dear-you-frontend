import Phaser from "phaser";

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 720;

export default class KaimaruScene extends Phaser.Scene {
  constructor() {
    super({ key: "Kaimaru" });
  }

  init(data) {
    this.spawnX = data?.x ?? MAP_WIDTH / 2;
    this.spawnY = data?.y ?? MAP_HEIGHT - 200;
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
    this.load.image("plz_icon", `${commonPath}plz.png`);
    this.load.image("dialog_bubble", `${commonPath}dialogbig.png`);

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

    this.kaimaruQuestDone = false;
    const handleKaimaruQuestDone = () => {
      this.kaimaruQuestDone = true;
      if (this.kaimaruBubbleTimers) {
        this.kaimaruBubbleTimers.forEach((t) => t?.remove(false));
      }
      if (this.kaimaruBubbles) {
        Object.values(this.kaimaruBubbles).forEach((bubble) => bubble?.destroy());
      }
    };
    window.addEventListener("kaimaru-quest-complete", handleKaimaruQuestDone);
    this.events.once("shutdown", () => {
      window.removeEventListener("kaimaru-quest-complete", handleKaimaruQuestDone);
    });
    this.kaimaruBubbles = {};
    this.kaimaruBubbleTimers = [];

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
    const wallBottomY = wallY + wallHeight / 2;

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
    // Bottom - split to allow door access
    const doorGap = 120; // Gap width for door access
    const bottomLeftWall = walls.create(centerX - doorGap / 2 - (roomW - doorGap) / 4, startY + roomH, null);
    bottomLeftWall.setSize((roomW - doorGap) / 2, 20).setVisible(false).refreshBody();
    const bottomRightWall = walls.create(centerX + doorGap / 2 + (roomW - doorGap) / 4, startY + roomH, null);
    bottomRightWall.setSize((roomW - doorGap) / 2, 20).setVisible(false).refreshBody();

    const obstacles = this.physics.add.staticGroup();

    // Door (Top-Left on wall)
    const doorTex = this.textures.get("kaimaru_door").getSourceImage();
    const doorScale = pixelScale * 1.4;
    const doorH = doorTex.height * doorScale;
    const doorX = centerX;
    const doorY = wallBottomY + doorH / 2 - 30;
    const door = this.add.image(doorX, doorY, "kaimaru_door");
    door.setScale(doorScale);
    door.setDepth(Math.round(doorY) + 2);
    this.exitDoor = door;

    // Tables - keep distance from walls
    const paddingX = 140;
    const rowSpacing = 160;
    const rowStart = wallBottomY + 80;
    const gridWidth = roomW - paddingX * 2;
    const colOffsets = [-gridWidth / 2, 0, gridWidth / 2];
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
      if (isMainTable) {
        this.mainTablePos = { x: pos.x, y: pos.y };
      }

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
      table.body.setSize(table.displayWidth * 0.85, table.displayHeight * 0.4);
      table.body.setOffset(table.displayWidth * 0.075, table.displayHeight * 0.6);
      table.setDepth(Math.round(table.y));

      if (isMainTable) {
        // NPCs around main table (match reference: top/bottom on each side)
        const sideX = 56;
        const topY = -18;
        const bottomY = 18;
        const npcBsy = this.add.image(pos.x - sideX, pos.y + topY, "npc_bsy").setScale(pixelScale).setDepth(pos.y + topY);
        const npcKys = this.add.image(pos.x - sideX, pos.y + bottomY, "npc_kys").setScale(pixelScale).setDepth(pos.y + bottomY);
        const npcJjw = this.add.image(pos.x + sideX, pos.y + topY, "npc_jjw").setScale(pixelScale).setDepth(pos.y + topY);
        const npcThj = this.add.image(pos.x + sideX, pos.y + bottomY, "npc_thj").setScale(pixelScale).setDepth(pos.y + bottomY);
        this.kaimaruNpcs = { bsy: npcBsy, kys: npcKys, jjw: npcJjw, thj: npcThj };

        // Add gentle bobbing animation to NPCs to show they're alive
        [npcBsy, npcKys, npcJjw, npcThj].forEach((npc, index) => {
          this.tweens.add({
            targets: npc,
            y: npc.y - 2,
            duration: 600 + index * 150,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
            delay: index * 200,
          });
        });

        const plz = this.add.image(pos.x, pos.y - table.displayHeight * 0.72, "plz_icon");
        plz.setScale(pixelScale * 0.45);
        plz.setDepth(Math.round(pos.y) + 10);
        this.tweens.add({
          targets: plz,
          y: plz.y - 6,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    });

    const firstFrame = "16x16 All Animations 0.aseprite";
    const defaultSpawnX = centerX + gridWidth * 0.25;
    const defaultSpawnY = rowStart + rowSpacing * 1.6;
    this.spawnX = this.spawnX ?? defaultSpawnX;
    this.spawnY = this.spawnY ?? defaultSpawnY;
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

    this.startNpcChatter(pixelScale);
  }

  startNpcChatter(pixelScale) {
    if (!this.kaimaruNpcs) return;
    const style = {
      fontFamily: "Galmuri11-Bold",
      fontSize: "11px",
      color: "#6a4b37",
      align: "center",
      padding: { x: 2, y: 2 },
    };

    const showBubble = (key, text, duration) => {
      if (this.kaimaruQuestDone) return;
      const npc = this.kaimaruNpcs[key];
      if (!npc) return;
      if (this.kaimaruBubbles[key]) {
        this.kaimaruBubbles[key].destroy();
        this.kaimaruBubbles[key] = null;
      }
      const bubble = this.add.image(0, 0, "dialog_bubble");
      bubble.setScale(pixelScale * 0.45);
      bubble.setOrigin(0.5);
      const label = this.add.text(4, -2, text, style);
      label.setOrigin(0.5);
      const container = this.add.container(npc.x, npc.y - 26, [bubble, label]);
      container.setDepth(10000);
      container.setAlpha(0);
      container.setScale(0.8);
      this.kaimaruBubbles[key] = container;

      // Pop-in animation for speech bubble
      this.tweens.add({
        targets: container,
        alpha: 1,
        scale: 1,
        duration: 200,
        ease: "Back.easeOut",
      });

      // Add a little bounce to the NPC when they speak
      this.tweens.add({
        targets: npc,
        scaleX: pixelScale * 1.05,
        scaleY: pixelScale * 1.05,
        duration: 150,
        yoyo: true,
        ease: "Sine.easeInOut",
      });

      // Occasionally add sparkle effect
      if (Math.random() < 0.3) {
        const sparkle = this.add.circle(npc.x + (Math.random() - 0.5) * 20, npc.y - 10, 2, 0xFFFFFF, 0.8);
        sparkle.setDepth(10001);
        this.tweens.add({
          targets: sparkle,
          y: sparkle.y - 15,
          alpha: 0,
          duration: 600,
          ease: "Quad.easeOut",
          onComplete: () => sparkle.destroy(),
        });
      }

      this.time.delayedCall(duration, () => {
        if (this.kaimaruBubbles[key] === container) {
          // Fade out animation
          this.tweens.add({
            targets: container,
            alpha: 0,
            scale: 0.8,
            duration: 200,
            ease: "Back.easeIn",
            onComplete: () => {
              container.destroy();
              this.kaimaruBubbles[key] = null;
            },
          });
        } else {
          container.destroy();
        }
      });
    };

    // Define NPC messages
    const npcMessages = {
      bsy: "한진아 %$#^@#",
      kys: "아 짱웃겨~",
      jjw: "-$#$ 서연언니..",
      thj: "예서누나##@$#@",
    };

    // Make NPCs clickable
    Object.keys(this.kaimaruNpcs).forEach((key) => {
      const npc = this.kaimaruNpcs[key];
      if (npc && npcMessages[key]) {
        npc.setInteractive({ useHandCursor: true });
        npc.on("pointerdown", () => {
          showBubble(key, npcMessages[key], 2000);
        });
      }
    });
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

    if (this.registry.get("uiBlocked")) {
      this.player.body.setVelocity(0);
      return;
    }

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

    // Main table interaction: trigger Kaimaru story dialog once.
    if (!this.kaimaruStoryDone && this.mainTablePos) {
      const distToMain = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.mainTablePos.x, this.mainTablePos.y);
      if (distToMain < 90 && canTrigger && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey))) {
        this.lastTriggerTime = this.time.now;
        this.kaimaruStoryDone = true;
        window.dispatchEvent(new CustomEvent("open-kaimaru-story"));
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

import Phaser from "phaser";

const MAP_WIDTH = 2000;
const ROWS = 40;
const TRACK_WIDTH = 700;

export default class GroundScene extends Phaser.Scene {
  constructor() {
    super({ key: "Ground" });
  }

  init(data) {
    this.spawnX = data?.x ?? null;
    this.spawnY = data?.y ?? null;
  }

  preload() {
    const groundPath = "/assets/ground/";
    const roadPath = "/assets/road/";
    const commonPath = "/assets/common/";

    this.load.image("ground_tile", `${groundPath}ground.png`);
    this.load.image("ground_track", `${groundPath}track_tile.png`);
    this.load.image("ground_down", `${groundPath}ground_down.png`);
    this.load.image("ground_grass", `${groundPath}grass.png`);
    this.load.image("ground_top", `${groundPath}ground_top.png`);
    this.load.image("ground_ball", `${groundPath}ball.png`);
    this.load.image("plz_icon", `${commonPath}plz.png`);
    this.load.image("quest_icon", `${commonPath}quest_icon.png`);
    this.load.image("stair_down", `${roadPath}stair_down.png`);
    this.load.image("letter_icon", `${commonPath}letter.png`);
    this.load.image("letter_written", `${commonPath}letter_wirte.png`);
    this.load.spritesheet("npc_psj", `${commonPath}character/psj.png`, { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet("npc_mdh", `${commonPath}character/mdh.png`, { frameWidth: 20, frameHeight: 20 });

    const characterPath = `${commonPath}character/`;
    this.load.atlas(
      "main_character",
      `${characterPath}main_character.png`,
      `${characterPath}main_character.json`
    );
    // Load ITB character spritesheet (20x20 frames based on file dimensions)
    this.load.spritesheet("itb", `${characterPath}itb.png`, { frameWidth: 20, frameHeight: 20 });
  }

  create() {
    const pixelScale = 2;
    const baseTile = this.textures.get("ground_tile").getSourceImage();
    const tileHeight = baseTile.height * pixelScale;
    const mapHeight = ROWS * tileHeight;

    this.cameras.main.setBackgroundColor("#222222");

    // Limit visuals and physics to the central track width
    const startX = (MAP_WIDTH - TRACK_WIDTH) / 2;
    this.physics.world.setBounds(startX, 0, TRACK_WIDTH, mapHeight);

    const rowKey = (row) => {
      if (row === 0) return "ground_tile";
      if (row >= 1 && row <= 4) return "ground_track"; // 4 rows of track (Thicker)
      if (row === 5) return "ground_down";
      if (row >= 6 && row <= ROWS - 7) return "ground_grass"; // Much more grass
      if (row === ROWS - 6) return "ground_top";
      if (row >= ROWS - 5 && row <= ROWS - 2) return "ground_track"; // 4 rows of track (Thicker)
      return "ground_tile";
    };

    for (let row = 0; row < ROWS; row += 1) {
      const key = rowKey(row);
      const y = row * tileHeight + tileHeight / 2;
      this.add
        .tileSprite(MAP_WIDTH / 2, y, MAP_WIDTH, tileHeight, key)
        .setTileScale(pixelScale)
        .setDepth(0);
    }

    // NPCs (psj, mdh) on left grass, facing each other
    const npcScale = pixelScale * 1.1;
    const grassTopY = tileHeight * 7 + 28;
    const pairCenterX = MAP_WIDTH / 2 - 260;
    const psj = this.add.sprite(pairCenterX - 26, grassTopY, "npc_psj", 0).setScale(npcScale);
    const mdh = this.add.sprite(pairCenterX + 26, grassTopY, "npc_mdh", 0).setScale(npcScale);
    psj.setFlipX(false);
    mdh.setFlipX(true);
    psj.setDepth(Math.round(psj.y));
    mdh.setDepth(Math.round(mdh.y));

    const plzBetween = this.add.image((psj.x + mdh.x) / 2 + 14, grassTopY - 24, "plz_icon");
    plzBetween.setScale(pixelScale * 0.45);
    plzBetween.setDepth(Math.round(grassTopY) + 5);
    this.catchBallPlzIcon = plzBetween;
    this.tweens.add({
      targets: plzBetween,
      y: plzBetween.y - 6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Quest icons (speech bubble style) shown after catchball success until letter delivered
    const questIconScale = pixelScale * 0.55;
    this.mdhQuestIcon = this.add.image(mdh.x, mdh.y - 38, "quest_icon");
    this.mdhQuestIcon.setScale(questIconScale);
    this.mdhQuestIcon.setDepth(99999);
    this.mdhQuestIcon.setVisible(false);
    this.tweens.add({
      targets: this.mdhQuestIcon,
      y: this.mdhQuestIcon.y - 4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.psjQuestIcon = this.add.image(psj.x, psj.y - 38, "quest_icon");
    this.psjQuestIcon.setScale(questIconScale);
    this.psjQuestIcon.setDepth(99999);
    this.psjQuestIcon.setVisible(false);
    this.tweens.add({
      targets: this.psjQuestIcon,
      y: this.psjQuestIcon.y - 4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    if (!this.anims.exists("psj-idle")) {
      const frameCount = this.textures.get("npc_psj").getSourceImage().width / 20;
      this.anims.create({
        key: "psj-idle",
        frames: this.anims.generateFrameNumbers("npc_psj", { start: 1, end: Math.max(1, frameCount - 1) }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (!this.anims.exists("mdh-idle")) {
      const frameCount = this.textures.get("npc_mdh").getSourceImage().width / 20;
      this.anims.create({
        key: "mdh-idle",
        frames: this.anims.generateFrameNumbers("npc_mdh", { start: 1, end: Math.max(1, frameCount - 1) }),
        frameRate: 6,
        repeat: -1,
      });
    }
    psj.play("psj-idle");
    mdh.play("mdh-idle");

    const ball = this.add.image(psj.x + 10, grassTopY - 10, "ground_ball");
    ball.setScale(pixelScale * 0.6);
    ball.setDepth(Math.round(grassTopY) + 2);
    this.tweens.chain({
      targets: ball,
      loop: -1,
      tweens: [
        {
          x: mdh.x - 10,
          y: grassTopY - 18,
          duration: 700,
          ease: "Sine.inOut",
        },
        {
          x: psj.x + 10,
          y: grassTopY - 8,
          duration: 700,
          ease: "Sine.inOut",
        },
      ],
    });

    // Store NPC positions for interaction
    this.catchBallNpcs = { x: (psj.x + mdh.x) / 2, y: grassTopY };
    this.psjNpc = psj;
    this.mdhNpc = mdh;

    // Name tags (show when player is close)
    this.psjName = this.add.text(psj.x, psj.y - 40, "박성재", {
      fontFamily: "Galmuri11-Bold",
      fontSize: "12px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(99999).setVisible(false);
    this.mdhName = this.add.text(mdh.x, mdh.y - 40, "민동휘", {
      fontFamily: "Galmuri11-Bold",
      fontSize: "12px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(99999).setVisible(false);

    // Entrance stairs (connect from Road)
    const stairScale = 2;
    const stairTex = this.textures.get("stair_down").getSourceImage();
    const stairW = stairTex.width * stairScale;
    const stairX = MAP_WIDTH / 2; // Center the stairs
    const stairY = tileHeight / 2;
    const left = this.add.image(stairX - stairW / 2, stairY, "stair_down");
    const right = this.add.image(stairX + stairW / 2, stairY, "stair_down");
    left.setScale(stairScale);
    right.setScale(stairScale);
    left.setDepth(Math.round(stairY));
    right.setDepth(Math.round(stairY));
    this.stairX = stairX;
    this.stairY = stairY + 10;

    this.createPlayerAnimations();
    const firstFrame = "16x16 All Animations 0.aseprite";
    const spawnX = this.spawnX ?? stairX;
    const spawnY = this.spawnY ?? tileHeight * 10; // Adjusted for thicker track
    this.player = this.physics.add.sprite(spawnX, spawnY, "main_character", firstFrame);
    this.player.setScale(pixelScale).setCollideWorldBounds(true);
    this.player.body.setSize(10, 8).setOffset(5, 12);
    this.player.setDepth(10000);

    this.handItem = this.add.image(0, 0, "letter_icon").setScale(1).setDepth(200).setVisible(false);

    // Create ITB Character on the bottom track
    const itbRow = ROWS - 3; // On the bottom track
    const itbY = itbRow * tileHeight - 26;
    const itbLeftX = 80;
    const itbRightX = MAP_WIDTH - 80;
    const itbStartX = itbLeftX;
    this.itb = this.physics.add.sprite(itbStartX, itbY, "itb");
    this.itb.setScale(pixelScale);
    this.itb.setDepth(itbY);

    // ITB Name Tag
    this.itbName = this.add.text(this.itb.x, this.itb.y - 40, "임태빈", {
      fontFamily: "Galmuri11-Bold", fontSize: "12px", color: "#ffffff", stroke: "#000000", strokeThickness: 3
    }).setOrigin(0.5).setDepth(99999).setVisible(false);

    if (!this.anims.exists("itb-run")) {
      const frameCount = this.textures.get("itb").getSourceImage().width / 20;
      this.anims.create({
        key: "itb-run",
        // Use frames 6~11 (1-based) => 5~10 (0-based), clamped by sheet width.
        frames: this.anims.generateFrameNumbers("itb", { start: 5, end: Math.min(10, Math.max(5, frameCount - 1)) }),
        frameRate: 10,
        repeat: -1,
      });
    }
    this.itb.play("itb-run");

    const itbPlz = this.add.image(this.itb.x + 14, this.itb.y - 24, "plz_icon");
    itbPlz.setScale(pixelScale * 0.45);
    itbPlz.setDepth(this.itb.depth + 1);

    // Plz icon bounce animation
    this.tweens.add({
      targets: itbPlz,
      y: itbPlz.y - 6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // ITB running back and forth animation
    const runDistance = itbRightX - itbLeftX; // Run across the full track
    this.itbDirection = 1; // 1 for right, -1 for left

    this.itbMoveTween = this.tweens.add({
      targets: this.itb,
      x: itbStartX + runDistance,
      duration: 2000,
      ease: "Linear",
      yoyo: true,
      repeat: -1,
      onYoyo: () => {
        this.itb.setFlipX(true); // Face left when running back
        this.itbDirection = -1;
      },
      onRepeat: () => {
        this.itb.setFlipX(false); // Face right when running forward
        this.itbDirection = 1;
      },
    });

    // Store ITB initial position for plz icon following
    this.itbPlzIcon = itbPlz;

    // Quest icon shown after running game success until letter delivered.
    const itbQuestIconScale = pixelScale * 0.55;
    this.itbQuestIcon = this.add.image(this.itb.x, this.itb.y - 38, "quest_icon");
    this.itbQuestIcon.setScale(itbQuestIconScale);
    this.itbQuestIcon.setDepth(99999);
    this.itbQuestIcon.setVisible(false);
    this.tweens.add({
      targets: this.itbQuestIcon,
      y: this.itbQuestIcon.y - 4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Bottom stairs removed (no development room entry from ground)

    // Camera setup: Follow player within track bounds
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1.8);
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

    if (this.registry.get("uiBlocked")) {
      this.player.body.setVelocity(0);
      return;
    }

    // After running mini-game win, stop ITB next to player.
    if (this.itb && (this.registry.get("groundItbRunningCompleted") ?? false) && !this.itbStoppedNearPlayer) {
      this.itbStoppedNearPlayer = true;
      if (this.itbMoveTween) {
        this.itbMoveTween.stop();
        this.itbMoveTween.remove();
        this.itbMoveTween = null;
      }
      // Ensure no other tweens keep moving ITB.
      this.tweens.killTweensOf(this.itb);

      const bounds = this.physics.world.bounds;
      const targetX = Phaser.Math.Clamp(this.player.x + 26, bounds.x + 10, bounds.right - 10);
      const targetY = Phaser.Math.Clamp(this.player.y + 8, bounds.y + 10, bounds.bottom - 10);
      this.itb.setPosition(targetX, targetY);
      this.itb.setFlipX(false);
      if (this.itb.body) this.itb.body.setVelocity(0);
      // Use a static frame when stopped.
      this.itb.anims.stop();
      this.itb.setFrame(0);
    }

    const pointer = this.input.activePointer;
    const pointerRightDown = pointer.rightButtonDown();
    const rightJustDown = pointerRightDown && !this.prevRight;
    this.prevRight = pointerRightDown;

    const distanceToStair = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.stairX,
      this.stairY
    );
    const canTrigger = !this.lastTriggerTime || this.time.now - this.lastTriggerTime > 1000;
    const isMovingUp = this.moveKeys.up.isDown || this.moveKeys.w.isDown;

    if (distanceToStair < 50 && canTrigger && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey) || isMovingUp)) {
      this.lastTriggerTime = this.time.now;
      window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "LeaveGround" } }));
      this.player.body.setVelocity(0);
      return;
    }

    // ITB Interaction & Name Tag
    if (this.itb) {
      const distItb = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.itb.x, this.itb.y);

      // Update ITB name tag position
      if (this.itbName) {
        this.itbName.setPosition(this.itb.x, this.itb.y - 40);
        this.itbName.setVisible(distItb < 60);
      }

      const itbDone = this.registry.get("groundItbRunningCompleted") ?? false;
      const itbDelivered = this.registry.get("itbHasLetter") ?? false;

      // Update plz icon position + visibility
      if (this.itbPlzIcon) {
        this.itbPlzIcon.x = this.itb.x + 14;
        this.itbPlzIcon.setVisible(!itbDone);
      }

      // Quest icon visibility (after win, before delivery)
      if (this.itbQuestIcon) {
        this.itbQuestIcon.setPosition(this.itb.x, this.itb.y - 38);
        this.itbQuestIcon.setVisible(itbDone && !itbDelivered);
      }

      if (distItb < 60 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        window.dispatchEvent(new CustomEvent("interact-npc", { detail: { npcId: "npc-itb" } }));
      }
    }

    // MDH & PSJ Catch Ball Interaction
    if (this.catchBallNpcs) {
      if (this.psjNpc && this.psjName) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.psjNpc.x, this.psjNpc.y);
        this.psjName.setPosition(this.psjNpc.x, this.psjNpc.y - 40);
        this.psjName.setVisible(dist < 60);
      }
      if (this.mdhNpc && this.mdhName) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.mdhNpc.x, this.mdhNpc.y);
        this.mdhName.setPosition(this.mdhNpc.x, this.mdhNpc.y - 40);
        this.mdhName.setVisible(dist < 60);
      }

      const distCatchBall = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.catchBallNpcs.x,
        this.catchBallNpcs.y
      );

      const done = this.registry.get("groundCatchBallCompleted") ?? false;
      const mdhDelivered = this.registry.get("mdhHasLetter") ?? false;
      const psjDelivered = this.registry.get("psjHasLetter") ?? false;

      // Before success: show plz. After success: hide plz and show quest icons over each NPC until delivered.
      if (this.catchBallPlzIcon) this.catchBallPlzIcon.setVisible(!done);

      if (this.mdhQuestIcon) {
        this.mdhQuestIcon.setPosition(this.mdhNpc.x, this.mdhNpc.y - 38);
        this.mdhQuestIcon.setVisible(done && !mdhDelivered);
      }
      if (this.psjQuestIcon) {
        this.psjQuestIcon.setPosition(this.psjNpc.x, this.psjNpc.y - 38);
        this.psjQuestIcon.setVisible(done && !psjDelivered);
      }

      if (distCatchBall < 60 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        const distPsj = this.psjNpc ? Phaser.Math.Distance.Between(this.player.x, this.player.y, this.psjNpc.x, this.psjNpc.y) : 9999;
        const distMdh = this.mdhNpc ? Phaser.Math.Distance.Between(this.player.x, this.player.y, this.mdhNpc.x, this.mdhNpc.y) : 9999;
        const target = distMdh <= distPsj ? "npc-mdh" : "npc-psj";
        window.dispatchEvent(new CustomEvent("interact-npc", { detail: { npcId: target } }));
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

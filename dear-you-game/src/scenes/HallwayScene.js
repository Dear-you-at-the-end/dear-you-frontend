import Phaser from "phaser";

const MAP_WIDTH = 1500;
const MAP_HEIGHT = 400;
const FLOOR_HEIGHT = 120;

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
    this.load.image("hall_outline", `${dormitoryPath}outline2.png`);
    this.load.image("hall_door", `${dormitoryPath}door.png`);
    this.load.image("ban_icon", `${commonPath}ban.png`);
    this.load.image("notice_icon", `${commonPath}notice.png`);
    this.load.image("dialog_bubble", `${commonPath}dialogbig.png`);
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

    const extraWallY = wallY - wallHeight;
    this.add
      .tileSprite(MAP_WIDTH / 2, extraWallY, MAP_WIDTH, wallHeight, "hall_wall")
      .setTileScale(pixelScale)
      .setDepth(1);

    this.doors = this.physics.add.staticGroup();
    const doorTexture = this.textures.get("hall_door").getSourceImage();
    const doorHeight = doorTexture.height * pixelScale;
    const doorY = floorTop - doorHeight / 2 + 4;

    const doorPositions = [
      { x: 150, room: "101" },
      { x: 450, room: "102" },
      { x: 750, room: "103" },
      { x: 1050, room: "104" },
      { x: 1350, room: "105" },
    ];

    // Create outline segments (skip doors)
    const outlineTexture = this.textures.get("hall_outline").getSourceImage();
    const outlineHeight = outlineTexture.height * pixelScale;
    const doorRealWidth = doorTexture.width * pixelScale;

    let currentX = 0;
    doorPositions.forEach((door) => {
      const doorLeft = door.x - doorRealWidth / 2;
      const width = doorLeft - currentX;

      if (width > 0) {
        this.add
          .tileSprite(currentX + width / 2, floorTop, width, outlineHeight, "hall_outline")
          .setTileScale(pixelScale)
          .setDepth(1);
      }
      currentX = door.x + doorRealWidth / 2;
    });

    if (currentX < MAP_WIDTH) {
      const width = MAP_WIDTH - currentX;
      this.add
        .tileSprite(currentX + width / 2, floorTop, width, outlineHeight, "hall_outline")
        .setTileScale(pixelScale)
        .setDepth(1);
    }

    doorPositions.forEach(({ x, room }) => {
      const door = this.doors.create(x, doorY, "hall_door");
      if (room === "103") this.door103 = door;
      door.setScale(pixelScale);
      door.setDepth(2);
      door.roomNumber = room;
      door.refreshBody();

      if (room === "103" || room === "104") {
        const notice = this.add.image(x, doorY - doorHeight / 2 - 10, "notice_icon");
        notice.setScale(pixelScale * 0.4);
        notice.setDepth(4);
        notice.setVisible(false);
        door.noticeIcon = notice;
        this.tweens.add({
          targets: notice,
          y: notice.y - 4,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      } else {
        const ban = this.add.image(x, doorY - doorHeight / 2 - 10, "ban_icon");
        ban.setScale(pixelScale * 0.4);
        ban.setDepth(4);
        ban.setVisible(false);
        door.banIcon = ban;
        this.tweens.add({
          targets: ban,
          y: ban.y - 4,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      this.add
        .text(Math.round(x), Math.round(doorY - doorHeight / 2 - 8), room, {
          fontSize: "11px",
          fontFamily: "Galmuri11-Bold",
          color: "#4E342E",
        })
        .setOrigin(0.5)
        .setResolution(1)
        .setDepth(3);
    });

    if (this.door103) {
      // Shaking effect (noise vibration) - Intensified
      this.tweens.add({
        targets: this.door103,
        x: this.door103.x + 3,
        duration: 35,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      // Sound wave emission
      this.time.addEvent({
        delay: 600,
        loop: true,
        callback: () => {
          if (!this.scene.isActive()) return;
          const wave = this.add.graphics();
          wave.lineStyle(2, 0xffffff, 0.7);
          wave.strokeCircle(0, 0, 12);
          wave.x = this.door103.x;
          wave.y = this.door103.y;
          wave.setDepth(10);

          this.tweens.add({
            targets: wave,
            scale: 6,
            alpha: 0,
            duration: 1200,
            onComplete: () => wave.destroy(),
          });
        },
      });
    }

    this.createPlayerAnimations();

    const firstFrame = "16x16 All Animations 0.aseprite";
    this.player = this.physics.add.sprite(this.spawnX, this.spawnY, "main_character", firstFrame);
    this.player.setScale(pixelScale).setCollideWorldBounds(true);
    this.player.body.setSize(10, 8).setOffset(5, 12);
    this.player.setDepth(100);
    this.handItem = this.add.image(0, 0, "letter_icon").setScale(1).setDepth(200).setVisible(false);

    this.physics.add.collider(this.player, wall);

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

    this.lastDirection = "down";
    this.player.anims.play("idle-down");

    this.nearDoor = null;
    this.prevRight = false;
    this.speechBubble = null;
    this.speechOffsetY = -28;
    this.speechTween = null;
    this.speechTimer = null;
    this.createVignette();
    this.inExitZone = false;
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

  showSpeechBubble(x, y, text) {
    const bubbleHeight = 22;
    const baseOffsetY = -42; // 위치를 캐릭터 머리 위로 더 올림

    const style = {
      fontFamily: "Galmuri11-Bold",
      fontSize: "9px", // 폰트 크기 축소
      color: "#6a4b37",
      align: "center",
      padding: { x: 2, y: 2 }, // 글자 잘림 방지 패딩
    };

    if (this.speechTween) {
      this.speechTween.stop();
      this.speechTween = null;
    }
    if (this.speechTimer) {
      this.speechTimer.remove(false);
      this.speechTimer = null;
    }
    if (this.speechBubble) {
      this.speechBubble.destroy();
      this.speechBubble = null;
    }

    // 텍스트 너비 측정
    const measure = this.make.text({
      x: 0,
      y: 0,
      text,
      style,
      add: false,
    });
    const measuredWidth = measure.width;
    measure.destroy();

    const bubbleWidth = Phaser.Math.Clamp(Math.ceil(measuredWidth + 16), 30, 160);

    // 말풍선 배경 (9-slice)
    const bubble = this.add.nineslice(
      0,
      0,
      "dialog_bubble",
      0,
      bubbleWidth,
      bubbleHeight,
      3,
      3,
      3,
      3
    );
    bubble.setOrigin(0.5);

    // 텍스트 객체 생성 및 해상도 고정
    const label = this.add.text(0, 0, text, style);
    label.setOrigin(0.5);
    label.y = -2;
    label.setResolution(1); // Retina 디스플레이 흐림 방지 핵심

    // 컨테이너 생성 (좌표 정수화)
    const startY = Math.round(y + baseOffsetY + 5);
    const targetY = Math.round(y + baseOffsetY);
    const fixedX = Math.round(x);

    const container = this.add.container(fixedX, startY, [bubble, label]);

    container.setDepth(10000);
    container.setAlpha(0);
    container.setScale(1); // Scale 애니메이션 제거 (1로 고정)

    this.speechBubble = container;
    this.speechOffsetY = baseOffsetY;

    // 등장 애니메이션: 투명도 + Y축 이동 (픽셀 깨짐 없음)
    this.speechTween = this.tweens.add({
      targets: container,
      alpha: 1,
      y: targetY,
      duration: 150,
      ease: "Quad.out",
      onComplete: () => {
        this.speechTimer = this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: container,
            alpha: 0,
            y: targetY - 5,
            duration: 250,
            ease: "Quad.in",
            onComplete: () => {
              if (this.speechBubble === container) {
                this.speechBubble.destroy();
                this.speechBubble = null;
              }
            },
          });
        });
      },
    });
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
        if (door.banIcon) {
          door.banIcon.setVisible(true);
        }
        if (door.noticeIcon) {
          door.noticeIcon.setVisible(true);
        }
      } else {
        if (door.banIcon) {
          door.banIcon.setVisible(false);
        }
        if (door.noticeIcon) {
          door.noticeIcon.setVisible(false);
        }
      }
    });

    const pointer = this.input.activePointer;
    const pointerRightDown = pointer.rightButtonDown();
    const rightJustDown = pointerRightDown && !this.prevRight;
    this.prevRight = pointerRightDown;

    const canTrigger = !this.lastTriggerTime || (this.time.now - this.lastTriggerTime > 1000);
    const isMovingUp = this.moveKeys.up.isDown;

    if (this.nearDoor && canTrigger && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey) || isMovingUp)) {
      // Stop movement if triggering
      this.player.body.setVelocity(0);
      this.lastTriggerTime = this.time.now;

      if (this.nearDoor.banIcon) {
        this.showSpeechBubble(this.player.x, this.player.y, "들어갈 수 없는 것 같아..");
        return;
      }
      if (["103", "104"].includes(this.nearDoor.roomNumber)) {
        window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: `EnterRoom${this.nearDoor.roomNumber}` } }));
        return;
      }
      console.log(`Enter Room ${this.nearDoor.roomNumber}`);
    }

    // Exit Zone Trigger (Left end of hallway)
    if (this.player.x < 40) {
      if (!this.inExitZone) {
        this.inExitZone = true;
        window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "LeaveHallway" } }));
      }
    } else {
      this.inExitZone = false;
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
    const moveRightDown = this.moveKeys.right.isDown || this.moveKeys.d.isDown;
    const upDown = this.moveKeys.up.isDown || this.moveKeys.w.isDown;
    const downDown = this.moveKeys.down.isDown || this.moveKeys.s.isDown;

    if (leftDown) {
      this.player.body.setVelocityX(-speed);
      this.player.anims.play(animKey(animPrefix, "left"), true);
      this.lastDirection = "left";
    } else if (moveRightDown) {
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

    if (this.speechBubble) {
      this.speechBubble.x = Math.round(this.player.x);
      this.speechBubble.y = Math.round(this.player.y + this.speechOffsetY);
    }
  }
}

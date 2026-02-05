import Phaser from "phaser";

const OPENING_LINES = [
  "\uc5b4\ub77c..? \uc5b4 \ubb50\uc9c0\u2026?",
  "\ub098\ub294 \ub204\uad6c\u2026.?",
];

const STORY_LINES = [
  "\uc5b4\u2026? \ud3b8\uc9c0 \ubc30\ub2ec..?",
  "\ub098\ub294 \uc6b0\ud3b8\ubc30\ub2ec\ubd80\uc778\uac00\ubcf4\ub2e4!",
  "\uc5b4\u2026? \uadfc\ub370 \ud3b8\uc9c0\uac00 \ub2e4 \uc9c0\uc6cc\uc84c\uc796\uc544\u2026!!",
  "\ud070\uc77c\uc774\ub2e4! \ubd84\uba85 \ud63c\ub0a0\uac70\uc57c\u2026!!",
  "\uc5b4\ucc28\ud53c \ud3b8\uc9c0\ub2c8\uae4c \ub0b4\uac00 \ub300\uc2e0 \uc801\uc5b4\ub3c4 \uc548\ub4e4\ud0a4\uaca0\uc9c0\u2026??",
  "\uc544 \ubaa8\ub974\uaca0\ub2e4\u2026",
  "\uc77c\ub2e8 \ud734\ub300\ud3f0\uc5d0 \uc801\ud78c\uac83\ucc98\ub7fc 103\ud638\ub85c \uac00\uc57c\uaca0\ub2e4..!",
];

export default class OpeningScene extends Phaser.Scene {
  constructor() {
    super({ key: "OpeningScene" });
    this.dialogueIndex = 0;
    this.dialogueLines = [];
    this.isTyping = false;
    this.allowDialogueInput = false;
  }

  preload() {
    this.load.image("phoneOn", "/assets/opening/phone.png");
    this.load.image("phoneOff", "/assets/opening/phone_off.png");
    this.load.image("todoIcon", "/assets/opening/todo.png");
    this.load.image("phoneTodo", "/assets/opening/phone_todo.png");
    this.load.image("dialogUI", "/assets/common/dialogbig.png");
    this.load.image("skipBtn", "/assets/common/skip.png");
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");
    this.cameras.main.fadeIn(400, 0, 0, 0);
    window.dispatchEvent(new CustomEvent("opening-start"));

    if (!this.scene.isActive("GameScene")) {
      this.scene.launch("GameScene");
    }
    this.bgScene = this.scene.get("GameScene");
    this.scene.bringToTop();
    this.bgReadyTimer = this.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        if (!this.bgScene || !this.bgScene.player) return;

        // Set zoom first, then center on player
        const player = this.bgScene.player;
        this.bgScene.cameras.main.setZoom(2.0);
        this.bgScene.cameras.main.centerOn(player.x, player.y);
        this.bgScene.cameras.main.roundPixels = true;
        if (!this.scene.isPaused("GameScene")) {
          this.scene.pause("GameScene");
        }
        if (this.bgReadyTimer) {
          this.bgReadyTimer.remove(false);
          this.bgReadyTimer = null;
        }
        this.alignDialogueToPlayer();
      },
    });

    this.skipBtn = this.add.image(width - 40, 32, "skipBtn").setInteractive();
    this.skipBtn.setScrollFactor(0);
    this.skipBtn.setScale(2.2);
    this.skipBtn.on("pointerdown", () => {
      this.finishOpening();
    });

    this.dialogBubble = this.add.image(width / 2, height - 220, "dialogUI");
    this.dialogBubble.setScrollFactor(0).setDepth(2000).setAlpha(1);
    this.dialogBubble.setVisible(false);
    this.dialogBubble.setScale(2.2); // Larger for two-line text
    this.dialogPadding = { x: 20, y: 10 };
    this.dialogOffsetY = -80;

    this.dialogText = this.add.text(width / 2 - 120, height - 235, "", {
      fontFamily: "Galmuri11-Bold",
      fontSize: "15px",
      color: "#5b3a24",
      wordWrap: { width: 280 }, // Wider for two lines
      lineSpacing: 3,
    });
    this.dialogText.setScrollFactor(0).setDepth(2001).setAlpha(1);
    this.dialogText.setVisible(false);

    this.inputKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.on("pointerdown", () => this.handleAdvance());
    this.blockInputUntil = this.time.now + 400;

    this.runOpening();
  }

  runOpening() {
    this.startDialogue(OPENING_LINES, () => this.runPhoneSequence());
  }

  startDialogue(lines, onComplete) {
    this.dialogueLines = lines.slice();
    this.dialogueIndex = 0;
    this.dialogueCompleteCb = onComplete;
    this.showDialogUI(true);
    this.allowDialogueInput = true;
    this.playLine();
  }

  showDialogUI(visible) {
    this.dialogBubble.setVisible(visible);
    this.dialogText.setVisible(visible);
    if (visible) this.alignDialogueToPlayer();
  }

  alignDialogueToPlayer() {
    if (!this.bgScene || !this.bgScene.player) {
      const { width, height } = this.scale;
      this.dialogBubble.setPosition(width / 2, height / 2);
      const bubbleW = this.dialogBubble.displayWidth;
      const bubbleH = this.dialogBubble.displayHeight;
      const padX = this.dialogPadding?.x ?? 12;
      const padY = this.dialogPadding?.y ?? 8;
      this.dialogText.setWordWrapWidth(Math.max(80, bubbleW - padX * 2));
      this.dialogText.setPosition(width / 2 - bubbleW / 2 + padX + 6, height / 2 - bubbleH / 2 + padY);
      return;
    }
    const cam = this.bgScene.cameras.main;
    const player = this.bgScene.player;
    const zoom = cam.zoom || 1;
    const view = cam.worldView;
    const screenX = cam.x + (player.x - view.x) * zoom;
    const screenY = cam.y + (player.y - view.y) * zoom;
    const bubbleX = Math.round(screenX);
    const bubbleY = Math.round(screenY + (this.dialogOffsetY ?? -80));
    this.dialogBubble.setPosition(bubbleX, bubbleY);

    const bubbleW = this.dialogBubble.displayWidth;
    const bubbleH = this.dialogBubble.displayHeight;
    const padX = this.dialogPadding?.x ?? 12;
    const padY = this.dialogPadding?.y ?? 8;
    this.dialogText.setWordWrapWidth(Math.max(80, bubbleW - padX * 2));
    this.dialogText.setPosition(bubbleX - bubbleW / 2 + padX + 6, bubbleY - bubbleH / 2 + padY);
  }

  finishOpening() {
    window.dispatchEvent(new CustomEvent("opening-end"));
    if (this.scene.isPaused("GameScene")) {
      this.scene.resume("GameScene");
    }
    if (this.bgScene) {
      this.bgScene.cameras.main.setZoom(1.2);
    }
    if (!this.scene.isActive("GameScene")) {
      this.scene.start("GameScene");
    }
    this.scene.stop();
  }

  playLine() {
    const line = this.dialogueLines[this.dialogueIndex] || "";
    this.lineStartTime = this.time.now;
    this.typeText(line);
  }

  typeText(text) {
    this.isTyping = true;
    this.dialogBubble.setVisible(true);
    this.dialogText.setVisible(true);
    this.dialogBubble.setAlpha(1);
    this.dialogText.setAlpha(1);
    this.alignDialogueToPlayer();
    this.dialogText.setText("");

    let idx = 0;
    const timer = this.time.addEvent({
      delay: 80,
      loop: true,
      callback: () => {
        idx += 1;
        this.dialogText.setText(text.slice(0, idx));
        if (idx >= text.length) {
          this.isTyping = false;
          timer.remove(false);
        }
      },
    });

    this.typingTimer = timer;
  }

  handleAdvance() {
    if (!this.allowDialogueInput) return;
    if (this.time.now < (this.blockInputUntil ?? 0)) return;
    if (this.lineStartTime && this.time.now - this.lineStartTime < 250) return;

    if (this.isTyping) {
      if (this.typingTimer) this.typingTimer.remove(false);
      this.dialogText.setText(this.dialogueLines[this.dialogueIndex]);
      this.isTyping = false;
      return;
    }

    this.dialogueIndex += 1;
    if (this.dialogueIndex >= this.dialogueLines.length) {
      this.allowDialogueInput = false;
      this.showDialogUI(false);
      if (this.dialogueCompleteCb) this.dialogueCompleteCb();
      return;
    }
    this.playLine();
  }

  runPhoneSequence() {
    const { width, height } = this.scale;

    // Position phone_off at bottom-right corner (icon size)
    const phoneOff = this.add.image(width - 70, height - 120, "phoneOff");
    phoneOff.setScrollFactor(0);
    phoneOff.setScale(0.22); // Smaller icon size
    phoneOff.setInteractive();
    phoneOff.setDepth(1000);

    // Add vibration animation to attract attention
    this.tweens.add({
      targets: phoneOff,
      x: phoneOff.x + 3,
      yoyo: true,
      repeat: -1, // Infinite until clicked
      duration: 50,
    });

    // Click handler: bounce then zoom and move to center
    phoneOff.on("pointerdown", () => {
      // Stop vibration
      this.tweens.killTweensOf(phoneOff);

      // Disable further clicks
      phoneOff.disableInteractive();

      // Step 1: Click feedback - quick bounce
      this.tweens.add({
        targets: phoneOff,
        scale: 0.28,
        duration: 100,
        ease: "Back.easeOut",
        onComplete: () => {
          // Step 2: Zoom and move to center with smooth animation
          this.tweens.add({
            targets: phoneOff,
            x: width / 2,
            y: height / 2,
            scale: 0.95, // Reduced size to match resized asset
            duration: 700,
            ease: "Cubic.easeOut",
            onComplete: () => {
              // After zoom animation, show phone_on
              const phoneOn = this.add.image(width / 2, height / 2, "phoneOn");
              phoneOn.setAlpha(0);
              phoneOn.setScale(0.95);
              phoneOn.setScrollFactor(0);
              phoneOn.setDepth(1000);

              this.tweens.add({
                targets: phoneOn,
                alpha: 1,
                scale: 0.9, // Settle slightly smaller
                duration: 500,
                ease: "Quad.easeOut",
                onComplete: () => {
                  phoneOff.destroy();
                  this.runTodoStep(phoneOn);
                },
              });
            },
          });
        },
      });
    });
  }

  runTodoStep(phoneOn) {
    const todo = this.add.image(phoneOn.x + 105, phoneOn.y - 40, "todoIcon");
    todo.setInteractive();
    todo.setScrollFactor(0);
    todo.setScale(2.1);
    todo.setDepth(1101);

    const pulse = this.tweens.add({
      targets: todo,
      scale: 2.05,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });

    todo.on("pointerdown", () => {
      pulse.stop();
      todo.destroy();
      const phoneTodo = this.add.image(phoneOn.x, phoneOn.y, "phoneTodo");
      phoneTodo.setScrollFactor(0);
      phoneTodo.setDepth(1100);
      phoneTodo.setScale(phoneOn.scaleX);
      phoneTodo.setAlpha(0);
      this.tweens.add({
        targets: phoneTodo,
        alpha: 1,
        duration: 450,
        ease: "Quad.easeOut",
        onComplete: () => {
          phoneOn.destroy();
          this.time.delayedCall(1800, () => {
            phoneTodo.destroy();
            this.startDialogue(STORY_LINES, () => {
              this.finishOpening();
            });
          });
        },
      });
    });
  }

  update() {
    if (this.dialogBubble?.visible) {
      this.alignDialogueToPlayer();
    }
  }
}

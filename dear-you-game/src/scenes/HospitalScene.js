import Phaser from "phaser";

const MAP_WIDTH = 600;
const MAP_HEIGHT = 440;
const FLOOR_HEIGHT = 340; // Reduced floor height

export default class HospitalScene extends Phaser.Scene {
    constructor() {
        super({ key: "Hospital" });
    }

    init(data) {
        this.spawnX = data?.x ?? MAP_WIDTH / 2;
        this.spawnY = data?.y ?? MAP_HEIGHT - 60;
    }

    preload() {
        const hospitalPath = "/assets/hospital/";
        const commonPath = "/assets/common/";

        this.load.image("hosp_tile", `${hospitalPath}tile5.png`);
        this.load.image("hosp_wall", `${hospitalPath}wall3.png`);
        this.load.image("hosp_bed", `${hospitalPath}bed.png`);
        this.load.image("hosp_cart", `${hospitalPath}cart.png`);
        this.load.image("hosp_flower", `${hospitalPath}flower.png`);
        this.load.image("hosp_iv", `${hospitalPath}iv.png`);
        this.load.image("hosp_armchair", `${hospitalPath}armchair.png`);
        this.load.image("hosp_outline", `/assets/dormitory/outline_top.png`);

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
        const roomW = 380;
        const roomH = 450;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const startX = centerX - roomW / 2;
        const startY = centerY - roomH / 2;

        this.cameras.main.setBackgroundColor("#222222");
        this.cameras.main.setZoom(1); // Reset zoom as we are using pixelScale 3
        this.physics.world.setBounds(startX, startY, roomW, roomH);

        // Floor
        this.add.tileSprite(centerX, centerY, roomW, roomH, "hosp_tile")
            .setTileScale(pixelScale)
            .setDepth(0);

        // Wall (Top)
        // Adjusting wall to fit top of room
        const wallTex = this.textures.get("hosp_wall").getSourceImage();
        const wallHeight = wallTex.height * pixelScale;

        // Position wall at the top edge of the room
        this.add.tileSprite(centerX, startY + wallHeight / 2, roomW, wallHeight, "hosp_wall")
            .setTileScale(pixelScale)
            .setDepth(1);

        // Create invisible wall barriers
        const walls = this.physics.add.staticGroup();
        // Top wall
        const topWall = walls.create(centerX, startY + wallHeight / 2, null);
        topWall.setSize(roomW, wallHeight).setVisible(false).refreshBody();

        // Left wall barrier
        const leftWall = walls.create(startX, centerY, null);
        leftWall.setSize(10, roomH).setVisible(false).refreshBody();

        // Right wall barrier
        const rightWall = walls.create(startX + roomW, centerY, null);
        rightWall.setSize(10, roomH).setVisible(false).refreshBody();

        // Bottom invisible barrier (leave gap for exit)
        const bottomWall = walls.create(centerX, startY + roomH, null);
        bottomWall.setSize(roomW, 20).setVisible(false).refreshBody();


        // --- Floor Outline (Exit Zone Logic) ---
        const outlineTex = this.textures.get("hosp_outline").getSourceImage();
        const outlineH = outlineTex.height * pixelScale;

        // 1. Outline at the very bottom of the floor area
        this.add.tileSprite(centerX, startY + roomH - outlineH / 2, roomW, outlineH, "hosp_outline")
            .setTileScale(pixelScale)
            .setDepth(1);

        // 2. Physics zone for exit
        this.exitZone = this.add.zone(centerX, startY + roomH - 20, roomW, 40);
        this.physics.world.enable(this.exitZone);
        this.exitZone.body.setAllowGravity(false);
        this.exitZone.body.moves = false;

        const obstacles = this.physics.add.staticGroup();

        // Furniture Placement
        // Bed (Centerish)
        const bed = obstacles.create(centerX, centerY, "hosp_bed");
        bed.setScale(pixelScale * 1.2);
        bed.refreshBody();
        bed.body.setSize(bed.width * 0.9, bed.height * 0.8);
        bed.body.setOffset(bed.width * 0.05, bed.height * 0.1);
        bed.setDepth(bed.y);

        // Cart (Left of Bed)
        const cartX = bed.x - (bed.width * bed.scaleX) / 2 - 40;
        const cartY = bed.y - 20;
        const cart = obstacles.create(cartX, cartY, "hosp_cart");
        cart.setScale(pixelScale);
        cart.refreshBody();
        cart.setDepth(cart.y);

        // Flower (On Cart)
        const flower = this.add.image(cart.x, cart.y - 20 * (pixelScale / 2), "hosp_flower");
        flower.setScale(pixelScale);
        flower.setDepth(cart.depth + 1);

        // IV (Right of Bed)
        const ivX = bed.x + (bed.width * bed.scaleX) / 2 + 30;
        const ivY = bed.y - 40;
        const iv = obstacles.create(ivX, ivY, "hosp_iv");
        iv.setScale(pixelScale);
        iv.refreshBody();
        iv.setDepth(iv.y);

        // Armchair (Far Right)
        const chairX = ivX + 60;
        const chairY = bed.y + 40;
        const chair = obstacles.create(chairX, chairY, "hosp_armchair");
        chair.setScale(pixelScale);
        chair.refreshBody();
        chair.setDepth(chair.y);

        // Player
        this.createPlayerAnimations();
        const firstFrame = "16x16 All Animations 0.aseprite";
        // Default spawn at "door" area if no data
        // Force spawn to new door location if it looks like default
        this.player = this.physics.add.sprite(centerX, startY + roomH - 80, "main_character", firstFrame);
        this.player.setScale(pixelScale).setCollideWorldBounds(true);
        this.player.body.setSize(10, 8).setOffset(5, 12);
        this.player.setDepth(100);

        this.physics.add.collider(this.player, walls);
        this.physics.add.collider(this.player, obstacles);

        // Camera
        this.cameras.main.setBounds(0, 0, canvasWidth, canvasHeight);
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
        this.cameras.main.roundPixels = true;

        // Controls
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

        // Hand Item
        this.handItem = this.add.image(0, 0, "letter_icon").setScale(1).setDepth(200).setVisible(false);
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

        // Mouse/Key handling (Standard movement)
        const pointer = this.input.activePointer;
        const pointerRightDown = pointer.rightButtonDown();
        this.prevRight = pointerRightDown;

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

        // Hand Item Logic
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

        // Check Exit
        if (this.physics.overlap(this.player, this.exitZone)) {
            // Trigger exit confirmation or direct exit
            window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "LeaveHospital" } }));
            this.player.body.setVelocity(0); // Stop player
            // Move player back slightly to prevent spamming
            this.player.y -= 5;
        }
    }
}

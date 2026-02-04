
import Phaser from "phaser";

const MAP_WIDTH = 960;
const MAP_HEIGHT = 600;
const FLOOR_HEIGHT = 450;

export default class DevelopmentRoomScene extends Phaser.Scene {
    constructor() {
        super({ key: "DevelopmentRoom" });
    }

    init(data) {
        this.spawnX = data?.x ?? MAP_WIDTH / 2;
        this.spawnY = data?.y ?? MAP_HEIGHT - 100;
    }

    preload() {
        const assetPath = "/assets/development_room/";
        const commonPath = "/assets/common/";

        this.load.image("dev_floor", `${assetPath}tile3.png`);
        this.load.image("dev_wall", `${assetPath}wall3.png`);
        this.load.image("dev_outline", `${assetPath}outline4.png`);
        this.load.image("dev_board", `${assetPath}board.png`);
        this.load.image("dev_board_letter", `${assetPath}board_letter.png`);
        this.load.image("dev_chair", `${assetPath}chair.png`);
        this.load.image("dev_desk", `${assetPath}desk.png`);
        this.load.image("dev_desk_l", `${assetPath}desk_l.png`);
        this.load.image("dev_desk_r", `${assetPath}desk_r.png`);
        this.load.image("dev_desk_l_alt", `${assetPath}desk1.png`);
        this.load.image("dev_desk_r_alt", `${assetPath}desk1_r.png`);
        this.load.image("dev_door_left", `${assetPath}door_left.png`);
        this.load.image("dev_door_right", `${assetPath}door_right.png`);
        this.load.image("plz_icon", `${commonPath}plz.png`);
        this.load.image("dev_mic", `${assetPath}mic.png`);

        const characterPath = `${commonPath}character/`;
        this.load.atlas(
            "main_character",
            `${characterPath}main_character.png`,
            `${characterPath}main_character.json`
        );
        // Load LYJ NPC
        this.load.spritesheet("lyj", `${characterPath}lyj.png`, { frameWidth: 20, frameHeight: 20 });
        this.load.image("cyw_chair", `${characterPath}cyw_chair.png`);
        this.load.image("zhe_chair", `${characterPath}zhe_chair.png`);
        this.load.image("jjaewoo_chair", `${characterPath}jjaewoo_chair.png`);
        this.load.image("ajy_chair", `${characterPath}ajy_chair.png`);
    }

    create() {
        const pixelScale = 2.6;

        this.cameras.main.setBackgroundColor("#222222");
        this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.developmentNpcs = [];

        // 1. Floor & Wall
        const floorTop = MAP_HEIGHT - FLOOR_HEIGHT;
        const floorY = floorTop + FLOOR_HEIGHT / 2;

        this.add
            .tileSprite(MAP_WIDTH / 2, floorY, MAP_WIDTH, FLOOR_HEIGHT, "dev_floor")
            .setTileScale(pixelScale)
            .setDepth(0);

        const wallTexture = this.textures.get("dev_wall").getSourceImage();
        const wallHeight = wallTexture.height * pixelScale;
        const wallY = floorTop - wallHeight / 2;

        this.add
            .tileSprite(MAP_WIDTH / 2, wallY, MAP_WIDTH, wallHeight, "dev_wall")
            .setTileScale(pixelScale)
            .setDepth(1);

        // Wall collision
        const wallBody = this.physics.add.staticImage(MAP_WIDTH / 2, wallY, "dev_wall");
        wallBody.setDisplaySize(MAP_WIDTH, wallHeight);
        wallBody.setVisible(false);
        wallBody.body.setSize(MAP_WIDTH, wallHeight * 0.2);
        wallBody.body.setOffset(0, wallHeight * 0.8);
        wallBody.refreshBody();

        // Outline
        const outlineTexture = this.textures.get("dev_outline").getSourceImage();
        const outlineHeight = outlineTexture.height * pixelScale;
        this.add
            .tileSprite(MAP_WIDTH / 2, floorTop, MAP_WIDTH, outlineHeight, "dev_outline")
            .setTileScale(pixelScale)
            .setDepth(2);


        // 2. Objects (Doors, Board)
        const obstactles = this.physics.add.staticGroup();
        const decor = this.physics.add.staticGroup();

        // Board on the wall (interactive)
        const board = decor.create(MAP_WIDTH / 2, wallY + 30, "dev_board");
        board.setScale(pixelScale * 1.1);
        board.setDepth(2.2);
        board.setOrigin(0.5, 0.5);
        this.devBoard = board;
        this.devBoardLetter = null;
        const deskRows = 3;
        const leftPerRow = 4;
        const rightPerRow = 4;
        const totalLeft = deskRows * leftPerRow;
        const totalRight = deskRows * rightPerRow;
        const pickRandomIndices = (total, count) => {
            const indices = Array.from({ length: total }, (_, i) => i);
            Phaser.Utils.Array.Shuffle(indices);
            return new Set(indices.slice(0, count));
        };

        const leftAltSet = pickRandomIndices(totalLeft, 4);
        const rightAltSet = pickRandomIndices(totalRight, 4);
        let leftIndex = 0;
        let rightIndex = 0;

        const pickDeskKey = (type) => {
            if (type === "l") {
                const useAlt = leftAltSet.has(leftIndex);
                leftIndex += 1;
                return useAlt ? "dev_desk_l_alt" : "dev_desk_l";
            }
            if (type === "r") {
                const useAlt = rightAltSet.has(rightIndex);
                rightIndex += 1;
                return useAlt ? "dev_desk_r_alt" : "dev_desk_r";
            }
            return "dev_desk";
        };

        // Doors (Top Left & Right)
        const doorY = floorTop;
        const doorLeft = decor.create(120, doorY, "dev_door_left");
        const doorRight = decor.create(MAP_WIDTH - 120, doorY, "dev_door_right");

        [doorLeft, doorRight].forEach(door => {
            door.setOrigin(0.5, 1);
            door.setScale(pixelScale * 1.5);
            door.setDepth(2.1);
        });
        this.doorExitX = doorLeft.x;
        this.doorExitY = doorLeft.y - doorLeft.displayHeight * 0.5;

        // Mic (Top Left area, free standing)
        const mic = decor.create(MAP_WIDTH / 2 + 40, floorTop + 40, "dev_mic");
        mic.setScale(pixelScale * 1.5);
        mic.setDepth(floorTop + 40);
        mic.setOrigin(0.5, 1);
        // 3. Desks Layout
        const createDeskRow = (y, rowIndex) => {
            // Groups positions (Center X) and margins
            const centerGroupX = MAP_WIDTH / 2;
            const sideMargin = 20;
            const leftTypes = ['l', 'r'];
            const centerTypes = ['l', 'r', 'c', 'c', 'l', 'r'];
            const rightTypes = ['l', 'r'];

            const assetName = (t) => t === 'l' ? "dev_desk_l" : t === 'r' ? "dev_desk_r" : "dev_desk";
            const getGroupWidth = (types) => types.reduce((acc, type) => {
                const tex = this.textures.get(assetName(type)).getSourceImage();
                return acc + tex.width * pixelScale;
            }, 0);

            const leftGroupWidth = getGroupWidth(leftTypes);
            const rightGroupWidth = getGroupWidth(rightTypes);

            const leftGroupX = sideMargin + leftGroupWidth / 2;
            const rightGroupX = MAP_WIDTH - sideMargin - rightGroupWidth / 2;

            const placeSequence = (cx, types, groupName) => {
                const totalWidth = types.reduce((acc, type) => {
                    const tex = this.textures.get(assetName(type)).getSourceImage();
                    return acc + tex.width * pixelScale;
                }, 0);

                let currentX = cx - totalWidth / 2;

                types.forEach((type, index) => {
                    const key = pickDeskKey(type);
                    const tex = this.textures.get(key).getSourceImage();
                    const w = tex.width * pixelScale;
                    const h = tex.height * pixelScale;

                    const posX = currentX + w / 2;
                    const posY = y;

                    const desk = obstactles.create(posX, posY, key);
                    desk.setScale(pixelScale);
                    desk.refreshBody();
                    desk.body.setSize(w * 0.85, h * 0.4);
                    desk.body.setOffset(w * 0.075, h * 0.6);
                    desk.setDepth(posY);

                    // NPC Replacement
                    const npcMap = {
                        "2-left-0": "cyw_chair",
                        "1-center-0": "zhe_chair",
                        "0-center-4": "jjaewoo_chair",
                        "1-right-1": "ajy_chair"
                    };
                    const npcKey = npcMap[`${rowIndex}-${groupName}-${index}`];

                    if (npcKey) {
                        const npc = decor.create(posX, posY + 16, npcKey);
                        npc.setScale(pixelScale);
                        npc.setDepth(posY + 16);

                        const name = npcKey.replace("_chair", "");
                        const nameText = this.add.text(posX, posY - 25, name, {
                            fontFamily: "Galmuri11-Bold",
                            fontSize: "12px",
                            color: "#ffffff",
                            stroke: "#000000",
                            strokeThickness: 3
                        }).setOrigin(0.5).setDepth(99999).setVisible(false);

                        this.developmentNpcs.push({ sprite: npc, nameText });
                    } else {
                        // Add chair
                        const chair = decor.create(posX, posY + 16, "dev_chair");
                        chair.setScale(pixelScale);
                        chair.setDepth(posY + 16);
                    }

                    currentX += w;
                });
            };

            // Left: L, R
            placeSequence(leftGroupX, leftTypes, "left");
            // Center
            placeSequence(centerGroupX, centerTypes, "center");
            // Right
            placeSequence(rightGroupX, rightTypes, "right");
        };

        // Row positions
        const startDeskY = floorTop + 110;
        const rowGap = 140;

        createDeskRow(startDeskY, 0);
        createDeskRow(startDeskY + rowGap, 1);
        createDeskRow(startDeskY + rowGap * 2, 2);


        // 4. Player
        const firstFrame = "16x16 All Animations 0.aseprite";
        this.player = this.physics.add.sprite(this.spawnX, this.spawnY, "main_character", firstFrame);
        this.player.setScale(pixelScale).setCollideWorldBounds(true);

        this.player.body.setSize(10, 8).setOffset(5, 12);
        this.player.setDepth(100);

        this.physics.add.collider(this.player, wallBody);
        this.physics.add.collider(this.player, obstactles);

        // Camera
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
        this.cameras.main.setZoom(1.5);

        // Keys
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
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.prevRight = false;
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Animations
        this.createPlayerAnimations();
        this.lastDirection = "down";
        this.player.anims.play("idle-down");

        // Create LYJ NPC
        this.createLyj(pixelScale);
    }




    createLyj(scale) {
        // Position: Front of the room (Center X, near top wall)
        const startX = MAP_WIDTH / 2;
        const startY = (MAP_HEIGHT - FLOOR_HEIGHT) + 60; // Slightly below the wall

        this.lyj = this.physics.add.sprite(startX, startY, "lyj");
        this.lyj.setScale(scale);
        this.lyj.setDepth(startY);

        this.lyjPlz = this.add.image(startX + 14, startY - 24, "plz_icon");
        this.lyjPlz.setScale(scale * 0.45);
        this.lyjPlz.setDepth(startY + 1);

        // Name Tag
        this.lyjName = this.add.text(startX, startY - 40, "lyj", {
            fontFamily: "Galmuri11-Bold",
            fontSize: "12px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(99999).setVisible(false);

        const anims = this.anims;
        if (!anims.exists("lyj-walk")) {
            const frameCount = this.textures.get("lyj").getSourceImage().width / 20;
            anims.create({
                key: "lyj-walk",
                frames: anims.generateFrameNumbers("lyj", { start: 0, end: Math.max(0, frameCount - 1) }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Pacing Logic
        const range = 60;
        const duration = 1200;

        this.lyj.x = startX - range;

        const paceRight = () => {
            if (!this.lyj || !this.lyj.scene) return;
            this.lyj.setFlipX(false);
            this.lyj.play("lyj-walk");
            this.tweens.add({
                targets: this.lyj,
                x: startX + range,
                duration: duration,
                ease: "Linear",
                onComplete: paceLeft
            });
        };

        const paceLeft = () => {
            if (!this.lyj || !this.lyj.scene) return;
            this.lyj.setFlipX(true);
            this.lyj.play("lyj-walk");
            this.tweens.add({
                targets: this.lyj,
                x: startX - range,
                duration: duration,
                ease: "Linear",
                onComplete: paceRight
            });
        };

        paceRight();
    }

    createPlayerAnimations() {
        if (this.anims.exists("idle-down")) return;
        const makeAnim = (key, start, end, frameRate, repeat) => {
            this.anims.create({
                key,
                frames: this.anims.generateFrameNames("main_character", {
                    start, end, prefix: "16x16 All Animations ", suffix: ".aseprite"
                }),
                frameRate, repeat
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
        if (this.lyj && this.lyjPlz) {
            const bob = Math.sin(this.time.now / 200) * 3;
            this.lyjPlz.x = this.lyj.x + 14;
            this.lyjPlz.y = this.lyj.y - 24 + bob;
            this.lyjPlz.setDepth(this.lyj.depth + 1);
        }
        const pointer = this.input.activePointer;
        const pointerRightDown = pointer.rightButtonDown();
        const rightJustDown = pointerRightDown && !this.prevRight;
        this.prevRight = pointerRightDown;

        if (rightJustDown && this.devBoard) {
            const distToBoard = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                this.devBoard.x,
                this.devBoard.y
            );
            if (distToBoard < 120) {
                if (this.devBoardLetter) {
                    this.devBoardLetter.destroy();
                    this.devBoardLetter = null;
                } else {
                    const centerX = this.cameras.main.worldView.centerX;
                    const centerY = this.cameras.main.worldView.centerY;
                    const dim = this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.35);
                    dim.setScrollFactor(0).setDepth(10000);
                    const letter = this.add.image(centerX, centerY, "dev_board_letter");
                    letter.setScrollFactor(0).setDepth(10001);
                    this.devBoardLetter = this.add.container(0, 0, [dim, letter]);
                    this.devBoardLetter.setDepth(10002);
                }
                return;
            }
        }

        if (this.doorExitX && this.doorExitY) {
            const distanceToDoor = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                this.doorExitX,
                this.doorExitY
            );
            const canTrigger = !this.lastTriggerTime || this.time.now - this.lastTriggerTime > 1000;
            if (distanceToDoor < 70 && canTrigger && (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey))) {
                this.lastTriggerTime = this.time.now;
                window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "EnterHospital" } }));
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
                run: { down: "run-down", left: "run-left", right: "run-right", up: "run-up" }
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

        // Update LYJ Name Tag
        if (this.lyj && this.lyjName) {
            this.lyjName.setPosition(this.lyj.x, this.lyj.y - 40);
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.lyj.x, this.lyj.y);
            this.lyjName.setVisible(dist < 60);

            if (dist < 60 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                window.dispatchEvent(new CustomEvent("interact-npc", { detail: { npcId: "npc-lyj" } }));
            }
        }

        if (this.developmentNpcs) {
            this.developmentNpcs.forEach(npcData => {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npcData.sprite.x, npcData.sprite.y);
                npcData.nameText.setVisible(dist < 60);
            });
        }
    }
}

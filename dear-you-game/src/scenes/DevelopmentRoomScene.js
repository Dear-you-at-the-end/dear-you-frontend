
import Phaser from "phaser";

const MAP_WIDTH = 960;
const MAP_HEIGHT = 600;
const FLOOR_HEIGHT = 450;

export default class DevelopmentRoomScene extends Phaser.Scene {
    constructor() {
        super({ key: "DevelopmentRoom" });
    }

    spawnPseongjun(pixelScale) {
        if (this.pseongjun) return;
        const startX = this.doorRightX ?? (MAP_WIDTH - 120);
        const startY = (this.doorRightY ?? (MAP_HEIGHT - FLOOR_HEIGHT)) + 20;
        const targetY = (this.devMic?.y ?? ((MAP_HEIGHT - FLOOR_HEIGHT) + 40)) + 10;

        if (!this.anims.exists("psjun-walk")) {
            this.anims.create({
                key: "psjun-walk",
                frames: this.anims.generateFrameNumbers("psjun", { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1,
            });
        }

        this.pseongjun = this.physics.add.sprite(startX, startY, "psjun");
        this.pseongjun.setScale(pixelScale);
        this.pseongjun.setDepth(startY);
        this.pseongjun.body.setImmovable(true);
        this.pseongjun.body.setAllowGravity(false);
        this.pseongjun.body.setSize(12, 10).setOffset(4, 10);
        this.pseongjun.play("psjun-walk");

        this.pseongjunQuestIcon = this.add.image(startX, startY - 38, "quest_icon");
        this.pseongjunQuestIcon.setScale(pixelScale * 0.55);
        this.pseongjunQuestIcon.setDepth(99999);
        this.pseongjunQuestIcon.setVisible(false);
        this.tweens.add({
            targets: this.pseongjunQuestIcon,
            y: this.pseongjunQuestIcon.y - 4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        this.tweens.add({
            targets: this.pseongjun,
            y: targetY,
            duration: 900,
            ease: "Linear",
            onUpdate: () => {
                if (!this.pseongjun) return;
                this.pseongjun.setDepth(this.pseongjun.y);
            },
            onComplete: () => {
                if (!this.pseongjun) return;
                this.pseongjun.anims.stop();
                this.pseongjun.setFrame(0);
                window.dispatchEvent(new CustomEvent("open-pseongjun-arrive-dialog"));
            },
        });
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
        this.load.image("quest_icon", `${commonPath}quest_icon.png`);
        this.load.image("dev_mic", `${assetPath}mic.png`);
        this.load.image("hint_icon", `${assetPath}hint.png`);
        this.load.image("x", `${commonPath}x.png`);
        this.load.image("dialog_bubble", `${commonPath}dialog.png`);

        const characterPath = `${commonPath}character/`;
        this.load.atlas(
            "main_character",
            `${characterPath}main_character.png`,
            `${characterPath}main_character.json`
        );
        // Load LYJ NPC
        this.load.spritesheet("lyj", `${characterPath}lyj.png`, { frameWidth: 20, frameHeight: 20 });
        this.load.spritesheet("ljy", `${characterPath}ljy.png`, { frameWidth: 20, frameHeight: 20 });
        this.load.spritesheet("psjun", `${characterPath}psjun.png`, { frameWidth: 20, frameHeight: 20 });
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
        const board = decor.create(MAP_WIDTH / 2, wallY + 18, "dev_board");
        board.setScale(pixelScale * 1.25);
        board.setDepth(2.2);
        board.setOrigin(0.5, 0.5);
        this.devBoard = board;
        // Board plz marker (shown after all deliveries, until key is obtained)
        this.devBoardPlz = this.add.image(board.x + 14, board.y - 34, "plz_icon");
        this.devBoardPlz.setScale(pixelScale * 0.45);
        this.devBoardPlz.setDepth(99999);
        this.devBoardPlz.setVisible(false);
        this.tweens.add({
            targets: this.devBoardPlz,
            y: this.devBoardPlz.y - 4,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });
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
        this.doorRightX = doorRight.x;
        this.doorRightY = doorRight.y - doorRight.displayHeight * 0.5;
        this.doorExitX = doorLeft.x;
        this.doorExitY = doorLeft.y - doorLeft.displayHeight * 0.5;

        // Mic (Top Left area, free standing)
        const mic = decor.create(MAP_WIDTH / 2 + 140, floorTop + 40, "dev_mic");
        mic.setScale(pixelScale * 0.8);
        mic.setDepth(floorTop + 40);
        mic.setOrigin(0.5, 1);
        this.devMic = mic;
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
                    const bodyW = desk.displayWidth * 0.75;
                    const bodyH = desk.displayHeight * 0.22;
                    desk.body.setSize(bodyW, bodyH);
                    desk.body.setOffset(
                        (desk.displayWidth - bodyW) / 2,
                        desk.displayHeight - bodyH,
                    );
                    desk.refreshBody();
                    desk.setDepth(posY);

                    // NPC Replacement
                    const npcMap = {
                        "1-left-0": "cyw_chair",
                        "1-center-0": "zhe_chair",
                        "0-center-4": "jjaewoo_chair",
                        "1-right-1": "ajy_chair"
                    };
                    const npcKey = npcMap[`${rowIndex}-${groupName}-${index}`];

                    if (npcKey) {
                        const npc = decor.create(posX, posY + 16, npcKey);
                        npc.setScale(pixelScale);
                        npc.setDepth(posY + 16);

                        const code = npcKey.replace("_chair", "");
                        const codeToNpc = {
                            cyw: { npcId: "npc-cyw", name: "최영운" },
                            zhe: { npcId: "npc-zhe", name: "전하은" },
                            jjaewoo: { npcId: "npc-jjaewoo", name: "정재우" },
                            ajy: { npcId: "npc-ajy", name: "안준영" },
                        };
                        const meta = codeToNpc[code] ?? { npcId: `npc-${code}`, name: code };
                        npc.npcId = meta.npcId;
                        const nameText = this.add.text(posX, posY - 25, meta.name, {
                            fontFamily: "Galmuri11-Bold",
                            fontSize: "12px",
                            color: "#ffffff",
                            stroke: "#000000",
                            strokeThickness: 3
                        }).setOrigin(0.5).setDepth(99999).setVisible(false);

                        const questIcon = this.add.image(posX, (posY + 16) - 38, "quest_icon");
                        questIcon.setScale(pixelScale * 0.55);
                        questIcon.setDepth(99999);
                        questIcon.setVisible(false);
                         this.tweens.add({
                             targets: questIcon,
                             y: questIcon.y - 4,
                             duration: 800,
                             yoyo: true,
                             repeat: -1,
                             ease: "Sine.easeInOut",
                         });

                        // Interact point is in front of the desk so player can reach it even with collisions.
                        this.developmentNpcs.push({
                            sprite: npc,
                            nameText,
                            npcId: meta.npcId,
                            questIcon,
                            interactX: posX,
                            interactY: posY + 68,
                        });
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

        // Animations
        this.createPlayerAnimations();
        this.lastDirection = "down";
        this.player.anims.play("idle-down");

        // Create LYJ NPC
        this.createLyj(pixelScale);
        // Create LJY NPC (right corridor, side view)
        this.createLjy(pixelScale);

        // Fire the dev-room intro sequence once per scene entry.
        if (!this.registry.get("devIntroPlayed")) {
            this.registry.set("devIntroPlayed", true);
            this.time.delayedCall(250, () => {
                window.dispatchEvent(new CustomEvent("open-devroom-intro"));
            });
        }

        this.devNpcMap = {};
        if (this.developmentNpcs) {
            this.developmentNpcs.forEach(({ sprite, nameText }) => {
                if (nameText?.text) {
                    this.devNpcMap[nameText.text] = sprite;
                }
            });
        }
        this.questHint = this.add.image(0, 0, "hint_icon");
        this.questHint.setScale(pixelScale * 0.45);
        this.questHint.setDepth(10003);
        this.questHint.setVisible(false);
        // Player Speech Bubble Handler
        this.handlePlayerSay = (e) => {
            const text = e.detail;
            if (!this.player) return;

            // Remove existing bubble if any
            if (this.playerBubble) {
                this.playerBubble.destroy();
                this.playerBubble = null;
            }

            const bubble = this.add.image(0, 0, "dialog_bubble");
            bubble.setOrigin(0.5, 1);
            bubble.setScale(0.8, 0.6); // Adjust size

            const bubbleText = this.add.text(0, -5, text, {
                fontFamily: "Galmuri11-Bold",
                fontSize: "12px",
                color: "#6a4b37",
                align: "center",
            });
            bubbleText.setOrigin(0.5, 1);

            this.playerBubble = this.add.container(this.player.x, this.player.y - 30, [bubble, bubbleText]);
            this.playerBubble.setDepth(99999);

            // Access scene context correctly inside callback
            this.tweens.add({
                targets: this.playerBubble,
                alpha: 0,
                delay: 2000,
                duration: 500,
                onComplete: () => {
                    if (this.playerBubble) {
                        this.playerBubble.destroy();
                        this.playerBubble = null;
                    }
                }
            });
        };
        window.addEventListener("player-say", this.handlePlayerSay);

        this.handleSpawnPseongjun = () => {
            this.spawnPseongjun(pixelScale);
        };
        window.addEventListener("spawn-pseongjun", this.handleSpawnPseongjun);
        this.events.on("shutdown", () => {
            window.removeEventListener("player-say", this.handlePlayerSay);
            window.removeEventListener("spawn-pseongjun", this.handleSpawnPseongjun);
        });
    }




    createLyj(scale) {
        // Position: Front of the room (Center X, near top wall)
        const startX = MAP_WIDTH / 2;
        const startY = (MAP_HEIGHT - FLOOR_HEIGHT) + 60; // Slightly below the wall

        this.lyj = this.physics.add.sprite(startX, startY, "lyj");
        this.lyj.setScale(scale);
        this.lyj.setDepth(startY);

        this.lyjPlz = this.add.image(startX + 14, startY - 24, "plz_icon");
        this.lyjPlz.setScale(scale * 0.35);
        this.lyjPlz.setDepth(startY + 1);

        this.lyjQuestIcon = this.add.image(startX, startY - 38, "quest_icon");
        this.lyjQuestIcon.setScale(scale * 0.55);
        this.lyjQuestIcon.setDepth(99999);
        this.lyjQuestIcon.setVisible(false);
        this.tweens.add({
            targets: this.lyjQuestIcon,
            y: this.lyjQuestIcon.y - 4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        // Speech bubble (quest hint)
        const bubble = this.add.image(0, 0, "dialog_bubble");
        bubble.setOrigin(0.5, 1);
        bubble.setScale(scale * 0.7, scale * 0.4);
        const bubbleText = this.add.text(0, -5, "헤드셋을 잃어버렸어", {
            fontFamily: "Galmuri11-Bold",
            fontSize: "10px",
            color: "#6a4b37",
            align: "center",
        });
        bubbleText.setOrigin(0.5, 1);
        bubbleText.setDepth(10002);
        this.lyjBubble = this.add.container(0, 0, [bubble, bubbleText]);
        this.lyjBubble.setDepth(10001);

        // Name Tag
        this.lyjName = this.add.text(startX, startY - 40, "임유진", {
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

    createLjy(scale) {
        const corridorX = MAP_WIDTH - 140;
        const corridorY = (MAP_HEIGHT - FLOOR_HEIGHT) + 190;

        this.ljy = this.physics.add.sprite(corridorX, corridorY, "ljy");
        this.ljy.setScale(scale);
        this.ljy.setDepth(corridorY);
        this.ljy.body.setImmovable(true);
        this.ljy.body.setAllowGravity(false);
        this.ljy.body.setSize(12, 10).setOffset(4, 10);

        if (!this.anims.exists("ljy-idle-right")) {
            const frameCount = this.textures.get("ljy").getSourceImage().width / 20;
            this.anims.create({
                key: "ljy-idle-right",
                frames: this.anims.generateFrameNumbers("ljy", { start: 4, end: Math.max(4, frameCount - 1) }),
                frameRate: 5,
                repeat: -1
            });
        }
        this.ljy.play("ljy-idle-right");

        this.ljyNpcId = "npc-ljy";
        this.ljyName = this.add.text(this.ljy.x, this.ljy.y - 40, "이준엽", {
            fontFamily: "Galmuri11-Bold",
            fontSize: "12px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(99999).setVisible(false);

        this.ljyQuestIcon = this.add.image(this.ljy.x, this.ljy.y - 38, "quest_icon");
        this.ljyQuestIcon.setScale(scale * 0.55);
        this.ljyQuestIcon.setDepth(99999);
        this.ljyQuestIcon.setVisible(false);
        this.tweens.add({
            targets: this.ljyQuestIcon,
            y: this.ljyQuestIcon.y - 4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });
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

        if (this.playerBubble) {
            this.playerBubble.setPosition(this.player.x, this.player.y - 30);
        }

        const devAllLettersDelivered = this.registry.get("devAllLettersDelivered") ?? false;
        const devBoardUnlocked = this.registry.get("devBoardUnlocked") ?? false;
        const devBoardDone = this.registry.get("devBoardDone") ?? false;
        const devLyjMinigameDone = this.registry.get("devLyjMinigameDone") ?? false;
        const devLettersUnlocked = this.registry.get("devLettersUnlocked") ?? false;
        const devKeyCount = this.registry.get("devKeyCount") ?? 0;
        const selectedSlot = this.registry.get("selectedSlot") ?? -1;
        const keySlot = 5; // inventoryConfig.slots - 2 (7 slots => index 5)
        const cywHasLetter = this.registry.get("cywHasLetter") ?? false;
        const zheHasLetter = this.registry.get("zheHasLetter") ?? false;
        const jjaewooHasLetter = this.registry.get("jjaewooHasLetter") ?? false;
        const ajyHasLetter = this.registry.get("ajyHasLetter") ?? false;
        const lyjHasLetter = this.registry.get("lyjHasLetter") ?? false;
        const ljyHasLetter = this.registry.get("ljyHasLetter") ?? false;

        if (this.devBoardPlz) {
            this.devBoardPlz.setVisible(devBoardUnlocked && !devBoardDone);
        }
        if (devLettersUnlocked && devAllLettersDelivered && !devBoardUnlocked && !devBoardDone && !this.devAllDeliveredFired) {
            this.devAllDeliveredFired = true;
            window.dispatchEvent(new CustomEvent("dev-all-delivered"));
        }
        if (this.lyj && this.lyjPlz) {
            const currentQuestRoom = this.registry.get("currentQuestRoom");
            const questUnlocked = currentQuestRoom === "development_room" || currentQuestRoom == null;
            const accepted = this.registry.get("lyjQuestAccepted") ?? false;
            const completed = this.registry.get("lyjQuestCompleted") ?? false;
            const bob = Math.sin(this.time.now / 200) * 3;
            this.lyjPlz.x = this.lyj.x + 14;
            this.lyjPlz.y = this.lyj.y - 24 + bob;
            this.lyjPlz.setDepth(this.lyj.depth + 1);
            this.lyjPlz.setVisible(questUnlocked && (!devLyjMinigameDone || (!accepted && !completed)));
        }
        if (this.lyjQuestIcon && this.lyj) {
            this.lyjQuestIcon.setPosition(this.lyj.x, this.lyj.y - 38);
            this.lyjQuestIcon.setVisible(devLettersUnlocked && !lyjHasLetter);
        }
        // Legacy LYJ quest bubble disabled (we use React dialog flow now).
        if (this.lyjBubble) {
            this.lyjBubble.setVisible(false);
        }
        if (this.questHint) {
            const questStep = this.registry.get("lyjQuestStep") ?? 0;
            const accepted = this.registry.get("lyjQuestAccepted") ?? false;
            const completed = this.registry.get("lyjQuestCompleted") ?? false;

            let target = null;
            if (accepted && !completed) {
                if (questStep === 1) target = this.devNpcMap?.zhe;
                else if (questStep === 2) target = this.ljy;
                else if (questStep === 3) target = this.devNpcMap?.ajy;
                else if (questStep === 4) target = this.devNpcMap?.cyw;
                else if (questStep === 5) target = this.devNpcMap?.jjaewoo;
                else if (questStep === 6) target = this.devMic;
                else if (questStep === 7) target = this.lyj;
            }

            if (target) {
                const bob = Math.sin(this.time.now / 200) * 3;
                const isMic = target === this.devMic;
                const offsetY = isMic ? 48 : 36;
                this.questHint.x = target.x;
                this.questHint.y = target.y - offsetY + bob;
                this.questHint.setDepth((target.depth ?? target.y ?? 0) + 2);
                this.questHint.setVisible(true);
            } else {
                this.questHint.setVisible(false);
            }
        }
        const pointer = this.input.activePointer;
        const pointerRightDown = pointer.rightButtonDown();
        const rightJustDown = pointerRightDown && !this.prevRight;
        this.prevRight = pointerRightDown;
        const spaceJustDown = Phaser.Input.Keyboard.JustDown(this.spaceKey);
        const interactJustDown = rightJustDown || spaceJustDown;

        // Prioritize NPC interactions over board interactions.
        if (interactJustDown && this.lyj) {
            const distToLyj = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.lyj.x, this.lyj.y);
            if (distToLyj < 70) {
                const headsetCount = this.registry.get("headsetCount") ?? 0;
                const selectedSlot = this.registry.get("selectedSlot") ?? -1;
                const lyjQuestAccepted = this.registry.get("lyjQuestAccepted") ?? false;
                const lyjQuestCompleted = this.registry.get("lyjQuestCompleted") ?? false;

                if (headsetCount > 0 && selectedSlot === 6 && lyjQuestAccepted && !lyjQuestCompleted) {
                    window.dispatchEvent(new CustomEvent("complete-lyj-quest"));
                    this.lyj.anims.stop();
                    this.tweens.killTweensOf(this.lyj);
                    this.lyj.setFrame(0);
                } else if (!lyjQuestAccepted && !lyjQuestCompleted) {
                    window.dispatchEvent(new CustomEvent("open-lyj-quest"));
                } else {
                    window.dispatchEvent(new CustomEvent("interact-npc", { detail: { npcId: "npc-lyj" } }));
                }
                return;
            }
        }

        if (interactJustDown && this.pseongjun) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pseongjun.x, this.pseongjun.y);
            if (dist < 110) {
                window.dispatchEvent(new CustomEvent("interact-npc", { detail: { npcId: "npc-pseongjun" } }));
                return;
            }
        }

        const devNpcInteractRadius = 140;

        // Standard interaction for other NPCs in Development Room
        if (interactJustDown && this.developmentNpcs) {
            let closest = null;
            let closestDist = Infinity;
            for (const npcData of this.developmentNpcs) {
                const tx = npcData.interactX ?? npcData.sprite.x;
                const ty = npcData.interactY ?? npcData.sprite.y;
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, tx, ty);
                if (dist < closestDist) {
                    closestDist = dist;
                    closest = npcData;
                }
            }

            if (closest && closestDist < devNpcInteractRadius && closest.npcId) {
                window.dispatchEvent(new CustomEvent("interact-npc", { detail: { npcId: closest.npcId } }));
                return;
            }
        }

        // Handle LJY (Lee Yeon-ji) separate interaction
        if (interactJustDown && this.ljy) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.ljy.x, this.ljy.y);
            if (dist < 70) {
                window.dispatchEvent(new CustomEvent("interact-npc", { detail: { npcId: "npc-ljy" } }));
                return;
            }
        }

        if (interactJustDown && this.devMic) {
            const distToMic = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.devMic.x, this.devMic.y);
            const headsetCount = this.registry.get("headsetCount") ?? 0;
            const lyjQuestAccepted = this.registry.get("lyjQuestAccepted") ?? false;
            const lyjQuestCompleted = this.registry.get("lyjQuestCompleted") ?? false;

            // Only allow finding if quest accepted, not completed, and headset not yet found
            if (distToMic < 80 && lyjQuestAccepted && !lyjQuestCompleted && headsetCount === 0) {
                window.dispatchEvent(new CustomEvent("find-lyj-headset"));
                return;
            }
        }

        // Block board interactions until LYJ minigame/quest is cleared.
        const canUseBoard = devLyjMinigameDone;

        // Legacy board letter popup (disabled after board unlock flow starts).
        if (interactJustDown && canUseBoard && this.devBoard && !devBoardUnlocked) {
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
                    const centerX = this.scale.width / 2;
                    const centerY = this.scale.height / 2;

                    const closeBoardLetter = () => {
                        if (this.devBoardLetter) {
                            this.devBoardLetter.destroy();
                            this.devBoardLetter = null;
                        }
                    };

                    // Main Container centered on screen, fixed to camera
                    this.devBoardLetter = this.add.container(centerX, centerY);
                    this.devBoardLetter.setScrollFactor(0);
                    this.devBoardLetter.setDepth(10002);

                    // Dim Background (blocks clicks underneath) + click-to-close
                    const dim = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.35);
                    dim.setOrigin(0.5, 0.5);
                    dim.setInteractive({ useHandCursor: true });
                    dim.on("pointerdown", closeBoardLetter);

                    // Letter Image
                    const letter = this.add.image(0, 0, "dev_board_letter");

                    // Close Button (top-right)
                    const closeBtn = this.add.image(
                        (letter.width / 2) - 20,
                        -(letter.height / 2) + 20,
                        "x"
                    );
                    closeBtn.setScale(0.6);
                    closeBtn.setInteractive(
                        new Phaser.Geom.Rectangle(-24, -24, 48, 48),
                        Phaser.Geom.Rectangle.Contains,
                    );
                    closeBtn.on("pointerdown", (pointer, localX, localY, event) => {
                        if (event) event.stopPropagation();
                        closeBoardLetter();
                    });

                    // Add all to the single container
                    this.devBoardLetter.add([dim, letter, closeBtn]);
                }
                return;
            }
        }

        // Dev-board interaction (after unlock): show dialog and eventually give key.
        if (interactJustDown && canUseBoard && this.devBoard && devBoardUnlocked && !devBoardDone) {
            const distToBoard = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.devBoard.x, this.devBoard.y);
            if (distToBoard < 120) {
                if (this.devBoardLetter) {
                    this.devBoardLetter.destroy();
                    this.devBoardLetter = null;
                }
                window.dispatchEvent(new CustomEvent("dev-board-interact"));
                this.player.body.setVelocity(0);
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
                // Only allow leaving to hospital when player has the scooter key selected.
                if (devKeyCount > 0 && selectedSlot === keySlot) {
                    window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "EnterHospital" } }));
                }
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

        if (this.ljy && this.ljyName) {
            this.ljyName.setPosition(this.ljy.x, this.ljy.y - 40);
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.ljy.x, this.ljy.y);
            this.ljyName.setVisible(dist < 60);
            if (this.ljyQuestIcon) {
                this.ljyQuestIcon.setPosition(this.ljy.x, this.ljy.y - 38);
                this.ljyQuestIcon.setVisible(devLettersUnlocked && !ljyHasLetter);
            }
            if (dist < 60 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                window.dispatchEvent(new CustomEvent("interact-npc", { detail: { npcId: "npc-ljy" } }));
            }
        }

        if (this.developmentNpcs) {
            this.developmentNpcs.forEach(npcData => {
                const tx = npcData.interactX ?? npcData.sprite.x;
                const ty = npcData.interactY ?? npcData.sprite.y;
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, tx, ty);
                npcData.nameText.setVisible(dist < 80);
                if (npcData.questIcon) {
                    const hasLetterMap = {
                        "npc-cyw": cywHasLetter,
                        "npc-zhe": zheHasLetter,
                        "npc-jjaewoo": jjaewooHasLetter,
                        "npc-ajy": ajyHasLetter,
                    };
                    npcData.questIcon.setPosition(npcData.sprite.x, npcData.sprite.y - 38);
                    npcData.questIcon.setVisible(devLettersUnlocked && !(hasLetterMap[npcData.npcId] ?? false));
                }
            });
        }

        if (this.pseongjunQuestIcon && this.pseongjun) {
            const ready = this.registry.get("pseongjunReady") ?? false;
            const hasLetter = this.registry.get("pseongjunHasLetter") ?? false;
            this.pseongjunQuestIcon.setPosition(this.pseongjun.x, this.pseongjun.y - 38);
            this.pseongjunQuestIcon.setVisible(ready && devLettersUnlocked && !hasLetter);
        }
    }
}

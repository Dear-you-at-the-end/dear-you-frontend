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
        this.load.image("dev_chair", `${assetPath}chair.png`);
        this.load.image("dev_desk", `${assetPath}desk.png`);
        this.load.image("dev_desk_l", `${assetPath}desk_l.png`);
        this.load.image("dev_desk_r", `${assetPath}desk_r.png`);
        this.load.image("dev_desk_l_alt", `${assetPath}desk1.png`);
        this.load.image("dev_desk_r_alt", `${assetPath}desk1_r.png`);
        this.load.image("dev_door_left", `${assetPath}door_left.png`);
        this.load.image("dev_door_right", `${assetPath}door_right.png`);

        const characterPath = `${commonPath}character/`;
        this.load.atlas(
            "main_character",
            `${characterPath}main_character.png`,
            `${characterPath}main_character.json`
        );
    }

    create() {
        const pixelScale = 2.6;

        this.cameras.main.setBackgroundColor("#222222");
        this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

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

        // Board (Top Center)
        const board = decor.create(MAP_WIDTH / 2, wallY - 10, "dev_board");
        board.setScale(pixelScale * 1.5);
        board.setDepth(1.6);


        // 3. Desks Layout
        const createDeskRow = (y) => {
            // Groups positions (Center X)
            // Left Group: 2 desks
            // Center Group: 6 desks
            // Right Group: 2 desks

            // Adjust spacing based on width 1400
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

            const placeSequence = (cx, types) => {
                const totalWidth = types.reduce((acc, type) => {
                    const tex = this.textures.get(assetName(type)).getSourceImage();
                    return acc + tex.width * pixelScale;
                }, 0);

                let currentX = cx - totalWidth / 2;

                types.forEach(type => {
                    const key = pickDeskKey(type);
                    const tex = this.textures.get(key).getSourceImage();
                    const w = tex.width * pixelScale;
                    const h = tex.height * pixelScale;

                    const posX = currentX + w / 2;
                    const posY = y;

                    const desk = obstactles.create(posX, posY, key);
                    desk.setScale(pixelScale);
                    desk.refreshBody();
                    desk.body.setSize(w, h * 0.5); // Collision on bottom half
                    desk.body.setOffset(0, h * 0.5);
                    desk.setDepth(posY);

                    // Add chair
                    const chair = decor.create(posX, posY + 16, "dev_chair");
                    chair.setScale(pixelScale);
                    chair.setDepth(posY + 16);

                    currentX += w;
                });
            };

            // Left: L, R (flush to wall)
            placeSequence(leftGroupX, leftTypes);

            // Center: L, R, C, C, L, R
            placeSequence(centerGroupX, centerTypes);

            // Right: L, R (flush to wall)
            placeSequence(rightGroupX, rightTypes);
        };

        // Row positions
        const startDeskY = floorTop + 110;
        const rowGap = 140;

        createDeskRow(startDeskY);
        createDeskRow(startDeskY + rowGap);
        createDeskRow(startDeskY + rowGap * 2);

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
        this.cameras.main.setZoom(1.8);

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

        // Animations
        this.createPlayerAnimations();
        this.lastDirection = "down";
        this.player.anims.play("idle-down");
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
    }
}

import Phaser from "phaser";

const canvasWidth = 800;
const canvasHeight = 600;
const directionOrder = ["down", "right", "up", "left"];
const rowIndexByDir = {
    down: 0,
    right: 2,
    left: 3,
    up: 4,
};
const spriteFrame = {
    size: 20,
    spacing: 0,
    margin: 0,
};

export default class Room103Scene extends Phaser.Scene {
    constructor() {
        super({ key: "Room103" });
    }

    init(data) {
        // Can receive data from hallway if needed
        this.gameStateRef = data?.gameStateRef || null;
    }

    preload() {
        const dormitoryPath = "/assets/dormitory/";
        const commonPath = "/assets/common/";

        // Room assets
        this.load.image("floor", `${dormitoryPath}tile.png`);
        this.load.image("tile2", `${dormitoryPath}tile2.png`);
        this.load.image("wall", `${dormitoryPath}wall.png`);
        this.load.image("outline_top", `${dormitoryPath}outline_top.png`);
        this.load.image("outline_side", `${dormitoryPath}outline_side.png`);
        this.load.image("bed", `${dormitoryPath}bed.png`);
        this.load.image("closet", `${dormitoryPath}closet.png`);
        this.load.image("deskl", `${dormitoryPath}deskl.png`);
        this.load.image("deskr", `${dormitoryPath}deskr.png`);
        this.load.image("door", `${dormitoryPath}door.png`);
        this.load.image("door_inside", `${dormitoryPath}door_inside.png`);
        this.load.image("window", `${dormitoryPath}window.png`);
        this.load.image("quest_icon", `${commonPath}quest_icon2.png`);
        this.load.image("happy_icon", `${commonPath}happy.png`);
        this.load.image("letter_icon", `${commonPath}letter.png`);
        this.load.image("letter_written", `${commonPath}letter_wirte.png`);

        // Player character sprites
        const characterPath = `${commonPath}character/`;
        const spriteConfig = {
            frameWidth: spriteFrame.size,
            frameHeight: spriteFrame.size,
            margin: spriteFrame.margin,
            spacing: spriteFrame.spacing,
        };

        this.load.spritesheet("player_walk", `${characterPath}16x16 Walk-Sheet.png`, spriteConfig);
        this.load.spritesheet("player_run", `${characterPath}16x16 Run-Sheet.png`, spriteConfig);
        this.load.spritesheet("player_jump", `${characterPath}16x16 Jump-Sheet.png`, spriteConfig);
        this.load.spritesheet("player_idle", `${characterPath}16x16 Idle-Sheet.png`, spriteConfig);
    }

    create() {
        const pixelScale = 3;
        const roomW = 380;
        const roomH = 450;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const startX = centerX - roomW / 2;
        const startY = centerY - roomH / 2;

        this.physics.world.setBounds(startX, startY, roomW, roomH);

        // Floor
        this.add
            .tileSprite(centerX, centerY, roomW, roomH, "floor")
            .setTileScale(pixelScale)
            .setDepth(0);

        // Wall
        this.add
            .tileSprite(centerX, startY + 65, roomW, 120, "wall")
            .setTileScale(pixelScale)
            .setDepth(1);

        // Create wall collision barriers (all 4 sides)
        const walls = this.physics.add.staticGroup();

        // Top wall
        const topWall = walls.create(centerX, startY + 60, null);
        topWall.setSize(roomW, 120).setVisible(false).refreshBody();

        // Bottom wall
        const bottomWall = walls.create(centerX, startY + roomH, null);
        bottomWall.setSize(roomW, 10).setVisible(false).refreshBody();

        // Left wall
        const leftWall = walls.create(startX, centerY, null);
        leftWall.setSize(10, roomH).setVisible(false).refreshBody();

        // Right wall
        const rightWall = walls.create(startX + roomW, centerY, null);
        rightWall.setSize(10, roomH).setVisible(false).refreshBody();

        // Top shoe rack area
        const shoeRackTopW = 100;
        const shoeRackTopH = 40;
        this.add
            .tileSprite(centerX, startY + 55, shoeRackTopW, shoeRackTopH, "tile2")
            .setTileScale(pixelScale)
            .setDepth(0);

        // Furniture setup
        const obstacles = this.physics.add.staticGroup();
        const createFurniture = ({ x, y, texture, scaleX = 1, scaleY = 1 }) => {
            const furniture = obstacles.create(x, y, texture);
            furniture.setScale(pixelScale * scaleX, pixelScale * scaleY);
            furniture.refreshBody();
            furniture.setDepth(Math.round(furniture.y));
            return furniture;
        };

        const marginX = 75;
        const leftX = startX + marginX;
        const rightX = startX + roomW - marginX;

        // Y positions for 4 rows
        const row1Y = startY + 135;
        const row2Y = startY + 215;
        const row3Y = startY + 295;
        const row4Y = startY + 375;

        // Left side furniture
        createFurniture({ x: leftX, y: row1Y, texture: "deskl", scaleX: 1 });
        createFurniture({ x: leftX, y: row2Y, texture: "bed", scaleX: 0.85 });
        createFurniture({ x: leftX, y: row3Y, texture: "closet", scaleX: 1 });
        createFurniture({ x: leftX, y: row4Y, texture: "closet", scaleX: 1 });

        // Right side furniture
        createFurniture({ x: rightX, y: row1Y, texture: "deskr", scaleX: 1 });
        createFurniture({ x: rightX, y: row2Y, texture: "deskr", scaleX: 1 });
        createFurniture({ x: rightX, y: row3Y, texture: "bed", scaleX: 0.85 });
        createFurniture({ x: rightX, y: row4Y, texture: "closet", scaleX: 1 });

        // Outlines
        const outlineTopH =
            this.textures.get("outline_top").getSourceImage().height * pixelScale;
        const outlineSideW =
            this.textures.get("outline_side").getSourceImage().width * pixelScale;
        const outlineW = roomW + outlineSideW * 2;
        const outlineDepth = 9999;

        this.add
            .tileSprite(centerX, startY, outlineW, outlineTopH, "outline_top")
            .setOrigin(0.5, 1)
            .setTileScale(pixelScale)
            .setDepth(outlineDepth);
        this.add
            .tileSprite(centerX, startY + roomH, outlineW, outlineTopH, "outline_top")
            .setOrigin(0.5, 0)
            .setTileScale(pixelScale)
            .setFlipY(true)
            .setDepth(outlineDepth);
        this.add
            .tileSprite(startX, centerY, outlineSideW, roomH, "outline_side")
            .setOrigin(1, 0.5)
            .setTileScale(pixelScale)
            .setDepth(outlineDepth)
            .setFlipX(true);
        this.add
            .tileSprite(startX + roomW, centerY, outlineSideW, roomH, "outline_side")
            .setOrigin(0, 0.5)
            .setTileScale(pixelScale)
            .setDepth(outlineDepth);

        // Create player animations
        this.createPlayerAnimations();

        // Bottom shoe rack area
        const shoeRackW = 120;
        const shoeRackH = 40;
        this.add
            .tileSprite(centerX, startY + roomH - 20, shoeRackW, shoeRackH, "tile2")
            .setTileScale(pixelScale)
            .setDepth(0);

        // Door inside
        this.doorInside = this.add
            .image(centerX, startY + roomH, "door_inside")
            .setOrigin(0.5, 1)
            .setScale(pixelScale)
            .setDepth(startY + roomH);

        // Exit door
        this.door = this.add
            .image(centerX, startY + roomH - 20, "door")
            .setScale(pixelScale)
            .setDepth(startY + roomH - 20);

        // Exit text
        this.exitText = this.add.text(centerX, startY + roomH - 60, "Press SPACE", {
            fontSize: "22px",
            fontFamily: "Galmuri",
            color: "#C49A6C",
            backgroundColor: "#000000",
            padding: { x: 4, y: 4 }
        }).setOrigin(0.5).setDepth(99999).setVisible(false);

        // NPC
        this.npc = this.physics.add.staticSprite(
            leftX + 70,
            row2Y + 10,
            "player_idle",
            0
        );
        this.npc.setScale(pixelScale);
        this.npc.setDepth(this.npc.y);
        this.npc.refreshBody();
        this.npc.anims.play("idle-right");

        // Quest icon
        this.questIcon = this.add.image(this.npc.x, this.npc.y - 40, "quest_icon");
        this.questIcon.setScale(pixelScale * 0.6);
        this.questIcon.setDepth(99999);
        this.questIcon.setVisible(false);

        this.happyIcon = this.add.image(this.npc.x, this.npc.y - 40, "happy_icon");
        this.happyIcon.setScale(pixelScale * 0.6);
        this.happyIcon.setDepth(99999);
        this.happyIcon.setVisible(false);
        this.happyTimer = null;
        this.prevRight = false;

        // Player
        this.player = this.physics.add.sprite(
            centerX,
            centerY + 50,
            "player_idle",
            0
        );
        this.player.setScale(pixelScale).setCollideWorldBounds(true);
        this.player.body.setSize(10, 8).setOffset(5, 12);

        this.physics.add.collider(this.player, obstacles);
        this.physics.add.collider(this.player, this.npc);
        this.physics.add.collider(this.player, walls);

        this.player.anims.play("idle-down");

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.lastDirection = "down";
        this.isJumping = false;
        this.jumpTween = null;
        this.jumpHeight = 8;
        this.jumpDuration = 140;
    }

    createPlayerAnimations() {
        const getFramesPerRow = (textureKey) => {
            const source = this.textures.get(textureKey).getSourceImage();
            const denom = spriteFrame.size + spriteFrame.spacing;
            const numer = source.width - spriteFrame.margin * 2 + spriteFrame.spacing;
            return Math.max(1, Math.floor(numer / denom));
        };

        const createDirectionalAnims = ({ action, textureKey, frameRate, repeat }) => {
            const framesPerRow = getFramesPerRow(textureKey);
            directionOrder.forEach((dir) => {
                const rowIndex = rowIndexByDir[dir];
                const start = rowIndex * framesPerRow;
                const end = start + framesPerRow - 1;

                // Check if animation already exists
                if (!this.anims.exists(`${action}-${dir}`)) {
                    this.anims.create({
                        key: `${action}-${dir}`,
                        frames: this.anims.generateFrameNumbers(textureKey, { start, end }),
                        frameRate,
                        repeat,
                    });
                }
            });
        };

        createDirectionalAnims({
            action: "idle",
            textureKey: "player_idle",
            frameRate: 4,
            repeat: -1,
        });
        createDirectionalAnims({
            action: "walk",
            textureKey: "player_walk",
            frameRate: 10,
            repeat: -1,
        });
        createDirectionalAnims({
            action: "run",
            textureKey: "player_run",
            frameRate: 14,
            repeat: -1,
        });
        createDirectionalAnims({
            action: "jump",
            textureKey: "player_jump",
            frameRate: 10,
            repeat: 0,
        });
    }

    startJump() {
        if (!this.player || this.isJumping) return;
        this.isJumping = true;

        if (this.jumpTween) {
            this.jumpTween.stop();
            this.jumpTween = null;
        }

        const startY = this.player.y;
        this.player.body.setVelocity(0);
        this.player.anims.play(`jump-${this.lastDirection}`, true);

        this.jumpTween = this.tweens.add({
            targets: this.player,
            y: startY - this.jumpHeight,
            duration: this.jumpDuration,
            yoyo: true,
            ease: "Quad.out",
            onComplete: () => {
                this.isJumping = false;
                this.player.y = startY;
                this.jumpTween = null;
            },
        });
    }

    update() {
        if (!this.player) return;

        // Check if player is near exit door
        const isNearDoor = this.door && Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.door.x,
            this.door.y
        ) < 50;

        // Door exit interaction
        if (isNearDoor) {
            this.exitText.setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                // Return to hallway at door 103 position
                this.scene.start('Hallway', { x: 1000, y: 450 });
                return;
            }
        } else {
            this.exitText.setVisible(false);
        }

        // NPC interaction (simplified version without gameStateRef)
        const isNearNPC = this.npc && Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.npc.x,
            this.npc.y
        ) < 60;

        if (isNearNPC) {
            this.questIcon.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                console.log("NPC interaction - minigame would open here");
                // gameStateRef.current.setShowMiniGame(true) would be called here
            }
        } else {
            // Jump only when not near NPC or door
            if (!isNearDoor && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.startJump();
            }
        }

        if (this.isJumping) {
            this.player.body.setVelocity(0);
            this.player.setDepth(this.player.y);
            return;
        }

        // Movement
        const isRunning = this.shiftKey.isDown;
        const speed = isRunning ? 200 : 100;
        const animPrefix = isRunning ? "run" : "walk";

        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
            this.player.anims.play(`${animPrefix}-left`, true);
            this.lastDirection = "left";
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
            this.player.anims.play(`${animPrefix}-right`, true);
            this.lastDirection = "right";
        } else if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-speed);
            this.player.anims.play(`${animPrefix}-up`, true);
            this.lastDirection = "up";
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(speed);
            this.player.anims.play(`${animPrefix}-down`, true);
            this.lastDirection = "down";
        } else {
            this.player.anims.play(`idle-${this.lastDirection}`, true);
        }

        this.player.setDepth(this.player.y);
    }
}

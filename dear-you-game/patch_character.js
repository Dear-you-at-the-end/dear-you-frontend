import fs from 'fs';

const filePath = 'src/App.jsx';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Replace Preload Logic
    // Re-identifying the block more loosely to handle variations
    const idxStart = content.indexOf('const characterPath = `${commonPath}character/`;');
    // Finding the last spritesheet load
    const idxEnd = content.lastIndexOf('this.load.spritesheet("player_idle", `${characterPath}16x16 Idle-Sheet.png`, spriteConfig);');

    if (idxStart !== -1 && idxEnd !== -1) {
        // Find end of the line
        const fullEnd = content.indexOf(';', idxEnd) + 1;

        const newBlock = `
      this.load.atlas("main_character", \`\${commonPath}character/main_character.png\`, \`\${commonPath}character/main_character.json\`);
      `;

        content = content.substring(0, idxStart) + newBlock + content.substring(fullEnd);
        console.log("Replaced preload logic.");
    } else {
        console.log("Could not find preload logic to replace.");
        // debug
        // console.log(idxStart, idxEnd);
    }

    // 2. Replace Animation Logic
    const animStartMarker = 'const getFramesPerRow = (textureKey) => {';
    const animEndMarker = `createDirectionalAnims({
        action: "jump",
        textureKey: "player_jump",
        frameRate: 10,
        repeat: 0,
      });`;

    const idxAnimStart = content.indexOf(animStartMarker);
    const idxAnimEnd = content.indexOf(animEndMarker);

    if (idxAnimStart !== -1 && idxAnimEnd !== -1) {
        const fullAnimEnd = content.indexOf(';', idxAnimEnd) + 2; // +2 for safety newline
        const newAnims = `
      // Idle
      this.anims.create({ key: 'idle-down', frames: this.anims.generateFrameNames('main_character', { start: 0, end: 3, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 4, repeat: -1 });
      this.anims.create({ key: 'idle-left', frames: this.anims.generateFrameNames('main_character', { start: 4, end: 7, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 4, repeat: -1 });
      this.anims.create({ key: 'idle-right', frames: this.anims.generateFrameNames('main_character', { start: 8, end: 11, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 4, repeat: -1 });
      this.anims.create({ key: 'idle-up', frames: this.anims.generateFrameNames('main_character', { start: 0, end: 3, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 4, repeat: -1 }); 

      // Walk
      this.anims.create({ key: 'walk-down', frames: this.anims.generateFrameNames('main_character', { start: 12, end: 15, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: 'walk-right', frames: this.anims.generateFrameNames('main_character', { start: 16, end: 19, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: 'walk-left', frames: this.anims.generateFrameNames('main_character', { start: 20, end: 23, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: 'walk-up', frames: this.anims.generateFrameNames('main_character', { start: 24, end: 27, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 10, repeat: -1 });

      // Run
      this.anims.create({ key: 'run-right', frames: this.anims.generateFrameNames('main_character', { start: 28, end: 33, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 14, repeat: -1 });
      this.anims.create({ key: 'run-left', frames: this.anims.generateFrameNames('main_character', { start: 34, end: 39, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 14, repeat: -1 });
      this.anims.create({ key: 'run-down', frames: this.anims.generateFrameNames('main_character', { start: 12, end: 15, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 14, repeat: -1 });
      this.anims.create({ key: 'run-up', frames: this.anims.generateFrameNames('main_character', { start: 24, end: 27, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 14, repeat: -1 });

      // Jump (Fallback)
      this.anims.create({ key: 'jump-down', frames: this.anims.generateFrameNames('main_character', { start: 0, end: 0, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 10, repeat: 0 });
      this.anims.create({ key: 'jump-left', frames: this.anims.generateFrameNames('main_character', { start: 4, end: 4, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 10, repeat: 0 });
      this.anims.create({ key: 'jump-right', frames: this.anims.generateFrameNames('main_character', { start: 8, end: 8, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 10, repeat: 0 });
      this.anims.create({ key: 'jump-up', frames: this.anims.generateFrameNames('main_character', { start: 0, end: 0, prefix: '16x16 All Animations ', suffix: '.aseprite' }), frameRate: 10, repeat: 0 });
      `;
        content = content.substring(0, idxAnimStart) + newAnims + content.substring(fullAnimEnd);
        console.log("Replaced animation logic.");
    } else {
        console.log("Could not find animation logic markers");
    }

    // 3. Replace Texture Keys and Sprite Creation

    // NPC creation
    // this.npcs.create(npcData.x, npcData.y, "player_idle", 0);
    content = content.replace(/this\.npcs\.create\(npcData\.x, npcData\.y, "player_idle", 0\)/g, 'this.npcs.create(npcData.x, npcData.y, "main_character", "16x16 All Animations 0.aseprite")');

    // Player creation
    const playerRegex = /this\.player = this\.physics\.add\.sprite\(\s*spawnX,\s*spawnY,\s*"player_idle",\s*0\s*\);/;
    if (playerRegex.test(content)) {
        content = content.replace(playerRegex, `this.player = this.physics.add.sprite(
        spawnX,
        spawnY,
        "main_character",
        "16x16 All Animations 0.aseprite"
      );`);
        console.log("Replaced player creation");
    } else {
        console.log("Could not find player creation");
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Success");

} catch (e) {
    console.error(e);
}

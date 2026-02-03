import fs from 'fs';

const filePath = 'src/App.jsx';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Identify Start: line containing "getFramesPerRow = (textureKey)"
    const startIdx = content.indexOf('const getFramesPerRow = (textureKey)');

    // Identify End: Look for "action: \"jump\"" and then the closing parentheses/brace for that block
    const jumpActionIdx = content.indexOf('action: "jump"');

    if (startIdx !== -1 && jumpActionIdx !== -1) {
        // Find the end of the jump animation block
        // It should be });
        const endBlockIdx = content.indexOf('});', jumpActionIdx);

        if (endBlockIdx !== -1) {
            const replacement = `
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

            content = content.substring(0, startIdx) + replacement + content.substring(endBlockIdx + 3);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log("Patched animations.");
        } else {
            console.log("Could not find end of jump block.");
        }
    } else {
        console.log("Could not find start or jump action.");
    }

} catch (e) {
    console.error(e);
}

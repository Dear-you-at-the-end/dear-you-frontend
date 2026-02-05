import fs from 'fs';
const filePath = 'c:/Users/gram14/Desktop/haeun/camp/Week4/dear-you-frontend/dear-you-game/src/App.jsx';

try {
    const buffer = fs.readFileSync(filePath);
    let content;
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        content = buffer.toString('utf16le', 2);
    } else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
        content = buffer.toString('utf16be', 2);
    } else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        content = buffer.toString('utf8', 3);
    } else {
        content = buffer.toString('utf8');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('App.jsx has been re-saved as UTF-8 without BOM.');
} catch (err) {
    console.error('Error repairing file:', err);
}

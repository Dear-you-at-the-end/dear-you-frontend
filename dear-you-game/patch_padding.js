import fs from 'fs';
const path = 'src/App.jsx';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Search for the specific lines to replace
    // We want to replace the + 20 values with + 36 (and width/height adj)

    const targetTop = 'top: `${letterPaper.padTop + 20}px`,';
    const targetLeft = 'left: `${letterPaper.padX + 20}px`,';
    const targetWidth = 'width: `${letterPaper.width - letterPaper.padX * 2 - 20}px`,';
    const targetHeight = 'height: `${letterPaper.height - letterPaper.padTop - letterPaper.padBottom - 20}px`,';

    if (content.indexOf(targetTop) !== -1) {
        content = content.replace(targetTop, 'top: `${letterPaper.padTop + 36}px`,');
        content = content.replace(targetLeft, 'left: `${letterPaper.padX + 36}px`,');
        content = content.replace(targetWidth, 'width: `${letterPaper.width - letterPaper.padX * 2 - 72}px`,');
        content = content.replace(targetHeight, 'height: `${letterPaper.height - letterPaper.padTop - letterPaper.padBottom - 72}px`,');

        fs.writeFileSync(path, content, 'utf8');
        console.log("Success");
    } else {
        console.log("Not found");
        // Debug: print what is at line 1153 approx
        const lines = content.split('\n');
        // find line containing just "top:"
        const idx = lines.findIndex(l => l.includes('top: `${letterPaper.padTop'));
        if (idx !== -1) {
            console.log("Found line at " + idx + ": " + lines[idx]);
        }
        process.exit(1);
    }
} catch (e) {
    console.error(e);
    process.exit(1);
}

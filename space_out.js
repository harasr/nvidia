const fs = require('fs');
let content = fs.readFileSync('src/data/defaultLevels.ts', 'utf-8');

// Increase all x coordinates by a factor of 1.5 to increase the distance
content = content.replace(/x:\s*(\d+)/g, (match, p1) => {
    return `x: ${Math.floor(parseInt(p1) * 1.5)}`;
});

// Update song titles and BPMs
content = content.replace(/songTitle:\s*'[^']+'/g, "songTitle: 'Nơi Này Có Anh'");
content = content.replace(/bpm:\s*\d+/g, "bpm: 105");

fs.writeFileSync('src/data/defaultLevels.ts', content);
console.log('Updated defaultLevels.ts');

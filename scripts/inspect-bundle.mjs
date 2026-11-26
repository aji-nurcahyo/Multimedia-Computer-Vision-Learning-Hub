import fs from 'node:fs';

const content = fs.readFileSync('dist/assets/index-B0Crc7hO.js', 'utf8');

const idx = content.indexOf('const z2=');
console.log('z2 declaration:', content.slice(idx, idx + 400));

// Check if z2 has chapter-36
const ch36Index = content.indexOf('chapter-36/slides.json', idx);
console.log('Is chapter-36/slides.json in z2?', ch36Index !== -1);

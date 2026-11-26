import fs from 'node:fs';

const content = fs.readFileSync('dist/assets/index-B0Crc7hO.js', 'utf8');

const search = '../../content/chapters/chapter-01/slides.json';
const idx = content.indexOf(search);

// Find the beginning of this object: find the closest { before idx
const objStart = content.lastIndexOf('{', idx);
console.log('Object start at', objStart, 'content before:', content.slice(Math.max(0, objStart - 100), objStart + 50));

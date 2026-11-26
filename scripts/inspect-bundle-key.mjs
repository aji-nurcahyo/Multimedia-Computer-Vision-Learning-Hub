import fs from 'node:fs';

const content = fs.readFileSync('dist/assets/index-B0Crc7hO.js', 'utf8');

// Find chapter-36/slides.json in the jsonFiles map
const search = '../../content/chapters/chapter-36/slides.json';
const idx = content.indexOf(search);
console.log('Search index:', idx);
if (idx !== -1) {
  const slice = content.slice(idx, idx + search.length + 30);
  console.log('Key-value slice:', slice);
}

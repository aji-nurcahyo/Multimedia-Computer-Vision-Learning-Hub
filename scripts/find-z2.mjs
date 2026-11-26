import fs from 'node:fs';

const content = fs.readFileSync('dist/assets/index-B0Crc7hO.js', 'utf8');

const idx = content.indexOf('Tr(s,o)');
console.log('Context before Tr(s,o):', content.slice(Math.max(0, idx - 500), idx));

import fs from 'node:fs';

const content = fs.readFileSync('dist/assets/index-B0Crc7hO.js', 'utf8');

const regexes = [
  /const\s+Rb\s*=\s*/,
  /var\s+Rb\s*=\s*/,
  /let\s+Rb\s*=\s*/,
  /Rb\s*=\s*\[/,
  /Rb\s*=\s*JSON\.parse/
];

for (const r of regexes) {
  const m = content.match(r);
  if (m) {
    const idx = m.index;
    console.log('Found with', r, 'at', idx, 'context:', content.slice(idx, idx + 200));
  }
}

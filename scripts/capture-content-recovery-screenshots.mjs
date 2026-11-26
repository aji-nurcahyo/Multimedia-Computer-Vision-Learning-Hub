import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync('docs/screenshots')) {
  fs.mkdirSync('docs/screenshots', { recursive: true });
}

const targets = [
  { name: 'cr01-chapter-01-reading', url: 'http://127.0.0.1:5174/#/chapter/01/reading', w: 1440, h: 900 },
  { name: 'cr01-chapter-01-slides', url: 'http://127.0.0.1:5174/#/chapter/01/slides', w: 1440, h: 900 },
  { name: 'cr01-chapter-10-reading', url: 'http://127.0.0.1:5174/#/chapter/10/reading', w: 1440, h: 900 },
  { name: 'cr01-chapter-36-slides', url: 'http://127.0.0.1:5174/#/chapter/36/slides', w: 1440, h: 900 },
  { name: 'cr01-chapter-41-slides', url: 'http://127.0.0.1:5174/#/chapter/41/slides', w: 1440, h: 900 },
  { name: 'cr01-chapter-46-reading', url: 'http://127.0.0.1:5174/#/chapter/46/reading', w: 1440, h: 900 },
  { name: 'cr01-chapter-60-slides', url: 'http://127.0.0.1:5174/#/chapter/60/slides', w: 1440, h: 900 },
  { name: 'cr01-advanced-adv01', url: 'http://127.0.0.1:5174/#/advanced/adv-01', w: 1440, h: 900 },
  { name: 'cr01-advanced-adv04', url: 'http://127.0.0.1:5174/#/advanced/adv-04', w: 1440, h: 900 },
  { name: 'cr01-research-r01', url: 'http://127.0.0.1:5174/#/research/r01', w: 1440, h: 900 },
  { name: 'cr01-research-r04', url: 'http://127.0.0.1:5174/#/research/r04', w: 1440, h: 900 },
];

console.log('Capturing CR-01 content recovery visual verification screenshots...');

for (const t of targets) {
  const outPath = path.resolve('docs/screenshots', `${t.name}.png`);
  const cmd = `"${chromePath}" --headless=new --screenshot="${outPath}" --window-size=${t.w},${t.h} --virtual-time-budget=6000 "${t.url}"`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    const exists = fs.existsSync(outPath);
    const size = exists ? fs.statSync(outPath).size : 0;
    console.log(`[PASS] ${t.name}: ${exists ? `${size} bytes` : 'FAILED'}`);
  } catch (err) {
    console.error(`[FAIL] ${t.name}: ${err.message}`);
  }
}

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync('docs/screenshots')) {
  fs.mkdirSync('docs/screenshots', { recursive: true });
}

const targets = [
  { name: 'roadmap-overview', url: 'http://127.0.0.1:5174/#roadmap', w: 1440, h: 900 },
  { name: 'roadmap-diagram-graf-r01', url: 'http://127.0.0.1:5174/#roadmap/r01?view=graph', w: 1440, h: 900 },
  { name: 'roadmap-diagram-graf-r04', url: 'http://127.0.0.1:5174/#roadmap/r04?view=graph', w: 1440, h: 900 },
  { name: 'roadmap-diagram-graf-adv04', url: 'http://127.0.0.1:5174/#roadmap/adv-04?view=graph', w: 1440, h: 900 },
  { name: 'roadmap-diagram-graf-ch41', url: 'http://127.0.0.1:5174/#roadmap/ch-41?view=graph', w: 1440, h: 900 },
  { name: 'roadmap-focus-r04-desktop', url: 'http://127.0.0.1:5174/#roadmap/r04', w: 1440, h: 900 },
  { name: 'roadmap-focus-r01-desktop', url: 'http://127.0.0.1:5174/#roadmap/r01', w: 1440, h: 900 },
  { name: 'roadmap-focus-adv04-desktop', url: 'http://127.0.0.1:5174/#roadmap/adv-04', w: 1440, h: 900 },
  { name: 'roadmap-focus-ch41-desktop', url: 'http://127.0.0.1:5174/#roadmap/ch-41', w: 1440, h: 900 }
];

console.log('Capturing visual verification screenshots...');

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

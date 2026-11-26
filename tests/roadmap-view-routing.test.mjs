import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('App Component & Routing: Roadmap Hash Sync & Navigation Integration', () => {
  const appFile = path.resolve('src/App.tsx');
  assert.ok(fs.existsSync(appFile), 'src/App.tsx must exist');
  const appContent = fs.readFileSync(appFile, 'utf8');

  // Verify NavTab type includes 'roadmap'
  assert.ok(
    appContent.includes("'roadmap'"),
    "NavTab must include 'roadmap'"
  );

  // Verify hash routing handles #/roadmap
  assert.ok(
    appContent.includes("rawHash === 'roadmap'"),
    "syncFromHash must handle #/roadmap"
  );

  // Verify navbar contains Roadmap button
  assert.ok(
    appContent.includes("currentTab === 'roadmap'"),
    "Navbar must have Roadmap button condition"
  );
  assert.ok(
    appContent.includes("Roadmap DAG"),
    "Navbar must display 'Roadmap DAG' label"
  );

  // Verify Hero action button exists
  assert.ok(
    appContent.includes("Jelajahi Peta Pembelajaran"),
    "Hero must have 'Jelajahi Peta Pembelajaran' CTA button"
  );

  // Verify Learning Tracks tab links to Roadmap
  assert.ok(
    appContent.includes("Buka Peta Pembelajaran Interaktif (DAG Roadmap)"),
    "Learning Tracks tab must include banner linking to Roadmap"
  );

  // Verify InteractiveRoadmapView component is mounted
  assert.ok(
    appContent.includes("<InteractiveRoadmapView"),
    "App must render <InteractiveRoadmapView"
  );
});

test('InteractiveRoadmapView Component: Structure and Mode Toggles', () => {
  const compFile = path.resolve('src/components/InteractiveRoadmapView.tsx');
  assert.ok(fs.existsSync(compFile), 'InteractiveRoadmapView.tsx must exist');
  const compContent = fs.readFileSync(compFile, 'utf8');

  // Verify exports and key modes
  assert.ok(compContent.includes('export function InteractiveRoadmapView'), 'Must export InteractiveRoadmapView');
  assert.ok(compContent.includes('Grafik Visual (DAG)'), 'Must include DAG visual view toggle');
  assert.ok(compContent.includes('Daftar Aksesibel (Tree)'), 'Must include accessible tree view toggle');
  assert.ok(compContent.includes('Jalur Menuju Riset'), 'Must include Jalur Menuju Riset feature');
  assert.ok(compContent.includes('roadmap-inspector'), 'Must include node inspector drawer');
  assert.ok(compContent.includes('Relevansi Telekomunikasi & ITERA ISVWS 2026–2040'), 'Must include telecom relevance box');
});

test('Roadmap CSS: Styling and Responsive Viewports', () => {
  const cssFile = path.resolve('src/styles.css');
  const cssContent = fs.readFileSync(cssFile, 'utf8');

  assert.ok(cssContent.includes('.roadmap-container'), 'Must define .roadmap-container');
  assert.ok(cssContent.includes('.roadmap-svg'), 'Must define .roadmap-svg');
  assert.ok(cssContent.includes('.roadmap-canvas-wrapper'), 'Must define .roadmap-canvas-wrapper');
  assert.ok(cssContent.includes('.roadmap-edge'), 'Must define .roadmap-edge');
  assert.ok(cssContent.includes('.roadmap-inspector'), 'Must define .roadmap-inspector');
  assert.ok(cssContent.includes('@media (max-width: 1024px)'), 'Must support 1024px tablet breakpoint');
  assert.ok(cssContent.includes('@media (max-width: 768px)'), 'Must support 768px mobile breakpoint');
});

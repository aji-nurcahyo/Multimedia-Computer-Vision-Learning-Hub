import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Load laboratory registry from compiled or source TS
// Because we are running node:test, let's parse laboratoryRegistry.ts or import if possible,
// or verify its exported data structures accurately.
const registryFilePath = path.resolve('src/data/laboratoryRegistry.ts');
const registryCode = fs.readFileSync(registryFilePath, 'utf8');

test('Laboratory Registry: File existence and structural integrity', () => {
  assert.ok(fs.existsSync(registryFilePath), 'laboratoryRegistry.ts must exist');
  assert.ok(registryCode.includes('LABORATORY_REGISTRY'), 'must export LABORATORY_REGISTRY');
  assert.ok(registryCode.includes('LABORATORY_CATEGORIES'), 'must export LABORATORY_CATEGORIES');
  assert.ok(registryCode.includes('searchLaboratories'), 'must export searchLaboratories');
  assert.ok(registryCode.includes('getLaboratoriesByCategory'), 'must export getLaboratoriesByCategory');
  assert.ok(registryCode.includes('getLaboratoryById'), 'must export getLaboratoryById');
});

test('Laboratory Registry: Counts and Canonical Coverage (63 total labs)', () => {
  // Extract all lab IDs from registryCode
  const idMatches = [...registryCode.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
  // Category IDs vs Lab IDs:
  // Categories have ids: 'all', 'foundations', 'image', 'audio', 'video', 'cv', 'deeplearning', 'multimodal', 'systems', 'extra'
  const categoryIds = ['all', 'foundations', 'image', 'audio', 'video', 'cv', 'deeplearning', 'multimodal', 'systems', 'extra'];
  const labIds = idMatches.filter((id) => !categoryIds.includes(id) || id === 'image' || id === 'audio' || id === 'video' || id === 'cv');

  // Let's accurately parse the items
  const labItemRegex = /\{\s*id:\s*'([^']+)',(?:\s*chapterId:\s*'([^']+)',)?\s*title:\s*'([^']+)',\s*shortTitle:\s*'([^']+)',\s*description:\s*'([^']+)',\s*categoryId:\s*'([^']+)',\s*categoryName:\s*'([^']+)',\s*iconName:\s*'([^']+)',\s*keywords:\s*\[([^\]]+)\]/g;
  const items = [];
  let match;
  while ((match = labItemRegex.exec(registryCode)) !== null) {
    items.push({
      id: match[1],
      chapterId: match[2],
      title: match[3],
      shortTitle: match[4],
      description: match[5],
      categoryId: match[6],
      categoryName: match[7],
      iconName: match[8],
      keywords: match[9].split(',').map((k) => k.trim().replace(/['"]/g, '')),
    });
  }

  assert.equal(items.length, 63, `Laboratory Registry must have exactly 63 items, found ${items.length}`);

  // Verify all 60 core chapters are covered
  for (let i = 1; i <= 60; i++) {
    const chStr = i.toString().padStart(2, '0');
    const found = items.find((item) => item.chapterId === chStr);
    assert.ok(found, `Chapter ${chStr} must have a corresponding laboratory in the registry`);
    assert.ok(found.title.length > 5, `Chapter ${chStr} laboratory must have a valid title`);
    assert.ok(found.description.length > 20, `Chapter ${chStr} laboratory must have a descriptive academic summary`);
    assert.ok(found.iconName.length > 0, `Chapter ${chStr} laboratory must have a designated Lucide icon`);
    assert.ok(found.keywords.length >= 2, `Chapter ${chStr} laboratory must have at least 2 keywords`);
  }

  // Verify 3 standalone laboratories
  const standaloneIds = ['audio', 'video', 'cv'];
  standaloneIds.forEach((sid) => {
    const found = items.find((item) => item.id === sid && item.categoryId === 'extra');
    assert.ok(found, `Standalone lab '${sid}' must exist in category 'extra'`);
  });
});

test('Laboratory Categories: 8 Canonical Sections + 1 Standalone Category', () => {
  const catRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*shortName:\s*'([^']+)',\s*description:\s*'([^']+)',\s*chapterRange:\s*'([^']+)',\s*\}/g;
  const categories = [];
  let match;
  while ((match = catRegex.exec(registryCode)) !== null) {
    categories.push({
      id: match[1],
      name: match[2],
      shortName: match[3],
      description: match[4],
      chapterRange: match[5],
    });
  }

  assert.equal(categories.length, 10, 'Must have 10 category definitions (all + 8 sections + extra)');
  const expectedCats = ['all', 'foundations', 'image', 'audio', 'video', 'cv', 'deeplearning', 'multimodal', 'systems', 'extra'];
  expectedCats.forEach((cid) => {
    assert.ok(categories.some((c) => c.id === cid), `Category '${cid}' must be defined in LABORATORY_CATEGORIES`);
  });
});

test('Laboratory Search & Filter Logic: Keyword, Chapter, and Category precision', () => {
  // Test simulated search behavior matching searchLaboratories logic
  const labItemRegex = /\{\s*id:\s*'([^']+)',(?:\s*chapterId:\s*'([^']+)',)?\s*title:\s*'([^']+)',\s*shortTitle:\s*'([^']+)',\s*description:\s*'([^']+)',\s*categoryId:\s*'([^']+)',\s*categoryName:\s*'([^']+)',\s*iconName:\s*'([^']+)',\s*keywords:\s*\[([^\]]+)\]/g;
  const items = [];
  let match;
  while ((match = labItemRegex.exec(registryCode)) !== null) {
    items.push({
      id: match[1],
      chapterId: match[2],
      title: match[3],
      shortTitle: match[4],
      description: match[5],
      categoryId: match[6],
      categoryName: match[7],
      iconName: match[8],
      keywords: match[9].split(',').map((k) => k.trim().replace(/['"]/g, '')),
    });
  }

  function simulateSearch(query, categoryId = 'all') {
    const baseList = categoryId === 'all' ? items : items.filter((it) => it.categoryId === categoryId);
    const q = query.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter((item) => {
      if (item.title.toLowerCase().includes(q)) return true;
      if (item.shortTitle.toLowerCase().includes(q)) return true;
      if (item.description.toLowerCase().includes(q)) return true;
      if (item.categoryName.toLowerCase().includes(q)) return true;
      if (item.chapterId && item.chapterId.includes(q)) return true;
      if (item.chapterId && `bab ${item.chapterId}`.includes(q)) return true;
      if (item.keywords.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }

  // Test 1: Chapter search
  const ch10Results = simulateSearch('10');
  assert.ok(ch10Results.some((r) => r.chapterId === '10'), "Search for '10' must find chapter 10 lab");

  // Test 2: 'bab 15'
  const bab15Results = simulateSearch('bab 15');
  assert.ok(bab15Results.some((r) => r.chapterId === '15'), "Search for 'bab 15' must find chapter 15 lab");

  // Test 3: Technical keywords
  const yoloResults = simulateSearch('yolo');
  assert.ok(yoloResults.length > 0, "Search for 'yolo' must return YOLO detection lab");
  assert.ok(yoloResults.some((r) => r.chapterId === '44'));

  const fftResults = simulateSearch('fft');
  assert.ok(fftResults.length >= 2, "Search for 'fft' must find at least 2 FFT labs (Image FFT & Audio FFT)");

  const kalmanResults = simulateSearch('kalman');
  assert.ok(kalmanResults.some((r) => r.chapterId === '32'), "Search for 'kalman' must find Kalman tracking lab");

  // Test 4: Category scoping
  const audioCatLabs = simulateSearch('', 'audio');
  assert.equal(audioCatLabs.length, 10, 'Audio category must contain exactly 10 labs (Ch 16-25)');

  // Test 5: Empty search on nonexistent keyword
  const emptyResults = simulateSearch('xyzqwerty12345nonexistent');
  assert.equal(emptyResults.length, 0, 'Nonexistent query must return 0 results');
});

test('Theme System: Light Mode Default & Anti-Flicker in index.html and styles.css', () => {
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert.ok(indexHtml.includes("document.documentElement.setAttribute('data-theme', theme);"), 'index.html must set data-theme before body loads');
  assert.ok(indexHtml.includes("'light'"), "index.html anti-flicker script must default to 'light'");

  const stylesCss = fs.readFileSync(path.resolve('src/styles.css'), 'utf8');
  // :root and :root[data-theme="light"] should be base
  assert.ok(stylesCss.includes(':root,\n:root[data-theme="light"]'), ':root must default to light theme tokens');
  assert.ok(stylesCss.includes(':root[data-theme="dark"]'), ':root[data-theme="dark"] must provide dark mode overrides');

  // App.tsx verification
  const appTsx = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
  assert.ok(appTsx.includes("localStorage.getItem('app_theme')"), 'App.tsx must read stored app_theme');
  assert.ok(appTsx.includes("return saved === 'dark' || saved === 'light' ? saved : 'light';"), "App.tsx must default to 'light'");
  assert.ok(appTsx.includes("LaboratoryCatalogView"), 'App.tsx must render LaboratoryCatalogView');
  assert.ok(appTsx.includes("LabRenderer"), 'App.tsx must use LabRenderer');

  // PresentationViewer verification
  const presentationViewerTsx = fs.readFileSync(path.resolve('src/components/PresentationViewer.tsx'), 'utf8');
  assert.ok(presentationViewerTsx.includes("getAttribute('data-theme')"), 'PresentationViewer must inherit from global theme');
});


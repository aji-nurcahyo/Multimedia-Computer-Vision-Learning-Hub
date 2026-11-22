import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Navigation & Chapter 01 Redundancy Cleanup
test('UI-04 Navigation: Chapter 01 is not a permanent top-level navbar tab', () => {
  const appSrc = fs.readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf8');

  // Verify that the redundant standalone button "Modul Bab {activeChapterId}" is removed from nav-links
  assert.ok(
    !appSrc.includes('Modul Bab {activeChapterId}'),
    'App.tsx navbar must NOT contain redundant "Modul Bab {activeChapterId}" button'
  );

  // Verify top navbar has the clean, restrained hierarchy: Beranda, Core L1–L2, Learning Tracks, Advanced L3, Research L4, Laboratorium, Tentang
  assert.ok(appSrc.includes('Core L1–L2'), 'Navbar must include Core L1–L2');
  assert.ok(appSrc.includes('Advanced L3'), 'Navbar must include Advanced L3');
  assert.ok(appSrc.includes('Research L4'), 'Navbar must include Research L4');
  assert.ok(appSrc.includes('Laboratorium'), 'Navbar must include Laboratorium');
  assert.ok(appSrc.includes('Tentang'), 'Navbar must include Tentang');

  // Verify Chapter 01 remains fully accessible via "Mulai Belajar (Bab 01)"
  assert.ok(
    appSrc.includes("navigateToChapter('01')"),
    'App.tsx must provide direct navigateToChapter("01") call from CTA'
  );
  assert.ok(
    appSrc.includes('Mulai Belajar (Bab 01)'),
    'Homepage Hero must include "Mulai Belajar (Bab 01)" action'
  );
  assert.ok(
    appSrc.includes('Mulai dari Bab 01: Sinyal & Sistem Multimedia Digital') ||
    appSrc.includes('Mulai dari Bab 01: Sinyal &amp; Sistem Multimedia Digital'),
    'Core Curriculum must feature Chapter 01 Quick Start banner'
  );
});

// 2. Hash Routing and Deep-Linking Integrity
test('UI-04 Routing: Hash sync supports deep-linking for Advanced and Research', () => {
  const appSrc = fs.readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf8');

  // Verify deep-link hash handling for Advanced modules
  assert.ok(
    appSrc.includes("rawHash.startsWith('advanced/')"),
    'App.tsx must support deep linking to #/advanced/:moduleId'
  );
  assert.ok(
    appSrc.includes('setActiveAdvancedModuleId'),
    'App.tsx must maintain activeAdvancedModuleId state'
  );

  // Verify deep-link hash handling for Research tracks
  assert.ok(
    appSrc.includes("rawHash.startsWith('research/')"),
    'App.tsx must support deep linking to #/research/:trackId'
  );
  assert.ok(
    appSrc.includes('setActiveResearchTrackId'),
    'App.tsx must maintain activeResearchTrackId state'
  );

  // Verify legacy and existing routes are preserved
  assert.ok(appSrc.includes("rawHash.startsWith('playgrounds/')"), 'Must preserve #/playgrounds/:labId');
  assert.ok(appSrc.includes("rawHash.startsWith('chapter/')"), 'Must preserve #/chapter/:cid');
  assert.ok(appSrc.includes("rawHash === 'curriculum'"), 'Must preserve #/curriculum');
  assert.ok(appSrc.includes("rawHash === 'tracks'"), 'Must preserve #/tracks');
  assert.ok(appSrc.includes("rawHash === 'about'"), 'Must preserve #/about');
});

// 3. Advanced L3 Catalog & Workspace Verification
test('UI-04 Advanced Curriculum: Component supports Catalog & Workspace modes', () => {
  const advSrc = fs.readFileSync(path.join(rootDir, 'src', 'components', 'AdvancedCurriculumView.tsx'), 'utf8');

  // Verify Catalog & Workspace architecture
  assert.ok(advSrc.includes('VIEW MODE A: FOCUSED ACADEMIC WORKSPACE'), 'Must have Workspace mode');
  assert.ok(advSrc.includes('VIEW MODE B: STRUCTURED ACADEMIC CATALOG'), 'Must have Catalog mode');

  // Verify Catalog features
  assert.ok(advSrc.includes('academic-catalog-title'), 'Must use shared academic catalog title');
  assert.ok(advSrc.includes('academic-search-input'), 'Must have search input');
  assert.ok(advSrc.includes('academic-filter-btn'), 'Must have pillar filter buttons');
  assert.ok(advSrc.includes('academic-grid'), 'Must render responsive grid of module cards');
  assert.ok(advSrc.includes('Buka Modul L3'), 'Must have action to open module workspace');

  // Verify Workspace features
  assert.ok(advSrc.includes('academic-workspace-topbar'), 'Must have workspace topbar');
  assert.ok(advSrc.includes('academic-workspace-back-btn'), 'Must have back button');
  assert.ok(advSrc.includes('academic-workspace-select'), 'Must have module switcher select');
  assert.ok(advSrc.includes('academic-workspace-tabs'), 'Must have workspace tabs');
  assert.ok(advSrc.includes('Teori &amp; Fondasi Matematis'), 'Must have Theory tab');
  assert.ok(advSrc.includes('Laboratorium Interaktif'), 'Must have Interactive Lab tab');
  assert.ok(advSrc.includes('Skrip Python &amp; Algoritma'), 'Must have Python Code tab');
  assert.ok(advSrc.includes('Silabus &amp; Capaian Pembelajaran'), 'Must have Syllabus tab');

  // Verify all 8 Advanced Modules interactive labs are mapped
  const expectedLabs = [
    'SvdOptimizationExplorerLab',
    'VariationalInverseProblemLab',
    'SyntheticMotArenaLab',
    'DeformableAttentionExplorerLab',
    'MultiViewGeometryExplorerLab',
    'AdverseConditionsExplorerLab',
    'VisionFoundationAdapterLab',
    'EdgeVisionRooflineLab',
  ];
  for (const lab of expectedLabs) {
    assert.ok(advSrc.includes(lab), `AdvancedCurriculumView must import and render ${lab}`);
  }
});

// 4. Research L4 Catalog & Workspace Verification
test('UI-04 Research Tracks: Component supports Catalog & Workspace modes', () => {
  const resSrc = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ResearchTracksView.tsx'), 'utf8');

  // Verify Catalog & Workspace architecture
  assert.ok(resSrc.includes('VIEW MODE A: FOCUSED ACADEMIC WORKSPACE'), 'Must have Workspace mode');
  assert.ok(resSrc.includes('VIEW MODE B: STRUCTURED ACADEMIC CATALOG'), 'Must have Catalog mode');

  // Verify Catalog section switcher
  assert.ok(resSrc.includes('6 Jalur Riset (Tracks Explorer)'), 'Must feature Tracks Explorer section');
  assert.ok(resSrc.includes('20-Tahap Metodologi Riset'), 'Must feature Methodology section');
  assert.ok(resSrc.includes('Protokol Benchmark &amp; Metrik'), 'Must feature Protocols section');
  assert.ok(resSrc.includes('10 Template Naskah &amp; Keterulangan'), 'Must feature Templates section');

  // Verify Workspace features
  assert.ok(resSrc.includes('academic-workspace-topbar'), 'Must have workspace topbar');
  assert.ok(resSrc.includes('academic-workspace-back-btn'), 'Must have back button');
  assert.ok(resSrc.includes('academic-workspace-select'), 'Must have track switcher select');
  assert.ok(resSrc.includes('academic-workspace-tabs'), 'Must have workspace tabs');
  assert.ok(resSrc.includes('Silabus 18 Bagian &amp; Teori Riset'), 'Must have Curriculum tab');
  assert.ok(resSrc.includes('Laboratorium Riset Interaktif'), 'Must have Research Lab tab');
  assert.ok(resSrc.includes('Alur Riset Terpandu &amp; Baseline'), 'Must have Workflow tab');
  assert.ok(resSrc.includes('Protokol Tolok Ukur &amp; Metrik'), 'Must have Protocols tab');

  // Verify all 6 Research Labs are mapped
  const expectedLabs = [
    'R01DetectionResearchLab',
    'R02TrackingResearchLab',
    'R03AdversePerceptionLab',
    'R04MultimodalFusionLab',
    'R05EdgeBenchmarkLab',
    'R06SpatialVisionLab',
  ];
  for (const lab of expectedLabs) {
    assert.ok(resSrc.includes(lab), `ResearchTracksView must import and render ${lab}`);
  }
});

// 5. Shared Design System CSS Verification
test('UI-04 CSS Design System: Shared academic classes defined with dual theme support', () => {
  const css = fs.readFileSync(path.join(rootDir, 'src', 'styles.css'), 'utf8');

  const requiredClasses = [
    '.academic-catalog-header',
    '.academic-catalog-badge',
    '.academic-catalog-title',
    '.academic-catalog-subtitle',
    '.academic-catalog-stats',
    '.academic-stat-pill',
    '.academic-catalog-toolbar',
    '.academic-search-wrapper',
    '.academic-search-input',
    '.academic-filter-nav',
    '.academic-filter-btn',
    '.academic-grid',
    '.academic-card',
    '.academic-card-actions',
    '.academic-card-primary-btn',
    '.academic-workspace-topbar',
    '.academic-workspace-back-btn',
    '.academic-workspace-tabs',
    '.academic-workspace-tab-btn',
    '.academic-workspace-desc-card',
    '.academic-empty-state',
  ];

  for (const cls of requiredClasses) {
    assert.ok(css.includes(cls), `styles.css must define ${cls}`);
  }

  // Verify responsive rules for academic layout
  assert.ok(
    css.includes('.academic-workspace-topbar { flex-direction: column;'),
    'styles.css must include mobile responsive rule for academic workspace topbar'
  );
  assert.ok(
    css.includes('.academic-grid { grid-template-columns: 1fr; }'),
    'styles.css must include mobile responsive rule for academic card grid'
  );
});

// 6. Preservation of Mathematical and Content Integrity
test('UI-04 Mathematical Integrity: MarkdownRenderer is reused without secondary math parsers', () => {
  const advSrc = fs.readFileSync(path.join(rootDir, 'src', 'components', 'AdvancedCurriculumView.tsx'), 'utf8');
  const resSrc = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ResearchTracksView.tsx'), 'utf8');

  assert.ok(advSrc.includes('<MarkdownRenderer'), 'AdvancedCurriculumView must reuse MarkdownRenderer');
  assert.ok(resSrc.includes('<MarkdownRenderer'), 'ResearchTracksView must reuse MarkdownRenderer');

  // Verify neither component introduces unescaped innerHTML math
  assert.ok(!advSrc.includes('dangerouslySetInnerHTML'), 'AdvancedCurriculumView must not use raw innerHTML');
  assert.ok(!resSrc.includes('dangerouslySetInnerHTML'), 'ResearchTracksView must not use raw innerHTML');
});


import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  getAllRoadmapNodes,
  getAllRoadmapEdges,
  getRoadmapNodeById,
  traverseLearningPath,
  getMainLearningPath,
  getFocusedLearningPath
} from '../src/data/learningRoadmapData.ts';

test('AC-02C Simplified Focus Logic: Stage Segmentation for Destination R04', () => {
  const r04Path = getFocusedLearningPath('r04', 'both', 'main-path');
  assert.equal(r04Path.targetNodeId, 'r04');

  // Verify Stage 1 (Core Foundations)
  const coreNodes = r04Path.upstreamNodeIds
    .map((id) => getRoadmapNodeById(id))
    .filter((n) => n?.type === 'core');
  assert.ok(coreNodes.length >= 2, 'R04 must have core foundations in Stage 1');
  const coreIds = coreNodes.map((n) => n.id);
  assert.ok(coreIds.includes('ch-41') || coreIds.includes('ch-44') || coreIds.includes('ch-51'), 'Includes core foundational chapters');

  // Verify Stage 2 (Advanced Preparation)
  const advNodes = r04Path.upstreamNodeIds
    .map((id) => getRoadmapNodeById(id))
    .filter((n) => n?.type === 'advanced');
  assert.ok(advNodes.length >= 1, 'R04 must have advanced modules in Stage 2');
  const advCodes = advNodes.map((n) => n.code);
  assert.ok(advCodes.includes('ADV-04') || advCodes.includes('ADV-07'), 'Includes ADV-04 or ADV-07');

  // Verify Stage 3 (Destination R04)
  const targetNode = getRoadmapNodeById('r04');
  assert.ok(targetNode);
  assert.equal(targetNode.code, 'R04');
  assert.equal(targetNode.type, 'research');
  assert.ok(targetNode.title.includes('Vision-Centric') || targetNode.title.includes('Multimodal Perception'));

  // Verify Stage 4 (Downstream: Terminal Track)
  const downstreamNodes = r04Path.downstreamNodeIds;
  assert.equal(downstreamNodes.length, 0, 'R04 is terminal research track (0 downstream modules)');
});

test('AC-02C Simplified Focus Logic: Stage Segmentation for ADV-04 and Ch 41', () => {
  // 1. Destination ADV-04
  const adv04Path = getFocusedLearningPath('adv-04', 'both', 'main-path');
  const adv04UpCore = adv04Path.upstreamNodeIds
    .map((id) => getRoadmapNodeById(id))
    .filter((n) => n?.type === 'core');
  const adv04UpAdv = adv04Path.upstreamNodeIds
    .map((id) => getRoadmapNodeById(id))
    .filter((n) => n?.type === 'advanced');
  const adv04Down = adv04Path.downstreamNodeIds
    .map((id) => getRoadmapNodeById(id))
    .filter(Boolean);

  assert.ok(adv04UpCore.some((n) => n.id === 'ch-41' || n.id === 'ch-46'), 'ADV-04 requires core deep learning');
  assert.ok(adv04UpAdv.some((n) => n.id === 'adv-01'), 'ADV-04 requires ADV-01 matrix foundation');
  assert.ok(adv04Down.some((n) => n.id === 'r01' || n.id === 'r04'), 'ADV-04 unlocks research tracks');

  // 2. Destination CH-41
  const ch41Path = getFocusedLearningPath('ch-41', 'both', 'main-path');
  const ch41Down = ch41Path.downstreamNodeIds
    .map((id) => getRoadmapNodeById(id))
    .filter(Boolean);
  assert.ok(ch41Down.length > 0, 'CH-41 unlocks downstream advanced modules and research tracks');
});

test('AC-02C Component Verification: InteractiveRoadmapView.tsx implements Structured Staged View', () => {
  const compPath = path.resolve('src/components/InteractiveRoadmapView.tsx');
  const code = fs.readFileSync(compPath, 'utf8');

  // Staged View Container & Columns
  assert.ok(code.includes('roadmap-focus-staged-view'), 'Must render roadmap-focus-staged-view');
  assert.ok(code.includes('staged-path-container'), 'Must render staged-path-container');
  assert.ok(code.includes('stage-1-core'), 'Must render Stage 1: Core column');
  assert.ok(code.includes('stage-2-advanced'), 'Must render Stage 2: Advanced column');
  assert.ok(code.includes('stage-3-destination'), 'Must render Stage 3: Destination column');
  assert.ok(code.includes('stage-4-next'), 'Must render Stage 4: Next steps column');

  // Hero Card for Destination (No clipping)
  assert.ok(code.includes('staged-destination-hero-card'), 'Must render prominent unclipped hero card');
  assert.ok(code.includes('destination-hero-title'), 'Must render full destination title without truncation');
  assert.ok(code.includes('destination-stats-grid'), 'Must render key academic metrics');
  assert.ok(code.includes('destination-telecom-box'), 'Must render Telecom & ITERA ISVWS 2026-2040 relevance');

  // Directional Connectors (Replacing crisscrossing Bézier curves)
  assert.ok(code.includes('staged-connector-wrapper'), 'Must render clean directional stage connectors');
  assert.ok(code.includes('staged-connector-badge'), 'Must render directional connector badges');

  // Mode & Scope Controls
  assert.ok(code.includes('Tahapan Terstruktur'), 'Must provide Tahapan Terstruktur view mode');
  assert.ok(code.includes('Diagram Graf'), 'Must provide Diagram Graf view toggle');
  assert.ok(code.includes('Jalur Utama'), 'Must retain Jalur Utama scope button');
  assert.ok(code.includes('Semua Ketergantungan'), 'Must retain Semua Ketergantungan scope button');
  assert.ok(code.includes('Kembali ke Semua Jalur'), 'Must retain Kembali ke Semua Jalur back button');

  // Backward compatibility checks
  assert.ok(code.includes('roadmap-focus-svg'), 'Must preserve compact SVG DAG option');
  assert.ok(code.includes('roadmap-focus-col-rect'), 'Must preserve focus column rect');
});

test('AC-02C CSS Verification: styles.css contains Structured Staged Pathway rules', () => {
  const cssPath = path.resolve('src/styles.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.ok(css.includes('.roadmap-focus-staged-view'), 'Must style roadmap-focus-staged-view');
  assert.ok(css.includes('.staged-path-container'), 'Must style staged-path-container');
  assert.ok(css.includes('.staged-column'), 'Must style staged columns');
  assert.ok(css.includes('.staged-destination-hero-card'), 'Must style destination hero card');
  assert.ok(css.includes('.destination-hero-title'), 'Must style destination hero title');
  assert.ok(css.includes('.staged-connector-wrapper'), 'Must style stage connectors');
  assert.ok(css.includes('.staged-connector-badge'), 'Must style connector badges');
  assert.ok(css.includes('.destination-telecom-box'), 'Must style Telecom relevance box');
  assert.ok(css.includes('@media (max-width: 1024px)'), 'Must include responsive layout rules');
});

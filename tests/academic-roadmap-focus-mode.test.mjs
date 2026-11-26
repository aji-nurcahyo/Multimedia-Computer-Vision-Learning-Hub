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
  getFocusedLearningPath,
  computeCompactLayout
} from '../src/data/learningRoadmapData.ts';

test('AC-02B Path Distinction: Jalur Utama vs Semua Ketergantungan for ADV-04', () => {
  // 1. Jalur Utama (Main Path) - Upstream
  const mainUp = getMainLearningPath('adv-04', 'prerequisites');
  assert.equal(mainUp.targetNodeId, 'adv-04');
  assert.ok(mainUp.activeNodeIds.includes('adv-04'), 'Must include target ADV-04');
  assert.ok(mainUp.activeNodeIds.includes('adv-01'), 'Must include direct prerequisite ADV-01');
  assert.ok(mainUp.activeNodeIds.includes('ch-41'), 'Must include direct prerequisite Ch 41');
  assert.ok(mainUp.activeNodeIds.includes('ch-46'), 'Must include direct prerequisite Ch 46');
  assert.ok(mainUp.activeNodeIds.includes('ch-02'), 'Must include ADV-01 foundation Ch 02');

  // 2. Semua Ketergantungan (All Dependencies) - Upstream
  const allUp = traverseLearningPath('adv-04', 'prerequisites');

  // Academic Distinction Verification: Jalur Utama is more compact than All Dependencies
  assert.ok(
    mainUp.activeNodeIds.length <= allUp.activeNodeIds.length,
    `Jalur Utama (${mainUp.activeNodeIds.length} nodes) must be more compact than full transitive closure (${allUp.activeNodeIds.length} nodes)`
  );

  // 3. Bidirectional Jalur Utama
  const mainBoth = getMainLearningPath('adv-04', 'both');
  assert.ok(mainBoth.downstreamNodeIds.includes('r01') || mainBoth.downstreamNodeIds.includes('r04'), 'Unlocks primary research tracks');
  assert.ok(mainBoth.activeNodeIds.length <= 10, 'Jalur Utama retains tight academic focus (< 10 nodes)');
});

test('AC-02B Path Distinction: Jalur Utama for Research Track R01 and Core Ch 41', () => {
  // R01 Visual Detection
  const r01Main = getMainLearningPath('r01', 'prerequisites');
  assert.equal(r01Main.targetNodeId, 'r01');
  assert.ok(r01Main.activeNodeIds.includes('r01'));
  assert.ok(r01Main.activeNodeIds.includes('adv-04'), 'R01 requires ADV-04');
  assert.ok(r01Main.activeNodeIds.length < 12, 'R01 main path is compact and linear-to-shallow-branch');

  // Ch 41 CNN Foundations Downstream
  const ch41Main = getMainLearningPath('ch-41', 'dependents');
  assert.equal(ch41Main.targetNodeId, 'ch-41');
  assert.ok(ch41Main.activeNodeIds.includes('ch-41'));
  assert.ok(ch41Main.activeNodeIds.includes('adv-01') || ch41Main.activeNodeIds.includes('adv-04'));
});

test('AC-02B Compact Layout Engine: Clean Topological Layering & Coordinate Integrity', () => {
  const mainPath = getMainLearningPath('adv-04', 'both');
  const allEdges = getAllRoadmapEdges();
  const activeEdges = allEdges.filter((e) => mainPath.activeEdgeIds.includes(e.id));

  const layout = computeCompactLayout(mainPath.activeNodeIds, activeEdges, 'adv-04');

  assert.ok(layout.positions.size === mainPath.activeNodeIds.length, 'Every active node must have a position');
  assert.ok(layout.width >= 980 && layout.width <= 1400, `Width within standard viewport bounds (${layout.width})`);
  assert.ok(layout.height >= 540, `Height within comfortable viewport bounds (${layout.height})`);
  assert.ok(layout.layers.length >= 2, 'Must have at least 2 topological stages');

  // Check target node position
  const targetPos = layout.positions.get('adv-04');
  assert.ok(targetPos, 'Target node must be placed');
  assert.equal(targetPos.isTarget, true, 'isTarget flag must be true for adv-04');

  // Check prerequisite ordering: prerequisites must have layerIndex < target layerIndex
  mainPath.upstreamNodeIds.forEach((upId) => {
    const upPos = layout.positions.get(upId);
    assert.ok(upPos);
    assert.ok(
      upPos.layerIndex < targetPos.layerIndex,
      `Prerequisite ${upId} layer (${upPos.layerIndex}) must precede target layer (${targetPos.layerIndex})`
    );
    assert.ok(
      upPos.x < targetPos.x,
      `Prerequisite ${upId} x-coordinate (${upPos.x}) must appear to the left of target (${targetPos.x})`
    );
  });

  // Check downstream ordering: unlocks must have layerIndex > target layerIndex
  mainPath.downstreamNodeIds.forEach((downId) => {
    const downPos = layout.positions.get(downId);
    if (downPos) {
      assert.ok(
        downPos.layerIndex > targetPos.layerIndex,
        `Downstream ${downId} layer (${downPos.layerIndex}) must succeed target layer (${targetPos.layerIndex})`
      );
      assert.ok(
        downPos.x > targetPos.x,
        `Downstream ${downId} x-coordinate (${downPos.x}) must appear to the right of target (${targetPos.x})`
      );
    }
  });

  // Zero overlap invariant: no two nodes share exact same (x, y)
  const coords = new Set();
  layout.positions.forEach((pos, id) => {
    const key = `${Math.round(pos.x)},${Math.round(pos.y)}`;
    assert.equal(coords.has(key), false, `Node ${id} coordinates ${key} must not collide with another node`);
    coords.add(key);
  });
});

test('AC-02B Component Structure: InteractiveRoadmapView.tsx implements Focus Mode and Hover Preview', () => {
  const compPath = path.resolve('src/components/InteractiveRoadmapView.tsx');
  const code = fs.readFileSync(compPath, 'utf8');

  // State separation
  assert.ok(code.includes('focusedNodeId'), 'Must manage focusedNodeId for Focus Mode');
  assert.ok(code.includes('focusScope'), 'Must manage focusScope (main-path vs all-dependencies)');
  assert.ok(code.includes('isFocusMode'), 'Must derive isFocusMode flag');
  assert.ok(code.includes('isHoverPreview'), 'Must derive isHoverPreview flag');

  // Focus Mode banner & Back button
  assert.ok(code.includes('roadmap-focus-banner'), 'Must render roadmap-focus-banner');
  assert.ok(code.includes('Kembali ke Semua Jalur'), 'Must render "Kembali ke Semua Jalur" back button');
  assert.ok(code.includes('Jalur Utama'), 'Must render "Jalur Utama" scope button');
  assert.ok(code.includes('Semua Ketergantungan'), 'Must render "Semua Ketergantungan" scope button');

  // Dedicated Compact SVG
  assert.ok(code.includes('roadmap-focus-svg'), 'Must render dedicated compact Focus Mode SVG');
  assert.ok(code.includes('roadmap-focus-col-rect'), 'Must render stage columns in Focus Mode');

  // Compact Inspector
  assert.ok(code.includes('roadmap-compact-inspector'), 'Must render compact inspector bottom card in Focus Mode');
  assert.ok(code.includes('Detail Akademik'), 'Must provide "Detail Akademik" expand button');
});

test('AC-02B CSS Verification: styles.css contains Focus Mode rules', () => {
  const cssPath = path.resolve('src/styles.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.ok(css.includes('.roadmap-focus-banner'), 'Must style focus banner');
  assert.ok(css.includes('.roadmap-btn-back'), 'Must style back button');
  assert.ok(css.includes('.roadmap-scope-control'), 'Must style scope control');
  assert.ok(css.includes('.roadmap-scope-btn'), 'Must style scope buttons');
  assert.ok(css.includes('.roadmap-focus-col-rect'), 'Must style focus column rects');
  assert.ok(css.includes('.roadmap-compact-inspector'), 'Must style compact inspector card');
});

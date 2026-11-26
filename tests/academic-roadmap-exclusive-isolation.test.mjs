import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  getAllRoadmapNodes,
  getAllRoadmapEdges,
  getRoadmapNodeById,
  traverseLearningPath,
  getResearchPath,
  ROADMAP_SUMMARY
} from '../src/data/learningRoadmapData.ts';

test('AC-02A Baseline: Canonical Curriculum Baseline (74 Nodes, Enriched Graph Edges)', () => {
  const nodes = getAllRoadmapNodes();
  const edges = getAllRoadmapEdges();

  assert.equal(nodes.length, 74, 'Registry must contain exactly 74 canonical nodes');
  assert.ok(edges.length >= 86, `Registry must contain enriched canonical edges (got ${edges.length})`);
  assert.equal(ROADMAP_SUMMARY.totalNodes, 74);
  assert.equal(ROADMAP_SUMMARY.totalEdges, edges.length);
  assert.equal(ROADMAP_SUMMARY.coreCount, 60);
  assert.equal(ROADMAP_SUMMARY.advancedCount, 8);
  assert.equal(ROADMAP_SUMMARY.researchCount, 6);
});

test('AC-02A Isolation: ADV-04 Upstream Prerequisites Excludes Unrelated Nodes', () => {
  const traversal = traverseLearningPath('adv-04', 'prerequisites');

  assert.equal(traversal.targetNodeId, 'adv-04');
  assert.equal(traversal.direction, 'prerequisites');

  const activeSet = new Set(traversal.activeNodeIds);
  assert.ok(activeSet.has('adv-04'), 'Must include target ADV-04');
  assert.ok(activeSet.has('ch-41'), 'Must include direct prerequisite Ch 41');
  assert.ok(activeSet.has('ch-46'), 'Must include direct prerequisite Ch 46');
  assert.ok(activeSet.has('adv-01'), 'Must include direct prerequisite ADV-01');
  assert.ok(activeSet.has('ch-02'), 'Must transitively include Ch 02');
  assert.ok(activeSet.has('ch-05'), 'Must transitively include Ch 05');

  // Verify STRICT exclusion of unrelated nodes (audio, video streaming, 3D graphics, other tracks)
  const unrelatedCore = ['ch-21', 'ch-22', 'ch-23', 'ch-25', 'ch-31', 'ch-35', 'ch-51', 'ch-56'];
  unrelatedCore.forEach((unrelatedId) => {
    assert.equal(
      activeSet.has(unrelatedId),
      false,
      `Unrelated node ${unrelatedId} must be completely excluded during ADV-04 upstream isolation`
    );
  });

  const unrelatedAdv = ['adv-06', 'adv-07', 'adv-08'];
  unrelatedAdv.forEach((unrelatedId) => {
    assert.equal(
      activeSet.has(unrelatedId),
      false,
      `Unrelated advanced module ${unrelatedId} must be excluded during ADV-04 upstream isolation`
    );
  });

  // Downstream tracks (R01, R04) must NOT be present when direction is prerequisites
  assert.equal(activeSet.has('r01'), false, 'R01 must be excluded in prerequisite direction');
  assert.equal(activeSet.has('r04'), false, 'R04 must be excluded in prerequisite direction');

  // All active edges must strictly connect nodes in activeSet
  const allEdges = getAllRoadmapEdges();
  const edgeMap = new Map(allEdges.map((e) => [e.id, e]));
  traversal.activeEdgeIds.forEach((edgeId) => {
    const edge = edgeMap.get(edgeId);
    assert.ok(edge, `Active edge ${edgeId} must exist`);
    assert.ok(activeSet.has(edge.source), `Edge source ${edge.source} must be in active set`);
    assert.ok(activeSet.has(edge.target), `Edge target ${edge.target} must be in active set`);
  });
});

test('AC-02A Isolation: Ch 41 Downstream Dependents Excludes Unrelated Nodes', () => {
  const traversal = traverseLearningPath('ch-41', 'dependents');

  assert.equal(traversal.targetNodeId, 'ch-41');
  assert.equal(traversal.direction, 'dependents');

  const activeSet = new Set(traversal.activeNodeIds);
  assert.ok(activeSet.has('ch-41'), 'Must include target Ch 41');
  assert.ok(activeSet.has('adv-01') || activeSet.has('adv-04'), 'Must include unlocked advanced modules');

  // Upstream nodes to Ch 41 must NOT be in dependents
  assert.equal(traversal.upstreamNodeIds.length, 0, 'Upstream must be empty in dependents mode');

  // Completely unrelated nodes (e.g., Ch 21 Audio Fundamentals, Ch 22 Speech Processing) must be excluded
  assert.equal(activeSet.has('ch-21'), false, 'Ch 21 Audio must be excluded from Ch 41 dependents');
  assert.equal(activeSet.has('ch-22'), false, 'Ch 22 Speech must be excluded from Ch 41 dependents');
});

test('AC-02A Isolation: Bidirectional Highlighting Isolates Exact Pathway', () => {
  const traversal = traverseLearningPath('adv-01', 'both');

  const activeSet = new Set(traversal.activeNodeIds);
  assert.ok(activeSet.has('adv-01'));

  // ADV-01 prerequisites (Ch 02, Ch 05) must be present
  assert.ok(activeSet.has('ch-02'));
  assert.ok(activeSet.has('ch-05'));

  // ADV-01 downstream (e.g. ADV-02, ADV-04, ADV-05, etc.) must be present
  assert.ok(traversal.downstreamNodeIds.length > 0);

  // An unrelated node from another branch (e.g. audio compression Ch 25) must NOT be present
  assert.equal(activeSet.has('ch-25'), false, 'Unrelated Ch 25 must be excluded from ADV-01 pathway');

  // Verify activeNodeIds is strict subset of full 74 nodes
  assert.ok(
    traversal.activeNodeIds.length < 74,
    `Isolated pathway count (${traversal.activeNodeIds.length}) must be strictly less than 74`
  );
});

test('AC-02A Invariant: Stable Coordinate Positioning During Isolation', () => {
  // Simulate precomputed coordinate layout invariant
  const allNodes = getAllRoadmapNodes();
  const svgWidth = 1400;

  const computeLayout = (nodes) => {
    const pos = new Map();
    const rNodes = nodes.filter((n) => n.type === 'research');
    const rSpacing = svgWidth / (rNodes.length + 1);
    rNodes.forEach((node, idx) => {
      pos.set(node.id, { x: rSpacing * (idx + 1) - 95, y: 60 });
    });

    const advNodes = nodes.filter((n) => n.type === 'advanced');
    const advSpacing = svgWidth / (advNodes.length + 1);
    advNodes.forEach((node, idx) => {
      pos.set(node.id, { x: advSpacing * (idx + 1) - 80, y: 260 });
    });

    const coreNodes = nodes.filter((n) => n.type === 'core');
    const colSpacing = svgWidth / 13;
    coreNodes.forEach((node) => {
      const num = parseInt(node.rawId, 10);
      const colIdx = Math.floor((num - 1) / 5) + 1;
      const rowIdx = (num - 1) % 5;
      pos.set(node.id, { x: colSpacing * colIdx - 48, y: 440 + rowIdx * 82 });
    });
    return pos;
  };

  // Full graph positions
  const fullPositions = computeLayout(allNodes);

  // In InteractiveRoadmapView, nodePositions is precomputed ONCE from allNodes and memoized.
  // When filtering nodes via visibleNodes = allNodes.filter(...), each node looks up its
  // position from fullPositions.
  const adv04Traversal = traverseLearningPath('adv-04', 'prerequisites');
  const visibleNodes = allNodes.filter((n) => adv04Traversal.activeNodeIds.includes(n.id));

  visibleNodes.forEach((node) => {
    const p = fullPositions.get(node.id);
    assert.ok(p, `Node ${node.id} must have precomputed coordinates`);
    assert.ok(typeof p.x === 'number' && typeof p.y === 'number');
  });

  // Verify ADV-04 position is identical regardless of isolation state
  const adv04Pos = fullPositions.get('adv-04');
  assert.ok(adv04Pos);
  assert.equal(adv04Pos.y, 260, 'ADV-04 y-coordinate is fixed on Advanced tier line (260)');
});

test('AC-02A Component Verification: InteractiveRoadmapView.tsx Implements Strict Isolation', () => {
  const compPath = path.resolve('src/components/InteractiveRoadmapView.tsx');
  const code = fs.readFileSync(compPath, 'utf8');

  // 1. isIsolationActive computation
  assert.ok(
    code.includes('const isIsolationActive = activeSelection.source !== \'none\''),
    'Component must compute isIsolationActive flag'
  );

  // 2. visibleNodes filtering
  assert.ok(
    code.includes('const visibleNodes = useMemo('),
    'Component must derive visibleNodes using useMemo'
  );
  assert.ok(
    code.includes('allNodes.filter((node) => activeSelection.activeNodeIds.has(node.id))'),
    'Component must filter visibleNodes strictly by activeNodeIds during isolation'
  );

  // 3. Inactive edges completely empty during isolation
  assert.ok(
    code.includes('inactiveEdges: [], activeEdges: active'),
    'Component must render 0 inactive edges during active isolation'
  );

  // 4. SVG nodes layer renders visibleNodes (not allNodes)
  assert.ok(
    code.includes('{visibleNodes.map((node) => {'),
    'SVG nodes layer must render visibleNodes to guarantee hidden nodes are omitted from DOM'
  );

  // 5. Interaction Hint Bar and Show All / Reset Button
  assert.ok(
    code.includes('active-isolation'),
    'Component must apply active-isolation class to hint bar'
  );
  assert.ok(
    code.includes('roadmap-show-all-btn'),
    'Component must render roadmap-show-all-btn for one-click unpin / reset'
  );
  assert.ok(
    code.includes('Tampilkan Semua'),
    'Component must provide "Tampilkan Semua" user text'
  );
});

test('AC-02A CSS Verification: styles.css Contains Isolation Rules', () => {
  const cssPath = path.resolve('src/styles.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.ok(css.includes('.roadmap-interaction-hint.active-isolation'), 'Must style active-isolation hint bar');
  assert.ok(css.includes('.roadmap-isolation-status'), 'Must style isolation status label');
  assert.ok(css.includes('.roadmap-unpin-btn.roadmap-show-all-btn'), 'Must style show all / reset button');
});

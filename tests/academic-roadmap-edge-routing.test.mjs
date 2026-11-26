import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  getAllRoadmapNodes,
  getAllRoadmapEdges,
  getRoadmapNodeById,
  getMainLearningPath,
  getFocusedLearningPath,
  computeCompactLayout,
  computeFocusEdgePath
} from '../src/data/learningRoadmapData.ts';

test('AC-02D Canonical Graph Invariant: Exactly 74 Nodes and 204 Edges', () => {
  const nodes = getAllRoadmapNodes();
  const edges = getAllRoadmapEdges();
  assert.equal(nodes.length, 74, 'Must have exactly 74 canonical curriculum nodes');
  assert.equal(edges.length, 204, 'Must have exactly 204 canonical dependency edges');
});

test('AC-02D SVG Layering & Group Hierarchy: Nodes strictly above Edges', () => {
  const compPath = path.resolve('src/components/InteractiveRoadmapView.tsx');
  const code = fs.readFileSync(compPath, 'utf8');

  // Both SVG modes must define dedicated .roadmap-edges-layer and .roadmap-nodes-layer
  assert.ok(code.includes('roadmap-edges-layer'), 'Must render dedicated roadmap-edges-layer group');
  assert.ok(code.includes('roadmap-nodes-layer'), 'Must render dedicated roadmap-nodes-layer group');

  // Focus Mode SVG: roadmap-edges-layer must appear BEFORE roadmap-nodes-layer in DOM string
  const focusEdgesIdx = code.indexOf('roadmap-focus-edges-layer');
  const focusNodesIdx = code.indexOf('roadmap-focus-nodes-layer');
  assert.ok(focusEdgesIdx > 0 && focusNodesIdx > 0, 'Both focus edges and nodes groups must exist');
  assert.ok(
    focusEdgesIdx < focusNodesIdx,
    'Focus Mode: roadmap-edges-layer must be rendered before roadmap-nodes-layer in DOM hierarchy'
  );

  // Overview SVG: roadmap-edges-layer must appear BEFORE roadmap-nodes-layer
  const overviewEdgesIdx = code.indexOf('roadmap-edges-inactive-layer');
  const overviewNodesIdx = code.lastIndexOf('roadmap-nodes-layer');
  assert.ok(overviewEdgesIdx < overviewNodesIdx, 'Overview Mode: edges layer must precede nodes layer');

  // Opaque Card Base Rect: ensures no background lines bleed through card rectangles
  assert.ok(code.includes('roadmap-node-bg-rect'), 'Must render opaque roadmap-node-bg-rect for every node');
});

test('AC-02D Edge Anchors: Strict Right-to-Left Boundary Connections', () => {
  const pathData = getFocusedLearningPath('r01', 'both', 'main-path');
  const edges = getAllRoadmapEdges().filter((e) => pathData.activeEdgeIds.includes(e.id));
  const layout = computeCompactLayout(pathData.activeNodeIds, edges, 'r01');

  for (const edge of edges) {
    const srcPos = layout.positions.get(edge.source);
    const tgtPos = layout.positions.get(edge.target);
    if (!srcPos || !tgtPos) continue;

    const routing = computeFocusEdgePath(
      srcPos,
      tgtPos,
      layout.positions,
      layout.width,
      layout.height,
      0
    );

    // Anchor source must be exactly at the right boundary of the source card
    assert.equal(
      routing.x1,
      srcPos.x + srcPos.width,
      `Source anchor x1 must equal source right boundary (${srcPos.x + srcPos.width})`
    );
    assert.equal(
      routing.y1,
      srcPos.y + srcPos.height / 2,
      `Source anchor y1 must equal source vertical midpoint (${srcPos.y + srcPos.height / 2})`
    );

    // Anchor target must be at the left boundary of the target card (with marker clearance)
    assert.ok(
      routing.x2 <= tgtPos.x,
      `Target anchor x2 (${routing.x2}) must be outside or at the target left boundary (${tgtPos.x})`
    );
    assert.equal(
      routing.y2,
      tgtPos.y + tgtPos.height / 2,
      `Target anchor y2 must equal target vertical midpoint (${tgtPos.y + tgtPos.height / 2})`
    );

    // Path must start with 'M x1 y1'
    assert.ok(
      routing.d.startsWith(`M ${routing.x1} ${routing.y1}`),
      'Path d must start at exact source anchor coordinates'
    );
  }
});

test('AC-02D Collision Avoidance & Multi-Stage Bypass Routing', () => {
  // Test simulated multi-stage edge spanning across an intermediate obstacle
  const allPositions = new Map();
  // Layer 0: Source node
  allPositions.set('node-src', {
    id: 'node-src',
    x: 60,
    y: 120,
    width: 200,
    height: 72,
    layerIndex: 0,
    isTarget: false,
    tier: 'Core'
  });
  // Layer 1: Intermediate obstacle node directly in the horizontal line of fire
  allPositions.set('node-obs', {
    id: 'node-obs',
    x: 340,
    y: 120,
    width: 200,
    height: 72,
    layerIndex: 1,
    isTarget: false,
    tier: 'Advanced'
  });
  // Layer 2: Target node
  allPositions.set('node-tgt', {
    id: 'node-tgt',
    x: 620,
    y: 120,
    width: 200,
    height: 72,
    layerIndex: 2,
    isTarget: true,
    tier: 'Research'
  });

  const srcPos = allPositions.get('node-src');
  const tgtPos = allPositions.get('node-tgt');

  // Compute path with collision avoidance
  const routing = computeFocusEdgePath(srcPos, tgtPos, allPositions, 1000, 600, 0);

  // Must detect collision and route around
  assert.equal(routing.hasCollision, true, 'Must detect obstacle collision for multi-stage edge');
  assert.ok(
    routing.routingMode === 'bypass-upper' || routing.routingMode === 'bypass-lower',
    'Must choose bypass routing lane'
  );

  // Verify that the horizontal run does NOT pass through node-obs bounding box y in [120, 192]
  assert.ok(
    routing.d.includes('L '),
    'Bypass route must contain horizontal lane segment'
  );

  // For upper bypass, y lane must be strictly above obstacle y (< 120)
  if (routing.routingMode === 'bypass-upper') {
    const laneMatch = routing.d.match(/L \d+(?:\.\d+)? (\d+(?:\.\d+)?)/);
    assert.ok(laneMatch, 'Must match horizontal lane y');
    const laneY = parseFloat(laneMatch[1]);
    assert.ok(laneY < 120, `Upper bypass lane (${laneY}) must be strictly above obstacle top (120)`);
  }
});

test('AC-02D Zero Card Clipping: All Nodes strictly within ViewBox Boundaries', () => {
  const testTracks = ['r01', 'r04', 'adv-04', 'ch-41'];

  for (const trackId of testTracks) {
    const pathData = getFocusedLearningPath(trackId, 'both', 'main-path');
    const edges = getAllRoadmapEdges().filter((e) => pathData.activeEdgeIds.includes(e.id));
    const layout = computeCompactLayout(pathData.activeNodeIds, edges, trackId);

    assert.ok(layout.width >= 980 && layout.width <= 1400, `Width within standard viewport bounds (${layout.width})`);

    // Verify every active node position is comfortably within margins
    layout.positions.forEach((pos, id) => {
      // Left boundary margin >= 50px
      assert.ok(
        pos.x >= 50,
        `Node ${id} x (${pos.x}) must maintain >= 50px left margin`
      );
      // Right boundary margin: pos.x + width <= layout.width - 50px
      assert.ok(
        pos.x + pos.width <= layout.width - 50,
        `Node ${id} right edge (${pos.x + pos.width}) must not exceed canvas width (${layout.width} - 50px)`
      );
      // Top boundary margin >= 40px
      assert.ok(
        pos.y >= 40,
        `Node ${id} y (${pos.y}) must maintain >= 40px top margin`
      );
      // Bottom boundary margin: pos.y + height <= layout.height - 40px
      assert.ok(
        pos.y + pos.height <= layout.height - 40,
        `Node ${id} bottom edge (${pos.y + pos.height}) must not exceed canvas height (${layout.height} - 40px)`
      );
    });
  }
});

test('AC-02D CSS Verification: Card Opacity & Layer Styling', () => {
  const cssPath = path.resolve('src/styles.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  // Verify opaque card background
  assert.ok(css.includes('.roadmap-node-bg-rect'), 'Must style .roadmap-node-bg-rect');
  assert.ok(css.includes('.roadmap-edges-layer'), 'Must style .roadmap-edges-layer');
  assert.ok(css.includes('.roadmap-nodes-layer'), 'Must style .roadmap-nodes-layer');
  assert.ok(css.includes('.roadmap-focus-edge'), 'Must style .roadmap-focus-edge');

  // Upstream and downstream node rects must use opaque fill (var(--bg-card))
  const upstreamMatch = css.match(/\.roadmap-svg-node\.upstream\s+\.roadmap-node-rect\s*\{([^}]+)\}/);
  assert.ok(upstreamMatch, 'Must define .roadmap-svg-node.upstream .roadmap-node-rect');
  assert.ok(
    upstreamMatch[1].includes('var(--bg-card)'),
    'Upstream node rect must use opaque var(--bg-card) fill to avoid edge bleed-through'
  );
});

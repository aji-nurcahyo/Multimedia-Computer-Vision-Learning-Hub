import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  getAllRoadmapNodes,
  getAllRoadmapEdges,
  getRoadmapNodeById,
  getRoadmapEdgeById,
  traverseLearningPath,
  getResearchPath
} from '../src/data/learningRoadmapData.ts';

test('Path Traversal: Upstream Prerequisite Traversal', () => {
  // Test traversal for ADV-04 (Transformers & DL)
  const res = traverseLearningPath('adv-04', 'prerequisites');
  assert.equal(res.targetNodeId, 'adv-04');
  assert.equal(res.direction, 'prerequisites');
  assert.ok(res.activeNodeIds.includes('adv-04'), 'Must include target node');
  assert.ok(res.upstreamNodeIds.length > 0, 'Must have upstream prerequisites');
  assert.equal(res.downstreamNodeIds.length, 0, 'Downstream must be empty when direction is prerequisites');

  // Verify direct prerequisites of ADV-04 are present
  assert.ok(res.upstreamNodeIds.includes('ch-41'), 'ADV-04 requires Ch 41');
  assert.ok(res.upstreamNodeIds.includes('ch-46'), 'ADV-04 requires Ch 46');
  assert.ok(res.upstreamNodeIds.includes('adv-01'), 'ADV-04 requires ADV-01');

  // Verify transitive prerequisites (e.g. from ADV-01)
  assert.ok(res.upstreamNodeIds.includes('ch-02'), 'ADV-04 transitively requires Ch 02 via ADV-01');
  assert.ok(res.upstreamNodeIds.includes('ch-05'), 'ADV-04 transitively requires Ch 05 via ADV-01');

  // Verify active edges are recorded
  assert.ok(res.activeEdgeIds.length >= res.upstreamNodeIds.length, 'Must activate connecting edges');
});

test('Path Traversal: Downstream Dependent Traversal', () => {
  // Test traversal for Ch 41 (CNN Foundations)
  const res = traverseLearningPath('ch-41', 'dependents');
  assert.equal(res.targetNodeId, 'ch-41');
  assert.equal(res.direction, 'dependents');
  assert.ok(res.activeNodeIds.includes('ch-41'), 'Must include target node');
  assert.equal(res.upstreamNodeIds.length, 0, 'Upstream must be empty when direction is dependents');
  assert.ok(res.downstreamNodeIds.length > 0, 'Must have downstream dependents');

  // Ch 41 unlocks ADV-01, ADV-04, ADV-08, and Research Tracks transitively
  assert.ok(res.downstreamNodeIds.includes('adv-01') || res.downstreamNodeIds.includes('adv-04'), 'Ch 41 unlocks advanced modules');
  assert.ok(res.downstreamNodeIds.includes('r01') || res.downstreamNodeIds.includes('r05'), 'Ch 41 transitively unlocks Research Tracks');
});

test('Path Traversal: Bidirectional Path Highlighting', () => {
  // Test bidirectional traversal for ADV-01
  const res = traverseLearningPath('adv-01', 'both');
  assert.equal(res.targetNodeId, 'adv-01');
  assert.equal(res.direction, 'both');
  assert.ok(res.activeNodeIds.includes('adv-01'));
  assert.ok(res.upstreamNodeIds.length > 0, 'ADV-01 has upstream core chapters');
  assert.ok(res.downstreamNodeIds.length > 0, 'ADV-01 unlocks downstream advanced modules and research tracks');

  // Active node IDs must be exact union of target + upstream + downstream
  const expectedTotal = 1 + res.upstreamNodeIds.length + res.downstreamNodeIds.length;
  assert.equal(res.activeNodeIds.length, expectedTotal, 'Active nodes must equal target + upstream + downstream');

  // Set intersection between upstream and downstream should be empty (acyclic DAG)
  const upstreamSet = new Set(res.upstreamNodeIds);
  for (const downId of res.downstreamNodeIds) {
    assert.equal(upstreamSet.has(downId), false, `Node ${downId} cannot be both upstream and downstream in an acyclic DAG`);
  }
});

test('Edge Metadata & Academic Justification: All 86 Edges Enriched', () => {
  const edges = getAllRoadmapEdges();
  assert.ok(edges.length >= 86, `Must contain at least 86 canonical edges (got ${edges.length})`);

  edges.forEach((edge) => {
    assert.ok(edge.id.includes('->'), `Edge ID must have source->target format: ${edge.id}`);
    assert.ok(edge.sourceCode && edge.sourceCode.length > 1, `Edge ${edge.id} must have sourceCode`);
    assert.ok(edge.sourceTitle && edge.sourceTitle.length > 3, `Edge ${edge.id} must have sourceTitle`);
    assert.ok(edge.targetCode && edge.targetCode.length > 1, `Edge ${edge.id} must have targetCode`);
    assert.ok(edge.targetTitle && edge.targetTitle.length > 3, `Edge ${edge.id} must have targetTitle`);
    assert.ok(
      edge.academicJustification && edge.academicJustification.length >= 20,
      `Edge ${edge.id} must have detailed academic justification (got "${edge.academicJustification}")`
    );

    // Verify lookup by ID
    const found = getRoadmapEdgeById(edge.id);
    assert.ok(found, `Edge ${edge.id} must be retrievable via getRoadmapEdgeById`);
    assert.equal(found.id, edge.id);
  });
});

test('Loop Freedom & Finite Traversal across all 74 Canonical Nodes', () => {
  const nodes = getAllRoadmapNodes();
  assert.equal(nodes.length, 74);

  nodes.forEach((node) => {
    // Run upstream, downstream, and both
    const upRes = traverseLearningPath(node.id, 'prerequisites');
    const downRes = traverseLearningPath(node.id, 'dependents');
    const bothRes = traverseLearningPath(node.id, 'both');

    assert.ok(upRes.activeNodeIds.length >= 1);
    assert.ok(downRes.activeNodeIds.length >= 1);
    assert.ok(bothRes.activeNodeIds.length >= 1);

    // Verify no duplicate IDs in result arrays
    assert.equal(new Set(upRes.activeNodeIds).size, upRes.activeNodeIds.length, `No duplicate nodes in upstream ${node.id}`);
    assert.equal(new Set(downRes.activeNodeIds).size, downRes.activeNodeIds.length, `No duplicate nodes in downstream ${node.id}`);
    assert.equal(new Set(bothRes.activeNodeIds).size, bothRes.activeNodeIds.length, `No duplicate nodes in both ${node.id}`);
  });
});

test('UI Component Structure: Path Direction, Pinning & Tooltip Controls', () => {
  const compFile = path.resolve('src/components/InteractiveRoadmapView.tsx');
  const content = fs.readFileSync(compFile, 'utf8');

  // Verify Direction buttons
  assert.ok(content.includes('roadmap-direction-control'), 'Must render roadmap-direction-control');
  assert.ok(content.includes('Prasyarat'), 'Must render Prasyarat option');
  assert.ok(content.includes('Lanjutan'), 'Must render Lanjutan option');
  assert.ok(content.includes('Keduanya'), 'Must render Keduanya option');

  // Verify Pin / Unpin interaction
  assert.ok(content.includes('pinnedNodeId'), 'Must manage pinnedNodeId state');
  assert.ok(content.includes('setPinnedNodeId'), 'Must provide pin toggling');
  assert.ok(content.includes('roadmap-unpin-btn'), 'Must render unpin button');

  // Verify Edge Tooltip
  assert.ok(content.includes('roadmap-edge-tooltip'), 'Must render edge tooltip container');
  assert.ok(content.includes('academicJustification'), 'Must display academicJustification in tooltip');

  // Verify Inactive vs Active Edge Layering
  assert.ok(content.includes('roadmap-edges-inactive-layer'), 'Must render inactive edges layer');
  assert.ok(content.includes('roadmap-edges-active-layer'), 'Must render active edges layer above inactive');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  getAllRoadmapNodes,
  getAllRoadmapEdges,
  getRoadmapNodeById,
  getResearchPath,
  RESEARCH_TRACK_OPTIONS,
  ROADMAP_SUMMARY
} from '../src/data/learningRoadmapData.ts';

test('Roadmap Registry: Canonical Node Coverage (74 total: 60 Core, 8 Advanced, 6 Research)', () => {
  const nodes = getAllRoadmapNodes();
  assert.equal(nodes.length, 74, 'Must have exactly 74 canonical curriculum nodes');
  assert.equal(ROADMAP_SUMMARY.totalNodes, 74);
  assert.equal(ROADMAP_SUMMARY.coreCount, 60, 'Exactly 60 Core chapters');
  assert.equal(ROADMAP_SUMMARY.advancedCount, 8, 'Exactly 8 Advanced modules');
  assert.equal(ROADMAP_SUMMARY.researchCount, 6, 'Exactly 6 Research tracks');

  // Verify all 60 core chapters exist (ch-01 to ch-60)
  for (let i = 1; i <= 60; i++) {
    const rawId = String(i).padStart(2, '0');
    const nodeId = `ch-${rawId}`;
    const node = getRoadmapNodeById(nodeId);
    assert.ok(node, `Core chapter node ${nodeId} must exist`);
    assert.equal(node.type, 'core');
    assert.equal(node.code, `Bab ${rawId}`);
    assert.ok(node.title.length > 3);
    assert.ok(node.route.startsWith('#/chapter/'));
    assert.ok(node.telecomRelevance.length > 10, 'Must have telecom relevance context');
  }

  // Verify all 8 advanced modules exist (adv-01 to adv-08)
  for (let i = 1; i <= 8; i++) {
    const rawId = `adv-0${i}`;
    const node = getRoadmapNodeById(rawId);
    assert.ok(node, `Advanced module node ${rawId} must exist`);
    assert.equal(node.type, 'advanced');
    assert.equal(node.code, `ADV-0${i}`);
    assert.ok(node.title.length > 3);
    assert.ok(node.route.startsWith('#/advanced/'));
  }

  // Verify all 6 research tracks exist (r01 to r06)
  for (let i = 1; i <= 6; i++) {
    const rawId = `r0${i}`;
    const node = getRoadmapNodeById(rawId);
    assert.ok(node, `Research track node ${rawId} must exist`);
    assert.equal(node.type, 'research');
    assert.equal(node.code, `R0${i}`);
    assert.ok(node.title.length > 3);
    assert.ok(node.route.startsWith('#/research/'));
  }
});

test('Roadmap Dependency Integrity: All Prerequisite References Exist', () => {
  const nodes = getAllRoadmapNodes();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  nodes.forEach((node) => {
    node.prerequisites.forEach((prereqId) => {
      assert.ok(
        nodeMap.has(prereqId),
        `Node ${node.id} (${node.code}) references non-existent prerequisite: ${prereqId}`
      );
    });

    node.unlocks.forEach((unlockId) => {
      assert.ok(
        nodeMap.has(unlockId),
        `Node ${node.id} (${node.code}) references non-existent unlocked node: ${unlockId}`
      );
    });
  });
});

test('Roadmap Graph Acyclicity: Strictly Directed Acyclic Graph (No Circular Prerequisites)', () => {
  const nodes = getAllRoadmapNodes();
  const visited = new Set();
  const recursionStack = new Set();

  function detectCycle(nodeId) {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = getRoadmapNodeById(nodeId);
    if (node) {
      for (const prereqId of node.prerequisites) {
        if (!visited.has(prereqId)) {
          if (detectCycle(prereqId)) return true;
        } else if (recursionStack.has(prereqId)) {
          return true; // Cycle detected
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      assert.equal(
        detectCycle(node.id),
        false,
        `Cycle detected in roadmap dependency graph starting at ${node.id}`
      );
    }
  }
});

test('Roadmap Edge Consistency: All Source and Target Pairs Valid', () => {
  const edges = getAllRoadmapEdges();
  const nodes = getAllRoadmapNodes();
  const nodeIds = new Set(nodes.map((n) => n.id));

  assert.ok(edges.length > 80, `Must generate realistic number of edges (got ${edges.length})`);

  edges.forEach((edge) => {
    assert.ok(nodeIds.has(edge.source), `Edge ${edge.id} has invalid source: ${edge.source}`);
    assert.ok(nodeIds.has(edge.target), `Edge ${edge.id} has invalid target: ${edge.target}`);
    assert.notEqual(edge.source, edge.target, `Edge ${edge.id} cannot be a self-loop`);
  });
});

test('Jalur Menuju Riset (Research Path Explorer): Complete Pathways for R01 to R06', () => {
  for (const opt of RESEARCH_TRACK_OPTIONS) {
    const pathway = getResearchPath(opt.id);
    assert.ok(pathway, `Research pathway for ${opt.code} must resolve`);
    assert.equal(pathway.trackId, opt.id);
    assert.equal(pathway.trackCode, opt.code);
    assert.ok(pathway.allNodeIds.length >= 5, `${opt.code} pathway must include at least 5 nodes`);
    assert.ok(pathway.primaryAdvancedModules.length >= 1, `${opt.code} must connect to at least 1 Advanced module`);
    assert.ok(pathway.keyCoreChapters.length >= 3, `${opt.code} must trace down to at least 3 Core chapters`);
    assert.ok(pathway.allEdgeIds.length >= 4, `${opt.code} must activate at least 4 edges`);

    // Verify all resolved node IDs exist
    pathway.allNodeIds.forEach((nid) => {
      assert.ok(getRoadmapNodeById(nid), `Resolved node ${nid} in ${opt.code} path must exist in registry`);
    });
  }

  // Specific assertions for R01 (Visual Detection)
  const r01Path = getResearchPath('r01');
  assert.ok(r01Path.primaryAdvancedModules.includes('adv-01'), 'R01 requires ADV-01 (Math Foundations)');
  assert.ok(r01Path.primaryAdvancedModules.includes('adv-04'), 'R01 requires ADV-04 (Transformers & DL)');
  assert.ok(r01Path.keyCoreChapters.includes('ch-41'), 'R01 traces to CNN Foundations (Ch 41)');
  assert.ok(r01Path.keyCoreChapters.includes('ch-46'), 'R01 traces to ViT & Attention (Ch 46)');
});

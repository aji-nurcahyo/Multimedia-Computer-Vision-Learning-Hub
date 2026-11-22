import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const advancedModulesPath = path.resolve('content/curriculum/advanced-modules.json');
const researchTracksPath = path.resolve('content/curriculum/research-tracks.json');
const masterCurriculumPath = path.resolve('content/curriculum/master-curriculum.json');

test('Advanced Curriculum Registry: ADV-01 to ADV-08 completeness & schema validation', () => {
  assert.ok(fs.existsSync(advancedModulesPath), 'advanced-modules.json must exist');
  const modules = JSON.parse(fs.readFileSync(advancedModulesPath, 'utf-8'));
  const master = JSON.parse(fs.readFileSync(masterCurriculumPath, 'utf-8'));

  assert.equal(modules.length, 8, 'Must have exactly 8 Advanced Modules (ADV-01 through ADV-08)');

  const coreChapterIds = new Set(master.chapters.map((c) => c.id));
  const seenIds = new Set();
  const seenCodes = new Set();

  for (let i = 0; i < modules.length; i++) {
    const m = modules[i];
    const expectedCode = `ADV-0${i + 1}`;
    assert.equal(m.code, expectedCode, `Module at index ${i} must have code ${expectedCode}`);
    assert.ok(m.title && m.title.length > 5, `Module ${m.code} must have descriptive title`);
    assert.ok(m.subtitle, `Module ${m.code} must have subtitle`);
    const isPublished = ['adv-01', 'adv-02', 'adv-03', 'adv-04', 'adv-05', 'adv-06', 'adv-07', 'adv-08'].includes(m.id);
    const expectedStatus = isPublished ? 'published' : 'planned';
    assert.equal(m.status, expectedStatus, `Module ${m.code} must be marked as '${expectedStatus}' in Phase AD-09`);
    assert.ok([1, 2, 3, 4].includes(m.pillar), `Module ${m.code} must belong to Pillar 1, 2, 3, or 4`);
    assert.ok(m.estimatedHours >= 10, `Module ${m.code} must have realistic estimated hours`);
    assert.ok(Array.isArray(m.topics) && m.topics.length === 5, `Module ${m.code} must have 5 structured topics`);
    assert.ok(m.interactiveLab && m.interactiveLab.id, `Module ${m.code} must define an interactive lab specification`);
    assert.equal(m.interactiveLab.status, expectedStatus, `Interactive lab for ${m.code} must be '${expectedStatus}'`);

    // Verify core chapter prerequisites
    assert.ok(Array.isArray(m.prerequisites.coreChapters), `Module ${m.code} must have coreChapters array`);
    assert.ok(m.prerequisites.coreChapters.length > 0, `Module ${m.code} must reference at least one core chapter`);
    for (const cid of m.prerequisites.coreChapters) {
      assert.ok(coreChapterIds.has(cid), `Module ${m.code} references non-existent core chapter ID: ${cid}`);
    }

    assert.ok(!seenIds.has(m.id), `Duplicate module ID: ${m.id}`);
    assert.ok(!seenCodes.has(m.code), `Duplicate module Code: ${m.code}`);
    seenIds.add(m.id);
    seenCodes.add(m.code);
  }
});

test('Advanced Curriculum Dependency Graph: Strictly Acyclic (No Circular Dependencies)', () => {
  const modules = JSON.parse(fs.readFileSync(advancedModulesPath, 'utf-8'));
  const moduleMap = new Map(modules.map((m) => [m.id, m]));

  // Verify all advanced prerequisites exist
  for (const m of modules) {
    for (const prereqId of m.prerequisites.advancedModules) {
      assert.ok(moduleMap.has(prereqId), `Module ${m.id} references unknown advanced prerequisite ${prereqId}`);
    }
  }

  // Cycle detection via DFS
  const visited = new Set();
  const recursionStack = new Set();

  function checkCycle(nodeId) {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const m = moduleMap.get(nodeId);
    for (const neighbor of m.prerequisites.advancedModules) {
      if (!visited.has(neighbor)) {
        if (checkCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const m of modules) {
    if (!visited.has(m.id)) {
      const hasCycle = checkCycle(m.id);
      assert.equal(hasCycle, false, `Circular dependency detected starting at ${m.id}`);
    }
  }
});

test('Research Tracks Registry: R01 to R06 completeness & schema validation', () => {
  assert.ok(fs.existsSync(researchTracksPath), 'research-tracks.json must exist');
  const tracks = JSON.parse(fs.readFileSync(researchTracksPath, 'utf-8'));
  const modules = JSON.parse(fs.readFileSync(advancedModulesPath, 'utf-8'));
  const master = JSON.parse(fs.readFileSync(masterCurriculumPath, 'utf-8'));

  assert.equal(tracks.length, 6, 'Must have exactly 6 Research Tracks (R01 through R06)');

  const moduleIds = new Set(modules.map((m) => m.id));
  const coreChapterIds = new Set(master.chapters.map((c) => c.id));
  const seenIds = new Set();
  const seenCodes = new Set();

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const expectedCode = `R0${i + 1}`;
    assert.equal(t.code, expectedCode, `Track at index ${i} must have code ${expectedCode}`);
    assert.ok(t.title && t.title.length > 5, `Track ${t.code} must have descriptive title`);
    assert.ok(['planned', 'published'].includes(t.status), `Track ${t.code} status must be valid ('planned' or 'published')`);
    assert.equal(t.status, 'published', `Track ${t.code} must be marked as 'published' in AD-12`);
    assert.ok(['Primary Academic Anchor', 'Strategic Extension', 'Optional Specialization'].includes(t.category));
    assert.ok([1, 2, 3, 4].includes(t.pillar), `Track ${t.code} must belong to Pillar 1, 2, 3, or 4`);
    assert.ok(t.primaryBenchmark, `Track ${t.code} must have primary benchmark defined`);
    assert.ok(Array.isArray(t.standardMetrics) && t.standardMetrics.length > 0, `Track ${t.code} must have standard metrics`);
    assert.ok(Array.isArray(t.milestones) && t.milestones.length === 3, `Track ${t.code} must define 3-phase milestones`);
    assert.ok(Array.isArray(t.commonMethodologyStages) && t.commonMethodologyStages.length === 6, `Track ${t.code} must incorporate 6-stage methodology`);

    // Verify statistical protocol (Gate 6 approval: minSeeds >= 3)
    assert.ok(t.statisticalProtocol, `Track ${t.code} must have statistical protocol defined`);
    assert.ok(t.statisticalProtocol.minSeeds >= 3, `Track ${t.code} must require minSeeds >= 3`);

    // Verify advanced module prerequisites
    assert.ok(Array.isArray(t.prerequisites.advancedModules), `Track ${t.code} must have advancedModules array`);
    assert.ok(t.prerequisites.advancedModules.length > 0, `Track ${t.code} must reference at least one advanced module`);
    for (const mid of t.prerequisites.advancedModules) {
      assert.ok(moduleIds.has(mid), `Track ${t.code} references unknown advanced module ID: ${mid}`);
    }

    // Verify core chapter prerequisites
    assert.ok(Array.isArray(t.prerequisites.coreChapters), `Track ${t.code} must have coreChapters array`);
    for (const cid of t.prerequisites.coreChapters) {
      assert.ok(coreChapterIds.has(cid), `Track ${t.code} references non-existent core chapter ID: ${cid}`);
    }

    assert.ok(!seenIds.has(t.id), `Duplicate track ID: ${t.id}`);
    assert.ok(!seenCodes.has(t.code), `Duplicate track Code: ${t.code}`);
    seenIds.add(t.id);
    seenCodes.add(t.code);
  }
});

test('Advanced Modules Content Integrity: Strictly enforces published vs planned asset requirements', () => {
  const modules = JSON.parse(fs.readFileSync(advancedModulesPath, 'utf-8'));
  const authorizedPublished = new Set(['adv-01', 'adv-02', 'adv-03', 'adv-04', 'adv-05', 'adv-06', 'adv-07', 'adv-08']);
  const requiredFiles = ['index.md', 'slides.json', 'references.json', 'quiz.json', 'exercises.json', 'media.json'];

  for (const m of modules) {
    const dir = path.resolve('content/advanced', m.id);

    if (m.status === 'published') {
      // Must be in authorized set
      assert.ok(
        authorizedPublished.has(m.id),
        `Module ${m.code} cannot be marked 'published' without prior curriculum authorization`
      );

      // Must have actual content directory
      assert.ok(fs.existsSync(dir), `Directory ${dir} must exist for published module ${m.code}`);

      // Must have all required lesson files
      for (const f of requiredFiles) {
        const filePath = path.join(dir, f);
        assert.ok(fs.existsSync(filePath), `Required file ${f} must exist in ${dir}`);
        const content = fs.readFileSync(filePath, 'utf-8');
        assert.ok(content.length > 20, `File ${filePath} must have non-trivial content`);
      }

      // Verify Python example and notebook
      const pyScript = path.join(dir, 'examples', 'example-01.py');
      assert.ok(fs.existsSync(pyScript), `Python script ${pyScript} must exist for published module ${m.code}`);

      const notebook = path.join(dir, 'notebooks', `${m.id}-lab.ipynb`);
      assert.ok(fs.existsSync(notebook), `Notebook ${notebook} must exist for published module ${m.code}`);
      const nbJson = JSON.parse(fs.readFileSync(notebook, 'utf-8'));
      assert.ok(nbJson.cells && nbJson.cells.length >= 3, `Notebook ${notebook} must have at least 3 cells`);
    } else {
      // If planned, it must not falsely claim published interactive lab status
      assert.equal(
        m.status,
        'planned',
        `Unauthored module ${m.code} must have status 'planned'`
      );
      assert.equal(
        m.interactiveLab.status,
        'planned',
        `Unauthored module ${m.code} interactiveLab must be 'planned'`
      );
      assert.ok(
        !authorizedPublished.has(m.id),
        `Authorized module ${m.code} should not be planned`
      );
    }
  }
});


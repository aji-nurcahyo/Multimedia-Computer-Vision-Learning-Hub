import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  computeMeanAndStd,
  computeBootstrapConfidenceInterval,
  computePairedTTest,
  computeHotaMetrics,
  computeCOCOAveragePrecision,
  computeExpectedCalibrationError,
  categorizeDetectionErrors,
} from '../src/lib/researchMetrics.ts';

const researchTracksPath = path.resolve('content/curriculum/research-tracks.json');
const masterCurriculumPath = path.resolve('content/curriculum/master-curriculum.json');
const advancedModulesPath = path.resolve('content/curriculum/advanced-modules.json');

test('Research Tracks Registry: Completeness, Category, and Statistical Protocol (Gate 6)', () => {
  assert.ok(fs.existsSync(researchTracksPath), 'research-tracks.json must exist');
  const tracks = JSON.parse(fs.readFileSync(researchTracksPath, 'utf-8'));
  const master = JSON.parse(fs.readFileSync(masterCurriculumPath, 'utf-8'));
  const advModules = JSON.parse(fs.readFileSync(advancedModulesPath, 'utf-8'));

  assert.equal(tracks.length, 6, 'Must contain exactly 6 Research Tracks (R01..R06)');

  const coreChapterIds = new Set(master.chapters.map((c) => c.id));
  const advModuleIds = new Set(advModules.map((m) => m.id));

  const validCategories = ['Primary Academic Anchor', 'Strategic Extension', 'Optional Specialization'];

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const expectedCode = `R0${i + 1}`;
    assert.equal(t.code, expectedCode, `Track at index ${i} must have code ${expectedCode}`);
    assert.ok(t.title && t.title.length > 5, `Track ${t.code} must have a title`);
    assert.ok(validCategories.includes(t.category), `Track ${t.code} has invalid category: ${t.category}`);

    // Verify statistical protocol (minSeeds >= 3 mandatory)
    assert.ok(t.statisticalProtocol, `Track ${t.code} must define statisticalProtocol`);
    assert.ok(t.statisticalProtocol.minSeeds >= 3, `Track ${t.code} must require minSeeds >= 3`);
    assert.ok(t.statisticalProtocol.reporting.length > 5, `Track ${t.code} must have reporting rule`);

    // Verify prerequisites
    for (const cid of t.prerequisites.coreChapters) {
      assert.ok(coreChapterIds.has(cid), `Track ${t.code} references non-existent core chapter: ${cid}`);
    }
    for (const mid of t.prerequisites.advancedModules) {
      assert.ok(advModuleIds.has(mid), `Track ${t.code} references non-existent advanced module: ${mid}`);
    }
  }
});

test('Research Manifests & Templates: Verifies existence and schema validity for R01 to R06', () => {
  const tracks = ['r01', 'r02', 'r03', 'r04', 'r05', 'r06'];
  const validEvidenceCategories = [
    'verified_numerical_example',
    'educational_simulation',
    'executed_baseline',
    'authentic_benchmark_measurement',
    'expected_output_example',
    'unexecuted_optional_workflow',
  ];

  for (const tid of tracks) {
    const manifestPath = path.resolve(`content/research/${tid}/manifest.json`);
    const workflowPath = path.resolve(`content/research/${tid}/guided-workflow.md`);
    const notebookPath = path.resolve(`content/research/${tid}/notebooks/${tid}-research-baseline.ipynb`);

    assert.ok(fs.existsSync(manifestPath), `Manifest must exist at ${manifestPath}`);
    assert.ok(fs.existsSync(workflowPath), `Guided workflow must exist at ${workflowPath}`);
    assert.ok(fs.existsSync(notebookPath), `Notebook must exist at ${notebookPath}`);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.equal(manifest.trackId, tid);
    assert.ok(validEvidenceCategories.includes(manifest.evidenceCategory));
    assert.ok(Array.isArray(manifest.randomSeeds) && manifest.randomSeeds.length >= 3);
    assert.ok(manifest.dataset && manifest.dataset.name && manifest.dataset.license);
    assert.ok(manifest.model && manifest.model.name && manifest.model.parameterCountM >= 0);
    assert.ok(Array.isArray(manifest.metrics) && manifest.metrics.length > 0);

    // Verify notebook is valid JSON with at least 5 cells
    const nb = JSON.parse(fs.readFileSync(notebookPath, 'utf-8'));
    assert.ok(nb.cells && nb.cells.length >= 5);
  }

  // Verify all 10 templates exist in content/research/templates
  const expectedTemplates = [
    '01-research-proposal-template.md',
    '02-dataset-documentation-template.md',
    '03-experiment-manifest-template.json',
    '04-baseline-reproduction-protocol.md',
    '05-ablation-study-template.md',
    '06-quantitative-results-template.md',
    '07-error-analysis-taxonomy.md',
    '08-statistical-reporting-template.md',
    '09-reproducibility-checklist.md',
    '10-scientific-report-paper-template.md',
  ];

  for (const tmpl of expectedTemplates) {
    const tmplPath = path.resolve('content/research/templates', tmpl);
    assert.ok(fs.existsSync(tmplPath), `Template ${tmpl} must exist`);
    const content = fs.readFileSync(tmplPath, 'utf-8');
    assert.ok(content.length > 100, `Template ${tmpl} must have substantial content`);
  }
});

test('Research Metrics: Statistical Mean, Standard Deviation, and Bootstrap Confidence Interval', () => {
  const samples = [43.7, 43.9, 43.8];
  const { mean, std } = computeMeanAndStd(samples);
  assert.ok(Math.abs(mean - 43.8) < 1e-4, 'Mean must equal 43.8');
  assert.ok(Math.abs(std - 0.1) < 1e-4, 'Std must equal 0.1');

  const ci = computeBootstrapConfidenceInterval(samples, 0.95, 500, 42);
  assert.ok(ci.lower <= ci.mean && ci.mean <= ci.upper, 'Mean must fall within CI');
  assert.ok(ci.lower >= 43.6 && ci.upper <= 44.0, 'CI bounds must be realistic');
});

test('Research Metrics: Paired Student t-test significance testing', () => {
  const base = [43.7, 43.8, 43.9];
  const prop = [45.1, 45.2, 45.3]; // Substantial improvement
  const res = computePairedTTest(prop, base);

  assert.equal(res.degreesOfFreedom, 2);
  assert.ok(res.tStatistic > 10, 't-statistic must be large for clear gain');
  assert.ok(res.pValueApprox < 0.05, 'p-value must be significant');
  assert.equal(res.isSignificant, true);

  // Equal samples
  const identical = computePairedTTest(base, base);
  assert.equal(identical.tStatistic, 0);
  assert.equal(identical.isSignificant, false);
});

test('Research Metrics: Higher Order Tracking Accuracy (HOTA) calculation', () => {
  const tp = 100;
  const fp = 10;
  const fn = 15;
  const assScore = 0.64;

  const { deta, assa, hota } = computeHotaMetrics(tp, fp, fn, assScore);
  const expectedDetA = 100 / (100 + 10 + 15); // 100 / 125 = 0.8
  assert.ok(Math.abs(deta - expectedDetA) < 1e-4);
  assert.equal(assa, 0.64);
  const expectedHota = Math.sqrt(0.8 * 0.64); // ~0.7155
  assert.ok(Math.abs(hota - expectedHota) < 1e-4);
});

test('Research Metrics: 101-Point COCO Average Precision interpolation', () => {
  const precisions = [1.0, 0.8, 0.6, 0.4];
  const recalls = [0.1, 0.4, 0.7, 1.0];
  const ap = computeCOCOAveragePrecision(precisions, recalls);

  assert.ok(ap >= 0.0 && ap <= 1.0, 'AP must be in [0, 1]');
  assert.ok(ap > 0.5, 'Monotonic PR curve should have reasonable AP');
});

test('Research Metrics: Expected Calibration Error (ECE)', () => {
  const confidences = [0.95, 0.90, 0.85, 0.55, 0.50];
  const accuracies = [1, 1, 1, 0, 0];
  const ece = computeExpectedCalibrationError(confidences, accuracies, 5);

  assert.ok(ece >= 0.0 && ece <= 1.0, 'ECE must be between 0 and 1');
});

test('Research Metrics: Detection Error Taxonomy categorization (TIDE framework)', () => {
  const groundTruths = [
    { bbox: [10, 10, 50, 50], classId: 0 },
    { bbox: [60, 60, 90, 90], classId: 1 },
  ];
  const predictions = [
    { bbox: [12, 12, 48, 48], classId: 0, score: 0.95 }, // Good overlap TP
    { bbox: [60, 60, 90, 90], classId: 2, score: 0.85 }, // Same box, wrong class -> Classification Error
    { bbox: [1, 1, 8, 8], classId: 0, score: 0.40 },     // Background false alarm
  ];

  const taxonomy = categorizeDetectionErrors(groundTruths, predictions, 0.5);
  assert.equal(taxonomy.truePositives, 1, 'Should have 1 TP');
  assert.equal(taxonomy.classificationErrors, 1, 'Should have 1 Cls error');
  assert.equal(taxonomy.backgroundHallucinations, 1, 'Should have 1 Background FP');
  assert.equal(taxonomy.totalGroundTruths, 2);
  assert.equal(taxonomy.totalPredictions, 3);
});

test('Research Tracks AD-12: R01 to R06 18-part academic curriculum completeness', () => {
  const allTracks = ['r01', 'r02', 'r03', 'r04', 'r05', 'r06'];

  for (const tid of allTracks) {
    const indexPath = path.resolve(`content/research/${tid}/index.md`);
    const examplePath = path.resolve(`content/research/${tid}/examples/example-01.py`);
    const notebookPath = path.resolve(`content/research/${tid}/notebooks/${tid}-research-baseline.ipynb`);

    assert.ok(fs.existsSync(indexPath), `Curriculum index.md must exist at ${indexPath}`);
    assert.ok(fs.existsSync(examplePath), `Python script must exist at ${examplePath}`);
    assert.ok(fs.existsSync(notebookPath), `Jupyter notebook must exist at ${notebookPath}`);

    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    assert.ok(indexContent.length > 2000, `Curriculum index.md for ${tid} must be substantive`);

    // Verify all 18 mandatory sections exist
    for (let s = 1; s <= 18; s++) {
      const sectionMarker = `### ${s}.`;
      assert.ok(
        indexContent.includes(sectionMarker),
        `Curriculum for ${tid} must contain section ${s} ('${sectionMarker}')`
      );
    }
  }
});

test('Research Track R04: Anisotropic Bayesian Sensor Fusion vs Heuristic Averaging', () => {
  // Camera has low lateral noise (sigma_x = 0.4), high depth noise (sigma_y = 1.8)
  const varCam = [0.16, 3.24];
  // Radar has high lateral noise (sigma_x = 1.5), low range noise (sigma_y = 0.25)
  const varRad = [2.25, 0.0625];

  // Ground truth point at [5.0, 20.0]
  const gt = [5.0, 20.0];
  const zCam = [5.2, 22.5]; // offset primarily along depth
  const zRad = [6.8, 20.1]; // offset primarily along azimuth

  // 1. Heuristic 50:50 fusion
  const fusedHeuristic = [0.5 * zCam[0] + 0.5 * zRad[0], 0.5 * zCam[1] + 0.5 * zRad[1]];
  const errHeuristic = Math.hypot(fusedHeuristic[0] - gt[0], fusedHeuristic[1] - gt[1]);

  // 2. Optimal Bayesian minimum-variance fusion: w_i = (1 / var_cam_i) / (1 / var_cam_i + 1 / var_rad_i)
  const wX = (1 / varCam[0]) / (1 / varCam[0] + 1 / varRad[0]);
  const wY = (1 / varCam[1]) / (1 / varCam[1] + 1 / varRad[1]);

  const fusedBayesian = [
    wX * zCam[0] + (1 - wX) * zRad[0],
    wY * zCam[1] + (1 - wY) * zRad[1],
  ];
  const errBayesian = Math.hypot(fusedBayesian[0] - gt[0], fusedBayesian[1] - gt[1]);

  // Weight on camera should be high for X (low lateral variance) and low for Y (high depth variance)
  assert.ok(wX > 0.85, 'Camera weight on X should be > 0.85');
  assert.ok(wY < 0.05, 'Camera weight on Y should be < 0.05');

  // Error of Bayesian fusion must be significantly lower than heuristic
  assert.ok(errBayesian < errHeuristic * 0.5, 'Bayesian fusion error must be less than 50% of heuristic error');
});

test('Research Track R05: Affine Quantization Arithmetic and Roofline Operational Bounds', () => {
  // Test Affine Quantization mapping: S = (max - min) / (qmax - qmin)
  const rMin = -3.5;
  const rMax = 7.2;
  const qMin = 0;
  const qMax = 255;
  const scale = (rMax - rMin) / (qMax - qMin);
  const zeroPoint = Math.round(-rMin / scale);

  assert.ok(scale > 0, 'Scale must be positive');
  assert.ok(zeroPoint >= qMin && zeroPoint <= qMax, 'Zero point must be within [0, 255]');

  // Test roundtrip quantization of test value
  const rVal = 2.4;
  const qVal = Math.max(qMin, Math.min(qMax, Math.round(rVal / scale) + zeroPoint));
  const dequantVal = scale * (qVal - zeroPoint);
  assert.ok(Math.abs(rVal - dequantVal) <= scale / 2, 'Dequantization error must be <= scale / 2');

  // Test Roofline Model
  const peakGflops = 100.0;
  const memBwGbps = 25.6;
  const ridgePoint = peakGflops / memBwGbps; // ~3.91 FLOPs/Byte

  // Layer 1: Memory-bound (Depthwise Conv, AI = 0.8 FLOPs/Byte)
  const aiMem = 0.8;
  const perfMem = Math.min(peakGflops, aiMem * memBwGbps);
  assert.ok(aiMem < ridgePoint, 'AI=0.8 must be memory-bound');
  assert.ok(Math.abs(perfMem - (0.8 * 25.6)) < 1e-4, 'Performance must be bandwidth-limited');

  // Layer 2: Compute-bound (Dense Conv, AI = 10.0 FLOPs/Byte)
  const aiCompute = 10.0;
  const perfCompute = Math.min(peakGflops, aiCompute * memBwGbps);
  assert.ok(aiCompute >= ridgePoint, 'AI=10.0 must be compute-bound');
  assert.equal(perfCompute, peakGflops, 'Performance must reach peak GFLOPS');
});

test('Research Track R06: Calibrated Stereo Projection, DLT Triangulation and Quadratic Depth Uncertainty', () => {
  // Calibrated pinhole stereo rig
  const f = 718.856;
  const cx = 607.19;
  const cy = 185.21;
  const B = 0.54; // meters baseline

  // 3D Point in front of camera
  const X_gt = 1.2;
  const Y_gt = -0.4;
  const Z_gt = 8.0;

  // Projection onto Left Camera (origin)
  const uL = (f * X_gt) / Z_gt + cx;
  const vL = (f * Y_gt) / Z_gt + cy;

  // Projection onto Right Camera (baseline B on X-axis)
  const uR = (f * (X_gt - B)) / Z_gt + cx;
  const vR = (f * Y_gt) / Z_gt + cy;

  // Disparity
  const d = uL - uR;
  const expectedDisparity = (f * B) / Z_gt;
  assert.ok(Math.abs(d - expectedDisparity) < 1e-6, 'Disparity must match (f * B) / Z');

  // Triangulation recovery
  const Z_recovered = (f * B) / d;
  const X_recovered = ((uL - cx) * Z_recovered) / f;
  const Y_recovered = ((vL - cy) * Z_recovered) / f;

  assert.ok(Math.abs(X_recovered - X_gt) < 1e-6, 'X coordinate must be recovered with zero error in noiseless case');
  assert.ok(Math.abs(Y_recovered - Y_gt) < 1e-6, 'Y coordinate must be recovered with zero error in noiseless case');
  assert.ok(Math.abs(Z_recovered - Z_gt) < 1e-6, 'Z coordinate must be recovered with zero error in noiseless case');

  // Quadratic depth uncertainty test: sigma_Z = (Z^2 / (f * B)) * sigma_d
  const sigmaD = 0.5; // 0.5 pixel disparity noise
  const sigmaZ_near = ((4.0 ** 2) / (f * B)) * sigmaD;
  const sigmaZ_far = ((16.0 ** 2) / (f * B)) * sigmaD;

  // Ratio of far/near depth uncertainty for 4x distance should be exactly 4^2 = 16x
  const ratio = sigmaZ_far / sigmaZ_near;
  assert.ok(Math.abs(ratio - 16.0) < 1e-4, 'Depth uncertainty must scale quadratically (16x for 4x distance)');
});




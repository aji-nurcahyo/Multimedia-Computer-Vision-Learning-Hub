import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculatePipelineLatency,
  calculateQueueDelay,
  calculateDropRate,
  simulateJitter,
  calculateAffineQuantizationParams,
  quantizeFloatToUint8,
  dequantizeUint8ToFloat,
  calculateQuantizationError,
  estimateModelCompression,
  calculateFrameBufferFootprint,
  simulateWorkerOffloading,
  calculateAmdahlSpeedup,
  analyzeLatencyBudget,
  estimateStaticBundleImpact,
  fuseMultimodalEventScores,
  evaluateCapstoneRubric,
} from '../src/lib/systemsProcessing.ts';

test('Ch 56 Real-Time: Pipeline Latency Calculation', () => {
  const delays = { capture: 5.0, processing: 15.0, queue: 8.0, render: 4.0 };
  const total = calculatePipelineLatency(delays);
  assert.equal(total, 32.0);
});

test('Ch 56 Real-Time: Queue Delay & Drop Rate', () => {
  // Queue occupancy 2 frames at 20 FPS processing rate -> 2 / 20 * 1000 = 100 ms
  const delay = calculateQueueDelay(2, 20);
  assert.equal(delay, 100.0);

  // Arrival 30 FPS, Service 20 FPS -> (30 - 20) / 30 = 0.3333...
  const dropRate = calculateDropRate(30, 20);
  assert.ok(Math.abs(dropRate - 1 / 3) < 1e-4);

  // Service exceeds arrival -> drop rate 0
  const noDrop = calculateDropRate(20, 30);
  assert.equal(noDrop, 0);
});

test('Ch 56 Real-Time: Jitter Simulation', () => {
  const intervals = [33.3, 34.0, 32.5, 33.8, 33.0];
  const jitter = simulateJitter(intervals);
  assert.ok(jitter.meanIntervalMs > 33.0 && jitter.meanIntervalMs < 34.0);
  assert.ok(jitter.jitterStdMs >= 0);
});

test('Ch 57 Edge AI: Affine Quantization & Dequantization', () => {
  // Range [-2.0, 6.0], numBits = 8 -> qMin=0, qMax=255
  // S = (6.0 - (-2.0)) / 255 = 8.0 / 255 = 0.0313725...
  // Z = round(2.0 / S) = round(63.75) = 64
  const params = calculateAffineQuantizationParams(-2.0, 6.0, 8);
  assert.ok(Math.abs(params.scale - 8.0 / 255) < 1e-5);
  assert.equal(params.zeroPoint, 64);

  const testVals = [-2.0, 0.0, 2.0, 6.0];
  const quantized = quantizeFloatToUint8(testVals, params.scale, params.zeroPoint);
  assert.equal(quantized[0], 0); // rMin maps to qMin (0)
  assert.equal(quantized[1], 64); // 0.0 maps to zeroPoint (64)
  assert.equal(quantized[3], 255); // rMax maps to qMax (255)

  const dequant = dequantizeUint8ToFloat(quantized, params.scale, params.zeroPoint);
  assert.ok(Math.abs(dequant[0] - -2.0) < 0.015, 'Dequantized min within one quantization step');
  assert.ok(Math.abs(dequant[1] - 0.0) < 0.015, 'Dequantized zero within one quantization step');
  assert.ok(Math.abs(dequant[3] - 6.0) < 0.015, 'Dequantized max within one quantization step');

  const err = calculateQuantizationError(testVals, dequant);
  assert.ok(err.mse < 0.001);
  assert.ok(err.snrDb > 35.0);
});

test('Ch 57 Edge AI: Model Compression Estimation', () => {
  // 1,000,000 parameters: FP32 (4 MB) -> INT8 (1 MB) -> 4x compression, 75% savings
  const comp = estimateModelCompression(1_000_000, 32, 8);
  assert.equal(comp.originalSizeBytes, 4_000_000);
  assert.equal(comp.compressedSizeBytes, 1_000_000);
  assert.equal(comp.compressionRatio, 4.0);
  assert.equal(comp.memorySavingsPercent, 75.0);
});

test('Ch 58 Web Multimedia: Frame Buffer & Worker Offloading', () => {
  // 1920 x 1080 RGBA -> 1920 * 1080 * 4 = 8,294,400 bytes (~7.91 MB)
  const fp = calculateFrameBufferFootprint(1920, 1080, 4, 60);
  assert.equal(fp.bytesPerFrame, 8_294_400);
  assert.ok(Math.abs(fp.mbPerFrame - 7.91) < 0.01);
  assert.ok(fp.megapixelsPerSecond > 120);

  // Worker offload: 25ms worker proc, 2ms serialization -> UI thread blocks only 2ms (<16.67ms)
  const workerSim = simulateWorkerOffloading(25, 25, 2);
  assert.equal(workerSim.mainThreadBlockingMs, 2.0);
  assert.equal(workerSim.uiResponsive, true);
  assert.equal(workerSim.droppedFramesUnder60Fps, false);
});

test('Ch 59 Optimization: Amdahl Law & Latency Budget', () => {
  // 80% parallelizable (p=0.8), 4x speedup (s=4)
  // S_overall = 1 / ((1 - 0.8) + 0.8 / 4) = 1 / (0.2 + 0.2) = 1 / 0.4 = 2.5x
  const speedup = calculateAmdahlSpeedup(0.8, 4.0);
  assert.equal(speedup, 2.5);

  const budget = analyzeLatencyBudget(
    { capture: 2.5, preprocess: 1.5, inference: 8.0, postprocess: 1.0 },
    60
  );
  assert.equal(budget.totalLatencyMs, 13.0);
  assert.ok(Math.abs(budget.targetBudgetMs - 16.67) < 0.01);
  assert.equal(budget.meetsBudget, true);
  assert.equal(budget.bottleneckStage, 'inference');
  assert.ok(budget.achievableFps > 70.0);
});

test('Ch 59 Optimization: Static Bundle Footprint', () => {
  const sizes = { vendor: 150, app: 50, styles: 20 };
  const bundle = estimateStaticBundleImpact(sizes, 0.3);
  assert.equal(bundle.rawTotalKb, 220.0);
  assert.equal(bundle.gzippedTotalKb, 66.0);
  assert.ok(bundle.estimatedLoadTime3GMs > 0);
});

test('Ch 60 Capstone: Sensor Fusion & Rubric Evaluation', () => {
  // Visual 0.9 (w=0.6), Audio 0.3 (w=0.25), Context 0.2 (w=0.15)
  // Fused = 0.9*0.6 + 0.3*0.25 + 0.2*0.15 = 0.54 + 0.075 + 0.03 = 0.645
  const fusion = fuseMultimodalEventScores(0.9, 0.3, 0.2);
  assert.ok(Math.abs(fusion.fusedConfidence - 0.645) < 1e-3);
  assert.equal(fusion.isTriggered, true);
  assert.equal(fusion.dominantModality, 'visual');

  const rubric = evaluateCapstoneRubric({
    architecture: 23,
    implementation: 32,
    evaluation: 22,
    documentation: 14,
  });
  assert.equal(rubric.totalScore, 91.0);
  assert.equal(rubric.grade, 'A');
  assert.equal(rubric.isPassing, true);
  assert.equal(rubric.recommendations.length, 0);
});

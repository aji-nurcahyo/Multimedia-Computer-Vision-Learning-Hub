import test from 'node:test';
import assert from 'node:assert/strict';

import {
  l2Normalize,
  earlyFusionConcat,
  lateFusionWeighted,
  intermediateCrossModalAttention,
  computeCrossModalSimilarity,
  zeroShotClassify,
  computeAudioVisualCorrelation,
  rankByCosineSimilarity,
  computeRetrievalMetrics,
  runMultimodalPipeline
} from '../src/lib/multimodalProcessing.ts';

test('Multimodal Fusion: L2 Normalize and Early Fusion Concat', () => {
  const v = [3, 4];
  const normV = l2Normalize(v);
  assert.ok(Math.abs(normV[0] - 0.6) < 1e-4);
  assert.ok(Math.abs(normV[1] - 0.8) < 1e-4);

  const feat1 = [1, 2];
  const feat2 = [3, 4];
  const early = earlyFusionConcat([feat1, feat2]);
  assert.equal(early.length, 4);
  const normSq = early.reduce((acc, x) => acc + x * x, 0);
  assert.ok(Math.abs(normSq - 1.0) < 1e-4, 'Early fusion vector has unit norm');
});

test('Multimodal Fusion: Late Fusion Weighted Decisions', () => {
  // 3 classes: [Dog, Cat, Bird]
  const visualPred = [0.8, 0.1, 0.1];
  const audioPred = [0.2, 0.7, 0.1];
  // Weight visual: 0.6, audio: 0.4
  // Dog: 0.6*0.8 + 0.4*0.2 = 0.48 + 0.08 = 0.56
  // Cat: 0.6*0.1 + 0.4*0.7 = 0.06 + 0.28 = 0.34
  // Bird: 0.6*0.1 + 0.4*0.1 = 0.06 + 0.04 = 0.10
  const fused = lateFusionWeighted([visualPred, audioPred], [0.6, 0.4]);
  assert.ok(Math.abs(fused[0] - 0.56) < 1e-4, 'Class 0 matches expected weighted prob');
  assert.ok(Math.abs(fused[1] - 0.34) < 1e-4, 'Class 1 matches expected weighted prob');
  assert.ok(Math.abs(fused[2] - 0.10) < 1e-4, 'Class 2 matches expected weighted prob');
  const sum = fused.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-4, 'Fused probabilities sum to 1.0');
});

test('Multimodal Cross-Attention: Intermediate Attention', () => {
  const query = [1, 0];
  const keys = [[1, 0], [0, 1]];
  const values = [[10, 20], [30, 40]];

  const { attentionWeights, fusedOutput } = intermediateCrossModalAttention(query, keys, values);
  assert.equal(attentionWeights.length, 2);
  const sumW = attentionWeights[0] + attentionWeights[1];
  assert.ok(Math.abs(sumW - 1.0) < 1e-4, 'Attention weights sum to 1.0');
  assert.ok(attentionWeights[0] > attentionWeights[1], 'Query aligns with key[0]');
  assert.equal(fusedOutput.length, 2);
});

test('Vision-Language: Zero-Shot Classification', () => {
  const imageEmbed = [0.9, 0.1, 0.0];
  const classEmbeddings = [
    { className: 'Automobile', embedding: [0.85, 0.15, 0.0] },
    { className: 'AeroPlane', embedding: [0.1, 0.9, 0.0] },
    { className: 'Animal', embedding: [0.0, 0.1, 0.9] }
  ];

  const results = zeroShotClassify(imageEmbed, classEmbeddings, 0.1);
  assert.equal(results[0].className, 'Automobile', 'Top prediction is Automobile');
  assert.ok(results[0].score > 0.8, 'Top-1 confidence is high');
  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
  assert.ok(Math.abs(totalScore - 1.0) < 1e-4, 'Softmax probabilities sum to 1.0');
});

test('Audio-Visual: Correlation and Temporal Synchronization', () => {
  // Synchronized signals
  const audio = [0.1, 0.5, 0.9, 0.2, 0.1];
  const video = [0.1, 0.5, 0.9, 0.2, 0.1];
  const syncResult = computeAudioVisualCorrelation(audio, video);
  assert.ok(syncResult.correlation > 0.95, 'Identical envelopes have near 1.0 correlation');
  assert.equal(syncResult.lagOffsetMs, 0, 'Zero lag offset');
  assert.equal(syncResult.isSynchronized, true, 'Marked as synchronized');

  // Offset signal (video lagging audio by 1 step)
  const videoLag = [0.0, 0.1, 0.5, 0.9, 0.2];
  const lagResult = computeAudioVisualCorrelation(audio, videoLag);
  assert.ok(lagResult.lagOffsetMs !== 0, 'Non-zero lag detected');
});

test('Cross-Modal Retrieval: Ranking and Evaluation Metrics (Recall@K, MRR)', () => {
  const query = [1, 0, 0];
  const db = [
    { id: 'item1', title: 'Car', category: 'vehicle', embedding: [0.9, 0.1, 0] },
    { id: 'item2', title: 'Dog', category: 'animal', embedding: [0.1, 0.9, 0] },
    { id: 'item3', title: 'Truck', category: 'vehicle', embedding: [0.8, 0.2, 0] },
    { id: 'item4', title: 'Cat', category: 'animal', embedding: [0.0, 0.8, 0.2] }
  ];

  const ranked = rankByCosineSimilarity(query, db);
  assert.equal(ranked[0].id, 'item1', 'Most similar item ranked first');
  assert.equal(ranked[1].id, 'item3', 'Second most similar item ranked second');

  // Ground truth relevant items: item1 and item3
  const relevant = new Set(['item1', 'item3']);
  const metricsK2 = computeRetrievalMetrics(ranked, relevant, 2);
  assert.equal(metricsK2.recallAtK, 1.0, 'Recall@2 is 100% since both relevant items are in Top-2');
  assert.equal(metricsK2.precisionAtK, 1.0, 'Precision@2 is 100% since both top-2 items are relevant');
  assert.equal(metricsK2.mrr, 1.0, 'MRR is 1.0 since rank of first relevant item is 1');
});

test('Multimodal Pipeline: End-to-End System Integration', () => {
  const sample = {
    id: 'sample-01',
    title: 'Highway Traffic with Siren',
    visualFeatures: [0.8, 0.5, 0.1, 0.2],
    audioFeatures: [0.7, 0.6, 0.2, 0.1],
    textDescription: 'Emergency vehicle driving with siren active',
    groundTruthCategory: 'Emergency Traffic'
  };

  const categoryEmbeddings = {
    'Emergency Traffic': [0.8, 0.5, 0.7, 0.6],
    'Pedestrian Walk': [0.1, 0.2, 0.1, 0.3],
    'Quiet Nature': [0.0, 0.1, 0.0, 0.1]
  };

  const out = runMultimodalPipeline(sample, categoryEmbeddings, { visual: 0.5, audio: 0.5, text: 0 });
  assert.equal(out.sampleId, 'sample-01');
  assert.equal(out.predictedCategory, 'Emergency Traffic', 'Correct category predicted');
  assert.ok(out.confidence > 0.6, 'High confidence prediction');
  assert.equal(out.earlyFusionVector.length, 8, 'Early fusion vector has 8 dimensions');
});


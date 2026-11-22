import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeAffineMatrix,
  invert3x3,
  detectHarrisCorners,
  matchDescriptors,
  projectPoint3D,
  computeReprojectionError,
  computeStereoDisparity,
  disparityToDepth,
  matchTemplateNCC,
  conv2D,
  relu,
  maxPool2D,
  softmax,
  computeIoU,
  nonMaxSuppression,
  computeSegmentationMetrics,
  computeScaledDotProductAttention,
  rotateAndProject3D,
  cosineSimilarity,
  computeClassificationMetrics
} from '../src/lib/cvProcessing.ts';

test('CV Geometry: Affine matrix and 3x3 inversion', () => {
  const M = computeAffineMatrix({
    tx: 10,
    ty: 20,
    scaleX: 2,
    scaleY: 2,
    rotationDeg: 90,
    shearX: 0
  });

  // rotation 90 deg: cos(90) = 0, sin(90) = 1
  assert.ok(Math.abs(M[0][0] - 0) < 1e-4, 'M[0][0] approx 0');
  assert.ok(Math.abs(M[0][1] - (-2)) < 1e-4, 'M[0][1] approx -2');
  assert.equal(M[0][2], 10, 'tx is 10');
  assert.equal(M[1][2], 20, 'ty is 20');

  const invM = invert3x3(M);
  assert.ok(invM !== null, 'Matrix is invertible');

  // Verify M * invM = I
  const p = [15, 25, 1];
  const pPrime = [
    M[0][0] * p[0] + M[0][1] * p[1] + M[0][2],
    M[1][0] * p[0] + M[1][1] * p[1] + M[1][2],
    1
  ];
  const pRecovered = [
    invM[0][0] * pPrime[0] + invM[0][1] * pPrime[1] + invM[0][2],
    invM[1][0] * pPrime[0] + invM[1][1] * pPrime[1] + invM[1][2]
  ];
  assert.ok(Math.abs(pRecovered[0] - p[0]) < 1e-3, 'Recovered X matches');
  assert.ok(Math.abs(pRecovered[1] - p[1]) < 1e-3, 'Recovered Y matches');
});

test('CV Features: Harris corner detector and Lowe ratio test', () => {
  // Create a 20x20 synthetic image with a high contrast square at (5,5) to (15,15)
  const W = 20;
  const H = 20;
  const gray = new Uint8Array(W * H);
  for (let y = 5; y <= 15; y++) {
    for (let x = 5; x <= 15; x++) {
      gray[y * W + x] = 255;
    }
  }

  const corners = detectHarrisCorners(gray, W, H, 500);
  assert.ok(corners.length >= 4, `Detected at least 4 corners (got ${corners.length})`);

  // Test matching identical corner descriptors
  const matches = matchDescriptors(corners, corners, 0.9);
  assert.ok(matches.length > 0, 'Self matches found');
  assert.equal(matches[0].distance, 0, 'Exact self-match distance is 0');
});

test('CV Camera Calibration & Reprojection Error', () => {
  const K = { fx: 500, fy: 500, cx: 320, cy: 240, k1: 0, k2: 0 };
  const pt = projectPoint3D(0, 0, 2.0, K);
  assert.equal(pt.u, 320, 'Optical axis projects to principal point cx');
  assert.equal(pt.v, 240, 'Optical axis projects to principal point cy');

  const ptOff = projectPoint3D(1.0, 0.5, 2.0, K);
  // u = 500 * (1/2) + 320 = 250 + 320 = 570
  // v = 500 * (0.5/2) + 240 = 125 + 240 = 365
  assert.equal(ptOff.u, 570, 'Calculated u matches projection');
  assert.equal(ptOff.v, 365, 'Calculated v matches projection');

  const rmse = computeReprojectionError([ptOff], [{ u: 572, v: 365 }]);
  assert.ok(Math.abs(rmse - 2.0) < 1e-4, 'Reprojection error matches offset');
});

test('CV Stereo Vision: Disparity and Depth Calculation', () => {
  const W = 40;
  const H = 20;
  const left = new Uint8Array(W * H);
  const right = new Uint8Array(W * H);

  // Add background noise/texture so zero-disparity background has non-zero texture
  for (let i = 0; i < W * H; i++) {
    left[i] = (i * 17) % 50;
    right[i] = (i * 17) % 50;
  }

  // Place a distinct textured feature at x=20..26, y=8..12, shifted by 4px in right image
  for (let y = 8; y <= 12; y++) {
    for (let x = 20; x <= 26; x++) {
      const val = 150 + ((x + y * 7) % 100);
      left[y * W + x] = val;
      right[y * W + (x - 4)] = val;
    }
  }

  const dispMap = computeStereoDisparity(left, right, W, H, 10, 3);
  const dispAtTarget = dispMap[10 * W + 23];
  assert.equal(dispAtTarget, 4, 'Stereo correspondence detects 4px disparity');

  const depth = disparityToDepth(4, 500, 0.1); // f=500px, B=0.1m
  // Z = (500 * 0.1) / 4 = 12.5 meters
  assert.equal(depth, 12.5, 'Depth matches Z = f*B/d formula');
});

test('CV Classical Recognition: Template Matching NCC', () => {
  const imgW = 20;
  const imgH = 20;
  const img = new Uint8Array(imgW * imgH);

  const tplW = 4;
  const tplH = 4;
  const tpl = new Uint8Array([
    200, 50,  50, 200,
     50, 200, 200, 50,
     50, 200, 200, 50,
    200, 50,  50, 200
  ]);

  // Embed template at (10, 10)
  for (let y = 0; y < tplH; y++) {
    for (let x = 0; x < tplW; x++) {
      img[(10 + y) * imgW + (10 + x)] = tpl[y * tplW + x];
    }
  }

  const res = matchTemplateNCC(img, imgW, imgH, tpl, tplW, tplH);
  assert.equal(res.bestX, 10, 'Template matched at correct X');
  assert.equal(res.bestY, 10, 'Template matched at correct Y');
  assert.ok(res.score > 0.99, 'NCC score is close to 1.0');
});

test('CV CNN Layers: Conv2D, ReLU, MaxPool, and Softmax', () => {
  const inData = new Float32Array([
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 14, 15, 16
  ]);

  const kernel = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ];
  const { output: convOut } = conv2D(inData, 4, 4, kernel, 0);
  assert.equal(convOut[5], 6, 'Identity 3x3 kernel preserves center value');

  const negData = new Float32Array([-5, 3, -2, 8]);
  const reluOut = relu(negData);
  assert.deepEqual(Array.from(reluOut), [0, 3, 0, 8], 'ReLU zeros out negative values');

  const { output: poolOut, outW, outH } = maxPool2D(inData, 4, 4, 2);
  assert.equal(outW, 2);
  assert.equal(outH, 2);
  assert.equal(poolOut[0], 6, 'Max pool top-left block');
  assert.equal(poolOut[1], 8, 'Max pool top-right block');
  assert.equal(poolOut[2], 14, 'Max pool bottom-left block');
  assert.equal(poolOut[3], 16, 'Max pool bottom-right block');

  const sm = softmax([2.0, 1.0, 0.1]);
  const sum = sm.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-5, 'Softmax probabilities sum to 1.0');
  assert.ok(sm[0] > sm[1] && sm[1] > sm[2], 'Softmax preserves ranking order');
});

test('CV Object Detection: IoU and Non-Maximum Suppression (NMS)', () => {
  const b1 = { label: 'car', x: 10, y: 10, w: 20, h: 20, confidence: 0.9 };
  const b2 = { label: 'car', x: 15, y: 10, w: 20, h: 20, confidence: 0.8 };
  // Inter: x in [15, 30] -> w=15, y in [10, 30] -> h=20. InterArea = 15*20 = 300
  // Area1 = 400, Area2 = 400. Union = 400 + 400 - 300 = 500
  // IoU = 300 / 500 = 0.6
  const iou = computeIoU(b1, b2);
  assert.equal(iou, 0.6, 'IoU computed accurately');

  const nmsResult = nonMaxSuppression([b1, b2], 0.5, 0.5);
  assert.equal(nmsResult.length, 1, 'NMS suppresses highly overlapping box');
  assert.equal(nmsResult[0].confidence, 0.9, 'NMS preserves higher confidence box');
});

test('CV Segmentation: mIoU and Dice Score', () => {
  const pred = new Uint8Array([1, 1, 1, 0]);
  const gt   = new Uint8Array([0, 1, 1, 1]);
  // TP: idx 1, 2 -> 2
  // FP: idx 0 -> 1
  // FN: idx 3 -> 1
  // IoU = 2 / (2 + 1 + 1) = 0.5
  // Dice = 2*2 / (2*2 + 1 + 1) = 4 / 6 = 0.6667
  const metrics = computeSegmentationMetrics(pred, gt);
  assert.equal(metrics.tp, 2);
  assert.equal(metrics.fp, 1);
  assert.equal(metrics.fn, 1);
  assert.equal(metrics.iou, 0.5, 'IoU matches Jaccard Index');
  assert.ok(Math.abs(metrics.dice - 4 / 6) < 1e-4, 'Dice matches F1 formulation');
});

test('CV Vision Transformer: Scaled Dot-Product Attention', () => {
  const Q = [
    [1, 0],
    [0, 1]
  ];
  const K = [
    [1, 0],
    [0, 1]
  ];
  const V = [
    [10, 20],
    [30, 40]
  ];

  const { attentionWeights, output } = computeScaledDotProductAttention(Q, K, V);
  assert.equal(attentionWeights.length, 2);
  const row0Sum = attentionWeights[0][0] + attentionWeights[0][1];
  assert.ok(Math.abs(row0Sum - 1.0) < 1e-4, 'Attention weights row sum to 1.0');
  assert.ok(attentionWeights[0][0] > attentionWeights[0][1], 'Diagonal self-attention is highest');
  assert.equal(output.length, 2);
});

test('CV Embeddings & Cosine Similarity', () => {
  const v1 = [1, 0, 0];
  const v2 = [1, 0, 0];
  const v3 = [0, 1, 0];
  const v4 = [-1, 0, 0];

  assert.equal(cosineSimilarity(v1, v2), 1.0, 'Identical vectors have similarity 1.0');
  assert.equal(cosineSimilarity(v1, v3), 0.0, 'Orthogonal vectors have similarity 0.0');
  assert.equal(cosineSimilarity(v1, v4), -1.0, 'Opposite vectors have similarity -1.0');
});

test('CV Model Evaluation: Confusion Matrix and Metrics', () => {
  // 3 classes: Cat, Dog, Bird
  // Actual \ Predicted
  const cm = [
    [8, 1, 1], // Cat: 8 correct, 1 dog, 1 bird (10 total)
    [2, 7, 1], // Dog: 2 cat, 7 correct, 1 bird (10 total)
    [0, 1, 9]  // Bird: 0 cat, 1 dog, 9 correct (10 total)
  ];
  // Total samples = 30, correct = 8 + 7 + 9 = 24. Accuracy = 24 / 30 = 0.8
  const res = computeClassificationMetrics(cm);
  assert.equal(res.accuracy, 0.8, 'Accuracy is 80%');
  assert.ok(res.precision > 0.75, 'Macro precision is computed');
  assert.ok(res.recall > 0.75, 'Macro recall is computed');
  assert.ok(res.f1Score > 0.75, 'Macro F1 score is computed');
});

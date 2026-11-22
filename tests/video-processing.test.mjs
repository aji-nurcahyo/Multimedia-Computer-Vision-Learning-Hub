import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeFrameDifference,
  applyTemporalAveraging,
  computeTemporalMedian,
  computeLucasKanadeOpticalFlow,
  createForegroundMask,
  morphologicalCleanMask,
  extractBoundingBoxes,
  KalmanFilter2D,
  SimpleMultiObjectTracker,
  detectLineCrossing,
  calculateFramePsnr,
} from '../src/lib/videoProcessing.ts';

test('Video Frame Difference: computes pixelwise absolute difference', () => {
  const f1 = new Float32Array([10, 50, 100, 200]);
  const f2 = new Float32Array([15, 40, 100, 250]);
  const diff = computeFrameDifference(f1, f2);
  assert.deepEqual(Array.from(diff), [5, 10, 0, 50]);
});

test('Temporal Filtering: Running average and median filter noise', () => {
  const bg = new Float32Array([100, 100]);
  const curr = new Float32Array([200, 200]);
  const updated = applyTemporalAveraging(bg, curr, 0.1);
  assert.equal(Math.round(updated[0]), 110);

  // Median across 3 frames: [100, 250, 102] -> median is 102
  const f1 = new Float32Array([100]);
  const f2 = new Float32Array([250]); // impulse noise
  const f3 = new Float32Array([102]);
  const median = computeTemporalMedian([f1, f2, f3], 1, 1);
  assert.equal(median[0], 102);
});

test('Optical Flow Lucas-Kanade: detects horizontal translation', () => {
  const w = 64, h = 64;
  const prev = new Float32Array(w * h).fill(50);
  const curr = new Float32Array(w * h).fill(50);

  // Draw bright square at (20, 20) in prev
  for (let y = 20; y <= 35; y++) {
    for (let x = 20; x <= 35; x++) {
      prev[y * w + x] = 200;
    }
  }

  // Shifted 2 pixels right to (22, 20) in curr
  for (let y = 20; y <= 35; y++) {
    for (let x = 22; x <= 37; x++) {
      curr[y * w + x] = 200;
    }
  }

  const flows = computeLucasKanadeOpticalFlow(prev, curr, w, h, 8, 5);
  assert.ok(flows.length > 0, 'Optical flow vectors should be detected');
  // Average u should be positive (moving right)
  const avgU = flows.reduce((acc, v) => acc + v.u, 0) / flows.length;
  assert.ok(avgU > 0, `Expected positive horizontal flow, got ${avgU}`);
});

test('Background Subtraction & Bounding Box extraction', () => {
  const w = 40, h = 40;
  const diff = new Float32Array(w * h).fill(5);

  // Object moving with high difference
  for (let y = 10; y <= 20; y++) {
    for (let x = 15; x <= 25; x++) {
      diff[y * w + x] = 80;
    }
  }

  const mask = createForegroundMask(diff, 30);
  const cleaned = morphologicalCleanMask(mask, w, h);
  const boxes = extractBoundingBoxes(cleaned, w, h, 20);

  assert.equal(boxes.length, 1, 'Should extract exactly one moving object bounding box');
  assert.ok(boxes[0].width >= 8 && boxes[0].height >= 8);
});

test('Kalman Filter 2D: Smooths noisy measurements and tracks trajectory', () => {
  const kf = new KalmanFilter2D(0, 0, 0.5, 2.0);
  
  // Object moving with velocity vx = 5, vy = 2
  for (let t = 1; t <= 10; t++) {
    kf.predict(1.0);
    const measuredX = t * 5 + (Math.random() * 2 - 1);
    const measuredY = t * 2 + (Math.random() * 2 - 1);
    kf.update(measuredX, measuredY);
  }

  const state = kf.getState();
  assert.ok(Math.abs(state[0] - 50) < 5, `X should be close to 50 (got ${state[0]})`);
  assert.ok(Math.abs(state[1] - 20) < 5, `Y should be close to 20 (got ${state[1]})`);
});

test('Multi-Object Tracker: Maintains track IDs across frames', () => {
  const tracker = new SimpleMultiObjectTracker(50, 5);

  // Frame 1: Two objects at (10, 10) and (100, 100)
  tracker.update([
    { x: 5, y: 5, width: 10, height: 10 },
    { x: 95, y: 95, width: 10, height: 10 },
  ]);
  assert.equal(tracker.tracks.length, 2);
  const id1 = tracker.tracks[0].id;
  const id2 = tracker.tracks[1].id;

  // Frame 2: Objects moved slightly
  tracker.update([
    { x: 8, y: 8, width: 10, height: 10 },
    { x: 102, y: 102, width: 10, height: 10 },
  ]);
  assert.equal(tracker.tracks.length, 2);
  assert.equal(tracker.tracks[0].id, id1, 'Track ID 1 should persist');
  assert.equal(tracker.tracks[1].id, id2, 'Track ID 2 should persist');
});

test('Line Crossing Detection & PSNR calculation', () => {
  const track = {
    id: 1,
    bbox: { x: 50, y: 90, width: 20, height: 20 },
    centroid: [60, 100],
    velocity: [0, 10],
    age: 5,
    totalVisibleCount: 5,
    consecutiveInvisibleCount: 0,
    trajectory: [[60, 80], [60, 110]],
  };

  const crossing = detectLineCrossing(track, 95, 1.5);
  assert.ok(crossing !== null, 'Line crossing should be detected');
  assert.equal(crossing?.direction, 'in');

  const f1 = new Float32Array([100, 150, 200]);
  const f2 = new Float32Array([100, 150, 200]);
  const psnrExact = calculateFramePsnr(f1, f2);
  assert.equal(psnrExact, 100.0, 'Identical frames should yield 100 dB PSNR');
});

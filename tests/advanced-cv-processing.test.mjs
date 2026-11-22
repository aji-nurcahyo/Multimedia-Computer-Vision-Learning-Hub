import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSvd2x2,
  lowRankApprox2x2,
  fitLineLeastSquares,
  rodriguesRotation,
  createKalmanState2D,
  kalmanPredict2D,
  kalmanUpdate2D,
  associateDetectionsToTracks,
  solveBipartiteMatchingGreedy,
  solveHungarianMatching,
  simulateAtmosphericHaze,
  computeDarkChannel,
  computeExpectedCalibrationError,
  computeImageMetrics,
  svdGeneral,
  convolve2D,
  softThreshold,
  computeTotalVariation,
  solveTikhonov1D,
  solveAdmmTvDenoising,
  projectPoint3D,
  computeEpipolarLine,
  computeSampsonDistance,
  estimateFundamentalMatrix8Point,
  triangulatePointLinear,
  decomposeEssentialMatrix,
  computeReprojectionRmse,
  optimizeBundleAdjustmentSynthetic,
  scaledDotProductAttention,
  multiHeadAttention,
  bilinearInterpolate2D,
  deformableAttention2D,
  boxIoU,
  boxGIoU,
  focalLoss,
  computeDetrMatchingCost,
  hungarianMatchingDetr,
  cosineSimilarity,
  l2Normalize,
  computeInfoNceLoss,
  applyLoraWeights,
  computeLoraParamCount,
  temperatureScaledSoftmax,
  computeAffineQuantizationParams,
  quantizeAffineInt8,
  dequantizeAffineInt8,
  computeQuantizationError,
  straightThroughEstimator,
  structuredChannelPruning,
  computeArithmeticIntensity,
  evaluateRooflineModel,
  calculateLatencyPercentiles
} from '../src/lib/advancedCvProcessing.ts';

test('ADV-01 SVD 2x2: Analytical decomposition reconstructs A and produces orthogonal matrices', () => {
  // Test matrix A = [[3, 1], [1, 3]] (symmetric positive definite, known eigenvalues 4 and 2)
  const A = [
    [3, 1],
    [1, 3]
  ];
  const svd = computeSvd2x2(A);

  assert.ok(Math.abs(svd.S[0] - 4) < 1e-4, `Expected sigma1 ~ 4, got ${svd.S[0]}`);
  assert.ok(Math.abs(svd.S[1] - 2) < 1e-4, `Expected sigma2 ~ 2, got ${svd.S[1]}`);
  assert.ok(Math.abs(svd.conditionNumber - 2.0) < 1e-4, `Expected kappa ~ 2.0, got ${svd.conditionNumber}`);

  // Check U orthogonality: U * U^T = I
  const u00 = svd.U[0][0] * svd.U[0][0] + svd.U[0][1] * svd.U[0][1];
  const u11 = svd.U[1][0] * svd.U[1][0] + svd.U[1][1] * svd.U[1][1];
  const u01 = svd.U[0][0] * svd.U[1][0] + svd.U[0][1] * svd.U[1][1];
  assert.ok(Math.abs(u00 - 1) < 1e-4, 'U row 0 must be unit norm');
  assert.ok(Math.abs(u11 - 1) < 1e-4, 'U row 1 must be unit norm');
  assert.ok(Math.abs(u01) < 1e-4, 'U rows must be orthogonal');

  // Reconstruct A_recon = U * diag(S) * Vt
  const A_recon = lowRankApprox2x2(svd, 2);
  assert.ok(Math.abs(A_recon[0][0] - A[0][0]) < 1e-4, 'Reconstructed [0,0] must match original');
  assert.ok(Math.abs(A_recon[0][1] - A[0][1]) < 1e-4, 'Reconstructed [0,1] must match original');
  assert.ok(Math.abs(A_recon[1][0] - A[1][0]) < 1e-4, 'Reconstructed [1,0] must match original');
  assert.ok(Math.abs(A_recon[1][1] - A[1][1]) < 1e-4, 'Reconstructed [1,1] must match original');

  // Rank-1 approximation should capture dominant energy
  const A_rank1 = lowRankApprox2x2(svd, 1);
  assert.ok(A_rank1[0][0] > 0 && A_rank1[1][1] > 0, 'Rank-1 matrix elements must be non-zero');
});

test('ADV-01 Least Squares: Linear regression recovers true slope and intercept', () => {
  // Line y = 2.5 * x + 4.0
  const points = [
    [0, 4.0],
    [1, 6.5],
    [2, 9.0],
    [3, 11.5],
    [4, 14.0]
  ];
  const fit = fitLineLeastSquares(points);

  assert.ok(Math.abs(fit.m - 2.5) < 1e-4, `Expected slope 2.5, got ${fit.m}`);
  assert.ok(Math.abs(fit.c - 4.0) < 1e-4, `Expected intercept 4.0, got ${fit.c}`);
  assert.ok(Math.abs(fit.r2 - 1.0) < 1e-4, `Expected R^2 = 1.0 for perfect line, got ${fit.r2}`);
});

test('ADV-01 Rodrigues Formula: Exponential map generates valid SO(3) rotation matrix', () => {
  // 90-degree rotation around Z axis: omega = [0, 0, pi/2]
  const omega = [0, 0, Math.PI / 2];
  const R = rodriguesRotation(omega);

  // [ [0, -1, 0], [1, 0, 0], [0, 0, 1] ]
  assert.ok(Math.abs(R[0][0] - 0) < 1e-4, 'R[0][0] must be ~0');
  assert.ok(Math.abs(R[0][1] - (-1)) < 1e-4, 'R[0][1] must be ~-1');
  assert.ok(Math.abs(R[1][0] - 1) < 1e-4, 'R[1][0] must be ~1');
  assert.ok(Math.abs(R[2][2] - 1) < 1e-4, 'R[2][2] must be ~1');

  // Verify orthogonality: R * R^T = I
  const row0_norm = R[0][0] * R[0][0] + R[0][1] * R[0][1] + R[0][2] * R[0][2];
  assert.ok(Math.abs(row0_norm - 1) < 1e-4, 'Row 0 must be unit norm');
});

test('ADV-03 Kalman Filter 2D: State prediction and measurement update converge accurately', () => {
  const init = createKalmanState2D(10, 20);
  assert.equal(init.x, 10);
  assert.equal(init.y, 20);

  // Predict with dt = 1.0
  const pred = kalmanPredict2D(init, 1.0, 0.5);
  assert.equal(pred.x, 10, 'Position unchanged with 0 velocity');

  // Update with measurement at (12, 22)
  const { updated, mahalanobis } = kalmanUpdate2D(pred, 12, 22, 2.0);
  assert.ok(updated.x > 10 && updated.x < 12, 'Updated X must lie between prior and measurement');
  assert.ok(updated.y > 20 && updated.y < 22, 'Updated Y must lie between prior and measurement');
  assert.ok(updated.cov[0][0] < pred.cov[0][0], 'Measurement update must reduce position uncertainty');
  assert.ok(mahalanobis > 0, 'Mahalanobis distance must be positive');
});

test('ADV-03 Bipartite Association: Matches tracks to detections and handles unassigned', () => {
  const tracks = [
    { x: 100, y: 100 },
    { x: 200, y: 200 }
  ];
  const detections = [
    { x: 102, y: 99 },  // Close to track 0
    { x: 500, y: 500 }   // Far away (unmatched detection)
  ];

  const result = associateDetectionsToTracks(tracks, detections, 30.0);
  assert.equal(result.matches.length, 1, 'Should find exactly 1 valid match within threshold');
  assert.equal(result.matches[0].trackIdx, 0);
  assert.equal(result.matches[0].detectionIdx, 0);
  assert.equal(result.unmatchedTracks.length, 1, 'Track 1 must be unmatched');
  assert.equal(result.unmatchedTracks[0], 1);
  assert.equal(result.unmatchedDetections.length, 1, 'Detection 1 must be unmatched');
  assert.equal(result.unmatchedDetections[0], 1);
});

test('ADV-03 LSAP Counterexample: Greedy vs Hungarian optimal assignment', () => {
  // Classic counterexample matrix where myopic greedy fails to find global optimum
  const costMatrix = [
    [1, 2],
    [2, 100]
  ];

  const greedy = solveBipartiteMatchingGreedy(costMatrix);
  assert.equal(greedy.matches.length, 2);
  assert.equal(greedy.matches[0].trackIdx, 0);
  assert.equal(greedy.matches[0].detectionIdx, 0);
  assert.equal(greedy.matches[0].cost, 1);
  assert.equal(greedy.matches[1].trackIdx, 1);
  assert.equal(greedy.matches[1].detectionIdx, 1);
  assert.equal(greedy.matches[1].cost, 100);
  assert.equal(greedy.totalCost, 101, 'Greedy assignment must yield sub-optimal total cost of 101');
  assert.equal(greedy.unmatchedTracks.length, 0);
  assert.equal(greedy.unmatchedDetections.length, 0);

  const hungarian = solveHungarianMatching(costMatrix);
  assert.equal(hungarian.matches.length, 2);
  assert.equal(hungarian.matches[0].trackIdx, 0);
  assert.equal(hungarian.matches[0].detectionIdx, 1);
  assert.equal(hungarian.matches[0].cost, 2);
  assert.equal(hungarian.matches[1].trackIdx, 1);
  assert.equal(hungarian.matches[1].detectionIdx, 0);
  assert.equal(hungarian.matches[1].cost, 2);
  assert.equal(hungarian.totalCost, 4, 'Hungarian assignment must yield globally optimal total cost of 4');
  assert.equal(hungarian.unmatchedTracks.length, 0);
  assert.equal(hungarian.unmatchedDetections.length, 0);
});

test('ADV-03 Hungarian Rectangular and Boundary Cases: Identity, non-square, gating, and empty inputs', () => {
  // 1. Identity assignment
  const identityMat = [
    [0, 50, 50],
    [50, 0, 50],
    [50, 50, 0]
  ];
  const idResult = solveHungarianMatching(identityMat);
  assert.equal(idResult.totalCost, 0);
  assert.deepEqual(idResult.matches.map(m => [m.trackIdx, m.detectionIdx]), [[0, 0], [1, 1], [2, 2]]);

  // 2. Non-square 2x3 matrix (more detections than tracks)
  const rect2x3 = [
    [10, 5, 20],
    [2, 100, 30]
  ];
  const res2x3 = solveHungarianMatching(rect2x3);
  assert.equal(res2x3.matches.length, 2);
  assert.equal(res2x3.totalCost, 7); // (0, 1) cost 5 + (1, 0) cost 2 = 7
  assert.equal(res2x3.unmatchedTracks.length, 0);
  assert.deepEqual(res2x3.unmatchedDetections, [2], 'Detection 2 must be unmatched');

  // 3. Non-square 3x2 matrix (more tracks than detections)
  const rect3x2 = [
    [10, 2],
    [5, 100],
    [20, 30]
  ];
  const res3x2 = solveHungarianMatching(rect3x2);
  assert.equal(res3x2.matches.length, 2);
  assert.equal(res3x2.totalCost, 7); // (0, 1) cost 2 + (1, 0) cost 5 = 7
  assert.deepEqual(res3x2.unmatchedTracks, [2], 'Track 2 must be unmatched');
  assert.equal(res3x2.unmatchedDetections.length, 0);

  // 4. Distance gating: drop pairs exceeding threshold
  const gated = solveHungarianMatching([[10, 5], [2, 100]], 3.0);
  // (1, 0) has cost 2 <= 3.0 -> kept; (0, 1) has cost 5 > 3.0 -> rejected
  assert.equal(gated.matches.length, 1);
  assert.equal(gated.matches[0].trackIdx, 1);
  assert.equal(gated.matches[0].detectionIdx, 0);
  assert.deepEqual(gated.unmatchedTracks, [0]);
  assert.deepEqual(gated.unmatchedDetections, [1]);

  // 5. Empty inputs
  assert.deepEqual(solveHungarianMatching([]), { matches: [], totalCost: 0, unmatchedTracks: [], unmatchedDetections: [] });
  assert.deepEqual(solveHungarianMatching([[1, 2]], -1), { matches: [], totalCost: 0, unmatchedTracks: [0], unmatchedDetections: [0, 1] });
  assert.deepEqual(solveHungarianMatching([[10], [20]], 0), { matches: [], totalCost: 0, unmatchedTracks: [0, 1], unmatchedDetections: [0] });

  // 6. Deterministic reproducibility
  for (let iter = 0; iter < 5; iter++) {
    const run = solveHungarianMatching(rect2x3);
    assert.equal(run.totalCost, 7);
  }
});

test('ADV-03 Hungarian Optimality: Exhaustive assignment oracle verification', () => {
  function getPermutations(arr) {
    if (arr.length <= 1) return [arr];
    const res = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));
      for (const p of getPermutations(rest)) {
        res.push([arr[i], ...p]);
      }
    }
    return res;
  }

  // 3x3 Test
  const mat3 = [
    [15, 40, 20],
    [30, 10, 50],
    [25, 35, 12]
  ];
  let minCost3 = Infinity;
  for (const perm of getPermutations([0, 1, 2])) {
    const cost = mat3[0][perm[0]] + mat3[1][perm[1]] + mat3[2][perm[2]];
    if (cost < minCost3) minCost3 = cost;
  }
  const hungarian3 = solveHungarianMatching(mat3);
  assert.equal(hungarian3.totalCost, minCost3, `Hungarian cost ${hungarian3.totalCost} must equal exhaustive minimum ${minCost3}`);

  // 4x4 Test
  const mat4 = [
    [82, 83, 69, 92],
    [77, 37, 49, 92],
    [11, 69, 5, 86],
    [8, 9, 98, 23]
  ];
  let minCost4 = Infinity;
  for (const perm of getPermutations([0, 1, 2, 3])) {
    const cost = mat4[0][perm[0]] + mat4[1][perm[1]] + mat4[2][perm[2]] + mat4[3][perm[3]];
    if (cost < minCost4) minCost4 = cost;
  }
  const hungarian4 = solveHungarianMatching(mat4);
  assert.equal(hungarian4.totalCost, minCost4, `Hungarian cost ${hungarian4.totalCost} must equal exhaustive minimum ${minCost4}`);
});

test('ADV-06 Atmospheric Haze & Dark Channel: Koschmieder scattering attenuates and dark channel estimates minima', () => {
  const width = 8;
  const height = 8;
  const rgb = new Uint8ClampedArray(width * height * 4);
  // Fill clean synthetic image with high brightness
  for (let i = 0; i < rgb.length; i += 4) {
    rgb[i] = 200;
    rgb[i + 1] = 150;
    rgb[i + 2] = 50;
    rgb[i + 3] = 255;
  }

  const hazy = simulateAtmosphericHaze(rgb, width, height, {
    hazeIntensity: 0.8,
    airlight: [220, 220, 220]
  });

  assert.equal(hazy.length, rgb.length);
  // In hazy image, color channel 2 (original 50) should increase towards airlight 220
  assert.ok(hazy[2] > rgb[2], 'Haze should blend distant dark channel toward airlight');

  // Dark channel test
  const darkChannel = computeDarkChannel(rgb, width, height, 2);
  assert.equal(darkChannel.length, width * height);
  // Min of (200, 150, 50) is 50
  assert.equal(darkChannel[0], 50, 'Dark channel must equal minimum channel intensity');
});

test('ADV-06 Expected Calibration Error (ECE) & Image Metrics: Computes calibration and PSNR/SSIM', () => {
  // Perfectly calibrated scenario: 10 samples with 0.8 confidence, exactly 8 correct
  const confidences = [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8];
  const labels = [true, true, true, true, true, true, true, true, false, false];

  const calib = computeExpectedCalibrationError(confidences, labels, 10);
  assert.ok(calib.ece < 0.05, `ECE for well-calibrated predictions should be small, got ${calib.ece}`);

  // Image metrics test: identical images -> PSNR high, SSIM = 1.0
  const width = 4;
  const height = 4;
  const imgA = new Uint8ClampedArray(width * height * 4).fill(128);
  const imgB = new Uint8ClampedArray(width * height * 4).fill(128);

  const metricsSame = computeImageMetrics(imgA, imgB, width, height);
  assert.equal(metricsSame.mse, 0);
  assert.ok(metricsSame.ssim >= 0.99, 'SSIM between identical images must be ~1.0');

  // Degraded image
  imgB[0] = 250;
  const metricsDiff = computeImageMetrics(imgA, imgB, width, height);
  assert.ok(metricsDiff.mse > 0, 'MSE must be positive for differing images');
});

// ============================================================================
// ADV-02: VARIATIONAL IMAGE RESTORATION & INVERSE PROBLEMS TESTS
// ============================================================================

test('ADV-02 SVD General: Rectangular Jacobi SVD accurately decomposes arbitrary M x N matrix', () => {
  const A = [
    [1, 2],
    [3, 4],
    [5, 6]
  ];
  const { U, sigma, V } = svdGeneral(A);

  assert.equal(sigma.length, 2);
  assert.ok(sigma[0] >= sigma[1], 'Singular values must be sorted in descending order');
  assert.ok(sigma[1] > 0, 'Full rank 2 matrix must have positive singular values');

  // Verify V orthogonality: V^T * V = I (2x2)
  const vt_v00 = V[0][0] * V[0][0] + V[1][0] * V[1][0];
  const vt_v11 = V[0][1] * V[0][1] + V[1][1] * V[1][1];
  const vt_v01 = V[0][0] * V[0][1] + V[1][0] * V[1][1];
  assert.ok(Math.abs(vt_v00 - 1) < 1e-4, 'V col 0 unit norm');
  assert.ok(Math.abs(vt_v11 - 1) < 1e-4, 'V col 1 unit norm');
  assert.ok(Math.abs(vt_v01) < 1e-4, 'V cols orthogonal');

  // Verify reconstruction: A_recon = U * diag(sigma) * V^T
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      let recon = 0;
      for (let k = 0; k < 2; k++) {
        recon += U[r][k] * sigma[k] * V[c][k];
      }
      assert.ok(
        Math.abs(recon - A[r][c]) < 1e-3,
        `Reconstruction error at (${r},${c}): expected ${A[r][c]}, got ${recon}`
      );
    }
  }
});

test('ADV-02 Soft-Thresholding: Shrinkage operator behaves as mathematical proximal operator of L1 norm', () => {
  assert.equal(softThreshold(5.0, 2.0), 3.0, 'S_2(5) = 3');
  assert.equal(softThreshold(-5.0, 2.0), -3.0, 'S_2(-5) = -3');
  assert.equal(softThreshold(1.5, 2.0), 0.0, 'S_2(1.5) = 0');
  assert.equal(softThreshold(-1.5, 2.0), 0.0, 'S_2(-1.5) = 0');
  assert.equal(softThreshold(0.0, 2.0), 0.0, 'S_2(0) = 0');
});

test('ADV-02 Total Variation & 2D Convolution: TV semi-norm and spatial convolution preserve invariants', () => {
  const flat = [
    [10, 10, 10],
    [10, 10, 10],
    [10, 10, 10]
  ];
  const boxKernel = [
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9]
  ];
  const convFlat = convolve2D(flat, boxKernel);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      assert.ok(Math.abs(convFlat[r][c] - 10) < 1e-5, 'Convolution on flat image must preserve value');
    }
  }

  // TV of flat image must be 0
  assert.equal(computeTotalVariation(flat, true), 0);
  assert.equal(computeTotalVariation(flat, false), 0);

  // Impulse noise image has high TV
  const noisyGrid = [
    [0, 10, 0],
    [10, 50, 10],
    [0, 10, 0]
  ];
  const tvNoisy = computeTotalVariation(noisyGrid, true);
  assert.ok(tvNoisy > 0, 'TV of noisy grid must be positive');

  // Smoothed image must have lower TV
  const smoothedGrid = convolve2D(noisyGrid, boxKernel);
  const tvSmoothed = computeTotalVariation(smoothedGrid, true);
  assert.ok(tvSmoothed < tvNoisy, 'Smoothing impulse must strictly decrease Total Variation');
});

test('ADV-02 Tikhonov Regularization 1D: Closed-form regularized least squares recovers well-conditioned solution', () => {
  // A = Identity (denoising problem): y = x + noise
  const A = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
  const y = [1.2, 2.8, 5.1];
  const lambda = 0.5;

  // Analytical solution: x_hat = y / (1 + lambda) = y / 1.5
  const xHat = solveTikhonov1D(y, A, lambda);
  assert.ok(Math.abs(xHat[0] - 1.2 / 1.5) < 1e-4);
  assert.ok(Math.abs(xHat[1] - 2.8 / 1.5) < 1e-4);
  assert.ok(Math.abs(xHat[2] - 5.1 / 1.5) < 1e-4);
});

test('ADV-02 ADMM TV Denoising: Primal residual decreases and TV semi-norm is reduced on noisy step', () => {
  const N = 8;
  const clean = Array.from({ length: N }, (_, r) =>
    Array.from({ length: N }, (_, c) => (c < N / 2 ? 20 : 80))
  );

  // Add synthetic noise
  const noisy = clean.map((row, r) =>
    row.map((val, c) => val + ((r + c) % 2 === 0 ? 15 : -15))
  );

  const initialTV = computeTotalVariation(noisy, true);
  const { restored, primalResiduals, dualResiduals } = solveAdmmTvDenoising(noisy, 5.0, 1.0, 20);

  const finalTV = computeTotalVariation(restored, true);
  assert.ok(finalTV < initialTV, `ADMM TV denoising must reduce TV: initial ${initialTV}, final ${finalTV}`);
  assert.ok(primalResiduals.length === 20, 'Should record 20 iterations');
  assert.ok(primalResiduals[primalResiduals.length - 1] < primalResiduals[0], 'Primal residual must decrease');
});

// ============================================================================
// ADV-05: MULTI-VIEW GEOMETRY & 3D COMPUTER VISION TESTS
// ============================================================================

test('ADV-05 Pinhole Camera Projection: Inhomogeneous projection maps 3D world coordinates to pixel plane', () => {
  const K = [
    [800, 0, 320],
    [0, 800, 240],
    [0, 0, 1]
  ];
  const R = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
  const t = [0, 0, 0];

  // Point on principal axis at Z = 4
  const P1 = [0, 0, 4];
  const [u1, v1] = projectPoint3D(P1, K, R, t);
  assert.ok(Math.abs(u1 - 320) < 1e-4, 'Point on optical axis must project to principal point u0');
  assert.ok(Math.abs(v1 - 240) < 1e-4, 'Point on optical axis must project to principal point v0');

  // Point off axis: X = 1, Y = -1, Z = 4 -> xn = 1/4 = 0.25, yn = -1/4 = -0.25
  // u = 800 * 0.25 + 320 = 520, v = 800 * (-0.25) + 240 = 40
  const P2 = [1, -1, 4];
  const [u2, v2] = projectPoint3D(P2, K, R, t);
  assert.ok(Math.abs(u2 - 520) < 1e-4, `Expected u=520, got ${u2}`);
  assert.ok(Math.abs(v2 - 40) < 1e-4, `Expected v=40, got ${v2}`);
});

test('ADV-05 Epipolar Geometry & Sampson Distance: Epipolar constraint x2^T * F * x1 = 0 holds for true correspondences', () => {
  // Pure horizontal translation: C1 at origin, C2 at [1, 0, 0]^T
  const K = [
    [500, 0, 250],
    [0, 500, 250],
    [0, 0, 1]
  ];
  const R1 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
  const t1 = [0, 0, 0];

  const R2 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
  const t2 = [-1, 0, 0]; // Camera 2 translated rightwards by 1.0 (so in cam 2 frame, world origin shifted by [-1, 0, 0])

  // Generate 10 random 3D points
  const points3D = [
    [-1, -1, 5],
    [1, -1, 4],
    [-0.5, 1, 6],
    [0.8, 0.5, 4.5],
    [-1.2, 0.2, 5.5],
    [0.3, -0.8, 3.8],
    [1.1, 1.2, 6.2],
    [-0.2, -0.3, 4.0],
    [0.5, 0.7, 5.0],
    [-0.9, 0.9, 4.8]
  ];

  const pts1 = points3D.map((P) => projectPoint3D(P, K, R1, t1));
  const pts2 = points3D.map((P) => projectPoint3D(P, K, R2, t2));

  // Compute Fundamental matrix using Normalized 8-Point Algorithm
  const F = estimateFundamentalMatrix8Point(pts1, pts2);

  // Check rank-2 condition: det(F) ~ 0
  const detF =
    F[0][0] * (F[1][1] * F[2][2] - F[1][2] * F[2][1]) -
    F[0][1] * (F[1][0] * F[2][2] - F[1][2] * F[2][0]) +
    F[0][2] * (F[1][0] * F[2][1] - F[1][1] * F[2][0]);
  assert.ok(Math.abs(detF) < 1e-5, `det(F) must be ~0 for rank-2 matrix, got ${detF}`);

  // Test Sampson distance on all correspondences
  for (let i = 0; i < points3D.length; i++) {
    const sampson = computeSampsonDistance(F, pts1[i], pts2[i]);
    assert.ok(sampson < 0.5, `Correspondence ${i} Sampson distance should be small, got ${sampson}`);
  }

  // Test epipolar line
  const l2 = computeEpipolarLine(F, pts1[0], 1);
  const dist = Math.abs(l2[0] * pts2[0][0] + l2[1] * pts2[0][1] + l2[2]);
  assert.ok(dist < 0.5, `Point 2 must lie on epipolar line l2, residual distance ${dist}`);
});

test('ADV-05 Linear Triangulation (DLT) & Essential Matrix Pose Recovery: Recovers 3D coordinates and relative pose', () => {
  const K = [
    [600, 0, 300],
    [0, 600, 300],
    [0, 0, 1]
  ];
  const R1 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
  const t1 = [0, 0, 0];

  const R2 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
  const t2 = [-1, 0, 0];

  // Camera projection matrices P = K * [R | t]
  const P1 = [
    [600, 0, 300, 0],
    [0, 600, 300, 0],
    [0, 0, 1, 0]
  ];
  const P2 = [
    [600, 0, 300, -600],
    [0, 600, 300, 0],
    [0, 0, 1, 0]
  ];

  const trueWorldPoint = [0.5, -0.2, 4.0];
  const p1 = projectPoint3D(trueWorldPoint, K, R1, t1);
  const p2 = projectPoint3D(trueWorldPoint, K, R2, t2);

  const triangulated = triangulatePointLinear(p1, p2, P1, P2);
  assert.ok(Math.abs(triangulated[0] - trueWorldPoint[0]) < 1e-2, 'Triangulated X matches true X');
  assert.ok(Math.abs(triangulated[1] - trueWorldPoint[1]) < 1e-2, 'Triangulated Y matches true Y');
  assert.ok(Math.abs(triangulated[2] - trueWorldPoint[2]) < 1e-2, 'Triangulated Z matches true Z');

  // Test Essential Matrix Pose Decomposition:
  // E = [t]x * R where t = [1, 0, 0]^T
  const E = [
    [0, 0, 0],
    [0, 0, -1],
    [0, 1, 0]
  ];
  const recovered = decomposeEssentialMatrix(E, K, K, p1, p2);
  assert.ok(Math.abs(recovered.t[0] - (-1)) < 1e-2, 'Recovered baseline translation tx must match -1.0');
  assert.ok(Math.abs(recovered.R[0][0] - 1) < 1e-2, 'Recovered R should be identity');
});

test('ADV-05 Bundle Adjustment: Synthetic reprojection RMSE decreases after Levenberg-Marquardt iterations', () => {
  const K = [
    [500, 0, 200],
    [0, 500, 200],
    [0, 0, 1]
  ];
  const cameras = [
    { K, R: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], t: [0, 0, 0] },
    { K, R: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], t: [-0.5, 0, 0] }
  ];

  const clean3D = [
    [0, 0, 3],
    [0.5, 0.5, 3.5],
    [-0.5, 0.2, 4.0],
    [0.2, -0.4, 3.2]
  ];

  const observations = [];
  clean3D.forEach((P, ptIdx) => {
    observations.push({ viewIdx: 0, pointIdx: ptIdx, uv: projectPoint3D(P, cameras[0].K, cameras[0].R, cameras[0].t) });
    observations.push({ viewIdx: 1, pointIdx: ptIdx, uv: projectPoint3D(P, cameras[1].K, cameras[1].R, cameras[1].t) });
  });

  // Perturb 3D points
  const noisy3D = clean3D.map(([x, y, z]) => [x + 0.1, y - 0.1, z + 0.2]);

  const initialRmse = computeReprojectionRmse(noisy3D, observations, cameras);
  assert.ok(initialRmse > 5.0, `Initial perturbed RMSE must be significant, got ${initialRmse}`);

  const optimized = optimizeBundleAdjustmentSynthetic(noisy3D, observations, cameras, 15);
  const finalRmse = computeReprojectionRmse(optimized.refinedPoints, observations, cameras);

  assert.ok(finalRmse < initialRmse, `Bundle adjustment must reduce reprojection RMSE: initial ${initialRmse}, final ${finalRmse}`);
});

// ============================================================================
// ADV-04: ADVANCED DEEP RECOGNITION & ATTENTION MECHANISMS TESTS
// ============================================================================

test('ADV-04 Attention: Scaled dot-product attention preserves dimensional consistency and row stochasticity', () => {
  const Q = [
    [1.0, 0.0, 0.5],
    [0.0, 1.0, 0.2]
  ]; // [2, 3]
  const K = [
    [1.0, 0.0, 0.5],
    [0.0, 1.0, 0.2],
    [0.5, 0.5, 0.0]
  ]; // [3, 3]
  const V = [
    [10.0, 0.0],
    [0.0, 20.0],
    [5.0, 5.0]
  ]; // [3, 2]

  const { weights, output } = scaledDotProductAttention(Q, K, V);

  assert.equal(weights.length, 2);
  assert.equal(weights[0].length, 3);
  assert.equal(output.length, 2);
  assert.equal(output[0].length, 2);

  // Each row of attention weights must sum to 1.0 (Softmax invariant)
  const sum0 = weights[0].reduce((a, b) => a + b, 0);
  const sum1 = weights[1].reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum0 - 1.0) < 1e-5, `Row 0 attention weights must sum to 1.0, got ${sum0}`);
  assert.ok(Math.abs(sum1 - 1.0) < 1e-5, `Row 1 attention weights must sum to 1.0, got ${sum1}`);

  // Query 0 is identical to Key 0, so weights[0][0] must be highest
  assert.ok(weights[0][0] > weights[0][1], 'Query 0 must attend most strongly to Key 0');

  // Test multi-head attention
  const mha = multiHeadAttention(Q, K, V, 1);
  assert.equal(mha.output.length, 2);
});

test('ADV-04 Deformable Attention & Interpolation: Bilinear sampling extracts accurate sub-pixel values', () => {
  const grid = [
    [0.0, 10.0],
    [20.0, 30.0]
  ];

  // Center point (0.5, 0.5) must be exact average: (0 + 10 + 20 + 30) / 4 = 15.0
  const centerVal = bilinearInterpolate2D(grid, 0.5, 0.5);
  assert.ok(Math.abs(centerVal - 15.0) < 1e-5, `Bilinear center value must be 15.0, got ${centerVal}`);

  // Test deformable attention aggregation with 2 sample points
  const refPoint = [0.0, 0.0];
  const offsets = [
    [0.5, 0.5],
    [1.0, 0.0]
  ];
  const weights = [0.5, 0.5];
  const defRes = deformableAttention2D(grid, refPoint, offsets, weights);

  // Sample 1: (0.5, 0.5) -> 15.0; Sample 2: (1.0, 0.0) -> 10.0
  // Aggregated: 0.5 * 15.0 + 0.5 * 10.0 = 12.5
  assert.ok(Math.abs(defRes.aggregatedValue - 12.5) < 1e-5, `Expected 12.5, got ${defRes.aggregatedValue}`);
  assert.equal(defRes.samples.length, 2);
});

test('ADV-04 Bounding Box Metrics & Focal Loss: IoU, GIoU and Focal Loss behave consistently with theoretical bounds', () => {
  const boxA = [0, 0, 10, 10];
  const boxB = [5, 0, 15, 10]; // 50% overlap in X, 100% in Y -> Inter = 5*10=50, Union = 100+100-50=150 -> IoU = 1/3
  const iou = boxIoU(boxA, boxB);
  assert.ok(Math.abs(iou - 1 / 3) < 1e-4, `Expected IoU = 1/3, got ${iou}`);

  const giou = boxGIoU(boxA, boxB);
  // Smallest enclosing box C: [0, 0, 15, 10], Area(C) = 150
  // Union Area = 150, so Area(C) - Area(Union) = 0 -> GIoU = IoU = 1/3
  assert.ok(Math.abs(giou - 1 / 3) < 1e-4, `Expected GIoU = 1/3, got ${giou}`);

  // Identical boxes must have IoU = 1 and GIoU = 1
  assert.ok(Math.abs(boxIoU(boxA, boxA) - 1.0) < 1e-5);
  assert.ok(Math.abs(boxGIoU(boxA, boxA) - 1.0) < 1e-5);

  // Disjoint boxes: IoU = 0, GIoU < 0
  const boxC = [50, 50, 60, 60];
  assert.equal(boxIoU(boxA, boxC), 0.0);
  assert.ok(boxGIoU(boxA, boxC) < 0.0, 'GIoU of disjoint boxes must be strictly negative');

  // Focal loss: easy example (p = 0.99, y = 1) must have much lower loss than hard example (p = 0.1, y = 1)
  const lossEasy = focalLoss(0.99, 1, 0.25, 2.0);
  const lossHard = focalLoss(0.1, 1, 0.25, 2.0);
  assert.ok(lossEasy < 1e-4, `Easy example focal loss must be near zero, got ${lossEasy}`);
  assert.ok(lossHard > lossEasy * 1000, 'Hard example loss must be orders of magnitude higher than easy example');
});

test('ADV-04 DETR Hungarian Matching: Resolves optimal permutation for bipartite query-to-target assignment', () => {
  const predBoxes = [
    [0.1, 0.1, 0.3, 0.3], // Close to target 0
    [0.7, 0.7, 0.9, 0.9]  // Close to target 1
  ];
  const predProbs = [
    [0.9, 0.1], // Query 0 predicts class 0
    [0.1, 0.85] // Query 1 predicts class 1
  ];
  const targetBoxes = [
    [0.12, 0.11, 0.31, 0.29],
    [0.69, 0.71, 0.88, 0.91]
  ];
  const targetClasses = [0, 1];

  const result = hungarianMatchingDetr(predBoxes, predProbs, targetBoxes, targetClasses);
  assert.equal(result.matches.length, 2);
  assert.equal(result.matches[0].queryIdx, 0);
  assert.equal(result.matches[0].targetIdx, 0);
  assert.equal(result.matches[1].queryIdx, 1);
  assert.equal(result.matches[1].targetIdx, 1);
});

// ============================================================================
// ADV-07: VISION FOUNDATION MODELS & PARAMETER-EFFICIENT ADAPTATION TESTS
// ============================================================================

test('ADV-07 Foundation Models: Cosine similarity and InfoNCE contrastive loss calculate valid lower bounds', () => {
  const v1 = [1, 0, 0];
  const v2 = [1, 0, 0];
  const v3 = [0, 1, 0];
  const v4 = [-1, 0, 0];

  assert.ok(Math.abs(cosineSimilarity(v1, v2) - 1.0) < 1e-5, 'Identical vectors must have cosSim = 1.0');
  assert.ok(Math.abs(cosineSimilarity(v1, v3) - 0.0) < 1e-5, 'Orthogonal vectors must have cosSim = 0.0');
  assert.ok(Math.abs(cosineSimilarity(v1, v4) - (-1.0)) < 1e-5, 'Opposite vectors must have cosSim = -1.0');

  // Test InfoNCE Loss
  const query = [1.0, 0.0, 0.0];
  const posKey = [0.95, 0.05, 0.0];
  const negKeys = [
    [0.0, 1.0, 0.0],
    [-1.0, 0.0, 0.0]
  ];

  const infoNce = computeInfoNceLoss(query, posKey, negKeys, 0.1);
  assert.ok(infoNce.loss > 0, `InfoNCE loss must be strictly positive, got ${infoNce.loss}`);
  assert.ok(infoNce.posProb > 0.9, `Positive key should have high probability under aligned embedding, got ${infoNce.posProb}`);

  // Test temperature-scaled Softmax
  const logits = [2.0, 1.0, 0.0];
  const sharpDist = temperatureScaledSoftmax(logits, 0.2);
  const flatDist = temperatureScaledSoftmax(logits, 5.0);
  assert.ok(sharpDist[0] > 0.9, 'Low temperature must sharpen probability on dominant logit');
  assert.ok(flatDist[0] < 0.6, 'High temperature must flatten probability distribution');
});

test('ADV-07 LoRA Adaptation: Low-rank weight update W0 + alpha/r * (B*A) and parameter count savings', () => {
  // Base weights W0: [3, 2]
  const W0 = [
    [1.0, 2.0],
    [3.0, 4.0],
    [5.0, 6.0]
  ];
  // LoRA B: [3, 1], A: [1, 2] with r = 1, alpha = 2
  const B = [
    [0.5],
    [1.0],
    [-0.5]
  ];
  const A = [
    [1.0, 2.0]
  ];

  const adapted = applyLoraWeights(W0, B, A, 2, 1);
  // Scaling = 2/1 = 2
  // B * A:
  // Row 0: [0.5*1, 0.5*2] = [0.5, 1.0] -> delta * 2 = [1.0, 2.0] -> W = [1+1, 2+2] = [2.0, 4.0]
  // Row 1: [1.0*1, 1.0*2] = [1.0, 2.0] -> delta * 2 = [2.0, 4.0] -> W = [3+2, 4+4] = [5.0, 8.0]
  assert.ok(Math.abs(adapted[0][0] - 2.0) < 1e-5);
  assert.ok(Math.abs(adapted[0][1] - 4.0) < 1e-5);
  assert.ok(Math.abs(adapted[1][0] - 5.0) < 1e-5);
  assert.ok(Math.abs(adapted[1][1] - 8.0) < 1e-5);

  // Parameter counts for large projection (e.g. 768 x 768 with r = 8)
  const savings = computeLoraParamCount(768, 768, 8);
  assert.equal(savings.fullParams, 768 * 768); // 589,824
  assert.equal(savings.loraParams, (768 + 768) * 8); // 12,288
  assert.ok(savings.savedPercentage > 97.0, `Expected >97% parameter reduction, got ${savings.savedPercentage}%`);
});

// ============================================================================
// ADV-08: EFFICIENT CV & EDGE AI ARCHITECTURE TESTS
// ============================================================================

test('ADV-08 Quantization Arithmetic: Affine scale and zero-point roundtrip bound quantization error', () => {
  const minVal = -2.0;
  const maxVal = 2.0;
  const params = computeAffineQuantizationParams(minVal, maxVal, 8, false);

  // Test roundtrip on an array of values
  const values = [-2.0, -1.0, 0.0, 0.5, 1.5, 2.0];
  const qRes = computeQuantizationError(values, params);

  // Theoretical max error for 8-bit uniform quantization is S / 2
  const maxBound = params.scale / 2.0;
  assert.ok(qRes.maxError <= maxBound + 1e-5, `Max error ${qRes.maxError} exceeds theoretical bound ${maxBound}`);
  assert.ok(qRes.sqnrDb > 35.0, `SQNR should exceed 35 dB for 8-bit quantization, got ${qRes.sqnrDb} dB`);

  // Straight-Through Estimator (STE) test
  const ste = straightThroughEstimator(0.5, params);
  assert.ok(Math.abs(ste.forward - 0.5) < 0.05);
  assert.equal(ste.backwardGrad(1.5), 1.5, 'STE passes gradient through within bounds');
  const steSaturated = straightThroughEstimator(10.0, params);
  assert.equal(steSaturated.backwardGrad(1.5), 0, 'STE zeroes gradient when saturated outside bounds');
});

test('ADV-08 Edge AI Profiling: Structured channel pruning, Roofline model, and latency percentiles', () => {
  // 1. Structured Channel Pruning
  const weights = [
    [[1.0, 2.0], [0.5, 0.5]],  // Channel 0: L1 = 4.0
    [[0.01, 0.02], [0.01, 0.01]], // Channel 1: L1 = 0.05 (near zero)
    [[2.0, 1.0], [1.0, 1.0]],  // Channel 2: L1 = 5.0
    [[0.05, 0.02], [0.01, 0.02]]  // Channel 3: L1 = 0.10
  ];
  const pruned = structuredChannelPruning(weights, 0.5);
  assert.equal(pruned.pruneMask.length, 4);
  assert.equal(pruned.pruneMask[1], true, 'Channel 1 must be pruned');
  assert.equal(pruned.pruneMask[2], false, 'Channel 2 must be preserved');
  assert.ok(pruned.sparsity >= 50.0);

  // 2. Roofline Model
  // Peak: 100 GFLOPs, Memory Bandwidth: 25 GB/s -> Knee point = 4.0 FLOPs/Byte
  const rMem = evaluateRooflineModel(2.0, 100.0, 25.0);
  assert.equal(rMem.limitingFactor, 'memory-bound');
  assert.equal(rMem.attainableGFlops, 50.0); // 2.0 * 25.0 = 50.0

  const rComp = evaluateRooflineModel(6.0, 100.0, 25.0);
  assert.equal(rComp.limitingFactor, 'compute-bound');
  assert.equal(rComp.attainableGFlops, 100.0);

  // 3. Latency Percentiles
  const latencies = [10, 12, 11, 15, 14, 13, 20, 100, 12, 11];
  const stats = calculateLatencyPercentiles(latencies);
  assert.ok(stats.p50 >= 11 && stats.p50 <= 13);
  assert.ok(stats.p95 > stats.p50);
  assert.ok(stats.p99 >= stats.p95);
});



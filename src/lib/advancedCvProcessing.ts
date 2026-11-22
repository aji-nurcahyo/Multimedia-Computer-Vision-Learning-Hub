/**
 * Multimedia & Computer Vision Learning Hub - Advanced Computer Vision Processing Engine
 * Mathematical and Algorithmic Implementations for Modules ADV-01, ADV-03, ADV-06
 * Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
 */

// ============================================================================
// 1. ADV-01: MATHEMATICAL FOUNDATIONS & OPTIMIZATION MANIFOLDS
// ============================================================================

export interface Svd2x2Result {
  U: number[][];
  S: [number, number];
  Vt: number[][];
  conditionNumber: number;
}

/**
 * Analytical Singular Value Decomposition for 2x2 Real Matrices A = U * diag(S) * Vt
 */
export function computeSvd2x2(A: number[][]): Svd2x2Result {
  const a = A[0][0];
  const b = A[0][1];
  const c = A[1][0];
  const d = A[1][1];

  // A * A^T = U * S^2 * U^T
  const aat11 = a * a + b * b;
  const aat12 = a * c + b * d;
  const aat22 = c * c + d * d;

  // Eigenvalues of A * A^T
  const trace = aat11 + aat22;
  const det = aat11 * aat22 - aat12 * aat12;
  const disc = Math.max(0, trace * trace - 4 * det);
  const sqrtDisc = Math.sqrt(disc);

  const lambda1 = Math.max(0, (trace + sqrtDisc) / 2);
  const lambda2 = Math.max(0, (trace - sqrtDisc) / 2);

  const sigma1 = Math.sqrt(lambda1);
  const sigma2 = Math.sqrt(lambda2);

  // Eigenvector of A * A^T for lambda1 -> column 0 of U
  let u1: [number, number] = [1, 0];
  if (Math.abs(aat12) > 1e-12) {
    const v = [lambda1 - aat22, aat12];
    const norm = Math.hypot(v[0], v[1]);
    if (norm > 1e-12) u1 = [v[0] / norm, v[1] / norm];
  } else if (aat11 < aat22) {
    u1 = [0, 1];
  }

  // Column 1 of U is orthogonal to column 0
  const u2: [number, number] = [-u1[1], u1[0]];
  const U = [
    [u1[0], u2[0]],
    [u1[1], u2[1]]
  ];

  // V_i = A^T * U_i / sigma_i
  let vt1: [number, number] = [1, 0];
  let vt2: [number, number] = [0, 1];

  if (sigma1 > 1e-12) {
    const v1x = (a * u1[0] + c * u1[1]) / sigma1;
    const v1y = (b * u1[0] + d * u1[1]) / sigma1;
    const norm = Math.hypot(v1x, v1y);
    vt1 = [v1x / norm, v1y / norm];
  }

  if (sigma2 > 1e-12) {
    const v2x = (a * u2[0] + c * u2[1]) / sigma2;
    const v2y = (b * u2[0] + d * u2[1]) / sigma2;
    const norm = Math.hypot(v2x, v2y);
    vt2 = [v2x / norm, v2y / norm];
  } else {
    vt2 = [-vt1[1], vt1[0]];
  }

  const Vt = [
    [vt1[0], vt1[1]],
    [vt2[0], vt2[1]]
  ];

  const conditionNumber = sigma2 > 1e-12 ? sigma1 / sigma2 : Infinity;

  return {
    U,
    S: [sigma1, sigma2],
    Vt,
    conditionNumber
  };
}

/**
 * Low-rank matrix approximation of rank k for 2x2 matrix
 */
export function lowRankApprox2x2(svd: Svd2x2Result, rank: 1 | 2): number[][] {
  const { U, S, Vt } = svd;
  const s0 = S[0];
  const s1 = rank >= 2 ? S[1] : 0;

  return [
    [U[0][0] * s0 * Vt[0][0] + U[0][1] * s1 * Vt[1][0], U[0][0] * s0 * Vt[0][1] + U[0][1] * s1 * Vt[1][1]],
    [U[1][0] * s0 * Vt[0][0] + U[1][1] * s1 * Vt[1][0], U[1][0] * s0 * Vt[0][1] + U[1][1] * s1 * Vt[1][1]]
  ];
}

/**
 * Linear least-squares solver (A^T A) x = A^T b using normal equations for 2D points fitting
 * Fits line y = m * x + c
 */
export function fitLineLeastSquares(points: Array<[number, number]>): { m: number; c: number; r2: number } {
  const n = points.length;
  if (n < 2) return { m: 0, c: 0, r2: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const [x, y] of points) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) return { m: 0, c: sumY / n, r2: 0 };

  const m = (n * sumXY - sumX * sumY) / denom;
  const c = (sumY - m * sumX) / n;

  // Coefficient of determination (R^2)
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (const [x, y] of points) {
    const pred = m * x + c;
    ssRes += (y - pred) * (y - pred);
    ssTot += (y - meanY) * (y - meanY);
  }

  const r2 = ssTot > 1e-12 ? Math.max(0, 1 - ssRes / ssTot) : 1;
  return { m, c, r2 };
}

/**
 * Rodrigues' Formula: Exponential map from Lie algebra so(3) vector omega -> Lie group SO(3) 3x3 rotation matrix
 */
export function rodriguesRotation(omega: [number, number, number]): number[][] {
  const theta = Math.hypot(omega[0], omega[1], omega[2]);
  if (theta < 1e-12) {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  const kx = omega[0] / theta;
  const ky = omega[1] / theta;
  const kz = omega[2] / theta;

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const v = 1 - cosT;

  return [
    [cosT + kx * kx * v, kx * ky * v - kz * sinT, kx * kz * v + ky * sinT],
    [ky * kx * v + kz * sinT, cosT + ky * ky * v, ky * kz * v - kx * sinT],
    [kz * kx * v - ky * sinT, kz * ky * v + kx * sinT, cosT + kz * kz * v]
  ];
}

// ============================================================================
// 2. ADV-03: ROBUST MULTI-OBJECT TRACKING & KALMAN STATE ESTIMATION
// ============================================================================

export interface KalmanState2D {
  x: number;   // Position X
  y: number;   // Position Y
  vx: number;  // Velocity X
  vy: number;  // Velocity Y
  cov: number[][]; // 4x4 covariance matrix
}

/**
 * Initialize 2D Constant Velocity Kalman Filter State
 */
export function createKalmanState2D(initX: number, initY: number, posVar = 10, velVar = 100): KalmanState2D {
  return {
    x: initX,
    y: initY,
    vx: 0,
    vy: 0,
    cov: [
      [posVar, 0, 0, 0],
      [0, posVar, 0, 0],
      [0, 0, velVar, 0],
      [0, 0, 0, velVar]
    ]
  };
}

/**
 * Kalman Filter Prediction Step for 2D Kinematics with time step dt
 */
export function kalmanPredict2D(state: KalmanState2D, dt: number, processNoise = 1.0): KalmanState2D {
  // State transition F: x_t = x_{t-1} + vx*dt, y_t = y_{t-1} + vy*dt
  const x = state.x + state.vx * dt;
  const y = state.y + state.vy * dt;
  const vx = state.vx;
  const vy = state.vy;

  // F = [ [1, 0, dt, 0], [0, 1, 0, dt], [0, 0, 1, 0], [0, 0, 0, 1] ]
  // Process noise Q
  const qPos = (processNoise * dt * dt) / 2;
  const qVel = processNoise * dt;

  const P = state.cov;
  const newCov: number[][] = [
    [P[0][0] + 2 * dt * P[0][2] + dt * dt * P[2][2] + qPos, P[0][1] + dt * (P[0][3] + P[1][2]) + dt * dt * P[2][3], P[0][2] + dt * P[2][2], P[0][3] + dt * P[2][3]],
    [P[1][0] + dt * (P[1][2] + P[0][3]) + dt * dt * P[3][2], P[1][1] + 2 * dt * P[1][3] + dt * dt * P[3][3] + qPos, P[1][2] + dt * P[3][2], P[1][3] + dt * P[3][3]],
    [P[2][0] + dt * P[2][2], P[2][1] + dt * P[2][3], P[2][2] + qVel, P[2][3]],
    [P[3][0] + dt * P[3][2], P[3][1] + dt * P[3][3], P[3][2], P[3][3] + qVel]
  ];

  return { x, y, vx, vy, cov: newCov };
}

/**
 * Kalman Filter Measurement Update Step with measurement z = [measX, measY]
 */
export function kalmanUpdate2D(state: KalmanState2D, measX: number, measY: number, measNoise = 5.0): { updated: KalmanState2D; mahalanobis: number } {
  // H = [ [1, 0, 0, 0], [0, 1, 0, 0] ]
  // Innovation y = z - H * x
  const innX = measX - state.x;
  const innY = measY - state.y;

  // Innovation covariance S = H * P * H^T + R
  const s00 = state.cov[0][0] + measNoise;
  const s01 = state.cov[0][1];
  const s10 = state.cov[1][0];
  const s11 = state.cov[1][1] + measNoise;

  const detS = s00 * s11 - s01 * s10;
  const invDet = detS > 1e-12 ? 1 / detS : 1;
  const invS00 = s11 * invDet;
  const invS01 = -s01 * invDet;
  const invS10 = -s10 * invDet;
  const invS11 = s00 * invDet;

  // Squared Mahalanobis distance d_M^2 = y^T * S^-1 * y
  const dM2 = innX * (invS00 * innX + invS10 * innY) + innY * (invS01 * innX + invS11 * innY);
  const mahalanobis = Math.sqrt(Math.max(0, dM2));

  // Kalman Gain K = P * H^T * S^-1 (4x2 matrix)
  // P * H^T is the first two columns of P
  const k00 = state.cov[0][0] * invS00 + state.cov[0][1] * invS10;
  const k01 = state.cov[0][0] * invS01 + state.cov[0][1] * invS11;
  const k10 = state.cov[1][0] * invS00 + state.cov[1][1] * invS10;
  const k11 = state.cov[1][0] * invS01 + state.cov[1][1] * invS11;
  const k20 = state.cov[2][0] * invS00 + state.cov[2][1] * invS10;
  const k21 = state.cov[2][0] * invS01 + state.cov[2][1] * invS11;
  const k30 = state.cov[3][0] * invS00 + state.cov[3][1] * invS10;
  const k31 = state.cov[3][0] * invS01 + state.cov[3][1] * invS11;

  // Updated state x = x + K * y
  const newX = state.x + k00 * innX + k01 * innY;
  const newY = state.y + k10 * innX + k11 * innY;
  const newVx = state.vx + k20 * innX + k21 * innY;
  const newVy = state.vy + k30 * innX + k31 * innY;

  // Updated covariance P = (I - K*H) * P
  const newCov: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const row: number[] = [];
    const ki0 = i === 0 ? k00 : i === 1 ? k10 : i === 2 ? k20 : k30;
    const ki1 = i === 0 ? k01 : i === 1 ? k11 : i === 2 ? k21 : k31;

    for (let j = 0; j < 4; j++) {
      const pIj = state.cov[i][j];
      const khpIj = ki0 * state.cov[0][j] + ki1 * state.cov[1][j];
      row.push(pIj - khpIj);
    }
    newCov.push(row);
  }

  return {
    updated: { x: newX, y: newY, vx: newVx, vy: newVy, cov: newCov },
    mahalanobis
  };
}

/**
 * Bipartite Data Association Result Interface
 */
export interface AssociationMatch {
  trackIdx: number;
  detectionIdx: number;
  distance: number;
}

export interface BipartiteMatchResult {
  matches: Array<{ trackIdx: number; detectionIdx: number; cost: number }>;
  totalCost: number;
  unmatchedTracks: number[];
  unmatchedDetections: number[];
}

/**
 * Greedy Bipartite Data Association (Heuristic)
 * Iteratively picks the smallest available element in the cost matrix.
 * Time Complexity: O(N * M * min(N, M))
 * Note: Greedy is an approximation heuristic and DOES NOT guarantee a globally minimum sum of assignment costs.
 */
export function solveBipartiteMatchingGreedy(
  costMatrix: number[][],
  gateThreshold = Infinity
): BipartiteMatchResult {
  if (!costMatrix || costMatrix.length === 0) {
    return { matches: [], totalCost: 0, unmatchedTracks: [], unmatchedDetections: [] };
  }
  const numTracks = costMatrix.length;
  const numDets = costMatrix[0] ? costMatrix[0].length : 0;
  if (numDets === 0) {
    return {
      matches: [],
      totalCost: 0,
      unmatchedTracks: Array.from({ length: numTracks }, (_, i) => i),
      unmatchedDetections: []
    };
  }

  const assignedTracks = new Set<number>();
  const assignedDets = new Set<number>();
  const matches: Array<{ trackIdx: number; detectionIdx: number; cost: number }> = [];
  let totalCost = 0;

  while (assignedTracks.size < numTracks && assignedDets.size < numDets) {
    let bestCost = Infinity;
    let bestT = -1;
    let bestD = -1;

    for (let t = 0; t < numTracks; t++) {
      if (assignedTracks.has(t)) continue;
      for (let d = 0; d < numDets; d++) {
        if (assignedDets.has(d)) continue;
        const val = costMatrix[t][d];
        if (Number.isFinite(val) && val < bestCost) {
          bestCost = val;
          bestT = t;
          bestD = d;
        }
      }
    }

    if (bestT === -1 || bestD === -1 || bestCost > gateThreshold) {
      break;
    }

    matches.push({ trackIdx: bestT, detectionIdx: bestD, cost: bestCost });
    assignedTracks.add(bestT);
    assignedDets.add(bestD);
    totalCost += bestCost;
  }

  const unmatchedTracks: number[] = [];
  for (let t = 0; t < numTracks; t++) {
    if (!assignedTracks.has(t)) unmatchedTracks.push(t);
  }
  const unmatchedDetections: number[] = [];
  for (let d = 0; d < numDets; d++) {
    if (!assignedDets.has(d)) unmatchedDetections.push(d);
  }

  return { matches, totalCost, unmatchedTracks, unmatchedDetections };
}

/**
 * Hungarian / Kuhn-Munkres Algorithm (Globally Optimal LSAP Solver)
 * Solves the Linear Sum Assignment Problem to provable global minimum cost.
 * Time Complexity: O(max(N, M)^3) via Kuhn-Munkres with dual potentials.
 * Supports rectangular N x M matrices, finite costs, empty inputs, and gating thresholds.
 */
export function solveHungarianMatching(
  costMatrix: number[][],
  gateThreshold = Infinity
): BipartiteMatchResult {
  if (!costMatrix || costMatrix.length === 0) {
    return { matches: [], totalCost: 0, unmatchedTracks: [], unmatchedDetections: [] };
  }
  const numTracks = costMatrix.length;
  const numDets = costMatrix[0] ? costMatrix[0].length : 0;
  if (numDets === 0) {
    return {
      matches: [],
      totalCost: 0,
      unmatchedTracks: Array.from({ length: numTracks }, (_, i) => i),
      unmatchedDetections: []
    };
  }

  // Handle any negative costs safely by shifting
  let minFinite = Infinity;
  for (let i = 0; i < numTracks; i++) {
    for (let j = 0; j < numDets; j++) {
      const val = costMatrix[i][j];
      if (Number.isFinite(val) && val < minFinite) {
        minFinite = val;
      }
    }
  }
  if (!Number.isFinite(minFinite)) minFinite = 0;
  const shift = minFinite < 0 ? -minFinite : 0;

  const K = Math.max(numTracks, numDets);
  // Pad square matrix of size K with 0 (dummy cost)
  const square: number[][] = Array.from({ length: K }, () => new Array(K).fill(0));
  for (let i = 0; i < numTracks; i++) {
    for (let j = 0; j < numDets; j++) {
      const val = costMatrix[i][j];
      square[i][j] = (Number.isFinite(val) ? val : 1e9) + shift;
    }
  }

  // Kuhn-Munkres algorithm with potentials (1-indexed internally)
  const u = new Array(K + 1).fill(0);
  const v = new Array(K + 1).fill(0);
  const p = new Array(K + 1).fill(0);
  const way = new Array(K + 1).fill(0);

  for (let i = 1; i <= K; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(K + 1).fill(Infinity);
    const used = new Array(K + 1).fill(false);

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;

      for (let j = 1; j <= K; j++) {
        if (!used[j]) {
          const cur = square[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }

      for (let j = 0; j <= K; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }

      j0 = j1;
    } while (p[j0] !== 0);

    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const assignment = new Array(K).fill(-1);
  for (let j = 1; j <= K; j++) {
    if (p[j] > 0) {
      assignment[p[j] - 1] = j - 1;
    }
  }

  const matches: Array<{ trackIdx: number; detectionIdx: number; cost: number }> = [];
  const assignedTracks = new Set<number>();
  const assignedDets = new Set<number>();
  let totalCost = 0;

  for (let t = 0; t < numTracks; t++) {
    const d = assignment[t];
    if (d >= 0 && d < numDets) {
      const originalCost = costMatrix[t][d];
      if (Number.isFinite(originalCost) && originalCost <= gateThreshold) {
        matches.push({ trackIdx: t, detectionIdx: d, cost: originalCost });
        assignedTracks.add(t);
        assignedDets.add(d);
        totalCost += originalCost;
      }
    }
  }

  const unmatchedTracks: number[] = [];
  for (let t = 0; t < numTracks; t++) {
    if (!assignedTracks.has(t)) unmatchedTracks.push(t);
  }
  const unmatchedDetections: number[] = [];
  for (let d = 0; d < numDets; d++) {
    if (!assignedDets.has(d)) unmatchedDetections.push(d);
  }

  return { matches, totalCost, unmatchedTracks, unmatchedDetections };
}

/**
 * High-level data association function for tracking pipelines.
 * Allows choosing between 'hungarian' (optimal) and 'greedy' (heuristic).
 */
export function associateDetectionsToTracks(
  tracks: Array<{ x: number; y: number }>,
  detections: Array<{ x: number; y: number }>,
  distanceThreshold = 50.0,
  method: 'greedy' | 'hungarian' = 'hungarian'
): {
  matches: AssociationMatch[];
  unmatchedTracks: number[];
  unmatchedDetections: number[];
  totalCost: number;
  methodUsed: 'greedy' | 'hungarian';
} {
  const costMatrix: number[][] = [];

  for (let t = 0; t < tracks.length; t++) {
    costMatrix[t] = [];
    for (let d = 0; d < detections.length; d++) {
      const dist = Math.hypot(tracks[t].x - detections[d].x, tracks[t].y - detections[d].y);
      costMatrix[t][d] = dist;
    }
  }

  const result = method === 'hungarian'
    ? solveHungarianMatching(costMatrix, distanceThreshold)
    : solveBipartiteMatchingGreedy(costMatrix, distanceThreshold);

  const matches: AssociationMatch[] = result.matches.map((m) => ({
    trackIdx: m.trackIdx,
    detectionIdx: m.detectionIdx,
    distance: m.cost
  }));

  return {
    matches,
    unmatchedTracks: result.unmatchedTracks,
    unmatchedDetections: result.unmatchedDetections,
    totalCost: result.totalCost,
    methodUsed: method
  };
}

// ============================================================================
// 3. ADV-06: ADVERSE CONDITIONS SENSING & ATMOSPHERIC TRANSFER MODELING
// ============================================================================

export interface AtmosphericHazeParams {
  hazeIntensity: number; // beta parameter in [0.0, 1.0]
  airlight: [number, number, number]; // Atmospheric light A in RGB [0..255]
}

/**
 * Koschmieder Atmospheric Scattering Degradation:
 * I(x) = J(x) * t(x) + A * (1 - t(x))
 * where transmission t(x) = exp(-beta * d(x))
 */
export function simulateAtmosphericHaze(
  rgbData: Uint8ClampedArray,
  width: number,
  height: number,
  params: AtmosphericHazeParams
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(rgbData.length);
  const { hazeIntensity, airlight } = params;

  // Synthetic depth map assuming ground-to-horizon perspective depth
  for (let y = 0; y < height; y++) {
    // Horizon is roughly at y = 0.3 * height; ground is closer at bottom
    const depth = Math.max(0.1, 1.0 - (y / height) * 0.85);
    const transmission = Math.exp(-hazeIntensity * 3.5 * depth);

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = rgbData[idx];
      const g = rgbData[idx + 1];
      const b = rgbData[idx + 2];

      output[idx] = Math.min(255, Math.max(0, Math.round(r * transmission + airlight[0] * (1 - transmission))));
      output[idx + 1] = Math.min(255, Math.max(0, Math.round(g * transmission + airlight[1] * (1 - transmission))));
      output[idx + 2] = Math.min(255, Math.max(0, Math.round(b * transmission + airlight[2] * (1 - transmission))));
      output[idx + 3] = rgbData[idx + 3]; // Preserve alpha
    }
  }

  return output;
}

/**
 * Dark Channel Prior Estimation on Image Patches (He et al.):
 * J_dark(x) = min_{c in {R,G,B}} ( min_{y in Omega(x)} I_c(y) )
 */
export function computeDarkChannel(
  rgbData: Uint8ClampedArray,
  width: number,
  height: number,
  patchRadius = 7
): Float32Array {
  const darkChannel = new Float32Array(width * height);

  // 1. Min across color channels for each pixel
  const minColor = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    minColor[i] = Math.min(rgbData[idx], rgbData[idx + 1], rgbData[idx + 2]);
  }

  // 2. Local minimum filter over spatial patch Omega(x)
  for (let y = 0; y < height; y++) {
    const yMin = Math.max(0, y - patchRadius);
    const yMax = Math.min(height - 1, y + patchRadius);

    for (let x = 0; x < width; x++) {
      const xMin = Math.max(0, x - patchRadius);
      const xMax = Math.min(width - 1, x + patchRadius);

      let minVal = 255.0;
      for (let py = yMin; py <= yMax; py++) {
        for (let px = xMin; px <= xMax; px++) {
          const val = minColor[py * width + px];
          if (val < minVal) minVal = val;
        }
      }
      darkChannel[y * width + x] = minVal;
    }
  }

  return darkChannel;
}

/**
 * Expected Calibration Error (ECE) for Uncertainty Estimation in Safety-Critical Vision:
 * Computes difference between model confidence and empirical accuracy across M bins.
 */
export interface EceBinResult {
  binIndex: number;
  confidenceLower: number;
  confidenceUpper: number;
  sampleCount: number;
  meanConfidence: number;
  empiricalAccuracy: number;
  binError: number;
}

export function computeExpectedCalibrationError(
  confidences: number[],
  correctLabels: boolean[],
  numBins = 10
): { ece: number; bins: EceBinResult[] } {
  const n = confidences.length;
  if (n === 0) return { ece: 0, bins: [] };

  const binStep = 1.0 / numBins;
  const bins: EceBinResult[] = [];
  let weightedErrorSum = 0;

  for (let m = 0; m < numBins; m++) {
    const lower = m * binStep;
    const upper = (m + 1) * binStep;

    const binConfidences: number[] = [];
    let correctCount = 0;

    for (let i = 0; i < n; i++) {
      const conf = confidences[i];
      if (conf >= lower && (m === numBins - 1 ? conf <= upper : conf < upper)) {
        binConfidences.push(conf);
        if (correctLabels[i]) correctCount++;
      }
    }

    const count = binConfidences.length;
    const meanConf = count > 0 ? binConfidences.reduce((a, b) => a + b, 0) / count : (lower + upper) / 2;
    const accuracy = count > 0 ? correctCount / count : 0;
    const binError = count > 0 ? Math.abs(accuracy - meanConf) : 0;

    if (count > 0) {
      weightedErrorSum += (count / n) * binError;
    }

    bins.push({
      binIndex: m,
      confidenceLower: lower,
      confidenceUpper: upper,
      sampleCount: count,
      meanConfidence: meanConf,
      empiricalAccuracy: accuracy,
      binError
    });
  }

  return {
    ece: weightedErrorSum,
    bins
  };
}

/**
 * Numerical Image Quality Assessment: PSNR and SSIM
 */
export function computeImageMetrics(
  clean: Uint8ClampedArray,
  degraded: Uint8ClampedArray,
  width: number,
  height: number
): { mse: number; psnr: number; ssim: number } {
  const pixelCount = width * height;
  let sumSqErr = 0;
  let sumClean = 0;
  let sumDegraded = 0;

  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    // Luminance approximation Y = 0.299 R + 0.587 G + 0.114 B
    const yC = 0.299 * clean[idx] + 0.587 * clean[idx + 1] + 0.114 * clean[idx + 2];
    const yD = 0.299 * degraded[idx] + 0.587 * degraded[idx + 1] + 0.114 * degraded[idx + 2];

    const err = yC - yD;
    sumSqErr += err * err;
    sumClean += yC;
    sumDegraded += yD;
  }

  const mse = sumSqErr / pixelCount;
  const psnr = mse > 1e-12 ? 10 * Math.log10((255 * 255) / mse) : 99.0;

  const meanC = sumClean / pixelCount;
  const meanD = sumDegraded / pixelCount;

  let varC = 0;
  let varD = 0;
  let covCD = 0;

  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const yC = 0.299 * clean[idx] + 0.587 * clean[idx + 1] + 0.114 * clean[idx + 2];
    const yD = 0.299 * degraded[idx] + 0.587 * degraded[idx + 1] + 0.114 * degraded[idx + 2];

    varC += (yC - meanC) * (yC - meanC);
    varD += (yD - meanD) * (yD - meanD);
    covCD += (yC - meanC) * (yD - meanD);
  }

  varC /= pixelCount;
  varD /= pixelCount;
  covCD /= pixelCount;

  const c1 = 0.01 * 255 * (0.01 * 255);
  const c2 = 0.03 * 255 * (0.03 * 255);

  const ssimNum = (2 * meanC * meanD + c1) * (2 * covCD + c2);
  const ssimDen = (meanC * meanC + meanD * meanD + c1) * (varC + varD + c2);
  const ssim = ssimDen > 1e-12 ? Math.max(-1, Math.min(1, ssimNum / ssimDen)) : 1.0;

  return { mse, psnr, ssim };
}

// ============================================================================
// 4. GENERAL NUMERICAL LINEAR ALGEBRA UTILITIES (SVD & JACOBI EIGEN)
// ============================================================================

/**
 * General SVD for any M x N real matrix: A = U * diag(sigma) * V^T
 * Computes exact singular values and right singular vectors via cyclic Jacobi on A^T A.
 */
export function svdGeneral(A: number[][]): { U: number[][]; sigma: number[]; V: number[][] } {
  const m = A.length;
  const n = A[0]?.length || 0;
  if (m === 0 || n === 0) return { U: [], sigma: [], V: [] };

  // Compute A^T * A (n x n)
  const AtA: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < m; k++) {
        sum += A[k][i] * A[k][j];
      }
      AtA[i][j] = sum;
    }
  }

  // Cyclic Jacobi on symmetric matrix AtA
  const V_raw: number[][] = Array.from({ length: n }, (_, i) => {
    const row = new Array(n).fill(0);
    row[i] = 1;
    return row;
  });
  const S: number[][] = AtA.map((r) => [...r]);

  for (let iter = 0; iter < 50; iter++) {
    let maxOff = 0;
    let p = 0;
    let q = 1;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const absVal = Math.abs(S[i][j]);
        if (absVal > maxOff) {
          maxOff = absVal;
          p = i;
          q = j;
        }
      }
    }
    if (maxOff < 1e-12) break;

    const theta = 0.5 * Math.atan2(2 * S[p][q], S[p][p] - S[q][q]);
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    const S_pp = S[p][p];
    const S_qq = S[q][q];
    const S_pq = S[p][q];

    for (let k = 0; k < n; k++) {
      if (k !== p && k !== q) {
        const Skp = S[k][p];
        const Skq = S[k][q];
        S[k][p] = c * Skp + s * Skq;
        S[p][k] = S[k][p];
        S[k][q] = -s * Skp + c * Skq;
        S[q][k] = S[k][q];
      }
      const Vkp = V_raw[k][p];
      const Vkq = V_raw[k][q];
      V_raw[k][p] = c * Vkp + s * Vkq;
      V_raw[k][q] = -s * Vkp + c * Vkq;
    }

    S[p][p] = c * c * S_pp + 2 * c * s * S_pq + s * s * S_qq;
    S[q][q] = s * s * S_pp - 2 * c * s * S_pq + c * c * S_qq;
    S[p][q] = 0;
    S[q][p] = 0;
  }

  // Extract eigenvalues and sort descending
  const eigPairs: Array<{ sigma: number; vec: number[] }> = [];
  for (let i = 0; i < n; i++) {
    const val = Math.max(0, S[i][i]);
    const vec = V_raw.map((row) => row[i]);
    eigPairs.push({ sigma: Math.sqrt(val), vec });
  }
  eigPairs.sort((a, b) => b.sigma - a.sigma);

  const sigma = eigPairs.map((p) => p.sigma);
  const V = Array.from({ length: n }, (_, r) => eigPairs.map((p) => p.vec[r]));

  // Compute U = A * V * inv(sigma)
  const U: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    const s = sigma[j];
    if (s > 1e-10) {
      for (let i = 0; i < m; i++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += A[i][k] * V[k][j];
        }
        U[i][j] = sum / s;
      }
    }
  }

  // If 3x3 matrix has rank 2, complete orthogonal basis of U via cross product u2 = u0 x u1
  if (m === 3 && n === 3 && sigma[2] < 1e-8) {
    const u0 = [U[0][0], U[1][0], U[2][0]];
    const u1 = [U[0][1], U[1][1], U[2][1]];
    const u2 = [
      u0[1] * u1[2] - u0[2] * u1[1],
      u0[2] * u1[0] - u0[0] * u1[2],
      u0[0] * u1[1] - u0[1] * u1[0]
    ];
    const norm = Math.hypot(u2[0], u2[1], u2[2]);
    if (norm > 1e-12) {
      U[0][2] = u2[0] / norm;
      U[1][2] = u2[1] / norm;
      U[2][2] = u2[2] / norm;
    }
  }

  return { U, sigma, V };
}

// ============================================================================
// 5. ADV-02: VARIATIONAL IMAGE RESTORATION, TV & ADMM SOLVERS
// ============================================================================

/**
 * 2D Discrete Spatial Convolution with edge reflection padding.
 */
export function convolve2D(image: number[][], kernel: number[][]): number[][] {
  const h = image.length;
  const w = image[0]?.length || 0;
  const kh = kernel.length;
  const kw = kernel[0]?.length || 0;
  const khHalf = Math.floor(kh / 2);
  const kwHalf = Math.floor(kw / 2);

  const out: number[][] = Array.from({ length: h }, () => new Array(w).fill(0));

  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      let sum = 0;
      for (let ki = 0; ki < kh; ki++) {
        for (let kj = 0; kj < kw; kj++) {
          let ii = i + ki - khHalf;
          let jj = j + kj - kwHalf;
          // Reflect boundary condition
          if (ii < 0) ii = -ii;
          if (ii >= h) ii = 2 * h - 2 - ii;
          if (jj < 0) jj = -jj;
          if (jj >= w) jj = 2 * w - 2 - jj;

          ii = Math.max(0, Math.min(h - 1, ii));
          jj = Math.max(0, Math.min(w - 1, jj));

          sum += image[ii][jj] * kernel[ki][kj];
        }
      }
      out[i][j] = sum;
    }
  }
  return out;
}

/**
 * Soft-Thresholding (Shrinkage) Operator: S_tau(v) = sign(v) * max(|v| - tau, 0)
 */
export function softThreshold(v: number, tau: number): number {
  if (v > tau) return v - tau;
  if (v < -tau) return v + tau;
  return 0;
}

/**
 * Total Variation (TV) Semi-Norm of a 2D image.
 * Isotropic: sum sqrt((dx)^2 + (dy)^2)
 * Anisotropic: sum (|dx| + |dy|)
 */
export function computeTotalVariation(image: number[][], isotropic = true): number {
  const h = image.length;
  const w = image[0]?.length || 0;
  let tv = 0;

  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      const dx = j + 1 < w ? image[i][j + 1] - image[i][j] : 0;
      const dy = i + 1 < h ? image[i + 1][j] - image[i][j] : 0;

      if (isotropic) {
        tv += Math.hypot(dx, dy);
      } else {
        tv += Math.abs(dx) + Math.abs(dy);
      }
    }
  }
  return tv;
}

/**
 * Closed-form 1D Tikhonov Regularization: x = (A^T A + lambda I)^(-1) A^T y
 */
export function solveTikhonov1D(y: number[], A: number[][], lambda: number): number[] {
  const m = A.length;
  const n = A[0]?.length || 0;

  // Normal equations: (AtA + lambda * I) x = At y
  const M: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const rhs: number[] = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < m; k++) sum += A[k][i] * A[k][j];
      M[i][j] = sum + (i === j ? lambda : 0);
    }
    let rhsSum = 0;
    for (let k = 0; k < m; k++) rhsSum += A[k][i] * y[k];
    rhs[i] = rhsSum;
  }

  // Gaussian elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    }
    const tempRow = M[i];
    M[i] = M[maxRow];
    M[maxRow] = tempRow;
    const tempRhs = rhs[i];
    rhs[i] = rhs[maxRow];
    rhs[maxRow] = tempRhs;

    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-12) continue;

    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / pivot;
      for (let j = i; j < n; j++) M[k][j] -= factor * M[i][j];
      rhs[k] -= factor * rhs[i];
    }
  }

  // Back substitution
  const x: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = rhs[i];
    for (let j = i + 1; j < n; j++) sum -= M[i][j] * x[j];
    x[i] = sum / (Math.abs(M[i][i]) > 1e-12 ? M[i][i] : 1e-12);
  }

  return x;
}

/**
 * ADMM Solver for 2D Total Variation Denoising (Rudin-Osher-Fatemi Model):
 * min_x (1/2) ||x - y||_2^2 + lambda ||nabla x||_1
 * Variable splitting: z = nabla x
 * Alternating updates on x, z (soft thresholding), and dual multipliers u.
 */
export function solveAdmmTvDenoising(
  noisy: number[][],
  lambda = 0.15,
  rho = 1.0,
  maxIter = 25
): {
  restored: number[][];
  primalResiduals: number[];
  dualResiduals: number[];
  iterations: number;
  finalTv: number;
} {
  const h = noisy.length;
  const w = noisy[0]?.length || 0;

  // Primal variable x (starts from noisy)
  const x: number[][] = noisy.map((r) => [...r]);
  // Split variables z_x, z_y
  const zx: number[][] = Array.from({ length: h }, () => new Array(w).fill(0));
  const zy: number[][] = Array.from({ length: h }, () => new Array(w).fill(0));
  // Dual variables ux, uy
  const ux: number[][] = Array.from({ length: h }, () => new Array(w).fill(0));
  const uy: number[][] = Array.from({ length: h }, () => new Array(w).fill(0));

  const primalResiduals: number[] = [];
  const dualResiduals: number[] = [];

  for (let iter = 0; iter < maxIter; iter++) {
    // 1. Save previous z for dual residual
    const prevZx = zx.map((r) => [...r]);
    const prevZy = zy.map((r) => [...r]);

    // 2. Update x: solve (I - rho * Laplacian) x = y - rho * div(z - u)
    // Gauss-Seidel relaxation (5 sub-iterations)
    for (let gs = 0; gs < 4; gs++) {
      for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
          // Divergence of (z - u)
          const zux = zx[i][j] - ux[i][j];
          const zux_prev = j > 0 ? zx[i][j - 1] - ux[i][j - 1] : 0;
          const divX = zux - zux_prev;

          const zuy = zy[i][j] - uy[i][j];
          const zuy_prev = i > 0 ? zy[i - 1][j] - uy[i - 1][j] : 0;
          const divY = zuy - zuy_prev;

          const divTotal = divX + divY;

          // Neighbors for discrete Laplacian
          const up = i > 0 ? x[i - 1][j] : x[i][j];
          const down = i + 1 < h ? x[i + 1][j] : x[i][j];
          const left = j > 0 ? x[i][j - 1] : x[i][j];
          const right = j + 1 < w ? x[i][j + 1] : x[i][j];

          const neighbors = up + down + left + right;
          // (1 + 4*rho) * x_new = y - rho * divTotal + rho * neighbors
          x[i][j] = (noisy[i][j] - rho * divTotal + rho * neighbors) / (1 + 4 * rho);
        }
      }
    }

    // 3. Compute gradients of updated x and update z via soft thresholding
    let primalResSum = 0;
    let dualResSum = 0;
    const tau = lambda / rho;

    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        const dx = j + 1 < w ? x[i][j + 1] - x[i][j] : 0;
        const dy = i + 1 < h ? x[i + 1][j] - x[i][j] : 0;

        // Isotropic shrinkage
        const vx = dx + ux[i][j];
        const vy = dy + uy[i][j];
        const vNorm = Math.hypot(vx, vy);

        let newZx = 0;
        let newZy = 0;
        if (vNorm > tau && vNorm > 1e-12) {
          const factor = (vNorm - tau) / vNorm;
          newZx = vx * factor;
          newZy = vy * factor;
        }

        zx[i][j] = newZx;
        zy[i][j] = newZy;

        // 4. Update dual multipliers u = u + nabla x - z
        const rx = dx - newZx;
        const ry = dy - newZy;
        ux[i][j] += rx;
        uy[i][j] += ry;

        // Accumulate residuals
        primalResSum += rx * rx + ry * ry;
        const sx = -rho * (newZx - prevZx[i][j]);
        const sy = -rho * (newZy - prevZy[i][j]);
        dualResSum += sx * sx + sy * sy;
      }
    }

    primalResiduals.push(Math.sqrt(primalResSum / (h * w)));
    dualResiduals.push(Math.sqrt(dualResSum / (h * w)));
  }

  const finalTv = computeTotalVariation(x, true);
  return {
    restored: x,
    primalResiduals,
    dualResiduals,
    iterations: maxIter,
    finalTv
  };
}

// ============================================================================
// 6. ADV-05: MULTI-VIEW GEOMETRY, 8-POINT F-MATRIX, TRIANGULATION & BUNDLE ADJUSTMENT
// ============================================================================

/**
 * Pinhole Camera Projection: x_pixel = K [R | t] X_world
 */
export function projectPoint3D(
  P_world: [number, number, number],
  K: number[][],
  R: number[][],
  t: [number, number, number]
): [number, number] {
  // Camera frame X_c = R * X_w + t
  const xc = R[0][0] * P_world[0] + R[0][1] * P_world[1] + R[0][2] * P_world[2] + t[0];
  const yc = R[1][0] * P_world[0] + R[1][1] * P_world[1] + R[1][2] * P_world[2] + t[1];
  const zc = R[2][0] * P_world[0] + R[2][1] * P_world[1] + R[2][2] * P_world[2] + t[2];

  const zSafe = Math.abs(zc) > 1e-6 ? zc : 1e-6;
  const xn = xc / zSafe;
  const yn = yc / zSafe;

  const u = K[0][0] * xn + K[0][1] * yn + K[0][2];
  const v = K[1][1] * yn + K[1][2];

  return [u, v];
}

/**
 * Computes Epipolar Line l = [a, b, c]^T (where a*u + b*v + c = 0)
 * for a point in one view projected to the other.
 */
export function computeEpipolarLine(
  F: number[][],
  point: [number, number],
  whichView: 1 | 2
): [number, number, number] {
  let a: number;
  let b: number;
  let c: number;

  if (whichView === 1) {
    // Line in view 2: l2 = F * [u1, v1, 1]^T
    a = F[0][0] * point[0] + F[0][1] * point[1] + F[0][2];
    b = F[1][0] * point[0] + F[1][1] * point[1] + F[1][2];
    c = F[2][0] * point[0] + F[2][1] * point[1] + F[2][2];
  } else {
    // Line in view 1: l1 = F^T * [u2, v2, 1]^T
    a = F[0][0] * point[0] + F[1][0] * point[1] + F[2][0];
    b = F[0][1] * point[0] + F[1][1] * point[1] + F[2][1];
    c = F[0][2] * point[0] + F[1][2] * point[1] + F[2][2];
  }

  // Normalize so a^2 + b^2 = 1
  const norm = Math.hypot(a, b);
  if (norm > 1e-12) {
    a /= norm;
    b /= norm;
    c /= norm;
  }
  return [a, b, c];
}

/**
 * First-Order Sampson Distance for epipolar error:
 * d^2 = (x2^T F x1)^2 / ((F x1)_1^2 + (F x1)_2^2 + (F^T x2)_1^2 + (F^T x2)_2^2)
 */
export function computeSampsonDistance(
  F: number[][],
  p1: [number, number],
  p2: [number, number]
): number {
  const p1Hom = [p1[0], p1[1], 1];
  const p2Hom = [p2[0], p2[1], 1];

  // F * x1
  const Fx1_0 = F[0][0] * p1Hom[0] + F[0][1] * p1Hom[1] + F[0][2];
  const Fx1_1 = F[1][0] * p1Hom[0] + F[1][1] * p1Hom[1] + F[1][2];
  const Fx1_2 = F[2][0] * p1Hom[0] + F[2][1] * p1Hom[1] + F[2][2];

  // algebraic error = p2^T * F * x1
  const algErr = p2Hom[0] * Fx1_0 + p2Hom[1] * Fx1_1 + p2Hom[2] * Fx1_2;

  // F^T * x2
  const Ftx2_0 = F[0][0] * p2Hom[0] + F[1][0] * p2Hom[1] + F[2][0] * p2Hom[2];
  const Ftx2_1 = F[0][1] * p2Hom[0] + F[1][1] * p2Hom[1] + F[2][1] * p2Hom[2];

  const denom = Fx1_0 * Fx1_0 + Fx1_1 * Fx1_1 + Ftx2_0 * Ftx2_0 + Ftx2_1 * Ftx2_1;
  return denom > 1e-12 ? (algErr * algErr) / denom : 0;
}

/**
 * Normalized 8-Point Algorithm for Fundamental Matrix F:
 * Hartley normalization -> SVD nullspace -> Rank-2 enforcement (det F = 0) -> Denormalization
 */
export function estimateFundamentalMatrix8Point(
  points1: Array<[number, number]>,
  points2: Array<[number, number]>
): number[][] {
  const N = Math.min(points1.length, points2.length);
  if (N < 8) {
    return [
      [0, 0, 0],
      [0, 0, -1],
      [0, 1, 0]
    ];
  }

  // 1. Hartley Normalization
  function normalize(pts: Array<[number, number]>) {
    let meanX = 0;
    let meanY = 0;
    for (const [x, y] of pts) {
      meanX += x;
      meanY += y;
    }
    meanX /= pts.length;
    meanY /= pts.length;

    let distSum = 0;
    for (const [x, y] of pts) {
      distSum += Math.hypot(x - meanX, y - meanY);
    }
    const scale = (Math.SQRT2 * pts.length) / (distSum > 1e-12 ? distSum : 1);

    const T = [
      [scale, 0, -scale * meanX],
      [0, scale, -scale * meanY],
      [0, 0, 1]
    ];
    const normalized = pts.map(([x, y]) => [scale * (x - meanX), scale * (y - meanY)] as [number, number]);
    return { T, normalized };
  }

  const norm1 = normalize(points1);
  const norm2 = normalize(points2);

  // 2. Build N x 9 matrix A
  const A: number[][] = [];
  for (let i = 0; i < N; i++) {
    const [u1, v1] = norm1.normalized[i];
    const [u2, v2] = norm2.normalized[i];
    A.push([u2 * u1, u2 * v1, u2, v2 * u1, v2 * v1, v2, u1, v1, 1]);
  }

  // 3. SVD of A, nullspace vector is last column of V
  const svdA = svdGeneral(A);
  const fVec = svdA.V.map((row) => row[8]); // 9th column (index 8)

  const F_hat = [
    [fVec[0], fVec[1], fVec[2]],
    [fVec[3], fVec[4], fVec[5]],
    [fVec[6], fVec[7], fVec[8]]
  ];

  // 4. Rank-2 enforcement: SVD of F_hat, set sigma_3 = 0
  const svdF = svdGeneral(F_hat);
  const F_rank2: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      // Reconstruct with sigma[0] and sigma[1] only
      F_rank2[i][j] =
        svdF.U[i][0] * svdF.sigma[0] * svdF.V[j][0] +
        svdF.U[i][1] * svdF.sigma[1] * svdF.V[j][1];
    }
  }

  // 5. Denormalize: F = T2^T * F_rank2 * T1
  const T2t = [
    [norm2.T[0][0], norm2.T[1][0], norm2.T[2][0]],
    [norm2.T[0][1], norm2.T[1][1], norm2.T[2][1]],
    [norm2.T[0][2], norm2.T[1][2], norm2.T[2][2]]
  ];

  // Multiply T2t * F_rank2
  const M: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += T2t[i][k] * F_rank2[k][j];
      M[i][j] = sum;
    }
  }

  // Multiply M * T1
  const F_out: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += M[i][k] * norm1.T[k][j];
      F_out[i][j] = sum;
    }
  }

  // Normalize scale so F[2][2] is 1.0 (if non-zero)
  const f33 = F_out[2][2];
  if (Math.abs(f33) > 1e-12) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) F_out[i][j] /= f33;
    }
  }

  return F_out;
}

/**
 * Linear DLT Triangulation of a 3D point from two camera projections:
 * Solves A X = 0 where A is 4x4 matrix formed from cross-product constraints.
 */
export function triangulatePointLinear(
  p1: [number, number],
  p2: [number, number],
  P1: number[][],
  P2: number[][]
): [number, number, number] {
  const A: number[][] = [
    [p1[0] * P1[2][0] - P1[0][0], p1[0] * P1[2][1] - P1[0][1], p1[0] * P1[2][2] - P1[0][2], p1[0] * P1[2][3] - P1[0][3]],
    [p1[1] * P1[2][0] - P1[1][0], p1[1] * P1[2][1] - P1[1][1], p1[1] * P1[2][2] - P1[1][2], p1[1] * P1[2][3] - P1[1][3]],
    [p2[0] * P2[2][0] - P2[0][0], p2[0] * P2[2][1] - P2[0][1], p2[0] * P2[2][2] - P2[0][2], p2[0] * P2[2][3] - P2[0][3]],
    [p2[1] * P2[2][0] - P2[1][0], p2[1] * P2[2][1] - P2[1][1], p2[1] * P2[2][2] - P2[1][2], p2[1] * P2[2][3] - P2[1][3]]
  ];

  const svd = svdGeneral(A);
  // Last column of V (index 3) is homogeneous 3D coordinate [X, Y, Z, W]^T
  const X_hom = svd.V.map((row) => row[3]);
  const w = Math.abs(X_hom[3]) > 1e-12 ? X_hom[3] : 1e-12;

  return [X_hom[0] / w, X_hom[1] / w, X_hom[2] / w];
}

/**
 * Decomposes Essential Matrix E = K2^T F K1 into relative camera pose [R | t]
 * using cheirality check (positive depth Z > 0 in both cameras).
 */
export function decomposeEssentialMatrix(
  E: number[][],
  K1: number[][],
  K2: number[][],
  testP1: [number, number],
  testP2: [number, number]
): { R: number[][]; t: [number, number, number] } {
  const svd = svdGeneral(E);

  const W = [
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, 1]
  ];
  const Wt = [
    [0, 1, 0],
    [-1, 0, 0],
    [0, 0, 1]
  ];

  // Two rotation candidates: R1 = U W V^T, R2 = U W^T V^T
  function mult3x3(A: number[][], B: number[][]): number[][] {
    const C: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let k = 0; k < 3; k++) sum += A[i][k] * B[k][j];
        C[i][j] = sum;
      }
    }
    return C;
  }

  function det3x3(M: number[][]): number {
    return (
      M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
      M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
      M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])
    );
  }

  let U = svd.U.map((r) => [...r]);
  let V = svd.V.map((r) => [...r]);
  if (det3x3(U) < 0) U = U.map((r) => r.map((v) => -v));
  if (det3x3(V) < 0) V = V.map((r) => r.map((v) => -v));

  const Vt = [
    [V[0][0], V[1][0], V[2][0]],
    [V[0][1], V[1][1], V[2][1]],
    [V[0][2], V[1][2], V[2][2]]
  ];

  let R1 = mult3x3(mult3x3(U, W), Vt);
  let R2 = mult3x3(mult3x3(U, Wt), Vt);

  if (det3x3(R1) < 0) R1 = R1.map((row) => row.map((v) => -v));
  if (det3x3(R2) < 0) R2 = R2.map((row) => row.map((v) => -v));

  // Translation candidate t is 3rd column of U
  const t_pos: [number, number, number] = [U[0][2], U[1][2], U[2][2]];
  const t_neg: [number, number, number] = [-t_pos[0], -t_pos[1], -t_pos[2]];

  const candidates = [
    { R: R1, t: t_pos },
    { R: R1, t: t_neg },
    { R: R2, t: t_pos },
    { R: R2, t: t_neg }
  ];

  // Camera 1 projection matrix P1 = K1 [I | 0]
  const P1: number[][] = [
    [K1[0][0], K1[0][1], K1[0][2], 0],
    [0, K1[1][1], K1[1][2], 0],
    [0, 0, 1, 0]
  ];

  for (const cand of candidates) {
    // P2 = K2 [R | t]
    const P2: number[][] = [];
    for (let i = 0; i < 3; i++) {
      const row: number[] = [];
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let k = 0; k < 3; k++) sum += K2[i][k] * cand.R[k][j];
        row.push(sum);
      }
      let tSum = 0;
      for (let k = 0; k < 3; k++) tSum += K2[i][k] * cand.t[k];
      row.push(tSum);
      P2.push(row);
    }

    const X3D = triangulatePointLinear(testP1, testP2, P1, P2);
    // Depth in cam 1 is Z (since P1 = [I | 0])
    const z1 = X3D[2];
    // Depth in cam 2 is R_3 * X + t_3
    const z2 = cand.R[2][0] * X3D[0] + cand.R[2][1] * X3D[1] + cand.R[2][2] * X3D[2] + cand.t[2];

    if (z1 > 0 && z2 > 0) {
      return cand;
    }
  }

  return candidates[0];
}

/**
 * Computes Reprojection RMSE across multiple cameras and 3D points.
 */
export function computeReprojectionRmse(
  points3D: Array<[number, number, number]>,
  observations: Array<{ viewIdx: number; pointIdx: number; uv: [number, number] }>,
  cameras: Array<{ K: number[][]; R: number[][]; t: [number, number, number] }>
): number {
  if (observations.length === 0) return 0;
  let sumSqErr = 0;

  for (const obs of observations) {
    const pt = points3D[obs.pointIdx];
    const cam = cameras[obs.viewIdx];
    const proj = projectPoint3D(pt, cam.K, cam.R, cam.t);

    const du = proj[0] - obs.uv[0];
    const dv = proj[1] - obs.uv[1];
    sumSqErr += du * du + dv * dv;
  }

  return Math.sqrt(sumSqErr / observations.length);
}

/**
 * Synthetic Bundle Adjustment Optimization:
 * Minimizes total reprojection RMSE by optimizing 3D points via gradient descent while holding camera 0 fixed.
 */
export function optimizeBundleAdjustmentSynthetic(
  points3D: Array<[number, number, number]>,
  observations: Array<{ viewIdx: number; pointIdx: number; uv: [number, number] }>,
  cameras: Array<{ K: number[][]; R: number[][]; t: [number, number, number] }>,
  iterations = 12
): { refinedPoints: Array<[number, number, number]>; initialRmse: number; finalRmse: number } {
  const initialRmse = computeReprojectionRmse(points3D, observations, cameras);
  const refinedPoints: Array<[number, number, number]> = points3D.map((p) => [...p]);

  const obsByPoint: Array<Array<{ viewIdx: number; uv: [number, number] }>> = Array.from(
    { length: refinedPoints.length },
    () => []
  );
  for (const obs of observations) {
    obsByPoint[obs.pointIdx].push({ viewIdx: obs.viewIdx, uv: obs.uv });
  }

  for (let it = 0; it < iterations; it++) {
    for (let p = 0; p < refinedPoints.length; p++) {
      const ptObs = obsByPoint[p];
      if (ptObs.length === 0) continue;

      const pt = refinedPoints[p];

      // Form normal equations (J^T J + lambda I) delta = -J^T r
      const H = [
        [1.0, 0, 0],
        [0, 1.0, 0],
        [0, 0, 1.0]
      ];
      const g = [0, 0, 0];

      for (const obs of ptObs) {
        const cam = cameras[obs.viewIdx];
        const proj = projectPoint3D(pt, cam.K, cam.R, cam.t);
        const du = proj[0] - obs.uv[0];
        const dv = proj[1] - obs.uv[1];

        const eps = 1e-4;
        const projX = projectPoint3D([pt[0] + eps, pt[1], pt[2]], cam.K, cam.R, cam.t);
        const projY = projectPoint3D([pt[0], pt[1] + eps, pt[2]], cam.K, cam.R, cam.t);
        const projZ = projectPoint3D([pt[0], pt[1], pt[2] + eps], cam.K, cam.R, cam.t);

        const Jux = (projX[0] - proj[0]) / eps;
        const Juy = (projY[0] - proj[0]) / eps;
        const Juz = (projZ[0] - proj[0]) / eps;

        const Jvx = (projX[1] - proj[1]) / eps;
        const Jvy = (projY[1] - proj[1]) / eps;
        const Jvz = (projZ[1] - proj[1]) / eps;

        H[0][0] += Jux * Jux + Jvx * Jvx;
        H[0][1] += Jux * Juy + Jvx * Jvy;
        H[0][2] += Jux * Juz + Jvx * Jvz;
        H[1][0] += Juy * Jux + Jvy * Jvx;
        H[1][1] += Juy * Juy + Jvy * Jvy;
        H[1][2] += Juy * Juz + Jvy * Jvz;
        H[2][0] += Juz * Jux + Jvz * Jvx;
        H[2][1] += Juz * Juy + Jvz * Jvy;
        H[2][2] += Juz * Juz + Jvz * Jvz;

        g[0] += Jux * du + Jvx * dv;
        g[1] += Juy * du + Jvy * dv;
        g[2] += Juz * du + Jvz * dv;
      }

      const detH =
        H[0][0] * (H[1][1] * H[2][2] - H[1][2] * H[2][1]) -
        H[0][1] * (H[1][0] * H[2][2] - H[1][2] * H[2][0]) +
        H[0][2] * (H[1][0] * H[2][1] - H[1][1] * H[2][0]);

      if (Math.abs(detH) > 1e-10) {
        const invDet = 1 / detH;
        const invH00 = (H[1][1] * H[2][2] - H[1][2] * H[2][1]) * invDet;
        const invH01 = (H[0][2] * H[2][1] - H[0][1] * H[2][2]) * invDet;
        const invH02 = (H[0][1] * H[1][2] - H[0][2] * H[1][1]) * invDet;

        const invH10 = (H[1][2] * H[2][0] - H[1][0] * H[2][2]) * invDet;
        const invH11 = (H[0][0] * H[2][2] - H[0][2] * H[2][0]) * invDet;
        const invH12 = (H[0][2] * H[1][0] - H[0][0] * H[1][2]) * invDet;

        const invH20 = (H[1][0] * H[2][1] - H[1][1] * H[2][0]) * invDet;
        const invH21 = (H[0][1] * H[2][0] - H[0][0] * H[2][1]) * invDet;
        const invH22 = (H[0][0] * H[1][1] - H[0][1] * H[1][0]) * invDet;

        const delta0 = -(invH00 * g[0] + invH01 * g[1] + invH02 * g[2]);
        const delta1 = -(invH10 * g[0] + invH11 * g[1] + invH12 * g[2]);
        const delta2 = -(invH20 * g[0] + invH21 * g[1] + invH22 * g[2]);

        refinedPoints[p][0] += delta0;
        refinedPoints[p][1] += delta1;
        refinedPoints[p][2] += delta2;
      }
    }
  }

  const finalRmse = computeReprojectionRmse(refinedPoints, observations, cameras);
  return { refinedPoints, initialRmse, finalRmse };
}

// ============================================================================
// 6. ADV-04: ADVANCED DEEP RECOGNITION & ATTENTION MECHANISMS
// ============================================================================

export interface AttentionResult {
  weights: number[][]; // [Tq, Tk]
  output: number[][];  // [Tq, Dv]
}

/**
 * Scaled Dot-Product Attention (Vaswani et al. 2017)
 * Attention(Q, K, V) = Softmax(Q K^T / sqrt(d_k)) V
 */
export function scaledDotProductAttention(
  Q: number[][],
  K: number[][],
  V: number[][],
  mask?: boolean[][]
): AttentionResult {
  const Tq = Q.length;
  const Tk = K.length;
  if (Tq === 0 || Tk === 0) return { weights: [], output: [] };

  const dk = K[0].length;
  const Dv = V[0].length;
  const scale = 1.0 / Math.sqrt(Math.max(1, dk));

  // 1. Raw scores S = Q * K^T * scale
  const rawScores: number[][] = [];
  for (let q = 0; q < Tq; q++) {
    const row: number[] = [];
    for (let k = 0; k < Tk; k++) {
      let dot = 0;
      for (let d = 0; d < dk; d++) {
        dot += Q[q][d] * K[k][d];
      }
      let score = dot * scale;
      if (mask && mask[q] && mask[q][k]) {
        score = -1e9;
      }
      row.push(score);
    }
    rawScores.push(row);
  }

  // 2. Row-wise Softmax with numerical max subtraction
  const weights: number[][] = [];
  for (let q = 0; q < Tq; q++) {
    let maxVal = -Infinity;
    for (let k = 0; k < Tk; k++) {
      if (rawScores[q][k] > maxVal) maxVal = rawScores[q][k];
    }

    let sumExp = 0;
    const expRow: number[] = [];
    for (let k = 0; k < Tk; k++) {
      const e = Math.exp(rawScores[q][k] - maxVal);
      expRow.push(e);
      sumExp += e;
    }

    const wRow: number[] = [];
    const invSum = sumExp > 0 ? 1 / sumExp : 1.0 / Tk;
    for (let k = 0; k < Tk; k++) {
      wRow.push(expRow[k] * invSum);
    }
    weights.push(wRow);
  }

  // 3. Output O = Weights * V
  const output: number[][] = [];
  for (let q = 0; q < Tq; q++) {
    const outRow: number[] = new Array(Dv).fill(0);
    for (let k = 0; k < Tk; k++) {
      const w = weights[q][k];
      for (let v = 0; v < Dv; v++) {
        outRow[v] += w * V[k][v];
      }
    }
    output.push(outRow);
  }

  return { weights, output };
}

/**
 * Multi-Head Attention splitting across h heads
 */
export function multiHeadAttention(
  Q: number[][],
  K: number[][],
  V: number[][],
  numHeads = 2
): { output: number[][]; headWeights: number[][][] } {
  const Tq = Q.length;
  const dModel = Q[0] ? Q[0].length : 0;
  if (Tq === 0 || dModel === 0 || numHeads <= 0) {
    return { output: [], headWeights: [] };
  }

  const dHead = Math.max(1, Math.floor(dModel / numHeads));
  const headOutputs: number[][][] = [];
  const headWeights: number[][][] = [];

  for (let h = 0; h < numHeads; h++) {
    const start = h * dHead;
    const end = start + dHead;

    const Qh = Q.map((row) => row.slice(start, end));
    const Kh = K.map((row) => row.slice(start, end));
    const Vh = V.map((row) => row.slice(start, end));

    const res = scaledDotProductAttention(Qh, Kh, Vh);
    headOutputs.push(res.output);
    headWeights.push(res.weights);
  }

  // Concatenate head outputs along feature dimension
  const output: number[][] = [];
  for (let q = 0; q < Tq; q++) {
    const concatRow: number[] = [];
    for (let h = 0; h < numHeads; h++) {
      concatRow.push(...headOutputs[h][q]);
    }
    output.push(concatRow);
  }

  return { output, headWeights };
}

/**
 * Bilinear 2D feature map interpolation for sub-pixel coordinates
 */
export function bilinearInterpolate2D(
  featureMap: number[][],
  x: number,
  y: number
): number {
  const H = featureMap.length;
  if (H === 0) return 0;
  const W = featureMap[0].length;
  if (W === 0) return 0;

  const clampedX = Math.max(0, Math.min(W - 1, x));
  const clampedY = Math.max(0, Math.min(H - 1, y));

  const x0 = Math.floor(clampedX);
  const x1 = Math.min(W - 1, x0 + 1);
  const y0 = Math.floor(clampedY);
  const y1 = Math.min(H - 1, y0 + 1);

  const wx = clampedX - x0;
  const wy = clampedY - y0;

  const top = (1 - wx) * featureMap[y0][x0] + wx * featureMap[y0][x1];
  const bottom = (1 - wx) * featureMap[y1][x0] + wx * featureMap[y1][x1];

  return (1 - wy) * top + wy * bottom;
}

export interface DeformableSamplePoint {
  refX: number;
  refY: number;
  offsetX: number;
  offsetY: number;
  sampleX: number;
  sampleY: number;
  weight: number;
  sampledValue: number;
}

/**
 * Deformable Attention 2D (Zhu et al. ICLR 2021)
 * Samples K key points with learned 2D offsets around a 2D reference point
 */
export function deformableAttention2D(
  featureMap: number[][],
  refPoint: [number, number],
  offsets: Array<[number, number]>,
  weights: number[]
): { aggregatedValue: number; samples: DeformableSamplePoint[] } {
  const [rx, ry] = refPoint;
  const K = offsets.length;
  let weightSum = weights.reduce((a, b) => a + b, 0);
  if (weightSum <= 0) weightSum = 1;

  let aggregatedValue = 0;
  const samples: DeformableSamplePoint[] = [];

  for (let k = 0; k < K; k++) {
    const [dx, dy] = offsets[k];
    const sx = rx + dx;
    const sy = ry + dy;
    const normW = (weights[k] || 0) / weightSum;
    const val = bilinearInterpolate2D(featureMap, sx, sy);

    aggregatedValue += normW * val;
    samples.push({
      refX: rx,
      refY: ry,
      offsetX: dx,
      offsetY: dy,
      sampleX: sx,
      sampleY: sy,
      weight: normW,
      sampledValue: val
    });
  }

  return { aggregatedValue, samples };
}

/**
 * Bounding Box Intersection over Union (IoU)
 * Box format: [x1, y1, x2, y2]
 */
export function boxIoU(
  boxA: [number, number, number, number],
  boxB: [number, number, number, number]
): number {
  const ax1 = Math.min(boxA[0], boxA[2]);
  const ay1 = Math.min(boxA[1], boxA[3]);
  const ax2 = Math.max(boxA[0], boxA[2]);
  const ay2 = Math.max(boxA[1], boxA[3]);

  const bx1 = Math.min(boxB[0], boxB[2]);
  const by1 = Math.min(boxB[1], boxB[3]);
  const bx2 = Math.max(boxB[0], boxB[2]);
  const by2 = Math.max(boxB[1], boxB[3]);

  const interX1 = Math.max(ax1, bx1);
  const interY1 = Math.max(ay1, by1);
  const interX2 = Math.min(ax2, bx2);
  const interY2 = Math.min(ay2, by2);

  const interW = Math.max(0, interX2 - interX1);
  const interH = Math.max(0, interY2 - interY1);
  const intersection = interW * interH;

  const areaA = (ax2 - ax1) * (ay2 - ay1);
  const areaB = (bx2 - bx1) * (by2 - by1);
  const union = areaA + areaB - intersection;

  return union > 0 ? intersection / union : 0;
}

/**
 * Generalized Intersection over Union (GIoU) (Rezatofighi et al. CVPR 2019)
 * GIoU = IoU - (Area(C) - Area(Union)) / Area(C)
 */
export function boxGIoU(
  boxA: [number, number, number, number],
  boxB: [number, number, number, number]
): number {
  const ax1 = Math.min(boxA[0], boxA[2]);
  const ay1 = Math.min(boxA[1], boxA[3]);
  const ax2 = Math.max(boxA[0], boxA[2]);
  const ay2 = Math.max(boxA[1], boxA[3]);

  const bx1 = Math.min(boxB[0], boxB[2]);
  const by1 = Math.min(boxB[1], boxB[3]);
  const bx2 = Math.max(boxB[0], boxB[2]);
  const by2 = Math.max(boxB[1], boxB[3]);

  const interX1 = Math.max(ax1, bx1);
  const interY1 = Math.max(ay1, by1);
  const interX2 = Math.min(ax2, bx2);
  const interY2 = Math.min(ay2, by2);

  const interW = Math.max(0, interX2 - interX1);
  const interH = Math.max(0, interY2 - interY1);
  const intersection = interW * interH;

  const areaA = (ax2 - ax1) * (ay2 - ay1);
  const areaB = (bx2 - bx1) * (by2 - by1);
  const union = areaA + areaB - intersection;
  const iou = union > 0 ? intersection / union : 0;

  // Smallest enclosing box C
  const encX1 = Math.min(ax1, bx1);
  const encY1 = Math.min(ay1, by1);
  const encX2 = Math.max(ax2, bx2);
  const encY2 = Math.max(ay2, by2);
  const areaC = Math.max(1e-8, (encX2 - encX1) * (encY2 - encY1));

  return iou - (areaC - union) / areaC;
}

/**
 * Focal Loss for dense object detection (Lin et al. ICCV 2017)
 * FL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)
 */
export function focalLoss(
  p: number,
  y: number,
  alpha = 0.25,
  gamma = 2.0
): number {
  const pClamped = Math.min(Math.max(p, 1e-7), 1 - 1e-7);
  const pt = y === 1 ? pClamped : 1 - pClamped;
  const alphaT = y === 1 ? alpha : 1 - alpha;
  const modulatingFactor = Math.pow(1 - pt, gamma);
  return -alphaT * modulatingFactor * Math.log(pt);
}

export interface DetrMatchCost {
  classCost: number;
  l1Cost: number;
  giouCost: number;
  totalCost: number;
}

/**
 * DETR Bipartite Matching Cost between a single query and target (Carion et al. ECCV 2020)
 * Cost = -lambda_class * p(c) + lambda_L1 * ||b - b_hat||_1 + lambda_giou * (1 - GIoU(b, b_hat))
 */
export function computeDetrMatchingCost(
  predBox: [number, number, number, number],
  predProb: number,
  targetBox: [number, number, number, number],
  targetClass: number,
  predClass: number,
  costClass = 1.0,
  costL1 = 5.0,
  costGIoU = 2.0
): DetrMatchCost {
  const classCost = predClass === targetClass ? -costClass * predProb : 0;

  // L1 coordinate loss on [cx, cy, w, h] normalized
  const l1 =
    Math.abs(predBox[0] - targetBox[0]) +
    Math.abs(predBox[1] - targetBox[1]) +
    Math.abs(predBox[2] - targetBox[2]) +
    Math.abs(predBox[3] - targetBox[3]);
  const l1Cost = costL1 * l1;

  const giou = boxGIoU(predBox, targetBox);
  const giouCost = costGIoU * (1.0 - giou);

  const totalCost = classCost + l1Cost + giouCost;
  return { classCost, l1Cost, giouCost, totalCost };
}

/**
 * DETR Hungarian Matching across multiple object queries and ground truth boxes
 */
export function hungarianMatchingDetr(
  predBoxes: Array<[number, number, number, number]>,
  predProbs: number[][], // [numQueries, numClasses]
  targetBoxes: Array<[number, number, number, number]>,
  targetClasses: number[], // [numTargets]
  costClass = 1.0,
  costL1 = 5.0,
  costGIoU = 2.0
): {
  matches: Array<{ queryIdx: number; targetIdx: number; cost: number }>;
  totalCost: number;
  costMatrix: number[][];
} {
  const numQueries = predBoxes.length;
  const numTargets = targetBoxes.length;

  if (numQueries === 0 || numTargets === 0) {
    return { matches: [], totalCost: 0, costMatrix: [] };
  }

  const costMatrix: number[][] = [];
  for (let q = 0; q < numQueries; q++) {
    const row: number[] = [];
    for (let t = 0; t < numTargets; t++) {
      const targetC = targetClasses[t];
      const prob = predProbs[q] && predProbs[q][targetC] !== undefined ? predProbs[q][targetC] : 0;
      const cost = computeDetrMatchingCost(
        predBoxes[q],
        prob,
        targetBoxes[t],
        targetC,
        targetC,
        costClass,
        costL1,
        costGIoU
      );
      row.push(cost.totalCost);
    }
    costMatrix.push(row);
  }

  const result = solveHungarianMatching(costMatrix);
  return {
    matches: result.matches.map((m) => ({
      queryIdx: m.trackIdx,
      targetIdx: m.detectionIdx,
      cost: m.cost
    })),
    totalCost: result.totalCost,
    costMatrix
  };
}

// ============================================================================
// 7. ADV-07: VISION FOUNDATION MODELS & PARAMETER-EFFICIENT ADAPTATION
// ============================================================================

/**
 * Cosine Similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 1e-12 ? dot / denom : 0;
}

/**
 * L2 Normalization of feature embedding
 */
export function l2Normalize(vec: number[]): number[] {
  let normSq = 0;
  for (let i = 0; i < vec.length; i++) normSq += vec[i] * vec[i];
  const norm = Math.sqrt(normSq);
  if (norm < 1e-12) return vec.slice();
  return vec.map((v) => v / norm);
}

/**
 * InfoNCE Contrastive Loss (van den Oord et al. 2018; Radford et al. 2021)
 * Loss = -log( exp(q . k_+ / tau) / ( exp(q . k_+ / tau) + sum_i exp(q . k_i / tau) ) )
 */
export function computeInfoNceLoss(
  query: number[],
  posKey: number[],
  negKeys: number[][],
  temperature = 0.07
): { loss: number; posSim: number; negSims: number[]; posProb: number } {
  const tau = Math.max(1e-4, temperature);
  const qNorm = l2Normalize(query);
  const posNorm = l2Normalize(posKey);

  const posSim = cosineSimilarity(qNorm, posNorm);
  const posLogit = posSim / tau;

  const negSims: number[] = [];
  const negLogits: number[] = [];
  for (const neg of negKeys) {
    const sim = cosineSimilarity(qNorm, l2Normalize(neg));
    negSims.push(sim);
    negLogits.push(sim / tau);
  }

  // Log-sum-exp trick for numerical stability
  let maxLogit = posLogit;
  for (const nl of negLogits) {
    if (nl > maxLogit) maxLogit = nl;
  }

  const expPos = Math.exp(posLogit - maxLogit);
  let sumExp = expPos;
  for (const nl of negLogits) {
    sumExp += Math.exp(nl - maxLogit);
  }

  const logSumExp = maxLogit + Math.log(sumExp);
  const loss = logSumExp - posLogit;
  const posProb = expPos / sumExp;

  return { loss, posSim, negSims, posProb };
}

/**
 * Low-Rank Adaptation (LoRA) Weight Matrix Decomposition (Hu et al. ICLR 2022)
 * W = W0 + (alpha / r) * (B * A)
 * W0: [dOut, dIn], B: [dOut, r], A: [r, dIn]
 */
export function applyLoraWeights(
  W0: number[][],
  B: number[][],
  A: number[][],
  alpha = 16,
  r = 4
): number[][] {
  const dOut = W0.length;
  if (dOut === 0) return [];
  const dIn = W0[0].length;
  const scaling = r > 0 ? alpha / r : 1.0;

  const adapted: number[][] = [];
  for (let i = 0; i < dOut; i++) {
    const row: number[] = [];
    for (let j = 0; j < dIn; j++) {
      let delta = 0;
      for (let k = 0; k < r; k++) {
        delta += B[i][k] * A[k][j];
      }
      row.push(W0[i][j] + scaling * delta);
    }
    adapted.push(row);
  }

  return adapted;
}

/**
 * Compute Trainable Parameter Savings for LoRA
 */
export function computeLoraParamCount(
  dIn: number,
  dOut: number,
  r: number
): {
  fullParams: number;
  loraParams: number;
  paramReductionRatio: number;
  savedPercentage: number;
} {
  const fullParams = dIn * dOut;
  const loraParams = (dIn + dOut) * r;
  const paramReductionRatio = fullParams > 0 ? fullParams / Math.max(1, loraParams) : 1;
  const savedPercentage = fullParams > 0 ? ((fullParams - loraParams) / fullParams) * 100 : 0;

  return { fullParams, loraParams, paramReductionRatio, savedPercentage };
}

/**
 * Temperature-Scaled Softmax distribution
 */
export function temperatureScaledSoftmax(
  logits: number[],
  temperature = 1.0
): number[] {
  const T = Math.max(1e-4, temperature);
  if (logits.length === 0) return [];

  let maxVal = -Infinity;
  for (const l of logits) {
    if (l / T > maxVal) maxVal = l / T;
  }

  let sumExp = 0;
  const exps: number[] = [];
  for (const l of logits) {
    const e = Math.exp(l / T - maxVal);
    exps.push(e);
    sumExp += e;
  }

  return exps.map((e) => (sumExp > 0 ? e / sumExp : 1.0 / logits.length));
}

// ============================================================================
// 8. ADV-08: EFFICIENT CV & EDGE AI ARCHITECTURE
// ============================================================================

export interface QuantizationParams {
  scale: number;
  zeroPoint: number;
  minVal: number;
  maxVal: number;
  qMin: number;
  qMax: number;
}

/**
 * Compute Affine Uniform Integer Quantization Parameters (Jacob et al. CVPR 2018)
 * Scale S = (max - min) / (qMax - qMin)
 * Zero-point Z = round((qMin * max - qMax * min) / (max - min))
 */
export function computeAffineQuantizationParams(
  minVal: number,
  maxVal: number,
  numBits = 8,
  symmetric = false
): QuantizationParams {
  const qMin = 0;
  const qMax = Math.pow(2, numBits) - 1;

  if (Math.abs(maxVal - minVal) < 1e-10) {
    return { scale: 1.0, zeroPoint: 0, minVal, maxVal, qMin, qMax };
  }

  let effectiveMin = minVal;
  let effectiveMax = maxVal;

  if (symmetric) {
    const absMax = Math.max(Math.abs(minVal), Math.abs(maxVal));
    effectiveMin = -absMax;
    effectiveMax = absMax;
  }

  const scale = (effectiveMax - effectiveMin) / (qMax - qMin);
  let zeroPoint = Math.round((qMin * effectiveMax - qMax * effectiveMin) / (effectiveMax - effectiveMin));
  zeroPoint = Math.max(qMin, Math.min(qMax, zeroPoint));

  return { scale, zeroPoint, minVal: effectiveMin, maxVal: effectiveMax, qMin, qMax };
}

/**
 * Affine Integer Quantization: q = clamp(round(x / S) + Z, qMin, qMax)
 */
export function quantizeAffineInt8(val: number, params: QuantizationParams): number {
  const q = Math.round(val / params.scale) + params.zeroPoint;
  return Math.max(params.qMin, Math.min(params.qMax, q));
}

/**
 * Affine Integer Dequantization: x_hat = S * (q - Z)
 */
export function dequantizeAffineInt8(q: number, params: QuantizationParams): number {
  return params.scale * (q - params.zeroPoint);
}

/**
 * Compute Quantization Error and Signal-to-Quantization-Noise Ratio (SQNR)
 */
export function computeQuantizationError(
  original: number[],
  params: QuantizationParams
): {
  quantized: number[];
  dequantized: number[];
  mae: number;
  maxError: number;
  sqnrDb: number;
} {
  const quantized: number[] = [];
  const dequantized: number[] = [];
  let totalError = 0;
  let maxError = 0;
  let signalPower = 0;
  let noisePower = 0;

  for (const x of original) {
    const q = quantizeAffineInt8(x, params);
    const xHat = dequantizeAffineInt8(q, params);
    const err = Math.abs(x - xHat);

    quantized.push(q);
    dequantized.push(xHat);

    totalError += err;
    if (err > maxError) maxError = err;

    signalPower += x * x;
    noisePower += err * err;
  }

  const N = original.length || 1;
  const mae = totalError / N;
  const sqnrDb = noisePower > 1e-12 ? 10 * Math.log10(signalPower / noisePower) : 99.0;

  return { quantized, dequantized, mae, maxError, sqnrDb };
}

/**
 * Straight-Through Estimator (STE) forward and gradient pass
 */
export function straightThroughEstimator(
  val: number,
  params: QuantizationParams
): { forward: number; backwardGrad: (incomingGrad: number) => number } {
  const q = quantizeAffineInt8(val, params);
  const forward = dequantizeAffineInt8(q, params);

  const backwardGrad = (incomingGrad: number) => {
    // Passes gradient unmodified if within range, clips to zero if saturated
    if (val < params.minVal || val > params.maxVal) {
      return 0;
    }
    return incomingGrad;
  };

  return { forward, backwardGrad };
}

/**
 * Structured Channel Pruning based on L1-norm magnitude (Li et al. ICLR 2017)
 */
export function structuredChannelPruning(
  filterWeights: number[][][], // [outChannels][inChannels][kernelSize]
  pruneRatio = 0.5
): {
  channelL1Norms: number[];
  pruneMask: boolean[];
  prunedWeights: number[][][];
  sparsity: number;
} {
  const numOutChannels = filterWeights.length;
  if (numOutChannels === 0) {
    return { channelL1Norms: [], pruneMask: [], prunedWeights: [], sparsity: 0 };
  }

  // 1. Compute L1-norm per output channel
  const channelL1Norms: number[] = [];
  for (let c = 0; c < numOutChannels; c++) {
    let norm = 0;
    for (let i = 0; i < filterWeights[c].length; i++) {
      for (let k = 0; k < filterWeights[c][i].length; k++) {
        norm += Math.abs(filterWeights[c][i][k]);
      }
    }
    channelL1Norms.push(norm);
  }

  // 2. Determine pruning threshold from sorted norms
  const sortedNorms = [...channelL1Norms].sort((a, b) => a - b);
  const pruneCount = Math.floor(numOutChannels * Math.max(0, Math.min(0.99, pruneRatio)));
  const threshold = sortedNorms[pruneCount] || 0;

  const pruneMask: boolean[] = [];
  let prunedCount = 0;
  for (let c = 0; c < numOutChannels; c++) {
    const isPruned = channelL1Norms[c] < threshold;
    pruneMask.push(isPruned);
    if (isPruned) prunedCount++;
  }

  // 3. Apply mask to produce pruned weight tensor
  const prunedWeights: number[][][] = [];
  for (let c = 0; c < numOutChannels; c++) {
    const channelRow: number[][] = [];
    for (let i = 0; i < filterWeights[c].length; i++) {
      const kernelRow: number[] = [];
      for (let k = 0; k < filterWeights[c][i].length; k++) {
        kernelRow.push(pruneMask[c] ? 0 : filterWeights[c][i][k]);
      }
      channelRow.push(kernelRow);
    }
    prunedWeights.push(channelRow);
  }

  const sparsity = numOutChannels > 0 ? (prunedCount / numOutChannels) * 100 : 0;
  return { channelL1Norms, pruneMask, prunedWeights, sparsity };
}

/**
 * Compute Arithmetic Intensity: Operations per Byte (FLOPs / Byte)
 */
export function computeArithmeticIntensity(
  totalFlops: number,
  totalBytesMemoryAccess: number
): number {
  return totalBytesMemoryAccess > 0 ? totalFlops / totalBytesMemoryAccess : 0;
}

export interface RooflineResult {
  arithmeticIntensity: number;
  peakGFlops: number;
  peakBandwidthGBs: number;
  attainableGFlops: number;
  limitingFactor: 'memory-bound' | 'compute-bound';
  kneePoint: number;
}

/**
 * Roofline Performance Model Evaluation (Williams et al. CACM 2009)
 * Attainable Performance = min(Peak Compute, Arithmetic Intensity * Memory Bandwidth)
 */
export function evaluateRooflineModel(
  arithmeticIntensity: number,
  peakGFlops: number,
  peakBandwidthGBs: number
): RooflineResult {
  const kneePoint = peakBandwidthGBs > 0 ? peakGFlops / peakBandwidthGBs : 0;
  const memoryBoundCeiling = arithmeticIntensity * peakBandwidthGBs;
  const attainableGFlops = Math.min(peakGFlops, memoryBoundCeiling);
  const limitingFactor = arithmeticIntensity < kneePoint ? 'memory-bound' : 'compute-bound';

  return {
    arithmeticIntensity,
    peakGFlops,
    peakBandwidthGBs,
    attainableGFlops,
    limitingFactor,
    kneePoint
  };
}

/**
 * Latency Percentile Profiling (P50, P95, P99, Mean)
 */
export function calculateLatencyPercentiles(
  latenciesMs: number[]
): {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
} {
  if (latenciesMs.length === 0) {
    return { p50: 0, p95: 0, p99: 0, mean: 0, min: 0, max: 0 };
  }

  const sorted = [...latenciesMs].sort((a, b) => a - b);
  const n = sorted.length;

  const getPercentile = (p: number) => {
    const idx = (p / 100) * (n - 1);
    const low = Math.floor(idx);
    const high = Math.ceil(idx);
    const weight = idx - low;
    return sorted[low] * (1 - weight) + sorted[high] * weight;
  };

  const p50 = getPercentile(50);
  const p95 = getPercentile(95);
  const p99 = getPercentile(99);

  let sum = 0;
  for (const l of sorted) sum += l;
  const mean = sum / n;

  return {
    p50,
    p95,
    p99,
    mean,
    min: sorted[0],
    max: sorted[n - 1]
  };
}



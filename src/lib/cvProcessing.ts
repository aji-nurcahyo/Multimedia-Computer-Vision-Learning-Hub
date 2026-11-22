/**
 * Multimedia & Computer Vision Learning Hub - Core Computer Vision Engine
 * Academic Reference Implementation for Chapters 36-50
 * Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
 */

// ============================================================================
// 1. GEOMETRIC TRANSFORMATIONS (Chapter 36)
// ============================================================================

export interface AffineParams {
  tx: number;
  ty: number;
  scaleX: number;
  scaleY: number;
  rotationDeg: number;
  shearX: number;
}

export function computeAffineMatrix(params: AffineParams): number[][] {
  const rad = (params.rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // M = T * R * S * Sh
  // S * Sh:
  // [scaleX, scaleX * shearX, 0]
  // [0,      scaleY,          0]
  // [0,      0,               1]
  const a = params.scaleX * cos - params.scaleY * sin * params.shearX;
  const b = -params.scaleY * sin;
  const c = params.tx;

  const d = params.scaleX * sin + params.scaleY * cos * params.shearX;
  const e = params.scaleY * cos;
  const f = params.ty;

  return [
    [a, b, c],
    [d, e, f],
    [0, 0, 1]
  ];
}

export function invert3x3(M: number[][]): number[][] | null {
  const det =
    M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
    M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
    M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);

  if (Math.abs(det) < 1e-9) return null;

  const invDet = 1 / det;
  return [
    [
      (M[1][1] * M[2][2] - M[1][2] * M[2][1]) * invDet,
      (M[0][2] * M[2][1] - M[0][1] * M[2][2]) * invDet,
      (M[0][1] * M[1][2] - M[0][2] * M[1][1]) * invDet
    ],
    [
      (M[1][2] * M[2][0] - M[1][0] * M[2][2]) * invDet,
      (M[0][0] * M[2][2] - M[0][2] * M[2][0]) * invDet,
      (M[0][2] * M[1][0] - M[0][0] * M[1][2]) * invDet
    ],
    [
      (M[1][0] * M[2][1] - M[1][1] * M[2][0]) * invDet,
      (M[0][1] * M[2][0] - M[0][0] * M[2][1]) * invDet,
      (M[0][0] * M[1][1] - M[0][1] * M[1][0]) * invDet
    ]
  ];
}

export function warpAffineImage(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  M: number[][]
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(srcData.length);
  const invM = invert3x3(M);
  if (!invM) return out;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Map destination (x, y) back to source (srcX, srcY) using invM
      const srcX = invM[0][0] * x + invM[0][1] * y + invM[0][2];
      const srcY = invM[1][0] * x + invM[1][1] * y + invM[1][2];

      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);
      const x1 = x0 + 1;
      const y1 = y0 + 1;

      if (x0 >= 0 && x1 < width && y0 >= 0 && y1 < height) {
        const dx = srcX - x0;
        const dy = srcY - y0;

        const idx00 = (y0 * width + x0) * 4;
        const idx10 = (y0 * width + x1) * 4;
        const idx01 = (y1 * width + x0) * 4;
        const idx11 = (y1 * width + x1) * 4;

        const outIdx = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) {
          const val =
            (1 - dx) * (1 - dy) * srcData[idx00 + c] +
            dx * (1 - dy) * srcData[idx10 + c] +
            (1 - dx) * dy * srcData[idx01 + c] +
            dx * dy * srcData[idx11 + c];
          out[outIdx + c] = Math.round(val);
        }
        out[outIdx + 3] = 255;
      }
    }
  }

  return out;
}

// ============================================================================
// 2. FEATURE DETECTION, DESCRIPTION & MATCHING (Chapter 37)
// ============================================================================

export interface Keypoint {
  x: number;
  y: number;
  response: number;
  descriptor?: number[];
}

export interface MatchPair {
  queryIdx: number;
  trainIdx: number;
  distance: number;
}

export function detectHarrisCorners(
  gray: Uint8Array,
  width: number,
  height: number,
  threshold = 10000,
  k = 0.04
): Keypoint[] {
  const corners: Keypoint[] = [];
  const R = new Float32Array(width * height);

  // Compute spatial gradients Ix, Iy using central difference
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let Ixx = 0;
      let Iyy = 0;
      let Ixy = 0;

      // 3x3 local structure tensor window
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const px = x + dx;
          const py = y + dy;
          const gx = (gray[py * width + (px + 1)] - gray[py * width + (px - 1)]) / 2;
          const gy = (gray[(py + 1) * width + px] - gray[(py - 1) * width + px]) / 2;
          Ixx += gx * gx;
          Iyy += gy * gy;
          Ixy += gx * gy;
        }
      }

      const det = Ixx * Iyy - Ixy * Ixy;
      const trace = Ixx + Iyy;
      const response = det - k * trace * trace;
      if (response > threshold) {
        R[y * width + x] = response;
      }
    }
  }

  // Non-maximum suppression in 5x5 neighbourhood
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const val = R[y * width + x];
      if (val <= 0) continue;

      let isMax = true;
      for (let dy = -2; dy <= 2 && isMax; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (R[(y + dy) * width + (x + dx)] >= val) {
            isMax = false;
            break;
          }
        }
      }

      if (isMax) {
        // Extract 16-element intensity descriptor from 4x4 surrounding patches
        const desc: number[] = [];
        for (let py = -2; py <= 1; py++) {
          for (let px = -2; px <= 1; px++) {
            const ny = Math.max(0, Math.min(height - 1, y + py * 2));
            const nx = Math.max(0, Math.min(width - 1, x + px * 2));
            desc.push(gray[ny * width + nx]);
          }
        }
        corners.push({ x, y, response: val, descriptor: desc });
      }
    }
  }

  return corners;
}

export function matchDescriptors(
  kp1: Keypoint[],
  kp2: Keypoint[],
  ratioThreshold = 0.75
): MatchPair[] {
  const matches: MatchPair[] = [];

  for (let i = 0; i < kp1.length; i++) {
    const d1 = kp1[i].descriptor;
    if (!d1) continue;

    let bestDist = Infinity;
    let secondBestDist = Infinity;
    let bestIdx = -1;

    for (let j = 0; j < kp2.length; j++) {
      const d2 = kp2[j].descriptor;
      if (!d2) continue;

      let dist = 0;
      for (let k = 0; k < d1.length; k++) {
        const diff = d1[k] - d2[k];
        dist += diff * diff;
      }
      dist = Math.sqrt(dist);

      if (dist < bestDist) {
        secondBestDist = bestDist;
        bestDist = dist;
        bestIdx = j;
      } else if (dist < secondBestDist) {
        secondBestDist = dist;
      }
    }

    // Lowe's Ratio Test
    if (bestIdx >= 0 && bestDist < ratioThreshold * secondBestDist) {
      matches.push({ queryIdx: i, trainIdx: bestIdx, distance: bestDist });
    }
  }

  return matches;
}

// ============================================================================
// 3. CAMERA CALIBRATION & REPROJECTION ERROR (Chapter 38)
// ============================================================================

export interface CameraIntrinsics {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  k1: number;
  k2: number;
}

export function projectPoint3D(
  X: number,
  Y: number,
  Z: number,
  K: CameraIntrinsics
): { u: number; v: number; isVisible: boolean } {
  if (Z <= 0.001) return { u: 0, v: 0, isVisible: false };

  // Normalized camera coordinates
  const xn = X / Z;
  const yn = Y / Z;
  const r2 = xn * xn + yn * yn;
  const r4 = r2 * r2;

  // Radial distortion
  const radial = 1 + K.k1 * r2 + K.k2 * r4;
  const xd = xn * radial;
  const yd = yn * radial;

  // Pixel coordinates
  const u = K.fx * xd + K.cx;
  const v = K.fy * yd + K.cy;

  return { u, v, isVisible: true };
}

export function computeReprojectionError(
  measured: Array<{ u: number; v: number }>,
  projected: Array<{ u: number; v: number }>
): number {
  if (measured.length === 0 || measured.length !== projected.length) return 0;
  let sse = 0;
  for (let i = 0; i < measured.length; i++) {
    const du = measured[i].u - projected[i].u;
    const dv = measured[i].v - projected[i].v;
    sse += du * du + dv * dv;
  }
  return Math.sqrt(sse / measured.length);
}

// ============================================================================
// 4. STEREO VISION & DISPARITY DEPTH (Chapter 39)
// ============================================================================

export function computeStereoDisparity(
  leftGray: Uint8Array,
  rightGray: Uint8Array,
  width: number,
  height: number,
  maxDisparity = 32,
  windowSize = 5
): Float32Array {
  const disparityMap = new Float32Array(width * height);
  const halfWin = Math.floor(windowSize / 2);

  for (let y = halfWin; y < height - halfWin; y++) {
    for (let x = halfWin + maxDisparity; x < width - halfWin; x++) {
      let minSAD = Infinity;
      let bestDisp = 0;

      for (let d = 0; d < maxDisparity; d++) {
        let sad = 0;
        for (let wy = -halfWin; wy <= halfWin; wy++) {
          for (let wx = -halfWin; wx <= halfWin; wx++) {
            const leftVal = leftGray[(y + wy) * width + (x + wx)];
            const rightVal = rightGray[(y + wy) * width + (x + wx - d)];
            sad += Math.abs(leftVal - rightVal);
          }
        }
        if (sad < minSAD) {
          minSAD = sad;
          bestDisp = d;
        }
      }
      disparityMap[y * width + x] = bestDisp;
    }
  }

  return disparityMap;
}

export function disparityToDepth(
  disparity: number,
  focalPixels: number,
  baselineMeters: number
): number {
  if (disparity <= 0.05) return Infinity;
  return (focalPixels * baselineMeters) / disparity;
}

// ============================================================================
// 5. CLASSICAL OBJECT RECOGNITION & TEMPLATE MATCHING (Chapter 40)
// ============================================================================

export interface TemplateMatchResult {
  bestX: number;
  bestY: number;
  score: number;
}

export function matchTemplateNCC(
  image: Uint8Array,
  imgW: number,
  imgH: number,
  template: Uint8Array,
  tplW: number,
  tplH: number
): TemplateMatchResult {
  let bestScore = -1;
  let bestX = 0;
  let bestY = 0;

  // Compute template mean
  let tplSum = 0;
  const N = tplW * tplH;
  for (let i = 0; i < N; i++) tplSum += template[i];
  const tplMean = tplSum / N;

  let tplVar = 0;
  for (let i = 0; i < N; i++) {
    const diff = template[i] - tplMean;
    tplVar += diff * diff;
  }
  const tplStd = Math.sqrt(tplVar);

  for (let y = 0; y <= imgH - tplH; y += 2) {
    for (let x = 0; x <= imgW - tplW; x += 2) {
      let patchSum = 0;
      for (let ty = 0; ty < tplH; ty++) {
        for (let tx = 0; tx < tplW; tx++) {
          patchSum += image[(y + ty) * imgW + (x + tx)];
        }
      }
      const patchMean = patchSum / N;

      let cov = 0;
      let patchVar = 0;
      for (let ty = 0; ty < tplH; ty++) {
        for (let tx = 0; tx < tplW; tx++) {
          const pVal = image[(y + ty) * imgW + (x + tx)] - patchMean;
          const tVal = template[ty * tplW + tx] - tplMean;
          cov += pVal * tVal;
          patchVar += pVal * pVal;
        }
      }

      const denom = Math.sqrt(patchVar) * tplStd;
      const ncc = denom > 1e-6 ? cov / denom : 0;
      if (ncc > bestScore) {
        bestScore = ncc;
        bestX = x;
        bestY = y;
      }
    }
  }

  return { bestX, bestY, score: Math.max(0, bestScore) };
}

// ============================================================================
// 6. CNN FORWARD OPERATIONS & ACTIVATIONS (Chapters 41 & 42)
// ============================================================================

export function conv2D(
  input: Float32Array,
  inW: number,
  inH: number,
  kernel: number[][],
  bias = 0
): { output: Float32Array; outW: number; outH: number } {
  const kSize = kernel.length;
  const pad = Math.floor(kSize / 2);
  const outW = inW;
  const outH = inH;
  const output = new Float32Array(outW * outH);

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      let sum = bias;
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const ix = Math.min(Math.max(x + kx - pad, 0), inW - 1);
          const iy = Math.min(Math.max(y + ky - pad, 0), inH - 1);
          sum += input[iy * inW + ix] * kernel[ky][kx];
        }
      }
      output[y * outW + x] = sum;
    }
  }

  return { output, outW, outH };
}

export function relu(data: Float32Array): Float32Array {
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = Math.max(0, data[i]);
  }
  return out;
}

export function maxPool2D(
  input: Float32Array,
  inW: number,
  inH: number,
  poolSize = 2
): { output: Float32Array; outW: number; outH: number } {
  const outW = Math.floor(inW / poolSize);
  const outH = Math.floor(inH / poolSize);
  const output = new Float32Array(outW * outH);

  for (let py = 0; py < outH; py++) {
    for (let px = 0; px < outW; px++) {
      let maxVal = -Infinity;
      for (let dy = 0; dy < poolSize; dy++) {
        for (let dx = 0; dx < poolSize; dx++) {
          const val = input[(py * poolSize + dy) * inW + (px * poolSize + dx)];
          if (val > maxVal) maxVal = val;
        }
      }
      output[py * outW + px] = maxVal;
    }
  }

  return { output, outW, outH };
}

export function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((acc, v) => acc + v, 0);
  return exps.map((e) => e / (sum || 1e-9));
}

export function crossEntropyLoss(probs: number[], targetClass: number): number {
  const p = Math.max(probs[targetClass], 1e-12);
  return -Math.log(p);
}

// ============================================================================
// 7. OBJECT DETECTION, IOU & NMS (Chapter 44)
// ============================================================================

export interface BoundingBox2D {
  id?: number;
  label: string;
  x: number; // top-left
  y: number;
  w: number;
  h: number;
  confidence: number;
}

export function computeIoU(b1: BoundingBox2D, b2: BoundingBox2D): number {
  const x1 = Math.max(b1.x, b2.x);
  const y1 = Math.max(b1.y, b2.y);
  const x2 = Math.min(b1.x + b1.w, b2.x + b2.w);
  const y2 = Math.min(b1.y + b1.h, b2.y + b2.h);

  const interW = Math.max(0, x2 - x1);
  const interH = Math.max(0, y2 - y1);
  const interArea = interW * interH;

  const area1 = b1.w * b1.h;
  const area2 = b2.w * b2.h;
  const unionArea = area1 + area2 - interArea;

  return unionArea > 0 ? interArea / unionArea : 0;
}

export function nonMaxSuppression(
  boxes: BoundingBox2D[],
  iouThreshold = 0.45,
  confThreshold = 0.25
): BoundingBox2D[] {
  // Filter by confidence
  const filtered = boxes.filter((b) => b.confidence >= confThreshold);
  // Sort descending by confidence
  filtered.sort((a, b) => b.confidence - a.confidence);

  const selected: BoundingBox2D[] = [];
  const suppressed = new Uint8Array(filtered.length);

  for (let i = 0; i < filtered.length; i++) {
    if (suppressed[i]) continue;
    const current = filtered[i];
    selected.push(current);

    for (let j = i + 1; j < filtered.length; j++) {
      if (suppressed[j]) continue;
      // Only suppress overlapping boxes of the same class (or across all classes if unconstrained)
      if (current.label === filtered[j].label) {
        const iou = computeIoU(current, filtered[j]);
        if (iou >= iouThreshold) {
          suppressed[j] = 1;
        }
      }
    }
  }

  return selected;
}

// ============================================================================
// 8. SEGMENTATION METRICS: MIOU & DICE (Chapter 45)
// ============================================================================

export interface SegmentationMetrics {
  tp: number;
  fp: number;
  fn: number;
  iou: number;
  dice: number;
}

export function computeSegmentationMetrics(
  predMask: Uint8Array,
  gtMask: Uint8Array
): SegmentationMetrics {
  let tp = 0;
  let fp = 0;
  let fn = 0;

  const len = Math.min(predMask.length, gtMask.length);
  for (let i = 0; i < len; i++) {
    const p = predMask[i] > 0;
    const g = gtMask[i] > 0;
    if (p && g) tp++;
    else if (p && !g) fp++;
    else if (!p && g) fn++;
  }

  const iou = tp + fp + fn > 0 ? tp / (tp + fp + fn) : 1;
  const dice = 2 * tp + fp + fn > 0 ? (2 * tp) / (2 * tp + fp + fn) : 1;

  return { tp, fp, fn, iou, dice };
}

// ============================================================================
// 9. VISION TRANSFORMERS: ATTENTION MAP (Chapter 46)
// ============================================================================

export function computeScaledDotProductAttention(
  Q: number[][],
  K: number[][],
  V: number[][]
): { attentionWeights: number[][]; output: number[][] } {
  const numTokens = Q.length;
  const dK = Q[0].length;
  const scale = 1 / Math.sqrt(dK);

  // Compute Q * K^T * scale
  const scores: number[][] = [];
  for (let i = 0; i < numTokens; i++) {
    scores[i] = [];
    for (let j = 0; j < numTokens; j++) {
      let dot = 0;
      for (let k = 0; k < dK; k++) {
        dot += Q[i][k] * K[j][k];
      }
      scores[i][j] = dot * scale;
    }
  }

  // Softmax per row
  const attentionWeights: number[][] = [];
  for (let i = 0; i < numTokens; i++) {
    attentionWeights[i] = softmax(scores[i]);
  }

  // Multiply by V
  const dV = V[0].length;
  const output: number[][] = [];
  for (let i = 0; i < numTokens; i++) {
    output[i] = [];
    for (let j = 0; j < dV; j++) {
      let sum = 0;
      for (let t = 0; t < numTokens; t++) {
        sum += attentionWeights[i][t] * V[t][j];
      }
      output[i][j] = sum;
    }
  }

  return { attentionWeights, output };
}

// ============================================================================
// 10. HUMAN POSE SKELETON (Chapter 47)
// ============================================================================

export interface PoseKeypoint2D {
  name: string;
  x: number;
  y: number;
  score: number;
}

export const COCO_SKELETON_PAIRS: [number, number][] = [
  [0, 1], // nose - left_eye
  [0, 2], // nose - right_eye
  [1, 3], // left_eye - left_ear
  [2, 4], // right_eye - right_ear
  [5, 6], // left_shoulder - right_shoulder
  [5, 7], // left_shoulder - left_elbow
  [7, 9], // left_elbow - left_wrist
  [6, 8], // right_shoulder - right_elbow
  [8, 10], // right_elbow - right_wrist
  [5, 11], // left_shoulder - left_hip
  [6, 12], // right_shoulder - right_hip
  [11, 12], // left_hip - right_hip
  [11, 13], // left_hip - left_knee
  [13, 15], // left_knee - left_ankle
  [12, 14], // right_hip - right_knee
  [14, 16] // right_knee - right_ankle
];

export const COCO_KEYPOINT_NAMES = [
  'Nose',
  'Left Eye',
  'Right Eye',
  'Left Ear',
  'Right Ear',
  'Left Shoulder',
  'Right Shoulder',
  'Left Elbow',
  'Right Elbow',
  'Left Wrist',
  'Right Wrist',
  'Left Hip',
  'Right Hip',
  'Left Knee',
  'Right Knee',
  'Left Ankle',
  'Right Ankle'
];

export function smoothPoseKeypoints(
  current: PoseKeypoint2D[],
  previous: PoseKeypoint2D[] | null,
  alpha = 0.7
): PoseKeypoint2D[] {
  if (!previous || previous.length !== current.length) return current;

  return current.map((kp, idx) => {
    const prev = previous[idx];
    return {
      name: kp.name,
      x: alpha * kp.x + (1 - alpha) * prev.x,
      y: alpha * kp.y + (1 - alpha) * prev.y,
      score: kp.score
    };
  });
}

// ============================================================================
// 11. 3D POINT CLOUD PROJECTION & TRIANGULATION (Chapter 48)
// ============================================================================

export interface Point3D {
  x: number;
  y: number;
  z: number;
  color?: string;
}

export function rotateAndProject3D(
  points: Point3D[],
  rotXDeg: number,
  rotYDeg: number,
  focal = 300,
  cx = 240,
  cy = 135
): Array<{ u: number; v: number; z: number; color?: string }> {
  const rx = (rotXDeg * Math.PI) / 180;
  const ry = (rotYDeg * Math.PI) / 180;

  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);

  return points.map((p) => {
    // Rotate Y
    const x1 = p.x * cosY + p.z * sinY;
    const y1 = p.y;
    const z1 = -p.x * sinY + p.z * cosY;

    // Rotate X
    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX + 3.0; // Offset in front of camera

    const u = (x2 / z2) * focal + cx;
    const v = (y2 / z2) * focal + cy;

    return { u, v, z: z2, color: p.color };
  });
}

// ============================================================================
// 12. EMBEDDINGS & COSINE SIMILARITY (Chapter 49)
// ============================================================================

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
  return denom > 1e-9 ? dot / denom : 0;
}

// ============================================================================
// 13. VISION EVALUATION METRICS (Chapter 50)
// ============================================================================

export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
}

export function computeClassificationMetrics(
  confusionMatrix: number[][]
): ClassificationMetrics {
  const K = confusionMatrix.length;
  let totalCorrect = 0;
  let totalSamples = 0;

  let macroPrecision = 0;
  let macroRecall = 0;

  for (let c = 0; c < K; c++) {
    let tp = confusionMatrix[c][c];
    totalCorrect += tp;

    let colSum = 0; // predicted c (tp + fp)
    let rowSum = 0; // actual c (tp + fn)

    for (let r = 0; r < K; r++) {
      colSum += confusionMatrix[r][c];
      rowSum += confusionMatrix[c][r];
    }

    totalSamples += rowSum;

    const prec = colSum > 0 ? tp / colSum : 0;
    const rec = rowSum > 0 ? tp / rowSum : 0;
    macroPrecision += prec;
    macroRecall += rec;
  }

  macroPrecision /= K;
  macroRecall /= K;

  const accuracy = totalSamples > 0 ? totalCorrect / totalSamples : 0;
  const f1Score =
    macroPrecision + macroRecall > 0
      ? (2 * macroPrecision * macroRecall) / (macroPrecision + macroRecall)
      : 0;

  return {
    accuracy,
    precision: macroPrecision,
    recall: macroRecall,
    f1Score,
    confusionMatrix
  };
}


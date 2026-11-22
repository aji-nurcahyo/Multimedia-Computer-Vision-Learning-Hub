/**
 * Video Processing & Tracking DSP Engine
 * Multimedia & Computer Vision Learning Hub
 * Author: Aji Pamungkas Tri Nurcahyo
 * Institution: Institut Teknologi Sumatera (ITERA)
 *
 * Core pure functions for video frame manipulation, temporal filtering,
 * optical flow, background subtraction, Kalman filtering, object tracking (SORT/Hungarian),
 * line crossing analysis, and video metrics.
 */

// ==========================================
// 1. Data Structures & Types
// ==========================================

export interface VideoMetadata {
  width: number;
  height: number;
  duration: number; // in seconds
  estimatedFps: number;
  totalFrames: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TrackedObject {
  id: number;
  bbox: BoundingBox;
  centroid: [number, number];
  velocity: [number, number];
  age: number;
  totalVisibleCount: number;
  consecutiveInvisibleCount: number;
  trajectory: Array<[number, number]>;
}

export interface LineCrossingEvent {
  trackId: number;
  timestampSec: number;
  direction: 'in' | 'out';
  crossingPoint: [number, number];
}

export interface FlowVector {
  x: number;
  y: number;
  u: number; // horizontal displacement
  v: number; // vertical displacement
  magnitude: number;
}

// ==========================================
// 2. Frame Extraction & Color Transformations
// ==========================================

/**
 * Convert ImageData RGBA to Grayscale Float32Array [0, 255]
 */
export function rgbaToGrayscale(imgData: ImageData): Float32Array {
  const { data, width, height } = imgData;
  const numPixels = width * height;
  const gray = new Float32Array(numPixels);

  for (let i = 0; i < numPixels; i++) {
    const idx = i * 4;
    // ITU-R BT.601 standard: 0.299 R + 0.587 G + 0.114 B
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }
  return gray;
}

/**
 * Put Grayscale Float32Array back to ImageData RGBA
 */
export function grayscaleToImageData(
  gray: Float32Array,
  width: number,
  height: number,
  targetImgData?: ImageData
): ImageData {
  const imgData = targetImgData || new ImageData(width, height);
  const data = imgData.data;
  const numPixels = width * height;

  for (let i = 0; i < numPixels; i++) {
    const val = Math.max(0, Math.min(255, Math.round(gray[i])));
    const idx = i * 4;
    data[idx] = val;
    data[idx + 1] = val;
    data[idx + 2] = val;
    data[idx + 3] = 255;
  }
  return imgData;
}

/**
 * Absolute Frame Difference |Frame_t - Frame_{t-1}|
 */
export function computeFrameDifference(
  prevGray: Float32Array,
  currGray: Float32Array
): Float32Array {
  const n = prevGray.length;
  const diff = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    diff[i] = Math.abs(currGray[i] - prevGray[i]);
  }
  return diff;
}

// ==========================================
// 3. Temporal Filtering (Averaging & Median)
// ==========================================

/**
 * Running Temporal Average Filter
 * B_{t} = (1 - alpha) * B_{t-1} + alpha * I_t
 */
export function applyTemporalAveraging(
  backgroundModel: Float32Array,
  currentFrame: Float32Array,
  alpha: number = 0.05
): Float32Array {
  const n = backgroundModel.length;
  const updated = new Float32Array(n);
  const oneMinusAlpha = 1.0 - alpha;

  for (let i = 0; i < n; i++) {
    updated[i] = oneMinusAlpha * backgroundModel[i] + alpha * currentFrame[i];
  }
  return updated;
}

/**
 * Temporal Median Filter across N buffered frames
 */
export function computeTemporalMedian(
  frameBuffer: Float32Array[],
  width: number,
  height: number
): Float32Array {
  const numFrames = frameBuffer.length;
  if (numFrames === 0) return new Float32Array(width * height);
  if (numFrames === 1) return new Float32Array(frameBuffer[0]);

  const numPixels = width * height;
  const medianFrame = new Float32Array(numPixels);
  const pixelVals = new Float32Array(numFrames);

  for (let i = 0; i < numPixels; i++) {
    for (let f = 0; f < numFrames; f++) {
      pixelVals[f] = frameBuffer[f][i];
    }
    pixelVals.sort();
    const mid = Math.floor(numFrames / 2);
    medianFrame[i] =
      numFrames % 2 === 1 ? pixelVals[mid] : (pixelVals[mid - 1] + pixelVals[mid]) / 2;
  }
  return medianFrame;
}

// ==========================================
// 4. Optical Flow (Lucas-Kanade)
// ==========================================

/**
 * Computes Sparse / Grid-based Lucas-Kanade Optical Flow between two consecutive grayscale frames
 * Solves: [Ix^2, IxIy; IxIy, Iy^2] [u; v] = -[IxIt; IyIt]
 */
export function computeLucasKanadeOpticalFlow(
  prevGray: Float32Array,
  currGray: Float32Array,
  width: number,
  height: number,
  gridStep: number = 16,
  windowSize: number = 7
): FlowVector[] {
  const vectors: FlowVector[] = [];
  const halfWin = Math.floor(windowSize / 2);

  for (let y = halfWin + 1; y < height - halfWin - 1; y += gridStep) {
    for (let x = halfWin + 1; x < width - halfWin - 1; x += gridStep) {
      let sumIx2 = 0;
      let sumIy2 = 0;
      let sumIxIy = 0;
      let sumIxIt = 0;
      let sumIyIt = 0;

      for (let wy = -halfWin; wy <= halfWin; wy++) {
        for (let wx = -halfWin; wx <= halfWin; wx++) {
          const px = x + wx;
          const py = y + wy;
          const idx = py * width + px;

          // Spatial derivatives using central difference
          const ix = (prevGray[idx + 1] - prevGray[idx - 1]) * 0.5;
          const iy = (prevGray[idx + width] - prevGray[idx - width]) * 0.5;
          // Temporal derivative
          const it = currGray[idx] - prevGray[idx];

          sumIx2 += ix * ix;
          sumIy2 += iy * iy;
          sumIxIy += ix * iy;
          sumIxIt += ix * it;
          sumIyIt += iy * it;
        }
      }

      // Determinant of ATA matrix
      const det = sumIx2 * sumIy2 - sumIxIy * sumIxIy;
      if (det > 1e-4) {
        // [u, v] = - inv(ATA) * ATb
        const u = -(sumIy2 * sumIxIt - sumIxIy * sumIyIt) / det;
        const v = -(-sumIxIy * sumIxIt + sumIx2 * sumIyIt) / det;
        const magnitude = Math.sqrt(u * u + v * v);

        // Filter out tiny jitter or crazy values
        if (magnitude >= 0.2 && magnitude < 50) {
          vectors.push({ x, y, u, v, magnitude });
        }
      }
    }
  }

  return vectors;
}

// ==========================================
// 5. Background Subtraction & Connected Components
// ==========================================

/**
 * Thresholds difference image to create binary foreground mask
 */
export function createForegroundMask(
  diff: Float32Array,
  threshold: number = 25
): Uint8Array {
  const n = diff.length;
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    mask[i] = diff[i] >= threshold ? 255 : 0;
  }
  return mask;
}

/**
 * Simple 3x3 Morphological Open (Erode then Dilate) to remove camera sensor salt-and-pepper noise
 */
export function morphologicalCleanMask(
  mask: Uint8Array,
  width: number,
  height: number
): Uint8Array {
  const eroded = new Uint8Array(mask.length);
  const cleaned = new Uint8Array(mask.length);

  // 1. Erosion
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (
        mask[idx] &&
        mask[idx - 1] &&
        mask[idx + 1] &&
        mask[idx - width] &&
        mask[idx + width]
      ) {
        eroded[idx] = 255;
      }
    }
  }

  // 2. Dilation
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (
        eroded[idx] ||
        eroded[idx - 1] ||
        eroded[idx + 1] ||
        eroded[idx - width] ||
        eroded[idx + width]
      ) {
        cleaned[idx] = 255;
      }
    }
  }

  return cleaned;
}

/**
 * Extract connected component bounding boxes from foreground binary mask
 */
export function extractBoundingBoxes(
  mask: Uint8Array,
  width: number,
  height: number,
  minArea: number = 80
): BoundingBox[] {
  const visited = new Uint8Array(width * height);
  const boxes: BoundingBox[] = [];

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = y * width + x;
      if (mask[idx] === 255 && !visited[idx]) {
        // BFS flood fill
        let minX = x, maxX = x, minY = y, maxY = y;
        let count = 0;
        const queue: number[] = [idx];
        visited[idx] = 1;

        while (queue.length > 0) {
          const curr = queue.pop()!;
          count++;
          const cx = curr % width;
          const cy = Math.floor(curr / width);

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // 4-neighborhood
          const neighbors = [curr - 1, curr + 1, curr - width, curr + width];
          for (const nb of neighbors) {
            if (nb >= 0 && nb < mask.length && mask[nb] === 255 && !visited[nb]) {
              visited[nb] = 1;
              queue.push(nb);
            }
          }
        }

        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        if (count >= minArea && bw > 6 && bh > 6) {
          boxes.push({ x: minX, y: minY, width: bw, height: bh });
        }
      }
    }
  }

  return boxes;
}

// ==========================================
// 6. 1D/2D Kalman Filter for Position & Velocity
// ==========================================

export class KalmanFilter2D {
  // State: [x, y, vx, vy]
  private state: [number, number, number, number];
  // Covariance matrix P (4x4 diagonal simplification)
  private p: [number, number, number, number];
  private q: number; // process noise
  private r: number; // measurement noise

  constructor(
    initX: number,
    initY: number,
    processNoise: number = 1.0,
    measurementNoise: number = 5.0
  ) {
    this.state = [initX, initY, 0, 0];
    this.p = [10, 10, 10, 10];
    this.q = processNoise;
    this.r = measurementNoise;
  }

  /**
   * Predict step with time step dt
   */
  predict(dt: number = 1.0): [number, number] {
    // x = x + vx * dt
    this.state[0] += this.state[2] * dt;
    this.state[1] += this.state[3] * dt;

    // P = P + Q
    this.p[0] += this.q;
    this.p[1] += this.q;
    this.p[2] += this.q;
    this.p[3] += this.q;

    return [this.state[0], this.state[1]];
  }

  /**
   * Update step with measured position [measX, measY]
   */
  update(measX: number, measY: number): [number, number] {
    // Kalman gain K = P / (P + R)
    const kx = this.p[0] / (this.p[0] + this.r);
    const ky = this.p[1] / (this.p[1] + this.r);

    // Velocity update from measurement residual
    const resX = measX - this.state[0];
    const resY = measY - this.state[1];

    this.state[0] += kx * resX;
    this.state[1] += ky * resY;
    this.state[2] += kx * resX * 0.5;
    this.state[3] += ky * resY * 0.5;

    // P = (1 - K) * P
    this.p[0] *= 1 - kx;
    this.p[1] *= 1 - ky;

    return [this.state[0], this.state[1]];
  }

  getState(): [number, number, number, number] {
    return [...this.state];
  }
}

// ==========================================
// 7. Multi-Object Tracking (Centroid & Distance Association)
// ==========================================

export class SimpleMultiObjectTracker {
  private nextId: number = 1;
  private maxDistance: number;
  private maxInvisibleCount: number;
  public tracks: TrackedObject[] = [];

  constructor(maxDistance: number = 60, maxInvisibleCount: number = 10) {
    this.maxDistance = maxDistance;
    this.maxInvisibleCount = maxInvisibleCount;
  }

  update(detectedBoxes: BoundingBox[]): TrackedObject[] {
    const centroids: Array<[number, number]> = detectedBoxes.map((b) => [
      b.x + b.width / 2,
      b.y + b.height / 2,
    ]);

    const numTracks = this.tracks.length;
    const numDetections = centroids.length;

    const matchedTracks = new Set<number>();
    const matchedDetections = new Set<number>();

    // Distance matrix
    if (numTracks > 0 && numDetections > 0) {
      const dists: Array<{ tIdx: number; dIdx: number; dist: number }> = [];
      for (let t = 0; t < numTracks; t++) {
        for (let d = 0; d < numDetections; d++) {
          const dx = this.tracks[t].centroid[0] - centroids[d][0];
          const dy = this.tracks[t].centroid[1] - centroids[d][1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          dists.push({ tIdx: t, dIdx: d, dist });
        }
      }
      dists.sort((a, b) => a.dist - b.dist);

      for (const item of dists) {
        if (!matchedTracks.has(item.tIdx) && !matchedDetections.has(item.dIdx)) {
          if (item.dist <= this.maxDistance) {
            matchedTracks.add(item.tIdx);
            matchedDetections.add(item.dIdx);

            const tr = this.tracks[item.tIdx];
            const newCentroid = centroids[item.dIdx];
            tr.velocity = [
              newCentroid[0] - tr.centroid[0],
              newCentroid[1] - tr.centroid[1],
            ];
            tr.centroid = newCentroid;
            tr.bbox = detectedBoxes[item.dIdx];
            tr.trajectory.push(newCentroid);
            if (tr.trajectory.length > 30) tr.trajectory.shift();
            tr.age++;
            tr.totalVisibleCount++;
            tr.consecutiveInvisibleCount = 0;
          }
        }
      }
    }

    // Unmatched tracks
    for (let t = 0; t < numTracks; t++) {
      if (!matchedTracks.has(t)) {
        this.tracks[t].consecutiveInvisibleCount++;
        this.tracks[t].age++;
      }
    }

    // Unmatched detections -> create new tracks
    for (let d = 0; d < numDetections; d++) {
      if (!matchedDetections.has(d)) {
        this.tracks.push({
          id: this.nextId++,
          bbox: detectedBoxes[d],
          centroid: centroids[d],
          velocity: [0, 0],
          age: 1,
          totalVisibleCount: 1,
          consecutiveInvisibleCount: 0,
          trajectory: [centroids[d]],
        });
      }
    }

    // Filter dead tracks
    this.tracks = this.tracks.filter(
      (t) => t.consecutiveInvisibleCount <= this.maxInvisibleCount
    );

    return this.tracks;
  }
}

// ==========================================
// 8. Virtual Line Crossing & Event Counting
// ==========================================

export function detectLineCrossing(
  track: TrackedObject,
  lineY: number,
  timestampSec: number
): LineCrossingEvent | null {
  const traj = track.trajectory;
  if (traj.length < 2) return null;

  const prev = traj[traj.length - 2];
  const curr = traj[traj.length - 1];

  // Moving downwards across line
  if (prev[1] < lineY && curr[1] >= lineY) {
    return {
      trackId: track.id,
      timestampSec,
      direction: 'in',
      crossingPoint: [curr[0], lineY],
    };
  }

  // Moving upwards across line
  if (prev[1] > lineY && curr[1] <= lineY) {
    return {
      trackId: track.id,
      timestampSec,
      direction: 'out',
      crossingPoint: [curr[0], lineY],
    };
  }

  return null;
}

// ==========================================
// 9. Video Quality & Evaluation Metrics
// ==========================================

/**
 * Peak Signal-to-Noise Ratio (PSNR) between two frames
 */
export function calculateFramePsnr(
  frameA: Float32Array,
  frameB: Float32Array
): number {
  let mse = 0;
  const n = frameA.length;
  for (let i = 0; i < n; i++) {
    const diff = frameA[i] - frameB[i];
    mse += diff * diff;
  }
  mse /= n;
  if (mse < 1e-6) return 100.0;
  return 10 * Math.log10((255 * 255) / mse);
}


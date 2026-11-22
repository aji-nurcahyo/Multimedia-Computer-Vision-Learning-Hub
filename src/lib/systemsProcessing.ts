/**
 * Multimedia & Computer Vision Learning Hub - Systems & Deployment Engine
 * Academic Reference Implementation for Chapters 56-60
 * Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
 */

// ============================================================================
// 1. REAL-TIME MULTIMEDIA PROCESSING (Chapter 56)
// ============================================================================

export interface PipelineStageDelays {
  capture: number;
  processing: number;
  queue: number;
  render: number;
}

/**
 * Computes end-to-end processing pipeline latency:
 * T_total = T_capture + T_processing + T_queue + T_render
 */
export function calculatePipelineLatency(delays: PipelineStageDelays): number {
  return delays.capture + delays.processing + delays.queue + delays.render;
}

/**
 * Computes buffer queue delay given current queue size and processing throughput:
 * T_queue = Q / mu (converted to milliseconds)
 */
export function calculateQueueDelay(queueOccupancyFrames: number, processingRateFps: number): number {
  if (processingRateFps <= 0) return Infinity;
  return (queueOccupancyFrames / processingRateFps) * 1000.0;
}

/**
 * Calculates theoretical frame drop rate when arrival rate exceeds service rate:
 * Drop Rate = max(0, (lambda - mu) / lambda)
 */
export function calculateDropRate(arrivalRateFps: number, serviceRateFps: number): number {
  if (arrivalRateFps <= 0) return 0;
  if (arrivalRateFps <= serviceRateFps) return 0;
  return Math.min(1.0, (arrivalRateFps - serviceRateFps) / arrivalRateFps);
}

/**
 * Computes frame interval statistics and timing jitter (standard deviation of inter-frame arrival):
 * Jitter = sqrt( (1 / (N - 1)) * sum( (delta_t_i - delta_t_mean)^2 ) )
 */
export function simulateJitter(frameIntervalsMs: number[]): {
  meanIntervalMs: number;
  jitterStdMs: number;
  maxJitterMs: number;
} {
  const n = frameIntervalsMs.length;
  if (n === 0) return { meanIntervalMs: 0, jitterStdMs: 0, maxJitterMs: 0 };
  if (n === 1) return { meanIntervalMs: frameIntervalsMs[0], jitterStdMs: 0, maxJitterMs: 0 };

  const mean = frameIntervalsMs.reduce((a, b) => a + b, 0) / n;
  let varSum = 0;
  let maxDev = 0;
  for (const interval of frameIntervalsMs) {
    const dev = Math.abs(interval - mean);
    if (dev > maxDev) maxDev = dev;
    varSum += dev * dev;
  }
  const std = Math.sqrt(varSum / (n - 1));
  return {
    meanIntervalMs: Number(mean.toFixed(2)),
    jitterStdMs: Number(std.toFixed(2)),
    maxJitterMs: Number(maxDev.toFixed(2)),
  };
}

// ============================================================================
// 2. EDGE AI & EMBEDDED COMPUTER VISION (Chapter 57)
// ============================================================================

export interface QuantizationParams {
  scale: number;
  zeroPoint: number;
  qMin: number;
  qMax: number;
}

/**
 * Computes uniform affine (asymmetric) quantization parameters for real-valued float to unsigned integer:
 * S = (r_max - r_min) / (q_max - q_min)
 * Z = round(-r_min / S) + q_min, clamped to [q_min, q_max]
 */
export function calculateAffineQuantizationParams(
  rMin: number,
  rMax: number,
  numBits = 8
): QuantizationParams {
  const qMin = 0;
  const qMax = Math.pow(2, numBits) - 1;

  if (rMin === rMax) {
    return { scale: 1.0, zeroPoint: 0, qMin, qMax };
  }

  // Ensure range covers zero for activation tensors
  const safeMin = Math.min(rMin, 0.0);
  const safeMax = Math.max(rMax, 0.0);

  const scale = (safeMax - safeMin) / (qMax - qMin);
  const rawZ = Math.round(-safeMin / scale) + qMin;
  const zeroPoint = Math.max(qMin, Math.min(qMax, rawZ));

  return { scale, zeroPoint, qMin, qMax };
}

/**
 * Quantizes floating-point values into 8-bit integers:
 * q = clamp(round(r / S + Z), q_min, q_max)
 */
export function quantizeFloatToUint8(
  values: number[],
  scale: number,
  zeroPoint: number,
  qMin = 0,
  qMax = 255
): number[] {
  if (scale <= 0) return values.map(() => zeroPoint);
  return values.map((r) => {
    const q = Math.round(r / scale) + zeroPoint;
    return Math.max(qMin, Math.min(qMax, q));
  });
}

/**
 * Dequantizes 8-bit integers back into reconstructed floating point:
 * r_approx = S * (q - Z)
 */
export function dequantizeUint8ToFloat(
  quantized: number[],
  scale: number,
  zeroPoint: number
): number[] {
  return quantized.map((q) => scale * (q - zeroPoint));
}

/**
 * Evaluates reconstruction fidelity and Signal-to-Quantization-Noise Ratio (SQNR):
 * MSE = (1 / N) * sum((r_i - r_approx_i)^2)
 * SQNR_dB = 10 * log10( P_signal / P_noise )
 */
export function calculateQuantizationError(
  original: number[],
  dequantized: number[]
): { mse: number; maxAbsError: number; snrDb: number } {
  const n = original.length;
  if (n === 0) return { mse: 0, maxAbsError: 0, snrDb: 0 };

  let mseSum = 0;
  let maxAbs = 0;
  let sigPower = 0;

  for (let i = 0; i < n; i++) {
    const diff = original[i] - dequantized[i];
    const absDiff = Math.abs(diff);
    if (absDiff > maxAbs) maxAbs = absDiff;
    mseSum += diff * diff;
    sigPower += original[i] * original[i];
  }

  const mse = mseSum / n;
  const noisePower = mse;
  const snrDb =
    noisePower > 1e-12 && sigPower > 1e-12
      ? 10.0 * Math.log10(sigPower / (n * noisePower))
      : 100.0;

  return {
    mse: Number(mse.toFixed(6)),
    maxAbsError: Number(maxAbs.toFixed(6)),
    snrDb: Number(snrDb.toFixed(2)),
  };
}

/**
 * Computes memory footprint reduction and compression ratio:
 * Ratio = Original Size / Compressed Size
 */
export function estimateModelCompression(
  paramCount: number,
  originalBits = 32,
  quantizedBits = 8
): {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
  memorySavingsPercent: number;
} {
  const originalBytes = (paramCount * originalBits) / 8;
  const compressedBytes = (paramCount * quantizedBits) / 8;
  const ratio = originalBytes / (compressedBytes || 1);
  const savings = ((originalBytes - compressedBytes) / (originalBytes || 1)) * 100;

  return {
    originalSizeBytes: originalBytes,
    compressedSizeBytes: compressedBytes,
    compressionRatio: Number(ratio.toFixed(2)),
    memorySavingsPercent: Number(savings.toFixed(2)),
  };
}

// ============================================================================
// 3. MULTIMEDIA WEB APPLICATIONS & APIS (Chapter 58)
// ============================================================================

export interface BufferThroughputMetrics {
  bytesPerFrame: number;
  mbPerFrame: number;
  megapixelsPerSecond: number;
  megabytesPerSecond: number;
}

/**
 * Calculates memory footprint and bandwidth requirement for raw image/video frame buffers:
 * Bytes = Width * Height * Channels
 */
export function calculateFrameBufferFootprint(
  width: number,
  height: number,
  channels = 4,
  fps = 30
): BufferThroughputMetrics {
  const bytesPerFrame = width * height * channels;
  const mbPerFrame = bytesPerFrame / (1024 * 1024);
  const megapixelsPerSecond = (width * height * fps) / 1e6;
  const megabytesPerSecond = (bytesPerFrame * fps) / (1024 * 1024);

  return {
    bytesPerFrame,
    mbPerFrame: Number(mbPerFrame.toFixed(3)),
    megapixelsPerSecond: Number(megapixelsPerSecond.toFixed(2)),
    megabytesPerSecond: Number(megabytesPerSecond.toFixed(2)),
  };
}

/**
 * Simulates offloading image processing from Main UI Thread to Web Worker:
 * Returns UI thread blocking time and user experience impact.
 */
export function simulateWorkerOffloading(
  _mainThreadProcessingMs: number,
  workerProcessingMs: number,
  workerSerializationMs: number
): {
  mainThreadBlockingMs: number;
  totalLatencyMs: number;
  uiResponsive: boolean;
  droppedFramesUnder60Fps: boolean;
} {
  // When running on Main Thread: UI blocks for entire computation
  // When running in Worker: UI thread only blocks for serialization/transfer (< 5ms with ArrayBuffer transfer)
  const mainThreadBlocking = workerSerializationMs;
  const totalLatency = workerProcessingMs + workerSerializationMs;
  const uiResponsive = mainThreadBlocking < 16.67;
  const droppedFrames = mainThreadBlocking > 16.67;

  return {
    mainThreadBlockingMs: Number(mainThreadBlocking.toFixed(2)),
    totalLatencyMs: Number(totalLatency.toFixed(2)),
    uiResponsive,
    droppedFramesUnder60Fps: droppedFrames,
  };
}

// ============================================================================
// 4. PERFORMANCE OPTIMIZATION & DEPLOYMENT (Chapter 59)
// ============================================================================

/**
 * Computes theoretical maximum speedup according to Amdahl's Law:
 * S_overall = 1 / ((1 - p) + p / s)
 * where p is parallelizable/optimizable fraction, s is stage speedup
 */
export function calculateAmdahlSpeedup(parallelFraction: number, stageSpeedup: number): number {
  const p = Math.max(0, Math.min(1.0, parallelFraction));
  const s = Math.max(1e-4, stageSpeedup);
  const overall = 1.0 / (1.0 - p + p / s);
  return Number(overall.toFixed(2));
}

export interface LatencyBudgetAnalysis {
  totalLatencyMs: number;
  targetBudgetMs: number;
  meetsBudget: boolean;
  headroomMs: number;
  achievableFps: number;
  bottleneckStage: string;
}

/**
 * Decomposes latency across capture, preprocessing, inference, and rendering stages:
 * Compares total against target frame interval (e.g. 16.67ms for 60 FPS, 33.33ms for 30 FPS).
 */
export function analyzeLatencyBudget(
  stageDelaysMs: Record<string, number>,
  targetFps = 60
): LatencyBudgetAnalysis {
  const targetBudgetMs = 1000.0 / targetFps;
  let totalLatency = 0;
  let maxStageName = '';
  let maxStageTime = -1;

  for (const [stage, time] of Object.entries(stageDelaysMs)) {
    totalLatency += time;
    if (time > maxStageTime) {
      maxStageTime = time;
      maxStageName = stage;
    }
  }

  const meetsBudget = totalLatency <= targetBudgetMs;
  const headroomMs = targetBudgetMs - totalLatency;
  const achievableFps = totalLatency > 0 ? 1000.0 / totalLatency : targetFps;

  return {
    totalLatencyMs: Number(totalLatency.toFixed(2)),
    targetBudgetMs: Number(targetBudgetMs.toFixed(2)),
    meetsBudget,
    headroomMs: Number(headroomMs.toFixed(2)),
    achievableFps: Number(achievableFps.toFixed(1)),
    bottleneckStage: maxStageName,
  };
}

/**
 * Estimates static web application asset footprint and load time over constrained networks.
 */
export function estimateStaticBundleImpact(
  moduleSizesKb: Record<string, number>,
  gzipRatio = 0.35
): {
  rawTotalKb: number;
  gzippedTotalKb: number;
  estimatedLoadTime3GMs: number; // Regular 3G ~ 750 kbps (93.75 KB/s)
  estimatedLoadTime4GMs: number; // 4G ~ 25 Mbps (3125 KB/s)
} {
  let rawTotal = 0;
  for (const size of Object.values(moduleSizesKb)) {
    rawTotal += size;
  }
  const gzipped = rawTotal * gzipRatio;
  const load3G = (gzipped / 93.75) * 1000;
  const load4G = (gzipped / 3125.0) * 1000;

  return {
    rawTotalKb: Number(rawTotal.toFixed(1)),
    gzippedTotalKb: Number(gzipped.toFixed(1)),
    estimatedLoadTime3GMs: Math.round(load3G),
    estimatedLoadTime4GMs: Math.round(load4G),
  };
}

// ============================================================================
// 5. INTEGRATED CAPSTONE SYSTEM & MULTIMODAL SENSING (Chapter 60)
// ============================================================================

export interface CapstoneSensorFusionResult {
  fusedConfidence: number;
  isTriggered: boolean;
  dominantModality: 'visual' | 'audio' | 'context';
}

/**
 * Fuses multimodal sensor probabilities (Visual Object/Anomaly Detection, Audio Event, Context)
 * using a Bayesian weighted consensus operator:
 */
export function fuseMultimodalEventScores(
  visualScore: number,
  audioScore: number,
  contextScore: number,
  weights = { visual: 0.6, audio: 0.25, context: 0.15 },
  threshold = 0.5
): CapstoneSensorFusionResult {
  const totalW = weights.visual + weights.audio + weights.context || 1.0;
  const wv = weights.visual / totalW;
  const wa = weights.audio / totalW;
  const wc = weights.context / totalW;

  const fused = visualScore * wv + audioScore * wa + contextScore * wc;
  const isTriggered = fused >= threshold;

  const contribs = [
    { mod: 'visual' as const, val: visualScore * wv },
    { mod: 'audio' as const, val: audioScore * wa },
    { mod: 'context' as const, val: contextScore * wc },
  ];
  contribs.sort((a, b) => b.val - a.val);

  return {
    fusedConfidence: Number(fused.toFixed(4)),
    isTriggered,
    dominantModality: contribs[0].mod,
  };
}

export interface CapstoneRubricScores {
  architecture: number; // 0-25
  implementation: number; // 0-35
  evaluation: number; // 0-25
  documentation: number; // 0-15
}

/**
 * Evaluates the Capstone Project Academic Grading Rubric:
 * Total Score out of 100 with letter grade classification.
 */
export function evaluateCapstoneRubric(scores: CapstoneRubricScores): {
  totalScore: number;
  grade: 'A' | 'AB' | 'B' | 'BC' | 'C' | 'D' | 'E';
  isPassing: boolean;
  recommendations: string[];
} {
  const total = Math.min(
    100,
    Math.max(
      0,
      scores.architecture + scores.implementation + scores.evaluation + scores.documentation
    )
  );

  let grade: 'A' | 'AB' | 'B' | 'BC' | 'C' | 'D' | 'E' = 'E';
  if (total >= 80) grade = 'A';
  else if (total >= 75) grade = 'AB';
  else if (total >= 65) grade = 'B';
  else if (total >= 60) grade = 'BC';
  else if (total >= 50) grade = 'C';
  else if (total >= 40) grade = 'D';
  else grade = 'E';

  const recommendations: string[] = [];
  if (scores.architecture < 20) recommendations.push('Deepen modular pipeline diagram and dataflow specifications.');
  if (scores.implementation < 28) recommendations.push('Verify real-time frame budget and add fallback execution paths.');
  if (scores.evaluation < 20) recommendations.push('Include quantitative precision-recall curves and latency breakdown.');
  if (scores.documentation < 12) recommendations.push('Ensure comprehensive README and reproducible environment specifications.');

  return {
    totalScore: Number(total.toFixed(1)),
    grade,
    isPassing: total >= 55,
    recommendations,
  };
}

/**
 * Research Metrics & Statistical Validation Engine (L4 Research-Ready)
 * Part of the Multimedia & Computer Vision Learning Hub - ITERA
 * 
 * Enforces CVPR/ICCV reproducibility guidelines:
 * - Multi-seed statistical dispersion (mean ± std, bootstrap 95% CI)
 * - Hypothesis testing (paired t-test approximation)
 * - Benchmark metrics: HOTA (Luiten et al.), COCO-style AP, ECE, Latency percentiles
 * - Error categorization taxonomy (TIDE / COCO diagnostic breakdown)
 */

export interface StatisticalSummary {
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
  ci95: [number, number]; // 95% Bootstrap Confidence Interval
}

export interface HotaMetrics {
  deta: number; // Detection Accuracy: TP / (TP + FP + FN)
  assa: number; // Association Accuracy
  hota: number; // Higher Order Tracking Accuracy: sqrt(DetA * AssA)
}

export interface DetectionErrorTaxonomy {
  truePositives: number;
  localizationErrors: number;    // Correct class, but 0.1 <= IoU < threshold
  classificationErrors: number;  // IoU >= threshold, but wrong class
  backgroundHallucinations: number; // FP with IoU < 0.1 against any GT
  missedObjects: number;         // FN ground-truth not detected
  totalPredictions: number;
  totalGroundTruths: number;
}

/**
 * Calculates empirical mean and sample standard deviation (Bessel's correction n-1)
 */
export function computeMeanAndStd(values: number[]): { mean: number; std: number } {
  if (values.length === 0) return { mean: 0, std: 0 };
  if (values.length === 1) return { mean: values[0], std: 0 };

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return { mean, std: Math.sqrt(variance) };
}

/**
 * Calculates 95% Bootstrap Confidence Interval with deterministic pseudo-random sampling
 */
export function computeBootstrapConfidenceInterval(
  values: number[],
  confidence: number = 0.95,
  nBootstraps: number = 1000,
  randomSeed: number = 42
): { lower: number; upper: number; mean: number } {
  if (values.length === 0) return { lower: 0, upper: 0, mean: 0 };
  if (values.length === 1) return { lower: values[0], upper: values[0], mean: values[0] };

  // Simple deterministic linear congruential generator (LCG)
  let seed = randomSeed;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const n = values.length;
  const bootstrapMeans: number[] = [];

  for (let b = 0; b < nBootstraps; b++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(lcg() * n);
      sum += values[idx];
    }
    bootstrapMeans.push(sum / n);
  }

  bootstrapMeans.sort((a, b) => a - b);
  const alpha = (1 - confidence) / 2;
  const lowerIdx = Math.floor(alpha * nBootstraps);
  const upperIdx = Math.min(nBootstraps - 1, Math.floor((1 - alpha) * nBootstraps));

  const { mean } = computeMeanAndStd(values);
  return {
    lower: bootstrapMeans[lowerIdx],
    upper: bootstrapMeans[upperIdx],
    mean,
  };
}

/**
 * Two-sided Paired Student's t-test approximation for comparing baseline vs proposed method
 */
export function computePairedTTest(
  sampleA: number[],
  sampleB: number[]
): { tStatistic: number; degreesOfFreedom: number; pValueApprox: number; isSignificant: boolean } {
  if (sampleA.length !== sampleB.length || sampleA.length < 2) {
    throw new Error('Paired t-test requires identical non-empty sample lengths (N >= 2).');
  }

  const n = sampleA.length;
  const diffs = sampleA.map((val, i) => val - sampleB[i]);
  const { mean: meanDiff, std: stdDiff } = computeMeanAndStd(diffs);

  if (stdDiff === 0) {
    return {
      tStatistic: 0,
      degreesOfFreedom: n - 1,
      pValueApprox: meanDiff === 0 ? 1.0 : 0.0,
      isSignificant: meanDiff !== 0,
    };
  }

  const standardError = stdDiff / Math.sqrt(n);
  const tStat = meanDiff / standardError;
  const df = n - 1;

  // Approximate two-tailed p-value using standard normal / t-distribution tail bound
  // (Accurate for testing significance alpha = 0.05 threshold)
  const x = Math.abs(tStat);
  const zApprox = x / (1 + 0.25 / df);
  const pOneTailed = 0.5 * Math.exp(-0.717 * zApprox - 0.416 * zApprox * zApprox);
  const pValueApprox = Math.min(1.0, Math.max(0.0, pOneTailed * 2));

  return {
    tStatistic: tStat,
    degreesOfFreedom: df,
    pValueApprox,
    isSignificant: pValueApprox < 0.05,
  };
}

/**
 * Computes Higher Order Tracking Accuracy (HOTA) metric components (Luiten et al., IJCV 2021)
 * HOTA = sqrt( DetA * AssA )
 */
export function computeHotaMetrics(
  truePositives: number,
  falsePositives: number,
  falseNegatives: number,
  associationScore: number
): HotaMetrics {
  const detDenominator = truePositives + falsePositives + falseNegatives;
  const deta = detDenominator > 0 ? truePositives / detDenominator : 0;
  const assa = Math.min(1.0, Math.max(0.0, associationScore));
  const hota = Math.sqrt(deta * assa);

  return { deta, assa, hota };
}

/**
 * Computes 101-point COCO-style Average Precision (AP) from precision-recall curve
 */
export function computeCOCOAveragePrecision(precisions: number[], recalls: number[]): number {
  if (precisions.length === 0 || recalls.length === 0) return 0;

  // 101 recall thresholds from 0.0 to 1.0 with step 0.01
  const recallThresholds = Array.from({ length: 101 }, (_, i) => i / 100);
  let totalPrecision = 0;

  for (const rThresh of recallThresholds) {
    let maxPrec = 0;
    for (let i = 0; i < recalls.length; i++) {
      if (recalls[i] >= rThresh) {
        if (precisions[i] > maxPrec) {
          maxPrec = precisions[i];
        }
      }
    }
    totalPrecision += maxPrec;
  }

  return totalPrecision / 101;
}

/**
 * Computes Expected Calibration Error (ECE) for assessing neural model confidence reliability
 */
export function computeExpectedCalibrationError(
  confidences: number[],
  accuracies: number[],
  numBins: number = 10
): number {
  if (confidences.length !== accuracies.length || confidences.length === 0) return 0;

  const n = confidences.length;
  const binTotals = new Array(numBins).fill(0);
  const binAccuracies = new Array(numBins).fill(0);
  const binConfidences = new Array(numBins).fill(0);

  for (let i = 0; i < n; i++) {
    const conf = Math.max(0, Math.min(0.9999, confidences[i]));
    const binIdx = Math.floor(conf * numBins);
    binTotals[binIdx]++;
    binAccuracies[binIdx] += accuracies[i];
    binConfidences[binIdx] += conf;
  }

  let ece = 0;
  for (let b = 0; b < numBins; b++) {
    if (binTotals[b] > 0) {
      const avgAcc = binAccuracies[b] / binTotals[b];
      const avgConf = binConfidences[b] / binTotals[b];
      ece += (binTotals[b] / n) * Math.abs(avgAcc - avgConf);
    }
  }

  return ece;
}

/**
 * Computes box IoU for 2D bounding boxes [x1, y1, x2, y2]
 */
function boxIoU2D(boxA: number[], boxB: number[]): number {
  const xA = Math.max(boxA[0], boxB[0]);
  const yA = Math.max(boxA[1], boxB[1]);
  const xB = Math.min(boxA[2], boxB[2]);
  const yB = Math.min(boxA[3], boxB[3]);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const areaA = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1]);
  const areaB = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1]);
  const unionArea = areaA + areaB - interArea;

  return unionArea > 0 ? interArea / unionArea : 0;
}

/**
 * Categorizes object detection errors following the standardized error taxonomy (TIDE framework)
 */
export function categorizeDetectionErrors(
  groundTruths: Array<{ bbox: number[]; classId: number }>,
  predictions: Array<{ bbox: number[]; classId: number; score: number }>,
  iouThreshold: number = 0.5
): DetectionErrorTaxonomy {
  let truePositives = 0;
  let localizationErrors = 0;
  let classificationErrors = 0;
  let backgroundHallucinations = 0;

  const matchedGt = new Set<number>();
  const sortedPreds = [...predictions].sort((a, b) => b.score - a.score);

  for (const pred of sortedPreds) {
    let bestIoU = 0;
    let bestGtIdx = -1;

    for (let g = 0; g < groundTruths.length; g++) {
      const iou = boxIoU2D(pred.bbox, groundTruths[g].bbox);
      if (iou > bestIoU) {
        bestIoU = iou;
        bestGtIdx = g;
      }
    }

    if (bestGtIdx >= 0) {
      const gt = groundTruths[bestGtIdx];
      if (bestIoU >= iouThreshold) {
        if (pred.classId === gt.classId) {
          if (!matchedGt.has(bestGtIdx)) {
            truePositives++;
            matchedGt.add(bestGtIdx);
          } else {
            // Duplicate high-confidence detection (double detection / duplicate FP)
            localizationErrors++;
          }
        } else {
          classificationErrors++;
        }
      } else if (bestIoU >= 0.1) {
        // Correct or incorrect class with poor localization (0.1 <= IoU < threshold)
        localizationErrors++;
      } else {
        // Negligible overlap with any ground-truth (pure background false alarm)
        backgroundHallucinations++;
      }
    } else {
      backgroundHallucinations++;
    }
  }

  const missedObjects = groundTruths.length - matchedGt.size;

  return {
    truePositives,
    localizationErrors,
    classificationErrors,
    backgroundHallucinations,
    missedObjects,
    totalPredictions: predictions.length,
    totalGroundTruths: groundTruths.length,
  };
}


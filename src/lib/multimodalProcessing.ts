/**
 * Multimedia & Computer Vision Learning Hub - Core Multimodal AI Engine
 * Academic Reference Implementation for Chapters 51-55
 * Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
 */

// ============================================================================
// 1. MODALITY REPRESENTATION & FUSION STRATEGIES (Chapter 51)
// ============================================================================

export function l2Normalize(v: number[]): number[] {
  let normSq = 0;
  for (let i = 0; i < v.length; i++) {
    normSq += v[i] * v[i];
  }
  const norm = Math.sqrt(normSq);
  if (norm < 1e-12) return v.slice();
  return v.map((x) => x / norm);
}

export function softmaxWithTemperature(logits: number[], temperature = 0.2): number[] {
  const safeTemp = Math.max(1e-4, temperature);
  const scaled = logits.map((l) => l / safeTemp);
  const maxL = Math.max(...scaled);
  const exps = scaled.map((l) => Math.exp(l - maxL));
  const sumExp = exps.reduce((a, b) => a + b, 0) || 1e-9;
  return exps.map((e) => e / sumExp);
}

export function earlyFusionConcat(features: number[][]): number[] {
  // Concatenate multiple modality feature vectors and L2 normalize
  const raw: number[] = [];
  for (const feat of features) {
    for (const val of feat) {
      raw.push(val);
    }
  }
  return l2Normalize(raw);
}

export function lateFusionWeighted(
  predictions: number[][],
  weights: number[]
): number[] {
  if (predictions.length === 0) return [];
  const numClasses = predictions[0].length;
  const fused = new Array<number>(numClasses).fill(0);

  let totalWeight = 0;
  for (const w of weights) totalWeight += w;
  const safeTotal = totalWeight > 0 ? totalWeight : 1;

  for (let m = 0; m < predictions.length; m++) {
    const w = weights[m] / safeTotal;
    const pred = predictions[m];
    for (let c = 0; c < numClasses; c++) {
      fused[c] += w * pred[c];
    }
  }

  return fused;
}

export function intermediateCrossModalAttention(
  queryVec: number[],
  keyVecs: number[][],
  valVecs: number[][]
): { attentionWeights: number[]; fusedOutput: number[] } {
  const dK = queryVec.length;
  const scale = 1 / Math.sqrt(dK || 1);

  // Compute dot product with each key
  const logits = keyVecs.map((k) => {
    let dot = 0;
    for (let i = 0; i < dK; i++) {
      dot += queryVec[i] * k[i];
    }
    return dot * scale;
  });

  // Softmax
  const maxL = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxL));
  const sumExp = exps.reduce((a, b) => a + b, 0) || 1e-9;
  const attentionWeights = exps.map((e) => e / sumExp);

  // Weighted sum of values
  const dV = valVecs[0].length;
  const fusedOutput = new Array<number>(dV).fill(0);
  for (let k = 0; k < keyVecs.length; k++) {
    const w = attentionWeights[k];
    for (let j = 0; j < dV; j++) {
      fusedOutput[j] += w * valVecs[k][j];
    }
  }

  return { attentionWeights, fusedOutput };
}

// ============================================================================
// 2. VISION-LANGUAGE & ZERO-SHOT CLASSIFICATION (Chapter 52)
// ============================================================================

export interface ZeroShotResult {
  className: string;
  score: number; // probability
  similarity: number; // raw cosine sim
}

export function computeCrossModalSimilarity(
  imageEmbed: number[],
  textEmbed: number[]
): number {
  if (imageEmbed.length !== textEmbed.length || imageEmbed.length === 0) return 0;
  let dot = 0;
  let normI = 0;
  let normT = 0;
  for (let i = 0; i < imageEmbed.length; i++) {
    dot += imageEmbed[i] * textEmbed[i];
    normI += imageEmbed[i] * imageEmbed[i];
    normT += textEmbed[i] * textEmbed[i];
  }
  const denom = Math.sqrt(normI) * Math.sqrt(normT);
  return denom > 1e-9 ? dot / denom : 0;
}

export function zeroShotClassify(
  imageEmbed: number[],
  classTextEmbeddings: Array<{ className: string; embedding: number[] }>,
  temperature = 0.07
): ZeroShotResult[] {
  const similarities = classTextEmbeddings.map((c) =>
    computeCrossModalSimilarity(imageEmbed, c.embedding)
  );

  // Temperature scaled softmax
  const logits = similarities.map((s) => s / Math.max(1e-4, temperature));
  const maxL = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxL));
  const sumExp = exps.reduce((a, b) => a + b, 0) || 1e-9;
  const probs = exps.map((e) => e / sumExp);

  const results: ZeroShotResult[] = classTextEmbeddings.map((c, idx) => ({
    className: c.className,
    score: probs[idx],
    similarity: similarities[idx]
  }));

  results.sort((a, b) => b.score - a.score);
  return results;
}

// ============================================================================
// 3. AUDIO-VISUAL FUSION & TEMPORAL SYNCHRONIZATION (Chapter 53)
// ============================================================================

export interface AudioVisualAlignmentResult {
  correlation: number;
  lagOffsetMs: number;
  isSynchronized: boolean;
}

export function computeAudioVisualCorrelation(
  audioEnvelope: number[],
  videoMotion: number[]
): AudioVisualAlignmentResult {
  const n = Math.min(audioEnvelope.length, videoMotion.length);
  if (n < 2) return { correlation: 0, lagOffsetMs: 0, isSynchronized: false };

  // Means
  let aSum = 0;
  let vSum = 0;
  for (let i = 0; i < n; i++) {
    aSum += audioEnvelope[i];
    vSum += videoMotion[i];
  }
  const aMean = aSum / n;
  const vMean = vSum / n;

  // Pearson correlation
  let num = 0;
  let aVar = 0;
  let vVar = 0;
  for (let i = 0; i < n; i++) {
    const da = audioEnvelope[i] - aMean;
    const dv = videoMotion[i] - vMean;
    num += da * dv;
    aVar += da * da;
    vVar += dv * dv;
  }

  const denom = Math.sqrt(aVar) * Math.sqrt(vVar);
  const correlation = denom > 1e-9 ? num / denom : 0;

  // Offset estimation across small lag search window
  let bestCorr = correlation;
  let bestLag = 0;
  const maxLag = Math.min(10, Math.floor(n / 4));

  for (let lag = -maxLag; lag <= maxLag; lag++) {
    let lagNum = 0;
    let laVar = 0;
    let lvVar = 0;
    let count = 0;
    for (let i = 0; i < n; i++) {
      const vi = i + lag;
      if (vi >= 0 && vi < n) {
        const da = audioEnvelope[i] - aMean;
        const dv = videoMotion[vi] - vMean;
        lagNum += da * dv;
        laVar += da * da;
        lvVar += dv * dv;
        count++;
      }
    }
    if (count > 2) {
      const d = Math.sqrt(laVar) * Math.sqrt(lvVar);
      const c = d > 1e-9 ? lagNum / d : 0;
      if (c > bestCorr) {
        bestCorr = c;
        bestLag = lag;
      }
    }
  }

  const lagOffsetMs = bestLag * 33.3; // assuming ~30 FPS frame rate
  return {
    correlation: Math.max(-1, Math.min(1, correlation)),
    lagOffsetMs,
    isSynchronized: Math.abs(lagOffsetMs) <= 45 && correlation > 0.4
  };
}

// ============================================================================
// 4. CROSS-MODAL RETRIEVAL & METRICS (Chapter 54)
// ============================================================================

export interface RetrievalItem {
  id: string;
  title: string;
  category: string;
  embedding: number[];
  similarity?: number;
  rank?: number;
}

export function rankByCosineSimilarity(
  queryEmbed: number[],
  database: RetrievalItem[]
): RetrievalItem[] {
  const scored = database.map((item) => ({
    ...item,
    similarity: computeCrossModalSimilarity(queryEmbed, item.embedding)
  }));

  scored.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
  return scored.map((item, idx) => ({ ...item, rank: idx + 1 }));
}

export function computeRetrievalMetrics(
  rankedResults: RetrievalItem[],
  relevantIds: Set<string>,
  k = 5
): { recallAtK: number; precisionAtK: number; mrr: number } {
  const topK = rankedResults.slice(0, k);
  let relevantInTopK = 0;

  for (const item of topK) {
    if (relevantIds.has(item.id)) {
      relevantInTopK++;
    }
  }

  const recallAtK =
    relevantIds.size > 0 ? relevantInTopK / relevantIds.size : 0;
  const precisionAtK = k > 0 ? relevantInTopK / k : 0;

  // Mean Reciprocal Rank (first relevant item rank)
  let mrr = 0;
  for (let i = 0; i < rankedResults.length; i++) {
    if (relevantIds.has(rankedResults[i].id)) {
      mrr = 1 / (i + 1);
      break;
    }
  }

  return { recallAtK, precisionAtK, mrr };
}

// ============================================================================
// 5. MULTIMODAL APPLICATION PIPELINE (Chapter 55)
// ============================================================================

export interface MultimodalSystemSample {
  id: string;
  title: string;
  visualFeatures: number[];
  audioFeatures: number[];
  textDescription: string;
  groundTruthCategory: string;
}

export interface MultimodalInferenceOutput {
  sampleId: string;
  predictedCategory: string;
  confidence: number;
  earlyFusionVector: number[];
  lateFusionProbs: Record<string, number>;
  crossModalScore: number;
}

export function runMultimodalPipeline(
  sample: MultimodalSystemSample,
  categoryEmbeddings: Record<string, number[]>,
  weights = { visual: 0.5, audio: 0.3, text: 0.2 }
): MultimodalInferenceOutput {
  // 1. Early fusion: concat normalized vectors
  const earlyVec = earlyFusionConcat([sample.visualFeatures, sample.audioFeatures]);

  // 2. Multimodal similarity with category text representations
  const categories = Object.keys(categoryEmbeddings);
  const lateProbs: Record<string, number> = {};

  const visSims: number[] = [];
  const audSims: number[] = [];

  for (const cat of categories) {
    const catEmbed = categoryEmbeddings[cat];
    const sVis = computeCrossModalSimilarity(sample.visualFeatures, catEmbed.slice(0, sample.visualFeatures.length));
    const sAud = computeCrossModalSimilarity(sample.audioFeatures, catEmbed.slice(0, sample.audioFeatures.length));
    visSims.push(Math.max(0, sVis));
    audSims.push(Math.max(0, sAud));
  }

  // Apply temperature-scaled softmax for calibrated modality probabilities
  const temp = 0.2;
  const vMax = Math.max(...visSims);
  const vExps = visSims.map((s) => Math.exp((s - vMax) / temp));
  const vSum = vExps.reduce((a, b) => a + b, 0) || 1e-9;
  const vProbs = vExps.map((e) => e / vSum);

  const aMax = Math.max(...audSims);
  const aExps = audSims.map((s) => Math.exp((s - aMax) / temp));
  const aSum = aExps.reduce((a, b) => a + b, 0) || 1e-9;
  const aProbs = aExps.map((e) => e / aSum);

  const fusedProbs = lateFusionWeighted([vProbs, aProbs], [weights.visual, weights.audio]);

  let maxProb = -1;
  let bestCat = categories[0];
  for (let i = 0; i < categories.length; i++) {
    lateProbs[categories[i]] = fusedProbs[i];
    if (fusedProbs[i] > maxProb) {
      maxProb = fusedProbs[i];
      bestCat = categories[i];
    }
  }

  return {
    sampleId: sample.id,
    predictedCategory: bestCat,
    confidence: maxProb,
    earlyFusionVector: earlyVec,
    lateFusionProbs: lateProbs,
    crossModalScore: maxProb
  };
}

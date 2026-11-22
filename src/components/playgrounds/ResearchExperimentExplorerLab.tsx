import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  computeMeanAndStd,
  computeBootstrapConfidenceInterval,
  computePairedTTest,
  categorizeDetectionErrors,
  type DetectionErrorTaxonomy
} from '../../lib/researchMetrics';
import {
  FlaskConical,
  BarChart2,
  PieChart,
  Sliders,
  CheckCircle2,
  Layers,
  Activity
} from 'lucide-react';

type ResearchLabTab = 'partition' | 'iou_eval' | 'multi_seed' | 'ablation' | 'error_taxonomy';

interface SimulatedBox {
  id: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] in 0..100
  classId: number;
  label: string;
}

interface SimulatedPredBox {
  id: number;
  bbox: [number, number, number, number];
  classId: number;
  label: string;
  score: number;
}

export const ResearchExperimentExplorerLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ResearchLabTab>('iou_eval');

  // --- Tab 1: Dataset Partitioning State ---
  const [trainPercent, setTrainPercent] = useState<number>(70);
  const [valPercent, setValPercent] = useState<number>(15);
  // testPercent is 100 - train - val
  const testPercent = Math.max(0, 100 - trainPercent - valPercent);

  // --- Tab 2: Ground-Truth & IoU Thresholding State ---
  const [iouThreshold, setIouThreshold] = useState<number>(0.5);
  const [selectedPreset, setSelectedPreset] = useState<'crowded' | 'small_objects' | 'clean'>('crowded');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulated Ground Truths & Predictions based on preset
  const { groundTruths, predictions } = useMemo(() => {
    if (selectedPreset === 'small_objects') {
      const gts: SimulatedBox[] = [
        { id: 1, bbox: [20, 25, 32, 37], classId: 0, label: 'Drone Target' },
        { id: 2, bbox: [45, 60, 56, 72], classId: 0, label: 'Drone Target' },
        { id: 3, bbox: [75, 30, 85, 41], classId: 1, label: 'Vehicle' },
      ];
      const preds: SimulatedPredBox[] = [
        { id: 101, bbox: [21, 26, 33, 38], classId: 0, label: 'Drone Target', score: 0.92 }, // Good TP
        { id: 102, bbox: [48, 62, 59, 74], classId: 0, label: 'Drone Target', score: 0.78 }, // Shifted Loc Error
        { id: 103, bbox: [75, 30, 85, 41], classId: 0, label: 'Drone Target', score: 0.65 }, // Cls Error
        { id: 104, bbox: [10, 80, 22, 92], classId: 0, label: 'Drone Target', score: 0.58 }, // Background FP
      ];
      return { groundTruths: gts, predictions: preds };
    }

    if (selectedPreset === 'clean') {
      const gts: SimulatedBox[] = [
        { id: 1, bbox: [15, 20, 45, 75], classId: 0, label: 'Pedestrian' },
        { id: 2, bbox: [55, 30, 85, 80], classId: 1, label: 'Cyclist' },
      ];
      const preds: SimulatedPredBox[] = [
        { id: 101, bbox: [16, 21, 44, 74], classId: 0, label: 'Pedestrian', score: 0.96 },
        { id: 102, bbox: [56, 31, 84, 79], classId: 1, label: 'Cyclist', score: 0.91 },
      ];
      return { groundTruths: gts, predictions: preds };
    }

    // Default: 'crowded'
    const gts: SimulatedBox[] = [
      { id: 1, bbox: [15, 20, 35, 70], classId: 0, label: 'Person A' },
      { id: 2, bbox: [30, 22, 50, 72], classId: 0, label: 'Person B (Occluded)' },
      { id: 3, bbox: [65, 35, 90, 85], classId: 1, label: 'Car' },
    ];
    const preds: SimulatedPredBox[] = [
      { id: 101, bbox: [14, 21, 36, 71], classId: 0, label: 'Person A', score: 0.94 }, // TP
      { id: 102, bbox: [28, 25, 42, 65], classId: 0, label: 'Person B', score: 0.72 }, // Partial Loc
      { id: 103, bbox: [66, 36, 89, 84], classId: 1, label: 'Car', score: 0.89 },      // TP
      { id: 104, bbox: [78, 10, 95, 28], classId: 1, label: 'Car', score: 0.45 },      // Clutter FP
    ];
    return { groundTruths: gts, predictions: preds };
  }, [selectedPreset]);

  // Compute Error Taxonomy dynamically using research metrics engine
  const errorTaxonomy: DetectionErrorTaxonomy = useMemo(() => {
    return categorizeDetectionErrors(groundTruths, predictions, iouThreshold);
  }, [groundTruths, predictions, iouThreshold]);

  // --- Tab 3: Multi-Seed Statistical Rigor State ---
  const [numSeeds, setNumSeeds] = useState<number>(3);
  const baselineSeedData = useMemo(() => [43.68, 43.85, 43.72, 43.90, 43.65, 43.80, 43.75, 43.82, 43.69, 43.74], []);
  const proposedSeedData = useMemo(() => [45.12, 45.30, 45.24, 45.45, 45.18, 45.32, 45.28, 45.40, 45.15, 45.22], []);

  const currentBaselineSeeds = useMemo(() => baselineSeedData.slice(0, numSeeds), [baselineSeedData, numSeeds]);
  const currentProposedSeeds = useMemo(() => proposedSeedData.slice(0, numSeeds), [proposedSeedData, numSeeds]);

  const baselineStats = useMemo(() => {
    const ms = computeMeanAndStd(currentBaselineSeeds);
    const ci = computeBootstrapConfidenceInterval(currentBaselineSeeds, 0.95, 500, 42);
    return { ...ms, ci };
  }, [currentBaselineSeeds]);

  const proposedStats = useMemo(() => {
    const ms = computeMeanAndStd(currentProposedSeeds);
    const ci = computeBootstrapConfidenceInterval(currentProposedSeeds, 0.95, 500, 1337);
    return { ...ms, ci };
  }, [currentProposedSeeds]);

  const tTestResult = useMemo(() => {
    return computePairedTTest(currentProposedSeeds, currentBaselineSeeds);
  }, [currentProposedSeeds, currentBaselineSeeds]);

  // --- Tab 4: Factorial Ablation Matrix State ---
  const [enableDeformableHead, setEnableDeformableHead] = useState<boolean>(true);
  const [enableFocalLoss, setEnableFocalLoss] = useState<boolean>(true);
  const [enableMultiScaleFPN, setEnableMultiScaleFPN] = useState<boolean>(true);
  const [enableSoftGating, setEnableSoftGating] = useState<boolean>(false);

  const ablationCalculation = useMemo(() => {
    let mAP = 38.2;
    let params = 25.5;
    let flops = 12.4;
    let latency = 14.2;

    if (enableDeformableHead) {
      mAP += 2.6;
      params += 1.3;
      flops += 1.7;
      latency += 2.3;
    }
    if (enableFocalLoss) {
      mAP += 1.3;
      // Loss change adds 0 params/FLOPs at inference
    }
    if (enableMultiScaleFPN) {
      mAP += 1.8;
      params += 7.4;
      flops += 4.4;
      latency += 5.6;
    }
    if (enableSoftGating) {
      mAP += 0.9;
      params += 0.4;
      flops += 0.2;
      latency += 0.8;
    }

    const delta = mAP - 38.2;
    return { mAP, params, flops, latency, delta };
  }, [enableDeformableHead, enableFocalLoss, enableMultiScaleFPN, enableSoftGating]);

  // --- Canvas 2D Rendering for IoU Overlap ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Ground Truths (Green Dashed)
    groundTruths.forEach((gt) => {
      const x1 = (gt.bbox[0] / 100) * width;
      const y1 = (gt.bbox[1] / 100) * height;
      const w = ((gt.bbox[2] - gt.bbox[0]) / 100) * width;
      const h = ((gt.bbox[3] - gt.bbox[1]) / 100) * height;

      ctx.save();
      ctx.strokeStyle = '#10b981'; // Green
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(x1, y1, w, h);

      // Label badge
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fillRect(x1, y1 - 18, ctx.measureText(`GT: ${gt.label}`).width + 10, 18);
      ctx.fillStyle = '#10b981';
      ctx.font = '10px monospace';
      ctx.fillText(`GT: ${gt.label}`, x1 + 5, y1 - 5);
      ctx.restore();
    });

    // Draw Predictions (Cyan/Pink Solid with Fill)
    predictions.forEach((pred) => {
      const x1 = (pred.bbox[0] / 100) * width;
      const y1 = (pred.bbox[1] / 100) * height;
      const w = ((pred.bbox[2] - pred.bbox[0]) / 100) * width;
      const h = ((pred.bbox[3] - pred.bbox[1]) / 100) * height;

      ctx.save();
      ctx.strokeStyle = '#38bdf8'; // Cyan
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, w, h);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(x1, y1, w, h);

      // Prediction badge
      ctx.fillStyle = '#0f172a';
      const text = `${pred.label} (${(pred.score * 100).toFixed(0)}%)`;
      ctx.fillRect(x1, y1 + h, ctx.measureText(text).width + 8, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(text, x1 + 4, y1 + h + 12);
      ctx.restore();
    });
  }, [groundTruths, predictions]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              L4 Research Infrastructure
            </span>
            <span className="text-xs text-slate-400">ISVWS 2026–2040 Standard</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-400" />
            Laboratorium Eksplorasi Eksperimen Riset Reproducible (Tier-A)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulasi visual interaktif: Audit partisi dataset, evaluasi IoU, rigor statistik multi-seed (N ≥ 3), matriks ablasi, dan taksonomi galat TIDE.
          </p>
        </div>

        {/* Evidence Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Status Bukti: Educational Simulation (Tier-A Browser)</span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('iou_eval')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'iou_eval'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          1. Overlap Ground-Truth &amp; IoU
        </button>

        <button
          onClick={() => setActiveTab('multi_seed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'multi_seed'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          2. Rigor Statistik Multi-Seed (N ≥ 3)
        </button>

        <button
          onClick={() => setActiveTab('ablation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'ablation'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          3. Matriks Studi Ablasi &amp; Pareto
        </button>

        <button
          onClick={() => setActiveTab('error_taxonomy')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'error_taxonomy'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          4. Taksonomi Galat (TIDE)
        </button>

        <button
          onClick={() => setActiveTab('partition')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'partition'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          5. Partisi Dataset &amp; Long-Tail
        </button>
      </div>

      {/* TAB 1: GROUND-TRUTH & IOU EVALUATION */}
      {activeTab === 'iou_eval' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={420}
              height={320}
              className="w-full max-w-[420px] rounded-lg border border-slate-800 aspect-[420/320]"
            />
            <div className="flex flex-wrap items-center justify-between w-full max-w-[420px] gap-2 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-0.5 border-b-2 border-dashed border-emerald-400 inline-block" />
                Ground Truth
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
                Prediksi Detektor
              </span>
              <span className="text-slate-500">Threshold IoU Aktif: {iouThreshold.toFixed(2)}</span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-200">Skenario Uji Visual:</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'crowded', label: 'Crowded (Oklusi)' },
                  { id: 'small_objects', label: 'Objek Kecil' },
                  { id: 'clean', label: 'Kasus Bersih' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id as any)}
                    className={`py-1.5 px-2 rounded text-xs font-medium transition text-center ${
                      selectedPreset === preset.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Threshold IoU Match (&tau;):</span>
                  <span className="font-mono text-amber-400 font-bold">{iouThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={iouThreshold}
                  onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>0.10 (Longgar)</span>
                  <span>0.50 (Standard VOC)</span>
                  <span>0.75 (Ketat COCO)</span>
                </div>
              </div>
            </div>

            {/* Classification Outcome Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-lg text-center">
                <span className="text-[10px] text-emerald-400 block font-medium">True Positives</span>
                <span className="text-lg font-bold font-mono text-emerald-300">{errorTaxonomy.truePositives}</span>
              </div>
              <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-lg text-center">
                <span className="text-[10px] text-amber-400 block font-medium">Localization Err</span>
                <span className="text-lg font-bold font-mono text-amber-300">{errorTaxonomy.localizationErrors}</span>
              </div>
              <div className="bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-lg text-center">
                <span className="text-[10px] text-rose-400 block font-medium">Missed GT (FN)</span>
                <span className="text-lg font-bold font-mono text-rose-300">{errorTaxonomy.missedObjects}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="text-slate-400 font-sans text-[11px] font-semibold">Diagnosis Dampak Metrik:</div>
              <div className="flex justify-between text-slate-300">
                <span>Precision (TP / Pred):</span>
                <span className="text-cyan-400 font-bold">
                  {((errorTaxonomy.truePositives / Math.max(1, predictions.length)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Recall (TP / GT):</span>
                <span className="text-emerald-400 font-bold">
                  {((errorTaxonomy.truePositives / Math.max(1, groundTruths.length)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-SEED STATISTICAL RIGOR */}
      {activeTab === 'multi_seed' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Konfigurasi Random Seeds Independen (Mandat Keputusan Gate 6):
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Membuktikan bahwa perbaikan performa bukan anomali kebetulan dari satu seed keberuntungan.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Jumlah Seed (N):</span>
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumSeeds(n)}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    numSeeds === n
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  N = {n}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline Card */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Baseline SOTA (ResNet-50)</span>
                <span className="text-[11px] text-slate-500 font-mono">Seeds: {currentBaselineSeeds.length}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {baselineStats.mean.toFixed(2)}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  &plusmn; {baselineStats.std.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800/80">
                95% Bootstrap CI: [{baselineStats.ci.lower.toFixed(2)}%, {baselineStats.ci.upper.toFixed(2)}%]
              </div>
              <div className="text-[11px] text-slate-500">
                Eksekusi per-seed: {currentBaselineSeeds.map((v) => v.toFixed(2)).join(', ')}
              </div>
            </div>

            {/* Proposed Method Card */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">Metode Usulan (Proposed Multi-Scale)</span>
                <span className="text-[11px] text-amber-500/80 font-mono">Seeds: {currentProposedSeeds.length}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-amber-400">
                  {proposedStats.mean.toFixed(2)}%
                </span>
                <span className="text-xs text-amber-300/80 font-mono">
                  &plusmn; {proposedStats.std.toFixed(2)}%
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono ml-2">
                  +{(proposedStats.mean - baselineStats.mean).toFixed(2)}% &Delta;
                </span>
              </div>
              <div className="text-xs text-amber-300/80 font-mono bg-slate-900 p-2 rounded border border-slate-800/80">
                95% Bootstrap CI: [{proposedStats.ci.lower.toFixed(2)}%, {proposedStats.ci.upper.toFixed(2)}%]
              </div>
              <div className="text-[11px] text-slate-500">
                Eksekusi per-seed: {currentProposedSeeds.map((v) => v.toFixed(2)).join(', ')}
              </div>
            </div>
          </div>

          {/* Statistical Hypothesis Test Results */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Uji Hipotesis Signifikansi (Two-Sided Paired t-test):
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                  tTestResult.isSignificant
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {tTestResult.isSignificant ? 'Signifikan Nyata (p < 0.05)' : 'Tidak Signifikan (p >= 0.05)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300 pt-1">
              <div>t-Statistic: <strong className="text-amber-400">{tTestResult.tStatistic.toFixed(3)}</strong></div>
              <div>Degrees of Freedom: <strong className="text-cyan-400">{tTestResult.degreesOfFreedom}</strong></div>
              <div>p-Value Approx: <strong className="text-emerald-400">{tTestResult.pValueApprox.toFixed(4)}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ABLATION MATRIX & PARETO TRADEOFF */}
      {activeTab === 'ablation' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-200">
              Isolasi Komponen Arsitektural (One-Factor-at-a-Time):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDeformableHead}
                  onChange={(e) => setEnableDeformableHead(e.target.checked)}
                  className="accent-amber-500"
                />
                <span>Deformable Attention Head</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableFocalLoss}
                  onChange={(e) => setEnableFocalLoss(e.target.checked)}
                  className="accent-amber-500"
                />
                <span>Generalized Focal Loss</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableMultiScaleFPN}
                  onChange={(e) => setEnableMultiScaleFPN(e.target.checked)}
                  className="accent-amber-500"
                />
                <span>Multi-Scale Feature Pyramid</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSoftGating}
                  onChange={(e) => setEnableSoftGating(e.target.checked)}
                  className="accent-amber-500"
                />
                <span>Soft-Gating Association</span>
              </label>
            </div>
          </div>

          {/* Ablation Metrics & Resource Accounting */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">mAP@[.50:.95] Terestimasi</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {ablationCalculation.mAP.toFixed(1)}%
              </span>
              <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                &Delta; +{ablationCalculation.delta.toFixed(1)}% vs Baseline
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Parameter Model</span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {ablationCalculation.params.toFixed(1)} M
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Memori Bobot (FP32)
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Komputasi Kompresi</span>
              <span className="text-xl font-bold font-mono text-purple-400">
                {ablationCalculation.flops.toFixed(1)} GFLOPs
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Beban per-frame resolusi 800px
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Latensi Streaming P50</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {ablationCalculation.latency.toFixed(1)} ms
              </span>
              <span className="text-[10px] text-amber-300/80 block mt-0.5">
                Throughput: {(1000 / ablationCalculation.latency).toFixed(1)} FPS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ERROR TAXONOMY (TIDE) */}
      {activeTab === 'error_taxonomy' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-200">
              Taksonomi Galat Prediksi Deteksi (Framework TIDE):
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Mendiagnosis apakah kegagalan didominasi oleh pergeseran bounding box (lokalisasi) atau ketidaktepatan semantik (klasifikasi).
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4 text-center">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-emerald-400 font-medium block">True Positives</span>
                <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">
                  {errorTaxonomy.truePositives}
                </span>
                <span className="text-[10px] text-slate-500">Objek Tervalidasi</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-amber-500/30">
                <span className="text-[11px] text-amber-400 font-medium block">Localization Err</span>
                <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">
                  {errorTaxonomy.localizationErrors}
                </span>
                <span className="text-[10px] text-slate-500">0.1 &le; IoU &lt; &tau;</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-rose-500/30">
                <span className="text-[11px] text-rose-400 font-medium block">Classification Err</span>
                <span className="text-xl font-bold font-mono text-rose-300 mt-1 block">
                  {errorTaxonomy.classificationErrors}
                </span>
                <span className="text-[10px] text-slate-500">IoU &ge; &tau;, Label Salah</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-purple-500/30">
                <span className="text-[11px] text-purple-400 font-medium block">Background FP</span>
                <span className="text-xl font-bold font-mono text-purple-300 mt-1 block">
                  {errorTaxonomy.backgroundHallucinations}
                </span>
                <span className="text-[10px] text-slate-500">IoU &lt; 0.1 Clutter</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-pink-500/30">
                <span className="text-[11px] text-pink-400 font-medium block">Missed GT (FN)</span>
                <span className="text-xl font-bold font-mono text-pink-300 mt-1 block">
                  {errorTaxonomy.missedObjects}
                </span>
                <span className="text-[10px] text-slate-500">Objek Terlewat</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATASET PARTITIONING & LONG-TAIL */}
      {activeTab === 'partition' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-200">
              Audit Partisi Dataset Kanonikal (Train / Val / Test Split):
            </div>
            <div className="text-[11px] text-slate-400">
              Menjaga rasio pembagian dataset bebas dari data leakage dan kebocoran sequence video.
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Training: {trainPercent}%</span>
                <span>Validation: {valPercent}%</span>
                <span>Test (Held-out): {testPercent}%</span>
              </div>

              {/* Visual Split Bar */}
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
                <div style={{ width: `${trainPercent}%` }} className="bg-cyan-500 h-full" title="Training Set" />
                <div style={{ width: `${valPercent}%` }} className="bg-amber-500 h-full" title="Validation Set" />
                <div style={{ width: `${testPercent}%` }} className="bg-emerald-500 h-full" title="Test Set" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Rasio Training (%):</label>
                  <input
                    type="range"
                    min={50}
                    max={85}
                    value={trainPercent}
                    onChange={(e) => setTrainPercent(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Rasio Validation (%):</label>
                  <input
                    type="range"
                    min={5}
                    max={25}
                    value={valPercent}
                    onChange={(e) => setValPercent(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

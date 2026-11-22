import React, { useState, useMemo } from 'react';
import {
  calculateAmdahlSpeedup,
  analyzeLatencyBudget,
  estimateStaticBundleImpact,
} from '../../lib/systemsProcessing';
import { Gauge, Clock, Zap, BarChart2, Package, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const PerformanceProfilerLab: React.FC = () => {
  const [tCapture, setTCapture] = useState<number>(2.5);
  const [tPreprocess, setTPreprocess] = useState<number>(1.5);
  const [tInference, setTInference] = useState<number>(8.0);
  const [tPostprocess, setTPostprocess] = useState<number>(1.0);
  const [targetFps, setTargetFps] = useState<number>(60);
  const [stageSpeedupFactor, setStageSpeedupFactor] = useState<number>(4.0);

  // Bundle sizes state
  const [vendorSizeKb] = useState<number>(150);
  const [appSizeKb] = useState<number>(50);
  const [styleSizeKb] = useState<number>(20);

  // Initial latency budget analysis
  const currentStages = useMemo(() => ({
    capture: tCapture,
    preprocess: tPreprocess,
    inference: tInference,
    postprocess: tPostprocess,
  }), [tCapture, tPreprocess, tInference, tPostprocess]);

  const budgetAnalysis = useMemo(() => {
    return analyzeLatencyBudget(currentStages, targetFps);
  }, [currentStages, targetFps]);

  // Bottleneck fraction
  const bottleneckTime = currentStages[budgetAnalysis.bottleneckStage as keyof typeof currentStages] || 0;
  const pBottleneck = budgetAnalysis.totalLatencyMs > 0 ? bottleneckTime / budgetAnalysis.totalLatencyMs : 0;

  // Amdahl speedup
  const amdahlOverallSpeedup = useMemo(() => {
    return calculateAmdahlSpeedup(pBottleneck, stageSpeedupFactor);
  }, [pBottleneck, stageSpeedupFactor]);

  // Optimized pipeline metrics
  const optimizedStages = useMemo(() => {
    const updated = { ...currentStages };
    const bName = budgetAnalysis.bottleneckStage as keyof typeof currentStages;
    if (bName && updated[bName] !== undefined) {
      updated[bName] = Number((updated[bName] / stageSpeedupFactor).toFixed(2));
    }
    return updated;
  }, [currentStages, budgetAnalysis.bottleneckStage, stageSpeedupFactor]);

  const optimizedAnalysis = useMemo(() => {
    return analyzeLatencyBudget(optimizedStages, targetFps);
  }, [optimizedStages, targetFps]);

  // Static bundle footprint
  const bundleStats = useMemo(() => {
    return estimateStaticBundleImpact({
      vendor: vendorSizeKb,
      app: appSizeKb,
      styles: styleSizeKb,
    }, 0.30);
  }, [vendorSizeKb, appSizeKb, styleSizeKb]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-amber-400" />
            Laboratorium Profiling Latensi, Hukum Amdahl & Optimasi Produksi (Bab 59)
          </h2>
          <p className="text-sm text-slate-400">
            Dekomposisi anggaran waktu frame (Frame-Time Budgeting), batas percepatan teoretis Hukum Amdahl, dan analisis jejak bundel web statis.
          </p>
        </div>
        <button
          onClick={() => {
            setTCapture(2.5);
            setTPreprocess(1.5);
            setTInference(8.0);
            setTPostprocess(1.0);
            setTargetFps(60);
            setStageSpeedupFactor(4.0);
          }}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
          title="Reset ke Default"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-950/60 p-5 rounded-lg border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" /> Pengukuran Durasi Tahapan Pipeline
          </h3>

          {/* Capture Stage */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-400">1. Akuisisi & Transfer DMA (T_capture)</span>
              <span className="text-sky-400 font-mono">{tCapture.toFixed(1)} ms</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={6.0}
              step={0.5}
              value={tCapture}
              onChange={(e) => setTCapture(Number(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Preprocess Stage */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-400">2. Prapemrosesan Tensor (T_preprocess)</span>
              <span className="text-indigo-400 font-mono">{tPreprocess.toFixed(1)} ms</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={6.0}
              step={0.5}
              value={tPreprocess}
              onChange={(e) => setTPreprocess(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Inference Stage (Typically Bottleneck) */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-400">3. Inferensi Model DNN (T_inference)</span>
              <span className="text-amber-400 font-mono font-bold">{tInference.toFixed(1)} ms</span>
            </div>
            <input
              type="range"
              min={2.0}
              max={25.0}
              step={0.5}
              value={tInference}
              onChange={(e) => setTInference(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Postprocess Stage */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-400">4. Pascaproses & NMS (T_postprocess)</span>
              <span className="text-emerald-400 font-mono">{tPostprocess.toFixed(1)} ms</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5.0}
              step={0.5}
              value={tPostprocess}
              onChange={(e) => setTPostprocess(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Amdahl Stage Speedup Slider */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs text-slate-300 font-semibold block flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Akselerasi Bottleneck ({budgetAnalysis.bottleneckStage})
            </span>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Faktor Percepatan Tahapan (s)</span>
              <span className="text-amber-400 font-mono font-bold">{stageSpeedupFactor.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={8.0}
              step={0.5}
              value={stageSpeedupFactor}
              onChange={(e) => setStageSpeedupFactor(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1.0x (Tanpa akselerasi)</span>
              <span>4.0x (WebGPU / INT8)</span>
              <span>8.0x (NPU Hardware)</span>
            </div>
          </div>
        </div>

        {/* Telemetry & Analysis Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Latensi Awal
              </span>
              <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                {budgetAnalysis.totalLatencyMs.toFixed(1)} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{budgetAnalysis.achievableFps.toFixed(1)} FPS</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Amdahl Speedup
              </span>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {amdahlOverallSpeedup.toFixed(2)}x
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Proporsi p = {(pBottleneck * 100).toFixed(1)}%</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-400" /> Latensi Baru
              </span>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                {optimizedAnalysis.totalLatencyMs.toFixed(1)} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{optimizedAnalysis.achievableFps.toFixed(1)} FPS</div>
            </div>
          </div>

          {/* Latency Waterfall Bar Comparison */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-300">Perbandingan Profil Latensi vs Budget 60 FPS (16.67 ms)</span>
              <span className={`flex items-center gap-1 font-semibold ${optimizedAnalysis.meetsBudget ? 'text-emerald-400' : 'text-rose-400'}`}>
                {optimizedAnalysis.meetsBudget ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {optimizedAnalysis.meetsBudget ? 'Lolos Anggaran Frame' : 'Melebihi Anggaran'}
              </span>
            </div>

            {/* Before Optimization Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Sebelum Optimasi: {budgetAnalysis.totalLatencyMs.toFixed(1)} ms</span>
                <span className="font-mono">Headroom: {budgetAnalysis.headroomMs >= 0 ? `+${budgetAnalysis.headroomMs.toFixed(1)}` : budgetAnalysis.headroomMs.toFixed(1)} ms</span>
              </div>
              <div className="w-full h-5 bg-slate-900 rounded overflow-hidden flex border border-slate-800">
                <div style={{ width: `${(tCapture / 16.67) * 100}%` }} className="bg-sky-600"></div>
                <div style={{ width: `${(tPreprocess / 16.67) * 100}%` }} className="bg-indigo-600"></div>
                <div style={{ width: `${(tInference / 16.67) * 100}%` }} className="bg-amber-600"></div>
                <div style={{ width: `${(tPostprocess / 16.67) * 100}%` }} className="bg-emerald-600"></div>
              </div>
            </div>

            {/* After Optimization Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Setelah Akselerasi ({stageSpeedupFactor}x): {optimizedAnalysis.totalLatencyMs.toFixed(1)} ms</span>
                <span className="font-mono text-emerald-400">Headroom: +{optimizedAnalysis.headroomMs.toFixed(1)} ms</span>
              </div>
              <div className="w-full h-5 bg-slate-900 rounded overflow-hidden flex border border-slate-800">
                <div style={{ width: `${(optimizedStages.capture / 16.67) * 100}%` }} className="bg-sky-600"></div>
                <div style={{ width: `${(optimizedStages.preprocess / 16.67) * 100}%` }} className="bg-indigo-600"></div>
                <div style={{ width: `${(optimizedStages.inference / 16.67) * 100}%` }} className="bg-amber-600"></div>
                <div style={{ width: `${(optimizedStages.postprocess / 16.67) * 100}%` }} className="bg-emerald-600"></div>
              </div>
            </div>
          </div>

          {/* Static Deployment Footprint Panel */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block flex items-center gap-1.5">
              <Package className="w-4 h-4 text-sky-400" />
              Estimasi Jejak Bundel Statis Web & Kecepatan Distribusi Edge CDN
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Total Ukuran Mentah:</span>
                  <span className="text-slate-200 font-mono">{bundleStats.rawTotalKb.toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Terkompresi Gzip (30%):</span>
                  <span className="text-emerald-400 font-mono font-bold">{bundleStats.gzippedTotalKb.toFixed(1)} KB</span>
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Pemuatan Jaringan 3G:</span>
                  <span className="text-sky-400 font-mono">{bundleStats.estimatedLoadTime3GMs} ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pemuatan Jaringan 4G:</span>
                  <span className="text-emerald-400 font-mono">{bundleStats.estimatedLoadTime4GMs} ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


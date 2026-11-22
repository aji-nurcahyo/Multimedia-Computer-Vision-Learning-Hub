import React, { useState, useMemo } from 'react';
import {
  calculatePipelineLatency,
  calculateQueueDelay,
  calculateDropRate,
  simulateJitter,
} from '../../lib/systemsProcessing';
import { Play, Pause, RefreshCw, Cpu, Activity, Clock, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const RealTimeProcessingLab: React.FC = () => {
  const [arrivalFps, setArrivalFps] = useState<number>(30);
  const [procTimeMs, setProcTimeMs] = useState<number>(20);
  const [maxQueueSize, setMaxQueueSize] = useState<number>(3);
  const [captureDelayMs, setCaptureDelayMs] = useState<number>(3.5);
  const [renderDelayMs, setRenderDelayMs] = useState<number>(2.0);
  const [dropPolicy, setDropPolicy] = useState<'drop-oldest' | 'drop-newest'>('drop-oldest');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Derived metrics
  const serviceRateFps = useMemo(() => {
    return procTimeMs > 0 ? 1000.0 / procTimeMs : 100.0;
  }, [procTimeMs]);

  const theoreticalDropRate = useMemo(() => {
    return calculateDropRate(arrivalFps, serviceRateFps);
  }, [arrivalFps, serviceRateFps]);

  const queueDelayMs = useMemo(() => {
    // Expected steady state queue occupancy
    const trafficIntensity = arrivalFps / (serviceRateFps || 1);
    const avgQueueOccupancy = Math.min(maxQueueSize, Math.max(0.1, trafficIntensity * 0.8));
    return calculateQueueDelay(avgQueueOccupancy, serviceRateFps);
  }, [arrivalFps, serviceRateFps, maxQueueSize]);

  const totalPipelineLatency = useMemo(() => {
    return calculatePipelineLatency({
      capture: captureDelayMs,
      processing: procTimeMs,
      queue: queueDelayMs,
      render: renderDelayMs,
    });
  }, [captureDelayMs, procTimeMs, queueDelayMs, renderDelayMs]);

  const targetBudgetMs = useMemo(() => {
    return 1000.0 / arrivalFps;
  }, [arrivalFps]);

  const meetsDeadline = totalPipelineLatency <= targetBudgetMs;

  // Jitter simulation
  const jitterData = useMemo(() => {
    const nominal = 1000.0 / arrivalFps;
    const intervals = [
      nominal - 1.2,
      nominal + 0.8,
      nominal - 0.5,
      nominal + 2.1,
      nominal - 1.0,
      nominal + 0.3,
      nominal + 1.5,
    ];
    return simulateJitter(intervals);
  }, [arrivalFps]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            Laboratorium Pipeline Multimedia Real-Time & Antrean Buffer (Bab 56)
          </h2>
          <p className="text-sm text-slate-400">
            Simulasi interaktif dekomposisi latensi end-to-end, dinamika antrean buffer cincin, variansi jitter, dan kebijakan drop-oldest.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulating ? 'Jeda Pipeline' : 'Jalankan Pipeline'}
          </button>
          <button
            onClick={() => {
              setArrivalFps(30);
              setProcTimeMs(20);
              setMaxQueueSize(3);
              setCaptureDelayMs(3.5);
              setRenderDelayMs(2.0);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            title="Reset ke Default"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Controls and Live Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-950/60 p-5 rounded-lg border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-sky-400" /> Parameter Aliran & Pemrosesan
          </h3>

          {/* Arrival FPS Slider */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-400">Laju Kedatangan Kamera (λ)</span>
              <span className="text-sky-400 font-mono font-bold">{arrivalFps} FPS</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={arrivalFps}
              onChange={(e) => setArrivalFps(Number(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>10 FPS (100ms)</span>
              <span>30 FPS (33.3ms)</span>
              <span>60 FPS (16.7ms)</span>
            </div>
          </div>

          {/* Worker Processing Time Slider */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-400">Waktu Komputasi Worker (T_proc)</span>
              <span className="text-amber-400 font-mono font-bold">{procTimeMs} ms ({serviceRateFps.toFixed(1)} FPS)</span>
            </div>
            <input
              type="range"
              min={5}
              max={70}
              step={1}
              value={procTimeMs}
              onChange={(e) => setProcTimeMs(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>5 ms (200 FPS)</span>
              <span>20 ms (50 FPS)</span>
              <span>70 ms (14 FPS)</span>
            </div>
          </div>

          {/* Buffer Capacity */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-400">Kapasitas Maksimum Antrean (N_max)</span>
              <span className="text-indigo-400 font-mono font-bold">{maxQueueSize} Frame</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={maxQueueSize}
              onChange={(e) => setMaxQueueSize(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 (Ultra Low Latency)</span>
              <span>4 (Standar)</span>
              <span>8 (Penyerap Jitter)</span>
            </div>
          </div>

          {/* Drop Policy Selection */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 block mb-2 font-medium">Kebijakan Pembuangan Frame (Drop Policy)</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDropPolicy('drop-oldest')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                  dropPolicy === 'drop-oldest'
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold text-slate-200">Drop-Oldest</div>
                <div className="text-[10px] text-slate-400">Selalu pandangan visual mutakhir</div>
              </button>
              <button
                onClick={() => setDropPolicy('drop-newest')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                  dropPolicy === 'drop-newest'
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold text-slate-200">Drop-Newest</div>
                <div className="text-[10px] text-slate-400">Pertahankan frame dalam antrean</div>
              </button>
            </div>
          </div>

          {/* Fixed Overhead Controls */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">T_capture (ms)</span>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={captureDelayMs}
                onChange={(e) => setCaptureDelayMs(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">T_render (ms)</span>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="8"
                value={renderDelayMs}
                onChange={(e) => setRenderDelayMs(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Real-time Telemetry & Pipeline Display (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Status KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Total Latensi
              </span>
              <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                {totalPipelineLatency.toFixed(1)} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Budget: {targetBudgetMs.toFixed(1)} ms</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Queue Delay
              </span>
              <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
                {queueDelayMs.toFixed(1)} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Kapasitas: {maxQueueSize} frame</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Frame Drop
              </span>
              <div className={`text-xl font-bold font-mono mt-1 ${theoreticalDropRate > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {(theoreticalDropRate * 100).toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {theoreticalDropRate > 0 ? 'Kelebihan Beban' : 'Nol Kehilangan'}
              </div>
            </div>
          </div>

          {/* Pipeline Stage Decomposition Waterfall */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Dekomposisi Latensi Pipa (T_total vs Budget)</span>
              <span className={`flex items-center gap-1 font-semibold ${meetsDeadline ? 'text-emerald-400' : 'text-rose-400'}`}>
                {meetsDeadline ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {meetsDeadline ? 'Memenuhi Deadline' : 'Terlambat (Missed Deadline)'}
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-7 bg-slate-900 rounded-md overflow-hidden flex border border-slate-800 text-[10px] font-bold">
              <div
                style={{ width: `${Math.min(100, (captureDelayMs / targetBudgetMs) * 100)}%` }}
                className="bg-sky-600 flex items-center justify-center text-white"
                title={`Capture: ${captureDelayMs} ms`}
              >
                Cap
              </div>
              <div
                style={{ width: `${Math.min(100, (queueDelayMs / targetBudgetMs) * 100)}%` }}
                className="bg-indigo-600 flex items-center justify-center text-white"
                title={`Queue: ${queueDelayMs.toFixed(1)} ms`}
              >
                Queue
              </div>
              <div
                style={{ width: `${Math.min(100, (procTimeMs / targetBudgetMs) * 100)}%` }}
                className="bg-amber-600 flex items-center justify-center text-white"
                title={`Proc: ${procTimeMs} ms`}
              >
                Proc
              </div>
              <div
                style={{ width: `${Math.min(100, (renderDelayMs / targetBudgetMs) * 100)}%` }}
                className="bg-emerald-600 flex items-center justify-center text-white"
                title={`Render: ${renderDelayMs} ms`}
              >
                Ren
              </div>
            </div>

            {/* Stage Legend */}
            <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                <span>Cap: {captureDelayMs}ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                <span>Queue: {queueDelayMs.toFixed(1)}ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Proc: {procTimeMs}ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Ren: {renderDelayMs}ms</span>
              </div>
            </div>
          </div>

          {/* Ring Buffer & Jitter Telemetry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 block mb-2">Simulasi Status Buffer Antrean</span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxQueueSize }).map((_, idx) => {
                  const isOccupied = idx < Math.ceil(arrivalFps / (serviceRateFps || 1));
                  return (
                    <div
                      key={idx}
                      className={`flex-1 h-8 rounded border flex items-center justify-center font-mono font-bold text-[10px] transition ${
                        isOccupied
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      {isOccupied ? `F${idx + 1}` : 'Free'}
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">
                Kebijakan aktif: <span className="text-slate-300 font-semibold">{dropPolicy}</span>
              </span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 block mb-1">Statistik Jitter Kedatangan</span>
              <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Rata-rata Δt:</span>
                  <span className="text-slate-200">{jitterData.meanIntervalMs.toFixed(2)} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Jitter (Std Dev):</span>
                  <span className="text-sky-400 font-bold">{jitterData.jitterStdMs.toFixed(2)} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Deviasi Maks:</span>
                  <span className="text-amber-400">{jitterData.maxJitterMs.toFixed(2)} ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


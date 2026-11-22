import React, { useState, useMemo } from 'react';
import {
  computeAffineQuantizationParams,
  computeQuantizationError,
  evaluateRooflineModel,
  calculateLatencyPercentiles,
  type RooflineResult
} from '../../lib/advancedCvProcessing';
import { Cpu, Zap, Activity, Layers, RefreshCw } from 'lucide-react';

interface HardwarePreset {
  id: string;
  name: string;
  category: string;
  peakGFlops: number;
  peakBandwidthGBs: number;
}

const HARDWARE_PRESETS: HardwarePreset[] = [
  {
    id: 'edge-tiny',
    name: 'Microcontroller / TinyML (Cortex-M55 / Coral)',
    category: 'Ultra Low Power',
    peakGFlops: 8.0,
    peakBandwidthGBs: 3.2
  },
  {
    id: 'jetson-nano',
    name: 'Edge AI SoC (NVIDIA Jetson Nano / Orin Nano)',
    category: 'Embedded Automotive / Drone',
    peakGFlops: 40.0,
    peakBandwidthGBs: 25.6
  },
  {
    id: 'edge-server',
    name: 'Industrial Edge Box (Xeon + RTX 4000 Edge)',
    category: 'Industrial Factory Edge',
    peakGFlops: 180.0,
    peakBandwidthGBs: 140.0
  }
];

export const EdgeVisionRooflineLab: React.FC = () => {
  // Tensor layer dimensions
  const [inChannels, setInChannels] = useState<number>(64);
  const [outChannels, setOutChannels] = useState<number>(128);
  const [featureSpatialDim, setFeatureSpatialDim] = useState<number>(32); // H = W = 32
  const [kernelSize, setKernelSize] = useState<number>(3); // 3x3 conv

  // Precision selection: FP32, FP16, INT8, INT4
  const [precisionBits, setPrecisionBits] = useState<number>(8); // 8-bit default
  const [selectedHwId, setSelectedHwId] = useState<string>('jetson-nano');

  const activeHw = HARDWARE_PRESETS.find((h) => h.id === selectedHwId) || HARDWARE_PRESETS[1];

  // Compute FLOPs and Memory Access
  const workloadMetrics = useMemo(() => {
    // 2D Convolution: 2 * Cout * Cin * K * K * Hout * Wout FLOPs
    const totalFlops = 2 * outChannels * inChannels * kernelSize * kernelSize * featureSpatialDim * featureSpatialDim;

    // Weights size in bytes
    const bytesPerElement = precisionBits / 8.0;
    const weightBytes = outChannels * inChannels * kernelSize * kernelSize * bytesPerElement;

    // Input & Output feature maps bytes
    const inActBytes = inChannels * featureSpatialDim * featureSpatialDim * bytesPerElement;
    const outActBytes = outChannels * featureSpatialDim * featureSpatialDim * bytesPerElement;
    const totalMemoryBytes = weightBytes + inActBytes + outActBytes;

    const arithmeticIntensity = totalFlops / Math.max(1, totalMemoryBytes); // FLOPs / Byte

    return {
      totalFlops,
      totalGFlops: totalFlops / 1e9,
      weightKB: weightBytes / 1024,
      totalMemoryKB: totalMemoryBytes / 1024,
      totalMemoryMB: totalMemoryBytes / (1024 * 1024),
      arithmeticIntensity
    };
  }, [inChannels, outChannels, featureSpatialDim, kernelSize, precisionBits]);

  // Evaluate Roofline Model
  const roofline: RooflineResult = useMemo(() => {
    return evaluateRooflineModel(
      workloadMetrics.arithmeticIntensity,
      activeHw.peakGFlops,
      activeHw.peakBandwidthGBs
    );
  }, [workloadMetrics.arithmeticIntensity, activeHw]);

  // Quantization Error Simulation for a typical weight layer distribution
  const quantError = useMemo(() => {
    // Synthetic zero-mean bell-curve weights in range [-1.5, 1.5]
    const syntheticWeights: number[] = [];
    for (let i = 0; i < 64; i++) {
      const u1 = Math.max(1e-6, (i + 1) / 65);
      const val = Math.cos(i * 0.4) * 1.2 * Math.sqrt(-2 * Math.log(u1));
      syntheticWeights.push(Math.max(-2.0, Math.min(2.0, val)));
    }

    const qParams = computeAffineQuantizationParams(-2.0, 2.0, precisionBits, false);
    return computeQuantizationError(syntheticWeights, qParams);
  }, [precisionBits]);

  // Estimated Latency and Percentiles based on attainable performance
  const latencyStats = useMemo(() => {
    // Expected compute time: Total GFLOPs / Attainable GFLOPs
    const meanLatencyMs = (workloadMetrics.totalGFlops / Math.max(0.01, roofline.attainableGFlops)) * 1000;

    // Simulate 50 frame latencies with Poisson-like OS context jitter
    const samples: number[] = [];
    for (let i = 0; i < 50; i++) {
      const jitter = (Math.sin(i * 1.3) ** 2) * 0.2 + (i % 7 === 0 ? 0.6 : 0.0);
      samples.push(meanLatencyMs * (1.0 + jitter));
    }

    return calculateLatencyPercentiles(samples);
  }, [workloadMetrics.totalGFlops, roofline.attainableGFlops]);

  // SVG Chart Dimensions for Roofline
  const chartWidth = 460;
  const chartHeight = 220;
  const padding = { left: 45, right: 25, top: 20, bottom: 35 };

  // Log scale helpers for Roofline chart
  const minI = 0.1;
  const maxI = 100.0;
  const minP = 0.5;
  const maxP = Math.max(activeHw.peakGFlops * 1.4, 250);

  const scaleX = (val: number) => {
    const clamped = Math.max(minI, Math.min(maxI, val));
    const logVal = Math.log10(clamped);
    const logMin = Math.log10(minI);
    const logMax = Math.log10(maxI);
    return padding.left + ((logVal - logMin) / (logMax - logMin)) * (chartWidth - padding.left - padding.right);
  };

  const scaleY = (val: number) => {
    const clamped = Math.max(minP, Math.min(maxP, val));
    const logVal = Math.log10(clamped);
    const logMin = Math.log10(minP);
    const logMax = Math.log10(maxP);
    return chartHeight - padding.bottom - ((logVal - logMin) / (logMax - logMin)) * (chartHeight - padding.top - padding.bottom);
  };

  // Roofline critical points
  const xKnee = scaleX(roofline.kneePoint);
  const yPeak = scaleY(activeHw.peakGFlops);
  const xStart = scaleX(minI);
  const yStart = scaleY(minI * activeHw.peakBandwidthGBs);
  const xEnd = scaleX(maxI);

  // Operating point
  const opX = scaleX(roofline.arithmeticIntensity);
  const opY = scaleY(roofline.attainableGFlops);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              Edge Vision Optimization & Roofline Performance Explorer
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              Tier-A Interactive Lab (ADV-08)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analisis intensitas aritmatika (FLOPs/Byte), kuantisasi affine INT8/INT4, dan batas komputasi vs memori menggunakan Roofline Performance Model.
          </p>
        </div>

        <button
          onClick={() => {
            setInChannels(64);
            setOutChannels(128);
            setFeatureSpatialDim(32);
            setKernelSize(3);
            setPrecisionBits(8);
            setSelectedHwId('jetson-nano');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          Reset Defaults
        </button>
      </div>

      {/* Main Grid: Roofline Diagram & Hardware / Tensor Tuning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Roofline Chart & Telemetry (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Activity className="w-4 h-4 text-emerald-400" />
              Diagram Model Roofline (Log-Log Scale)
            </span>
            <span
              className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                roofline.limitingFactor === 'memory-bound'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              Regim Operasi: {roofline.limitingFactor.toUpperCase()}
            </span>
          </div>

          {/* SVG Roofline Chart */}
          <div className="border border-slate-800 rounded-lg bg-slate-950 p-2 overflow-x-auto">
            <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
              {/* Axes */}
              <line
                x1={padding.left}
                y1={chartHeight - padding.bottom}
                x2={chartWidth - padding.right}
                y2={chartHeight - padding.bottom}
                stroke="#475569"
                strokeWidth="1.5"
              />
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={chartHeight - padding.bottom}
                stroke="#475569"
                strokeWidth="1.5"
              />

              {/* Grid Lines */}
              {[0.1, 1.0, 10.0, 100.0].map((v) => (
                <g key={`x-${v}`}>
                  <line
                    x1={scaleX(v)}
                    y1={padding.top}
                    x2={scaleX(v)}
                    y2={chartHeight - padding.bottom}
                    stroke="rgba(148, 163, 184, 0.1)"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={scaleX(v)}
                    y={chartHeight - padding.bottom + 15}
                    fill="#94a3b8"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {[1, 10, 100].map((v) => (
                <g key={`y-${v}`}>
                  <line
                    x1={padding.left}
                    y1={scaleY(v)}
                    x2={chartWidth - padding.right}
                    y2={scaleY(v)}
                    stroke="rgba(148, 163, 184, 0.1)"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding.left - 6}
                    y={scaleY(v) + 3}
                    fill="#94a3b8"
                    fontSize="9"
                    textAnchor="end"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {/* Memory Bound Slanted Ceiling */}
              <line
                x1={xStart}
                y1={yStart}
                x2={xKnee}
                y2={yPeak}
                stroke="#f59e0b"
                strokeWidth="2.5"
              />

              {/* Compute Bound Flat Ceiling */}
              <line
                x1={xKnee}
                y1={yPeak}
                x2={xEnd}
                y2={yPeak}
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Knee Point Marker */}
              <circle cx={xKnee} cy={yPeak} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
              <text x={xKnee + 6} y={yPeak - 6} fill="#94a3b8" fontSize="9" fontWeight="bold">
                Knee ({roofline.kneePoint.toFixed(1)} FLOPs/B)
              </text>

              {/* Operating Point Marker */}
              <circle
                cx={opX}
                cy={opY}
                r="6"
                fill={roofline.limitingFactor === 'memory-bound' ? '#f59e0b' : '#10b981'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle cx={opX} cy={opY} r="11" fill="none" stroke="#38bdf8" strokeDasharray="2 2" />

              {/* Labels */}
              <text
                x={chartWidth / 2}
                y={chartHeight - 5}
                fill="#cbd5e1"
                fontSize="10"
                textAnchor="middle"
              >
                Intensitas Aritmatika [FLOPs / Byte]
              </text>
              <text
                x={12}
                y={chartHeight / 2}
                fill="#cbd5e1"
                fontSize="10"
                textAnchor="middle"
                transform={`rotate(-90, 12, ${chartHeight / 2})`}
              >
                Kinerja [GFLOPs]
              </text>
            </svg>
          </div>

          {/* Performance Telemetry Cards */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Intensitas Operasi</span>
              <span className="text-sm font-bold font-mono text-cyan-400">
                {workloadMetrics.arithmeticIntensity.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block">FLOPs/Byte</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Kinerja Efektif</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {roofline.attainableGFlops.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500 block">GFLOPs</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Memori Layer</span>
              <span className="text-sm font-bold font-mono text-purple-400">
                {workloadMetrics.totalMemoryKB.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500 block">KByte</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Latensi P95</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                {latencyStats.p95.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block">milidetik</span>
            </div>
          </div>
        </div>

        {/* Right Controls & Quantization Precision (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hardware Target Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Target Perangkat Keras Edge:
            </label>
            <div className="space-y-1.5">
              {HARDWARE_PRESETS.map((hw) => (
                <button
                  key={hw.id}
                  onClick={() => setSelectedHwId(hw.id)}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition ${
                    selectedHwId === hw.id
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-semibold">{hw.name}</div>
                  <div className="text-[11px] text-slate-400 flex justify-between mt-0.5">
                    <span>Peak: {hw.peakGFlops} GFLOPs</span>
                    <span>Bandwidth: {hw.peakBandwidthGBs} GB/s</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Precision Selector */}
          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2.5 text-xs">
            <label className="font-semibold text-slate-200 block">
              Format Presisi Numerik & Kuantisasi:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { bits: 32, label: 'FP32', note: '4 Bytes' },
                { bits: 16, label: 'FP16', note: '2 Bytes' },
                { bits: 8, label: 'INT8', note: '1 Byte' },
                { bits: 4, label: 'INT4', note: '0.5 Byte' }
              ].map((p) => (
                <button
                  key={p.bits}
                  onClick={() => setPrecisionBits(p.bits)}
                  className={`p-1.5 rounded border text-center transition ${
                    precisionBits === p.bits
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <div>{p.label}</div>
                  <div className="text-[10px] text-slate-400">{p.note}</div>
                </button>
              ))}
            </div>

            {/* Quantization Metrics HUD */}
            <div className="border-t border-slate-800/80 pt-2 text-[11px] space-y-1 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Rasio Kompresi Memori:</span>
                <span className="text-cyan-300">{(32 / precisionBits).toFixed(1)}x Penghematan</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Rata-rata Galat Kuantisasi (MAE):</span>
                <span className="text-amber-300">{quantError.mae.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SQNR (Signal-to-Noise):</span>
                <span className="text-emerald-300">{quantError.sqnrDb.toFixed(1)} dB</span>
              </div>
            </div>
          </div>

          {/* Tensor Dimensions Tuning */}
          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2.5 text-xs">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Dimensi Tensor Lapisan Konvolusi
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Saluran Input (C_in) &amp; Output (C_out):</span>
                <span className="font-mono text-slate-200">{inChannels} &rarr; {outChannels}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="range"
                  min={16}
                  max={256}
                  step={16}
                  value={inChannels}
                  onChange={(e) => setInChannels(parseInt(e.target.value, 10))}
                  className="accent-cyan-500 cursor-pointer"
                />
                <input
                  type="range"
                  min={16}
                  max={512}
                  step={16}
                  value={outChannels}
                  onChange={(e) => setOutChannels(parseInt(e.target.value, 10))}
                  className="accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Dimensi Spasial ($H \times W$):</span>
                <span className="font-mono text-slate-200">{featureSpatialDim}x{featureSpatialDim} px</span>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                step={8}
                value={featureSpatialDim}
                onChange={(e) => setFeatureSpatialDim(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

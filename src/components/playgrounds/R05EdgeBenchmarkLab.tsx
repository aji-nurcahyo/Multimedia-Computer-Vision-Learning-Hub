import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Cpu, Zap, Thermometer, Gauge, CheckCircle2, AlertOctagon } from 'lucide-react';

export const R05EdgeBenchmarkLab: React.FC = () => {
  // Configurable Parameters
  const [precision, setPrecision] = useState<'fp32' | 'fp16' | 'int8' | 'int4'>('int8');
  const [memBandwidth, setMemBandwidth] = useState<number>(25.6); // GB/s
  const [peakGflops, setPeakGflops] = useState<number>(100.0); // GFLOPS
  const [temperatureC, setTemperatureC] = useState<number>(45); // degrees C

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Performance & Roofline Calculations
  const metrics = useMemo(() => {
    const ridgePoint = peakGflops / memBandwidth; // FLOPs/Byte

    // Thermal throttling multiplier (> 75C triggers clock scaling)
    const thermalThrottle = temperatureC > 75 ? Math.max(0.65, 1.0 - (temperatureC - 75) * 0.015) : 1.0;
    const effectivePeakGflops = peakGflops * thermalThrottle;

    // Precision factors
    let byteMultiplier = 4.0; // FP32: 4 bytes
    let mAP = 42.50;
    let baseLatencyMs = 32.0;

    if (precision === 'fp32') {
      byteMultiplier = 4.0;
      mAP = 42.50;
      baseLatencyMs = 32.0;
    } else if (precision === 'fp16') {
      byteMultiplier = 2.0;
      mAP = 42.49;
      baseLatencyMs = 24.0;
    } else if (precision === 'int8') {
      byteMultiplier = 1.0;
      mAP = 42.50;
      baseLatencyMs = 18.0;
    } else if (precision === 'int4') {
      byteMultiplier = 0.5;
      mAP = 42.39;
      baseLatencyMs = 15.0;
    }

    // Footprint
    const paramsM = 5.8;
    const footprintMB = paramsM * byteMultiplier;
    const compressionRatio = 23.2 / footprintMB;

    // Latency percentiles under thermal condition
    const p50 = (baseLatencyMs / thermalThrottle).toFixed(1);
    const p95 = ((baseLatencyMs * 1.32) / thermalThrottle).toFixed(1);
    const p99 = ((baseLatencyMs * 1.65) / thermalThrottle).toFixed(1);

    // Energy (mJ per frame)
    const energyMilliJoules = (Number(p50) * 1.8 * byteMultiplier * 0.5).toFixed(1);

    // Representative layers: Dense Conv vs Depthwise Separable Conv
    // Dense Conv: 100 MFLOPs / (5 MB * byteMultiplier / 4)
    const convFlops = 1e8;
    const convBytes = 5e6 * (byteMultiplier / 4.0);
    const convAI = convFlops / convBytes; // FLOPs/Byte
    const convAchievable = Math.min(effectivePeakGflops, convAI * memBandwidth);

    // Depthwise Conv: 2 MFLOPs / (2 MB * byteMultiplier / 4)
    const dwFlops = 2e6;
    const dwBytes = 2e6 * (byteMultiplier / 4.0);
    const dwAI = dwFlops / dwBytes;
    const dwAchievable = Math.min(effectivePeakGflops, dwAI * memBandwidth);

    return {
      ridgePoint: Number(ridgePoint.toFixed(2)),
      effectivePeakGflops: Number(effectivePeakGflops.toFixed(1)),
      footprintMB: Number(footprintMB.toFixed(1)),
      compressionRatio: Number(compressionRatio.toFixed(1)),
      mAP: Number(mAP.toFixed(2)),
      p50: Number(p50),
      p95: Number(p95),
      p99: Number(p99),
      energyMilliJoules: Number(energyMilliJoules),
      thermalThrottleFactor: Number(thermalThrottle.toFixed(2)),
      convLayer: { ai: Number(convAI.toFixed(2)), perf: Number(convAchievable.toFixed(1)) },
      dwLayer: { ai: Number(dwAI.toFixed(2)), perf: Number(dwAchievable.toFixed(1)) },
    };
  }, [precision, memBandwidth, peakGflops, temperatureC]);

  // Roofline Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Padding & plot bounds
    const padL = 60;
    const padR = 30;
    const padT = 30;
    const padB = 50;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, height - padB);
    ctx.lineTo(width - padR, height - padB);
    ctx.stroke();

    // Max display ranges (X: 0 to 12 FLOPs/Byte, Y: 0 to 200 GFLOPS)
    const maxX = 12.0;
    const maxY = Math.max(160, peakGflops * 1.3);

    const toPxX = (ai: number) => padL + (ai / maxX) * plotW;
    const toPxY = (perf: number) => height - padB - (perf / maxY) * plotH;

    // Grid & Ticks
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    for (let x = 2; x <= maxX; x += 2) {
      const px = toPxX(x);
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(px, padT);
      ctx.lineTo(px, height - padB);
      ctx.stroke();
      ctx.fillText(`${x}`, px - 4, height - padB + 16);
    }
    for (let y = 40; y <= maxY; y += 40) {
      const py = toPxY(y);
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(padL, py);
      ctx.lineTo(width - padR, py);
      ctx.stroke();
      ctx.fillText(`${y}`, padL - 34, py + 4);
    }

    // Roofline boundary: y = min(peakGflops, memBandwidth * x)
    const ridgeX = metrics.effectivePeakGflops / memBandwidth;
    const ridgePxX = toPxX(ridgeX);
    const peakPxY = toPxY(metrics.effectivePeakGflops);

    // Slanted memory ceiling
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toPxX(0), toPxY(0));
    ctx.lineTo(ridgePxX, peakPxY);
    // Plateau compute ceiling
    ctx.lineTo(width - padR, peakPxY);
    ctx.stroke();

    // Shaded Memory-Bound & Compute-Bound regions
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.moveTo(toPxX(0), toPxY(0));
    ctx.lineTo(ridgePxX, peakPxY);
    ctx.lineTo(ridgePxX, height - padB);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
    ctx.beginPath();
    ctx.moveTo(ridgePxX, peakPxY);
    ctx.lineTo(width - padR, peakPxY);
    ctx.lineTo(width - padR, height - padB);
    ctx.lineTo(ridgePxX, height - padB);
    ctx.closePath();
    ctx.fill();

    // Draw Ridge Point vertical dashed line
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(ridgePxX, peakPxY);
    ctx.lineTo(ridgePxX, height - padB);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Ridge: ${ridgeX.toFixed(1)} AI`, ridgePxX + 4, height - padB - 25);

    // Plot Depthwise Separable Layer Point
    const dwPxX = toPxX(metrics.dwLayer.ai);
    const dwPxY = toPxY(metrics.dwLayer.perf);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(dwPxX, dwPxY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fca5a5';
    ctx.fillText(`Depthwise (${metrics.dwLayer.ai} AI)`, dwPxX + 8, dwPxY - 2);

    // Plot Dense Conv Layer Point
    const convPxX = toPxX(Math.min(maxX - 0.5, metrics.convLayer.ai));
    const convPxY = toPxY(metrics.convLayer.perf);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(convPxX, convPxY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#86efac';
    ctx.fillText(`Dense Conv (${metrics.convLayer.ai} AI)`, convPxX - 70, convPxY - 8);

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Arithmetic Intensity (FLOPs / Byte) →', width / 2 - 80, height - 12);
    ctx.save();
    ctx.translate(16, height / 2 + 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Throughput (GFLOPS) →', 0, 0);
    ctx.restore();
  }, [metrics, peakGflops, memBandwidth]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
              R05 Interactive Lab
            </span>
            <span className="text-xs text-slate-400">Tier-A Edge Hardware Simulation</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            Edge Hardware Profiling & Operational Roofline Model
          </h3>
          <p className="text-xs text-slate-400">
            Analisis batas komputasi (Arithmetic Intensity vs Memory Bandwidth), kuantisasi, dan latensi statistik P95.
          </p>
        </div>

        {/* Precision Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          {(['fp32', 'fp16', 'int8', 'int4'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setPrecision(fmt)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium uppercase transition ${
                precision === fmt
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roofline Model Canvas */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center">
          <canvas ref={canvasRef} width={540} height={360} className="rounded w-full max-w-full" />
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Memory-Bound Ceiling (B_mem &times; I)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Compute-Bound Ceiling (P_peak)
            </span>
          </div>
        </div>

        {/* Hardware Control Sliders */}
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-400" /> Spesifikasi Perangkat Edge
            </h4>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>DRAM Memory Bandwidth</span>
                <span className="font-mono text-sky-400">{memBandwidth.toFixed(1)} GB/s</span>
              </div>
              <input
                type="range"
                min="10.0"
                max="60.0"
                step="1.0"
                value={memBandwidth}
                onChange={(e) => setMemBandwidth(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Puncak Throughput NPU</span>
                <span className="font-mono text-purple-400">{peakGflops.toFixed(0)} GFLOPS</span>
              </div>
              <input
                type="range"
                min="40"
                max="250"
                step="5"
                value={peakGflops}
                onChange={(e) => setPeakGflops(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Suhu Operasional SoC
                </span>
                <span className={`font-mono ${temperatureC > 75 ? 'text-red-400' : 'text-slate-300'}`}>
                  {temperatureC}°C {temperatureC > 75 && '(Throttled)'}
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="95"
                step="1"
                value={temperatureC}
                onChange={(e) => setTemperatureC(parseInt(e.target.value))}
                className="w-full accent-red-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Akurasi mAP</span>
              <span className="text-xl font-bold font-mono text-green-400">
                {metrics.mAP}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Retensi &gt; 99% baseline</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Model Footprint</span>
              <span className="text-xl font-bold font-mono text-sky-400">
                {metrics.footprintMB} MB
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{metrics.compressionRatio}x kompresi</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">P95 Tail Latency</span>
              <span className={`text-xl font-bold font-mono ${metrics.p95 < 25 ? 'text-green-400' : 'text-amber-400'}`}>
                {metrics.p95} ms
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">P50: {metrics.p50}ms | P99: {metrics.p99}ms</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Energi / Inferensi</span>
              <span className="text-xl font-bold font-mono text-purple-400">
                {metrics.energyMilliJoules} mJ
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Konsumsi daya edge</span>
            </div>
          </div>

          {/* Educational Callout */}
          <div className="p-3 rounded-lg border border-sky-800/60 bg-sky-950/30 text-xs flex gap-2 text-sky-200">
            {precision === 'int8' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" />
                <span>
                  <strong>Keunggulan Sweet-Spot INT8:</strong> Mengurangi kebutuhan bandwidth memori hingga $4\times$, menggeser bottleneck depthwise layer keluar dari keterbatasan memory-bound tanpa kehilangan akurasi!
                </span>
              </>
            ) : precision === 'int4' ? (
              <>
                <AlertOctagon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Peringatan Presisi Ekstrem (INT4):</strong> Meskipun menghemat memori hingga $8\times$, kuantisasi INT4 tanpa QAT memotong sinyal aktivasi dinamis dan menurunkan recall deteksi.
                </span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Full Precision Overhead:</strong> Representasi FP32 menyia-nyiakan bandwidth DRAM 25.6 GB/s untuk transfer 4 byte per bobot, membatasi throughput inferensi pada level 32 GFLOPS.
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  calculateFrameBufferFootprint,
  simulateWorkerOffloading,
} from '../../lib/systemsProcessing';
import { Globe, Video, Cpu, HardDrive, RefreshCw, Layers, ShieldCheck, AlertCircle } from 'lucide-react';

export const MultimediaWebAppsLab: React.FC = () => {
  const [resolutionKey, setResolutionKey] = useState<string>('1080p');
  const [fps, setFps] = useState<number>(60);
  const [executionMode, setExecutionMode] = useState<'main' | 'worker'>('worker');
  const [activeFilter, setActiveFilter] = useState<'normal' | 'grayscale' | 'edge' | 'threshold'>('normal');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const RESOLUTIONS: Record<string, { name: string; width: number; height: number }> = {
    '4k': { name: '4K UHD (2160p)', width: 3840, height: 2160 },
    '1080p': { name: 'Full HD (1080p)', width: 1920, height: 1080 },
    '720p': { name: 'HD Ready (720p)', width: 1280, height: 720 },
    'vga': { name: 'Standard VGA (480p)', width: 640, height: 480 },
    'qvga': { name: 'Mobile QVGA (240p)', width: 320, height: 240 },
  };

  const currentRes = RESOLUTIONS[resolutionKey];

  // Frame buffer metrics
  const bufferMetrics = useMemo(() => {
    return calculateFrameBufferFootprint(currentRes.width, currentRes.height, 4, fps);
  }, [currentRes, fps]);

  // Worker offload simulation
  const threadSim = useMemo(() => {
    // Processing time scales with pixel count
    const baseTimeMs = (currentRes.width * currentRes.height) / (640 * 480) * 4.0;
    const workerOverhead = 1.5;
    return simulateWorkerOffloading(baseTimeMs, baseTimeMs, workerOverhead);
  }, [currentRes]);

  // Canvas visual rendering of test pattern
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw procedural synthetic visual scene
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        let r = Math.sin(x * 0.05) * 127 + 128;
        let g = Math.cos(y * 0.05) * 127 + 128;
        let b = Math.sin((x + y) * 0.03) * 127 + 128;

        if (activeFilter === 'grayscale') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = g = b = gray;
        } else if (activeFilter === 'threshold') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          const val = gray > 128 ? 255 : 0;
          r = g = b = val;
        } else if (activeFilter === 'edge') {
          const edgeVal = (Math.abs(Math.sin(x * 0.1)) + Math.abs(Math.cos(y * 0.1))) * 127;
          r = g = b = edgeVal;
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Overlay mock tracking bounding box
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.25, h * 0.2, w * 0.5, h * 0.6);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText(`DETECT: PERSON 94% [${currentRes.width}x${currentRes.height}]`, w * 0.25, h * 0.16);
  }, [activeFilter, currentRes]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            Laboratorium Aplikasi Web Multimedia & API Browser (Bab 58)
          </h2>
          <p className="text-sm text-slate-400">
            Simulasi interaktif ekstraksi buffer kanvas HTML5 (Uint8ClampedArray), throughput bandwidth memori bus, isolasi Web Worker, dan privasi client-side.
          </p>
        </div>
        <button
          onClick={() => {
            setResolutionKey('1080p');
            setFps(60);
            setExecutionMode('worker');
            setActiveFilter('normal');
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
            <Video className="w-4 h-4 text-sky-400" /> Format Aliran Video & Profiling Canvas
          </h3>

          {/* Resolution Selector */}
          <div>
            <span className="text-xs text-slate-400 block mb-1.5 font-medium">Preset Resolusi Video</span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(RESOLUTIONS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setResolutionKey(key)}
                  className={`px-2.5 py-2 rounded text-xs font-medium border text-left transition ${
                    resolutionKey === key
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold">{val.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-500">{val.width}x{val.height}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target FPS Slider */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-400">Laju Frame Target (FPS)</span>
              <span className="text-sky-400 font-mono font-bold">{fps} FPS ({(1000 / fps).toFixed(1)} ms)</span>
            </div>
            <input
              type="range"
              min={15}
              max={60}
              step={15}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>15 FPS</span>
              <span>30 FPS</span>
              <span>60 FPS</span>
            </div>
          </div>

          {/* Thread Architecture Mode */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 block mb-1.5 font-medium">Model Thread Komputasi Browser</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExecutionMode('worker')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                  executionMode === 'worker'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-slate-200">Dedicated Web Worker</div>
                <div className="text-[10px] text-slate-400">Zero-copy ArrayBuffer transfer</div>
              </button>
              <button
                onClick={() => setExecutionMode('main')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                  executionMode === 'main'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-slate-200">Main UI Thread</div>
                <div className="text-[10px] text-slate-400">Rentan membekukan UI</div>
              </button>
            </div>
          </div>

          {/* Interactive Visual Filter Selector */}
          <div>
            <span className="text-xs text-slate-400 block mb-1.5 font-medium">Filter Komputasi Piksel 2D</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['normal', 'grayscale', 'edge', 'threshold'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium border capitalize transition ${
                    activeFilter === filter
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Canvas & Telemetry Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-sky-400" /> Memori / Frame
              </span>
              <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                {bufferMetrics.mbPerFrame.toFixed(2)} <span className="text-xs font-normal text-slate-400">MB</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{(bufferMetrics.bytesPerFrame / 1e6).toFixed(2)}M Bytes RGBA</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> Bandwidth Memori
              </span>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {bufferMetrics.megabytesPerSecond.toFixed(1)} <span className="text-xs font-normal text-slate-400">MB/s</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{bufferMetrics.megapixelsPerSecond.toFixed(1)} MP/detik</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> UI Thread Blokir
              </span>
              <div className={`text-xl font-bold font-mono mt-1 ${executionMode === 'worker' ? 'text-emerald-300' : 'text-rose-400'}`}>
                {executionMode === 'worker' ? `${threadSim.mainThreadBlockingMs.toFixed(1)} ms` : `${threadSim.totalLatencyMs.toFixed(1)} ms`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {executionMode === 'worker' ? 'UI 60 FPS Mulus' : 'UI Stutter / Drop'}
              </div>
            </div>
          </div>

          {/* Live Canvas Viewport */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Live Client-Side Canvas Stream (Resolusi: {currentRes.width}x{currentRes.height})
              </span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                100% In-Browser Privacy
              </span>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasRef}
                width={320}
                height={180}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-slate-950/80 border border-slate-800 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                FPS: {fps} | Modus: {executionMode.toUpperCase()} | Filter: {activeFilter}
              </div>
            </div>
          </div>

          {/* Thread Responsiveness Diagnostic Box */}
          <div className={`p-3.5 rounded-lg border text-xs ${
            executionMode === 'worker'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-semibold">
              {executionMode === 'worker' ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              {executionMode === 'worker'
                ? 'Arsitektur Web Worker Optimal: UI Thread Tidak Pernah Terblokir'
                : 'Peringatan: Komputasi Visi Memblokir Main Event Loop Browser'}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {executionMode === 'worker'
                ? `Data piksel citra dialihkan ke Web Worker secara zero-copy. Main thread hanya terbebani ${threadSim.mainThreadBlockingMs.toFixed(1)} ms, menjamin responsivitas navigasi dan bebas freeze.`
                : `Komputasi citra di Main Thread memakan ${threadSim.totalLatencyMs.toFixed(1)} ms (>16.67 ms batas 60 FPS), menyebabkan tombol menjadi lambat merespons dan animasi macet.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


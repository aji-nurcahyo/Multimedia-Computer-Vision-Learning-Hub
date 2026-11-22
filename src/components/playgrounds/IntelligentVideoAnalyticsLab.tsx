import React, { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { SharedVideoLabShell } from './SharedVideoLabShell';
import { useVideoLabSource } from './useVideoLabSource';
import {
  rgbaToGrayscale,
  applyTemporalAveraging,
  computeFrameDifference,
  createForegroundMask,
  morphologicalCleanMask,
  extractBoundingBoxes,
  SimpleMultiObjectTracker,
  detectLineCrossing,
  LineCrossingEvent,
} from '../../lib/videoProcessing';

export const IntelligentVideoAnalyticsLab: React.FC = () => {
  const [pipelineMode, setPipelineMode] = useState<'full' | 'raw' | 'mask'>('full');
  const [lineY, setLineY] = useState<number>(120);
  const [inCount, setInCount] = useState<number>(0);
  const [outCount, setOutCount] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgModelRef = useRef<Float32Array | null>(null);
  const trackerRef = useRef<SimpleMultiObjectTracker>(new SimpleMultiObjectTracker(50, 8));
  const eventsRef = useRef<LineCrossingEvent[]>([]);

  const {
    isPlaying,
    setIsPlaying,
    isCameraActive,
    errorMsg,
    currentFrameIdx,
    setCurrentFrameIdx,
    toggleCamera,
    handleFileUpload,
    defaultWidth,
    defaultHeight,
  } = useVideoLabSource({ defaultWidth: 400, defaultHeight: 240 });

  useEffect(() => {
    let animId: number;

    const executePipeline = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const t0 = performance.now();

      canvas.width = defaultWidth;
      canvas.height = defaultHeight;

      // 1. Scene simulation: Security parking gate with vehicles
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, defaultWidth, defaultHeight);

      // Virtual lane
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(80, 0, 240, defaultHeight);

      // Moving vehicles
      const t = currentFrameIdx;
      const v1Y = ((t * 2.2) % (defaultHeight + 60)) - 30;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(130, v1Y, 35, 25);

      const v2Y = defaultHeight - (((t * 1.7) % (defaultHeight + 60)) - 30);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(230, v2Y, 35, 25);

      // 2. Frame Extraction & Grayscale
      const imgData = ctx.getImageData(0, 0, defaultWidth, defaultHeight);
      const gray = rgbaToGrayscale(imgData);

      // 3. Motion Detection & Background Subtraction
      if (!bgModelRef.current || bgModelRef.current.length !== gray.length) {
        bgModelRef.current = new Float32Array(gray);
      } else {
        bgModelRef.current = applyTemporalAveraging(bgModelRef.current, gray, 0.04);
      }
      const diff = computeFrameDifference(bgModelRef.current, gray);
      const mask = createForegroundMask(diff, 28);
      const cleaned = morphologicalCleanMask(mask, defaultWidth, defaultHeight);

      // If user selected mask view
      if (pipelineMode === 'mask') {
        const maskImgData = ctx.createImageData(defaultWidth, defaultHeight);
        for (let i = 0; i < cleaned.length; i++) {
          const val = cleaned[i];
          const idx = i * 4;
          maskImgData.data[idx] = val;
          maskImgData.data[idx + 1] = val;
          maskImgData.data[idx + 2] = val;
          maskImgData.data[idx + 3] = 255;
        }
        ctx.putImageData(maskImgData, 0, 0);
      }

      // 4. Object Tracking
      const boxes = extractBoundingBoxes(cleaned, defaultWidth, defaultHeight, 50);
      const tracks = trackerRef.current.update(boxes);

      // 5. Virtual Tripwire Event Analysis
      if (pipelineMode === 'full') {
        // Draw Tripwire
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(80, lineY);
        ctx.lineTo(320, lineY);
        ctx.stroke();
        ctx.setLineDash([]);

        for (const tr of tracks) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.strokeRect(tr.bbox.x, tr.bbox.y, tr.bbox.width, tr.bbox.height);

          ctx.fillStyle = '#fff';
          ctx.font = '10px monospace';
          ctx.fillText(`Target #${tr.id}`, tr.bbox.x, Math.max(12, tr.bbox.y - 4));

          const event = detectLineCrossing(tr, lineY, t / 30);
          if (event) {
            eventsRef.current.push(event);
            if (event.direction === 'in') setInCount((c) => c + 1);
            else setOutCount((c) => c + 1);
          }
        }
      }

      const t1 = performance.now();
      setLatencyMs(t1 - t0);

      if (isPlaying) {
        setCurrentFrameIdx((prev) => prev + 1);
      }

      animId = requestAnimationFrame(executePipeline);
    };

    animId = requestAnimationFrame(executePipeline);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, pipelineMode, lineY, currentFrameIdx, setCurrentFrameIdx, defaultWidth, defaultHeight]);

  const handleExportProjectLog = () => {
    const header = 'Event ID,Timestamp,Direction\n';
    const rows = eventsRef.current
      .map((e, idx) => `${idx + 1},${e.timestampSec.toFixed(2)}s,${e.direction.toUpperCase()}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'capstone-analytics-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <SharedVideoLabShell
      title="Chapter 35: Applied Intelligent Video Analytics System Project"
      description="Integrasi arsitektur sistem analitik video cerdas menyeluruh (*End-to-End Applied Video Analytics*): Akuisisi $\rightarrow$ Preprocessing $\rightarrow$ Deteksi Gerak $\rightarrow$ Multi-Object Tracking $\rightarrow$ Line Crossing Counter $\rightarrow$ Evaluasi Sistem."
      isPlaying={isPlaying}
      isCameraActive={isCameraActive}
      errorMsg={errorMsg}
      onPlayToggle={() => setIsPlaying(!isPlaying)}
      onCameraToggle={toggleCamera}
      onFileUpload={handleFileUpload}
      canvasElement={
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Video Pipeline Analytics Feed</span>
            <span className="text-emerald-400 font-mono font-bold">
              KENDARAAN MASUK: {inCount} | KELUAR: {outCount}
            </span>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex justify-center p-2">
            <canvas ref={canvasRef} className="max-w-full h-auto block rounded" />
          </div>
        </div>
      }
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Lapisan Visualisasi Pipeline:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: 'full', label: 'Full Analytics' },
                { mode: 'mask', label: 'Foreground Mask' },
                { mode: 'raw', label: 'Raw Feed' },
              ].map((item) => (
                <button
                  key={item.mode}
                  onClick={() => setPipelineMode(item.mode as any)}
                  className={`py-1.5 px-2 rounded text-xs border transition ${
                    pipelineMode === item.mode
                      ? 'bg-primary-600 text-white border-primary-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Posisi Tripwire (Y-Line):</span>
              <span className="font-mono text-amber-400">{lineY} px</span>
            </div>
            <input
              type="range"
              min={50}
              max={190}
              step={5}
              value={lineY}
              onChange={(e) => setLineY(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleExportProjectLog}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              <Download className="w-4 h-4" /> Ekspor Laporan Analitik CSV
            </button>
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Latensi Komputasi Pipeline</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">{latencyMs.toFixed(1)} ms</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Throughput Real-Time</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {(1000 / Math.max(1, latencyMs)).toFixed(0)} FPS
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Status Perangkat Tepi</span>
            <span className="text-sm font-semibold font-mono text-purple-400">Edge Device Ready</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Total Arus Terpantau</span>
            <span className="text-sm font-semibold font-mono text-amber-400">{inCount + outCount} Kendaraan</span>
          </div>
        </>
      }
    />
  );
};

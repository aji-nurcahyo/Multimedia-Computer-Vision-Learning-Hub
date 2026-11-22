import React, { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { SharedVideoLabShell } from './SharedVideoLabShell';
import { useVideoLabSource } from './useVideoLabSource';
import {
  SimpleMultiObjectTracker,
  detectLineCrossing,
  LineCrossingEvent,
  BoundingBox,
} from '../../lib/videoProcessing';

export const VideoEventAnalysisLab: React.FC = () => {
  const [lineY, setLineY] = useState<number>(120);
  const [inCount, setInCount] = useState<number>(0);
  const [outCount, setOutCount] = useState<number>(0);
  const [events, setEvents] = useState<LineCrossingEvent[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<SimpleMultiObjectTracker>(new SimpleMultiObjectTracker(50, 10));

  const {
    isPlaying,
    setIsPlaying,
    isCameraActive,
    errorMsg,
    currentFrameIdx,
    setCurrentFrameIdx,
    defaultWidth,
    defaultHeight,
  } = useVideoLabSource({ defaultWidth: 400, defaultHeight: 240 });

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = defaultWidth;
      canvas.height = defaultHeight;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, defaultWidth, defaultHeight);

      // Virtual crossing tripwire line
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(defaultWidth, lineY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`Virtual Tripwire (y=${lineY})`, 10, lineY - 6);

      // Synthetic moving cars crossing line vertically
      const t = currentFrameIdx;
      const detections: BoundingBox[] = [];

      // Car 1 moving downwards (IN)
      const car1Y = ((t * 2) % (defaultHeight + 60)) - 30;
      detections.push({ x: defaultWidth * 0.3 - 15, y: car1Y - 15, width: 30, height: 30 });

      // Car 2 moving upwards (OUT)
      const car2Y = defaultHeight - (((t * 1.8) % (defaultHeight + 60)) - 30);
      detections.push({ x: defaultWidth * 0.7 - 15, y: car2Y - 15, width: 30, height: 30 });

      const tracks = trackerRef.current.update(detections);

      // Check line crossing for each track
      for (const tr of tracks) {
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(tr.bbox.x, tr.bbox.y, tr.bbox.width, tr.bbox.height);

        const event = detectLineCrossing(tr, lineY, t / 30);
        if (event) {
          setEvents((prev) => [event, ...prev.slice(0, 19)]);
          if (event.direction === 'in') setInCount((c) => c + 1);
          else setOutCount((c) => c + 1);
        }
      }

      if (isPlaying) {
        setCurrentFrameIdx((prev) => prev + 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, lineY, currentFrameIdx, setCurrentFrameIdx, defaultWidth, defaultHeight]);

  const handleExportCsv = () => {
    const header = 'Timestamp (s),Track ID,Direction,Crossing X,Crossing Y\n';
    const rows = events
      .map(
        (e) =>
          `${e.timestampSec.toFixed(2)},${e.trackId},${e.direction},${e.crossingPoint[0].toFixed(
            0
          )},${e.crossingPoint[1].toFixed(0)}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tripwire-events-log.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <SharedVideoLabShell
      title="Chapter 34: Video Event & Activity Analysis Lab"
      description="Analisis kejadian video berbasis aturan spasial-temporal: pendeteksian garis virtual (*Virtual Line Crossing / Tripwire*), penghitungan kendaraan masuk/keluar (*In/Out Counter*), pencatatan log peristiwa, dan ekspor data CSV."
      isPlaying={isPlaying}
      isCameraActive={isCameraActive}
      errorMsg={errorMsg}
      onPlayToggle={() => setIsPlaying(!isPlaying)}
      canvasElement={
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Tripwire Line Crossing Monitor</span>
            <span className="text-amber-400 font-mono font-bold">
              MASUK (IN): {inCount} | KELUAR (OUT): {outCount}
            </span>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex justify-center p-2">
            <canvas ref={canvasRef} className="max-w-full h-auto block rounded" />
          </div>
        </div>
      }
      controlsChildren={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 w-full sm:w-2/3">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Posisi Garis Virtual (Y-Line):</span>
              <span className="font-mono text-amber-400">{lineY} px</span>
            </div>
            <input
              type="range"
              min={40}
              max={200}
              step={5}
              value={lineY}
              onChange={(e) => setLineY(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" /> Ekspor Log CSV
          </button>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Total Arus Masuk</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">{inCount} Unit</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Total Arus Keluar</span>
            <span className="text-sm font-semibold font-mono text-sky-400">{outCount} Unit</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Net Saldo di Dalam</span>
            <span className="text-sm font-semibold font-mono text-amber-400">{inCount - outCount} Unit</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Peristiwa Tercatat</span>
            <span className="text-sm font-semibold font-mono text-purple-400">{events.length} Catatan</span>
          </div>
        </>
      }
    />
  );
};

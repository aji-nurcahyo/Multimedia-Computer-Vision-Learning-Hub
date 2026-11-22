import React, { useState, useEffect, useRef } from 'react';
import { SharedVideoLabShell } from './SharedVideoLabShell';
import { useVideoLabSource } from './useVideoLabSource';
import { SimpleMultiObjectTracker, BoundingBox } from '../../lib/videoProcessing';

export const MultiObjectTrackingLab: React.FC = () => {
  const [numTargets, setNumTargets] = useState<number>(3);
  const [maxDist, setMaxDist] = useState<number>(50);

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
    trackerRef.current = new SimpleMultiObjectTracker(maxDist, 10);
  }, [maxDist]);

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

      // Generate synthetic multiple moving targets with varying paths
      const t = currentFrameIdx;
      const detections: BoundingBox[] = [];

      for (let i = 0; i < numTargets; i++) {
        const speed = 0.03 + i * 0.015;
        const phase = (i * Math.PI * 2) / numTargets;
        const cx = (Math.sin(t * speed + phase) * 0.38 + 0.5) * defaultWidth;
        const cy = (Math.cos(t * speed * 1.2 + phase) * 0.35 + 0.5) * defaultHeight;
        detections.push({
          x: cx - 15,
          y: cy - 15,
          width: 30,
          height: 30,
        });
      }

      // Update multi-object tracker
      const activeTracks = trackerRef.current.update(detections);

      // Render trajectories and bounding boxes
      for (const tr of activeTracks) {
        // Unique color based on track ID
        const colors = ['#38bdf8', '#34d399', '#fbbf24', '#f43f5e', '#a855f7'];
        const col = colors[(tr.id - 1) % colors.length];

        // Trajectory line
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let j = 0; j < tr.trajectory.length; j++) {
          const pt = tr.trajectory[j];
          if (j === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        }
        ctx.stroke();

        // Bounding box & ID Tag
        ctx.strokeRect(tr.bbox.x, tr.bbox.y, tr.bbox.width, tr.bbox.height);
        ctx.fillStyle = col;
        ctx.font = '11px monospace';
        ctx.fillText(`ID #${tr.id}`, tr.bbox.x, Math.max(12, tr.bbox.y - 4));
      }

      if (isPlaying) {
        setCurrentFrameIdx((prev) => prev + 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, numTargets, currentFrameIdx, setCurrentFrameIdx, defaultWidth, defaultHeight]);

  return (
    <SharedVideoLabShell
      title="Chapter 33: Multi-Object Tracking (MOT) Lab"
      description="Pelacakan multi-objek simultan (*Tracking-by-Detection*): kontinuitas identitas (*Track ID*), asosiasi data berbasis jarak Euclidean (konsep SORT / Hungarian Algorithm), serta pencegahan *ID Switches* saat oklusi."
      isPlaying={isPlaying}
      isCameraActive={isCameraActive}
      errorMsg={errorMsg}
      onPlayToggle={() => setIsPlaying(!isPlaying)}
      canvasElement={
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Multi-Object Tracking View ({defaultWidth}x{defaultHeight})</span>
            <span className="text-emerald-400 font-mono">
              {trackerRef.current.tracks.length} Objek Aktif Terlacak
            </span>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex justify-center p-2">
            <canvas ref={canvasRef} className="max-w-full h-auto block rounded" />
          </div>
        </div>
      }
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Jumlah Target Bergerak:</span>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setNumTargets(count)}
                  className={`py-1.5 px-2 rounded text-xs border transition ${
                    numTargets === count
                      ? 'bg-primary-600 text-white border-primary-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {count} Objek
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Ambang Batas Asosiasi Jarak:</span>
              <span className="font-mono text-primary-400">{maxDist} px</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={maxDist}
              onChange={(e) => setMaxDist(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Metode Asosiasi</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">Centroid / Hungarian</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Stabilitas Track ID</span>
            <span className="text-sm font-semibold font-mono text-sky-400">Tinggi (Zero Overlap)</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Metrik Evaluasi Global</span>
            <span className="text-sm font-semibold font-mono text-purple-400">MOTA / MOTP / IDF1</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Toleransi Kehilangan Jejak</span>
            <span className="text-sm font-semibold font-mono text-amber-400">10 Frame Timeout</span>
          </div>
        </>
      }
    />
  );
};


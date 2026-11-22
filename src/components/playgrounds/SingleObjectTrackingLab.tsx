import React, { useState, useEffect, useRef } from 'react';
import { SharedVideoLabShell } from './SharedVideoLabShell';
import { useVideoLabSource } from './useVideoLabSource';
import { KalmanFilter2D } from '../../lib/videoProcessing';

export const SingleObjectTrackingLab: React.FC = () => {
  const [measNoise, setMeasNoise] = useState<number>(10);
  const [processNoise, setProcessNoise] = useState<number>(0.8);
  const [historyLength, setHistoryLength] = useState<number>(35);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const kfRef = useRef<KalmanFilter2D>(new KalmanFilter2D(50, 100, 0.8, 10));
  const trajectoryTrueRef = useRef<Array<[number, number]>>([]);
  const trajectoryMeasRef = useRef<Array<[number, number]>>([]);
  const trajectoryEstRef = useRef<Array<[number, number]>>([]);

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
    // Re-init Kalman filter on noise parameter change
    kfRef.current = new KalmanFilter2D(50, 100, processNoise, measNoise);
  }, [processNoise, measNoise]);

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

      // Grid background
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < defaultWidth; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, defaultHeight);
        ctx.stroke();
      }
      for (let y = 0; y < defaultHeight; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(defaultWidth, y);
        ctx.stroke();
      }

      // 1. Calculate true ground truth physics trajectory
      const t = currentFrameIdx;
      const trueX = (Math.sin(t * 0.04) * 0.4 + 0.5) * defaultWidth;
      const trueY = (Math.cos(t * 0.03) * 0.35 + 0.5) * defaultHeight;

      // 2. Add random measurement sensor noise
      const measX = trueX + (Math.random() * 2 - 1) * measNoise;
      const measY = trueY + (Math.random() * 2 - 1) * measNoise;

      // 3. Kalman Filter Step: Predict & Update
      kfRef.current.predict(1.0);
      const [estX, estY] = kfRef.current.update(measX, measY);

      if (isPlaying) {
        trajectoryTrueRef.current.push([trueX, trueY]);
        trajectoryMeasRef.current.push([measX, measY]);
        trajectoryEstRef.current.push([estX, estY]);

        if (trajectoryTrueRef.current.length > historyLength) {
          trajectoryTrueRef.current.shift();
          trajectoryMeasRef.current.shift();
          trajectoryEstRef.current.shift();
        }
        setCurrentFrameIdx((prev) => prev + 1);
      }

      // 4. Draw Trajectories
      // Meas trail (dots)
      ctx.fillStyle = '#f43f5e';
      for (const p of trajectoryMeasRef.current) {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Ground truth path (cyan line)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < trajectoryTrueRef.current.length; i++) {
        const p = trajectoryTrueRef.current[i];
        if (i === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();

      // Kalman estimated path (emerald line)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < trajectoryEstRef.current.length; i++) {
        const p = trajectoryEstRef.current[i];
        if (i === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();

      // Current object targets
      // True position
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(trueX, trueY, 7, 0, 2 * Math.PI);
      ctx.fill();

      // Kalman estimated position
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(estX - 12, estY - 12, 24, 24);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, measNoise, processNoise, historyLength, currentFrameIdx, setCurrentFrameIdx, defaultWidth, defaultHeight]);

  return (
    <SharedVideoLabShell
      title="Chapter 32: Single Object Tracking Lab"
      description="Pelacakan objek tunggal berbasis estimasi status Kalman Filter: reduksi derau sensor pengukuran, prediksi lintasan (trajectory prediction), estimasi kecepatan gerak, dan komparasi posisi ground-truth vs estimasi."
      isPlaying={isPlaying}
      isCameraActive={isCameraActive}
      errorMsg={errorMsg}
      onPlayToggle={() => setIsPlaying(!isPlaying)}
      canvasElement={
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Visualisasi Lintasan Pelacakan Kalman Filter</span>
            <span className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-sky-400">● Ground Truth</span>
              <span className="text-rose-400">● Measurement (Sensor)</span>
              <span className="text-emerald-400">■ Kalman Estimate</span>
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
            <div className="flex justify-between text-xs text-slate-300">
              <span>Derau Pengukuran Sensor ($R$):</span>
              <span className="font-mono text-rose-400">±{measNoise} px</span>
            </div>
            <input
              type="range"
              min={2}
              max={30}
              step={2}
              value={measNoise}
              onChange={(e) => setMeasNoise(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Derau Model Proses ($Q$):</span>
              <span className="font-mono text-primary-400">{processNoise.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={4.0}
              step={0.1}
              value={processNoise}
              onChange={(e) => setProcessNoise(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Panjang Riwayat Jejak:</span>
              <span className="font-mono text-primary-400">{historyLength} frame</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={historyLength}
              onChange={(e) => setHistoryLength(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Vektor Status ($x_k$)</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">[x, y, v_x, v_y]ᵀ</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Peran Kalman Gain ($K$)</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {measNoise > 15 ? 'Bobot Model Dominan (Low K)' : 'Bobot Sensor Dominan (High K)'}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Kompensasi Keterlambatan</span>
            <span className="text-sm font-semibold font-mono text-purple-400">Prediksi Orde-1 (\Delta t=1)</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Status Pelacakan</span>
            <span className="text-sm font-semibold font-mono text-amber-400">Terkunci (Tracking Locked)</span>
          </div>
        </>
      }
    />
  );
};


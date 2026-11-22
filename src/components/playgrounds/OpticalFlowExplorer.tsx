import React, { useState, useEffect, useRef } from 'react';
import { SharedVideoLabShell } from './SharedVideoLabShell';
import { useVideoLabSource } from './useVideoLabSource';
import {
  rgbaToGrayscale,
  computeLucasKanadeOpticalFlow,
  FlowVector,
} from '../../lib/videoProcessing';

export const OpticalFlowExplorer: React.FC = () => {
  const [gridStep, setGridStep] = useState<number>(14);
  const [windowSize, setWindowSize] = useState<number>(7);
  const [flowCount, setFlowCount] = useState<number>(0);
  const [avgSpeed, setAvgSpeed] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevGrayRef = useRef<Float32Array | null>(null);

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
  } = useVideoLabSource({ defaultWidth: 320, defaultHeight: 240 });

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = defaultWidth;
      canvas.height = defaultHeight;

      // 1. Draw base dark background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, defaultWidth, defaultHeight);

      // 2. Animated moving geometric targets
      const t = currentFrameIdx;
      // Object 1 moving horizontally
      const obj1X = (Math.sin(t * 0.05) * 0.35 + 0.5) * defaultWidth;
      const obj1Y = 70;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(obj1X - 20, obj1Y - 20, 40, 40);

      // Object 2 moving diagonally
      const obj2X = ((t * 2) % (defaultWidth + 40)) - 20;
      const obj2Y = ((t * 1.5) % (defaultHeight + 40)) - 20;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(obj2X, obj2Y, 22, 0, 2 * Math.PI);
      ctx.fill();

      // 3. Extract current grayscale frame
      const currImgData = ctx.getImageData(0, 0, defaultWidth, defaultHeight);
      const currGray = rgbaToGrayscale(currImgData);

      // 4. Compute Lucas-Kanade Optical Flow if prev frame exists
      let vectors: FlowVector[] = [];
      if (prevGrayRef.current && prevGrayRef.current.length === currGray.length) {
        vectors = computeLucasKanadeOpticalFlow(
          prevGrayRef.current,
          currGray,
          defaultWidth,
          defaultHeight,
          gridStep,
          windowSize
        );
      }
      prevGrayRef.current = currGray;

      // 5. Draw Optical Flow vectors on top
      ctx.lineWidth = 1.5;
      for (const f of vectors) {
        ctx.strokeStyle = '#38bdf8'; // sky-400
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x + f.u * 3, f.y + f.v * 3);
        ctx.stroke();

        // Tip dot
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(f.x + f.u * 3 - 1.5, f.y + f.v * 3 - 1.5, 3, 3);
      }

      setFlowCount(vectors.length);
      if (vectors.length > 0) {
        const totalMag = vectors.reduce((acc, v) => acc + v.magnitude, 0);
        setAvgSpeed(totalMag / vectors.length);
      } else {
        setAvgSpeed(0);
      }

      if (isPlaying) {
        setCurrentFrameIdx((prev) => prev + 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, gridStep, windowSize, currentFrameIdx, setCurrentFrameIdx, defaultWidth, defaultHeight]);

  return (
    <SharedVideoLabShell
      title="Chapter 30: Motion Estimation & Optical Flow Explorer"
      description="Estimasi vektor gerak piksel sekuens video menggunakan algoritma Lucas-Kanade (LK), penyelesaian Optical Flow Constraint Equation melalui matriks struktur gradien lokal, dan visualisasi vektor medan gerak."
      isPlaying={isPlaying}
      isCameraActive={isCameraActive}
      errorMsg={errorMsg}
      onPlayToggle={() => setIsPlaying(!isPlaying)}
      onCameraToggle={toggleCamera}
      onFileUpload={handleFileUpload}
      canvasElement={
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Optical Flow Motion Vectors Display</span>
            <span className="text-sky-400 font-mono">
              {flowCount} Vektor Aktif | Kecepatan Rerata: {avgSpeed.toFixed(1)} px/frame
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
            <div className="flex justify-between text-xs text-slate-300">
              <span>Kerapatan Kisi Vektor (Grid Step):</span>
              <span className="font-mono text-primary-400">{gridStep} px</span>
            </div>
            <input
              type="range"
              min={8}
              max={24}
              step={2}
              value={gridStep}
              onChange={(e) => setGridStep(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Ukuran Jendela Spasial (Window Size):</span>
              <span className="font-mono text-primary-400">{windowSize}x{windowSize} px</span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              step={2}
              value={windowSize}
              onChange={(e) => setWindowSize(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Metode Implementasi</span>
            <span className="text-sm font-semibold font-mono text-sky-400">Lucas-Kanade 2x2 LSE</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Vektor Medan Gerak</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">{flowCount} Titik</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Asumsi Fundamental</span>
            <span className="text-sm font-semibold font-mono text-amber-400">Brightness Constancy</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Batasan Aperture Problem</span>
            <span className="text-sm font-semibold font-mono text-rose-400">Gerak Sepanjang Tepi Homogen</span>
          </div>
        </>
      }
    />
  );
};


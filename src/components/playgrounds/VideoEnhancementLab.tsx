import React, { useState, useEffect, useRef } from 'react';
import { SharedVideoLabShell } from './SharedVideoLabShell';
import { useVideoLabSource } from './useVideoLabSource';
import {
  rgbaToGrayscale,
  grayscaleToImageData,
  applyTemporalAveraging,
  calculateFramePsnr,
} from '../../lib/videoProcessing';

export const VideoEnhancementLab: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'none' | 'temporal-avg'>('temporal-avg');
  const [alpha, setAlpha] = useState<number>(0.2);
  const [noiseLevel, setNoiseLevel] = useState<number>(30);
  const [psnrDb, setPsnrDb] = useState<number>(0);

  const rawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const filteredCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgModelRef = useRef<Float32Array | null>(null);

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
  } = useVideoLabSource({ defaultWidth: 300, defaultHeight: 200 });

  useEffect(() => {
    let animId: number;

    const render = () => {
      const rawC = rawCanvasRef.current;
      const filtC = filteredCanvasRef.current;
      if (!rawC || !filtC) return;
      const rawCtx = rawC.getContext('2d');
      const filtCtx = filtC.getContext('2d');
      if (!rawCtx || !filtCtx) return;

      rawC.width = defaultWidth;
      rawC.height = defaultHeight;
      filtC.width = defaultWidth;
      filtC.height = defaultHeight;

      // 1. Render clean synthetic frame
      rawCtx.fillStyle = '#0f172a';
      rawCtx.fillRect(0, 0, defaultWidth, defaultHeight);

      const t = currentFrameIdx;
      const x = (Math.sin(t * 0.04) * 0.35 + 0.5) * defaultWidth;
      rawCtx.fillStyle = '#f59e0b';
      rawCtx.beginPath();
      rawCtx.arc(x, defaultHeight / 2, 28, 0, 2 * Math.PI);
      rawCtx.fill();

      // Clean frame data
      const cleanImgData = rawCtx.getImageData(0, 0, defaultWidth, defaultHeight);
      const cleanGray = rgbaToGrayscale(cleanImgData);

      // 2. Inject additive Gaussian-like noise to raw view
      const noisyImgData = rawCtx.createImageData(defaultWidth, defaultHeight);
      const noisyGray = new Float32Array(cleanGray.length);

      for (let i = 0; i < cleanGray.length; i++) {
        const noise = (Math.random() * 2 - 1) * noiseLevel;
        noisyGray[i] = Math.max(0, Math.min(255, cleanGray[i] + noise));
      }
      grayscaleToImageData(noisyGray, defaultWidth, defaultHeight, noisyImgData);
      rawCtx.putImageData(noisyImgData, 0, 0);

      // 3. Apply Temporal Averaging Filter
      let processedGray = noisyGray;
      if (filterMode === 'temporal-avg') {
        if (!bgModelRef.current || bgModelRef.current.length !== noisyGray.length) {
          bgModelRef.current = new Float32Array(noisyGray);
        } else {
          bgModelRef.current = applyTemporalAveraging(bgModelRef.current, noisyGray, alpha);
        }
        processedGray = bgModelRef.current;
      }

      const outImgData = filtCtx.createImageData(defaultWidth, defaultHeight);
      grayscaleToImageData(processedGray, defaultWidth, defaultHeight, outImgData);
      filtCtx.putImageData(outImgData, 0, 0);

      // Compute PSNR of filtered frame vs clean ground truth
      const score = calculateFramePsnr(cleanGray, processedGray);
      setPsnrDb(score);

      if (isPlaying) {
        setCurrentFrameIdx((prev) => prev + 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, filterMode, alpha, noiseLevel, currentFrameIdx, setCurrentFrameIdx, defaultWidth, defaultHeight]);

  return (
    <SharedVideoLabShell
      title="Chapter 29: Video Enhancement & Temporal Filtering Lab"
      description="Peredaman derau sekuens video menggunakan penapis temporal (running average), komparasi frame sebelum vs sesudah filter, evaluasi PSNR, serta analisis timbulnya artifak bayangan (ghosting effect)."
      isPlaying={isPlaying}
      isCameraActive={isCameraActive}
      errorMsg={errorMsg}
      onPlayToggle={() => setIsPlaying(!isPlaying)}
      onCameraToggle={toggleCamera}
      onFileUpload={handleFileUpload}
      canvasElement={
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-rose-400 font-medium">Input Video + Derau (+{noiseLevel})</span>
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-1 flex justify-center">
              <canvas ref={rawCanvasRef} className="max-w-full h-auto block rounded" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-emerald-400 font-medium">Hasil Filter Temporal (Alpha={alpha.toFixed(2)})</span>
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-1 flex justify-center">
              <canvas ref={filteredCanvasRef} className="max-w-full h-auto block rounded" />
            </div>
          </div>
        </div>
      }
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Metode Penapis:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterMode('temporal-avg')}
                className={`flex-1 py-1.5 rounded text-xs border transition ${
                  filterMode === 'temporal-avg'
                    ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Temporal Average
              </button>
              <button
                onClick={() => setFilterMode('none')}
                className={`flex-1 py-1.5 rounded text-xs border transition ${
                  filterMode === 'none'
                    ? 'bg-primary-600 text-white border-primary-500 font-semibold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Tanpa Filter
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Kecepatan Adaptasi ($\alpha$):</span>
              <span className="font-mono text-primary-400">{alpha.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.8}
              step={0.05}
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Tingkat Derau (Noise):</span>
              <span className="font-mono text-rose-400">+{noiseLevel}</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Kualitas Objektif PSNR</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">{psnrDb.toFixed(1)} dB</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Efek Artifak Ghosting</span>
            <span className="text-sm font-semibold font-mono text-amber-400">
              {alpha < 0.15 ? 'Signifikan (Objek Cepat)' : alpha < 0.4 ? 'Moderat' : 'Minimal'}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Reduksi Derau Statis</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {filterMode === 'temporal-avg' ? `~${Math.round((1 - alpha) * 100)}% Ditekan` : '0%'}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Kompleksitas Komputasi</span>
            <span className="text-sm font-semibold font-mono text-purple-400">O(W x H) Linear Time</span>
          </div>
        </>
      }
    />
  );
};


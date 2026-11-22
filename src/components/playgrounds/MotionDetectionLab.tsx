import React, { useState, useEffect, useRef } from 'react';
import { SharedVideoLabShell } from './SharedVideoLabShell';
import { useVideoLabSource } from './useVideoLabSource';
import {
  rgbaToGrayscale,
  applyTemporalAveraging,
  computeFrameDifference,
  createForegroundMask,
  morphologicalCleanMask,
  extractBoundingBoxes,
  BoundingBox,
} from '../../lib/videoProcessing';

export const MotionDetectionLab: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(30);
  const [learningRate, setLearningRate] = useState<number>(0.05);
  const [detectedBoxes, setDetectedBoxes] = useState<BoundingBox[]>([]);

  const rawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
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
  } = useVideoLabSource({ defaultWidth: 320, defaultHeight: 240 });

  useEffect(() => {
    let animId: number;

    const render = () => {
      const rawC = rawCanvasRef.current;
      const maskC = maskCanvasRef.current;
      if (!rawC || !maskC) return;
      const rawCtx = rawC.getContext('2d');
      const maskCtx = maskC.getContext('2d');
      if (!rawCtx || !maskCtx) return;

      rawC.width = defaultWidth;
      rawC.height = defaultHeight;
      maskC.width = defaultWidth;
      maskC.height = defaultHeight;

      // 1. Draw synthetic scene (static background + moving car/object)
      rawCtx.fillStyle = '#1e293b';
      rawCtx.fillRect(0, 0, defaultWidth, defaultHeight);

      // Road background line
      rawCtx.fillStyle = '#334155';
      rawCtx.fillRect(0, 110, defaultWidth, 60);

      // Moving object
      const t = currentFrameIdx;
      const objX = ((t * 2.5) % (defaultWidth + 80)) - 40;
      const objY = 120;
      rawCtx.fillStyle = '#38bdf8';
      rawCtx.fillRect(objX, objY, 40, 25);

      // 2. Grayscale extraction
      const imgData = rawCtx.getImageData(0, 0, defaultWidth, defaultHeight);
      const gray = rgbaToGrayscale(imgData);

      // 3. Running average background model update
      if (!bgModelRef.current || bgModelRef.current.length !== gray.length) {
        bgModelRef.current = new Float32Array(gray);
      } else {
        bgModelRef.current = applyTemporalAveraging(bgModelRef.current, gray, learningRate);
      }

      // 4. Foreground difference & mask
      const diff = computeFrameDifference(bgModelRef.current, gray);
      const mask = createForegroundMask(diff, threshold);
      const cleanedMask = morphologicalCleanMask(mask, defaultWidth, defaultHeight);

      // Draw mask to maskCanvas
      const maskImgData = maskCtx.createImageData(defaultWidth, defaultHeight);
      for (let i = 0; i < cleanedMask.length; i++) {
        const val = cleanedMask[i];
        const idx = i * 4;
        maskImgData.data[idx] = val;
        maskImgData.data[idx + 1] = val;
        maskImgData.data[idx + 2] = val;
        maskImgData.data[idx + 3] = 255;
      }
      maskCtx.putImageData(maskImgData, 0, 0);

      // 5. Extract bounding boxes & draw on raw canvas
      const boxes = extractBoundingBoxes(cleanedMask, defaultWidth, defaultHeight, 50);
      setDetectedBoxes(boxes);

      rawCtx.strokeStyle = '#10b981';
      rawCtx.lineWidth = 2;
      for (const b of boxes) {
        rawCtx.strokeRect(b.x, b.y, b.width, b.height);
        rawCtx.font = '10px monospace';
        rawCtx.fillStyle = '#10b981';
        rawCtx.fillText(`Moving Object (${b.width}x${b.height})`, b.x, Math.max(12, b.y - 4));
      }

      if (isPlaying) {
        setCurrentFrameIdx((prev) => prev + 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, threshold, learningRate, currentFrameIdx, setCurrentFrameIdx, defaultWidth, defaultHeight]);

  return (
    <SharedVideoLabShell
      title="Chapter 31: Background Subtraction & Motion Detection Lab"
      description="Segmentasi objek bergerak melalui pemodelan latar belakang dinamis (running average background model), pembangkitan masker biner foreground, pembersihan morfologi, dan ekstraksi bounding box."
      isPlaying={isPlaying}
      isCameraActive={isCameraActive}
      errorMsg={errorMsg}
      onPlayToggle={() => setIsPlaying(!isPlaying)}
      onCameraToggle={toggleCamera}
      onFileUpload={handleFileUpload}
      canvasElement={
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-emerald-400 font-medium">Deteksi Objek Bergerak (Bounding Box)</span>
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-1 flex justify-center">
              <canvas ref={rawCanvasRef} className="max-w-full h-auto block rounded" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-sky-400 font-medium">Masker Biner Foreground (Morfologi Cleaned)</span>
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-1 flex justify-center">
              <canvas ref={maskCanvasRef} className="max-w-full h-auto block rounded" />
            </div>
          </div>
        </div>
      }
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Ambang Batas Sensitivitas (Threshold):</span>
              <span className="font-mono text-primary-400">{threshold}</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Laju Adaptasi Background ($\alpha$):</span>
              <span className="font-mono text-primary-400">{learningRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.2}
              step={0.01}
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Objek Terdeteksi</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">{detectedBoxes.length} Region</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Area Gerak Aktif</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {detectedBoxes.reduce((acc, b) => acc + b.width * b.height, 0)} px²
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Pembersihan Noise</span>
            <span className="text-sm font-semibold font-mono text-purple-400">Opening 3x3 (Erode + Dilate)</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Komputasi Background</span>
            <span className="text-sm font-semibold font-mono text-amber-400">Running Temporal Average</span>
          </div>
        </>
      }
    />
  );
};


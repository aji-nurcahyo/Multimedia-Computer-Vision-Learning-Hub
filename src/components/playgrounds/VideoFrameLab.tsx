import React, { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { SharedVideoLabShell } from './SharedVideoLabShell';
import { useVideoLabSource } from './useVideoLabSource';
import { rgbaToGrayscale, grayscaleToImageData } from '../../lib/videoProcessing';

export const VideoFrameLab: React.FC = () => {
  const [colorMode, setColorMode] = useState<'rgb' | 'grayscale'>('rgb');
  const [procLatencyMs, setProcLatencyMs] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    isPlaying,
    setIsPlaying,
    isCameraActive,
    errorMsg,
    currentFrameIdx,
    setCurrentFrameIdx,
    videoElementRef,
    handleFileUpload,
    toggleCamera,
    defaultWidth,
    defaultHeight,
  } = useVideoLabSource({ defaultWidth: 320, defaultHeight: 240 });

  // Extraction loop
  useEffect(() => {
    let animId: number;

    const processFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const t0 = performance.now();

      canvas.width = defaultWidth;
      canvas.height = defaultHeight;

      if (isCameraActive && videoElementRef.current) {
        ctx.drawImage(videoElementRef.current, 0, 0, defaultWidth, defaultHeight);
      } else {
        // Synthetic animated frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, defaultWidth, defaultHeight);

        // Moving shapes
        const t = currentFrameIdx;
        const x = (Math.sin(t * 0.05) * 0.35 + 0.5) * defaultWidth;
        const y = (Math.cos(t * 0.05) * 0.35 + 0.5) * defaultHeight;

        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(x - 20, y - 20, 40, 40);

        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.arc(defaultWidth - x, defaultHeight - y, 22, 0, 2 * Math.PI);
        ctx.fill();

        ctx.font = '11px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Frame #${currentFrameIdx}`, 10, 20);
      }

      // Convert to Grayscale if enabled
      if (colorMode === 'grayscale') {
        const imgData = ctx.getImageData(0, 0, defaultWidth, defaultHeight);
        const gray = rgbaToGrayscale(imgData);
        grayscaleToImageData(gray, defaultWidth, defaultHeight, imgData);
        ctx.putImageData(imgData, 0, 0);
      }

      const t1 = performance.now();
      setProcLatencyMs(t1 - t0);

      if (isPlaying) {
        setCurrentFrameIdx((prev) => prev + 1);
      }

      animId = requestAnimationFrame(processFrame);
    };

    animId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isCameraActive, colorMode, currentFrameIdx, setCurrentFrameIdx, defaultWidth, defaultHeight, videoElementRef]);

  // Export current frame as PNG
  const handleExportFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `frame-${currentFrameIdx}-${colorMode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <SharedVideoLabShell
      title="Chapter 27: Video Acquisition & Frame Lab"
      description="Akuisisi sekuens video dan frame buffering dari webcam atau generator sintetis, konversi color space frame per frame (RGB vs Grayscale), navigasi temporal, dan ekspor snapshot frame."
      isPlaying={isPlaying}
      isCameraActive={isCameraActive}
      errorMsg={errorMsg}
      onPlayToggle={() => setIsPlaying(!isPlaying)}
      onCameraToggle={toggleCamera}
      onFileUpload={handleFileUpload}
      canvasElement={
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Video Buffer Display ({defaultWidth}x{defaultHeight})</span>
            <span>Frame: #{currentFrameIdx} | Mode: {colorMode.toUpperCase()}</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
            <canvas ref={canvasRef} className="max-w-full h-auto block rounded" />
            <video ref={videoElementRef} playsInline muted className="hidden" />
          </div>
        </div>
      }
      controlsChildren={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">Format Warna Frame:</span>
            <button
              onClick={() => setColorMode('rgb')}
              className={`px-3 py-1.5 rounded text-xs border transition ${
                colorMode === 'rgb'
                  ? 'bg-primary-600 text-white border-primary-500 font-semibold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              RGB Warna
            </button>
            <button
              onClick={() => setColorMode('grayscale')}
              className={`px-3 py-1.5 rounded text-xs border transition ${
                colorMode === 'grayscale'
                  ? 'bg-primary-600 text-white border-primary-500 font-semibold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Grayscale (BT.601)
            </button>
          </div>

          <button
            onClick={handleExportFrame}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" /> Ekspor Snapshot PNG
          </button>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Waktu Proses Frame</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">
              {procLatencyMs.toFixed(2)} ms
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Throughput Maksimum</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {(1000 / Math.max(1, procLatencyMs)).toFixed(0)} FPS
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Ukuran Buffer Memori</span>
            <span className="text-sm font-semibold font-mono text-purple-400">
              {((defaultWidth * defaultHeight * (colorMode === 'rgb' ? 4 : 1)) / 1024).toFixed(0)} kB
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Status Akuisisi</span>
            <span className="text-sm font-semibold font-mono text-amber-400">
              {isCameraActive ? 'Webcam Live Stream' : isPlaying ? 'Synthetic Active' : 'Paused'}
            </span>
          </div>
        </>
      }
    />
  );
};


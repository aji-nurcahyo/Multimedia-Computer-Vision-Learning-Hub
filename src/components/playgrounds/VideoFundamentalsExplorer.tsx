import React, { useState, useEffect, useRef } from 'react';
import { SharedVideoLabShell } from './SharedVideoLabShell';
import { useVideoLabSource } from './useVideoLabSource';

export const VideoFundamentalsExplorer: React.FC = () => {
  const [resolution, setResolution] = useState<{ w: number; h: number }>({ w: 480, h: 270 });
  const [colorFormat, setColorFormat] = useState<'4:4:4' | '4:2:2' | '4:2:0'>('4:2:0');
  const [targetFps, setTargetFps] = useState<number>(30);
  const [bitDepth, setBitDepth] = useState<number>(8);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    isPlaying,
    setIsPlaying,
    isCameraActive,
    errorMsg,
    videoUrl,
    currentFrameIdx,
    setCurrentFrameIdx,
    handleFileUpload,
    toggleCamera,
  } = useVideoLabSource({ defaultWidth: resolution.w, defaultHeight: resolution.h });

  // Animate synthetic moving bars on canvas
  useEffect(() => {
    let animId: number;
    let t = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { w, h } = resolution;
      canvas.width = w;
      canvas.height = h;

      // Background gradient
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Moving bar
      const barX = (Math.sin(t * 0.05) * 0.4 + 0.5) * w;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(barX - 25, 20, 50, h - 40);

      // Moving ball
      const ballY = (Math.cos(t * 0.08) * 0.35 + 0.5) * h;
      ctx.beginPath();
      ctx.arc(w * 0.75, ballY, 20, 0, 2 * Math.PI);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      // Timecode
      ctx.font = '12px monospace';
      ctx.fillStyle = '#f8fafc';
      const sec = Math.floor(t / targetFps);
      const frames = t % targetFps;
      ctx.fillText(
        `TC 00:00:${String(sec).padStart(2, '0')}:${String(frames).padStart(2, '0')}`,
        15,
        25
      );

      if (isPlaying) {
        t++;
        setCurrentFrameIdx(t);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, resolution, targetFps, setCurrentFrameIdx]);

  // Raw uncompressed bitrate calculation
  // 4:4:4 = 3 bytes/pixel (at 8-bit), 4:2:2 = 2 bytes, 4:2:0 = 1.5 bytes
  const bytesPerPixel =
    colorFormat === '4:4:4'
      ? (bitDepth * 3) / 8
      : colorFormat === '4:2:2'
      ? (bitDepth * 2) / 8
      : (bitDepth * 1.5) / 8;

  const rawBitrateMbps = (
    (resolution.w * resolution.h * bytesPerPixel * 8 * targetFps) /
    1_000_000
  ).toFixed(1);

  return (
    <SharedVideoLabShell
      title="Chapter 26: Video Fundamentals Explorer"
      description="Eksplorasi representasi sekuens citra temporal, resolusi spasial dan temporal (FPS), format subsampling warna kroma (4:4:4, 4:2:2, 4:2:0), dan kalkulasi laju data bitrate video mentah."
      isPlaying={isPlaying}
      isCameraActive={isCameraActive}
      errorMsg={errorMsg}
      onPlayToggle={() => setIsPlaying(!isPlaying)}
      onCameraToggle={toggleCamera}
      onFileUpload={handleFileUpload}
      canvasElement={
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Video Sequence Canvas ({resolution.w}x{resolution.h})</span>
            <span>Frame: {currentFrameIdx} | Sumber: {videoUrl ? 'File Video' : 'Synthetic Stream'}</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
            <canvas ref={canvasRef} className="max-w-full h-auto block rounded" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Bit Depth (SDR / HDR):</span>
            <div className="grid grid-cols-2 gap-2">
              {[8, 10].map((b) => (
                <button
                  key={b}
                  onClick={() => setBitDepth(b)}
                  className={`py-1.5 px-2 rounded text-xs border transition ${
                    bitDepth === b
                      ? 'bg-purple-600 text-white border-purple-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {b}-bit ({b === 8 ? '256 levels' : '1024 levels'})
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Resolusi Spasial:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { w: 320, h: 180, label: '360p' },
                { w: 480, h: 270, label: '480p' },
                { w: 640, h: 360, label: '720p (Scaled)' },
              ].map((res) => (
                <button
                  key={res.label}
                  onClick={() => setResolution({ w: res.w, h: res.h })}
                  className={`py-1.5 px-2 rounded text-xs border transition ${
                    resolution.w === res.w
                      ? 'bg-primary-600 text-white border-primary-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Chroma Subsampling:</span>
            <div className="grid grid-cols-3 gap-2">
              {(['4:4:4', '4:2:2', '4:2:0'] as Array<'4:4:4' | '4:2:2' | '4:2:0'>).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setColorFormat(fmt)}
                  className={`py-1.5 px-2 rounded text-xs border transition ${
                    colorFormat === fmt
                      ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Frame Rate ($f_s$):</span>
              <span className="font-mono text-primary-400">{targetFps} FPS</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={targetFps}
              onChange={(e) => setTargetFps(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Bit Depth (SDR / HDR):</span>
            <div className="grid grid-cols-2 gap-2">
              {[8, 10].map((b) => (
                <button
                  key={b}
                  onClick={() => setBitDepth(b)}
                  className={`py-1.5 px-2 rounded text-xs border transition ${
                    bitDepth === b
                      ? 'bg-purple-600 text-white border-purple-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {b}-bit ({b === 8 ? '256 levels' : '1024 levels'})
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Interval Antar Frame ($\Delta t$)</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {(1000 / targetFps).toFixed(1)} ms
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Efisiensi Subsampling</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">
              {colorFormat === '4:2:0' ? '50% Bandwidth Saved' : colorFormat === '4:2:2' ? '33% Bandwidth Saved' : '100% Full Chroma'}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Bitrate Tak Terkompresi</span>
            <span className="text-sm font-semibold font-mono text-amber-400">{rawBitrateMbps} Mbps</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Ukuran Frame Mentah</span>
            <span className="text-sm font-semibold font-mono text-purple-400">
              {((resolution.w * resolution.h * bytesPerPixel) / 1024).toFixed(0)} kB/frame
            </span>
          </div>
        </>
      }
    />
  );
};

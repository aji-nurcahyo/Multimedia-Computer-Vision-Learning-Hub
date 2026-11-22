import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SharedAudioLabShell } from './SharedAudioLabShell';
import { useAudioLabSource } from './useAudioLabSource';
import {
  computeStft,
  WindowFunction,
} from '../../lib/audioProcessing';

export const SpectrogramExplorer: React.FC = () => {
  const [windowType, setWindowType] = useState<WindowFunction>('hann');
  const [nFft, setNFft] = useState<number>(512);
  const [hopSize, setHopSize] = useState<number>(256);

  const spectrogramCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    signal,
    sampleRate,
    isPlaying,
    errorMsg,
    playSignal,
    stopPlayback,
    loadPreset,
    handleFileUpload,
    downloadWav,
  } = useAudioLabSource({ defaultType: 'chirp', defaultFreq: 300, defaultDuration: 1.5 });

  const stftData = useMemo(() => {
    return computeStft(signal, sampleRate, nFft, hopSize, windowType);
  }, [signal, sampleRate, nFft, hopSize, windowType]);

  // Render heatmap to canvas
  useEffect(() => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    const { spectrogram } = stftData;
    const numFrames = spectrogram.length;
    if (numFrames === 0) return;
    const numBins = spectrogram[0].length;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Helper colormap: Viridis-like / Infernal heat (black -> purple -> orange -> yellow)
    const getColor = (norm: number): [number, number, number] => {
      const t = Math.max(0, Math.min(1, norm));
      if (t < 0.25) {
        // black to dark blue
        const s = t / 0.25;
        return [Math.floor(s * 30), Math.floor(s * 30), Math.floor(s * 140)];
      } else if (t < 0.5) {
        // blue to purple
        const s = (t - 0.25) / 0.25;
        return [Math.floor(30 + s * 130), 30, Math.floor(140 - s * 20)];
      } else if (t < 0.75) {
        // purple to orange
        const s = (t - 0.5) / 0.25;
        return [Math.floor(160 + s * 80), Math.floor(30 + s * 120), 20];
      } else {
        // orange to yellow
        const s = (t - 0.75) / 0.25;
        return [240 + Math.floor(s * 15), 150 + Math.floor(s * 105), Math.floor(s * 180)];
      }
    };

    // Interpolate / map to canvas grid
    for (let y = 0; y < height; y++) {
      // Invert y: y=0 is highest frequency, y=height-1 is 0 Hz
      const binIdx = Math.floor(((height - 1 - y) / height) * numBins);

      for (let x = 0; x < width; x++) {
        const frameIdx = Math.floor((x / width) * numFrames);
        const db = spectrogram[frameIdx][binIdx];
        // Normalize dB from [-80, 0] to [0, 1]
        const norm = Math.max(0, Math.min(1, (db + 80) / 80));
        const [r, g, b] = getColor(norm);

        const pixelIdx = (y * width + x) * 4;
        data[pixelIdx] = r;
        data[pixelIdx + 1] = g;
        data[pixelIdx + 2] = b;
        data[pixelIdx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [stftData]);

  const timeResolutionMs = ((hopSize / sampleRate) * 1000).toFixed(1);
  const freqResolutionHz = (sampleRate / nFft).toFixed(1);

  return (
    <SharedAudioLabShell
      title="Chapter 20: Time-Frequency Analysis & Spectrogram Explorer"
      description="Visualisasi matriks spektrogram waktu-frekuensi Short-Time Fourier Transform (STFT), kompromi resolusi waktu vs resolusi frekuensi (Heisenberg-Gabor Limit), dan analisis sinyal non-stasioner."
      signal={signal}
      sampleRate={sampleRate}
      isPlaying={isPlaying}
      errorMsg={errorMsg}
      onPlay={() => playSignal()}
      onStop={stopPlayback}
      onPresetSelect={loadPreset}
      onFileUpload={handleFileUpload}
      onDownload={() => downloadWav('ch20-spectrogram-signal.wav')}
      additionalVisualizer={
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>STFT Spectrogram Heatmap (Waktu vs Frekuensi)</span>
            <span>0 s.d. {(sampleRate / 2).toLocaleString()} Hz</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <canvas
              ref={spectrogramCanvasRef}
              width={800}
              height={200}
              className="w-full h-48 block"
            />
          </div>
        </div>
      }
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Panjang Jendela (N_FFT):</span>
            <div className="grid grid-cols-3 gap-2">
              {[256, 512, 1024].map((size) => (
                <button
                  key={size}
                  onClick={() => setNFft(size)}
                  className={`py-1.5 px-2 rounded text-xs border transition ${
                    nFft === size
                      ? 'bg-primary-600 text-white border-primary-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Hop Size ($H$):</span>
            <div className="grid grid-cols-3 gap-2">
              {[128, 256, 512].map((hop) => (
                <button
                  key={hop}
                  onClick={() => setHopSize(hop)}
                  className={`py-1.5 px-2 rounded text-xs border transition ${
                    hopSize === hop
                      ? 'bg-primary-600 text-white border-primary-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {hop}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Window:</span>
            <div className="grid grid-cols-3 gap-2">
              {(['hann', 'hamming', 'rectangular'] as WindowFunction[]).map((win) => (
                <button
                  key={win}
                  onClick={() => setWindowType(win)}
                  className={`py-1.5 px-2 rounded text-xs capitalize border transition ${
                    windowType === win
                      ? 'bg-purple-600 text-white border-purple-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {win}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Resolusi Waktu ($\Delta t$)</span>
            <span className="text-sm font-semibold font-mono text-sky-400">{timeResolutionMs} ms</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Resolusi Frekuensi ($\Delta f$)</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">{freqResolutionHz} Hz</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Total Frame Waktu</span>
            <span className="text-sm font-semibold font-mono text-purple-400">
              {stftData.spectrogram.length} frame
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Total Bin Frekuensi</span>
            <span className="text-sm font-semibold font-mono text-amber-400">
              {stftData.spectrogram[0]?.length || 0} bin
            </span>
          </div>
        </>
      }
    />
  );
};

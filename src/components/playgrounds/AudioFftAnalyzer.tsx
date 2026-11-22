import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SharedAudioLabShell } from './SharedAudioLabShell';
import { useAudioLabSource } from './useAudioLabSource';
import {
  computeMagnitudeSpectrum,
  WindowFunction,
} from '../../lib/audioProcessing';

export const AudioFftAnalyzer: React.FC = () => {
  const [windowType, setWindowType] = useState<WindowFunction>('hann');
  const [nFft, setNFft] = useState<number>(1024);

  const spectrumCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
  } = useAudioLabSource({ defaultType: 'harmonic', defaultFreq: 440, defaultDuration: 1.0 });

  // Compute FFT magnitude spectrum
  const { magnitudesDb, peakFreq, maxDb } = useMemo(() => {
    const { magnitudesDb } = computeMagnitudeSpectrum(signal, windowType, nFft);
    let max = -Infinity;
    let peakBin = 0;
    for (let i = 0; i < magnitudesDb.length; i++) {
      if (magnitudesDb[i] > max) {
        max = magnitudesDb[i];
        peakBin = i;
      }
    }
    const peakFreq = (peakBin * sampleRate) / nFft;
    return { magnitudesDb, peakFreq, maxDb: max };
  }, [signal, windowType, nFft, sampleRate]);

  // Draw spectrum onto canvas
  useEffect(() => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#020617'; // slate-950
    ctx.fillRect(0, 0, width, height);

    // Grid lines for dB levels: 0 dB, -20 dB, -40 dB, -60 dB, -80 dB
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748b';

    for (let db = 0; db >= -80; db -= 20) {
      const y = ((-db) / 80) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(`${db} dB`, 5, Math.max(12, y - 2));
    }

    // Spectrum line
    ctx.strokeStyle = '#f59e0b'; // amber-500
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const numBins = magnitudesDb.length;
    for (let x = 0; x < width; x++) {
      const binIdx = Math.floor((x / width) * numBins);
      const dbVal = magnitudesDb[binIdx];
      // Map [-80 dB, 0 dB] to [height, 0]
      const clampedDb = Math.max(-80, Math.min(0, dbVal));
      const y = ((-clampedDb) / 80) * height;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [magnitudesDb]);

  return (
    <SharedAudioLabShell
      title="Chapter 18: Audio FFT & Spectral Analyzer"
      description="Analisis spektral Fast Fourier Transform (FFT) 1D, pemilihan jendela pembobotan (Hann, Hamming, Blackman, Rectangular) untuk meminimalkan spectral leakage, dan deteksi harmonik frekuensi audio."
      signal={signal}
      sampleRate={sampleRate}
      isPlaying={isPlaying}
      errorMsg={errorMsg}
      onPlay={() => playSignal()}
      onStop={stopPlayback}
      onPresetSelect={loadPreset}
      onFileUpload={handleFileUpload}
      onDownload={() => downloadWav('ch18-fft-signal.wav')}
      additionalVisualizer={
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Magnitude Spectrum (Log Magnitude dBFS vs Frekuensi)</span>
            <span>0 Hz s.d. {(sampleRate / 2).toLocaleString()} Hz (Nyquist)</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <canvas
              ref={spectrumCanvasRef}
              width={800}
              height={180}
              className="w-full h-44 block"
            />
          </div>
        </div>
      }
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Window Function:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['hann', 'hamming', 'blackman', 'rectangular'] as WindowFunction[]).map((win) => (
                <button
                  key={win}
                  onClick={() => setWindowType(win)}
                  className={`py-1.5 px-2 rounded text-xs capitalize border transition ${
                    windowType === win
                      ? 'bg-amber-600 text-white border-amber-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {win}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Ukuran FFT (N_FFT):</span>
            <div className="grid grid-cols-3 gap-2">
              {[512, 1024, 2048].map((size) => (
                <button
                  key={size}
                  onClick={() => setNFft(size)}
                  className={`py-1.5 px-2 rounded text-xs border transition ${
                    nFft === size
                      ? 'bg-primary-600 text-white border-primary-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {size} titik
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Frekuensi Puncak</span>
            <span className="text-sm font-semibold font-mono text-amber-400">{peakFreq.toFixed(1)} Hz</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Amplitudo Puncak</span>
            <span className="text-sm font-semibold font-mono text-sky-400">{maxDb.toFixed(1)} dBFS</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Resolusi Frekuensi ($\Delta f$)</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">
              {(sampleRate / nFft).toFixed(2)} Hz/bin
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Jendela Aktif</span>
            <span className="text-sm font-semibold font-mono text-purple-400 capitalize">{windowType}</span>
          </div>
        </>
      }
    />
  );
};

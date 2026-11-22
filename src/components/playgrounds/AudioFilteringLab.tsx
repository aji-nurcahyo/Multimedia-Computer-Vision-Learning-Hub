import React, { useState, useMemo } from 'react';
import { SharedAudioLabShell } from './SharedAudioLabShell';
import { useAudioLabSource } from './useAudioLabSource';
import {
  designFirFilter,
  applyFirFilter,
  applyBiquadFilter,
  FilterType,
  createWavBlob,
} from '../../lib/audioProcessing';

export const AudioFilteringLab: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'fir' | 'iir'>('iir');
  const [filterType, setFilterType] = useState<FilterType>('lowpass');
  const [cutoffFreq, setCutoffFreq] = useState<number>(1200);
  const [noiseAmount, setNoiseAmount] = useState<number>(0.3);

  const {
    signal,
    sampleRate,
    isPlaying,
    errorMsg,
    playSignal,
    stopPlayback,
    handleFileUpload,
  } = useAudioLabSource({ defaultType: 'harmonic', defaultFreq: 440, defaultDuration: 1.0 });

  // Noisy signal
  const noisySignal = useMemo(() => {
    const noisy = new Float32Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
      const noise = (Math.random() * 2 - 1) * noiseAmount;
      noisy[i] = Math.max(-1.0, Math.min(1.0, signal[i] + noise));
    }
    return noisy;
  }, [signal, noiseAmount]);

  // Filtered signal
  const filteredSignal = useMemo(() => {
    if (filterMode === 'fir') {
      const kernel = designFirFilter(filterType, cutoffFreq, sampleRate, 65);
      return applyFirFilter(noisySignal, kernel);
    } else {
      return applyBiquadFilter(noisySignal, filterType, cutoffFreq, sampleRate);
    }
  }, [noisySignal, filterMode, filterType, cutoffFreq, sampleRate]);

  // Calculate SNR improvement
  const snrNoisy = useMemo(() => {
    let sPow = 0, nPow = 0;
    for (let i = 0; i < signal.length; i++) {
      sPow += signal[i] * signal[i];
      const n = noisySignal[i] - signal[i];
      nPow += n * n;
    }
    return nPow > 0 ? 10 * Math.log10(sPow / nPow) : 100;
  }, [signal, noisySignal]);

  const snrFiltered = useMemo(() => {
    let sPow = 0, nPow = 0;
    for (let i = 0; i < signal.length; i++) {
      sPow += signal[i] * signal[i];
      const n = filteredSignal[i] - signal[i];
      nPow += n * n;
    }
    return nPow > 0 ? 10 * Math.log10(sPow / nPow) : 100;
  }, [signal, filteredSignal]);

  const handleDownloadFiltered = () => {
    const blob = createWavBlob([filteredSignal], sampleRate, 16);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ch19-filtered-${filterMode}-${filterType}-${cutoffFreq}hz.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <SharedAudioLabShell
      title="Chapter 19: Digital Audio Filtering & Noise Reduction"
      description="Eksperimen filter audio digital: komparasi FIR (Finite Impulse Response) berbasis konvolusi jendela vs IIR Biquad (Infinite Impulse Response), injeksi derau aditif, dan evaluasi SNR (Signal-to-Noise Ratio)."
      signal={filteredSignal}
      sampleRate={sampleRate}
      isPlaying={isPlaying}
      errorMsg={errorMsg}
      onPlay={() => playSignal(filteredSignal)}
      onStop={stopPlayback}
      onFileUpload={handleFileUpload}
      onDownload={handleDownloadFiltered}
      controlsChildren={
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-300 block font-medium">Arsitektur Filter:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterMode('iir')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium border transition ${
                    filterMode === 'iir'
                      ? 'bg-primary-600 text-white border-primary-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  IIR Biquad
                </button>
                <button
                  onClick={() => setFilterMode('fir')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium border transition ${
                    filterMode === 'fir'
                      ? 'bg-primary-600 text-white border-primary-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  FIR Sinc (65-tap)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-slate-300 block font-medium">Jenis Respon Frekuensi:</span>
              <div className="grid grid-cols-2 gap-2">
                {(['lowpass', 'highpass', 'bandpass', 'notch'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`py-1.5 px-2 rounded text-xs capitalize border transition ${
                      filterType === type
                        ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Injeksi Derau (Noise):</span>
                <span className="font-mono text-amber-400">{(noiseAmount * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.05}
                value={noiseAmount}
                onChange={(e) => setNoiseAmount(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Frekuensi Cutoff ($f_c$):</span>
              <span className="font-mono text-primary-400">{cutoffFreq} Hz</span>
            </div>
            <input
              type="range"
              min={200}
              max={6000}
              step={50}
              value={cutoffFreq}
              onChange={(e) => setCutoffFreq(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">SNR Sebelum Filter</span>
            <span className="text-sm font-semibold font-mono text-amber-400">{snrNoisy.toFixed(1)} dB</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">SNR Sesudah Filter</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">{snrFiltered.toFixed(1)} dB</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Delta Peningkatan</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {(snrFiltered - snrNoisy).toFixed(1)} dB
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Stabilitas Fase</span>
            <span className="text-sm font-semibold font-mono text-purple-400">
              {filterMode === 'fir' ? 'Linear Phase (Zero Distortion)' : 'Minimum Phase (Non-linear)'}
            </span>
          </div>
        </>
      }
    />
  );
};

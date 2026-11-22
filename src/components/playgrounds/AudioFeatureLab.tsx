import React, { useMemo } from 'react';
import { SharedAudioLabShell } from './SharedAudioLabShell';
import { useAudioLabSource } from './useAudioLabSource';
import {
  computeAudioFeatures,
  computeMfcc13,
} from '../../lib/audioProcessing';

export const AudioFeatureLab: React.FC = () => {
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

  const features = useMemo(() => {
    return computeAudioFeatures(signal, sampleRate);
  }, [signal, sampleRate]);

  const mfccs = useMemo(() => {
    return computeMfcc13(signal, sampleRate);
  }, [signal, sampleRate]);

  return (
    <SharedAudioLabShell
      title="Chapter 21: Audio Feature Extraction Lab"
      description="Ekstraksi fitur audio domain waktu dan domain frekuensi: RMS Energy, Zero Crossing Rate (ZCR), Spectral Centroid, Spread, Flatness, Rolloff, dan 13 koefisien MFCC (Mel-Frequency Cepstral Coefficients)."
      signal={signal}
      sampleRate={sampleRate}
      isPlaying={isPlaying}
      errorMsg={errorMsg}
      onPlay={() => playSignal()}
      onStop={stopPlayback}
      onPresetSelect={loadPreset}
      onFileUpload={handleFileUpload}
      onDownload={() => downloadWav('ch21-features-signal.wav')}
      additionalVisualizer={
        <div className="space-y-2 p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>13 Mel-Frequency Cepstral Coefficients (MFCCs)</span>
            <span className="text-slate-400 font-mono text-[11px]">Koefisien 0-12</span>
          </div>
          <div className="grid grid-cols-13 gap-1 h-24 items-end bg-slate-900/80 p-2 rounded border border-slate-800">
            {Array.from(mfccs).map((val, idx) => {
              // Normalize MFCC value for height [-20, 20]
              const heightPct = Math.max(5, Math.min(100, Math.abs(val) * 3));
              const isPositive = val >= 0;
              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all ${
                      isPositive ? 'bg-primary-500' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">{idx}</span>
                </div>
              );
            })}
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">RMS Energy</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">
              {features.rmsEnergy.toFixed(4)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Zero Crossing Rate (ZCR)</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {features.zeroCrossingRate.toFixed(4)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Spectral Centroid</span>
            <span className="text-sm font-semibold font-mono text-amber-400">
              {features.spectralCentroid.toFixed(1)} Hz
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Spectral Spread ($\sigma$)</span>
            <span className="text-sm font-semibold font-mono text-purple-400">
              {features.spectralSpread.toFixed(1)} Hz
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Spectral Flatness</span>
            <span className="text-sm font-semibold font-mono text-rose-400">
              {features.spectralFlatness.toFixed(4)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Spectral Rolloff (85%)</span>
            <span className="text-sm font-semibold font-mono text-indigo-400">
              {features.spectralRolloff.toFixed(1)} Hz
            </span>
          </div>
        </>
      }
    />
  );
};


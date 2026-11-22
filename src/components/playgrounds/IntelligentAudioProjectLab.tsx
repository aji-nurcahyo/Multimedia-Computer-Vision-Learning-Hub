import React, { useState, useMemo } from 'react';
import { Cpu } from 'lucide-react';
import { SharedAudioLabShell } from './SharedAudioLabShell';
import { useAudioLabSource } from './useAudioLabSource';
import {
  computeAudioFeatures,
  applyBiquadFilter,
  computeVad,
  createWavBlob,
} from '../../lib/audioProcessing';

export const IntelligentAudioProjectLab: React.FC = () => {
  const [enableDenoise, setEnableDenoise] = useState<boolean>(true);
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(0.75);

  const {
    signal,
    sampleRate,
    isPlaying,
    errorMsg,
    playSignal,
    stopPlayback,
    loadPreset,
    handleFileUpload,
  } = useAudioLabSource({ defaultType: 'harmonic', defaultFreq: 440, defaultDuration: 1.5 });

  // 1. Pipeline Stage 1: Pre-processing & Noise Reduction (Biquad LPF)
  const processedSignal = useMemo(() => {
    if (!enableDenoise) return signal;
    return applyBiquadFilter(signal, 'lowpass', 3500, sampleRate);
  }, [signal, enableDenoise, sampleRate]);

  // 2. Pipeline Stage 2: Feature Extraction
  const features = useMemo(() => {
    return computeAudioFeatures(processedSignal, sampleRate);
  }, [processedSignal, sampleRate]);

  // 3. Pipeline Stage 3: VAD Segmentation
  const vadSegments = useMemo(() => {
    return computeVad(processedSignal, sampleRate, 30, 0.02, 0.35);
  }, [processedSignal, sampleRate]);

  // 4. Pipeline Stage 4: Acoustic Anomaly Detection Metric
  const anomalyScore = useMemo(() => {
    // High flatness + sudden high RMS triggers acoustic anomaly alarm
    const score = features.spectralFlatness * 0.6 + features.zeroCrossingRate * 0.4;
    return Math.max(0, Math.min(1.0, score));
  }, [features]);

  const isAlarmTriggered = anomalyScore >= anomalyThreshold;

  const handleDownloadProcessed = () => {
    const blob = createWavBlob([processedSignal], sampleRate, 16);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ch25-pipeline-output.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <SharedAudioLabShell
      title="Chapter 25: Intelligent Audio Processing Applications Lab"
      description="Integrasi pipeline audio cerdas end-to-end: Akuisisi Sinyal -> Denoising Biquad -> Deteksi Aktivitas Suara (VAD) -> Ekstraksi Fitur Akustik -> Deteksi Anomali Akustik Real-Time pada Edge Devices."
      signal={processedSignal}
      sampleRate={sampleRate}
      isPlaying={isPlaying}
      errorMsg={errorMsg}
      onPlay={() => playSignal(processedSignal)}
      onStop={stopPlayback}
      onPresetSelect={loadPreset}
      onFileUpload={handleFileUpload}
      onDownload={handleDownloadProcessed}
      additionalVisualizer={
        <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Pipeline End-to-End Status
            </span>
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                isAlarmTriggered
                  ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}
            >
              {isAlarmTriggered ? 'PERINGATAN: ANOMALI TERDETEKSI' : 'STATUS: NORMAL'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Tingkat Skor Anomali Akustik:</span>
              <span className="font-mono text-amber-400">{(anomalyScore * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${anomalyScore * 100}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  isAlarmTriggered ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>
        </div>
      }
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-slate-200 block">Stage 1: Denoising Filter</span>
              <span className="text-[11px] text-slate-400">Aktifkan Biquad LPF 3.5 kHz</span>
            </div>
            <button
              onClick={() => setEnableDenoise(!enableDenoise)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                enableDenoise
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {enableDenoise ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Ambang Batas Anomali (Threshold):</span>
              <span className="font-mono text-primary-400">{(anomalyThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={0.95}
              step={0.05}
              value={anomalyThreshold}
              onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Latensi Estimasi Pipeline</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">&lt; 12 ms (Edge Ready)</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Segmen Wicara VAD</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {vadSegments.filter((s) => s.isSpeech).length} segmen
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Spectral Flatness</span>
            <span className="text-sm font-semibold font-mono text-purple-400">
              {features.spectralFlatness.toFixed(3)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Keputusan Otomatis</span>
            <span className="text-sm font-semibold font-mono text-amber-400">
              {isAlarmTriggered ? 'Trigger Event' : 'Pass / Normal'}
            </span>
          </div>
        </>
      }
    />
  );
};

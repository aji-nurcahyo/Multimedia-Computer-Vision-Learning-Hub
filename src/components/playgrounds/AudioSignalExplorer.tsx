import React, { useState, useEffect } from 'react';
import { SharedAudioLabShell } from './SharedAudioLabShell';
import { useAudioLabSource } from './useAudioLabSource';
import { generateSyntheticAudio } from '../../lib/audioProcessing';

export const AudioSignalExplorer: React.FC = () => {
  const [frequency, setFrequency] = useState<number>(440);
  const [amplitude, setAmplitude] = useState<number>(0.8);
  const [phaseDeg, setPhaseDeg] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1.0);

  const {
    signal,
    setSignal,
    sampleRate,
    isPlaying,
    errorMsg,
    playSignal,
    stopPlayback,
    handleFileUpload,
    downloadWav,
  } = useAudioLabSource({ defaultFreq: 440, defaultDuration: 1.0 });

  useEffect(() => {
    const phaseRad = (phaseDeg * Math.PI) / 180;
    const newSig = generateSyntheticAudio('sine', frequency, duration, sampleRate, amplitude, phaseRad);
    setSignal(newSig);
  }, [frequency, amplitude, phaseDeg, duration, sampleRate, setSignal]);

  const periodMs = (1000 / frequency).toFixed(2);
  const wavelengthMeters = (343 / frequency).toFixed(2); // Speed of sound in air ~ 343 m/s

  return (
    <SharedAudioLabShell
      title="Chapter 16: Interactive Audio Signal Explorer"
      description="Eksplorasi gelombang kontinu digital, amplitudo, frekuensi, fase, panjang gelombang akustik, dan perbedaan matematis antara amplitudo linier dengan persepsi kenyaringan (loudness)."
      signal={signal}
      sampleRate={sampleRate}
      isPlaying={isPlaying}
      errorMsg={errorMsg}
      onPlay={() => playSignal()}
      onStop={stopPlayback}
      onFileUpload={handleFileUpload}
      onDownload={() => downloadWav('ch16-sine-signal.wav')}
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Frekuensi Dasar ($f_0$):</span>
              <span className="font-mono text-primary-400">{frequency} Hz</span>
            </div>
            <input
              type="range"
              min={50}
              max={2000}
              step={10}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Amplitudo ($A$):</span>
              <span className="font-mono text-primary-400">{amplitude.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={1.0}
              step={0.05}
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Sudut Fase ($\theta$):</span>
              <span className="font-mono text-primary-400">{phaseDeg}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={15}
              value={phaseDeg}
              onChange={(e) => setPhaseDeg(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Durasi Sinyal:</span>
              <span className="font-mono text-primary-400">{duration.toFixed(1)} s</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={3.0}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Periode Gelombang ($T$)</span>
            <span className="text-sm font-semibold font-mono text-sky-400">{periodMs} ms</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Panjang Gelombang ($\lambda$)</span>
            <span className="text-sm font-semibold font-mono text-sky-400">{wavelengthMeters} m</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Peak-to-Peak (V_pp)</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">{(amplitude * 2).toFixed(2)}</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Level dBFS</span>
            <span className="text-sm font-semibold font-mono text-amber-400">
              {(20 * Math.log10(amplitude)).toFixed(1)} dBFS
            </span>
          </div>
        </>
      }
    />
  );
};

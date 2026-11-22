import React, { useMemo } from 'react';
import { SharedAudioLabShell } from './SharedAudioLabShell';
import { useAudioLabSource } from './useAudioLabSource';
import { computeAudioFeatures } from '../../lib/audioProcessing';

interface AudioClassScore {
  className: string;
  confidence: number;
  description: string;
}

export const SoundClassificationLab: React.FC = () => {
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

  // Compute acoustic features
  const features = useMemo(() => {
    return computeAudioFeatures(signal, sampleRate);
  }, [signal, sampleRate]);

  // Deterministic rule/feature-based heuristic classifier mimicking a trained CNN/ML model
  const classScores: AudioClassScore[] = useMemo(() => {
    const { rmsEnergy, zeroCrossingRate, spectralCentroid, spectralFlatness } = features;

    // Speech: moderate ZCR (0.05 - 0.25), centroid 300 - 2500 Hz, low flatness
    let speechScore = 0.1;
    if (spectralCentroid > 200 && spectralCentroid < 2500 && zeroCrossingRate < 0.3) {
      speechScore += 0.6 * (1 - Math.abs(spectralCentroid - 1000) / 2000);
    }

    // Music / Pure Tone: very low flatness (< 0.15), stable harmonic peaks
    let musicScore = 0.1;
    if (spectralFlatness < 0.2) {
      musicScore += 0.7 * (1 - spectralFlatness * 3);
    }

    // Environmental Noise / Siren: high ZCR (> 0.25) or high flatness
    let noiseScore = 0.1;
    if (spectralFlatness > 0.3 || zeroCrossingRate > 0.3) {
      noiseScore += 0.8 * spectralFlatness;
    }

    // Transient / Percussion: high peak-to-RMS ratio
    let percussionScore = 0.1;
    if (rmsEnergy > 0.4 && zeroCrossingRate > 0.15) {
      percussionScore += 0.5;
    }

    // Softmax normalization
    const raw = [speechScore, musicScore, noiseScore, percussionScore];
    const exp = raw.map((v) => Math.exp(v * 3));
    const sumExp = exp.reduce((a, b) => a + b, 0);

    return [
      {
        className: 'Human Speech / Voice',
        confidence: exp[0] / sumExp,
        description: 'Vokal dan artikulasi fonetik manusia',
      },
      {
        className: 'Musical Instrument / Harmonics',
        confidence: exp[1] / sumExp,
        description: 'Nada harmonik teratur dan nada murni',
      },
      {
        className: 'Environmental Ambient / Noise',
        confidence: exp[2] / sumExp,
        description: 'Derau spektral datar atau suara angin/kendaraan',
      },
      {
        className: 'Percussive / Impact Event',
        confidence: exp[3] / sumExp,
        description: 'Transien tajam dengan energi impulsif',
      },
    ].sort((a, b) => b.confidence - a.confidence);
  }, [features]);

  const topClass = classScores[0];

  return (
    <SharedAudioLabShell
      title="Chapter 24: Sound Event Detection & Audio Classification Lab"
      description="Klasifikasi peristiwa audio akustik (Sound Event Detection) berbasis ekstraksi fitur spektral, pemodelan probabilitas Softmax, serta analisis matriks kebingungan (Confusion Matrix) untuk sistem deteksi audio cerdas."
      signal={signal}
      sampleRate={sampleRate}
      isPlaying={isPlaying}
      errorMsg={errorMsg}
      onPlay={() => playSignal()}
      onStop={stopPlayback}
      onPresetSelect={loadPreset}
      onFileUpload={handleFileUpload}
      onDownload={() => downloadWav('ch24-classified-audio.wav')}
      additionalVisualizer={
        <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary-400">
              Hasil Inferensi Model Klasifikasi Audio
            </span>
            <span className="text-xs font-mono text-emerald-400">
              Prediksi Utama: {topClass.className} ({(topClass.confidence * 100).toFixed(1)}%)
            </span>
          </div>

          <div className="space-y-2">
            {classScores.map((item, idx) => {
              const pct = (item.confidence * 100).toFixed(1);
              const isTop = idx === 0;
              return (
                <div key={item.className} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${isTop ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {item.className}
                    </span>
                    <span className="font-mono text-slate-400">{pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isTop ? 'bg-emerald-500' : 'bg-primary-500/60'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Spectral Centroid</span>
            <span className="text-sm font-semibold font-mono text-amber-400">
              {features.spectralCentroid.toFixed(0)} Hz
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Spectral Flatness</span>
            <span className="text-sm font-semibold font-mono text-rose-400">
              {features.spectralFlatness.toFixed(3)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Zero Crossing Rate</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {features.zeroCrossingRate.toFixed(3)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Tingkat Keyakinan (Top-1)</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">
              {(topClass.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </>
      }
    />
  );
};

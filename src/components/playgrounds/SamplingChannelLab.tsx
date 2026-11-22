import React, { useState, useMemo } from 'react';
import { SharedAudioLabShell } from './SharedAudioLabShell';
import { useAudioLabSource } from './useAudioLabSource';
import {
  generateSyntheticAudio,
  quantizeAudio,
  calculateSqnr,
  createWavBlob,
} from '../../lib/audioProcessing';

export const SamplingChannelLab: React.FC = () => {
  const [signalFreq, setSignalFreq] = useState<number>(440);
  const [bitDepth, setBitDepth] = useState<number>(8);
  const [numChannels, setNumChannels] = useState<1 | 2>(1);

  const {
    signal,
    setSignal,
    sampleRate,
    isPlaying,
    errorMsg,
    playSignal,
    stopPlayback,
    handleFileUpload,
  } = useAudioLabSource({ defaultFreq: 440, defaultDuration: 1.0 });

  // Compute quantized version
  const quantized = useMemo(() => {
    return quantizeAudio(signal, bitDepth);
  }, [signal, bitDepth]);

  const sqnr = useMemo(() => {
    return calculateSqnr(signal, quantized);
  }, [signal, quantized]);

  const theoreticalSqnr = (6.02 * bitDepth + 1.76).toFixed(1);
  const bitrateKbps = ((sampleRate * bitDepth * numChannels) / 1000).toFixed(1);

  const handleDownloadQuantized = () => {
    const channels = numChannels === 1 ? [quantized] : [quantized, quantized];
    const blob = createWavBlob(channels, sampleRate, bitDepth <= 8 ? 8 : 16);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ch17-quantized-${bitDepth}bit-${numChannels}ch.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <SharedAudioLabShell
      title="Chapter 17: Audio Sampling, Waveforms & Channels Lab"
      description="Simulasi kuantisasi seragam (uniform quantization), aliasing frekuensi Nyquist, komparasi bit depth (2-bit hingga 16-bit), konfigurasi mono/stereo, dan kalkulasi laju data audio (bitrate)."
      signal={quantized}
      sampleRate={sampleRate}
      isPlaying={isPlaying}
      errorMsg={errorMsg}
      onPlay={() => playSignal(quantized)}
      onStop={stopPlayback}
      onFileUpload={handleFileUpload}
      onDownload={handleDownloadQuantized}
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Frekuensi Sinyal Input:</span>
              <span className="font-mono text-primary-400">{signalFreq} Hz</span>
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={signalFreq}
              onChange={(e) => {
                const f = Number(e.target.value);
                setSignalFreq(f);
                setSignal(generateSyntheticAudio('sine', f, 1.0, sampleRate));
              }}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Kuantisasi Bit Depth:</span>
              <span className="font-mono text-primary-400">{bitDepth} bit ({Math.pow(2, bitDepth)} level)</span>
            </div>
            <input
              type="range"
              min={2}
              max={16}
              step={1}
              value={bitDepth}
              onChange={(e) => setBitDepth(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Konfigurasi Channel:</span>
              <span className="font-mono text-primary-400">{numChannels === 1 ? 'Mono (1 Ch)' : 'Stereo (2 Ch)'}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setNumChannels(1)}
                className={`flex-1 py-1.5 rounded text-xs font-medium border transition ${
                  numChannels === 1
                    ? 'bg-primary-600 text-white border-primary-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Mono
              </button>
              <button
                onClick={() => setNumChannels(2)}
                className={`flex-1 py-1.5 rounded text-xs font-medium border transition ${
                  numChannels === 2
                    ? 'bg-primary-600 text-white border-primary-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Stereo
              </button>
            </div>
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Frekuensi Nyquist</span>
            <span className="text-sm font-semibold font-mono text-sky-400">{(sampleRate / 2).toLocaleString()} Hz</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">SQNR Terukur</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">{sqnr.toFixed(1)} dB</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">SQNR Teoretis (6.02N+1.76)</span>
            <span className="text-sm font-semibold font-mono text-primary-400">{theoreticalSqnr} dB</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Data Rate Audio</span>
            <span className="text-sm font-semibold font-mono text-amber-400">{bitrateKbps} kbps</span>
          </div>
        </>
      }
    />
  );
};


import React, { useState } from 'react';
import { SharedVideoLabShell } from './SharedVideoLabShell';

export const VideoCompressionLab: React.FC = () => {
  const [codecName, setCodecName] = useState<'H.264 / AVC' | 'H.265 / HEVC' | 'VP9' | 'AV1'>('H.264 / AVC');
  const [gopSize, setGopSize] = useState<number>(30);
  const [targetBitrateKbps, setTargetBitrateKbps] = useState<number>(1500);

  // Simulated metrics based on academic benchmark studies
  const compressionRatio =
    codecName === 'AV1'
      ? 180
      : codecName === 'H.265 / HEVC'
      ? 150
      : codecName === 'VP9'
      ? 135
      : 100;

  const estimatedPsnr = (
    38.5 +
    Math.log10(targetBitrateKbps / 1000) * 4.5 +
    (codecName === 'AV1' ? 3.2 : codecName === 'H.265 / HEVC' ? 2.5 : codecName === 'VP9' ? 1.8 : 0)
  ).toFixed(1);

  const estimatedSsim = (
    0.91 +
    Math.min(0.08, (targetBitrateKbps / 5000) * 0.08) +
    (codecName === 'AV1' ? 0.025 : codecName === 'H.265 / HEVC' ? 0.02 : 0)
  ).toFixed(3);

  return (
    <SharedVideoLabShell
      title="Chapter 28: Educational Video Codec & Compression Simulator"
      description="Simulasi komparasi efisiensi kompresi antar-codec video (H.264, H.265/HEVC, VP9, AV1), struktur Group of Pictures (GOP: I-frame, P-frame, B-frame), trade-off bitrate vs kualitas objektif PSNR & SSIM."
      isPlaying={false}
      isCameraActive={false}
      errorMsg={null}
      onPlayToggle={() => {}}
      canvasElement={
        <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
          <div className="flex justify-between text-xs text-slate-300 font-medium">
            <span>Struktur Group of Pictures (GOP M=3, N={gopSize})</span>
            <span className="text-amber-400 font-mono text-[11px]">Intra &amp; Inter Prediction</span>
          </div>

          {/* GOP Visualization */}
          <div className="flex gap-1.5 overflow-x-auto py-2">
            {['I', 'B', 'B', 'P', 'B', 'B', 'P', 'B', 'B', 'P', 'B', 'B', 'I'].map((type, idx) => {
              const isI = type === 'I';
              const isP = type === 'P';
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center w-10 h-14 rounded border text-xs font-bold transition ${
                    isI
                      ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                      : isP
                      ? 'bg-sky-950/80 border-sky-600 text-sky-300'
                      : 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  }`}
                >
                  <span>{type}</span>
                  <span className="text-[9px] font-mono text-slate-400 mt-1">
                    {isI ? 'Key' : isP ? 'Fwd' : 'Bi'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-600 inline-block" /> I-Frame (Intra-coded)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-sky-600 inline-block" /> P-Frame (Predicted)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" /> B-Frame (Bi-directional)
            </span>
          </div>
        </div>
      }
      controlsChildren={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">Standar Video Codec:</span>
            <div className="grid grid-cols-2 gap-2">
              {(['H.264 / AVC', 'H.265 / HEVC', 'VP9', 'AV1'] as const).map((name) => (
                <button
                  key={name}
                  onClick={() => setCodecName(name)}
                  className={`py-1.5 px-2 rounded text-xs border transition ${
                    codecName === name
                      ? 'bg-primary-600 text-white border-primary-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Target Bitrate:</span>
              <span className="font-mono text-primary-400">{targetBitrateKbps} kbps</span>
            </div>
            <input
              type="range"
              min={500}
              max={6000}
              step={250}
              value={targetBitrateKbps}
              onChange={(e) => setTargetBitrateKbps(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Panjang GOP ($N$):</span>
              <span className="font-mono text-primary-400">{gopSize} frame</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={gopSize}
              onChange={(e) => setGopSize(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Rasio Kompresi Relatif</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">{compressionRatio}:1</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Estimasi PSNR Kualitas</span>
            <span className="text-sm font-semibold font-mono text-sky-400">{estimatedPsnr} dB</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Estimasi Indeks SSIM</span>
            <span className="text-sm font-semibold font-mono text-purple-400">{estimatedSsim}</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Penghematan vs H.264</span>
            <span className="text-sm font-semibold font-mono text-amber-400">
              {codecName === 'AV1'
                ? '~45% Bitrate Saving'
                : codecName === 'H.265 / HEVC'
                ? '~35% Bitrate Saving'
                : codecName === 'VP9'
                ? '~25% Bitrate Saving'
                : 'Baseline Acuan'}
            </span>
          </div>
        </>
      }
    />
  );
};


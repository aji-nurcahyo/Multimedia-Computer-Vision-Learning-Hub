import React, { useRef, useEffect } from 'react';
import { Volume2, Play, Square, Download, Upload, AlertCircle } from 'lucide-react';
import { WaveformType } from '../../lib/audioProcessing';

interface SharedAudioLabShellProps {
  title: string;
  description: string;
  signal: Float32Array;
  sampleRate: number;
  isPlaying: boolean;
  errorMsg: string | null;
  onPlay: () => void;
  onStop: () => void;
  onPresetSelect?: (type: WaveformType) => void;
  onFileUpload?: (file: File) => void;
  onDownload?: () => void;
  controlsChildren?: React.ReactNode;
  additionalVisualizer?: React.ReactNode;
  statsChildren?: React.ReactNode;
}

export const SharedAudioLabShell: React.FC<SharedAudioLabShellProps> = ({
  title,
  description,
  signal,
  sampleRate,
  isPlaying,
  errorMsg,
  onPlay,
  onStop,
  onPresetSelect,
  onFileUpload,
  onDownload,
  controlsChildren,
  additionalVisualizer,
  statsChildren,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Draw time-domain waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Waveform line
    ctx.strokeStyle = '#38bdf8'; // sky-400
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const step = Math.max(1, Math.floor(signal.length / width));
    for (let x = 0; x < width; x++) {
      const idx = x * step;
      if (idx >= signal.length) break;
      const s = signal[idx];
      // Map [-1, 1] to [height, 0]
      const y = ((1.0 - s) / 2) * height;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [signal]);

  const durationSec = (signal.length / sampleRate).toFixed(2);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition"
            >
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          ) : (
            <button
              onClick={onPlay}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-medium transition"
            >
              <Play className="w-3.5 h-3.5" /> Play Audio
            </button>
          )}

          {onFileUpload && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
                title="Unggah WAV"
              >
                <Upload className="w-3.5 h-3.5" /> WAV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,audio/wav"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileUpload(f);
                }}
              />
            </>
          )}

          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
              title="Unduh WAV"
            >
              <Download className="w-3.5 h-3.5" /> Unduh
            </button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Presets if provided */}
      {onPresetSelect && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Sinyal Preset:</span>
          {(['sine', 'square', 'sawtooth', 'triangle', 'noise', 'harmonic', 'chirp'] as WaveformType[]).map(
            (type) => (
              <button
                key={type}
                onClick={() => onPresetSelect(type)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 capitalize transition"
              >
                {type}
              </button>
            )
          )}
        </div>
      )}

      {/* Waveform Visualization Canvas */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Time-Domain Waveform</span>
          <span>
            {signal.length.toLocaleString()} samples | {durationSec}s @ {sampleRate} Hz
          </span>
        </div>
        <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
          <canvas
            ref={canvasRef}
            width={800}
            height={160}
            className="w-full h-36 block"
          />
        </div>
      </div>

      {/* Additional Visualizer (e.g. Spectrum, Spectrogram) */}
      {additionalVisualizer && <div className="space-y-2">{additionalVisualizer}</div>}

      {/* Interactive Controls & Parameters */}
      {controlsChildren && (
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-4">
          {controlsChildren}
        </div>
      )}

      {/* Quantitative Stats / Metrik */}
      {statsChildren && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {statsChildren}
        </div>
      )}
    </div>
  );
};


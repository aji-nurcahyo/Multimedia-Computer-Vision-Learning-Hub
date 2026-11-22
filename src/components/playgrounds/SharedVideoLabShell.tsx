import React, { useRef } from 'react';
import { Film, Play, Square, Camera, Upload, AlertCircle } from 'lucide-react';

interface SharedVideoLabShellProps {
  title: string;
  description: string;
  isPlaying: boolean;
  isCameraActive: boolean;
  errorMsg: string | null;
  onPlayToggle: () => void;
  onCameraToggle?: () => void;
  onFileUpload?: (file: File) => void;
  controlsChildren?: React.ReactNode;
  canvasElement?: React.ReactNode;
  statsChildren?: React.ReactNode;
}

export const SharedVideoLabShell: React.FC<SharedVideoLabShellProps> = ({
  title,
  description,
  isPlaying,
  isCameraActive,
  errorMsg,
  onPlayToggle,
  onCameraToggle,
  onFileUpload,
  controlsChildren,
  canvasElement,
  statsChildren,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-primary-600 hover:bg-primary-500 text-white'
            }`}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play / Run'}
          </button>

          {onCameraToggle && (
            <button
              onClick={onCameraToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isCameraActive
                  ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              {isCameraActive ? 'Tutup Kamera' : 'Webcam'}
            </button>
          )}

          {onFileUpload && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
                title="Unggah Video"
              >
                <Upload className="w-3.5 h-3.5" /> File Video
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileUpload(f);
                }}
              />
            </>
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

      {/* Video / Canvas Visualization View */}
      {canvasElement && <div className="space-y-2">{canvasElement}</div>}

      {/* Controls */}
      {controlsChildren && (
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-4">
          {controlsChildren}
        </div>
      )}

      {/* Statistics */}
      {statsChildren && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {statsChildren}
        </div>
      )}
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { SharedAudioLabShell } from './SharedAudioLabShell';
import { useAudioLabSource } from './useAudioLabSource';
import {
  computeVad,
  estimatePitchAutocorr,
} from '../../lib/audioProcessing';

export const SpeechSignalAnalyzer: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);

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
  } = useAudioLabSource({ defaultType: 'harmonic', defaultFreq: 160, defaultDuration: 1.5 });

  // VAD segments
  const vadSegments = useMemo(() => {
    return computeVad(signal, sampleRate, 30, 0.02, 0.4);
  }, [signal, sampleRate]);

  // Pitch estimation over active window
  const pitchInfo = useMemo(() => {
    const frameSize = 1024;
    // Test center frame
    const mid = Math.floor(signal.length / 2);
    const frame = signal.slice(mid, mid + frameSize);
    return estimatePitchAutocorr(frame, sampleRate, 70, 400);
  }, [signal, sampleRate]);

  const speechRatio = useMemo(() => {
    if (vadSegments.length === 0) return 0;
    let speechTime = 0;
    let totalTime = 0;
    vadSegments.forEach((seg) => {
      const dur = seg.endSec - seg.startSec;
      totalTime += dur;
      if (seg.isSpeech) speechTime += dur;
    });
    return totalTime > 0 ? (speechTime / totalTime) * 100 : 0;
  }, [vadSegments]);

  // Record from user microphone with proper permissions & cleanup
  const handleToggleMic = async () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses MediaDevices / Microphone.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      setIsRecording(true);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Decode webm via AudioContext
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const tempCtx = new AudioCtx();
        const arrayBuf = await audioBlob.arrayBuffer();
        const audioBuf = await tempCtx.decodeAudioData(arrayBuf);
        setSignal(audioBuf.getChannelData(0));
        await tempCtx.close();
      };

      mediaRecorder.start();
      // Auto stop after 3 seconds for safe memory usage
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 3000);
    } catch (err: unknown) {
      setIsRecording(false);
      const msg = err instanceof Error ? err.message : 'Izin mikrofon ditolak atau tidak tersedia.';
      setMicError(msg);
    }
  };

  return (
    <SharedAudioLabShell
      title="Chapter 22: Speech Signal Processing Lab"
      description="Analisis karakteristik sinyal wicara manusia (voiced vs unvoiced), segmentasi aktivitas suara (Voice Activity Detection - VAD), dan estimasi frekuensi fundamental nada (pitch / F0) berbasis autokorelasi."
      signal={signal}
      sampleRate={sampleRate}
      isPlaying={isPlaying}
      errorMsg={errorMsg || micError}
      onPlay={() => playSignal()}
      onStop={stopPlayback}
      onFileUpload={handleFileUpload}
      onDownload={() => downloadWav('ch22-speech-signal.wav')}
      additionalVisualizer={
        <div className="space-y-2 p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Voice Activity Detection (VAD) Timeline</span>
            <span className="text-emerald-400 font-mono text-[11px]">
              {speechRatio.toFixed(1)}% Wicara Aktif
            </span>
          </div>
          <div className="flex h-8 w-full rounded overflow-hidden border border-slate-800 bg-slate-900">
            {vadSegments.map((seg, idx) => {
              const dur = seg.endSec - seg.startSec;
              const totalDur = signal.length / sampleRate;
              const widthPct = Math.max(1, (dur / totalDur) * 100);
              return (
                <div
                  key={idx}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full transition-all ${
                    seg.isSpeech ? 'bg-emerald-500' : 'bg-slate-800/80'
                  }`}
                  title={`${seg.startSec.toFixed(2)}s - ${seg.endSec.toFixed(2)}s: ${
                    seg.isSpeech ? 'Speech' : 'Silence/Noise'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0.00s</span>
            <span>{(signal.length / sampleRate).toFixed(2)}s</span>
          </div>
        </div>
      }
      controlsChildren={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-300 font-medium block">Rekam Suara Pengguna:</span>
            <p className="text-[11px] text-slate-400">
              Rekam suara wicara vokal (/a/, /i/, /u/) selama 3 detik untuk menguji pendeteksi nada F0.
            </p>
          </div>
          <button
            onClick={handleToggleMic}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow transition ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-primary-600 hover:bg-primary-500 text-white'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? 'Merekam... (3 detik)' : 'Rekam Suara (Mikrofon)'}
          </button>
        </div>
      }
      statsChildren={
        <>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Frekuensi Dasar ($F_0$ / Pitch)</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">
              {pitchInfo.pitchHz > 0 ? `${pitchInfo.pitchHz.toFixed(1)} Hz` : 'Tidak Terdeteksi'}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Keyakinan Autokorelasi</span>
            <span className="text-sm font-semibold font-mono text-sky-400">
              {(pitchInfo.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Klasifikasi Vokal/Konsonan</span>
            <span className="text-sm font-semibold font-mono text-purple-400">
              {pitchInfo.pitchHz > 0 ? 'Voiced Sound' : 'Unvoiced / Silence'}
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block">Durasi Wicara Aktif</span>
            <span className="text-sm font-semibold font-mono text-amber-400">
              {((speechRatio / 100) * (signal.length / sampleRate)).toFixed(2)} detik
            </span>
          </div>
        </>
      }
    />
  );
};

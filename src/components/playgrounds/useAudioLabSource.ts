import { useState, useRef, useEffect, useCallback } from 'react';
import {
  generateSyntheticAudio,
  decodeWavBuffer,
  createWavBlob,
  WaveformType,
} from '../../lib/audioProcessing';

export interface UseAudioLabSourceOptions {
  defaultType?: WaveformType;
  defaultFreq?: number;
  defaultDuration?: number;
  sampleRate?: number;
}

export function useAudioLabSource(options: UseAudioLabSourceOptions = {}) {
  const {
    defaultType = 'sine',
    defaultFreq = 440,
    defaultDuration = 1.0,
    sampleRate = 44100,
  } = options;

  const [signal, setSignal] = useState<Float32Array>(() =>
    generateSyntheticAudio(defaultType, defaultFreq, defaultDuration, sampleRate)
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Update blob URL when signal changes
  useEffect(() => {
    const blob = createWavBlob([signal], sampleRate, 16);
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [signal, sampleRate]);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playSignal = useCallback(async (customSignal?: Float32Array) => {
    const targetSignal = customSignal || signal;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch {}
      }

      const buffer = audioCtxRef.current.createBuffer(1, targetSignal.length, sampleRate);
      buffer.getChannelData(0).set(targetSignal);

      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);

      source.onended = () => {
        setIsPlaying(false);
      };

      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
      setErrorMsg(null);
    } catch (err) {
      console.error('Audio playback error:', err);
      setErrorMsg('Gagal memutar audio. Pastikan interaksi pengguna telah dilakukan.');
      setIsPlaying(false);
    }
  }, [signal, sampleRate]);

  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {}
    }
    setIsPlaying(false);
  }, []);

  const loadPreset = useCallback(
    (type: WaveformType, freq: number = defaultFreq, dur: number = defaultDuration) => {
      stopPlayback();
      const newSig = generateSyntheticAudio(type, freq, dur, sampleRate);
      setSignal(newSig);
      setErrorMsg(null);
    },
    [defaultFreq, defaultDuration, sampleRate, stopPlayback]
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      stopPlayback();
      setErrorMsg(null);

      if (!file.name.toLowerCase().endsWith('.wav')) {
        setErrorMsg('Format file harus berupa WAV audio (.wav).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 5 MB untuk pemrosesan interaktif.');
        return;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const decoded = decodeWavBuffer(arrayBuffer);
        // Take channel 0 (or downmix)
        setSignal(decoded.channels[0]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal membaca file WAV.';
        setErrorMsg(msg);
      }
    },
    [stopPlayback]
  );

  const downloadWav = useCallback(
    (filename: string = 'processed-audio.wav') => {
      if (!audioUrl) return;
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [audioUrl]
  );

  return {
    signal,
    setSignal,
    sampleRate,
    isPlaying,
    audioUrl,
    errorMsg,
    playSignal,
    stopPlayback,
    loadPreset,
    handleFileUpload,
    downloadWav,
  };
}


import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseVideoLabSourceOptions {
  defaultWidth?: number;
  defaultHeight?: number;
  syntheticFps?: number;
}

export function useVideoLabSource(options: UseVideoLabSourceOptions = {}) {
  const { defaultWidth = 320, defaultHeight = 240, syntheticFps = 25 } = options;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [fps, setFps] = useState<number>(syntheticFps);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const syntheticTimerRef = useRef<number | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Stop playback / animation
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (syntheticTimerRef.current) {
      clearInterval(syntheticTimerRef.current);
      syntheticTimerRef.current = null;
    }
    if (videoElementRef.current) {
      videoElementRef.current.pause();
    }
    stopCamera();
  }, [stopCamera]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [stopPlayback, videoUrl]);

  // Handle uploaded video file
  const handleFileUpload = useCallback(
    (file: File) => {
      stopPlayback();
      setErrorMsg(null);

      if (!file.type.startsWith('video/')) {
        setErrorMsg('Format file harus berupa video (.mp4, .webm).');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('Ukuran file video maksimal 25 MB untuk pemrosesan interaktif.');
        return;
      }

      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    },
    [stopPlayback]
  );

  // Toggle user webcam with explicit permissions and graceful handling
  const toggleCamera = useCallback(async () => {
    if (isCameraActive) {
      stopCamera();
      return;
    }

    stopPlayback();
    setErrorMsg(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses MediaDevices / Kamera.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: defaultWidth, height: defaultHeight },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setIsCameraActive(true);
      setIsPlaying(true);

      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      setIsCameraActive(false);
      const msg =
        err instanceof Error
          ? err.message
          : 'Izin kamera ditolak atau perangkat video tidak terdeteksi.';
      setErrorMsg(msg);
    }
  }, [isCameraActive, stopCamera, stopPlayback, defaultWidth, defaultHeight]);

  return {
    isPlaying,
    setIsPlaying,
    isCameraActive,
    videoUrl,
    errorMsg,
    setErrorMsg,
    currentFrameIdx,
    setCurrentFrameIdx,
    fps,
    setFps,
    videoElementRef,
    canvasRef,
    animFrameIdRef,
    syntheticTimerRef,
    stopPlayback,
    stopCamera,
    handleFileUpload,
    toggleCamera,
    defaultWidth,
    defaultHeight,
  };
}


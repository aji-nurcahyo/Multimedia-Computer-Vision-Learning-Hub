import { useState, useRef, useCallback, useEffect } from 'react';

export type SyntheticPreset =
  | 'shapes'
  | 'low_contrast'
  | 'color_bars'
  | 'objects'
  | 'fft_pattern';

const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/gif',
]);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export function drawSyntheticPresetOnCanvas(
  canvas: HTMLCanvasElement,
  preset: SyntheticPreset,
  width = 256,
  height = 256
): void {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (preset === 'low_contrast') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#2a303c');
    grad.addColorStop(1, '#586274');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#485468';
    ctx.fillRect(30, 30, 90, 90);
    ctx.fillStyle = '#627086';
    ctx.beginPath();
    ctx.arc(185, 85, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#505c70';
    ctx.beginPath();
    ctx.moveTo(85, 145);
    ctx.lineTo(150, 225);
    ctx.lineTo(25, 225);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6d7b92';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('LOW CONTRAST TEST', 55, 240);
    return;
  }

  if (preset === 'color_bars') {
    const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'];
    const barW = width / colors.length;
    colors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(i * barW, 0, barW + 1, height * 0.6);
    });
    const graySteps = 8;
    const stepW = width / graySteps;
    for (let i = 0; i < graySteps; i++) {
      const g = Math.round((i / (graySteps - 1)) * 255);
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(i * stepW, height * 0.6, stepW + 1, height * 0.25);
    }
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#ff0000');
    grad.addColorStop(0.33, '#00ff00');
    grad.addColorStop(0.66, '#0000ff');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, height * 0.85, width, height * 0.15);
    return;
  }

  if (preset === 'objects') {
    ctx.fillStyle = '#141923';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#e2e8f0';
    // Circle 1
    ctx.beginPath();
    ctx.arc(62, 66, 32, 0, Math.PI * 2);
    ctx.fill();
    // Circle 2
    ctx.beginPath();
    ctx.arc(185, 70, 26, 0, Math.PI * 2);
    ctx.fill();
    // Rectangle
    ctx.fillRect(40, 150, 74, 52);
    // Elongated ellipse / capsule
    ctx.beginPath();
    ctx.ellipse(180, 180, 44, 20, Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();
    // Tiny speckle noise (for morphology/minArea tests)
    ctx.fillRect(128, 128, 2, 2);
    ctx.fillRect(225, 130, 2, 2);
    return;
  }

  if (preset === 'fft_pattern') {
    ctx.fillStyle = '#101622';
    ctx.fillRect(0, 0, width, height);
    // Crisp high-frequency stripes + low-frequency smooth disk
    ctx.fillStyle = '#e2e8f0';
    for (let x = 20; x < 120; x += 8) {
      ctx.fillRect(x, 30, 3, 90);
    }
    for (let y = 140; y < 230; y += 10) {
      ctx.fillRect(20, y, 100, 4);
    }
    ctx.beginPath();
    ctx.arc(186, 128, 42, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Default 'shapes'
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#1e293b');
  bg.addColorStop(1, '#0f172a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(28, 28, 76, 76);

  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(184, 72, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(72, 148);
  ctx.lineTo(124, 226);
  ctx.lineTo(22, 226);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 2;
  for (let x = 152; x <= 228; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x, 148);
    ctx.lineTo(x, 226);
    ctx.stroke();
  }
}

export function downloadCanvasPng(canvas: HTMLCanvasElement | null, filename: string): boolean {
  if (!canvas) return false;
  if (typeof canvas.toBlob === 'function') {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
    return true;
  }
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
  return true;
}

export function useImageLabSource(defaultPreset: SyntheticPreset, canvasSize = 256) {
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeObjectUrlRef = useRef<string | null>(null);

  const [sourceRevision, setSourceRevision] = useState(0);
  const [imageDims, setImageDims] = useState<{ w: number; h: number }>({ w: canvasSize, h: canvasSize });
  const [sourceLabel, setSourceLabel] = useState<string>('Pola Sintetis Deterministik');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cleanupUrl = useCallback(() => {
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanupUrl();
  }, [cleanupUrl]);

  const resetToPreset = useCallback(
    (preset: SyntheticPreset = defaultPreset) => {
      cleanupUrl();
      setErrorMsg(null);
      const canvas = sourceCanvasRef.current;
      if (!canvas) return;
      drawSyntheticPresetOnCanvas(canvas, preset, canvasSize, canvasSize);
      setImageDims({ w: canvasSize, h: canvasSize });
      setSourceLabel(`Sintetis (${preset})`);
      setSourceRevision((r) => r + 1);
    },
    [canvasSize, cleanupUrl, defaultPreset]
  );

  useEffect(() => {
    resetToPreset(defaultPreset);
  }, [defaultPreset, resetToPreset]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;

      if (!ALLOWED_MIME.has(file.type)) {
        setErrorMsg(
          `Format berkas "${file.type || file.name}" tidak didukung. Gunakan PNG, JPG, WebP, atau BMP.`
        );
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setErrorMsg('Ukuran berkas melebihi batas maksimum 10 MB.');
        return;
      }

      setErrorMsg(null);
      setIsLoading(true);
      cleanupUrl();

      const objectUrl = URL.createObjectURL(file);
      activeObjectUrlRef.current = objectUrl;

      const img = new Image();
      img.onload = () => {
        const canvas = sourceCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            let w = img.width;
            let h = img.height;
            if (w > canvasSize || h > canvasSize) {
              const scale = Math.min(canvasSize / w, canvasSize / h);
              w = Math.max(32, Math.round(w * scale));
              h = Math.max(32, Math.round(h * scale));
            }
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            setImageDims({ w, h });
            setSourceLabel(file.name);
            setSourceRevision((r) => r + 1);
          }
        }
        cleanupUrl();
        setIsLoading(false);
      };
      img.onerror = () => {
        cleanupUrl();
        setIsLoading(false);
        setErrorMsg('Gagal mendekode citra. Pastikan berkas tidak rusak.');
      };
      img.src = objectUrl;
    },
    [canvasSize, cleanupUrl]
  );

  const getSourceImageData = useCallback((): ImageData | null => {
    const canvas = sourceCanvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  return {
    sourceCanvasRef,
    fileInputRef,
    sourceRevision,
    imageDims,
    sourceLabel,
    isLoading,
    errorMsg,
    setErrorMsg,
    resetToPreset,
    handleFileUpload,
    getSourceImageData,
  };
}


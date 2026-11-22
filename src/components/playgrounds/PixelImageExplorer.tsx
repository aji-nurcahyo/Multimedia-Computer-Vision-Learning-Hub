import { useState, useRef, useEffect, useCallback } from 'react';
import { Crosshair } from 'lucide-react';
import {
  extractChannelRgba,
  quantizeBitDepthRgba,
  pixelateDownsampleRgba,
} from '../../lib/imageProcessing';
import { useImageLabSource, downloadCanvasPng } from './useImageLabSource';
import { SharedImageLabShell } from './SharedImageLabShell';

export function PixelImageExplorer() {
  const [channel, setChannel] = useState<'rgb' | 'r' | 'g' | 'b' | 'gray'>('rgb');
  const [bitDepth, setBitDepth] = useState<number>(8);
  const [pixelateFactor, setPixelateFactor] = useState<number>(1);
  const [inspectedPixel, setInspectedPixel] = useState<{
    x: number;
    y: number;
    r: number;
    g: number;
    b: number;
    gray: number;
  }>({ x: 128, y: 128, r: 56, g: 189, b: 248, gray: 156 });

  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  const {
    sourceCanvasRef,
    fileInputRef,
    sourceRevision,
    imageDims,
    sourceLabel,
    isLoading,
    errorMsg,
    resetToPreset,
    handleFileUpload,
    getSourceImageData,
  } = useImageLabSource('shapes', 256);

  const processImage = useCallback(() => {
    const src = getSourceImageData();
    const outCanvas = processedCanvasRef.current;
    if (!src || !outCanvas) return;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    const { width: w, height: h, data } = src;
    outCanvas.width = w;
    outCanvas.height = h;

    let buf = extractChannelRgba(data, channel);
    buf = quantizeBitDepthRgba(buf, bitDepth);
    buf = pixelateDownsampleRgba(buf, w, h, pixelateFactor);
    ctx.putImageData(new ImageData(new Uint8ClampedArray(buf), w, h), 0, 0);
  }, [bitDepth, channel, getSourceImageData, pixelateFactor]);

  useEffect(() => {
    processImage();
  }, [processImage, sourceRevision]);

  const handleInspectMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width - 1, Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height)));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const px = ctx.getImageData(x, y, 1, 1).data;
    const gray = Math.round(0.299 * px[0] + 0.587 * px[1] + 0.114 * px[2]);
    setInspectedPixel({ x, y, r: px[0], g: px[1], b: px[2], gray });
  };

  const rawBytes = imageDims.w * imageDims.h * (channel === 'gray' ? 1 : 3);

  return (
    <SharedImageLabShell
      title="Pixel &amp; Image Explorer (Ch 06)"
      subtitle="Arahkan kursor atau klik citra masukan untuk menginspeksi koordinat (x, y), nilai intensitas piksel, kedalaman bit, dan resolusi spasial."
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onResetAll={() => {
        setChannel('rgb');
        setBitDepth(8);
        setPixelateFactor(1);
        resetToPreset('shapes');
      }}
      onDownload={() => downloadCanvasPng(processedCanvasRef.current, `ch06-pixel-${bitDepth}bit.png`)}
      errorMsg={errorMsg}
      isLoading={isLoading}
      sourceLabel={sourceLabel}
      imageDims={imageDims}
      implementationNote="Canvas HTML5 menyimpan setiap piksel dalam buffer RGBA 8-bit berurutan baris-utama (Row-Major [y, x]). Di Python/OpenCV, cv2.imread menghasilkan array NumPy berurutan BGR."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Isolasi Saluran Warna
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={channel}
            onChange={(e) => setChannel(e.target.value as 'rgb' | 'r' | 'g' | 'b' | 'gray')}
          >
            <option value="rgb">RGB Gabungan (3 Kanal)</option>
            <option value="r">Red Channel Only</option>
            <option value="g">Green Channel Only</option>
            <option value="b">Blue Channel Only</option>
            <option value="gray">Grayscale Luminance (1 Kanal)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Kedalaman Bit: {bitDepth}-bit ({1 << bitDepth} Level)
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={bitDepth}
            onChange={(e) => setBitDepth(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Faktor Downsampling Spasial: {pixelateFactor}×
          </label>
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={pixelateFactor}
            onChange={(e) => setPixelateFactor(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
        </div>
      </div>

      {/* Live Pixel Inspector Readout */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.9rem 1.2rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: `rgb(${inspectedPixel.r}, ${inspectedPixel.g}, ${inspectedPixel.b})`,
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
              <Crosshair size={14} />
              <span>Koordinat (x={inspectedPixel.x}, y={inspectedPixel.y}) · img[{inspectedPixel.y}, {inspectedPixel.x}]</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text)' }}>
              RGB: ({inspectedPixel.r}, {inspectedPixel.g}, {inspectedPixel.b}) · Grayscale: {inspectedPixel.gray}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Estimasi RAM Mentah ({channel === 'gray' ? '1 ch' : '3 ch'}, {bitDepth}-bit):{' '}
          <strong style={{ color: 'var(--text)' }}>
            {((rawBytes * bitDepth) / (8 * 1024)).toFixed(1)} KB
          </strong>
        </div>
      </div>

      <div className="canvas-wrap">
        <div className="canvas-panel">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.5rem' }}>
            Citra Asli (Arahkan Kursor untuk Inspeksi Piksel)
          </div>
          <canvas
            ref={sourceCanvasRef}
            onMouseMove={handleInspectMouse}
            onClick={handleInspectMouse}
            style={{ cursor: 'crosshair' }}
          />
        </div>

        <div className="canvas-panel">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', marginBottom: '0.5rem' }}>
            Keluaran Kuantisasi ({bitDepth}-bit) &amp; Spasial ({pixelateFactor}×)
          </div>
          <canvas ref={processedCanvasRef} />
        </div>
      </div>
    </SharedImageLabShell>
  );
}


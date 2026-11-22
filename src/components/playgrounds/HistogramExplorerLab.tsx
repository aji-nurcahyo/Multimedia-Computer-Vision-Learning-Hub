import { useState, useRef, useEffect, useCallback } from 'react';
import {
  type HistogramMode,
  computeHistograms,
  equalizeHistogramRgba,
  contrastStretchRgba,
  applyClaheRgba,
} from '../../lib/imageProcessing';
import { useImageLabSource, downloadCanvasPng } from './useImageLabSource';
import { SharedImageLabShell } from './SharedImageLabShell';

function drawHistogramPlot(
  canvas: HTMLCanvasElement | null,
  lumHist: Uint32Array,
  cdfLum: Float64Array,
  barColor: string
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, w, h);

  let maxBin = 1;
  for (let i = 0; i < 256; i++) {
    if (lumHist[i] > maxBin) maxBin = lumHist[i];
  }

  ctx.fillStyle = barColor;
  const barW = w / 256;
  for (let i = 0; i < 256; i++) {
    const bh = (lumHist[i] / maxBin) * (h - 14);
    ctx.fillRect(i * barW, h - bh, Math.max(1, barW), bh);
  }

  // Overlay CDF curve
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i < 256; i++) {
    const px = i * barW;
    const py = h - cdfLum[i] * (h - 6);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

export function HistogramExplorerLab() {
  const [mode, setMode] = useState<HistogramMode>('clahe');
  const [clipLimit, setClipLimit] = useState<number>(2.5);
  const [gridSize, setGridSize] = useState<number>(4);

  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const histOrigCanvasRef = useRef<HTMLCanvasElement>(null);
  const histProcCanvasRef = useRef<HTMLCanvasElement>(null);

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
  } = useImageLabSource('low_contrast', 256);

  const runHistogramPipeline = useCallback(() => {
    const src = getSourceImageData();
    const procCanvas = processedCanvasRef.current;
    if (!src || !procCanvas) return;
    const ctx = procCanvas.getContext('2d');
    if (!ctx) return;

    const { width: w, height: h, data } = src;
    procCanvas.width = w;
    procCanvas.height = h;

    const histOrig = computeHistograms(data);
    drawHistogramPlot(histOrigCanvasRef.current, histOrig.lum, histOrig.cdfLum, '#38bdf8');

    let out: Uint8ClampedArray;
    if (mode === 'original') {
      out = new Uint8ClampedArray(data);
    } else if (mode === 'equalize') {
      out = equalizeHistogramRgba(data);
    } else if (mode === 'stretch') {
      out = contrastStretchRgba(data);
    } else {
      out = applyClaheRgba(data, w, h, gridSize, clipLimit);
    }

    ctx.putImageData(new ImageData(new Uint8ClampedArray(out), w, h), 0, 0);
    const histProc = computeHistograms(out);
    drawHistogramPlot(histProcCanvasRef.current, histProc.lum, histProc.cdfLum, '#34d399');
  }, [clipLimit, getSourceImageData, gridSize, mode]);

  useEffect(() => {
    runHistogramPipeline();
  }, [runHistogramPipeline, sourceRevision]);

  return (
    <SharedImageLabShell
      title="Histogram Processing &amp; CLAHE Explorer (Ch 09)"
      subtitle="Visualisasi histogram luminansi 256-bin dan fungsi distribusi kumulatif (CDF) sebelum vs sesudah Global Equalization, Contrast Stretching, dan CLAHE."
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onResetAll={() => {
        setMode('clahe');
        setClipLimit(2.5);
        setGridSize(4);
        resetToPreset('low_contrast');
      }}
      onDownload={() => downloadCanvasPng(processedCanvasRef.current, `ch09-${mode}.png`)}
      errorMsg={errorMsg}
      isLoading={isLoading}
      sourceLabel={sourceLabel}
      imageDims={imageDims}
      implementationNote="Ekualisasi histogram & CLAHE memproses kanal luminansi (Y) lalu menskalakan RGB secara proporsional untuk menjaga keutuhan rona warna, sejalan dengan praktik pemrosesan pada ruang warna YCrCb/LAB di OpenCV."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Metode Peningkatan Kontras
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={mode}
            onChange={(e) => setMode(e.target.value as HistogramMode)}
          >
            <option value="clahe">CLAHE (Adaptive Local Equalization)</option>
            <option value="equalize">Global Histogram Equalization (CDF)</option>
            <option value="stretch">Min-Max Contrast Stretching</option>
            <option value="original">Tanpa Proses (Original)</option>
          </select>
        </div>

        {mode === 'clahe' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Clip Limit Factor: {clipLimit.toFixed(1)}
              </label>
              <input
                type="range"
                min="1.2"
                max="8.0"
                step="0.4"
                value={clipLimit}
                onChange={(e) => setClipLimit(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.4rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Tile Grid Size: {gridSize} × {gridSize}
              </label>
              <select
                className="select-filter"
                style={{ width: '100%' }}
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
              >
                <option value={2}>2 × 2 Tiles</option>
                <option value={4}>4 × 4 Tiles</option>
                <option value={8}>8 × 8 Tiles</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="canvas-wrap">
        <div className="canvas-panel">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.4rem' }}>
            Citra Asli
          </div>
          <canvas ref={sourceCanvasRef} />
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.6rem 0 0.25rem' }}>
            Histogram Asli + Kurva CDF (Oranye)
          </div>
          <canvas ref={histOrigCanvasRef} width={256} height={95} />
        </div>

        <div className="canvas-panel">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', marginBottom: '0.4rem' }}>
            Hasil ({mode.toUpperCase()})
          </div>
          <canvas ref={processedCanvasRef} />
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.6rem 0 0.25rem' }}>
            Histogram Hasil + Kurva CDF (Oranye)
          </div>
          <canvas ref={histProcCanvasRef} width={256} height={95} />
        </div>
      </div>
    </SharedImageLabShell>
  );
}


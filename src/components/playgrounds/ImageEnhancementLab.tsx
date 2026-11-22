import { useState, useRef, useEffect, useCallback } from 'react';
import {
  type IntensityMode,
  applyIntensityTransformRgba,
} from '../../lib/imageProcessing';
import { useImageLabSource, downloadCanvasPng } from './useImageLabSource';
import { SharedImageLabShell } from './SharedImageLabShell';

export function ImageEnhancementLab() {
  const [mode, setMode] = useState<IntensityMode>('bc_gamma');
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(1.2);
  const [gamma, setGamma] = useState<number>(0.8);
  const [lowIn, setLowIn] = useState<number>(35);
  const [highIn, setHighIn] = useState<number>(150);

  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const curveCanvasRef = useRef<HTMLCanvasElement>(null);

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

  const applyTransform = useCallback(() => {
    const src = getSourceImageData();
    const procCanvas = processedCanvasRef.current;
    if (!src || !procCanvas) return;
    const ctx = procCanvas.getContext('2d');
    if (!ctx) return;

    procCanvas.width = src.width;
    procCanvas.height = src.height;
    const { output, lut } = applyIntensityTransformRgba(src.data, {
      mode,
      brightness,
      contrast,
      gamma,
      lowIn,
      highIn,
    });
    ctx.putImageData(new ImageData(new Uint8ClampedArray(output), src.width, src.height), 0, 0);

    // Draw Intensity Transfer Function s = T(r)
    const cCanvas = curveCanvasRef.current;
    if (cCanvas) {
      const cCtx = cCanvas.getContext('2d');
      if (cCtx) {
        const w = cCanvas.width;
        const h = cCanvas.height;
        cCtx.fillStyle = '#020617';
        cCtx.fillRect(0, 0, w, h);

        // Identity line
        cCtx.strokeStyle = '#334155';
        cCtx.setLineDash([4, 4]);
        cCtx.beginPath();
        cCtx.moveTo(0, h);
        cCtx.lineTo(w, 0);
        cCtx.stroke();
        cCtx.setLineDash([]);

        // Active LUT curve
        cCtx.strokeStyle = '#38bdf8';
        cCtx.lineWidth = 2.5;
        cCtx.beginPath();
        for (let r = 0; r < 256; r++) {
          const px = (r / 255) * w;
          const py = h - (lut[r] / 255) * h;
          if (r === 0) cCtx.moveTo(px, py);
          else cCtx.lineTo(px, py);
        }
        cCtx.stroke();
      }
    }
  }, [brightness, contrast, gamma, getSourceImageData, highIn, lowIn, mode]);

  useEffect(() => {
    applyTransform();
  }, [applyTransform, sourceRevision]);

  return (
    <SharedImageLabShell
      title="Image Enhancement &amp; Intensity Transformation Lab (Ch 08)"
      subtitle="Eksperimen Brightness, Contrast, Gamma Correction (Power-Law), Log Transform, Image Negative, dan Piecewise Contrast Stretching."
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onResetAll={() => {
        setMode('bc_gamma');
        setBrightness(0);
        setContrast(1.2);
        setGamma(0.8);
        setLowIn(35);
        setHighIn(150);
        resetToPreset('low_contrast');
      }}
      onDownload={() => downloadCanvasPng(processedCanvasRef.current, `ch08-${mode}-enhanced.png`)}
      errorMsg={errorMsg}
      isLoading={isLoading}
      sourceLabel={sourceLabel}
      imageDims={imageDims}
      implementationNote="Transformasi piksel menggunakan Look-Up Table (LUT) 256-entri berkecepatan O(1) per piksel sehingga setara persis dengan cv2.LUT(img, lut) di OpenCV."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Fungsi Transformasi
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={mode}
            onChange={(e) => setMode(e.target.value as IntensityMode)}
          >
            <option value="bc_gamma">Brightness + Contrast + Gamma</option>
            <option value="contrast_stretch">Piecewise Contrast Stretching</option>
            <option value="log">Log Transform s = c·log(1+r)</option>
            <option value="negative">Image Negative (255 - r)</option>
          </select>
        </div>

        {mode === 'bc_gamma' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Brightness (β): {brightness > 0 ? `+${brightness}` : brightness}
              </label>
              <input type="range" min="-100" max="100" step="5" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Contrast (α): {contrast.toFixed(2)}×
              </label>
              <input type="range" min="0.4" max="2.5" step="0.05" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Gamma (γ): {gamma.toFixed(2)}
              </label>
              <input type="range" min="0.2" max="3.0" step="0.1" value={gamma} onChange={(e) => setGamma(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
          </>
        )}

        {mode === 'contrast_stretch' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Batas Bawah (r₁): {lowIn}
              </label>
              <input type="range" min="0" max="120" step="5" value={lowIn} onChange={(e) => setLowIn(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Batas Atas (r₂): {highIn}
              </label>
              <input type="range" min="130" max="255" step="5" value={highIn} onChange={(e) => setHighIn(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
          </>
        )}
      </div>

      <div className="canvas-wrap">
        <div className="canvas-panel">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.5rem' }}>
            Citra Asli f(x,y)
          </div>
          <canvas ref={sourceCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', marginBottom: '0.5rem' }}>
            Hasil Transformasi s = T(r)
          </div>
          <canvas ref={processedCanvasRef} />
        </div>
        <div className="canvas-panel" style={{ maxWidth: '240px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.5rem' }}>
            Kurva Pemetaan T(r)
          </div>
          <canvas ref={curveCanvasRef} width={190} height={190} />
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Sumbu X: Input r [0–255] · Sumbu Y: Output s [0–255]
          </div>
        </div>
      </div>
    </SharedImageLabShell>
  );
}


import { useState, useRef, useEffect, useCallback } from 'react';
import {
  rgbaToGrayscale,
  grayToRgba,
  frequencyFilter2d,
} from '../../lib/imageProcessing';
import { useImageLabSource, downloadCanvasPng } from './useImageLabSource';
import { SharedImageLabShell } from './SharedImageLabShell';

export function FftExplorerLab() {
  const [filterKind, setFilterKind] = useState<'ideal' | 'butterworth' | 'gaussian'>('gaussian');
  const [passType, setPassType] = useState<'low' | 'high'>('low');
  const [d0, setD0] = useState<number>(18);
  const [order, setOrder] = useState<number>(2);

  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const reconstructedCanvasRef = useRef<HTMLCanvasElement>(null);

  const fftSize = 128;

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
  } = useImageLabSource('fft_pattern', fftSize);

  const runFft = useCallback(() => {
    const srcCanvas = sourceCanvasRef.current;
    if (!srcCanvas) return;
    const ctxSrc = srcCanvas.getContext('2d');
    if (!ctxSrc) return;

    // Resample current source image into exact 128x128 power-of-2 grid for Radix-2 FFT
    const offscreen = document.createElement('canvas');
    offscreen.width = fftSize;
    offscreen.height = fftSize;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    offCtx.drawImage(srcCanvas, 0, 0, fftSize, fftSize);
    const imgData = offCtx.getImageData(0, 0, fftSize, fftSize);
    const gray = rgbaToGrayscale(imgData.data, fftSize, fftSize);

    const { filteredGray, spectrumRgba, maskRgba } = frequencyFilter2d(gray, fftSize, {
      filterKind,
      passType,
      d0,
      order,
    });

    const paint = (ref: React.RefObject<HTMLCanvasElement | null>, rgba: Uint8ClampedArray) => {
      const c = ref.current;
      if (!c) return;
      c.width = fftSize;
      c.height = fftSize;
      c.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(rgba), fftSize, fftSize), 0, 0);
    };

    paint(spectrumCanvasRef, spectrumRgba);
    paint(maskCanvasRef, maskRgba);
    paint(reconstructedCanvasRef, grayToRgba(filteredGray, fftSize, fftSize));
  }, [d0, filterKind, order, passType, sourceCanvasRef]);

  useEffect(() => {
    runFft();
  }, [runFft, sourceRevision]);

  return (
    <SharedImageLabShell
      title="2D FFT Frequency Domain Explorer (Ch 11)"
      subtitle="Transformasi Fourier Cepat 2D (Radix-2 FFT) waktu nyata: amati spektrum magnitudo logaritmik terpusat, masker filter H(u,v), dan hasil rekonstruksi IFFT."
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onResetAll={() => {
        setFilterKind('gaussian');
        setPassType('low');
        setD0(18);
        setOrder(2);
        resetToPreset('fft_pattern');
      }}
      onDownload={() => downloadCanvasPng(reconstructedCanvasRef.current, `ch11-fft-${filterKind}-${passType}.png`)}
      errorMsg={errorMsg}
      isLoading={isLoading}
      sourceLabel={sourceLabel}
      imageDims={imageDims}
      implementationNote="Implementasi browser menggunakan Radix-2 Cooley-Tukey 2D FFT murni pada grid pangkat dua (128×128), sedangkan NumPy np.fft.fft2 mendukung sembarang dimensi melalui algoritma Bluestein/mixed-radix."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Arsitektur Filter H(u,v)
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value as 'ideal' | 'butterworth' | 'gaussian')}
          >
            <option value="gaussian">Gaussian (Tanpa Ringing)</option>
            <option value="butterworth">Butterworth (Order n)</option>
            <option value="ideal">Ideal Cut-off (Ada Ringing)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Tipe Pelolosan Frekuensi
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={passType}
            onChange={(e) => setPassType(e.target.value as 'low' | 'high')}
          >
            <option value="low">Low-Pass Filter (Smoothing)</option>
            <option value="high">High-Pass Filter (Edges/Detail)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Frekuensi Cut-off (D₀): {d0} px
          </label>
          <input type="range" min="3" max="60" step="1" value={d0} onChange={(e) => setD0(Number(e.target.value))} style={{ width: '100%', marginTop: '0.4rem' }} />
        </div>

        {filterKind === 'butterworth' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Orde Butterworth (n): {order}
            </label>
            <input type="range" min="1" max="6" step="1" value={order} onChange={(e) => setOrder(Number(e.target.value))} style={{ width: '100%', marginTop: '0.4rem' }} />
          </div>
        )}
      </div>

      <div className="canvas-wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.4rem' }}>
            1. Spasial Asli f(x,y)
          </div>
          <canvas ref={sourceCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.4rem' }}>
            2. Masker Filter H(u,v)
          </div>
          <canvas ref={maskCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a78bfa', marginBottom: '0.4rem' }}>
            3. Log Spektrum Terfilter
          </div>
          <canvas ref={spectrumCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#34d399', marginBottom: '0.4rem' }}>
            4. Rekonstruksi IFFT g(x,y)
          </div>
          <canvas ref={reconstructedCanvasRef} />
        </div>
      </div>
    </SharedImageLabShell>
  );
}


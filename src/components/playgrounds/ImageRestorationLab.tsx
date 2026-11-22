import { useState, useRef, useEffect, useCallback } from 'react';
import {
  type NoiseType,
  type DenoiseMethod,
  addSyntheticNoiseRgba,
  convolve2dRgba,
  medianFilterRgba,
  bilateralFilterRgba,
  fastNlmRgba,
  wienerDenoiseRgba,
  computeMsePsnr,
  computeSsim,
} from '../../lib/imageProcessing';
import { useImageLabSource, downloadCanvasPng } from './useImageLabSource';
import { SharedImageLabShell } from './SharedImageLabShell';

export function ImageRestorationLab() {
  const [noiseType, setNoiseType] = useState<NoiseType>('gaussian');
  const [noiseAmount, setNoiseAmount] = useState<number>(22);
  const [denoiseMethod, setDenoiseMethod] = useState<DenoiseMethod>('bilateral');
  const [metrics, setMetrics] = useState<{
    noisyPsnr: number;
    noisySsim: number;
    restPsnr: number;
    restSsim: number;
  }>({ noisyPsnr: 0, noisySsim: 1, restPsnr: 0, restSsim: 1 });

  const noisyCanvasRef = useRef<HTMLCanvasElement>(null);
  const restoredCanvasRef = useRef<HTMLCanvasElement>(null);

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
  } = useImageLabSource('shapes', 192);

  const runRestoration = useCallback(() => {
    const src = getSourceImageData();
    const noisyCanvas = noisyCanvasRef.current;
    const restCanvas = restoredCanvasRef.current;
    if (!src || !noisyCanvas || !restCanvas) return;

    const { width: w, height: h, data: clean } = src;
    noisyCanvas.width = w;
    noisyCanvas.height = h;
    restCanvas.width = w;
    restCanvas.height = h;

    // Normalize intensity/density parameter by noise type
    const scaledAmt =
      noiseType === 'salt_pepper'
        ? Math.min(0.4, noiseAmount / 200)
        : noiseType === 'speckle'
        ? Math.min(0.6, noiseAmount / 100)
        : noiseAmount;

    const noisy = addSyntheticNoiseRgba(clean, noiseType, scaledAmt, 101);
    noisyCanvas.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(noisy), w, h), 0, 0);

    let restored: Uint8ClampedArray;
    if (denoiseMethod === 'none') {
      restored = noisy;
    } else if (denoiseMethod === 'mean') {
      const box3 = [
        [1 / 9, 1 / 9, 1 / 9],
        [1 / 9, 1 / 9, 1 / 9],
        [1 / 9, 1 / 9, 1 / 9],
      ];
      restored = convolve2dRgba(noisy, w, h, box3, 'reflect');
    } else if (denoiseMethod === 'median') {
      restored = medianFilterRgba(noisy, w, h, 3, 'reflect');
    } else if (denoiseMethod === 'bilateral') {
      restored = bilateralFilterRgba(noisy, w, h, 2, Math.max(20, noiseAmount * 1.6), 2.0);
    } else if (denoiseMethod === 'nlm') {
      restored = fastNlmRgba(noisy, w, h, 3, Math.max(12, noiseAmount * 0.9));
    } else {
      const nv = noiseType === 'gaussian' ? noiseAmount * noiseAmount : 600;
      restored = wienerDenoiseRgba(noisy, w, h, nv);
    }

    restCanvas.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(restored), w, h), 0, 0);

    const nM = computeMsePsnr(clean, noisy);
    const nS = computeSsim(clean, noisy, w, h);
    const rM = computeMsePsnr(clean, restored);
    const rS = computeSsim(clean, restored, w, h);
    setMetrics({ noisyPsnr: nM.psnr, noisySsim: nS, restPsnr: rM.psnr, restSsim: rS });
  }, [denoiseMethod, getSourceImageData, noiseAmount, noiseType]);

  useEffect(() => {
    runRestoration();
  }, [runRestoration, sourceRevision]);

  return (
    <SharedImageLabShell
      title="Image Restoration &amp; Noise Reduction Lab (Ch 12)"
      subtitle="Tambahkan noise sintetis deterministik (Gaussian, Salt-and-Pepper, Speckle), aplikasikan algoritma restorasi, dan bandingkan metrik kuantitatif PSNR (dB) serta SSIM."
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onResetAll={() => {
        setNoiseType('gaussian');
        setNoiseAmount(22);
        setDenoiseMethod('bilateral');
        resetToPreset('shapes');
      }}
      onDownload={() => downloadCanvasPng(restoredCanvasRef.current, `ch12-${denoiseMethod}-restored.png`)}
      errorMsg={errorMsg}
      isLoading={isLoading}
      sourceLabel={sourceLabel}
      imageDims={imageDims}
      implementationNote="Filter Wiener menggunakan estimator MMSE statistik lokal (Lee adaptive Wiener) pada citra beresolusi 192×192 agar Bilateral & Non-Local Means berjalan mulus secara real-time di CPU browser. Pada Python/OpenCV digunakan cv2.bilateralFilter dan cv2.fastNlMeansDenoising."
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
            Model Derau (Noise Type)
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={noiseType}
            onChange={(e) => setNoiseType(e.target.value as NoiseType)}
          >
            <option value="gaussian">Gaussian Additive Noise (σ)</option>
            <option value="salt_pepper">Salt &amp; Pepper Impulse Noise</option>
            <option value="speckle">Speckle Multiplicative Noise</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Intensitas Noise: {noiseAmount}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="3"
            value={noiseAmount}
            onChange={(e) => setNoiseAmount(Number(e.target.value))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Algoritma Restorasi (Denoiser)
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={denoiseMethod}
            onChange={(e) => setDenoiseMethod(e.target.value as DenoiseMethod)}
          >
            <option value="bilateral">Bilateral Filter (Edge-Preserving)</option>
            <option value="nlm">Non-Local Means (Patch Similarity)</option>
            <option value="median">Median Filter (3×3 Impulse)</option>
            <option value="wiener">Adaptive Wiener Filter</option>
            <option value="mean">Box Mean Filter (3×3)</option>
            <option value="none">Tanpa Denoising</option>
          </select>
        </div>
      </div>

      <div className="canvas-wrap">
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.4rem' }}>
            1. Referensi Bersih (Ground Truth)
          </div>
          <canvas ref={sourceCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f87171', marginBottom: '0.4rem' }}>
            2. Citra Terdegradasi ({noiseType})
          </div>
          <canvas ref={noisyCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#34d399', marginBottom: '0.4rem' }}>
            3. Hasil Restorasi ({denoiseMethod})
          </div>
          <canvas ref={restoredCanvasRef} />
        </div>
      </div>

      {/* Quantitative Metrics Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ background: 'var(--bg-subtle)', padding: '0.9rem', borderRadius: '8px', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Kualitas Citra Berderau (Noisy)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)', marginTop: '0.25rem' }}>
            PSNR: {metrics.noisyPsnr.toFixed(2)} dB · SSIM: {metrics.noisySsim.toFixed(3)}
          </div>
        </div>
        <div style={{ background: 'var(--bg-subtle)', padding: '0.9rem', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Kualitas Setelah Restorasi</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginTop: '0.25rem' }}>
            PSNR: {metrics.restPsnr.toFixed(2)} dB · SSIM: {metrics.restSsim.toFixed(3)}
          </div>
        </div>
      </div>
    </SharedImageLabShell>
  );
}


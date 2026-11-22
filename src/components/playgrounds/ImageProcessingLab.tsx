import { useState, useRef, useEffect, useCallback } from 'react';
import { Eye } from 'lucide-react';
import {
  type BorderMode,
  type FilterKernelMode,
  generateGaussianKernel2d,
  convolve2dRgba,
  medianFilterRgba,
  extractChannelRgba,
} from '../../lib/imageProcessing';
import { useImageLabSource, downloadCanvasPng } from './useImageLabSource';
import { SharedImageLabShell } from './SharedImageLabShell';

export function ImageProcessingLab() {
  const [filterType, setFilterType] = useState<FilterKernelMode>('gaussian');
  const [kernelSize, setKernelSize] = useState<number>(5);
  const [sigma, setSigma] = useState<number>(1.2);
  const [borderMode, setBorderMode] = useState<BorderMode>('reflect');
  const [kernelMatrix, setKernelMatrix] = useState<number[][]>([]);

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

  useEffect(() => {
    if (filterType === 'gaussian') {
      setKernelMatrix(generateGaussianKernel2d(kernelSize, sigma));
    } else if (filterType === 'box') {
      const val = 1 / (kernelSize * kernelSize);
      setKernelMatrix(
        Array(kernelSize)
          .fill(0)
          .map(() => Array(kernelSize).fill(val))
      );
    } else if (filterType === 'sharpen') {
      setKernelMatrix([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0],
      ]);
    } else if (filterType === 'sobel') {
      setKernelMatrix([
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
      ]);
    } else {
      setKernelMatrix([]);
    }
  }, [filterType, kernelSize, sigma]);

  const applyFilter = useCallback(() => {
    const srcData = getSourceImageData();
    const procCanvas = processedCanvasRef.current;
    if (!srcData || !procCanvas) return;
    const ctxProc = procCanvas.getContext('2d');
    if (!ctxProc) return;

    const { width: w, height: h, data } = srcData;
    procCanvas.width = w;
    procCanvas.height = h;

    let resultData: Uint8ClampedArray;
    if (filterType === 'grayscale') {
      resultData = extractChannelRgba(data, 'gray');
    } else if (filterType === 'median') {
      resultData = medianFilterRgba(data, w, h, kernelSize, borderMode);
    } else {
      if (kernelMatrix.length === 0) return;
      resultData = convolve2dRgba(data, w, h, kernelMatrix, borderMode);
    }

    const outImg = new ImageData(new Uint8ClampedArray(resultData), w, h);
    ctxProc.putImageData(outImg, 0, 0);
  }, [borderMode, filterType, getSourceImageData, kernelMatrix, kernelSize]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter, sourceRevision]);

  const handleResetAll = () => {
    setFilterType('gaussian');
    setKernelSize(5);
    setSigma(1.2);
    setBorderMode('reflect');
    resetToPreset('shapes');
  };

  return (
    <SharedImageLabShell
      title="Interactive Spatial Filtering &amp; Convolution Lab (Ch 10)"
      subtitle="Eksperimen konvolusi spasial 2D, median filtering non-linier, border padding, dan inspeksi matriks bobot kernel."
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onResetAll={handleResetAll}
      onDownload={() => downloadCanvasPng(processedCanvasRef.current, `ch10-${filterType}-filtered.png`)}
      errorMsg={errorMsg}
      isLoading={isLoading}
      sourceLabel={sourceLabel}
      imageDims={imageDims}
      implementationNote="Browser mengonversi citra pada ruang RGBA (uint8) menggunakan konvolusi diskrit sejati (rotasi kernel 180°), sedangkan OpenCV cv2.filter2D menggunakan urutan saluran BGR dan korelasi terakselerasi SIMD."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Tipe Penapis (Filter Mode)
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterKernelMode)}
          >
            <option value="gaussian">Gaussian Blur (Linear)</option>
            <option value="box">Box Mean Filter (Linear)</option>
            <option value="median">Median Filter (Non-Linear)</option>
            <option value="sharpen">Laplacian Sharpening</option>
            <option value="sobel">Sobel Horizontal Gradient</option>
            <option value="grayscale">Grayscale Luminance</option>
          </select>
        </div>

        {(filterType === 'gaussian' || filterType === 'box' || filterType === 'median') && (
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Ukuran Jendela: {kernelSize} × {kernelSize}
            </label>
            <select
              className="select-filter"
              style={{ width: '100%' }}
              value={kernelSize}
              onChange={(e) => setKernelSize(Number(e.target.value))}
            >
              <option value={3}>3 × 3</option>
              <option value={5}>5 × 5</option>
              <option value={7}>7 × 7</option>
            </select>
          </div>
        )}

        {filterType === 'gaussian' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Standar Deviasi (σ): {sigma.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.4"
              max="3.6"
              step="0.2"
              value={sigma}
              onChange={(e) => setSigma(Number(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
          </div>
        )}

        {filterType !== 'grayscale' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Penanganan Batas (Padding)
            </label>
            <select
              className="select-filter"
              style={{ width: '100%' }}
              value={borderMode}
              onChange={(e) => setBorderMode(e.target.value as BorderMode)}
            >
              <option value="reflect">Reflect (BORDER_REFLECT)</option>
              <option value="replicate">Replicate (BORDER_REPLICATE)</option>
              <option value="zero">Zero Padding (BORDER_CONSTANT)</option>
            </select>
          </div>
        )}
      </div>

      <div className="canvas-wrap">
        <div className="canvas-panel">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.5rem' }}>
            Citra Masukan f(x,y)
          </div>
          <canvas ref={sourceCanvasRef} />
        </div>

        <div className="canvas-panel">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', marginBottom: '0.5rem' }}>
            Hasil Spatial Filtering g(x,y)
          </div>
          <canvas ref={processedCanvasRef} />
        </div>
      </div>

      {kernelMatrix.length > 0 && (
        <div
          style={{
            marginTop: '1.25rem',
            background: 'var(--bg-subtle)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Eye size={16} color="var(--primary)" />
            <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              Inspeksi Matriks Kernel ({kernelMatrix.length} × {kernelMatrix.length})
            </strong>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                margin: '0 auto',
                borderCollapse: 'collapse',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textAlign: 'center',
              }}
            >
              <tbody>
                {kernelMatrix.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        style={{
                          padding: '0.3rem 0.5rem',
                          border: '1px solid var(--border)',
                          background:
                            val > 0.05
                              ? `rgba(56, 189, 248, ${Math.min(0.85, val * 3)})`
                              : 'transparent',
                          color: val > 0.12 ? '#090d16' : 'var(--text)',
                          fontWeight: val > 0.1 ? 'bold' : 'normal',
                        }}
                      >
                        {val.toFixed(4)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Total Jumlahan Bobot Matriks: {kernelMatrix.flat().reduce((a, b) => a + b, 0).toFixed(6)}
          </div>
        </div>
      )}
    </SharedImageLabShell>
  );
}

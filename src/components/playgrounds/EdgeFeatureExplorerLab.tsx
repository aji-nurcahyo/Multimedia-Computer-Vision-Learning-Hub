import { useState, useRef, useEffect, useCallback } from 'react';
import {
  type EdgeOperator,
  rgbaToGrayscale,
  grayToRgba,
  detectEdgesClassical,
  cannyEdgeDetector,
  harrisCornerDetector,
} from '../../lib/imageProcessing';
import { useImageLabSource, downloadCanvasPng } from './useImageLabSource';
import { SharedImageLabShell } from './SharedImageLabShell';

export function EdgeFeatureExplorerLab() {
  const [operator, setOperator] = useState<EdgeOperator>('canny');
  const [cannySigma, setCannySigma] = useState<number>(1.2);
  const [lowThresh, setLowThresh] = useState<number>(35);
  const [highThresh, setHighThresh] = useState<number>(95);
  const [harrisRatio, setHarrisRatio] = useState<number>(0.05);
  const [featureCount, setFeatureCount] = useState<number>(0);

  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

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

  const runDetection = useCallback(() => {
    const src = getSourceImageData();
    const outCanvas = outputCanvasRef.current;
    if (!src || !outCanvas) return;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    const { width: w, height: h, data } = src;
    outCanvas.width = w;
    outCanvas.height = h;

    const gray = rgbaToGrayscale(data, w, h);

    if (operator === 'harris') {
      // Draw original image dimmed and overlay detected corners
      ctx.putImageData(src, 0, 0);
      const corners = harrisCornerDetector(gray, w, h, 0.04, harrisRatio);
      setFeatureCount(corners.length);
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#facc15';
      ctx.lineWidth = 1.5;
      for (const c of corners) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      return;
    }

    let edgeGray: Uint8ClampedArray;
    if (operator === 'canny') {
      edgeGray = cannyEdgeDetector(gray, w, h, cannySigma, lowThresh, highThresh);
    } else {
      edgeGray = detectEdgesClassical(gray, w, h, operator);
    }

    let activeCount = 0;
    for (let i = 0; i < edgeGray.length; i++) {
      if (edgeGray[i] > 128) activeCount++;
    }
    setFeatureCount(activeCount);
    ctx.putImageData(new ImageData(new Uint8ClampedArray(grayToRgba(edgeGray, w, h)), w, h), 0, 0);
  }, [cannySigma, getSourceImageData, harrisRatio, highThresh, lowThresh, operator]);

  useEffect(() => {
    runDetection();
  }, [runDetection, sourceRevision]);

  return (
    <SharedImageLabShell
      title="Edge Detection &amp; Feature Explorer (Ch 13)"
      subtitle="Eksperimen gradien Sobel, Prewitt, Laplacian, pipeline multi-tahap Canny (NMS + Hysteresis), serta detektor sudut Harris."
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onResetAll={() => {
        setOperator('canny');
        setCannySigma(1.2);
        setLowThresh(35);
        setHighThresh(95);
        setHarrisRatio(0.05);
        resetToPreset('shapes');
      }}
      onDownload={() => downloadCanvasPng(outputCanvasRef.current, `ch13-${operator}-features.png`)}
      errorMsg={errorMsg}
      isLoading={isLoading}
      sourceLabel={sourceLabel}
      imageDims={imageDims}
      implementationNote="Detektor Canny di sini mengeksekusi lengkap 4 tahap kanonikal (Gaussian -> Sobel Magnitude/Direction -> Non-Maximum Suppression -> Hysteresis Linking) selaras dengan cv2.Canny dan cv2.cornerHarris."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-subtle)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Operator Tepi / Fitur
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={operator}
            onChange={(e) => setOperator(e.target.value as EdgeOperator)}
          >
            <option value="canny">Canny Edge Detector (Multi-Stage)</option>
            <option value="sobel">Sobel Gradient Magnitude</option>
            <option value="prewitt">Prewitt Gradient Magnitude</option>
            <option value="laplacian">Laplacian 2nd Derivative</option>
            <option value="harris">Harris Corner Detector (R &gt; thresh)</option>
          </select>
        </div>

        {operator === 'canny' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Gaussian σ: {cannySigma.toFixed(1)}
              </label>
              <input type="range" min="0.6" max="2.5" step="0.2" value={cannySigma} onChange={(e) => setCannySigma(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Low Threshold: {lowThresh}
              </label>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={lowThresh}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setLowThresh(v);
                  if (v >= highThresh) setHighThresh(v + 15);
                }}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                High Threshold: {highThresh}
              </label>
              <input
                type="range"
                min="30"
                max="220"
                step="5"
                value={highThresh}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setHighThresh(Math.max(v, lowThresh + 10));
                }}
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}

        {operator === 'harris' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              R Threshold Ratio: {harrisRatio.toFixed(2)}
            </label>
            <input type="range" min="0.01" max="0.25" step="0.01" value={harrisRatio} onChange={(e) => setHarrisRatio(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        )}
      </div>

      <div className="canvas-wrap">
        <div className="canvas-panel">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.5rem' }}>
            Citra Masukan
          </div>
          <canvas ref={sourceCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', marginBottom: '0.5rem' }}>
            {operator === 'harris'
              ? `Deteksi Sudut Harris (${featureCount} Sudut Terdeteksi)`
              : `Peta Tepi (${featureCount} Piksel Tepi Aktif)`}
          </div>
          <canvas ref={outputCanvasRef} />
        </div>
      </div>
    </SharedImageLabShell>
  );
}


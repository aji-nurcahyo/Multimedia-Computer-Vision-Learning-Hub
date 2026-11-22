import { useState, useRef, useEffect, useCallback } from 'react';
import {
  type SegmentMethod,
  type SegmentedObjectStats,
  rgbaToGrayscale,
  grayToRgba,
  thresholdGlobalMask,
  thresholdAdaptiveMean,
  computeOtsuThreshold,
  connectedComponentsAnalysis,
} from '../../lib/imageProcessing';
import { useImageLabSource, downloadCanvasPng } from './useImageLabSource';
import { SharedImageLabShell } from './SharedImageLabShell';

export function SegmentationLab() {
  const [method, setMethod] = useState<SegmentMethod>('otsu');
  const [globalThresh, setGlobalThresh] = useState<number>(115);
  const [blockSize, setBlockSize] = useState<number>(21);
  const [minArea, setMinArea] = useState<number>(30);
  const [otsuThresholdUsed, setOtsuThresholdUsed] = useState<number>(0);
  const [objects, setObjects] = useState<SegmentedObjectStats[]>([]);

  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const ccCanvasRef = useRef<HTMLCanvasElement>(null);

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
  } = useImageLabSource('objects', 256);

  const runSegmentation = useCallback(() => {
    const src = getSourceImageData();
    const maskC = maskCanvasRef.current;
    const ccC = ccCanvasRef.current;
    if (!src || !maskC || !ccC) return;

    const { width: w, height: h, data } = src;
    maskC.width = w;
    maskC.height = h;
    ccC.width = w;
    ccC.height = h;

    const gray = rgbaToGrayscale(data, w, h);
    let mask: Uint8ClampedArray;
    if (method === 'otsu') {
      const res = computeOtsuThreshold(gray);
      setOtsuThresholdUsed(res.threshold);
      mask = res.mask;
    } else if (method === 'adaptive') {
      mask = thresholdAdaptiveMean(gray, w, h, blockSize, -8);
    } else {
      mask = thresholdGlobalMask(gray, globalThresh);
    }

    maskC.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(grayToRgba(mask, w, h)), w, h), 0, 0);

    const { coloredRgba, objects: detObjects } = connectedComponentsAnalysis(mask, w, h, minArea);
    setObjects(detObjects);

    const ccCtx = ccC.getContext('2d');
    if (ccCtx) {
      ccCtx.putImageData(new ImageData(new Uint8ClampedArray(coloredRgba), w, h), 0, 0);
      // Overlay bounding boxes and ID labels
      ccCtx.strokeStyle = '#ffffff';
      ccCtx.lineWidth = 1.2;
      ccCtx.font = 'bold 11px monospace';
      ccCtx.fillStyle = '#ffffff';
      for (const obj of detObjects.slice(0, 25)) {
        ccCtx.strokeRect(obj.bbox.x, obj.bbox.y, obj.bbox.w, obj.bbox.h);
        ccCtx.fillText(`#${obj.id}`, Math.max(4, obj.cx - 8), Math.max(12, obj.cy + 4));
      }
    }
  }, [blockSize, getSourceImageData, globalThresh, method, minArea]);

  useEffect(() => {
    runSegmentation();
  }, [runSegmentation, sourceRevision]);

  return (
    <SharedImageLabShell
      title="Image Segmentation &amp; Object Analysis Lab (Ch 15)"
      subtitle="Segmentasi citra otomatis dengan Otsu Thresholding, Adaptive Mean, pelabelan komponen terhubung (Connected Components), dan ekstraksi fitur geometris objek."
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onResetAll={() => {
        setMethod('otsu');
        setGlobalThresh(115);
        setBlockSize(21);
        setMinArea(30);
        resetToPreset('objects');
      }}
      onDownload={() => downloadCanvasPng(ccCanvasRef.current, `ch15-segmentation-${method}.png`)}
      errorMsg={errorMsg}
      isLoading={isLoading}
      sourceLabel={sourceLabel}
      imageDims={imageDims}
      implementationNote="Pelabelan komponen terhubung memakai BFS 4-konektivitas disertai penyaringan luas minimum piksel (minArea) untuk membuang noise mikro, setara dengan cv2.connectedComponentsWithStats."
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
            Metode Thresholding
          </label>
          <select className="select-filter" style={{ width: '100%' }} value={method} onChange={(e) => setMethod(e.target.value as SegmentMethod)}>
            <option value="otsu">Otsu Optimal Thresholding</option>
            <option value="global">Global Manual Thresholding</option>
            <option value="adaptive">Adaptive Mean (Integral Image)</option>
          </select>
        </div>

        {method === 'global' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Nilai Ambang T: {globalThresh}
            </label>
            <input type="range" min="15" max="240" step="5" value={globalThresh} onChange={(e) => setGlobalThresh(Number(e.target.value))} style={{ width: '100%', marginTop: '0.4rem' }} />
          </div>
        )}

        {method === 'adaptive' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Block Size: {blockSize} × {blockSize}
            </label>
            <input type="range" min="9" max="51" step="4" value={blockSize} onChange={(e) => setBlockSize(Number(e.target.value))} style={{ width: '100%', marginTop: '0.4rem' }} />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Filter Area Minimum: {minArea} px
          </label>
          <input type="range" min="5" max="300" step="5" value={minArea} onChange={(e) => setMinArea(Number(e.target.value))} style={{ width: '100%', marginTop: '0.4rem' }} />
        </div>
      </div>

      <div className="canvas-wrap">
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.4rem' }}>
            1. Citra Masukan
          </div>
          <canvas ref={sourceCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.4rem' }}>
            2. Masker Biner ({method === 'otsu' ? `Otsu T* = ${otsuThresholdUsed}` : method})
          </div>
          <canvas ref={maskCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#34d399', marginBottom: '0.4rem' }}>
            3. Connected Components ({objects.length} Objek)
          </div>
          <canvas ref={ccCanvasRef} />
        </div>
      </div>

      {/* Object Measurements Table */}
      <div style={{ marginTop: '1.25rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text)' }}>
          Tabel Pengukuran Morfometri Objek ({objects.length} Objek Terdeteksi dengan Area ≥ {minArea} px)
        </div>
        {objects.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tidak ada komponen terhubung yang memenuhi batas area minimum. Coba turunkan Filter Area Minimum atau ubah metode thresholding.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '0.45rem 0.6rem' }}>ID</th>
                <th style={{ padding: '0.45rem 0.6rem' }}>Area (px)</th>
                <th style={{ padding: '0.45rem 0.6rem' }}>Centroid (x, y)</th>
                <th style={{ padding: '0.45rem 0.6rem' }}>Bounding Box (x, y, w, h)</th>
                <th style={{ padding: '0.45rem 0.6rem' }}>Circularity (4πA/P²)</th>
              </tr>
            </thead>
            <tbody>
              {objects.slice(0, 15).map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.4rem 0.6rem', fontWeight: 700, color: 'var(--primary)' }}>#{o.id}</td>
                  <td style={{ padding: '0.4rem 0.6rem' }}>{o.area}</td>
                  <td style={{ padding: '0.4rem 0.6rem' }}>({o.cx.toFixed(1)}, {o.cy.toFixed(1)})</td>
                  <td style={{ padding: '0.4rem 0.6rem' }}>({o.bbox.x}, {o.bbox.y}, {o.bbox.w}, {o.bbox.h})</td>
                  <td style={{ padding: '0.4rem 0.6rem' }}>{o.circularity.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SharedImageLabShell>
  );
}


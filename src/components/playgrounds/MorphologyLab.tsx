import { useState, useRef, useEffect, useCallback } from 'react';
import {
  type MorphOp,
  type MorphShape,
  rgbaToGrayscale,
  grayToRgba,
  thresholdGlobalMask,
  createStructuringElement,
  applyMorphology,
} from '../../lib/imageProcessing';
import { useImageLabSource, downloadCanvasPng } from './useImageLabSource';
import { SharedImageLabShell } from './SharedImageLabShell';

export function MorphologyLab() {
  const [op, setOp] = useState<MorphOp>('open');
  const [shape, setShape] = useState<MorphShape>('square');
  const [seSize, setSeSize] = useState<3 | 5 | 7>(5);
  const [thresh, setThresh] = useState<number>(110);

  const binaryCanvasRef = useRef<HTMLCanvasElement>(null);
  const morphCanvasRef = useRef<HTMLCanvasElement>(null);

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

  const seMatrix = createStructuringElement(shape, seSize);

  const runMorph = useCallback(() => {
    const src = getSourceImageData();
    const binC = binaryCanvasRef.current;
    const outC = morphCanvasRef.current;
    if (!src || !binC || !outC) return;

    const { width: w, height: h, data } = src;
    binC.width = w;
    binC.height = h;
    outC.width = w;
    outC.height = h;

    const gray = rgbaToGrayscale(data, w, h);
    const binary = thresholdGlobalMask(gray, thresh);
    const se = createStructuringElement(shape, seSize);
    const morphed = applyMorphology(binary, w, h, op, se);

    binC.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(grayToRgba(binary, w, h)), w, h), 0, 0);
    outC.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(grayToRgba(morphed, w, h)), w, h), 0, 0);
  }, [getSourceImageData, op, seSize, shape, thresh]);

  useEffect(() => {
    runMorph();
  }, [runMorph, sourceRevision]);

  return (
    <SharedImageLabShell
      title="Morphological Image Processing Lab (Ch 14)"
      subtitle="Eksperimen operasi morfologi himpunan (Erosion, Dilation, Opening, Closing, Gradient, Top-Hat, Black-Hat) dengan bentuk dan ukuran Structuring Element dinamis."
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onResetAll={() => {
        setOp('open');
        setShape('square');
        setSeSize(5);
        setThresh(110);
        resetToPreset('objects');
      }}
      onDownload={() => downloadCanvasPng(morphCanvasRef.current, `ch14-morph-${op}-${shape}.png`)}
      errorMsg={errorMsg}
      isLoading={isLoading}
      sourceLabel={sourceLabel}
      imageDims={imageDims}
      implementationNote="Setiap operasi morfologi mengevaluasi operator set-theoretik min/max pada lingkungan Structuring Element simetris, setara dengan cv2.erode, cv2.dilate, dan cv2.morphologyEx."
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
            Operasi Morfologi
          </label>
          <select className="select-filter" style={{ width: '100%' }} value={op} onChange={(e) => setOp(e.target.value as MorphOp)}>
            <option value="erode">Erosion (Menyusutkan)</option>
            <option value="dilate">Dilation (Memperluas)</option>
            <option value="open">Opening (Erode → Dilate)</option>
            <option value="close">Closing (Dilate → Erode)</option>
            <option value="gradient">Morphological Gradient (Tepi)</option>
            <option value="tophat">White Top-Hat (Src - Open)</option>
            <option value="blackhat">Black-Hat (Close - Src)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Bentuk Structuring Element
          </label>
          <select className="select-filter" style={{ width: '100%' }} value={shape} onChange={(e) => setShape(e.target.value as MorphShape)}>
            <option value="square">Square / Rect (MORPH_RECT)</option>
            <option value="cross">Cross (+) (MORPH_CROSS)</option>
            <option value="disk">Ellipse / Disk (MORPH_ELLIPSE)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Ukuran SE: {seSize} × {seSize}
          </label>
          <select className="select-filter" style={{ width: '100%' }} value={seSize} onChange={(e) => setSeSize(Number(e.target.value) as 3 | 5 | 7)}>
            <option value={3}>3 × 3 piksel</option>
            <option value={5}>5 × 5 piksel</option>
            <option value={7}>7 × 7 piksel</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Ambang Binarisasi: {thresh}
          </label>
          <input type="range" min="20" max="220" step="5" value={thresh} onChange={(e) => setThresh(Number(e.target.value))} style={{ width: '100%', marginTop: '0.4rem' }} />
        </div>
      </div>

      <div className="canvas-wrap">
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.4rem' }}>
            1. Citra Asli
          </div>
          <canvas ref={sourceCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.4rem' }}>
            2. Masker Biner (T = {thresh})
          </div>
          <canvas ref={binaryCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#34d399', marginBottom: '0.4rem' }}>
            3. Hasil Morfologi ({op.toUpperCase()})
          </div>
          <canvas ref={morphCanvasRef} />
        </div>
      </div>

      {/* Structuring Element Matrix Preview */}
      <div style={{ background: 'var(--bg-subtle)', padding: '0.9rem', borderRadius: '8px', marginTop: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>
          Matriks Structuring Element B ({shape.toUpperCase()}, {seSize}×{seSize})
        </div>
        <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${seSize}, 24px)`, gap: '3px' }}>
          {seMatrix.flat().map((v, idx) => (
            <div
              key={idx}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                background: v === 1 ? 'var(--primary)' : 'var(--bg-card)',
                color: v === 1 ? 'var(--on-primary)' : 'var(--text-dim)',
                border: '1px solid var(--border)',
              }}
            >
              {v}
            </div>
          ))}
        </div>
      </div>
    </SharedImageLabShell>
  );
}


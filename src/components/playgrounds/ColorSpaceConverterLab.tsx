import { useState, useRef, useEffect, useCallback } from 'react';
import {
  type ColorSpaceMode,
  decomposeColorSpaceChannels,
  segmentByHsvRange,
} from '../../lib/imageProcessing';
import { useImageLabSource, downloadCanvasPng } from './useImageLabSource';
import { SharedImageLabShell } from './SharedImageLabShell';

export function ColorSpaceConverterLab() {
  const [space, setSpace] = useState<ColorSpaceMode>('hsv');
  const [enableMask, setEnableMask] = useState(false);
  const [targetHue, setTargetHue] = useState(195);
  const [hueTol, setHueTol] = useState(30);
  const [channelLabels, setChannelLabels] = useState<[string, string, string]>(['C1', 'C2', 'C3']);

  const ch1CanvasRef = useRef<HTMLCanvasElement>(null);
  const ch2CanvasRef = useRef<HTMLCanvasElement>(null);
  const ch3CanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

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
  } = useImageLabSource('color_bars', 224);

  const runConversion = useCallback(() => {
    const src = getSourceImageData();
    if (!src) return;
    const { width: w, height: h, data } = src;
    const { ch1, ch2, ch3, labels } = decomposeColorSpaceChannels(data, w, h, space);
    setChannelLabels(labels);

    const drawTo = (ref: React.RefObject<HTMLCanvasElement | null>, buf: Uint8ClampedArray) => {
      const c = ref.current;
      if (!c) return;
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      ctx?.putImageData(new ImageData(new Uint8ClampedArray(buf), w, h), 0, 0);
    };

    drawTo(ch1CanvasRef, ch1);
    drawTo(ch2CanvasRef, ch2);
    drawTo(ch3CanvasRef, ch3);

    if (enableMask) {
      const masked = segmentByHsvRange(data, targetHue, hueTol, 0.25);
      drawTo(maskCanvasRef, masked);
    }
  }, [enableMask, getSourceImageData, hueTol, space, targetHue]);

  useEffect(() => {
    runConversion();
  }, [runConversion, sourceRevision]);

  return (
    <SharedImageLabShell
      title="Color Space Converter &amp; Segmentation Lab (Ch 07)"
      subtitle="Konversi interaktif antara ruang warna RGB, Grayscale, HSV, HSL, YCbCr, dan CIELAB (D65) serta segmentasi berbasis rentang Hue."
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onResetAll={() => {
        setSpace('hsv');
        setEnableMask(false);
        setTargetHue(195);
        resetToPreset('color_bars');
      }}
      onDownload={() =>
        downloadCanvasPng(
          enableMask ? maskCanvasRef.current : ch1CanvasRef.current,
          `ch07-${space}-channel.png`
        )
      }
      errorMsg={errorMsg}
      isLoading={isLoading}
      sourceLabel={sourceLabel}
      imageDims={imageDims}
      implementationNote="Pada OpenCV cv2.cvtColor(..., cv2.COLOR_BGR2HSV), rentang Hue 8-bit diskalakan menjadi [0..179] (setengah derajat). Visualizer ini memakai rentang Hue penuh 0°–360° dan iluminan D65 untuk CIELAB."
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
            Target Ruang Warna (Color Space)
          </label>
          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={space}
            onChange={(e) => setSpace(e.target.value as ColorSpaceMode)}
          >
            <option value="rgb">RGB (Red, Green, Blue)</option>
            <option value="grayscale">Grayscale (BT.601 Luminance)</option>
            <option value="hsv">HSV (Hue, Saturation, Value)</option>
            <option value="hsl">HSL (Hue, Saturation, Lightness)</option>
            <option value="ycbcr">YCbCr (Luma, Chroma Blue, Chroma Red)</option>
            <option value="lab">CIELAB (L*, a*, b* Perceptual)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={enableMask}
              onChange={(e) => setEnableMask(e.target.checked)}
            />
            Aktifkan Segmentasi Warna HSV (Hue Isolation)
          </label>
        </div>

        {enableMask && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Target Hue: {targetHue}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={targetHue}
                onChange={(e) => setTargetHue(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Toleransi ±{hueTol}°
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={hueTol}
                onChange={(e) => setHueTol(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}
      </div>

      <div className="canvas-wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.4rem' }}>
            Sumber RGB
          </div>
          <canvas ref={sourceCanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#34d399', marginBottom: '0.4rem' }}>
            {channelLabels[0]}
          </div>
          <canvas ref={ch1CanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.4rem' }}>
            {channelLabels[1]}
          </div>
          <canvas ref={ch2CanvasRef} />
        </div>
        <div className="canvas-panel">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a78bfa', marginBottom: '0.4rem' }}>
            {channelLabels[2]}
          </div>
          <canvas ref={ch3CanvasRef} />
        </div>
        {enableMask && (
          <div className="canvas-panel">
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f472b6', marginBottom: '0.4rem' }}>
              Segmentasi Hue ({targetHue}° ± {hueTol}°)
            </div>
            <canvas ref={maskCanvasRef} />
          </div>
        )}
      </div>
    </SharedImageLabShell>
  );
}


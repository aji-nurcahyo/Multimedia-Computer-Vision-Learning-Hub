import React, { useState, useEffect, useRef } from 'react';
import { conv2D, relu, maxPool2D } from '../../lib/cvProcessing';

export const CnnFundamentalsExplorer: React.FC = () => {
  const [kernelType, setKernelType] = useState<'edge' | 'sharpen' | 'blur' | 'horizontal'>('edge');
  const [activation, setActivation] = useState<'relu' | 'none'>('relu');
  const [enablePooling, setEnablePooling] = useState<boolean>(true);

  const inCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 160;
  const H = 160;

  const KERNELS: Record<string, number[][]> = {
    edge: [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1]
    ],
    sharpen: [
      [ 0, -1,  0],
      [-1,  5, -1],
      [ 0, -1,  0]
    ],
    blur: [
      [1/9, 1/9, 1/9],
      [1/9, 1/9, 1/9],
      [1/9, 1/9, 1/9]
    ],
    horizontal: [
      [-1, -2, -1],
      [ 0,  0,  0],
      [ 1,  2,  1]
    ]
  };

  useEffect(() => {
    const inC = inCanvasRef.current;
    const outC = outCanvasRef.current;
    if (!inC || !outC) return;
    const inCtx = inC.getContext('2d');
    const outCtx = outC.getContext('2d');
    if (!inCtx || !outCtx) return;

    inC.width = W;
    inC.height = H;

    // Draw synthetic high-contrast test shape
    inCtx.fillStyle = '#0f172a';
    inCtx.fillRect(0, 0, W, H);
    inCtx.fillStyle = '#ffffff';
    inCtx.fillRect(30, 30, 100, 100);
    inCtx.fillStyle = '#0f172a';
    inCtx.beginPath();
    inCtx.arc(80, 80, 30, 0, Math.PI * 2);
    inCtx.fill();

    const inData = inCtx.getImageData(0, 0, W, H);
    const inFloats = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      inFloats[i] = inData.data[i * 4] / 255.0;
    }

    // 1. Conv2D
    const { output: convOut, outW: cW, outH: cH } = conv2D(inFloats, W, H, KERNELS[kernelType]);

    // 2. Activation
    const actOut = activation === 'relu' ? relu(convOut) : convOut;

    // 3. Max Pooling
    let finalData = actOut;
    let finalW = cW;
    let finalH = cH;

    if (enablePooling) {
      const pooled = maxPool2D(actOut, cW, cH, 2);
      finalData = pooled.output;
      finalW = pooled.outW;
      finalH = pooled.outH;
    }

    outC.width = finalW;
    outC.height = finalH;

    const outImgData = outCtx.createImageData(finalW, finalH);
    for (let i = 0; i < finalW * finalH; i++) {
      const val = Math.min(255, Math.max(0, Math.round(finalData[i] * 255)));
      outImgData.data[i * 4] = val;
      outImgData.data[i * 4 + 1] = val;
      outImgData.data[i * 4 + 2] = val;
      outImgData.data[i * 4 + 3] = 255;
    }
    outCtx.putImageData(outImgData, 0, 0);
  }, [kernelType, activation, enablePooling]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Simulator Dasar CNN: Konvolusi, Aktivasi ReLU &amp; Pooling (Bab 41)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Eksplorasi visual operasi matematika inti dalam feature extractor jaringan saraf konvolusional (CNN).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', background: '#020617', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Input (160x160)</span>
            <canvas ref={inCanvasRef} style={{ width: '130px', height: '130px', border: '1px solid #334155', borderRadius: '4px' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'block', marginBottom: '0.4rem' }}>
              Output Feature Map {enablePooling ? '(80x80)' : '(160x160)'}
            </span>
            <canvas ref={outCanvasRef} style={{ width: '130px', height: '130px', border: '1px solid #34d399', borderRadius: '4px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
              Pilih Kernel Konvolusi 3x3:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {[
                { type: 'edge', label: 'Laplacian Edge' },
                { type: 'sharpen', label: 'Sharpen Kernel' },
                { type: 'blur', label: 'Box Blur LPF' },
                { type: 'horizontal', label: 'Sobel Horizontal' }
              ].map((k) => (
                <button
                  key={k.type}
                  onClick={() => setKernelType(k.type as any)}
                  style={{
                    padding: '0.45rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    background: kernelType === k.type ? 'var(--primary)' : 'var(--bg-card)',
                    color: kernelType === k.type ? 'var(--on-primary)' : 'var(--text)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  {k.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={activation === 'relu'}
                  onChange={(e) => setActivation(e.target.checked ? 'relu' : 'none')}
                />
                <span>Aktivasi ReLU (max(0, x))</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enablePooling}
                  onChange={(e) => setEnablePooling(e.target.checked)}
                />
                <span>Max Pooling 2x2 (Stride 2)</span>
              </label>
            </div>
          </div>

          <div style={{ background: '#020617', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', color: '#e2e8f0' }}>
            <span style={{ color: '#38bdf8', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Dimensi Tensor CNN:
            </span>
            <div>Input: <code>[1, 160, 160, 1]</code></div>
            <div>Setelah Conv3x3: <code>[1, 160, 160, 1]</code> (Padding Same)</div>
            <div>Setelah MaxPool2x2: <code>[1, {enablePooling ? '80, 80' : '160, 160'}, 1]</code> (Reduksi 75% Piksel)</div>
          </div>
        </div>
      </div>
    </div>
  );
};


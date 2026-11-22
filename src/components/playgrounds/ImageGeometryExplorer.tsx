import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { computeAffineMatrix, warpAffineImage } from '../../lib/cvProcessing';

export const ImageGeometryExplorer: React.FC = () => {
  const [tx, setTx] = useState<number>(0);
  const [ty, setTy] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [shearX, setShearX] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 360;
  const H = 240;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    // Create synthetic source image with grid, circle, and text
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = W;
    srcCanvas.height = H;
    const sCtx = srcCanvas.getContext('2d')!;

    sCtx.fillStyle = '#0f172a';
    sCtx.fillRect(0, 0, W, H);

    // Draw grid
    sCtx.strokeStyle = '#1e293b';
    sCtx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) {
      sCtx.beginPath();
      sCtx.moveTo(x, 0);
      sCtx.lineTo(x, H);
      sCtx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      sCtx.beginPath();
      sCtx.moveTo(0, y);
      sCtx.lineTo(W, y);
      sCtx.stroke();
    }

    // Draw pattern box
    sCtx.fillStyle = '#0284c7';
    sCtx.fillRect(W / 2 - 50, H / 2 - 40, 100, 80);
    sCtx.fillStyle = '#38bdf8';
    sCtx.beginPath();
    sCtx.arc(W / 2, H / 2, 25, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.fillStyle = '#f8fafc';
    sCtx.font = 'bold 14px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('ITERA CV', W / 2, H / 2 + 5);

    const srcImgData = sCtx.getImageData(0, 0, W, H);

    // Compute Affine Matrix M
    const M = computeAffineMatrix({
      tx,
      ty,
      scaleX: scale,
      scaleY: scale,
      rotationDeg: rotation,
      shearX
    });

    const warped = warpAffineImage(srcImgData.data, W, H, M);
    const outImgData = new ImageData(warped, W, H);
    ctx.putImageData(outImgData, 0, 0);

    // Draw coordinate axes
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(40, 0);
    ctx.stroke();
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 40);
    ctx.stroke();
  }, [tx, ty, scale, rotation, shearX]);

  const handleReset = () => {
    setTx(0);
    setTy(0);
    setScale(1.0);
    setRotation(0);
    setShearX(0);
  };

  const M = computeAffineMatrix({
    tx,
    ty,
    scaleX: scale,
    scaleY: scale,
    rotationDeg: rotation,
    shearX
  });

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Laboratorium Geometri Citra &amp; Transformasi Afinitas (Bab 36)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Simulasi interaktif transformasi koordinat 2D homogen dengan interpolasi bilinear dan komputasi invers matriks afinitas.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Canvas Display */}
        <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span>Bidang Kanvas Citra Ter-warp (360x240)</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>Bilinear Interpolation</span>
          </div>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }} />
        </div>

        {/* Controls and Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}>
              Parameter Transformasi Spasial:
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Translasi X (tx):</span>
                  <strong style={{ fontFamily: 'monospace' }}>{tx} px</strong>
                </div>
                <input type="range" min={-80} max={80} value={tx} onChange={(e) => setTx(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Translasi Y (ty):</span>
                  <strong style={{ fontFamily: 'monospace' }}>{ty} px</strong>
                </div>
                <input type="range" min={-60} max={60} value={ty} onChange={(e) => setTy(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Rotasi (θ):</span>
                  <strong style={{ fontFamily: 'monospace' }}>{rotation}°</strong>
                </div>
                <input type="range" min={-180} max={180} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Skala (s):</span>
                  <strong style={{ fontFamily: 'monospace' }}>{scale.toFixed(2)}x</strong>
                </div>
                <input type="range" min={0.3} max={2.0} step={0.05} value={scale} onChange={(e) => setScale(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Shear X (shx):</span>
                  <strong style={{ fontFamily: 'monospace' }}>{shearX.toFixed(2)}</strong>
                </div>
                <input type="range" min={-1.0} max={1.0} step={0.05} value={shearX} onChange={(e) => setShearX(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} /> Reset Parameter
              </button>
            </div>
          </div>

          {/* Matrix Inspector */}
          <div style={{ background: '#020617', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
            <span style={{ color: '#38bdf8', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              Matriks Homogen Terhitung M (3x3):
            </span>
            <div style={{ color: '#e2e8f0', lineHeight: 1.6 }}>
              [{M[0][0].toFixed(3).padStart(6)}, {M[0][1].toFixed(3).padStart(6)}, {M[0][2].toFixed(1).padStart(6)}]
              <br />
              [{M[1][0].toFixed(3).padStart(6)}, {M[1][1].toFixed(3).padStart(6)}, {M[1][2].toFixed(1).padStart(6)}]
              <br />
              [ 0.000,  0.000,  1.000]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

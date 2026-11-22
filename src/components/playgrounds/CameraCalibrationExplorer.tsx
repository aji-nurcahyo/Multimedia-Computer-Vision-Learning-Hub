import React, { useState, useEffect, useRef } from 'react';
import { projectPoint3D, computeReprojectionError, type CameraIntrinsics } from '../../lib/cvProcessing';

export const CameraCalibrationExplorer: React.FC = () => {
  const [focal, setFocal] = useState<number>(300);
  const [k1, setK1] = useState<number>(0.0);
  const [k2, setK2] = useState<number>(0.0);
  const [rmseError, setRmseError] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 380;
  const H = 260;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    const K: CameraIntrinsics = {
      fx: focal,
      fy: focal,
      cx: W / 2,
      cy: H / 2,
      k1,
      k2
    };

    // Generate 3D calibration chessboard points on a plane Z = 2.0m
    const groundTruthProjected: Array<{ u: number; v: number }> = [];
    const distortedProjected: Array<{ u: number; v: number }> = [];

    const K_ideal: CameraIntrinsics = { fx: focal, fy: focal, cx: W / 2, cy: H / 2, k1: 0, k2: 0 };

    for (let gy = -3; gy <= 3; gy++) {
      for (let gx = -4; gx <= 4; gx++) {
        const X = gx * 0.15; // 15cm grid
        const Y = gy * 0.15;
        const Z = 2.0;

        const pIdeal = projectPoint3D(X, Y, Z, K_ideal);
        const pDist = projectPoint3D(X, Y, Z, K);

        groundTruthProjected.push(pIdeal);
        distortedProjected.push(pDist);
      }
    }

    // Draw ideal grid (faint white)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let gy = 0; gy < 7; gy++) {
      ctx.beginPath();
      for (let gx = 0; gx < 9; gx++) {
        const idx = gy * 9 + gx;
        const p = groundTruthProjected[idx];
        if (gx === 0) ctx.moveTo(p.u, p.v);
        else ctx.lineTo(p.u, p.v);
      }
      ctx.stroke();
    }

    // Draw distorted grid (colored cyan or amber)
    ctx.strokeStyle = k1 !== 0 || k2 !== 0 ? '#fbbf24' : '#38bdf8';
    ctx.lineWidth = 1.5;
    for (let gy = 0; gy < 7; gy++) {
      ctx.beginPath();
      for (let gx = 0; gx < 9; gx++) {
        const idx = gy * 9 + gx;
        const p = distortedProjected[idx];
        if (gx === 0) ctx.moveTo(p.u, p.v);
        else ctx.lineTo(p.u, p.v);
      }
      ctx.stroke();
    }

    for (const p of distortedProjected) {
      ctx.fillStyle = k1 !== 0 || k2 !== 0 ? '#f59e0b' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(p.u, p.v, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Principal point indicator
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(K.cx, K.cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '10px monospace';
    ctx.fillText('Principal Point (cx, cy)', K.cx + 6, K.cy - 4);

    const err = computeReprojectionError(groundTruthProjected, distortedProjected);
    setRmseError(err);
  }, [focal, k1, k2]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Simulator Kalibrasi Kamera Pinhole &amp; Distorsi Lensa (Bab 38)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Visualisasi proyeksi matriks intrinsik K, koefisien distorsi radial Brown-Conrady, dan metrik Reprojection Error RMSE.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span>Proyeksi Grid Kalibrasi Pinhole</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>Z = 2.0 meter</span>
          </div>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}>
              Parameter Kalibrasi Kamera:
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Focal Length (fx = fy):</span>
                  <strong style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{focal} px</strong>
                </div>
                <input type="range" min={150} max={500} step={10} value={focal} onChange={(e) => setFocal(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Koefisien Distorsi Radial 1 (k1):</span>
                  <strong style={{ fontFamily: 'monospace', color: '#fbbf24' }}>{k1.toFixed(3)}</strong>
                </div>
                <input type="range" min={-0.3} max={0.3} step={0.01} value={k1} onChange={(e) => setK1(Number(e.target.value))} style={{ width: '100%' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>k1 &lt; 0: Barrel (Cembung) | k1 &gt; 0: Pincushion (Cekung)</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Koefisien Distorsi Radial 2 (k2):</span>
                  <strong style={{ fontFamily: 'monospace', color: '#fbbf24' }}>{k2.toFixed(3)}</strong>
                </div>
                <input type="range" min={-0.1} max={0.1} step={0.005} value={k2} onChange={(e) => setK2(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div style={{ background: '#020617', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
            <span style={{ color: '#34d399', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
              Evaluasi Akurasi Kalibrasi:
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: '#94a3b8' }}>Reprojection Error (RMSE):</span>
              <strong style={{ color: rmseError < 0.5 ? '#10b981' : '#f59e0b', fontFamily: 'monospace' }}>
                {rmseError.toFixed(2)} px
              </strong>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Standar kalibrasi industri: RMSE &lt; 0.5 piksel untuk rekonstruksi 3D akurat.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


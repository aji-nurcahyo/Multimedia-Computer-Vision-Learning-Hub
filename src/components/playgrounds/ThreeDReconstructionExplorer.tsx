import React, { useState, useEffect, useRef } from 'react';
import { rotateAndProject3D, type Point3D } from '../../lib/cvProcessing';

export const ThreeDReconstructionExplorer: React.FC = () => {
  const [rotY, setRotY] = useState<number>(30);
  const [rotX, setRotX] = useState<number>(15);
  const [focal, setFocal] = useState<number>(280);
  const [showRays, setShowRays] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 360;
  const H = 240;

  // Generate 3D wireframe / point cloud of a 3D house/box
  const MODEL_3D_POINTS: Point3D[] = [
    // Bottom square
    { x: -0.6, y: -0.5, z: -0.6, color: '#38bdf8' },
    { x:  0.6, y: -0.5, z: -0.6, color: '#38bdf8' },
    { x:  0.6, y: -0.5, z:  0.6, color: '#38bdf8' },
    { x: -0.6, y: -0.5, z:  0.6, color: '#38bdf8' },
    // Top square
    { x: -0.6, y:  0.4, z: -0.6, color: '#818cf8' },
    { x:  0.6, y:  0.4, z: -0.6, color: '#818cf8' },
    { x:  0.6, y:  0.4, z:  0.6, color: '#818cf8' },
    { x: -0.6, y:  0.4, z:  0.6, color: '#818cf8' },
    // Roof apex
    { x:  0.0, y:  1.0, z:  0.0, color: '#f59e0b' }
  ];

  const EDGES: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0], // bottom
    [4, 5], [5, 6], [6, 7], [7, 4], // top
    [0, 4], [1, 5], [2, 6], [3, 7], // pillars
    [4, 8], [5, 8], [6, 8], [7, 8]  // roof
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Project 3D points to 2D
    const projected = rotateAndProject3D(MODEL_3D_POINTS, rotX, rotY, focal, W / 2, H / 2);

    // Draw Triangulation Rays from Virtual Camera Center if enabled
    if (showRays) {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      for (const p of projected) {
        ctx.beginPath();
        ctx.moveTo(W / 2, H + 20); // Simulated camera baseline origin
        ctx.lineTo(p.u, p.v);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Draw 3D Edges
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    for (const [i1, i2] of EDGES) {
      const p1 = projected[i1];
      const p2 = projected[i2];
      ctx.beginPath();
      ctx.moveTo(p1.u, p1.v);
      ctx.lineTo(p2.u, p2.v);
      ctx.stroke();
    }

    // Draw 3D Point Cloud vertices
    for (const p of projected) {
      ctx.fillStyle = p.color || '#38bdf8';
      ctx.beginPath();
      ctx.arc(p.u, p.v, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [rotY, rotX, focal, showRays]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Laboratorium Rekonstruksi 3D &amp; Structure from Motion (Bab 48)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Eksplorasi proyeksi perspektif awan titik 3D (Point Cloud), matriks rotasi kamera dunia R(θ), dan sinar triangulasi multi-view.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span>Proyeksi Wireframe 3D Perspectival</span>
            <span style={{ color: '#f59e0b', fontFamily: 'monospace' }}>Yaw: {rotY}° | Pitch: {rotX}°</span>
          </div>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}>
              Sudut Pandang Kamera 3D (Extrinsics):
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Rotasi Horisontal (Yaw / Y):</span>
                  <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{rotY}°</strong>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={rotY}
                  onChange={(e) => setRotY(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Rotasi Vertikal (Pitch / X):</span>
                  <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{rotX}°</strong>
                </div>
                <input
                  type="range"
                  min={-60}
                  max={60}
                  value={rotX}
                  onChange={(e) => setRotX(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Focal Distance (Zoom):</span>
                  <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{focal} px</strong>
                </div>
                <input
                  type="range"
                  min={150}
                  max={450}
                  value={focal}
                  onChange={(e) => setFocal(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={showRays}
                  onChange={(e) => setShowRays(e.target.checked)}
                />
                <span>Visualisasikan Sinar Triangulasi Epipolar</span>
              </label>
            </div>
          </div>

          <div style={{ background: '#020617', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.78rem', color: '#e2e8f0' }}>
            <span style={{ color: '#34d399', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Prinsip Structure from Motion (SfM):
            </span>
            <div>1. Dekomposisi SVD Matriks Esensial: $E = U \Sigma V^T \to [R|t]$.</div>
            <div>2. Triangulasi Least Squares menentukan titik 3D $(X, Y, Z)$ dari 2 berkas sinar.</div>
            <div>3. Bundle Adjustment meminimalkan reprojection error non-linier.</div>
          </div>
        </div>
      </div>
    </div>
  );
};


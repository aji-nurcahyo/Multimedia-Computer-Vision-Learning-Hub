import React, { useState, useEffect, useRef } from 'react';
import { computeStereoDisparity, disparityToDepth } from '../../lib/cvProcessing';

export const StereoDepthExplorer: React.FC = () => {
  const [baselineCm, setBaselineCm] = useState<number>(10);
  const [focalPixels, setFocalPixels] = useState<number>(400);
  const [maxDisp, setMaxDisp] = useState<number>(32);
  const [targetDepthM, setTargetDepthM] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 320;
  const H = 180;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    // Create Left & Right stereo pair with 2 depth layers
    const leftGray = new Uint8Array(W * H);
    const rightGray = new Uint8Array(W * H);

    // Background textured pattern (disparity = 2px)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const val = ((x * 11) ^ (y * 13)) % 80 + 30;
        leftGray[y * W + x] = val;
        const rx = x - 2;
        rightGray[y * W + x] = rx >= 0 ? ((rx * 11) ^ (y * 13)) % 80 + 30 : val;
      }
    }

    // Foreground object: box at x=110..210, y=50..130 (high disparity = 16px)
    for (let y = 50; y < 130; y++) {
      for (let x = 110; x < 210; x++) {
        const fVal = 180 + ((x + y * 3) % 70);
        leftGray[y * W + x] = fVal;
        const rx = x - 16;
        if (rx >= 0 && rx < W) {
          rightGray[y * W + rx] = fVal;
        }
      }
    }

    const dispMap = computeStereoDisparity(leftGray, rightGray, W, H, maxDisp, 5);

    // Render disparity heatmap (blue = far, green = mid, red/yellow = near)
    const imgData = ctx.createImageData(W, H);
    for (let i = 0; i < W * H; i++) {
      const d = dispMap[i];
      const norm = Math.min(1.0, d / maxDisp);
      const r = Math.round(norm * 255);
      const g = Math.round(Math.sin(norm * Math.PI) * 200);
      const b = Math.round((1 - norm) * 200);

      imgData.data[i * 4] = r;
      imgData.data[i * 4 + 1] = g;
      imgData.data[i * 4 + 2] = b;
      imgData.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    // Calculate depth at center foreground object (d=16)
    const centerD = dispMap[90 * W + 160] || 16;
    const depthM = disparityToDepth(centerD, focalPixels, baselineCm / 100);
    setTargetDepthM(depthM);
  }, [baselineCm, focalPixels, maxDisp]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Laboratorium Stereo Vision &amp; Estimasi Kedalaman (Bab 39)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Pencocokan blok stereo (SAD), rekonstruksi peta disparitas, dan kalkulasi kedalaman fisik 3D berdasar segitiga triangulasi Z = (f · B) / d.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span>Peta Disparitas Stereo (Disparity Map)</span>
            <span style={{ color: '#f43f5e', fontFamily: 'monospace' }}>Merah = Dekat | Biru = Jauh</span>
          </div>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}>
              Parameter Rig Kamera Stereo:
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Jarak Antar Kamera (Baseline B):</span>
                  <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{baselineCm} cm</strong>
                </div>
                <input type="range" min={5} max={30} step={1} value={baselineCm} onChange={(e) => setBaselineCm(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Focal Length (f):</span>
                  <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{focalPixels} px</strong>
                </div>
                <input type="range" min={200} max={800} step={20} value={focalPixels} onChange={(e) => setFocalPixels(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Disparitas Maksimum Pencarian (d_max):</span>
                  <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{maxDisp} px</strong>
                </div>
                <input type="range" min={16} max={48} step={8} value={maxDisp} onChange={(e) => setMaxDisp(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div style={{ background: '#020617', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.82rem' }}>
            <span style={{ color: '#34d399', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
              Estimasi Kedalaman Objek Foreground Terhitung:
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ color: '#94a3b8' }}>Kedalaman Z (Triangulasi):</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '1rem' }}>
                {targetDepthM.toFixed(2)} meter
              </strong>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Formula: Z = (focal × baseline) / disparity. Baseline lebih lebar meningkatkan resolusi kedalaman pada jarak jauh.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


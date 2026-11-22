import React, { useState, useEffect, useRef } from 'react';
import { computeSegmentationMetrics } from '../../lib/cvProcessing';

export const DeepSegmentationLab: React.FC = () => {
  const [maskOpacity, setMaskOpacity] = useState<number>(0.6);
  const [selectedClass, setSelectedClass] = useState<'all' | 'road' | 'car' | 'sky'>('all');
  const [metrics, setMetrics] = useState<{ iou: number; dice: number }>({ iou: 0.88, dice: 0.93 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 320;
  const H = 200;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    // Base street scene
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Sky
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, W, 80);

    // Road
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 80, W, 120);

    // Cars
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(40, 110, 80, 50);
    ctx.fillRect(180, 100, 100, 60);

    // Segmentation Masks with Opacity
    ctx.save();
    ctx.globalAlpha = maskOpacity;

    // Sky Mask (Cyan: #38bdf8)
    if (selectedClass === 'all' || selectedClass === 'sky') {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 0, W, 80);
    }

    // Road Mask (Purple: #a855f7)
    if (selectedClass === 'all' || selectedClass === 'road') {
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(0, 80, W, 120);
    }

    // Car Mask (Emerald: #10b981)
    if (selectedClass === 'all' || selectedClass === 'car') {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(38, 108, 84, 54);
      ctx.fillRect(178, 98, 104, 64);
    }

    ctx.restore();

    // Compute synthetic binary prediction vs ground truth for car
    const predMask = new Uint8Array(W * H);
    const gtMask = new Uint8Array(W * H);

    for (let y = 108; y < 162; y++) {
      for (let x = 38; x < 122; x++) {
        predMask[y * W + x] = 1;
      }
    }
    for (let y = 110; y < 160; y++) {
      for (let x = 40; x < 120; x++) {
        gtMask[y * W + x] = 1;
      }
    }

    const m = computeSegmentationMetrics(predMask, gtMask);
    setMetrics({ iou: m.iou, dice: m.dice });
  }, [maskOpacity, selectedClass]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Laboratorium Segmentasi Semantik &amp; Metrik mIoU / Dice (Bab 45)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Visualisasi overlay mask semantik per piksel, kendali transparansi lapisan, dan evaluasi ketepatan batas segmentasi mIoU dan Dice Coefficient.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              <span>Overlay Mask Segmentasi Semantik</span>
              <span style={{ color: '#34d399', fontFamily: 'monospace' }}>Transparansi: {(maskOpacity * 100).toFixed(0)}%</span>
            </div>
            <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { type: 'all', label: 'Semua Kelas' },
              { type: 'sky', label: 'Langit (#38bdf8)' },
              { type: 'road', label: 'Jalan (#a855f7)' },
              { type: 'car', label: 'Mobil (#10b981)' }
            ].map((c) => (
              <button
                key={c.type}
                onClick={() => setSelectedClass(c.type as any)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  background: selectedClass === c.type ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedClass === c.type ? 'var(--on-primary)' : 'var(--text)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics and Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
              Transparansi Lapisan Masker (Alpha):
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={maskOpacity}
              onChange={(e) => setMaskOpacity(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ background: '#020617', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.82rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Evaluasi Metrik Segmentasi Objek:
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: '#94a3b8' }}>Intersection-over-Union (IoU):</span>
              <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{(metrics.iou * 100).toFixed(1)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: '#94a3b8' }}>Dice Coefficient (F1):</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{(metrics.dice * 100).toFixed(1)}%</strong>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
              Formula IoU: TP / (TP + FP + FN). Formula Dice: 2·TP / (2·TP + FP + FN).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


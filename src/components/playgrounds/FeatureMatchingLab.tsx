import React, { useState, useEffect, useRef } from 'react';
import { detectHarrisCorners, matchDescriptors, type MatchPair } from '../../lib/cvProcessing';

export const FeatureMatchingLab: React.FC = () => {
  const [ratioThreshold, setRatioThreshold] = useState<number>(0.75);
  const [cornerThresh, setCornerThresh] = useState<number>(500);
  const [matches, setMatches] = useState<MatchPair[]>([]);
  const [kp1Count, setKp1Count] = useState<number>(0);
  const [kp2Count, setKp2Count] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 280;
  const H = 200;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W * 2 + 20;
    canvas.height = H;

    // Draw Query Image (Left)
    const c1 = document.createElement('canvas');
    c1.width = W;
    c1.height = H;
    const ctx1 = c1.getContext('2d')!;
    ctx1.fillStyle = '#0f172a';
    ctx1.fillRect(0, 0, W, H);
    // Draw polygon & geometric shapes
    ctx1.fillStyle = '#38bdf8';
    ctx1.fillRect(50, 40, 80, 80);
    ctx1.fillStyle = '#f59e0b';
    ctx1.beginPath();
    ctx1.arc(180, 100, 35, 0, Math.PI * 2);
    ctx1.fill();
    ctx1.fillStyle = '#10b981';
    ctx1.beginPath();
    ctx1.moveTo(80, 140);
    ctx1.lineTo(130, 180);
    ctx1.lineTo(50, 180);
    ctx1.closePath();
    ctx1.fill();

    // Draw Target Image (Right, slightly shifted and transformed)
    const c2 = document.createElement('canvas');
    c2.width = W;
    c2.height = H;
    const ctx2 = c2.getContext('2d')!;
    ctx2.fillStyle = '#0f172a';
    ctx2.fillRect(0, 0, W, H);
    ctx2.fillStyle = '#38bdf8';
    ctx2.fillRect(70, 50, 75, 75);
    ctx2.fillStyle = '#f59e0b';
    ctx2.beginPath();
    ctx2.arc(195, 110, 35, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.fillStyle = '#10b981';
    ctx2.beginPath();
    ctx2.moveTo(100, 150);
    ctx2.lineTo(150, 190);
    ctx2.lineTo(70, 190);
    ctx2.closePath();
    ctx2.fill();

    const d1 = ctx1.getImageData(0, 0, W, H);
    const d2 = ctx2.getImageData(0, 0, W, H);

    // Convert to grayscale
    const g1 = new Uint8Array(W * H);
    const g2 = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      g1[i] = Math.round(0.299 * d1.data[i * 4] + 0.587 * d1.data[i * 4 + 1] + 0.114 * d1.data[i * 4 + 2]);
      g2[i] = Math.round(0.299 * d2.data[i * 4] + 0.587 * d2.data[i * 4 + 1] + 0.114 * d2.data[i * 4 + 2]);
    }

    const kp1 = detectHarrisCorners(g1, W, H, cornerThresh);
    const kp2 = detectHarrisCorners(g2, W, H, cornerThresh);
    setKp1Count(kp1.length);
    setKp2Count(kp2.length);

    const m = matchDescriptors(kp1, kp2, ratioThreshold);
    setMatches(m);

    // Render composite side-by-side
    ctx.drawImage(c1, 0, 0);
    ctx.drawImage(c2, W + 20, 0);

    // Divider
    ctx.fillStyle = '#334155';
    ctx.fillRect(W, 0, 20, H);

    // Draw Keypoints
    ctx.fillStyle = '#38bdf8';
    for (const p of kp1) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#818cf8';
    for (const p of kp2) {
      ctx.beginPath();
      ctx.arc(p.x + W + 20, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw match lines
    ctx.lineWidth = 1.5;
    for (const match of m) {
      const p1 = kp1[match.queryIdx];
      const p2 = kp2[match.trainIdx];

      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x + W + 20, p2.y);
      ctx.stroke();
    }
  }, [ratioThreshold, cornerThresh]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Laboratorium Deteksi &amp; Pencocokan Fitur (Bab 37)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Ekstraksi sudut Harris, komputasi deskriptor intensitas lokal, dan pencocokan korespondensi fitur menggunakan Lowe's Ratio Test.
        </p>
      </div>

      <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
          <span>Citra Kueri (Kiri) vs Citra Target Tergeser (Kanan)</span>
          <span style={{ color: '#34d399', fontFamily: 'monospace' }}>
            {matches.length} Korespondensi Terpilih
          </span>
        </div>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Lowe's Ratio Test (d1 / d2):</span>
            <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{ratioThreshold.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min={0.4}
            max={0.95}
            step={0.05}
            value={ratioThreshold}
            onChange={(e) => setRatioThreshold(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Ambang Sudut Harris (R):</span>
            <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{cornerThresh}</strong>
          </div>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={cornerThresh}
            onChange={(e) => setCornerThresh(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>Statistik Fitur:</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Keypoints Citra 1:</span>
            <strong style={{ color: '#38bdf8' }}>{kp1Count}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Keypoints Citra 2:</span>
            <strong style={{ color: '#818cf8' }}>{kp2Count}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

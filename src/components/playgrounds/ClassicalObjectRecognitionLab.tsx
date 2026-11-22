import React, { useState, useEffect, useRef } from 'react';
import { matchTemplateNCC } from '../../lib/cvProcessing';

export const ClassicalObjectRecognitionLab: React.FC = () => {
  const [templateType, setTemplateType] = useState<'circle' | 'square' | 'triangle'>('circle');
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 140, y: 80 });
  const [detectedPos, setDetectedPos] = useState<{ x: number; y: number; score: number }>({ x: 0, y: 0, score: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 320;
  const H = 200;
  const TW = 36;
  const TH = 36;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    // Create scene canvas
    const sceneCanvas = document.createElement('canvas');
    sceneCanvas.width = W;
    sceneCanvas.height = H;
    const sCtx = sceneCanvas.getContext('2d')!;

    sCtx.fillStyle = '#0f172a';
    sCtx.fillRect(0, 0, W, H);

    // Draw background clutter (distractors)
    sCtx.fillStyle = '#334155';
    sCtx.fillRect(40, 30, 30, 30);
    sCtx.beginPath();
    sCtx.arc(260, 140, 20, 0, Math.PI * 2);
    sCtx.fill();

    // Create template canvas
    const tCanvas = document.createElement('canvas');
    tCanvas.width = TW;
    tCanvas.height = TH;
    const tCtx = tCanvas.getContext('2d')!;
    tCtx.fillStyle = '#1e293b';
    tCtx.fillRect(0, 0, TW, TH);

    if (templateType === 'circle') {
      tCtx.fillStyle = '#38bdf8';
      tCtx.beginPath();
      tCtx.arc(TW / 2, TH / 2, 14, 0, Math.PI * 2);
      tCtx.fill();
    } else if (templateType === 'square') {
      tCtx.fillStyle = '#f59e0b';
      tCtx.fillRect(6, 6, 24, 24);
    } else {
      tCtx.fillStyle = '#10b981';
      tCtx.beginPath();
      tCtx.moveTo(TW / 2, 6);
      tCtx.lineTo(TW - 6, TH - 6);
      tCtx.lineTo(6, TH - 6);
      tCtx.closePath();
      tCtx.fill();
    }

    // Draw template onto scene at targetPos
    sCtx.drawImage(tCanvas, targetPos.x, targetPos.y);

    const sceneData = sCtx.getImageData(0, 0, W, H);
    const tplData = tCtx.getImageData(0, 0, TW, TH);

    // Convert to grayscale
    const sceneGray = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      sceneGray[i] = sceneData.data[i * 4];
    }
    const tplGray = new Uint8Array(TW * TH);
    for (let i = 0; i < TW * TH; i++) {
      tplGray[i] = tplData.data[i * 4];
    }

    // Run Normalized Cross-Correlation
    const res = matchTemplateNCC(sceneGray, W, H, tplGray, TW, TH);
    setDetectedPos({ x: res.bestX, y: res.bestY, score: res.score });

    // Render Scene to display canvas
    ctx.drawImage(sceneCanvas, 0, 0);

    // Draw Detection Bounding Box
    ctx.strokeStyle = res.score > 0.85 ? '#34d399' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(res.bestX, res.bestY, TW, TH);

    // Draw label
    ctx.fillStyle = res.score > 0.85 ? '#34d399' : '#f59e0b';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(
      `NCC: ${(res.score * 100).toFixed(1)}% [${templateType}]`,
      res.bestX,
      Math.max(12, res.bestY - 5)
    );
  }, [templateType, targetPos]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Laboratorium Pengenalan Objek Klasik &amp; Template Matching NCC (Bab 40)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Pencarian dan lokalisasi template visual pada citra menggunakan koefisien korelasi silang ternormalisasi (Normalized Cross-Correlation).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span>Scene Deteksi Citra (320x200)</span>
            <span style={{ color: detectedPos.score > 0.85 ? '#34d399' : '#f59e0b', fontFamily: 'monospace' }}>
              Skor NCC: {(detectedPos.score * 100).toFixed(1)}%
            </span>
          </div>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}>
              Pilihan Template Objek Target:
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              {[
                { type: 'circle', label: 'Lingkaran (Cyan)' },
                { type: 'square', label: 'Kotak (Amber)' },
                { type: 'triangle', label: 'Segitiga (Hijau)' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setTemplateType(item.type as any)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    background: templateType === item.type ? 'var(--primary)' : 'var(--bg-card)',
                    color: templateType === item.type ? 'var(--on-primary)' : 'var(--text)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Posisi Objek X:</span>
                <strong style={{ fontFamily: 'monospace' }}>{targetPos.x} px</strong>
              </div>
              <input
                type="range"
                min={20}
                max={260}
                value={targetPos.x}
                onChange={(e) => setTargetPos({ ...targetPos, x: Number(e.target.value) })}
                style={{ width: '100%' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Posisi Objek Y:</span>
                <strong style={{ fontFamily: 'monospace' }}>{targetPos.y} px</strong>
              </div>
              <input
                type="range"
                min={20}
                max={140}
                value={targetPos.y}
                onChange={(e) => setTargetPos({ ...targetPos, y: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ background: '#020617', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.82rem' }}>
            <span style={{ color: '#38bdf8', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
              Hasil Evaluasi Pengenalan:
            </span>
            <div style={{ color: '#e2e8f0', lineHeight: 1.6 }}>
              Koordinat Terdeteksi: <strong>[{detectedPos.x}, {detectedPos.y}]</strong>
              <br />
              Tingkat Keyakinan NCC: <strong>{(detectedPos.score * 100).toFixed(1)}%</strong>
              <br />
              Status: <span style={{ color: detectedPos.score > 0.85 ? '#34d399' : '#f59e0b' }}>
                {detectedPos.score > 0.85 ? 'Objek Berhasil Dikenali' : 'Pencocokan Kurang Sempurna'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


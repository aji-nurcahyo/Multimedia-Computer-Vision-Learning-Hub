import React, { useState, useEffect, useRef } from 'react';
import { computeScaledDotProductAttention } from '../../lib/cvProcessing';

export const VisionTransformerExplorer: React.FC = () => {
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(5);
  const patchGrid = 4; // 4x4 = 16 tokens

  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const attentionCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 200;
  const H = 200;
  const numTokens = patchGrid * patchGrid;

  useEffect(() => {
    const imgC = imageCanvasRef.current;
    const attC = attentionCanvasRef.current;
    if (!imgC || !attC) return;
    const imgCtx = imgC.getContext('2d');
    const attCtx = attC.getContext('2d');
    if (!imgCtx || !attCtx) return;

    imgC.width = W;
    imgC.height = H;
    attC.width = W;
    attC.height = H;

    // Draw synthetic visual object
    imgCtx.fillStyle = '#0f172a';
    imgCtx.fillRect(0, 0, W, H);
    imgCtx.fillStyle = '#38bdf8';
    imgCtx.beginPath();
    imgCtx.arc(100, 100, 50, 0, Math.PI * 2);
    imgCtx.fill();
    imgCtx.fillStyle = '#f59e0b';
    imgCtx.fillRect(70, 70, 60, 60);

    // Draw Patch Grid
    const patchW = W / patchGrid;
    const patchH = H / patchGrid;

    imgCtx.strokeStyle = '#64748b';
    imgCtx.lineWidth = 1;
    for (let i = 0; i <= patchGrid; i++) {
      imgCtx.beginPath();
      imgCtx.moveTo(i * patchW, 0);
      imgCtx.lineTo(i * patchW, H);
      imgCtx.stroke();
      imgCtx.beginPath();
      imgCtx.moveTo(0, i * patchH);
      imgCtx.lineTo(W, i * patchH);
      imgCtx.stroke();
    }

    // Highlight selected query token patch
    const selX = (selectedTokenIdx % patchGrid) * patchW;
    const selY = Math.floor(selectedTokenIdx / patchGrid) * patchH;
    imgCtx.strokeStyle = '#f43f5e';
    imgCtx.lineWidth = 2.5;
    imgCtx.strokeRect(selX, selY, patchW, patchH);

    // Generate synthetic Query, Key vectors of dimension dK=4
    const Q: number[][] = [];
    const K: number[][] = [];
    const V: number[][] = [];

    for (let i = 0; i < numTokens; i++) {
      const isCenter = i >= 5 && i <= 10;
      Q.push([isCenter ? 1.5 : 0.2, (i % 4) * 0.3, Math.sin(i), Math.cos(i)]);
      K.push([isCenter ? 1.4 : 0.1, (i % 4) * 0.3, Math.sin(i), Math.cos(i)]);
      V.push([1, 1, 1, 1]);
    }

    const { attentionWeights } = computeScaledDotProductAttention(Q, K, V);

    // Render Attention Weight Heatmap
    const cellW = W / numTokens;
    const cellH = H / numTokens;

    for (let r = 0; r < numTokens; r++) {
      for (let c = 0; c < numTokens; c++) {
        const weight = attentionWeights[r][c];
        const val = Math.min(255, Math.round(weight * numTokens * 40));
        attCtx.fillStyle = `rgb(${val}, ${Math.round(val * 0.7)}, ${255 - val})`;
        attCtx.fillRect(c * cellW, r * cellH, cellW, cellH);
      }
    }

    // Highlight selected row in attention matrix
    attCtx.strokeStyle = '#f43f5e';
    attCtx.lineWidth = 1.5;
    attCtx.strokeRect(0, selectedTokenIdx * cellH, W, cellH);
  }, [selectedTokenIdx, patchGrid]);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Simulator Vision Transformer (ViT) &amp; Self-Attention (Bab 46)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Tokenisasi patch citra spasial 2D, proyeksi embedding linear, dan perhitungan matriks atensi multi-head Scaled Dot-Product Attention.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', background: '#020617', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
              Patch Token Citra (Grid 4x4)
            </span>
            <canvas ref={imageCanvasRef} style={{ width: '140px', height: '140px', border: '1px solid #334155', borderRadius: '4px' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'block', marginBottom: '0.4rem' }}>
              Matriks Atensi A (16x16)
            </span>
            <canvas ref={attentionCanvasRef} style={{ width: '140px', height: '140px', border: '1px solid #38bdf8', borderRadius: '4px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
              Pilih Token Kueri (Patch Index):
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
              <span>Indeks Patch Query (Q_i):</span>
              <strong style={{ color: '#f43f5e', fontFamily: 'monospace' }}>Token #{selectedTokenIdx}</strong>
            </div>
            <input
              type="range"
              min={0}
              max={numTokens - 1}
              value={selectedTokenIdx}
              onChange={(e) => setSelectedTokenIdx(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ background: '#020617', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', color: '#e2e8f0' }}>
            <span style={{ color: '#34d399', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Mekanisme Attention(Q, K, V):
            </span>
            <div>1. Citra 200x200 dipotong menjadi 16 patch 50x50.</div>
            <div>2. Skor $S_{'{'}ij{'}'} = \frac{'{'}Q_i \cdot K_j^T{'}'}{'{\\sqrt{d_k}}'}$.</div>
            <div>3. Normalisasi Softmax baris menjamin $\sum_{'{'}j=1{'}'}^{'{'}16{'}'} A_{'{'}ij{'}'} = 1.0$.</div>
            <div>4. Bobot tinggi mengindikasikan korelasi semantik antar patch jarak jauh.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

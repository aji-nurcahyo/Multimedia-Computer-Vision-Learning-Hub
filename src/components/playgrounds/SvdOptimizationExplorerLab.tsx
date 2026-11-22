import React, { useState, useEffect, useRef } from 'react';
import {
  computeSvd2x2,
  lowRankApprox2x2,
  type Svd2x2Result
} from '../../lib/advancedCvProcessing';
import { RotateCcw, Sliders, Activity } from 'lucide-react';

export const SvdOptimizationExplorerLab: React.FC = () => {
  // 2x2 Matrix entries: A = [[a, b], [c, d]]
  const [a, setA] = useState<number>(2.5);
  const [b, setB] = useState<number>(1.2);
  const [c, setC] = useState<number>(0.8);
  const [d, setD] = useState<number>(1.8);

  // Approximation rank
  const [rank, setRank] = useState<1 | 2>(2);

  // Optimization simulation state
  const [learningRate, setLearningRate] = useState<number>(0.15);
  const [optSteps, setOptSteps] = useState<number>(15);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute SVD
  const A = [
    [a, b],
    [c, d]
  ];
  const svd: Svd2x2Result = computeSvd2x2(A);
  const A_approx = lowRankApprox2x2(svd, rank);

  // Render geometric transformation of unit circle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 55; // pixels per unit

    ctx.clearRect(0, 0, w, h);

    // Draw Grid & Axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    for (let x = -4; x <= 4; x++) {
      ctx.beginPath();
      ctx.moveTo(cx + x * scale, 0);
      ctx.lineTo(cx + x * scale, h);
      ctx.stroke();
    }
    for (let y = -4; y <= 4; y++) {
      ctx.beginPath();
      ctx.moveTo(0, cy - y * scale);
      ctx.lineTo(w, cy - y * scale);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    // 1. Draw Unit Circle (Input Domain S^1) in subtle blue
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, scale, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Transformed Ellipse under A_approx
    ctx.strokeStyle = rank === 2 ? '#34d399' : '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const numSamples = 120;
    for (let i = 0; i <= numSamples; i++) {
      const theta = (i * 2 * Math.PI) / numSamples;
      const x = Math.cos(theta);
      const y = Math.sin(theta);
      // y_vec = A_approx * [x, y]^T
      const tx = A_approx[0][0] * x + A_approx[0][1] * y;
      const ty = A_approx[1][0] * x + A_approx[1][1] * y;

      const px = cx + tx * scale;
      const py = cy - ty * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 3. Draw Singular Vectors (Principal Axes of the Ellipse)
    // Major axis: sigma1 * u1
    const s1 = svd.S[0];
    const u1 = [svd.U[0][0], svd.U[1][0]];
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + s1 * u1[0] * scale, cy - s1 * u1[1] * scale);
    ctx.stroke();

    // Minor axis: sigma2 * u2 (if rank >= 2)
    if (rank >= 2) {
      const s2 = svd.S[1];
      const u2 = [svd.U[0][1], svd.U[1][1]];
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + s2 * u2[0] * scale, cy - s2 * u2[1] * scale);
      ctx.stroke();
    }

    // 4. Simulate and Draw Gradient Descent Optimization Path on quadratic surface
    // f(x, y) = 0.5 * [x, y] * A^T A * [x, y]^T
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.lineWidth = 2;
    let optX = 3.2;
    let optY = 2.8;

    ctx.beginPath();
    ctx.moveTo(cx + optX * scale, cy - optY * scale);
    ctx.arc(cx + optX * scale, cy - optY * scale, 4, 0, 2 * Math.PI);
    ctx.fill();

    for (let step = 0; step < optSteps; step++) {
      // grad = A^T A * [optX, optY]^T
      const atA00 = A[0][0] * A[0][0] + A[1][0] * A[1][0];
      const atA01 = A[0][0] * A[0][1] + A[1][0] * A[1][1];
      const atA10 = atA01;
      const atA11 = A[0][1] * A[0][1] + A[1][1] * A[1][1];

      const gx = atA00 * optX + atA01 * optY;
      const gy = atA10 * optX + atA11 * optY;

      optX -= learningRate * gx;
      optY -= learningRate * gy;

      const px = cx + optX * scale;
      const py = cy - optY * scale;

      ctx.lineTo(px, py);
      ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
    }
    ctx.stroke();
  }, [A, A_approx, rank, svd, learningRate, optSteps]);

  const resetMatrix = () => {
    setA(2.5);
    setB(1.2);
    setC(0.8);
    setD(1.8);
    setRank(2);
    setLearningRate(0.15);
    setOptSteps(15);
  };

  const makeIllConditioned = () => {
    setA(3.0);
    setB(2.99);
    setC(1.5);
    setD(1.49);
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        boxShadow: 'var(--card-shadow)',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            <Activity size={14} />
            <span>Laboratorium Tier A · Modul ADV-01</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
            SVD &amp; Optimization Manifold Explorer
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Eksplorasi dekomposisi nilai singular $A = U \Sigma V^T$, distorsi elipsoid dari lingkaran satuan, dan dinamika konvergensi optimasi kuadratik.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={makeIllConditioned}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--danger)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Set matrix to near-singular ill-conditioned state"
          >
            Uji Matriks Sakit (Ill-Conditioned)
          </button>
          <button
            onClick={resetMatrix}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Interactive Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              aspectRatio: '1',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <canvas ref={canvasRef} width={460} height={460} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.4)' }} /> Lingkaran Satuan $S^1$
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} /> Elipsoid $A(S^1)$
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} /> Vektor $\sigma_1 u_1$
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} /> Lintasan Gradient Descent
            </span>
          </div>
        </div>

        {/* Right: Controls & SVD Mathematics */}
        <div>
          {/* SVD Analytics Output Box */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              marginBottom: '1.25rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Nilai Singular &amp; Kondisi Numerik:</span>
              <span style={{ color: svd.conditionNumber > 15 ? 'var(--danger)' : 'var(--accent)', fontWeight: 700 }}>
                {svd.conditionNumber > 15 ? 'Buruk (Ill-conditioned)' : 'Sehat (Well-conditioned)'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>$\sigma_1$ (Aksis Mayor): <strong>{svd.S[0].toFixed(3)}</strong></div>
              <div>$\sigma_2$ (Aksis Minor): <strong>{svd.S[1].toFixed(3)}</strong></div>
              <div>Kondisi $\kappa(A) = \frac{'{'}\sigma_1{'}'}{'{'}\sigma_2{'}'}$: <strong>{svd.conditionNumber === Infinity ? '∞' : svd.conditionNumber.toFixed(2)}</strong></div>
              <div>Energi Rank-1: <strong>{((svd.S[0] ** 2 / (svd.S[0] ** 2 + svd.S[1] ** 2)) * 100).toFixed(1)}%</strong></div>
            </div>
          </div>

          {/* Matrix Controls */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sliders size={15} color="var(--primary)" />
              Koefisien Matriks A = [[a, b], [c, d]]:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>$a$: {a.toFixed(2)}</label>
                <input type="range" min="-3" max="3" step="0.1" value={a} onChange={(e) => setA(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>$b$: {b.toFixed(2)}</label>
                <input type="range" min="-3" max="3" step="0.1" value={b} onChange={(e) => setB(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>$c$: {c.toFixed(2)}</label>
                <input type="range" min="-3" max="3" step="0.1" value={c} onChange={(e) => setC(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>$d$: {d.toFixed(2)}</label>
                <input type="range" min="-3" max="3" step="0.1" value={d} onChange={(e) => setD(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Approximation Rank Selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
              Aproksimasi Matriks (Eckart-Young Theorem):
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setRank(2)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  background: rank === 2 ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: rank === 2 ? 'var(--on-primary)' : 'var(--text)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Full Rank 2 ($A$)
              </button>
              <button
                onClick={() => setRank(1)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  background: rank === 1 ? 'var(--warning)' : 'var(--bg-subtle)',
                  color: rank === 1 ? '#000' : 'var(--text)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Low-Rank 1 ($A_1 = \sigma_1 u_1 v_1^T$)
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              {rank === 1 ? 'Matriks runtuh menjadi garis 1D sepanjang vektor singular mayor u1.' : 'Elipsoid 2D mempertahankan kedua sumbu singular.'}
            </div>
          </div>

          {/* Optimization Parameters */}
          <div style={{ padding: '0.85rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
              Parameter Gradient Descent pada Permukaan $A^T A$:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Learning Rate $\alpha$: {learningRate.toFixed(2)}</label>
                <input type="range" min="0.02" max="0.35" step="0.01" value={learningRate} onChange={(e) => setLearningRate(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Langkah Iterasi: {optSteps}</label>
                <input type="range" min="5" max="30" step="1" value={optSteps} onChange={(e) => setOptSteps(parseInt(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Ketika $\kappa(A)$ besar, gradien berosilasi tajam tegak lurus terhadap lembah sempit, menjelaskan mengapa optimasi orde-dua (Gauss-Newton) diperlukan pada visual SLAM.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

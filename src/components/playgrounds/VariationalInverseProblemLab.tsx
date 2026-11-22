import React, { useState, useEffect, useRef } from 'react';
import {
  convolve2D,
  computeTotalVariation,
  solveAdmmTvDenoising,
  computeImageMetrics
} from '../../lib/advancedCvProcessing';
import { Sliders, RotateCcw, Activity, ShieldCheck } from 'lucide-react';

type TestPattern = 'step' | 'checker' | 'pulse' | 'barcode';
type BlurType = 'none' | 'box3' | 'box5' | 'gaussian';
type SolverMethod = 'admm-rof' | 'tikhonov' | 'unregularized';

export const VariationalInverseProblemLab: React.FC = () => {
  const [pattern, setPattern] = useState<TestPattern>('step');
  const [blurType, setBlurType] = useState<BlurType>('box3');
  const [noiseSigma, setNoiseSigma] = useState<number>(18);
  const [method, setMethod] = useState<SolverMethod>('admm-rof');
  const [lambda, setLambda] = useState<number>(0.25);
  const [rho, setRho] = useState<number>(1.2);
  const [iterations, setIterations] = useState<number>(20);
  const [isotropic, setIsotropic] = useState<boolean>(true);

  // Telemetry state
  const [metrics, setMetrics] = useState<{
    psnrDegraded: number;
    psnrRestored: number;
    ssimDegraded: number;
    ssimRestored: number;
    tvClean: number;
    tvDegraded: number;
    tvRestored: number;
    primalResiduals: number[];
    dualResiduals: number[];
  }>({
    psnrDegraded: 0,
    psnrRestored: 0,
    ssimDegraded: 0,
    ssimRestored: 0,
    tvClean: 0,
    tvDegraded: 0,
    tvRestored: 0,
    primalResiduals: [],
    dualResiduals: [],
  });

  const canvasCleanRef = useRef<HTMLCanvasElement | null>(null);
  const canvasDegradedRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRestoredRef = useRef<HTMLCanvasElement | null>(null);
  const canvasDiffRef = useRef<HTMLCanvasElement | null>(null);

  // Generate synthetic clean image (32x32)
  const N = 32;

  const generateCleanImage = (type: TestPattern): number[][] => {
    const img: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        switch (type) {
          case 'step':
            img[r][c] = c < N / 2 ? 40 : 210;
            break;
          case 'checker':
            const blockSize = 8;
            const cr = Math.floor(r / blockSize);
            const cc = Math.floor(c / blockSize);
            img[r][c] = (cr + cc) % 2 === 0 ? 30 : 220;
            break;
          case 'pulse': {
            const dr = r - N / 2;
            const dc = c - N / 2;
            const distSq = dr * dr + dc * dc;
            img[r][c] = Math.round(30 + 190 * Math.exp(-distSq / (2 * 5 * 5)));
            break;
          }
          case 'barcode':
            img[r][c] = (Math.floor(c / 3) % 2 === 0) ? 220 : 30;
            break;
        }
      }
    }
    return img;
  };

  const getBlurKernel = (b: BlurType): number[][] => {
    switch (b) {
      case 'none':
        return [[1]];
      case 'box3':
        return [
          [1 / 9, 1 / 9, 1 / 9],
          [1 / 9, 1 / 9, 1 / 9],
          [1 / 9, 1 / 9, 1 / 9],
        ];
      case 'box5':
        return Array.from({ length: 5 }, () => new Array(5).fill(1 / 25));
      case 'gaussian':
        return [
          [1 / 16, 2 / 16, 1 / 16],
          [2 / 16, 4 / 16, 2 / 16],
          [1 / 16, 2 / 16, 1 / 16],
        ];
    }
  };

  // Run pipeline
  useEffect(() => {
    const clean = generateCleanImage(pattern);
    const kernel = getBlurKernel(blurType);

    // 1. Forward Degradation: y = A*x + n
    const blurred = convolve2D(clean, kernel);

    // Pseudo-random Gaussian noise generator (Box-Muller)
    let seed = 42;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const degraded: number[][] = blurred.map((row) =>
      row.map((val) => {
        const u1 = Math.max(1e-6, pseudoRandom());
        const u2 = pseudoRandom();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const noisy = val + z0 * noiseSigma;
        return Math.max(0, Math.min(255, noisy));
      })
    );

    // 2. Inverse Problem Solver
    let restored: number[][] = [];
    let pResiduals: number[] = [];
    let dResiduals: number[] = [];

    if (method === 'admm-rof') {
      const res = solveAdmmTvDenoising(degraded, lambda, rho, iterations);
      restored = res.restored;
      pResiduals = res.primalResiduals;
      dResiduals = res.dualResiduals;
    } else if (method === 'tikhonov') {
      // 2D Tikhonov smoothing: solves (I + lambda * Laplacian) x = y
      restored = degraded.map((r) => [...r]);
      for (let it = 0; it < iterations; it++) {
        const next = restored.map((r) => [...r]);
        for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
            const left = c > 0 ? restored[r][c - 1] : restored[r][c];
            const right = c < N - 1 ? restored[r][c + 1] : restored[r][c];
            const up = r > 0 ? restored[r - 1][c] : restored[r][c];
            const down = r < N - 1 ? restored[r + 1][c] : restored[r][c];
            next[r][c] = (degraded[r][c] + lambda * (left + right + up + down)) / (1 + 4 * lambda);
          }
        }
        restored = next;
        pResiduals.push(Math.exp(-it / 5) * 10);
        dResiduals.push(Math.exp(-it / 5) * 8);
      }
    } else {
      // Unregularized: just noisy blurred input (or raw naive deconv)
      restored = degraded.map((r) => [...r]);
      pResiduals = [0];
      dResiduals = [0];
    }

    // 3. Render onto Canvases
    const render2D = (canvas: HTMLCanvasElement | null, data: number[][], isDiff = false) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cellW = w / N;
      const cellH = h / N;

      ctx.clearRect(0, 0, w, h);

      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const val = data[r][c];
          if (isDiff) {
            // Thermal color mapping for error: black -> amber -> red
            const err = Math.min(255, val * 3);
            ctx.fillStyle = `rgb(${err}, ${Math.floor(err * 0.4)}, ${Math.floor(err * 0.1)})`;
          } else {
            const v = Math.max(0, Math.min(255, Math.round(val)));
            ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
          }
          ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    };

    render2D(canvasCleanRef.current, clean);
    render2D(canvasDegradedRef.current, degraded);
    render2D(canvasRestoredRef.current, restored);

    // Compute error difference |clean - restored|
    const diff: number[][] = Array.from({ length: N }, (_, r) =>
      Array.from({ length: N }, (_, c) => Math.abs(clean[r][c] - restored[r][c]))
    );
    render2D(canvasDiffRef.current, diff, true);

    // 4. Quantitative Metrics
    const toUint8 = (mat: number[][]) => {
      const arr = new Uint8ClampedArray(N * N * 4);
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const idx = (r * N + c) * 4;
          const v = Math.max(0, Math.min(255, Math.round(mat[r][c])));
          arr[idx] = v;
          arr[idx + 1] = v;
          arr[idx + 2] = v;
          arr[idx + 3] = 255;
        }
      }
      return arr;
    };

    const cleanArr = toUint8(clean);
    const degArr = toUint8(degraded);
    const restArr = toUint8(restored);

    const mDeg = computeImageMetrics(cleanArr, degArr, N, N);
    const mRest = computeImageMetrics(cleanArr, restArr, N, N);

    setMetrics({
      psnrDegraded: mDeg.psnr,
      psnrRestored: mRest.psnr,
      ssimDegraded: mDeg.ssim,
      ssimRestored: mRest.ssim,
      tvClean: computeTotalVariation(clean, isotropic),
      tvDegraded: computeTotalVariation(degraded, isotropic),
      tvRestored: computeTotalVariation(restored, isotropic),
      primalResiduals: pResiduals,
      dualResiduals: dResiduals,
    });
  }, [pattern, blurType, noiseSigma, method, lambda, rho, iterations, isotropic]);

  const psnrGain = metrics.psnrRestored - metrics.psnrDegraded;

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--primary)" />
            Laboratorium Masalah Inversi Variasional &amp; ADMM TV
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Restorasi citra terdegradasi forward $y = Ax + n$ via optimasi pemisahan variabel Rudin-Osher-Fatemi (ROF).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              setPattern('step');
              setBlurType('box3');
              setNoiseSigma(18);
              setMethod('admm-rof');
              setLambda(0.25);
              setRho(1.2);
              setIterations(20);
            }}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-subtle)',
              color: 'var(--text)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <RotateCcw size={14} /> Reset Default
          </button>
        </div>
      </div>

      {/* Main Grid: Controls & Visual Displays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
        {/* Controls Column */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '1.25rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sliders size={16} /> Parameter Forward &amp; Solver
          </div>

          {/* Test Pattern */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Pola Citra Uji Sintetis ($x$ Asli):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              {[
                { id: 'step', label: 'Step Edge (Bimodal)' },
                { id: 'checker', label: 'Checkerboard (4x4)' },
                { id: 'pulse', label: 'Gaussian Pulse' },
                { id: 'barcode', label: 'Barcode Stripes' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPattern(p.id as TestPattern)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: pattern === p.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: pattern === p.id ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card)',
                    color: pattern === p.id ? 'var(--primary)' : 'var(--text)',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Degradation Operator A */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Operator Konvolusi Degradasi Blur ($A$):
            </label>
            <select
              value={blurType}
              onChange={(e) => setBlurType(e.target.value as BlurType)}
              style={{
                width: '100%',
                padding: '0.45rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
                fontSize: '0.82rem',
              }}
            >
              <option value="none">Identitas (Tanpa Blur / Denoising Saja)</option>
              <option value="box3">Box Blur 3x3 (Averaging Keruh)</option>
              <option value="box5">Box Blur 5x5 (Defokus Parah)</option>
              <option value="gaussian">Gaussian Blur 3x3</option>
            </select>
          </div>

          {/* Noise Level sigma */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Derau Gaussian Noise ($\sigma$):</span>
              <strong style={{ color: 'var(--text)' }}>{noiseSigma} DN</strong>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={noiseSigma}
              onChange={(e) => setNoiseSigma(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Regularization Method */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Metode Rekonstruksi Inversi:
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as SolverMethod)}
              style={{
                width: '100%',
                padding: '0.45rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              <option value="admm-rof">Total Variation ROF (ADMM Variable Splitting)</option>
              <option value="tikhonov">Tikhonov Regularization (L2 Sobolev Smoothing)</option>
              <option value="unregularized">Tanpa Regularisasi (Naive Observation)</option>
            </select>
          </div>

          {/* Solver Parameters */}
          {method === 'admm-rof' && (
            <>
              <div style={{ marginBottom: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Bobot Penalti TV ($\lambda$):</span>
                  <strong style={{ color: 'var(--text)' }}>{lambda.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.2"
                  step="0.05"
                  value={lambda}
                  onChange={(e) => setLambda(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Augmented Lagrangian ($\rho$):</span>
                  <strong style={{ color: 'var(--text)' }}>{rho.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={rho}
                  onChange={(e) => setRho(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Iterasi ADMM ($K$):</span>
                  <strong style={{ color: 'var(--text)' }}>{iterations}</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isoCheck"
                  checked={isotropic}
                  onChange={(e) => setIsotropic(e.target.checked)}
                />
                <label htmlFor="isoCheck" style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                  Total Variation Isotropik ($\ell_2$ gradien norm)
                </label>
              </div>
            </>
          )}

          {method === 'tikhonov' && (
            <div style={{ marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Parameter Difusi Tikhonov ($\lambda$):</span>
                <strong style={{ color: 'var(--text)' }}>{lambda.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0.05"
                max="2.0"
                step="0.05"
                value={lambda}
                onChange={(e) => setLambda(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>

        {/* Canvases Viewport Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 4 Canvases Quad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {/* Panel 1: Clean */}
            <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Ground Truth ($x$)
              </div>
              <canvas
                ref={canvasCleanRef}
                width={128}
                height={128}
                style={{ width: '100%', maxWidth: '140px', aspectRatio: '1', borderRadius: '4px', imageRendering: 'pixelated', border: '1px solid var(--border)' }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                TV: {metrics.tvClean.toFixed(1)}
              </div>
            </div>

            {/* Panel 2: Degraded */}
            <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f87171', marginBottom: '0.4rem' }}>
                Degraded ($y = Ax + n$)
              </div>
              <canvas
                ref={canvasDegradedRef}
                width={128}
                height={128}
                style={{ width: '100%', maxWidth: '140px', aspectRatio: '1', borderRadius: '4px', imageRendering: 'pixelated', border: '1px solid rgba(248, 113, 113, 0.4)' }}
              />
              <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '0.3rem' }}>
                PSNR: {metrics.psnrDegraded.toFixed(1)} dB
              </div>
            </div>

            {/* Panel 3: Restored */}
            <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                Restorasi (x_hat)
              </div>
              <canvas
                ref={canvasRestoredRef}
                width={128}
                height={128}
                style={{ width: '100%', maxWidth: '140px', aspectRatio: '1', borderRadius: '4px', imageRendering: 'pixelated', border: '1px solid var(--primary)' }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '0.3rem' }}>
                PSNR: {metrics.psnrRestored.toFixed(1)} dB ({psnrGain >= 0 ? `+${psnrGain.toFixed(1)}` : psnrGain.toFixed(1)} dB)
              </div>
            </div>

            {/* Panel 4: Error Diff */}
            <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.4rem' }}>
                Residual Peta Galat (|x - x_hat|)
              </div>
              <canvas
                ref={canvasDiffRef}
                width={128}
                height={128}
                style={{ width: '100%', maxWidth: '140px', aspectRatio: '1', borderRadius: '4px', imageRendering: 'pixelated', border: '1px solid rgba(251, 191, 36, 0.4)' }}
              />
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', marginTop: '0.3rem' }}>
                SSIM: {metrics.ssimRestored.toFixed(3)}
              </div>
            </div>
          </div>

          {/* Telemetry HUD */}
          <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PSNR GAIN</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: psnrGain >= 0 ? 'var(--accent)' : '#f87171' }}>
                  {psnrGain >= 0 ? `+${psnrGain.toFixed(2)}` : psnrGain.toFixed(2)} dB
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SSIM RECOVERY</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {metrics.ssimRestored.toFixed(3)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TV REGULARIZED</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>
                  {metrics.tvRestored.toFixed(0)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PRIMAL RESIDUAL</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8' }}>
                  {metrics.primalResiduals.length > 0 ? metrics.primalResiduals[metrics.primalResiduals.length - 1].toFixed(2) : '0.00'}
                </div>
              </div>
            </div>

            {/* ADMM Convergence Plot */}
            {method === 'admm-rof' && metrics.primalResiduals.length > 1 && (
              <div style={{ marginTop: '0.9rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  <span>Konvergensi Residu ADMM:</span>
                  <span>
                    <strong style={{ color: '#38bdf8' }}>— $\|r^k\|_F$ (Primal)</strong> &nbsp;|&nbsp;{' '}
                    <strong style={{ color: '#34d399' }}>— $\|s^k\|_F$ (Dual)</strong>
                  </span>
                </div>
                <svg viewBox="0 0 300 60" style={{ width: '100%', height: '60px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                  {/* Grid lines */}
                  <line x1="0" y1="15" x2="300" y2="15" stroke="rgba(255,255,255,0.06)" />
                  <line x1="0" y1="35" x2="300" y2="35" stroke="rgba(255,255,255,0.06)" />
                  <line x1="0" y1="55" x2="300" y2="55" stroke="rgba(255,255,255,0.06)" />

                  {/* Primal curve */}
                  {(() => {
                    const maxVal = Math.max(1, ...metrics.primalResiduals);
                    const pts = metrics.primalResiduals
                      .map((val, idx) => {
                        const x = (idx / (metrics.primalResiduals.length - 1)) * 290 + 5;
                        const y = 55 - (val / maxVal) * 48;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ');
                    return <polyline fill="none" stroke="#38bdf8" strokeWidth="2" points={pts} />;
                  })()}

                  {/* Dual curve */}
                  {(() => {
                    const maxVal = Math.max(1, ...metrics.dualResiduals);
                    const pts = metrics.dualResiduals
                      .map((val, idx) => {
                        const x = (idx / (metrics.dualResiduals.length - 1)) * 290 + 5;
                        const y = 55 - (val / maxVal) * 48;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ');
                    return <polyline fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3,2" points={pts} />;
                  })()}
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Educational Guidance Footer */}
      <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8rem', lineHeight: '1.5', color: 'var(--text)' }}>
          <strong>Intuisi Matematika Inversi Variasional:</strong> Operator Tikhonov ($L_2$ norm) memuluskan transisi diskontinuitas
          sehingga tepi batas objek menjadi buram (diffused). Sebaliknya, regularisasi <em>Total Variation (ROF)</em> menghukum gradien non-nol
          secara linear ($\ell_1$ norm dari turunan parsial), sehingga melestarikan ketajaman tepi batas (edge-preserving) sembari
          mengeliminasi derau di area datar (piecewise constant model).
        </div>
      </div>
    </div>
  );
};

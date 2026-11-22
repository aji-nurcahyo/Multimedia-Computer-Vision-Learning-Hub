import React, { useState, useEffect, useRef } from 'react';
import {
  projectPoint3D,
  computeEpipolarLine,
  computeSampsonDistance,
  estimateFundamentalMatrix8Point,
  triangulatePointLinear,
  computeReprojectionRmse,
  optimizeBundleAdjustmentSynthetic
} from '../../lib/advancedCvProcessing';
import { Sliders, RotateCcw, Box, ShieldCheck } from 'lucide-react';

type PresetConstellation = 'single' | 'cube' | 'cross' | 'random';

export const MultiViewGeometryExplorerLab: React.FC = () => {
  // Camera intrinsics & extrinsics
  const [focalLength, setFocalLength] = useState<number>(600);
  const [baseline, setBaseline] = useState<number>(0.8); // meters
  const [yawDeg, setYawDeg] = useState<number>(5); // degrees
  const [noisePx, setNoisePx] = useState<number>(0.5); // pixels
  const [preset, setPreset] = useState<PresetConstellation>('cube');

  // Single target manual coordinates
  const [targetX, setTargetX] = useState<number>(0.1);
  const [targetY, setTargetY] = useState<number>(-0.1);
  const [targetZ, setTargetZ] = useState<number>(3.5);

  // Bundle Adjustment toggle
  const [runBA, setRunBA] = useState<boolean>(true);

  // Canvas refs
  const canvasWorldRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCam1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvasCam2Ref = useRef<HTMLCanvasElement | null>(null);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<{
    disparity: number;
    triangulatedZ: number;
    reconErrorMm: number;
    reprojRmse: number;
    reprojRmseBA: number;
    sampsonErr: number;
    F_mat: number[][];
  }>({
    disparity: 0,
    triangulatedZ: 0,
    reconErrorMm: 0,
    reprojRmse: 0,
    reprojRmseBA: 0,
    sampsonErr: 0,
    F_mat: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  });

  // Sensor dimensions
  const imgW = 320;
  const imgH = 240;
  const cx = imgW / 2;
  const cy = imgH / 2;

  // Generate 3D point constellations
  const get3DPoints = (type: PresetConstellation): Array<[number, number, number]> => {
    switch (type) {
      case 'single':
        return [[targetX, targetY, targetZ]];
      case 'cube': {
        const s = 0.4;
        const cz = 3.5;
        return [
          [-s, -s, cz - s],
          [s, -s, cz - s],
          [s, s, cz - s],
          [-s, s, cz - s],
          [-s, -s, cz + s],
          [s, -s, cz + s],
          [s, s, cz + s],
          [-s, s, cz + s],
        ];
      }
      case 'cross': {
        const cz = 3.2;
        return [
          [0, 0, cz],
          [-0.5, 0, cz],
          [0.5, 0, cz],
          [0, -0.4, cz],
          [0, 0.4, cz],
          [-0.3, -0.3, cz + 0.3],
          [0.3, 0.3, cz - 0.3],
          [-0.3, 0.3, cz + 0.2],
        ];
      }
      case 'random': {
        let seed = 123;
        const pr = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };
        const pts: Array<[number, number, number]> = [];
        for (let i = 0; i < 10; i++) {
          pts.push([(pr() - 0.5) * 1.5, (pr() - 0.5) * 1.0, 2.5 + pr() * 2.0]);
        }
        return pts;
      }
    }
  };

  useEffect(() => {
    const K = [
      [focalLength, 0, cx],
      [0, focalLength, cy],
      [0, 0, 1],
    ];

    // Camera 1 at origin
    const R1 = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    const t1: [number, number, number] = [0, 0, 0];
    const P1 = [
      [focalLength, 0, cx, 0],
      [0, focalLength, cy, 0],
      [0, 0, 1, 0],
    ];

    // Camera 2 translated by baseline tx and rotated by yaw around Y axis
    const rad = (yawDeg * Math.PI) / 180;
    const cosY = Math.cos(rad);
    const sinY = Math.sin(rad);
    const R2 = [
      [cosY, 0, -sinY],
      [0, 1, 0],
      [sinY, 0, cosY],
    ];
    // In camera 2 coordinate system: X_c2 = R2 * (X_world - C2)
    // C2 in world is [baseline, 0, 0]^T, so t2 = -R2 * C2
    const t2: [number, number, number] = [
      -R2[0][0] * baseline,
      -R2[1][0] * baseline,
      -R2[2][0] * baseline,
    ];

    // P2 = K * [R2 | t2]
    const P2: number[][] = [];
    for (let i = 0; i < 3; i++) {
      const row: number[] = [];
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let k = 0; k < 3; k++) sum += K[i][k] * R2[k][j];
        row.push(sum);
      }
      let tSum = 0;
      for (let k = 0; k < 3; k++) tSum += K[i][k] * t2[k];
      row.push(tSum);
      P2.push(row);
    }

    const worldPoints = get3DPoints(preset);

    // Deterministic pseudo-noise
    let nSeed = 55;
    const pNoise = () => {
      nSeed = (nSeed * 9301 + 49297) % 233280;
      return (nSeed / 233280 - 0.5) * 2;
    };

    // Project points to both cameras
    const rawProjs1 = worldPoints.map((P) => projectPoint3D(P, K, R1, t1));
    const rawProjs2 = worldPoints.map((P) => projectPoint3D(P, K, R2, t2));

    const noisyProjs1: Array<[number, number]> = rawProjs1.map(([u, v]) => [
      u + pNoise() * noisePx,
      v + pNoise() * noisePx,
    ]);
    const noisyProjs2: Array<[number, number]> = rawProjs2.map(([u, v]) => [
      u + pNoise() * noisePx,
      v + pNoise() * noisePx,
    ]);

    // Compute Fundamental matrix using 8-point if >= 8 points, else analytical from Essential matrix
    let F: number[][];
    if (worldPoints.length >= 8) {
      F = estimateFundamentalMatrix8Point(noisyProjs1, noisyProjs2);
    } else {
      // Analytical Essential matrix E = [t2]_x * R2
      const tx = t2[0];
      const ty = t2[1];
      const tz = t2[2];
      const tCross = [
        [0, -tz, ty],
        [tz, 0, -tx],
        [-ty, tx, 0],
      ];
      // E = tCross * R2
      const E: number[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          let sum = 0;
          for (let k = 0; k < 3; k++) sum += tCross[i][k] * R2[k][j];
          E[i][j] = sum;
        }
      }
      // F = K^-T * E * K^-1
      const invFocal = 1 / focalLength;
      const Kinv = [
        [invFocal, 0, -cx * invFocal],
        [0, invFocal, -cy * invFocal],
        [0, 0, 1],
      ];
      const KinvT = [
        [invFocal, 0, 0],
        [0, invFocal, 0],
        [-cx * invFocal, -cy * invFocal, 1],
      ];
      // F = KinvT * E * Kinv
      const temp: number[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          let sum = 0;
          for (let k = 0; k < 3; k++) sum += KinvT[i][k] * E[k][j];
          temp[i][j] = sum;
        }
      }
      F = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          let sum = 0;
          for (let k = 0; k < 3; k++) sum += temp[i][k] * Kinv[k][j];
          F[i][j] = sum;
        }
      }
    }

    // Triangulate points via DLT
    const triangulatedPoints: Array<[number, number, number]> = [];
    let sumDistSq = 0;
    for (let i = 0; i < worldPoints.length; i++) {
      const tri = triangulatePointLinear(noisyProjs1[i], noisyProjs2[i], P1, P2);
      triangulatedPoints.push(tri);

      const dx = tri[0] - worldPoints[i][0];
      const dy = tri[1] - worldPoints[i][1];
      const dz = tri[2] - worldPoints[i][2];
      sumDistSq += dx * dx + dy * dy + dz * dz;
    }
    const reconErrorMm = Math.sqrt(sumDistSq / worldPoints.length) * 1000;

    // Reprojection RMSE
    const observations: Array<{ viewIdx: number; pointIdx: number; uv: [number, number] }> = [];
    for (let i = 0; i < worldPoints.length; i++) {
      observations.push({ viewIdx: 0, pointIdx: i, uv: noisyProjs1[i] });
      observations.push({ viewIdx: 1, pointIdx: i, uv: noisyProjs2[i] });
    }
    const cameras = [
      { K, R: R1, t: t1 },
      { K, R: R2, t: t2 },
    ];
    const initialReprojRmse = computeReprojectionRmse(triangulatedPoints, observations, cameras);

    // Optional Bundle Adjustment optimization
    let finalReprojRmse = initialReprojRmse;
    let finalPoints = triangulatedPoints;
    if (runBA) {
      const baRes = optimizeBundleAdjustmentSynthetic(triangulatedPoints, observations, cameras, 12);
      finalReprojRmse = baRes.finalRmse;
      finalPoints = baRes.refinedPoints;
    }

    // Epipolar error for point 0
    const sampsonErr = computeSampsonDistance(F, noisyProjs1[0], noisyProjs2[0]);
    const disp = Math.abs(noisyProjs1[0][0] - noisyProjs2[0][0]);

    setTelemetry({
      disparity: disp,
      triangulatedZ: finalPoints[0][2],
      reconErrorMm,
      reprojRmse: initialReprojRmse,
      reprojRmseBA: finalReprojRmse,
      sampsonErr,
      F_mat: F,
    });

    // -------------------------------------------------------------
    // RENDER 1: 3D Top-Down / Isometric World Canvas
    // -------------------------------------------------------------
    const canvasWorld = canvasWorldRef.current;
    if (canvasWorld) {
      const ctx = canvasWorld.getContext('2d');
      if (ctx) {
        const w = canvasWorld.width;
        const h = canvasWorld.height;
        ctx.clearRect(0, 0, w, h);

        // Origin at bottom-center
        const ox = w / 2;
        const oy = h - 35;
        const scale = 50; // pixels per meter

        // Grid
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;
        for (let x = -3; x <= 3; x++) {
          ctx.beginPath();
          ctx.moveTo(ox + x * scale, 0);
          ctx.lineTo(ox + x * scale, h);
          ctx.stroke();
        }
        for (let z = 1; z <= 6; z++) {
          ctx.beginPath();
          ctx.moveTo(0, oy - z * scale);
          ctx.lineTo(w, oy - z * scale);
          ctx.stroke();
        }

        // Draw Sight rays from Cam 1
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        for (const pt of worldPoints) {
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(ox + pt[0] * scale, oy - pt[2] * scale);
          ctx.stroke();
        }

        // Draw Sight rays from Cam 2
        const cam2X = ox + baseline * scale;
        const cam2Y = oy;
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
        for (const pt of worldPoints) {
          ctx.beginPath();
          ctx.moveTo(cam2X, cam2Y);
          ctx.lineTo(ox + pt[0] * scale, oy - pt[2] * scale);
          ctx.stroke();
        }

        // Baseline vector line
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(cam2X, cam2Y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Camera 1 Icon / Frustum
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(ox, oy, 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.font = '10px monospace';
        ctx.fillText('Cam 1 (Origin)', ox - 35, oy + 18);

        // Camera 2 Icon / Frustum
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(cam2X, cam2Y, 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(`Cam 2 (b=${baseline}m)`, cam2X - 25, cam2Y + 18);

        // Draw True 3D Points
        ctx.fillStyle = '#f87171';
        for (const pt of worldPoints) {
          const px = ox + pt[0] * scale;
          const py = oy - pt[2] * scale;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Draw Triangulated 3D Points
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        for (const pt of finalPoints) {
          const px = ox + pt[0] * scale;
          const py = oy - pt[2] * scale;
          ctx.beginPath();
          ctx.moveTo(px - 4, py);
          ctx.lineTo(px + 4, py);
          ctx.moveTo(px, py - 4);
          ctx.lineTo(px, py + 4);
          ctx.stroke();
        }

        // Cube wireframe lines if cube preset
        if (preset === 'cube' && worldPoints.length === 8) {
          ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
          ctx.lineWidth = 1;
          const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7],
          ];
          for (const [i1, i2] of edges) {
            ctx.beginPath();
            ctx.moveTo(ox + worldPoints[i1][0] * scale, oy - worldPoints[i1][2] * scale);
            ctx.lineTo(ox + worldPoints[i2][0] * scale, oy - worldPoints[i2][2] * scale);
            ctx.stroke();
          }
        }
      }
    }

    // -------------------------------------------------------------
    // RENDER 2 & 3: Camera 1 and Camera 2 Image Sensors
    // -------------------------------------------------------------
    const renderSensor = (
      canvas: HTMLCanvasElement | null,
      projs: Array<[number, number]>,
      camName: string,
      epipolarLines: Array<[number, number, number]>,
      color: string
    ) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Draw Epipolar lines (a*u + b*v + c = 0)
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 2]);
      for (const line of epipolarLines) {
        const [a, b, c] = line;
        if (Math.abs(b) > 1e-4) {
          const v0 = (-c) / b;
          const v1 = (-a * w - c) / b;
          ctx.beginPath();
          ctx.moveTo(0, v0);
          ctx.lineTo(w, v1);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);

      // Draw Projected Points
      for (let i = 0; i < projs.length; i++) {
        const [u, v] = projs[i];
        ctx.fillStyle = i === 0 ? '#38bdf8' : color;
        ctx.beginPath();
        ctx.arc(u, v, i === 0 ? 5 : 3.5, 0, 2 * Math.PI);
        ctx.fill();

        if (i === 0) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = '9px monospace';
          ctx.fillText(`p${camName === 'View 1' ? '1' : '2'} [${u.toFixed(0)},${v.toFixed(0)}]`, u + 7, v - 4);
        }
      }

      // Principal point crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
      ctx.stroke();
    };

    // Epipolar lines on View 2 from View 1 points (l2 = F * p1)
    const epipolarLines2 = noisyProjs1.slice(0, 3).map((p1) => computeEpipolarLine(F, p1, 1));
    // Epipolar lines on View 1 from View 2 points (l1 = F^T * p2)
    const epipolarLines1 = noisyProjs2.slice(0, 3).map((p2) => computeEpipolarLine(F, p2, 2));

    renderSensor(canvasCam1Ref.current, noisyProjs1, 'View 1', epipolarLines1, '#38bdf8');
    renderSensor(canvasCam2Ref.current, noisyProjs2, 'View 2', epipolarLines2, '#34d399');
  }, [focalLength, baseline, yawDeg, noisePx, preset, targetX, targetY, targetZ, runBA]);

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Box size={20} color="var(--primary)" />
            Laboratorium Geometri Multi-Pandang &amp; Rekonstruksi 3D (ADV-05)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Simulasi stereovisi dua kamera kalibrasi $K[R \mid t]$, geometri epipolar $x_2^T F x_1 = 0$, triangulasi DLT, dan bundle adjustment.
          </p>
        </div>
        <button
          onClick={() => {
            setFocalLength(600);
            setBaseline(0.8);
            setYawDeg(5);
            setNoisePx(0.5);
            setPreset('cube');
            setRunBA(true);
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
          <RotateCcw size={14} /> Reset Setup
        </button>
      </div>

      {/* Main Grid: Controls & Visual Displays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
        {/* Controls Column */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '1.25rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sliders size={16} /> Rig Kamera &amp; Konstelasi 3D
          </div>

          {/* Preset Selector */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Konstelasi Titik 3D Uji (X true):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              {[
                { id: 'cube', label: '3D Wireframe Cube (8 pts)' },
                { id: 'cross', label: 'Calibration Cross (8 pts)' },
                { id: 'single', label: 'Titik Tunggal Interaktif' },
                { id: 'random', label: 'Awan Titik Acak (10 pts)' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id as PresetConstellation)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: preset === p.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: preset === p.id ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card)',
                    color: preset === p.id ? 'var(--primary)' : 'var(--text)',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Baseline Slider */}
          <div style={{ marginBottom: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Jarak Baseline Antar Kamera ($t_x$):</span>
              <strong style={{ color: 'var(--text)' }}>{baseline.toFixed(2)} m</strong>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={baseline}
              onChange={(e) => setBaseline(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Camera 2 Yaw Angle */}
          <div style={{ marginBottom: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rotasi Sudut Yaw Kamera 2 ($\theta_y$):</span>
              <strong style={{ color: 'var(--text)' }}>{yawDeg}°</strong>
            </div>
            <input
              type="range"
              min="-25"
              max="25"
              step="1"
              value={yawDeg}
              onChange={(e) => setYawDeg(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Focal Length Slider */}
          <div style={{ marginBottom: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Panjang Fokus Lensa ($f$):</span>
              <strong style={{ color: 'var(--text)' }}>{focalLength} px</strong>
            </div>
            <input
              type="range"
              min="300"
              max="1000"
              step="25"
              value={focalLength}
              onChange={(e) => setFocalLength(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Sensor Noise Slider */}
          <div style={{ marginBottom: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Derau Sensor Titik Fitur ($\sigma$):</span>
              <strong style={{ color: 'var(--text)' }}>{noisePx.toFixed(1)} px</strong>
            </div>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.1"
              value={noisePx}
              onChange={(e) => setNoisePx(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Single Target Sliders (if active) */}
          {preset === 'single' && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Koordinat Titik Target ($X, Y, Z$):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>X (m)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={targetX}
                    onChange={(e) => setTargetX(Number(e.target.value))}
                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.2rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Y (m)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={targetY}
                    onChange={(e) => setTargetY(Number(e.target.value))}
                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.2rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Z (m)</span>
                  <input
                    type="number"
                    step="0.2"
                    min="1.0"
                    max="8.0"
                    value={targetZ}
                    onChange={(e) => setTargetZ(Number(e.target.value))}
                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.2rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bundle Adjustment Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
            <input
              type="checkbox"
              id="baCheck"
              checked={runBA}
              onChange={(e) => setRunBA(e.target.checked)}
            />
            <label htmlFor="baCheck" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
              Aktifkan Optimasi Nonlinear Bundle Adjustment (LM)
            </label>
          </div>
        </div>

        {/* Visual Displays Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Top: 3D World Birds-Eye View */}
          <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>
                Visualisasi 3D Ruang Nyata (Bird&apos;s-Eye Overhead Plane X-Z)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#f87171' }}>● Ground Truth</span> &nbsp;|&nbsp;{' '}
                <span style={{ color: '#38bdf8' }}>✚ Triangulasi DLT</span>
              </span>
            </div>
            <canvas
              ref={canvasWorldRef}
              width={380}
              height={190}
              style={{ width: '100%', height: '190px', borderRadius: '4px', background: '#090d16', border: '1px solid var(--border)' }}
            />
          </div>

          {/* Bottom: Dual 2D Sensor Planes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem' }}>
                Sensor Kamera 1 (Bidang Citra $u_1, v_1$)
              </div>
              <canvas
                ref={canvasCam1Ref}
                width={imgW}
                height={imgH}
                style={{ width: '100%', aspectRatio: '4/3', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.4)' }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Garis kuning: Garis epipolar $l_1 = F^T x_2$
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', marginBottom: '0.35rem' }}>
                Sensor Kamera 2 (Bidang Citra $u_2, v_2$)
              </div>
              <canvas
                ref={canvasCam2Ref}
                width={imgW}
                height={imgH}
                style={{ width: '100%', aspectRatio: '4/3', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.4)' }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Garis kuning: Garis epipolar $l_2 = F x_1$
              </div>
            </div>
          </div>

          {/* Telemetry HUD */}
          <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DISPARITAS ($u_1 - u_2$)</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {telemetry.disparity.toFixed(1)} px
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ESTIMASI KEDALAMAN $Z$</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)' }}>
                  {telemetry.triangulatedZ.toFixed(2)} m
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GALAT REKONSTRUKSI 3D</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: telemetry.reconErrorMm < 15 ? 'var(--accent)' : '#fbbf24' }}>
                  {telemetry.reconErrorMm.toFixed(1)} mm
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>REPROJECTION RMSE</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8' }}>
                  {runBA ? telemetry.reprojRmseBA.toFixed(2) : telemetry.reprojRmse.toFixed(2)} px
                </div>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>
                Residual Epipolar (Jarak Sampson):{' '}
                <strong style={{ color: telemetry.sampsonErr < 0.5 ? 'var(--accent)' : '#f87171' }}>
                  {telemetry.sampsonErr.toFixed(4)} px²
                </strong>
              </span>
              <span>
                Kamera Rig: b = {baseline.toFixed(2)} m, yaw = {yawDeg}°, f = {focalLength} px
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Guidance Footer */}
      <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8rem', lineHeight: '1.5', color: 'var(--text)' }}>
          <strong>Hukum Geometri Epipolar &amp; Triangulasi (Hartley &amp; Zisserman):</strong> Garis epipolar l2 = F x1
          mempersempit ruang pencarian korespondensi dari bidang 2D menjadi garis 1D. Hubungan kedalaman Z ~ (f * b) / d
          menunjukkan bahwa ketidakpastian kedalaman berbanding kuadratik terhadap jarak Delta Z ~ Z^2 / (f * b). Triangulasi
          linear (DLT) menyelesaikan A X = 0 via SVD, dan <em>Bundle Adjustment</em> memperhalus koordinat 3D untuk meminimalkan
          galat reproyeksi geometris kuadratik sum ||x_ij - pi(P_i, X_j)||^2.
        </div>
      </div>
    </div>
  );
};

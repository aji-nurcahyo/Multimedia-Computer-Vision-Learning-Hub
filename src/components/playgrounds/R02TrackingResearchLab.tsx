import React, { useState, useMemo, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { computeHotaMetrics } from '../../lib/researchMetrics';
import { solveHungarianMatching } from '../../lib/advancedCvProcessing';

export const R02TrackingResearchLab: React.FC = () => {
  // Simulation parameters
  const [associationMethod, setAssociationMethod] = useState<'hungarian' | 'greedy'>('hungarian');
  const [noiseLevel, setNoiseLevel] = useState<number>(2.5); // pixels
  const [occlusionChance, setOcclusionChance] = useState<number>(0.15);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scenario, setScenario] = useState<'crossover' | 'convoy'>('crossover');

  const TOTAL_FRAMES = 25;

  // Ground truth trajectories generator
  const groundTruths = useMemo(() => {
    const list: Array<{ id: number; color: string; path: Array<{ x: number; y: number }> }> = [];

    if (scenario === 'crossover') {
      // Two targets crossing paths around frame 12 at (320, 180)
      const path1: Array<{ x: number; y: number }> = [];
      const path2: Array<{ x: number; y: number }> = [];
      for (let t = 0; t <= TOTAL_FRAMES; t++) {
        // Target 1: moving left-to-right, slightly down
        path1.push({ x: 120 + 16 * t, y: 140 + 3.5 * t });
        // Target 2: moving top-to-bottom, slightly right
        path2.push({ x: 320 + 2.5 * (t - 12), y: 60 + 10 * t });
      }
      list.push({ id: 1, color: '#38bdf8', path: path1 });
      list.push({ id: 2, color: '#f43f5e', path: path2 });
    } else {
      // Convoy: 3 pedestrians walking side by side (separation 18 px)
      const p1: Array<{ x: number; y: number }> = [];
      const p2: Array<{ x: number; y: number }> = [];
      const p3: Array<{ x: number; y: number }> = [];
      for (let t = 0; t <= TOTAL_FRAMES; t++) {
        p1.push({ x: 100 + 14 * t, y: 150 });
        p2.push({ x: 100 + 14 * t, y: 172 });
        p3.push({ x: 100 + 14 * t, y: 194 });
      }
      list.push({ id: 1, color: '#38bdf8', path: p1 });
      list.push({ id: 2, color: '#f43f5e', path: p2 });
      list.push({ id: 3, color: '#a855f7', path: p3 });
    }
    return list;
  }, [scenario]);

  // Run tracking simulation across all frames up to TOTAL_FRAMES
  const simulationData = useMemo(() => {
    // Deterministic pseudo-random generation based on frame and index
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    let seedCounter = 42;
    const frameResults: Array<{
      frame: number;
      detections: Array<{ x: number; y: number; trueId: number }>;
      tracks: Array<{ id: number; color: string; x: number; y: number; assignedTrueId: number }>;
      matches: Array<{ trackId: number; detIdx: number; cost: number }>;
      idSwitchesAccum: number;
      tpAccum: number;
      fpAccum: number;
      fnAccum: number;
    }> = [];

    // Track state initialized at frame 0
    let activeTracks: Array<{
      trackerId: number;
      color: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      assignedTrueId: number;
      history: Array<{ x: number; y: number; frame: number }>;
    }> = groundTruths.map((gt, idx) => ({
      trackerId: idx + 1,
      color: gt.color,
      x: gt.path[0].x,
      y: gt.path[0].y,
      vx: gt.path[1] ? gt.path[1].x - gt.path[0].x : 0,
      vy: gt.path[1] ? gt.path[1].y - gt.path[0].y : 0,
      assignedTrueId: gt.id,
      history: [{ x: gt.path[0].x, y: gt.path[0].y, frame: 0 }],
    }));

    let idSwitches = 0;
    let tpTotal = 0;
    let fpTotal = 0;
    let fnTotal = 0;

    for (let f = 0; f <= TOTAL_FRAMES; f++) {
      if (f === 0) {
        frameResults.push({
          frame: 0,
          detections: groundTruths.map((gt) => ({ x: gt.path[0].x, y: gt.path[0].y, trueId: gt.id })),
          tracks: activeTracks.map((t) => ({ ...t, id: t.trackerId })),
          matches: [],
          idSwitchesAccum: 0,
          tpAccum: groundTruths.length,
          fpAccum: 0,
          fnAccum: 0,
        });
        continue;
      }

      // 1. Kalman Prediction step for tracks
      activeTracks.forEach((trk) => {
        trk.x += trk.vx;
        trk.y += trk.vy;
      });

      // 2. Generate detections with noise and occlusion
      const detections: Array<{ x: number; y: number; trueId: number }> = [];
      groundTruths.forEach((gt) => {
        const pt = gt.path[f];
        // Occlusion check: near crossover around frame 11-13
        const isNearCross = scenario === 'crossover' && Math.abs(f - 12) <= 1;
        const currentOccProb = isNearCross ? occlusionChance * 2.0 : occlusionChance;

        if (pseudoRandom(seedCounter++) < currentOccProb) {
          // Missed detection (occlusion)
          return;
        }

        const jx = (pseudoRandom(seedCounter++) - 0.5) * 2 * noiseLevel;
        const jy = (pseudoRandom(seedCounter++) - 0.5) * 2 * noiseLevel;
        detections.push({ x: pt.x + jx, y: pt.y + jy, trueId: gt.id });
      });

      // 3. Construct Cost Matrix
      const costMatrix: number[][] = [];
      activeTracks.forEach((trk) => {
        const row: number[] = [];
        detections.forEach((det) => {
          const dist = Math.hypot(trk.x - det.x, trk.y - det.y);
          row.push(dist);
        });
        costMatrix.push(row);
      });

      // 4. Solve Bipartite Matching
      let matches: Array<{ trackIdx: number; detectionIdx: number; cost: number }> = [];

      if (associationMethod === 'hungarian') {
        const res = solveHungarianMatching(costMatrix, 60.0);
        matches = res.matches.map((m) => ({ trackIdx: m.trackIdx, detectionIdx: m.detectionIdx, cost: m.cost }));
      } else {
        // Greedy assignment
        const usedT = new Set<number>();
        const usedD = new Set<number>();
        const pairs: Array<{ t: number; d: number; cost: number }> = [];
        for (let t = 0; t < activeTracks.length; t++) {
          for (let d = 0; d < detections.length; d++) {
            pairs.push({ t, d, cost: costMatrix[t][d] });
          }
        }
        pairs.sort((a, b) => a.cost - b.cost);
        pairs.forEach((p) => {
          if (!usedT.has(p.t) && !usedD.has(p.d) && p.cost <= 60.0) {
            usedT.add(p.t);
            usedD.add(p.d);
            matches.push({ trackIdx: p.t, detectionIdx: p.d, cost: p.cost });
          }
        });
      }

      // 5. Update tracks and evaluate ID switches
      const matchedDets = new Set<number>();
      matches.forEach((m) => {
        matchedDets.add(m.detectionIdx);
        const trk = activeTracks[m.trackIdx];
        const det = detections[m.detectionIdx];

        // Kalman measurement update
        const alpha = 0.65; // smoothing factor
        trk.vx = alpha * trk.vx + (1 - alpha) * (det.x - trk.x);
        trk.vy = alpha * trk.vy + (1 - alpha) * (det.y - trk.y);
        trk.x = det.x;
        trk.y = det.y;
        trk.history.push({ x: trk.x, y: trk.y, frame: f });

        if (det.trueId !== trk.assignedTrueId) {
          idSwitches++;
          trk.assignedTrueId = det.trueId;
        }
        tpTotal++;
      });

      fpTotal += detections.length - matches.length;
      fnTotal += groundTruths.length - matches.length;

      frameResults.push({
        frame: f,
        detections,
        tracks: activeTracks.map((t) => ({ ...t, id: t.trackerId })),
        matches: matches.map((m) => ({ trackId: activeTracks[m.trackIdx].trackerId, detIdx: m.detectionIdx, cost: m.cost })),
        idSwitchesAccum: idSwitches,
        tpAccum: tpTotal,
        fpAccum: fpTotal,
        fnAccum: fnTotal,
      });
    }

    return frameResults;
  }, [groundTruths, associationMethod, noiseLevel, occlusionChance, scenario]);

  // Current frame data
  const currentFrameData = simulationData[currentFrame] || simulationData[0];
  const lastFrameData = simulationData[simulationData.length - 1];

  // Live HOTA calculations
  const finalHota = useMemo(() => {
    const tp = lastFrameData.tpAccum;
    const fp = lastFrameData.fpAccum;
    const fn = lastFrameData.fnAccum;
    const idsw = lastFrameData.idSwitchesAccum;
    const assScore = Math.max(0.1, 1.0 - (idsw * 0.18));
    return computeHotaMetrics(tp, fp, fn, assScore);
  }, [lastFrameData]);

  // Auto-play timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= TOTAL_FRAMES) {
            setIsPlaying(false);
            return TOTAL_FRAMES;
          }
          return prev + 1;
        });
      }, 180);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.75rem',
        boxShadow: 'var(--card-shadow)',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--primary)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              TIER-A RESEARCH LAB · R02
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Pelacakan Multi-Objek &amp; Asosiasi Gerak
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Eksplorasi Asosiasi L4: Solver Bipartite Hungarian vs Greedy &amp; Kontinuitas HOTA
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
            Visualisasi pelacakan real-time pada kondisi perlintasan oklusi (cross-over) dan konvoi rapat dengan dekomposisi metrik HOTA (DetA &amp; AssA).
          </p>
        </div>

        {/* Scenario Selection */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'crossover', label: 'Cross-over Occlusion (Perlintasan)' },
            { id: 'convoy', label: 'Close Convoy (Pejalan Kaki Rapat)' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setScenario(sc.id as any);
                setCurrentFrame(0);
                setIsPlaying(false);
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: scenario === sc.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: scenario === sc.id ? 'var(--primary-glow)' : 'var(--bg-subtle)',
                color: scenario === sc.id ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Configuration Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          borderRadius: '8px',
          background: 'var(--bg-subtle)',
          marginBottom: '1.25rem',
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>
            Metode Asosiasi Data (Data Association Solver):
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setAssociationMethod('hungarian')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: associationMethod === 'hungarian' ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: associationMethod === 'hungarian' ? 'var(--primary)' : 'var(--bg-card)',
                color: associationMethod === 'hungarian' ? 'var(--on-primary)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Hungarian (Optimal)
            </button>
            <button
              onClick={() => setAssociationMethod('greedy')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: associationMethod === 'greedy' ? '1px solid #f43f5e' : '1px solid var(--border)',
                background: associationMethod === 'greedy' ? '#f43f5e' : 'var(--bg-card)',
                color: associationMethod === 'greedy' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Greedy (Heuristik)
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Greedy rentan menukar identitas saat jarak antar-target &lt; noise sensor.
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
            <span>Derau Posisi Deteksi (Gaussian Jitter):</span>
            <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{noiseLevel.toFixed(1)} px</strong>
          </div>
          <input
            type="range"
            min="0.5"
            max="6.0"
            step="0.5"
            value={noiseLevel}
            onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
            <span>Probabilitas Oklusi (Missed Det):</span>
            <strong style={{ color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>{(occlusionChance * 100).toFixed(0)}%</strong>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.40"
            step="0.05"
            value={occlusionChance}
            onChange={(e) => setOcclusionChance(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '0.4rem' }}
          />
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: isPlaying ? '#f43f5e' : 'var(--primary)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <button
              onClick={() => {
                setCurrentFrame(0);
                setIsPlaying(false);
              }}
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
              title="Reset Frame"
            >
              <RotateCcw size={14} />
            </button>

            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Frame {currentFrame} / {TOTAL_FRAMES}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={TOTAL_FRAMES}
            value={currentFrame}
            onChange={(e) => {
              setCurrentFrame(parseInt(e.target.value, 10));
              setIsPlaying(false);
            }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Arena Display & Telemetry Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* SVG Motion Arena */}
        <div
          style={{
            background: '#090d16',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            padding: '0.75rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span>Arena Gerak: 640 &times; 320 px</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: '#94a3b8' }}>-- GT Path</span>
              <span style={{ color: '#38bdf8' }}>&bull; Track 1</span>
              <span style={{ color: '#f43f5e' }}>&bull; Track 2</span>
              {scenario === 'convoy' && <span style={{ color: '#a855f7' }}>&bull; Track 3</span>}
            </div>
          </div>

          <svg
            viewBox="0 0 640 320"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '6px',
              background: 'radial-gradient(ellipse at center, #111827 0%, #030712 100%)',
            }}
          >
            {/* Grid */}
            <defs>
              <pattern id="mot-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mot-grid)" />

            {/* Ground Truth Paths */}
            {groundTruths.map((gt) => {
              const dPath = gt.path.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
              return (
                <path
                  key={gt.id}
                  d={dPath}
                  fill="none"
                  stroke={gt.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
              );
            })}

            {/* Trajectory Breadcrumbs of active tracks up to current frame */}
            {currentFrameData.tracks.map((trk) => {
              const history = (simulationData.slice(0, currentFrame + 1).map((fr) => fr.tracks[trk.id - 1]).filter(Boolean));
              const dHist = history.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

              return (
                <g key={trk.id}>
                  <path
                    d={dHist}
                    fill="none"
                    stroke={trk.color}
                    strokeWidth="2.5"
                    opacity="0.85"
                  />
                  {/* Current Position Marker */}
                  <circle
                    cx={trk.x}
                    cy={trk.y}
                    r="8"
                    fill={trk.color}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={trk.x + 12}
                    y={trk.y + 4}
                    fill={trk.color}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ID:{trk.id} {trk.assignedTrueId !== trk.id ? `(SWAP to GT${trk.assignedTrueId})` : ''}
                  </text>
                </g>
              );
            })}

            {/* Detections at current frame */}
            {currentFrameData.detections.map((det, dIdx) => (
              <g key={dIdx}>
                <rect
                  x={det.x - 6}
                  y={det.y - 6}
                  width="12"
                  height="12"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                />
                <circle cx={det.x} cy={det.y} r="2" fill="#fbbf24" />
              </g>
            ))}
          </svg>
        </div>

        {/* Live Metrics & HOTA Scorecard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Key Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOTA Total</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                {(finalHota.hota * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DetA Score</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {(finalHota.deta * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AssA Score</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
                {(finalHota.assa * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Identity Switch Counter Alert */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              background: currentFrameData.idSwitchesAccum > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(52, 211, 153, 0.1)',
              border: currentFrameData.idSwitchesAccum > 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(52, 211, 153, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {currentFrameData.idSwitchesAccum > 0 ? (
                <AlertCircle size={18} color="#f43f5e" />
              ) : (
                <CheckCircle2 size={18} color="#34d399" />
              )}
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
                Akumulasi Pergantian Identitas (IDSW):
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: currentFrameData.idSwitchesAccum > 0 ? '#f43f5e' : '#34d399',
              }}
            >
              {currentFrameData.idSwitchesAccum} kali
            </span>
          </div>

          {/* Counts Overview */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.8rem' }}>
            <span>Target Ground Truth: <strong>{groundTruths.length}</strong></span>
            <span>Deteksi Terhubung (TP): <strong style={{ color: '#34d399' }}>{currentFrameData.tpAccum}</strong></span>
            <span>FP: <strong style={{ color: '#f87171' }}>{currentFrameData.fpAccum}</strong></span>
            <span>FN: <strong style={{ color: '#fbbf24' }}>{currentFrameData.fnAccum}</strong></span>
          </div>

          {/* Research Insight Card */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: '1.5',
            }}
          >
            <strong style={{ color: 'var(--primary)' }}>Wawasan Riset L4:</strong> Asosiasi Greedy hanya mengambil pasangan terdekat pertama secara miopik (*myopic local minimum*). Ketika dua target berdekatan dengan derau pengukuran, Greedy menukar kedua track dan memicu <em>double identity switch</em>. Sebaliknya, Hungarian Solver Kuhn-Munkres meminimalkan jumlah biaya global C(i, j), sehingga berhasil mempertahankan kontinuitas identitas.
          </div>
        </div>
      </div>
    </div>
  );
};

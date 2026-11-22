import React, { useState, useEffect, useRef } from 'react';
import {
  createKalmanState2D,
  kalmanPredict2D,
  kalmanUpdate2D,
  associateDetectionsToTracks,
  type KalmanState2D
} from '../../lib/advancedCvProcessing';
import { Play, Pause, RotateCcw, Activity, Cpu, Sparkles, Scale } from 'lucide-react';

interface SimulatedTarget {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  history: Array<[number, number]>;
}

interface ActiveTrack {
  trackId: number;
  state: KalmanState2D;
  history: Array<[number, number]>;
  hits: number;
  timeSinceUpdate: number;
  assignedTargetId?: number;
}

const TARGET_COLORS = ['#38bdf8', '#34d399', '#f59e0b', '#a855f7', '#ec4899', '#f97316'];

export const SyntheticMotArenaLab: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [targetCount, setTargetCount] = useState<number>(4);
  const [measNoiseStd, setMeasNoiseStd] = useState<number>(6.0); // pixels
  const [detProb, setDetProb] = useState<number>(0.9); // Probability of detection
  const [occlusionEnabled, setOcclusionEnabled] = useState<boolean>(true);
  const [associationMethod, setAssociationMethod] = useState<'hungarian' | 'greedy'>('hungarian');
  const [isConflictScenario, setIsConflictScenario] = useState<boolean>(false);

  // Diagnostics & Telemetry HUD
  const [idSwitches, setIdSwitches] = useState<number>(0);
  const [rmse, setRmse] = useState<number>(0);
  const [currentTotalCost, setCurrentTotalCost] = useState<number>(0);
  const [currentMatchCount, setCurrentMatchCount] = useState<number>(0);
  const [unmatchedTracksCount, setUnmatchedTracksCount] = useState<number>(0);
  const [unmatchedDetsCount, setUnmatchedDetsCount] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable tracking state held in ref across animation frames
  const simStateRef = useRef<{
    targets: SimulatedTarget[];
    tracks: ActiveTrack[];
    nextTrackId: number;
    totalSwitches: number;
    errorAccum: number;
    samples: number;
  }>({
    targets: [],
    tracks: [],
    nextTrackId: 1,
    totalSwitches: 0,
    errorAccum: 0,
    samples: 0
  });

  // Standard random targets initialization
  const initSimulation = () => {
    setIsConflictScenario(false);
    const targets: SimulatedTarget[] = [];
    for (let i = 0; i < targetCount; i++) {
      const angle = (i * 2 * Math.PI) / targetCount + 0.3;
      const speed = 1.5 + Math.random() * 1.5;
      targets.push({
        id: i + 1,
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 250,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: TARGET_COLORS[i % TARGET_COLORS.length],
        history: []
      });
    }

    simStateRef.current = {
      targets,
      tracks: [],
      nextTrackId: 1,
      totalSwitches: 0,
      errorAccum: 0,
      samples: 0
    };

    setIdSwitches(0);
    setRmse(0);
    setCurrentTotalCost(0);
    setCurrentMatchCount(0);
    setUnmatchedTracksCount(0);
    setUnmatchedDetsCount(0);
  };

  // Controlled Conflict Scenario: Crossing targets with asymmetrical geometry
  // Demonstrates where myopic Greedy makes a sub-optimal choice while Hungarian optimizes global sum
  const loadConflictScenario = () => {
    setIsConflictScenario(true);
    setTargetCount(2);

    // Target 1 moving diagonally down-right; Target 2 moving diagonally up-right
    const targets: SimulatedTarget[] = [
      {
        id: 1,
        x: 180,
        y: 140,
        vx: 1.2,
        vy: 0.8,
        color: '#38bdf8',
        history: []
      },
      {
        id: 2,
        x: 180,
        y: 200,
        vx: 1.2,
        vy: -0.8,
        color: '#f59e0b',
        history: []
      }
    ];

    simStateRef.current = {
      targets,
      tracks: [],
      nextTrackId: 1,
      totalSwitches: 0,
      errorAccum: 0,
      samples: 0
    };

    setIdSwitches(0);
    setRmse(0);
    setCurrentTotalCost(0);
    setCurrentMatchCount(0);
    setUnmatchedTracksCount(0);
    setUnmatchedDetsCount(0);
  };

  useEffect(() => {
    initSimulation();
  }, [targetCount]);

  // Main Simulation Loop
  useEffect(() => {
    let animId: number;

    const stepSimulation = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const { targets, tracks } = simStateRef.current;

      // Occlusion Zone definition: center rectangle
      const occRect = {
        x: w * 0.35,
        y: h * 0.25,
        width: w * 0.3,
        height: h * 0.5
      };

      if (isRunning) {
        // 1. Move True Targets with border reflections
        for (const t of targets) {
          t.x += t.vx;
          t.y += t.vy;

          if (t.x < 30) {
            t.x = 30;
            t.vx *= -1;
          }
          if (t.x > w - 30) {
            t.x = w - 30;
            t.vx *= -1;
          }
          if (t.y < 30) {
            t.y = 30;
            t.vy *= -1;
          }
          if (t.y > h - 30) {
            t.y = h - 30;
            t.vy *= -1;
          }

          t.history.push([t.x, t.y]);
          if (t.history.length > 35) t.history.shift();
        }

        // 2. Generate Sensor Measurements (Detections) with noise, misses, and occlusions
        const detections: Array<{ x: number; y: number; trueTargetId: number }> = [];
        for (const t of targets) {
          // Check if in occlusion zone
          const inOcclusion =
            occlusionEnabled &&
            t.x >= occRect.x &&
            t.x <= occRect.x + occRect.width &&
            t.y >= occRect.y &&
            t.y <= occRect.y + occRect.height;

          if (inOcclusion) {
            // Completely occluded - missed detection
            continue;
          }

          if (Math.random() <= detProb) {
            // Gaussian noise approximation via Box-Muller
            const u1 = Math.max(1e-6, Math.random());
            const u2 = Math.random();
            const zx = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * measNoiseStd;
            const zy = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2) * measNoiseStd;

            detections.push({
              x: t.x + zx,
              y: t.y + zy,
              trueTargetId: t.id
            });
          }
        }

        // 3. Kalman Prediction for all existing tracks
        for (const trk of tracks) {
          trk.state = kalmanPredict2D(trk.state, 1.0, 1.2);
          trk.timeSinceUpdate += 1;
        }

        // 4. Data Association: Bipartite Matching (Selected Method: Hungarian vs Greedy)
        const trackPositions = tracks.map((t) => ({ x: t.state.x, y: t.state.y }));
        const detectionPositions = detections.map((d) => ({ x: d.x, y: d.y }));
        const { matches, unmatchedTracks, unmatchedDetections, totalCost } = associateDetectionsToTracks(
          trackPositions,
          detectionPositions,
          55.0, // distance gating threshold in pixels
          associationMethod
        );

        // 5. Update Matched Tracks
        for (const m of matches) {
          const trk = tracks[m.trackIdx];
          const det = detections[m.detectionIdx];

          const { updated } = kalmanUpdate2D(trk.state, det.x, det.y, measNoiseStd * measNoiseStd);
          trk.state = updated;
          trk.hits += 1;
          trk.timeSinceUpdate = 0;

          // Check for Identity Switch
          if (trk.assignedTargetId !== undefined && trk.assignedTargetId !== det.trueTargetId) {
            simStateRef.current.totalSwitches += 1;
          }
          trk.assignedTargetId = det.trueTargetId;

          // Record localization error
          const targetObj = targets.find((tg) => tg.id === det.trueTargetId);
          if (targetObj) {
            const err = Math.hypot(trk.state.x - targetObj.x, trk.state.y - targetObj.y);
            simStateRef.current.errorAccum += err * err;
            simStateRef.current.samples += 1;
          }

          trk.history.push([trk.state.x, trk.state.y]);
          if (trk.history.length > 35) trk.history.shift();
        }

        // 6. Handle Unmatched Tracks (keep history)
        for (const uTrkIdx of unmatchedTracks) {
          const trk = tracks[uTrkIdx];
          trk.history.push([trk.state.x, trk.state.y]);
          if (trk.history.length > 35) trk.history.shift();
        }

        // 7. Delete Dead Tracks (timeSinceUpdate > 8)
        simStateRef.current.tracks = tracks.filter((trk) => trk.timeSinceUpdate <= 8);

        // 8. Create New Tracks for Unmatched Detections
        for (const uDetIdx of unmatchedDetections) {
          const det = detections[uDetIdx];
          const newTrack: ActiveTrack = {
            trackId: simStateRef.current.nextTrackId++,
            state: createKalmanState2D(det.x, det.y, 25, 50),
            history: [[det.x, det.y]],
            hits: 1,
            timeSinceUpdate: 0,
            assignedTargetId: det.trueTargetId
          };
          simStateRef.current.tracks.push(newTrack);
        }

        // Update React status periodically
        setIdSwitches(simStateRef.current.totalSwitches);
        setCurrentTotalCost(totalCost);
        setCurrentMatchCount(matches.length);
        setUnmatchedTracksCount(unmatchedTracks.length);
        setUnmatchedDetsCount(unmatchedDetections.length);

        if (simStateRef.current.samples > 0) {
          setRmse(Math.sqrt(simStateRef.current.errorAccum / simStateRef.current.samples));
        }
      }

      // ==========================================
      // RENDERING CANVAS
      // ==========================================
      ctx.clearRect(0, 0, w, h);

      // Draw Grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Occlusion Obstacle Zone
      if (occlusionEnabled) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.fillRect(occRect.x, occRect.y, occRect.width, occRect.height);
        ctx.strokeRect(occRect.x, occRect.y, occRect.width, occRect.height);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.font = '10px var(--font-sans)';
        ctx.fillText('ZONA OKLUSI (Penglihatan Terhalang)', occRect.x + 10, occRect.y + 18);
      }

      // 1. Draw True Target Ground Truths & Trails
      for (const t of targets) {
        // Trail
        if (t.history.length > 1) {
          ctx.strokeStyle = `${t.color}35`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = 0; i < t.history.length; i++) {
            const [hx, hy] = t.history[i];
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.stroke();
        }

        // Ground truth target ring
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 9, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = t.color;
        ctx.font = '10px var(--font-mono)';
        ctx.fillText(`GT ${t.id}`, t.x + 12, t.y - 10);
      }

      // 2. Draw Estimated Active Tracks (Kalman Estimates)
      for (const trk of simStateRef.current.tracks) {
        const estX = trk.state.x;
        const estY = trk.state.y;

        // Draw Uncertainty Ellipse from Covariance P(0,0) and P(1,1)
        const stdX = Math.sqrt(Math.max(1, trk.state.cov[0][0]));
        const stdY = Math.sqrt(Math.max(1, trk.state.cov[1][1]));

        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.strokeStyle = trk.timeSinceUpdate > 0 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(estX, estY, Math.min(30, stdX * 2), Math.min(30, stdY * 2), 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Estimated position solid dot
        ctx.fillStyle = trk.timeSinceUpdate > 0 ? 'var(--warning)' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(estX, estY, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Track ID badge
        ctx.fillStyle = '#fff';
        ctx.font = '10px var(--font-mono)';
        ctx.fillText(`Track ${trk.trackId}${trk.timeSinceUpdate > 0 ? ' (Pred)' : ''}`, estX + 10, estY + 12);
      }

      animId = requestAnimationFrame(stepSimulation);
    };

    animId = requestAnimationFrame(stepSimulation);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, detProb, measNoiseStd, occlusionEnabled, associationMethod]);

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
            <span>Laboratorium Tier A · Modul ADV-03</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
            Synthetic Multi-Object Tracking (MOT) Arena
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Simulasi pelacakan banyak target dinamis dengan perbandingan matematis antara <strong>Hungarian Optimal LSAP</strong> vs <strong>Greedy Heuristic</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              background: isRunning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)',
              border: `1px solid ${isRunning ? 'var(--danger)' : 'var(--accent)'}`,
              color: isRunning ? 'var(--danger)' : 'var(--accent)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Jeda Simulasi' : 'Jalankan'}
          </button>
          <button
            onClick={loadConflictScenario}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              background: isConflictScenario ? 'var(--primary)' : 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              color: isConflictScenario ? 'var(--on-primary)' : 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            title="Muat skenario konflik berpapasan untuk menguji Greedy vs Hungarian"
          >
            <Sparkles size={13} /> Skenario Konflik Asosiasi
          </button>
          <button
            onClick={initSimulation}
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
            <RotateCcw size={13} /> Reset Arena
          </button>
        </div>
      </div>

      {/* Algorithm Method Selector Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scale size={16} color="var(--primary)" />
          <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Metode Asosiasi Bipartit:</strong>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setAssociationMethod('hungarian')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              border: associationMethod === 'hungarian' ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: associationMethod === 'hungarian' ? 'var(--primary)' : 'var(--bg-card)',
              color: associationMethod === 'hungarian' ? 'var(--on-primary)' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Hungarian Optimal (Kuhn-Munkres O(N³))
          </button>
          <button
            onClick={() => setAssociationMethod('greedy')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              border: associationMethod === 'greedy' ? '1px solid var(--warning)' : '1px solid var(--border)',
              background: associationMethod === 'greedy' ? 'var(--warning)' : 'var(--bg-card)',
              color: associationMethod === 'greedy' ? '#000' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Greedy Heuristic (Nearest-Neighbor)
          </button>
        </div>
      </div>

      {/* Real-Time Tracking Telemetry HUD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.65rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Sebenarnya (GT)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>{targetCount} Objek</div>
        </div>
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Track Kalman Aktif</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
            {simStateRef.current.tracks.length} Jalur
          </div>
        </div>
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Cost Asosiasi (Σ c)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
            {currentTotalCost.toFixed(1)} px
          </div>
        </div>
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pasangan / Unmatched</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>
            {currentMatchCount}M / {unmatchedTracksCount}T / {unmatchedDetsCount}D
          </div>
        </div>
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Identity Switches (IDSW)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: idSwitches > 0 ? 'var(--warning)' : 'var(--accent)' }}>
            {idSwitches} Kali
          </div>
        </div>
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lokalisasi RMSE</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>
            {rmse.toFixed(1)} px
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Arena Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              height: '340px',
              background: '#090d16',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <canvas ref={canvasRef} width={540} height={340} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #38bdf8' }} /> Posisi Nyata Target (GT)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} /> Estimasi Kalman Track
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)' }} /> Ellipsoid Kovarians P
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(239, 68, 68, 0.3)' }} /> Area Oklusi
            </span>
          </div>
        </div>

        {/* Tracking Controls & Deep Educational Explanation */}
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
              Parameter Lingkungan &amp; Sensor:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jumlah Target: {targetCount}</label>
                <input type="range" min="2" max="6" step="1" value={targetCount} onChange={(e) => setTargetCount(parseInt(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sensor Noise σ: {measNoiseStd.toFixed(1)} px</label>
                <input type="range" min="1.0" max="15.0" step="0.5" value={measNoiseStd} onChange={(e) => setMeasNoiseStd(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Probabilitas Deteksi P_D: {(detProb * 100).toFixed(0)}%</label>
                <input type="range" min="0.5" max="1.0" step="0.05" value={detProb} onChange={(e) => setDetProb(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={occlusionEnabled} onChange={(e) => setOcclusionEnabled(e.target.checked)} />
                  Aktifkan Zona Oklusi
                </label>
              </div>
            </div>
          </div>

          {/* Educational Insights Box with Algorithm Contrast */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: '1.5',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={14} color="var(--primary)" />
              Perbandingan Matematis: Hungarian vs. Greedy
            </div>
            • <strong>Greedy Heuristic (Nearest-Neighbor):</strong> Memilih elemen biaya minimum secara berulang. Pendekatan miopik ini rentan terjebak pada minimum lokal. Contoh: Matriks [[1, 2], [2, 100]] menghasilkan total biaya 1 + 100 = <strong>101</strong>.<br />
            • <strong>Hungarian / Kuhn-Munkres Algorithm:</strong> Menjamin minimisasi jumlah total biaya global (Linear Sum Assignment) melalui jalur pengimbuhan berulang dalam O(N³). Pada matriks di atas, Hungarian memilih pasangan biaya 2 + 2 = <strong>4</strong>.<br />
            • <strong>Batasan Penelitian (Research Limitation):</strong> Meskipun Hungarian menjamin biaya asosiasi global minimum, Hungarian <em>TIDAK menjamin akurasi pelacakan end-to-end (HOTA/MOTA) 100%</em>. Jika model pergerakan salah atau terjadi false positive deteksi, Hungarian tetap memaksakan minimisasi biaya matematis yang bisa saja salah memasangkan target, sehingga pelacak modern (ByteTrack/BoT-SORT) menggabungkannya dengan fitur penampilan Re-ID dan penugasan dua tahap.
          </div>
        </div>
      </div>
    </div>
  );
};

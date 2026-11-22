import React, { useState, useEffect, useRef } from 'react';
import {
  COCO_SKELETON_PAIRS,
  smoothPoseKeypoints,
  type PoseKeypoint2D
} from '../../lib/cvProcessing';

export const HumanPoseExplorer: React.FC = () => {
  const [minConf, setMinConf] = useState<number>(0.3);
  const [smoothingAlpha, setSmoothingAlpha] = useState<number>(0.7);
  const [activeFrame, setActiveFrame] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevPoseRef = useRef<PoseKeypoint2D[] | null>(null);

  const W = 320;
  const H = 240;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Dynamic waving/moving pose simulation based on activeFrame
    const t = activeFrame * 0.1;
    const rawKeypoints: PoseKeypoint2D[] = [
      { name: 'Nose', x: 160 + Math.sin(t) * 10, y: 50, score: 0.95 },
      { name: 'Left Eye', x: 154 + Math.sin(t) * 10, y: 46, score: 0.92 },
      { name: 'Right Eye', x: 166 + Math.sin(t) * 10, y: 46, score: 0.93 },
      { name: 'Left Ear', x: 148 + Math.sin(t) * 10, y: 50, score: 0.85 },
      { name: 'Right Ear', x: 172 + Math.sin(t) * 10, y: 50, score: 0.86 },
      { name: 'Left Shoulder', x: 130, y: 80, score: 0.9 },
      { name: 'Right Shoulder', x: 190, y: 80, score: 0.9 },
      { name: 'Left Elbow', x: 105, y: 110 + Math.sin(t * 2) * 15, score: 0.82 },
      { name: 'Right Elbow', x: 215, y: 110 + Math.cos(t * 2) * 15, score: 0.84 },
      { name: 'Left Wrist', x: 90, y: 140 + Math.sin(t * 2) * 25, score: 0.78 },
      { name: 'Right Wrist', x: 230, y: 70 + Math.sin(t * 3) * 20, score: 0.81 }, // Waving arm
      { name: 'Left Hip', x: 140, y: 140, score: 0.88 },
      { name: 'Right Hip', x: 180, y: 140, score: 0.88 },
      { name: 'Left Knee', x: 135, y: 185 + Math.cos(t) * 10, score: 0.85 },
      { name: 'Right Knee', x: 185, y: 185 - Math.cos(t) * 10, score: 0.86 },
      { name: 'Left Ankle', x: 130, y: 225, score: 0.8 },
      { name: 'Right Ankle', x: 190, y: 225, score: 0.82 }
    ];

    const smoothed = smoothPoseKeypoints(rawKeypoints, prevPoseRef.current, smoothingAlpha);
    prevPoseRef.current = smoothed;

    // Draw Skeleton Bones
    for (const [p1, p2] of COCO_SKELETON_PAIRS) {
      const kp1 = smoothed[p1];
      const kp2 = smoothed[p2];
      if (kp1.score >= minConf && kp2.score >= minConf) {
        ctx.strokeStyle = p1 < 11 ? '#38bdf8' : '#10b981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    }

    // Draw Joints
    for (let i = 0; i < smoothed.length; i++) {
      const kp = smoothed[i];
      if (kp.score >= minConf) {
        ctx.fillStyle = i < 5 ? '#f43f5e' : i < 11 ? '#38bdf8' : '#34d399';
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [minConf, smoothingAlpha, activeFrame]);

  // Animation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFrame((f) => f + 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Laboratorium Estimasi Pose Manusia &amp; Landmark Skeletal (Bab 47)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Visualisasi graf topologi 17 keypoint COCO, threshold keypoint confidence, dan filter penghalusan temporal anti-jitter.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            <span>Pose 2D Landmark COCO (17 Keypoints)</span>
            <span style={{ color: '#10b981', fontFamily: 'monospace' }}>● Live Smooth Motion</span>
          </div>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}>
              Parameter Penjejakan Skeletal:
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Ambang Batas Keyakinan Joint:</span>
                  <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{(minConf * 100).toFixed(0)}%</strong>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={minConf}
                  onChange={(e) => setMinConf(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Koefisien Penghalusan Temporal (Alpha):</span>
                  <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{smoothingAlpha.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.95}
                  step={0.05}
                  value={smoothingAlpha}
                  onChange={(e) => setSmoothingAlpha(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  Formula: p_t = α · p_raw + (1 - α) · p_{'{'}t-1{'}'}. Menghilangkan kedipan dan jittering frekuensi tinggi.
                </span>
              </div>
            </div>
          </div>

          <div style={{ background: '#020617', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.78rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Privasi &amp; Etika Computer Vision:
            </span>
            <div style={{ color: '#94a3b8', lineHeight: 1.5 }}>
              Pose estimation hanya memproses koordinat sendi geometric tanpa menyimpan atau mengidentifikasi data biometrik wajah personal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
